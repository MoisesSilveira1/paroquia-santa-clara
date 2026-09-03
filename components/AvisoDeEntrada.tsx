"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import type { AvisoEmCartaz } from "@/lib/servicos/aviso-paroquial";

/**
 * A janela que abre o site com o aviso paroquial.
 *
 * Usa o `<dialog>` nativo com `showModal()`, e não uma `<div>` por cima: é o
 * navegador que prende o foco dentro da janela, esconde o resto da página dos
 * leitores de tela e trava a rolagem do fundo. Reimplementar isso à mão é onde
 * modais costumam ficar inacessíveis — quem navega por teclado ou leitor de
 * tela continuaria "andando" pela página atrás do aviso.
 *
 * Aparece uma vez por aviso, não a cada visita. O pedido era que ninguém
 * deixasse de ver o comunicado; repeti-lo em toda página aberta não aumenta
 * quem viu, só irrita quem já leu. Editar o aviso muda a `versao`, e aí ele
 * volta a aparecer para todo mundo.
 */

const CHAVE = "aviso-paroquial-visto";

export default function AvisoDeEntrada({
  aviso,
  urlDoVideo,
}: {
  aviso: AvisoEmCartaz;
  /** Já conferida no servidor; aqui só entra num `src`. */
  urlDoVideo: string | null;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const marca = `${aviso.id}:${aviso.versao}`;

  // Quem manda em aberto/fechado é o próprio `<dialog>`, não um estado do
  // React. Guardar isso em `useState` obrigaria a ler o armazenamento durante
  // a renderização — o servidor não tem esse armazenamento, e a página piscaria
  // ao ser corrigida no navegador. Fechado, o `<dialog>` já não aparece.
  useEffect(() => {
    let visto: string | null = null;
    try {
      visto = window.localStorage.getItem(CHAVE);
    } catch {
      // Navegação anônima e navegador com dados bloqueados: sem memória, o
      // aviso aparece de novo. Preferível a não aparecer nunca.
    }
    if (visto !== marca) dialogo.current?.showModal();
  }, [marca]);

  /**
   * Anota que este aviso já foi visto.
   *
   * Vai no `onClose` do elemento, e não em cada botão: assim vale para todos
   * os caminhos de fechamento — o X, o botão do rodapé, o clique no fundo e o
   * Esc do navegador, que fecha sem passar por nenhum código nosso.
   */
  function lembrarQueViu() {
    try {
      window.localStorage.setItem(CHAVE, marca);
    } catch {
      // Sem memória: reaparece no próximo carregamento. Fechar continua
      // funcionando, que é o que importa agora.
    }
  }

  const fechar = () => dialogo.current?.close();

  return (
    <dialog
      ref={dialogo}
      onClose={lembrarQueViu}
      onClick={(evento) => {
        // Clique no fundo escuro fecha; clique dentro do conteúdo, não.
        if (evento.target === dialogo.current) fechar();
      }}
      aria-labelledby="titulo-do-aviso"
      className="m-auto w-[min(38rem,calc(100vw-2rem))] rounded-2xl border border-destaque-claro bg-white p-0 text-texto shadow-2xl backdrop:bg-principal-escuro/70 backdrop:backdrop-blur-sm"
    >
      <header className="flex items-start justify-between gap-3 rounded-t-2xl bg-principal px-5 py-4 text-fundo">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-destaque-claro">
            Aviso paroquial
          </p>
          <h2 id="titulo-do-aviso" className="mt-1 font-serif text-xl leading-snug">
            {aviso.titulo}
          </h2>
        </div>
        <button
          type="button"
          onClick={fechar}
          aria-label="Fechar aviso"
          className="-mr-1 -mt-1 shrink-0 rounded-lg p-2 transition-colors hover:bg-principal-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </header>

      <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
        {aviso.temImagem && (
          <Image
            src={`/imagens/aviso/${aviso.id}?v=${aviso.versao}`}
            alt=""
            width={1400}
            height={900}
            // `unoptimized` porque a imagem já sai do banco em WebP no tamanho
            // certo — passá-la pelo otimizador seria reconverter à toa.
            unoptimized
            className="mb-4 w-full rounded-lg object-contain"
          />
        )}

        {urlDoVideo && (
          <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              src={urlDoVideo}
              title={`Vídeo: ${aviso.titulo}`}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        )}

        {aviso.texto && (
          <div className="space-y-3 text-base leading-relaxed">
            {aviso.texto.split(/\n\s*\n/).map((paragrafo, indice) => (
              <p key={indice} className="whitespace-pre-line">
                {paragrafo}
              </p>
            ))}
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-fundo-suave bg-fundo px-5 py-3">
        <Link
          href="/aviso-paroquial"
          onClick={() => fechar()}
          className="text-sm text-principal underline underline-offset-2 hover:text-principal-escuro"
        >
          Ver esta página depois
        </Link>
        <button
          type="button"
          onClick={fechar}
          className="rounded-lg bg-destaque px-5 py-2.5 text-sm font-semibold text-texto transition-colors hover:bg-destaque-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-principal"
        >
          Entendi, continuar
        </button>
      </footer>
    </dialog>
  );
}
