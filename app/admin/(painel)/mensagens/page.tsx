import type { Metadata } from "next";
import Cartao, { CartaoCabecalho } from "@/components/ui/Cartao";
import BarraDeFiltros from "@/components/ui/BarraDeFiltros";
import Paginacao from "@/components/ui/Paginacao";
import { exigirSessao } from "@/lib/auth/guardas";
import { listarMensagens } from "@/lib/servicos/mensagens";
import {
  ROTULO_STATUS_MENSAGEM,
  STATUS_MENSAGEM,
  listagemSchema,
} from "@/lib/validacao/esquemas";
import ListaMensagens from "./ListaMensagens";

export const metadata: Metadata = { title: "Mensagens" };

export default async function PaginaMensagens({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigirSessao();
  const filtros = listagemSchema.parse(await searchParams);

  const pagina = await listarMensagens(filtros);

  return (
    <Cartao>
      <CartaoCabecalho
        titulo="Mensagens"
        descricao="Recebidas pelo formulário de contato do site."
      />

      <BarraDeFiltros
        placeholder="Buscar por nome, e-mail ou assunto..."
        filtros={[
          {
            chave: "status",
            rotulo: "Situação",
            opcoes: STATUS_MENSAGEM.map((s) => ({
              valor: s,
              texto: ROTULO_STATUS_MENSAGEM[s],
            })),
          },
        ]}
      />

      <ListaMensagens
        itens={pagina.itens}
        temFiltro={Boolean(filtros.busca || filtros.status)}
      />

      <Paginacao
        pagina={pagina.pagina}
        totalPaginas={pagina.totalPaginas}
        total={pagina.total}
        porPagina={pagina.porPagina}
        caminho="/admin/mensagens"
        parametros={{ busca: filtros.busca, status: filtros.status }}
      />
    </Cartao>
  );
}
