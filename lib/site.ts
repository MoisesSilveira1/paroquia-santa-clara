/**
 * Endereço público do site. Em produção, definir NEXT_PUBLIC_SITE_URL no
 * serviço de hospedagem — sem isso os links de compartilhamento e o sitemap
 * apontam para o computador local.
 */
export const URL_DO_SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/** Páginas públicas, na ordem de importância para os buscadores. */
export const PAGINAS_PUBLICAS = [
  { caminho: "/", prioridade: 1.0, frequencia: "weekly" },
  { caminho: "/horarios", prioridade: 0.9, frequencia: "weekly" },
  { caminho: "/missa-online", prioridade: 0.8, frequencia: "weekly" },
  { caminho: "/noticias", prioridade: 0.8, frequencia: "weekly" },
  { caminho: "/sobre", prioridade: 0.7, frequencia: "monthly" },
  { caminho: "/pastorais", prioridade: 0.7, frequencia: "monthly" },
  { caminho: "/galeria", prioridade: 0.6, frequencia: "weekly" },
  { caminho: "/dizimo", prioridade: 0.6, frequencia: "monthly" },
  { caminho: "/contato", prioridade: 0.6, frequencia: "monthly" },
] as const;
