# `src/state` — o estado em memória

Store tipado pequeno. Guarda a sessão atual (unidade aberta, etapa do ciclo,
respostas em andamento) e dispara as ações do domínio.

## Regra que define este diretório

Não grava nada permanentemente: persistir é responsabilidade de
`src/persistence/`. E não decide regra pedagógica sozinho — ele pede a decisão a
`src/learning/`.

## Estado

**Não implementado.** Etapa 3, quando existir a primeira tela que muda de estado.
Até agora, a única coisa que guarda estado é a rota atual (`src/app/useRota.ts`),
e ela não influencia progresso nenhum.
