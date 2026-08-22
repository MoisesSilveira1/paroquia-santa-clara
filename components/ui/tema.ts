/**
 * Vocabulário visual dos estados do sistema.
 *
 * Toda entidade que tem "situação" (uma notícia publicada, uma mensagem já
 * respondida, um aviso desativado) usa um destes tons. Ficam aqui, e não
 * espalhados pelas telas, para que "publicado" tenha exatamente a mesma cara
 * na lista de notícias e no painel inicial.
 */
export type Tom = "sucesso" | "atencao" | "info" | "perigo" | "neutro";

/** Classes de fundo + texto de cada tom, para selos e alertas. */
export const TOM_CLASSES: Record<Tom, string> = {
  sucesso: "bg-sucesso-suave text-sucesso",
  atencao: "bg-atencao-suave text-atencao",
  info: "bg-info-suave text-info",
  perigo: "bg-perigo-suave text-perigo",
  neutro: "bg-neutro-suave text-neutro",
};

/** Cor sólida do tom — usada em barras, pontos e ícones. */
export const TOM_SOLIDO: Record<Tom, string> = {
  sucesso: "bg-sucesso",
  atencao: "bg-atencao",
  info: "bg-info",
  perigo: "bg-perigo",
  neutro: "bg-neutro",
};
