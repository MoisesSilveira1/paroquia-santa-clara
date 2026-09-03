import type { Metadata } from "next";
import Cartao, { CartaoCabecalho } from "@/components/ui/Cartao";
import BarraDeFiltros from "@/components/ui/BarraDeFiltros";
import Paginacao from "@/components/ui/Paginacao";
import SemPermissaoAviso from "@/components/admin/SemPermissaoAviso";
import { exigirSessao } from "@/lib/auth/guardas";
import { pode } from "@/lib/auth/papeis";
import { listarAvisos } from "@/lib/servicos/avisos";
import { listagemSchema } from "@/lib/validacao/esquemas";
import GerenciadorAvisos from "./GerenciadorAvisos";

export const metadata: Metadata = { title: "Avisos da semana" };

export default async function PaginaAvisos({
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

  // O que vem da barra de endereços é digitado por qualquer um: passa pelo
  // mesmo tratamento dos formulários antes de virar consulta.
  const filtros = listagemSchema.parse(await searchParams);

  const pagina = await listarAvisos({
    busca: filtros.busca,
    ativo:
      filtros.status === "ativos"
        ? true
        : filtros.status === "ocultos"
          ? false
          : undefined,
    pagina: filtros.pagina,
  });

  return (
    <Cartao>
      <CartaoCabecalho
        titulo="Avisos da semana"
        descricao="Aparecem na página inicial do site, abaixo dos horários."
      />

      <BarraDeFiltros
        placeholder="Buscar no texto dos avisos..."
        filtros={[
          {
            chave: "status",
            rotulo: "Situação",
            opcoes: [
              { valor: "ativos", texto: "No site" },
              { valor: "ocultos", texto: "Ocultos" },
            ],
          },
        ]}
      />

      <GerenciadorAvisos
        itens={pagina.itens}
        temFiltro={Boolean(filtros.busca || filtros.status)}
      />

      <Paginacao
        pagina={pagina.pagina}
        totalPaginas={pagina.totalPaginas}
        total={pagina.total}
        porPagina={pagina.porPagina}
        caminho="/admin/avisos"
        parametros={{ busca: filtros.busca, status: filtros.status }}
      />
    </Cartao>
  );
}
