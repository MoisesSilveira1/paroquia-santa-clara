import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "./cx";

/**
 * Rodapé de paginação de uma listagem.
 *
 * São links de verdade (`<a href>`), não botões com JavaScript: funcionam com
 * "abrir em nova aba", com o botão voltar e mesmo se o script falhar.
 */
export default function Paginacao({
  pagina,
  totalPaginas,
  total,
  porPagina,
  parametros,
  caminho,
}: {
  pagina: number;
  totalPaginas: number;
  /** Total de registros encontrados, para o texto "x–y de z". */
  total: number;
  /** Tamanho da página, usado no mesmo texto. */
  porPagina: number;
  /** Filtros atuais, preservados ao trocar de página. */
  parametros: Record<string, string | undefined>;
  caminho: string;
}) {
  if (total === 0) return null;

  function href(destino: number) {
    const consulta = new URLSearchParams();
    for (const [chave, valor] of Object.entries(parametros)) {
      if (valor) consulta.set(chave, valor);
    }
    if (destino > 1) consulta.set("pagina", String(destino));
    else consulta.delete("pagina");
    const texto = consulta.toString();
    return texto ? `${caminho}?${texto}` : caminho;
  }

  const primeiro = (pagina - 1) * porPagina + 1;
  const ultimo = Math.min(pagina * porPagina, total);

  const BASE =
    "inline-flex items-center gap-1 rounded-lg border border-borda px-3 py-1.5 text-sm font-medium transition-colors";

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-borda px-5 py-3"
    >
      <p className="text-sm text-texto-suave">
        Mostrando <strong className="text-texto">{primeiro}</strong>–
        <strong className="text-texto">{ultimo}</strong> de{" "}
        <strong className="text-texto">{total}</strong>
      </p>

      <div className="flex items-center gap-2">
        {pagina > 1 ? (
          <Link href={href(pagina - 1)} rel="prev" className={cx(BASE, "hover:bg-fundo-suave")}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Anterior
          </Link>
        ) : (
          <span aria-disabled className={cx(BASE, "opacity-40")}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Anterior
          </span>
        )}

        <span className="px-1 text-sm text-texto-suave">
          Página {pagina} de {totalPaginas}
        </span>

        {pagina < totalPaginas ? (
          <Link href={href(pagina + 1)} rel="next" className={cx(BASE, "hover:bg-fundo-suave")}>
            Próxima
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span aria-disabled className={cx(BASE, "opacity-40")}>
            Próxima
            <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
    </nav>
  );
}
