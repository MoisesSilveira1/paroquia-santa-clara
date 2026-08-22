"use client";

import { useActionState, useEffect, useState } from "react";
import { Newspaper, Pencil, Plus, Star } from "lucide-react";
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
import type { NoticiaDaLista } from "@/lib/servicos/noticias";
import {
  CATEGORIAS_NOTICIA,
  ROTULO_CATEGORIA,
  ROTULO_STATUS_NOTICIA,
  STATUS_NOTICIA,
} from "@/lib/validacao/esquemas";
import { TOM_DO_STATUS_NOTICIA } from "../tons";
import { excluirNoticiaAcao, salvarNoticia } from "./acoes";

const FORMATO_DATA = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

/** Data no formato que o campo `<input type="date">` entende. */
function paraCampoData(data: Date | null | undefined): string {
  if (!data) return "";
  return data.toISOString().slice(0, 10);
}

export default function GerenciadorNoticias({
  itens,
  temFiltro,
}: {
  itens: NoticiaDaLista[];
  temFiltro: boolean;
}) {
  const [emEdicao, setEmEdicao] = useState<NoticiaDaLista | null>(null);
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
          Nova notícia
        </Botao>
      </div>

      {recado && (
        <div className="px-5 pt-3">
          <Alerta tom="sucesso">{recado}</Alerta>
        </div>
      )}

      <div className="mt-4">
        <Tabela rotulo="Notícias e eventos">
          <TabelaCabecalho>
            <TabelaTitulo>Título</TabelaTitulo>
            <TabelaTitulo className="w-28">Categoria</TabelaTitulo>
            <TabelaTitulo className="w-32">Situação</TabelaTitulo>
            <TabelaTitulo className="w-28">Publicação</TabelaTitulo>
            <TabelaTitulo alinhamento="direita" className="w-28">
              Ações
            </TabelaTitulo>
          </TabelaCabecalho>

          <TabelaCorpo>
            {itens.length === 0 ? (
              <TabelaLinhaVazia colunas={5}>
                <EstadoVazio
                  icone={Newspaper}
                  titulo={
                    temFiltro
                      ? "Nenhuma notícia corresponde aos filtros"
                      : "Nenhuma notícia cadastrada"
                  }
                  descricao={
                    temFiltro
                      ? "Tente outras palavras ou limpe os filtros."
                      : "O mural de notícias do site fica vazio até a primeira publicação."
                  }
                  acao={
                    !temFiltro && (
                      <Botao icone={Plus} onClick={() => setCriando(true)}>
                        Criar a primeira notícia
                      </Botao>
                    )
                  }
                />
              </TabelaLinhaVazia>
            ) : (
              itens.map((noticia) => (
                <TabelaLinha key={noticia.id}>
                  <TabelaCelula>
                    <div className="flex items-start gap-2">
                      {noticia.destaque && (
                        <Star
                          className="mt-0.5 h-4 w-4 shrink-0 fill-destaque text-destaque"
                          aria-label="Em destaque"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-texto">{noticia.titulo}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-texto-suave">
                          {noticia.resumo}
                        </p>
                      </div>
                    </div>
                  </TabelaCelula>
                  <TabelaCelula className="text-texto-suave">
                    {ROTULO_CATEGORIA[noticia.categoria]}
                  </TabelaCelula>
                  <TabelaCelula>
                    <Selo tom={TOM_DO_STATUS_NOTICIA[noticia.status]}>
                      {ROTULO_STATUS_NOTICIA[noticia.status]}
                    </Selo>
                  </TabelaCelula>
                  <TabelaCelula className="text-texto-suave tabular-nums">
                    {noticia.publicadaEm
                      ? FORMATO_DATA.format(noticia.publicadaEm)
                      : "—"}
                  </TabelaCelula>
                  <TabelaCelula alinhamento="direita">
                    <div className="flex justify-end gap-1">
                      <BotaoIcone
                        icone={Pencil}
                        rotulo={`Editar ${noticia.titulo}`}
                        onClick={() => setEmEdicao(noticia)}
                      />
                      <DialogoDeExclusao
                        nome={noticia.titulo}
                        descricao="O endereço dela no site deixa de existir; links já divulgados param de funcionar."
                        aoConfirmar={() => excluirNoticiaAcao(noticia.id)}
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
        <FormularioDeNoticia
          noticia={emEdicao}
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

function FormularioDeNoticia({
  noticia,
  aoFechar,
  aoConcluir,
}: {
  noticia: NoticiaDaLista | null;
  aoFechar: () => void;
  aoConcluir: (mensagem: string) => void;
}) {
  const [estado, enviar, pendente] = useActionState(salvarNoticia, ESTADO_INICIAL);

  useEffect(() => {
    if (estado.ok) aoConcluir(estado.mensagem ?? "Notícia salva.");
  }, [estado, aoConcluir]);

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={noticia ? "Editar notícia" : "Nova notícia"}
      descricao="Aparece no mural de notícias e eventos do site."
    >
      <form action={enviar} className="space-y-4" noValidate>
        {noticia && <input type="hidden" name="id" value={noticia.id} />}

        <CampoTexto
          name="titulo"
          rotulo="Título"
          required
          maxLength={160}
          defaultValue={estado.valores?.titulo ?? noticia?.titulo ?? ""}
          erro={estado.erros?.titulo?.[0]}
        />

        <CampoArea
          name="resumo"
          rotulo="Resumo"
          required
          rows={3}
          maxLength={400}
          dica="É o texto que aparece na lista do site. Diga o essencial: o quê, quando e onde."
          defaultValue={estado.valores?.resumo ?? noticia?.resumo ?? ""}
          erro={estado.erros?.resumo?.[0]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoSelecao
            name="categoria"
            rotulo="Categoria"
            defaultValue={
              estado.valores?.categoria ?? noticia?.categoria ?? "NOTICIA"
            }
            opcoes={CATEGORIAS_NOTICIA.map((c) => ({
              valor: c,
              texto: ROTULO_CATEGORIA[c],
            }))}
            erro={estado.erros?.categoria?.[0]}
          />

          <CampoSelecao
            name="status"
            rotulo="Situação"
            defaultValue={estado.valores?.status ?? noticia?.status ?? "RASCUNHO"}
            opcoes={STATUS_NOTICIA.map((s) => ({
              valor: s,
              texto: ROTULO_STATUS_NOTICIA[s],
            }))}
            erro={estado.erros?.status?.[0]}
          />
        </div>

        <CampoTexto
          name="publicadaEm"
          type="date"
          rotulo="Data de publicação"
          dica="Em branco, ao publicar, usa a data de hoje."
          defaultValue={
            estado.valores?.publicadaEm ?? paraCampoData(noticia?.publicadaEm)
          }
          erro={estado.erros?.publicadaEm?.[0]}
        />

        <CampoArea
          name="corpo"
          rotulo="Texto completo (opcional)"
          rows={6}
          dica="Deixe em branco se o resumo já disser tudo."
          defaultValue={estado.valores?.corpo ?? noticia?.corpo ?? ""}
          erro={estado.erros?.corpo?.[0]}
        />

        <CampoBooleano
          name="destaque"
          rotulo="Destacar no topo"
          dica="Notícias em destaque aparecem antes das demais."
          defaultChecked={noticia?.destaque ?? false}
        />

        {estado.mensagem && !estado.ok && !estado.erros && (
          <Alerta tom="perigo">{estado.mensagem}</Alerta>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Botao variante="secundario" type="button" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" pendente={pendente}>
            {noticia ? "Salvar alterações" : "Criar notícia"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
