import Link from "next/link";
import Image from "next/image";
import { Clock, HeartHandshake } from "lucide-react";

/**
 * Abertura da página inicial.
 *
 * O brasão e o nome da paróquia vivem aqui, e não no cabeçalho: na entrada do
 * site eles cabem grandes o bastante para serem lidos e reconhecidos. O
 * cabeçalho fica só com o menu, sem repetir a mesma identidade em miniatura.
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden text-fundo">
      <Image
        src="/fotos/fachada-noite.webp"
        alt="Fachada da igreja da Paróquia Santa Clara e São Francisco de Assis iluminada à noite"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Véu escuro: a foto é noturna, mas os postes e a fachada iluminada
          clareiam pontos onde o texto branco cairia. */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-principal-escuro/85 via-principal/75 to-principal-escuro/90"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
          {/* 900x1095 são as medidas REAIS do arquivo. O Next usa esses
              números para reservar o espaço antes de a imagem chegar; um
              valor chutado faz a página pular quando ela carrega. */}
          <Image
            src="/fotos/brasao.webp"
            alt="Brasão da Paróquia Santa Clara e São Francisco de Assis"
            width={900}
            height={1095}
            sizes="(min-width: 1024px) 256px, (min-width: 640px) 208px, 160px"
            priority
            className="h-40 w-auto shrink-0 drop-shadow-2xl sm:h-52 lg:h-64"
          />

          <div className="flex-1 text-center lg:text-left">
            <h1 className="font-serif text-3xl leading-tight drop-shadow-md sm:text-4xl lg:text-5xl">
              <span className="block">Paróquia</span>
              <span className="block">Santa Clara e São Francisco de Assis</span>
            </h1>

            <p className="mt-4 inline-block rounded-full border border-destaque/60 bg-principal-escuro/50 px-4 py-1 text-sm tracking-wide text-destaque-claro">
              Jardim Botânico · Brasília-DF
            </p>

            <p className="mt-6 text-xl leading-snug drop-shadow-md sm:text-2xl">
              Paz e Bem! Seja bem-vindo à nossa comunidade de fé
            </p>

            <p className="mt-3 max-w-2xl text-base text-fundo-suave drop-shadow lg:mx-0">
              “Começa fazendo o que é necessário, depois o que é possível, e de
              repente estarás fazendo o impossível.” — São Francisco de Assis
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
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
        </div>
      </div>
    </section>
  );
}
