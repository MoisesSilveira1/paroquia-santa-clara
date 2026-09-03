/**
 * O calendário litúrgico da Igreja, calculado a partir da data.
 *
 * Tudo aqui sai de uma conta, não de uma tabela digitada nem de uma consulta
 * pela internet: a Páscoa define o ano inteiro, e o resto se apoia nela. Vale
 * para qualquer ano, passado ou futuro, e não deixa de funcionar se algum site
 * sair do ar ou se ninguém atualizar nada.
 *
 * O que este arquivo NÃO faz: dizer o santo de cada dia do ano e trazer as
 * leituras. O santoral tem centenas de memórias com regras de precedência, e
 * as leituras são texto de terceiros — os nomes das celebrações de domingo e
 * as leituras vêm do folheto da Arquidiocese (lib/povo-de-deus), que é a fonte
 * que esta paróquia de fato segue.
 *
 * Sem `server-only`: são funções puras, e a tela também as usa.
 */

export type Tempo =
  | "ADVENTO"
  | "NATAL"
  | "QUARESMA"
  | "TRIDUO"
  | "PASCOA"
  | "COMUM";

export type Cor = "ROXO" | "BRANCO" | "VERDE" | "VERMELHO" | "ROSA";

export const NOME_DO_TEMPO: Record<Tempo, string> = {
  ADVENTO: "Advento",
  NATAL: "Tempo do Natal",
  QUARESMA: "Quaresma",
  TRIDUO: "Tríduo Pascal",
  PASCOA: "Tempo Pascal",
  COMUM: "Tempo Comum",
};

export const NOME_DA_COR: Record<Cor, string> = {
  ROXO: "Roxo",
  BRANCO: "Branco",
  VERDE: "Verde",
  VERMELHO: "Vermelho",
  ROSA: "Rosa",
};

export type DiaLiturgico = {
  /** "2026-09-06" */
  data: string;
  tempo: Tempo;
  cor: Cor;
  /** Semana dentro do tempo. Null no Tríduo e nos dias do Natal sem semana. */
  semana: number | null;
  /** Nome pronto para a tela: "XXIII Domingo do Tempo Comum". */
  titulo: string;
  /** Ano litúrgico: começa no 1º Domingo do Advento do ano civil anterior. */
  ano: number;
  /** Ciclo dos domingos: A, B ou C. */
  cicloDominical: "A" | "B" | "C";
  /** Ciclo das leituras de dias de semana: I ou II. */
  cicloSemanal: "I" | "II";
  /** Preenchido nas solenidades e festas que este módulo conhece. */
  solenidade: string | null;
};

// ---------------------------------------------------------------------------
// Datas básicas
// ---------------------------------------------------------------------------

/** Meio-dia, para somar e subtrair dias sem escorregar no horário de verão. */
function dia(ano: number, mes: number, diaDoMes: number): Date {
  return new Date(ano, mes - 1, diaDoMes, 12, 0, 0, 0);
}

function somarDias(data: Date, dias: number): Date {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
}

function diferencaEmDias(de: Date, ate: Date): number {
  return Math.round((paraMeioDia(ate).getTime() - paraMeioDia(de).getTime()) / 86_400_000);
}

function paraMeioDia(data: Date): Date {
  return dia(data.getFullYear(), data.getMonth() + 1, data.getDate());
}

export function paraIso(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const d = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${d}`;
}

export function deIso(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return dia(a, m, d);
}

/**
 * Domingo de Páscoa pelo cômputo gregoriano (algoritmo de Meeus/Jones/Butcher).
 *
 * A Páscoa é o primeiro domingo depois da primeira lua cheia a partir do
 * equinócio de março — regra do Concílio de Niceia. Daí saem, por soma e
 * subtração, a Quaresma, o Tempo Pascal e todas as festas móveis.
 */
export function domingoDePascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const diaDoMes = ((h + l - 7 * m + 114) % 31) + 1;
  return dia(ano, mes, diaDoMes);
}

/**
 * 1º Domingo do Advento do ano civil informado.
 *
 * É o quarto domingo antes do Natal: acha-se o domingo anterior ao dia 25 e
 * voltam-se três semanas. Quando o Natal cai num domingo, o 4º Domingo do
 * Advento é o dia 18.
 */
export function primeiroDomingoDoAdvento(anoCivil: number): Date {
  const natal = dia(anoCivil, 12, 25);
  const quarto = somarDias(natal, -(natal.getDay() === 0 ? 7 : natal.getDay()));
  return somarDias(quarto, -21);
}

/**
 * Epifania: no Brasil é transferida para o domingo entre 2 e 8 de janeiro.
 */
function epifania(anoCivil: number): Date {
  const doisDeJaneiro = dia(anoCivil, 1, 2);
  const ateDomingo = (7 - doisDeJaneiro.getDay()) % 7;
  return somarDias(doisDeJaneiro, ateDomingo);
}

/**
 * Batismo do Senhor: fecha o Tempo do Natal.
 *
 * Normalmente é o domingo depois da Epifania. Quando a Epifania cai em 7 ou 8
 * de janeiro não sobra domingo, e a festa passa para a segunda-feira seguinte.
 */
function batismoDoSenhor(anoCivil: number): Date {
  const ep = epifania(anoCivil);
  const diaDoMes = ep.getDate();
  return somarDias(ep, diaDoMes >= 7 ? 1 : 7);
}

// ---------------------------------------------------------------------------
// O ano litúrgico
// ---------------------------------------------------------------------------

export type AnoLiturgico = {
  /** Ano que dá nome ao ciclo — o do Natal e da Páscoa que ele contém. */
  ano: number;
  cicloDominical: "A" | "B" | "C";
  cicloSemanal: "I" | "II";
  inicioDoAdvento: Date;
  natal: Date;
  batismo: Date;
  cinzas: Date;
  domingoDeRamos: Date;
  quintaSanta: Date;
  sextaSanta: Date;
  pascoa: Date;
  ascensao: Date;
  pentecostes: Date;
  santissimaTrindade: Date;
  corpusChristi: Date;
  sagradoCoracao: Date;
  cristoRei: Date;
  /** Primeiro domingo do Advento do ano seguinte: o fim deste ano litúrgico. */
  fim: Date;
};

/** Qual ano litúrgico contém a data. */
export function anoLiturgicoDe(data: Date): AnoLiturgico {
  const civil = data.getFullYear();
  // Depois do 1º Domingo do Advento já se está no ano litúrgico seguinte.
  const ano = data >= primeiroDomingoDoAdvento(civil) ? civil + 1 : civil;
  return montarAno(ano);
}

export function montarAno(ano: number): AnoLiturgico {
  const pascoa = domingoDePascoa(ano);

  return {
    ano,
    // O ciclo vira no Advento. Ano litúrgico 2026 é o "A" — o mesmo que a
    // Arquidiocese estampa nos arquivos do folheto ("...-DTC-A.pdf").
    cicloDominical: (["C", "A", "B"] as const)[ano % 3],
    // Ano par recebe o ciclo II das leituras de dias de semana.
    cicloSemanal: ano % 2 === 0 ? "II" : "I",

    inicioDoAdvento: primeiroDomingoDoAdvento(ano - 1),
    natal: dia(ano - 1, 12, 25),
    batismo: batismoDoSenhor(ano),

    cinzas: somarDias(pascoa, -46),
    domingoDeRamos: somarDias(pascoa, -7),
    quintaSanta: somarDias(pascoa, -3),
    sextaSanta: somarDias(pascoa, -2),
    pascoa,
    // No Brasil a Ascensão é transferida do 40º dia para o domingo seguinte.
    ascensao: somarDias(pascoa, 42),
    pentecostes: somarDias(pascoa, 49),
    santissimaTrindade: somarDias(pascoa, 56),
    // Corpus Christi permanece na quinta-feira, feriado no país.
    corpusChristi: somarDias(pascoa, 60),
    sagradoCoracao: somarDias(pascoa, 68),

    cristoRei: somarDias(primeiroDomingoDoAdvento(ano), -7),
    fim: primeiroDomingoDoAdvento(ano),
  };
}

// ---------------------------------------------------------------------------
// O dia
// ---------------------------------------------------------------------------

const ROMANOS = [
  "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
  "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI", "XXVII", "XXVIII", "XXIX",
  "XXX", "XXXI", "XXXII", "XXXIII", "XXXIV",
];

const DIAS_DA_SEMANA = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado",
];

export function diaLiturgico(dataBruta: Date): DiaLiturgico {
  const data = paraMeioDia(dataBruta);
  const ano = anoLiturgicoDe(data);
  const solenidade = solenidadeDe(data, ano);

  const base = {
    data: paraIso(data),
    ano: ano.ano,
    cicloDominical: ano.cicloDominical,
    cicloSemanal: ano.cicloSemanal,
    solenidade,
  };

  const { tempo, semana } = tempoESemana(data, ano);
  const cor = corDoDia(data, ano, tempo, semana, solenidade);
  const titulo = solenidade ?? tituloComum(data, tempo, semana);

  return { ...base, tempo, semana, cor, titulo };
}

function tempoESemana(
  data: Date,
  ano: AnoLiturgico
): { tempo: Tempo; semana: number | null } {
  if (data >= ano.quintaSanta && data <= ano.pascoa) {
    return { tempo: "TRIDUO", semana: null };
  }

  if (data >= ano.inicioDoAdvento && data < ano.natal) {
    return {
      tempo: "ADVENTO",
      semana: 1 + Math.floor(diferencaEmDias(ano.inicioDoAdvento, data) / 7),
    };
  }

  if (data >= ano.natal && data <= ano.batismo) {
    return { tempo: "NATAL", semana: null };
  }

  if (data >= ano.cinzas && data < ano.quintaSanta) {
    // A Quaresma começa numa quarta-feira: os quatro primeiros dias ainda são
    // a "semana das Cinzas", e a 1ª semana só abre no domingo seguinte.
    const primeiroDomingo = somarDias(ano.pascoa, -42);
    if (data < primeiroDomingo) return { tempo: "QUARESMA", semana: 0 };
    return {
      tempo: "QUARESMA",
      semana: 1 + Math.floor(diferencaEmDias(primeiroDomingo, data) / 7),
    };
  }

  if (data > ano.pascoa && data <= ano.pentecostes) {
    return {
      tempo: "PASCOA",
      semana: 1 + Math.ceil(diferencaEmDias(ano.pascoa, data) / 7),
    };
  }

  return { tempo: "COMUM", semana: semanaDoTempoComum(data, ano) };
}

/**
 * A semana do Tempo Comum, que vem em dois pedaços.
 *
 * O primeiro começa na segunda-feira depois do Batismo do Senhor e conta para
 * a frente. O segundo, depois de Pentecostes, conta PARA TRÁS a partir de
 * Cristo Rei, que é sempre a 34ª semana — é assim que as semanas omitidas pela
 * Quaresma e pela Páscoa somem do meio, e não do fim.
 */
function semanaDoTempoComum(data: Date, ano: AnoLiturgico): number {
  if (data < ano.cinzas) {
    // O domingo seguinte ao Batismo já é o 2º do Tempo Comum: a 1ª semana
    // tem só os dias úteis, porque o Batismo ocupou o lugar do domingo.
    const segundoDomingo = somarDias(ano.batismo, 7);
    if (data < segundoDomingo) return 1;
    return 2 + Math.floor(diferencaEmDias(segundoDomingo, data) / 7);
  }

  // Domingo da semana em que a data cai (a semana litúrgica abre no domingo).
  const domingoDaSemana = somarDias(data, -data.getDay());
  const semanasAteCristoRei = Math.round(
    diferencaEmDias(domingoDaSemana, ano.cristoRei) / 7
  );
  return 34 - semanasAteCristoRei;
}

/** Solenidades e festas móveis, mais as fixas que esta paróquia celebra. */
function solenidadeDe(data: Date, ano: AnoLiturgico): string | null {
  const moveis: [Date, string][] = [
    [ano.cinzas, "Quarta-feira de Cinzas"],
    [ano.domingoDeRamos, "Domingo de Ramos e da Paixão do Senhor"],
    [ano.quintaSanta, "Quinta-feira Santa"],
    [ano.sextaSanta, "Sexta-feira Santa da Paixão do Senhor"],
    [somarDias(ano.pascoa, -1), "Sábado Santo"],
    [ano.pascoa, "Domingo de Páscoa da Ressurreição do Senhor"],
    [ano.ascensao, "Ascensão do Senhor"],
    [ano.pentecostes, "Pentecostes"],
    [ano.santissimaTrindade, "Santíssima Trindade"],
    [ano.corpusChristi, "Corpus Christi"],
    [ano.sagradoCoracao, "Sagrado Coração de Jesus"],
    [ano.cristoRei, "Nosso Senhor Jesus Cristo, Rei do Universo"],
  ];

  for (const [quando, nome] of moveis) {
    if (paraIso(quando) === paraIso(data)) return nome;
  }

  const fixas: Record<string, string> = {
    "01-01": "Santa Maria, Mãe de Deus",
    "03-19": "São José, Esposo de Maria",
    "03-25": "Anunciação do Senhor",
    "06-24": "Natividade de São João Batista",
    "06-29": "São Pedro e São Paulo",
    "08-06": "Transfiguração do Senhor",
    "08-11": "Santa Clara de Assis",
    "08-15": "Assunção de Nossa Senhora",
    "09-14": "Exaltação da Santa Cruz",
    "10-04": "São Francisco de Assis",
    "10-12": "Nossa Senhora Aparecida, Padroeira do Brasil",
    "11-01": "Todos os Santos",
    "11-02": "Comemoração de todos os fiéis defuntos",
    "12-08": "Imaculada Conceição de Nossa Senhora",
    "12-25": "Natal do Senhor",
  };

  const chave = paraIso(data).slice(5);
  if (fixas[chave]) return fixas[chave];

  // A Epifania e a Sagrada Família mudam de dia conforme o ano.
  if (paraIso(epifania(data.getFullYear())) === paraIso(data)) {
    return "Epifania do Senhor";
  }
  if (paraIso(ano.batismo) === paraIso(data)) return "Batismo do Senhor";

  return null;
}

function tituloComum(data: Date, tempo: Tempo, semana: number | null): string {
  const ehDomingo = data.getDay() === 0;
  const romano = semana !== null ? (ROMANOS[semana] ?? String(semana)) : "";

  if (tempo === "TRIDUO") return "Tríduo Pascal";
  if (tempo === "NATAL") return `${DIAS_DA_SEMANA[data.getDay()]} do Tempo do Natal`;

  if (tempo === "QUARESMA" && semana === 0) {
    return `${DIAS_DA_SEMANA[data.getDay()]} depois das Cinzas`;
  }

  const nomeDoTempo =
    tempo === "COMUM"
      ? "do Tempo Comum"
      : tempo === "PASCOA"
        ? "da Páscoa"
        : tempo === "QUARESMA"
          ? "da Quaresma"
          : "do Advento";

  if (ehDomingo) return `${romano} Domingo ${nomeDoTempo}`;
  return `${DIAS_DA_SEMANA[data.getDay()]} da ${semana}ª semana ${nomeDoTempo}`;
}

function corDoDia(
  data: Date,
  ano: AnoLiturgico,
  tempo: Tempo,
  semana: number | null,
  solenidade: string | null
): Cor {
  const iso = paraIso(data);

  if (iso === paraIso(ano.sextaSanta)) return "VERMELHO";
  if (iso === paraIso(ano.domingoDeRamos)) return "VERMELHO";
  if (iso === paraIso(ano.pentecostes)) return "VERMELHO";
  if (iso === paraIso(dia(data.getFullYear(), 9, 14))) return "VERMELHO";
  if (iso === paraIso(dia(data.getFullYear(), 6, 29))) return "VERMELHO";

  if (tempo === "TRIDUO") return "BRANCO";
  if (tempo === "NATAL" || tempo === "PASCOA") return "BRANCO";

  // Gaudete e Laetare: o roxo cede ao rosa uma vez em cada tempo de espera.
  if (tempo === "ADVENTO") {
    return data.getDay() === 0 && semana === 3 ? "ROSA" : "ROXO";
  }
  if (tempo === "QUARESMA") {
    return data.getDay() === 0 && semana === 4 ? "ROSA" : "ROXO";
  }

  return solenidade ? "BRANCO" : "VERDE";
}

// ---------------------------------------------------------------------------
// Para as telas
// ---------------------------------------------------------------------------

export type Periodo = { nome: string; inicio: Date; fim: Date; cor: Cor };

/** Os tempos do ano litúrgico, com as datas de início e fim. */
export function temposDoAno(ano: AnoLiturgico): Periodo[] {
  return [
    {
      nome: "Advento",
      inicio: ano.inicioDoAdvento,
      fim: somarDias(ano.natal, -1),
      cor: "ROXO",
    },
    { nome: "Tempo do Natal", inicio: ano.natal, fim: ano.batismo, cor: "BRANCO" },
    {
      nome: "Tempo Comum (1ª parte)",
      inicio: somarDias(ano.batismo, 1),
      fim: somarDias(ano.cinzas, -1),
      cor: "VERDE",
    },
    {
      nome: "Quaresma",
      inicio: ano.cinzas,
      fim: somarDias(ano.quintaSanta, -1),
      cor: "ROXO",
    },
    { nome: "Tríduo Pascal", inicio: ano.quintaSanta, fim: ano.pascoa, cor: "BRANCO" },
    {
      nome: "Tempo Pascal",
      inicio: somarDias(ano.pascoa, 1),
      fim: ano.pentecostes,
      cor: "BRANCO",
    },
    {
      nome: "Tempo Comum (2ª parte)",
      inicio: somarDias(ano.pentecostes, 1),
      fim: somarDias(ano.fim, -1),
      cor: "VERDE",
    },
  ];
}

/** Os dias de um intervalo, já resolvidos. */
export function diasEntre(inicio: Date, fim: Date): DiaLiturgico[] {
  const dias: DiaLiturgico[] = [];
  for (let d = paraMeioDia(inicio); d <= fim; d = somarDias(d, 1)) {
    dias.push(diaLiturgico(d));
  }
  return dias;
}
