"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarDays, Camera } from "lucide-react";
import { supabase, fotoUrl, type Album } from "@/lib/supabase";
import { albunsDemo } from "@/lib/dados";

function formatarData(data: string | null): string {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Converte os álbuns locais (public/fotos) para o formato da galeria
const albunsLocais: Album[] = albunsDemo.map((album, i) => ({
  id: `local-${i}`,
  titulo: album.titulo,
  data_evento: album.data.split("/").reverse().join("-"),
  created_at: "",
  fotos: album.fotos.map((path, j) => ({
    id: `local-${i}-${j}`,
    album_id: `local-${i}`,
    path,
    legenda: null,
    created_at: String(j),
  })),
}));

export default function GaleriaClient() {
  const [albuns, setAlbuns] = useState<Album[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setAlbuns(albunsLocais);
      setCarregando(false);
      return;
    }
    supabase
      .from("albuns")
      .select("*, fotos(*)")
      .order("data_evento", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setAlbuns(data as Album[]);
        setCarregando(false);
      });
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
          {album.data_evento && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-marrom-claro">
              <CalendarDays className="h-4 w-4 text-dourado" aria-hidden />
              {formatarData(album.data_evento)}
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {album.fotos
              .sort((a, b) => a.created_at.localeCompare(b.created_at))
              .map((foto) => {
                const local = foto.path.startsWith("/");
                const url = local ? foto.path : fotoUrl(foto.path);
                const alt = foto.legenda ?? `Foto do álbum ${album.titulo}`;
                const estilo =
                  "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105";
                return (
                  <a
                    key={foto.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-square overflow-hidden rounded-lg border border-dourado-claro bg-creme-escuro"
                  >
                    {local ? (
                      <Image
                        src={url}
                        alt={alt}
                        fill
                        sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
                        className={estilo}
                      />
                    ) : (
                      // Fotos do Supabase Storage têm domínio dinâmico — img simples
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={alt} loading="lazy" className={estilo} />
                    )}
                  </a>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
