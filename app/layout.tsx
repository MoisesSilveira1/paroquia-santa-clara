import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { URL_DO_SITE } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

const TITULO =
  "Paróquia Santa Clara e São Francisco de Assis — Jardim Botânico, Brasília-DF";
const DESCRICAO =
  "Site oficial da Paróquia Santa Clara e São Francisco de Assis, Jardim Botânico, Brasília-DF. Horários de missas, confissões, pastorais, notícias, dízimo e contato.";

export const metadata: Metadata = {
  // Endereço usado nos links de compartilhamento (ver lib/site.ts).
  metadataBase: new URL(URL_DO_SITE),
  title: {
    default: TITULO,
    template: "%s | Paróquia Santa Clara e São Francisco de Assis",
  },
  description: DESCRICAO,
  keywords: [
    "paróquia",
    "igreja católica",
    "Jardim Botânico",
    "Brasília",
    "missa",
    "Santa Clara",
    "São Francisco de Assis",
    "Arquidiocese de Brasília",
  ],
  // Cartão exibido ao compartilhar o link (WhatsApp, Facebook, Instagram).
  // A imagem vem de app/opengraph-image.jpg pela convenção do Next.
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Paróquia Santa Clara e São Francisco de Assis",
    title: TITULO,
    description: DESCRICAO,
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRICAO,
  },
};

/**
 * Layout raiz: só o documento HTML, as fontes e os metadados.
 *
 * A moldura visual mora nos grupos de rota — `(site)` para as páginas
 * públicas e `admin/(painel)` para a área da secretaria —, porque as duas
 * têm cabeçalhos completamente diferentes.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${merriweather.variable} h-full antialiased`}
      // O painel escreve `data-tema` aqui antes da hidratação, para não piscar
      // branco em quem usa o tema escuro. É uma divergência deliberada entre o
      // HTML do servidor e o do navegador; sem isto, o React reclama dela.
      suppressHydrationWarning
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
