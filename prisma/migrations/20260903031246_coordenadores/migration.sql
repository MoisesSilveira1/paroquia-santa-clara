-- CreateTable
CREATE TABLE "coordenadores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT NOT NULL DEFAULT 'Coordenador(a)',
    "telefone" TEXT,
    "email" TEXT,
    "contatoPublico" BOOLEAN NOT NULL DEFAULT false,
    "pastoralId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coordenadores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coordenadores_pastoralId_ordem_idx" ON "coordenadores"("pastoralId", "ordem");

-- CreateIndex
CREATE INDEX "coordenadores_ativo_idx" ON "coordenadores"("ativo");

-- AddForeignKey
ALTER TABLE "coordenadores" ADD CONSTRAINT "coordenadores_pastoralId_fkey" FOREIGN KEY ("pastoralId") REFERENCES "pastorais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
