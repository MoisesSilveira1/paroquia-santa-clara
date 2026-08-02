"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarDays, Camera } from "lucide-react";
import { repositorio, type Album, type Foto } from "@/lib/conteudo";

/** Tamanho que cada miniatura ocupa, para o navegador baixar só o necessário. */
const TAMANHOS_MINIATURA =
  "(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw";

export default function GaleriaClient() {
  const [albuns, setAlbuns] = useState<Album[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    repositorio
      .listarAlbuns()
      .then((lista) => {
        if (ativo) setAlbuns(lista);
      })
      .catch(() => {
        /* mostra o estado vazio */
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  if (carregando) {
    return <p className="mt-8 text-marrom-claro">Carregando álbuns…</p>;
  }

  if (albuns.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-dourado bg-white p-12 text-center">
        <Camera className="h-10 w-10 text-dourado" aria-hidden />
        <p className="text-marrom-claro">
          As fotos dos eventos da paróquia aparecerão aqui em breve.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-12">
      {albuns.map((album) => (
        <section key={album.id} aria-label={`Álbum ${album.titulo}`}>
          <h2 className="text-2xl text-marrom">{album.titulo}</h2>
          {album.data && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-marrom-claro">
              <CalendarDays className="h-4 w-4 text-dourado" aria-hidden />
              {formatarData(album.data)}
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {album.fotos.map((foto) => (
              <Miniatura
                key={foto.id}
                foto={foto}
                descricaoPadrao={`Foto do álbum ${album.titulo}`}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Miniatura({
  foto,
  descricaoPadrao,
}: {
  foto: Foto;
  descricaoPadrao: string;
}) {
  const descricao = foto.legenda ?? descricaoPadrao;
  const estilo =
    "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105";
  // Fotos guardadas no próprio site passam pelo otimizador do Next; as que vêm
  // do Storage têm domínio dinâmico e são exibidas direto.
  const doProprioSite = foto.url.startsWith("/");

  return (
    <a
      href={foto.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-square overflow-hidden rounded-lg border border-dourado-claro bg-creme-escuro"
    >
      {doProprioSite ? (
        <Image
          src={foto.url}
          alt={descricao}
          fill
          sizes={TAMANHOS_MINIATURA}
          className={estilo}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={foto.url} alt={descricao} loading="lazy" className={estilo} />
      )}
    </a>
  );
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}
