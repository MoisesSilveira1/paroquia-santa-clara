import type { Metadata } from "next";
import Cartao, { CartaoCabecalho } from "@/components/ui/Cartao";
import BarraDeFiltros from "@/components/ui/BarraDeFiltros";
import Paginacao from "@/components/ui/Paginacao";
import SemPermissaoAviso from "@/components/admin/SemPermissaoAviso";
import { exigirSessao } from "@/lib/auth/guardas";
import { pode } from "@/lib/auth/papeis";
import { listarPastorais } from "@/lib/servicos/pastorais";
import { listagemSchema } from "@/lib/validacao/esquemas";
import GerenciadorPastorais from "./GerenciadorPastorais";

export const metadata: Metadata = { title: "Pastorais" };

export default async function PaginaPastorais({
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
