-- CreateTable
CREATE TABLE "avisos_paroquiais" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "texto" TEXT,
    "videoUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "expiraEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avisos_paroquiais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagens_de_avisos" (
    "id" TEXT NOT NULL,
    "avisoId" TEXT NOT NULL,
    "dados" BYTEA NOT NULL,
    "tipo" TEXT NOT NULL,
    "largura" INTEGER NOT NULL,
    "altura" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagens_de_avisos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "avisos_paroquiais_ativo_atualizadoEm_idx" ON "avisos_paroquiais"("ativo", "atualizadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "imagens_de_avisos_avisoId_key" ON "imagens_de_avisos"("avisoId");

-- AddForeignKey
ALTER TABLE "imagens_de_avisos" ADD CONSTRAINT "imagens_de_avisos_avisoId_fkey" FOREIGN KEY ("avisoId") REFERENCES "avisos_paroquiais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
