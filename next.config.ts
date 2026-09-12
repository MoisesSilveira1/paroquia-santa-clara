import type { NextConfig } from "next";

/**
 * Cabeçalhos de segurança enviados em toda resposta.
 *
 * São instruções ao navegador sobre o que ele pode e não pode fazer com esta
 * página. Nenhum deles muda nada no que a paróquia vê; todos fecham portas que
 * hoje estão abertas por omissão.
 */
const CABECALHOS_DE_SEGURANCA = [
  {
    // Impede que o site seja carregado dentro de um `<iframe>` de outra
    // página. Sem isto, alguém publica um site que mostra o nosso por dentro,
    // sobrepõe botões invisíveis e induz a secretaria a clicar no que não quer
    // (o golpe conhecido como "clickjacking").
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    // Faz o navegador respeitar o tipo declarado em vez de adivinhar pelo
    // conteúdo. Uma foto enviada pelo painel que "pareça" HTML não passa a ser
    // executada como página.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Ao sair do site, manda só o domínio de origem — não o endereço completo
    // da página. O caminho de uma tela do painel não interessa a terceiros.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // A paróquia não usa câmera, microfone nem localização. Declarar isso
    // impede que um script de terceiro peça esses acessos em nosso nome.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    // Só vale quando o site já está em HTTPS, que é como ele vai ao ar. Diz ao
    // navegador para nunca mais tentar a versão sem cadeado deste domínio,
    // nem que o usuário digite "http://".
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Não anunciar a versão do Next em toda resposta. Não é segredo, mas
  // também não é preciso entregar de graça qual versão procurar falha.
  poweredByHeader: false,
  // O sharp é um módulo nativo: empacotá-lo junto do código do servidor
  // derruba o processo na primeira conversão. Precisa ser carregado do
  // node_modules como qualquer programa Node.
  serverExternalPackages: ["sharp"],
  experimental: {
    // O padrão do Next é 1 MB, o que recusaria qualquer foto de celular. O
    // teto real de cada envio está em lib/imagens/limites.ts, um pouco abaixo
    // deste — passar daqui derruba a requisição antes de a ação rodar, e aí
    // não sobra mensagem para mostrar na tela.
    serverActions: { bodySizeLimit: "30mb" },
  },
  headers() {
    return Promise.resolve([
      { source: "/:caminho*", headers: CABECALHOS_DE_SEGURANCA },
      {
        // O painel nunca deve ficar guardado no navegador. Sem isto, o botão
        // "voltar" depois de sair mostra a última tela do painel a quem
        // estiver no computador da secretaria.
        source: "/admin/:caminho*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ]);
  },
};

export default nextConfig;
