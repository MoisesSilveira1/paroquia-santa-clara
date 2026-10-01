# Acessibilidade

O que foi feito para o site servir a quem enxerga pouco, não usa mouse, ou
navega por leitor de tela — e como isso foi conferido.

Referência: **WCAG 2.1, nível AA**. Última conferência: **12/09/2026**.

Isto não é formalidade. A comunidade de uma paróquia tem muita gente idosa, e
quem procura o horário da missa às 6h da manhã costuma estar de óculos errado,
no celular, com pouca luz.

---

## 1. O que foi conferido, e como

Um script próprio percorreu **todas** as páginas públicas, em 1440×900 e em
375×812, procurando:

| Conferência | Por que importa |
| --- | --- |
| Estouro horizontal | Página que "vaza" para o lado obriga a arrastar para ler cada linha |
| Imagem sem `alt` | Leitor de tela anuncia o nome do arquivo, ou nada |
| Link ou botão sem nome | O leitor anuncia "link" e a pessoa não sabe para onde vai |
| Salto de nível de título | Quem navega por títulos perde a estrutura |
| Campo sem rótulo | O leitor não diz o que preencher |
| `target="_blank"` sem `rel="noopener"` | Segurança, e aviso de nova aba |

**Resultado: nenhum achado em nenhuma página**, em desktop e em celular.

A página da catequese, criada depois, foi conferida separadamente com o mesmo
método: sem estouro e com todos os catorze campos rotulados.

---

## 2. Decisões de acessibilidade tomadas no projeto

### O botão do YouTube pulsa, não pisca

Foi pedido "piscando". Foi entregue **pulsando** — um ciclo lento de 2
segundos.

Não é preferência estética: acima de **três flashes por segundo** há risco real
de convulsão para quem tem epilepsia fotossensível (WCAG 2.3.1). Numa paróquia
passa gente de toda idade e condição. A pulsação lenta chama a atenção do mesmo
jeito.

A animação **some por completo** para quem configurou o sistema pedindo menos
animação (`prefers-reduced-motion`).

> `app/globals.css`

### Fotos numeradas na galeria

Seis fotos do mesmo álbum tinham a **mesma** descrição. Quem navega por leitor
de tela ouvia a mesma frase seis vezes, sem saber em qual estava. Agora são
numeradas ("Foto 3 de 6 do álbum…").

Não descreve a foto — descrição de verdade depende de alguém escrever a legenda
no painel, e o campo existe para isso. Mas ao menos distingue.

### Campos de formulário com rótulo, dica e erro amarrados

O componente `Campo` amarra tudo por `aria-describedby` e `aria-invalid`, para
que quem usa leitor de tela ouça a dica e o erro **junto com o campo**, em vez
de encontrar um texto solto perdido na página.

As mensagens de erro têm `role="alert"`: são anunciadas assim que aparecem.

> `components/ui/Campo.tsx`

### O aviso que abre o site usa `<dialog>` nativo

Não é uma `<div>` fingindo ser janela. O `<dialog>` com `showModal()` dá de
graça: foco preso dentro da janela, fechar com `Esc`, e o resto da página
marcado como inerte para o leitor de tela.

> `components/AvisoDeEntrada.tsx`

### Tabelas rolam dentro do próprio quadro

Tabela larga não empurra a página inteira para o lado: cada uma rola dentro do
seu container. A página nunca estoura horizontalmente.

### Alvos de toque

Botões e links do site têm área de toque confortável no celular
(`py-2.5`/`py-3` na maioria). O botão "+" de marcar compromisso no calendário,
que aparece ao passar o mouse, fica **sempre visível** em telas sem mouse —
`[@media(hover:none)]:opacity-100`.

---

## 3. Contraste

A paleta foi escolhida com contraste em mente: azul mariano escuro (`#24466f`)
sobre branco, e texto `#1f3350` sobre fundo claro `#f7f9fc`.

O dourado (`#c9a227`) é usado em **ícones e detalhes**, não em texto corrido
sobre fundo claro — dourado sobre branco não alcança 4,5:1.

> **Pendência:** o contraste não foi medido par a par com ferramenta
> automática. Foi conferido a olho nos pares principais. Uma medição formal
> (axe, Lighthouse) está na lista de melhorias.

---

## 4. Estrutura e navegação

- **Um `<h1>` por página**, e níveis sem salto — conferido em todas.
- Marcos de página (`<header>`, `<main>`, `<nav>`, `<footer>`) usados de
  verdade, com `aria-label` nos dois `<nav>` do cabeçalho (principal e móvel)
  para o leitor distinguir um do outro.
- Seções com `aria-labelledby` apontando para o próprio título.
- `lang="pt-BR"` no documento, para o leitor de tela pronunciar em português.
- O menu do celular anuncia estado (`aria-expanded`) e muda o rótulo entre
  "Abrir menu" e "Fechar menu".

---

## 5. Tema escuro

O painel da secretaria tem tema claro e escuro. O tema é aplicado **antes da
hidratação**, por um script no `<head>`, para não piscar branco na cara de quem
usa o escuro.

O site público é sempre claro — algumas páginas ainda usam `bg-white` fixo e
inverteriam mal. É uma limitação conhecida, não um esquecimento.

---

## 6. O que falta

| Item | Situação |
| --- | --- |
| Medição formal de contraste | Conferido a olho; falta ferramenta |
| Teste com leitor de tela real (NVDA/VoiceOver) | Não feito. O script confere a estrutura, não a experiência |
| Link "pular para o conteúdo" | Não existe. Com o menu curto que o site tem, o ganho é pequeno — mas é padrão AA |
| Legendas nas fotos | O campo existe no painel e está vazio. Depende da PASCOM preencher |
| Teste em celular de verdade | Foi feito em janela emulada de 375 px. Está na lista de publicação |

---

## 7. Como refazer a conferência

Com o site rodando (`npm run dev`), abrir o console do navegador em cada página
e rodar o script descrito em [testes.md](testes.md) §2. Ele devolve `OK` ou a
lista de problemas com o elemento culpado.
