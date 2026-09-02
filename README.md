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
| `/admin` | **Painel da secretaria** (exige login): avisos, notícias, horários, pastorais, galeria, mensagens e usuários |

## Tecnologia

- [Next.js](https://nextjs.org) (App Router, TypeScript) + [Tailwind CSS](https://tailwindcss.com)
- [Prisma](https://prisma.io) sobre PostgreSQL: banco de tudo que a secretaria publica
- [Zod](https://zod.dev): confere tudo que entra pelos formulários
- Ícones [Lucide](https://lucide.dev)
- Login próprio, sem serviço externo: senha derivada com `scrypt` e sessão em
  cookie assinado

## Rodar no computador

Pré-requisito: [Node.js](https://nodejs.org) 20.19 ou superior (o Prisma recusa
versões anteriores).

```bash
npm install
cp .env.example .env
npm run db:migrar
npm run db:semear
npm run dev
```

Abra <http://localhost:3000>. Antes de rodar, preencha `SEGREDO_SESSAO` no `.env`
com o valor que este comando imprime:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

O `db:semear` cria dois acessos de desenvolvimento e imprime as senhas no
terminal. **Troque-as antes de publicar o site.**

### Comandos do banco

| Comando | O que faz |
| --- | --- |
| `npm run db:migrar` | Aplica mudanças do schema e cria o arquivo do banco |
| `npm run db:semear` | Popula com o conteúdo real da paróquia (pode repetir) |
| `npm run db:estudio` | Abre uma janela para ver e editar as tabelas |
| `npm run db:recriar` | **Apaga tudo** e refaz o banco do zero |

## Onde editar cada coisa

| Quero mudar… | Onde |
| --- | --- |
| Avisos, notícias, horários de missa, pastorais e fotos | Painel `/admin` (não precisa de código) |
| Telefones, endereço, dízimo, textos institucionais | [`lib/dados.ts`](lib/dados.ts) |
| Aparência (cores, fontes) | [`app/globals.css`](app/globals.css) |
| Classes repetidas de formulário/botão | [`components/ui/estilos.ts`](components/ui/estilos.ts) |
| Estrutura das páginas | `app/<pagina>/page.tsx` |
| Canal do YouTube das missas | objeto `youtube` em [`lib/dados.ts`](lib/dados.ts) |
| Fotos da galeria | Painel `/admin` → Galeria → botão de fotos do álbum (envia do computador) |
| Fotos fixas do site (capa, brasão) | Colocar em `public/fotos/` e rodar `node scripts/otimizar-fotos.mjs` |

## Como o código está organizado

O painel é dividido em três camadas, e cada uma só conhece a de baixo:

| Camada | Onde | Responsabilidade |
| --- | --- | --- |
| Telas | `app/admin/(painel)/*/page.tsx` | Mostrar. Não sabem consultar o banco. |
| Ações | `app/admin/**/acoes.ts` | Receber formulários, conferir sessão e permissão |
| Serviços | [`lib/servicos/`](lib/servicos) | Falar com o banco. Não sabem o que é um formulário. |

O formato de tudo que entra está em
[`lib/validacao/esquemas.ts`](lib/validacao/esquemas.ts), inclusive a lista
fechada de valores de situação (`RASCUNHO`, `PUBLICADA`…). Esses campos são
texto no banco — herança da época do SQLite, que não tem `enum` — então é esse
arquivo, e não o banco, que garante que só valores válidos sejam gravados.

**Toda ação confere sessão e permissão por conta própria.** Esconder um botão
na tela não protege nada: qualquer pessoa pode enviar ao servidor a mesma
requisição que o botão enviaria, sem passar pela interface.

### Sobre as fotos da galeria

As fotos enviadas pelo painel são guardadas **no banco**, não numa pasta. Ao
chegarem, [`lib/imagens/`](lib/imagens) as gira conforme a câmera marcou,
reduz para 1400 px no maior lado e converte para WebP — cerca de 150 KB cada.
São servidas pelo endereço `/imagens/<id>`.

Guardar no banco é o que faz o envio funcionar depois de publicado: em
hospedagem serverless o disco é descartado a cada publicação, então um arquivo
gravado em `public/` sumiria. De quebra, o backup do banco já leva as fotos
junto. As fotos fixas do site (capa, brasão) continuam em `public/fotos/`,
porque essas vêm com o código.

### Sobre o banco

O banco é **PostgreSQL hospedado** (Prisma Postgres). Até 02/09/2026 era um
arquivo SQLite local, que não serviria depois de publicado: em hospedagem
serverless o disco é descartado a cada publicação e o arquivo — com avisos,
notícias e fotos — iria junto.

A conexão vem da variável `DATABASE_URL`, e deve usar **`sslmode=verify-full`**.
Assim o tráfego não é só criptografado: o servidor também é autenticado, o que
impede alguém se passar pelo banco no caminho. Isso importa porque por essa
conexão passam as mensagens dos fiéis e os dados de acesso do painel.

Para mexer no projeto sem tocar nos dados de verdade, `npx prisma dev` sobe um
Postgres na sua máquina e imprime a conexão para colar no `.env`.

Itens marcados com `DEMO` em `lib/dados.ts` ainda são fictícios e precisam ser
confirmados com a secretaria antes da publicação.

## Quem pode entrar no painel

| Nível | Pode |
| --- | --- |
| Secretaria | Avisos, notícias, horários, pastorais, galeria e mensagens |
| Administrador | Tudo isso **mais** cadastrar e remover quem acessa o painel |

O sistema não deixa a paróquia ficar sem nenhum administrador ativo, nem
permite que alguém retire o próprio acesso — seria uma porta trancada por
dentro.

## Documentação

- [docs/continuidade.md](docs/continuidade.md) — governança, contas
  institucionais e como passar o site para outra pessoa
- [docs/email-google-workspace.md](docs/email-google-workspace.md) — plano do
  e-mail personalizado (@dominio da paróquia)
