import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenText,
  ExternalLink,
  FileText,
  Music4,
  Presentation,
  Smartphone,
} from "lucide-react";
import {
  buscarEdicoes,
  organizar,
  PAGINA_DA_ARQUIDIOCESE,
  type ArquivoDoFolheto,
  type EdicaoDoFolheto,
  type TipoDeArquivo,
} from "@/lib/povo-de-deus/arquidiocese";

export const metadata: Metadata = {
  title: "Folheto O Povo de Deus",
  description:
    "Baixe o folheto litúrgico O Povo de Deus, da Arquidiocese de Brasília, sempre na edição da semana.",
};

const ICONES: Record<TipoDeArquivo, typeof FileText> = {
  folheto: FileText,
  celular: Smartphone,
  telao: Presentation,
  partituras: Music4,
  outro: FileText,
};

/** Nomes curtos: os rótulos da Arquidiocese vêm em caixa alta e comprida. */
const NOMES: Record<TipoDeArquivo, string> = {
  folheto: "Folheto (imprimir)",
  celular: "Versão para celular",
  telao: "Versão para telão",
  partituras: "Caderno de partituras",
  outro: "Arquivo",
};

const DIA_LONGO = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const DIA_CURTO = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

function comoData(iso: string) {
  // Meio-dia para a data não escorregar de dia por causa do fuso.
  return new Date(`${iso}T12:00:00`);
}

export default async function PaginaPovoDeDeus() {
  const edicoes = await buscarEdicoes();
  const { proxima, seguintes, anteriores } = organizar(edicoes);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl text-principal-escuro">O Povo de Deus</h1>
      <p className="mt-3 max-w-2xl text-texto-suave">
        O folheto litúrgico da Arquidiocese de Brasília, com as leituras, os
        cantos e as orações de cada celebração. Acompanhe a missa pelo celular
        ou imprima para a comunidade.
      </p>

      {edicoes.length === 0 ? (
        <IndisponivelAgora />
      ) : (
        <>
          {proxima && <Destaque edicao={proxima} />}

          {seguintes.length > 0 && (
            <Lista
              titulo="Próximas celebrações"
              descricao="A Arquidiocese costuma publicar o folheto na semana da celebração."
              edicoes={seguintes}
            />
          )}

          {anteriores.length > 0 && (
            <Lista titulo="Semanas anteriores" edicoes={anteriores} />
          )}
        </>
      )}

      <Creditos />
    </div>
  );
}

function Destaque({ edicao }: { edicao: EdicaoDoFolheto }) {
  return (
    <section className="mt-8 rounded-xl border-2 border-destaque bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-destaque">
        Próxima celebração
      </p>
      <h2 className="mt-1 text-2xl text-principal-escuro">{edicao.titulo}</h2>
      <p className="mt-1 text-texto-suave first-letter:uppercase">
        {DIA_LONGO.format(comoData(edicao.data))}
      </p>

      {edicao.arquivos.length === 0 ? (
        <p className="mt-5 rounded-lg bg-fundo-suave p-4 text-sm text-texto-suave">
          A Arquidiocese ainda não publicou os arquivos desta celebração. Eles
          costumam sair poucos dias antes — esta página se atualiza sozinha.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {edicao.arquivos.map((arquivo) => (
            <li key={arquivo.url}>
              <BotaoDeArquivo arquivo={arquivo} destaque />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Lista({
  titulo,
  descricao,
  edicoes,
}: {
  titulo: string;
  descricao?: string;
  edicoes: EdicaoDoFolheto[];
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xl text-principal-escuro">{titulo}</h2>
      {descricao && <p className="mt-1 text-sm text-texto-suave">{descricao}</p>}

      <ul className="mt-4 divide-y divide-fundo-suave rounded-xl border border-destaque-claro bg-white">
        {edicoes.map((edicao) => (
          <li
            key={edicao.data}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
          >
            <div>
              <p className="font-medium text-texto">{edicao.titulo}</p>
              <p className="text-sm text-texto-suave tabular-nums">
                {DIA_CURTO.format(comoData(edicao.data))}
              </p>
            </div>

            {edicao.arquivos.length === 0 ? (
              <span className="text-sm text-texto-suave">Ainda não publicado</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {edicao.arquivos.map((arquivo) => (
                  <BotaoDeArquivo key={arquivo.url} arquivo={arquivo} />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function BotaoDeArquivo({
  arquivo,
  destaque = false,
}: {
  arquivo: ArquivoDoFolheto;
  destaque?: boolean;
}) {
  const Icone = ICONES[arquivo.tipo];
  const nome = NOMES[arquivo.tipo];

  return (
    <a
      href={arquivo.url}
      target="_blank"
      // `noopener`/`noreferrer` em link para fora: sem eles a página aberta
      // ganha uma referência à nossa e pode redirecioná-la.
      rel="noopener noreferrer"
      className={
        destaque
          ? "flex items-center gap-3 rounded-lg bg-principal px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-principal-escuro"
          : "inline-flex items-center gap-1.5 rounded-md border border-destaque-claro px-2.5 py-1.5 text-xs font-medium text-principal transition-colors hover:border-destaque hover:bg-fundo"
      }
    >
      <Icone className={destaque ? "h-5 w-5 shrink-0" : "h-3.5 w-3.5 shrink-0"} aria-hidden />
      <span>{destaque ? nome : nome.replace(/ \(.*\)$/, "")}</span>
      <span className="sr-only">(abre um PDF no site da Arquidiocese)</span>
    </a>
  );
}

/**
 * O que a página mostra quando não consegue ler o site da Arquidiocese.
 *
 * Existe porque a leitura depende do formato de uma página que não é nossa.
 * Se ela mudar, a paróquia não pode ficar com uma tela vazia: o caminho para
 * o folheto continua aqui, só que a pessoa dá mais um clique.
 */
function IndisponivelAgora() {
  return (
    <section className="mt-8 rounded-xl border border-destaque-claro bg-white p-6">
      <BookOpenText className="h-9 w-9 text-principal" aria-hidden />
      <h2 className="mt-3 text-xl text-principal-escuro">
        Não consegui carregar as edições agora
      </h2>
      <p className="mt-2 text-texto-suave">
        O folheto continua disponível direto na Arquidiocese de Brasília, com
        todas as edições por data.
      </p>
      <a
        href={PAGINA_DA_ARQUIDIOCESE}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-principal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-principal-escuro"
      >
        Abrir no site da Arquidiocese
        <ExternalLink className="h-4 w-4" aria-hidden />
      </a>
    </section>
  );
}

function Creditos() {
  return (
    <footer className="mt-10 rounded-xl bg-fundo-suave p-5 text-sm text-texto-suave">
      <p>
        <strong className="text-texto">O Povo de Deus</strong> é publicado pela{" "}
        <a
          href={PAGINA_DA_ARQUIDIOCESE}
          target="_blank"
          rel="noopener noreferrer"
          className="text-principal underline underline-offset-2 hover:text-principal-escuro"
        >
          Arquidiocese de Brasília
        </a>
        . Os arquivos ficam no site dela; esta página apenas mostra a edição da
        semana para você não precisar procurar.
      </p>
      <p className="mt-2">
        Procurando os horários das nossas missas?{" "}
        <Link
          href="/horarios"
          className="text-principal underline underline-offset-2 hover:text-principal-escuro"
        >
          Veja a grade da paróquia
        </Link>
        .
      </p>
    </footer>
  );
}
