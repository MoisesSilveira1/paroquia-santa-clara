import { imagemDaFoto } from "@/lib/servicos/galeria";

/**
 * Entrega a imagem de uma foto enviada pelo painel.
 *
 * As fotos ficam guardadas no banco (ver o modelo `Imagem` em
 * prisma/schema.prisma), então precisam de um endereço próprio para o `src`
 * das telas. O `id` da rota é o da foto.
 *
 * A rota é pública, como a galeria. Álbuns ainda em rascunho não aparecem em
 * lugar nenhum do site, e o id é uma sequência sorteada de 25 caracteres —
 * ninguém chega a uma foto por tentativa. Filtrar por "álbum publicado" aqui
 * quebraria justamente a conferência das fotos antes de publicar o álbum.
 */
export async function GET(
  _requisicao: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const imagem = await imagemDaFoto(id);

  if (!imagem) {
    return new Response("Imagem não encontrada.", { status: 404 });
  }

  return new Response(imagem.dados, {
    headers: {
      "Content-Type": imagem.tipo,
      "Content-Length": String(imagem.dados.length),
      // Os bytes de uma foto nunca mudam: trocar a imagem significa apagar e
      // enviar outra, que ganha um id novo. Por isso pode ficar guardada para
      // sempre no navegador e na hospedagem.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
