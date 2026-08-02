// Classes reaproveitadas nos formulários do site. Ficam nomeadas aqui para não
// repetir a mesma sequência de classes em cada campo (e para mudar num lugar só).

export const CAMPO =
  "w-full rounded-lg border border-fundo-suave bg-fundo px-3 py-2.5 text-base outline-none focus:border-destaque focus:ring-2 focus:ring-destaque/40";

export const BOTAO_PRIMARIO =
  "inline-flex items-center gap-2 rounded-lg bg-principal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-principal-escuro disabled:opacity-50";

export const BOTAO_SECUNDARIO =
  "inline-flex items-center gap-2 rounded-lg border border-principal-claro px-4 py-2 text-sm font-semibold transition-colors hover:bg-fundo-suave";

export const BOTAO_ICONE = "rounded p-2 text-texto-suave hover:bg-fundo-suave";

export const BOTAO_ICONE_PERIGO = "rounded p-2 text-perigo hover:bg-fundo-suave";

/** Mensagem de erro (usar junto de role="alert"). */
export const TEXTO_ERRO = "text-sm font-medium text-perigo";

export const CARTAO = "rounded-xl border border-destaque-claro bg-white shadow-sm";
