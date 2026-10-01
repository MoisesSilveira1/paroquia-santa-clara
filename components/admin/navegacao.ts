import {
  BellRing,
  BookOpenText,
  CalendarRange,
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

/**
 * Alcances que não se deduzem do papel.
 *
 * Papel responde "esta conta pode mexer em equipe de pastoral?"; alcance
 * responde "em QUAL". A diferença só o banco sabe — é preciso olhar a que
 * pastoral a conta está ligada. Por isso o alcance é calculado no servidor
 * (ver o layout do painel) e chega aqui pronto, como uma lista.
 *
 * Sem isto, o item da Catequese apareceria para o coordenador da Liturgia, que
 * tem a mesma permissão e clicaria num "Área restrita".
 */
export type Alcance = "catequese";

export type ItemDeMenu = {
  href: string;
  rotulo: string;
  icone: LucideIcon;
  /** Quando presente, só enxerga o item quem tem esta permissão. */
  exige?: Permissao;
  /** Quando presente, só enxerga quem tiver este alcance concedido. */
  exigeAlcance?: Alcance;
};

export const MENU: ItemDeMenu[] = [
  { href: "/admin", rotulo: "Painel", icone: LayoutDashboard },
  { href: "/admin/aviso-paroquial", rotulo: "Aviso paroquial", icone: BellRing, exige: "conteudo.editar" },
  { href: "/admin/avisos", rotulo: "Avisos da semana", icone: Megaphone, exige: "conteudo.editar" },
  { href: "/admin/noticias", rotulo: "Notícias e eventos", icone: Newspaper, exige: "conteudo.editar" },
  { href: "/admin/celebracoes", rotulo: "Horários", icone: CalendarDays, exige: "conteudo.editar" },
  { href: "/admin/pastorais", rotulo: "Pastorais", icone: Users, exige: "conteudo.editar" },
  {
    href: "/admin/catequese",
    rotulo: "Catequese",
    icone: BookOpenText,
    // A mesma permissão de equipe: a catequese É uma pastoral, e quem cuida
    // dela é a secretaria ou o coordenador ligado a ela. O `exigeAlcance` é o
    // que impede o item de aparecer para o coordenador de outro grupo.
    exige: "equipe.propria",
    exigeAlcance: "catequese",
  },
  {
    href: "/admin/agenda",
    rotulo: "Agenda",
    icone: CalendarRange,
    exige: "agenda.propria",
  },
  {
    href: "/admin/coordenadores",
    rotulo: "Coordenadores e equipes",
    icone: UserCog,
    // `equipe.propria`, e não `coordenadores.gerenciar`: o coordenador de
    // pastoral também entra aqui — só que a tela dele traz a equipe dele.
    exige: "equipe.propria",
  },
  { href: "/admin/galeria", rotulo: "Galeria", icone: Images, exige: "conteudo.editar" },
  { href: "/admin/mensagens", rotulo: "Mensagens", icone: Mail, exige: "conteudo.editar" },
  {
    href: "/admin/usuarios",
    rotulo: "Usuários",
    icone: ShieldCheck,
    exige: "usuarios.gerenciar",
  },
];

/**
 * Filtra o menu pelo papel de quem está logado e pelos alcances concedidos.
 *
 * Esconder o item NÃO é proteção — quem protege é o `exigirPermissao` das
 * ações e o `alcanca…` dos serviços. É cortesia: menu que leva a porta
 * trancada faz a pessoa pensar que o site quebrou.
 */
export function menuDoPapel(
  papel: Papel,
  alcances: readonly Alcance[] = []
): ItemDeMenu[] {
  return MENU.filter((item) => {
    if (item.exige && !pode(papel, item.exige)) return false;
    if (item.exigeAlcance && !alcances.includes(item.exigeAlcance)) return false;
    return true;
  });
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
