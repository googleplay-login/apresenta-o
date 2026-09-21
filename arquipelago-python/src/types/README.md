# `src/types` - tipos compartilhados

Tipos usados por modulos que nao devem depender uns dos outros.

## Regra que define este diretorio

Um tipo que pertence a um dominio fica **junto do dominio**. Exemplo: `ReferenciaLivro`
mora em `src/content/referenciaLivro.ts`, porque e uma regra do conteudo do livro, e
nao um tipo generico.

Aqui entram apenas os tipos genuinamente transversais. Se este diretorio comecar a
acumular tipo de tudo, ele virou um deposito e perdeu a funcao.

## Estado

Vazio de proposito: nesta etapa nenhum tipo e compartilhado entre dominios.
