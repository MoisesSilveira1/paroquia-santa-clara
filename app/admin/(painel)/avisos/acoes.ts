"use server";

import { revalidatePath } from "next/cache";
import { exigirPermissao } from "@/lib/auth/guardas";
import {
  alternarAviso,
  atualizarAviso,
  criarAviso,
  excluirAviso,
} from "@/lib/servicos/avisos";
import {
  apenasTexto,
  executar,
  validarFormulario,
  type EstadoFormulario,
} from "@/lib/servicos/resultado";
import { avisoEdicaoSchema, avisoSchema } from "@/lib/validacao/esquemas";

/**
 * Atualiza as telas afetadas por uma mudança nos avisos.
 *
 * A página inicial do site entra na lista porque é lá que os avisos aparecem
 * para a comunidade — mudar no painel e a página pública continuar mostrando
 * o texto antigo seria o pior dos dois mundos.
 */
function revalidar() {
  revalidatePath("/admin/avisos");
  revalidatePath("/");
}

/** Cria um aviso novo ou salva a edição de um existente. */
export async function salvarAviso(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  const digitado = apenasTexto(Object.fromEntries(formulario));

  const resultado = await executar(async () => {
    await exigirPermissao("conteudo.editar");

    const id = formulario.get("id");
    const editando = typeof id === "string" && id !== "";

    // Cada caminho valida com o seu esquema: o de edicao exige o `id`, o de
    // criacao nao o conhece. Escolher o esquema com um ternario juntaria dois
    // formatos diferentes e obrigaria a forcar o tipo na chamada seguinte.
    if (editando) {
      const conferido = validarFormulario(avisoEdicaoSchema, formulario);
      if (!conferido.ok) return conferido.estado;

      await atualizarAviso(conferido.dados);
      revalidar();
      return { ok: true, mensagem: "Aviso atualizado." };
    }

    const conferido = validarFormulario(avisoSchema, formulario);
    if (!conferido.ok) return conferido.estado;

    await criarAviso(conferido.dados);
    revalidar();
    return { ok: true, mensagem: "Aviso publicado." };
  });

  return resultado.ok
    ? resultado
    : { ...resultado, valores: { ...digitado, ...resultado.valores } };
}

/** Liga ou desliga a exibição de um aviso no site, sem apagá-lo. */
export async function alternarAvisoAcao(
  id: string,
  ativo: boolean
): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirPermissao("conteudo.editar");
    await alternarAviso(id, ativo);
    revalidar();
    return { ok: true, mensagem: ativo ? "Aviso publicado." : "Aviso ocultado." };
  });
}

export async function excluirAvisoAcao(id: string): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirPermissao("conteudo.excluir");
    await excluirAviso(id);
    revalidar();
    return { ok: true, mensagem: "Aviso excluído." };
  });
}
