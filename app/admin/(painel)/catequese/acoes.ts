"use server";

import { revalidatePath } from "next/cache";
import { exigirPermissao } from "@/lib/auth/guardas";
import {
  atualizarTurma,
  criarTurma,
  excluirInscricao,
  excluirTurma,
  mudarStatusDaInscricao,
  salvarConfiguracao,
} from "@/lib/servicos/catequese";
import {
  apenasTexto,
  executar,
  validarFormulario,
  type EstadoFormulario,
} from "@/lib/servicos/resultado";
import {
  configuracaoCatequeseSchema,
  statusInscricaoSchema,
  turmaDeCatequeseEdicaoSchema,
  turmaDeCatequeseSchema,
} from "@/lib/validacao/esquemas";

/**
 * Ações da área da catequese.
 *
 * Todas pedem `equipe.propria` e não um papel: a permissão diz "esta conta
 * mexe em equipe de pastoral"; QUAL pastoral é decisão do serviço, que
 * confere se a conta alcança a catequese. É o mesmo desenho das ações de
 * coordenadores e de agenda — ver lib/servicos/catequese.ts.
 */
function revalidar() {
  revalidatePath("/admin/catequese");
  // A página pública muda junto: abrir as inscrições ou publicar uma turma
  // precisa aparecer no site na hora, não no próximo deploy.
  revalidatePath("/catequese");
}

export async function salvarConfiguracaoAcao(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  const digitado = apenasTexto(Object.fromEntries(formulario));

  const resultado = await executar(async () => {
    const quem = await exigirPermissao("equipe.propria");

    const conferido = validarFormulario(configuracaoCatequeseSchema, formulario);
    if (!conferido.ok) return conferido.estado;

    await salvarConfiguracao(conferido.dados, quem);
    revalidar();
    return {
      ok: true,
      mensagem: conferido.dados.inscricoesAbertas
        ? "Inscrições abertas. O formulário já está no ar."
        : "Inscrições fechadas. O formulário saiu do site.",
    };
  });

  return resultado.ok
    ? resultado
    : { ...resultado, valores: { ...digitado, ...resultado.valores } };
}

export async function salvarTurma(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  const digitado = apenasTexto(Object.fromEntries(formulario));

  const resultado = await executar(async () => {
    const quem = await exigirPermissao("equipe.propria");

    const id = formulario.get("id");
    const editando = typeof id === "string" && id !== "";

    if (editando) {
      const conferido = validarFormulario(turmaDeCatequeseEdicaoSchema, formulario);
      if (!conferido.ok) return conferido.estado;

      await atualizarTurma(conferido.dados, quem);
      revalidar();
      return { ok: true, mensagem: "Turma atualizada." };
    }

    const conferido = validarFormulario(turmaDeCatequeseSchema, formulario);
    if (!conferido.ok) return conferido.estado;

    await criarTurma(conferido.dados, quem);
    revalidar();
    return { ok: true, mensagem: "Turma cadastrada." };
  });

  return resultado.ok
    ? resultado
    : { ...resultado, valores: { ...digitado, ...resultado.valores } };
}

export async function excluirTurmaAcao(id: string): Promise<EstadoFormulario> {
  return executar(async () => {
    const quem = await exigirPermissao("equipe.propria");
    await excluirTurma(id, quem);
    revalidar();
    return { ok: true, mensagem: "Turma excluída." };
  });
}

export async function mudarStatusAcao(
  id: string,
  status: string
): Promise<EstadoFormulario> {
  return executar(async () => {
    const quem = await exigirPermissao("equipe.propria");

    // O status chega da tela como texto solto; o esquema é quem decide se é um
    // dos quatro valores válidos.
    const conferido = validarFormulario(
      statusInscricaoSchema,
      formularioCom({ id, status })
    );
    if (!conferido.ok) return conferido.estado;

    await mudarStatusDaInscricao(conferido.dados, quem);
    revalidar();
    return { ok: true, mensagem: "Situação da inscrição atualizada." };
  });
}

/**
 * Apagar de vez um pedido de inscrição.
 *
 * Guardado atrás de `coordenadores.excluir` — a mesma trava de apagar o
 * cadastro de uma pessoa, porque é disso que se trata: uma ficha com nome e
 * data de nascimento de criança. O serviço confere de novo, e é lá que a
 * regra vale.
 */
export async function excluirInscricaoAcao(
  id: string
): Promise<EstadoFormulario> {
  return executar(async () => {
    const quem = await exigirPermissao("coordenadores.excluir");
    await excluirInscricao(id, quem);
    revalidar();
    return { ok: true, mensagem: "Inscrição excluída." };
  });
}

/** Monta um FormData a partir de um objeto, para reaproveitar `validarFormulario`. */
function formularioCom(campos: Record<string, string>): FormData {
  const formulario = new FormData();
  for (const [chave, valor] of Object.entries(campos)) {
    formulario.set(chave, valor);
  }
  return formulario;
}
