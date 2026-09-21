# Arquipélago Python

Mundo 3D navegável para aprender Python, acompanhando o livro *Curso Intensivo de Python*
(Eric Matthes, Novatec, 2016).

Cada ilha suspensa é uma unidade de aprendizagem: entra-se na ilha, consulta-se a missão,
estuda-se a parte correspondente do livro, lê-se uma explicação original, pratica-se, faz-se a
avaliação e — alcançando 80% — a ponte para a próxima ilha se abre.

## Estado atual: fundação e regras

> **Este projeto ainda não é um jogo e não é um curso.** Hoje existe o alicerce: projeto, tema
> visual, guia de estilo, plano das quatro primeiras unidades, regras de progressão testadas e
> documentação.
>
> **Não existe** 3D, aula, missão, pergunta de avaliação, tela do ciclo de estudo, progresso
> salvo nem execução de Python.

Os números exatos e o que comprova cada afirmação estão em `docs/HANDOFF.md` e
`docs/TEST_REPORT.md`. O próprio site lista, em texto, o que existe e o que ainda não existe — e
**não tem nenhum botão**, de propósito (decisão D-009).

## Começar

    npm install
    npm run dev

Outros comandos:

    npm test         # testes das regras, do tema, do plano de unidades e da acentuação
    npm run build    # checagem de tipos + build de produção
    npm run preview  # servir o build de produção

Páginas:

| Rota | O que é |
|---|---|
| `#/` | Painel do projeto: estado real, unidades planejadas, como verificar |
| `#/tema` | Guia de estilo: paleta, tipografia, espécimes e contraste medido |

## Documentação

Toda a memória do projeto está em [`docs/`](./docs). Se você está continuando o trabalho,
comece por [`docs/HANDOFF.md`](./docs/HANDOFF.md).

| Documento | Assunto |
|---|---|
| [BRIEF](./docs/BRIEF.md) | O que é e o que não é o projeto |
| [ARCHITECTURE](./docs/ARCHITECTURE.md) | Camadas, pastas, versões, travas automáticas |
| [DECISIONS](./docs/DECISIONS.md) | Decisões, com motivo e consequência |
| [BOOK_MAP](./docs/BOOK_MAP.md) | Livro, capítulos e o mapa das unidades |
| [CONTENT_GUIDE](./docs/CONTENT_GUIDE.md) | Como escrever conteúdo |
| [STATE_MACHINE](./docs/STATE_MACHINE.md) | Ciclo de estudo e regras de aprovação |
| [ART_DIRECTION](./docs/ART_DIRECTION.md) | Paleta e direção visual |
| [STAGES](./docs/STAGES.md) | Etapas e o que está autorizado |
| [HANDOFF](./docs/HANDOFF.md) | Estado atual |
| [TEST_REPORT](./docs/TEST_REPORT.md) | O que foi testado, de verdade |

## Aviso de direitos

O livro é **fonte de estudo e mapa**, nunca texto reproduzido. O PDF **não** está neste
repositório e não vai estar (o repositório é público). Aulas, exemplos, exercícios e perguntas são
originais. Ver `docs/CONTENT_GUIDE.md`.

## Estrutura

    src/
      app/          casca da aplicação, rotas e páginas
      world/        cena 3D — SEM regra de aprovação
      learning/     regras pedagógicas puras — FONTE ÚNICA DE VERDADE
      content/      conteúdo como dado tipado
      state/        estado em memória
      persistence/  progresso salvo, versionado
      python/       Pyodide em Web Worker, sob demanda
      ui/           componentes, tema e mostruário de cores
      types/        apenas tipos transversais
      utils/        apenas auxiliares sem domínio
    qa/             verificações do projeto (não da aplicação)
    docs/           documentação de continuidade

Cada pasta tem um `README.md` com sua responsabilidade e seus limites.
