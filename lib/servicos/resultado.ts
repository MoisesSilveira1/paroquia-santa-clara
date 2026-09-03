import type { z } from "zod";

/**
 * Erro previsto de regra de negócio ("já existe uma pastoral com esse nome").
 *
 * Separado dos defeitos inesperados de propósito: a mensagem desta exceção
 * pode ser mostrada ao usuário, a de um defeito qualquer não — ela costuma
 * conter detalhes internos que não interessam a ninguém na secretaria.
 */
export class ErroDeNegocio extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeNegocio";
  }
}

/**
 * O que uma Server Action devolve para o formulário que a chamou.
 *
 * `erros` é por campo, para a mensagem aparecer embaixo do campo errado em
 * vez de num aviso solto no topo.
 */
export type EstadoFormulario = {
  ok?: boolean;
  mensagem?: string;
  erros?: Record<string, string[]>;
  /**
   * O que a pessoa tinha digitado, devolvido para repovoar os campos.
   *
   * Sem isto, um envio recusado limpa o formulário e obriga a redigitar tudo —
   * inclusive o que estava certo. Campos de senha ficam de fora de propósito.
   */
  valores?: Record<string, string>;
};

export const ESTADO_INICIAL: EstadoFormulario = {};

/**
 * Confere o conteúdo de um formulário contra um esquema.
 *
 * Usa `Object.fromEntries` e não `formData.get` campo a campo porque campos
 * não enviados precisam chegar como ausentes (e não como `null`) para as
 * caixas de marcar e os valores padrão funcionarem.
 */
export function validarFormulario<Saida>(
  esquema: z.ZodType<Saida>,
  formulario: FormData
): { ok: true; dados: Saida } | { ok: false; estado: EstadoFormulario } {
  return validarEntrada(esquema, Object.fromEntries(formulario));
}

/**
 * O mesmo, mas para quem já montou o objeto por conta própria.
 *
 * Existe por causa dos campos que se repetem — várias caixas com o mesmo
 * `name`, como a escala de quem serve. `Object.fromEntries` guarda só a
 * última, então quem precisa da lista inteira monta o objeto com `getAll` e
 * chama esta função.
 */
export function validarEntrada<Saida>(
  esquema: z.ZodType<Saida>,
  bruto: Record<string, unknown>
): { ok: true; dados: Saida } | { ok: false; estado: EstadoFormulario } {
  const resultado = esquema.safeParse(bruto);

  if (resultado.success) return { ok: true, dados: resultado.data };

  const erros: Record<string, string[]> = {};
  for (const problema of resultado.error.issues) {
    const campo = problema.path.join(".") || "_";
    (erros[campo] ??= []).push(problema.message);
  }

  return {
    ok: false,
    estado: {
      ok: false,
      mensagem: "Confira os campos destacados.",
      erros,
      valores: apenasTexto(bruto),
    },
  };
}

/**
 * Fica só com os campos de texto, e nunca com senhas.
 *
 * Devolver a senha ao navegador para repovoar o campo seria mandá-la de volta
 * pela rede sem necessidade; é mais seguro pedir que seja digitada de novo.
 */
export function apenasTexto(bruto: Record<string, unknown>): Record<string, string> {
  const limpo: Record<string, string> = {};
  for (const [chave, valor] of Object.entries(bruto)) {
    if (typeof valor === "string" && !/senha/i.test(chave)) limpo[chave] = valor;
  }
  return limpo;
}

/**
 * Envolve o corpo de uma Server Action e traduz falhas em estado de tela.
 *
 * Sem isto, um erro dentro da ação viraria a página de erro genérica do Next
 * e o usuário perderia o que digitou.
 */
export async function executar(
  acao: () => Promise<EstadoFormulario>
): Promise<EstadoFormulario> {
  try {
    return await acao();
  } catch (erro) {
    // `redirect()` funciona lançando uma exceção de controle. Se a
    // engolíssemos aqui, nenhum redirecionamento do painel funcionaria.
    if (
      erro &&
      typeof erro === "object" &&
      "digest" in erro &&
      typeof erro.digest === "string" &&
      erro.digest.startsWith("NEXT_")
    ) {
      throw erro;
    }

    if (erro instanceof ErroDeNegocio || (erro as Error)?.name === "SemPermissao") {
      return { ok: false, mensagem: (erro as Error).message };
    }

    console.error("Falha inesperada em ação do painel:", erro);
    return {
      ok: false,
      mensagem:
        "Não foi possível concluir. Tente de novo; se continuar, avise quem cuida do site.",
    };
  }
}
