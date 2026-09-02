import type { Metadata } from "next";
import {
  Baby,
  BookOpenText,
  CalendarDays,
  ExternalLink,
  HandHeart,
  RefreshCw,
  Shirt,
  Sprout,
  UserPlus,
  Users,
} from "lucide-react";
import { catequese, paroquia } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Catequese",
  description:
    "Catequese da Paróquia Santa Clara e São Francisco de Assis: inscrições, renovação de matrícula, Iniciação à Vida Cristã, padrinhos e calendário catequético.",
};

/** Cada serviço do sistema da catequese tem seu ícone. */
const ICONES = {
  renovacao: RefreshCw,
  inscricao: UserPlus,
  ivc: Sprout,
  padrinhos: Users,
  camiseta: Shirt,
  capela: HandHeart,
} as const;

export default function CatequesePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl text-principal-escuro">Catequese</h1>
      <p className="mt-3 max-w-3xl text-texto-suave">
        A catequese da nossa paróquia acompanha crianças, jovens e adultos na
        caminhada da fé — do Batismo à Crisma. As inscrições, a renovação de
        matrícula e o calendário dos encontros ficam no sistema próprio da
        catequese, cuidado pelos catequistas.
      </p>

      {/* Chamada principal: o sistema é a fonte da verdade, não esta página. */}
      <section
        className="mt-8 overflow-hidden rounded-2xl bg-principal text-fundo shadow-md"
        aria-labelledby="acessar"
      >
        <div className="flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="acessar" className="flex items-center gap-2 text-2xl">
              <BookOpenText className="h-6 w-6 text-destaque" aria-hidden />
              Sistema da Catequese
            </h2>
            <p className="mt-2 text-fundo-suave">
              Inscrições, renovação, turmas, calendário e capela virtual. Lá você
              confere se as inscrições estão abertas e acompanha a agenda dos
              encontros.
            </p>
          </div>
          <a
            href={catequese.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-destaque px-6 py-4 text-lg font-semibold text-principal-escuro transition-colors hover:bg-destaque-claro"
          >
            Acessar a catequese
            <ExternalLink className="h-5 w-5" aria-hidden />
          </a>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="servicos">
        <h2 id="servicos" className="text-2xl text-texto">
          O que você resolve por lá
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catequese.servicos.map((servico) => {
            const Icone = ICONES[servico.icone];
            return (
              <article
                key={servico.titulo}
                className="rounded-xl border border-destaque-claro bg-white p-6 shadow-sm"
              >
                <Icone className="h-8 w-8 text-principal" aria-hidden />
                <h3 className="mt-3 text-lg text-texto">{servico.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-texto-suave">
                  {servico.descricao}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2" aria-labelledby="agenda">
        <div className="rounded-xl border border-destaque-claro bg-white p-6 shadow-sm">
          <h2 id="agenda" className="flex items-center gap-2 text-xl text-texto">
            <CalendarDays className="h-6 w-6 text-destaque" aria-hidden />
            Calendário catequético
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-texto-suave">
            Encontros com os pais, retiros, confissões, ensaios e as datas dos
            sacramentos — Batismo, Primeira Eucaristia e Crisma — ficam reunidos
            no calendário do sistema, com horário e local de cada atividade.
          </p>
          <a
            href={catequese.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-principal hover:underline"
          >
            Ver o calendário
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </div>

        <div className="rounded-xl border border-destaque-claro bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl text-texto">
            <Baby className="h-6 w-6 text-destaque" aria-hidden />
            Dúvidas sobre a caminhada
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-texto-suave">
            Para saber a idade certa de começar, a documentação necessária ou
            falar com a coordenação da catequese, procure a secretaria
            paroquial.
          </p>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="font-semibold text-texto">Telefone:</dt>
              <dd className="text-texto-suave">{paroquia.telefone}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-texto">Atendimento:</dt>
              <dd className="text-texto-suave">{paroquia.horarioSecretaria}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
