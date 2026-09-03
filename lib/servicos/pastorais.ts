import "server-only";

import type { z } from "zod";
import { db } from "@/lib/db";
import { montarPagina, recortar, type Pagina } from "./listagem";
import { slugUnico } from "./slug";
import { ErroDeNegocio } from "./resultado";
import type { pastoralEdicaoSchema, pastoralSchema } from "@/lib/validacao/esquemas";

export type Pastoral = {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  contato: string;
  reunioes: string;
  ativa: boolean;
  ordem: number;
};

export async function listarPastorais({
  busca = "",
  ativa,
  pagina = 1,
}: {
  busca?: string;
  ativa?: boolean;
  pagina?: number;
}): Promise<Pagina<Pastoral>> {
  const onde = {
    ...(busca
      ? {
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            { descricao: { contains: busca, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(ativa === undefined ? {} : { ativa }),
  };

  const total = await db.pastoral.count({ where: onde });
  const recorte = recortar(pagina, total);

  const itens = await db.pastoral.findMany({
    where: onde,
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    skip: recorte.skip,
    take: recorte.take,
  });

  return montarPagina(itens as Pastoral[], total, recorte);
}

/** As que aparecem na página pública de pastorais. */
export async function pastoraisAtivas() {
  return db.pastoral.findMany({
    where: { ativa: true },
    select: {
      // O `id` vem para casar com os coordenadores, que a página busca numa
      // consulta separada e junta em memória.
      id: true,
      slug: true,
      nome: true,
      descricao: true,
      contato: true,
      reunioes: true,
    },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });
}

export async function criarPastoral(dados: z.infer<typeof pastoralSchema>) {
  await db.pastoral.create({
    data: { ...dados, slug: await slugUnico("pastoral", dados.nome) },
  });
}

export async function atualizarPastoral({
  id,
  ...dados
}: z.infer<typeof pastoralEdicaoSchema>) {
  const atual = await db.pastoral.findUnique({
    where: { id },
    select: { nome: true },
  });
  if (!atual) throw new ErroDeNegocio("Pastoral não encontrada.");

  await db.pastoral.update({
    where: { id },
    data: {
      ...dados,
      ...(atual.nome === dados.nome
        ? {}
        : { slug: await slugUnico("pastoral", dados.nome, id) }),
    },
  });
}

export async function excluirPastoral(id: string) {
  await db.pastoral.delete({ where: { id } });
}

export async function contarPastoraisAtivas(): Promise<number> {
  return db.pastoral.count({ where: { ativa: true } });
}
