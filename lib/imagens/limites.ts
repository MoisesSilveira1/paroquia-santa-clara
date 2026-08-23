// Limites do envio de fotos pelo painel.
//
// Ficam num arquivo sem `server-only` porque a tela também precisa deles: é
// melhor avisar "essa foto é grande demais" antes de subir 20 MB pela internet
// da secretaria do que deixar o servidor recusar depois da espera.

/** Formatos que o conversor entende. HEIC do iPhone fica de fora — ver abaixo. */
export const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Valor do `accept` do seletor de arquivos. */
export const ACEITE = TIPOS_ACEITOS.join(",");

export const TAMANHO_MAXIMO_POR_ARQUIVO = 15 * 1024 * 1024;

/**
 * Teto do envio inteiro, um pouco abaixo do limite configurado em
 * `next.config.ts`. Passar do limite do Next derruba a requisição antes de a
 * ação rodar, e aí não há mensagem amigável para mostrar.
 */
export const TAMANHO_MAXIMO_POR_ENVIO = 28 * 1024 * 1024;

export const MAXIMO_DE_ARQUIVOS = 12;

/** Maior lado da imagem guardada. Acima disso ninguém nota a diferença na tela. */
export const LADO_MAXIMO = 1400;

export const QUALIDADE = 78;

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Confere o lote antes de enviar. Devolve a mensagem do primeiro problema ou
 * `null` se estiver tudo certo.
 *
 * A mesma função roda na tela e no servidor: a da tela evita a espera à toa, a
 * do servidor é a que de fato protege — o formulário pode ser enviado sem ela.
 */
export function conferirLote(
  arquivos: { name: string; size: number; type: string }[]
): string | null {
  if (arquivos.length === 0) return "Escolha ao menos uma foto.";

  if (arquivos.length > MAXIMO_DE_ARQUIVOS) {
    return `Envie no máximo ${MAXIMO_DE_ARQUIVOS} fotos por vez (você escolheu ${arquivos.length}).`;
  }

  for (const arquivo of arquivos) {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      // O .HEIC do iPhone é o caso comum aqui, e a saída é sempre a mesma:
      // mandar por e-mail/WhatsApp converte para JPEG no caminho.
      return `"${arquivo.name}" não é um formato aceito. Use JPG, PNG ou WebP — fotos de iPhone (.HEIC) precisam ser convertidas antes.`;
    }
    if (arquivo.size > TAMANHO_MAXIMO_POR_ARQUIVO) {
      return `"${arquivo.name}" tem ${formatarTamanho(arquivo.size)} e o limite por foto é ${formatarTamanho(TAMANHO_MAXIMO_POR_ARQUIVO)}.`;
    }
  }

  const total = arquivos.reduce((soma, arquivo) => soma + arquivo.size, 0);
  if (total > TAMANHO_MAXIMO_POR_ENVIO) {
    return `As fotos somam ${formatarTamanho(total)} e o limite por envio é ${formatarTamanho(TAMANHO_MAXIMO_POR_ENVIO)}. Envie em duas levas.`;
  }

  return null;
}
