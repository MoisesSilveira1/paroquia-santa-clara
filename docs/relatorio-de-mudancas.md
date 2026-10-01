# Relatório de mudanças — setembro de 2026

Tudo o que mudou na rodada de **10 a 12 de setembro de 2026**, com o motivo de
cada coisa.

O contexto é a [auditoria](auditoria-2026-09.md), pedida junto com o fechamento
do módulo da catequese.

| | |
| --- | --- |
| Ramo | `auditoria-e-catequese` |
| Commits | 8 |
| Arquivos | 36 alterados, 3.286 linhas acrescentadas |
| Migrações de banco | 1 (`catequese_e_freio_de_entrada`) |
| Estado | Typecheck, lint e build limpos |

---

## Em uma frase

Corrigimos **13 defeitos** encontrados numa varredura completa — entre eles, o
ícone da aba do site que ainda era o logotipo do Next.js e a ausência total de
freio contra tentativa de adivinhar senha — e trouxemos a **catequese** para
dentro do nosso sistema, do formulário público ao painel da coordenação.

---

## 1. Ícones e brasão

**Commit `61626a0`**

### O ícone da aba era o logotipo do Next.js

`app/favicon.ico` nunca tinha sido trocado desde a criação do projeto. O brasão
correto existia em `icon.png` e **nunca chegava a ser usado**: o navegador pede
`/favicon.ico` sozinho, e o Next o anuncia primeiro.

Agora `scripts/gerar-favicon.py` gera três arquivos a partir do brasão —
`favicon.ico` (com seis tamanhos dentro), `icon.png` de 512 e `apple-icon.png`
de 180. Conferido que o escudo continua reconhecível em 16 px.

### O brasão completo no rodapé e no login

Antes era o escudo recortado, com 64 px de altura — tamanho em que o IHS, a
cruz e as estrelas viram um borrão marrom. Foi medido em que tamanho o desenho
volta a ser legível: **144 px** no rodapé (128 no celular) e 112 no login.

Na barra lateral do painel (32 px) e nos ícones (16 px) continua o escudo
sozinho: nesses tamanhos o brasão completo não é uma versão pequena dele, é uma
mancha.

O nome da paróquia passou a ficar **abaixo** do brasão, e não ao lado — ao lado
os dois disputavam a largura da coluna, e sobrava "Assis" sozinho numa linha.

### Três medidas declaradas erradas

`Hero` dizia 900×1109 num arquivo de 900×1095; a tela de login dizia 64×64 e a
barra lateral 32×32 num arquivo de 480×542. O Next usa esses números para
reservar espaço antes de a imagem chegar — valor errado faz a página pular
quando ela carrega.

### Uma armadilha no script do brasão

O corte do escudo era um número fixo (0,8235 da altura), medido num arquivo de
origem de **900×1109** — que já não é o atual (**1564×1932**). Era uma régua
velha aplicada a um desenho novo: funcionava por sorte, e a próxima regeração
podia serrar a ponta do escudo.

Trocado por uma regra que se mede sozinha: *o escudo afina até a ponta; a haste
da cruz é um bastão de largura constante* — é a forma que separa os dois.

---

## 2. Sitemap e galeria

**Commit `910627e`**

Três páginas criadas entre 03 e 10 de setembro nunca foram registradas em
`lib/site.ts`: o folheto **O Povo de Deus**, o **calendário litúrgico** e o
**aviso paroquial**. Como é essa lista que vira o `sitemap.xml`, o Google só
chegava a elas por sorte — e o folheto é das coisas que mais gente procura
depois do horário da missa.

As oito páginas de pastoral também não entravam, por outro motivo: não são
fixas, vêm do banco. O sitemap passa a montá-las a partir da **mesma consulta**
que a página pública usa.

Na galeria, seis fotos do mesmo álbum tinham descrição idêntica para leitor de
tela. Agora vão numeradas.

---

## 3. Espaços da paróquia e choque de horário

**Commit `51dcecc`**

A lista de lugares do formulário da agenda era chute ("Salão paroquial", "Sala
1", "Sala 2"). Os de verdade apareceram no calendário da própria catequese:
**Nave, Auditório Santa Clara, Centro Catequético, Estacionamento**.

O que muda de verdade: marcar reunião num espaço que outra pastoral já reservou
passa a ser **recusado**, dizendo qual grupo está lá e em que horário.

A conferência precisa ficar no serviço porque o choque acontece **entre**
pastorais, e cada coordenador só enxerga a agenda da sua — quem marca no
Auditório não tem como ver que a Liturgia já o reservou.

Detalhes: encostar não é chocar (uma reunião que termina às 20h e outra que
começa às 20h convivem); sem hora de término, conta-se uma hora; o
estacionamento fica fora da conta, porque comporta várias coisas ao mesmo
tempo.

---

## 4. Cabeçalhos de segurança

**Commit `6999802`**

O site não enviava **nenhum**. Agora são cinco em toda resposta, mais
`no-store` e `noindex` no `/admin`, e o `poweredByHeader` desligado.

O que cada um fecha está em [seguranca.md](seguranca.md) §3.

---

## 5. Freio contra adivinhação de senha

**Commit `9c8d974`** (junto da base da catequese, porque compartilham uma
migração)

Nada impedia um programa de testar milhares de senhas na tela de entrada. E há
hoje no ar uma conta de obra com senha `123456` e acesso total.

Agora: **8 erros por 15 minutos**, contados por e-mail + endereço de rede,
guardados no banco (a hospedagem liga e desliga cópias do servidor; contagem em
memória seria zerada a cada troca). O banco guarda um resumo, não os dados em
claro, e apaga as linhas depois.

Contar também o endereço evita um efeito colateral feio: travar só pelo e-mail
deixaria qualquer um trancar a secretária fora do painel de propósito.

---

## 6. A catequese

**Commits `9c8d974`, `0fec910`, `20a344e`**

Fecha o item 3 da lista. O caminho inteiro funciona: a família preenche no
site, o pedido cai no banco, aparece no painel da coordenação.

Foram trazidos o **período de inscrição**, as **turmas** e as **inscrições**.
Continuam no sistema dos catequistas — e ligados por link — a capela virtual, a
camiseta da crisma e o cadastro de padrinhos: são telas que nunca vimos por
dentro, e um palpite com cara de sistema pronto é pior que não ter.

**Nenhum papel novo foi inventado.** A catequese é uma pastoral, e quem cuida
dela é a secretaria ou o coordenador ligado a ela. O alcance reaproveita a
mesma função da equipe e da agenda.

O detalhe está em [catequese.md](catequese.md).

### Dois bugs encontrados ao testar

**O ajudante `opcional()` recusava campo ausente.** Aceitava vazio e `null`,
mas não a chave ausente — e é exatamente isso que um campo condicional faz.
O campo de padrinho fica atrás de um botão; sem abri-lo, o formulário **inteiro**
era recusado com `expected string, received undefined`, apontando um campo que
a pessoa nem viu.

Nunca apareceu no painel porque lá todos os campos estão sempre desenhados. O
ajudante é usado por quase todos os formulários do site, então o conserto vale
para todos.

**O formulário voltava vazio quando dava erro.** São catorze campos. Obrigar
uma mãe a redigitar tudo por causa de um e-mail com erro de digitação, no
celular, é motivo suficiente para desistir — e a paróquia perde a inscrição sem
saber que perdeu. Agora o que foi digitado volta, inclusive o aceite de uso dos
dados.

---

## 7. Documentação

**Commit desta entrega**

Sete documentos novos, escritos como para uma auditoria externa:

| Documento | O que responde |
| --- | --- |
| [auditoria-2026-09.md](auditoria-2026-09.md) | O que foi conferido, o que se achou, como foi corrigido |
| [arquitetura.md](arquitetura.md) | Como o site é organizado e **por quê** |
| [modelo-de-dados.md](modelo-de-dados.md) | As 19 tabelas e o que acontece ao apagar |
| [seguranca.md](seguranca.md) | O que protege, e o que ainda é risco conhecido |
| [permissoes.md](permissoes.md) | A matriz de quem pode o quê |
| [privacidade.md](privacidade.md) | Que dado pessoal existe, e o de criança em particular |
| [acessibilidade.md](acessibilidade.md) | O que foi feito para quem enxerga pouco ou usa leitor de tela |
| [design-system.md](design-system.md) | Cores, tipos, peças e regras de escrita |
| [catequese.md](catequese.md) | O módulo, e o que ficou de fora |
| [testes.md](testes.md) | Como refazer cada conferência |

---

## 8. O que NÃO foi feito, e por quê

| | Por quê |
| --- | --- |
| Testes automatizados | Fora do alcance desta rodada. É a maior dívida do projeto, e está registrada em [testes.md](testes.md) §6 |
| Página de Política de Privacidade | Precisa de decisão da paróquia sobre prazos de guarda. Registrada em [privacidade.md](privacidade.md) §5 |
| As três telas restantes da catequese | Dependem de acesso à área logada do sistema do coordenador |
| Medição formal de contraste | Conferido a olho; falta ferramenta |
| Apagar as contas de obra | É decisão do responsável, e o site ainda não foi publicado |

---

## 9. O que fazer agora

1. Conferir o site rodando `npm run dev` — principalmente `/catequese` e
   `/admin/catequese`.
2. Se aprovar, juntar o ramo `auditoria-e-catequese` ao `main`.
3. Falar com o coordenador da catequese sobre o que foi trazido para cá.
4. Seguir a [lista de publicação](checklist-publicacao.md), que ganhou itens
   novos nesta rodada.
