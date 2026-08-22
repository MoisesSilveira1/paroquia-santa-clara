"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Plus, Users } from "lucide-react";
import Botao, { BotaoIcone } from "@/components/ui/Botao";
import {
  CampoArea,
  CampoBooleano,
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
import type { Pastoral } from "@/lib/servicos/pastorais";
import { excluirPastoralAcao, salvarPastoral } from "./acoes";

export default function GerenciadorPastorais({
  itens,
  temFiltro,
}: {
  itens: Pastoral[];
  temFiltro: boolean;
}) {
  const [emEdicao, setEmEdicao] = useState<Pastoral | null>(null);
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
          Nova pastoral
        </Botao>
      </div>

      {recado && (
        <div className="px-5 pt-3">
          <Alerta tom="sucesso">{recado}</Alerta>
        </div>
      )}

      <div className="mt-4">
        <Tabela rotulo="Pastorais e movimentos">
          <TabelaCabecalho>
            <TabelaTitulo className="w-16">Ordem</TabelaTitulo>
            <TabelaTitulo>Pastoral</TabelaTitulo>
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
                  icone={Users}
                  titulo={
                    temFiltro
                      ? "Nenhuma pastoral corresponde aos filtros"
                      : "Nenhuma pastoral cadastrada"
                  }
                  descricao={
                    temFiltro
                      ? "Tente outras palavras ou limpe os filtros."
                      : "É esta lista que aparece na página Pastorais do site."
                  }
                  acao={
                    !temFiltro && (
                      <Botao icone={Plus} onClick={() => setCriando(true)}>
                        Cadastrar a primeira
                      </Botao>
                    )
                  }
                />
              </TabelaLinhaVazia>
            ) : (
              itens.map((pastoral) => (
                <TabelaLinha key={pastoral.id}>
                  <TabelaCelula className="text-texto-suave tabular-nums">
                    {pastoral.ordem}
                  </TabelaCelula>
                  <TabelaCelula>
                    <p className="font-medium text-texto">{pastoral.nome}</p>
                    <p className="mt-0.5 line-clamp-2 max-w-prose text-xs text-texto-suave">
                      {pastoral.descricao}
                    </p>
                  </TabelaCelula>
                  <TabelaCelula className="text-texto-suave">
                    <p>{pastoral.contato}</p>
                    <p className="mt-0.5 text-xs">{pastoral.reunioes}</p>
                  </TabelaCelula>
                  <TabelaCelula>
                    <Selo tom={pastoral.ativa ? "sucesso" : "neutro"}>
                      {pastoral.ativa ? "No site" : "Oculta"}
                    </Selo>
                  </TabelaCelula>
                  <TabelaCelula alinhamento="direita">
                    <div className="flex justify-end gap-1">
                      <BotaoIcone
                        icone={Pencil}
                        rotulo={`Editar ${pastoral.nome}`}
                        onClick={() => setEmEdicao(pastoral)}
                      />
                      <DialogoDeExclusao
                        nome={pastoral.nome}
                        aoConfirmar={() => excluirPastoralAcao(pastoral.id)}
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
        <FormularioDePastoral
          pastoral={emEdicao}
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

function FormularioDePastoral({
  pastoral,
  aoFechar,
  aoConcluir,
}: {
  pastoral: Pastoral | null;
  aoFechar: () => void;
  aoConcluir: (mensagem: string) => void;
}) {
  const [estado, enviar, pendente] = useActionState(
    salvarPastoral,
    ESTADO_INICIAL
  );

  useEffect(() => {
    if (estado.ok) aoConcluir(estado.mensagem ?? "Pastoral salva.");
  }, [estado, aoConcluir]);

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={pastoral ? "Editar pastoral" : "Nova pastoral"}
      descricao="Aparece na página Pastorais e Movimentos do site."
    >
      <form action={enviar} className="space-y-4" noValidate>
        {pastoral && <input type="hidden" name="id" value={pastoral.id} />}

        <CampoTexto
          name="nome"
          rotulo="Nome"
          required
          maxLength={120}
          defaultValue={estado.valores?.nome ?? pastoral?.nome ?? ""}
          erro={estado.erros?.nome?.[0]}
        />

        <CampoArea
          name="descricao"
          rotulo="O que faz"
          required
          rows={3}
          maxLength={600}
          dica="Uma ou duas frases sobre o serviço da pastoral na comunidade."
          defaultValue={estado.valores?.descricao ?? pastoral?.descricao ?? ""}
          erro={estado.erros?.descricao?.[0]}
        />

        <CampoTexto
          name="contato"
          rotulo="Contato"
          required
          maxLength={160}
          dica="Quem procurar e como. Ex.: Secretaria — (61) 3427-3281."
          defaultValue={estado.valores?.contato ?? pastoral?.contato ?? ""}
          erro={estado.erros?.contato?.[0]}
        />

        <CampoTexto
          name="reunioes"
          rotulo="Reuniões"
          required
          maxLength={160}
          dica='Quando o grupo se encontra. Ex.: "Sábados, 15h, na sala 2".'
          defaultValue={estado.valores?.reunioes ?? pastoral?.reunioes ?? ""}
          erro={estado.erros?.reunioes?.[0]}
        />

        <CampoTexto
          name="ordem"
          type="number"
          min={0}
          max={999}
          rotulo="Ordem de exibição"
          dica="Menor aparece primeiro."
          defaultValue={estado.valores?.ordem ?? String(pastoral?.ordem ?? 0)}
          erro={estado.erros?.ordem?.[0]}
        />

        <CampoBooleano
          name="ativa"
          rotulo="Mostrar no site"
          defaultChecked={pastoral ? pastoral.ativa : true}
        />

        {estado.mensagem && !estado.ok && !estado.erros && (
          <Alerta tom="perigo">{estado.mensagem}</Alerta>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Botao variante="secundario" type="button" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" pendente={pendente}>
            {pastoral ? "Salvar alterações" : "Cadastrar pastoral"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
