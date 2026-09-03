import "server-only";

/**
 * Lê as edições do folheto "O Povo de Deus" no site da Arquidiocese.
 *
 * Por que ler de lá em vez de guardar cópias aqui:
 *
 * 1. O folheto é publicação da Arquidiocese de Brasília, e o rodapé do site
 *    deles diz "todos os direitos reservados". Republicar o PDF na paróquia
 *    seria redistribuir obra de terceiro — os textos litúrgicos e os cantos
 *    ainda têm outros donos por trás.
 * 2. Cópia envelhece. Quando a Arquidiocese corrige um arquivo (acontece: há
 *    edições marcadas "Prova Final"), a correção chega sozinha ao nosso site.
 *    Uma cópia ficaria errada até alguém perceber.
 * 3. O pedido era "sempre atualizado". Assim ninguém da secretaria precisa
 *    lembrar de nada toda semana.
 *
 * Como funciona: a página deles monta um calendário com um widget do
 * Elementor, e os dados de todas as edições vêm no HTML, numa linha
 * `window['HaECjson...'] = [...]`. É esse trecho que lemos.
 *
 * Isso depende do formato da página deles, que pode mudar sem aviso. Por isso
 * toda falha aqui devolve lista vazia em vez de derrubar a página — a tela
 * mostra o caminho para o site da Arquidiocese e continua útil.
 */

export const PAGINA_DA_ARQUIDIOCESE = "https://arqbrasilia.com.br/o-povo-de-deus-2/";

/** De uma hora em uma hora. O folheto muda uma vez por semana. */
const VALIDADE_EM_SEGUNDOS = 3600;

export type TipoDeArquivo =
  | "folheto"
  | "celular"
  | "telao"
  | "partituras"
  | "outro";

export type ArquivoDoFolheto = {
  tipo: TipoDeArquivo;
  rotulo: string;
  url: string;
};

export type EdicaoDoFolheto = {
  /** "2026-09-06" — como vem de lá, já serve para ordenar e comparar. */
  data: string;
  titulo: string;
  arquivos: ArquivoDoFolheto[];
};

export async function buscarEdicoes(): Promise<EdicaoDoFolheto[]> {
  try {
    const resposta = await fetch(PAGINA_DA_ARQUIDIOCESE, {
      next: { revalidate: VALIDADE_EM_SEGUNDOS },
      headers: { "User-Agent": "site-paroquia-santa-clara" },
    });
    if (!resposta.ok) {
      console.error(`Povo de Deus: a Arquidiocese respondeu ${resposta.status}.`);
      return [];
    }

    const bruto = extrairJson(await resposta.text());
    if (!bruto) {
      console.error("Povo de Deus: não achei os dados do calendário na página.");
      return [];
    }

    return interpretar(bruto);
  } catch (erro) {
    console.error("Povo de Deus: falha ao consultar a Arquidiocese.", erro);
    return [];
  }
}

/**
 * Recorta o array que vem depois de `window['HaECjson…'] =`.
 *
 * Conta colchetes em vez de usar expressão regular: as descrições são HTML e
 * podem conter `]`, o que faria uma expressão preguiçosa cortar no meio. O
 * contador ignora o que está dentro de aspas e respeita a barra de escape.
 */
function extrairJson(html: string): unknown[] | null {
  const marca = html.match(/window\[['"]HaECjson[^'"\]]*['"]\]\s*=\s*/);
  if (!marca || marca.index === undefined) return null;

  const inicio = marca.index + marca[0].length;
  if (html[inicio] !== "[") return null;

  let profundidade = 0;
  let dentroDeAspas = false;
  let escapando = false;

  for (let i = inicio; i < html.length; i++) {
    const c = html[i];

    if (escapando) {
      escapando = false;
      continue;
    }
    if (c === "\\") {
      escapando = true;
      continue;
    }
    if (c === '"') {
      dentroDeAspas = !dentroDeAspas;
      continue;
    }
    if (dentroDeAspas) continue;

    if (c === "[") profundidade++;
    else if (c === "]") {
      profundidade--;
      if (profundidade === 0) {
        try {
          const valor = JSON.parse(html.slice(inicio, i + 1));
          return Array.isArray(valor) ? valor : null;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

function interpretar(bruto: unknown[]): EdicaoDoFolheto[] {
  const edicoes: EdicaoDoFolheto[] = [];

  for (const item of bruto) {
    if (typeof item !== "object" || item === null) continue;
    const registro = item as Record<string, unknown>;

    const data = registro.start;
    const titulo = registro.title;
    if (typeof data !== "string" || !DATA_ISO.test(data)) continue;
    if (typeof titulo !== "string" || titulo.trim() === "") continue;

    const arquivos = extrairArquivos(
      typeof registro.description === "string" ? registro.description : ""
    );

    edicoes.push({
      data,
      titulo: titulo.trim().slice(0, 120),
      arquivos,
    });
  }

  return edicoes.sort((a, b) => a.data.localeCompare(b.data));
}

const LIGACAO = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

/**
 * Tira os links da descrição.
 *
 * Nem toda edição tem todos os arquivos: quando a Arquidiocese ainda não
 * publicou o folheto da semana, o texto "DOWNLOAD DO FOLHETO" aparece sem
 * link nenhum. Só entram aqui os que de fato têm endereço — melhor a tela
 * dizer que ainda não saiu do que oferecer um botão que não leva a lugar
 * algum.
 */
function extrairArquivos(descricao: string): ArquivoDoFolheto[] {
  const arquivos: ArquivoDoFolheto[] = [];

  for (const achado of descricao.matchAll(LIGACAO)) {
    const url = achado[1].trim();
    if (!daArquidiocese(url)) continue;

    const rotulo = achado[2]
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!rotulo) continue;

    arquivos.push({
      tipo: classificar(rotulo),
      rotulo: rotulo.slice(0, 60),
      url,
    });
  }

  return arquivos;
}

/**
 * Só aceita endereço do próprio site da Arquidiocese.
 *
 * O que chega aqui é HTML de um site que não é nosso. Se um dia aquela página
 * for adulterada, sem esta peneira o site da paróquia passaria a exibir os
 * links de quem a adulterou — com a nossa cara e o nosso endereço na barra do
 * navegador dando credibilidade a eles.
 */
function daArquidiocese(endereco: string): boolean {
  try {
    const url = new URL(endereco);
    return url.protocol === "https:" && url.hostname === "arqbrasilia.com.br";
  } catch {
    return false;
  }
}

function classificar(rotulo: string): TipoDeArquivo {
  const r = rotulo.toLowerCase();
  if (r.includes("celular")) return "celular";
  if (r.includes("telão") || r.includes("telao")) return "telao";
  if (r.includes("partitura")) return "partituras";
  if (r.includes("folheto")) return "folheto";
  return "outro";
}

/**
 * Separa as edições em "a próxima" e as demais.
 *
 * A destacada é a próxima celebração a acontecer — inclusive hoje, se hoje for
 * dia de folheto. Numa quinta-feira quem procura o folheto quer o do domingo
 * que vem, não o do domingo que passou.
 */
export function organizar(edicoes: EdicaoDoFolheto[], hoje = new Date()) {
  const referencia = paraTexto(hoje);
  const futuras = edicoes.filter((e) => e.data >= referencia);
  const passadas = edicoes.filter((e) => e.data < referencia);

  return {
    proxima: futuras[0] ?? null,
    seguintes: futuras.slice(1, 5),
    // As mais recentes primeiro: quem perdeu a missa procura a semana passada.
    anteriores: passadas.slice(-4).reverse(),
  };
}

function paraTexto(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}
