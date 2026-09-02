import type { Tom } from "@/components/ui/tema";
import type { StatusMensagem, StatusNoticia } from "@/lib/validacao/esquemas";

/**
 * De qual cor cada situação se veste.
 *
 * Fica separado dos rótulos (que são texto, e vivem em lib/validacao) porque
 * isto é decisão visual: se amanhã "Arquivada" deixar de ser cinza, muda aqui
 * e muda em todas as telas de uma vez.
 */
export const TOM_DO_STATUS_NOTICIA: Record<StatusNoticia, Tom> = {
  RASCUNHO: "atencao",
  PUBLICADA: "sucesso",
  ARQUIVADA: "neutro",
};

export const TOM_DO_STATUS_MENSAGEM: Record<StatusMensagem, Tom> = {
  NOVA: "atencao",
  LIDA: "info",
  RESPONDIDA: "sucesso",
  ARQUIVADA: "neutro",
};
