# Quem pode o quê

A regra completa de acesso ao painel. A fonte é `lib/auth/papeis.ts` — se este
documento e o código discordarem, **o código está certo e este documento está
velho**.

---

## 1. Os quatro níveis

| Nível | Quem é | Em uma frase |
| --- | --- | --- |
| **Coordenador de pastoral** | Voluntário que responde por um grupo | Cuida só da própria pastoral: a equipe e a agenda dela |
| **Administrador comum** | Secretaria | Cuida do dia a dia do site e dos cadastros, mas não apaga cadastro de pessoa |
| **Padre** | Pároco | Acesso total |
| **Administrador geral** | Quem mantém o site | Acesso total |

**Padre e administrador geral têm exatamente as mesmas permissões.** Isso é
intencional, não descuido: são contas separadas porque são pessoas diferentes e
cada uma responde pelo que faz, mas nenhuma esbarra em limite dentro do painel.

---

## 2. A matriz

| Permissão | Coordenador | Admin comum | Padre | Admin geral |
| --- | :---: | :---: | :---: | :---: |
| `conteudo.editar` — avisos, notícias, horários, pastorais, galeria, mensagens | — | ✅ | ✅ | ✅ |
| `conteudo.excluir` | — | ✅ | ✅ | ✅ |
| `equipe.propria` — equipe de pastoral | ✅ | ✅ | ✅ | ✅ |
| `agenda.propria` — reuniões e escalas | ✅ | ✅ | ✅ | ✅ |
| `coordenadores.gerenciar` — **qualquer** pastoral | — | ✅ | ✅ | ✅ |
| `coordenadores.excluir` — apagar cadastro de pessoa | — | — | ✅ | ✅ |
| `usuarios.gerenciar` — contas do painel | — | ✅ | ✅ | ✅ |
| `usuarios.excluir` | — | — | ✅ | ✅ |
| `usuarios.promover` — dar acesso total a alguém | — | — | ✅ | ✅ |

### Por que existem duas permissões de equipe

`equipe.propria` e `coordenadores.gerenciar` respondem perguntas diferentes:

- **`equipe.propria`** = "pode mexer em equipe de pastoral?"
- **`coordenadores.gerenciar`** = "pode mexer em **qualquer** pastoral?"

Quem tem a segunda dispensa a primeira, mas as duas aparecem na tabela para o
alcance ficar **dito** em vez de deduzido.

### Por que o admin comum não apaga cadastro de pessoa

Foi a regra pedida pela paróquia: o administrador da secretaria publica,
cadastra e edita, mas **apagar o registro de uma pessoa é do padre**. Para tirar
um nome do site sem depender de ninguém, existe o caminho reversível: editar a
pessoa e desmarcar "Mostrar no site".

A mesma regra vale para as inscrições da catequese: recusar é mudar o status
para "Não aceita" (o registro fica); apagar exige `coordenadores.excluir`.

### Por que o admin comum não cria conta de padre

Sem esse limite, o cadastro de usuários seria a porta dos fundos do próprio
limite dele: bastaria criar uma conta de padre, entrar com ela e ter tudo que o
papel nega. É o que `papeisAtribuiveisPor()` impede.

---

## 3. Permissão × alcance

Permissão e alcance são coisas diferentes, e o projeto as trata separadamente.

> **A permissão diz "pode mexer em equipe". O serviço diz "nesta equipe".**

O alcance depende do banco — é preciso olhar a que pastoral a conta está
ligada — e por isso não cabe numa tabela de papéis.

### Como um coordenador ganha alcance

1. A secretaria cria uma conta de nível **Coordenador de pastoral** em
   *Usuários*.
2. Em *Coordenadores e equipes*, cadastra a pessoa na pastoral dela, com **"Faz
   parte da coordenação"** marcado, e liga a conta criada no passo 1.

Sem o passo 2 a conta entra no painel e **não alcança nada** — de propósito,
porque a alternativa seria alcançar tudo.

Só conta quem está na **coordenação** e **ativo**: alguém que entrou como
membro comum da equipe, ou que saiu da coordenação, não continua mandando no
cadastro do grupo.

### Só a secretaria liga conta a pessoa

Um coordenador não pode ligar a própria conta a mais uma pastoral — seria a
porta dos fundos deste papel. Para quem não pode, o campo é **ignorado**, não
recusado: o formulário do coordenador nem o desenha, e recusar por isso travava
o cadastro inteiro (foi o que aconteceu em 03/09/2026 — ele não conseguia
incluir ninguém). Ignorar mantém o valor que já estava e não abre nada.

### As três portas usam a mesma fechadura

`alcancaPastoral()` responde por equipe, agenda **e** catequese. Três
fechaduras diferentes seriam três chances de esquecer de trancar uma.

---

## 4. O que cada nível vê no menu

| Item | Coordenador | Admin comum | Padre / geral |
| --- | :---: | :---: | :---: |
| Painel | ✅ | ✅ | ✅ |
| Aviso paroquial | — | ✅ | ✅ |
| Avisos da semana | — | ✅ | ✅ |
| Notícias e eventos | — | ✅ | ✅ |
| Horários | — | ✅ | ✅ |
| Pastorais | — | ✅ | ✅ |
| Catequese | só quem coordena a Catequese | ✅ | ✅ |
| Agenda | ✅ (a sua) | ✅ | ✅ |
| Coordenadores e equipes | ✅ (a sua) | ✅ | ✅ |
| Galeria | — | ✅ | ✅ |
| Mensagens | — | ✅ | ✅ |
| Usuários | — | ✅ | ✅ |

O item **Catequese** é o único que depende de alcance, e não só de papel: sem
isso ele apareceria para o coordenador da Liturgia, que tem a mesma permissão, e
ele clicaria num "Área restrita". O alcance é calculado no servidor (no layout
do painel) e entregue pronto ao menu, que roda no navegador.

> **Esconder item de menu é cortesia, não proteção.** Quem tranca é
> `exigirPermissao` na ação e `alcanca…` no serviço.

---

## 5. Conferido em 12/09/2026

Chamando os serviços direto, conta por conta:

```
ALCANCA    admin@santaclara.local        SUPER_ADMIN
ALCANCA    coordenador@santaclara.local  COORDENADOR  (ligado à Catequese)
bloqueado  dizimo@santaclara.local       COORDENADOR  (ligado ao Dízimo)
ALCANCA    secretaria@santaclara.local   ADMIN_COMUM
```

E o coordenador do Dízimo é recusado em `listarTurmas`, `listarInscricoes` e
`criarTurma` — não só no menu.

---

## 6. Como acrescentar um nível novo

1. Acrescentar o nome em `PAPEIS`, em `lib/auth/papeis.ts`.
2. Preencher `NOME_DO_PAPEL` e `DESCRICAO_DO_PAPEL` (a descrição aparece na tela
   de cadastro de usuários — escreva para a secretaria, não para programador).
3. Listar as permissões dele em `PERMISSOES_DO_PAPEL`.

**É só isso.** Nenhuma ação precisa ser revisitada: todas perguntam por
permissão, não por papel. Foi para isto que o desenho foi feito assim.
