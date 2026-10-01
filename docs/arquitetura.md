# Arquitetura

Como o site é organizado por dentro, e **por que** de cada decisão. Escrito
para quem vai mexer no código depois — inclusive quem nunca viu este projeto.

---

## 1. As três camadas

Todo caminho que grava alguma coisa passa pelas três, nesta ordem. Nenhuma
pula a seguinte.

```
  TELA                 AÇÃO                    SERVIÇO
  page.tsx             acoes.ts                lib/servicos/*.ts
  Gerenciador*.tsx     "use server"            import "server-only"

  desenha              confere quem é          confere se PODE
  o formulário         valida o que chegou     fala com o banco
                       traduz o erro
```

| Camada | Pode | Não pode |
| --- | --- | --- |
| **Tela** | Desenhar, esconder botão por permissão | Falar com o banco |
| **Ação** | Exigir sessão e permissão, validar com Zod | Conter regra de negócio |
| **Serviço** | Regra de negócio, alcance, consulta | Conhecer HTML ou formulário |

**Por que a separação importa.** Esconder um botão na tela não é proteção:
qualquer pessoa pode enviar o mesmo POST que o botão enviaria, sem passar pela
interface. Por isso toda ação confere de novo, e o serviço confere uma terceira
vez o que depende de dado do banco.

O `import "server-only"` no topo de cada serviço é o que garante isso
mecanicamente: se alguém importar um serviço num componente do navegador, o
projeto **não compila**.

---

## 2. Permissão diz "pode X"; o serviço diz "este X"

É a decisão estrutural mais importante do projeto.

As ações não perguntam *"você é o padre?"*. Perguntam *"você pode mexer em
equipe de pastoral?"*. A lista de quem pode o quê mora num lugar só:
`lib/auth/papeis.ts`.

```ts
const quem = await exigirPermissao("equipe.propria");   // pode mexer em EQUIPE
await atualizarCoordenador(dados, quem);                 // o serviço diz em QUAL
```

**Por quê.** Com dois papéis dava para comparar texto solto em cada ação. Com
quatro, qualquer tela nova que alguém esquecesse de proteger viraria um buraco.
Assim, criar um quinto papel é mexer só na tabela de `papeis.ts` — nenhuma ação
precisa ser revisitada, e nenhuma fica para trás por esquecimento.

O alcance (*qual* pastoral) não cabe na permissão porque depende do banco: é
preciso olhar a que pastoral a conta está ligada. Isso fica em
`alcancaPastoral()`, e as três portas que precisam dele — equipe, agenda e
catequese — usam **a mesma função**. Três fechaduras diferentes seriam três
chances de esquecer de trancar uma.

Detalhe completo em [permissoes.md](permissoes.md).

---

## 3. Privacidade na consulta, não na tela

Quando um dado não pode ser público, ele **não sai do banco**.

```ts
// lib/servicos/coordenadores.ts
telefone: linha.contatoPublico ? linha.telefone : null,
```

**Por que não filtrar na tela.** Um `console.log` esquecido, um cartão novo ou
uma mudança distraída de layout vazaria o número de alguém. Filtrando na
consulta, a página nunca recebe o que não pode mostrar — e não há como mostrar
o que não se recebeu.

O mesmo vale para a catequese: a função que alimenta a página pública devolve
turmas e horários, e nenhum dado de quem se inscreveu.

---

## 4. Rotas

```
app/
├── (site)/          páginas públicas — cabeçalho, rodapé, botão do WhatsApp
├── admin/
│   ├── entrar/      tela de login (fora da moldura do painel)
│   └── (painel)/    telas logadas — menu lateral, exige sessão no layout
├── imagens/         entrega os bytes das fotos guardadas no banco
├── sitemap.ts       montado a partir de lib/site.ts + pastorais do banco
└── robots.ts
```

Os parênteses são **grupos de rota**: organizam os arquivos e dão molduras
diferentes sem aparecer no endereço. `/admin/entrar` fica fora de `(painel)`
porque não deve ter menu lateral — nem sessão.

---

## 5. Onde mora cada coisa

| Pasta | O que guarda |
| --- | --- |
| `lib/auth/` | Sessão, senha, permissões, freio de entrada |
| `lib/servicos/` | Regra de negócio. **A única camada que fala com o banco** |
| `lib/validacao/` | Esquemas Zod — o formato de tudo que entra |
| `lib/agenda/` | Fuso horário e cálculo do mês do calendário |
| `lib/liturgia/` | Calendário litúrgico, calculado (sem rede, sem tabela) |
| `lib/paroquia/` | Os espaços físicos da paróquia |
| `lib/dados.ts` | O que é fixo: endereço, telefone, horários de missa |
| `components/ui/` | Peças de interface reaproveitáveis |
| `components/admin/` | Moldura do painel |
| `docs/` | Esta documentação |
| `scripts/` | Ferramentas de manutenção (imagens, importação) |

---

## 6. Decisões que merecem explicação

### As fotos ficam no banco, não em arquivos

Em hospedagem serverless o disco é descartado a cada publicação — um arquivo
gravado em `public/` some na próxima. Guardando no banco, o envio pelo painel
funciona depois de publicado e o backup do banco já leva as fotos junto.

O custo é espaço: cerca de 150 KB por foto, ~150 MB para mil fotos. Os bytes
ficam em tabela separada (`Imagem`, `ImagemDeAviso`) para que uma consulta
distraída à listagem não os traga junto.

### O calendário litúrgico é calculado, não consultado

`lib/liturgia/calendario.ts` calcula a Páscoa (algoritmo de Meeus/Jones/Butcher)
e dela deriva o ano inteiro. Sem rede, sem tabela, sem depender de ninguém
manter um arquivo atualizado. Conferido contra Páscoas conhecidas (2024, 2025,
2026, 2027, 2038) e contra os nomes dos domingos publicados pela Arquidiocese.

### O folheto é lido da Arquidiocese, não copiado

Copiar criaria duas versões da verdade, e a nossa envelheceria calada — as
edições marcadas "Prova Final" são corrigidas depois. A leitura tem lista de
endereços permitidos e, se falhar, a página mostra um link em vez de erro.

### O horário é sempre o de Brasília

`new Date("2026-09-10T19:30:00")` usa o fuso do **servidor**. Em produção (UTC),
uma reunião de 19:30 apareceria como 16:30. `lib/agenda/fuso.ts` converte
sempre para `America/Sao_Paulo`, e foi conferido sob `TZ=UTC`, inclusive no
horário de verão de 2018.

### Os campos de situação são texto, não `enum`

Herança da época do SQLite. Os valores válidos são fechados em
`lib/validacao/esquemas.ts`, que é por onde tudo passa. Virar `enum` de banco
hoje exigiria uma migração de tipo em cada coluna sem ganho imediato — fica
anotado como melhoria possível, não como dívida urgente.

---

## 7. Versão do Next.js

Este projeto usa uma versão do Next.js com mudanças em relação ao que é comum
encontrar em tutoriais. **Antes de escrever código, leia o guia correspondente
em `node_modules/next/dist/docs/`** — é o que o `AGENTS.md` na raiz determina.

Dois exemplos que já mordem: rotas dinâmicas recebem
`params: Promise<{ slug: string }>` (com `await`), e `next lint` não existe mais
(use `npx eslint .`).
