import type { Metadata } from "next";
import { MonitorPlay, CirclePlay, Radio, CalendarClock } from "lucide-react";
import { youtube } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Missa Online",
  description:
    "Assista à Santa Missa ao vivo pelo canal oficial da paróquia no YouTube, ou reveja as últimas celebrações.",
};

export default function MissaOnlinePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl text-terracota-escuro">Missa Online</h1>
      <p className="mt-3 max-w-2xl text-marrom-claro">
        Não pôde vir à igreja? Participe da Santa Missa ao vivo pelo nosso canal
        no YouTube — ou reveja as últimas celebrações quando quiser.
      </p>

      <section className="mt-8" aria-labelledby="ao-vivo">
        <h2 id="ao-vivo" className="flex items-center gap-2 text-2xl text-marrom">
          <Radio className="h-6 w-6 text-terracota" aria-hidden />
          Transmissão ao vivo
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-dourado-claro bg-black shadow-md">
          <iframe
            src={`https://www.youtube.com/embed/live_stream?channel=${youtube.canalId}`}
            title="Transmissão ao vivo da Santa Missa"
            className="aspect-video w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dourado-claro bg-white p-5">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-marrom">
              <CalendarClock className="h-5 w-5 text-dourado" aria-hidden />
              Horários das transmissões
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-marrom-claro">
              {youtube.horariosTransmissao.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-marrom-claro">
              Fora dos horários de transmissão, o player acima pode aparecer
              indisponível — é normal.
            </p>
          </div>
          <a
            href={youtube.canalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#ff0000] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#cc0000]"
          >
            <CirclePlay className="h-5 w-5" aria-hidden />
            Inscreva-se no canal
          </a>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="ultimas-missas">
        <h2 id="ultimas-missas" className="flex items-center gap-2 text-2xl text-marrom">
          <MonitorPlay className="h-6 w-6 text-terracota" aria-hidden />
          Últimas missas e homilias
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-dourado-claro bg-black shadow-md">
          <iframe
            src={`https://www.youtube.com/embed/videoseries?list=${youtube.playlistUploads}`}
            title="Últimas missas gravadas do canal da paróquia"
            className="aspect-video w-full border-0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <p className="mt-3 text-sm text-marrom-claro">
          Use o ícone de lista no canto do player para escolher entre as últimas
          celebrações gravadas.
        </p>
      </section>
    </div>
  );
}
