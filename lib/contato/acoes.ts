"use server";

import type { MensagemContato, ResultadoEnvio } from "./tipos";

const LIMITES = {
  nome: { minimo: 2, maximo: 100 },
  mensagem: { minimo: 10, maximo: 5000 },
};

/** Validação feita no servidor: a ação é alcançável por POST direto. */
function validar(dados: MensagemContato): string | null {
  const nome = dados.nome?.trim() ?? "";
  const email = dados.email?.trim() ?? "";
  const mensagem = dados.mensagem?.trim() ?? "";

  if (nome.length < LIMITES.nome.minimo || nome.length > LIMITES.nome.maximo) {
    return "Informe seu nome completo.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return "Informe um e-mail válido.";
  }
  if (
    mensagem.length < LIMITES.mensagem.minimo ||
    mensagem.length > LIMITES.mensagem.maximo
  ) {
    return "Escreva a mensagem com pelo menos 10 caracteres.";
  }
  return null;
}

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
 * Recebe o formulário de contato e envia para a secretaria.
 *
 * Enquanto o e-mail institucional não existir, devolve "demonstracao" — assim
 * o site nunca finge ter enviado uma mensagem que não saiu do lugar.
 */
export async function enviarMensagem(
  dados: MensagemContato
): Promise<ResultadoEnvio> {
  // Robôs preenchem todos os campos, inclusive o que fica escondido.
  if (dados.confirmacao) return { estado: "enviado" };

  const problema = validar(dados);
  if (problema) return { estado: "erro", mensagem: problema };

  const chave = process.env.RESEND_API_KEY?.trim();
  const destino = process.env.CONTATO_EMAIL_DESTINO?.trim();
  const remetente = process.env.CONTATO_EMAIL_REMETENTE?.trim();

  if (!chave || !destino || !remetente) return { estado: "demonstracao" };

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
        "Falha ao enviar contato:",
        resposta.status,
        await resposta.text()
      );
      return {
        estado: "erro",
        mensagem:
          "Não foi possível enviar agora. Tente novamente ou fale conosco pelo WhatsApp.",
      };
    }

    return { estado: "enviado" };
  } catch (erro) {
    console.error("Erro de rede ao enviar contato:", erro);
    return {
      estado: "erro",
      mensagem:
        "Não foi possível enviar agora. Tente novamente ou fale conosco pelo WhatsApp.",
    };
  }
}
