"use server";

import { revalidatePath } from "next/cache";
import { exigirPermissao } from "@/lib/auth/guardas";
import {
  alternarAvisoParoquial,
  atualizarAvisoParoquial,
  criarAvisoParoquial,
  excluirAvisoParoquial,
} from "@/lib/servicos/aviso-paroquial";
import {
  apenasTexto,
  executar,
  validarFormulario,
  type EstadoFormulario,
} from "@/lib/servicos/resultado";
import {
  avisoParoquialEdicaoSchema,
  avisoParoquialSchema,
} from "@/lib/validacao/esquemas";

/**
 * O aviso aparece em toda página do site, então salvar precisa limpar o cache
 * do layout inteiro — não bastaria revalidar a página inicial.
 */
function revalidar() {
  revalidatePath("/admin/aviso-paroquial");
  revalidatePath("/aviso-paroquial");
  revalidatePath("/", "layout");
}

/** Pega o arquivo do formulário, ou `null` quando ninguém escolheu nada. */
function imagemEnviada(formulario: FormData): File | null {
  const arquivo = formulario.get("imagem");
  return arquivo instanceof File && arquivo.size > 0 ? arquivo : null;
}

export async function salvarAvisoParoquial(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  const digitado = apenasTexto(Object.fromEntries(formulario));

  const resultado = await executar(async () => {
    await exigirPermissao("conteudo.editar");

    const id = formulario.get("id");
    const editando = typeof id === "string" && id !== "";
    const imagem = imagemEnviada(formulario);

    if (editando) {
      const conferido = validarFormulario(avisoParoquialEdicaoSchema, formulario);
      if (!conferido.ok) return conferido.estado;

      await atualizarAvisoParoquial(conferido.dados, imagem);
      revalidar();
      return { ok: true, mensagem: "Aviso atualizado." };
    }

    const conferido = validarFormulario(avisoParoquialSchema, formulario);
    if (!conferido.ok) return conferido.estado;

    await criarAvisoParoquial(conferido.dados, imagem);
    revalidar();
    return { ok: true, mensagem: "Aviso criado." };
  });

  return resultado.ok
    ? resultado
    : { ...resultado, valores: { ...digitado, ...resultado.valores } };
}

export async function alternarAvisoParoquialAcao(
  id: string
): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirPermissao("conteudo.editar");
    await alternarAvisoParoquial(id);
    revalidar();
    return { ok: true, mensagem: "Aviso atualizado." };
  });
}

export async function excluirAvisoParoquialAcao(
  id: string
): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirPermissao("conteudo.excluir");
    await excluirAvisoParoquial(id);
    revalidar();
    return { ok: true, mensagem: "Aviso excluído." };
  });
}
