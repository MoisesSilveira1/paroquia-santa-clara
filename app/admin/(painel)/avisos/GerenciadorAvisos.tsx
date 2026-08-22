"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Eye, EyeOff, Megaphone, Pencil, Plus } from "lucide-react";
import Botao, { BotaoIcone } from "@/components/ui/Botao";
import { CampoArea, CampoBooleano, CampoTexto } from "@/components/ui/Campo";
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
import type { Aviso } from "@/lib/servicos/avisos";
import { alternarAvisoAcao, excluirAvisoAcao, salvarAviso } from "./acoes";

export default function GerenciadorAvisos({
  itens,
  temFiltro,
}: {
  itens: Aviso[];
  /** Muda a mensagem de lista vazia: "nada ainda" ≠ "a busca não achou". */
  temFiltro: boolean;
}) {
  const [emEdicao, setEmEdicao] = useState<Aviso | null>(null);
  const [criando, setCriando] = useState(false);
  const [recado, setRecado] = useState<string | null>(null);

  const aberto = criando || emEdicao !== null;

  function fechar() {
    setCriando(false);
    setEmEdicao(null);
  }

  return (
    <>
      <div className="flex justify-end px-5 pt-4">
        <Botao icone={Plus} onClick={() => setCriando(true)}>
          Novo aviso
        </Botao>
      </div>

      {recado && (
        <div className="px-5 pt-3">
          <Alerta tom="sucesso">{recado}</Alerta>
        </div>
      )}

      <div className="mt-4">
        <Tabela rotulo="Avisos da semana">
          <TabelaCabecalho>
            <TabelaTitulo className="w-16">Ordem</TabelaTitulo>
            <TabelaTitulo>Aviso</TabelaTitulo>
            <TabelaTitulo className="w-32">Situação</TabelaTitulo>
            <TabelaTitulo alinhamento="direita" className="w-36">
              Ações
            </TabelaTitulo>
          </TabelaCabecalho>

          <TabelaCorpo>
            {itens.length === 0 ? (
              <TabelaLinhaVazia colunas={4}>
                <EstadoVazio
                  icone={Megaphone}
                  titulo={
                    temFiltro
                      ? "Nenhum aviso corresponde à busca"
                      : "Nenhum aviso cadastrado"
                  }
                  descricao={
                    temFiltro
                      ? "Tente outras palavras ou limpe os filtros."
                      : "Os avisos aparecem na página inicial do site, logo abaixo dos horários."
                  }
                  acao={
                    !temFiltro && (
                      <Botao icone={Plus} onClick={() => setCriando(true)}>
                        Criar o primeiro aviso
                      </Botao>
                    )
                  }
                />
              </TabelaLinhaVazia>
            ) : (
              itens.map((aviso) => (
                <LinhaDeAviso
                  key={aviso.id}
                  aviso={aviso}
                  aoEditar={() => setEmEdicao(aviso)}
                  aoAvisar={setRecado}
                />
              ))
            )}
          </TabelaCorpo>
        </Tabela>
      </div>

      {aberto && (
        <FormularioDeAviso
          aviso={emEdicao}
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

function LinhaDeAviso({
  aviso,
  aoEditar,
  aoAvisar,
}: {
  aviso: Aviso;
  aoEditar: () => void;
  aoAvisar: (mensagem: string) => void;
}) {
  const [pendente, iniciar] = useTransition();

  function alternar() {
    iniciar(async () => {
      const resultado = await alternarAvisoAcao(aviso.id, !aviso.ativo);
      if (resultado.mensagem) aoAvisar(resultado.mensagem);
    });
  }

  return (
    <TabelaLinha>
      <TabelaCelula className="text-texto-suave tabular-nums">
        {aviso.ordem}
      </TabelaCelula>
      <TabelaCelula>
        <p className="max-w-prose">{aviso.texto}</p>
      </TabelaCelula>
      <TabelaCelula>
        <Selo tom={aviso.ativo ? "sucesso" : "neutro"}>
          {aviso.ativo ? "No site" : "Oculto"}
        </Selo>
      </TabelaCelula>
      <TabelaCelula alinhamento="direita">
        <div className="flex justify-end gap-1">
          <BotaoIcone
            icone={aviso.ativo ? EyeOff : Eye}
            rotulo={aviso.ativo ? "Ocultar do site" : "Mostrar no site"}
            onClick={alternar}
            disabled={pendente}
          />
          <BotaoIcone icone={Pencil} rotulo="Editar aviso" onClick={aoEditar} />
          <DialogoDeExclusao
            nome="este aviso"
            descricao="Ele sai da página inicial do site imediatamente."
            aoConfirmar={() => excluirAvisoAcao(aviso.id)}
          />
        </div>
      </TabelaCelula>
    </TabelaLinha>
  );
}

function FormularioDeAviso({
  aviso,
  aoFechar,
  aoConcluir,
}: {
  aviso: Aviso | null;
  aoFechar: () => void;
  aoConcluir: (mensagem: string) => void;
}) {
  const [estado, enviar, pendente] = useActionState(salvarAviso, ESTADO_INICIAL);

  // Fecha a janela só depois que o servidor confirmou a gravação.
  useEffect(() => {
    if (estado.ok) aoConcluir(estado.mensagem ?? "Aviso salvo.");
  }, [estado, aoConcluir]);

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={aviso ? "Editar aviso" : "Novo aviso"}
      descricao="Recados curtos exibidos na página inicial do site."
    >
      <form action={enviar} className="space-y-4" noValidate>
        {aviso && <input type="hidden" name="id" value={aviso.id} />}

        <CampoArea
          name="texto"
          rotulo="Texto do aviso"
          required
          rows={3}
          maxLength={280}
          dica="Até 280 caracteres. Escreva como se falasse com a comunidade."
          defaultValue={estado.valores?.texto ?? aviso?.texto ?? ""}
          erro={estado.erros?.texto?.[0]}
        />

        <CampoTexto
          name="ordem"
          type="number"
          min={0}
          max={999}
          rotulo="Ordem de exibição"
          dica="Menor aparece primeiro."
          defaultValue={estado.valores?.ordem ?? String(aviso?.ordem ?? 0)}
          erro={estado.erros?.ordem?.[0]}
        />

        <CampoBooleano
          name="ativo"
          rotulo="Mostrar no site"
          dica="Desmarque para guardar o texto sem publicá-lo."
          defaultChecked={aviso ? aviso.ativo : true}
        />

        {/* Falha geral (sem permissao, erro do banco). Quando o problema e de
            campo, a mensagem ja esta embaixo dele e repetir aqui so polui. */}
        {estado.mensagem && !estado.ok && !estado.erros && (
          <Alerta tom="perigo">{estado.mensagem}</Alerta>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Botao variante="secundario" type="button" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" pendente={pendente}>
            {aviso ? "Salvar alterações" : "Publicar aviso"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
