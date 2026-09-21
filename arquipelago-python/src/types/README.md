# `src/types` — tipos compartilhados

Tipos usados por módulos que não devem depender uns dos outros.

## Regra que define este diretório

Um tipo que pertence a um domínio fica **junto do domínio**. Exemplo:
`ReferenciaLivro` mora em `src/content/referenciaLivro.ts`, porque é uma regra do
conteúdo do livro, e não um tipo genérico.

Aqui entram apenas os tipos genuinamente transversais. Se este diretório começar a
acumular tipo de tudo, ele virou depósito e perdeu a função.

## Estado

**Vazio de propósito**: nesta etapa nenhum tipo é compartilhado entre domínios.
