-- CreateTable
CREATE TABLE "eventos_de_pastoral" (
    "id" TEXT NOT NULL,
    "pastoralId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'REUNIAO',
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3),
    "local" TEXT,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_de_pastoral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalas_de_evento" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "membroId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escalas_de_evento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eventos_de_pastoral_pastoralId_inicio_idx" ON "eventos_de_pastoral"("pastoralId", "inicio");

-- CreateIndex
CREATE INDEX "escalas_de_evento_membroId_idx" ON "escalas_de_evento"("membroId");

-- CreateIndex
CREATE UNIQUE INDEX "escalas_de_evento_eventoId_membroId_key" ON "escalas_de_evento"("eventoId", "membroId");

-- AddForeignKey
ALTER TABLE "eventos_de_pastoral" ADD CONSTRAINT "eventos_de_pastoral_pastoralId_fkey" FOREIGN KEY ("pastoralId") REFERENCES "pastorais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalas_de_evento" ADD CONSTRAINT "escalas_de_evento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos_de_pastoral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalas_de_evento" ADD CONSTRAINT "escalas_de_evento_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "coordenadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
