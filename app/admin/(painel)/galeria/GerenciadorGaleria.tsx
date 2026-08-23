"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Check, Images, ImagePlus, Pencil, Plus, Upload } from "lucide-react";
import Botao, { BotaoIcone } from "@/components/ui/Botao";
import { CampoBooleano, CampoTexto } from "@/components/ui/Campo";
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
import { ESTADO_INICIAL, type EstadoFormulario } from "@/lib/servicos/resultado";
import type { AlbumDaLista, FotoDoAlbum } from "@/lib/servicos/galeria";
import {
  ACEITE,
  MAXIMO_DE_ARQUIVOS,
  conferirLote,
  formatarTamanho,
} from "@/lib/imagens/limites";
import {
  enviarFotosAcao,
  excluirAlbumAcao,
  excluirFotoAcao,
  salvarLegendaAcao,
  salvarAlbum,
} from "./acoes";

const FORMATO = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

function paraCampoData(data: Date | null | undefined): string {
  return data ? data.toISOString().slice(0, 10) : "";
}

export default function GerenciadorGaleria({
  itens,
  fotosPorAlbum,
  temFiltro,
}: {
  itens: AlbumDaLista[];
  /** Fotos de cada álbum, para a janela de gerenciamento. */
  fotosPorAlbum: Record<string, FotoDoAlbum[]>;
  temFiltro: boolean;
}) {
  const [emEdicao, setEmEdicao] = useState<AlbumDaLista | null>(null);
  const [criando, setCriando] = useState(false);
  const [gerenciandoFotos, setGerenciandoFotos] = useState<AlbumDaLista | null>(
    null
  );
  const [recado, setRecado] = useState<string | null>(null);

  function fechar() {
    setCriando(false);
    setEmEdicao(null);
  }

  return (
    <>
      <div className="flex justify-end px-5 pt-4">
        <Botao icone={Plus} onClick={() => setCriando(true)}>
          Novo álbum
        </Botao>
      </div>

      {recado && (
        <div className="px-5 pt-3">
          <Alerta tom="sucesso">{recado}</Alerta>
        </div>
      )}

      <div className="mt-4">
        <Tabela rotulo="Álbuns de fotos">
          <TabelaCabecalho>
            <TabelaTitulo>Álbum</TabelaTitulo>
            <TabelaTitulo className="w-28">Data</TabelaTitulo>
            <TabelaTitulo className="w-20">Fotos</TabelaTitulo>
            <TabelaTitulo className="w-28">Situação</TabelaTitulo>
            <TabelaTitulo alinhamento="direita" className="w-32">
              Ações
            </TabelaTitulo>
          </TabelaCabecalho>

          <TabelaCorpo>
            {itens.length === 0 ? (
              <TabelaLinhaVazia colunas={5}>
                <EstadoVazio
                  icone={Images}
                  titulo={
                    temFiltro
                      ? "Nenhum álbum corresponde à busca"
                      : "Nenhum álbum criado"
                  }
                  descricao={
                    temFiltro
                      ? "Tente outras palavras ou limpe a busca."
                      : "Os álbuns publicados aparecem na Galeria de Fotos do site."
                  }
                  acao={
                    !temFiltro && (
                      <Botao icone={Plus} onClick={() => setCriando(true)}>
                        Criar o primeiro álbum
                      </Botao>
                    )
                  }
                />
              </TabelaLinhaVazia>
            ) : (
              itens.map((album) => (
                <TabelaLinha key={album.id}>
                  <TabelaCelula className="font-medium">
                    {album.titulo}
                  </TabelaCelula>
                  <TabelaCelula className="text-texto-suave tabular-nums">
                    {album.data ? FORMATO.format(album.data) : "—"}
                  </TabelaCelula>
                  <TabelaCelula className="text-texto-suave tabular-nums">
                    {album._count.fotos}
                  </TabelaCelula>
                  <TabelaCelula>
                    <Selo tom={album.publicado ? "sucesso" : "neutro"}>
                      {album.publicado ? "No site" : "Rascunho"}
                    </Selo>
                  </TabelaCelula>
                  <TabelaCelula alinhamento="direita">
                    <div className="flex justify-end gap-1">
                      <BotaoIcone
                        icone={ImagePlus}
                        rotulo={`Gerenciar fotos de ${album.titulo}`}
                        onClick={() => setGerenciandoFotos(album)}
                      />
                      <BotaoIcone
                        icone={Pencil}
                        rotulo={`Editar ${album.titulo}`}
                        onClick={() => setEmEdicao(album)}
                      />
                      <DialogoDeExclusao
                        nome={album.titulo}
                        descricao={`As ${album._count.fotos} fotos do álbum são apagadas junto e não tem como voltar atrás.`}
                        aoConfirmar={() => excluirAlbumAcao(album.id)}
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
        <FormularioDeAlbum
          album={emEdicao}
          aoFechar={fechar}
          aoConcluir={(mensagem) => {
            fechar();
            setRecado(mensagem);
          }}
        />
      )}

      {gerenciandoFotos && (
        <JanelaDeFotos
          album={gerenciandoFotos}
          fotos={fotosPorAlbum[gerenciandoFotos.id] ?? []}
          aoFechar={() => setGerenciandoFotos(null)}
          aoAvisar={setRecado}
        />
      )}
    </>
  );
}

function FormularioDeAlbum({
  album,
  aoFechar,
  aoConcluir,
}: {
  album: AlbumDaLista | null;
  aoFechar: () => void;
  aoConcluir: (mensagem: string) => void;
}) {
  const [estado, enviar, pendente] = useActionState(salvarAlbum, ESTADO_INICIAL);

  useEffect(() => {
    if (estado.ok) aoConcluir(estado.mensagem ?? "Álbum salvo.");
  }, [estado, aoConcluir]);

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={album ? "Editar álbum" : "Novo álbum"}
      descricao="Agrupa as fotos de um evento da comunidade."
    >
      <form action={enviar} className="space-y-4" noValidate>
        {album && <input type="hidden" name="id" value={album.id} />}

        <CampoTexto
          name="titulo"
          rotulo="Título"
          required
          maxLength={160}
          dica='Ex.: "Festa de Santa Clara — Agosto de 2026".'
          defaultValue={estado.valores?.titulo ?? album?.titulo ?? ""}
          erro={estado.erros?.titulo?.[0]}
        />

        <CampoTexto
          name="data"
          type="date"
          rotulo="Data do evento"
          dica="A data em que as fotos foram tiradas, não a de hoje."
          defaultValue={estado.valores?.data ?? paraCampoData(album?.data)}
          erro={estado.erros?.data?.[0]}
        />

        <CampoBooleano
          name="publicado"
          rotulo="Mostrar na galeria do site"
          dica="Deixe desmarcado enquanto estiver montando o álbum."
          defaultChecked={album?.publicado ?? false}
        />

        {estado.mensagem && !estado.ok && !estado.erros && (
          <Alerta tom="perigo">{estado.mensagem}</Alerta>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Botao variante="secundario" type="button" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" pendente={pendente}>
            {album ? "Salvar alterações" : "Criar álbum"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}

function JanelaDeFotos({
  album,
  fotos,
  aoFechar,
  aoAvisar,
}: {
  album: AlbumDaLista;
  fotos: FotoDoAlbum[];
  aoFechar: () => void;
  aoAvisar: (mensagem: string) => void;
}) {
  const seletor = useRef<HTMLInputElement>(null);
  const [escolhidas, setEscolhidas] = useState<File[]>([]);
  const [recusa, setRecusa] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoFormulario>(ESTADO_INICIAL);
  const [pendente, iniciar] = useTransition();

  // Chama a ação à mão em vez de usar `useActionState` porque, dando certo, o
  // seletor de arquivos precisa ser limpo: sem isso as mesmas fotos continuam
  // escolhidas na tela e é fácil enviá-las duas vezes.
  function enviar(dados: FormData) {
    iniciar(async () => {
      const resultado = await enviarFotosAcao(ESTADO_INICIAL, dados);
      setEstado(resultado);
      if (!resultado.ok) return;

      if (resultado.mensagem) aoAvisar(resultado.mensagem);
      setEscolhidas([]);
      if (seletor.current) seletor.current.value = "";
    });
  }

  function aoEscolher(arquivos: FileList | null) {
    const lista = Array.from(arquivos ?? []);
    setEscolhidas(lista);
    setRecusa(lista.length ? conferirLote(lista) : null);
  }

  const total = escolhidas.reduce((soma, arquivo) => soma + arquivo.size, 0);
  const podeEnviar = escolhidas.length > 0 && !recusa;

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={`Fotos de "${album.titulo}"`}
      descricao="As fotos escolhidas são reduzidas e enviadas direto daqui."
    >
      {fotos.length === 0 ? (
        <p className="text-sm text-texto-suave">
          Este álbum ainda não tem fotos.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fotos.map((foto) => (
            <li key={foto.id} className="space-y-1.5">
              <div className="relative">
                <Image
                  src={foto.url}
                  alt={foto.legenda ?? ""}
                  width={160}
                  height={120}
                  className="h-24 w-full rounded-lg border border-borda object-cover"
                />
                <div className="absolute top-1 right-1">
                  <DialogoDeExclusao
                    nome="esta foto"
                    descricao="A imagem é apagada junto e não tem como voltar atrás."
                    aoConfirmar={() => excluirFotoAcao(foto.id)}
                  />
                </div>
              </div>
              <LegendaDaFoto foto={foto} aoAvisar={aoAvisar} />
            </li>
          ))}
        </ul>
      )}

      <form action={enviar} className="mt-5 space-y-4 border-t border-borda pt-4">
        <input type="hidden" name="albumId" value={album.id} />

        <div className="space-y-1.5">
          <label
            htmlFor="seletor-de-fotos"
            className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-borda px-4 py-6 text-center transition-colors hover:border-destaque hover:bg-fundo-suave"
          >
            <Upload className="h-5 w-5 text-texto-suave" aria-hidden />
            <span className="text-sm font-medium text-texto">
              Escolher fotos do computador
            </span>
            <span className="text-xs text-texto-suave">
              JPG, PNG ou WebP — até {MAXIMO_DE_ARQUIVOS} por vez
            </span>
          </label>

          <input
            ref={seletor}
            id="seletor-de-fotos"
            type="file"
            name="fotos"
            accept={ACEITE}
            multiple
            className="sr-only"
            onChange={(evento) => aoEscolher(evento.target.files)}
          />

          {escolhidas.length > 0 && !recusa && (
            <p className="text-xs text-texto-suave">
              {escolhidas.length === 1
                ? `1 foto escolhida (${formatarTamanho(total)}).`
                : `${escolhidas.length} fotos escolhidas (${formatarTamanho(total)}).`}
            </p>
          )}
        </div>

        {escolhidas.length === 1 && !recusa && (
          <CampoTexto
            name="legenda"
            rotulo="Legenda (opcional)"
            maxLength={200}
            dica="Num envio de várias fotos, a legenda de cada uma é escrita aqui embaixo depois."
          />
        )}

        {recusa && <Alerta tom="perigo">{recusa}</Alerta>}
        {estado.mensagem && !estado.ok && (
          <Alerta tom="perigo">{estado.mensagem}</Alerta>
        )}

        <div className="flex justify-end">
          <Botao
            type="submit"
            icone={ImagePlus}
            pendente={pendente}
            disabled={!podeEnviar}
          >
            {pendente ? "Enviando..." : "Adicionar ao álbum"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}

/** Legenda de uma foto já no álbum, salva sem recarregar a janela. */
function LegendaDaFoto({
  foto,
  aoAvisar,
}: {
  foto: FotoDoAlbum;
  aoAvisar: (mensagem: string) => void;
}) {
  const [texto, setTexto] = useState(foto.legenda ?? "");
  const [salvando, setSalvando] = useState(false);
  const mudou = texto !== (foto.legenda ?? "");

  async function salvar() {
    setSalvando(true);
    const resultado = await salvarLegendaAcao(foto.id, texto);
    setSalvando(false);
    aoAvisar(resultado.mensagem ?? "Legenda salva.");
  }

  return (
    <div className="flex items-center gap-1">
      <input
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        maxLength={200}
        placeholder="Legenda"
        aria-label={`Legenda da foto${foto.legenda ? ` "${foto.legenda}"` : ""}`}
        className="w-full rounded-md border border-borda bg-superficie px-2 py-1 text-xs text-texto outline-none focus:border-destaque"
      />
      {/* O botão só aparece com algo para salvar: fora isso, seriam três
          ícones idênticos e sem função embaixo de cada foto. */}
      {mudou && (
        <BotaoIcone
          icone={Check}
          rotulo="Salvar legenda"
          onClick={salvar}
          disabled={salvando}
        />
      )}
    </div>
  );
}
