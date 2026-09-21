# `src/state` — o estado em memória

Store tipado pequeno. Guarda a sessão atual (unidade aberta, etapa do ciclo,
respostas em andamento) e dispara as ações do domínio.

## Regra que define este diretório

Não grava nada permanentemente: persistir é responsabilidade de
`src/persistence/`. E não decide regra pedagógica sozinho — ele pede a decisão a
`src/learning/`.

## Estado

**Implementado na Etapa 3.** `sessao.ts` traz o redutor do ciclo: `criarRedutor(unidades)`,
`estadoInicial()`, os cinco passos (`missao`, `estudo`, `pratica`, `avaliacao`, `resultado`), as
ações e a máquina de foco do teclado (D-012).

É aqui, e **só aqui**, que `registrarResultado` é chamado. Nenhum componente altera progresso:
componentes despacham ações, e o redutor consulta o domínio. A rota (`src/app/useRota.ts`)
continua fora disso — ela não influencia progresso nenhum.
