import {
  BellRing,
  CalendarDays,
  Images,
  LayoutDashboard,
  Mail,
  Megaphone,
  Newspaper,
  ShieldCheck,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { pode, type Papel, type Permissao } from "@/lib/auth/papeis";

// Os papéis moraram aqui até 02/09/2026. Saíram para `lib/auth/papeis.ts`,
// junto com as permissões: menu é assunto de tela, permissão é assunto de
// regra, e o painel inteiro precisa da regra. O reexporte evita quebrar quem
// já importava daqui.
export {
  PAPEIS,
  NOME_DO_PAPEL,
  DESCRICAO_DO_PAPEL,
  type Papel,
} from "@/lib/auth/papeis";

export type ItemDeMenu = {
  href: string;
  rotulo: string;
  icone: LucideIcon;
  /** Quando presente, só enxerga o item quem tem esta permissão. */
  exige?: Permissao;
};

export const MENU: ItemDeMenu[] = [
  { href: "/admin", rotulo: "Painel", icone: LayoutDashboard },
  { href: "/admin/aviso-paroquial", rotulo: "Aviso paroquial", icone: BellRing },
  { href: "/admin/avisos", rotulo: "Avisos da semana", icone: Megaphone },
  { href: "/admin/noticias", rotulo: "Notícias e eventos", icone: Newspaper },
  { href: "/admin/celebracoes", rotulo: "Horários", icone: CalendarDays },
  { href: "/admin/pastorais", rotulo: "Pastorais", icone: Users },
  {
    href: "/admin/coordenadores",
    rotulo: "Coordenadores e equipes",
    icone: UserCog,
    exige: "coordenadores.gerenciar",
  },
  { href: "/admin/galeria", rotulo: "Galeria", icone: Images },
  { href: "/admin/mensagens", rotulo: "Mensagens", icone: Mail },
  {
    href: "/admin/usuarios",
    rotulo: "Usuários",
    icone: ShieldCheck,
    exige: "usuarios.gerenciar",
  },
];

/** Filtra o menu pelo papel de quem está logado. */
export function menuDoPapel(papel: Papel): ItemDeMenu[] {
  return MENU.filter((item) => !item.exige || pode(papel, item.exige));
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
