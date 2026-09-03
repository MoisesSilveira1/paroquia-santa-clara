import "dotenv/config";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PrismaClient } from "../lib/gerado/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { LADO_MAXIMO, QUALIDADE } from "../lib/imagens/limites";

/**
 * Importa para o banco um lote de fotos que está numa pasta do computador.
 *
 * Existe porque o envio pelo painel aceita 12 fotos por vez — adequado para a
 * secretaria publicar as fotos de um domingo, inviável para os 86 arquivos de
 * uma festa inteira.
 *
 * As fotos vão para o BANCO, e não para `public/`, pelo mesmo motivo das
 * enviadas pelo painel: em hospedagem serverless o disco é descartado a cada
 * publicação, e um arquivo em `public/` sumiria. Além disso, guardadas em
 * `public/` elas iriam para o Git — 85 MB de fotos de celular que ficariam no
 * histórico do repositório para sempre.
 *
 * Usa as mesmas medidas do painel (lib/imagens): gira conforme a câmera marcou,
 * reduz o maior lado e reconverte para WebP. Reconverter sempre também é o que
 * descarta EXIF e GPS — fotos de celular carregam a localização de quem tirou.
 *
 * Uso:
 *   npx tsx scripts/importar-fotos-para-o-banco.ts "<pasta>" "<título do álbum>" <aaaa-mm-dd>
 */

const [, , pastaArg, tituloArg, dataArg] = process.argv;

if (!pastaArg || !tituloArg) {
  console.error(
    'Uso: npx tsx scripts/importar-fotos-para-o-banco.ts "<pasta>" "<título>" [aaaa-mm-dd]'
  );
  process.exit(1);
}

const EXTENSOES = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida — veja o .env.example.");

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

  const nomes = (await readdir(pastaArg, { withFileTypes: true }))
    .filter((e) => e.isFile() && EXTENSOES.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort();

  if (nomes.length === 0) {
    console.error(`Nenhuma imagem encontrada em ${pastaArg}`);
    process.exit(1);
  }

  console.log(`${nomes.length} imagens em ${pastaArg}`);

  const album = await db.album.create({
    data: {
      titulo: tituloArg,
      data: dataArg ? new Date(`${dataArg}T12:00:00`) : null,
      // Entra despublicado de propósito: quem decide o que vai ao ar é a
      // secretaria, pelo painel, depois de olhar as fotos uma a uma.
      publicado: false,
    },
  });
  console.log(`Álbum criado (despublicado): ${album.titulo}`);

  let importadas = 0;
  let bytesOriginais = 0;
  let bytesFinais = 0;
  const falhas: string[] = [];

  for (const [indice, nome] of nomes.entries()) {
    const caminho = path.join(pastaArg, nome);
    try {
      const original = await readFile(caminho);
      const { data, info } = await sharp(original)
        .rotate()
        .resize({
          width: LADO_MAXIMO,
          height: LADO_MAXIMO,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: QUALIDADE, effort: 6 })
        .toBuffer({ resolveWithObject: true });

      // Mesma ordem do painel: a foto nasce sem url, recebe os bytes e só
      // então aponta para o endereço que os serve.
      const foto = await db.foto.create({
        data: { albumId: album.id, url: "", ordem: indice },
      });
      await db.imagem.create({
        data: {
          fotoId: foto.id,
          dados: new Uint8Array(data),
          tipo: "image/webp",
          largura: info.width,
          altura: info.height,
          bytes: data.length,
        },
      });
      await db.foto.update({
        where: { id: foto.id },
        data: { url: `/imagens/${foto.id}` },
      });

      importadas += 1;
      bytesOriginais += original.length;
      bytesFinais += data.length;
      if (importadas % 10 === 0) console.log(`  ${importadas}/${nomes.length}…`);
    } catch (erro) {
      // Uma foto ruim no meio do lote não derruba as outras.
      falhas.push(nome);
      console.error(`  falhou: ${nome} — ${(erro as Error).message}`);
    }
  }

  const mb = (b: number) => (b / 1024 / 1024).toFixed(1);
  console.log(
    `\n${importadas} fotos importadas — ${mb(bytesOriginais)} MB viraram ${mb(bytesFinais)} MB`
  );
  if (falhas.length) console.log(`${falhas.length} falharam: ${falhas.join(", ")}`);
  console.log(
    `\nO álbum está DESPUBLICADO. Abra /admin/galeria, confira as fotos e publique.`
  );

  await db.$disconnect();
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
