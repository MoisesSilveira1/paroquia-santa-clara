/**
 * As contas do calendário mensal.
 *
 * Fora da tela e sem `server-only` porque são funções puras, fáceis de
 * conferir e usadas dos dois lados. Nada aqui fala com banco.
 */

/** Meio-dia, para somar dias sem escorregar no horário de verão. */
function dia(ano: number, mes: number, diaDoMes: number): Date {
  return new Date(ano, mes - 1, diaDoMes, 12, 0, 0, 0);
}

export type Mes = { ano: number; mes: number };

/** "2026-09" → { ano: 2026, mes: 9 }. Valor inválido cai no mês atual. */
export function lerMes(texto: string | undefined, hoje = new Date()): Mes {
  const casou = texto?.match(/^(\d{4})-(\d{2})$/);
  if (!casou) return { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 };

  const ano = Number(casou[1]);
  const mes = Number(casou[2]);
  if (mes < 1 || mes > 12 || ano < 2000 || ano > 2100) {
    return { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 };
  }
  return { ano, mes };
}

export function escreverMes({ ano, mes }: Mes): string {
  return `${ano}-${String(mes).padStart(2, "0")}`;
}

export function mesVizinho({ ano, mes }: Mes, passo: number): Mes {
  const bruto = mes - 1 + passo;
  return { ano: ano + Math.floor(bruto / 12), mes: ((bruto % 12) + 12) % 12 + 1 };
}

/**
 * A grade do mês: sempre semanas inteiras, de domingo a sábado.
 *
 * Inclui as sobras do mês anterior e do seguinte porque um calendário com
 * buracos nas pontas é mais difícil de ler do que um com dias apagados.
 */
export function gradeDoMes({ ano, mes }: Mes): Date[] {
  const primeiro = dia(ano, mes, 1);
  const comeco = new Date(primeiro);
  comeco.setDate(comeco.getDate() - comeco.getDay());

  const dias: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(comeco);
    d.setDate(comeco.getDate() + i);
    dias.push(d);
    // Seis semanas cobrem qualquer mês; para quando a última já passou do fim.
    if (i >= 27 && d.getMonth() !== mes - 1 && d.getDay() === 6) break;
  }
  return dias;
}

/** O intervalo que a consulta ao banco precisa cobrir para desenhar a grade. */
export function intervaloDaGrade(mes: Mes): { de: Date; ate: Date } {
  const dias = gradeDoMes(mes);
  const de = new Date(dias[0]);
  de.setHours(0, 0, 0, 0);
  const ate = new Date(dias[dias.length - 1]);
  ate.setHours(23, 59, 59, 999);
  return { de, ate };
}

export function chaveDoDia(data: Date): string {
  const m = String(data.getMonth() + 1).padStart(2, "0");
  const d = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${m}-${d}`;
}

export function ehDoMes(data: Date, { ano, mes }: Mes): boolean {
  return data.getFullYear() === ano && data.getMonth() + 1 === mes;
}
