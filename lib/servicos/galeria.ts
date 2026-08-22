import "server-only";

import type { z } from "zod";
import { db } from "@/lib/db";
import { montarPagina, recortar, type Pagina } from "./listagem";
import { contem } from "./listagem";
import type { albumEdicaoSchema, albumSchema } from "@/lib/validacao/esquemas";

export type AlbumDaLista = {
  id: string;
  titulo: string;
  data: Date | null;
  publicado: boolean;
  _count: { fotos: number };
};

export async function listarAlbuns({
  busca = "",
  pagina = 1,
}: {
  busca?: string;
  pagina?: number;
}): Promise<Pagina<AlbumDaLista>> {
  const onde = contem("titulo", busca);

  const total = await db.album.count({ where: onde });
  const recorte = recortar(pagina, total);

  const itens = await db.album.findMany({
    where: onde,
    select: {
      id: true,
      titulo: true,
      data: true,
      publicado: true,
      _count: { select: { fotos: true } },
    },
    orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
    skip: recorte.skip,
    take: recorte.take,
  });

  return montarPagina(itens as AlbumDaLista[], total, recorte);
}

/** Álbuns visíveis na galeria do site, com as fotos já ordenadas. */
export async function albunsPublicados() {
  return db.album.findMany({
    where: { publicado: true },
    select: {
      id: true,
      titulo: true,
      data: true,
      fotos: {
        select: { id: true, url: true, legenda: true },
        orderBy: { ordem: "asc" },
      },
    },
    orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
  });
}

export async function buscarAlbum(id: string) {
  return db.album.findUnique({
    where: { id },
    include: { fotos: { orderBy: { ordem: "asc" } } },
  });
}

export async function criarAlbum(dados: z.infer<typeof albumSchema>) {
  await db.album.create({ data: dados });
}

export async function atualizarAlbum({
  id,
  ...dados
}: z.infer<typeof albumEdicaoSchema>) {
  await db.album.update({ where: { id }, data: dados });
}

/** Apaga o álbum; as fotos vão junto (onDelete: Cascade no schema). */
export async function excluirAlbum(id: string) {
  await db.album.delete({ where: { id } });
}

export async function adicionarFoto(albumId: string, url: string, legenda?: string) {
  const ultima = await db.foto.findFirst({
    where: { albumId },
    select: { ordem: true },
    orderBy: { ordem: "desc" },
  });

  await db.foto.create({
    data: {
      albumId,
      url,
      legenda: legenda ?? null,
      ordem: (ultima?.ordem ?? -1) + 1,
    },
  });
}

export async function excluirFoto(id: string) {
  await db.foto.delete({ where: { id } });
}

export async function contarFotos(): Promise<number> {
  return db.foto.count();
}
