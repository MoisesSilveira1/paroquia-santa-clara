import type { Metadata } from "next";
import EventCard from "@/components/EventCard";
import { noticias } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Notícias e Eventos",
  description:
    "Mural de notícias, agenda de eventos e festas dos padroeiros da paróquia.",
};

export default function NoticiasPage() {
  const eventos = noticias.filter((n) => n.categoria === "Evento");
  const avisos = noticias.filter((n) => n.categoria === "Notícia");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl text-principal-escuro">Notícias e Eventos</h1>
      <p className="mt-3 max-w-2xl text-texto-suave">
        Acompanhe a vida da comunidade: festas dos padroeiros, formações,
        campanhas e comunicados da secretaria.
      </p>

      <section className="mt-8" aria-labelledby="eventos">
        <h2 id="eventos" className="text-2xl text-texto">
          Próximos eventos
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventos.map((noticia) => (
            <EventCard key={noticia.slug} noticia={noticia} />
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="mural">
        <h2 id="mural" className="text-2xl text-texto">
          Mural de notícias
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {avisos.map((noticia) => (
            <EventCard key={noticia.slug} noticia={noticia} />
          ))}
        </div>
      </section>
    </div>
  );
}
