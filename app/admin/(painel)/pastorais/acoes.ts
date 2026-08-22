"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/auth/guardas";
import {
  atualizarPastoral,
  criarPastoral,
  excluirPastoral,
} from "@/lib/servicos/pastorais";
import {
  apenasTexto,
  executar,
  validarFormulario,
  type EstadoFormulario,
} from "@/lib/servicos/resultado";
import { pastoralEdicaoSchema, pastoralSchema } from "@/lib/validacao/esquemas";

function revalidar() {
  revalidatePath("/admin/pastorais");
  revalidatePath("/pastorais");
}

export async function salvarPastoral(
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
      const conferido = validarFormulario(pastoralEdicaoSchema, formulario);
      if (!conferido.ok) return conferido.estado;

      await atualizarPastoral(conferido.dados);
      revalidar();
      return { ok: true, mensagem: "Pastoral atualizada." };
    }

    const conferido = validarFormulario(pastoralSchema, formulario);
    if (!conferido.ok) return conferido.estado;

    await criarPastoral(conferido.dados);
    revalidar();
    return { ok: true, mensagem: "Pastoral cadastrada." };
  });

  return resultado.ok
    ? resultado
    : { ...resultado, valores: { ...digitado, ...resultado.valores } };
}

export async function excluirPastoralAcao(id: string): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirSessao();
    await excluirPastoral(id);
    revalidar();
    return { ok: true, mensagem: "Pastoral excluída." };
  });
}
