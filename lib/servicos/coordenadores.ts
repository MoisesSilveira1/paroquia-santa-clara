import "server-only";

import type { z } from "zod";
import { db } from "@/lib/db";
import { montarPagina, recortar, type Pagina } from "./listagem";
import { ErroDeNegocio } from "./resultado";
import { pode, type Papel } from "@/lib/auth/papeis";
import type {
  coordenadorEdicaoSchema,
  coordenadorSchema,
} from "@/lib/validacao/esquemas";

/** O mínimo que as funções de alcance precisam saber de quem está mexendo. */
export type QuemMexe = { id: string; papel: Papel };

/**
 * As pastorais que esta conta coordena.
 *
 * Só conta quem está na COORDENAÇÃO e ativo: alguém que entrou na equipe como
 * membro comum, ou que saiu da coordenação, não deve continuar mandando no
 * cadastro do grupo.
 */
export async function pastoraisQueCoordena(usuarioId: string): Promise<string[]> {
  const linhas = await db.coordenador.findMany({
    where: { usuarioId, naCoordenacao: true, ativo: true },
    select: { pastoralId: true },
  });
  return [...new Set(linhas.map((l) => l.pastoralId))];
}

/**
 * Se esta conta alcança a equipe desta pastoral.
 *
 * Duas portas: quem tem `coordenadores.gerenciar` alcança qualquer pastoral
 * (é a secretaria); quem só tem `equipe.propria` alcança as que coordena.
 *
 * A conferência é aqui, no serviço, e não na tela nem na ação: é o único
 * ponto por onde todo caminho passa. Uma tela nova que esqueça de filtrar
 * mostra demais — feio, mas inofensivo; uma ação que esqueça de conferir
 * deixaria um coordenador editar a equipe alheia.
 */
export async function alcancaPastoral(
  quem: QuemMexe,
  pastoralId: string
): Promise<boolean> {
  if (pode(quem.papel, "coordenadores.gerenciar")) return true;
  if (!pode(quem.papel, "equipe.propria")) return false;
  return (await pastoraisQueCoordena(quem.id)).includes(pastoralId);
}

/**
 * Decide qual vínculo com conta do painel de fato será gravado.
 *
 * Dar (ou tirar) a conta de alguém é da secretaria: sem isso, um coordenador
 * ligaria a própria conta a mais uma pastoral e passaria a mandar nela — a
 * porta dos fundos deste papel.
 *
 * Para quem não pode, o campo é IGNORADO em vez de recusado, e a diferença
 * importa. O formulário do coordenador nem desenha esse campo, então ele
 * chega vazio; recusar por isso travava o cadastro inteiro — foi o que
 * aconteceu em 03/09/2026, e o coordenador não conseguia incluir ninguém.
 * Ignorar mantém o valor que já estava lá e não abre nada: quem forjar o
 * campo simplesmente não é obedecido.
 */
function vinculoAGravar(
  quem: QuemMexe,
  pedido: string | null | undefined,
  atual: string | null
): string | null {
  if (pode(quem.papel, "coordenadores.gerenciar")) return pedido ?? null;
  return atual;
}

async function garantirAlcance(quem: QuemMexe, pastoralId: string) {
  if (await alcancaPastoral(quem, pastoralId)) return;
  throw new ErroDeNegocio(
    "Você só pode mexer na equipe da pastoral que coordena."
  );
}

export type Coordenador = {
  id: string;
  nome: string;
  funcao: string;
  telefone: string | null;
  email: string | null;
  contatoPublico: boolean;
  naCoordenacao: boolean;
  pastoralId: string;
  usuarioId: string | null;
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
  quem,
}: {
  busca?: string;
  pastoralId?: string;
  ativo?: boolean;
  pagina?: number;
  /// Quando informado, a lista só traz o que esta conta alcança.
  quem?: QuemMexe;
}): Promise<Pagina<Coordenador>> {
  // O coordenador vê a equipe da sua pastoral e nada mais. O corte é na
  // consulta: uma lista filtrada só na tela ainda teria trazido do banco os
  // nomes e telefones das outras pastorais.
  const soEstas =
    quem && !pode(quem.papel, "coordenadores.gerenciar")
      ? await pastoraisQueCoordena(quem.id)
      : null;

  const onde = {
    ...(soEstas ? { pastoralId: { in: soEstas } } : {}),
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
 * A coordenação de uma pastoral — o que a página `/pastorais/<slug>` mostra.
 *
 * SÓ a coordenação, de propósito: coordenador, vice e adjunto. O resto da
 * equipe é gente voluntária, que serve quando pode e nem sempre com
 * frequência; publicar esses nomes no site expõe pessoas que não pediram
 * para estar ali, e envelhece rápido. A equipe inteira continua no painel,
 * que é onde ela serve para escala e contato interno.
 *
 * O corte é aqui, na consulta: a página não recebe os outros nomes, então
 * não há como um cartão novo mostrá-los sem querer.
 */
export async function coordenacaoDaPastoral(
  pastoralId: string
): Promise<PessoaNoSite[]> {
  const linhas = await db.coordenador.findMany({
    where: { ativo: true, naCoordenacao: true, pastoralId },
    select: CAMPOS_PUBLICOS,
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });

  return linhas.map(semContatoNaoAutorizado);
}

/**
 * As pastorais que esta conta pode escolher no formulário.
 *
 * Para o coordenador, só a dele: oferecer as outras no seletor seria convidar
 * a um erro que o servidor recusaria depois.
 */
export async function pastoraisParaSelecao(
  quem?: QuemMexe
): Promise<OpcaoDePastoral[]> {
  const soEstas =
    quem && !pode(quem.papel, "coordenadores.gerenciar")
      ? await pastoraisQueCoordena(quem.id)
      : null;

  return db.pastoral.findMany({
    where: soEstas ? { id: { in: soEstas } } : {},
    select: { id: true, nome: true, ativa: true },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });
}

/** As contas do painel que podem ser ligadas a alguém da coordenação. */
export async function contasParaVincular(): Promise<
  { id: string; nome: string; email: string }[]
> {
  return db.usuario.findMany({
    where: { ativo: true, papel: "COORDENADOR" },
    select: { id: true, nome: true, email: true },
    orderBy: { nome: "asc" },
  });
}

export async function criarCoordenador(
  dados: z.infer<typeof coordenadorSchema>,
  quem: QuemMexe
) {
  await garantirPastoral(dados.pastoralId);
  await garantirAlcance(quem, dados.pastoralId);

  // Cadastro novo não tem vínculo anterior: para quem não pode vincular,
  // nasce sem conta.
  await db.coordenador.create({
    data: { ...dados, usuarioId: vinculoAGravar(quem, dados.usuarioId, null) },
  });
}

export async function atualizarCoordenador(
  { id, ...dados }: z.infer<typeof coordenadorEdicaoSchema>,
  quem: QuemMexe
) {
  const atual = await db.coordenador.findUnique({
    where: { id },
    select: { pastoralId: true, usuarioId: true },
  });
  if (!atual) throw new ErroDeNegocio("Coordenador não encontrado.");

  // As duas pontas: a pastoral em que a pessoa está hoje e a para onde ela
  // iria. Sem a primeira, um coordenador editaria alguém de outro grupo
  // apenas escolhendo o próprio grupo no formulário.
  await garantirAlcance(quem, atual.pastoralId);
  await garantirPastoral(dados.pastoralId);
  await garantirAlcance(quem, dados.pastoralId);

  await db.coordenador.update({
    where: { id },
    data: {
      ...dados,
      usuarioId: vinculoAGravar(quem, dados.usuarioId, atual.usuarioId),
    },
  });
}

export async function excluirCoordenador(id: string, quem: QuemMexe) {
  const atual = await db.coordenador.findUnique({
    where: { id },
    select: { pastoralId: true },
  });
  if (!atual) throw new ErroDeNegocio("Coordenador não encontrado.");

  await garantirAlcance(quem, atual.pastoralId);
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
