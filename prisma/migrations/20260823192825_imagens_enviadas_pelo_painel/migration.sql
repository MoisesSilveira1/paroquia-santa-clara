-- CreateTable
CREATE TABLE "imagens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fotoId" TEXT NOT NULL,
    "dados" BLOB NOT NULL,
    "tipo" TEXT NOT NULL,
    "largura" INTEGER NOT NULL,
    "altura" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "imagens_fotoId_fkey" FOREIGN KEY ("fotoId") REFERENCES "fotos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "imagens_fotoId_key" ON "imagens"("fotoId");
