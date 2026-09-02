import { PrismaClient } from "@/lib/gerado/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Conexão única com o banco (Prisma Postgres).
 *
 * Em desenvolvimento, o Next recarrega este módulo a cada alteração de código.
 * Sem guardar a instância em `globalThis`, cada recarga abriria mais um pool de
 * conexões com o banco até estourar o limite do servidor.
 */
const global_ = globalThis as unknown as { prisma?: PrismaClient };

function criarCliente() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não definida. Copie .env.example para .env e preencha com " +
        "a string de conexão do Prisma Postgres (ou rode `npx prisma dev` para " +
        "um banco local). Veja o README."
    );
  }

  return new PrismaClient({
    // O adaptador cria o pool a partir da string de conexão; o Prisma não abre
    // conexão por conta própria na versão 7.
    adapter: new PrismaPg({ connectionString: url }),
    // Em desenvolvimento vale ver as consultas lentas no terminal; em
    // produção isso só encheria o log.
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = global_.prisma ?? criarCliente();

if (process.env.NODE_ENV !== "production") global_.prisma = db;
