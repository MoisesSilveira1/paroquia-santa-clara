import { CalendarDays, Newspaper, PartyPopper } from "lucide-react";
import type { Noticia } from "@/lib/dados";

export default function EventCard({ noticia }: { noticia: Noticia }) {
  const ehEvento = noticia.categoria === "Evento";
  return (
    <article className="flex flex-col rounded-xl border border-destaque-claro bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          ehEvento ? "bg-principal text-fundo" : "bg-destaque-claro text-texto"
        }`}
      >
        {ehEvento ? (
          <PartyPopper className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Newspaper className="h-3.5 w-3.5" aria-hidden />
        )}
        {noticia.categoria}
      </span>
      <h3 className="mt-3 text-lg leading-snug text-principal-escuro">
        {noticia.titulo}
      </h3>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-texto-suave">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
        {noticia.data}
      </p>
      <p className="mt-3 text-sm leading-relaxed">{noticia.resumo}</p>
    </article>
  );
}
