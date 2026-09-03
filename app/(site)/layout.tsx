import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import DadosEstruturados from "@/components/DadosEstruturados";
import AvisoDeEntrada from "@/components/AvisoDeEntrada";
import { avisoEmCartaz } from "@/lib/servicos/aviso-paroquial";
import { urlDeIncorporacao } from "@/lib/video/youtube";

/**
 * Moldura do site público: cabeçalho, rodapé e botão do WhatsApp.
 *
 * Foi separada da raiz quando o painel administrativo ganhou moldura própria —
 * o menu da paróquia e o botão de WhatsApp não fazem sentido sobre a área de
 * trabalho da secretaria, e antes apareciam lá porque viviam no layout raiz.
 */
export default async function LayoutSite({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fica no layout, e não na página inicial: quem chega por um link de
  // notícia ou pela busca também precisa ver o aviso. O painel tem moldura
  // própria e não passa por aqui — a secretaria trabalha sem a janela na cara.
  const aviso = await avisoEmCartaz();

  return (
    <div className="flex min-h-full flex-col">
      <DadosEstruturados />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      {aviso && (
        <AvisoDeEntrada
          aviso={aviso}
          urlDoVideo={urlDeIncorporacao(aviso.videoUrl)}
        />
      )}
    </div>
  );
}
