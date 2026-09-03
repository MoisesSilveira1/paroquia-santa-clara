import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText } from "lucide-react";
import MissaCard from "@/components/MissaCard";
import { sacramentos } from "@/lib/dados";
import { gradeDaSemana } from "@/lib/servicos/celebracoes";

export const metadata: Metadata = {
  title: "Horários e Sacramentos",
  description:
    "Horários de missas, confissões, adoração ao Santíssimo e informações sobre os sacramentos.",
};

export default async function HorariosPage() {
  const grade = await gradeDaSemana();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl text-principal-escuro">Horários e Sacramentos</h1>
      <p className="mt-3 max-w-2xl text-texto-suave">
        Confira os horários das celebrações e atividades da semana. Em
        solenidades e tempos litúrgicos especiais, os horários podem mudar —
        acompanhe os avisos da secretaria.
      </p>

      {/* Quem vem ver a que horas é a missa é exatamente quem quer o folheto
          para acompanhá-la. O link fica aqui, não só no rodapé. */}
      <Link
        href="/povo-de-deus"
        className="mt-6 inline-flex items-center gap-3 rounded-xl border border-destaque-claro bg-white px-5 py-3 transition-colors hover:border-destaque hover:bg-fundo"
      >
        <BookOpenText className="h-6 w-6 shrink-0 text-principal" aria-hidden />
        <span>
          <span className="block font-medium text-texto">
            Folheto O Povo de Deus
          </span>
          <span className="block text-sm text-texto-suave">
            Leituras e cantos da celebração, sempre na edição da semana
          </span>
        </span>
      </Link>

      <section className="mt-8" aria-labelledby="missas">
        <h2 id="missas" className="text-2xl text-texto">
          Missas e celebrações da semana
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grade.map((horario) => (
            <MissaCard key={horario.dia} horario={horario} />
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="sacramentos">
        <h2 id="sacramentos" className="flex items-center gap-2 text-2xl text-texto">
          <BookOpenText className="h-6 w-6 text-destaque" aria-hidden />
          Sacramentos e preparação
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {sacramentos.map((sacramento) => (
            <article
              key={sacramento.nome}
              className="rounded-xl border border-destaque-claro bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg text-principal-escuro">{sacramento.nome}</h3>
              <p className="mt-2 text-sm leading-relaxed">{sacramento.descricao}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
