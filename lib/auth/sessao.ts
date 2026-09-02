import "server-only";

import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Papel } from "@/components/admin/navegacao";

const COOKIE = "paroquia_sessao";
const DURACAO_DIAS = 7;

export type UsuarioLogado = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
};

function segredo(): string {
  const valor = process.env.SEGREDO_SESSAO;
  if (!valor || valor.length < 32) {
    throw new Error(
      "SEGREDO_SESSAO ausente ou curta demais (mínimo 32 caracteres). " +
        'Gere uma com: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return valor;
}

/**
 * Resumo do token guardado no banco.
 *
 * Usa HMAC com uma chave que só existe nas variáveis de ambiente: quem
 * obtiver uma cópia do arquivo do banco ainda não consegue montar cookies
 * válidos, porque não tem a chave.
 */
function resumir(token: string): string {
  return createHmac("sha256", segredo()).update(token).digest("hex");
}

/**
 * Abre uma sessão para o usuário e entrega o cookie ao navegador.
 *
 * O cookie leva um token aleatório de 256 bits; o banco guarda apenas o
 * resumo dele. Só pode ser chamada de Server Action ou Route Handler — é onde
 * o Next consegue escrever cabeçalhos de resposta.
 */
export async function abrirSessao(usuarioId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + DURACAO_DIAS * 24 * 60 * 60 * 1000);

  await db.sessao.create({
    data: { usuarioId, tokenHash: resumir(token), expiraEm },
  });

  const armario = await cookies();
  armario.set(COOKIE, token, {
    httpOnly: true, // fora do alcance de qualquer script na página
    sameSite: "lax", // não viaja em requisições vindas de outros sites
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiraEm,
  });
}

/**
 * Quem está logado nesta requisição, ou `null`.
 *
 * `cache` do React garante uma única consulta por requisição, mesmo que o
 * layout, a página e três Server Actions perguntem a mesma coisa.
 */
export const usuarioDaSessao = cache(async (): Promise<UsuarioLogado | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  const sessao = await db.sessao.findUnique({
    where: { tokenHash: resumir(token) },
    include: { usuario: true },
  });

  if (!sessao) return null;

  // Sessão vencida ou de alguém que perdeu o acesso não vale, mesmo com o
  // cookie intacto. A limpeza da linha fica para `encerrarSessao`/faxina: aqui
  // estamos possivelmente renderizando, onde escrever no banco é indevido.
  if (sessao.expiraEm < new Date()) return null;
  if (!sessao.usuario.ativo) return null;

  return {
    id: sessao.usuario.id,
    nome: sessao.usuario.nome,
    email: sessao.usuario.email,
    papel: sessao.usuario.papel as Papel,
  };
});

/** Fecha a sessão atual: apaga a linha do banco e o cookie. */
export async function encerrarSessao(): Promise<void> {
  const armario = await cookies();
  const token = armario.get(COOKIE)?.value;

  if (token) {
    // `deleteMany` em vez de `delete` porque o cookie pode apontar para uma
    // sessão que já não existe, e isso não é motivo para dar erro.
    await db.sessao.deleteMany({ where: { tokenHash: resumir(token) } });
  }

  armario.delete(COOKIE);
}

/** Remove sessões vencidas. Chamada a cada login, para o banco não inchar. */
export async function limparSessoesVencidas(): Promise<void> {
  await db.sessao.deleteMany({ where: { expiraEm: { lt: new Date() } } });
}
