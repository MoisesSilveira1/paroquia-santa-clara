"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { BotaoIcone } from "@/components/ui/Botao";

export const CHAVE_TEMA = "paroquia:tema-do-painel";
type Tema = "claro" | "escuro";

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
    var escuro = salvo
      ? salvo === "escuro"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    if (escuro) document.documentElement.dataset.tema = "escuro";
  } catch (e) {}
})();
`;

export default function AlternarTema() {
  const [tema, setTema] = useState<Tema>("claro");

  // Lê o que o script acima já aplicou, para o ícone nascer coerente.
  useEffect(() => {
    setTema(document.documentElement.dataset.tema === "escuro" ? "escuro" : "claro");
  }, []);

  // O tema escuro vale só dentro do painel: as páginas públicas ainda têm
  // fundos brancos fixos e ficariam ilegíveis. Ao sair do painel, desmarcamos.
  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.tema;
    };
  }, []);

  function alternar() {
    const proximo: Tema = tema === "escuro" ? "claro" : "escuro";
    setTema(proximo);

    if (proximo === "escuro") document.documentElement.dataset.tema = "escuro";
    else delete document.documentElement.dataset.tema;

    try {
      localStorage.setItem(CHAVE_TEMA, proximo);
    } catch {
      // Navegador com armazenamento bloqueado: o tema vale só nesta aba.
    }
  }

  return (
    <BotaoIcone
      icone={tema === "escuro" ? Sun : Moon}
      rotulo={tema === "escuro" ? "Usar tema claro" : "Usar tema escuro"}
      onClick={alternar}
    />
  );
}
