"use client";

import { useActionState, useEffect, useState } from "react";
import {
  BookOpenText,
  CalendarClock,
  Inbox,
  Pencil,
  Plus,
  Users,
} from "lucide-react";
import Botao, { BotaoIcone } from "@/components/ui/Botao";
import {
  CampoArea,
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
import type {
  ConfiguracaoDaCatequese,
  Inscricao,
  Turma,
} from "@/lib/servicos/catequese";
import {
  DIAS_DA_SEMANA,
  ROTULO_STATUS_INSCRICAO,
  ROTULO_TIPO_DE_INSCRICAO,
  STATUS_INSCRICAO,
} from "@/lib/validacao/esquemas";
import { ESPACOS_DA_PAROQUIA } from "@/lib/paroquia/espacos";
import { TOM_DO_STATUS_INSCRICAO } from "../tons";
import {
  excluirInscricaoAcao,
  excluirTurmaAcao,
  mudarStatusAcao,
  salvarConfiguracaoAcao,
  salvarTurma,
} from "./acoes";

/**
 * A tela da catequese, em três blocos, nesta ordem de propósito:
 *
 *   1. O período — o interruptor que a comunidade sente. É a primeira coisa
 *      que a coordenação vem conferir, e por isso fica no topo.
 *   2. As turmas — o que o site oferece a quem se inscreve.
 *   3. Os pedidos recebidos — o trabalho do dia a dia.
 *
 * Um só arquivo porque os três compartilham o mesmo recado de sucesso e a
 * mesma janela de erro; separá-los obrigaria a levantar esse estado para um
 * quarto componente que não teria mais nada a fazer.
 */

const DATA_CURTA = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export default function GerenciadorCatequese({
  config,
  turmas,
  inscricoes,
  busca,
  status,
  podeExcluirInscricao,
}: {
  config: ConfiguracaoDaCatequese;
  turmas: Turma[];
  inscricoes: Inscricao[];
  busca: string;
  status: string;
  /** Decide se o botão aparece. Quem barra de verdade é o acoes.ts. */
  podeExcluirInscricao: boolean;
}) {
  const [recado, setRecado] = useState<string | null>(null);
  const [editandoPeriodo, setEditandoPeriodo] = useState(false);
  const [turmaEmEdicao, setTurmaEmEdicao] = useState<Turma | null>(null);
  const [criandoTurma, setCriandoTurma] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function concluir(mensagem: string) {
    setEditandoPeriodo(false);
    setTurmaEmEdicao(null);
    setCriandoTurma(false);
    setErro(null);
    setRecado(mensagem);
  }

  const doAno = turmas.filter((t) => t.anoLetivo === config.anoLetivo);
  const aguardando = inscricoes.filter(
    (i) => i.status === "RECEBIDA" || i.status === "EM_ANALISE"
  ).length;

  return (
    <div className="space-y-8 px-5 pb-5">
      {recado && (
        <div className="pt-4">
          <Alerta tom="sucesso">{recado}</Alerta>
        </div>
      )}
      {erro && (
        <div className="pt-4">
          <Alerta tom="perigo">{erro}</Alerta>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 1. Período de inscrição                                            */}
      {/* ----------------------------------------------------------------- */}
      <section className="pt-4" aria-labelledby="periodo">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3
              id="periodo"
              className="flex items-center gap-2 font-serif text-lg text-texto"
            >
              <CalendarClock className="h-5 w-5 text-destaque" aria-hidden />
              Período de inscrição
            </h3>
            <p className="mt-1 text-sm text-texto-suave">
              Enquanto estiver fechado, o formulário não aparece no site e
              nenhum pedido é aceito.
            </p>
          </div>
          <Botao
            variante="secundario"
            icone={Pencil}
            onClick={() => setEditandoPeriodo(true)}
          >
            Alterar
          </Botao>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-borda bg-superficie-suave p-4">
          <Selo tom={config.inscricoesAbertas ? "sucesso" : "neutro"}>
            {config.inscricoesAbertas ? "Inscrições abertas" : "Fechadas"}
          </Selo>
          <span className="text-sm text-texto-suave">
            Ano da caminhada: <strong className="text-texto">{config.anoLetivo}</strong>
          </span>
          {config.inscricoesAbertas && doAno.length === 0 && (
            <span className="text-sm font-medium text-atencao">
              Nenhuma turma cadastrada em {config.anoLetivo} — quem se inscrever
              não terá horário para escolher.
            </span>
          )}
        </div>

        {config.aviso && (
          <p className="mt-3 whitespace-pre-line rounded-lg border-l-2 border-destaque bg-superficie-suave px-4 py-3 text-sm text-texto-suave">
            {config.aviso}
          </p>
        )}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 2. Turmas                                                          */}
      {/* ----------------------------------------------------------------- */}
      <section aria-labelledby="turmas">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3
              id="turmas"
              className="flex items-center gap-2 font-serif text-lg text-texto"
            >
              <BookOpenText className="h-5 w-5 text-destaque" aria-hidden />
              Turmas
            </h3>
            <p className="mt-1 text-sm text-texto-suave">
              As do ano corrente aparecem no site para a família escolher o
              horário.
            </p>
          </div>
          <Botao icone={Plus} onClick={() => setCriandoTurma(true)}>
            Nova turma
          </Botao>
        </div>

        <div className="mt-4">
          <Tabela rotulo="Turmas da catequese">
            <TabelaCabecalho>
              <TabelaTitulo>Turma</TabelaTitulo>
              <TabelaTitulo className="w-48">Quando</TabelaTitulo>
              <TabelaTitulo className="w-44">Onde</TabelaTitulo>
              <TabelaTitulo className="w-28">Ano</TabelaTitulo>
              <TabelaTitulo className="w-28">Situação</TabelaTitulo>
              <TabelaTitulo alinhamento="direita" className="w-24">
                Ações
              </TabelaTitulo>
            </TabelaCabecalho>

            <TabelaCorpo>
              {turmas.length === 0 ? (
                <TabelaLinhaVazia colunas={6}>
                  <EstadoVazio
                    icone={BookOpenText}
                    titulo="Nenhuma turma cadastrada"
                    descricao="Cadastre as turmas antes de abrir as inscrições: é entre elas que a família escolhe o horário."
                    acao={
                      <Botao icone={Plus} onClick={() => setCriandoTurma(true)}>
                        Cadastrar a primeira
                      </Botao>
                    }
                  />
                </TabelaLinhaVazia>
              ) : (
                turmas.map((turma) => (
                  <TabelaLinha key={turma.id}>
                    <TabelaCelula>
                      <p className="font-medium text-texto">{turma.nome}</p>
                      <p className="text-xs text-texto-suave">
                        {turma.etapa}
                        {turma.catequistas && ` · ${turma.catequistas}`}
                      </p>
                    </TabelaCelula>
                    <TabelaCelula className="text-texto-suave">
                      {DIAS_DA_SEMANA[turma.diaSemana]}, {turma.hora}
                    </TabelaCelula>
                    <TabelaCelula className="text-texto-suave">
                      {turma.local ?? "—"}
                    </TabelaCelula>
                    <TabelaCelula className="text-texto-suave tabular-nums">
                      {turma.anoLetivo}
                    </TabelaCelula>
                    <TabelaCelula>
                      <Selo tom={turma.ativa ? "sucesso" : "neutro"}>
                        {turma.ativa ? "No site" : "Oculta"}
                      </Selo>
                    </TabelaCelula>
                    <TabelaCelula alinhamento="direita">
                      <div className="flex justify-end gap-1">
                        <BotaoIcone
                          icone={Pencil}
                          rotulo={`Editar ${turma.nome}`}
                          onClick={() => setTurmaEmEdicao(turma)}
                        />
                        <DialogoDeExclusao
                          nome={turma.nome}
                          descricao="Só é possível excluir turma sem nenhuma inscrição ligada a ela. Para tirá-la do site guardando o histórico, edite e desmarque “Mostrar no site”."
                          aoConfirmar={async () => {
                            const r = await excluirTurmaAcao(turma.id);
                            if (!r.ok && r.mensagem) setErro(r.mensagem);
                            return r;
                          }}
                        />
                      </div>
                    </TabelaCelula>
                  </TabelaLinha>
                ))
              )}
            </TabelaCorpo>
          </Tabela>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 3. Inscrições recebidas                                            */}
      {/* ----------------------------------------------------------------- */}
      <section aria-labelledby="inscricoes">
        <h3
          id="inscricoes"
          className="flex items-center gap-2 font-serif text-lg text-texto"
        >
          <Inbox className="h-5 w-5 text-destaque" aria-hidden />
          Inscrições recebidas
          {aguardando > 0 && (
            <Selo tom="atencao">{aguardando} aguardando resposta</Selo>
          )}
        </h3>
        <p className="mt-1 text-sm text-texto-suave">
          Pedidos feitos pelo site. Confirmar é da coordenação, depois de
          conferir documento e falar com a família.
        </p>

        {/* Dado de criança: fica dito na tela, não só na documentação. Quem
            usa o painel precisa saber o que tem em mãos. */}
        <div className="mt-3">
          <Alerta>
            Esta lista traz nome e data de nascimento de crianças e o telefone
            de quem responde por elas. Não imprima nem compartilhe fora da
            coordenação da catequese e da secretaria.
          </Alerta>
        </div>

        <form className="mt-4 flex flex-wrap items-end gap-3" method="get">
          <div className="min-w-56 flex-1">
            <CampoTexto
              name="busca"
              rotulo="Buscar"
              placeholder="Nome do catequizando ou do responsável..."
              defaultValue={busca}
              maxLength={120}
            />
          </div>
          <div className="w-52">
            <CampoSelecao
              name="status"
              rotulo="Situação"
              defaultValue={status}
              opcoes={[
                { valor: "", texto: "Todas" },
                ...STATUS_INSCRICAO.map((s) => ({
                  valor: s,
                  texto: ROTULO_STATUS_INSCRICAO[s],
                })),
              ]}
            />
          </div>
          <Botao type="submit" variante="secundario">
            Filtrar
          </Botao>
        </form>

        <div className="mt-4">
          <Tabela rotulo="Inscrições recebidas">
            <TabelaCabecalho>
              <TabelaTitulo>Catequizando</TabelaTitulo>
              <TabelaTitulo className="w-56">Responsável</TabelaTitulo>
              <TabelaTitulo className="w-44">Turma</TabelaTitulo>
              <TabelaTitulo className="w-44">Situação</TabelaTitulo>
              <TabelaTitulo alinhamento="direita" className="w-20">
                Ações
              </TabelaTitulo>
            </TabelaCabecalho>

            <TabelaCorpo>
              {inscricoes.length === 0 ? (
                <TabelaLinhaVazia colunas={5}>
                  <EstadoVazio
                    icone={Users}
                    titulo={
                      busca || status
                        ? "Nenhuma inscrição corresponde ao filtro"
                        : "Nenhuma inscrição recebida"
                    }
                    descricao={
                      busca || status
                        ? "Tente outras palavras ou limpe o filtro."
                        : config.inscricoesAbertas
                          ? "As inscrições estão abertas. Os pedidos feitos pelo site aparecem aqui."
                          : "As inscrições estão fechadas. Abra o período acima para o formulário aparecer no site."
                    }
                  />
                </TabelaLinhaVazia>
              ) : (
                inscricoes.map((inscricao) => (
                  <LinhaDeInscricao
                    key={inscricao.id}
                    inscricao={inscricao}
                    podeExcluir={podeExcluirInscricao}
                    aoMudar={concluir}
                    aoFalhar={setErro}
                  />
                ))
              )}
            </TabelaCorpo>
          </Tabela>
        </div>
      </section>

      {editandoPeriodo && (
        <FormularioDePeriodo
          config={config}
          aoFechar={() => setEditandoPeriodo(false)}
          aoConcluir={concluir}
        />
      )}

      {(criandoTurma || turmaEmEdicao) && (
        <FormularioDeTurma
          turma={turmaEmEdicao}
          anoPadrao={config.anoLetivo}
          aoFechar={() => {
            setCriandoTurma(false);
            setTurmaEmEdicao(null);
          }}
          aoConcluir={concluir}
        />
      )}
    </div>
  );
}

/**
 * Uma linha de inscrição, com a ficha completa aberta pela seta.
 *
 * A tabela mostra o mínimo para reconhecer o pedido; o resto (batismo,
 * padrinho, observação) só aparece quando a coordenação pede. Dado de criança
 * não fica exposto na tela por padrão, mesmo para quem tem permissão de ver.
 */
function LinhaDeInscricao({
  inscricao,
  podeExcluir,
  aoMudar,
  aoFalhar,
}: {
  inscricao: Inscricao;
  podeExcluir: boolean;
  aoMudar: (mensagem: string) => void;
  aoFalhar: (mensagem: string) => void;
}) {
  const [aberta, setAberta] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function mudarStatus(novo: string) {
    setSalvando(true);
    const r = await mudarStatusAcao(inscricao.id, novo);
    setSalvando(false);
    if (r.ok) aoMudar(r.mensagem ?? "Situação atualizada.");
    else if (r.mensagem) aoFalhar(r.mensagem);
  }

  return (
    <>
      <TabelaLinha>
        <TabelaCelula>
          <button
            type="button"
            onClick={() => setAberta((v) => !v)}
            aria-expanded={aberta}
            className="text-left"
          >
            <span className="font-medium text-texto underline decoration-dotted underline-offset-4">
              {inscricao.nome}
            </span>
            <span className="block text-xs text-texto-suave">
              {DATA_CURTA.format(new Date(inscricao.dataNascimento))} ·{" "}
              {ROTULO_TIPO_DE_INSCRICAO[inscricao.tipo]}
            </span>
          </button>
        </TabelaCelula>
        <TabelaCelula className="text-texto-suave">
          <p>{inscricao.responsavel}</p>
          <p className="text-xs">
            {inscricao.parentesco} · {inscricao.telefone}
          </p>
        </TabelaCelula>
        <TabelaCelula className="text-texto-suave">
          {inscricao.turma ? (
            <>
              <p>{inscricao.turma.nome}</p>
              <p className="text-xs">{inscricao.turma.etapa}</p>
            </>
          ) : (
            <span className="text-xs">Sem preferência</span>
          )}
        </TabelaCelula>
        <TabelaCelula>
          <div className="flex flex-col gap-1.5">
            <Selo tom={TOM_DO_STATUS_INSCRICAO[inscricao.status]}>
              {ROTULO_STATUS_INSCRICAO[inscricao.status]}
            </Selo>
            <select
              aria-label={`Situação da inscrição de ${inscricao.nome}`}
              value={inscricao.status}
              disabled={salvando}
              onChange={(e) => mudarStatus(e.target.value)}
              className="rounded-md border border-borda bg-superficie px-2 py-1 text-xs text-texto disabled:opacity-60"
            >
              {STATUS_INSCRICAO.map((s) => (
                <option key={s} value={s}>
                  {ROTULO_STATUS_INSCRICAO[s]}
                </option>
              ))}
            </select>
          </div>
        </TabelaCelula>
        <TabelaCelula alinhamento="direita">
          {podeExcluir && (
            <DialogoDeExclusao
              nome={`a inscrição de ${inscricao.nome}`}
              descricao="Apaga a ficha de vez, com os dados da criança e do responsável. Para recusar sem apagar, marque a inscrição como “Não aceita”."
              aoConfirmar={async () => {
                const r = await excluirInscricaoAcao(inscricao.id);
                if (!r.ok && r.mensagem) aoFalhar(r.mensagem);
                return r;
              }}
            />
          )}
        </TabelaCelula>
      </TabelaLinha>

      {aberta && (
        <TabelaLinha>
          <TabelaCelula colunas={5} className="bg-superficie-suave">
            <dl className="grid gap-x-8 gap-y-2 py-1 text-sm sm:grid-cols-2">
              <Ficha rotulo="Batizado">
                {inscricao.batizado
                  ? `Sim${inscricao.paroquiaBatismo ? ` — ${inscricao.paroquiaBatismo}` : ""}`
                  : "Ainda não"}
              </Ficha>
              <Ficha rotulo="E-mail do responsável">
                {inscricao.email ?? "Não informado"}
              </Ficha>
              <Ficha rotulo="Padrinho / madrinha">
                {inscricao.padrinho ?? "Não informado"}
              </Ficha>
              <Ficha rotulo="Ano da caminhada">{inscricao.anoLetivo}</Ficha>
              <Ficha rotulo="Pedido feito em">
                {DATA_CURTA.format(new Date(inscricao.criadoEm))}
              </Ficha>
              <Ficha rotulo="Uso dos dados autorizado em">
                {DATA_CURTA.format(new Date(inscricao.consentimentoEm))}
              </Ficha>
              {inscricao.observacao && (
                <div className="sm:col-span-2">
                  <Ficha rotulo="Observação da família">
                    {inscricao.observacao}
                  </Ficha>
                </div>
              )}
            </dl>
          </TabelaCelula>
        </TabelaLinha>
      )}
    </>
  );
}

function Ficha({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-texto-suave">
        {rotulo}
      </dt>
      <dd className="whitespace-pre-line text-texto">{children}</dd>
    </div>
  );
}

function FormularioDePeriodo({
  config,
  aoFechar,
  aoConcluir,
}: {
  config: ConfiguracaoDaCatequese;
  aoFechar: () => void;
  aoConcluir: (mensagem: string) => void;
}) {
  const [estado, enviar, pendente] = useActionState(
    salvarConfiguracaoAcao,
    ESTADO_INICIAL
  );

  useEffect(() => {
    if (estado.ok) aoConcluir(estado.mensagem ?? "Período salvo.");
  }, [estado, aoConcluir]);

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Período de inscrição"
      descricao="Controla se o formulário aparece no site da paróquia."
    >
      <form action={enviar} className="space-y-4" noValidate>
        <CampoBooleano
          name="inscricoesAbertas"
          rotulo="Inscrições abertas"
          dica="Marcado, o formulário aparece na página da Catequese e os pedidos passam a chegar aqui. Desmarcado, o site avisa que o período está fechado."
          defaultChecked={config.inscricoesAbertas}
        />

        <CampoTexto
          name="anoLetivo"
          rotulo="Ano da caminhada"
          required
          inputMode="numeric"
          maxLength={4}
          dica="Ex.: 2027. Só as turmas deste ano aparecem no site, e é ele que marca cada inscrição recebida."
          defaultValue={estado.valores?.anoLetivo ?? config.anoLetivo}
          erro={estado.erros?.anoLetivo?.[0]}
        />

        <CampoArea
          name="aviso"
          rotulo="Recado da coordenação (opcional)"
          rows={4}
          maxLength={2000}
          dica="Aparece na página da Catequese, com o período aberto ou fechado. Use para prazo, documentos necessários e onde entregar."
          defaultValue={estado.valores?.aviso ?? config.aviso ?? ""}
          erro={estado.erros?.aviso?.[0]}
        />

        {estado.mensagem && !estado.ok && !estado.erros && (
          <Alerta tom="perigo">{estado.mensagem}</Alerta>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Botao variante="secundario" type="button" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" pendente={pendente}>
            Salvar
          </Botao>
        </div>
      </form>
    </Modal>
  );
}

function FormularioDeTurma({
  turma,
  anoPadrao,
  aoFechar,
  aoConcluir,
}: {
  turma: Turma | null;
  anoPadrao: string;
  aoFechar: () => void;
  aoConcluir: (mensagem: string) => void;
}) {
  const [estado, enviar, pendente] = useActionState(salvarTurma, ESTADO_INICIAL);

  useEffect(() => {
    if (estado.ok) aoConcluir(estado.mensagem ?? "Turma salva.");
  }, [estado, aoConcluir]);

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={turma ? "Editar turma" : "Nova turma"}
      descricao="Dia, hora, lugar e quem dá a turma."
    >
      <form action={enviar} className="space-y-4" noValidate>
        {turma && <input type="hidden" name="id" value={turma.id} />}

        <CampoTexto
          name="nome"
          rotulo="Nome da turma"
          required
          maxLength={120}
          dica="Como a comunidade a chama. Ex.: “Eucaristia I — sábado de manhã”."
          defaultValue={estado.valores?.nome ?? turma?.nome ?? ""}
          erro={estado.erros?.nome?.[0]}
        />

        <CampoTexto
          name="etapa"
          rotulo="Etapa"
          required
          maxLength={60}
          dica="A etapa da caminhada, com o nome que a catequese usa. Ex.: Eucaristia I, Crisma, Catequese de adultos."
          defaultValue={estado.valores?.etapa ?? turma?.etapa ?? ""}
          erro={estado.erros?.etapa?.[0]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoSelecao
            name="diaSemana"
            rotulo="Dia"
            required
            defaultValue={String(turma?.diaSemana ?? 6)}
            opcoes={DIAS_DA_SEMANA.map((dia, indice) => ({
              valor: String(indice),
              texto: dia,
            }))}
            erro={estado.erros?.diaSemana?.[0]}
          />
          <CampoTexto
            name="hora"
            type="time"
            rotulo="Hora"
            required
            defaultValue={estado.valores?.hora ?? turma?.hora ?? "09:00"}
            erro={estado.erros?.hora?.[0]}
          />
        </div>

        <CampoTexto
          name="local"
          rotulo="Onde (opcional)"
          maxLength={120}
          list="espacos-da-paroquia"
          dica="Um dos espaços da paróquia, ou outro que você digitar."
          defaultValue={estado.valores?.local ?? turma?.local ?? ""}
          erro={estado.erros?.local?.[0]}
        />
        <datalist id="espacos-da-paroquia">
          {ESPACOS_DA_PAROQUIA.map((espaco) => (
            <option key={espaco} value={espaco} />
          ))}
        </datalist>

        <CampoTexto
          name="catequistas"
          rotulo="Catequistas (opcional)"
          maxLength={300}
          dica="Os nomes como devem aparecer no site. Ex.: “Maria das Graças e João Pedro”."
          defaultValue={
            estado.valores?.catequistas ?? turma?.catequistas ?? ""
          }
          erro={estado.erros?.catequistas?.[0]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto
            name="vagas"
            type="number"
            min={0}
            max={500}
            rotulo="Vagas"
            dica="Zero = sem limite. Não bloqueia a inscrição; serve para avisar que a turma encheu."
            defaultValue={estado.valores?.vagas ?? String(turma?.vagas ?? 0)}
            erro={estado.erros?.vagas?.[0]}
          />
          <CampoTexto
            name="anoLetivo"
            rotulo="Ano da caminhada"
            required
            inputMode="numeric"
            maxLength={4}
            defaultValue={
              estado.valores?.anoLetivo ?? turma?.anoLetivo ?? anoPadrao
            }
            erro={estado.erros?.anoLetivo?.[0]}
          />
        </div>

        <CampoTexto
          name="ordem"
          type="number"
          min={0}
          max={999}
          rotulo="Ordem de exibição"
          dica="Menor aparece primeiro na lista do site."
          defaultValue={estado.valores?.ordem ?? String(turma?.ordem ?? 0)}
          erro={estado.erros?.ordem?.[0]}
        />

        <CampoBooleano
          name="ativa"
          rotulo="Mostrar no site"
          dica="Desmarque para tirar a turma do site sem perder as inscrições ligadas a ela."
          defaultChecked={turma ? turma.ativa : true}
        />

        {estado.mensagem && !estado.ok && !estado.erros && (
          <Alerta tom="perigo">{estado.mensagem}</Alerta>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Botao variante="secundario" type="button" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" pendente={pendente}>
            {turma ? "Salvar alterações" : "Cadastrar turma"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
