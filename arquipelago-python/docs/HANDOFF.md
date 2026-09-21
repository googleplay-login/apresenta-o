# HANDOFF — estado atual

Atualizado em **21/09/2026**, ao final da **Etapa 8 (persistência e protótipo jogável)**.

## Onde o projeto está

| | |
|---|---|
| Etapa atual | 8 concluída; 9 a 14 em sequência, sem parada entre etapas (instrução do usuário) |
| Código de aplicação | mundo 3D com avatar, ciclo de estudo completo e persistência local |
| Mundo 3D | **existe**: quatro ilhas suspensas, pontes, céu, mar, avatar que anda e câmera de terceira pessoa |
| Conteúdo pedagógico | **existe** para as 4 primeiras unidades: missão, leitura (com o que observar), explicação, diagramas, 3 exercícios e 5 perguntas cada |
| Telas do ciclo de estudo | **existem**: missão, estudo (leitura + entendimento), prática, avaliação e resultado — com revisão explicada e placar de tentativas |
| Persistência | **existe**: `localStorage`, versão **2**, com migração da versão anterior, aviso honesto de falha e ordem de gravação corrigida (Etapa 8) |
| Execução de código (Pyodide) | **não existe** — Etapa 9 |
| Avatar | **existe**: anda pelo capim e pelas pontes, com chão declarado e sem queda (Etapa 5) |
| Livro na tela | **existe como orientação**: qual parte ler, por que, e o que procurar nela — **sem reproduzir texto do livro e sem número de página** (o PDF não está aqui) |
| Testes de navegador | **não executados** — não há navegador neste ambiente |
| Avaliação | **existe e é honesta**: enunciado que diz que a correção roda no cliente, envio exige todas as respostas, revisão explica todas as perguntas (Etapa 7) |

Badge honesto: **o protótipo já ensina e já avalia, com o mundo desenhado — mas ninguém viu o
desenho, porque não há navegador aqui.**

## Como rodar

    cd arquipelago-python
    npm install
    npm run dev          # servidor de desenvolvimento, escuta em 0.0.0.0:5173
    npm test             # 553 testes, em 33 arquivos
    npm run build        # checagem de tipos + build de produção
    npm run typecheck    # apenas a checagem de tipos

Páginas:

| Rota | O que é |
|---|---|
| `#/` | **O mundo**: arquipélago 3D, HUD, e a trilha em texto com o painel do ciclo de estudo |
| `#/painel` | Painel do projeto: estado real, unidades planejadas, como verificar |
| `#/tema` | Guia de estilo: paleta, tipografia, espécimes e contraste medido |

Como usar o mundo, em uma linha: o mundo abre no modo **andar** — `W A S D` (ou setas) move a
pessoa, `Shift` corre, arrastar o mouse gira a câmera em volta dela, clique numa ilha liberada abre a
missão, e clique numa ponte inteira leva a pessoa a pé até a ilha seguinte. Os modos `Voo livre`
(`Q`/`E` sobem e descem) e `Vista de mapa` ficam no HUD. Com o painel aberto, as teclas de movimento
ficam desligadas e `Esc` fecha o painel (D-012).

Dentro do painel, a aba **Estudo** tem duas seções: *1. Ler no livro* — a parte indicada, o porquê,
o que procurar e o botão que marca a leitura como feita — e *2. Entender do nosso jeito* — a
explicação original, com os diagramas desenhados em texto. O marcador de leitura é registro, não
permissão: ele **não** aprova, não abre ponte e não muda nota (D-033).

## O que foi entregue

### Etapa 1.1 — fundação

- Projeto Vite + React + TypeScript, dependências **exatas** e lockfile versionado.
- `src/ui/theme/tokens.ts`: fonte única das cores, com teste de contraste WCAG AA.
- `src/content/`: as 4 primeiras unidades e a regra de referência ao livro, com página `null` +
  `referencia-pendente`.
- `src/`: esqueleto das pastas, cada uma com `README.md` dizendo sua responsabilidade e limites.
- `docs/`: os documentos de continuidade.

### Etapa 1.2 — guia de estilo

- Segunda página (`#/tema`) com espécimes da linguagem visual.
- Paleta **lida dos tokens**, não redigitada: se um token mudar, a página muda junto.
- Tabela de contraste medida na hora, com os mesmos pares que o teste verifica.
- Navegação por hash, sem dependência nova (D-016).
- **Correção de acentuação** em todo o código e a trava `qa/acentuacao.test.ts` (D-015).

### Etapa 2 — domínio e progressão

`src/learning/`, funções puras:

- aprovado com **80% reais**, em aritmética inteira (`acertos * 5 >= total * 4`);
- percentual exibido **sempre para baixo** — quem faz 79% lê 79%;
- reprovar não bloqueia a unidade nem apaga aprovação anterior;
- melhor nota só melhora; tentativas contadas;
- uma unidade por vez: só a anterior aprovada abre a próxima;
- **registrar resultado em unidade bloqueada é recusado** (D-017);
- nenhuma função aceita rota, hash, clique ou URL;
- progresso versionado e serializável.

### Etapa 3 — o mundo e o ciclo na tela

Camada pura:

- `world/geometria/`: gerador determinístico, rocha e topo da ilha, sólidos com **faces para
  fora**, pintura por altura, árvores, pedras, mesa, placa, biblioteca, farol;
- `world/mapaDoMundo.ts`: posição das ilhas, vão das pontes, enquadramento e espalhamento;
- `world/mundoVisivel.ts`: o **único** elo progresso ↔ cena. As ilhas chegam com situação e
  acessibilidade resolvidas, as pontes com "liberada" decidido. A cena não aprova nada (D-004);
- `world/camera/movimento.ts` e `world/teclas.ts`: câmera com limites, interpolação, teclas por
  `code` sem tecla presa.

Camada visual:

- `world/Cena.tsx` e companhia: célula de céu, mar, nuvens com semente fixa, ilha com estruturas e
  farol girando, pontes inteiras ou pela metade conforme a liberação, destaque no mouse;
- `ui/paineis/`: os cinco passos do ciclo, com abas, foco ao abrir e `Esc` fechando;
- `app/paginas/Mundo.tsx`: HUD (modo de câmera, placar, ajuda de teclas, avisos), trilha em texto
  equivalente ao mundo, e a ligação com a persistência;
- importação sob demanda da cena (D-022): o pacote principal ficou em 88 kB comprimidos.

Verificação:

- `jsdom` + Testing Library nos testes de interação (D-020): o ciclo inteiro é percorrido com
  cliques, teclado e `localStorage` de verdade. Dois defeitos reais apareceram na primeira
  execução e foram corrigidos no código, não no teste.

### Etapa 4 — as pontes como travessia

- `decidirTravessia()` (função pura, em `world/mundoVisivel.ts`): clicar numa ponte **nunca** libera
  nada. Pela metade, ela recusa e explica qual aprovação falta; inteira, ela leva adiante;
- a ponte responde ao clique nos dois estados, com cursor de mãozinha fornecido pelo CSS da cena;
- quando a aprovação chega com o mundo na tela, as tábuas se estendem até fechar o vão (animação do
  acontecimento, não da montagem);
- a última ilha não promete ponte: o texto, o botão de seguir e o HUD distinguem "fim do percurso
  escrito" de "próxima ilha".

### Etapa 5 — o avatar, e o chão caminhável

- `world/mapaCaminhavel.ts`: onde dá para pisar — um disco por ilha (o capim, que é um domo) e uma
  faixa por ponte **inteira**. Fora disso, `null`, e o passo é recusado. Só ponte liberada vira
  chão: nenhuma segunda regra de liberação (D-004, D-029);
- `world/avatar/passos.ts`: andar com velocidade e corrida, girar o corpo para onde se anda, deslizar
  na beirada, e a rota a pé entre ilhas — que **só existe por ponte inteira** e, quando não existe,
  é dita em voz alta com o nome da ilha (D-030);
- `world/Avatar.tsx` e `world/CameraDoAvatar.tsx`: a figura (primitivas, cores dos tokens) e a câmera
  de terceira pessoa; a guinada da câmera é a mesma que o passo consulta, então `W` anda para onde se
  olha;
- modo padrão agora é `andar`; `voar` e `mapa` continuam no HUD (D-028);
- **defeito corrigido:** o tabuleiro da ponte estava 0,36 abaixo do capim da borda, porque a ponte
  era desenhada na altura do centro da ilha e o capim é um domo. Agora a altura do capim tem uma
  fórmula só, usada pela malha e pelo chão (D-031);
- verificação: `@react-three/test-renderer` com `advanceFrames` — o caminhar é medido quadro a quadro
  na árvore 3D real, sem placa de vídeo (D-032).

### Etapa 6 — o estudo com o livro na tela

- `content/tiposDeConteudo.ts`: a leitura ganhou **`oQueObservar`** (o que procurar naquela parte do
  livro) e **`semOLivro`** (o que fazer sem o livro em mãos); o bloco de explicação ganhou
  **`diagrama`**, com partes rotuladas e a opção `espacosVisiveis`;
- `ui/paineis/LeituraDaUnidade.tsx`: a leitura recomendada virou parte do ciclo — a parte do livro, o
  porquê, o que observar, o caminho sem livro e o marcador de leitura;
- `ui/paineis/DiagramaDaExplicacao.tsx`: diagrama desenhado em texto, sem imagem e sem dependência
  nova. Com `espacosVisiveis`, as pontas dos valores aparecem com um sinal (`·`), e a legenda diz o
  que o sinal significa; quando não há espaços nas pontas, o sinal **não** aparece (D-034);
- `ui/paineis/EstudoDaUnidade.tsx`: a aba de estudo passou a ter duas seções declaradas — *1. Ler no
  livro* e *2. Entender do nosso jeito* —, e a missão anuncia o que a leitura vai pedir;
- `learning/percurso.ts`: `leituraFeita` por unidade, com `marcarLeituraFeita()` — que **recusa**
  unidade bloqueada e não toca em nota, tentativas nem passo. Marcar a leitura **não** aprova nem
  abre ponte: é registro (D-033);
- `persistence/progressoSalvo.ts`: o formato guardado subiu para a **versão 2**, com migração real da
  versão 1 — aprovação, tentativas e melhor nota são preservados, e o marcador de leitura começa
  desmarcado, porque não há como saber se a leitura aconteceu (D-035);
- `qa/estilos.test.ts` (novo): compara as variáveis de CSS usadas com os tokens reais. **Pegou um
  defeito de verdade** na primeira execução: `--painel.fundo-elevado`, com ponto, não é variável
  válida — virou `--painel-fundo-elevado`.
- **Defeito de texto corrigido de passagem:** a página `#/painel` continuava dizendo que o mundo 3D
  não existia, que nada era gravado no navegador e que não havia pergunta escrita — tudo falso desde
  a Etapa 3. A lista foi refeita com o estado real (inclusive o aviso de que **ninguém viu o desenho
  3D**), e três testes em `src/app/App.test.tsx` travam o retorno do texto velho. A contagem de
  testes saiu da página: número em tela envelhece, e envelheceu.

### Etapa 7 — a avaliação revisada

- `learning/avaliacao.ts`: `AVISO_DE_HONESTIDADE` (o texto que o enunciado é obrigado a dar),
  `numerosEmBranco()`, `textoDePendencias()`, `acertosMinimos()` — medido em inteiros, e não com
  `Math.ceil(total * 0.8)` — e `textoDoPlacar()`, que compara a nota atual com a melhor guardada;
- `ui/paineis/AvaliacaoDaUnidade.tsx`: o aviso de honestidade antes das perguntas, a lista das
  perguntas em branco **pelos números**, um atalho por pendência que leva o foco até a pergunta, e
  `aria-describedby` ligando o botão de enviar ao estado;
- `ui/paineis/ResultadoDaUnidade.tsx`: placar de tentativas e melhor nota (vindos do progresso
  gravado), o que foi marcado em cada erro, explicação em **todas** as perguntas, e foco no anúncio
  do resultado ao aparecer (D-036, D-037);
- `content/validadorDeConteudo.ts`: enunciado com 20 caracteres ou mais, explicação com 40 ou mais e
  diferente de qualquer alternativa, proibição de "todas as anteriores" e limite de alternativas
  corretas destacadas por tamanho (D-038);
- **defeito de conteúdo corrigido:** em `u01`, as cinco corretas eram as mais longas; nas quatro
  unidades, 11 de 20 perguntas passavam por esse atalho. As quatro unidades foram reescritas;
- **documento cumprido:** os documentos prometiam o aviso de honestidade desde a Etapa 2, e ele não
  existia na tela. Agora existe, com teste.

### Etapa 8 — persistência revisada, e o protótipo percorrido inteiro

- **defeito corrigido, o mais grave até agora:** a primeira gravação rodava antes de a leitura
  chegar ao estado e **apagava** a chave guardada (gravar progresso sem unidades é o mesmo que "não
  há nada"). Os 548 testes anteriores não pegaram porque conferiam o estado final da tela, que ficava
  certo. `useProgressoPersistido` passou a não gravar enquanto o progresso em mãos for o do primeiro
  render (D-039), com dois testes novos e prova de mutação;
- `src/persistence/useProgressoPersistido.test.tsx` (novo): ordem das operações na chave, cota
  estourada depois da leitura, e aviso de falha visível;
- `Mundo.interacao.test.tsx`: o **protótipo jogável de ponta a ponta** — quatro ilhas aprovadas em
  sequência, recarga da página no meio, placar a cada passo, fim do percurso e o arquivo guardado
  conferido; mais o caso do navegador que recusa gravar, com a trilha inteira ainda jogável;
- o caminho percorrido pela suíte é o **sem 3D** (não há WebGL no ambiente), que é exatamente a
  alternativa acessível — a mesma de quem usa leitor de tela ou está sem placa de vídeo.

### Revisão da Etapa 4 — o mundo sob teste, e o gabarito desviciado

Três mudanças, todas nascidas de revisão e não de pedido novo:

- `world/ConteudoDaCena.tsx` (conteúdo) separado de `world/Cena.tsx` (casca com o `<Canvas>`). É o
  que permite montar a **árvore 3D de verdade** em teste, com `@react-three/test-renderer`, sem
  placa de vídeo (D-025). Dez testes novos: uma ilha por unidade planejada, biblioteca, mesa e placa
  em cada uma, uma ponte por par vizinho e nenhuma sobrando, clique na ilha, e a ponte bloqueada
  desenhando menos tábuas que a liberada;
- **defeito de conteúdo corrigido:** as cinco respostas de `u03Strings` estavam na posição 1, e o
  teste antigo conferia a variedade somando todas as unidades. As quatro unidades foram
  redistribuídas pelas quatro posições, e o teste agora exige isso **unidade por unidade** (D-027);
- `pyodide` removido de `devDependencies`: estava instalado desde a Etapa 1 sem uso (D-026).

## Arquivos de referência rápida

| Assunto | Arquivo |
|---|---|
| O que é o projeto, o que não é | `docs/BRIEF.md` |
| Camadas, pastas, versões, travas automáticas | `docs/ARCHITECTURE.md` |
| Decisões com motivo e consequência | `docs/DECISIONS.md` |
| Livro, capítulos, páginas pendentes | `docs/BOOK_MAP.md` |
| Como escrever conteúdo | `docs/CONTENT_GUIDE.md` |
| Ciclo, estados, regras de aprovação | `docs/STATE_MACHINE.md` |
| Paleta, referência visual, o que não copiar | `docs/ART_DIRECTION.md` |
| Etapas e o que está autorizado | `docs/STAGES.md` |
| Testes realmente executados | `docs/TEST_REPORT.md` |

## Pendências herdadas

| Pendência | Efeito | Bloqueia o que |
|---|---|---|
| PDF do livro ausente | Toda página continua `null`; a leitura indica capítulo e seção, nunca página | Conferir página nas etapas de conteúdo |
| Imagens de referência ausentes no disco | Cor é estimativa visual, não medida | Refinar o 3D a partir delas |
| Nenhum navegador no ambiente | Sem teste de navegador automatizado, e o desenho 3D **não foi visto por ninguém** | Registrado em `TEST_REPORT.md`, com roteiro manual de 45 itens |
| WebGL ausente | A aparência, a luz e o desempenho da cena continuam sem verificação automática | Só o roteiro manual cobre isso |
| Pyodide não instalado | Sem execução de código no navegador | Etapa 9, que traz o pacote junto com o Web Worker (D-026) |

## Decisões que ainda precisam do usuário

1. **Enviar o PDF** e as imagens de referência, ou confirmar que não serão enviados.
2. Reavaliar a densidade do capítulo 2 quando o PDF chegar (D-001 pode mudar para a opção A).
3. Definir se o **modo apresentação** (letreiro, faixa de teclas, pílula de navegação, inspirado
   nas referências) entra no protótipo ou fica para a Etapa 13.

## Próximo passo (em execução, sem parada)

**Etapa 9 — prova de conceito do Pyodide em Web Worker.** Hoje o projeto **não** executa código
Python: a pasta `src/python/` está vazia de propósito, e a dependência foi removida na revisão da
Etapa 4 porque nada a usava (D-026). A Etapa 9 traz o pacote junto com o Web Worker que o usa,
carregado sob demanda, e diz em voz alta o que isso **não** é: rodar código de terceiros no navegador
não é seguro, e nenhuma tela vai prometer isso. O que **não** entra nesta etapa: exercícios com
correção automática (Etapa 10), que dependem desta prova de conceito.

Dependência herdada: o **PDF do livro não está nesta máquina**, então toda página continua `null` e a
leitura recomendada fala em capítulo e seção, não em página.

## Como continuar sem mim

1. Ler este arquivo.
2. Ler `docs/STAGES.md` para saber o que está autorizado.
3. Ler `docs/DECISIONS.md` **antes** de mudar qualquer coisa estrutural.
4. Rodar `npm test` e `npm run build` para confirmar que o ponto de partida está saudável.
5. Não antecipar etapa: se a decisão não está registrada, ela ainda não foi tomada.
