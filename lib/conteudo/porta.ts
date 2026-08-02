import type { Album, Aviso, Foto, Resultado, Sessao } from "./tipos";

/**
 * Contrato entre as telas e a fonte dos dados.
 *
 * As telas dependem apenas desta interface; quem implementa é escolhido em
 * `./index.ts` (Supabase quando configurado, memória no modo demonstração).
 * Trocar de banco no futuro significa escrever outra implementação, sem tocar
 * em nenhum componente.
 */
export interface RepositorioConteudo {
  /** true quando as alterações não são gravadas (usado para avisar na tela). */
  readonly modoDemonstracao: boolean;

  // ----- sessão -----
  sessaoAtual(): Promise<Sessao | null>;
  /** Registra um ouvinte de mudanças de sessão e devolve a função de cancelar. */
  observarSessao(aoMudar: (sessao: Sessao | null) => void): () => void;
  entrar(email: string, senha: string): Promise<Resultado>;
  sair(): Promise<void>;

  // ----- avisos -----
  listarAvisos(opcoes?: { somenteAtivos?: boolean }): Promise<Aviso[]>;
  criarAviso(texto: string): Promise<Resultado>;
  editarAviso(id: string, texto: string): Promise<Resultado>;
  alternarAviso(id: string, ativo: boolean): Promise<Resultado>;
  excluirAviso(id: string): Promise<Resultado>;

  // ----- álbuns e fotos -----
  listarAlbuns(): Promise<Album[]>;
  criarAlbum(titulo: string, data: string | null): Promise<Resultado>;
  excluirAlbum(album: Album): Promise<Resultado>;
  enviarFotos(albumId: string, arquivos: File[]): Promise<Resultado>;
  excluirFoto(albumId: string, foto: Foto): Promise<Resultado>;
}
