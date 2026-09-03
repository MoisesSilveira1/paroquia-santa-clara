import type { Metadata } from "next";
import Cartao, { CartaoCabecalho } from "@/components/ui/Cartao";
import SemPermissaoAviso from "@/components/admin/SemPermissaoAviso";
import { exigirSessao } from "@/lib/auth/guardas";
import { pode } from "@/lib/auth/papeis";
import { eventosNoIntervalo, equipesParaEscalar } from "@/lib/servicos/agenda";
import { pastoraisParaSelecao } from "@/lib/servicos/coordenadores";
import { partesNaParoquia } from "@/lib/agenda/fuso";
import {
  chaveDoDia,
  gradeDoMes,
  intervaloDaGrade,
  lerMes,
} from "@/lib/agenda/mes";
import Calendario from "./Calendario";

export const metadata: Metadata = { title: "Agenda" };

export default async function PaginaAgenda({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const eu = await exigirSessao();
  if (!pode(eu.papel, "agenda.propria")) return <SemPermissaoAviso />;

  const parametros = await searchParams;
  const mesPedido = parametros.mes;
  const mes = lerMes(typeof mesPedido === "string" ? mesPedido : undefined);

  const quem = { id: eu.id, papel: eu.papel };
  const { de, ate } = intervaloDaGrade(mes);

  const [eventos, pastorais, equipes] = await Promise.all([
    eventosNoIntervalo(quem, de, ate),
    pastoraisParaSelecao(quem),
    equipesParaEscalar(quem),
  ]);

  const daSecretaria = pode(eu.papel, "coordenadores.gerenciar");

  return (
    <Cartao>
      <CartaoCabecalho
        titulo="Agenda"
        descricao={
          daSecretaria
            ? "Reuniões e escalas de todas as pastorais."
            : "Reuniões e escalas da pastoral que você coordena."
        }
      />

      <Calendario
        mes={mes}
        // As datas atravessam para o navegador como texto: `Date` cru seria
        // reinterpretado no fuso de quem está lendo.
        dias={gradeDoMes(mes).map(chaveDoDia)}
        eventos={eventos}
        pastorais={pastorais}
        equipes={Object.fromEntries(equipes)}
        hojeIso={partesNaParoquia(new Date()).data}
      />
    </Cartao>
  );
}
