import Link from "next/link";
import { Clock, HeartHandshake } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-marrom via-marrom-claro to-terracota-escuro text-creme">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #c6a15b 0, transparent 40%), radial-gradient(circle at 80% 70%, #c6a15b 0, transparent 40%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:py-28">
        <p className="rounded-full border border-dourado/60 px-4 py-1 text-sm tracking-wide text-dourado-claro">
          Jardim Botânico · Brasília-DF
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl leading-tight sm:text-5xl">
          Paz e Bem! Seja bem-vindo à nossa comunidade de fé
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-creme-escuro">
          “Começa fazendo o que é necessário, depois o que é possível, e de
          repente estarás fazendo o impossível.” — São Francisco de Assis
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/horarios"
            className="inline-flex items-center gap-2 rounded-lg bg-dourado px-6 py-3 text-base font-semibold text-marrom shadow-lg transition-colors hover:bg-dourado-claro"
          >
            <Clock className="h-5 w-5" aria-hidden />
            Horários de Missas
          </Link>
          <Link
            href="/dizimo"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-creme px-6 py-3 text-base font-semibold transition-colors hover:bg-creme hover:text-marrom"
          >
            <HeartHandshake className="h-5 w-5" aria-hidden />
            Dízimo e Doações
          </Link>
        </div>
      </div>
    </section>
  );
}
