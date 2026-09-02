"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Plus, ShieldCheck } from "lucide-react";
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
import { NOME_DO_PAPEL } from "@/components/admin/navegacao";
import { ESTADO_INICIAL } from "@/lib/servicos/resultado";
import type { UsuarioDaLista } from "@/lib/servicos/usuarios";
import { PAPEIS } from "@/lib/validacao/esquemas";
import { excluirUsuarioAcao, salvarUsuario } from "./acoes";

const FORMATO = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default function GerenciadorUsuarios({
  itens,
  meuId,
}: {
  itens: UsuarioDaLista[];
  /** Para marcar a própria linha e evitar que alguém se exclua. */
  meuId: string;
}) {
  const [emEdicao, setEmEdicao] = useState<UsuarioDaLista | null>(null);
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
          Novo usuário
        </Botao>
      </div>

      {recado && (
        <div className="px-5 pt-3">
          <Alerta tom="sucesso">{recado}</Alerta>
        </div>
      )}

      <div className="mt-4">
        <Tabela rotulo="Usuários do painel">
          <TabelaCabecalho>
            <TabelaTitulo>Pessoa</TabelaTitulo>
            <TabelaTitulo className="w-40">Nível de acesso</TabelaTitulo>
            <TabelaTitulo className="w-28">Situação</TabelaTitulo>
            <TabelaTitulo className="w-36">Último acesso</TabelaTitulo>
            <TabelaTitulo alinhamento="direita" className="w-24">
              Ações
            </TabelaTitulo>
          </TabelaCabecalho>

          <TabelaCorpo>
            {itens.length === 0 ? (
              <TabelaLinhaVazia colunas={5}>
                <EstadoVazio
                  icone={ShieldCheck}
                  titulo="Nenhum usuário encontrado"
                  descricao="Ajuste a busca ou cadastre alguém da equipe."
                />
              </TabelaLinhaVazia>
            ) : (
              itens.map((usuario) => {
                const souEu = usuario.id === meuId;
                return (
                  <TabelaLinha key={usuario.id}>
                    <TabelaCelula>
                      <p className="font-medium text-texto">
                        {usuario.nome}
                        {souEu && (
                          <span className="ml-2 text-xs font-normal text-texto-suave">
                            (você)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-texto-suave">{usuario.email}</p>
                    </TabelaCelula>
                    <TabelaCelula>
                      <Selo
                        tom={usuario.papel === "SUPER_ADMIN" ? "info" : "neutro"}
                      >
                        {NOME_DO_PAPEL[usuario.papel]}
                      </Selo>
                    </TabelaCelula>
                    <TabelaCelula>
                      <Selo tom={usuario.ativo ? "sucesso" : "perigo"}>
                        {usuario.ativo ? "Ativo" : "Desativado"}
                      </Selo>
                    </TabelaCelula>
                    <TabelaCelula className="text-texto-suave tabular-nums">
                      {usuario.ultimoAcesso
                        ? FORMATO.format(usuario.ultimoAcesso)
                        : "Nunca entrou"}
                    </TabelaCelula>
                    <TabelaCelula alinhamento="direita">
                      <div className="flex justify-end gap-1">
                        <BotaoIcone
                          icone={Pencil}
                          rotulo={`Editar ${usuario.nome}`}
                          onClick={() => setEmEdicao(usuario)}
                        />
                        {/* Sem botão de excluir na própria linha: o serviço
                            recusa de qualquer forma, e oferecer o botão só
                            para dar erro seria uma armadilha. */}
                        {!souEu && (
                          <DialogoDeExclusao
                            nome={usuario.nome}
                            descricao="As notícias publicadas por essa pessoa continuam no site, sem autor."
                            aoConfirmar={() => excluirUsuarioAcao(usuario.id)}
                          />
                        )}
                      </div>
                    </TabelaCelula>
                  </TabelaLinha>
                );
              })
            )}
          </TabelaCorpo>
        </Tabela>
      </div>

      {(criando || emEdicao) && (
        <FormularioDeUsuario
          usuario={emEdicao}
          souEu={emEdicao?.id === meuId}
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

function FormularioDeUsuario({
  usuario,
  souEu,
  aoFechar,
  aoConcluir,
}: {
  usuario: UsuarioDaLista | null;
  souEu: boolean;
  aoFechar: () => void;
  aoConcluir: (mensagem: string) => void;
}) {
  const [estado, enviar, pendente] = useActionState(salvarUsuario, ESTADO_INICIAL);

  useEffect(() => {
    if (estado.ok) aoConcluir(estado.mensagem ?? "Usuário salvo.");
  }, [estado, aoConcluir]);

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={usuario ? "Editar usuário" : "Novo usuário"}
      descricao="Quem pode entrar no painel da secretaria."
    >
      <form action={enviar} className="space-y-4" noValidate>
        {usuario && <input type="hidden" name="id" value={usuario.id} />}

        <CampoTexto
          name="nome"
          rotulo="Nome"
          required
          maxLength={120}
          defaultValue={estado.valores?.nome ?? usuario?.nome ?? ""}
          erro={estado.erros?.nome?.[0]}
        />

        <CampoTexto
          name="email"
          type="email"
          rotulo="E-mail"
          required
          autoComplete="off"
          dica="É com este endereço que a pessoa entra no painel."
          defaultValue={estado.valores?.email ?? usuario?.email ?? ""}
          erro={estado.erros?.email?.[0]}
        />

        <CampoTexto
          name="senha"
          type="password"
          rotulo={usuario ? "Nova senha (opcional)" : "Senha"}
          required={!usuario}
          autoComplete="new-password"
          dica={
            usuario
              ? "Deixe em branco para manter a senha atual. Ao trocá-la, as sessões abertas caem."
              : "Ao menos 8 caracteres. Combine com a pessoa e peça que troque depois."
          }
          erro={estado.erros?.senha?.[0]}
        />

        <CampoSelecao
          name="papel"
          rotulo="Nível de acesso"
          disabled={souEu}
          dica={
            souEu
              ? "Você não pode mudar o próprio nível de acesso."
              : "Administrador também gerencia quem entra no painel."
          }
          defaultValue={estado.valores?.papel ?? usuario?.papel ?? "SECRETARIA"}
          opcoes={PAPEIS.map((papel) => ({
            valor: papel,
            texto: NOME_DO_PAPEL[papel],
          }))}
          erro={estado.erros?.papel?.[0]}
        />

        {usuario && (
          <CampoBooleano
            name="ativo"
            rotulo="Acesso liberado"
            disabled={souEu}
            dica={
              souEu
                ? "Você não pode desativar o próprio acesso."
                : "Desmarque para bloquear a entrada sem apagar o cadastro."
            }
            defaultChecked={usuario.ativo}
          />
        )}

        {/* Campos desabilitados não são enviados pelo navegador. Sem estes,
            editar a própria conta apagaria o papel e desativaria o acesso. */}
        {usuario && souEu && (
          <>
            <input type="hidden" name="papel" value={usuario.papel} />
            <input type="hidden" name="ativo" value="on" />
          </>
        )}

        {estado.mensagem && !estado.ok && !estado.erros && (
          <Alerta tom="perigo">{estado.mensagem}</Alerta>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Botao variante="secundario" type="button" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" pendente={pendente}>
            {usuario ? "Salvar alterações" : "Cadastrar usuário"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
