# Passo a passo para publicar o site

Roteiro para o dia em que a proposta for aprovada. Cada passo é curto e na
ordem certa. Tempo estimado: **2 a 3 horas**, fora a espera do DNS.

Pré-requisitos: o CNPJ da paróquia e os dados reais listados em
[checklist-publicacao.md](checklist-publicacao.md).

---

## 1. Conta-mãe (10 min)

Criar o e-mail institucional que será dono de tudo (ex.:
`pascom.santaclarasf@gmail.com`), com telefone de recuperação **da secretaria**
e verificação em duas etapas. Detalhes em [continuidade.md](continuidade.md).

## 2. Domínio (15 min)

No [registro.br](https://registro.br), registrar o domínio com **titular =
CNPJ da paróquia** e contato = conta-mãe. Custo ~R$ 40/ano.

## 3. Banco de dados (10 min)

**Já está feito** desde 02/09/2026: o projeto usa **Prisma Postgres**
hospedado (projeto `paroquia-santa-clara`, região US East). O que resta é
decidir se o site publicado usa esse mesmo banco ou um separado.

Recomendado: **um banco só para produção**, e `npx prisma dev` (Postgres
local) para desenvolver — assim mexer no projeto nunca toca nos dados reais
da paróquia.

1. Em [console.prisma.io](https://console.prisma.io), abrir o projeto e copiar
   a **connection string direta** do banco de produção.
2. Conferir que ela termina com `?sslmode=verify-full`. Esse modo autentica o
   servidor, não só criptografa — por essa conexão passam as mensagens dos
   fiéis e os acessos do painel.
3. Com a `DATABASE_URL` apontando para o banco de produção, criar as tabelas:

   ```bash
   npx prisma migrate deploy
   ```

4. Criar o primeiro administrador. O jeito mais simples é rodar o seed uma vez
   (`npm run db:semear`), entrar no painel com o acesso que ele imprime,
   cadastrar as pessoas de verdade em **Usuários** e **excluir os dois acessos
   de exemplo**. As senhas do seed são públicas: estão no repositório.

> Ao transferir o projeto para a paróquia, o banco também precisa mudar de
> dono — hoje ele está no espaço de trabalho pessoal do desenvolvedor. Ver
> [continuidade.md](continuidade.md).

## 4. Hospedagem na Vercel (20 min)

1. Entrar em [vercel.com](https://vercel.com) com a conta-mãe (login pelo GitHub).
2. **Add New → Project** e escolher o repositório `paroquia-santa-clara`.
   A Vercel reconhece o Next.js sozinho — não mudar nenhuma configuração.
3. Em **Environment Variables**, cadastrar (ver [`.env.example`](../.env.example)) —
   entre elas `DATABASE_URL` e `SEGREDO_SESSAO`, esta última gerada com
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`:

   | Variável | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://www.dominio-escolhido.org.br` |
   | `DATABASE_URL` | a string de conexão do banco do passo 3 |
   | `SEGREDO_SESSAO` | os 64 caracteres gerados pelo comando acima |

4. **Deploy**. Em poucos minutos o site estará no ar num endereço `.vercel.app`.

> Alternativa: Cloudflare Pages também funciona, mas exige o adaptador
> `@opennextjs/cloudflare`. A Vercel é mais direta para Next.js.

## 5. Ligar o domínio (15 min + espera)

1. Na Vercel: **Settings → Domains → Add**, informar o domínio.
2. A Vercel mostra os registros DNS a criar no registro.br (ou na Cloudflare,
   se o DNS for gerenciado lá).
3. Aguardar a propagação (de minutos a algumas horas).
4. Conferir se `NEXT_PUBLIC_SITE_URL` está com o domínio definitivo e refazer
   o deploy — **sem isso o cartão de compartilhamento do WhatsApp não carrega**.

## 6. Conteúdo real (30 min)

1. Substituir no [`lib/dados.ts`](../lib/dados.ts) tudo que está marcado como
   `DEMO` ou "A confirmar" (dízimo, sacramentos, pastorais).
2. Entrar em `/admin` com o usuário criado no passo 3 e publicar os avisos da
   semana e as fotos reais dos eventos.
3. Remover os álbuns de demonstração de `albunsDemo` quando os reais estiverem
   no ar.

## 7. E-mail do formulário (20 min, depois do Workspace)

1. Criar conta em [resend.com](https://resend.com) (gratuito: 100 e-mails/dia).
2. Verificar o domínio da paróquia no Resend (adicionar os registros DNS que
   ele indicar).
3. Cadastrar na Vercel: `RESEND_API_KEY`, `CONTATO_EMAIL_DESTINO` e
   `CONTATO_EMAIL_REMETENTE`, e refazer o deploy.
4. Enviar uma mensagem de teste pelo formulário e conferir se chegou.

> Enquanto essas variáveis não existirem, o formulário avisa que está em
> demonstração e oferece o WhatsApp — ele nunca finge ter enviado.

## 8. Conferência final (20 min)

- [ ] Abrir o site no **celular** e testar menu, galeria e botão do WhatsApp.
- [ ] Colar o link num grupo do WhatsApp e ver se o cartão aparece com a foto.
- [ ] Testar o formulário de contato de ponta a ponta.
- [ ] Entrar em `/admin`, publicar um aviso e conferir se aparece na home.
- [ ] Registrar o site no [Google Search Console](https://search.google.com/search-console)
      e enviar o `sitemap.xml`.
- [ ] Marcar a versão: `git tag -a v2.0-no-ar -m "site publicado" && git push origin v2.0-no-ar`.

## 9. Entrega (1 h)

- [ ] Treinar a secretaria no painel `/admin`.
- [ ] Transferir o repositório para a organização da paróquia no GitHub.
- [ ] Guardar as credenciais conforme [continuidade.md](continuidade.md).
