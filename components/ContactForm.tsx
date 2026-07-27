"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [enviado, setEnviado] = useState(false);

  if (enviado) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-xl border border-dourado-claro bg-white p-10 text-center shadow-sm"
      >
        <CheckCircle2 className="h-12 w-12 text-dourado" aria-hidden />
        <h3 className="text-xl text-terracota-escuro">Mensagem recebida!</h3>
        <p className="text-sm text-marrom-claro">
          Obrigado pelo contato. A secretaria responderá em breve. Paz e bem!
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4 rounded-xl border border-dourado-claro bg-white p-6 shadow-sm"
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
            className="w-full rounded-lg border border-creme-escuro bg-creme px-3 py-2.5 text-base outline-none focus:border-dourado focus:ring-2 focus:ring-dourado/40"
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
            className="w-full rounded-lg border border-creme-escuro bg-creme px-3 py-2.5 text-base outline-none focus:border-dourado focus:ring-2 focus:ring-dourado/40"
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
          className="w-full rounded-lg border border-creme-escuro bg-creme px-3 py-2.5 text-base outline-none focus:border-dourado focus:ring-2 focus:ring-dourado/40"
        />
      </div>
      <div>
        <label htmlFor="assunto" className="mb-1 block text-sm font-medium">
          Assunto
        </label>
        <select
          id="assunto"
          name="assunto"
          className="w-full rounded-lg border border-creme-escuro bg-creme px-3 py-2.5 text-base outline-none focus:border-dourado focus:ring-2 focus:ring-dourado/40"
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
          className="w-full rounded-lg border border-creme-escuro bg-creme px-3 py-2.5 text-base outline-none focus:border-dourado focus:ring-2 focus:ring-dourado/40"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg bg-terracota px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-terracota-escuro"
      >
        <Send className="h-5 w-5" aria-hidden />
        Enviar mensagem
      </button>
    </form>
  );
}
