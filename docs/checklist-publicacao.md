# O que falta para o site entrar no ar

Levantado em 28/07/2026, conferindo o código. As etapas estão na ordem em que
uma destrava a outra — a Etapa 1 bloqueia quase tudo.

---

## Etapa 1 — Só a paróquia pode fornecer

Sem isto o site não pode ser publicado (há dados fictícios no ar hoje).

- [ ] **CNPJ da paróquia ou da mitra** — necessário para registrar o domínio
      em nome dela e para contratar o Google Workspace. É o item que mais
      trava: sem ele, não há domínio nem e-mail.
- [ ] **Dados do dízimo**: chave Pix, banco, agência, conta e CNPJ.
      Hoje a página mostra "A confirmar" (proposital — melhor que inventar).
- [ ] **Horários reais dos sacramentos**: batismo, catequese, crisma e
      matrimônio (4 itens marcados como `DEMO` em `lib/dados.ts`).
- [ ] **Contatos dos coordenadores das pastorais** — as 8 pastorais estão
      todas com o telefone genérico da secretaria.
- [ ] **Quem vai administrar o site** — nome e e-mail da pessoa da secretaria
      que vai publicar avisos e fotos.
- [ ] **Autorização de uso de imagem** das fotos da PASCOM. Aparecem rostos
      identificáveis, inclusive de crianças; confirmar com a PASCOM/pároco
      antes de as fotos ficarem públicas (LGPD).
- [ ] **Aprovação da proposta** pelo conselho (CAEP).

## Etapa 2 — Decisões suas

- [ ] **Nome do domínio** a registrar (ex.: `paroquiasantaclarasf.org.br`).
      O antigo foi perdido com a empresa anterior.
- [ ] **Onde hospedar**: Cloudflare Pages ou Vercel (ambos gratuitos neste porte).
- [ ] **Plano mensal** que a paróquia vai contratar (Pequena / Média / Grande).

## Etapa 3 — Contas e serviços a criar

Nesta ordem, porque uma depende da outra.

- [ ] **E-mail-mãe institucional** (ex.: `pascom.santaclarasf@gmail.com`), com
      recuperação no telefone da secretaria e verificação em duas etapas.
      Será o dono de todos os serviços — ver [continuidade.md](continuidade.md).
- [ ] **Registrar o domínio** no [registro.br](https://registro.br) (~R$ 40/ano),
      com titular = CNPJ da paróquia e contato = e-mail-mãe.
- [x] ~~Criar o banco hospedado~~ — **feito em 02/09/2026**: Prisma Postgres,
      projeto `paroquia-santa-clara`. Falta apenas **passar o banco para a
      conta institucional** quando ela existir: hoje ele está no espaço de
      trabalho pessoal do desenvolvedor. As fotos ficam guardadas no próprio
      banco (cerca de 150 KB cada, ~150 MB para mil fotos), o que faz o backup
      do banco já levar as fotos junto — mas exige olho no espaço contratado.
- [ ] **Contratar o Google Workspace** — modelo misto: Standard para secretaria
      e pároco, Starter para as demais contas.
- [ ] **Criar a conta de hospedagem** com o e-mail-mãe.

## Etapa 4 — Trabalho técnico

Feito por quem cuida do site, depois que as etapas acima estiverem prontas.
O passo a passo detalhado está em [publicar.md](publicar.md).

- [ ] Substituir todos os itens `DEMO` em `lib/dados.ts` pelos dados reais.
- [ ] Apontar `DATABASE_URL` para o banco hospedado e rodar
      `npx prisma migrate deploy` para criar as tabelas.
- [ ] **APAGAR A CONTA `mano@santaclara.local`.** Criada em 03/09/2026 a pedido
      do Moisés para ele testar o site inteiro; a senha é `123456` e o nível é
      administrador geral. Enquanto ela existir, quem adivinhar esse endereço
      entra no painel com acesso total. Não é conta de ninguém — é ferramenta
      de obra, e sai antes de a obra abrir.
- [ ] Cadastrar as pessoas da secretaria em **Usuários** no painel e **excluir
      os acessos de exemplo** (`admin@`, `secretaria@`, `padre@`,
      `coordenador@`, `dizimo@`) — as senhas deles estão no repositório, à
      vista de qualquer um.
- [ ] Apagar os cadastros marcados `(exemplo)` em **Coordenadores e equipes**
      e os compromissos de teste na **Agenda**.
- [ ] Criar `.env` e configurar as mesmas variáveis na hospedagem:
      `DATABASE_URL`, `SEGREDO_SESSAO` (32+ caracteres, gerada ao acaso) e
      **`NEXT_PUBLIC_SITE_URL`** (sem esta última, o cartão de compartilhamento
      do WhatsApp aponta para `localhost` e não carrega).
- [ ] Subir as fotos reais pelo painel `/admin` → Galeria (as atuais são de
      demonstração). O envio é pelo próprio painel, direto do computador —
      fotos de iPhone (`.HEIC`) precisam virar JPG antes.
- [x] ~~Formulário de contato~~ — **pronto**: já valida e envia de verdade.
      Falta só preencher `RESEND_API_KEY`, `CONTATO_EMAIL_DESTINO` e
      `CONTATO_EMAIL_REMETENTE` quando o e-mail existir. Sem elas, o formulário
      avisa que está em demonstração em vez de fingir envio.
- [x] ~~`sitemap.xml` e `robots.txt`~~ — **prontos**, gerados automaticamente a
      partir de `NEXT_PUBLIC_SITE_URL`.
- [ ] Configurar o DNS: apontar o domínio para a hospedagem e adicionar os
      registros MX, SPF, DKIM e DMARC do Workspace
      (ver [email-google-workspace.md](email-google-workspace.md)).
- [ ] Testar em celular de verdade — principalmente o menu, a galeria e o
      botão do WhatsApp.
- [ ] Conferir se o mapa do Google na página de contato abre no local certo.

## Etapa 5 — Depois de publicar

- [ ] **Treinar a secretaria** no painel `/admin` (1 hora basta).
- [ ] **Transferir o repositório** para uma organização da paróquia no GitHub
      — hoje está na conta pessoal do desenvolvedor.
- [ ] Guardar as credenciais num cofre de senhas ou envelope lacrado na
      secretaria, com instrução de acesso para o pároco.
- [ ] Marcar a versão publicada: `git tag -a v2.0-no-ar` (ver [versoes.md](versoes.md)).

---

## Custo anual estimado

| Item | Custo |
| --- | --- |
| Domínio `.org.br` | ~R$ 40/ano |
| Hospedagem (Cloudflare Pages ou Vercel) | R$ 0 |
| Banco de dados (plano gratuito) | R$ 0 |
| Google Workspace | conforme o número de contas (ver proposta) |

O site em si não tem custo de infraestrutura neste porte — o que se paga é o
domínio e os e-mails.
