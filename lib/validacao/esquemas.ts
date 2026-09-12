import { z } from "zod";
import { PAPEIS } from "@/lib/auth/papeis";
import { idDoVideo } from "@/lib/video/youtube";
import { instanteNaParoquia } from "@/lib/agenda/fuso";

/**
 * Formato de tudo que entra pelo painel.
 *
 * Como o SQLite não tem `enum`, é aqui que os valores de situação viram uma
 * lista fechada de verdade. Nenhuma Server Action escreve no banco sem passar
 * por um destes esquemas: o que chega de um formulário é texto vindo da rede,
 * não um objeto confiável.
 */

// ---------------------------------------------------------------------------
// Listas fechadas (o que seriam enums em Postgres)
// ---------------------------------------------------------------------------

// Os papéis vêm de `lib/auth/papeis.ts`, e não de uma segunda lista aqui: a
// mesma lista escrita em dois arquivos é a receita para um deles envelhecer.
export { PAPEIS };

export const CATEGORIAS_NOTICIA = ["NOTICIA", "EVENTO"] as const;
export const TIPOS_DE_INSCRICAO = ["NOVA", "RENOVACAO"] as const;
export const STATUS_INSCRICAO = [
  "RECEBIDA",
  "EM_ANALISE",
  "CONFIRMADA",
  "RECUSADA",
] as const;
export const TIPOS_DE_EVENTO = ["REUNIAO", "ESCALA"] as const;
export const STATUS_NOTICIA = ["RASCUNHO", "PUBLICADA", "ARQUIVADA"] as const;
export const STATUS_MENSAGEM = ["NOVA", "LIDA", "RESPONDIDA", "ARQUIVADA"] as const;

export type CategoriaNoticia = (typeof CATEGORIAS_NOTICIA)[number];
export type TipoDeInscricao = (typeof TIPOS_DE_INSCRICAO)[number];
export type StatusInscricao = (typeof STATUS_INSCRICAO)[number];
export type TipoDeEvento = (typeof TIPOS_DE_EVENTO)[number];
export type StatusNoticia = (typeof STATUS_NOTICIA)[number];
export type StatusMensagem = (typeof STATUS_MENSAGEM)[number];

/** Rótulos em português, usados nos selos e nos filtros das telas. */
export const ROTULO_STATUS_NOTICIA: Record<StatusNoticia, string> = {
  RASCUNHO: "Rascunho",
  PUBLICADA: "Publicada",
  ARQUIVADA: "Arquivada",
};

export const ROTULO_TIPO_DE_EVENTO: Record<TipoDeEvento, string> = {
  REUNIAO: "Reunião",
  ESCALA: "Escala de serviço",
};

export const ROTULO_CATEGORIA: Record<CategoriaNoticia, string> = {
  NOTICIA: "Notícia",
  EVENTO: "Evento",
};

export const ROTULO_TIPO_DE_INSCRICAO: Record<TipoDeInscricao, string> = {
  NOVA: "Primeira inscrição",
  RENOVACAO: "Renovação de matrícula",
};

export const ROTULO_STATUS_INSCRICAO: Record<StatusInscricao, string> = {
  RECEBIDA: "Recebida",
  EM_ANALISE: "Em análise",
  CONFIRMADA: "Confirmada",
  RECUSADA: "Não aceita",
};

export const ROTULO_STATUS_MENSAGEM: Record<StatusMensagem, string> = {
  NOVA: "Nova",
  LIDA: "Lida",
  RESPONDIDA: "Respondida",
  ARQUIVADA: "Arquivada",
};

export const DIAS_DA_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

// ---------------------------------------------------------------------------
// Peças reaproveitadas
// ---------------------------------------------------------------------------

const texto = (min: number, max: number, nome: string) =>
  z
    .string()
    .trim()
    .min(min, `${nome} precisa de pelo menos ${min} caractere(s).`)
    .max(max, `${nome} passa de ${max} caracteres.`);

/**
 * Campo opcional de formulário: `""` vira `null`, não string vazia.
 *
 * Aceita as três formas de "não veio nada": string vazia, `null` e AUSENTE.
 *
 * A terceira faltava até 12/09/2026, e o efeito era desproporcional: um campo
 * que a tela só desenha às vezes — como o padrinho, escondido atrás de um
 * botão no formulário da catequese — simplesmente não vai no envio. O esquema
 * então recusava o formulário INTEIRO com "expected string, received
 * undefined", uma mensagem que não é para ninguém ler e que apontava para um
 * campo que a pessoa nem viu na tela.
 *
 * Nos formulários do painel nunca apareceu porque lá todos os campos estão
 * sempre desenhados. Bastava um campo condicional para o problema surgir.
 */
const opcional = (max: number, nome: string) =>
  z
    .string()
    .trim()
    .max(max, `${nome} passa de ${max} caracteres.`)
    .optional()
    .nullable()
    .transform((v) => v || null);

const id = z.string().min(1, "Identificador ausente.");

/**
 * Caixa de marcar de um formulário HTML.
 *
 * Um checkbox desmarcado simplesmente NÃO é enviado — não chega como "false".
 * Por isso não dá para usar `z.coerce.boolean().default(true)`: ausente cairia
 * no default e "desmarcado" viraria `true`. Aqui, ausente é `false`, que é o
 * que o formulário realmente disse.
 */
const caixaDeMarcar = z
  .union([z.string(), z.boolean()])
  .optional()
  .transform((v) => v === true || v === "on" || v === "true" || v === "1");

/** Data no formato do campo `<input type="date">`. */
const dataOpcional = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Data inválida.")
  .transform((v) => (v ? new Date(`${v}T12:00:00`) : null))
  .nullable();

// ---------------------------------------------------------------------------
// Entrada no painel
// ---------------------------------------------------------------------------

export const entrarSchema = z.object({
  email: z.email("Informe um e-mail válido.").trim().toLowerCase(),
  senha: z.string().min(1, "Informe a senha."),
});

// ---------------------------------------------------------------------------
// Avisos
// ---------------------------------------------------------------------------

export const avisoSchema = z.object({
  texto: texto(5, 280, "O aviso"),
  ativo: caixaDeMarcar,
  ordem: z.coerce.number().int().min(0).max(999).default(0),
});

export const avisoEdicaoSchema = avisoSchema.extend({ id });

/**
 * O aviso que abre o site.
 *
 * O endereço do vídeo é recusado aqui quando não é do YouTube: quem monta o
 * `<iframe>` da tela confia que isso já foi conferido — ver lib/video/youtube.
 * Recusar no formulário também avisa a secretaria na hora, em vez de o vídeo
 * simplesmente não aparecer no site sem explicação.
 */
export const avisoParoquialSchema = z
  .object({
    titulo: texto(3, 160, "O título"),
    texto: opcional(4000, "O texto"),
    videoUrl: opcional(400, "O endereço do vídeo"),
    ativo: caixaDeMarcar,
    expiraEm: dataOpcional,
    /** Marcada, a imagem guardada é apagada ao salvar. */
    removerImagem: caixaDeMarcar,
  })
  .refine((dados) => !dados.videoUrl || idDoVideo(dados.videoUrl) !== null, {
    path: ["videoUrl"],
    message:
      "Só aceito vídeo do YouTube. Copie o endereço da barra do navegador ou do botão Compartilhar.",
  });

export const avisoParoquialEdicaoSchema = z
  .object({
    id,
    titulo: texto(3, 160, "O título"),
    texto: opcional(4000, "O texto"),
    videoUrl: opcional(400, "O endereço do vídeo"),
    ativo: caixaDeMarcar,
    expiraEm: dataOpcional,
    removerImagem: caixaDeMarcar,
  })
  .refine((dados) => !dados.videoUrl || idDoVideo(dados.videoUrl) !== null, {
    path: ["videoUrl"],
    message:
      "Só aceito vídeo do YouTube. Copie o endereço da barra do navegador ou do botão Compartilhar.",
  });

// ---------------------------------------------------------------------------
// Notícias e eventos
// ---------------------------------------------------------------------------

export const noticiaSchema = z.object({
  titulo: texto(5, 160, "O título"),
  resumo: texto(10, 400, "O resumo"),
  corpo: opcional(20000, "O texto"),
  categoria: z.enum(CATEGORIAS_NOTICIA),
  status: z.enum(STATUS_NOTICIA),
  destaque: caixaDeMarcar,
  publicadaEm: dataOpcional,
});

export const noticiaEdicaoSchema = noticiaSchema.extend({ id });

// ---------------------------------------------------------------------------
// Horários das celebrações
// ---------------------------------------------------------------------------

export const celebracaoSchema = z.object({
  diaSemana: z.coerce
    .number()
    .int()
    .min(0, "Dia da semana inválido.")
    .max(6, "Dia da semana inválido."),
  hora: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use o formato HH:MM (ex.: 19:30)."),
  nome: texto(3, 120, "O nome da celebração"),
  local: texto(2, 120, "O local"),
  transmitida: caixaDeMarcar,
  observacao: opcional(280, "A observação"),
  ativo: caixaDeMarcar,
});

export const celebracaoEdicaoSchema = celebracaoSchema.extend({ id });

// ---------------------------------------------------------------------------
// Pastorais
// ---------------------------------------------------------------------------

export const pastoralSchema = z.object({
  nome: texto(3, 120, "O nome"),
  descricao: texto(10, 600, "A descrição"),
  contato: texto(3, 160, "O contato"),
  reunioes: texto(3, 160, "As reuniões"),
  ativa: caixaDeMarcar,
  ordem: z.coerce.number().int().min(0).max(999).default(0),
});

export const pastoralEdicaoSchema = pastoralSchema.extend({ id });

/**
 * Quem responde por uma pastoral.
 *
 * Telefone e e-mail são opcionais e o e-mail é validado só quando vem
 * preenchido: muita gente da comunidade não usa e-mail, e obrigar o campo
 * levaria a secretaria a inventar um endereço para conseguir salvar.
 */
export const coordenadorSchema = z.object({
  nome: texto(3, 120, "O nome"),
  funcao: texto(3, 60, "A função"),
  pastoralId: id,
  telefone: opcional(40, "O telefone"),
  email: z
    .union([z.literal(""), z.email("Informe um e-mail válido.")])
    .optional()
    .transform((v) => v || null),
  contatoPublico: caixaDeMarcar,
  naCoordenacao: caixaDeMarcar,
  /** Conta do painel desta pessoa. "" = nenhuma. */
  usuarioId: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => v || null),
  ativo: caixaDeMarcar,
  ordem: z.coerce.number().int().min(0).max(999).default(0),
});

export const coordenadorEdicaoSchema = coordenadorSchema.extend({ id });

/**
 * Um compromisso na agenda da pastoral.
 *
 * A hora vem separada da data porque é assim que o formulário pergunta
 * (`<input type="date">` + `<input type="time">`); aqui as duas viram um
 * instante só, que é o que o calendário ordena.
 */
const horaDoDia = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use o formato HH:MM (ex.: 19:30).");

export const eventoDaPastoralSchema = z
  .object({
    pastoralId: id,
    titulo: texto(3, 160, "O título"),
    tipo: z.enum(TIPOS_DE_EVENTO),
    data: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data."),
    horaInicio: horaDoDia,
    horaFim: z.union([z.literal(""), horaDoDia]).optional(),
    local: opcional(120, "O local"),
    observacao: opcional(600, "A observação"),
    /** Ids de quem foi escalado. O formulário manda um por caixa marcada. */
    escalados: z.array(z.string().min(1)).default([]),
  })
  .transform((d) => ({
    pastoralId: d.pastoralId,
    titulo: d.titulo,
    tipo: d.tipo,
    // Hora de Brasília, e não do servidor — ver lib/agenda/fuso.ts.
    inicio: instanteNaParoquia(d.data, d.horaInicio),
    fim: d.horaFim ? instanteNaParoquia(d.data, d.horaFim) : null,
    local: d.local,
    observacao: d.observacao,
    escalados: d.escalados,
  }))
  .refine((d) => !d.fim || d.fim > d.inicio, {
    path: ["horaFim"],
    message: "A hora de término precisa ser depois da de início.",
  });

export const eventoDaPastoralEdicaoSchema = z
  .object({ id })
  .and(eventoDaPastoralSchema);

// ---------------------------------------------------------------------------
// Catequese
// ---------------------------------------------------------------------------

/** "2027" — o ano da caminhada, não uma data. */
const anoLetivo = z
  .string()
  .trim()
  .regex(/^\d{4}$/, "Informe o ano com quatro dígitos (ex.: 2027).");

export const configuracaoCatequeseSchema = z.object({
  inscricoesAbertas: caixaDeMarcar,
  anoLetivo,
  aviso: opcional(2000, "O aviso"),
});

export const turmaDeCatequeseSchema = z.object({
  nome: texto(3, 120, "O nome da turma"),
  etapa: texto(2, 60, "A etapa"),
  diaSemana: z.coerce
    .number()
    .int()
    .min(0, "Dia da semana inválido.")
    .max(6, "Dia da semana inválido."),
  hora: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use o formato HH:MM (ex.: 09:00)."),
  local: opcional(120, "O local"),
  vagas: z.coerce.number().int().min(0).max(500).default(0),
  catequistas: opcional(300, "Os catequistas"),
  anoLetivo,
  ativa: caixaDeMarcar,
  ordem: z.coerce.number().int().min(0).max(999).default(0),
});

export const turmaDeCatequeseEdicaoSchema = turmaDeCatequeseSchema.extend({ id });

/**
 * O pedido de inscrição, como a família preenche no site.
 *
 * Este é o ÚNICO formulário do site que recebe dado de criança. Três decisões
 * que valem ser lidas antes de mexer:
 *
 * - A data de nascimento é conferida contra o calendário de verdade
 *   (`new Date` aceita "2026-02-31" e devolve 3 de março). Data trocada num
 *   cadastro de catequese manda a criança para a turma errada.
 * - O consentimento é obrigatório e não tem valor padrão: uma caixa ausente é
 *   ausente, e o envio é recusado. Ver `caixaDeMarcar`.
 * - A turma é opcional: muita gente se inscreve sem saber ainda qual horário
 *   dá, e obrigar a escolha faria a família chutar.
 */
const dataDeNascimento = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data de nascimento.")
  .refine((v) => {
    const [ano, mes, dia] = v.split("-").map(Number);
    const data = new Date(Date.UTC(ano!, mes! - 1, dia!));
    return (
      data.getUTCFullYear() === ano &&
      data.getUTCMonth() === mes! - 1 &&
      data.getUTCDate() === dia
    );
  }, "Essa data não existe no calendário.")
  .transform((v) => new Date(`${v}T12:00:00Z`))
  .refine((d) => d <= new Date(), "A data de nascimento está no futuro.")
  .refine(
    (d) => d >= new Date("1900-01-01T00:00:00Z"),
    "Confira o ano de nascimento."
  );

export const inscricaoNaCatequeseSchema = z.object({
  tipo: z.enum(TIPOS_DE_INSCRICAO),
  turmaId: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => v || null),

  nome: texto(3, 120, "O nome do catequizando"),
  dataNascimento: dataDeNascimento,
  batizado: caixaDeMarcar,
  paroquiaBatismo: opcional(160, "A paróquia do batismo"),

  responsavel: texto(3, 120, "O nome do responsável"),
  parentesco: texto(2, 40, "O parentesco"),
  telefone: texto(8, 40, "O telefone"),
  email: z
    .union([z.literal(""), z.email("Informe um e-mail válido.")])
    .optional()
    .transform((v) => v || null),

  padrinho: opcional(160, "O padrinho ou madrinha"),
  observacao: opcional(1000, "A observação"),

  /**
   * Sem isto marcado, não há envio. É recusa de formulário, e não uma nota de
   * rodapé: a paróquia passa a guardar o nome e a data de nascimento de uma
   * criança, e precisa poder mostrar quando alguém autorizou isso.
   */
  consentimento: caixaDeMarcar.refine(
    (v) => v === true,
    "Para enviar, é preciso concordar com o uso dos dados da inscrição."
  ),
});

export const statusInscricaoSchema = z.object({
  id,
  status: z.enum(STATUS_INSCRICAO),
});

// ---------------------------------------------------------------------------
// Galeria
// ---------------------------------------------------------------------------

export const albumSchema = z.object({
  titulo: texto(3, 160, "O título"),
  data: dataOpcional,
  publicado: caixaDeMarcar,
});

export const albumEdicaoSchema = albumSchema.extend({ id });

// ---------------------------------------------------------------------------
// Mensagens do formulário de contato
// ---------------------------------------------------------------------------

export const mensagemSchema = z.object({
  nome: texto(2, 120, "O nome"),
  email: z.email("Informe um e-mail válido.").trim().toLowerCase(),
  telefone: opcional(40, "O telefone"),
  assunto: texto(3, 160, "O assunto"),
  corpo: texto(10, 4000, "A mensagem"),
});

export const statusMensagemSchema = z.object({
  id,
  status: z.enum(STATUS_MENSAGEM),
});

// ---------------------------------------------------------------------------
// Usuários do painel
// ---------------------------------------------------------------------------

const senhaForte = z
  .string()
  .min(8, "A senha precisa de ao menos 8 caracteres.")
  .max(200, "Senha longa demais.");

export const usuarioSchema = z.object({
  nome: texto(2, 120, "O nome"),
  email: z.email("Informe um e-mail válido.").trim().toLowerCase(),
  senha: senhaForte,
  papel: z.enum(PAPEIS),
});

export const usuarioEdicaoSchema = z.object({
  id,
  nome: texto(2, 120, "O nome"),
  email: z.email("Informe um e-mail válido.").trim().toLowerCase(),
  papel: z.enum(PAPEIS),
  ativo: caixaDeMarcar,
  /** Em branco = manter a senha atual. */
  senha: z.union([z.literal(""), senhaForte]).optional(),
});

// ---------------------------------------------------------------------------
// Listagens
// ---------------------------------------------------------------------------

export const POR_PAGINA = 10;

/** Busca, filtro e página, como chegam da barra de endereços. */
export const listagemSchema = z.object({
  busca: z.string().trim().max(120).default(""),
  status: z.string().trim().max(40).default(""),
  categoria: z.string().trim().max(40).default(""),
  pagina: z.coerce.number().int().min(1).catch(1),
});

export type EntradaListagem = z.infer<typeof listagemSchema>;
