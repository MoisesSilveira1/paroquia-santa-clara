// Tipos do conteúdo editável do site (avisos e álbuns de fotos).
// São independentes de onde os dados moram — o Supabase é apenas um detalhe
// de implementação, trocável sem que as telas precisem mudar.

export type Aviso = {
  id: string;
  texto: string;
  ativo: boolean;
};

export type Foto = {
  id: string;
  /** Endereço pronto para uso no `src` de uma imagem. */
  url: string;
  legenda: string | null;
};

export type Album = {
  id: string;
  titulo: string;
  /** Data do evento no formato aaaa-mm-dd, ou null quando não informada. */
  data: string | null;
  fotos: Foto[];
};

export type Sessao = {
  email: string;
};

export type Resultado = { erro?: string };
