"use client";

import { useCallback, useEffect, useState } from "react";
import { Camera, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { repositorio, type Album, type Foto } from "@/lib/conteudo";
import {
  BOTAO_ICONE_PERIGO,
  BOTAO_PRIMARIO,
  CAMPO,
  TEXTO_ERRO,
} from "@/components/ui/estilos";

const FORMATOS_ACEITOS = "image/jpeg,image/png,image/webp";

export default function SecaoFotos() {
  const [albuns, setAlbuns] = useState<Album[]>([]);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaData, setNovaData] = useState("");
  const [enviandoEm, setEnviandoEm] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  const recarregar = useCallback(async () => {
    try {
      setAlbuns(await repositorio.listarAlbuns());
    } catch {
      setErro("Não foi possível carregar os álbuns.");
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  async function aplicar(alteracao: Promise<{ erro?: string }>) {
    const { erro: falha } = await alteracao;
    setErro(falha ?? "");
    if (!falha) await recarregar();
  }

  async function criarAlbum(evento: React.FormEvent) {
    evento.preventDefault();
    const titulo = novoTitulo.trim();
    if (!titulo) return;
    await aplicar(repositorio.criarAlbum(titulo, novaData || null));
    setNovoTitulo("");
    setNovaData("");
  }

  async function enviarFotos(albumId: string, arquivos: File[]) {
    setEnviandoEm(albumId);
    await aplicar(repositorio.enviarFotos(albumId, arquivos));
    setEnviandoEm(null);
  }

  return (
    <section className="mt-12" aria-labelledby="titulo-fotos">
      <h2 id="titulo-fotos" className="flex items-center gap-2 text-2xl text-texto">
        <Camera className="h-6 w-6 text-destaque" aria-hidden />
        Fotos de eventos
      </h2>
      <p className="mt-1 text-sm text-texto-suave">
        Crie um álbum para cada evento e envie as fotos (JPG, PNG ou WebP). Elas
        aparecem na página Galeria.
      </p>

      <form className="mt-4 flex flex-wrap items-end gap-2" onSubmit={criarAlbum}>
        <div className="min-w-48 flex-1">
          <label htmlFor="novo-album" className="mb-1 block text-sm font-medium">
            Nome do evento
          </label>
          <input
            id="novo-album"
            type="text"
            placeholder="Ex.: Festa de Santa Clara 2026"
            className={CAMPO}
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="nova-data" className="mb-1 block text-sm font-medium">
            Data
          </label>
          <input
            id="nova-data"
            type="date"
            className={CAMPO}
            value={novaData}
            onChange={(e) => setNovaData(e.target.value)}
          />
        </div>
        <button type="submit" className={BOTAO_PRIMARIO}>
          <Plus className="h-5 w-5" aria-hidden />
          Criar álbum
        </button>
      </form>

      {erro && (
        <p role="alert" className={`mt-2 ${TEXTO_ERRO}`}>
          {erro}
        </p>
      )}

      <div className="mt-6 space-y-8">
        {albuns.map((album) => (
          <CartaoAlbum
            key={album.id}
            album={album}
            enviando={enviandoEm === album.id}
            bloqueado={enviandoEm !== null}
            aoEnviarFotos={(arquivos) => enviarFotos(album.id, arquivos)}
            aoExcluirAlbum={() => aplicar(repositorio.excluirAlbum(album))}
            aoExcluirFoto={(foto) => aplicar(repositorio.excluirFoto(album.id, foto))}
          />
        ))}
        {albuns.length === 0 && (
          <p className="text-sm text-texto-suave">Nenhum álbum criado ainda.</p>
        )}
      </div>
    </section>
  );
}

type CartaoAlbumProps = {
  album: Album;
  enviando: boolean;
  bloqueado: boolean;
  aoEnviarFotos: (arquivos: File[]) => void;
  aoExcluirAlbum: () => void;
  aoExcluirFoto: (foto: Foto) => void;
};

function CartaoAlbum({
  album,
  enviando,
  bloqueado,
  aoEnviarFotos,
  aoExcluirAlbum,
  aoExcluirFoto,
}: CartaoAlbumProps) {
  return (
    <article className="rounded-xl border border-destaque-claro bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg text-texto">{album.titulo}</h3>
          <p className="text-xs text-texto-suave">
            {formatarData(album.data)} · {album.fotos.length} foto(s)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className={`${BOTAO_PRIMARIO} cursor-pointer`} aria-disabled={bloqueado}>
            {enviando ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <ImagePlus className="h-5 w-5" aria-hidden />
            )}
            {enviando ? "Enviando…" : "Enviar fotos"}
            <input
              type="file"
              accept={FORMATOS_ACEITOS}
              multiple
              className="sr-only"
              disabled={bloqueado}
              onChange={(e) => {
                const arquivos = Array.from(e.target.files ?? []);
                if (arquivos.length > 0) aoEnviarFotos(arquivos);
                e.target.value = "";
              }}
            />
          </label>

          <button
            type="button"
            title="Excluir álbum"
            aria-label={`Excluir álbum ${album.titulo}`}
            className={BOTAO_ICONE_PERIGO}
            onClick={() => {
              const confirmou = window.confirm(
                `Excluir o álbum "${album.titulo}" e todas as suas fotos?`
              );
              if (confirmou) aoExcluirAlbum();
            }}
          >
            <Trash2 className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {album.fotos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
          {album.fotos.map((foto) => (
            <div key={foto.id} className="group relative aspect-square">
              {/* As fotos podem vir do Storage ou de um arquivo recém-escolhido
                  (blob:), então aqui usamos img simples em vez de next/image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.url}
                alt={foto.legenda ?? "Foto do álbum"}
                loading="lazy"
                className="h-full w-full rounded-md object-cover"
              />
              <button
                type="button"
                title="Excluir foto"
                aria-label="Excluir foto"
                className="absolute right-1 top-1 rounded-full bg-principal/80 p-1.5 text-fundo opacity-0 transition-opacity hover:bg-perigo group-hover:opacity-100 focus:opacity-100"
                onClick={() => {
                  if (window.confirm("Excluir esta foto?")) aoExcluirFoto(foto);
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function formatarData(data: string | null) {
  if (!data) return "sem data";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}
