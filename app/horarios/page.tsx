import type { Metadata } from "next";
import { BookOpenText } from "lucide-react";
import MissaCard from "@/components/MissaCard";
import { horariosMissas, sacramentos } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Horários e Sacramentos",
  description:
    "Horários de missas, confissões, adoração ao Santíssimo e informações sobre os sacramentos.",
};

export default function HorariosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl text-terracota-escuro">Horários e Sacramentos</h1>
      <p className="mt-3 max-w-2xl text-marrom-claro">
        Confira os horários das celebrações e atividades da semana. Em
        solenidades e tempos litúrgicos especiais, os horários podem mudar —
        acompanhe os avisos da secretaria.
      </p>

      <section className="mt-8" aria-labelledby="missas">
        <h2 id="missas" className="text-2xl text-marrom">
          Missas e celebrações da semana
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {horariosMissas.map((horario) => (
            <MissaCard key={horario.dia} horario={horario} />
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="sacramentos">
        <h2 id="sacramentos" className="flex items-center gap-2 text-2xl text-marrom">
          <BookOpenText className="h-6 w-6 text-dourado" aria-hidden />
          Sacramentos e preparação
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {sacramentos.map((sacramento) => (
            <article
              key={sacramento.nome}
              className="rounded-xl border border-dourado-claro bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg text-terracota-escuro">{sacramento.nome}</h3>
              <p className="mt-2 text-sm leading-relaxed">{sacramento.descricao}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
