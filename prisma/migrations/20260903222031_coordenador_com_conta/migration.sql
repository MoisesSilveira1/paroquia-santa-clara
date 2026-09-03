-- AlterTable
ALTER TABLE "coordenadores" ADD COLUMN     "usuarioId" TEXT;

-- CreateIndex
CREATE INDEX "coordenadores_usuarioId_idx" ON "coordenadores"("usuarioId");

-- AddForeignKey
ALTER TABLE "coordenadores" ADD CONSTRAINT "coordenadores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
