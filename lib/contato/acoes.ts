"use server";

import { revalidatePath } from "next/cache";
import { registrarMensagem } from "@/lib/servicos/mensagens";
import { mensagemSchema } from "@/lib/validacao/esquemas";
import type { MensagemContato, ResultadoEnvio } from "./tipos";

function textoDoEmail(dados: MensagemContato) {
  return [
    `Nome: ${dados.nome.trim()}`,
    `E-mail: ${dados.email.trim()}`,
    `Telefone: ${dados.telefone?.trim() || "não informado"}`,
    `Assunto: ${dados.assunto}`,
    "",
    dados.mensagem.trim(),
    "",
    "— Enviado pelo formulário do site da paróquia.",
  ].join("\n");
}

/**
 * Recebe o formulário de contato.
 *
 * A mensagem é SEMPRE gravada no banco e aparece na tela Mensagens do painel.
 * O e-mail para a secretaria é um aviso a mais, não o meio de entrega: se a
 * chave do Resend não estiver configurada, ou o envio falhar, a mensagem já
 * está guardada e ninguém fica sem resposta por causa disso.
 */
export async function enviarMensagem(
  dados: MensagemContato
): Promise<ResultadoEnvio> {
  // Robôs preenchem todos os campos, inclusive o que fica escondido. Fingimos
  // sucesso para não ensinar ao robô qual campo o denunciou.
  if (dados.confirmacao) return { estado: "enviado" };

  const conferido = mensagemSchema.safeParse({
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone,
    assunto: dados.assunto,
    corpo: dados.mensagem,
  });

  if (!conferido.success) {
    return {
      estado: "erro",
      mensagem:
        conferido.error.issues[0]?.message ?? "Confira os dados e tente de novo.",
    };
  }

  try {
    await registrarMensagem(conferido.data);
    // O painel mostra a contagem de mensagens novas.
    revalidatePath("/admin");
    revalidatePath("/admin/mensagens");
  } catch (erro) {
    console.error("Falha ao gravar mensagem de contato:", erro);
    return {
      estado: "erro",
      mensagem:
        "Não foi possível registrar sua mensagem agora. Tente novamente ou fale conosco pelo WhatsApp.",
    };
  }

  await avisarSecretariaPorEmail(dados);
  return { estado: "enviado" };
}

/**
 * Notifica a secretaria por e-mail, se estiver configurado.
 *
 * Não devolve erro de propósito: a mensagem já está no painel, e falhar o
 * aviso não deve fazer o visitante achar que precisa escrever de novo.
 */
async function avisarSecretariaPorEmail(dados: MensagemContato): Promise<void> {
  const chave = process.env.RESEND_API_KEY?.trim();
  const destino = process.env.CONTATO_EMAIL_DESTINO?.trim();
  const remetente = process.env.CONTATO_EMAIL_REMETENTE?.trim();

  if (!chave || !destino || !remetente) return;

  try {
    const resposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chave}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Site da Paróquia <${remetente}>`,
        to: [destino],
        reply_to: dados.email.trim(),
        subject: `[Site] ${dados.assunto} — ${dados.nome.trim()}`,
        text: textoDoEmail(dados),
      }),
    });

    if (!resposta.ok) {
      console.error(
        "Mensagem gravada, mas o aviso por e-mail falhou:",
        resposta.status,
        await resposta.text()
      );
    }
  } catch (erro) {
    console.error("Mensagem gravada, mas o aviso por e-mail falhou:", erro);
  }
}
