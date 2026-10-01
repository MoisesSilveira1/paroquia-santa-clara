import "server-only";

import type { z } from "zod";
import { db } from "@/lib/db";
import { ErroDeNegocio } from "./resultado";
import { pode } from "@/lib/auth/papeis";
import { formatador } from "@/lib/agenda/fuso";
import { disputaEspaco, mesmoEspaco } from "@/lib/paroquia/espacos";
import {
  alcancaPastoral,
  pastoraisQueCoordena,
  type QuemMexe,
} from "./coordenadores";
import type {
  eventoDaPastoralEdicaoSchema,
  eventoDaPastoralSchema,
} from "@/lib/validacao/esquemas";
import type { TipoDeEvento } from "@/lib/validacao/esquemas";

/**
 * A agenda de cada pastoral: reuniões do grupo e escalas de quem serve.
 *
 * O alcance é o mesmo da equipe (ver `alcancaPastoral`), e de propósito: quem
 * cuida da equipe de um grupo cuida da agenda dele. Ter duas regras separadas
 * daria dois lugares para esquecer de conferir.
 */

export type EscaladoNoEvento = { id: string; nome: string; funcao: string };

export type EventoDaAgenda = {
  id: string;
  pastoralId: string;
  pastoral: { nome: string };
  titulo: string;
  tipo: TipoDeEvento;
  inicio: Date;
  fim: Date | null;
  local: string | null;
  observacao: string | null;
  escalados: EscaladoNoEvento[];
};

const CAMPOS = {
  id: true,
  pastoralId: true,
  pastoral: { select: { nome: true } },
  titulo: true,
  tipo: true,
  inicio: true,
  fim: true,
  local: true,
  observacao: true,
  escalados: {
    select: { membro: { select: { id: true, nome: true, funcao: true } } },
    orderBy: { membro: { ordem: "asc" } },
  },
} as const;

type LinhaCrua = {
  escalados: { membro: EscaladoNoEvento }[];
  [chave: string]: unknown;
};

function achatar(linha: LinhaCrua): EventoDaAgenda {
  const { escalados, ...resto } = linha;
  return {
    ...(resto as Omit<EventoDaAgenda, "escalados">),
    escalados: escalados.map((e) => e.membro),
  };
}

/** As pastorais cuja agenda esta conta alcança; `null` = todas. */
async function limiteDePastorais(quem: QuemMexe): Promise<string[] | null> {
  if (pode(quem.papel, "coordenadores.gerenciar")) return null;
  return pastoraisQueCoordena(quem.id);
}

/**
 * Os compromissos de um mês.
 *
 * Recebe o intervalo pronto porque quem sabe onde o mês começa e termina é a
 * tela — inclusive as sobras do mês anterior e do seguinte que aparecem na
 * primeira e na última semana da grade.
 */
export async function eventosNoIntervalo(
  quem: QuemMexe,
  de: Date,
  ate: Date
): Promise<EventoDaAgenda[]> {
  const soEstas = await limiteDePastorais(quem);

  const linhas = await db.eventoDaPastoral.findMany({
    where: {
      ...(soEstas ? { pastoralId: { in: soEstas } } : {}),
      inicio: { gte: de, lt: ate },
    },
    select: CAMPOS,
    orderBy: { inicio: "asc" },
  });

  return linhas.map((l) => achatar(l as LinhaCrua));
}

/** Os próximos compromissos, para o cartão de abertura do painel. */
export async function proximosEventos(
  quem: QuemMexe,
  quantos = 5
): Promise<EventoDaAgenda[]> {
  const soEstas = await limiteDePastorais(quem);

  const linhas = await db.eventoDaPastoral.findMany({
    where: {
      ...(soEstas ? { pastoralId: { in: soEstas } } : {}),
      inicio: { gte: new Date() },
    },
    select: CAMPOS,
    orderBy: { inicio: "asc" },
    take: quantos,
  });

  return linhas.map((l) => achatar(l as LinhaCrua));
}

/** A equipe que pode ser escalada, por pastoral. */
export async function equipesParaEscalar(
  quem: QuemMexe
): Promise<Map<string, EscaladoNoEvento[]>> {
  const soEstas = await limiteDePastorais(quem);

  const linhas = await db.coordenador.findMany({
    where: { ativo: true, ...(soEstas ? { pastoralId: { in: soEstas } } : {}) },
    select: { id: true, nome: true, funcao: true, pastoralId: true },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });

  const mapa = new Map<string, EscaladoNoEvento[]>();
  for (const l of linhas) {
    const lista = mapa.get(l.pastoralId) ?? [];
    lista.push({ id: l.id, nome: l.nome, funcao: l.funcao });
    mapa.set(l.pastoralId, lista);
  }
  return mapa;
}

/**
 * Recusa dois compromissos no mesmo espaço e na mesma hora.
 *
 * A conferência é aqui, no serviço, e não na tela: o choque acontece entre
 * pastorais diferentes, e cada coordenador só enxerga a agenda da sua. Quem
 * marca uma reunião no Auditório não tem como ver que a Liturgia já o reservou
 * — só o banco sabe disso.
 *
 * Por isso a busca ignora o alcance de quem está marcando, e a mensagem diz o
 * horário e o grupo, mas nada mais: saber que "a Catequese está no Auditório
 * das 19h às 21h" é o necessário para remarcar, e é o que qualquer pessoa
 * saberia olhando a porta da sala.
 *
 * Dois compromissos se chocam quando um começa antes de o outro terminar.
 * Sem hora de término declarada, contamos uma hora — o padrão de uma reunião
 * de pastoral; supor "o dia inteiro" travaria a sala sem necessidade.
 */
const DURACAO_PADRAO_MS = 60 * 60 * 1000;

async function garantirEspacoLivre(
  dados: { local: string | null; inicio: Date; fim: Date | null },
  ignorarEventoId?: string
): Promise<void> {
  if (!disputaEspaco(dados.local)) return;

  const fim = dados.fim ?? new Date(dados.inicio.getTime() + DURACAO_PADRAO_MS);

  // Traz só o que acontece no mesmo dia; a comparação fina de horário e de
  // nome do espaço é feita aqui, porque o banco não sabe que "Auditório" e
  // "auditorio" são o mesmo lugar.
  const inicioDoDia = new Date(dados.inicio);
  inicioDoDia.setHours(0, 0, 0, 0);
  const fimDoDia = new Date(inicioDoDia.getTime() + 24 * 60 * 60 * 1000);

  const doDia = await db.eventoDaPastoral.findMany({
    where: {
      inicio: { gte: inicioDoDia, lt: fimDoDia },
      local: { not: null },
      ...(ignorarEventoId ? { id: { not: ignorarEventoId } } : {}),
    },
    select: {
      inicio: true,
      fim: true,
      local: true,
      titulo: true,
      pastoral: { select: { nome: true } },
    },
  });

  for (const outro of doDia) {
    if (!outro.local || !mesmoEspaco(outro.local, dados.local!)) continue;

    const fimDoOutro =
      outro.fim ?? new Date(outro.inicio.getTime() + DURACAO_PADRAO_MS);

    // Encostar não é chocar: uma reunião que termina às 20h e outra que começa
    // às 20h convivem bem. Por isso as comparações são estritas.
    if (dados.inicio < fimDoOutro && outro.inicio < fim) {
      throw new ErroDeNegocio(
        `${outro.local} já está reservado nesse horário: "${outro.titulo}" ` +
          `(${outro.pastoral.nome}), das ${horaCurta(outro.inicio)} às ` +
          `${horaCurta(fimDoOutro)}. Escolha outro horário ou outro espaço.`
      );
    }
  }
}

// Hora de Brasília, e não a do servidor — o mesmo cuidado de lib/agenda/fuso.
const HORA_CURTA = formatador({ hour: "2-digit", minute: "2-digit" });
const horaCurta = (quando: Date) => HORA_CURTA.format(quando);

export async function criarEvento(
  dados: z.infer<typeof eventoDaPastoralSchema>,
  quem: QuemMexe
) {
  await garantirAlcance(quem, dados.pastoralId);
  await garantirEspacoLivre(dados);
  const escalados = await escaladosValidos(dados.pastoralId, dados.escalados);

  await db.eventoDaPastoral.create({
    data: {
      pastoralId: dados.pastoralId,
      titulo: dados.titulo,
      tipo: dados.tipo,
      inicio: dados.inicio,
      fim: dados.fim,
      local: dados.local,
      observacao: dados.observacao,
      escalados: { create: escalados.map((membroId) => ({ membroId })) },
    },
  });
}

export async function atualizarEvento(
  dados: z.infer<typeof eventoDaPastoralEdicaoSchema>,
  quem: QuemMexe
) {
  const atual = await db.eventoDaPastoral.findUnique({
    where: { id: dados.id },
    select: { pastoralId: true },
  });
  if (!atual) throw new ErroDeNegocio("Compromisso não encontrado.");

  // As duas pontas, como no cadastro da equipe: onde o evento está e para
  // onde ele iria.
  await garantirAlcance(quem, atual.pastoralId);
  await garantirAlcance(quem, dados.pastoralId);

  // Ignora o próprio evento na conferência: senão ele se acusaria de chocar
  // consigo mesmo em qualquer edição que não mudasse o horário.
  await garantirEspacoLivre(dados, dados.id);

  const escalados = await escaladosValidos(dados.pastoralId, dados.escalados);

  // A escala é refeita por inteiro: comparar quem entrou e quem saiu daria o
  // mesmo resultado com mais chance de erro.
  await db.$transaction([
    db.escalaNoEvento.deleteMany({ where: { eventoId: dados.id } }),
    db.eventoDaPastoral.update({
      where: { id: dados.id },
      data: {
        pastoralId: dados.pastoralId,
        titulo: dados.titulo,
        tipo: dados.tipo,
        inicio: dados.inicio,
        fim: dados.fim,
        local: dados.local,
        observacao: dados.observacao,
        escalados: { create: escalados.map((membroId) => ({ membroId })) },
      },
    }),
  ]);
}

export async function excluirEvento(id: string, quem: QuemMexe) {
  const atual = await db.eventoDaPastoral.findUnique({
    where: { id },
    select: { pastoralId: true },
  });
  if (!atual) throw new ErroDeNegocio("Compromisso não encontrado.");

  await garantirAlcance(quem, atual.pastoralId);
  await db.eventoDaPastoral.delete({ where: { id } });
}

async function garantirAlcance(quem: QuemMexe, pastoralId: string) {
  if (await alcancaPastoral(quem, pastoralId)) return;
  throw new ErroDeNegocio(
    "Você só pode mexer na agenda da pastoral que coordena."
  );
}

/**
 * Fica só com quem realmente é da equipe daquela pastoral.
 *
 * Os ids chegam de caixas de marcar, ou seja, de texto vindo da rede. Sem
 * esta peneira daria para escalar alguém de outro grupo — e o nome dessa
 * pessoa apareceria numa escala que ela não conhece.
 */
async function escaladosValidos(
  pastoralId: string,
  pedidos: string[]
): Promise<string[]> {
  if (pedidos.length === 0) return [];

  const daEquipe = await db.coordenador.findMany({
    where: { pastoralId, ativo: true, id: { in: pedidos } },
    select: { id: true },
  });
  return daEquipe.map((m) => m.id);
}
