/**
 * Os espaços da paróquia que podem ser reservados na agenda.
 *
 * A lista saiu do calendário da própria catequese, que já marca encontros
 * nesses lugares — ou seja, são os nomes que a comunidade usa, e não nomes
 * inventados aqui. Até 10/09/2026 esta lista era um chute meu (havia "Sala 1",
 * "Sala 2" e "Salão paroquial", que ninguém chama assim).
 *
 * Continua sendo uma SUGESTÃO, e não uma lista fechada: o campo do formulário
 * é um `datalist`, então a secretaria pode digitar um espaço que não esteja
 * aqui. Fechar a lista obrigaria a mexer no código toda vez que a paróquia
 * usasse um lugar novo — e o site ficaria no caminho do trabalho dela.
 *
 * Sem `server-only`: o formulário do navegador também precisa da lista.
 */
export const ESPACOS_DA_PAROQUIA = [
  "Nave",
  "Auditório Santa Clara",
  "Centro Catequético",
  "Quiosque",
  "Estacionamento",
  "Capela Rainha da Paz",
  "Secretaria",
] as const;

export type EspacoDaParoquia = (typeof ESPACOS_DA_PAROQUIA)[number];

/**
 * Espaços que NÃO entram na conta de choque de horário.
 *
 * O estacionamento comporta várias coisas ao mesmo tempo; avisar que "já tem
 * compromisso ali" toda vez seria ruído. Os demais são salas de verdade: duas
 * reuniões no mesmo lugar e na mesma hora é erro, não coincidência.
 */
const SEM_EXCLUSIVIDADE = new Set<string>(["Estacionamento"]);

/**
 * Se vale conferir choque de horário para este espaço.
 *
 * Campo vazio não é conferido: agenda sem local marcado é o caso de quem ainda
 * não decidiu onde vai ser, e travar isso atrapalharia sem proteger nada.
 */
export function disputaEspaco(local: string | null | undefined): boolean {
  if (!local) return false;
  return !SEM_EXCLUSIVIDADE.has(local.trim());
}

/**
 * Compara dois nomes de espaço.
 *
 * Como o campo é livre, o mesmo lugar chega escrito de jeitos diferentes —
 * "Auditório Santa Clara", "auditorio santa clara", "Auditório  Santa Clara".
 * Sem normalizar, o aviso de choque simplesmente não dispararia nesses casos,
 * que são justamente os mais comuns quando duas pessoas diferentes digitam.
 */
export function mesmoEspaco(a: string, b: string): boolean {
  return normalizar(a) === normalizar(b);
}

export function normalizar(nome: string): string {
  return nome
    .trim()
    .toLowerCase()
    // Separa as letras dos acentos e joga os acentos fora, para "auditório" e
    // "auditorio" virarem a mesma coisa.
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}
