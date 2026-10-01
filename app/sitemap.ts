import type { MetadataRoute } from "next";
import { PAGINAS_PUBLICAS, URL_DO_SITE } from "@/lib/site";
import { pastoraisAtivas } from "@/lib/servicos/pastorais";

/**
 * Lista de páginas entregue ao Google para indexar o site.
 *
 * Junta duas origens: as páginas fixas, que estão em lib/site.ts, e a página
 * de cada pastoral, que vem do banco. Sem a segunda parte, as oito páginas de
 * pastoral só seriam descobertas por quem chegasse a /pastorais primeiro — e
 * quem busca "pastoral do dízimo jardim botânico" nunca cairia direto nela.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();

  const fixas = PAGINAS_PUBLICAS.map(({ caminho, prioridade, frequencia }) => ({
    url: `${URL_DO_SITE}${caminho}`,
    lastModified: agora,
    changeFrequency: frequencia,
    priority: prioridade,
  }));

  // Uma pastoral fora do ar não entra: `pastoraisAtivas` já filtra por isso, e
  // é a mesma consulta que a página pública usa — não há como as duas
  // discordarem sobre o que existe.
  const pastorais = (await pastoraisAtivas()).map((pastoral) => ({
    url: `${URL_DO_SITE}/pastorais/${pastoral.slug}`,
    lastModified: agora,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...fixas, ...pastorais];
}
