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
| `/aviso-paroquial` | O comunicado em destaque, que também abre numa janela ao entrar no site |
| `/horarios` | Missas, confissões e adoração por dia da semana |
| `/povo-de-deus` | Folheto litúrgico da semana, lido do site da Arquidiocese |
| `/calendario-liturgico` | Tempo, cor e celebração de cada dia, com o folheto das leituras |
| `/sobre` | História, padroeiros, pároco e equipe |
| `/pastorais` | Pastorais e movimentos; cada cartão abre a página da pastoral |
| `/pastorais/<pastoral>` | Informações e coordenação da pastoral, com os contatos autorizados |
| `/catequese` | Turmas, horários e o formulário de inscrição — quando a coordenação abre o período |
| `/missa-online` | Transmissão ao vivo do YouTube + últimas missas |
| `/noticias` | Mural de notícias e agenda de eventos |
| `/galeria` | Álbuns de fotos dos eventos |
| `/dizimo` | Orientações sobre o dízimo, Pix e dados bancários |
| `/contato` | Formulário, mapa, WhatsApp e telefones |
| `/admin` | **Painel da secretaria** (exige login): aviso paroquial, avisos da semana, notícias, horários, pastorais, catequese, agenda, coordenadores, galeria, mensagens e usuários |

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
| A janela que abre o site | Painel `/admin` → Aviso paroquial |
| Quem coordena e quem serve em cada pastoral | Painel `/admin` → Coordenadores e equipes |
| Reuniões e escalas de uma pastoral | Painel `/admin` → Agenda |
| Abrir ou fechar as inscrições da catequese, e as turmas | Painel `/admin` → Catequese |
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

### Sobre a agenda das pastorais

Cada pastoral tem a sua agenda em `/admin` → **Agenda**: reuniões do grupo e
escalas de quem serve. A agenda pertence ao grupo — o coordenador vê e marca
só a dele; a secretaria vê todas.

**Os horários são guardados como instante, no fuso de Brasília**, e isso não é
detalhe. `new Date("2026-09-10T19:30:00")` usa o fuso de quem roda o código:
no computador da secretaria dá certo por acidente, mas em hospedagem
serverless o servidor roda em UTC e a reunião apareceria três horas cedo. A
conversão está em [`lib/agenda/fuso.ts`](lib/agenda/fuso.ts), usa a base de
fusos do sistema (e não um "-3" fixo) e foi conferida rodando os testes com
`TZ=UTC`.

Guardar o instante certo é também o que deixa a porta aberta para o **Google
Calendar**: título, início, fim, local e observação já são exatamente os
campos de um evento de calendário. Quando quiserem integrar, os dois caminhos
são publicar a agenda como assinatura (`.ics`, mais simples, só leitura) ou
sincronizar pela API do Google (mais trabalho, duas mãos) — o segundo pede uma
coluna nova para guardar o id do evento lá, e nada além disso.

O **local** é texto livre por enquanto, com sugestões (salão, quiosque, salas).
A lista fechada de espaços, com aviso de choque de horário entre dois grupos,
depende de a paróquia dizer quais espaços existem.

### Sobre o calendário litúrgico

A página `/calendario-liturgico` diz o tempo litúrgico, a cor e a celebração de
cada dia. Tudo sai de **uma conta**, em [`lib/liturgia/`](lib/liturgia): a data
da Páscoa (cômputo gregoriano) define o ano inteiro, e o resto se apoia nela.
Não há tabela digitada nem consulta pela internet — vale para qualquer ano e
não deixa de funcionar se algum site sair do ar.

Duas regras que costumam ser feitas errado e estão explicadas no código:

- **As semanas do Tempo Comum vêm em dois pedaços.** O segundo conta *para
  trás* a partir de Cristo Rei, que é sempre a 34ª semana — é assim que as
  semanas comidas pela Quaresma e pela Páscoa somem do meio, e não do fim.
- **Ajustes do Brasil.** A Epifania vai para o domingo entre 2 e 8 de janeiro,
  a Ascensão para o 7º Domingo da Páscoa, e Corpus Christi fica na quinta-feira.

O que a página **não** faz é dizer o santo de cada dia do ano: o santoral tem
centenas de memórias com regras de precedência, e errar isso num site de
paróquia é pior do que não ter. Ficaram as solenidades e festas, mais os
padroeiros da casa (Santa Clara em 11/08, São Francisco em 04/10).

As leituras não estão aqui: cada domingo e solenidade leva ao folheto da
Arquidiocese, que é onde elas são publicadas. O link só aparece em domingo ou
solenidade — em 03/09/2026 o calendário deles trazia "Assunção de Nossa
Senhora" numa quinta-feira comum, com os arquivos do dia 16/08, e sem essa
peneira a página ofereceria o folheto errado.

### Sobre o folheto O Povo de Deus

A página `/povo-de-deus` mostra o folheto litúrgico da semana **sem ninguém
precisar atualizar nada**. Ela lê a página do folheto no site da Arquidiocese
de Brasília, de hora em hora, e monta a lista de edições com os links de cada
arquivo (folheto, versão para celular, telão e partituras).

**Os arquivos não são copiados para cá, e isso é deliberado.** O folheto é
publicação da Arquidiocese — o rodapé do site deles diz "todos os direitos
reservados", e os textos litúrgicos e os cantos ainda têm outros donos por
trás. Além disso, cópia envelhece: quando eles corrigem um arquivo (há edições
marcadas "Prova Final"), a correção chega sozinha ao nosso site; uma cópia
ficaria errada até alguém perceber.

Duas defesas em [`lib/povo-de-deus/`](lib/povo-de-deus):

- **Só entram links de `arqbrasilia.com.br`.** O conteúdo vem de um site que
  não é nosso; se aquela página um dia for adulterada, o site da paróquia não
  vira vitrine para os links de quem a adulterou.
- **Falha não derruba a página.** A leitura depende do formato da página deles,
  que pode mudar sem aviso. Quando não dá para ler, a tela mostra o caminho
  direto para a Arquidiocese e continua útil — vale conferir essa tela se
  alguém avisar que o folheto sumiu.

### Sobre o aviso paroquial

O aviso paroquial é a janela que abre sobre o site e precisa ser fechada para
continuar navegando. Aceita texto, uma imagem e um vídeo do YouTube. É outra
coisa dos **avisos da semana**, que são recados curtos em lista na página
inicial — aquele é o mural, este é o que ninguém pode deixar de ver.

Três decisões que economizam dor de cabeça:

- **Só um aviso fica no ar por vez.** Pôr um no ar tira o anterior. Dois
  comunicados empilhados na cara do visitante não ajudariam ninguém.
- **Aparece uma vez por aviso, não a cada visita.** O navegador lembra que a
  pessoa já viu (em `localStorage`). Editar o aviso faz ele reaparecer para
  todo mundo, então corrigir um horário chega a quem já tinha lido.
- **Tem data de validade opcional.** Sem ela, um comunicado esquecido ficaria
  bloqueando a entrada do site para sempre.

O endereço do vídeo é conferido no servidor e só aceita YouTube. Um `<iframe>`
com endereço vindo de formulário embutiria qualquer página dentro do site da
paróquia — ver [`lib/video/youtube.ts`](lib/video/youtube.ts), que extrai o
identificador e monta a URL em vez de confiar no que foi colado.

A janela depende de JavaScript. Por isso o mesmo conteúdo tem endereço fixo em
`/aviso-paroquial`, ligado no rodapé: é para lá que se manda o link no grupo do
WhatsApp, e é onde quem fechou sem ler encontra o aviso de novo.

### Sobre os coordenadores

Cada pastoral tem uma equipe cadastrada em `/admin` → **Coordenadores e
equipes**, e ela se divide em duas pela caixa "Faz parte da coordenação".

**Só a coordenação aparece no site** — coordenador, vice e adjunto. O resto da
equipe é gente voluntária, que serve quando pode e nem sempre com frequência;
publicar esses nomes expõe pessoas que não pediram para estar ali e envelhece
rápido. A equipe inteira continua no painel, que é onde ela serve para escala
e contato interno. O corte é feito na consulta ao banco, então a página nem
recebe os outros nomes.

O telefone e o e-mail **só aparecem se alguém marcar “Mostrar o contato no
site”**, e isso nasce desmarcado.

Esse padrão é proposital: coordenador é voluntário da comunidade, e publicar o
telefone de uma pessoa exige o consentimento dela — diferente do número da
secretaria, que é institucional. O filtro é feito na consulta ao banco, em
[`lib/servicos/coordenadores.ts`](lib/servicos/coordenadores.ts), e não na
tela, para que uma mudança distraída de layout não vaze o número de ninguém.
Verificado: com um telefone gravado em alguém não autorizado, a palavra não
aparece em lugar nenhum do HTML servido.

Cada pessoa é **coordenação** ou **equipe**, pela caixa "Faz parte da
coordenação". A página da pastoral mostra os dois grupos separados, e o cartão
da listagem resume só a coordenação — é assim que a comunidade enxerga: quem
procura "com quem falo" quer a coordenação; quem quer saber "quem serve aqui"
abre a página.

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

São quatro níveis de acesso:

| Nível | Pode |
| --- | --- |
| Coordenador de pastoral | Só a pastoral que ele coordena: a equipe e a agenda dela. Não mexe no site nem nas outras pastorais. Quem coordena a Catequese cuida também das turmas e das inscrições |
| Administrador comum | Avisos, notícias, horários, pastorais, galeria e mensagens de contato. Cadastra e edita coordenadores das pastorais. **Não exclui cadastro de pessoa** — nem de coordenador, nem de usuário. |
| Padre | Tudo, sem restrição |
| Administrador geral | Tudo, sem restrição. É quem mantém o site funcionando |

A matriz completa, com a diferença entre **permissão** ("pode mexer em equipe")
e **alcance** ("nesta equipe"), está em [docs/permissoes.md](docs/permissoes.md).

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

Tudo em **[docs/README.md](docs/README.md)**, que é o índice e diz por onde
começar conforme quem você é. Os principais:

| | |
| --- | --- |
| [docs/continuidade.md](docs/continuidade.md) | **Comece por aqui** se vai manter o site: governança, contas institucionais e como passar adiante |
| [docs/checklist-publicacao.md](docs/checklist-publicacao.md) | O que ainda falta para o site entrar no ar |
| [docs/arquitetura.md](docs/arquitetura.md) | Como o código é organizado, e por quê |
| [docs/permissoes.md](docs/permissoes.md) | Quem pode o quê, em detalhe |
| [docs/seguranca.md](docs/seguranca.md) | O que protege o site e os riscos em aberto |
| [docs/privacidade.md](docs/privacidade.md) | Dados pessoais, LGPD e o dado de criança da catequese |
| [docs/auditoria-2026-09.md](docs/auditoria-2026-09.md) | A varredura de setembro de 2026 |
| [docs/email-google-workspace.md](docs/email-google-workspace.md) | Plano do e-mail personalizado (@dominio da paróquia) |
