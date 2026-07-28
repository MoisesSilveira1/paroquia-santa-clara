# Plano de continuidade — quem cuida do site amanhã?

Este documento existe por causa de uma lição aprendida: o site antigo da
paróquia morreu porque **o domínio estava registrado em nome da empresa que o
fez**, e a paróquia perdeu o acesso. Nada aqui pode depender de uma única
pessoa ou empresa.

## Regra de ouro

> **Todo serviço fica em conta institucional da paróquia**, com credenciais
> guardadas pela secretaria/PASCOM e compartilhadas com pelo menos duas
> pessoas. Voluntários recebem acesso *pela* conta institucional — nunca o
> contrário.

## Passo zero: a conta-mãe

Criar um e-mail institucional que será o "dono" de tudo:

1. Enquanto não há Google Workspace: um Gmail simples, ex.
   `pascom.santaclarasf@gmail.com`, com telefone de recuperação da
   **secretaria** (não de um voluntário).
2. Quando o Workspace estiver ativo: migrar a titularidade dos serviços para
   `pascom@<dominio>`.
3. Ativar verificação em duas etapas e guardar os códigos de backup impressos
   na secretaria.

## Inventário de serviços

| Serviço | Para quê | Titular correto | Situação atual |
| --- | --- | --- | --- |
| Registro.br (domínio) | Endereço do site e dos e-mails | CNPJ da paróquia/mitra, e-mail-mãe | ⏳ registrar do zero (antigo perdido) |
| GitHub (código) | Guarda o código do site | Organização própria (ex. `paroquia-santa-clara-sf`) com 2+ donos | ⚠️ hoje em conta pessoal de voluntário |
| Supabase (banco/painel) | Avisos, fotos, login do /admin | Organização com a conta-mãe | ⏳ a criar |
| Hospedagem (Cloudflare/Vercel) | Site no ar | Conta-mãe | ⏳ a definir |
| Google Workspace | E-mails @dominio | Admin = conta-mãe; CNPJ da paróquia | ⏳ ver docs/email-google-workspace.md |
| YouTube (canal das missas) | Transmissões | Conta Google da paróquia com 2+ gestores | ✅ já existe (confirmar gestores) |
| Contas do painel /admin | Secretária publica avisos/fotos | Um usuário por pessoa (revogável) | ⏳ a criar |

## Checklist de institucionalização

- [ ] Criar o e-mail-mãe com recuperação da secretaria + 2 etapas
- [ ] Registrar o domínio no registro.br **com o CNPJ da paróquia** e o e-mail-mãe
- [ ] Criar organização no GitHub e **transferir este repositório** para ela
      (Settings → Transfer ownership); manter voluntários como colaboradores
- [ ] Criar o projeto Supabase dentro de organização acessível pela conta-mãe
- [ ] Hospedagem na conta-mãe (voluntários como membros, não donos)
- [ ] Conferir se o canal do YouTube tem pelo menos 2 gestores da paróquia
- [ ] Registrar credenciais num cofre (ex. Bitwarden gratuito) ou envelope
      lacrado na secretaria, com instrução de acesso para o pároco
- [ ] Anotar neste arquivo quem são os responsáveis atuais (abaixo)

## Responsáveis atuais

| Papel | Nome | Contato | Desde |
| --- | --- | --- | --- |
| Manutenção técnica | Moisés Silveira | (preencher) | 06/2026 |
| Conteúdo (avisos/fotos) | (preencher) | | |
| Supervisão | Secretaria paroquial | (61) 3427-3281 | |

## Como passar o bastão (roteiro de 1 hora)

1. Novo voluntário lê o [README](../README.md) e este documento.
2. Recebe acesso: colaborador no GitHub da organização + membro no Supabase +
   membro na hospedagem (a partir das contas institucionais — nada muda de dono).
3. Roda o site localmente (`npm install && npm run dev`) e faz uma alteração
   de teste num aviso pelo `/admin`.
4. Atualiza a tabela de responsáveis acima e remove acessos de quem saiu.

Se o voluntário anterior ficou indisponível e algo se perdeu: os donos das
contas institucionais (secretaria/pároco) conseguem redefinir tudo sozinhos —
esse é o ponto do plano inteiro.
