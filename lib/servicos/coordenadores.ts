import "server-only";

import type { z } from "zod";
import { db } from "@/lib/db";
import { montarPagina, recortar, type Pagina } from "./listagem";
import { ErroDeNegocio } from "./resultado";
import type {
  coordenadorEdicaoSchema,
  coordenadorSchema,
} from "@/lib/validacao/esquemas";

export type Coordenador = {
  id: string;
  nome: string;
  funcao: string;
  telefone: string | null;
  email: string | null;
  contatoPublico: boolean;
  pastoralId: string;
  ativo: boolean;
  ordem: number;
  /** Nome da pastoral, para a tabela não precisar de uma segunda consulta. */
  pastoral: { id: string; nome: string };
};

/** Só o necessário para preencher o seletor do formulário. */
export type OpcaoDePastoral = { id: string; nome: string; ativa: boolean };

export async function listarCoordenadores({
  busca = "",
  pastoralId,
  ativo,
  pagina = 1,
}: {
  busca?: string;
  pastoralId?: string;
  ativo?: boolean;
  pagina?: number;
}): Promise<Pagina<Coordenador>> {
  const onde = {
    // `insensitive` só passou a valer com a mudança para Postgres: no SQLite
    // o Prisma não expunha o modo, e buscar "joao" não achava "João".
    ...(busca
      ? {
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            { funcao: { contains: busca, mode: "insensitive" as const } },
            { pastoral: { nome: { contains: busca, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(pastoralId ? { pastoralId } : {}),
    ...(ativo === undefined ? {} : { ativo }),
  };

  const total = await db.coordenador.count({ where: onde });
  const recorte = recortar(pagina, total);

  const itens = await db.coordenador.findMany({
    where: onde,
    include: { pastoral: { select: { id: true, nome: true } } },
    // Agrupa por pastoral e, dentro dela, coordenador antes de vice.
    orderBy: [{ pastoral: { nome: "asc" } }, { ordem: "asc" }, { nome: "asc" }],
    skip: recorte.skip,
    take: recorte.take,
  });

  return montarPagina(itens as Coordenador[], total, recorte);
}

/**
 * Os coordenadores que aparecem no site, agrupados por pastoral.
 *
 * Devolve um mapa em vez de uma lista para que a página de pastorais faça uma
 * consulta só, e não uma por cartão.
 */
export async function coordenadoresPorPastoral(): Promise<
  Map<string, { nome: string; funcao: string; contato: string | null }[]>
> {
  const linhas = await db.coordenador.findMany({
    where: { ativo: true, pastoral: { ativa: true } },
    select: {
      nome: true,
      funcao: true,
      telefone: true,
      email: true,
      contatoPublico: true,
      pastoralId: true,
    },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });

  const mapa = new Map<
    string,
    { nome: string; funcao: string; contato: string | null }[]
  >();

  for (const linha of linhas) {
    const lista = mapa.get(linha.pastoralId) ?? [];
    lista.push({
      nome: linha.nome,
      funcao: linha.funcao,
      // O telefone e o e-mail só saem daqui com autorização. Filtrar na
      // consulta, e não na tela, é o que garante que um `console.log` ou uma
      // mudança distraída de layout não vaze o número de ninguém.
      contato: linha.contatoPublico ? (linha.telefone ?? linha.email) : null,
    });
    mapa.set(linha.pastoralId, lista);
  }

  return mapa;
}

/** As pastorais que podem receber um coordenador. */
export async function pastoraisParaSelecao(): Promise<OpcaoDePastoral[]> {
  return db.pastoral.findMany({
    select: { id: true, nome: true, ativa: true },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });
}

export async function criarCoordenador(
  dados: z.infer<typeof coordenadorSchema>
) {
  await garantirPastoral(dados.pastoralId);
  await db.coordenador.create({ data: dados });
}

export async function atualizarCoordenador({
  id,
  ...dados
}: z.infer<typeof coordenadorEdicaoSchema>) {
  const existe = await db.coordenador.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existe) throw new ErroDeNegocio("Coordenador não encontrado.");

  await garantirPastoral(dados.pastoralId);
  await db.coordenador.update({ where: { id }, data: dados });
}

export async function excluirCoordenador(id: string) {
  await db.coordenador.delete({ where: { id } });
}

export async function contarCoordenadoresAtivos(): Promise<number> {
  return db.coordenador.count({ where: { ativo: true } });
}

/**
 * O `pastoralId` chega de um `<select>`, ou seja, de texto vindo da rede.
 * Sem esta conferência, um valor inventado estouraria como erro de chave
 * estrangeira — mensagem de banco na cara da secretaria.
 */
async function garantirPastoral(pastoralId: string) {
  const pastoral = await db.pastoral.findUnique({
    where: { id: pastoralId },
    select: { id: true },
  });
  if (!pastoral) {
    throw new ErroDeNegocio("Escolha uma pastoral ou coordenação válida.");
  }
}
