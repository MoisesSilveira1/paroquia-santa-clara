import { db } from "@/lib/db";

/**
 * Transforma um título no endereço da página.
 *
 * "Festa de São Francisco 2026" → "festa-de-sao-francisco-2026". A separação
 * de acentos (`NFD`) é o que permite remover o til e a cedilha sem perder a
 * letra que vem embaixo deles.
 */
export function paraSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Gera um slug que ainda não existe na tabela.
 *
 * Duas notícias podem legitimamente se chamar "Festa de Santa Clara" em anos
 * diferentes; a segunda vira "festa-de-santa-clara-2". `ignorarId` existe para
 * que editar uma notícia sem mudar o título não a faça colidir consigo mesma.
 */
export async function slugUnico(
  tabela: "noticia" | "pastoral",
  titulo: string,
  ignorarId?: string
): Promise<string> {
  const base = paraSlug(titulo) || "item";

  for (let sufixo = 0; ; sufixo++) {
    const candidato = sufixo === 0 ? base : `${base}-${sufixo + 1}`;

    const existente =
      tabela === "noticia"
        ? await db.noticia.findUnique({ where: { slug: candidato }, select: { id: true } })
        : await db.pastoral.findUnique({ where: { slug: candidato }, select: { id: true } });

    if (!existente || existente.id === ignorarId) return candidato;
  }
}
