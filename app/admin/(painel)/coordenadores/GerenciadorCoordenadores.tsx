"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Plus, UserCog } from "lucide-react";
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
import type {
  Coordenador,
  OpcaoDePastoral,
} from "@/lib/servicos/coordenadores";
import { excluirCoordenadorAcao, salvarCoordenador } from "./acoes";

export default function GerenciadorCoordenadores({
  itens,
  pastorais,
  podeExcluir,
  temFiltro,
}: {
  itens: Coordenador[];
  pastorais: OpcaoDePastoral[];
  /** Decide se o botão aparece. Quem barra de verdade é o acoes.ts. */
  podeExcluir: boolean;
  temFiltro: boolean;
}) {
  const [emEdicao, setEmEdicao] = useState<Coordenador | null>(null);
  const [criando, setCriando] = useState(false);
  const [recado, setRecado] = useState<string | null>(null);

  const semPastorais = pastorais.length === 0;

  function fechar() {
    setCriando(false);
    setEmEdicao(null);
  }

  return (
    <>
      <div className="flex justify-end px-5 pt-4">
        <Botao icone={Plus} onClick={() => setCriando(true)} disabled={semPastorais}>
          Novo coordenador
        </Botao>
      </div>

      {recado && (
        <div className="px-5 pt-3">
          <Alerta tom="sucesso">{recado}</Alerta>
        </div>
      )}

      {/* Coordenador existe sempre de alguma coisa. Sem nenhuma pastoral
          cadastrada, o formulário não teria o que oferecer no seletor. */}
      {semPastorais && (
        <div className="px-5 pt-3">
          <Alerta tom="atencao">
            Cadastre primeiro as pastorais e coordenações, em Pastorais. É a
            elas que o coordenador fica ligado.
          </Alerta>
        </div>
      )}

      {!podeExcluir && !semPastorais && (
        <div className="px-5 pt-3">
          <Alerta>
            Você cadastra e edita coordenadores. Para tirar um nome do site sem
            depender de ninguém, edite a pessoa e desmarque “Mostrar no site” —
            excluir o cadastro é do padre ou do administrador geral.
          </Alerta>
        </div>
      )}

      <div className="mt-4">
        <Tabela rotulo="Coordenadores das pastorais">
          <TabelaCabecalho>
            <TabelaTitulo>Pessoa</TabelaTitulo>
            <TabelaTitulo className="w-48">Coordenação</TabelaTitulo>
            <TabelaTitulo className="w-56">Contato</TabelaTitulo>
            <TabelaTitulo className="w-28">Situação</TabelaTitulo>
            <TabelaTitulo alinhamento="direita" className="w-24">
              Ações
            </TabelaTitulo>
          </TabelaCabecalho>

          <TabelaCorpo>
            {itens.length === 0 ? (
              <TabelaLinhaVazia colunas={5}>
                <EstadoVazio
                  icone={UserCog}
                  titulo={
                    temFiltro
                      ? "Nenhum coordenador corresponde aos filtros"
                      : "Nenhum coordenador cadastrado"
                  }
                  descricao={
                    temFiltro
                      ? "Tente outras palavras ou limpe os filtros."
                      : "Cadastre quem responde por cada pastoral: o nome aparece na página Pastorais do site."
                  }
                  acao={
                    !temFiltro &&
                    !semPastorais && (
                      <Botao icone={Plus} onClick={() => setCriando(true)}>
                        Cadastrar o primeiro
                      </Botao>
                    )
                  }
                />
              </TabelaLinhaVazia>
            ) : (
              itens.map((coordenador) => (
                <TabelaLinha key={coordenador.id}>
                  <TabelaCelula>
                    <p className="font-medium text-texto">{coordenador.nome}</p>
                    <p className="text-xs text-texto-suave">
                      {coordenador.funcao}
                      {!coordenador.naCoordenacao && " · equipe"}
                    </p>
                  </TabelaCelula>
                  <TabelaCelula className="text-texto-suave">
                    {coordenador.pastoral.nome}
                  </TabelaCelula>
                  <TabelaCelula className="text-texto-suave">
                    {coordenador.telefone || coordenador.email ? (
                      <>
                        <p>{coordenador.telefone ?? coordenador.email}</p>
                        <p className="mt-0.5 text-xs">
                          {coordenador.contatoPublico
                            ? "Aparece no site"
                            : "Só a secretaria vê"}
                        </p>
                      </>
                    ) : (
                      <span className="text-xs">Sem contato cadastrado</span>
                    )}
                  </TabelaCelula>
                  <TabelaCelula>
                    <Selo tom={coordenador.ativo ? "sucesso" : "neutro"}>
                      {coordenador.ativo ? "No site" : "Oculto"}
                    </Selo>
                  </TabelaCelula>
                  <TabelaCelula alinhamento="direita">
                    <div className="flex justify-end gap-1">
                      <BotaoIcone
                        icone={Pencil}
                        rotulo={`Editar ${coordenador.nome}`}
                        onClick={() => setEmEdicao(coordenador)}
                      />
                      {podeExcluir && (
                        <DialogoDeExclusao
                          nome={coordenador.nome}
                          descricao="A pastoral continua no site; sai apenas o nome de quem a coordena."
                          aoConfirmar={() =>
                            excluirCoordenadorAcao(coordenador.id)
                          }
                        />
                      )}
                    </div>
                  </TabelaCelula>
                </TabelaLinha>
              ))
            )}
          </TabelaCorpo>
        </Tabela>
      </div>

      {(criando || emEdicao) && (
        <FormularioDeCoordenador
          coordenador={emEdicao}
          pastorais={pastorais}
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

/** Sugestões de função — o campo aceita qualquer texto, isto é só atalho. */
const FUNCOES = [
  "Coordenador(a)",
  "Vice-coordenador(a)",
  "Secretário(a)",
  "Tesoureiro(a)",
  "Assessor(a)",
];

function FormularioDeCoordenador({
  coordenador,
  pastorais,
  aoFechar,
  aoConcluir,
}: {
  coordenador: Coordenador | null;
  pastorais: OpcaoDePastoral[];
  aoFechar: () => void;
  aoConcluir: (mensagem: string) => void;
}) {
  const [estado, enviar, pendente] = useActionState(
    salvarCoordenador,
    ESTADO_INICIAL
  );

  useEffect(() => {
    if (estado.ok) aoConcluir(estado.mensagem ?? "Coordenador salvo.");
  }, [estado, aoConcluir]);

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={coordenador ? "Editar coordenador" : "Novo coordenador"}
      descricao="Quem responde pela pastoral ou coordenação."
    >
      <form action={enviar} className="space-y-4" noValidate>
        {coordenador && <input type="hidden" name="id" value={coordenador.id} />}

        <CampoTexto
          name="nome"
          rotulo="Nome"
          required
          maxLength={120}
          defaultValue={estado.valores?.nome ?? coordenador?.nome ?? ""}
          erro={estado.erros?.nome?.[0]}
        />

        <CampoTexto
          name="funcao"
          rotulo="Função"
          required
          maxLength={60}
          list="funcoes-de-coordenacao"
          dica="Como a pessoa é chamada no grupo. Ex.: Coordenador(a), Vice."
          defaultValue={
            estado.valores?.funcao ?? coordenador?.funcao ?? FUNCOES[0]
          }
          erro={estado.erros?.funcao?.[0]}
        />
        <datalist id="funcoes-de-coordenacao">
          {FUNCOES.map((funcao) => (
            <option key={funcao} value={funcao} />
          ))}
        </datalist>

        <CampoSelecao
          name="pastoralId"
          rotulo="Coordenação"
          required
          dica="A pastoral ou coordenação por que a pessoa responde."
          defaultValue={
            estado.valores?.pastoralId ??
            coordenador?.pastoralId ??
            pastorais[0]?.id
          }
          opcoes={pastorais.map((p) => ({
            valor: p.id,
            texto: p.ativa ? p.nome : `${p.nome} (oculta no site)`,
          }))}
          erro={estado.erros?.pastoralId?.[0]}
        />

        <CampoTexto
          name="telefone"
          rotulo="Telefone (opcional)"
          maxLength={40}
          dica="Com DDD. Ex.: (61) 99999-0000."
          defaultValue={estado.valores?.telefone ?? coordenador?.telefone ?? ""}
          erro={estado.erros?.telefone?.[0]}
        />

        <CampoTexto
          name="email"
          type="email"
          rotulo="E-mail (opcional)"
          autoComplete="off"
          defaultValue={estado.valores?.email ?? coordenador?.email ?? ""}
          erro={estado.erros?.email?.[0]}
        />

        <CampoBooleano
          name="naCoordenacao"
          rotulo="Faz parte da coordenação"
          dica="Marcado, aparece em “Coordenação” — é quem a comunidade procura. Desmarcado, entra na lista da equipe."
          defaultChecked={coordenador?.naCoordenacao ?? true}
        />

        <CampoBooleano
          name="contatoPublico"
          rotulo="Mostrar o contato no site"
          dica="Só marque com o consentimento da pessoa: o telefone fica visível para qualquer visitante. Desmarcado, o contato serve apenas à secretaria."
          defaultChecked={coordenador?.contatoPublico ?? false}
        />

        <CampoTexto
          name="ordem"
          type="number"
          min={0}
          max={999}
          rotulo="Ordem de exibição"
          dica="Menor aparece primeiro. Serve para o coordenador vir antes do vice."
          defaultValue={estado.valores?.ordem ?? String(coordenador?.ordem ?? 0)}
          erro={estado.erros?.ordem?.[0]}
        />

        <CampoBooleano
          name="ativo"
          rotulo="Mostrar no site"
          dica="Desmarque quando a pessoa deixar a coordenação: o nome sai do site e o cadastro fica guardado."
          defaultChecked={coordenador ? coordenador.ativo : true}
        />

        {estado.mensagem && !estado.ok && !estado.erros && (
          <Alerta tom="perigo">{estado.mensagem}</Alerta>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Botao variante="secundario" type="button" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" pendente={pendente}>
            {coordenador ? "Salvar alterações" : "Cadastrar coordenador"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
