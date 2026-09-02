import "server-only";

import type { z } from "zod";
import { db } from "@/lib/db";
import { montarPagina, recortar, type Pagina } from "./listagem";
import { contem } from "./listagem";
import type { albumEdicaoSchema, albumSchema } from "@/lib/validacao/esquemas";
import type { ImagemPronta } from "@/lib/imagens/processar";

export type FotoDoAlbum = { id: string; url: string; legenda: string | null };

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

/** Fotos dos álbuns listados, agrupadas por álbum e já na ordem de exibição. */
export async function fotosDosAlbuns(
  albumIds: string[]
): Promise<Record<string, FotoDoAlbum[]>> {
  if (albumIds.length === 0) return {};

  // Uma consulta só para todos os álbuns da página, em vez de uma por álbum.
  const fotos = await db.foto.findMany({
    where: { albumId: { in: albumIds } },
    select: { id: true, url: true, legenda: true, albumId: true },
    orderBy: { ordem: "asc" },
  });

  const porAlbum: Record<string, FotoDoAlbum[]> = {};
  for (const { albumId, ...foto } of fotos) (porAlbum[albumId] ??= []).push(foto);
  return porAlbum;
}

/**
 * Grava no álbum uma foto enviada pelo painel.
 *
 * O endereço da imagem depende do id da foto, e o id só existe depois de a
 * linha ser criada — daí o `update` logo em seguida. Os três passos vão numa
 * transação para que uma falha no meio não deixe foto sem imagem no álbum.
 */
export async function adicionarFotoEnviada(
  albumId: string,
  imagem: ImagemPronta,
  legenda?: string
): Promise<void> {
  await db.$transaction(async (tx) => {
    const ultima = await tx.foto.findFirst({
      where: { albumId },
      select: { ordem: true },
      orderBy: { ordem: "desc" },
    });

    const foto = await tx.foto.create({
      data: {
        albumId,
        url: "",
        legenda: legenda ?? null,
        ordem: (ultima?.ordem ?? -1) + 1,
      },
      select: { id: true },
    });

    await tx.imagem.create({ data: { fotoId: foto.id, ...imagem } });
    await tx.foto.update({
      where: { id: foto.id },
      data: { url: `/imagens/${foto.id}` },
    });
  });
}

export async function atualizarLegenda(id: string, legenda: string): Promise<void> {
  await db.foto.update({
    where: { id },
    data: { legenda: legenda || null },
  });
}

/**
 * Bytes da imagem de uma foto, para a rota que a serve.
 *
 * Devolve `null` quando a foto veio junto com o código (as de `/public`, que o
 * próprio Next entrega) ou quando o id não existe.
 */
export async function imagemDaFoto(fotoId: string) {
  return db.imagem.findUnique({
    where: { fotoId },
    select: { dados: true, tipo: true },
  });
}

export async function excluirFoto(id: string) {
  await db.foto.delete({ where: { id } });
}

export async function contarFotos(): Promise<number> {
  return db.foto.count();
}
