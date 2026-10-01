import "server-only";

import type { z } from "zod";
import { db } from "@/lib/db";
import { ErroDeNegocio } from "./resultado";
import { pode } from "@/lib/auth/papeis";
import { alcancaPastoral, type QuemMexe } from "./coordenadores";
import type {
  configuracaoCatequeseSchema,
  inscricaoNaCatequeseSchema,
  statusInscricaoSchema,
  turmaDeCatequeseEdicaoSchema,
  turmaDeCatequeseSchema,
} from "@/lib/validacao/esquemas";
import type { StatusInscricao, TipoDeInscricao } from "@/lib/validacao/esquemas";

/**
 * A catequese dentro do nosso sistema.
 *
 * ---
 *
 * POR QUE ESTE MÓDULO EXISTE
 *
 * A catequese da paróquia roda hoje num sistema à parte, feito pelo
 * coordenador. A decisão de 03/09/2026 foi trazer isso para cá, mantendo o
 * mesmo jeito de funcionar, para a paróquia não depender de dois sistemas com
 * duas senhas e dois donos.
 *
 * O que está aqui é o miolo: turmas, período de inscrição e os pedidos que
 * chegam pelo site. O que continua lá (capela virtual, camiseta da crisma,
 * cadastro de padrinhos) segue ligado por link, e NÃO foi copiado — copiar sem
 * ver a área logada por dentro daria um palpite com cara de sistema, que é
 * pior que não ter.
 *
 * ---
 *
 * QUEM ALCANÇA O QUÊ
 *
 * Nenhum papel novo foi inventado. A catequese É uma pastoral, então quem
 * cuida dela é quem já cuidaria: a secretaria (que alcança qualquer pastoral)
 * e o coordenador ligado à pastoral "Catequese". A conferência reaproveita
 * `alcancaPastoral`, a mesma da equipe e da agenda — três portas com a mesma
 * fechadura, e não três fechaduras para esquecer de trancar.
 *
 * ---
 *
 * PRIVACIDADE
 *
 * As inscrições guardam nome e data de nascimento de criança, e o telefone de
 * quem responde por ela. Nada disso tem consulta pública neste arquivo, e não
 * deve ganhar uma. As funções que o site usa (`turmasNoSite`,
 * `situacaoDasInscricoes`) devolvem só o que pode ser afixado no mural da
 * igreja. Ver docs/privacidade.md.
 */

/** O endereço da pastoral da catequese no site. É por ele que a achamos. */
const SLUG_DA_CATEQUESE = "catequese";

export type ConfiguracaoDaCatequese = {
  inscricoesAbertas: boolean;
  anoLetivo: string;
  aviso: string | null;
};

/**
 * Quando ainda não há configuração gravada.
 *
 * Fechado, e não aberto: um sistema que estreia recebendo inscrição sem
 * ninguém ter mandado abrir é um sistema que recebe dado de criança por
 * acidente. O ano corrente é só um chute razoável para o formulário do painel
 * abrir preenchido.
 */
function padrao(): ConfiguracaoDaCatequese {
  return {
    inscricoesAbertas: false,
    anoLetivo: String(new Date().getFullYear()),
    aviso: null,
  };
}

export async function configuracaoDaCatequese(): Promise<ConfiguracaoDaCatequese> {
  const linha = await db.configuracaoDaCatequese.findUnique({
    where: { id: "unica" },
    select: { inscricoesAbertas: true, anoLetivo: true, aviso: true },
  });
  return linha ?? padrao();
}

export async function salvarConfiguracao(
  dados: z.infer<typeof configuracaoCatequeseSchema>,
  quem: QuemMexe
): Promise<void> {
  await garantirAlcanceDaCatequese(quem);

  // `upsert` porque a linha pode não existir ainda — é a primeira vez que
  // alguém abre a tela. Criar vazio na migração daria o mesmo resultado com
  // uma linha de dados fabricada que ninguém pediu.
  await db.configuracaoDaCatequese.upsert({
    where: { id: "unica" },
    create: { id: "unica", ...dados },
    update: dados,
  });
}

// ---------------------------------------------------------------------------
// Turmas
// ---------------------------------------------------------------------------

export type Turma = {
  id: string;
  nome: string;
  etapa: string;
  diaSemana: number;
  hora: string;
  local: string | null;
  vagas: number;
  catequistas: string | null;
  anoLetivo: string;
  ativa: boolean;
  ordem: number;
};

/** Turma como o site a mostra, com a contagem de quem já pediu vaga. */
export type TurmaNoSite = Omit<Turma, "ativa" | "ordem"> & {
  /** Quantos pedidos já confirmados. Só aparece quando há limite de vagas. */
  confirmadas: number;
  lotada: boolean;
};

export async function listarTurmas(quem: QuemMexe): Promise<Turma[]> {
  await garantirAlcanceDaCatequese(quem);

  return db.turmaDeCatequese.findMany({
    orderBy: [{ anoLetivo: "desc" }, { ordem: "asc" }, { diaSemana: "asc" }, { hora: "asc" }],
  });
}

/**
 * As turmas que o site mostra: só as ativas do ano corrente.
 *
 * A contagem de confirmadas vem junto porque a página precisa saber se a turma
 * encheu — e fazer uma consulta por turma no laço da tela seria uma consulta
 * para cada linha desenhada.
 */
export async function turmasNoSite(): Promise<TurmaNoSite[]> {
  const { anoLetivo } = await configuracaoDaCatequese();

  // `select` explícito: o site não precisa de `ativa` nem de `ordem` (a
  // primeira já filtrou, a segunda já ordenou), e o que não vem do banco não
  // corre o risco de vazar para a tela por descuido.
  const turmas = await db.turmaDeCatequese.findMany({
    where: { ativa: true, anoLetivo },
    select: {
      id: true,
      nome: true,
      etapa: true,
      diaSemana: true,
      hora: true,
      local: true,
      vagas: true,
      catequistas: true,
      anoLetivo: true,
    },
    orderBy: [{ ordem: "asc" }, { diaSemana: "asc" }, { hora: "asc" }],
  });

  if (turmas.length === 0) return [];

  // Uma consulta agrupada, e não uma por turma.
  const contagem = await db.inscricaoNaCatequese.groupBy({
    by: ["turmaId"],
    where: {
      status: "CONFIRMADA",
      turmaId: { in: turmas.map((t) => t.id) },
    },
    _count: { _all: true },
  });

  const porTurma = new Map(
    contagem.map((linha) => [linha.turmaId, linha._count._all])
  );

  return turmas.map((turma) => {
    const confirmadas = porTurma.get(turma.id) ?? 0;
    return {
      ...turma,
      confirmadas,
      lotada: turma.vagas > 0 && confirmadas >= turma.vagas,
    };
  });
}

export async function criarTurma(
  dados: z.infer<typeof turmaDeCatequeseSchema>,
  quem: QuemMexe
): Promise<void> {
  await garantirAlcanceDaCatequese(quem);
  await db.turmaDeCatequese.create({ data: dados });
}

export async function atualizarTurma(
  { id, ...dados }: z.infer<typeof turmaDeCatequeseEdicaoSchema>,
  quem: QuemMexe
): Promise<void> {
  await garantirAlcanceDaCatequese(quem);
  const existe = await db.turmaDeCatequese.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existe) throw new ErroDeNegocio("Turma não encontrada.");

  await db.turmaDeCatequese.update({ where: { id }, data: dados });
}

/**
 * Apagar turma é diferente de apagar um aviso: há inscrições ligadas a ela.
 *
 * O vínculo cai para nulo (ver o schema) em vez de arrastar os pedidos junto —
 * a família se inscreveu de verdade, e a turma preferida ter sumido não apaga
 * o pedido. Mesmo assim avisamos quantos ficarão sem turma, porque quem
 * aperta o botão precisa saber o tamanho do estrago.
 */
export async function excluirTurma(id: string, quem: QuemMexe): Promise<void> {
  await garantirAlcanceDaCatequese(quem);

  const ligadas = await db.inscricaoNaCatequese.count({ where: { turmaId: id } });
  if (ligadas > 0) {
    throw new ErroDeNegocio(
      `Esta turma tem ${ligadas} inscrição(ões) ligada(s) a ela. ` +
        "Desmarque “Turma ativa” para tirá-la do site sem perder o vínculo, " +
        "ou mova as inscrições para outra turma antes de excluir."
    );
  }

  await db.turmaDeCatequese.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Inscrições
// ---------------------------------------------------------------------------

export type Inscricao = {
  id: string;
  tipo: TipoDeInscricao;
  status: StatusInscricao;
  turma: { id: string; nome: string; etapa: string } | null;
  nome: string;
  dataNascimento: Date;
  batizado: boolean;
  paroquiaBatismo: string | null;
  responsavel: string;
  parentesco: string;
  telefone: string;
  email: string | null;
  padrinho: string | null;
  observacao: string | null;
  anoLetivo: string;
  consentimentoEm: Date;
  criadoEm: Date;
};

/**
 * O que o site conta sobre as inscrições — e só isto.
 *
 * Nenhum nome, nenhum telefone: a página pública precisa saber se está aberto
 * e quais turmas existem, não quem se inscreveu.
 */
export type SituacaoDasInscricoes = {
  abertas: boolean;
  anoLetivo: string;
  aviso: string | null;
  turmas: TurmaNoSite[];
};

export async function situacaoDasInscricoes(): Promise<SituacaoDasInscricoes> {
  const [config, turmas] = await Promise.all([
    configuracaoDaCatequese(),
    turmasNoSite(),
  ]);

  return {
    abertas: config.inscricoesAbertas,
    anoLetivo: config.anoLetivo,
    aviso: config.aviso,
    turmas,
  };
}

/**
 * Recebe um pedido vindo do site.
 *
 * Não recebe `quem`: quem preenche é a comunidade, sem conta no painel. Por
 * isso as três travas abaixo são a única defesa que existe aqui.
 */
export async function receberInscricao(
  dados: z.infer<typeof inscricaoNaCatequeseSchema>
): Promise<void> {
  const config = await configuracaoDaCatequese();

  // 1. Período fechado não recebe. A tela já esconde o formulário; isto aqui é
  //    o que vale, porque esconder o botão não fecha a rota.
  if (!config.inscricoesAbertas) {
    throw new ErroDeNegocio(
      "As inscrições da catequese não estão abertas no momento. " +
        "Acompanhe a página da catequese ou procure a secretaria paroquial."
    );
  }

  // 2. A turma escolhida precisa existir, estar ativa e ser do ano corrente.
  //    O id chega de um `<select>`, ou seja, de texto vindo da rede.
  let turmaId: string | null = null;
  if (dados.turmaId) {
    const turma = await db.turmaDeCatequese.findFirst({
      where: { id: dados.turmaId, ativa: true, anoLetivo: config.anoLetivo },
      select: { id: true },
    });
    if (!turma) {
      throw new ErroDeNegocio(
        "A turma escolhida não está mais disponível. Recarregue a página e escolha outra."
      );
    }
    turmaId = turma.id;
  }

  // 3. Mesmo nome, mesma data de nascimento e mesmo ano já inscrito é envio
  //    repetido — o dedo escorregou no botão, ou a página foi recarregada.
  //    Aceitar cria duas fichas da mesma criança e a coordenação liga duas
  //    vezes para a mesma família.
  const jaExiste = await db.inscricaoNaCatequese.findFirst({
    where: {
      nome: dados.nome,
      dataNascimento: dados.dataNascimento,
      anoLetivo: config.anoLetivo,
    },
    select: { id: true },
  });
  if (jaExiste) {
    throw new ErroDeNegocio(
      `Já recebemos uma inscrição para ${dados.nome} em ${config.anoLetivo}. ` +
        "Se precisar corrigir algum dado, fale com a secretaria paroquial."
    );
  }

  // Os campos são listados um a um, e não espalhados com `...dados`. É mais
  // longo, mas é o que garante que um campo novo no formulário não entre no
  // banco só por ter sido acrescentado ao esquema — numa tabela com dado de
  // criança, o que se grava tem de ser decisão explícita.
  await db.inscricaoNaCatequese.create({
    data: {
      tipo: dados.tipo,
      turmaId,
      nome: dados.nome,
      dataNascimento: dados.dataNascimento,
      batizado: dados.batizado,
      paroquiaBatismo: dados.paroquiaBatismo,
      responsavel: dados.responsavel,
      parentesco: dados.parentesco,
      telefone: dados.telefone,
      email: dados.email,
      padrinho: dados.padrinho,
      observacao: dados.observacao,
      anoLetivo: config.anoLetivo,
      // A data do aceite é gravada pelo servidor, e não mandada pelo
      // formulário: data de consentimento que o próprio interessado escolhe
      // não prova nada.
      consentimentoEm: new Date(),
    },
  });
}

export async function listarInscricoes(
  {
    busca = "",
    status,
    anoLetivo,
  }: { busca?: string; status?: StatusInscricao; anoLetivo?: string },
  quem: QuemMexe
): Promise<Inscricao[]> {
  await garantirAlcanceDaCatequese(quem);

  const linhas = await db.inscricaoNaCatequese.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(anoLetivo ? { anoLetivo } : {}),
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca, mode: "insensitive" as const } },
              { responsavel: { contains: busca, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: { turma: { select: { id: true, nome: true, etapa: true } } },
    orderBy: [{ criadoEm: "desc" }],
  });

  return linhas as Inscricao[];
}

export async function mudarStatusDaInscricao(
  { id, status }: z.infer<typeof statusInscricaoSchema>,
  quem: QuemMexe
): Promise<void> {
  await garantirAlcanceDaCatequese(quem);

  const existe = await db.inscricaoNaCatequese.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existe) throw new ErroDeNegocio("Inscrição não encontrada.");

  await db.inscricaoNaCatequese.update({ where: { id }, data: { status } });
}

/**
 * Apaga uma inscrição de vez.
 *
 * Exige `coordenadores.excluir` — a mesma permissão de apagar o cadastro de
 * uma pessoa, porque é disso que se trata. O coordenador da catequese recusa
 * um pedido mudando o status para "Não aceita", que mantém o registro do que
 * aconteceu; apagar é do padre ou do administrador geral.
 */
export async function excluirInscricao(
  id: string,
  quem: QuemMexe
): Promise<void> {
  await garantirAlcanceDaCatequese(quem);

  if (!pode(quem.papel, "coordenadores.excluir")) {
    throw new ErroDeNegocio(
      "Apagar uma inscrição é do padre ou do administrador geral. " +
        "Para recusar um pedido, marque-o como “Não aceita” — o registro fica."
    );
  }

  await db.inscricaoNaCatequese.delete({ where: { id } });
}

/** Quantos pedidos aguardam resposta — para o resumo de abertura do painel. */
export async function contarInscricoesAguardando(): Promise<number> {
  return db.inscricaoNaCatequese.count({
    where: { status: { in: ["RECEBIDA", "EM_ANALISE"] } },
  });
}

// ---------------------------------------------------------------------------
// Alcance
// ---------------------------------------------------------------------------

/**
 * A pastoral "Catequese", que é o que dá o alcance.
 *
 * Se ela não existir no banco (paróquia que ainda não cadastrou), ninguém
 * além da secretaria alcança a catequese — e é o certo: não há grupo, logo não
 * há coordenador de grupo.
 */
async function pastoralDaCatequese(): Promise<string | null> {
  const pastoral = await db.pastoral.findUnique({
    where: { slug: SLUG_DA_CATEQUESE },
    select: { id: true },
  });
  return pastoral?.id ?? null;
}

/**
 * Se esta conta pode cuidar da catequese.
 *
 * Exportada porque as TELAS também precisam saber — para não desenhar um menu
 * que leva a uma porta trancada. Quem tranca é `garantirAlcanceDaCatequese`.
 */
export async function alcancaCatequese(quem: QuemMexe): Promise<boolean> {
  if (pode(quem.papel, "coordenadores.gerenciar")) return true;

  const pastoralId = await pastoralDaCatequese();
  if (!pastoralId) return false;

  return alcancaPastoral(quem, pastoralId);
}

async function garantirAlcanceDaCatequese(quem: QuemMexe): Promise<void> {
  if (await alcancaCatequese(quem)) return;
  throw new ErroDeNegocio(
    "Esta área é da coordenação da catequese e da secretaria paroquial."
  );
}
