# `src/state` - o estado em memoria

Store tipado pequeno. Guarda a sessao atual (unidade aberta, etapa do ciclo,
respostas em andamento) e dispara as acoes do dominio.

## Regra que define este diretorio

Nao grava nada permanentemente: persistir e responsabilidade de `src/persistence/`.
O estado aqui nao decide regra pedagogica sozinho - ele pede a decisao a
`src/learning/`.

## Estado

Nao implementado. Etapa 2.
