# `qa/` — verificações de qualidade do projeto

Testes que verificam o **projeto**, e não o comportamento da aplicação. Ficam fora
de `src/` justamente para não se confundirem com código de produto.

| Arquivo | O que verifica |
|---|---|
| `acentuacao.test.ts` | Se algum texto em português ficou sem acento no código ou na documentação |

Rodam junto com os demais: `npm test`.

Um teste mora aqui quando a resposta certa para ele é "arrume o texto (ou o código)
do projeto", e não "a aplicação tem um defeito".
