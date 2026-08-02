"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { CAMPO } from "@/components/ui/estilos";

export default function ContactForm() {
  const [enviado, setEnviado] = useState(false);

  if (enviado) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-xl border border-destaque-claro bg-white p-10 text-center shadow-sm"
      >
        <CheckCircle2 className="h-12 w-12 text-destaque" aria-hidden />
        <h3 className="text-xl text-principal-escuro">Mensagem recebida!</h3>
        <p className="text-sm text-texto-suave">
          Obrigado pelo contato. A secretaria responderá em breve. Paz e bem!
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4 rounded-xl border border-destaque-claro bg-white p-6 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        // Demonstração: integrar com e-mail/API da secretaria antes de publicar
        setEnviado(true);
      }}
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
        <select
          id="assunto"
          name="assunto"
          className={CAMPO}
        >
          <option>Dúvida geral</option>
          <option>Pedido de oração</option>
          <option>Sacramentos (Batismo, Matrimônio…)</option>
          <option>Dízimo e doações</option>
          <option>Pastorais e voluntariado</option>
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
          className={CAMPO}
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg bg-principal px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-principal-escuro"
      >
        <Send className="h-5 w-5" aria-hidden />
        Enviar mensagem
      </button>
    </form>
  );
}
