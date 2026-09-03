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
 * Trecho de busca por texto para o Prisma.
 *
 * `mode: "insensitive"` vira um ILIKE no Postgres, então "pascom" acha
 * "PASCOM". O acento continua pesando — "gracas" não acha "Graças" —, porque
 * ignorá-lo exigiria a extensão `unaccent` no banco. Fica assim enquanto o
 * volume da paróquia não justificar a migração extra.
 */
export function contem(campo: string, busca: string) {
  return busca
    ? { [campo]: { contains: busca, mode: "insensitive" as const } }
    : {};
}
