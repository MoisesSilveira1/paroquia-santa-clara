import type { Metadata } from "next";
import Cartao, { CartaoCabecalho } from "@/components/ui/Cartao";
import BarraDeFiltros from "@/components/ui/BarraDeFiltros";
import Paginacao from "@/components/ui/Paginacao";
import { exigirSessao } from "@/lib/auth/guardas";
import { listarPastorais } from "@/lib/servicos/pastorais";
import { listagemSchema } from "@/lib/validacao/esquemas";
import GerenciadorPastorais from "./GerenciadorPastorais";

export const metadata: Metadata = { title: "Pastorais" };

export default async function PaginaPastorais({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigirSessao();
  const filtros = listagemSchema.parse(await searchParams);

  const pagina = await listarPastorais({
    busca: filtros.busca,
    ativa:
      filtros.status === "ativas"
        ? true
        : filtros.status === "ocultas"
          ? false
          : undefined,
    pagina: filtros.pagina,
  });

  return (
    <Cartao>
      <CartaoCabecalho
        titulo="Pastorais e movimentos"
        descricao="Os grupos de serviço da comunidade, com contato e horário de reunião."
      />

      <BarraDeFiltros
        placeholder="Buscar por nome ou descrição..."
        filtros={[
          {
            chave: "status",
            rotulo: "Situação",
            opcoes: [
              { valor: "ativas", texto: "No site" },
              { valor: "ocultas", texto: "Ocultas" },
            ],
          },
        ]}
      />

      <GerenciadorPastorais
        itens={pagina.itens}
        temFiltro={Boolean(filtros.busca || filtros.status)}
      />

      <Paginacao
        pagina={pagina.pagina}
        totalPaginas={pagina.totalPaginas}
        total={pagina.total}
        porPagina={pagina.porPagina}
        caminho="/admin/pastorais"
        parametros={{ busca: filtros.busca, status: filtros.status }}
      />
    </Cartao>
  );
}
