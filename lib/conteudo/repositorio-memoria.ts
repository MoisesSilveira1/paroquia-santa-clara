import { albunsDemo, avisosSemana } from "@/lib/dados";
import type { RepositorioConteudo } from "./porta";
import type { Album, Aviso, Foto, Sessao } from "./tipos";

/**
 * Implementação de demonstração: guarda tudo na memória do navegador.
 *
 * Usada quando o Supabase ainda não foi configurado. Serve para apresentar o
 * painel funcionando de verdade — inclusive com o aviso criado aparecendo na
 * página inicial — sem gravar nada. Ao recarregar a página, tudo volta ao
 * conteúdo inicial.
 */

// Estado no escopo do módulo: sobrevive à troca de páginas, some no F5.
let avisos: Aviso[] = avisosSemana.map((texto, i) => ({
  id: `aviso-${i}`,
  texto,
  ativo: true,
}));

let albuns: Album[] = albunsDemo.map((album, i) => ({
  id: `album-${i}`,
  titulo: album.titulo,
  data: album.data.split("/").reverse().join("-"),
  fotos: album.fotos.map((url, j) => ({
    id: `foto-${i}-${j}`,
    url,
    legenda: null,
  })),
}));

let sessao: Sessao | null = null;
const ouvintes = new Set<(sessao: Sessao | null) => void>();

function avisarOuvintes() {
  for (const ouvinte of ouvintes) ouvinte(sessao);
}

function novoId() {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`;
}

export const repositorioMemoria: RepositorioConteudo = {
  modoDemonstracao: true,

  async sessaoAtual() {
    return sessao;
  },

  observarSessao(aoMudar) {
    ouvintes.add(aoMudar);
    return () => ouvintes.delete(aoMudar);
  },

  async entrar(email) {
    // Demonstração: qualquer credencial entra.
    sessao = { email };
    avisarOuvintes();
    return {};
  },

  async sair() {
    sessao = null;
    avisarOuvintes();
  },

  async listarAvisos(opcoes) {
    return opcoes?.somenteAtivos ? avisos.filter((a) => a.ativo) : [...avisos];
  },

  async criarAviso(texto) {
    avisos = [{ id: novoId(), texto, ativo: true }, ...avisos];
    return {};
  },

  async editarAviso(id, texto) {
    avisos = avisos.map((a) => (a.id === id ? { ...a, texto } : a));
    return {};
  },

  async alternarAviso(id, ativo) {
    avisos = avisos.map((a) => (a.id === id ? { ...a, ativo } : a));
    return {};
  },

  async excluirAviso(id) {
    avisos = avisos.filter((a) => a.id !== id);
    return {};
  },

  async listarAlbuns() {
    return albuns.map((album) => ({ ...album, fotos: [...album.fotos] }));
  },

  async criarAlbum(titulo, data) {
    albuns = [{ id: novoId(), titulo, data, fotos: [] }, ...albuns];
    return {};
  },

  async excluirAlbum(album) {
    albuns = albuns.filter((a) => a.id !== album.id);
    return {};
  },

  async enviarFotos(albumId, arquivos) {
    const novas: Foto[] = arquivos.map((arquivo) => ({
      id: novoId(),
      url: URL.createObjectURL(arquivo),
      legenda: null,
    }));
    albuns = albuns.map((a) =>
      a.id === albumId ? { ...a, fotos: [...a.fotos, ...novas] } : a
    );
    return {};
  },

  async excluirFoto(albumId, foto) {
    albuns = albuns.map((a) =>
      a.id === albumId ? { ...a, fotos: a.fotos.filter((f) => f.id !== foto.id) } : a
    );
    return {};
  },
};
