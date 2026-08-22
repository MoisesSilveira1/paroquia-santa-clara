import { CalendarDays, Newspaper, PartyPopper } from "lucide-react";
import { ROTULO_CATEGORIA, type CategoriaNoticia } from "@/lib/validacao/esquemas";

export type NoticiaPublicada = {
  slug: string;
  titulo: string;
  resumo: string;
  categoria: CategoriaNoticia;
  publicadaEm: Date | null;
};

const FORMATO = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" });

export default function EventCard({ noticia }: { noticia: NoticiaPublicada }) {
  const ehEvento = noticia.categoria === "EVENTO";
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
        {ROTULO_CATEGORIA[noticia.categoria]}
      </span>
      <h3 className="mt-3 text-lg leading-snug text-principal-escuro">
        {noticia.titulo}
      </h3>
      {noticia.publicadaEm && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-texto-suave">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          <time dateTime={noticia.publicadaEm.toISOString()}>
            {FORMATO.format(noticia.publicadaEm)}
          </time>
        </p>
      )}
      <p className="mt-3 text-sm leading-relaxed">{noticia.resumo}</p>
    </article>
  );
}
