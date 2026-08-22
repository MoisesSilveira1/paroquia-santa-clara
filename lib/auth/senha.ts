import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derivar = promisify(scrypt) as (
  senha: string,
  sal: Buffer,
  tamanho: number,
  opcoes: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

// Parâmetros do scrypt. N é o custo: dobrá-lo dobra o tempo e a memória
// necessários para testar uma senha. 2^15 leva dezenas de milissegundos aqui e
// torna a tentativa de adivinhar em massa cara o suficiente.
const CUSTO = { N: 2 ** 15, r: 8, p: 1 };
// O scrypt precisa de ~128 * N * r bytes para trabalhar (32 MB com os valores
// acima). O limite padrão do Node é exatamente 32 MB e recusa por um triz, daí
// declararmos o dobro.
const MEMORIA_MAXIMA = 64 * 1024 * 1024;
const TAMANHO_SAL = 16;
const TAMANHO_HASH = 64;

/**
 * Transforma uma senha em algo que pode ser guardado no banco.
 *
 * Cada senha recebe um sal aleatório próprio: duas pessoas com a mesma senha
 * geram resumos diferentes, e uma tabela pronta de senhas comuns não serve
 * para nada contra este banco.
 *
 * O formato guardado é `scrypt$N$r$p$sal$hash`, com os parâmetros embutidos —
 * assim é possível aumentar o custo no futuro sem invalidar as senhas antigas.
 */
export async function criarHashDeSenha(senha: string): Promise<string> {
  const sal = randomBytes(TAMANHO_SAL);
  const hash = await derivar(senha.normalize("NFKC"), sal, TAMANHO_HASH, {
    ...CUSTO,
    maxmem: MEMORIA_MAXIMA,
  });
  return [
    "scrypt",
    CUSTO.N,
    CUSTO.r,
    CUSTO.p,
    sal.toString("base64"),
    hash.toString("base64"),
  ].join("$");
}

/**
 * Confere uma senha digitada contra o resumo guardado.
 *
 * A comparação é feita em tempo constante: comparar com `===` vazaria, pelo
 * tempo de resposta, quantos bytes iniciais o atacante já acertou.
 */
export async function conferirSenha(
  senha: string,
  guardado: string
): Promise<boolean> {
  const partes = guardado.split("$");
  if (partes.length !== 6 || partes[0] !== "scrypt") return false;

  const [, n, r, p, salBase64, hashBase64] = partes;
  const sal = Buffer.from(salBase64, "base64");
  const esperado = Buffer.from(hashBase64, "base64");

  const calculado = await derivar(senha.normalize("NFKC"), sal, esperado.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: MEMORIA_MAXIMA,
  });

  return (
    calculado.length === esperado.length && timingSafeEqual(calculado, esperado)
  );
}
