# Arquipélago Python

Mundo 3D navegável para aprender Python, acompanhando o livro *Curso Intensivo de Python*
(Eric Matthes, Novatec, 2016).

Cada ilha suspensa é uma unidade de aprendizagem: entra-se na ilha, consulta-se a missão,
estuda-se a parte correspondente do livro, lê-se uma explicação original, pratica-se, faz-se a
avaliação e — alcançando 80% — a ponte para a próxima ilha se abre.

## Estado atual: o protótipo já ensina e já avalia

> **O que existe hoje:** mundo 3D navegável com quatro ilhas suspensas e pontes, um **avatar que
> anda** pelo capim e pelas pontes (com câmera de terceira pessoa, voo livre e vista de mapa), o
> ciclo de estudo completo das quatro primeiras unidades (missão, estudo, prática, avaliação e
> resultado), 5 perguntas por ilha, aprovação com 80% e progresso salvo no próprio navegador.
>
> **O que ainda não existe:** execução de código com Pyodide (Etapa 9), leitura do livro na tela
> (Etapa 6), animação de caminhada do avatar e som.
>
> **O que ainda ninguém viu:** o desenho 3D em si. Não há navegador com WebGL no ambiente de
> desenvolvimento — a árvore 3D de verdade é montada em teste (ilhas, estruturas e pontes, sem
> placa de vídeo), mas os pixels continuam **não verificados**. O roteiro manual de 30 itens está
> em `docs/TEST_REPORT.md`.

Os números exatos e o que comprova cada afirmação estão em `docs/HANDOFF.md` e
`docs/TEST_REPORT.md`. O site não mostra nenhum controle sem efeito (decisão D-009): o que não
funciona, não aparece como botão.

## Começar

    npm install
    npm run dev

Outros comandos:

    npm test         # 462 testes: regras, geometria, chão caminhável, avatar, mundo 3D, conteúdo, interface e acentuação
    npm run build    # checagem de tipos + build de produção
    npm run preview  # servir o build de produção

Páginas:

| Rota | O que é |
|---|---|
| `#/` | O mundo: arquipélago 3D, trilha das ilhas e painel do ciclo de estudo |
| `#/painel` | Painel do projeto: estado real, unidades planejadas, como verificar |
| `#/tema` | Guia de estilo: paleta, tipografia, espécimes e contraste medido |

Dentro do mundo: o padrão é **andar** — `W A S D` (ou setas) move a pessoa, `Shift` corre, arrastar
o mouse gira a câmera em volta dela, clicar numa ilha liberada abre a missão e clicar numa ponte
inteira leva a pessoa a pé até a ilha seguinte. `Voo livre` (com `Q`/`E` para subir e descer) e
`Vista de mapa` ficam no HUD. Com o painel aberto, as teclas de movimento param de mover quem quer
que seja, e `Esc` fecha o painel.

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
      world/        cena 3D, chão caminhável e avatar — SEM regra de aprovação
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
