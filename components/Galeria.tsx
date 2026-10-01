import Image from "next/image";
import { CalendarDays, Camera } from "lucide-react";
import { albunsPublicados } from "@/lib/servicos/galeria";

/** Tamanho que cada miniatura ocupa, para o navegador baixar só o necessário. */
const TAMANHOS_MINIATURA =
  "(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw";

const FORMATO = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" });

type Foto = { id: string; url: string; legenda: string | null };

/**
 * Galeria de fotos do site.
 *
 * Renderiza no servidor: as imagens vêm no HTML e o navegador já pode começar
 * a baixá-las, em vez de esperar o JavaScript carregar para só então descobrir
 * quais são.
 */
export default async function Galeria() {
  const albuns = await albunsPublicados();

  if (albuns.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-destaque bg-white p-12 text-center">
        <Camera className="h-10 w-10 text-destaque" aria-hidden />
        <p className="text-texto-suave">
          As fotos dos eventos da paróquia aparecerão aqui em breve.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-12">
      {albuns.map((album) => (
        <section key={album.id} aria-label={`Álbum ${album.titulo}`}>
          <h2 className="text-2xl text-texto">{album.titulo}</h2>
          {album.data && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-texto-suave">
              <CalendarDays className="h-4 w-4 text-destaque" aria-hidden />
              {FORMATO.format(album.data)}
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {album.fotos.map((foto, indice) => (
              <Miniatura
                key={foto.id}
                foto={foto}
                // Numerada porque, sem legenda própria, seis fotos do mesmo
                // álbum teriam a MESMA descrição — e quem navega por leitor de
                // tela ouviria a mesma frase seis vezes, sem saber em qual
                // está. O número não descreve a foto, mas ao menos distingue.
                descricaoPadrao={`Foto ${indice + 1} de ${album.fotos.length} do álbum ${album.titulo}`}
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
  return (
    <a
      href={foto.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-square overflow-hidden rounded-lg border border-destaque-claro bg-fundo-suave"
    >
      <Image
        src={foto.url}
        alt={foto.legenda ?? descricaoPadrao}
        fill
        sizes={TAMANHOS_MINIATURA}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </a>
  );
}
