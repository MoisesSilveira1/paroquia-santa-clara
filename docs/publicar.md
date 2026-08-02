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

## 3. Supabase (20 min)

1. Criar conta em [supabase.com](https://supabase.com) com a conta-mãe e um
   projeto novo (região: São Paulo).
2. Em **SQL Editor**, colar e rodar todo o
   [`supabase/schema.sql`](../supabase/schema.sql).
3. Em **Authentication → Users → Add user**, criar o acesso da secretaria
   (e-mail e senha provisória).
4. Em **Project Settings → API**, copiar `Project URL` e a chave `anon public`.

## 4. Hospedagem na Vercel (20 min)

1. Entrar em [vercel.com](https://vercel.com) com a conta-mãe (login pelo GitHub).
2. **Add New → Project** e escolher o repositório `paroquia-santa-clara`.
   A Vercel reconhece o Next.js sozinho — não mudar nenhuma configuração.
3. Em **Environment Variables**, cadastrar (ver [`.env.example`](../.env.example)):

   | Variável | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://www.dominio-escolhido.org.br` |
   | `NEXT_PUBLIC_SUPABASE_URL` | o Project URL do passo 3 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a chave anon do passo 3 |

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
