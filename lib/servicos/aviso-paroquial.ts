import "server-only";

import type { z } from "zod";
import { db } from "@/lib/db";
import { ErroDeNegocio } from "./resultado";
import { prepararImagem } from "@/lib/imagens/processar";
import type {
  avisoParoquialEdicaoSchema,
  avisoParoquialSchema,
} from "@/lib/validacao/esquemas";

export type AvisoParoquial = {
  id: string;
  titulo: string;
  texto: string | null;
  videoUrl: string | null;
  ativo: boolean;
  expiraEm: Date | null;
  atualizadoEm: Date;
  /** Só a existência da imagem; os bytes vêm pela rota /imagens/aviso/<id>. */
  temImagem: boolean;
  /**
   * Se a validade já passou.
   *
   * Calculado aqui, e não na tela: comparar com a hora atual durante a
   * renderização daria respostas diferentes no servidor e no navegador, e a
   * tela ficaria dizendo "no ar" num lado e "vencido" no outro.
   */
  expirado: boolean;
};

/** O aviso mostrado ao visitante, ou `null` quando não há nenhum no ar. */
export type AvisoEmCartaz = {
  id: string;
  titulo: string;
  texto: string | null;
  videoUrl: string | null;
  temImagem: boolean;
  /** Muda quando a secretaria edita o aviso — ver `AvisoDeEntrada`. */
  versao: number;
};

const CAMPOS = {
  id: true,
  titulo: true,
  texto: true,
  videoUrl: true,
  ativo: true,
  expiraEm: true,
  atualizadoEm: true,
  imagem: { select: { id: true } },
} as const;

export async function listarAvisosParoquiais(): Promise<AvisoParoquial[]> {
  const linhas = await db.avisoParoquial.findMany({
    select: CAMPOS,
    // O que está no ar primeiro; depois o mais recente.
    orderBy: [{ ativo: "desc" }, { atualizadoEm: "desc" }],
  });

  const agora = Date.now();
  return linhas.map(({ imagem, ...resto }) => ({
    ...resto,
    temImagem: imagem !== null,
    expirado: resto.expiraEm !== null && resto.expiraEm.getTime() <= agora,
  }));
}

/**
 * O aviso que o site deve mostrar agora.
 *
 * A data de validade é conferida aqui, e não por uma tarefa que roda de tempos
 * em tempos: assim o aviso vencido para de aparecer no minuto certo, sem
 * depender de nada rodando por fora.
 */
export async function avisoEmCartaz(): Promise<AvisoEmCartaz | null> {
  const linha = await db.avisoParoquial.findFirst({
    where: {
      ativo: true,
      OR: [{ expiraEm: null }, { expiraEm: { gt: new Date() } }],
    },
    select: {
      id: true,
      titulo: true,
      texto: true,
      videoUrl: true,
      atualizadoEm: true,
      imagem: { select: { id: true } },
    },
    orderBy: { atualizadoEm: "desc" },
  });

  if (!linha) return null;

  return {
    id: linha.id,
    titulo: linha.titulo,
    texto: linha.texto,
    videoUrl: linha.videoUrl,
    temImagem: linha.imagem !== null,
    versao: linha.atualizadoEm.getTime(),
  };
}

export async function criarAvisoParoquial(
  dados: z.infer<typeof avisoParoquialSchema>,
  imagem: File | null
) {
  // Campo a campo, e não `...dados`: `removerImagem` é caixa de formulário e
  // não existe na tabela — num aviso novo não há imagem para remover.
  const aviso = await db.avisoParoquial.create({
    data: {
      titulo: dados.titulo,
      texto: dados.texto,
      videoUrl: dados.videoUrl,
      ativo: dados.ativo,
      expiraEm: dados.expiraEm,
    },
  });

  if (imagem) await guardarImagem(aviso.id, imagem);
  if (dados.ativo) await tirarOsOutrosDoAr(aviso.id);

  return aviso.id;
}

export async function atualizarAvisoParoquial(
  { id, removerImagem, ...campos }: z.infer<typeof avisoParoquialEdicaoSchema>,
  imagem: File | null
) {
  const atual = await db.avisoParoquial.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!atual) throw new ErroDeNegocio("Aviso não encontrado.");

  await db.avisoParoquial.update({ where: { id }, data: campos });

  // Enviar uma imagem nova substitui a anterior; a caixa "remover" apaga sem
  // pôr outra no lugar. Enviar e remover ao mesmo tempo é enviar.
  if (imagem) await guardarImagem(id, imagem);
  else if (removerImagem) await db.imagemDeAviso.deleteMany({ where: { avisoId: id } });

  if (campos.ativo) await tirarOsOutrosDoAr(id);
}

export async function excluirAvisoParoquial(id: string) {
  await db.avisoParoquial.delete({ where: { id } });
}

/** Liga ou desliga o aviso pelo botão da lista, sem abrir o formulário. */
export async function alternarAvisoParoquial(id: string) {
  const atual = await db.avisoParoquial.findUnique({
    where: { id },
    select: { ativo: true },
  });
  if (!atual) throw new ErroDeNegocio("Aviso não encontrado.");

  await db.avisoParoquial.update({
    where: { id },
    data: { ativo: !atual.ativo },
  });
  if (!atual.ativo) await tirarOsOutrosDoAr(id);
}

/** Os bytes da imagem, para a rota que a serve. */
export async function imagemDoAviso(avisoId: string) {
  const imagem = await db.imagemDeAviso.findUnique({
    where: { avisoId },
    select: { dados: true, tipo: true },
  });
  return imagem;
}

/**
 * Garante que só um aviso fique no ar.
 *
 * Dois avisos ativos exigiriam decidir qual mostrar, ou empilhar duas janelas
 * na cara do visitante. Ativar um desliga os demais — e a lista do painel
 * mostra qual está no ar, então a secretaria vê o efeito na hora.
 */
async function tirarOsOutrosDoAr(idQueFica: string) {
  await db.avisoParoquial.updateMany({
    where: { id: { not: idQueFica }, ativo: true },
    data: { ativo: false },
  });
}

async function guardarImagem(avisoId: string, arquivo: File) {
  const pronta = await prepararImagem(arquivo);

  // `upsert` porque o aviso tem no máximo uma imagem: trocar é sobrescrever.
  await db.imagemDeAviso.upsert({
    where: { avisoId },
    create: { avisoId, ...pronta },
    update: pronta,
  });
}
