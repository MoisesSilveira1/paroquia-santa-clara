# Documentação do site da paróquia

Todo o conhecimento do projeto, em português. Se você está chegando agora,
comece por [continuidade.md](continuidade.md).

---

## Por onde começar

| Se você é… | Leia |
| --- | --- |
| **Quem assume a manutenção do site** | [continuidade.md](continuidade.md) → [arquitetura.md](arquitetura.md) → [testes.md](testes.md) |
| **Da secretaria ou da PASCOM** | O [README](../README.md) na raiz, seção "O painel da secretaria" |
| **Do conselho ou da paróquia** | [checklist-publicacao.md](checklist-publicacao.md) e [privacidade.md](privacidade.md) |
| **Auditor ou revisor externo** | [auditoria-2026-09.md](auditoria-2026-09.md) |
| **Programador, indo mexer no código** | [arquitetura.md](arquitetura.md) e [permissoes.md](permissoes.md) — nessa ordem |

---

## Os documentos

### Como o site é feito

| | |
| --- | --- |
| [arquitetura.md](arquitetura.md) | As três camadas, as decisões estruturais e por quê |
| [modelo-de-dados.md](modelo-de-dados.md) | As 19 tabelas, o que guardam e o que acontece ao apagar |
| [design-system.md](design-system.md) | Cores, tipos, peças de interface e regras de escrita |

### Segurança, acesso e dados de pessoas

| | |
| --- | --- |
| [seguranca.md](seguranca.md) | O que protege o site, e os riscos conhecidos em aberto |
| [permissoes.md](permissoes.md) | A matriz de quem pode o quê, e permissão × alcance |
| [privacidade.md](privacidade.md) | Que dado pessoal existe, LGPD, e o dado de criança em particular |
| [acessibilidade.md](acessibilidade.md) | O que foi feito para quem enxerga pouco ou usa leitor de tela |

### Módulos

| | |
| --- | --- |
| [catequese.md](catequese.md) | O módulo da catequese: o que é nosso e o que continua no sistema dos catequistas |

### Qualidade

| | |
| --- | --- |
| [testes.md](testes.md) | Como refazer cada conferência — e a dívida de testes automatizados |
| [auditoria-2026-09.md](auditoria-2026-09.md) | A varredura de setembro de 2026: achados e correções |
| [relatorio-de-mudancas.md](relatorio-de-mudancas.md) | Tudo o que mudou naquela rodada, com o motivo |

### Publicar e manter

| | |
| --- | --- |
| [checklist-publicacao.md](checklist-publicacao.md) | **O que falta para o site entrar no ar** |
| [publicar.md](publicar.md) | Passo a passo do dia da publicação |
| [continuidade.md](continuidade.md) | Quem cuida do site amanhã — e por que nada pode depender de uma pessoa |
| [email-google-workspace.md](email-google-workspace.md) | E-mails próprios da paróquia |
| [versoes.md](versoes.md) | Versões marcadas e como voltar atrás |

---

## Como esta documentação é escrita

Três regras, para ela continuar servindo:

1. **Em português, para quem não programa.** Quem vai manter este site é um
   voluntário da comunidade, não uma empresa.
2. **Explica o *porquê*, não só o *o quê*.** O código já diz o que faz; o que
   se perde com o tempo é a razão. Quando uma decisão parecer estranha, o
   documento deve dizer o que seria pior.
3. **O que não se sabe fica escrito.** Pendências, dívidas e riscos conhecidos
   estão registrados em cada documento, com o nome de "pendência". Documentação
   que só conta acertos não serve para tomar decisão.

> Se um documento e o código discordarem, **o código está certo e o documento
> está velho**. Corrija o documento.
