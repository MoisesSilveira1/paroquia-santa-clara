# Como conferir que o site está de pé

O projeto não tem suíte de testes automatizados. Este documento descreve o que
é conferido e **como**, para que qualquer pessoa possa refazer.

A honestidade primeiro: **a ausência de testes automatizados é a maior dívida
técnica do projeto.** Está registrada em §6.

---

## 1. As três conferências de sempre

Rodar antes de todo commit. Todas passam hoje.

```bash
npm run typecheck     # tipos — tsc --noEmit
npx eslint .          # padrões de código
npm run build         # compilação de produção
```

O `build` é o mais importante dos três: ele roda a geração de todas as páginas
estáticas e pega erro que só aparece em produção.

> `next lint` **não existe** nesta versão do Next. Use `npx eslint .`.

---

## 2. Conferência de tela

Com `npm run dev` rodando, abrir cada página e colar isto no console do
navegador:

```js
(() => {
  const d = document, de = d.documentElement, r = [];
  if (de.scrollWidth > de.clientWidth + 1)
    r.push("ESTOURO " + de.scrollWidth + ">" + de.clientWidth);
  d.querySelectorAll("img").forEach(i => {
    if (!i.hasAttribute("alt")) r.push("IMG sem alt");
  });
  d.querySelectorAll("a").forEach(a => {
    const t = (a.innerText || "").trim();
    if (!t && !a.getAttribute("aria-label")) r.push("LINK sem nome " + a.getAttribute("href"));
  });
  d.querySelectorAll("button").forEach(b => {
    if (!(b.innerText || "").trim() && !b.getAttribute("aria-label")) r.push("BOTAO sem nome");
  });
  d.querySelectorAll("input,select,textarea").forEach(f => {
    if (f.type === "hidden" || f.name.startsWith("$")) return;
    const lab = f.id && d.querySelector('label[for="' + f.id + '"]');
    if (!lab && !f.closest("label") && !f.getAttribute("aria-label"))
      r.push("CAMPO sem rotulo: " + f.name);
  });
  const hs = [...d.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(h => +h.tagName[1]);
  const n1 = hs.filter(x => x === 1).length;
  if (n1 !== 1) r.push("H1 count=" + n1);
  for (let i = 1; i < hs.length; i++)
    if (hs[i] - hs[i - 1] > 1) r.push("salto h" + hs[i - 1] + "->h" + hs[i]);
  d.querySelectorAll('a[target=_blank]').forEach(a => {
    if (!/noopener/.test(a.rel)) r.push("blank sem noopener " + a.href.slice(0, 40));
  });
  return r.length ? r : "OK";
})();
```

Rodar **duas vezes por página**: em janela larga e em 375 px (as ferramentas de
desenvolvedor do navegador emulam celular).

Páginas a conferir: `/`, `/horarios`, `/sobre`, `/pastorais`,
`/pastorais/<qualquer>`, `/missa-online`, `/noticias`, `/galeria`, `/dizimo`,
`/contato`, `/catequese`, `/povo-de-deus`, `/calendario-liturgico`,
`/aviso-paroquial`.

**Resultado em 12/09/2026:** `OK` em todas, nas duas larguras.

---

## 3. Conferência de autorização

A mais importante, porque é a que protege dado de pessoa.

Os serviços têm `import "server-only"` e não podem ser importados fora do Next.
Para testá-los num script, é preciso neutralizar isso. Criar dois arquivos
temporários na raiz:

**`stub-vazio.cjs`**
```js
module.exports = {};
```

**`stub-server-only.cjs`**
```js
const Module = require("node:module");
const original = Module._resolveFilename;
Module._resolveFilename = function (pedido, ...resto) {
  if (pedido === "server-only") return require.resolve("./stub-vazio.cjs");
  return original.call(this, pedido, ...resto);
};
```

Então escrever o teste (ex.: `verifica.ts`) e rodar:

```bash
npx tsx --require ./stub-server-only.cjs verifica.ts
```

**Apagar os três arquivos depois.** Eles não vão para o repositório.

### O que conferir

Para cada conta do banco, chamar `alcancaCatequese` e `alcancaPastoral` e
comparar com o esperado. Depois, tentar as operações proibidas e confirmar que
**estouram**:

```ts
for (const [nome, fn] of tentativas) {
  try { await fn(); console.log(`*** FALHA DE SEGURANCA: ${nome} passou!`); }
  catch (e) { console.log(`recusado em ${nome}: "${e.message}"`); }
}
```

O importante é o teste **falhar alto** quando a proteção some — por isso a
mensagem "FALHA DE SEGURANÇA", e não um `assert` silencioso.

**Resultado em 12/09/2026:** em [permissoes.md](permissoes.md) §5.

---

## 4. Conferência de formulário público

Preencher no navegador, de verdade, e conferir no banco. Não basta ver a tela
dizer "enviado".

O caminho completo, feito em 12/09/2026 para a inscrição da catequese:

1. Preencher e enviar pelo site.
2. Ler a linha gravada no banco, **campo a campo** — inclusive o
   `consentimentoEm`, que é carimbado pelo servidor.
3. Abrir o painel e confirmar que aparece, com a contagem certa.
4. **Apagar o registro de teste.**

E os casos negativos, um a um: sem consentimento, data impossível, data no
futuro, período fechado, turma inventada, envio repetido.

---

## 5. Conferência de imagem

Conferir o **arquivo** não prova nada: o otimizador do Next guarda a imagem
processada usando a URL como chave, e a URL não muda quando o arquivo muda.

```bash
# o que o navegador realmente recebe
curl -s "http://localhost:3000/_next/image?url=%2Ffotos%2Fbrasao.webp&w=256&q=75" -o /tmp/x.webp
python -c "from PIL import Image; print(Image.open('/tmp/x.webp').size)"
```

Depois de regerar imagens, limpar o cache e reiniciar:

```bash
rm -rf .next/dev/cache/images && npm run dev
```

Isto está documentado porque já custou caro: em 03/09/2026 o arquivo no disco
estava certo e a tela continuava mostrando o antigo.

---

## 6. O que falta

| Dívida | Consequência |
| --- | --- |
| **Sem testes automatizados** | Toda conferência é manual. Uma mudança pode quebrar em silêncio uma regra que ninguém pensou em reconferir |
| Sem teste de regressão de permissão | O teste de §3 é escrito na hora e apagado depois. Deveria ficar no repositório e rodar sozinho |
| Sem integração contínua | Nada roda `typecheck`/`build` automaticamente ao subir código |

**Primeiro passo recomendado**, se alguém for pagar essa dívida: transformar o
teste de autorização (§3) num arquivo permanente, com Vitest. É o que protege o
dado das pessoas — e é o mais barato de escrever, porque o método já está aqui.
