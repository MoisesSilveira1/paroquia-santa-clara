"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Preferências de quem usa o painel, guardadas no navegador.
 *
 * O caminho ingênuo — `useState` mais um `useEffect` que lê o
 * `localStorage` — renderiza uma vez com o valor errado e corrige na
 * sequência, o que pisca e dispara renderizações em cascata.
 * `useSyncExternalStore` existe justamente para ler estado que mora fora do
 * React: ele entrega um valor estável na renderização do servidor e troca
 * para o valor real quando o navegador assume, sem passo intermediário.
 */

const ouvintes = new Set<() => void>();

function avisarTodos() {
  for (const ouvinte of ouvintes) ouvinte();
}

function inscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  // `storage` avisa quando a preferência muda em OUTRA aba — duas abas do
  // painel abertas não devem discordar sobre o tema.
  window.addEventListener("storage", ouvinte);

  return () => {
    ouvintes.delete(ouvinte);
    window.removeEventListener("storage", ouvinte);
  };
}

/** Lê e grava uma preferência de texto, mantendo todas as abas em acordo. */
export function usePreferenciaLocal(chave: string, padrao: string) {
  const valor = useSyncExternalStore(
    inscrever,
    () => {
      try {
        return localStorage.getItem(chave) ?? padrao;
      } catch {
        // Navegador com armazenamento bloqueado (janela anônima, por exemplo).
        return padrao;
      }
    },
    // No servidor não existe navegador: devolve o padrão para o HTML sair
    // sempre igual.
    () => padrao
  );

  const definir = useCallback(
    (novo: string) => {
      try {
        localStorage.setItem(chave, novo);
      } catch {
        // Sem armazenamento, a escolha vale só enquanto a aba estiver aberta.
      }
      avisarTodos();
    },
    [chave]
  );

  return [valor, definir] as const;
}

/** Acompanha o tema do sistema operacional (claro ou escuro). */
export function useSistemaPrefereEscuro(): boolean {
  return useSyncExternalStore(
    (ouvinte) => {
      const consulta = window.matchMedia("(prefers-color-scheme: dark)");
      consulta.addEventListener("change", ouvinte);
      return () => consulta.removeEventListener("change", ouvinte);
    },
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false
  );
}
