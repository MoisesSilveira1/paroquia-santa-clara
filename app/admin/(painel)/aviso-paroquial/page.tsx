import type { Metadata } from "next";
import Cartao, { CartaoCabecalho } from "@/components/ui/Cartao";
import SemPermissaoAviso from "@/components/admin/SemPermissaoAviso";
import { exigirSessao } from "@/lib/auth/guardas";
import { pode } from "@/lib/auth/papeis";
import { listarAvisosParoquiais } from "@/lib/servicos/aviso-paroquial";
import GerenciadorAvisoParoquial from "./GerenciadorAvisoParoquial";

export const metadata: Metadata = { title: "Aviso paroquial" };

export default async function PaginaAvisoParoquial() {
  const eu = await exigirSessao();
  if (!pode(eu.papel, "conteudo.editar")) return <SemPermissaoAviso />;

  // Sem busca nem paginação: são poucos avisos, e todos cabem numa tela.
  const itens = await listarAvisosParoquiais();

  return (
    <Cartao>
      <CartaoCabecalho
        titulo="Aviso paroquial"
        descricao="A janela que abre o site. Diferente dos avisos da semana, que aparecem em lista na página inicial."
      />

      <GerenciadorAvisoParoquial
        itens={itens}
        podeExcluir={pode(eu.papel, "conteudo.excluir")}
      />
    </Cartao>
  );
}
