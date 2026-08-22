"use client";

import { useState, useTransition } from "react";
import { Mail, MailOpen, Phone, Reply } from "lucide-react";
import Alerta from "@/components/ui/Alerta";
import EstadoVazio from "@/components/ui/EstadoVazio";
import Selo from "@/components/ui/Selo";
import DialogoDeExclusao from "@/components/admin/DialogoDeExclusao";
import type { MensagemDaLista } from "@/lib/servicos/mensagens";
import {
  ROTULO_STATUS_MENSAGEM,
  STATUS_MENSAGEM,
} from "@/lib/validacao/esquemas";
import { TOM_DO_STATUS_MENSAGEM } from "../tons";
import { excluirMensagemAcao, mudarStatusAcao } from "./acoes";

const FORMATO = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

/**
 * Caixa de entrada da secretaria.
 *
 * É uma lista de cartões, não uma tabela: o corpo da mensagem é o conteúdo
 * principal e precisa de largura para ser lido, o que uma célula estreita não
 * daria.
 */
export default function ListaMensagens({
  itens,
  temFiltro,
}: {
  itens: MensagemDaLista[];
  temFiltro: boolean;
}) {
  const [recado, setRecado] = useState<string | null>(null);

  if (itens.length === 0) {
    return (
      <EstadoVazio
        icone={MailOpen}
        titulo={
          temFiltro
            ? "Nenhuma mensagem corresponde aos filtros"
            : "Nenhuma mensagem recebida"
        }
        descricao={
          temFiltro
            ? "Tente outras palavras ou limpe os filtros."
            : "As mensagens enviadas pelo formulário de contato do site aparecem aqui."
        }
      />
    );
  }

  return (
    <>
      {recado && (
        <div className="px-5 pt-4">
          <Alerta tom="sucesso">{recado}</Alerta>
        </div>
      )}

      <ul className="divide-y divide-borda">
        {itens.map((mensagem) => (
          <CartaoDeMensagem
            key={mensagem.id}
            mensagem={mensagem}
            aoAvisar={setRecado}
          />
        ))}
      </ul>
    </>
  );
}

function CartaoDeMensagem({
  mensagem,
  aoAvisar,
}: {
  mensagem: MensagemDaLista;
  aoAvisar: (texto: string) => void;
}) {
  const [pendente, iniciar] = useTransition();

  function mudarStatus(status: string) {
    iniciar(async () => {
      const resultado = await mudarStatusAcao(mensagem.id, status);
      if (resultado.mensagem) aoAvisar(resultado.mensagem);
    });
  }

  // `mailto:` com assunto já preenchido: a resposta sai do programa de e-mail
  // da secretaria, que é onde o histórico dela realmente fica.
  const responder = `mailto:${encodeURIComponent(mensagem.email)}?subject=${encodeURIComponent(
    `Re: ${mensagem.assunto}`
  )}`;

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base text-texto">{mensagem.assunto}</h3>
            <Selo tom={TOM_DO_STATUS_MENSAGEM[mensagem.status]}>
              {ROTULO_STATUS_MENSAGEM[mensagem.status]}
            </Selo>
          </div>

          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-texto-suave">
            <span className="font-medium text-texto">{mensagem.nome}</span>
            <a
              href={`mailto:${mensagem.email}`}
              className="inline-flex items-center gap-1 hover:text-texto hover:underline"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {mensagem.email}
            </a>
            {mensagem.telefone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" aria-hidden />
                {mensagem.telefone}
              </span>
            )}
            <time dateTime={mensagem.criadoEm.toISOString()}>
              {FORMATO.format(mensagem.criadoEm)}
            </time>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <label className="sr-only" htmlFor={`status-${mensagem.id}`}>
            Situação da mensagem de {mensagem.nome}
          </label>
          <select
            id={`status-${mensagem.id}`}
            value={mensagem.status}
            disabled={pendente}
            onChange={(evento) => mudarStatus(evento.target.value)}
            className="rounded-lg border border-borda bg-superficie px-2.5 py-1.5 text-xs font-semibold text-texto outline-none focus:border-destaque focus:ring-2 focus:ring-destaque/40 disabled:opacity-50"
          >
            {STATUS_MENSAGEM.map((status) => (
              <option key={status} value={status}>
                {ROTULO_STATUS_MENSAGEM[status]}
              </option>
            ))}
          </select>

          <a
            href={responder}
            className="inline-flex items-center gap-1.5 rounded-lg border border-borda px-2.5 py-1.5 text-xs font-semibold text-texto transition-colors hover:bg-superficie-suave"
          >
            <Reply className="h-3.5 w-3.5" aria-hidden />
            Responder
          </a>

          <DialogoDeExclusao
            nome={`a mensagem de ${mensagem.nome}`}
            aoConfirmar={() => excluirMensagemAcao(mensagem.id)}
          />
        </div>
      </div>

      <p className="mt-3 max-w-prose text-sm whitespace-pre-line text-texto">
        {mensagem.corpo}
      </p>
    </li>
  );
}
