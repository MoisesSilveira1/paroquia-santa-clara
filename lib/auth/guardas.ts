import "server-only";

import { redirect } from "next/navigation";
import { pode, RECADO_SEM_PERMISSAO, type Permissao } from "./papeis";
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

/**
 * Exige alguém logado que tenha a permissão pedida.
 *
 * Substituiu o antigo `exigirPapel`, que comparava o papel na mão em cada
 * ação. A diferença importa quando os papéis mudam: com esta forma, criar um
 * quarto papel é mexer só na tabela de `lib/auth/papeis.ts` — nenhuma ação
 * precisa ser revisitada, e nenhuma fica para trás por esquecimento.
 */
export async function exigirPermissao(
  permissao: Permissao
): Promise<UsuarioLogado> {
  const usuario = await exigirSessao();
  if (!pode(usuario.papel, permissao)) {
    throw new SemPermissao(RECADO_SEM_PERMISSAO[permissao]);
  }
  return usuario;
}
