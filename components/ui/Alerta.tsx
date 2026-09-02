import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cx } from "./cx";
import { TOM_CLASSES, type Tom } from "./tema";

const ICONES = {
  sucesso: CheckCircle2,
  atencao: AlertTriangle,
  info: Info,
  perigo: XCircle,
  neutro: Info,
} as const;

/**
 * Recado curto sobre o que acabou de acontecer ou sobre o estado da tela.
 *
 * `role="alert"` faz o leitor de tela anunciar a mensagem assim que ela
 * aparece — sem isso, quem não está olhando para aquele ponto da página não
 * fica sabendo que a ação deu certo.
 */
export default function Alerta({
  tom = "info",
  children,
  className,
}: {
  tom?: Tom;
  children: React.ReactNode;
  className?: string;
}) {
  const Icone = ICONES[tom];

  return (
    <p
      role="alert"
      className={cx(
        "flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
        TOM_CLASSES[tom],
        className
      )}
    >
      <Icone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
