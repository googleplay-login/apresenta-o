# Arquipélago Python

Mundo 3D navegável para aprender Python, acompanhando o livro *Curso Intensivo de Python*
(Eric Matthes, Novatec, 2016).

Cada ilha suspensa é uma unidade de aprendizagem: entra-se na ilha, consulta-se a missão,
estuda-se a parte correspondente do livro, lê-se uma explicação original, pratica-se, faz-se a
avaliação e — alcançando 80% — a ponte para a próxima ilha se abre.

## Estado atual: o protótipo já ensina e já avalia

> **O que existe hoje:** mundo 3D navegável com **dezoito** ilhas suspensas — cada uma com a própria
> forma, o próprio marco, a própria vegetação e o próprio tom (D-053), e desde o lote 6.1 também com a
> **madeira, a pedra e a folhagem no tom dela** e a **bandeira da trilha** fincada no capim (D-063) — e
> pontes, um **avatar que
> anda** pelo capim e pelas pontes (com câmera de terceira pessoa, voo livre e vista de mapa), o
> ciclo de estudo completo das dezoito unidades escritas — a Parte I inteira do livro (capítulos 1 a 11)
> e os dois primeiros projetos da Parte II (capítulos 12 a 17) — (missão, estudo,
> prática, avaliação e resultado), 5 perguntas por ilha, aprovação com 80%, progresso salvo no próprio navegador, um
> **console de Python de verdade** em cada ilha — interpretador servido pela própria aplicação,
> carregado só quando a pessoa pede — e a **conferência automática do exercício**, com o limite dela
> escrito na tela.
>
> **As três trilhas, e o que cada console roda ali:** a Parte I é a trilha dos conceitos; o projeto 1
> (capítulos 12 a 14) é a trilha do jogo, e ali o Pygame **não** roda — medido, `import pygame` falha
> nesta distribuição, e o que se aprende é a lógica que roda; o projeto 2 (capítulos 15 a 17) é a trilha
> de dados, e ali rodam `csv`, `json`, `random`, `statistics` e `collections`, mas não o desenho do
> gráfico (`matplotlib`, `numpy`, `pandas` não existem) nem a busca pela rede (`requests` não existe — a
> resposta de API entra na unidade já chegada, como texto).
>
> **O que ainda não existe:** o **projeto 3** da Parte II (as aplicações web do Django: medido, o Django
> não roda aqui, e o lote 7 escreverá a parte que roda — a função que recebe os dados de um pedido e
> devolve a resposta, sem servidor nenhum),
> animação de caminhada do avatar e som. O livro **não** aparece na tela: o que existe é orientação de leitura escrita por
> nós — qual parte ler, por que, o que procurar e o caminho de quem não tem o livro —, sem nenhuma
> linha reproduzida e sem número de página, porque o PDF não está em mãos.
>
> **O que a conferência não é, e a tela diz isso:** ela mede o que o programa imprimiu, o valor que
> ficou guardado nas variáveis e a forma pedida pelo enunciado. Não julga estilo, não exige solução
> única, **não é nota e não aprova a ilha** — quem aprova é a avaliação. E ela distingue "não
> confere" de "não deu para conferir": a segunda frase quer dizer que a conferência não olhou, e não
> que o exercício está errado.
>
> **O que ainda ninguém viu:** o desenho 3D em si. Não há navegador com WebGL no ambiente de
> desenvolvimento — a árvore 3D de verdade é montada em teste (ilhas, estruturas e pontes, sem
> placa de vídeo), mas os pixels continuam **não verificados** — quem olha é quem usa, e foi assim que
> apareceu o defeito "as ilhas estão todas iguais" (D-053). O roteiro manual de 55 itens está
> em `docs/TEST_REPORT.md`.

Os números exatos e o que comprova cada afirmação estão em `docs/HANDOFF.md` e
`docs/TEST_REPORT.md`. O site não mostra nenhum controle sem efeito (decisão D-009): o que não
funciona, não aparece como botão.

## Começar

    npm install
    npm run dev

`npm install` traz o Pyodide, e os ganchos de `dev`, `build` e `test` copiam os arquivos do
interpretador (13,9 MB) para `public/pyodide/`, que fica **fora do Git**. Para refazer a cópia na mão:
`npm run preparar-pyodide`.

Outros comandos:

    npm test         # 785 testes em 43 arquivos: regras, geometria, chão caminhável, avatar, mundo 3D, cor sob a luz do mundo, conteúdo, trilhas, leitura, interface e a conferência no Python de verdade
                     # e travas do projeto — inclusive os trechos de código rodando em Python de verdade
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

Na aba **Avaliação**, o enunciado diz que a correção roda no navegador e que não é antifraude, o
envio exige todas as respostas (com a lista das que faltam), e a revisão, depois do envio, explica
todas as perguntas — certas e erradas — junto do placar de tentativas.

Na aba **Prática** de cada ilha está o **console de Python** — e, em cada exercício que pode ser
conferido, o botão *Escrever e conferir no console*. Escolhido o exercício, o botão *Rodar e conferir*
roda o programa do estudante **com a sonda da conferência no fim** (uma execução só, para medir as
variáveis que o programa deixou) e mostra item por item o que se esperava e o que veio, além do que
aquela conferência **não** julga. Quando tudo confere, o exercício ganha um selo no cartão e o
resultado é guardado no progresso — guardar não aprova a ilha, e o selo diz isso (D-044 a D-047).

O console, em detalhe: Ele não baixa nada ao abrir a página: o
interpretador vem no clique em *Ligar o Python (baixa cerca de 14 MB uma vez)*, roda dentro de um Web
Worker (a página não trava enquanto o programa roda) e devolve o que o programa imprimiu, o valor da
última expressão e — quando falha — a mensagem do Python **inteira**, com traceback, porque ler erro é
parte do que se aprende. O que o console **não** é, dito na tela e não só aqui: não é o Python do seu
computador, não é uma caixa à prova de fuga, não lê arquivos e não pede dados pelo teclado — `input()`
é recusado com a alternativa escrita. Um laço infinito não pode ser interrompido por dentro: o botão
*Recomeçar do zero* descarta o Worker, e o aviso de 15 segundos serve para a tela dizer que algo
demora, não para interromper (D-041).

No painel, a aba **Estudo** tem duas seções: *1. Ler no livro* — a parte indicada, o porquê, o que
procurar e um botão que registra a leitura como feita — e *2. Entender do nosso jeito* — a explicação
original, com diagramas desenhados em texto. O marcador de leitura é **registro, não permissão**:
ele não aprova a ilha, não abre a ponte e não muda nota nenhuma (D-033).

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
