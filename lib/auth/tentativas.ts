import "server-only";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { ErroDeNegocio } from "@/lib/servicos/resultado";

/**
 * Freio para quem fica tentando adivinhar senha.
 *
 * Sem isto, nada impede um programa de testar milhares de senhas na tela de
 * entrada. O cálculo da senha (scrypt) já custa dezenas de milissegundos, o
 * que atrasa o atacante — mas atrasar não é impedir: uma senha curta cai em
 * minutos mesmo assim.
 *
 * ---
 *
 * Por que o freio é por E-MAIL + ENDEREÇO, e não só por e-mail:
 *
 * Travar só pelo e-mail cria um jeito fácil de atrapalhar a paróquia — basta
 * errar a senha da secretária cinco vezes de propósito para deixá-la de fora
 * do painel. Contando também o endereço de rede de quem tenta, o erro de um
 * curioso não tranca a conta de ninguém; quem insiste é que fica de fora.
 *
 * Por que fica no BANCO, e não na memória do servidor:
 *
 * O site vai ao ar em hospedagem que liga e desliga cópias do servidor
 * conforme a demanda. Uma contagem guardada na memória de uma dessas cópias
 * seria zerada a cada troca, e o atacante só precisaria insistir até cair numa
 * cópia nova. O banco é o único lugar que todas as cópias enxergam.
 */

/** Quantas tentativas erradas cabem na janela antes de o freio pegar. */
const LIMITE = 8;
/** Tamanho da janela. Passado esse tempo sem erro, a contagem se apaga. */
const JANELA_MINUTOS = 15;

/**
 * Estende `ErroDeNegocio` para que a mensagem chegue à tela.
 *
 * O invólucro das Server Actions (`executar`) só repassa ao usuário o texto de
 * erros previstos; qualquer outro vira "não foi possível concluir". Este aqui
 * precisa ser lido: quem apanhou do freio tem de saber que é só esperar.
 */
export class TentativasDemais extends ErroDeNegocio {
  constructor(minutos: number) {
    super(
      `Muitas tentativas seguidas. Espere ${minutos} minuto(s) e tente de novo. ` +
        "Se você não lembra a senha, peça a quem cuida do site para trocá-la."
    );
    this.name = "TentativasDemais";
  }
}

/**
 * Quem está tentando, resumido.
 *
 * Guarda o resumo e não o dado: o banco fica com uma sequência sem volta, em
 * vez de uma lista de e-mails e endereços de rede de quem errou a senha —
 * que é informação pessoal e não serve para mais nada depois da janela.
 */
function identificar(email: string, endereco: string): string {
  const segredo = process.env.SEGREDO_SESSAO ?? "";
  return createHmac("sha256", segredo)
    .update(`${email.toLowerCase()}|${endereco}`)
    .digest("hex");
}

/**
 * O endereço de quem fez a requisição.
 *
 * Atrás de uma hospedagem, o endereço real chega no `x-forwarded-for`, que
 * pode trazer uma lista; o primeiro é o do visitante. Quando não há cabeçalho
 * nenhum (desenvolvimento), todos caem no mesmo balde — o que é justamente o
 * comportamento seguro: na dúvida, conta junto.
 */
async function enderecoDeQuemPede(): Promise<string> {
  const cabecalhos = await headers();
  const encaminhado = cabecalhos.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0]!.trim();
  return cabecalhos.get("x-real-ip") ?? "desconhecido";
}

function inicioDaJanela(): Date {
  return new Date(Date.now() - JANELA_MINUTOS * 60 * 1000);
}

/**
 * Recusa a tentativa quando já houve erros demais na janela.
 *
 * Chamada ANTES de conferir a senha: o objetivo é justamente não gastar o
 * cálculo, que é a parte cara.
 */
export async function exigirFolgaParaTentar(email: string): Promise<string> {
  const chave = identificar(email, await enderecoDeQuemPede());

  const erros = await db.tentativaDeEntrada.count({
    where: { chave, criadoEm: { gte: inicioDaJanela() } },
  });

  if (erros >= LIMITE) throw new TentativasDemais(JANELA_MINUTOS);
  return chave;
}

/** Anota mais um erro. Só é chamada quando a senha realmente não bateu. */
export async function anotarErro(chave: string): Promise<void> {
  await db.tentativaDeEntrada.create({ data: { chave } });
}

/**
 * Apaga a contagem de quem acabou de entrar.
 *
 * Quem acertou a senha provou ser dono da conta; as tentativas anteriores
 * eram dedo trocado, e não ataque.
 */
export async function limparTentativas(chave: string): Promise<void> {
  await db.tentativaDeEntrada.deleteMany({ where: { chave } });
}

/**
 * Remove as anotações vencidas, para a tabela não crescer sem fim.
 *
 * Vai junto da faxina de sessões, no login — o mesmo momento em que já
 * estamos escrevendo no banco de qualquer forma.
 */
export async function limparTentativasVencidas(): Promise<void> {
  await db.tentativaDeEntrada.deleteMany({
    where: { criadoEm: { lt: inicioDaJanela() } },
  });
}
