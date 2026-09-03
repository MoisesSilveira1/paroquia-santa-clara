/**
 * Extrai o identificador de um vídeo a partir do endereço que a pessoa colou.
 *
 * O vídeo do aviso é exibido num `<iframe>`, e `<iframe>` com endereço vindo
 * de formulário é porta aberta: qualquer página poderia ser embutida dentro do
 * site da paróquia, com a barra de endereços dizendo que é o site da paróquia.
 * Por isso não guardamos a URL para usar direto — extraímos o identificador,
 * conferimos o formato e montamos a URL do YouTube nós mesmos.
 *
 * Aceita as formas que aparecem ao copiar do navegador ou do botão
 * compartilhar: youtube.com/watch?v=, youtu.be/, /embed/, /live/ e /shorts/.
 *
 * Devolve `null` quando não reconhece — e aí a tela não mostra vídeo nenhum.
 */

/** Identificador do YouTube: 11 caracteres de um alfabeto conhecido. */
const FORMATO_DO_ID = /^[A-Za-z0-9_-]{11}$/;

const DOMINIOS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "www.youtu.be",
]);

/** Caminhos em que o identificador é o primeiro trecho depois do nome. */
const CAMINHOS_COM_ID = ["embed", "live", "shorts", "v"];

export function idDoVideo(endereco: string | null | undefined): string | null {
  if (!endereco) return null;

  let url: URL;
  try {
    url = new URL(endereco.trim());
  } catch {
    return null;
  }

  // Só http(s): um `javascript:` ou `data:` nunca deve chegar a um `src`.
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!DOMINIOS.has(url.hostname)) return null;

  const partes = url.pathname.split("/").filter(Boolean);

  // youtu.be/<id>
  if (url.hostname.endsWith("youtu.be")) return conferir(partes[0]);

  // youtube.com/watch?v=<id>
  if (partes[0] === "watch") return conferir(url.searchParams.get("v"));

  // youtube.com/embed/<id>, /live/<id>, /shorts/<id>
  if (CAMINHOS_COM_ID.includes(partes[0])) return conferir(partes[1]);

  return null;
}

/** Endereço pronto para o `src` do `<iframe>`, ou `null`. */
export function urlDeIncorporacao(endereco: string | null | undefined): string | null {
  const id = idDoVideo(endereco);
  // `youtube-nocookie` não guarda o histórico de quem só abriu a página do
  // aviso sem dar play.
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

function conferir(id: string | null | undefined): string | null {
  return id && FORMATO_DO_ID.test(id) ? id : null;
}
