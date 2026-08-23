import "server-only";

import sharp from "sharp";
import { ErroDeNegocio } from "@/lib/servicos/resultado";
import {
  LADO_MAXIMO,
  QUALIDADE,
  TAMANHO_MAXIMO_POR_ARQUIVO,
  TIPOS_ACEITOS,
  formatarTamanho,
} from "./limites";

export type ImagemPronta = {
  /** `Uint8Array<ArrayBuffer>` é o que o campo `Bytes` do Prisma aceita. */
  dados: Uint8Array<ArrayBuffer>;
  tipo: string;
  largura: number;
  altura: number;
  bytes: number;
};

/**
 * Converte o arquivo recebido do navegador na imagem que vai para o banco.
 *
 * Sempre reconverte, mesmo quando o arquivo já é WebP: é o que garante que
 * nada além de pixels chegue ao banco. Um JPEG pode carregar script, dados de
 * localização e o nome de quem tirou a foto embutidos; o sharp descarta tudo
 * isso ao reescrever a imagem.
 *
 * As mesmas medidas de scripts/otimizar-fotos.mjs, para as fotos enviadas pelo
 * painel ficarem iguais às que vieram junto com o código.
 */
export async function prepararImagem(arquivo: File): Promise<ImagemPronta> {
  if (arquivo.size === 0) {
    throw new ErroDeNegocio(`"${arquivo.name}" está vazio.`);
  }

  if (arquivo.size > TAMANHO_MAXIMO_POR_ARQUIVO) {
    throw new ErroDeNegocio(
      `"${arquivo.name}" tem ${formatarTamanho(arquivo.size)} e o limite por foto é ` +
        `${formatarTamanho(TAMANHO_MAXIMO_POR_ARQUIVO)}.`
    );
  }

  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    throw new ErroDeNegocio(
      `"${arquivo.name}" não é um formato aceito. Use JPG, PNG ou WebP.`
    );
  }

  const original = Buffer.from(await arquivo.arrayBuffer());

  try {
    const { data, info } = await sharp(original)
      // `rotate()` sem ângulo aplica a orientação gravada pela câmera. Sem
      // isto, foto tirada em pé pelo celular aparece deitada no site.
      .rotate()
      .resize({
        width: LADO_MAXIMO,
        height: LADO_MAXIMO,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: QUALIDADE, effort: 6 })
      .toBuffer({ resolveWithObject: true });

    return {
      // O `Bytes` do Prisma pede Uint8Array; o sharp devolve Buffer, que é um
      // Uint8Array com outro tipo de ArrayBuffer por baixo.
      dados: new Uint8Array(data),
      tipo: "image/webp",
      largura: info.width,
      altura: info.height,
      bytes: data.length,
    };
  } catch (erro) {
    // O sharp recusa arquivo corrompido ou renomeado (um .txt virado .jpg).
    // Vira erro de negócio para a secretaria ver o nome do arquivo culpado em
    // vez da página de erro genérica.
    console.error(`Falha ao converter "${arquivo.name}":`, erro);
    throw new ErroDeNegocio(
      `Não consegui ler "${arquivo.name}". O arquivo pode estar corrompido.`
    );
  }
}
