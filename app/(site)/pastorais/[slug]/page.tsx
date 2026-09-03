import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import { pastoralPorSlug } from "@/lib/servicos/pastorais";
import {
  equipeDaPastoral,
  type PessoaNoSite,
} from "@/lib/servicos/coordenadores";
import { catequese, paroquia } from "@/lib/dados";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pastoral = await pastoralPorSlug(slug);
  if (!pastoral) return { title: "Pastoral não encontrada" };

  return {
    title: pastoral.nome,
    description: pastoral.descricao,
  };
}

export default async function PaginaDaPastoral({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pastoral = await pastoralPorSlug(slug);
  if (!pastoral) notFound();

  const { coordenacao, equipe } = await equipeDaPastoral(pastoral.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/pastorais"
        className="inline-flex items-center gap-2 text-sm text-principal hover:text-principal-escuro"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Todas as pastorais
      </Link>

      <header className="mt-4">
        <h1 className="text-4xl text-principal-escuro">{pastoral.nome}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-texto-suave">
          {pastoral.descricao}
        </p>
      </header>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-destaque-claro bg-white p-5">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-texto-suave">
            <CalendarClock className="h-4 w-4 text-destaque" aria-hidden />
            Reuniões
          </dt>
          <dd className="mt-1.5 text-texto">{pastoral.reunioes}</dd>
        </div>
        <div className="rounded-xl border border-destaque-claro bg-white p-5">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-texto-suave">
            <Phone className="h-4 w-4 text-destaque" aria-hidden />
            Contato
          </dt>
          <dd className="mt-1.5 text-texto">{pastoral.contato}</dd>
        </div>
      </dl>

      {/* A Catequese tem sistema próprio, dos catequistas. Quem chega por aqui
          procurando inscrição precisa achar o caminho, e não uma segunda
          versão da mesma informação. */}
      {slug === "catequese" && <AtalhoDaCatequese />}

      <Grupo
        titulo="Coordenação"
        descricao="Com quem falar sobre esta pastoral."
        pessoas={coordenacao}
        vazio="A coordenação ainda não foi cadastrada. Fale com a secretaria da paróquia."
      />

      {equipe.length > 0 && (
        <Grupo
          titulo="Equipe"
          descricao="Quem serve nesta pastoral."
          pessoas={equipe}
        />
      )}

      <footer className="mt-10 rounded-xl bg-fundo-suave p-5 text-sm text-texto-suave">
        Quer participar? Fale com a coordenação ou com a secretaria pelo
        telefone {paroquia.telefone}, ou use a{" "}
        <Link
          href="/contato"
          className="text-principal underline underline-offset-2 hover:text-principal-escuro"
        >
          página de contato
        </Link>
        .
      </footer>
    </div>
  );
}

function AtalhoDaCatequese() {
  return (
    <section className="mt-6 rounded-xl border-2 border-destaque bg-white p-6">
      <h2 className="text-xl text-principal-escuro">
        Inscrições e área dos catequistas
      </h2>
      <p className="mt-2 text-texto-suave">
        A Catequese da paróquia tem sistema próprio, cuidado pelos catequistas:
        é lá que ficam as inscrições, a renovação, os padrinhos e o calendário
        catequético.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/catequese"
          className="inline-flex items-center rounded-lg bg-principal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-principal-escuro"
        >
          Como funciona a Catequese
        </Link>
        <a
          href={catequese.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-principal px-5 py-2.5 text-sm font-semibold text-principal transition-colors hover:bg-fundo"
        >
          Abrir o sistema da Catequese
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </section>
  );
}

function Grupo({
  titulo,
  descricao,
  pessoas,
  vazio,
}: {
  titulo: string;
  descricao: string;
  pessoas: PessoaNoSite[];
  vazio?: string;
}) {
  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-xl text-principal-escuro">
        <Users className="h-5 w-5 text-destaque" aria-hidden />
        {titulo}
      </h2>
      <p className="mt-1 text-sm text-texto-suave">{descricao}</p>

      {pessoas.length === 0 ? (
        <p className="mt-4 rounded-xl border border-destaque-claro bg-white p-5 text-sm text-texto-suave">
          {vazio}
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {pessoas.map((pessoa) => (
            <li
              key={`${pessoa.nome}-${pessoa.funcao}`}
              className="rounded-xl border border-destaque-claro bg-white p-5"
            >
              <p className="font-medium text-texto">{pessoa.nome}</p>
              <p className="text-sm text-texto-suave">{pessoa.funcao}</p>

              {(pessoa.telefone || pessoa.email) && (
                <div className="mt-3 space-y-1.5 border-t border-fundo-suave pt-3 text-sm">
                  {pessoa.telefone && (
                    <a
                      href={`tel:${pessoa.telefone.replace(/[^\d+]/g, "")}`}
                      className="flex items-center gap-2 text-principal hover:text-principal-escuro"
                    >
                      <Phone className="h-4 w-4 shrink-0 text-destaque" aria-hidden />
                      {pessoa.telefone}
                    </a>
                  )}
                  {pessoa.email && (
                    <a
                      href={`mailto:${pessoa.email}`}
                      className="flex items-center gap-2 break-all text-principal hover:text-principal-escuro"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-destaque" aria-hidden />
                      {pessoa.email}
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
