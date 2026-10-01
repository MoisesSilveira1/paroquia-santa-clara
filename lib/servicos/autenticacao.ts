import "server-only";

import { db } from "@/lib/db";
import { conferirSenha } from "@/lib/auth/senha";
import { abrirSessao, limparSessoesVencidas } from "@/lib/auth/sessao";
import {
  anotarErro,
  exigirFolgaParaTentar,
  limparTentativas,
  limparTentativasVencidas,
} from "@/lib/auth/tentativas";
import { ErroDeNegocio } from "./resultado";

/**
 * Confere e-mail e senha e, dando certo, abre a sessão.
 *
 * A mensagem de falha é a mesma para "e-mail não existe" e "senha errada", de
 * propósito: respostas diferentes contariam a quem tenta adivinhar quais
 * e-mails estão cadastrados na paróquia.
 *
 * O freio contra tentativas em série vem antes de tudo — ver
 * lib/auth/tentativas.ts. Ele é conferido ANTES do cálculo da senha, que é a
 * parte cara: deixar o atacante gastar nosso processador é parte do problema.
 */
export async function entrar(email: string, senha: string): Promise<void> {
  const chave = await exigirFolgaParaTentar(email);

  const usuario = await db.usuario.findUnique({ where: { email } });

  const confere =
    usuario && usuario.ativo
      ? await conferirSenha(senha, usuario.senhaHash)
      : // Sem usuário, ainda assim gastamos o tempo de um cálculo de senha:
        // responder instantaneamente denunciaria que o e-mail não existe.
        await conferirSenha(senha, SENHA_FALSA);

  if (!usuario || !usuario.ativo || !confere) {
    await anotarErro(chave);
    throw new ErroDeNegocio("E-mail ou senha incorretos.");
  }

  // Acertou: a contagem de erros some, e a faxina aproveita a viagem.
  await limparTentativas(chave);
  await limparTentativasVencidas();
  await limparSessoesVencidas();
  await abrirSessao(usuario.id);
  await db.usuario.update({
    where: { id: usuario.id },
    data: { ultimoAcesso: new Date() },
  });
}

/**
 * Resumo de uma senha que ninguém tem, usado só para gastar tempo.
 * Gerado uma vez com `criarHashDeSenha` e fixado aqui.
 */
const SENHA_FALSA =
  "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
