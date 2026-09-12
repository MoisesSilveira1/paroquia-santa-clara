"use server";

import { revalidatePath } from "next/cache";
import { receberInscricao } from "@/lib/servicos/catequese";
import { apenasTexto, ErroDeNegocio } from "@/lib/servicos/resultado";
import { inscricaoNaCatequeseSchema } from "@/lib/validacao/esquemas";

/**
 * Recebe o pedido de inscrição feito pela família, no site público.
 *
 * Diferente das ações do painel, esta NÃO exige sessão: quem preenche é a
 * comunidade, que não tem conta. Por isso tudo que protege está no esquema
 * (lib/validacao) e no serviço (lib/servicos/catequese) — aqui só se traduz
 * o resultado para a tela.
 *
 * A resposta é um objeto, e não uma exceção, porque quem está do outro lado é
 * uma mãe preenchendo o cadastro do filho: ela precisa ler o que houve, no
 * lugar do formulário, e não cair numa página de erro do servidor.
 */

export type RespostaDaInscricao =
  | { estado: "enviado"; nome: string }
  | {
      estado: "erro";
      mensagem: string;
      campo?: string;
      /**
       * O que a pessoa tinha digitado, devolvido para repovoar os campos.
       *
       * Sem isto o formulário volta VAZIO quando a validação recusa — o React
       * limpa os campos não controlados depois que a ação termina. São catorze
       * campos; obrigar a redigitar tudo por causa de um erro, no celular,
       * com uma criança do lado, é motivo suficiente para a pessoa desistir e
       * a paróquia perder a inscrição.
       */
      valores?: Record<string, string>;
    };

export async function enviarInscricao(
  _anterior: RespostaDaInscricao | null,
  formulario: FormData
): Promise<RespostaDaInscricao> {
  // Campo isca: robôs preenchem tudo, inclusive o que está escondido. Fingimos
  // sucesso para não ensinar ao robô qual campo o denunciou.
  if (formulario.get("confirmacao")) {
    return { estado: "enviado", nome: "" };
  }

  const bruto = Object.fromEntries(formulario);
  const digitado = apenasTexto(bruto);
  const conferido = inscricaoNaCatequeseSchema.safeParse(bruto);

  if (!conferido.success) {
    const problema = conferido.error.issues[0];
    return {
      estado: "erro",
      mensagem: problema?.message ?? "Confira os dados e tente de novo.",
      campo: problema?.path.join("."),
      valores: digitado,
    };
  }

  try {
    await receberInscricao(conferido.data);
  } catch (erro) {
    // Erro previsto (período fechado, turma que sumiu, envio repetido): a
    // mensagem foi escrita para ser lida por quem está preenchendo.
    if (erro instanceof ErroDeNegocio) {
      return { estado: "erro", mensagem: erro.message, valores: digitado };
    }

    console.error("Falha ao registrar inscrição na catequese:", erro);
    return {
      estado: "erro",
      mensagem:
        "Não foi possível registrar a inscrição agora. Tente novamente em alguns minutos " +
        "ou procure a secretaria paroquial.",
      valores: digitado,
    };
  }

  // A página da catequese mostra quantas vagas restam em cada turma, e o
  // painel mostra a contagem de pedidos aguardando resposta.
  revalidatePath("/catequese");
  revalidatePath("/admin/catequese");

  return { estado: "enviado", nome: conferido.data.nome };
}
