import type { Metadata } from "next";
import { Users, Phone, CalendarClock } from "lucide-react";
import { pastorais } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Pastorais e Movimentos",
  description:
    "Conheça as pastorais e movimentos da paróquia e saiba como participar.",
};

export default function PastoraisPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl text-principal-escuro">Pastorais e Movimentos</h1>
      <p className="mt-3 max-w-2xl text-texto-suave">
        “A cada um é dada a manifestação do Espírito para o bem comum.” Toda
        pessoa batizada tem um dom a serviço da comunidade — encontre o seu.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pastorais.map((pastoral) => (
          <article
            key={pastoral.nome}
            className="group flex flex-col rounded-xl border border-destaque-claro bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-destaque hover:shadow-md"
          >
            <Users className="h-8 w-8 text-principal transition-colors group-hover:text-destaque" aria-hidden />
            <h2 className="mt-3 text-xl text-texto">{pastoral.nome}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed">
              {pastoral.descricao}
            </p>
            <dl className="mt-4 space-y-1.5 border-t border-fundo-suave pt-4 text-sm text-texto-suave">
              <div className="flex items-center gap-2">
                <dt className="sr-only">Reuniões</dt>
                <CalendarClock className="h-4 w-4 text-destaque" aria-hidden />
                <dd>{pastoral.reunioes}</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="sr-only">Contato</dt>
                <Phone className="h-4 w-4 text-destaque" aria-hidden />
                <dd>{pastoral.contato}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
