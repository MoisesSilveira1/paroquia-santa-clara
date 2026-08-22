"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { BotaoIcone } from "./Botao";

/**
 * Janela sobreposta para formulários e confirmações.
 *
 * Usa o elemento nativo `<dialog>` em vez de uma `<div>` posicionada: o
 * navegador já cuida de prender o foco dentro da janela, fechar no Esc e
 * esconder o resto da página dos leitores de tela. Reimplementar isso à mão é
 * onde modais costumam ficar inacessíveis.
 */
export default function Modal({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
  rodape,
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
  rodape?: React.ReactNode;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;

    if (aberto && !elemento.open) elemento.showModal();
    if (!aberto && elemento.open) elemento.close();
  }, [aberto]);

  if (!aberto) return null;

  return (
    <dialog
      ref={dialogo}
      // O Esc dispara `cancel`/`close` do próprio navegador; repassamos para o
      // estado de quem chamou não ficar dessincronizado da janela.
      onClose={aoFechar}
      onClick={(evento) => {
        // Clique no fundo escuro fecha; clique dentro do conteúdo, não.
        if (evento.target === dialogo.current) aoFechar();
      }}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl border border-borda bg-superficie p-0 text-texto shadow-xl backdrop:bg-black/50"
    >
      <header className="flex items-start justify-between gap-3 border-b border-borda px-5 py-4">
        <div>
          <h2 className="text-lg text-texto">{titulo}</h2>
          {descricao && (
            <p className="mt-0.5 text-sm text-texto-suave">{descricao}</p>
          )}
        </div>
        <BotaoIcone icone={X} rotulo="Fechar" onClick={aoFechar} />
      </header>

      <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>

      {rodape && (
        <footer className="flex flex-wrap justify-end gap-2 border-t border-borda bg-superficie-suave px-5 py-3">
          {rodape}
        </footer>
      )}
    </dialog>
  );
}
