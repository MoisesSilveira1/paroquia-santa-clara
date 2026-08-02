# Versões marcadas e como voltar atrás

Cada mudança do site fica gravada no histórico do Git, e as versões
importantes recebem um **marcador** (tag) com nome. Nada se perde: dá para
voltar a qualquer uma delas a qualquer momento.

## Versões marcadas

| Marcador | O que é |
| --- | --- |
| `v1.0-apresentacao` | Site completo em tons de creme/marrom/terracota (paleta franciscana), pronto para apresentar ao conselho. |
| `v1.1-paleta-azul` | Mesma coisa, com a paleta azul mariano + dourado. |

Para ver a lista atualizada, com a descrição de cada uma:

```bash
git tag -n1
```

## Ver como era uma versão anterior

Isto abre o site como ele era, sem apagar nada do trabalho atual:

```bash
git checkout v1.0-apresentacao
```

Rode `npm run dev` e veja no navegador. Para voltar ao estado mais recente:

```bash
git checkout main
```

## Voltar de vez para uma versão anterior

Se a versão nova não agradar e a decisão for **abandonar** as mudanças:

```bash
git revert --no-commit v1.1-paleta-azul..HEAD && git commit -m "volta para a paleta anterior"
```

Esse comando desfaz as alterações criando um novo commit — o histórico
continua inteiro, então é possível mudar de ideia outra vez depois. Evite
`git reset --hard`, que apaga trabalho de verdade.

## Marcar uma nova versão

Quando o site chegar num estado bom que valha a pena guardar:

```bash
git tag -a v1.2-nome-curto -m "o que mudou nesta versão" && git push origin v1.2-nome-curto
```
