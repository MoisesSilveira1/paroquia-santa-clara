"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { Images, ImagePlus, Pencil, Plus } from "lucide-react";
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
import { ESTADO_INICIAL } from "@/lib/servicos/resultado";
import type { AlbumDaLista } from "@/lib/servicos/galeria";
import {
  adicionarFotoAcao,
  excluirAlbumAcao,
  excluirFotoAcao,
  salvarAlbum,
} from "./acoes";

const FORMATO = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export type FotoDoAlbum = { id: string; url: string; legenda: string | null };

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
                        descricao={`As ${album._count.fotos} fotos do álbum saem da galeria junto. Os arquivos continuam na pasta do site.`}
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
  const [estado, enviar, pendente] = useActionState(
    adicionarFotoAcao,
    ESTADO_INICIAL
  );

  useEffect(() => {
    if (estado.ok && estado.mensagem) aoAvisar(estado.mensagem);
  }, [estado, aoAvisar]);

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={`Fotos de "${album.titulo}"`}
      descricao="As imagens já precisam estar na pasta public/fotos do site."
    >
      {fotos.length === 0 ? (
        <p className="text-sm text-texto-suave">
          Este álbum ainda não tem fotos.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-3">
          {fotos.map((foto) => (
            <li key={foto.id} className="group relative">
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
                  descricao="Ela sai do álbum, mas o arquivo continua na pasta do site."
                  aoConfirmar={() => excluirFotoAcao(foto.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={enviar} className="mt-5 space-y-4 border-t border-borda pt-4">
        <input type="hidden" name="albumId" value={album.id} />

        <CampoTexto
          name="url"
          rotulo="Caminho da imagem"
          required
          placeholder="/fotos/galeria/festa-2026/foto-1.webp"
          dica="Precisa começar com /fotos/ e apontar para um arquivo já enviado ao site."
        />

        <CampoTexto
          name="legenda"
          rotulo="Legenda (opcional)"
          maxLength={200}
        />

        {estado.mensagem && !estado.ok && (
          <Alerta tom="perigo">{estado.mensagem}</Alerta>
        )}

        <div className="flex justify-end">
          <Botao type="submit" icone={ImagePlus} pendente={pendente}>
            Adicionar foto
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
