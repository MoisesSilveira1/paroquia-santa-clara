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
  naCoordenacao: boolean;
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
    // Mesma busca por texto do `contem` em ./listagem, aberta aqui porque
    // percorre três campos, um deles na pastoral relacionada.
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

/** Uma pessoa como o site a mostra: sem os campos que não podem ser públicos. */
export type PessoaNoSite = {
  nome: string;
  funcao: string;
  /** Só preenchido quando a pessoa autorizou. */
  telefone: string | null;
  email: string | null;
};

/**
 * Deixa passar telefone e e-mail só de quem autorizou.
 *
 * Está aqui, na camada que fala com o banco, e não na tela: é o que garante
 * que um `console.log`, um cartão novo ou uma mudança distraída de layout não
 * vaze o número de ninguém. Quem não autorizou sai daqui com `null`, e não
 * há como a tela mostrar o que não recebeu.
 */
function semContatoNaoAutorizado(linha: {
  nome: string;
  funcao: string;
  telefone: string | null;
  email: string | null;
  contatoPublico: boolean;
}): PessoaNoSite {
  return {
    nome: linha.nome,
    funcao: linha.funcao,
    telefone: linha.contatoPublico ? linha.telefone : null,
    email: linha.contatoPublico ? linha.email : null,
  };
}

const CAMPOS_PUBLICOS = {
  nome: true,
  funcao: true,
  telefone: true,
  email: true,
  contatoPublico: true,
  naCoordenacao: true,
} as const;

/**
 * A coordenação de cada pastoral, para os cartões da listagem.
 *
 * Só a coordenação: o cartão é um resumo, e a equipe inteira cabe na página
 * da pastoral. Devolve um mapa para a página fazer uma consulta só, e não uma
 * por cartão.
 */
export async function coordenacaoPorPastoral(): Promise<
  Map<string, PessoaNoSite[]>
> {
  const linhas = await db.coordenador.findMany({
    where: { ativo: true, naCoordenacao: true, pastoral: { ativa: true } },
    select: { ...CAMPOS_PUBLICOS, pastoralId: true },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });

  const mapa = new Map<string, PessoaNoSite[]>();
  for (const linha of linhas) {
    const lista = mapa.get(linha.pastoralId) ?? [];
    lista.push(semContatoNaoAutorizado(linha));
    mapa.set(linha.pastoralId, lista);
  }
  return mapa;
}

/**
 * A equipe de uma pastoral, separada em coordenação e demais membros.
 *
 * É o que a página `/pastorais/<slug>` mostra.
 */
export async function equipeDaPastoral(
  pastoralId: string
): Promise<{ coordenacao: PessoaNoSite[]; equipe: PessoaNoSite[] }> {
  const linhas = await db.coordenador.findMany({
    where: { ativo: true, pastoralId },
    select: CAMPOS_PUBLICOS,
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });

  return {
    coordenacao: linhas.filter((l) => l.naCoordenacao).map(semContatoNaoAutorizado),
    equipe: linhas.filter((l) => !l.naCoordenacao).map(semContatoNaoAutorizado),
  };
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
