import type { Metadata } from "next";
import Cartao, { CartaoCabecalho } from "@/components/ui/Cartao";
import BarraDeFiltros from "@/components/ui/BarraDeFiltros";
import Paginacao from "@/components/ui/Paginacao";
import SemPermissaoAviso from "@/components/admin/SemPermissaoAviso";
import { exigirSessao } from "@/lib/auth/guardas";
import { pode } from "@/lib/auth/papeis";
import {
  contasParaVincular,
  listarCoordenadores,
  pastoraisParaSelecao,
} from "@/lib/servicos/coordenadores";
import { listagemSchema } from "@/lib/validacao/esquemas";
import GerenciadorCoordenadores from "./GerenciadorCoordenadores";

export const metadata: Metadata = { title: "Coordenadores" };

export default async function PaginaCoordenadores({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const eu = await exigirSessao();

  // A tela avisa em vez de estourar. Isto NÃO é a proteção: quem manda são as
  // checagens dentro de acoes.ts.
  if (!pode(eu.papel, "equipe.propria")) return <SemPermissaoAviso />;

  const filtros = listagemSchema.parse(await searchParams);
  const quem = { id: eu.id, papel: eu.papel };

  // Para o coordenador, `pastorais` já vem só com a dele — é o que limita o
  // seletor do formulário e o filtro da barra.
  const podeVincular = pode(eu.papel, "coordenadores.gerenciar");
  const [pastorais, contas] = await Promise.all([
    pastoraisParaSelecao(quem),
    podeVincular ? contasParaVincular() : Promise.resolve([]),
  ]);

  // O filtro por pastoral chega pela barra de endereços como texto qualquer;
  // só vale se corresponder a uma pastoral que existe.
  const pastoralId = pastorais.some((p) => p.id === filtros.status)
    ? filtros.status
    : undefined;

  const pagina = await listarCoordenadores({
    busca: filtros.busca,
    pastoralId,
    pagina: filtros.pagina,
    quem,
  });

  return (
    <Cartao>
      <CartaoCabecalho
        titulo={podeVincular ? "Coordenadores e equipes" : "Minha equipe"}
        descricao={
          podeVincular
            ? "Quem responde por cada pastoral e quem serve nela. Aparece na página da pastoral no site."
            : "Quem serve na pastoral que você coordena. Aparece na página dela no site."
        }
      />

      <BarraDeFiltros
        placeholder="Buscar por nome, função ou pastoral..."
        filtros={[
          {
            chave: "status",
            rotulo: "Coordenação",
            opcoes: pastorais.map((p) => ({ valor: p.id, texto: p.nome })),
          },
        ]}
      />

      <GerenciadorCoordenadores
        itens={pagina.itens}
        pastorais={pastorais}
        contas={contas}
        podeVincular={podeVincular}
        podeExcluir={pode(eu.papel, "coordenadores.excluir")}
        temFiltro={Boolean(filtros.busca || pastoralId)}
      />

      <Paginacao
        pagina={pagina.pagina}
        totalPaginas={pagina.totalPaginas}
        total={pagina.total}
        porPagina={pagina.porPagina}
        caminho="/admin/coordenadores"
        parametros={{ busca: filtros.busca, status: filtros.status }}
      />
    </Cartao>
  );
}
