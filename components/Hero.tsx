import Link from "next/link";
import Image from "next/image";
import { Clock, HeartHandshake } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden text-fundo">
      <Image
        src="/fotos/hero.webp"
        alt="Interior da igreja da Paróquia Santa Clara e São Francisco de Assis durante a missa"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-principal/80 via-principal/70 to-principal-escuro/80"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:py-28">
        <p className="rounded-full border border-destaque/60 bg-principal/40 px-4 py-1 text-sm tracking-wide text-destaque-claro">
          Jardim Botânico · Brasília-DF
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl leading-tight drop-shadow-md sm:text-5xl">
          Paz e Bem! Seja bem-vindo à nossa comunidade de fé
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-fundo-suave drop-shadow">
          “Começa fazendo o que é necessário, depois o que é possível, e de
          repente estarás fazendo o impossível.” — São Francisco de Assis
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/horarios"
            className="inline-flex items-center gap-2 rounded-lg bg-destaque px-6 py-3 text-base font-semibold text-texto shadow-lg transition-colors hover:bg-destaque-claro"
          >
            <Clock className="h-5 w-5" aria-hidden />
            Horários de Missas
          </Link>
          <Link
            href="/dizimo"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-fundo bg-principal/30 px-6 py-3 text-base font-semibold transition-colors hover:bg-fundo hover:text-texto"
          >
            <HeartHandshake className="h-5 w-5" aria-hidden />
            Dízimo e Doações
          </Link>
        </div>
      </div>
    </section>
  );
}
