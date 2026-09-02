import "server-only";

import { db } from "@/lib/db";
import { contarAvisosAtivos } from "./avisos";
import { contarCelebracoesAtivas } from "./celebracoes";
import { contarFotos } from "./galeria";
import { contarMensagensNovas } from "./mensagens";
import { contarNoticias } from "./noticias";
import { contarPastoraisAtivas } from "./pastorais";

/**
 * Números e listas da tela inicial do painel.
 *
 * Tudo em paralelo: são consultas independentes, e esperar uma de cada vez
 * deixaria a abertura do painel mais lenta sem motivo.
 */
export async function resumoDoPainel() {
  const [
    avisosAtivos,
    noticias,
    celebracoes,
    pastorais,
    fotos,
    mensagensNovas,
    ultimasMensagens,
    ultimasNoticias,
  ] = await Promise.all([
    contarAvisosAtivos(),
    contarNoticias(),
    contarCelebracoesAtivas(),
    contarPastoraisAtivas(),
    contarFotos(),
    contarMensagensNovas(),
    db.mensagem.findMany({
      where: { status: "NOVA" },
      select: { id: true, nome: true, assunto: true, criadoEm: true },
      orderBy: { criadoEm: "desc" },
      take: 5,
    }),
    db.noticia.findMany({
      select: { id: true, titulo: true, status: true, atualizadoEm: true },
      orderBy: { atualizadoEm: "desc" },
      take: 5,
    }),
  ]);

  return {
    avisosAtivos,
    noticias,
    celebracoes,
    pastorais,
    fotos,
    mensagensNovas,
    ultimasMensagens,
    ultimasNoticias,
  };
}
