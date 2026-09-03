import "server-only";

import type { z } from "zod";
import { db } from "@/lib/db";
import { montarPagina, recortar, type Pagina } from "./listagem";
import {
  STATUS_MENSAGEM,
  type StatusMensagem,
  type mensagemSchema,
} from "@/lib/validacao/esquemas";

export type MensagemDaLista = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string;
  corpo: string;
  status: StatusMensagem;
  criadoEm: Date;
};

export async function listarMensagens({
  busca = "",
  status = "",
  pagina = 1,
}: {
  busca?: string;
  status?: string;
  pagina?: number;
}): Promise<Pagina<MensagemDaLista>> {
  const onde = {
    ...(busca
      ? {
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            { email: { contains: busca, mode: "insensitive" as const } },
            { assunto: { contains: busca, mode: "insensitive" as const } },
            { corpo: { contains: busca, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(STATUS_MENSAGEM.includes(status as StatusMensagem) ? { status } : {}),
  };

  const total = await db.mensagem.count({ where: onde });
  const recorte = recortar(pagina, total);

  const itens = await db.mensagem.findMany({
    where: onde,
    orderBy: { criadoEm: "desc" },
    skip: recorte.skip,
    take: recorte.take,
  });

  return montarPagina(itens as MensagemDaLista[], total, recorte);
}

/** Guarda uma mensagem enviada pelo formulário público de contato. */
export async function registrarMensagem(dados: z.infer<typeof mensagemSchema>) {
  await db.mensagem.create({ data: dados });
}

export async function mudarStatusMensagem(id: string, status: StatusMensagem) {
  await db.mensagem.update({ where: { id }, data: { status } });
}

export async function excluirMensagem(id: string) {
  await db.mensagem.delete({ where: { id } });
}

export async function contarMensagensNovas(): Promise<number> {
  return db.mensagem.count({ where: { status: "NOVA" } });
}
