import { paroquia, youtube } from "@/lib/dados";
import { URL_DO_SITE } from "@/lib/site";

/**
 * Dados estruturados (schema.org) que ajudam o Google a exibir a paróquia na
 * busca com endereço, telefone e horário de atendimento — em vez de apenas um
 * link. Usa somente informações que já são públicas no site.
 */
export default function DadosEstruturados() {
  const { enderecoEstruturado: endereco } = paroquia;

  const dados = {
    "@context": "https://schema.org",
    "@type": "Church",
    name: paroquia.nome,
    url: URL_DO_SITE,
    image: `${URL_DO_SITE}/opengraph-image.jpg`,
    telephone: paroquia.telefone,
    email: paroquia.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: endereco.logradouro,
      addressLocality: `${endereco.bairro}, ${endereco.cidade}`,
      addressRegion: endereco.estado,
      postalCode: endereco.cep,
      addressCountry: endereco.pais,
    },
    parentOrganization: {
      "@type": "Organization",
      name: "Arquidiocese de Brasília",
      url: "https://arqbrasilia.com.br",
    },
    sameAs: [youtube.canalUrl],
  };

  return (
    <script
      type="application/ld+json"
      // O escape de "<" evita injeção de HTML, conforme a recomendação do Next.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(dados).replace(/</g, "\\u003c"),
      }}
    />
  );
}
