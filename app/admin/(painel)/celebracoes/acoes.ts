"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/auth/guardas";
import {
  atualizarCelebracao,
  criarCelebracao,
  excluirCelebracao,
} from "@/lib/servicos/celebracoes";
import {
  apenasTexto,
  executar,
  validarFormulario,
  type EstadoFormulario,
} from "@/lib/servicos/resultado";
import {
  celebracaoEdicaoSchema,
  celebracaoSchema,
} from "@/lib/validacao/esquemas";

function revalidar() {
  revalidatePath("/admin/celebracoes");
  revalidatePath("/horarios");
  revalidatePath("/");
}

export async function salvarCelebracao(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  const digitado = apenasTexto(Object.fromEntries(formulario));

  const resultado = await executar(async () => {
    await exigirSessao();

    const id = formulario.get("id");
    const editando = typeof id === "string" && id !== "";

    // Cada caminho valida com o seu esquema: o de edicao exige o `id`, o de
    // criacao nao o conhece. Escolher o esquema com um ternario juntaria dois
    // formatos diferentes e obrigaria a forcar o tipo na chamada seguinte.
    if (editando) {
      const conferido = validarFormulario(celebracaoEdicaoSchema, formulario);
      if (!conferido.ok) return conferido.estado;

      await atualizarCelebracao(conferido.dados);
      revalidar();
      return { ok: true, mensagem: "Horário atualizado." };
    }

    const conferido = validarFormulario(celebracaoSchema, formulario);
    if (!conferido.ok) return conferido.estado;

    await criarCelebracao(conferido.dados);
    revalidar();
    return { ok: true, mensagem: "Horário adicionado." };
  });

  return resultado.ok
    ? resultado
    : { ...resultado, valores: { ...digitado, ...resultado.valores } };
}

export async function excluirCelebracaoAcao(
  id: string
): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirSessao();
    await excluirCelebracao(id);
    revalidar();
    return { ok: true, mensagem: "Horário removido." };
  });
}
