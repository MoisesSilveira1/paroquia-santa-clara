"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/auth/guardas";
import {
  adicionarFoto,
  atualizarAlbum,
  criarAlbum,
  excluirAlbum,
  excluirFoto,
} from "@/lib/servicos/galeria";
import {
  apenasTexto,
  executar,
  validarFormulario,
  ErroDeNegocio,
  type EstadoFormulario,
} from "@/lib/servicos/resultado";
import { albumEdicaoSchema, albumSchema } from "@/lib/validacao/esquemas";

function revalidar() {
  revalidatePath("/admin/galeria");
  revalidatePath("/galeria");
}

export async function salvarAlbum(
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
      const conferido = validarFormulario(albumEdicaoSchema, formulario);
      if (!conferido.ok) return conferido.estado;

      await atualizarAlbum(conferido.dados);
      revalidar();
      return { ok: true, mensagem: "Álbum atualizado." };
    }

    const conferido = validarFormulario(albumSchema, formulario);
    if (!conferido.ok) return conferido.estado;

    await criarAlbum(conferido.dados);
    revalidar();
    return { ok: true, mensagem: "Álbum criado." };
  });

  return resultado.ok
    ? resultado
    : { ...resultado, valores: { ...digitado, ...resultado.valores } };
}

export async function excluirAlbumAcao(id: string): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirSessao();
    await excluirAlbum(id);
    revalidar();
    return { ok: true, mensagem: "Álbum excluído." };
  });
}

/**
 * Registra uma foto que já está publicada em /public.
 *
 * O envio de arquivos pelo navegador ainda não existe: enquanto as fotos são
 * otimizadas em lote por scripts/otimizar-fotos.mjs e entram junto com o
 * código, o painel só precisa apontar para elas. Aceitar apenas caminhos
 * internos também impede que o álbum passe a servir imagens de fora.
 */
export async function adicionarFotoAcao(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirSessao();

    const albumId = String(formulario.get("albumId") ?? "");
    const url = String(formulario.get("url") ?? "").trim();
    const legenda = String(formulario.get("legenda") ?? "").trim();

    if (!albumId) throw new ErroDeNegocio("Álbum não informado.");
    if (!url.startsWith("/fotos/")) {
      throw new ErroDeNegocio(
        'O caminho precisa começar com "/fotos/" e apontar para um arquivo já enviado à pasta public.'
      );
    }

    await adicionarFoto(albumId, url, legenda || undefined);
    revalidar();
    return { ok: true, mensagem: "Foto adicionada ao álbum." };
  });
}

export async function excluirFotoAcao(id: string): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirSessao();
    await excluirFoto(id);
    revalidar();
    return { ok: true, mensagem: "Foto removida do álbum." };
  });
}
