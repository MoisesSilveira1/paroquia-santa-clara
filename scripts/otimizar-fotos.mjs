// Converte as fotos de public/fotos para WebP (menor sem perda visível).
// Uso: node scripts/otimizar-fotos.mjs
import { readdir, readFile, writeFile, stat, unlink } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const RAIZ = "public/fotos";
const QUALIDADE = 78;
const LADO_MAXIMO = 1400;

async function* percorrer(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const caminho = join(dir, item.name);
    if (item.isDirectory()) yield* percorrer(caminho);
    else if ([".jpg", ".jpeg", ".png"].includes(extname(item.name).toLowerCase()))
      yield caminho;
  }
}

const convertidos = [];
let antes = 0;
let depois = 0;

// 1ª passada: converter (lendo para a memória, sem manter o arquivo aberto)
for await (const arquivo of percorrer(RAIZ)) {
  const destino = arquivo.replace(/\.(jpe?g|png)$/i, ".webp");
  const original = await readFile(arquivo);
  const saida = await sharp(original)
    .resize({ width: LADO_MAXIMO, height: LADO_MAXIMO, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALIDADE, effort: 6 })
    .toBuffer();

  await writeFile(destino, saida);
  convertidos.push(arquivo);
  antes += original.length;
  depois += saida.length;
  console.log(
    `${arquivo.replace(RAIZ, "")} → ${(original.length / 1024).toFixed(0)} KB ` +
      `virou ${(saida.length / 1024).toFixed(0)} KB`
  );
}

// 2ª passada: remover os originais
for (const arquivo of convertidos) {
  try {
    await unlink(arquivo);
  } catch (erro) {
    console.warn(`  (não consegui apagar ${arquivo}: ${erro.code} — apague à mão)`);
  }
}

console.log(
  `\nTotal: ${(antes / 1024 / 1024).toFixed(2)} MB → ${(depois / 1024 / 1024).toFixed(2)} MB ` +
    `(-${(100 - (depois / antes) * 100).toFixed(0)}%)`
);
