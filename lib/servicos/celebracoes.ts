import "server-only";

import type { z } from "zod";
import { db } from "@/lib/db";
import { montarPagina, recortar, type Pagina } from "./listagem";
import { DIAS_DA_SEMANA } from "@/lib/validacao/esquemas";
import type {
  celebracaoEdicaoSchema,
  celebracaoSchema,
} from "@/lib/validacao/esquemas";

export type Celebracao = {
  id: string;
  diaSemana: number;
  hora: string;
  nome: string;
  local: string;
  transmitida: boolean;
  observacao: string | null;
  ativo: boolean;
};

export async function listarCelebracoes({
  busca = "",
  diaSemana,
  pagina = 1,
}: {
  busca?: string;
  diaSemana?: number;
  pagina?: number;
}): Promise<Pagina<Celebracao>> {
  const onde = {
    ...(busca
      ? {
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            { local: { contains: busca, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(diaSemana === undefined ? {} : { diaSemana }),
  };

  const total = await db.celebracao.count({ where: onde });
  const recorte = recortar(pagina, total);

  const itens = await db.celebracao.findMany({
    where: onde,
    orderBy: [{ diaSemana: "asc" }, { hora: "asc" }],
    skip: recorte.skip,
    take: recorte.take,
  });

  return montarPagina(itens as Celebracao[], total, recorte);
}

/**
 * Grade da semana para o site público, já agrupada por dia.
 *
 * Sai daqui pronta para a tela: agrupar no componente significaria repetir a
 * mesma lógica na página inicial e na de horários.
 */
export async function gradeDaSemana() {
  const linhas = await db.celebracao.findMany({
    where: { ativo: true },
    orderBy: [{ diaSemana: "asc" }, { hora: "asc" }],
  });

  return DIAS_DA_SEMANA.map((dia, indice) => ({
    dia,
    atividades: linhas
      .filter((linha) => linha.diaSemana === indice)
      .map((linha) => ({
        hora: linha.hora.replace(":", "h"),
        nome: linha.transmitida
          ? `${linha.nome} (transmitida ao vivo no YouTube)`
          : linha.nome,
        local: linha.local,
        observacao: linha.observacao,
      })),
  })).filter((grupo) => grupo.atividades.length > 0);
}

export async function criarCelebracao(dados: z.infer<typeof celebracaoSchema>) {
  await db.celebracao.create({ data: dados });
}

export async function atualizarCelebracao({
  id,
  ...dados
}: z.infer<typeof celebracaoEdicaoSchema>) {
  await db.celebracao.update({ where: { id }, data: dados });
}

export async function excluirCelebracao(id: string) {
  await db.celebracao.delete({ where: { id } });
}

export async function contarCelebracoesAtivas(): Promise<number> {
  return db.celebracao.count({ where: { ativo: true } });
}
