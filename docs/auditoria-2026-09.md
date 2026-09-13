# Auditoria do site — setembro de 2026

Varredura completa do código e das telas, feita em **10 a 12 de setembro de
2026**, a pedido do responsável pelo site. Este documento registra o que foi
conferido, o que foi encontrado, o que foi corrigido e o que continua aberto.

Quem for auditar isto depois deve conseguir refazer cada conferência sem
depender de ninguém: onde há um número, ele foi medido; onde há uma
afirmação, está dito como ela foi verificada.

---

## Resumo

| | |
| --- | --- |
| Período | 10 a 12 de setembro de 2026 |
| Alcance | Site público, painel da secretaria, banco de dados, scripts |
| Achados | **13** — 1 alto, 4 médios, 8 baixos |
| Corrigidos | **13** |
| Em aberto | 0 achados; 3 pendências que dependem da paróquia (ver §6) |
| Falsos alarmes | 2 (registrados em §5, de propósito) |

Nenhum achado indicava vazamento de dado ou invasão. O de severidade alta é
uma porta que estava **aberta sem ninguém ter passado por ela**.

---

## 1. O que foi conferido, e como

| Frente | Como foi conferido |
| --- | --- |
| Tipos | `npx tsc --noEmit` — sem erros |
| Padrões de código | `npx eslint .` — sem erros |
| Compilação | `npx next build` — 34 rotas geradas |
| Acessibilidade e layout | Script próprio em todas as páginas públicas: estouro horizontal, imagem sem `alt`, link sem nome, botão sem nome, salto de nível de título, `target="_blank"` sem `rel="noopener"` |
| Telas em celular | Mesmo script com janela de 375×812 |
| Autorização | Chamada direta aos serviços, conta por conta, conferindo quem alcança o quê (§3.1) |
| Privacidade | Conferido que a consulta que alimenta o site público não devolve dado pessoal |
| Imagens | Medição pixel a pixel dos arquivos e do que o otimizador entrega ao navegador |
| Injeção de SQL | Busca por `$queryRaw` / `$executeRaw` — nenhuma ocorrência; todo acesso passa pelo Prisma, que separa comando de dado |
| XSS | Busca por `dangerouslySetInnerHTML` — duas ocorrências, ambas com conteúdo do próprio código, uma delas com escape explícito de `<` |

---

## 2. Achados por severidade

A severidade considera **o dano se explorado** e **a chance de acontecer**,
não o esforço do conserto.

### 🔴 Alto

#### A-01 — Nada impedia tentar adivinhar senha em série

**O que era.** A tela de entrada aceitava tentativas ilimitadas. O cálculo da
senha (`scrypt`) já custa dezenas de milissegundos, o que atrasa um atacante —
mas atrasar não é impedir: uma senha curta cai em minutos mesmo assim.

**Por que é alto.** O painel dá acesso aos dados de contato de toda a
comunidade que já escreveu pelo formulário, aos telefones dos coordenadores e,
desde esta rodada, às fichas de inscrição da catequese — que contêm nome e data
de nascimento de crianças. Além disso, existe hoje no ar uma conta de obra com
senha `123456` (ver §6).

**O que foi feito.** Freio de 8 erros por 15 minutos, contados por **e-mail +
endereço de rede**, guardado no banco.

Duas decisões que valem ser lidas:

- **Por que não só pelo e-mail.** Travar só pelo e-mail criaria um jeito fácil
  de atrapalhar a paróquia: bastaria errar a senha da secretária cinco vezes de
  propósito para deixá-la de fora do painel.
- **Por que no banco e não na memória.** A hospedagem liga e desliga cópias do
  servidor conforme a demanda. Uma contagem na memória seria zerada a cada
  troca, e o atacante só precisaria insistir até cair numa cópia nova.

O banco guarda um resumo de e-mail+endereço, não os dados em claro, e apaga as
linhas 15 minutos depois.

**Onde:** `lib/auth/tentativas.ts`, `lib/servicos/autenticacao.ts`.

---

### 🟡 Médio

#### M-01 — O ícone da aba do site era o logotipo do Next.js

**O que era.** O arquivo `app/favicon.ico` nunca tinha sido trocado desde a
criação do projeto: era o triângulo preto que vem no exemplo do Next.js. O
brasão correto existia em `app/icon.png` e **nunca chegava a ser usado**,
porque o navegador pede `/favicon.ico` sozinho e o Next o anuncia primeiro.

**Por que importa.** É a identidade da paróquia numa aba de navegador — o
lugar onde o site é reconhecido entre vinte outros. Publicar assim seria
publicar com a marca de outra empresa.

**O que foi feito.** `scripts/gerar-favicon.py` passa a gerar três arquivos a
partir do brasão: `favicon.ico` (com 16, 32, 48, 64, 128 e 256 px dentro),
`icon.png` de 512 e `apple-icon.png` de 180. Conferido que o escudo continua
reconhecível em 16 px.

#### M-02 — Nenhum cabeçalho de proteção era enviado

**O que era.** O site não enviava nenhum cabeçalho de segurança. Cada um deles
fecha uma porta que fica aberta por omissão — ver [seguranca.md](seguranca.md)
§3 para o que cada um faz.

**O que foi feito.** Cinco cabeçalhos em toda resposta, mais `no-store` e
`noindex` no `/admin`, e o `poweredByHeader` desligado.

**Onde:** `next.config.ts`.

#### M-03 — Campo "opcional" recusava campo ausente

**O que era.** O ajudante `opcional()` de `lib/validacao/esquemas.ts` aceitava
string vazia e `null`, mas **não aceitava a chave ausente** — e é exatamente
isso que um campo condicional faz: quando a tela não o desenha, ele não vai no
envio.

**Como apareceu.** No formulário de inscrição da catequese, o campo de padrinho
fica atrás de um botão. Sem abri-lo, o formulário **inteiro** era recusado com
`expected string, received undefined` — mensagem que não é para ninguém ler,
apontando um campo que a pessoa nem viu na tela.

**Por que passou despercebido.** Nos formulários do painel todos os campos
estão sempre desenhados. Bastou um campo condicional para o defeito surgir.

**Alcance.** O ajudante é usado por quase todos os esquemas do site — avisos,
notícias, celebrações, coordenadores, agenda, turmas. O conserto vale para
todos. Conferido que os limites de tamanho continuam valendo e que `""`
continua virando `null`.

#### M-04 — O formulário de inscrição voltava vazio quando dava erro

**O que era.** Recusada a validação, o React limpava os catorze campos.

**Por que é médio, e não cosmético.** Quem preenche é uma família, muitas vezes
no celular. Obrigar a redigitar tudo por causa de um e-mail com erro de digitação
é motivo suficiente para desistir — e a paróquia perde a inscrição sem nunca
saber que a perdeu.

**O que foi feito.** O servidor devolve o que foi digitado, como as telas do
painel já faziam. O aceite de uso dos dados também volta marcado: quem
concordou e só errou o e-mail não deve ser obrigado a concordar de novo.

---

### 🟢 Baixo

| Nº | Achado | Correção |
| --- | --- | --- |
| B-01 | `Hero` declarava o brasão como 900×1109; o arquivo tem 900×1095 | Medida real. O Next usa esses números para reservar espaço; o valor errado faz a página pular quando a imagem carrega |
| B-02 | Tela de login declarava o brasão como 64×64 num arquivo 480×542 | Medidas reais, tamanho na tela pelo CSS |
| B-03 | Barra lateral do painel declarava 32×32 no mesmo arquivo | Idem |
| B-04 | Rodapé baixava uma cópia de 1080 px para exibir 57 px | `sizes` declarado |
| B-05 | Brasão pequeno demais para ser reconhecido (64 px) | 144 px no rodapé, 112 no login — medido em que tamanho o desenho volta a ser legível |
| B-06 | Três páginas novas nunca entraram no `sitemap.xml` | `/povo-de-deus`, `/calendario-liturgico` e `/aviso-paroquial` registradas |
| B-07 | As 8 páginas de pastoral também não entravam | O sitemap passa a montá-las a partir da mesma consulta que a página pública usa |
| B-08 | Fotos do mesmo álbum tinham descrição idêntica para leitor de tela | Numeradas |

---

## 3. Conferências que passaram

Registradas porque "não achamos nada" só vale se estiver dito **onde** se
procurou.

### 3.1 Autorização por papel e por alcance

Chamando os serviços direto, conta por conta:

```
ALCANCA    admin@santaclara.local        SUPER_ADMIN
ALCANCA    coordenador@santaclara.local  COORDENADOR  (ligado à Catequese)
bloqueado  dizimo@santaclara.local       COORDENADOR  (ligado ao Dízimo)
ALCANCA    secretaria@santaclara.local   ADMIN_COMUM
```

E o coordenador do Dízimo é recusado em `listarTurmas`, `listarInscricoes` e
`criarTurma` — **não só no menu**. Esconder item de menu é cortesia; quem
tranca é o serviço.

### 3.2 Privacidade na origem

A consulta que alimenta a página pública da catequese
(`situacaoDasInscricoes`) devolve apenas turmas, horários e catequistas.
Nenhum nome, nenhuma data de nascimento, nenhum telefone de quem se inscreveu.
Conferido no retorno da função, não na tela.

O mesmo desenho vale para os coordenadores: telefone e e-mail só saem do banco
se a pessoa autorizou (`contatoPublico`), e o corte é na consulta.

### 3.3 Travas do formulário público

Todas recusam, conferido chamando o serviço direto:

- sem o aceite de uso dos dados;
- data que não existe no calendário (31/02 — `new Date` aceitaria e devolveria
  3 de março);
- data de nascimento no futuro;
- período de inscrição fechado;
- turma inventada, ou de outro ano;
- envio repetido da mesma criança no mesmo ano.

### 3.4 Acessibilidade e layout

Todas as páginas públicas passaram, em 1440 px e em 375 px, sem nenhum achado:
sem estouro horizontal, sem imagem sem `alt`, sem link ou botão sem nome, sem
salto de nível de título, sem `target="_blank"` sem `rel="noopener"`.

### 3.5 Injeção de SQL e XSS

Nenhuma consulta crua no projeto; todo acesso ao banco passa pelo Prisma. As
duas ocorrências de `dangerouslySetInnerHTML` usam conteúdo do próprio código
(o script de tema do painel e os dados estruturados do Google), e a segunda
escapa `<` explicitamente.

---

## 4. O que mudou por causa da auditoria

Sete commits, 36 arquivos, no ramo `auditoria-e-catequese`. O detalhe está em
[relatorio-de-mudancas.md](relatorio-de-mudancas.md).

---

## 5. Falsos alarmes

Registrados de propósito: um relatório que só lista acertos esconde como o
trabalho foi feito.

**Foto em branco na galeria.** Uma miniatura apareceu vazia numa captura de
tela. Era carregamento preguiçoso ainda em curso — conferido que as doze fotos
têm brilho e contraste normais e que todas carregam.

**Escudo do brasão cortado.** Concluí, olhando uma miniatura que eu mesmo
montei, que a ponta de baixo do escudo estava serrada. Refiz o recorte e
comparei pixel a pixel com a versão anterior: **eram iguais**. O escudo nunca
esteve cortado; a leitura da miniatura é que estava errada.

Sobrou disso um achado verdadeiro: o script que gera o brasão cortava o escudo
num número fixo, medido num arquivo de origem de 900×1109 que **já não é o
atual** (1564×1932). Funcionava por sorte. Foi trocado por uma regra que se
mede sozinha — o escudo afina até a ponta, a haste da cruz é um bastão de
largura constante, e é a forma que separa os dois.

---

## 6. Em aberto

Nenhum achado da auditoria continua aberto. Estas três pendências dependem da
paróquia e estão na [lista de publicação](checklist-publicacao.md):

1. **Contas de obra no ar.** `mano@santaclara.local` (senha `123456`, acesso
   total) e cinco contas de exemplo cujas senhas estão no repositório. Precisam
   ser apagadas antes de o site ir ao ar. **Enquanto existirem, o freio do
   achado A-01 é a única coisa entre elas e quem adivinhar o endereço.**
2. **Dados fictícios.** Quatro sacramentos marcados `DEMO` e os dados bancários
   do dízimo ainda por confirmar.
3. **Registros de demonstração.** A turma "Eucaristia I — sábado de manhã", o
   período de inscrição aberto e os cadastros marcados `(exemplo)`.

---

## 7. Como refazer esta auditoria

```bash
npm run typecheck     # tipos
npx eslint .          # padrões
npm run build         # compilação
```

Para as conferências de tela e de autorização, ver
[testes.md](testes.md), que descreve o método e os scripts usados.
