"use server";

import { redirect } from "next/navigation";
import { encerrarSessao } from "@/lib/auth/sessao";

/** Encerra a sessão e devolve a pessoa à tela de entrada. */
export async function acaoSair(): Promise<void> {
  await encerrarSessao();
  redirect("/admin/entrar");
}
