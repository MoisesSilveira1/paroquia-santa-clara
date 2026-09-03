-- Três perfis no lugar de dois.
--
-- "SECRETARIA" virou "ADMIN_COMUM": é a mesma pessoa e o mesmo trabalho, só
-- com nome que descreve o nível de acesso em vez do setor — quem cuida do
-- dia a dia do site nem sempre é da secretaria. O papel novo é "PADRE", com
-- acesso total, criado pelo painel.
--
-- A ordem importa: primeiro os dados existentes, depois o padrão da coluna.
-- Se o padrão mudasse antes, nada quebraria aqui, mas quem lesse a migração
-- ficaria em dúvida sobre quais linhas o UPDATE alcançou.

UPDATE "usuarios" SET "papel" = 'ADMIN_COMUM' WHERE "papel" = 'SECRETARIA';

-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "papel" SET DEFAULT 'ADMIN_COMUM';
