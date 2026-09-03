"use server";

import { revalidatePath } from "next/cache";
import { exigirPermissao } from "@/lib/auth/guardas";
import {
  atualizarCoordenador,
  criarCoordenador,
  excluirCoordenador,
} from "@/lib/servicos/coordenadores";
import {
  apenasTexto,
  executar,
  validarFormulario,
  type EstadoFormulario,
} from "@/lib/servicos/resultado";
import {
  coordenadorEdicaoSchema,
  coordenadorSchema,
} from "@/lib/validacao/esquemas";

function revalidar() {
  revalidatePath("/admin/coordenadores");
  revalidatePath("/pastorais");
}

export async function salvarCoordenador(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  const digitado = apenasTexto(Object.fromEntries(formulario));

  const resultado = await executar(async () => {
    await exigirPermissao("coordenadores.gerenciar");

    const id = formulario.get("id");
    const editando = typeof id === "string" && id !== "";

    // Cada caminho valida com o seu esquema: o de edicao exige o `id`, o de
    // criacao nao o conhece.
    if (editando) {
      const conferido = validarFormulario(coordenadorEdicaoSchema, formulario);
      if (!conferido.ok) return conferido.estado;

      await atualizarCoordenador(conferido.dados);
      revalidar();
      return { ok: true, mensagem: "Coordenador atualizado." };
    }

    const conferido = validarFormulario(coordenadorSchema, formulario);
    if (!conferido.ok) return conferido.estado;

    await criarCoordenador(conferido.dados);
    revalidar();
    return { ok: true, mensagem: "Coordenador cadastrado." };
  });

  return resultado.ok
    ? resultado
    : { ...resultado, valores: { ...digitado, ...resultado.valores } };
}

/**
 * Excluir é do padre ou do administrador geral.
 *
 * Coordenador é nome de pessoa da comunidade, e vale para ele a mesma regra
 * do cadastro de usuário. Quem só administra o dia a dia tira o nome do ar
 * desmarcando "Mostrar no site", que não apaga o histórico.
 */
export async function excluirCoordenadorAcao(
  id: string
): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirPermissao("coordenadores.excluir");
    await excluirCoordenador(id);
    revalidar();
    return { ok: true, mensagem: "Coordenador excluído." };
  });
}
