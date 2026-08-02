import type { Metadata } from "next";
import Image from "next/image";
import { Church, Sparkles, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "A Paróquia",
  description:
    "História da Paróquia Santa Clara e São Francisco de Assis, seus padroeiros, pároco e comunidades.",
};

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
        <Image
          src="/fotos/brasao.webp"
          alt="Brasão da Paróquia Santa Clara e São Francisco de Assis"
          width={837}
          height={1028}
          className="h-40 w-auto shrink-0 drop-shadow sm:h-48"
        />
        <div>
          <h1 className="text-4xl text-principal-escuro">A Paróquia</h1>
          <p className="mt-2 max-w-xl text-texto-suave">
            Brasão oficial da Paróquia Santa Clara e São Francisco de Assis,
            Jardim Botânico — Brasília-DF.
          </p>
        </div>
      </div>

      <section className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]" aria-labelledby="historia">
        <div>
          <h2 id="historia" className="flex items-center gap-2 text-2xl text-texto">
            <Church className="h-6 w-6 text-destaque" aria-hidden />
            Nossa história
          </h2>
          <div className="mt-4 space-y-4 leading-relaxed">
            <p>
              A Paróquia Santa Clara e São Francisco de Assis foi criada em{" "}
              <strong>29 de abril de 2007</strong> pelo então Arcebispo de
              Brasília, Dom João Braz de Aviz, com a missão de evangelizar os
              fiéis da região do Jardim Botânico.
            </p>
            <p>
              A comunidade reúne-se na Igreja Matriz, na Avenida Dom Bosco
              (SHJBS Etapa III), e também na <strong>Capela Rainha da Paz</strong>,
              que acolhe missas e confissões aos sábados. A paróquia integra o
              Vicariato Centro (Setor XI) da Arquidiocese de Brasília.
            </p>
            <p>
              Inspirada na espiritualidade de Francisco e Clara de Assis —
              simplicidade, fraternidade, cuidado com os pobres e com a criação
              —, a comunidade cresce a cada ano em suas celebrações, pastorais e
              ações sociais, incluindo a transmissão das missas pelo canal da
              paróquia no YouTube.
            </p>
            <p className="text-sm text-texto-suave">
              (Fonte: Arquidiocese de Brasília. Texto a enriquecer com o
              histórico completo da secretaria paroquial.)
            </p>
          </div>
        </div>

        <aside className="rounded-2xl bg-principal p-6 text-fundo shadow-md">
          <h2 className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-destaque" aria-hidden />
            Nossos padroeiros
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-fundo-suave">
            <p>
              <strong className="text-destaque-claro">São Francisco de Assis</strong>{" "}
              (1182–1226) — o Pobrezinho de Assis, fundador da Ordem dos Frades
              Menores, apaixonado por Cristo pobre e crucificado. Festa: 4 de
              outubro.
            </p>
            <p>
              <strong className="text-destaque-claro">Santa Clara de Assis</strong>{" "}
              (1194–1253) — primeira seguidora de Francisco, fundadora das
              Clarissas, mulher de oração e confiança absoluta na Providência.
              Festa: 11 de agosto.
            </p>
          </div>
        </aside>
      </section>

      <section className="mt-12" aria-labelledby="equipe">
        <h2 id="equipe" className="flex items-center gap-2 text-2xl text-texto">
          <Users className="h-6 w-6 text-destaque" aria-hidden />
          Pároco e equipe
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-destaque-claro bg-white p-5 text-center shadow-sm">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fundo-suave font-serif text-2xl text-principal"
              aria-hidden
            >
              N
            </div>
            <h3 className="mt-3 text-base text-texto">Pe. Norbey Londoño Buitrago</h3>
            <p className="text-sm text-texto-suave">Pároco</p>
          </article>
          <article className="rounded-xl border border-dashed border-destaque-claro bg-white/60 p-5 text-center">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fundo-suave font-serif text-2xl text-principal"
              aria-hidden
            >
              +
            </div>
            <h3 className="mt-3 text-base text-texto">Equipe paroquial</h3>
            <p className="text-sm text-texto-suave">
              Demais membros a incluir com a secretaria
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
