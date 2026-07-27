import type { Metadata } from "next";
import { Church, Sparkles, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "A Paróquia",
  description:
    "História da Paróquia Santa Clara e São Francisco de Assis, seus padroeiros e equipe paroquial.",
};

const equipe = [
  { nome: "Frei Antônio Carlos, OFM", funcao: "Pároco" },
  { nome: "Frei José Maria, OFM", funcao: "Vigário paroquial" },
  { nome: "Diác. Paulo Henrique", funcao: "Diácono permanente" },
  { nome: "Márcia Souza", funcao: "Secretária paroquial" },
];

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
              A Paróquia Santa Clara e São Francisco de Assis nasceu do
              crescimento da comunidade católica do Jardim Botânico, em
              Brasília-DF. O que começou como uma capela de comunidade, com
              missas celebradas por padres visitantes, tornou-se paróquia por
              decreto da Arquidiocese de Brasília, confiada ao carisma
              franciscano.
            </p>
            <p>
              Desde então, a comunidade cresceu em torno da espiritualidade de
              Francisco e Clara de Assis: simplicidade, fraternidade, cuidado
              com os pobres e com a criação. Hoje a paróquia reúne famílias de
              todo o Jardim Botânico e região em suas celebrações, pastorais e
              ações sociais.
            </p>
            <p className="text-sm text-marrom-claro">
              (Texto de demonstração — substituir pelo histórico oficial da
              paróquia, disponível com a secretaria e a Arquidiocese de
              Brasília.)
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
          Frades e equipe paroquial
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {equipe.map((pessoa) => (
            <article
              key={pessoa.nome}
              className="rounded-xl border border-dourado-claro bg-white p-5 text-center shadow-sm"
            >
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-creme-escuro text-2xl font-serif text-terracota"
                aria-hidden
              >
                {pessoa.nome.charAt(0)}
              </div>
              <h3 className="mt-3 text-base text-marrom">{pessoa.nome}</h3>
              <p className="text-sm text-marrom-claro">{pessoa.funcao}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
