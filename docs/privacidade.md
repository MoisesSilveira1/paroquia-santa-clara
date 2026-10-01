# Privacidade e dados pessoais

Que dado pessoal o site guarda, por que, por quanto tempo e quem enxerga.

Escrito para ser lido pelo pároco e pelo conselho, não só por quem programa.
A referência legal é a **LGPD** (Lei 13.709/2018).

Última revisão: **12 de setembro de 2026**.

---

## 1. O que a paróquia guarda

| Dado | De quem | Por quê | Quem vê |
| --- | --- | --- | --- |
| Nome, e-mail, telefone, assunto e mensagem | Quem escreve pelo formulário de contato | Responder | Secretaria (painel) |
| Nome, função, telefone, e-mail | Coordenadores e equipes das pastorais | Organizar os grupos e dar contato à comunidade | Secretaria e o coordenador do grupo. **No site, só quem autorizou** |
| Nome e data de nascimento **de criança**; nome, parentesco, telefone e e-mail de quem responde por ela | Inscrições da catequese | Organizar a catequese | Coordenação da catequese e secretaria. **Nunca vai para o site** |
| Nome, e-mail, nível de acesso, último acesso | Contas do painel | Controlar quem publica o quê | Secretaria e acima |
| Resumo de e-mail + endereço de rede | Quem erra a senha | Frear tentativa de adivinhação | Ninguém — é um resumo irreversível |
| Fotos com rostos identificáveis | Comunidade | Galeria | Público |

---

## 2. O dado mais sensível: as inscrições da catequese

É o único lugar onde o site guarda **dado de criança**. Por isso recebeu
tratamento próprio.

### Consentimento explícito e registrado

O formulário **não envia** sem o aceite marcado. Não é nota de rodapé: é recusa
de formulário.

A data do aceite (`consentimentoEm`) é gravada **pelo servidor**, não mandada
pelo formulário — data de consentimento que o próprio interessado escolhe não
prova nada.

O texto que a família lê:

> Autorizo a paróquia a guardar estes dados para organizar a catequese de
> \<ano\>. Os dados ficam com a coordenação da catequese e a secretaria
> paroquial, não vão para o site nem para ninguém de fora, e podem ser
> corrigidos ou apagados a pedido — é só procurar a secretaria.

### Nenhuma consulta pública

A função que alimenta a página pública da catequese (`situacaoDasInscricoes`)
devolve **apenas** turmas, horários e catequistas. Conferido em 12/09/2026 no
retorno da função, não na tela.

Não existe, e não deve passar a existir, consulta pública à tabela de
inscrições.

### Gravação por campo explícito

Os campos são listados um a um na hora de gravar, em vez de espalhados com
`...dados`. É mais longo de propósito: **numa tabela com dado de criança, o que
se grava tem de ser decisão explícita**, não consequência de alguém ter
acrescentado um campo ao formulário.

### Aviso na tela do painel

A lista de inscrições traz, acima da tabela:

> Esta lista traz nome e data de nascimento de crianças e o telefone de quem
> responde por elas. Não imprima nem compartilhe fora da coordenação da
> catequese e da secretaria.

Está **na tela**, e não só nesta documentação, porque quem usa o painel precisa
saber o que tem em mãos antes de imprimir ou encaminhar.

### A ficha fica fechada

A tabela mostra o mínimo para reconhecer o pedido. Batismo, padrinho e
observação só aparecem quando a coordenação clica no nome. Dado de criança não
fica exposto por padrão, mesmo para quem tem permissão de ver.

---

## 3. O contato dos coordenadores

Telefone e e-mail de coordenador **nascem privados**. Só aparecem no site se a
pessoa autorizou (`contatoPublico` marcado).

Coordenador é voluntário da comunidade: publicar o telefone de alguém sem que
a pessoa tenha dito "pode" é diferente de publicar o número da secretaria. O
nome e a função aparecem sempre; o contato, só com autorização.

**O corte é na consulta ao banco, não na tela.** Um `console.log` esquecido ou
um cartão novo não vaza o número de ninguém — a página nunca recebe o que não
pode mostrar.

Além disso, o site público mostra **só a coordenação** (coordenador, vice e
adjunto), não a equipe inteira. O resto é gente voluntária que serve quando
pode; publicar esses nomes expõe pessoas que não pediram para estar ali, e
envelhece rápido.

---

## 4. Por quanto tempo guardar

O sistema **não apaga nada sozinho**, exceto as contagens de tentativa de
senha (15 minutos) e as sessões vencidas. O resto é decisão da paróquia.

Recomendação, a ser aprovada pelo pároco:

| Dado | Sugestão | Por quê |
| --- | --- | --- |
| Inscrições da catequese | Apagar as **não confirmadas** ao fim do ano letivo; guardar as confirmadas enquanto o catequizando estiver na caminhada | Inscrição é papel de um ano. Passado o ano, um pedido recusado não serve para nada e continua sendo dado de criança |
| Mensagens de contato | Arquivar após resposta; apagar depois de 2 anos | Já respondidas, viram só histórico |
| Coordenadores que saíram | Desmarcar "Mostrar no site"; apagar quando não houver mais escala ligada | O histórico de quem serviu tem valor para a comunidade |
| Contas do painel | Desativar em vez de apagar | Apagar leva junto a autoria das notícias publicadas |

> **Pendência:** não há rotina automática de descarte. Quando a paróquia
> aprovar os prazos acima, isso vira um item de manutenção — hoje é feito à mão
> pelo painel.

---

## 5. Direitos de quem forneceu os dados

A LGPD dá a qualquer pessoa o direito de saber o que a paróquia guarda sobre
ela, corrigir, e pedir que seja apagado.

**Como atender hoje:** pela secretaria, usando o painel. Todas as telas de
cadastro permitem editar e excluir (a exclusão de pessoa exige o padre ou o
administrador geral — ver [permissoes.md](permissoes.md)).

**Como a pessoa fica sabendo:** o texto do consentimento na inscrição diz
explicitamente que pode ser corrigido ou apagado a pedido.

> **Pendência:** o site não tem uma página de "Política de Privacidade"
> pública. Para um site institucional de paróquia com formulário de contato e
> inscrição de criança, é o item de conformidade mais visível que falta.
> Entrou na [lista de publicação](checklist-publicacao.md).

---

## 6. As fotos da galeria

As fotos da PASCOM mostram **rostos identificáveis, inclusive de crianças**.

Imagem de pessoa é dado pessoal. Publicá-la exige autorização — e, no caso de
criança, autorização de quem responde por ela.

> **Pendência, e é a mais séria desta lista:** não há registro de autorização
> de uso de imagem para as fotos hoje no site. Confirmar com a PASCOM e o
> pároco **antes de o site ir ao ar**. Já está na
> [lista de publicação](checklist-publicacao.md).

---

## 7. Para onde os dados vão

| Serviço | O que recebe | Situação |
| --- | --- | --- |
| **Prisma Postgres** | Tudo que o site guarda | Hoje no espaço pessoal do desenvolvedor. **Passar para a conta institucional** — ver [continuidade.md](continuidade.md) |
| **Resend** (e-mail) | Nome, e-mail e mensagem de quem escreve pelo contato | Só um aviso à secretaria; a mensagem já está no painel. Ainda não configurado |
| **Google Fonts** | O endereço de rede de quem visita | As fontes são baixadas na compilação e servidas pelo próprio site — o visitante **não** é enviado ao Google |
| **YouTube** | Endereço de rede de quem assiste à missa online | Usa `youtube-nocookie`, que reduz o rastreamento |
| **Google Maps** | Endereço de rede de quem abre a página de contato | Mapa embutido na página |

O site **não usa** Google Analytics, nem pixel de rede social, nem qualquer
rastreador de terceiro. Não há banner de cookies porque não há cookie de
rastreamento: o único cookie é o da sessão do painel, necessário para o login
funcionar.
