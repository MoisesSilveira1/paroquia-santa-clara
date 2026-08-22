import "server-only";

import type { z } from "zod";
import { db } from "@/lib/db";
import { criarHashDeSenha } from "@/lib/auth/senha";
import { ErroDeNegocio } from "./resultado";
import type { Papel } from "@/components/admin/navegacao";
import type { usuarioEdicaoSchema, usuarioSchema } from "@/lib/validacao/esquemas";

export type UsuarioDaLista = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  ultimoAcesso: Date | null;
};

export async function listarUsuarios(busca = ""): Promise<UsuarioDaLista[]> {
  const linhas = await db.usuario.findMany({
    where: busca
      ? { OR: [{ nome: { contains: busca } }, { email: { contains: busca } }] }
      : {},
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      ativo: true,
      ultimoAcesso: true,
    },
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
  });

  return linhas as UsuarioDaLista[];
}

export async function criarUsuario(dados: z.infer<typeof usuarioSchema>) {
  const existente = await db.usuario.findUnique({
    where: { email: dados.email },
    select: { id: true },
  });
  if (existente) {
    throw new ErroDeNegocio("Já existe alguém cadastrado com esse e-mail.");
  }

  await db.usuario.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      papel: dados.papel,
      senhaHash: await criarHashDeSenha(dados.senha),
    },
  });
}

export async function atualizarUsuario(
  dados: z.infer<typeof usuarioEdicaoSchema>,
  quemEdita: { id: string }
) {
  const alvo = await db.usuario.findUnique({ where: { id: dados.id } });
  if (!alvo) throw new ErroDeNegocio("Usuário não encontrado.");

  const emailTomado = await db.usuario.findFirst({
    where: { email: dados.email, id: { not: dados.id } },
    select: { id: true },
  });
  if (emailTomado) {
    throw new ErroDeNegocio("Esse e-mail já pertence a outro usuário.");
  }

  // Quem está editando não pode tirar o próprio acesso nem se rebaixar: seria
  // uma porta trancada por dentro, sem ninguém do lado de fora com a chave.
  if (dados.id === quemEdita.id) {
    if (!dados.ativo) {
      throw new ErroDeNegocio("Você não pode desativar o próprio acesso.");
    }
    if (dados.papel !== alvo.papel) {
      throw new ErroDeNegocio("Você não pode mudar o próprio nível de acesso.");
    }
  }

  if (alvo.papel === "SUPER_ADMIN" && dados.papel !== "SUPER_ADMIN") {
    await garantirOutroAdministrador(alvo.id);
  }
  if (alvo.ativo && !dados.ativo && alvo.papel === "SUPER_ADMIN") {
    await garantirOutroAdministrador(alvo.id);
  }

  await db.usuario.update({
    where: { id: dados.id },
    data: {
      nome: dados.nome,
      email: dados.email,
      papel: dados.papel,
      ativo: dados.ativo,
      ...(dados.senha ? { senhaHash: await criarHashDeSenha(dados.senha) } : {}),
    },
  });

  // Trocar a senha ou cortar o acesso precisa valer agora, não daqui a uma
  // semana: as sessões abertas dessa pessoa caem junto.
  if (dados.senha || !dados.ativo) {
    await db.sessao.deleteMany({ where: { usuarioId: dados.id } });
  }
}

export async function excluirUsuario(id: string, quemExclui: { id: string }) {
  if (id === quemExclui.id) {
    throw new ErroDeNegocio("Você não pode excluir a si mesmo.");
  }

  const alvo = await db.usuario.findUnique({ where: { id }, select: { papel: true } });
  if (!alvo) throw new ErroDeNegocio("Usuário não encontrado.");
  if (alvo.papel === "SUPER_ADMIN") await garantirOutroAdministrador(id);

  await db.usuario.delete({ where: { id } });
}

/**
 * Impede que a paróquia fique sem nenhum administrador ativo.
 *
 * Sem esta checagem, rebaixar ou desativar o último administrador deixaria a
 * tela de usuários inacessível para todo mundo, e a única saída seria mexer no
 * banco na mão.
 */
async function garantirOutroAdministrador(exceto: string) {
  const outros = await db.usuario.count({
    where: { papel: "SUPER_ADMIN", ativo: true, id: { not: exceto } },
  });
  if (outros === 0) {
    throw new ErroDeNegocio(
      "É preciso haver ao menos um administrador ativo. Promova outra pessoa antes."
    );
  }
}
