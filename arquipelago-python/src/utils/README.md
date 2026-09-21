# `src/utils` - auxiliares genericos

Funcoes auxiliares puras, pequenas e sem conhecimento de dominio.

## Regra que define este diretorio

Se uma funcao precisa saber o que e uma unidade, uma ilha ou uma resposta de
avaliacao, ela **nao** pertence aqui: pertence ao dominio correspondente. Este
diretorio e para coisas como formatacao de texto e de numero, que servem a qualquer
assunto.

## Estado

Vazio de proposito: nesta etapa nada foi escrito que nao pertencesse a um dominio.
A descricao de referencia do livro, por exemplo, condiciona ao formato do livro e por
isso ficou em `src/content/referenciaLivro.ts`.
