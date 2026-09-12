import type { Metadata } from "next";
import Cartao, { CartaoCabecalho } from "@/components/ui/Cartao";
import SemPermissaoAviso from "@/components/admin/SemPermissaoAviso";
import { exigirSessao } from "@/lib/auth/guardas";
import { pode } from "@/lib/auth/papeis";
import {
  alcancaCatequese,
  configuracaoDaCatequese,
  listarInscricoes,
  listarTurmas,
} from "@/lib/servicos/catequese";
import { STATUS_INSCRICAO, type StatusInscricao } from "@/lib/validacao/esquemas";
import GerenciadorCatequese from "./GerenciadorCatequese";

export const metadata: Metadata = { title: "Catequese" };

export default async function PaginaCatequese({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const eu = await exigirSessao();
  const quem = { id: eu.id, papel: eu.papel };

  // Duas portas, e as duas dão na mesma sala. A primeira é a permissão de
  // papel; a segunda é o alcance, que só a consulta ao banco responde —
  // coordenador de OUTRA pastoral tem a permissão e não tem o alcance.
  //
  // A tela avisa; quem barra de verdade é o acoes.ts.
  if (!pode(eu.papel, "equipe.propria")) return <SemPermissaoAviso />;
  if (!(await alcancaCatequese(quem))) {
    return (
      <SemPermissaoAviso descricao="Esta área é da coordenação da catequese e da secretaria paroquial. Se você coordena a catequese e está vendo isto, peça à secretaria para ligar a sua conta à pastoral Catequese." />
    );
  }

  const filtros = await searchParams;
  const statusPedido = primeiro(filtros.status);
  const status = (STATUS_INSCRICAO as readonly string[]).includes(
    statusPedido ?? ""
  )
    ? (statusPedido as StatusInscricao)
    : undefined;
  const busca = (primeiro(filtros.busca) ?? "").trim().slice(0, 120);

  const [config, turmas, inscricoes] = await Promise.all([
    configuracaoDaCatequese(),
    listarTurmas(quem),
    listarInscricoes({ busca, status }, quem),
  ]);

  return (
    <Cartao>
      <CartaoCabecalho
        titulo="Catequese"
        descricao="Turmas, período de inscrição e os pedidos que chegam pelo site."
      />

      <GerenciadorCatequese
        config={config}
        turmas={turmas}
        inscricoes={inscricoes}
        busca={busca}
        status={status ?? ""}
        podeExcluirInscricao={pode(eu.papel, "coordenadores.excluir")}
      />
    </Cartao>
  );
}

/** A barra de endereços pode repetir um parâmetro; vale o primeiro. */
function primeiro(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}
