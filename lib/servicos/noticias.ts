import "server-only";

import type { z } from "zod";
import { db } from "@/lib/db";
import { ErroDeNegocio } from "./resultado";
import { montarPagina, recortar, type Pagina } from "./listagem";
import { slugUnico } from "./slug";
import {
  CATEGORIAS_NOTICIA,
  STATUS_NOTICIA,
  type CategoriaNoticia,
  type StatusNoticia,
  type noticiaEdicaoSchema,
  type noticiaSchema,
} from "@/lib/validacao/esquemas";

export type NoticiaDaLista = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  /**
   * Vem junto na listagem porque o formulário de edição abre a partir da
   * linha da tabela: sem o texto aqui, salvar uma edição apagaria o corpo da
   * notícia sem ninguém pedir.
   */
  corpo: string | null;
  categoria: CategoriaNoticia;
  status: StatusNoticia;
  destaque: boolean;
  publicadaEm: Date | null;
  atualizadoEm: Date;
  autor: { nome: string } | null;
};

const CAMPOS_LISTA = {
  id: true,
  slug: true,
  titulo: true,
  resumo: true,
  corpo: true,
  categoria: true,
  status: true,
  destaque: true,
  publicadaEm: true,
  atualizadoEm: true,
  autor: { select: { nome: true } },
} as const;

/**
 * Listagem do painel, com busca livre e filtros de situação e categoria.
 *
 * Filtros com valor desconhecido são ignorados em vez de virarem consulta:
 * o valor vem da barra de endereços, onde qualquer um pode digitar o que
 * quiser, e `status=qualquercoisa` não deve devolver uma lista vazia
 * inexplicável nem quebrar a página.
 */
export async function listarNoticias({
  busca = "",
  status = "",
  categoria = "",
  pagina = 1,
}: {
  busca?: string;
  status?: string;
  categoria?: string;
  pagina?: number;
}): Promise<Pagina<NoticiaDaLista>> {
  const onde = {
    ...(busca
      ? {
          OR: [
            { titulo: { contains: busca, mode: "insensitive" as const } },
            { resumo: { contains: busca, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(STATUS_NOTICIA.includes(status as StatusNoticia) ? { status } : {}),
    ...(CATEGORIAS_NOTICIA.includes(categoria as CategoriaNoticia)
      ? { categoria }
      : {}),
  };

  const total = await db.noticia.count({ where: onde });
  const recorte = recortar(pagina, total);

  const itens = await db.noticia.findMany({
    where: onde,
    select: CAMPOS_LISTA,
    orderBy: [{ publicadaEm: "desc" }, { criadoEm: "desc" }],
    skip: recorte.skip,
    take: recorte.take,
  });

  return montarPagina(itens as NoticiaDaLista[], total, recorte);
}

export async function buscarNoticia(id: string) {
  return db.noticia.findUnique({ where: { id } });
}

export type NoticiaPublica = {
  slug: string;
  titulo: string;
  resumo: string;
  categoria: CategoriaNoticia;
  publicadaEm: Date | null;
  destaque: boolean;
};

/**
 * O que o site público mostra no mural de notícias.
 *
 * O SQLite devolve `categoria` como texto solto. O estreitamento acontece
 * aqui, na fronteira do banco, e não em cada tela: os valores possíveis são
 * garantidos na escrita, por `noticiaSchema`.
 */
export async function noticiasPublicadas(
  limite?: number
): Promise<NoticiaPublica[]> {
  const linhas = await db.noticia.findMany({
    where: { status: "PUBLICADA", publicadaEm: { not: null } },
    select: {
      slug: true,
      titulo: true,
      resumo: true,
      categoria: true,
      publicadaEm: true,
      destaque: true,
    },
    orderBy: [{ destaque: "desc" }, { publicadaEm: "desc" }],
    ...(limite ? { take: limite } : {}),
  });

  return linhas as NoticiaPublica[];
}

/**
 * Data de publicação coerente com a situação escolhida.
 *
 * Publicar sem informar a data usa o momento atual; voltar para rascunho
 * limpa a data, para o site público não exibir algo "publicado ontem" que na
 * verdade saiu do ar.
 */
function resolverPublicacao(
  status: StatusNoticia,
  informada: Date | null,
  atual?: Date | null
): Date | null {
  if (status !== "PUBLICADA") return null;
  return informada ?? atual ?? new Date();
}

export async function criarNoticia(
  dados: z.infer<typeof noticiaSchema>,
  autorId: string
) {
  const slug = await slugUnico("noticia", dados.titulo);

  await db.noticia.create({
    data: {
      ...dados,
      slug,
      autorId,
      publicadaEm: resolverPublicacao(dados.status, dados.publicadaEm),
    },
  });
}

export async function atualizarNoticia({
  id,
  ...dados
}: z.infer<typeof noticiaEdicaoSchema>) {
  const atual = await db.noticia.findUnique({
    where: { id },
    select: { titulo: true, publicadaEm: true },
  });
  if (!atual) throw new ErroDeNegocio("Notícia não encontrada.");

  await db.noticia.update({
    where: { id },
    data: {
      ...dados,
      // Só recalcula o endereço se o título mudou: links já divulgados no
      // WhatsApp da comunidade continuam funcionando.
      ...(atual.titulo === dados.titulo
        ? {}
        : { slug: await slugUnico("noticia", dados.titulo, id) }),
      publicadaEm: resolverPublicacao(
        dados.status,
        dados.publicadaEm,
        atual.publicadaEm
      ),
    },
  });
}

export async function excluirNoticia(id: string) {
  await db.noticia.delete({ where: { id } });
}

export async function contarNoticias() {
  const [publicadas, rascunhos] = await Promise.all([
    db.noticia.count({ where: { status: "PUBLICADA" } }),
    db.noticia.count({ where: { status: "RASCUNHO" } }),
  ]);
  return { publicadas, rascunhos };
}
