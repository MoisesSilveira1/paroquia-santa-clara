import type { LucideIcon } from "lucide-react";
import { cx } from "./cx";
import { TOM_CLASSES, type Tom } from "./tema";

/** Superfície elevada: agrupa um bloco de conteúdo com borda e sombra leve. */
export default function Cartao({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cx(
        "rounded-xl border border-borda bg-superficie shadow-sm",
        className
      )}
    >
      {children}
    </section>
  );
}

/** Faixa de título do cartão, com espaço para ações à direita. */
export function CartaoCabecalho({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string;
  descricao?: string;
  acoes?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-borda px-5 py-4">
      <div>
        <h2 className="text-lg text-texto">{titulo}</h2>
        {descricao && (
          <p className="mt-0.5 text-sm text-texto-suave">{descricao}</p>
        )}
      </div>
      {acoes && <div className="flex items-center gap-2">{acoes}</div>}
    </header>
  );
}

/**
 * Número em destaque do painel inicial ("12 avisos ativos").
 *
 * O valor vem antes do rótulo na leitura visual, mas a marcação mantém o
 * rótulo primeiro para que leitores de tela anunciem o que o número significa.
 */
export function CartaoMetrica({
  rotulo,
  valor,
  icone: Icone,
  tom = "info",
  detalhe,
}: {
  rotulo: string;
  valor: number | string;
  icone: LucideIcon;
  tom?: Tom;
  detalhe?: string;
}) {
  return (
    <div className="rounded-xl border border-borda bg-superficie p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-texto-suave">{rotulo}</p>
        <span
          className={cx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            TOM_CLASSES[tom]
          )}
        >
          <Icone className="h-4.5 w-4.5" aria-hidden />
        </span>
      </div>
      <p className="mt-3 font-serif text-3xl text-texto">{valor}</p>
      {detalhe && <p className="mt-1 text-xs text-texto-suave">{detalhe}</p>}
    </div>
  );
}
