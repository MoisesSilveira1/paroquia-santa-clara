import type { Metadata } from "next";
import { Church, Sparkles, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "A Paróquia",
  description:
    "História da Paróquia Santa Clara e São Francisco de Assis, seus padroeiros, pároco e comunidades.",
};

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl text-terracota-escuro">A Paróquia</h1>

      <section className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]" aria-labelledby="historia">
        <div>
          <h2 id="historia" className="flex items-center gap-2 text-2xl text-marrom">
            <Church className="h-6 w-6 text-dourado" aria-hidden />
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
            <p className="text-sm text-marrom-claro">
              (Fonte: Arquidiocese de Brasília. Texto a enriquecer com o
              histórico completo da secretaria paroquial.)
            </p>
          </div>
        </div>

        <aside className="rounded-2xl bg-azul p-6 text-creme shadow-md">
          <h2 className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-dourado" aria-hidden />
            Nossos padroeiros
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-creme-escuro">
            <p>
              <strong className="text-dourado-claro">São Francisco de Assis</strong>{" "}
              (1182–1226) — o Pobrezinho de Assis, fundador da Ordem dos Frades
              Menores, apaixonado por Cristo pobre e crucificado. Festa: 4 de
              outubro.
            </p>
            <p>
              <strong className="text-dourado-claro">Santa Clara de Assis</strong>{" "}
              (1194–1253) — primeira seguidora de Francisco, fundadora das
              Clarissas, mulher de oração e confiança absoluta na Providência.
              Festa: 11 de agosto.
            </p>
          </div>
        </aside>
      </section>

      <section className="mt-12" aria-labelledby="equipe">
        <h2 id="equipe" className="flex items-center gap-2 text-2xl text-marrom">
          <Users className="h-6 w-6 text-dourado" aria-hidden />
          Pároco e equipe
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-dourado-claro bg-white p-5 text-center shadow-sm">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-creme-escuro font-serif text-2xl text-terracota"
              aria-hidden
            >
              N
            </div>
            <h3 className="mt-3 text-base text-marrom">Pe. Norbey Londoño Buitrago</h3>
            <p className="text-sm text-marrom-claro">Pároco</p>
          </article>
          <article className="rounded-xl border border-dashed border-dourado-claro bg-white/60 p-5 text-center">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-creme-escuro font-serif text-2xl text-terracota"
              aria-hidden
            >
              +
            </div>
            <h3 className="mt-3 text-base text-marrom">Equipe paroquial</h3>
            <p className="text-sm text-marrom-claro">
              Demais membros a incluir com a secretaria
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
