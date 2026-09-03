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
| `/pastorais` | Pastorais e movimentos, com quem coordena cada um |
| `/missa-online` | Transmissão ao vivo do YouTube + últimas missas |
| `/noticias` | Mural de notícias e agenda de eventos |
| `/galeria` | Álbuns de fotos dos eventos |
| `/dizimo` | Orientações sobre o dízimo, Pix e dados bancários |
| `/contato` | Formulário, mapa, WhatsApp e telefones |
| `/admin` | **Painel da secretaria** (exige login): avisos, notícias, horários, pastorais, coordenadores, galeria, mensagens e usuários |

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

O `db:semear` cria um acesso de cada nível (administrador geral, padre e
administrador comum) e imprime as senhas no terminal. **Troque-as antes de
publicar o site.**

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
| Quem coordena cada pastoral | Painel `/admin` → Coordenadores |
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

### Sobre os coordenadores

Cada pastoral pode ter uma ou mais pessoas responsáveis, cadastradas em
`/admin` → **Coordenadores**. O nome e a função aparecem no cartão da pastoral
no site; o telefone e o e-mail **só aparecem se alguém marcar “Mostrar o
contato no site”**, e isso nasce desmarcado.

Esse padrão é proposital: coordenador é voluntário da comunidade, e publicar o
telefone de uma pessoa exige o consentimento dela — diferente do número da
secretaria, que é institucional. O filtro é feito na consulta ao banco, em
[`lib/servicos/coordenadores.ts`](lib/servicos/coordenadores.ts), e não na
tela, para que uma mudança distraída de layout não vaze o número de ninguém.

Cadastrar um coordenador **não dá acesso ao painel**. São coisas separadas: se
um coordenador precisar entrar no painel, cadastre-o também em Usuários.

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

São três níveis de acesso:

| Nível | Pode |
| --- | --- |
| Administrador comum | Avisos, notícias, horários, pastorais, galeria e mensagens de contato. Cadastra e edita coordenadores das pastorais. **Não exclui cadastro de pessoa** — nem de coordenador, nem de usuário. |
| Padre | Tudo, sem restrição |
| Administrador geral | Tudo, sem restrição. É quem mantém o site funcionando |

O administrador comum tira o acesso de alguém desmarcando **Acesso liberado**
na edição da pessoa: bloqueia a entrada na hora e não apaga o histórico. Só
o padre e o administrador geral excluem o cadastro de fato.

Três garantias que o sistema não abre mão:

- ninguém retira o próprio acesso nem muda o próprio nível — seria uma porta
  trancada por dentro;
- a paróquia nunca fica sem ao menos um padre ou administrador geral ativo;
- o administrador comum não cria nem edita conta de nível acima do dele. Sem
  isso, bastaria criar uma conta de padre e entrar por ela para furar todas as
  outras regras.

Quem pode o quê está escrito em um lugar só,
[lib/auth/papeis.ts](lib/auth/papeis.ts) — as telas e as ações consultam essa
tabela em vez de comparar o papel na mão. Para mudar uma permissão ou criar um
quarto nível, é lá.

## Documentação

- [docs/continuidade.md](docs/continuidade.md) — governança, contas
  institucionais e como passar o site para outra pessoa
- [docs/email-google-workspace.md](docs/email-google-workspace.md) — plano do
  e-mail personalizado (@dominio da paróquia)
