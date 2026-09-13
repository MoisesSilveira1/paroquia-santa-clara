# Sistema de design

As cores, tipos e peças de interface do site — e as regras para não fazer uma
tela nova que destoe das outras.

---

## 1. A paleta

Azul mariano + dourado litúrgico. Os nomes descrevem o **papel** de cada cor,
não o tom: trocar a paleta do site inteiro é mudar os valores em
`app/globals.css`, e nada mais.

| Token | Claro | Para quê |
| --- | --- | --- |
| `principal` | `#24466f` | Cabeçalho, rodapé, botões, títulos |
| `principal-claro` | `#4a6b96` | Bordas e estados sobre o principal |
| `principal-escuro` | `#17304d` | Títulos e hover |
| `destaque` | `#c9a227` | Ícones e chamadas para ação |
| `destaque-claro` | `#f1e4b8` | Bordas suaves de cartão |
| `fundo` / `fundo-suave` | `#f7f9fc` / `#e8eef7` | Fundo da página |
| `superficie` / `superficie-suave` | `#ffffff` / `#f2f6fb` | Cartões, tabelas, modais |
| `borda` | `#dbe5f2` | Divisórias |
| `texto` / `texto-suave` | `#1f3350` / `#55708f` | Texto e texto secundário |
| `perigo` | `#a3282f` | Erro e ação destrutiva |

Mais os pares de estado: `sucesso`, `atencao`, `info`, `neutro`, cada um com
uma versão `-suave` para fundo.

> **Regra:** nunca escrever cor literal numa tela. Se falta um tom, ele entra
> no `@theme` com um nome de papel.
>
> A única exceção no projeto é o vermelho do YouTube (`#c4302b`) no rodapé —
> é a cor da marca deles, não da paróquia, e ficaria errado num token nosso.

### Tema escuro

Só o painel tem. Marcado por `data-tema="escuro"` na raiz, ele troca **apenas
os valores** dos tokens — nenhum componente muda. É o que faz o tema escuro
custar quase nada de manutenção.

O site público é sempre claro: várias páginas usam `bg-white` fixo e
inverteriam mal.

---

## 2. Tipografia

| | Fonte | Onde |
| --- | --- | --- |
| Títulos | **Merriweather** (serifada) | `h1`–`h4`, por regra global |
| Texto | **Inter** | Corpo, rótulos, botões |

As duas são carregadas na compilação e servidas pelo próprio site — o visitante
não é enviado ao Google (ver [privacidade.md](privacidade.md) §7).

A serifada nos títulos não é enfeite: dá ao site o ar institucional de uma
paróquia, e separa visualmente "o que é título" de "o que é conteúdo" sem
depender só do tamanho.

---

## 3. As peças

### Do painel — `components/ui/`

| Peça | Para quê |
| --- | --- |
| `Botao` / `BotaoIcone` | Botões, com variantes e estado de "pendente" |
| `Campo` (`CampoTexto`, `CampoArea`, `CampoSelecao`, `CampoBooleano`) | Campos com rótulo, dica e erro amarrados por ARIA |
| `Cartao` / `CartaoCabecalho` / `CartaoMetrica` | Moldura das telas e os números do resumo |
| `Tabela` + `TabelaCabecalho`, `TabelaLinha`, `TabelaCelula`… | Listagens. Rolam dentro do próprio quadro |
| `Modal` | Janela sobre a tela, com `<dialog>` nativo |
| `Alerta` | Recado com tom (sucesso, atenção, perigo, info) |
| `Selo` | Etiqueta de situação |
| `EstadoVazio` | O que mostrar quando não há nada — ver §5 |
| `BarraDeFiltros` / `Paginacao` | Busca, filtro e páginas |
| `DialogoDeExclusao` | Confirmação antes de apagar |

### Do site público — `components/`

`Header`, `Footer`, `Hero`, `Galeria`, `ContactForm`, `AvisoDeEntrada`,
`MissaCard`, `EventCard`, `AvisosSemana`, `WhatsAppButton`,
`DadosEstruturados`.

O site público usa classes nomeadas em `components/ui/estilos.ts` (`CAMPO`,
`BOTAO_PRIMARIO`, `CARTAO`…) em vez dos componentes do painel — são duas
linguagens visuais diferentes de propósito: uma para a comunidade, outra para
quem trabalha.

---

## 4. Estados de retorno

Toda ação do painel devolve o mesmo formato (`EstadoFormulario`), e toda tela
mostra os quatro estados:

| Estado | Como aparece |
| --- | --- |
| **Carregando** | O botão vira "pendente" e desabilita |
| **Vazio** | `EstadoVazio` com ícone, explicação e o botão do próximo passo |
| **Erro** | `Alerta tom="perigo"`, ou a mensagem embaixo do campo errado |
| **Sucesso** | `Alerta tom="sucesso"` no topo da tela |

**Erro de campo aparece embaixo do campo**, não num aviso solto no topo. E o
que foi digitado **volta para o formulário** — ver §6.

---

## 5. Estado vazio explica o próximo passo

Um `EstadoVazio` nunca diz só "nada aqui". Diz o que é aquilo, por que está
vazio e o que fazer:

> **Nenhuma turma cadastrada**
> Cadastre as turmas antes de abrir as inscrições: é entre elas que a família
> escolhe o horário.
> [Cadastrar a primeira]

E muda conforme o contexto: com filtro aplicado, ele diz "nenhum resultado
corresponde ao filtro" e oferece limpar, em vez de sugerir cadastrar.

---

## 6. Escrita

O texto da interface é parte do design, e tem regras:

- **Português de gente, não de sistema.** "Não foi possível concluir. Tente de
  novo; se continuar, avise quem cuida do site" — nunca "Erro 500".
- **Rótulos que perguntam**, quando é a comunidade quem preenche: "Quem
  responde por ele" em vez de "Responsável".
- **A mensagem de recusa diz a saída.** Em vez de "sem permissão": *"Excluir um
  coordenador é do padre ou do administrador geral. Peça a um deles — ou
  desmarque 'Mostrar no site', que tira o nome do ar sem apagar o cadastro."*
- **Nada de jargão** na tela: sem "registro", "entidade", "instância".
- **O que foi digitado volta.** Formulário recusado não limpa os campos —
  vale para o painel e, desde 12/09/2026, para a inscrição da catequese.

---

## 7. Responsividade

Mobile-first. Os pontos de quebra usados:

| Prefixo | A partir de | Uso |
| --- | --- | --- |
| (nenhum) | 0 | Celular |
| `sm:` | 640 px | Celular deitado |
| `lg:` | 1024 px | Tablet e notebook |
| `xl:` | 1280 px | Menu completo do site (nove itens) |

O menu do site só abre por inteiro em `xl` porque são nove itens — abaixo
disso, hambúrguer.

**Regra:** nenhuma página pode rolar para o lado. Conteúdo largo (tabelas,
calendário) rola dentro do próprio quadro.

---

## 8. Ícones

[Lucide](https://lucide.dev), sempre com `aria-hidden` quando acompanham texto
— o ícone repete o que o rótulo já diz, e o leitor de tela não precisa ouvir
duas vezes.

Quando um ícone está sozinho num botão, o botão leva `aria-label`
(`BotaoIcone` já obriga isso pelo tipo).

> **Cuidado:** a versão do lucide-react deste projeto não tem todos os ícones
> que a documentação mostra. `Youtube`, por exemplo, não existe — o projeto usa
> `MonitorPlay`. Conferir antes de importar.
