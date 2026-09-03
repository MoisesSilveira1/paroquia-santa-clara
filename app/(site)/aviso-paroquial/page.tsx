import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BellRing } from "lucide-react";
import { avisoEmCartaz } from "@/lib/servicos/aviso-paroquial";
import { urlDeIncorporacao } from "@/lib/video/youtube";

export const metadata: Metadata = {
  title: "Aviso Paroquial",
  description: "O comunicado em destaque da Paróquia Santa Clara e São Francisco de Assis.",
};

/**
 * Endereço fixo do aviso paroquial.
 *
 * A janela de entrada mostra o mesmo conteúdo, mas some depois de fechada e
 * depende de JavaScript. Esta página é o lugar para onde se manda o link no
 * grupo do WhatsApp, e onde quem fechou sem ler encontra o aviso de novo.
 */
export default async function PaginaAvisoParoquial() {
  const aviso = await avisoEmCartaz();
  const urlDoVideo = urlDeIncorporacao(aviso?.videoUrl);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wider text-destaque">
        Aviso paroquial
      </p>

      {!aviso ? (
        <div className="mt-4 rounded-xl border border-destaque-claro bg-white p-8 text-center">
          <BellRing className="mx-auto h-10 w-10 text-principal" aria-hidden />
          <h1 className="mt-3 text-2xl text-principal-escuro">
            Nenhum aviso no momento
          </h1>
          <p className="mt-2 text-texto-suave">
            Quando a paróquia tiver um comunicado importante, ele aparece aqui.
          </p>
          <Link
            href="/noticias"
            className="mt-6 inline-flex rounded-lg bg-principal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-principal-escuro"
          >
            Ver as notícias
          </Link>
        </div>
      ) : (
        <article className="mt-2">
          <h1 className="text-3xl leading-tight text-principal-escuro sm:text-4xl">
            {aviso.titulo}
          </h1>

          {aviso.temImagem && (
            <Image
              src={`/imagens/aviso/${aviso.id}?v=${aviso.versao}`}
              alt=""
              width={1400}
              height={900}
              unoptimized
              priority
              className="mt-6 w-full rounded-xl object-contain"
            />
          )}

          {urlDoVideo && (
            <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={urlDoVideo}
                title={`Vídeo: ${aviso.titulo}`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}

          {aviso.texto && (
            <div className="mt-6 space-y-4 text-lg leading-relaxed">
              {aviso.texto.split(/\n\s*\n/).map((paragrafo, indice) => (
                <p key={indice} className="whitespace-pre-line">
                  {paragrafo}
                </p>
              ))}
            </div>
          )}
        </article>
      )}
    </div>
  );
}
