import type { Metadata } from "next";
import Cartao, { CartaoCabecalho } from "@/components/ui/Cartao";
import BarraDeFiltros from "@/components/ui/BarraDeFiltros";
import Paginacao from "@/components/ui/Paginacao";
import SemPermissaoAviso from "@/components/admin/SemPermissaoAviso";
import { exigirSessao } from "@/lib/auth/guardas";
import { pode } from "@/lib/auth/papeis";
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
  const eu = await exigirSessao();

  // O conteúdo do site é da secretaria. O coordenador de pastoral entra no
  // painel para cuidar da equipe dele, e não deve nem VER as mensagens dos
  // fiéis nem o resto — as ações já recusariam a gravação, mas leitura de
  // dado alheio também é acesso indevido.
  if (!pode(eu.papel, "conteudo.editar")) return <SemPermissaoAviso />;
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
