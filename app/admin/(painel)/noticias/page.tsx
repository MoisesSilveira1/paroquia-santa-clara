import type { Metadata } from "next";
import Cartao, { CartaoCabecalho } from "@/components/ui/Cartao";
import BarraDeFiltros from "@/components/ui/BarraDeFiltros";
import Paginacao from "@/components/ui/Paginacao";
import { exigirSessao } from "@/lib/auth/guardas";
import { listarNoticias } from "@/lib/servicos/noticias";
import {
  CATEGORIAS_NOTICIA,
  ROTULO_CATEGORIA,
  ROTULO_STATUS_NOTICIA,
  STATUS_NOTICIA,
  listagemSchema,
} from "@/lib/validacao/esquemas";
import GerenciadorNoticias from "./GerenciadorNoticias";

export const metadata: Metadata = { title: "Notícias e eventos" };

export default async function PaginaNoticias({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigirSessao();
  const filtros = listagemSchema.parse(await searchParams);

  const pagina = await listarNoticias(filtros);

  return (
    <Cartao>
      <CartaoCabecalho
        titulo="Notícias e eventos"
        descricao="O mural da paróquia. Rascunhos ficam invisíveis para quem visita o site."
      />

      <BarraDeFiltros
        placeholder="Buscar por título ou resumo..."
        filtros={[
          {
            chave: "status",
            rotulo: "Situação",
            opcoes: STATUS_NOTICIA.map((s) => ({
              valor: s,
              texto: ROTULO_STATUS_NOTICIA[s],
            })),
          },
          {
            chave: "categoria",
            rotulo: "Categoria",
            opcoes: CATEGORIAS_NOTICIA.map((c) => ({
              valor: c,
              texto: ROTULO_CATEGORIA[c],
            })),
          },
        ]}
      />

      <GerenciadorNoticias
        itens={pagina.itens}
        temFiltro={Boolean(filtros.busca || filtros.status || filtros.categoria)}
      />

      <Paginacao
        pagina={pagina.pagina}
        totalPaginas={pagina.totalPaginas}
        total={pagina.total}
        porPagina={pagina.porPagina}
        caminho="/admin/noticias"
        parametros={{
          busca: filtros.busca,
          status: filtros.status,
          categoria: filtros.categoria,
        }}
      />
    </Cartao>
  );
}
