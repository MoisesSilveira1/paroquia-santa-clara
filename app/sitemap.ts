import type { MetadataRoute } from "next";
import { PAGINAS_PUBLICAS, URL_DO_SITE } from "@/lib/site";

/** Lista de páginas entregue ao Google para indexar o site. */
export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();

  return PAGINAS_PUBLICAS.map(({ caminho, prioridade, frequencia }) => ({
    url: `${URL_DO_SITE}${caminho}`,
    lastModified: agora,
    changeFrequency: frequencia,
    priority: prioridade,
  }));
}
