"use client";

import { useId } from "react";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cx } from "./cx";

const CONTROLE =
  "w-full rounded-lg border border-borda bg-superficie px-3 py-2.5 text-base text-texto " +
  "placeholder:text-texto-suave/70 outline-none transition-colors " +
  "focus:border-destaque focus:ring-2 focus:ring-destaque/40 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const CONTROLE_INVALIDO = "border-perigo focus:border-perigo focus:ring-perigo/30";

type Comuns = {
  rotulo: string;
  /** Texto de apoio abaixo do campo (formato esperado, limite, etc.). */
  dica?: string;
  /** Mensagem de validação. Presente = campo em estado de erro. */
  erro?: string;
};

/**
 * Envelope compartilhado por todos os campos: rótulo, dica e erro.
 *
 * Amarra tudo pelos atributos `aria-describedby` / `aria-invalid`, para que
 * quem usa leitor de tela ouça a dica e o erro junto com o campo, em vez de
 * encontrar um texto solto perdido na página.
 */
function Envelope({
  id,
  rotulo,
  dica,
  erro,
  obrigatorio,
  children,
}: Comuns & {
  id: string;
  obrigatorio?: boolean;
  children: (aria: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: true;
  }) => React.ReactNode;
}) {
  const idDica = `${id}-dica`;
  const idErro = `${id}-erro`;
  const descricao = [dica && idDica, erro && idErro].filter(Boolean).join(" ");

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-texto">
        {rotulo}
        {obrigatorio && (
          <span className="ml-0.5 text-perigo" aria-hidden>
            *
          </span>
        )}
      </label>

      {children({
        id,
        "aria-describedby": descricao || undefined,
        "aria-invalid": erro ? true : undefined,
      })}

      {dica && (
        <p id={idDica} className="text-xs text-texto-suave">
          {dica}
        </p>
      )}
      {erro && (
        <p id={idErro} role="alert" className="text-sm font-medium text-perigo">
          {erro}
        </p>
      )}
    </div>
  );
}

export function CampoTexto({
  rotulo,
  dica,
  erro,
  className,
  ...resto
}: Comuns & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Envelope
      id={resto.id ?? id}
      rotulo={rotulo}
      dica={dica}
      erro={erro}
      obrigatorio={resto.required}
    >
      {(aria) => (
        <input
          {...resto}
          {...aria}
          className={cx(CONTROLE, erro && CONTROLE_INVALIDO, className)}
        />
      )}
    </Envelope>
  );
}

export function CampoArea({
  rotulo,
  dica,
  erro,
  className,
  rows = 4,
  ...resto
}: Comuns & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Envelope
      id={resto.id ?? id}
      rotulo={rotulo}
      dica={dica}
      erro={erro}
      obrigatorio={resto.required}
    >
      {(aria) => (
        <textarea
          {...resto}
          {...aria}
          rows={rows}
          className={cx(CONTROLE, "resize-y", erro && CONTROLE_INVALIDO, className)}
        />
      )}
    </Envelope>
  );
}

export function CampoSelecao({
  rotulo,
  dica,
  erro,
  opcoes,
  className,
  ...resto
}: Comuns &
  SelectHTMLAttributes<HTMLSelectElement> & {
    opcoes: { valor: string; texto: string }[];
  }) {
  const id = useId();
  return (
    <Envelope
      id={resto.id ?? id}
      rotulo={rotulo}
      dica={dica}
      erro={erro}
      obrigatorio={resto.required}
    >
      {(aria) => (
        <select
          {...resto}
          {...aria}
          className={cx(CONTROLE, "pr-8", erro && CONTROLE_INVALIDO, className)}
        >
          {opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
      )}
    </Envelope>
  );
}

/** Caixa de marcar, com o rótulo clicável ao lado. */
export function CampoBooleano({
  rotulo,
  dica,
  className,
  ...resto
}: Omit<Comuns, "erro"> & InputHTMLAttributes<HTMLInputElement>) {
  const gerado = useId();
  const id = resto.id ?? gerado;
  return (
    <div className="flex items-start gap-2.5">
      <input
        {...resto}
        id={id}
        type="checkbox"
        className={cx(
          "mt-0.5 h-4 w-4 shrink-0 rounded border-borda text-principal accent-principal",
          className
        )}
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-texto">
          {rotulo}
        </label>
        {dica && <p className="text-xs text-texto-suave">{dica}</p>}
      </div>
    </div>
  );
}
