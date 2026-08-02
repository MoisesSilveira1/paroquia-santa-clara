# Site da Paróquia Santa Clara e São Francisco de Assis

Site institucional da paróquia (Jardim Botânico, Brasília-DF), feito para ser
mantido por **qualquer pessoa da comunidade com conhecimentos básicos** — toda a
documentação está em português e o conteúdo do dia a dia (avisos e fotos) é
gerenciado por um painel simples, sem mexer em código.

> **Novo por aqui?** Leia [docs/continuidade.md](docs/continuidade.md) — é o
> guia de quem assume a manutenção do site.

## O que o site tem

| Página | Conteúdo |
| --- | --- |
| `/` | Boas-vindas, horários resumidos, avisos da semana, atalhos |
| `/horarios` | Missas, confissões e adoração por dia da semana |
| `/sobre` | História, padroeiros, pároco e equipe |
| `/pastorais` | Pastorais e movimentos com contatos |
| `/missa-online` | Transmissão ao vivo do YouTube + últimas missas |
| `/noticias` | Mural de notícias e agenda de eventos |
| `/galeria` | Álbuns de fotos dos eventos |
| `/dizimo` | Orientações sobre o dízimo, Pix e dados bancários |
| `/contato` | Formulário, mapa, WhatsApp e telefones |
| `/admin` | **Painel restrito**: edita avisos e sobe fotos (exige login) |

## Tecnologia

- [Next.js](https://nextjs.org) (App Router, TypeScript) + [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) (plano gratuito): banco de dados dos avisos,
  álbuns e fotos + login do painel administrativo
- Ícones [Lucide](https://lucide.dev)

## Rodar no computador

Pré-requisito: [Node.js](https://nodejs.org) 20 ou superior.

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>. Sem o Supabase configurado o site funciona normalmente
com conteúdo de demonstração (só o painel `/admin` fica desativado).

## Onde editar cada coisa

| Quero mudar… | Onde |
| --- | --- |
| Avisos da semana e fotos de eventos | Painel `/admin` (não precisa de código) |
| Telefones, horários de missa, textos fixos | [`lib/dados.ts`](lib/dados.ts) |
| Aparência (cores, fontes) | [`app/globals.css`](app/globals.css) |
| Classes repetidas de formulário/botão | [`components/ui/estilos.ts`](components/ui/estilos.ts) |
| Estrutura das páginas | `app/<pagina>/page.tsx` |
| Canal do YouTube das missas | objeto `youtube` em [`lib/dados.ts`](lib/dados.ts) |
| Fotos novas (otimizar) | `node scripts/otimizar-fotos.mjs` |

## Como o conteúdo editável é organizado

As telas nunca falam com o Supabase diretamente. Elas usam o contrato definido
em [`lib/conteudo/porta.ts`](lib/conteudo/porta.ts), e
[`lib/conteudo/index.ts`](lib/conteudo/index.ts) decide qual implementação
entregar:

| Situação | Implementação usada |
| --- | --- |
| `.env.local` configurado | `repositorio-supabase.ts` (grava de verdade) |
| Sem configuração | `repositorio-memoria.ts` (modo demonstração) |

Isso permite apresentar o site funcionando antes de existir banco, mantém o
painel escrito uma única vez e deixa a troca de tecnologia (se um dia sair do
Supabase) restrita a um arquivo só.

> Configuração pela metade — só uma das duas variáveis — para a aplicação com
> uma mensagem explicando o que falta, em vez de cair silenciosamente no modo
> demonstração.

Itens marcados com `DEMO` em `lib/dados.ts` ainda são fictícios e precisam ser
confirmados com a secretaria antes da publicação.

## Supabase (avisos, fotos e login do /admin)

1. Criar projeto no [supabase.com](https://supabase.com) **com a conta
   institucional da paróquia** (ver [docs/continuidade.md](docs/continuidade.md)).
2. Executar [`supabase/schema.sql`](supabase/schema.sql) no SQL Editor.
3. Criar o(s) usuário(s) do painel em Authentication → Users.
4. Criar o arquivo `.env.local` na raiz:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=chave-anon-do-projeto
```

(As mesmas variáveis devem ser configuradas no serviço de hospedagem.)

## Documentação

- [docs/continuidade.md](docs/continuidade.md) — governança, contas
  institucionais e como passar o site para outra pessoa
- [docs/email-google-workspace.md](docs/email-google-workspace.md) — plano do
  e-mail personalizado (@dominio da paróquia)
