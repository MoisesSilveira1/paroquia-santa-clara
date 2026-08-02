import { CalendarDays } from "lucide-react";
import type { Horario } from "@/lib/dados";

export default function MissaCard({ horario }: { horario: Horario }) {
  return (
    <article className="rounded-xl border border-destaque-claro bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="flex items-center gap-2 text-lg text-principal-escuro">
        <CalendarDays className="h-5 w-5 text-destaque" aria-hidden />
        {horario.dia}
      </h3>
      <ul className="mt-3 space-y-2">
        {horario.atividades.map((atividade) => (
          <li
            key={`${atividade.hora}-${atividade.nome}`}
            className="flex items-baseline gap-3 text-sm"
          >
            <span className="shrink-0 rounded bg-fundo-suave px-2 py-0.5 font-mono font-semibold text-texto">
              {atividade.hora}
            </span>
            <span>{atividade.nome}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
