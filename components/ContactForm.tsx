"use client";

import { useState } from "react";
import { Send, CheckCircle2, Info, Loader2 } from "lucide-react";
import { CAMPO, TEXTO_ERRO } from "@/components/ui/estilos";
import { enviarMensagem } from "@/lib/contato/acoes";
import { ASSUNTOS, type ResultadoEnvio } from "@/lib/contato/tipos";
import { paroquia } from "@/lib/dados";

const CARTAO_RESPOSTA =
  "flex flex-col items-center gap-3 rounded-xl border border-destaque-claro bg-white p-10 text-center shadow-sm";

export default function ContactForm() {
  const [resultado, setResultado] = useState<ResultadoEnvio | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const campos = new FormData(evento.currentTarget);
    setEnviando(true);
    const resposta = await enviarMensagem({
      nome: String(campos.get("nome") ?? ""),
      email: String(campos.get("email") ?? ""),
      telefone: String(campos.get("telefone") ?? ""),
      assunto: String(campos.get("assunto") ?? ""),
      mensagem: String(campos.get("mensagem") ?? ""),
      confirmacao: String(campos.get("confirmacao") ?? ""),
    });
    setEnviando(false);
    setResultado(resposta);
  }

  if (resultado?.estado === "enviado") {
    return (
      <div role="status" className={CARTAO_RESPOSTA}>
        <CheckCircle2 className="h-12 w-12 text-destaque" aria-hidden />
        <h3 className="text-xl text-principal-escuro">Mensagem enviada!</h3>
        <p className="text-sm text-texto-suave">
          Obrigado pelo contato. A secretaria responderá em breve. Paz e bem!
        </p>
      </div>
    );
  }

  // Sem e-mail configurado ainda: avisamos em vez de fingir que enviamos.
  if (resultado?.estado === "demonstracao") {
    return (
      <div role="status" className={CARTAO_RESPOSTA}>
        <Info className="h-12 w-12 text-destaque" aria-hidden />
        <h3 className="text-xl text-principal-escuro">
          Formulário em demonstração
        </h3>
        <p className="text-sm text-texto-suave">
          O envio automático ainda será ativado. Enquanto isso, fale com a
          secretaria pelo WhatsApp ou pelo telefone {paroquia.telefone}.
        </p>
        <a
          href={`https://wa.me/${paroquia.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-2 rounded-lg bg-[#25d366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1eb855]"
        >
          Falar no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form
      className="space-y-4 rounded-xl border border-destaque-claro bg-white p-6 shadow-sm"
      onSubmit={aoEnviar}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className="mb-1 block text-sm font-medium">
            Nome completo
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            required
            autoComplete="name"
            className={CAMPO}
          />
        </div>
        <div>
          <label htmlFor="telefone" className="mb-1 block text-sm font-medium">
            Telefone / WhatsApp
          </label>
          <input
            id="telefone"
            name="telefone"
            type="tel"
            autoComplete="tel"
            className={CAMPO}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={CAMPO}
        />
      </div>

      <div>
        <label htmlFor="assunto" className="mb-1 block text-sm font-medium">
          Assunto
        </label>
        <select id="assunto" name="assunto" className={CAMPO}>
          {ASSUNTOS.map((assunto) => (
            <option key={assunto}>{assunto}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="mensagem" className="mb-1 block text-sm font-medium">
          Mensagem
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          rows={5}
          required
          minLength={10}
          className={CAMPO}
        />
      </div>

      {/* Campo isca contra robôs: invisível e ignorado por quem usa o site. */}
      <div aria-hidden className="hidden">
        <label htmlFor="confirmacao">Não preencha este campo</label>
        <input id="confirmacao" name="confirmacao" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {resultado?.estado === "erro" && (
        <p role="alert" className={TEXTO_ERRO}>
          {resultado.mensagem}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="inline-flex items-center gap-2 rounded-lg bg-principal px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-principal-escuro disabled:opacity-60"
      >
        {enviando ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : (
          <Send className="h-5 w-5" aria-hidden />
        )}
        {enviando ? "Enviando…" : "Enviar mensagem"}
      </button>
    </form>
  );
}
