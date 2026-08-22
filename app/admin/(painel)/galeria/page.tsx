import type { Metadata } from "next";
import Cartao, { CartaoCabecalho } from "@/components/ui/Cartao";
import BarraDeFiltros from "@/components/ui/BarraDeFiltros";
import Paginacao from "@/components/ui/Paginacao";
import { exigirSessao } from "@/lib/auth/guardas";
import { db } from "@/lib/db";
import { listarAlbuns } from "@/lib/servicos/galeria";
import { listagemSchema } from "@/lib/validacao/esquemas";
import GerenciadorGaleria, { type FotoDoAlbum } from "./GerenciadorGaleria";

export const metadata: Metadata = { title: "Galeria" };

export default async function PaginaGaleria({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigirSessao();
  const filtros = listagemSchema.parse(await searchParams);

  const pagina = await listarAlbuns({
    busca: filtros.busca,
    pagina: filtros.pagina,
  });

  // Uma consulta só para as fotos de todos os álbuns da página, em vez de uma
  // por álbum: são no máximo dez linhas na tela.
  const fotos = await db.foto.findMany({
    where: { albumId: { in: pagina.itens.map((album) => album.id) } },
    select: { id: true, url: true, legenda: true, albumId: true },
    orderBy: { ordem: "asc" },
  });

  const fotosPorAlbum: Record<string, FotoDoAlbum[]> = {};
  for (const foto of fotos) {
    (fotosPorAlbum[foto.albumId] ??= []).push({
      id: foto.id,
      url: foto.url,
      legenda: foto.legenda,
    });
  }

  return (
    <Cartao>
      <CartaoCabecalho
        titulo="Galeria de fotos"
        descricao="Álbuns dos eventos da comunidade, exibidos na página Galeria."
      />

      <BarraDeFiltros placeholder="Buscar álbum pelo título..." />

      <GerenciadorGaleria
        itens={pagina.itens}
        fotosPorAlbum={fotosPorAlbum}
        temFiltro={Boolean(filtros.busca)}
      />

      <Paginacao
        pagina={pagina.pagina}
        totalPaginas={pagina.totalPaginas}
        total={pagina.total}
        porPagina={pagina.porPagina}
        caminho="/admin/galeria"
        parametros={{ busca: filtros.busca }}
      />
    </Cartao>
  );
}
