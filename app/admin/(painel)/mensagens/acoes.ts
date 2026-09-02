"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/auth/guardas";
import { excluirMensagem, mudarStatusMensagem } from "@/lib/servicos/mensagens";
import { executar, type EstadoFormulario } from "@/lib/servicos/resultado";
import {
  ROTULO_STATUS_MENSAGEM,
  statusMensagemSchema,
} from "@/lib/validacao/esquemas";

function revalidar() {
  revalidatePath("/admin/mensagens");
  // O painel inicial mostra a contagem de mensagens novas.
  revalidatePath("/admin");
}

export async function mudarStatusAcao(
  id: string,
  status: string
): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirSessao();

    // O status vem de um `<select>` da tela, mas chega pela rede: confere
    // contra a lista fechada antes de gravar.
    const conferido = statusMensagemSchema.safeParse({ id, status });
    if (!conferido.success) {
      return { ok: false, mensagem: "Situação inválida." };
    }

    await mudarStatusMensagem(conferido.data.id, conferido.data.status);
    revalidar();

    return {
      ok: true,
      mensagem: `Marcada como "${ROTULO_STATUS_MENSAGEM[conferido.data.status]}".`,
    };
  });
}

export async function excluirMensagemAcao(id: string): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirSessao();
    await excluirMensagem(id);
    revalidar();
    return { ok: true, mensagem: "Mensagem excluída." };
  });
}
