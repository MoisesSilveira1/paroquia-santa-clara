import { cx } from "./cx";
import { TOM_CLASSES, TOM_SOLIDO, type Tom } from "./tema";

/**
 * Selo de status: um rótulo curto e colorido ("Publicado", "Nova", "Oculto").
 *
 * O ponto colorido à esquerda existe para que o estado continue distinguível
 * por quem não diferencia as cores — a forma e o texto carregam a informação,
 * a cor só reforça.
 */
export default function Selo({
  tom = "neutro",
  ponto = true,
  children,
  className,
}: {
  tom?: Tom;
  ponto?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        TOM_CLASSES[tom],
        className
      )}
    >
      {ponto && (
        <span
          className={cx("h-1.5 w-1.5 shrink-0 rounded-full", TOM_SOLIDO[tom])}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
