import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
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
};

export default nextConfig;
