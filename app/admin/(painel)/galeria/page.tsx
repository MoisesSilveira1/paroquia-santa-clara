import type { Metadata } from "next";
import Cartao, { CartaoCabecalho } from "@/components/ui/Cartao";
import BarraDeFiltros from "@/components/ui/BarraDeFiltros";
import Paginacao from "@/components/ui/Paginacao";
import SemPermissaoAviso from "@/components/admin/SemPermissaoAviso";
import { exigirSessao } from "@/lib/auth/guardas";
import { pode } from "@/lib/auth/papeis";
import { fotosDosAlbuns, listarAlbuns } from "@/lib/servicos/galeria";
import { listagemSchema } from "@/lib/validacao/esquemas";
import GerenciadorGaleria from "./GerenciadorGaleria";

export const metadata: Metadata = { title: "Galeria" };

export default async function PaginaGaleria({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const eu = await exigirSessao();

  // O conteúdo do site é da secretaria. O coordenador de pastoral entra no
  // painel para cuidar da equipe dele, e não deve nem VER as mensagens dos
  // fiéis nem o resto — as ações já recusariam a gravação, mas leitura de
  // dado alheio também é acesso indevido.
  if (!pode(eu.papel, "conteudo.editar")) return <SemPermissaoAviso />;
  const filtros = listagemSchema.parse(await searchParams);

  const pagina = await listarAlbuns({
    busca: filtros.busca,
    pagina: filtros.pagina,
  });

  const fotosPorAlbum = await fotosDosAlbuns(
    pagina.itens.map((album) => album.id)
  );

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
