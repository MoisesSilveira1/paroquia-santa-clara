"use server";

import { redirect } from "next/navigation";
import { entrar } from "@/lib/servicos/autenticacao";
import {
  apenasTexto,
  executar,
  validarFormulario,
  type EstadoFormulario,
} from "@/lib/servicos/resultado";
import { entrarSchema } from "@/lib/validacao/esquemas";

/**
 * Recebe o formulário de entrada.
 *
 * Devolve o estado de erro para a tela em vez de lançar: quem errou a senha
 * precisa ver a mensagem no lugar do formulário, não uma página de erro.
 */
export async function acaoEntrar(
  _estadoAnterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  const digitado = apenasTexto(Object.fromEntries(formulario));

  const resultado = await executar(async () => {
    const conferido = validarFormulario(entrarSchema, formulario);
    if (!conferido.ok) return conferido.estado;

    await entrar(conferido.dados.email, conferido.dados.senha);

    // `redirect` interrompe a função lançando um sinal de controle, que
    // `executar` deixa passar de propósito.
    redirect("/admin");
  });

  // Deu errado por qualquer motivo: devolve o e-mail para o campo, senão a
  // pessoa redigita o endereço inteiro só porque errou a senha.
  return { ...resultado, valores: { ...digitado, ...resultado.valores } };
}
