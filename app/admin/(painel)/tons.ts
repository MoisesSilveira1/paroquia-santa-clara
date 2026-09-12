import type { Tom } from "@/components/ui/tema";
import type {
  StatusInscricao,
  StatusMensagem,
  StatusNoticia,
} from "@/lib/validacao/esquemas";

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

/**
 * "Não aceita" é neutro, e não vermelho, de propósito.
 *
 * Do outro lado da tela há a ficha de uma criança. Vermelho é a cor de erro e
 * de perigo no resto do painel; usá-la aqui faria uma família recusada parecer
 * um defeito do sistema. Recusar uma inscrição é uma decisão da coordenação,
 * quase sempre por falta de vaga ou de documento — não é um problema.
 */
export const TOM_DO_STATUS_INSCRICAO: Record<StatusInscricao, Tom> = {
  RECEBIDA: "atencao",
  EM_ANALISE: "info",
  CONFIRMADA: "sucesso",
  RECUSADA: "neutro",
};
