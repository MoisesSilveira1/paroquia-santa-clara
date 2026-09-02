import { PrismaClient } from "@/lib/gerado/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/**
 * Conexão única com o banco.
 *
 * Em desenvolvimento, o Next recarrega este módulo a cada alteração de código.
 * Sem guardar a instância em `globalThis`, cada recarga abriria mais uma
 * conexão com o arquivo do SQLite até o processo travar por excesso delas.
 */
const global_ = globalThis as unknown as { prisma?: PrismaClient };

function criarCliente() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não definida. Copie .env.example para .env e preencha — " +
        'em desenvolvimento o valor é "file:./prisma/dev.db".'
    );
  }

  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url }),
    // Em desenvolvimento vale ver as consultas lentas no terminal; em
    // produção isso só encheria o log.
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = global_.prisma ?? criarCliente();

if (process.env.NODE_ENV !== "production") global_.prisma = db;
