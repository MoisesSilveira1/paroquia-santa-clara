"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { cx } from "./cx";

export type Filtro = {
  /** Nome do parâmetro na URL (ex.: "status"). */
  chave: string;
  rotulo: string;
  opcoes: { valor: string; texto: string }[];
};

/**
 * Busca e filtros de uma listagem.
 *
 * O estado mora na URL, não no componente. Isso significa que uma busca pode
 * ser recarregada, favoritada ou enviada por mensagem para outra pessoa da
 * secretaria — e que o botão "voltar" do navegador desfaz o filtro, como se
 * espera. A consulta ao banco acontece no servidor, na própria página.
 */
export default function BarraDeFiltros({
  placeholder = "Buscar...",
  filtros = [],
}: {
  placeholder?: string;
  filtros?: Filtro[];
}) {
  const router = useRouter();
  const caminho = usePathname();
  const parametros = useSearchParams();
  const [pendente, iniciarTransicao] = useTransition();

  const buscaNaUrl = parametros.get("busca") ?? "";
  const [busca, setBusca] = useState(buscaNaUrl);
  const [urlConhecida, setUrlConhecida] = useState(buscaNaUrl);

  // Se a URL mudar por fora — botão voltar, clique num link, "Limpar" —, o
  // campo acompanha. O ajuste acontece durante a renderização, e não num
  // efeito: assim o React refaz o trabalho antes de pintar a tela, em vez de
  // mostrar o valor velho e corrigir logo depois.
  if (urlConhecida !== buscaNaUrl) {
    setUrlConhecida(buscaNaUrl);
    setBusca(buscaNaUrl);
  }

  function navegar(mudancas: Record<string, string>) {
    const proximos = new URLSearchParams(parametros);
    for (const [chave, valor] of Object.entries(mudancas)) {
      if (valor) proximos.set(chave, valor);
      else proximos.delete(chave);
    }
    // Qualquer busca ou filtro novo recomeça da primeira página: manter a
    // página 7 depois de filtrar quase sempre resulta em tela vazia.
    proximos.delete("pagina");

    const consulta = proximos.toString();
    iniciarTransicao(() => {
      router.replace(consulta ? `${caminho}?${consulta}` : caminho, {
        scroll: false,
      });
    });
  }

  // Espera o usuário parar de digitar antes de consultar o banco.
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  function aoDigitar(valor: string) {
    setBusca(valor);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => navegar({ busca: valor }), 300);
  }

  const temAlgumFiltro =
    buscaNaUrl !== "" || filtros.some((f) => parametros.get(f.chave));

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-borda px-5 py-3">
      <div className="relative min-w-0 flex-1 sm:min-w-64">
        {pendente ? (
          <Loader2
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 animate-spin text-destaque"
            aria-hidden
          />
        ) : (
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-texto-suave"
            aria-hidden
          />
        )}
        <input
          type="search"
          value={busca}
          onChange={(e) => aoDigitar(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={cx(
            "w-full rounded-lg border border-borda bg-superficie py-2 pr-3 pl-9 text-sm text-texto",
            "placeholder:text-texto-suave/70 outline-none",
            "focus:border-destaque focus:ring-2 focus:ring-destaque/40"
          )}
        />
      </div>

      {filtros.map((filtro) => (
        <select
          key={filtro.chave}
          aria-label={filtro.rotulo}
          value={parametros.get(filtro.chave) ?? ""}
          onChange={(e) => navegar({ [filtro.chave]: e.target.value })}
          className={cx(
            "rounded-lg border border-borda bg-superficie px-3 py-2 text-sm text-texto",
            "outline-none focus:border-destaque focus:ring-2 focus:ring-destaque/40"
          )}
        >
          <option value="">{filtro.rotulo}: todos</option>
          {filtro.opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
      ))}

      {temAlgumFiltro && (
        <button
          type="button"
          onClick={() =>
            navegar({
              busca: "",
              ...Object.fromEntries(filtros.map((f) => [f.chave, ""])),
            })
          }
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-texto-suave transition-colors hover:bg-fundo-suave hover:text-texto"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          Limpar
        </button>
      )}
    </div>
  );
}
