"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { BotaoIcone } from "@/components/ui/Botao";
import {
  usePreferenciaLocal,
  useSistemaPrefereEscuro,
} from "@/lib/preferencias";

export const CHAVE_TEMA = "paroquia:tema-do-painel";

/** "sistema" = acompanha a configuração do computador. */
const PADRAO = "sistema";

/**
 * Script que roda ANTES da primeira pintura da tela.
 *
 * Sem ele, quem escolheu o tema escuro vê um lampejo branco a cada
 * carregamento: o React só aplicaria a preferência depois de hidratar.
 * Fica como string porque precisa ser síncrono, antes do React existir.
 */
export const SCRIPT_TEMA_INICIAL = `
(function () {
  try {
    var salvo = localStorage.getItem(${JSON.stringify(CHAVE_TEMA)});
    var escuro = !salvo || salvo === "sistema"
      ? matchMedia("(prefers-color-scheme: dark)").matches
      : salvo === "escuro";
    if (escuro) document.documentElement.dataset.tema = "escuro";
  } catch (e) {}
})();
`;

export default function AlternarTema() {
  const [preferencia, definirPreferencia] = usePreferenciaLocal(
    CHAVE_TEMA,
    PADRAO
  );
  const sistemaEscuro = useSistemaPrefereEscuro();

  const escuro =
    preferencia === PADRAO ? sistemaEscuro : preferencia === "escuro";

  // Aqui o efeito está no seu lugar: sincroniza o React com algo de fora
  // dele — o atributo do <html> que a folha de estilos observa.
  //
  // A limpeza tira a marca ao sair do painel. O tema escuro vale só aqui: as
  // páginas públicas ainda têm fundos brancos fixos e ficariam ilegíveis.
  useEffect(() => {
    if (escuro) document.documentElement.dataset.tema = "escuro";
    else delete document.documentElement.dataset.tema;

    return () => {
      delete document.documentElement.dataset.tema;
    };
  }, [escuro]);

  return (
    <BotaoIcone
      icone={escuro ? Sun : Moon}
      rotulo={escuro ? "Usar tema claro" : "Usar tema escuro"}
      onClick={() => definirPreferencia(escuro ? "claro" : "escuro")}
    />
  );
}
