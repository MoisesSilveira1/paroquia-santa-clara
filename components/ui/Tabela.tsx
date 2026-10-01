import { cx } from "./cx";

/**
 * Tabela do painel.
 *
 * O invólucro rola na horizontal em vez de deixar a página inteira rolar:
 * numa tela de celular, uma tabela larga não pode empurrar o menu e o
 * cabeçalho para fora do lugar.
 */
export function Tabela({
  rotulo,
  children,
}: {
  /** Descrição da tabela para leitores de tela ("Lista de notícias"). */
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full overflow-x-auto">
      {/* A largura mínima é o que faz o invólucro rolar em vez de espremer as
          colunas: sem ela, numa tela média as células viram uma palavra por
          linha e a tabela fica ilegível. */}
      <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
        <caption className="sr-only">{rotulo}</caption>
        {children}
      </table>
    </div>
  );
}

export function TabelaCabecalho({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-borda bg-superficie-suave">
      <tr>{children}</tr>
    </thead>
  );
}

export function TabelaTitulo({
  children,
  alinhamento = "esquerda",
  className,
}: {
  children?: React.ReactNode;
  alinhamento?: "esquerda" | "direita";
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cx(
        "px-4 py-3 text-xs font-semibold tracking-wide text-texto-suave uppercase",
        alinhamento === "direita" && "text-right",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TabelaCorpo({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-borda">{children}</tbody>;
}

export function TabelaLinha({ children }: { children: React.ReactNode }) {
  return <tr className="transition-colors hover:bg-superficie-suave">{children}</tr>;
}

export function TabelaCelula({
  children,
  alinhamento = "esquerda",
  colunas,
  className,
}: {
  children?: React.ReactNode;
  alinhamento?: "esquerda" | "direita";
  /** Quantas colunas a célula ocupa — para linhas de detalhe que usam a
      largura inteira da tabela. */
  colunas?: number;
  className?: string;
}) {
  return (
    <td
      colSpan={colunas}
      className={cx(
        "px-4 py-3 align-middle text-texto",
        alinhamento === "direita" && "text-right",
        className
      )}
    >
      {children}
    </td>
  );
}

/** Linha única ocupando a tabela inteira — para o estado vazio. */
export function TabelaLinhaVazia({
  colunas,
  children,
}: {
  colunas: number;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colunas} className="p-0">
        {children}
      </td>
    </tr>
  );
}
