# Arquipelago Python

Mundo 3D navegavel para aprender Python, acompanhando o livro
*Curso Intensivo de Python* (Eric Matthes, Novatec, 2016).

Cada ilha suspensa e uma unidade de aprendizagem: entra-se na ilha, consulta-se a
missao, estuda-se a parte correspondente do livro, le-se uma explicacao original,
pratica-se, faz-se a avaliacao e - alcancando 80% - a ponte para a proxima ilha se
abre.

## Estado atual: fundacao

> **Este projeto ainda nao e um jogo e nao e um curso.** Hoje existe o alicerce:
> projeto, tema visual, plano das quatro primeiras unidades e documentacao.
> Nao existe 3D, aula, pergunta, progresso salvo nem execucao de Python.

Os numeros exatos e o que comprova cada afirmacao estao em `docs/HANDOFF.md` e
`docs/TEST_REPORT.md`. A pagina inicial do proprio site tambem lista, em texto, o
que existe e o que ainda nao existe - ela **nao tem nenhum botao**, de proposito
(decisao D-009).

## Comecar

    npm install
    npm run dev

Outros comandos:

    npm test         # testes de contraste do tema e do plano de unidades
    npm run build    # checagem de tipos + build de producao
    npm run preview  # servir o build de producao

## Documentacao

Toda a memoria do projeto esta em [`docs/`](./docs). Se voce esta continuando o
trabalho, comece por [`docs/HANDOFF.md`](./docs/HANDOFF.md).

| Documento | Assunto |
|---|---|
| [BRIEF](./docs/BRIEF.md) | O que e e o que nao e o projeto |
| [ARCHITECTURE](./docs/ARCHITECTURE.md) | Camadas, pastas, versoes |
| [DECISIONS](./docs/DECISIONS.md) | Decisoes, com motivo e consequencia |
| [BOOK_MAP](./docs/BOOK_MAP.md) | Livro, capitulos e o mapa das unidades |
| [CONTENT_GUIDE](./docs/CONTENT_GUIDE.md) | Como escrever conteudo |
| [STATE_MACHINE](./docs/STATE_MACHINE.md) | Ciclo de estudo e regras de aprovacao |
| [ART_DIRECTION](./docs/ART_DIRECTION.md) | Paleta e direcao visual |
| [STAGES](./docs/STAGES.md) | Etapas e o que esta autorizado |
| [HANDOFF](./docs/HANDOFF.md) | Estado atual |
| [TEST_REPORT](./docs/TEST_REPORT.md) | O que foi testado, de verdade |

## Aviso de direitos

O livro e **fonte de estudo e mapa**, nunca texto reproduzido. O PDF **nao** esta
neste repositorio e nao vai estar (o repositorio e publico). Aulas, exemplos,
exercicios e perguntas sao originais. Ver `docs/CONTENT_GUIDE.md`.

## Estrutura

    src/
      app/          composicao da aplicacao
      world/        cena 3D - SEM regra de aprovacao
      learning/     regras pedagogicas puras - FONTE UNICA DE VERDADE
      content/      conteudo como dado tipado
      state/        estado em memoria
      persistence/  progresso salvo, versionado
      python/       Pyodide em Web Worker, sob demanda
      ui/           componentes e tema
      types/        apenas tipos transversais
      utils/        apenas auxiliares sem dominio

Cada pasta tem um `README.md` com sua responsabilidade e seus limites.
