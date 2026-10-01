# Modelo de dados

As 19 tabelas do banco, o que cada uma guarda e por que foi desenhada assim.

A fonte é `prisma/schema.prisma`, que tem comentário em cada decisão. Aqui fica
o mapa.

---

## 1. Mapa geral

```
ACESSO AO PAINEL
  Usuario ──< Sessao
     │
     └──< Coordenador (a conta de quem coordena)
  TentativaDeEntrada          (freio contra adivinhação de senha)

CONTEÚDO PUBLICADO
  Aviso                       (recados curtos da página inicial)
  AvisoParoquial ──1 ImagemDeAviso
  Noticia >── Usuario         (autor)
  Celebracao                  (grade de horários)
  Album ──< Foto ──1 Imagem

PASTORAIS
  Pastoral ──< Coordenador ──< EscalaNoEvento
     └──< EventoDaPastoral ──< EscalaNoEvento

CATEQUESE
  ConfiguracaoDaCatequese     (uma linha só)
  TurmaDeCatequese ──< InscricaoNaCatequese

RECEBIDO DO SITE
  Mensagem                    (formulário de contato)
```

---

## 2. Tabela por tabela

### Acesso ao painel

| Tabela | Guarda | Nota |
| --- | --- | --- |
| `usuarios` | Nome, e-mail, resumo da senha, papel, ativo | O papel nasce no **mais restrito** de propósito: um cadastro que chegue sem papel definido não deve nascer podendo tudo |
| `sessoes` | Resumo HMAC do token, validade | Guarda o **resumo**, não o token: quem lê o banco não consegue se passar por ninguém |
| `tentativas_de_entrada` | Resumo de e-mail+endereço, momento | Apagada 15 min depois. Nem e-mail nem endereço ficam em claro |

### Conteúdo publicado

| Tabela | Guarda | Nota |
| --- | --- | --- |
| `avisos` | Recado curto, ordem, ativo | Vários ao mesmo tempo, em lista na página inicial |
| `avisos_paroquiais` | Título, texto, vídeo, validade | **Um só no ar por vez.** É o comunicado que abre o site numa janela |
| `imagens_de_avisos` | Bytes da imagem do aviso | Tabela separada da galeria de propósito: cada uma apaga a sua em cascata |
| `noticias` | Slug, título, resumo, corpo, situação, autor | O autor cai para nulo se a conta for apagada — a notícia não some junto |
| `celebracoes` | Dia da semana (0–6), hora, nome, local | O dia é **número** para ordenar sem depender do idioma. A hora é **texto** porque é hora de calendário, não instante no tempo |
| `albuns` / `fotos` / `imagens` | Álbum, caminho, legenda, bytes | Ver §3 |

### Pastorais

| Tabela | Guarda | Nota |
| --- | --- | --- |
| `pastorais` | Slug, nome, descrição, contato, reuniões | O `contato` é o institucional (secretaria, sala) — não o de pessoa |
| `coordenadores` | Nome, função, telefone, e-mail, se o contato é público, se está na coordenação, conta do painel | Ver §4 |
| `eventos_de_pastoral` | Título, tipo, início, fim, local | Pertence ao grupo: `pastoralId` obrigatório, apaga em cascata. Agenda sem dono não teria quem cuidasse |
| `escalas_de_evento` | Quem serve em qual evento | `@@unique(evento, membro)` — ninguém escalado duas vezes no mesmo dia |

### Catequese

| Tabela | Guarda | Nota |
| --- | --- | --- |
| `configuracao_da_catequese` | Inscrições abertas, ano letivo, recado | **Uma linha só** (`id = "unica"`). Ver §5 |
| `turmas_de_catequese` | Nome, etapa, dia, hora, local, vagas, catequistas, ano | A etapa é **texto livre**: quem nomeia "Eucaristia I" ou "IVC 2" é a coordenação, não o código |
| `inscricoes_na_catequese` | Dados do catequizando e de quem responde, situação, consentimento | **Dado de criança.** Ver [privacidade.md](privacidade.md) |

### Recebido do site

| Tabela | Guarda |
| --- | --- |
| `mensagens` | Nome, e-mail, telefone, assunto, corpo, situação |

---

## 3. Por que as fotos ficam no banco

Em hospedagem serverless o disco é descartado a cada publicação: um arquivo
gravado em `public/` some na próxima. Guardando no banco, o envio pelo painel
funciona depois de publicado, e o backup do banco já leva as fotos junto.

Os **bytes ficam em tabela separada** (`imagens`, `imagens_de_avisos`) porque
as listagens da galeria leem `fotos` o tempo todo — um campo de bytes ali
dentro viria junto em qualquer consulta distraída que esquecesse o `select`.

Custo: ~150 KB por foto, ~150 MB para mil fotos. Exige olho no espaço
contratado.

---

## 4. `Coordenador` guarda a equipe inteira

O nome enganou mais de uma pessoa e vale explicar.

A tabela nasceu guardando só a coordenação. No mesmo dia passou a guardar **a
equipe inteira**, separada pelo campo `naCoordenacao`. Renomear arrastaria a
tabela, o serviço, duas telas e o nome de uma permissão sem mudar nada para
quem usa o site.

- `naCoordenacao = true` → coordenador, vice, adjunto. **Aparece no site.**
- `naCoordenacao = false` → equipe. Fica só no painel.

**Coordenar não dá acesso ao painel por si só.** O acesso vem do `usuarioId`,
que a secretaria preenche quando a pessoa recebe uma conta. A maior parte da
equipe fica sem conta nenhuma, e é assim que deve ser.

Esse vínculo é o que diz "fulano coordena a Liturgia". Fica aqui, e não numa
tabela à parte, para não haver duas respostas para a mesma pergunta.

---

## 5. Uma tabela de uma linha só

`configuracao_da_catequese` tem `id` fixo em `"unica"`. Parece estranho, mas a
alternativa seria um arquivo de configuração no código — e aí a coordenação da
catequese dependeria de um programador para abrir as inscrições, que é
exatamente o que este painel existe para evitar.

Quando a linha ainda não existe, o sistema devolve um padrão **fechado**. Um
sistema que estreia recebendo inscrição sem ninguém ter mandado abrir é um
sistema que recebe dado de criança por acidente.

---

## 6. O que acontece ao apagar

| Apagar | Leva junto | Deixa |
| --- | --- | --- |
| Usuário | As sessões dele | As notícias (autor vira nulo); o vínculo de coordenação (vira nulo) |
| Pastoral | Equipe, eventos e escalas | — |
| Álbum | Fotos e bytes | — |
| Aviso paroquial | A imagem dele | — |
| Turma de catequese | — (o sistema **recusa** se houver inscrição ligada) | As inscrições, com a turma em branco |
| Evento da agenda | As escalas dele | — |

A turma é o único caso em que o sistema recusa em vez de apagar em cascata: a
família se inscreveu de verdade, e a turma preferida ter sumido não apaga o
pedido. A mensagem diz quantas inscrições estão ligadas e oferece o caminho
reversível ("desmarque Mostrar no site").

---

## 7. Situações como texto, não `enum`

`status`, `categoria`, `papel` e `tipo` são colunas de texto. Vêm da época do
SQLite, que não tem `enum`. Os valores válidos são fechados em
`lib/validacao/esquemas.ts`, que é por onde **tudo** passa antes de chegar ao
banco.

Agora em Postgres poderiam virar `enum` de verdade. Fica como melhoria
possível: exigiria migração de tipo em cada coluna sem trazer ganho imediato
para as telas.

---

## 8. Migrações

Ficam em `prisma/migrations/`, em ordem cronológica. Cada uma é um arquivo SQL
gerado a partir de mudanças no `schema.prisma`.

```bash
npm run db:migrar     # cria e aplica uma migração nova (desenvolvimento)
npm run db:estudio    # abre o banco numa tela, para olhar os dados
```

Em produção, `npx prisma migrate deploy` aplica as pendentes sem gerar nada.

**Nunca editar uma migração já aplicada.** Fazer outra por cima.
