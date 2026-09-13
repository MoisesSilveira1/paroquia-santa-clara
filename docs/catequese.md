# Catequese

O módulo da catequese: o que é nosso, o que continua no sistema dos
catequistas, e por quê.

Feito em **11 e 12 de setembro de 2026**.

---

## 1. O ponto de partida

A catequese da paróquia roda num sistema à parte, em
`catequeseparoquiasantaclara.com`, feito pelo coordenador da catequese
(Jailson Cabral de Lima) com ajuda de outra IA. O rodapé de lá diz
"© 2026 Jailson Cabral de Lima. Todos os direitos reservados."

A decisão do responsável pelo site foi trazer isso para cá, **mantendo o mesmo
jeito de funcionar**, para a paróquia não depender de dois sistemas com duas
senhas e dois donos. Com uma condição explícita: *"sem mudar muito até a
aprovação do coordenador da catequese."*

---

## 2. O que foi trazido, e o que não foi

| | Onde está | Por quê |
| --- | --- | --- |
| **Período de inscrição** (abrir/fechar) | ✅ Aqui | É o interruptor que a comunidade sente |
| **Turmas** — dia, hora, local, catequistas, vagas | ✅ Aqui | É o que o site precisa oferecer a quem se inscreve |
| **Inscrição nova e renovação** | ✅ Aqui | O formulário público |
| **Calendário dos encontros** | ✅ Aqui (na Agenda) | Já existia para todas as pastorais |
| Capela virtual | ❌ Lá | §3 |
| Camiseta da Crisma | ❌ Lá | §3 |
| Cadastro de padrinhos | ❌ Lá | §3 |

---

## 3. Por que três coisas não foram copiadas

**Porque nunca vimos essas telas por dentro.**

Para copiar fielmente seria preciso entrar na área logada do sistema deles.
Sem isso, o que sairia seria um palpite com cara de sistema pronto — e um
palpite com cara de sistema pronto é **pior que não ter**: a comunidade
usaria, a coordenação confiaria, e só depois se descobriria que o modelo está
errado.

As três continuam ligadas por link, na página pública da catequese.

Elas também são periféricas: a capela virtual é uma caixa de intenções de
oração, a camiseta é uma escolha de tamanho, e o padrinho já é perguntado no
nosso formulário de inscrição (campo opcional).

> **Para destravar:** falar com o coordenador da catequese e obter um acesso de
> coordenador ao sistema dele, ou prints da área logada.

---

## 4. Quem cuida

**Nenhum papel novo foi inventado.** A catequese *é* uma pastoral, então quem
cuida dela é quem já cuidaria:

- a **secretaria** (que alcança qualquer pastoral), e
- o **coordenador ligado à pastoral "Catequese"**.

O alcance reaproveita `alcancaPastoral()` — a mesma função da equipe e da
agenda. Três portas, uma fechadura.

### Como dar acesso ao coordenador da catequese

1. Em *Usuários*, criar a conta dele com nível **Coordenador de pastoral**.
2. Em *Coordenadores e equipes*, cadastrá-lo na pastoral **Catequese**, com
   "Faz parte da coordenação" marcado, e ligar a conta do passo 1.

Só então o item **Catequese** aparece no menu dele.

**Conferido em 12/09/2026:** o coordenador do Dízimo é recusado em
`listarTurmas`, `listarInscricoes` e `criarTurma` — não só no menu.

---

## 5. Como funciona, na prática

### Para a coordenação (painel → Catequese)

A tela tem três blocos, nesta ordem de propósito:

1. **Período de inscrição** — o interruptor. Fechado, o formulário some do site
   **e a rota recusa envio**. As duas coisas, não só a primeira: esconder o
   botão não fecha a porta.
2. **Turmas** — as do ano corrente aparecem no site.
3. **Inscrições recebidas** — os pedidos, com a ficha fechada por padrão.

### Para a família (site → Catequese)

Com o período aberto, o formulário aparece na própria página. Preenche, envia,
e a coordenação recebe. A inscrição **não é matrícula**: é um pedido, que a
coordenação confirma depois de conferir documento e falar com a família. Por
isso o status nasce "Recebida".

### O ciclo de uma inscrição

```
  Recebida  →  Em análise  →  Confirmada
                     ↓
                Não aceita
```

Recusar é mudar o status — **o registro fica**. Apagar de vez exige o padre ou
o administrador geral, porque é a ficha de uma criança.

---

## 6. Decisões que valem ser conhecidas

### A etapa é texto livre

Cada paróquia nomeia as suas de um jeito — "Eucaristia I", "IVC 2", "Crisma
Jovens". Engessar numa lista fechada no código obrigaria a mexer no sistema
para acompanhar a caminhada da comunidade. **Quem nomeia é a coordenação.**

### A turma é opcional na inscrição

Muita gente se inscreve sem saber ainda qual horário dá. Obrigar a escolha
faria a família chutar — e chute vira telefonema para a secretaria depois.

### As vagas não bloqueiam

Turma cheia aparece marcada, no site e no painel, mas **não impede** a
inscrição. Quem decide se abre exceção é a coordenação, olhando caso a caso.

### O período nasce fechado

Quando ainda não há configuração gravada, o padrão é **fechado**. Um sistema
que estreia recebendo inscrição sem ninguém ter mandado abrir é um sistema que
recebe dado de criança por acidente.

### "Não aceita" é cinza, não vermelho

Vermelho é a cor de erro no resto do painel, e faria uma família recusada
parecer um defeito do sistema. Recusar é decisão da coordenação, quase sempre
por falta de vaga ou de documento.

---

## 7. As travas do formulário público

Conferidas uma a uma em 12/09/2026, chamando o serviço direto. Todas recusam:

| Trava | Mensagem |
| --- | --- |
| Sem o aceite de uso dos dados | "Para enviar, é preciso concordar com o uso dos dados da inscrição." |
| Data que não existe (31/02) | "Essa data não existe no calendário." |
| Nascimento no futuro | "A data de nascimento está no futuro." |
| Período fechado | "As inscrições da catequese não estão abertas no momento." |
| Turma inventada, ou de outro ano | "A turma escolhida não está mais disponível." |
| Envio repetido da mesma criança | "Já recebemos uma inscrição para \<nome\> em \<ano\>." |

A de data merece explicação: `new Date("2026-02-31")` **aceita** e devolve 3 de
março. Data trocada num cadastro de catequese manda a criança para a turma
errada.

---

## 8. Privacidade

É o único lugar do site que guarda **dado de criança**. O tratamento completo
está em [privacidade.md](privacidade.md) §2. Em resumo:

- consentimento obrigatório, com a data carimbada **pelo servidor**;
- nenhuma consulta pública à tabela de inscrições — conferido no retorno da
  função que alimenta o site;
- os campos são gravados **um a um**, não espalhados: o que se grava tem de ser
  decisão explícita;
- aviso na tela do painel, não só na documentação;
- a ficha completa fica fechada até a coordenação clicar.

---

## 9. Onde está o código

| Arquivo | O quê |
| --- | --- |
| `lib/servicos/catequese.ts` | Toda a regra: turmas, período, inscrições, alcance |
| `lib/validacao/esquemas.ts` | Os formatos aceitos |
| `app/admin/(painel)/catequese/` | A tela da coordenação |
| `app/(site)/catequese/` | A página pública e o formulário |
| `lib/dados.ts` → `catequese` | O que continua no sistema deles |

---

## 10. O que fazer antes de publicar

- [ ] Falar com o coordenador da catequese sobre o que foi trazido para cá.
- [ ] Decidir se as três telas restantes vêm também (precisa do acesso à área
      logada dele).
- [ ] Apagar a turma de demonstração **"Eucaristia I — sábado de manhã"**.
- [ ] Fechar o período de inscrição, ou ajustar o ano e o recado.
- [ ] Cadastrar as turmas reais.
- [ ] Criar a conta do coordenador e ligá-la à pastoral Catequese.
