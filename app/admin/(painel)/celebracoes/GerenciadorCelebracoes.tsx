"use client";

import { useActionState, useEffect, useState } from "react";
import { CalendarDays, Pencil, Plus, Radio } from "lucide-react";
import Botao, { BotaoIcone } from "@/components/ui/Botao";
import {
  CampoBooleano,
  CampoSelecao,
  CampoTexto,
} from "@/components/ui/Campo";
import EstadoVazio from "@/components/ui/EstadoVazio";
import Modal from "@/components/ui/Modal";
import Alerta from "@/components/ui/Alerta";
import Selo from "@/components/ui/Selo";
import {
  Tabela,
  TabelaCabecalho,
  TabelaCelula,
  TabelaCorpo,
  TabelaLinha,
  TabelaLinhaVazia,
  TabelaTitulo,
} from "@/components/ui/Tabela";
import DialogoDeExclusao from "@/components/admin/DialogoDeExclusao";
import { ESTADO_INICIAL } from "@/lib/servicos/resultado";
import type { Celebracao } from "@/lib/servicos/celebracoes";
import { DIAS_DA_SEMANA } from "@/lib/validacao/esquemas";
import { excluirCelebracaoAcao, salvarCelebracao } from "./acoes";

export default function GerenciadorCelebracoes({
  itens,
  temFiltro,
}: {
  itens: Celebracao[];
  temFiltro: boolean;
}) {
  const [emEdicao, setEmEdicao] = useState<Celebracao | null>(null);
  const [criando, setCriando] = useState(false);
  const [recado, setRecado] = useState<string | null>(null);

  function fechar() {
    setCriando(false);
    setEmEdicao(null);
  }

  return (
    <>
      <div className="flex justify-end px-5 pt-4">
        <Botao icone={Plus} onClick={() => setCriando(true)}>
          Novo horário
        </Botao>
      </div>

      {recado && (
        <div className="px-5 pt-3">
          <Alerta tom="sucesso">{recado}</Alerta>
        </div>
      )}

      <div className="mt-4">
        <Tabela rotulo="Horários das celebrações">
          <TabelaCabecalho>
            <TabelaTitulo className="w-32">Dia</TabelaTitulo>
            <TabelaTitulo className="w-20">Hora</TabelaTitulo>
            <TabelaTitulo>Celebração</TabelaTitulo>
            <TabelaTitulo className="w-44">Local</TabelaTitulo>
            <TabelaTitulo className="w-28">Situação</TabelaTitulo>
            <TabelaTitulo alinhamento="direita" className="w-24">
              Ações
            </TabelaTitulo>
          </TabelaCabecalho>

          <TabelaCorpo>
            {itens.length === 0 ? (
              <TabelaLinhaVazia colunas={6}>
                <EstadoVazio
                  icone={CalendarDays}
                  titulo={
                    temFiltro
                      ? "Nenhum horário corresponde aos filtros"
                      : "Nenhum horário cadastrado"
                  }
                  descricao={
                    temFiltro
                      ? "Tente outro dia da semana ou limpe os filtros."
                      : "É esta lista que monta a grade da semana no site."
                  }
                  acao={
                    !temFiltro && (
                      <Botao icone={Plus} onClick={() => setCriando(true)}>
                        Adicionar o primeiro horário
                      </Botao>
                    )
                  }
                />
              </TabelaLinhaVazia>
            ) : (
              itens.map((item) => (
                <TabelaLinha key={item.id}>
                  <TabelaCelula className="text-texto-suave">
                    {DIAS_DA_SEMANA[item.diaSemana]}
                  </TabelaCelula>
                  <TabelaCelula className="font-medium tabular-nums">
                    {item.hora}
                  </TabelaCelula>
                  <TabelaCelula>
                    <div className="flex items-center gap-2">
                      <span>{item.nome}</span>
                      {item.transmitida && (
                        <Radio
                          className="h-4 w-4 shrink-0 text-perigo"
                          aria-label="Transmitida ao vivo"
                        />
                      )}
                    </div>
                    {item.observacao && (
                      <p className="mt-0.5 text-xs text-texto-suave">
                        {item.observacao}
                      </p>
                    )}
                  </TabelaCelula>
                  <TabelaCelula className="text-texto-suave">
                    {item.local}
                  </TabelaCelula>
                  <TabelaCelula>
                    <Selo tom={item.ativo ? "sucesso" : "neutro"}>
                      {item.ativo ? "No site" : "Oculto"}
                    </Selo>
                  </TabelaCelula>
                  <TabelaCelula alinhamento="direita">
                    <div className="flex justify-end gap-1">
                      <BotaoIcone
                        icone={Pencil}
                        rotulo={`Editar ${item.nome}`}
                        onClick={() => setEmEdicao(item)}
                      />
                      <DialogoDeExclusao
                        nome={`${item.nome} de ${DIAS_DA_SEMANA[item.diaSemana].toLowerCase()}, ${item.hora}`}
                        aoConfirmar={() => excluirCelebracaoAcao(item.id)}
                      />
                    </div>
                  </TabelaCelula>
                </TabelaLinha>
              ))
            )}
          </TabelaCorpo>
        </Tabela>
      </div>

      {(criando || emEdicao) && (
        <FormularioDeCelebracao
          celebracao={emEdicao}
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

function FormularioDeCelebracao({
  celebracao,
  aoFechar,
  aoConcluir,
}: {
  celebracao: Celebracao | null;
  aoFechar: () => void;
  aoConcluir: (mensagem: string) => void;
}) {
  const [estado, enviar, pendente] = useActionState(
    salvarCelebracao,
    ESTADO_INICIAL
  );

  useEffect(() => {
    if (estado.ok) aoConcluir(estado.mensagem ?? "Horário salvo.");
  }, [estado, aoConcluir]);

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={celebracao ? "Editar horário" : "Novo horário"}
      descricao="Missas, confissões e adoração da grade semanal."
    >
      <form action={enviar} className="space-y-4" noValidate>
        {celebracao && <input type="hidden" name="id" value={celebracao.id} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoSelecao
            name="diaSemana"
            rotulo="Dia da semana"
            defaultValue={
              estado.valores?.diaSemana ?? String(celebracao?.diaSemana ?? 0)
            }
            opcoes={DIAS_DA_SEMANA.map((dia, indice) => ({
              valor: String(indice),
              texto: dia,
            }))}
            erro={estado.erros?.diaSemana?.[0]}
          />

          <CampoTexto
            name="hora"
            type="time"
            rotulo="Horário"
            required
            defaultValue={estado.valores?.hora ?? celebracao?.hora ?? "19:30"}
            erro={estado.erros?.hora?.[0]}
          />
        </div>

        <CampoTexto
          name="nome"
          rotulo="Celebração"
          required
          maxLength={120}
          dica='Ex.: "Santa Missa", "Confissões", "Adoração ao Santíssimo".'
          defaultValue={estado.valores?.nome ?? celebracao?.nome ?? ""}
          erro={estado.erros?.nome?.[0]}
        />

        <CampoTexto
          name="local"
          rotulo="Local"
          required
          maxLength={120}
          defaultValue={
            estado.valores?.local ?? celebracao?.local ?? "Igreja Matriz"
          }
          erro={estado.erros?.local?.[0]}
        />

        <CampoTexto
          name="observacao"
          rotulo="Observação (opcional)"
          maxLength={280}
          dica='Ex.: "seguida de Adoração ao Santíssimo".'
          defaultValue={estado.valores?.observacao ?? celebracao?.observacao ?? ""}
          erro={estado.erros?.observacao?.[0]}
        />

        <CampoBooleano
          name="transmitida"
          rotulo="Transmitida ao vivo no YouTube"
          defaultChecked={celebracao?.transmitida ?? false}
        />

        <CampoBooleano
          name="ativo"
          rotulo="Mostrar no site"
          dica="Desmarque para tirar da grade sem apagar o cadastro."
          defaultChecked={celebracao ? celebracao.ativo : true}
        />

        {estado.mensagem && !estado.ok && !estado.erros && (
          <Alerta tom="perigo">{estado.mensagem}</Alerta>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Botao variante="secundario" type="button" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" pendente={pendente}>
            {celebracao ? "Salvar alterações" : "Adicionar horário"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
