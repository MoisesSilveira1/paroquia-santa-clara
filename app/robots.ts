import type { MetadataRoute } from "next";
import { URL_DO_SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // A área da secretaria não deve aparecer em buscas.
      disallow: "/admin",
    },
    sitemap: `${URL_DO_SITE}/sitemap.xml`,
  };
}
