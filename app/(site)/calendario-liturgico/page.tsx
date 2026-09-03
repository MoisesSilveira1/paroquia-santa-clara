import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, FileText } from "lucide-react";
import {
  anoLiturgicoDe,
  diaLiturgico,
  diasEntre,
  NOME_DA_COR,
  NOME_DO_TEMPO,
  temposDoAno,
  type Cor,
  type DiaLiturgico,
} from "@/lib/liturgia/calendario";
import {
  buscarEdicoes,
  PAGINA_DA_ARQUIDIOCESE,
  type EdicaoDoFolheto,
} from "@/lib/povo-de-deus/arquidiocese";

export const metadata: Metadata = {
  title: "Calendário Litúrgico",
  description:
    "Tempo litúrgico, cor e celebração de cada dia, com o folheto das leituras da missa.",
};

/** Reconferido a cada hora, junto com o folheto: o dia vira à meia-noite. */
export const revalidate = 3600;

// O branco precisa de contorno cheio: sobre o cartão branco, uma borda fraca
// vira uma bolinha vazia que parece defeito, e não a cor litúrgica.
const AMOSTRA: Record<Cor, string> = {
  ROXO: "bg-[#6b3fa0]",
  BRANCO: "bg-white border border-texto-suave",
  VERDE: "bg-[#2f7d4f]",
  VERMELHO: "bg-[#b3312c]",
  ROSA: "bg-[#e8a2b8]",
};

const DIA_LONGO = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const DIA_CURTO = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});
const SO_DATA = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
// Mês por extenso no meio de frase: "04 de jun." no fim de período viraria
// "jun..".
const DATA_NA_FRASE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
});

function comoData(iso: string) {
  return new Date(`${iso}T12:00:00`);
}

/**
 * Link do folheto daquela data, quando a Arquidiocese publicou um.
 *
 * Só oferece o link em domingo ou solenidade, que é para o que o folheto
 * existe. A conferência não é preciosismo: em 03/09/2026 o calendário da
 * Arquidiocese trazia "ASSUNÇÃO DE NOSSA SENHORA" numa quinta-feira comum, e
 * os arquivos daquela entrada eram os do dia 16/08 — um engano de digitação
 * do lado deles. Sem esta peneira, a página diria "leituras de hoje" e
 * entregaria o folheto de outra celebração.
 */
function folhetoDe(
  dia: DiaLiturgico,
  edicao: EdicaoDoFolheto | undefined
): string | null {
  if (!edicao) return null;

  const ehDomingo = new Date(`${dia.data}T12:00:00`).getDay() === 0;
  if (!ehDomingo && !dia.solenidade) return null;

  const preferido =
    edicao.arquivos.find((a) => a.tipo === "folheto") ??
    edicao.arquivos.find((a) => a.tipo === "celular");
  return preferido?.url ?? null;
}

export default async function PaginaCalendarioLiturgico() {
  const hoje = new Date();
  const dia = diaLiturgico(hoje);
  const ano = anoLiturgicoDe(hoje);

  // Três semanas à frente: o suficiente para quem prepara a liturgia da
  // semana que vem sem virar uma parede de datas.
  const proximos = diasEntre(
    new Date(hoje.getTime() + 86_400_000),
    new Date(hoje.getTime() + 21 * 86_400_000)
  );

  const edicoes = await buscarEdicoes();
  const porData = new Map(edicoes.map((e) => [e.data, e]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl text-principal-escuro">Calendário Litúrgico</h1>
      <p className="mt-3 max-w-2xl text-texto-suave">
        Em que tempo litúrgico estamos, a cor de cada dia e a celebração que a
        Igreja faz. As leituras de cada missa estão no folheto{" "}
        <Link
          href="/povo-de-deus"
          className="text-principal underline underline-offset-2 hover:text-principal-escuro"
        >
          O Povo de Deus
        </Link>
        , ligado dia a dia aqui embaixo.
      </p>

      <Hoje dia={dia} folheto={folhetoDe(dia, porData.get(dia.data))} />

      <section className="mt-10">
        <h2 className="text-xl text-principal-escuro">Próximos dias</h2>
        <ul className="mt-4 divide-y divide-fundo-suave rounded-xl border border-destaque-claro bg-white">
          {proximos.map((d) => (
            <li
              key={d.data}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3"
            >
              <span className="w-28 shrink-0 text-sm text-texto-suave tabular-nums first-letter:uppercase">
                {DIA_CURTO.format(comoData(d.data))}
              </span>
              <span
                className={`h-3 w-3 shrink-0 rounded-full ${AMOSTRA[d.cor]}`}
                title={`Cor litúrgica: ${NOME_DA_COR[d.cor]}`}
                aria-label={`Cor litúrgica: ${NOME_DA_COR[d.cor]}`}
              />
              <span
                className={`flex-1 text-sm ${d.solenidade ? "font-medium text-texto" : "text-texto-suave"}`}
              >
                {d.titulo}
              </span>
              <FolhetoDoDia url={folhetoDe(d, porData.get(d.data))} />
            </li>
          ))}
        </ul>
      </section>

      <AnoLiturgicoAtual ano={ano} />
      <SobreAsLeituras />
    </div>
  );
}

function Hoje({ dia, folheto }: { dia: DiaLiturgico; folheto: string | null }) {
  return (
    <section className="mt-8 rounded-xl border-2 border-destaque bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-destaque">
        Hoje
      </p>
      <h2 className="mt-1 text-2xl text-principal-escuro">{dia.titulo}</h2>
      <p className="mt-1 text-texto-suave first-letter:uppercase">
        {DIA_LONGO.format(comoData(dia.data))}
      </p>

      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-texto-suave">
            Tempo litúrgico
          </dt>
          <dd className="mt-0.5 font-medium text-texto">
            {NOME_DO_TEMPO[dia.tempo]}
            {dia.semana !== null && dia.semana > 0 && (
              <span className="font-normal text-texto-suave">
                {" "}
                · {dia.semana}ª semana
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-texto-suave">
            Cor da celebração
          </dt>
          <dd className="mt-0.5 flex items-center gap-2 font-medium text-texto">
            <span
              className={`h-4 w-4 rounded-full ${AMOSTRA[dia.cor]}`}
              aria-hidden
            />
            {NOME_DA_COR[dia.cor]}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-texto-suave">
            Ano litúrgico
          </dt>
          <dd className="mt-0.5 font-medium text-texto">
            Ano {dia.cicloDominical}
            <span className="font-normal text-texto-suave">
              {" "}
              · ciclo {dia.cicloSemanal}
            </span>
          </dd>
        </div>
      </dl>

      {folheto && (
        <a
          href={folheto}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-principal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-principal-escuro"
        >
          <FileText className="h-4 w-4" aria-hidden />
          Leituras de hoje no folheto
        </a>
      )}
    </section>
  );
}

function FolhetoDoDia({ url }: { url: string | null }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-destaque-claro px-2.5 py-1 text-xs font-medium text-principal transition-colors hover:border-destaque hover:bg-fundo"
    >
      <FileText className="h-3.5 w-3.5" aria-hidden />
      Folheto
    </a>
  );
}

function AnoLiturgicoAtual({
  ano,
}: {
  ano: ReturnType<typeof anoLiturgicoDe>;
}) {
  const periodos = temposDoAno(ano);

  return (
    <section className="mt-10">
      <h2 className="text-xl text-principal-escuro">
        O ano litúrgico {ano.ano}
      </h2>
      <p className="mt-1 text-sm text-texto-suave">
        Começou no 1º Domingo do Advento e vai até o sábado antes do Advento
        seguinte. Neste ano os domingos seguem o <strong>Ano {ano.cicloDominical}</strong> e
        os dias de semana, o <strong>ciclo {ano.cicloSemanal}</strong>.
      </p>

      <ul className="mt-4 divide-y divide-fundo-suave rounded-xl border border-destaque-claro bg-white">
        {periodos.map((periodo) => (
          <li
            key={periodo.nome}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3"
          >
            <span
              className={`h-3 w-3 shrink-0 rounded-full ${AMOSTRA[periodo.cor]}`}
              aria-hidden
            />
            <span className="flex-1 font-medium text-texto">{periodo.nome}</span>
            <span className="text-sm text-texto-suave tabular-nums">
              {SO_DATA.format(periodo.inicio)} — {SO_DATA.format(periodo.fim)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-texto-suave">
        As datas móveis saem da Páscoa deste ano,{" "}
        {DIA_LONGO.format(ano.pascoa)}. Ascensão do Senhor em{" "}
        {DATA_NA_FRASE.format(ano.ascensao)}, Pentecostes em{" "}
        {DATA_NA_FRASE.format(ano.pentecostes)} e Corpus Christi em{" "}
        {DATA_NA_FRASE.format(ano.corpusChristi)}.
      </p>
    </section>
  );
}

/**
 * Onde estão as leituras.
 *
 * Vale dizer isto na tela, e não só no código: quem procura "as leituras da
 * missa" precisa achar o caminho na primeira olhada, e o caminho é o folheto.
 */
function SobreAsLeituras() {
  return (
    <section className="mt-10 rounded-xl bg-fundo-suave p-5 text-sm text-texto-suave">
      <h2 className="flex items-center gap-2 text-base font-medium text-texto">
        <BookOpenText className="h-5 w-5 text-principal" aria-hidden />
        As leituras de cada missa
      </h2>
      <p className="mt-2">
        Os textos das leituras são publicados pela Arquidiocese de Brasília no
        folheto <strong>O Povo de Deus</strong>, com as orações e os cantos da
        celebração. Por isso os dias acima levam direto ao folheto, em vez de o
        site guardar uma cópia que envelheceria.
      </p>
      <p className="mt-2">
        <Link
          href="/povo-de-deus"
          className="text-principal underline underline-offset-2 hover:text-principal-escuro"
        >
          Ver o folheto da semana
        </Link>{" "}
        ·{" "}
        <a
          href={PAGINA_DA_ARQUIDIOCESE}
          target="_blank"
          rel="noopener noreferrer"
          className="text-principal underline underline-offset-2 hover:text-principal-escuro"
        >
          Todas as edições na Arquidiocese
        </a>
      </p>
    </section>
  );
}
