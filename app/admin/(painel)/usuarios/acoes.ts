"use server";

import { revalidatePath } from "next/cache";
import { exigirPapel } from "@/lib/auth/guardas";
import {
  atualizarUsuario,
  criarUsuario,
  excluirUsuario,
} from "@/lib/servicos/usuarios";
import {
  apenasTexto,
  executar,
  validarFormulario,
  type EstadoFormulario,
} from "@/lib/servicos/resultado";
import { usuarioEdicaoSchema, usuarioSchema } from "@/lib/validacao/esquemas";

/**
 * Gerenciar quem entra no painel é exclusivo de administradores.
 *
 * A checagem está em cada ação, não só na tela: o item do menu some para a
 * secretaria, mas o endereço da ação continua existindo para quem souber
 * montar a requisição na mão.
 */
export async function salvarUsuario(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  const digitado = apenasTexto(Object.fromEntries(formulario));

  const resultado = await executar(async () => {
    const quemEdita = await exigirPapel("SUPER_ADMIN");

    const id = formulario.get("id");
    const editando = typeof id === "string" && id !== "";

    // Criar e editar sao conferidos por esquemas diferentes -- na edicao a
    // senha e opcional --, entao cada caminho valida o seu. Escolher o
    // esquema com um ternario obrigaria a mentir para o compilador sobre o
    // formato do que sai da validacao.
    if (editando) {
      const conferido = validarFormulario(usuarioEdicaoSchema, formulario);
      if (!conferido.ok) return conferido.estado;

      await atualizarUsuario(conferido.dados, quemEdita);
      revalidatePath("/admin/usuarios");
      return { ok: true, mensagem: "Usuário atualizado." };
    }

    const conferido = validarFormulario(usuarioSchema, formulario);
    if (!conferido.ok) return conferido.estado;

    await criarUsuario(conferido.dados);
    revalidatePath("/admin/usuarios");
    return { ok: true, mensagem: "Usuário cadastrado." };
  });

  return resultado.ok
    ? resultado
    : { ...resultado, valores: { ...digitado, ...resultado.valores } };
}

export async function excluirUsuarioAcao(id: string): Promise<EstadoFormulario> {
  return executar(async () => {
    const quemExclui = await exigirPapel("SUPER_ADMIN");
    await excluirUsuario(id, quemExclui);
    revalidatePath("/admin/usuarios");
    return { ok: true, mensagem: "Usuário excluído." };
  });
}
