import type { Metadata } from "next";
import Cartao, { CartaoCabecalho } from "@/components/ui/Cartao";
import BarraDeFiltros from "@/components/ui/BarraDeFiltros";
import SemPermissaoAviso from "@/components/admin/SemPermissaoAviso";
import { exigirSessao } from "@/lib/auth/guardas";
import { listarUsuarios } from "@/lib/servicos/usuarios";
import { listagemSchema } from "@/lib/validacao/esquemas";
import GerenciadorUsuarios from "./GerenciadorUsuarios";

export const metadata: Metadata = { title: "Usuários" };

export default async function PaginaUsuarios({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const eu = await exigirSessao();

  // A tela avisa em vez de estourar. Isto NÃO é a proteção: quem manda são as
  // checagens dentro de acoes.ts, que barram a requisição mesmo que alguém
  // chegue nela sem passar por aqui.
  if (eu.papel !== "SUPER_ADMIN") return <SemPermissaoAviso />;

  const filtros = listagemSchema.parse(await searchParams);

  // A equipe da paróquia cabe numa tela: sem paginação aqui.
  const usuarios = await listarUsuarios(filtros.busca);

  return (
    <Cartao>
      <CartaoCabecalho
        titulo="Usuários do painel"
        descricao="Quem pode entrar e o que cada pessoa pode fazer."
      />

      <BarraDeFiltros placeholder="Buscar por nome ou e-mail..." />

      <GerenciadorUsuarios itens={usuarios} meuId={eu.id} />
    </Cartao>
  );
}
