import type { Metadata } from "next";
import Link from "next/link";
import { Users, Phone, CalendarClock, ArrowRight } from "lucide-react";
import { pastoraisAtivas } from "@/lib/servicos/pastorais";
import { coordenacaoPorPastoral } from "@/lib/servicos/coordenadores";

export const metadata: Metadata = {
  title: "Pastorais e Movimentos",
  description:
    "Conheça as pastorais e movimentos da paróquia, quem coordena cada um e como participar.",
};

export default async function PastoraisPage() {
  // Duas consultas, e não uma por cartão: a coordenação vem toda de uma vez e
  // é distribuída aqui.
  const [pastorais, coordenacao] = await Promise.all([
    pastoraisAtivas(),
    coordenacaoPorPastoral(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl text-principal-escuro">Pastorais e Movimentos</h1>
      <p className="mt-3 max-w-2xl text-texto-suave">
        “A cada um é dada a manifestação do Espírito para o bem comum.” Toda
        pessoa batizada tem um dom a serviço da comunidade — encontre o seu.
        Clique numa pastoral para ver a equipe e os contatos.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pastorais.map((pastoral) => {
          const equipe = coordenacao.get(pastoral.id) ?? [];
          return (
            <li key={pastoral.slug} className="flex">
              {/* O cartão inteiro é o link, não só um botão no canto: é o que
                  o dedo alcança no celular, e o que o leitor de tela anuncia
                  uma vez só em vez de repetir "link" a cada linha. */}
              <Link
                href={`/pastorais/${pastoral.slug}`}
                className="group flex w-full flex-col rounded-xl border border-destaque-claro bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-destaque hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-principal"
              >
                <Users
                  className="h-8 w-8 text-principal transition-colors group-hover:text-destaque"
                  aria-hidden
                />
                <h2 className="mt-3 text-xl text-texto">{pastoral.nome}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-texto-suave">
                  {pastoral.descricao}
                </p>

                {equipe.length > 0 && (
                  <div className="mt-4 border-t border-fundo-suave pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-texto-suave">
                      {equipe.length > 1 ? "Coordenação" : "Coordena"}
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm">
                      {equipe.map((pessoa) => (
                        <li key={`${pessoa.nome}-${pessoa.funcao}`}>
                          <span className="font-medium text-texto">
                            {pessoa.nome}
                          </span>
                          <span className="text-texto-suave">
                            {" "}
                            — {pessoa.funcao}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <dl className="mt-4 space-y-1.5 border-t border-fundo-suave pt-4 text-sm text-texto-suave">
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Reuniões</dt>
                    <CalendarClock className="h-4 w-4 shrink-0 text-destaque" aria-hidden />
                    <dd>{pastoral.reunioes}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Contato</dt>
                    <Phone className="h-4 w-4 shrink-0 text-destaque" aria-hidden />
                    <dd>{pastoral.contato}</dd>
                  </div>
                </dl>

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-principal group-hover:text-principal-escuro">
                  Ver a equipe e os contatos
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
