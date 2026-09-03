import { imagemDoAviso } from "@/lib/servicos/aviso-paroquial";

/**
 * Entrega a imagem de um aviso paroquial. O `id` da rota é o do aviso.
 *
 * Rota separada da `/imagens/<id>` da galeria porque os bytes moram em tabelas
 * diferentes, cada uma apagada em cascata pelo seu dono.
 *
 * Sem `Cache-Control: immutable` aqui, ao contrário da galeria: lá trocar a
 * foto significa criar outra, com id novo; aqui a secretaria substitui a
 * imagem do MESMO aviso, e o endereço continua igual. Guardar para sempre no
 * navegador deixaria a imagem velha na tela de quem já tinha visto o aviso.
 */
export async function GET(
  _requisicao: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const imagem = await imagemDoAviso(id);

  if (!imagem) {
    return new Response("Imagem não encontrada.", { status: 404 });
  }

  return new Response(imagem.dados, {
    headers: {
      "Content-Type": imagem.tipo,
      "Content-Length": String(imagem.dados.length),
      "Cache-Control": "public, max-age=300, must-revalidate",
    },
  });
}
