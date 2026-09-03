/**
 * Converte entre a hora do relógio da paróquia e o instante guardado no banco.
 *
 * Por que isto existe: `new Date("2026-09-10T19:30:00")` usa o fuso de quem
 * está rodando o código. No computador da secretaria isso é Brasília e dá
 * certo por acidente; em hospedagem serverless o servidor roda em UTC, e a
 * mesma linha guardaria 19h30 UTC — que é 16h30 aqui. A reunião apareceria
 * três horas cedo.
 *
 * Guardar o instante certo também é o que torna possível, no futuro, mandar a
 * agenda para o Google Calendar ou publicá-la como assinatura: os dois falam
 * em instantes, e horário sem fuso não tem tradução.
 *
 * O deslocamento vem da base de fusos do próprio navegador/Node, via `Intl`,
 * e não de um "-3" fixo. O Brasil aboliu o horário de verão em 2019, mas já
 * mudou de ideia sobre isso antes, e datas antigas ainda caem no horário de
 * verão de quando ele existia.
 */

export const FUSO_DA_PAROQUIA = "America/Sao_Paulo";

const PARTES = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO_DA_PAROQUIA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** Quantos minutos o fuso da paróquia está à frente do UTC (negativo aqui). */
function deslocamentoEmMinutos(instante: Date): number {
  const p = Object.fromEntries(
    PARTES.formatToParts(instante).map((parte) => [parte.type, parte.value])
  );
  const comoSeFosseUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour),
    Number(p.minute),
    Number(p.second)
  );
  return (comoSeFosseUtc - instante.getTime()) / 60000;
}

/**
 * "2026-09-10" + "19:30" (hora de Brasília) → o instante correspondente.
 *
 * Faz duas passadas de propósito: o deslocamento depende do instante, e o
 * instante depende do deslocamento. A segunda passada acerta os casos na
 * virada do horário de verão, quando a primeira pode cair do lado errado.
 */
export function instanteNaParoquia(dataIso: string, hora: string): Date {
  const comoUtc = new Date(`${dataIso}T${hora}:00Z`);
  const primeira = new Date(comoUtc.getTime() - deslocamentoEmMinutos(comoUtc) * 60000);
  return new Date(comoUtc.getTime() - deslocamentoEmMinutos(primeira) * 60000);
}

/** O inverso: o instante visto pelo relógio da paróquia. */
export function partesNaParoquia(instante: Date): {
  data: string;
  hora: string;
} {
  const p = Object.fromEntries(
    PARTES.formatToParts(instante).map((parte) => [parte.type, parte.value])
  );
  return { data: `${p.year}-${p.month}-${p.day}`, hora: `${p.hora ?? p.hour}:${p.minute}` };
}

/** Formatadores que sempre mostram a hora da paróquia, não a de quem lê. */
export function formatador(opcoes: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pt-BR", {
    ...opcoes,
    timeZone: FUSO_DA_PAROQUIA,
  });
}
