import type { Metadata } from "next";
import Cartao, { CartaoCabecalho } from "@/components/ui/Cartao";
import BarraDeFiltros from "@/components/ui/BarraDeFiltros";
import Paginacao from "@/components/ui/Paginacao";
import { exigirSessao } from "@/lib/auth/guardas";
import { listarCelebracoes } from "@/lib/servicos/celebracoes";
import { DIAS_DA_SEMANA, listagemSchema } from "@/lib/validacao/esquemas";
import GerenciadorCelebracoes from "./GerenciadorCelebracoes";

export const metadata: Metadata = { title: "Horários" };

export default async function PaginaCelebracoes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigirSessao();
  const filtros = listagemSchema.parse(await searchParams);

  // O filtro de dia reaproveita o parâmetro "status" da barra genérica; aqui
  // ele carrega o índice do dia da semana.
  const dia = Number(filtros.status);
  const diaSemana =
    filtros.status !== "" && Number.isInteger(dia) && dia >= 0 && dia <= 6
      ? dia
      : undefined;

  const pagina = await listarCelebracoes({
    busca: filtros.busca,
    diaSemana,
    pagina: filtros.pagina,
  });

  return (
    <Cartao>
      <CartaoCabecalho
        titulo="Horários das celebrações"
        descricao="Monta a grade da semana exibida na página inicial e em Horários."
      />

      <BarraDeFiltros
        placeholder="Buscar por celebração ou local..."
        filtros={[
          {
            chave: "status",
            rotulo: "Dia",
            opcoes: DIAS_DA_SEMANA.map((nome, indice) => ({
              valor: String(indice),
              texto: nome,
            })),
          },
        ]}
      />

      <GerenciadorCelebracoes
        itens={pagina.itens}
        temFiltro={Boolean(filtros.busca || filtros.status)}
      />

      <Paginacao
        pagina={pagina.pagina}
        totalPaginas={pagina.totalPaginas}
        total={pagina.total}
        porPagina={pagina.porPagina}
        caminho="/admin/celebracoes"
        parametros={{ busca: filtros.busca, status: filtros.status }}
      />
    </Cartao>
  );
}
