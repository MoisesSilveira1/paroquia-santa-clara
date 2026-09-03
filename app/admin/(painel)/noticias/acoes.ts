"use server";

import { revalidatePath } from "next/cache";
import { exigirPermissao } from "@/lib/auth/guardas";
import {
  atualizarNoticia,
  criarNoticia,
  excluirNoticia,
} from "@/lib/servicos/noticias";
import {
  apenasTexto,
  executar,
  validarFormulario,
  type EstadoFormulario,
} from "@/lib/servicos/resultado";
import { noticiaEdicaoSchema, noticiaSchema } from "@/lib/validacao/esquemas";

function revalidar() {
  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
  revalidatePath("/");
}

export async function salvarNoticia(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  const digitado = apenasTexto(Object.fromEntries(formulario));

  const resultado = await executar(async () => {
    const usuario = await exigirPermissao("conteudo.editar");

    const id = formulario.get("id");
    const editando = typeof id === "string" && id !== "";

    // Cada caminho valida com o seu esquema: o de edicao exige o `id`, o de
    // criacao nao o conhece. Escolher o esquema com um ternario juntaria dois
    // formatos diferentes e obrigaria a forcar o tipo na chamada seguinte.
    if (editando) {
      const conferido = validarFormulario(noticiaEdicaoSchema, formulario);
      if (!conferido.ok) return conferido.estado;

      await atualizarNoticia(conferido.dados);
      revalidar();
      return { ok: true, mensagem: "Notícia atualizada." };
    }

    const conferido = validarFormulario(noticiaSchema, formulario);
    if (!conferido.ok) return conferido.estado;

    await criarNoticia(conferido.dados, usuario.id);
    revalidar();
    return { ok: true, mensagem: "Notícia criada." };
  });

  return resultado.ok
    ? resultado
    : { ...resultado, valores: { ...digitado, ...resultado.valores } };
}

export async function excluirNoticiaAcao(id: string): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirPermissao("conteudo.excluir");
    await excluirNoticia(id);
    revalidar();
    return { ok: true, mensagem: "Notícia excluída." };
  });
}
