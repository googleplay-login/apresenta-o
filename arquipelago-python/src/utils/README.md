# `src/utils` — auxiliares genéricos

Funções auxiliares puras, pequenas e sem conhecimento de domínio.

## Regra que define este diretório

Se uma função precisa saber o que é uma unidade, uma ilha ou uma resposta de
avaliação, ela **não** pertence aqui: pertence ao domínio correspondente. Este
diretório é para coisas como formatação de texto e de número, que servem a
qualquer assunto.

## Estado

**Vazio de propósito**: nada foi escrito que não pertencesse a um domínio. A
descrição da referência ao livro, por exemplo, depende do formato do livro — por
isso ficou em `src/content/referenciaLivro.ts`.
