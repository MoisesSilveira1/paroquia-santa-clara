"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { CAMPO, TEXTO_ERRO } from "@/components/ui/estilos";
import type { TurmaNoSite } from "@/lib/servicos/catequese";
import { DIAS_DA_SEMANA } from "@/lib/validacao/esquemas";
import { enviarInscricao, type RespostaDaInscricao } from "./acoes";

/**
 * O formulário de inscrição, como a família preenche.
 *
 * Escrito para quem nunca preencheu formulário na internet: rótulos que
 * perguntam em vez de nomear campo ("Quem responde pela criança?" em vez de
 * "Responsável"), e nenhum jargão de sistema.
 *
 * A turma é opcional de propósito. Muita gente se inscreve sem saber ainda
 * qual horário dá — obrigar a escolha faria a família chutar, e chute vira
 * telefonema para a secretaria depois.
 */

const ROTULO = "mb-1 block text-sm font-medium text-texto";

export default function FormularioDeInscricao({
  turmas,
  anoLetivo,
}: {
  turmas: TurmaNoSite[];
  anoLetivo: string;
}) {
  const [resposta, enviar, pendente] = useActionState<
    RespostaDaInscricao | null,
    FormData
  >(enviarInscricao, null);

  // Padrinho só faz sentido em algumas etapas (Crisma). Perguntar sempre
  // enche o formulário de campo que não serve; por isso fica atrás de um
  // botão, em vez de estar sempre aberto.
  const [padrinhoAberto, setPadrinhoAberto] = useState(false);

  if (resposta?.estado === "enviado") {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-xl border border-destaque-claro bg-white p-10 text-center shadow-sm"
      >
        <CheckCircle2 className="h-12 w-12 text-destaque" aria-hidden />
        <h3 className="text-xl text-principal-escuro">Inscrição enviada!</h3>
        <p className="max-w-prose text-sm leading-relaxed text-texto-suave">
          Recebemos o pedido{resposta.nome && <> de <strong>{resposta.nome}</strong></>}.
          A coordenação da catequese vai conferir e entrar em contato pelo
          telefone que você informou. Guarde as certidões para levar quando for
          chamado. Paz e bem!
        </p>
      </div>
    );
  }

  const erroDe = (campo: string) =>
    resposta?.estado === "erro" && resposta.campo === campo
      ? resposta.mensagem
      : undefined;

  // O que a pessoa tinha digitado, devolvido pelo servidor. Sem isto o React
  // limpa o formulário inteiro quando a validação recusa um campo só.
  const digitado = resposta?.estado === "erro" ? resposta.valores : undefined;
  const valor = (campo: string) => digitado?.[campo] ?? "";
  const marcado = (campo: string) => digitado?.[campo] === "on";

  return (
    <form
      action={enviar}
      className="space-y-6 rounded-xl border border-destaque-claro bg-white p-6 shadow-sm"
      noValidate
    >
      {/* ---------------------------------------------------------------- */}
      <fieldset className="space-y-4">
        <legend className="text-lg text-principal-escuro">
          Quem vai participar da catequese
        </legend>

        <div>
          <label htmlFor="nome" className={ROTULO}>
            Nome completo
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            required
            maxLength={120}
            defaultValue={valor("nome")}
            className={CAMPO}
          />
          {erroDe("nome") && (
            <p role="alert" className={`mt-1 ${TEXTO_ERRO}`}>{erroDe("nome")}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dataNascimento" className={ROTULO}>
              Data de nascimento
            </label>
            <input
              id="dataNascimento"
              name="dataNascimento"
              type="date"
              required
              defaultValue={valor("dataNascimento")}
              className={CAMPO}
            />
            {erroDe("dataNascimento") && (
              <p role="alert" className={`mt-1 ${TEXTO_ERRO}`}>
                {erroDe("dataNascimento")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="tipo" className={ROTULO}>
              É a primeira vez na catequese?
            </label>
            <select
              id="tipo"
              name="tipo"
              className={CAMPO}
              defaultValue={valor("tipo") || "NOVA"}
            >
              <option value="NOVA">Sim, é a primeira inscrição</option>
              <option value="RENOVACAO">Não, estou renovando a matrícula</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg bg-fundo p-4">
          <label className="flex items-start gap-2.5">
            <input
              name="batizado"
              type="checkbox"
              defaultChecked={marcado("batizado")}
              className="mt-0.5 h-4 w-4 shrink-0 accent-principal"
            />
            <span className="text-sm text-texto">
              Já é batizado
              <span className="block text-xs text-texto-suave">
                Não precisa ser batizado para começar a catequese. A pergunta
                serve para a coordenação saber quem ainda vai receber o Batismo.
              </span>
            </span>
          </label>

          <div className="mt-3">
            <label htmlFor="paroquiaBatismo" className={ROTULO}>
              Em que paróquia foi batizado? <span className="font-normal text-texto-suave">(se souber)</span>
            </label>
            <input
              id="paroquiaBatismo"
              name="paroquiaBatismo"
              type="text"
              maxLength={160}
              defaultValue={valor("paroquiaBatismo")}
              className={CAMPO}
            />
          </div>
        </div>
      </fieldset>

      {/* ---------------------------------------------------------------- */}
      <fieldset className="space-y-4 border-t border-fundo-suave pt-6">
        <legend className="text-lg text-principal-escuro">
          Quem responde por ele
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="responsavel" className={ROTULO}>
              Nome de quem responde
            </label>
            <input
              id="responsavel"
              name="responsavel"
              type="text"
              required
              maxLength={120}
              autoComplete="name"
              defaultValue={valor("responsavel")}
              className={CAMPO}
            />
            {erroDe("responsavel") && (
              <p role="alert" className={`mt-1 ${TEXTO_ERRO}`}>
                {erroDe("responsavel")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="parentesco" className={ROTULO}>
              Parentesco
            </label>
            <input
              id="parentesco"
              name="parentesco"
              type="text"
              required
              maxLength={40}
              list="parentescos"
              placeholder="Mãe, pai, avó…"
              defaultValue={valor("parentesco")}
              className={CAMPO}
            />
            <datalist id="parentescos">
              <option value="Mãe" />
              <option value="Pai" />
              <option value="Avó" />
              <option value="Avô" />
              <option value="Tia" />
              <option value="Tio" />
              <option value="Responsável legal" />
              <option value="O próprio (adulto)" />
            </datalist>
            {erroDe("parentesco") && (
              <p role="alert" className={`mt-1 ${TEXTO_ERRO}`}>
                {erroDe("parentesco")}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="telefone" className={ROTULO}>
              Telefone / WhatsApp
            </label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              required
              maxLength={40}
              autoComplete="tel"
              placeholder="(61) 99999-0000"
              defaultValue={valor("telefone")}
              className={CAMPO}
            />
            <p className="mt-1 text-xs text-texto-suave">
              É por aqui que a coordenação vai falar com você.
            </p>
            {erroDe("telefone") && (
              <p role="alert" className={`mt-1 ${TEXTO_ERRO}`}>
                {erroDe("telefone")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className={ROTULO}>
              E-mail <span className="font-normal text-texto-suave">(opcional)</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              maxLength={160}
              autoComplete="email"
              defaultValue={valor("email")}
              className={CAMPO}
            />
            {erroDe("email") && (
              <p role="alert" className={`mt-1 ${TEXTO_ERRO}`}>{erroDe("email")}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* ---------------------------------------------------------------- */}
      <fieldset className="space-y-4 border-t border-fundo-suave pt-6">
        <legend className="text-lg text-principal-escuro">
          Horário e observações
        </legend>

        <div>
          <label htmlFor="turmaId" className={ROTULO}>
            Turma preferida{" "}
            <span className="font-normal text-texto-suave">(pode decidir depois)</span>
          </label>
          <select
            id="turmaId"
            name="turmaId"
            className={CAMPO}
            defaultValue={valor("turmaId")}
          >
            <option value="">Ainda não sei / a coordenação escolhe</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id} disabled={turma.lotada}>
                {turma.nome} — {DIAS_DA_SEMANA[turma.diaSemana]}, {turma.hora}
                {turma.local && ` · ${turma.local}`}
                {turma.lotada && " (turma cheia)"}
              </option>
            ))}
          </select>
        </div>

        {padrinhoAberto || valor("padrinho") ? (
          <div>
            <label htmlFor="padrinho" className={ROTULO}>
              Padrinho ou madrinha
            </label>
            <input
              id="padrinho"
              name="padrinho"
              type="text"
              maxLength={160}
              defaultValue={valor("padrinho")}
              className={CAMPO}
            />
            <p className="mt-1 text-xs text-texto-suave">
              Só para quem já sabe. A escolha pode ser feita durante a caminhada.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPadrinhoAberto(true)}
            className="text-sm font-semibold text-principal underline decoration-dotted underline-offset-4 hover:text-principal-escuro"
          >
            Quero informar padrinho ou madrinha
          </button>
        )}

        <div>
          <label htmlFor="observacao" className={ROTULO}>
            Alguma coisa que a coordenação precise saber?{" "}
            <span className="font-normal text-texto-suave">(opcional)</span>
          </label>
          <textarea
            id="observacao"
            name="observacao"
            rows={3}
            maxLength={1000}
            placeholder="Alergia, necessidade de acompanhamento, irmão na mesma turma…"
            defaultValue={valor("observacao")}
            className={CAMPO}
          />
        </div>
      </fieldset>

      {/* ---------------------------------------------------------------- */}
      {/* O aceite volta marcado se já estava. Quem concordou e só errou o
          e-mail não deve ser obrigado a concordar de novo — seria um segundo
          erro na cara de quem está consertando o primeiro. O consentimento
          continua explícito, e a data gravada é a do envio que deu certo (ver
          `consentimentoEm` em lib/servicos/catequese.ts). */}
      <div className="rounded-lg border border-destaque-claro bg-fundo p-4">
        <label className="flex items-start gap-2.5">
          <input
            name="consentimento"
            type="checkbox"
            required
            defaultChecked={marcado("consentimento")}
            className="mt-0.5 h-4 w-4 shrink-0 accent-principal"
          />
          <span className="text-sm leading-relaxed text-texto">
            Autorizo a paróquia a guardar estes dados para organizar a catequese
            de {anoLetivo}.
            <span className="mt-1 block text-xs text-texto-suave">
              Os dados ficam com a coordenação da catequese e a secretaria
              paroquial, não vão para o site nem para ninguém de fora, e podem
              ser corrigidos ou apagados a pedido — é só procurar a secretaria.
            </span>
          </span>
        </label>
        {erroDe("consentimento") && (
          <p role="alert" className={`mt-2 ${TEXTO_ERRO}`}>
            {erroDe("consentimento")}
          </p>
        )}
      </div>

      {/* Campo isca contra robôs: invisível e ignorado por quem usa o site. */}
      <div aria-hidden className="hidden">
        <label htmlFor="confirmacao">Não preencha este campo</label>
        <input
          id="confirmacao"
          name="confirmacao"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Erro que não pertence a um campo (período fechado, envio repetido). */}
      {resposta?.estado === "erro" && !resposta.campo && (
        <p role="alert" className={TEXTO_ERRO}>
          {resposta.mensagem}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="inline-flex items-center gap-2 rounded-lg bg-principal px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-principal-escuro disabled:opacity-60"
      >
        {pendente ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : (
          <Send className="h-5 w-5" aria-hidden />
        )}
        {pendente ? "Enviando…" : "Enviar inscrição"}
      </button>
    </form>
  );
}
