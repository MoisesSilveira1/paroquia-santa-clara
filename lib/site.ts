/**
 * Endereço público do site. Em produção, definir NEXT_PUBLIC_SITE_URL no
 * serviço de hospedagem — sem isso os links de compartilhamento e o sitemap
 * apontam para o computador local.
 */
export const URL_DO_SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/**
 * Páginas públicas, na ordem de importância para os buscadores.
 *
 * TODA página nova do site tem de entrar aqui. É esta lista que vira o
 * sitemap.xml, e o que não está nela o Google só encontra por sorte, seguindo
 * link de outra página. Três páginas ficaram de fora entre 03/09 e 10/09/2026
 * exatamente por isso — foram criadas e ninguém voltou aqui.
 *
 * As páginas de cada pastoral (/pastorais/<slug>) não entram nesta lista
 * porque não são fixas: vêm do banco, e o sitemap as monta à parte.
 */
export const PAGINAS_PUBLICAS = [
  { caminho: "/", prioridade: 1.0, frequencia: "weekly" },
  { caminho: "/horarios", prioridade: 0.9, frequencia: "weekly" },
  { caminho: "/missa-online", prioridade: 0.8, frequencia: "weekly" },
  { caminho: "/noticias", prioridade: 0.8, frequencia: "weekly" },
  // O folheto das leituras e o calendário litúrgico mudam toda semana e são
  // o que mais gente procura depois do horário da missa.
  { caminho: "/povo-de-deus", prioridade: 0.8, frequencia: "weekly" },
  { caminho: "/calendario-liturgico", prioridade: 0.7, frequencia: "weekly" },
  { caminho: "/sobre", prioridade: 0.7, frequencia: "monthly" },
  { caminho: "/pastorais", prioridade: 0.7, frequencia: "monthly" },
  { caminho: "/catequese", prioridade: 0.7, frequencia: "monthly" },
  { caminho: "/galeria", prioridade: 0.6, frequencia: "weekly" },
  { caminho: "/dizimo", prioridade: 0.6, frequencia: "monthly" },
  { caminho: "/contato", prioridade: 0.6, frequencia: "monthly" },
  { caminho: "/aviso-paroquial", prioridade: 0.5, frequencia: "weekly" },
] as const;
