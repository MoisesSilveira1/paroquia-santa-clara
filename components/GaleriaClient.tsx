"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Camera } from "lucide-react";
import { supabase, fotoUrl, type Album } from "@/lib/supabase";

function formatarData(data: string | null): string {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function GaleriaClient() {
  const [albuns, setAlbuns] = useState<Album[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!supabase) {
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
              .map((foto) => (
                <a
                  key={foto.id}
                  href={fotoUrl(foto.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-lg border border-dourado-claro bg-creme-escuro"
                >
                  {/* Fotos vêm do Supabase Storage (domínio dinâmico) — img simples em vez de next/image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fotoUrl(foto.path)}
                    alt={foto.legenda ?? `Foto do álbum ${album.titulo}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </a>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
