import "server-only";

import { redirect } from "next/navigation";
import type { Papel } from "@/components/admin/navegacao";
import { usuarioDaSessao, type UsuarioLogado } from "./sessao";

/**
 * Erro de permissão levantado pelos serviços.
 *
 * Existe como tipo próprio para que as Server Actions saibam distinguir
 * "sem permissão" de um defeito qualquer, e respondam com a mensagem certa.
 */
export class SemPermissao extends Error {
  constructor(mensagem = "Você não tem permissão para esta ação.") {
    super(mensagem);
    this.name = "SemPermissao";
  }
}

/**
 * Exige alguém logado; caso contrário manda para a tela de entrada.
 *
 * Toda página do painel e toda Server Action chama isto no início. Esconder o
 * botão na tela NÃO é proteção: qualquer pessoa pode enviar o mesmo POST que o
 * botão enviaria, sem passar pela interface.
 */
export async function exigirSessao(): Promise<UsuarioLogado> {
  const usuario = await usuarioDaSessao();
  if (!usuario) redirect("/admin/entrar");
  return usuario;
}

/** Exige um dos papéis informados. */
export async function exigirPapel(...papeis: Papel[]): Promise<UsuarioLogado> {
  const usuario = await exigirSessao();
  if (!papeis.includes(usuario.papel)) {
    throw new SemPermissao(
      "Esta área é restrita aos administradores da paróquia."
    );
  }
  return usuario;
}
