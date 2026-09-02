import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { cx } from "./cx";

export type VarianteBotao = "primario" | "secundario" | "perigo" | "fantasma";
export type TamanhoBotao = "pequeno" | "medio";

const VARIANTES: Record<VarianteBotao, string> = {
  primario:
    "bg-principal text-white hover:bg-principal-escuro focus-visible:outline-principal",
  secundario:
    "border border-borda bg-superficie text-texto hover:bg-superficie-suave focus-visible:outline-principal",
  perigo:
    "border border-perigo/40 bg-perigo-suave text-perigo hover:bg-perigo hover:text-white focus-visible:outline-perigo",
  fantasma:
    "text-texto-suave hover:bg-fundo-suave hover:text-texto focus-visible:outline-principal",
};

const TAMANHOS: Record<TamanhoBotao, string> = {
  pequeno: "gap-1.5 px-2.5 py-1.5 text-xs",
  medio: "gap-2 px-4 py-2.5 text-sm",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  /** Ícone à esquerda do texto. Some enquanto `pendente` estiver ativo. */
  icone?: LucideIcon;
  /** Mostra o giro de carregando e bloqueia novos cliques. */
  pendente?: boolean;
  children?: ReactNode;
};

/**
 * Botão padrão do sistema.
 *
 * Não usa hooks de propósito: assim serve tanto em Server quanto em Client
 * Components. Quem precisa de estado de envio passa `pendente` (vindo do
 * `useActionState`, por exemplo).
 */
export default function Botao({
  variante = "primario",
  tamanho = "medio",
  icone: Icone,
  pendente = false,
  disabled,
  className,
  children,
  ...resto
}: Props) {
  return (
    <button
      {...resto}
      disabled={disabled || pendente}
      aria-busy={pendente || undefined}
      className={cx(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTES[variante],
        TAMANHOS[tamanho],
        className
      )}
    >
      {pendente ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        Icone && <Icone className="h-4 w-4" aria-hidden />
      )}
      {children}
    </button>
  );
}

/**
 * Botão só de ícone (editar, excluir, fechar).
 * `rotulo` vira o texto lido por leitores de tela e a dica do mouse — é
 * obrigatório porque sem ele o botão fica mudo para quem não vê o ícone.
 */
export function BotaoIcone({
  icone: Icone,
  rotulo,
  variante = "fantasma",
  className,
  ...resto
}: Omit<Props, "children" | "icone" | "tamanho"> & {
  icone: LucideIcon;
  rotulo: string;
}) {
  return (
    <button
      {...resto}
      title={rotulo}
      aria-label={rotulo}
      className={cx(
        "inline-flex items-center justify-center rounded-lg p-2 transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTES[variante],
        className
      )}
    >
      <Icone className="h-4 w-4" aria-hidden />
    </button>
  );
}
