import "server-only";

import { db } from "@/lib/db";
import type { z } from "zod";
import type { avisoSchema, avisoEdicaoSchema } from "@/lib/validacao/esquemas";
import { contem, montarPagina, recortar, type Pagina } from "./listagem";

export type Aviso = {
  id: string;
  texto: string;
  ativo: boolean;
  ordem: number;
  atualizadoEm: Date;
};

const CAMPOS = {
  id: true,
  texto: true,
  ativo: true,
  ordem: true,
  atualizadoEm: true,
} as const;

/** Lista para o painel, com busca e paginação. */
export async function listarAvisos({
  busca = "",
  ativo,
  pagina = 1,
}: {
  busca?: string;
  /** `undefined` = todos; `true`/`false` filtram. */
  ativo?: boolean;
  pagina?: number;
}): Promise<Pagina<Aviso>> {
  const onde = { ...contem("texto", busca), ...(ativo === undefined ? {} : { ativo }) };

  const total = await db.aviso.count({ where: onde });
  const recorte = recortar(pagina, total);

  const itens = await db.aviso.findMany({
    where: onde,
    select: CAMPOS,
    orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
    skip: recorte.skip,
    take: recorte.take,
  });

  return montarPagina(itens, total, recorte);
}

/** O que o site público mostra na página inicial. */
export async function avisosAtivos(): Promise<string[]> {
  const linhas = await db.aviso.findMany({
    where: { ativo: true },
    select: { texto: true },
    orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
  });
  return linhas.map((linha) => linha.texto);
}

export async function criarAviso(dados: z.infer<typeof avisoSchema>) {
  await db.aviso.create({ data: dados });
}

export async function atualizarAviso({
  id,
  ...dados
}: z.infer<typeof avisoEdicaoSchema>) {
  await db.aviso.update({ where: { id }, data: dados });
}

export async function alternarAviso(id: string, ativo: boolean) {
  await db.aviso.update({ where: { id }, data: { ativo } });
}

export async function excluirAviso(id: string) {
  await db.aviso.delete({ where: { id } });
}

export async function contarAvisosAtivos(): Promise<number> {
  return db.aviso.count({ where: { ativo: true } });
}
