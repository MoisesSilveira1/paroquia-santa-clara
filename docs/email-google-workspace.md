# E-mail personalizado — Google Workspace

Plano para dar e-mails próprios (`nome@dominio-da-paroquia`) aos membros da
paróquia, integrado ao site. Preparado em 27/07/2026.

## 1. Pré-requisito: domínio próprio (registrar do zero)

O domínio antigo (`paroquiasantaclaradf.com.br`) **foi perdido**: estava em nome
da empresa que fazia o site e a paróquia nunca recebeu o acesso. Portanto:

- Registrar um domínio **novo** no [registro.br](https://registro.br)
  (~R$ 40/ano), ex.: `paroquiasantaclarasf.org.br` ou
  `santaclarasfrancisco.org.br`.
- ⚠️ **Titular = CNPJ da paróquia/mitra** e e-mail de contato = conta
  institucional (ver [continuidade.md](continuidade.md)). Nunca em nome de
  voluntário ou empresa — foi assim que o domínio anterior se perdeu.

O mesmo domínio servirá para o site (`www.`) e para os e-mails.

## 2. Google Workspace — licenças pagas (Business Starter)

Avaliado em 27/07/2026: a isenção do Google for Nonprofits **não se aplica ao
nosso caso** — planejar com licenças pagas:

- **Business Starter** (recomendado): ~R$ 32,72/usuário/mês — e-mail no domínio,
  30 GB, Meet e agenda.
- Custo mensal exemplo: 3 contas ≈ R$ 98 · 6 contas ≈ R$ 196 · 12 contas ≈ R$ 393.
- Dica: usar **grupos** (gratuitos, ex. `pastorais@`) como apelidos de
  distribuição para não multiplicar licenças.

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
| Google Workspace Business Starter | ~R$ 32,72/usuário/mês |
| DNS (Cloudflare) | R$ 0 |
