"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { cx } from "@/components/ui/cx";
import { BotaoIcone } from "@/components/ui/Botao";
import { itemAtivo, type ItemDeMenu } from "./navegacao";

export default function BarraLateral({
  itens,
  recolhida,
  aoAlternarRecolher,
  gavetaAberta,
  aoFecharGaveta,
}: {
  itens: ItemDeMenu[];
  recolhida: boolean;
  aoAlternarRecolher: () => void;
  gavetaAberta: boolean;
  aoFecharGaveta: () => void;
}) {
  const caminho = usePathname();
  const ativo = itemAtivo(caminho, itens);

  return (
    <>
      {/* Fundo escuro do menu deslizante no celular. */}
      {gavetaAberta && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={aoFecharGaveta}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-borda bg-superficie",
          "transition-[width,transform] duration-200 ease-out",
          // No celular o menu desliza por cima; a partir de `lg` ele fica fixo
          // ao lado do conteúdo e apenas encolhe.
          gavetaAberta ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          recolhida ? "w-16" : "w-64"
        )}
      >
        <div
          className={cx(
            "flex h-16 shrink-0 items-center gap-2 border-b border-borda px-3",
            recolhida ? "justify-center" : "justify-between"
          )}
        >
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5"
            title="Ver o site da paróquia"
          >
            {/* Aqui é o ESCUDO, e não o brasão completo como no rodapé: a 32
                px a cruz e a fita do brasão inteiro somem, e sobra um borrão.
                O escudo sozinho ainda guarda a silhueta reconhecível.

                As medidas declaradas são as do arquivo (480x542) — declarar
                32x32 anunciava uma proporção que o desenho não tem. Quem
                define o tamanho na tela é o CSS. */}
            <Image
              src="/fotos/brasao-escudo.webp"
              alt=""
              width={480}
              height={542}
              sizes="32px"
              className="h-8 w-auto shrink-0"
            />
            {!recolhida && (
              <span className="truncate font-serif text-sm leading-tight text-texto">
                Santa Clara
                <span className="block text-xs text-texto-suave">
                  Painel da secretaria
                </span>
              </span>
            )}
          </Link>

          {!recolhida && (
            <BotaoIcone
              icone={X}
              rotulo="Fechar menu"
              onClick={aoFecharGaveta}
              className="lg:hidden"
            />
          )}
        </div>

        <nav
          aria-label="Seções do painel"
          className="flex-1 overflow-y-auto p-2"
        >
          <ul className="space-y-1">
            {itens.map((item) => {
              const estaAtivo = item === ativo;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={aoFecharGaveta}
                    aria-current={estaAtivo ? "page" : undefined}
                    title={recolhida ? item.rotulo : undefined}
                    className={cx(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      recolhida && "justify-center px-0",
                      estaAtivo
                        ? "bg-principal text-white"
                        : "text-texto-suave hover:bg-fundo-suave hover:text-texto"
                    )}
                  >
                    <item.icone className="h-4.5 w-4.5 shrink-0" aria-hidden />
                    {recolhida ? (
                      <span className="sr-only">{item.rotulo}</span>
                    ) : (
                      <span className="truncate">{item.rotulo}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Recolher só faz sentido onde a barra é fixa — no celular ela some. */}
        <div className="hidden shrink-0 border-t border-borda p-2 lg:block">
          <button
            type="button"
            onClick={aoAlternarRecolher}
            aria-expanded={!recolhida}
            className={cx(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
              "text-texto-suave transition-colors hover:bg-fundo-suave hover:text-texto",
              recolhida && "justify-center px-0"
            )}
          >
            {recolhida ? (
              <PanelLeftOpen className="h-4.5 w-4.5" aria-hidden />
            ) : (
              <PanelLeftClose className="h-4.5 w-4.5" aria-hidden />
            )}
            {recolhida ? (
              <span className="sr-only">Expandir menu</span>
            ) : (
              <span>Recolher menu</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
