import "server-only";

import type { z } from "zod";
import { db } from "@/lib/db";
import { criarHashDeSenha } from "@/lib/auth/senha";
import { ErroDeNegocio } from "./resultado";
import {
  NOME_DO_PAPEL,
  PAPEIS_DE_ACESSO_TOTAL,
  papeisAtribuiveisPor,
  type Papel,
} from "@/lib/auth/papeis";
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
      ? {
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            { email: { contains: busca, mode: "insensitive" as const } },
          ],
        }
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

export async function criarUsuario(
  dados: z.infer<typeof usuarioSchema>,
  quemCria: { papel: Papel }
) {
  garantirPapelPermitido(dados.papel, quemCria);

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
  quemEdita: { id: string; papel: Papel }
) {
  const alvo = await db.usuario.findUnique({ where: { id: dados.id } });
  if (!alvo) throw new ErroDeNegocio("Usuário não encontrado.");

  // As duas pontas são conferidas: o papel que a conta TEM hoje e o que ela
  // passaria a ter. Sem a primeira, o administrador comum trocaria a senha da
  // conta do padre e entraria por ela; sem a segunda, se promoveria pela
  // edição de um coordenador qualquer.
  garantirPapelPermitido(alvo.papel as Papel, quemEdita);
  garantirPapelPermitido(dados.papel, quemEdita);

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

  const eraTotal = temAcessoTotal(alvo.papel);
  const seraTotal = temAcessoTotal(dados.papel);
  if ((eraTotal && !seraTotal) || (eraTotal && alvo.ativo && !dados.ativo)) {
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

export async function excluirUsuario(
  id: string,
  quemExclui: { id: string; papel: Papel }
) {
  if (id === quemExclui.id) {
    throw new ErroDeNegocio("Você não pode excluir a si mesmo.");
  }

  const alvo = await db.usuario.findUnique({ where: { id }, select: { papel: true } });
  if (!alvo) throw new ErroDeNegocio("Usuário não encontrado.");

  garantirPapelPermitido(alvo.papel as Papel, quemExclui);
  if (temAcessoTotal(alvo.papel)) await garantirOutroAdministrador(id);

  await db.usuario.delete({ where: { id } });
}

function temAcessoTotal(papel: string): boolean {
  return PAPEIS_DE_ACESSO_TOTAL.includes(papel as Papel);
}

/**
 * Impede que alguém mexa num nível de acesso acima do seu.
 *
 * Vale tanto para o papel que a conta tem hoje quanto para o que ela receberia.
 * É esta função que fecha a porta dos fundos: sem ela, o administrador comum
 * pode criar ou promover uma conta de acesso total e usá-la para fazer o que o
 * próprio papel dele proíbe — na prática, "não excluir" viraria letra morta.
 */
function garantirPapelPermitido(papel: Papel, quemMexe: { papel: Papel }) {
  if (papeisAtribuiveisPor(quemMexe.papel).includes(papel)) return;
  throw new ErroDeNegocio(
    `Sua conta não pode mexer em cadastros de ${NOME_DO_PAPEL[papel].toLowerCase()}. Peça ao padre ou ao administrador geral.`
  );
}

/**
 * Impede que a paróquia fique sem nenhum acesso total ativo.
 *
 * Sem esta checagem, rebaixar ou desativar o último deles deixaria o painel
 * sem ninguém capaz de excluir ou promover, e a única saída seria mexer no
 * banco na mão.
 */
async function garantirOutroAdministrador(exceto: string) {
  const outros = await db.usuario.count({
    where: {
      papel: { in: [...PAPEIS_DE_ACESSO_TOTAL] },
      ativo: true,
      id: { not: exceto },
    },
  });
  if (outros === 0) {
    throw new ErroDeNegocio(
      "É preciso haver ao menos um padre ou administrador geral ativo. Promova outra pessoa antes."
    );
  }
}
