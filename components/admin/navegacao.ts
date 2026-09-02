import {
  CalendarDays,
  Images,
  LayoutDashboard,
  Mail,
  Megaphone,
  Newspaper,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

/** Papéis de quem usa o painel, do mais restrito ao mais amplo. */
export const PAPEIS = ["SECRETARIA", "SUPER_ADMIN"] as const;
export type Papel = (typeof PAPEIS)[number];

export const NOME_DO_PAPEL: Record<Papel, string> = {
  SECRETARIA: "Secretaria",
  SUPER_ADMIN: "Administrador",
};

export type ItemDeMenu = {
  href: string;
  rotulo: string;
  icone: LucideIcon;
  /** Quando presente, só estes papéis enxergam o item. */
  restrito?: Papel[];
};

export const MENU: ItemDeMenu[] = [
  { href: "/admin", rotulo: "Painel", icone: LayoutDashboard },
  { href: "/admin/avisos", rotulo: "Avisos da semana", icone: Megaphone },
  { href: "/admin/noticias", rotulo: "Notícias e eventos", icone: Newspaper },
  { href: "/admin/celebracoes", rotulo: "Horários", icone: CalendarDays },
  { href: "/admin/pastorais", rotulo: "Pastorais", icone: Users },
  { href: "/admin/galeria", rotulo: "Galeria", icone: Images },
  { href: "/admin/mensagens", rotulo: "Mensagens", icone: Mail },
  {
    href: "/admin/usuarios",
    rotulo: "Usuários",
    icone: ShieldCheck,
    restrito: ["SUPER_ADMIN"],
  },
];

/** Filtra o menu pelo papel de quem está logado. */
export function menuDoPapel(papel: Papel): ItemDeMenu[] {
  return MENU.filter((item) => !item.restrito || item.restrito.includes(papel));
}

/**
 * Descobre qual item corresponde à rota atual.
 *
 * Compara pelo prefixo para que `/admin/noticias/nova` continue destacando
 * "Notícias" — mas `/admin` só casa exato, senão ele venceria todas as rotas.
 */
export function itemAtivo(caminho: string, itens: ItemDeMenu[] = MENU) {
  return itens.find((item) =>
    item.href === "/admin"
      ? caminho === "/admin"
      : caminho === item.href || caminho.startsWith(`${item.href}/`)
  );
}
