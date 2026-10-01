# Segurança

O que protege o site, como foi conferido e o que ainda depende da paróquia.

Última revisão: **12 de setembro de 2026** (ver
[auditoria-2026-09.md](auditoria-2026-09.md)).

---

## 1. Entrar no painel

### A senha nunca é guardada

O banco guarda o resultado de um cálculo irreversível, no formato
`scrypt$N$r$p$sal$hash`:

- **`scrypt`** com custo `N = 2¹⁵`. Dobrar `N` dobra o tempo e a memória para
  testar uma senha. Nos valores atuais são ~32 MB e dezenas de milissegundos
  por tentativa — o que torna a adivinhação em massa cara.
- **Sal próprio por senha.** Duas pessoas com a mesma senha geram resumos
  diferentes, e uma tabela pronta de senhas comuns não serve para nada.
- **Parâmetros embutidos** no texto guardado: dá para aumentar o custo no
  futuro sem invalidar as senhas antigas.
- **Comparação em tempo constante** (`timingSafeEqual`): comparar com `===`
  vazaria, pelo tempo de resposta, quantos bytes o atacante já acertou.

> `lib/auth/senha.ts`

### A resposta é a mesma para e-mail errado e senha errada

De propósito. Respostas diferentes contariam a quem tenta adivinhar **quais
e-mails estão cadastrados na paróquia**. Quando o e-mail não existe, o sistema
ainda gasta o tempo de um cálculo de senha — responder instantaneamente
denunciaria a ausência.

> `lib/servicos/autenticacao.ts`

### Freio contra tentativa em série

**8 erros por 15 minutos**, contados por **e-mail + endereço de rede**.

Duas decisões:

- **Por que não só pelo e-mail.** Travar só pelo e-mail criaria um jeito fácil
  de atrapalhar a paróquia: bastaria errar a senha da secretária cinco vezes
  para deixá-la de fora do painel.
- **Por que no banco.** A hospedagem liga e desliga cópias do servidor conforme
  a demanda; contagem em memória seria zerada a cada troca.

O banco guarda um **resumo** de e-mail+endereço, não os dados em claro, e apaga
as linhas 15 minutos depois. O freio é conferido **antes** do cálculo da senha —
deixar o atacante gastar nosso processador é parte do problema.

> `lib/auth/tentativas.ts`

### A sessão

| | |
| --- | --- |
| Token | 256 bits aleatórios, no cookie |
| No banco | Só o **resumo HMAC** do token |
| Duração | 7 dias |
| `httpOnly` | Sim — fora do alcance de qualquer script na página |
| `sameSite` | `lax` — não viaja em requisições vindas de outros sites |
| `secure` | Sim em produção |

O resumo usa HMAC com uma chave que só existe nas variáveis de ambiente
(`SEGREDO_SESSAO`): **quem obtiver uma cópia do banco ainda não consegue montar
cookies válidos**, porque não tem a chave.

Sessão vencida ou de conta desativada não vale, mesmo com o cookie intacto.

> `lib/auth/sessao.ts`

---

## 2. Quem pode o quê

Resumo aqui; a matriz completa está em [permissoes.md](permissoes.md).

- As ações perguntam **"você pode isto?"**, não **"quem é você?"**. A lista mora
  num lugar só: `lib/auth/papeis.ts`.
- O **alcance** (*qual* pastoral) depende do banco e é conferido no serviço,
  pela mesma função nas três portas: equipe, agenda e catequese.
- Esconder botão ou item de menu é **cortesia, não proteção**. Quem tranca é
  `exigirPermissao` na ação e `alcanca…` no serviço.
- Um administrador comum **não pode criar conta de padre ou de administrador
  geral** — senão o cadastro de usuários seria a porta dos fundos do próprio
  limite dele (`papeisAtribuiveisPor`).

**Conferido em 12/09/2026**, chamando os serviços conta por conta: o
coordenador do Dízimo é recusado em `listarTurmas`, `listarInscricoes` e
`criarTurma` da catequese — não só no menu.

---

## 3. Cabeçalhos de proteção

Enviados em toda resposta desde 11/09/2026. São instruções ao navegador; nenhum
muda o que a paróquia vê.

| Cabeçalho | O que fecha |
| --- | --- |
| `X-Frame-Options: SAMEORIGIN` | Impede que o site seja carregado dentro de um `<iframe>` de outra página. Sem isso, alguém publica um site que mostra o nosso por dentro, sobrepõe botões invisíveis e induz a secretaria a clicar no que não quer |
| `X-Content-Type-Options: nosniff` | Faz o navegador respeitar o tipo declarado em vez de adivinhar pelo conteúdo. Uma foto enviada pelo painel que "pareça" HTML não passa a ser executada |
| `Referrer-Policy: strict-origin-when-cross-origin` | Ao sair do site, manda só o domínio — não o endereço completo da tela do painel onde a pessoa estava |
| `Permissions-Policy` | A paróquia não usa câmera, microfone nem localização; declarar isso impede que um script de terceiro peça esses acessos em nosso nome |
| `Strict-Transport-Security` | Quando o site estiver em HTTPS, o navegador nunca mais tenta a versão sem cadeado deste domínio |

No `/admin`, além desses: `Cache-Control: no-store` (sem isso, o botão "voltar"
depois de sair mostra a última tela do painel a quem estiver no computador da
secretaria) e `X-Robots-Tag: noindex`.

O `poweredByHeader` está desligado: não é segredo qual versão do Next roda
aqui, mas também não precisa ser anunciado em toda resposta.

> `next.config.ts`

---

## 4. O que entra pelos formulários

**Nada é gravado sem passar por um esquema Zod** (`lib/validacao/esquemas.ts`).
O que chega de um formulário é texto vindo da rede, não um objeto confiável.

Casos que o esquema fecha e valem ser conhecidos:

- **Caixa de marcar.** Um checkbox desmarcado simplesmente **não é enviado** —
  não chega como `false`. Por isso não se usa valor padrão: ausente é `false`,
  que é o que o formulário realmente disse.
- **Campo opcional ausente.** Desde 12/09/2026, `opcional()` aceita as três
  formas de "não veio nada": vazio, `null` e ausente. Antes, um campo que a tela
  só desenha às vezes recusava o formulário inteiro (achado M-03).
- **Data que não existe.** `new Date("2026-02-31")` aceita e devolve 3 de março.
  O esquema de data de nascimento confere contra o calendário de verdade.
- **Endereço de vídeo.** Só YouTube, e o identificador é extraído antes de ir
  para o `<iframe>` — uma URL de formulário nunca entra direto no `src`.
- **Identificador vindo de `<select>`.** Também é texto da rede: o serviço
  confere que a pastoral ou a turma existe antes de gravar.
- **Escala de pessoas.** Os ids marcados são peneirados contra a equipe daquela
  pastoral — sem isso daria para escalar alguém de outro grupo, e o nome dessa
  pessoa apareceria numa escala que ela não conhece.

---

## 5. Injeção de SQL e XSS

**SQL.** Todo acesso passa pelo Prisma, que separa comando de dado. Busca por
`$queryRaw` / `$executeRaw` no projeto: **nenhuma ocorrência**.

**XSS.** O React escapa tudo que renderiza. Há duas ocorrências de
`dangerouslySetInnerHTML`, ambas com conteúdo do próprio código:

1. O script que aplica o tema do painel antes da hidratação — texto constante.
2. Os dados estruturados que o Google lê — montados de `lib/dados.ts`, com
   escape explícito de `<` para evitar que um `</script>` feche a tag.

---

## 6. Proteção contra robôs

Os formulários públicos (contato e inscrição da catequese) têm um **campo
isca**: invisível, ignorado por quem usa o site, preenchido por robôs. Quando
vem preenchido, o sistema **finge sucesso** — para não ensinar ao robô qual
campo o denunciou.

---

## 7. Riscos conhecidos, em aberto

| Risco | Situação |
| --- | --- |
| **Conta de obra `mano@santaclara.local`, senha `123456`, acesso total** | Criada a pedido para testes. **Apagar antes de publicar.** Enquanto existir, o freio do §1 é a única coisa entre ela e quem adivinhar o endereço |
| **Cinco contas de exemplo com senhas no repositório** | `admin@`, `padre@`, `secretaria@`, `coordenador@`, `dizimo@`. Apagar antes de publicar |
| **Banco no espaço pessoal do desenvolvedor** | Passar para a conta institucional da paróquia — ver [continuidade.md](continuidade.md) |
| **Sem política de senha forte** | O sistema exige 8 caracteres. Não há exigência de complexidade nem troca periódica — decisão consciente: a secretaria tem poucas contas, e regras rígidas levam a senha escrita em papel colado no monitor |
| **Sem duplo fator** | Não implementado. Proporcional ao porte hoje; reavaliar se o painel passar a guardar mais dado sensível |
| **Sem registro de auditoria** | O sistema não guarda "quem apagou o quê e quando". Há `criadoEm`/`atualizadoEm` e o autor das notícias, mas não um diário completo |

---

## 8. Se algo der errado

1. **Desativar a conta suspeita** no painel (Usuários → desmarcar "Acesso
   ativo"). Isso invalida as sessões dela na hora, porque a sessão é conferida
   contra o estado da conta a cada requisição.
2. **Trocar `SEGREDO_SESSAO`** na hospedagem. Isso derruba **todas** as sessões
   de uma vez, inclusive a de quem tiver copiado um cookie.
3. **Trocar as senhas** das demais contas.
4. Se houver suspeita de acesso ao banco, trocar também a `DATABASE_URL`
   (credencial do banco) no painel do provedor.
