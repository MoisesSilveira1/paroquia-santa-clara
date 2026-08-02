import type { RepositorioConteudo } from "./porta";
import { repositorioMemoria } from "./repositorio-memoria";
import { criarRepositorioSupabase } from "./repositorio-supabase";

export type { RepositorioConteudo } from "./porta";
export type { Album, Aviso, Foto, Sessao } from "./tipos";

/**
 * Escolhe onde o conteúdo do site é guardado, a partir das variáveis de
 * ambiente. Sem Supabase configurado o site funciona em modo demonstração,
 * o que permite apresentá-lo antes de ter o banco no ar.
 */
function escolherRepositorio(): RepositorioConteudo {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url && !chave) return repositorioMemoria;

  // Configuração pela metade é erro de instalação: avisa alto em vez de cair
  // silenciosamente no modo demonstração e fingir que está tudo certo.
  if (!url || !chave) {
    throw new Error(
      "Configuração do Supabase incompleta: defina NEXT_PUBLIC_SUPABASE_URL e " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local (ou remova as duas " +
        "para usar o modo demonstração). Veja o README."
    );
  }

  if (!URL.canParse(url)) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL não é um endereço válido: "${url}". ` +
        'O formato esperado é "https://SEU-PROJETO.supabase.co".'
    );
  }

  return criarRepositorioSupabase(url, chave);
}

export const repositorio = escolherRepositorio();

/** true quando as alterações do painel não são gravadas. */
export const MODO_DEMONSTRACAO = repositorio.modoDemonstracao;
