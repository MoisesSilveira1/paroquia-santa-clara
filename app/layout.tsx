import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

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
  // Define o endereço usado nos links de compartilhamento. Ao publicar,
  // configurar NEXT_PUBLIC_SITE_URL com o domínio definitivo.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${merriweather.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
