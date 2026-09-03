/**
 * Quem é quem no painel, e o que cada um pode fazer.
 *
 * Este arquivo é a ÚNICA fonte dos papéis e das permissões. Antes a lista de
 * papéis existia em dois lugares (validação e menu) e as checagens eram
 * comparações soltas de texto espalhadas pelas ações — do tipo
 * `exigirPapel("SUPER_ADMIN")`. Com dois papéis dava para conviver; com três,
 * qualquer tela nova que alguém esquecesse de proteger viraria um buraco.
 *
 * A troca é: em vez de perguntar "quem é você?", as ações perguntam "você pode
 * isto?". A regra "administrador comum não exclui cadastro" fica escrita uma
 * vez, aqui, e vale para toda ação que peça `usuarios.excluir` — inclusive as
 * que ainda nem foram escritas.
 *
 * NÃO é `server-only` de propósito: as telas precisam saber o mesmo para não
 * mostrar botão que vai dar erro. Esconder o botão não é proteção — quem
 * protege é o `exigirPermissao` das ações —, é só cortesia com quem usa.
 */

/** Papéis de quem usa o painel, do mais restrito ao mais amplo. */
export const PAPEIS = [
  "COORDENADOR",
  "ADMIN_COMUM",
  "PADRE",
  "SUPER_ADMIN",
] as const;
export type Papel = (typeof PAPEIS)[number];

export const NOME_DO_PAPEL: Record<Papel, string> = {
  COORDENADOR: "Coordenador de pastoral",
  ADMIN_COMUM: "Administrador comum",
  PADRE: "Padre",
  SUPER_ADMIN: "Administrador geral",
};

/** Explicação em uma linha, mostrada ao escolher o nível de acesso. */
export const DESCRICAO_DO_PAPEL: Record<Papel, string> = {
  COORDENADOR:
    "Cuida apenas da própria pastoral: cadastra e edita a equipe dela e agenda salas. Não mexe no site nem nas outras pastorais.",
  ADMIN_COMUM:
    "Cuida do dia a dia: avisos, fotos, notícias, horários e respostas aos contatos. Cadastra e edita coordenadores das pastorais, mas não exclui cadastro de pessoa.",
  PADRE: "Acesso total, sem restrição.",
  SUPER_ADMIN: "Acesso total, sem restrição. É quem mantém o site funcionando.",
};

/**
 * O que se pode fazer no painel.
 *
 * `conteudo` é tudo que aparece no site: avisos, notícias, horários, pastorais,
 * galeria e o andamento das mensagens de contato. `usuarios` é o cadastro de
 * quem entra no painel.
 *
 * A equipe das pastorais tem duas permissões porque tem dois alcances:
 * `equipe.propria` deixa mexer só nas pastorais que a pessoa coordena, e
 * `coordenadores.gerenciar` deixa mexer em qualquer uma. Quem tem a segunda
 * dispensa a primeira, mas ambas aparecem na tabela para o alcance ficar dito
 * em vez de deduzido. O alcance em si é conferido em
 * `lib/servicos/coordenadores.ts` — permissão diz "pode mexer em equipe",
 * o serviço diz "nesta equipe".
 */
export const PERMISSOES = [
  "conteudo.editar",
  "conteudo.excluir",
  "equipe.propria",
  "coordenadores.gerenciar",
  "coordenadores.excluir",
  "usuarios.gerenciar",
  "usuarios.excluir",
  "usuarios.promover",
] as const;
export type Permissao = (typeof PERMISSOES)[number];

/**
 * Padre e administrador geral têm exatamente as mesmas permissões — isso é
 * intencional, não um descuido. São contas separadas porque são pessoas
 * diferentes e cada uma responde pelo que faz, mas nenhuma das duas esbarra em
 * limite dentro do painel.
 */
const PERMISSOES_DO_PAPEL: Record<Papel, readonly Permissao[]> = {
  // O coordenador entra no painel e alcança uma coisa só: a equipe da
  // pastoral em que ele aparece como coordenação. Nem conteúdo do site, nem
  // usuários, nem as outras pastorais.
  COORDENADOR: ["equipe.propria"],
  ADMIN_COMUM: [
    "conteudo.editar",
    "conteudo.excluir",
    "equipe.propria",
    "coordenadores.gerenciar",
    "usuarios.gerenciar",
  ],
  PADRE: PERMISSOES,
  SUPER_ADMIN: PERMISSOES,
};

/** Papéis sem nenhuma restrição — os que respondem pelo painel inteiro. */
export const PAPEIS_DE_ACESSO_TOTAL = PAPEIS.filter((papel) =>
  PERMISSOES.every((permissao) => PERMISSOES_DO_PAPEL[papel].includes(permissao))
);

export function pode(papel: Papel, permissao: Permissao): boolean {
  return PERMISSOES_DO_PAPEL[papel].includes(permissao);
}

/**
 * Quais níveis de acesso esta pessoa pode conceder a outra.
 *
 * Sem este limite, o cadastro de coordenadores seria uma porta dos fundos:
 * bastaria ao administrador comum criar uma conta de padre, entrar com ela e
 * ter tudo que o próprio papel dele nega.
 */
export function papeisAtribuiveisPor(papel: Papel): Papel[] {
  return pode(papel, "usuarios.promover")
    ? [...PAPEIS]
    : PAPEIS.filter((alvo) => !PAPEIS_DE_ACESSO_TOTAL.includes(alvo));
}

/**
 * O que dizer a quem esbarrou no limite.
 *
 * Uma frase que explica o motivo e aponta a saída vale mais que "acesso
 * negado": quem está do outro lado é a secretaria, não um invasor.
 */
export const RECADO_SEM_PERMISSAO: Record<Permissao, string> = {
  "conteudo.editar": "Sua conta não tem permissão para alterar o conteúdo do site.",
  "conteudo.excluir": "Sua conta não tem permissão para excluir conteúdo do site.",
  "equipe.propria":
    "Sua conta não tem permissão para mexer na equipe de nenhuma pastoral.",
  "coordenadores.gerenciar":
    "Sua conta só pode mexer na equipe da pastoral que você coordena.",
  "coordenadores.excluir":
    "Excluir um coordenador é do padre ou do administrador geral. Peça a um deles — ou desmarque “Mostrar no site”, que tira o nome do ar sem apagar o cadastro.",
  "usuarios.gerenciar": "Sua conta não tem permissão para mexer nos cadastros do painel.",
  "usuarios.excluir":
    "Excluir um cadastro é do padre ou do administrador geral. Peça a um deles — ou desative o acesso, que não apaga nada.",
  "usuarios.promover":
    "Só o padre ou o administrador geral podem dar acesso total a alguém.",
};
