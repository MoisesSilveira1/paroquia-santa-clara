"use server";

import { revalidatePath } from "next/cache";
import { exigirPermissao } from "@/lib/auth/guardas";
import {
  atualizarEvento,
  criarEvento,
  excluirEvento,
} from "@/lib/servicos/agenda";
import {
  apenasTexto,
  executar,
  validarEntrada,
  type EstadoFormulario,
} from "@/lib/servicos/resultado";
import {
  eventoDaPastoralEdicaoSchema,
  eventoDaPastoralSchema,
} from "@/lib/validacao/esquemas";

function revalidar() {
  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
}

/**
 * As caixas de "quem serve" chegam repetidas com o mesmo nome, e
 * `Object.fromEntries` guardaria só a última. `getAll` pega todas.
 */
function comEscalados(formulario: FormData) {
  return {
    ...Object.fromEntries(formulario),
    escalados: formulario.getAll("escalados").map(String),
  };
}

export async function salvarEvento(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  const digitado = apenasTexto(Object.fromEntries(formulario));

  const resultado = await executar(async () => {
    const quem = await exigirPermissao("agenda.propria");

    const id = formulario.get("id");
    const editando = typeof id === "string" && id !== "";
    const entrada = comEscalados(formulario);

    if (editando) {
      const conferido = validarEntrada(eventoDaPastoralEdicaoSchema, entrada);
      if (!conferido.ok) return conferido.estado;

      await atualizarEvento(conferido.dados, quem);
      revalidar();
      return { ok: true, mensagem: "Compromisso atualizado." };
    }

    const conferido = validarEntrada(eventoDaPastoralSchema, entrada);
    if (!conferido.ok) return conferido.estado;

    await criarEvento(conferido.dados, quem);
    revalidar();
    return { ok: true, mensagem: "Compromisso marcado." };
  });

  return resultado.ok
    ? resultado
    : { ...resultado, valores: { ...digitado, ...resultado.valores } };
}

export async function excluirEventoAcao(id: string): Promise<EstadoFormulario> {
  return executar(async () => {
    const quem = await exigirPermissao("agenda.propria");
    await excluirEvento(id, quem);
    revalidar();
    return { ok: true, mensagem: "Compromisso removido da agenda." };
  });
}
