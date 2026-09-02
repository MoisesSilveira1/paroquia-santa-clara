"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/auth/guardas";
import {
  adicionarFotoEnviada,
  atualizarAlbum,
  atualizarLegenda,
  criarAlbum,
  excluirAlbum,
  excluirFoto,
} from "@/lib/servicos/galeria";
import { prepararImagem } from "@/lib/imagens/processar";
import { conferirLote } from "@/lib/imagens/limites";
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
 * Recebe as fotos escolhidas na tela, converte e guarda no álbum.
 *
 * Uma foto ruim no meio do lote não derruba o envio inteiro: as boas entram e
 * a mensagem final diz quantas ficaram de fora e por quê. Quem está enviando
 * 12 fotos de uma festa não deveria perder as 11 que estavam certas.
 */
export async function enviarFotosAcao(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirSessao();

    const albumId = String(formulario.get("albumId") ?? "");
    if (!albumId) throw new ErroDeNegocio("Álbum não informado.");

    const legenda = String(formulario.get("legenda") ?? "").trim();
    const arquivos = formulario
      .getAll("fotos")
      .filter((item): item is File => item instanceof File && item.size > 0);

    // A mesma conferência que a tela já fez. Ela vale porque a tela pode ser
    // contornada: o formulário aceita um POST montado à mão.
    const recusa = conferirLote(arquivos);
    if (recusa) throw new ErroDeNegocio(recusa);

    // A legenda digitada vale para uma foto só; num lote não há como saber a
    // qual delas pertence. As demais entram sem legenda e recebem a sua na
    // grade, uma a uma.
    const legendaUnica = arquivos.length === 1 ? legenda : "";

    const falhas: string[] = [];
    let enviadas = 0;

    // Uma por vez, de propósito: converter 12 fotos em paralelo faria o sharp
    // segurar todas descomprimidas na memória ao mesmo tempo.
    for (const arquivo of arquivos) {
      try {
        const imagem = await prepararImagem(arquivo);
        await adicionarFotoEnviada(albumId, imagem, legendaUnica || undefined);
        enviadas++;
      } catch (erro) {
        if (!(erro instanceof ErroDeNegocio)) throw erro;
        falhas.push(erro.message);
      }
    }

    revalidar();

    if (enviadas === 0) throw new ErroDeNegocio(falhas.join(" "));

    const quantas = enviadas === 1 ? "1 foto adicionada" : `${enviadas} fotos adicionadas`;
    return {
      ok: true,
      mensagem: falhas.length
        ? `${quantas} ao álbum. Não deu para usar: ${falhas.join(" ")}`
        : `${quantas} ao álbum.`,
    };
  });
}

export async function salvarLegendaAcao(
  id: string,
  legenda: string
): Promise<EstadoFormulario> {
  return executar(async () => {
    await exigirSessao();

    if (legenda.length > 200) {
      throw new ErroDeNegocio("A legenda passa de 200 caracteres.");
    }

    await atualizarLegenda(id, legenda.trim());
    revalidar();
    return { ok: true, mensagem: "Legenda salva." };
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
