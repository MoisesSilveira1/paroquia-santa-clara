"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight, MapPin, Users } from "lucide-react";
import Botao from "@/components/ui/Botao";
import {
  CampoArea,
  CampoSelecao,
  CampoTexto,
} from "@/components/ui/Campo";
import Modal from "@/components/ui/Modal";
import Alerta from "@/components/ui/Alerta";
import DialogoDeExclusao from "@/components/admin/DialogoDeExclusao";
import { ESTADO_INICIAL } from "@/lib/servicos/resultado";
import type { EscaladoNoEvento, EventoDaAgenda } from "@/lib/servicos/agenda";
import type { OpcaoDePastoral } from "@/lib/servicos/coordenadores";
import {
  ROTULO_TIPO_DE_EVENTO,
  TIPOS_DE_EVENTO,
} from "@/lib/validacao/esquemas";
import { formatador, partesNaParoquia } from "@/lib/agenda/fuso";
import {
  ehDoMes,
  escreverMes,
  mesVizinho,
  type Mes,
} from "@/lib/agenda/mes";
import { excluirEventoAcao, salvarEvento } from "./acoes";

// Sempre a hora de Brasília: quem abre o painel de outro fuso precisa ver o
// horário da paróquia, não o do relógio dele.
const NOME_DO_MES = formatador({ month: "long", year: "numeric" });
const DIA_POR_EXTENSO = formatador({ weekday: "long", day: "numeric", month: "long" });
const HORA = formatador({ hour: "2-digit", minute: "2-digit" });

const CABECALHO = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** Sugestões de lugar. Texto livre — ver o comentário do modelo no schema. */
const LOCAIS = [
  "Salão paroquial",
  "Quiosque",
  "Sala 1",
  "Sala 2",
  "Igreja Matriz",
  "Capela Rainha da Paz",
];

export default function Calendario({
  mes,
  dias,
  eventos,
  pastorais,
  equipes,
  hojeIso,
}: {
  mes: Mes;
  /** Já vem em ISO do servidor: `Date` cru mudaria de fuso ao atravessar. */
  dias: string[];
  eventos: EventoDaAgenda[];
  pastorais: OpcaoDePastoral[];
  /** Quem pode ser escalado, por pastoral. */
  equipes: Record<string, EscaladoNoEvento[]>;
  hojeIso: string;
}) {
  const [emEdicao, setEmEdicao] = useState<EventoDaAgenda | null>(null);
  const [novoNoDia, setNovoNoDia] = useState<string | null>(null);
  const [recado, setRecado] = useState<string | null>(null);

  const porDia = new Map<string, EventoDaAgenda[]>();
  for (const evento of eventos) {
    const chave = partesNaParoquia(new Date(evento.inicio)).data;
    porDia.set(chave, [...(porDia.get(chave) ?? []), evento]);
  }

  function fechar() {
    setEmEdicao(null);
    setNovoNoDia(null);
  }

  const semPastorais = pastorais.length === 0;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
        <div className="flex items-center gap-1">
          <Link
            href={`?mes=${escreverMes(mesVizinho(mes, -1))}`}
            aria-label="Mês anterior"
            className="rounded-md p-2 text-texto-suave transition-colors hover:bg-superficie-suave hover:text-texto"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
          <h3 className="min-w-44 text-center font-serif text-lg text-texto first-letter:uppercase">
            {NOME_DO_MES.format(new Date(`${escreverMes(mes)}-01T12:00:00`))}
          </h3>
          <Link
            href={`?mes=${escreverMes(mesVizinho(mes, 1))}`}
            aria-label="Próximo mês"
            className="rounded-md p-2 text-texto-suave transition-colors hover:bg-superficie-suave hover:text-texto"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>

        <Botao
          icone={CalendarPlus}
          onClick={() => setNovoNoDia(hojeIso)}
          disabled={semPastorais}
        >
          Marcar compromisso
        </Botao>
      </div>

      {recado && (
        <div className="px-5 pt-3">
          <Alerta tom="sucesso">{recado}</Alerta>
        </div>
      )}

      {semPastorais && (
        <div className="px-5 pt-3">
          <Alerta tom="atencao">
            Você ainda não coordena nenhuma pastoral. Fale com a secretaria para
            ligar a sua conta ao grupo.
          </Alerta>
        </div>
      )}

      <div className="mt-4 overflow-x-auto px-5 pb-5">
        <div className="min-w-[42rem]">
          <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold uppercase tracking-wide text-texto-suave">
            {CABECALHO.map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-borda bg-borda">
            {dias.map((iso) => {
              const data = new Date(`${iso}T12:00:00`);
              const doMes = ehDoMes(data, mes);
              const doDia = porDia.get(iso) ?? [];
              const ehHoje = iso === hojeIso;

              return (
                <div
                  key={iso}
                  className={`min-h-24 bg-superficie p-1.5 ${doMes ? "" : "opacity-45"}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        ehHoje
                          ? "inline-flex h-6 w-6 items-center justify-center rounded-full bg-destaque text-xs font-bold text-principal-escuro"
                          : "px-1 text-xs text-texto-suave tabular-nums"
                      }
                    >
                      {data.getDate()}
                    </span>
                    {doMes && !semPastorais && (
                      <button
                        type="button"
                        onClick={() => setNovoNoDia(iso)}
                        aria-label={`Marcar compromisso em ${DIA_POR_EXTENSO.format(data)}`}
                        className="rounded px-1 text-sm leading-none text-texto-suave opacity-0 transition-opacity hover:text-principal focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                      >
                        +
                      </button>
                    )}
                  </div>

                  <ul className="mt-1 space-y-1">
                    {doDia.map((evento) => (
                      <li key={evento.id}>
                        <button
                          type="button"
                          onClick={() => setEmEdicao(evento)}
                          className={`w-full truncate rounded px-1.5 py-1 text-left text-xs transition-opacity hover:opacity-80 ${
                            evento.tipo === "ESCALA"
                              ? "bg-destaque/25 text-texto"
                              : "bg-principal/20 text-texto"
                          }`}
                          title={`${HORA.format(new Date(evento.inicio))} · ${evento.titulo}`}
                        >
                          <span className="tabular-nums text-texto-suave">
                            {HORA.format(new Date(evento.inicio))}
                          </span>{" "}
                          {evento.titulo}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(emEdicao || novoNoDia) && (
        <FormularioDeEvento
          evento={emEdicao}
          diaSugerido={novoNoDia}
          pastorais={pastorais}
          equipes={equipes}
          aoFechar={fechar}
          aoConcluir={(mensagem) => {
            fechar();
            setRecado(mensagem);
          }}
        />
      )}
    </>
  );
}

function FormularioDeEvento({
  evento,
  diaSugerido,
  pastorais,
  equipes,
  aoFechar,
  aoConcluir,
}: {
  evento: EventoDaAgenda | null;
  diaSugerido: string | null;
  pastorais: OpcaoDePastoral[];
  equipes: Record<string, EscaladoNoEvento[]>;
  aoFechar: () => void;
  aoConcluir: (mensagem: string) => void;
}) {
  const [estado, enviar, pendente] = useActionState(salvarEvento, ESTADO_INICIAL);

  // A pastoral e o tipo são controlados porque a tela reage aos dois: a
  // pastoral troca a lista de quem pode ser escalado, e o tipo decide se essa
  // lista aparece.
  const [pastoralId, setPastoralId] = useState(
    evento?.pastoralId ?? pastorais[0]?.id ?? ""
  );
  const [tipo, setTipo] = useState(evento?.tipo ?? "REUNIAO");

  useEffect(() => {
    if (estado.ok) aoConcluir(estado.mensagem ?? "Compromisso salvo.");
  }, [estado, aoConcluir]);

  const inicio = evento ? new Date(evento.inicio) : null;
  const fim = evento?.fim ? new Date(evento.fim) : null;
  const equipe = equipes[pastoralId] ?? [];
  const jaEscalados = new Set(evento?.escalados.map((e) => e.id));

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={evento ? "Editar compromisso" : "Marcar compromisso"}
      descricao="Aparece só no painel, para a sua equipe."
    >
      <form action={enviar} className="space-y-4" noValidate>
        {evento && <input type="hidden" name="id" value={evento.id} />}

        <CampoSelecao
          name="tipo"
          rotulo="O que é"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as typeof tipo)}
          dica={
            tipo === "ESCALA"
              ? "Escala: você marca quem serve neste dia."
              : "Reunião: encontro do grupo, sem lista de escalados."
          }
          opcoes={TIPOS_DE_EVENTO.map((t) => ({
            valor: t,
            texto: ROTULO_TIPO_DE_EVENTO[t],
          }))}
        />

        <CampoTexto
          name="titulo"
          rotulo="Título"
          required
          maxLength={160}
          dica='Ex.: "Reunião mensal" ou "Missa das 19h".'
          defaultValue={estado.valores?.titulo ?? evento?.titulo ?? ""}
          erro={estado.erros?.titulo?.[0]}
        />

        <CampoSelecao
          name="pastoralId"
          rotulo="Pastoral"
          required
          value={pastoralId}
          onChange={(e) => setPastoralId(e.target.value)}
          opcoes={pastorais.map((p) => ({ valor: p.id, texto: p.nome }))}
          erro={estado.erros?.pastoralId?.[0]}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <CampoTexto
            name="data"
            type="date"
            rotulo="Dia"
            required
            defaultValue={
              estado.valores?.data ??
              (inicio ? partesNaParoquia(inicio).data : (diaSugerido ?? ""))
            }
            erro={estado.erros?.data?.[0]}
          />
          <CampoTexto
            name="horaInicio"
            type="time"
            rotulo="Começa"
            required
            defaultValue={
              estado.valores?.horaInicio ??
              (inicio ? partesNaParoquia(inicio).hora : "19:30")
            }
            erro={estado.erros?.horaInicio?.[0]}
          />
          <CampoTexto
            name="horaFim"
            type="time"
            rotulo="Termina"
            defaultValue={
              estado.valores?.horaFim ?? (fim ? partesNaParoquia(fim).hora : "")
            }
            erro={estado.erros?.horaFim?.[0]}
          />
        </div>

        <CampoTexto
          name="local"
          rotulo="Onde (opcional)"
          maxLength={120}
          list="locais-da-paroquia"
          dica="Salão, sala, quiosque. Escreva livremente."
          defaultValue={estado.valores?.local ?? evento?.local ?? ""}
          erro={estado.erros?.local?.[0]}
        />
        <datalist id="locais-da-paroquia">
          {LOCAIS.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>

        {tipo === "ESCALA" && (
          <fieldset>
            <legend className="text-sm font-medium text-texto">
              Quem serve neste dia
            </legend>
            {equipe.length === 0 ? (
              <p className="mt-2 text-sm text-texto-suave">
                Ninguém cadastrado na equipe ainda. Cadastre em “Coordenadores e
                equipes”.
              </p>
            ) : (
              <ul className="mt-2 max-h-52 space-y-1.5 overflow-y-auto rounded-lg border border-borda p-3">
                {equipe.map((pessoa) => (
                  <li key={pessoa.id}>
                    <label className="flex items-center gap-2.5 text-sm">
                      <input
                        type="checkbox"
                        name="escalados"
                        value={pessoa.id}
                        defaultChecked={jaEscalados.has(pessoa.id)}
                        className="h-4 w-4"
                      />
                      <span className="text-texto">{pessoa.nome}</span>
                      <span className="text-texto-suave">— {pessoa.funcao}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>
        )}

        <CampoArea
          name="observacao"
          rotulo="Observação (opcional)"
          rows={2}
          maxLength={600}
          defaultValue={estado.valores?.observacao ?? evento?.observacao ?? ""}
          erro={estado.erros?.observacao?.[0]}
        />

        {estado.mensagem && !estado.ok && !estado.erros && (
          <Alerta tom="perigo">{estado.mensagem}</Alerta>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div>
            {evento && (
              <DialogoDeExclusao
                nome={evento.titulo}
                descricao="O compromisso sai da agenda; a equipe continua cadastrada."
                aoConfirmar={() => excluirEventoAcao(evento.id)}
              />
            )}
          </div>
          <div className="flex gap-2">
            <Botao variante="secundario" type="button" onClick={aoFechar}>
              Cancelar
            </Botao>
            <Botao type="submit" pendente={pendente}>
              {evento ? "Salvar" : "Marcar"}
            </Botao>
          </div>
        </div>
      </form>
    </Modal>
  );
}

/** Lista simples dos próximos compromissos, para a abertura do painel. */
export function ProximosCompromissos({
  eventos,
}: {
  eventos: EventoDaAgenda[];
}) {
  if (eventos.length === 0) {
    return (
      <p className="px-5 pb-5 text-sm text-texto-suave">
        Nada marcado por enquanto. Abra a agenda para marcar a próxima reunião
        ou escala.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-borda">
      {eventos.map((evento) => (
        <li key={evento.id} className="flex flex-wrap gap-x-4 gap-y-1 px-5 py-3">
          <span className="w-40 shrink-0 text-sm text-texto-suave tabular-nums first-letter:uppercase">
            {DIA_POR_EXTENSO.format(new Date(evento.inicio))}
          </span>
          <span className="flex-1">
            <span className="font-medium text-texto">{evento.titulo}</span>
            <span className="ml-2 text-xs text-texto-suave">
              {HORA.format(new Date(evento.inicio))} ·{" "}
              {ROTULO_TIPO_DE_EVENTO[evento.tipo]}
            </span>
            <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-texto-suave">
              {evento.local && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {evento.local}
                </span>
              )}
              {evento.escalados.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" aria-hidden />
                  {evento.escalados.map((e) => e.nome).join(", ")}
                </span>
              )}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
