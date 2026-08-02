import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RepositorioConteudo } from "./porta";
import type { Album, Aviso, Foto } from "./tipos";

const BUCKET = "fotos";

/** Formato das linhas como vêm do banco (ver supabase/schema.sql). */
type LinhaAviso = { id: string; texto: string; ativo: boolean };
type LinhaFoto = { id: string; path: string; legenda: string | null; created_at: string };
type LinhaAlbum = {
  id: string;
  titulo: string;
  data_evento: string | null;
  fotos: LinhaFoto[];
};

function mensagemDeErro(acao: string) {
  return `Não foi possível ${acao}. Verifique sua conexão e tente de novo.`;
}

export function criarRepositorioSupabase(
  url: string,
  chaveAnonima: string
): RepositorioConteudo {
  const cliente: SupabaseClient = createClient(url, chaveAnonima);

  const urlPublica = (caminho: string) =>
    cliente.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;

  const paraFoto = (linha: LinhaFoto): Foto => ({
    id: linha.id,
    url: urlPublica(linha.path),
    legenda: linha.legenda,
  });

  // O caminho no Storage não faz parte do domínio, mas é preciso para apagar
  // o arquivo. Guardamos a correspondência aqui dentro do adaptador.
  const caminhoPorFoto = new Map<string, string>();

  return {
    modoDemonstracao: false,

    async sessaoAtual() {
      const { data } = await cliente.auth.getSession();
      const email = data.session?.user.email;
      return email ? { email } : null;
    },

    observarSessao(aoMudar) {
      const { data } = cliente.auth.onAuthStateChange((_evento, sessao) => {
        const email = sessao?.user.email;
        aoMudar(email ? { email } : null);
      });
      return () => data.subscription.unsubscribe();
    },

    async entrar(email, senha) {
      const { error } = await cliente.auth.signInWithPassword({
        email,
        password: senha,
      });
      return error ? { erro: "E-mail ou senha incorretos. Tente novamente." } : {};
    },

    async sair() {
      await cliente.auth.signOut();
    },

    async listarAvisos(opcoes) {
      let consulta = cliente.from("avisos").select("id, texto, ativo");
      if (opcoes?.somenteAtivos) consulta = consulta.eq("ativo", true);

      const { data, error } = await consulta.order("created_at", { ascending: false });
      if (error) throw new Error(mensagemDeErro("carregar os avisos"));

      return (data as LinhaAviso[]).map(
        ({ id, texto, ativo }): Aviso => ({ id, texto, ativo })
      );
    },

    async criarAviso(texto) {
      const { error } = await cliente.from("avisos").insert({ texto });
      return error ? { erro: mensagemDeErro("salvar o aviso") } : {};
    },

    async editarAviso(id, texto) {
      const { error } = await cliente.from("avisos").update({ texto }).eq("id", id);
      return error ? { erro: mensagemDeErro("salvar a alteração") } : {};
    },

    async alternarAviso(id, ativo) {
      const { error } = await cliente.from("avisos").update({ ativo }).eq("id", id);
      return error ? { erro: mensagemDeErro("alterar o aviso") } : {};
    },

    async excluirAviso(id) {
      const { error } = await cliente.from("avisos").delete().eq("id", id);
      return error ? { erro: mensagemDeErro("excluir o aviso") } : {};
    },

    async listarAlbuns() {
      const { data, error } = await cliente
        .from("albuns")
        .select("id, titulo, data_evento, fotos(id, path, legenda, created_at)")
        .order("data_evento", { ascending: false });
      if (error) throw new Error(mensagemDeErro("carregar os álbuns"));

      return (data as LinhaAlbum[]).map((linha): Album => {
        const fotos = [...linha.fotos].sort((a, b) =>
          a.created_at.localeCompare(b.created_at)
        );
        for (const foto of fotos) caminhoPorFoto.set(foto.id, foto.path);
        return {
          id: linha.id,
          titulo: linha.titulo,
          data: linha.data_evento,
          fotos: fotos.map(paraFoto),
        };
      });
    },

    async criarAlbum(titulo, data) {
      const { error } = await cliente
        .from("albuns")
        .insert({ titulo, data_evento: data });
      return error ? { erro: mensagemDeErro("criar o álbum") } : {};
    },

    async excluirAlbum(album) {
      const caminhos = album.fotos
        .map((foto) => caminhoPorFoto.get(foto.id))
        .filter((caminho): caminho is string => Boolean(caminho));
      if (caminhos.length > 0) {
        await cliente.storage.from(BUCKET).remove(caminhos);
      }
      const { error } = await cliente.from("albuns").delete().eq("id", album.id);
      return error ? { erro: mensagemDeErro("excluir o álbum") } : {};
    },

    async enviarFotos(albumId, arquivos) {
      for (const arquivo of arquivos) {
        const extensao = arquivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const caminho = `${albumId}/${crypto.randomUUID()}.${extensao}`;

        const { error: erroEnvio } = await cliente.storage
          .from(BUCKET)
          .upload(caminho, arquivo);
        if (erroEnvio) {
          return { erro: `Falha ao enviar "${arquivo.name}". Tente novamente.` };
        }

        const { error: erroRegistro } = await cliente
          .from("fotos")
          .insert({ album_id: albumId, path: caminho });
        if (erroRegistro) {
          // Não deixa arquivo órfão no Storage se o registro falhar.
          await cliente.storage.from(BUCKET).remove([caminho]);
          return { erro: `Falha ao registrar "${arquivo.name}". Tente novamente.` };
        }
      }
      return {};
    },

    async excluirFoto(_albumId, foto) {
      const caminho = caminhoPorFoto.get(foto.id);
      if (caminho) await cliente.storage.from(BUCKET).remove([caminho]);
      const { error } = await cliente.from("fotos").delete().eq("id", foto.id);
      return error ? { erro: mensagemDeErro("excluir a foto") } : {};
    },
  };
}
