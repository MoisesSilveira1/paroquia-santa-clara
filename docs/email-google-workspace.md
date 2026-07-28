# E-mail personalizado — Google Workspace

Plano para dar e-mails próprios (`nome@dominio-da-paroquia`) aos membros da
paróquia, integrado ao site. Preparado em 27/07/2026.

## 1. Pré-requisito: domínio próprio

O e-mail personalizado exige um domínio registrado. O antigo
`paroquiasantaclaradf.com.br` **está fora do ar / não resolve mais** — verificar
com a secretaria se o registro ainda pertence à paróquia (dá para checar e
recuperar no [registro.br](https://registro.br)). Opções:

- **Recuperar** `paroquiasantaclaradf.com.br` (melhor: já foi divulgado); ou
- Registrar um novo, ex.: `paroquiasantaclarasf.org.br` (~R$ 40/ano no registro.br).

O mesmo domínio servirá para o site (`www.`) e para os e-mails.

## 2. Google Workspace — de preferência gratuito

Igrejas com CNPJ próprio geralmente se qualificam para o
**Google Workspace for Nonprofits (gratuito)**:

1. Cadastrar a organização no [Google para ONGs](https://www.google.com/nonprofits/)
   (validação via TechSoup/Ativa Brasil, usando o CNPJ da paróquia/mitra).
2. Aprovado, ativar o Google Workspace for Nonprofits (até centenas de contas, R$ 0).
3. Se não se qualificar: Workspace Business Starter (~US$ 6/usuário/mês) ou
   começar só com grupos/aliases num plano mínimo.

## 3. Contas sugeridas

| Conta | Uso |
| --- | --- |
| `secretaria@` | E-mail principal (site, contato) |
| `paroco@` | Pe. Norbey |
| `pascom@` | Comunicação — YouTube, redes, site |
| `dizimo@` | Pastoral do Dízimo (e futura chave Pix) |
| `financeiro@` | Conselho de assuntos econômicos |
| `pastorais@` | Grupo/alias que distribui às coordenações |

Dica: usar **grupos** (gratuitos) para papéis e contas nomeadas só para pessoas —
facilita quando alguém troca de função.

## 4. Configuração DNS (na hora da implantação)

No provedor de DNS do domínio (Cloudflare recomendado, gratuito):

- Registro **MX**: `smtp.google.com` (prioridade 1) — padrão atual do Workspace.
- **SPF** (TXT): `v=spf1 include:_spf.google.com ~all`
- **DKIM** (TXT): gerado no Admin Console → Apps → Gmail → Autenticar e-mail.
- **DMARC** (TXT): `v=DMARC1; p=quarantine; rua=mailto:pascom@<dominio>`
- Verificação de propriedade do domínio: TXT `google-site-verification=...`.

## 5. Integração com o site

- Trocar `paroquia.email` em `lib/dados.ts` para `secretaria@<dominio>`.
- Formulário de contato: enviar via Resend (já usado no Rifa Web) ou SMTP do
  Gmail para `secretaria@`.
- Futura chave Pix do dízimo pode ser `dizimo@<dominio>` (estável e com cara
  institucional).

## Custo estimado

| Item | Custo |
| --- | --- |
| Domínio .org.br / .com.br | ~R$ 40/ano |
| Google Workspace (nonprofit) | R$ 0 |
| DNS (Cloudflare) | R$ 0 |
