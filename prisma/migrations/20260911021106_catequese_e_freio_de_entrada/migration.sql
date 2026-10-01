-- CreateTable
CREATE TABLE "tentativas_de_entrada" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tentativas_de_entrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_da_catequese" (
    "id" TEXT NOT NULL DEFAULT 'unica',
    "inscricoesAbertas" BOOLEAN NOT NULL DEFAULT false,
    "anoLetivo" TEXT NOT NULL,
    "aviso" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_da_catequese_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turmas_de_catequese" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "etapa" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "hora" TEXT NOT NULL,
    "local" TEXT,
    "vagas" INTEGER NOT NULL DEFAULT 0,
    "catequistas" TEXT,
    "anoLetivo" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turmas_de_catequese_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscricoes_na_catequese" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'NOVA',
    "status" TEXT NOT NULL DEFAULT 'RECEBIDA',
    "turmaId" TEXT,
    "nome" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "batizado" BOOLEAN NOT NULL DEFAULT false,
    "paroquiaBatismo" TEXT,
    "responsavel" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "padrinho" TEXT,
    "observacao" TEXT,
    "anoLetivo" TEXT NOT NULL,
    "consentimentoEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscricoes_na_catequese_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tentativas_de_entrada_chave_criadoEm_idx" ON "tentativas_de_entrada"("chave", "criadoEm");

-- CreateIndex
CREATE INDEX "turmas_de_catequese_anoLetivo_ativa_ordem_idx" ON "turmas_de_catequese"("anoLetivo", "ativa", "ordem");

-- CreateIndex
CREATE INDEX "inscricoes_na_catequese_anoLetivo_status_criadoEm_idx" ON "inscricoes_na_catequese"("anoLetivo", "status", "criadoEm");

-- CreateIndex
CREATE INDEX "inscricoes_na_catequese_turmaId_idx" ON "inscricoes_na_catequese"("turmaId");

-- AddForeignKey
ALTER TABLE "inscricoes_na_catequese" ADD CONSTRAINT "inscricoes_na_catequese_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas_de_catequese"("id") ON DELETE SET NULL ON UPDATE CASCADE;
