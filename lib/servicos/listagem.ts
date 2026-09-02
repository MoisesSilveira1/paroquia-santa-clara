import { POR_PAGINA } from "@/lib/validacao/esquemas";

/** Uma página de resultados, com o que a tela precisa para paginar. */
export type Pagina<T> = {
  itens: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
  porPagina: number;
};

/**
 * Converte "página 3" no `skip`/`take` do Prisma.
 *
 * Recebe o total para não devolver uma página vazia quando o usuário está na
 * página 5 e um filtro reduz o resultado a 12 itens — nesse caso ele volta
 * para a última página que ainda tem conteúdo.
 */
export function recortar(paginaPedida: number, total: number, porPagina = POR_PAGINA) {
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const pagina = Math.min(Math.max(1, paginaPedida), totalPaginas);

  return {
    pagina,
    totalPaginas,
    porPagina,
    skip: (pagina - 1) * porPagina,
    take: porPagina,
  };
}

export function montarPagina<T>(
  itens: T[],
  total: number,
  recorte: ReturnType<typeof recortar>
): Pagina<T> {
  return {
    itens,
    total,
    pagina: recorte.pagina,
    totalPaginas: recorte.totalPaginas,
    porPagina: recorte.porPagina,
  };
}

/**
 * Trecho de busca para o Prisma sobre SQLite.
 *
 * O SQLite compara texto sem diferenciar maiúsculas apenas em caracteres
 * ASCII, e o Prisma não expõe `mode: "insensitive"` para este provider. Na
 * prática isso significa que buscar "Sao" não acha "São" — aceitável para o
 * volume desta paróquia, e resolvido de vez ao migrar para Postgres.
 */
export function contem(campo: string, busca: string) {
  return busca ? { [campo]: { contains: busca } } : {};
}
