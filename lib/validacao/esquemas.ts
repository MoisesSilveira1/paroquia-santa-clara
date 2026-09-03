import { z } from "zod";
import { PAPEIS } from "@/lib/auth/papeis";

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
export const STATUS_NOTICIA = ["RASCUNHO", "PUBLICADA", "ARQUIVADA"] as const;
export const STATUS_MENSAGEM = ["NOVA", "LIDA", "RESPONDIDA", "ARQUIVADA"] as const;

export type CategoriaNoticia = (typeof CATEGORIAS_NOTICIA)[number];
export type StatusNoticia = (typeof STATUS_NOTICIA)[number];
export type StatusMensagem = (typeof STATUS_MENSAGEM)[number];

/** Rótulos em português, usados nos selos e nos filtros das telas. */
export const ROTULO_STATUS_NOTICIA: Record<StatusNoticia, string> = {
  RASCUNHO: "Rascunho",
  PUBLICADA: "Publicada",
  ARQUIVADA: "Arquivada",
};

export const ROTULO_CATEGORIA: Record<CategoriaNoticia, string> = {
  NOTICIA: "Notícia",
  EVENTO: "Evento",
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

/** Campo opcional de formulário: `""` vira `null`, não string vazia. */
const opcional = (max: number, nome: string) =>
  z
    .string()
    .trim()
    .max(max, `${nome} passa de ${max} caracteres.`)
    .transform((v) => v || null)
    .nullable();

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
