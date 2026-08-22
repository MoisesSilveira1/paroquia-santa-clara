import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import DadosEstruturados from "@/components/DadosEstruturados";

/**
 * Moldura do site público: cabeçalho, rodapé e botão do WhatsApp.
 *
 * Foi separada da raiz quando o painel administrativo ganhou moldura própria —
 * o menu da paróquia e o botão de WhatsApp não fazem sentido sobre a área de
 * trabalho da secretaria, e antes apareciam lá porque viviam no layout raiz.
 */
export default function LayoutSite({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <DadosEstruturados />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
