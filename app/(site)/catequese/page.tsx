import type { Metadata } from "next";
import {
  BookOpenText,
  CalendarDays,
  ExternalLink,
  HandHeart,
  Info,
  MapPin,
  Shirt,
  Users,
} from "lucide-react";
import { catequese, paroquia } from "@/lib/dados";
import { situacaoDasInscricoes } from "@/lib/servicos/catequese";
import { DIAS_DA_SEMANA } from "@/lib/validacao/esquemas";
import FormularioDeInscricao from "./FormularioDeInscricao";

export const metadata: Metadata = {
  title: "Catequese",
  description:
    "Catequese da Paróquia Santa Clara e São Francisco de Assis: inscrições, turmas, horários e a caminhada da Iniciação à Vida Cristã.",
};

/** Cada serviço que ficou no sistema dos catequistas tem seu ícone. */
const ICONES = {
  capela: HandHeart,
  camiseta: Shirt,
  padrinhos: Users,
} as const;

/**
 * A página da catequese.
 *
 * As INSCRIÇÕES e as TURMAS moram aqui, no nosso sistema, e vêm do banco —
 * quem abre e fecha o período é a coordenação da catequese, pelo painel.
 *
 * O que ainda mora no sistema dos catequistas (capela virtual, camiseta da
 * crisma, cadastro de padrinhos) continua lá e é ligado por link. Não foi
 * copiado de propósito: são telas que nunca vimos por dentro, e um palpite
 * com cara de sistema pronto seria pior que não ter.
 */
export default async function CatequesePage() {
  const situacao = await situacaoDasInscricoes();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl text-principal-escuro">Catequese</h1>
      <p className="mt-3 max-w-prose text-texto-suave">
        A catequese da nossa paróquia acompanha crianças, jovens e adultos na
        caminhada da fé — do Batismo à Crisma. Aqui você vê as turmas, os
        horários e, quando o período estiver aberto, faz a inscrição.
      </p>

      {/* Recado da coordenação. Aparece aberto ou fechado o período, porque é
          onde entram prazo, documentos e onde entregar. */}
      {situacao.aviso && (
        <div className="mt-6 flex gap-3 rounded-xl border-l-4 border-destaque bg-white p-5 shadow-sm">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-destaque" aria-hidden />
          <p className="whitespace-pre-line leading-relaxed text-texto">
            {situacao.aviso}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Inscrição                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="mt-10" aria-labelledby="inscricao">
        <h2 id="inscricao" className="text-2xl text-texto">
          {situacao.abertas
            ? `Inscrições abertas para ${situacao.anoLetivo}`
            : "Inscrições"}
        </h2>

        {situacao.abertas ? (
          <>
            <p className="mt-2 max-w-prose text-texto-suave">
              Preencha abaixo. A coordenação confere e entra em contato pelo
              telefone informado — a inscrição só está confirmada depois dessa
              conversa.
            </p>
            <div className="mt-6">
              <FormularioDeInscricao
                turmas={situacao.turmas}
                anoLetivo={situacao.anoLetivo}
              />
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-destaque-claro bg-white p-6 shadow-sm">
            <p className="leading-relaxed text-texto">
              As inscrições não estão abertas neste momento.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-texto-suave">
              Quando o período abrir, o formulário aparece aqui mesmo. Para
              saber as datas, acompanhe os avisos das missas ou fale com a
              secretaria paroquial — {paroquia.telefone}, {paroquia.horarioSecretaria.toLowerCase()}.
            </p>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Turmas                                                              */}
      {/* ------------------------------------------------------------------ */}
      {situacao.turmas.length > 0 && (
        <section className="mt-12" aria-labelledby="turmas">
          <h2 id="turmas" className="flex items-center gap-2 text-2xl text-texto">
            <CalendarDays className="h-6 w-6 text-destaque" aria-hidden />
            Turmas de {situacao.anoLetivo}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {situacao.turmas.map((turma) => (
              <article
                key={turma.id}
                className="rounded-xl border border-destaque-claro bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-destaque">
                  {turma.etapa}
                </p>
                <h3 className="mt-1 text-lg text-texto">{turma.nome}</h3>

                <dl className="mt-3 space-y-1.5 text-sm text-texto-suave">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-destaque" aria-hidden />
                    <dt className="sr-only">Quando</dt>
                    <dd>
                      {DIAS_DA_SEMANA[turma.diaSemana]}, às {turma.hora}
                    </dd>
                  </div>
                  {turma.local && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-destaque" aria-hidden />
                      <dt className="sr-only">Onde</dt>
                      <dd>{turma.local}</dd>
                    </div>
                  )}
                  {turma.catequistas && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0 text-destaque" aria-hidden />
                      <dt className="sr-only">Catequistas</dt>
                      <dd>{turma.catequistas}</dd>
                    </div>
                  )}
                </dl>

                {turma.lotada && (
                  <p className="mt-3 inline-block rounded-full bg-fundo-suave px-3 py-1 text-xs font-semibold text-texto-suave">
                    Turma cheia — fale com a secretaria
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* O que continua no sistema dos catequistas                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="mt-12" aria-labelledby="sistema">
        <h2 id="sistema" className="text-2xl text-texto">
          Capela virtual, camiseta e padrinhos
        </h2>
        <p className="mt-2 max-w-prose text-texto-suave">
          Estes três continuam no sistema próprio da catequese, cuidado pelos
          catequistas.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {catequese.servicos.map((servico) => {
            const Icone = ICONES[servico.icone];
            return (
              <article
                key={servico.titulo}
                className="rounded-xl border border-destaque-claro bg-white p-5 shadow-sm"
              >
                <Icone className="h-7 w-7 text-principal" aria-hidden />
                <h3 className="mt-3 text-base text-texto">{servico.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-texto-suave">
                  {servico.descricao}
                </p>
              </article>
            );
          })}
        </div>

        <a
          href={catequese.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-principal px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-principal-escuro"
        >
          <BookOpenText className="h-5 w-5" aria-hidden />
          Abrir o sistema da catequese
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section className="mt-12 rounded-xl border border-destaque-claro bg-white p-6 shadow-sm">
        <h2 className="text-xl text-texto">Dúvidas sobre a caminhada</h2>
        <p className="mt-2 text-sm leading-relaxed text-texto-suave">
          Para saber a idade certa de começar, a documentação necessária ou
          falar com a coordenação da catequese, procure a secretaria paroquial.
        </p>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex flex-wrap gap-2">
            <dt className="font-semibold text-texto">Telefone:</dt>
            <dd className="text-texto-suave">{paroquia.telefone}</dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="font-semibold text-texto">Atendimento:</dt>
            <dd className="text-texto-suave">{paroquia.horarioSecretaria}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

