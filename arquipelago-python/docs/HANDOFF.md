# HANDOFF — estado atual

Atualizado em **21/09/2026**, depois do **lote 6 da Etapa 11** (versão 0.20.0) — o lote do **projeto 2,
visualização de dados** (capítulos 15 a 17, ilhas 16 a 18), e do **conserto visual que a captura de tela
pediu** (D-063): a ponte passou a encostar no capim desenhado, o chão caminhável passou a acabar onde o
capim acaba, a ponte bloqueada virou uma ponte **interrompida** (dois tocos, vão no meio) em vez de uma
tábua no ar, cada ilha ganhou madeira, pedra e folhagem com o tom dela, o capim ganhou arbustos e flores,
e cada ilha fincou a bandeira da sua trilha. Antes, no mesmo dia: lote 5 (projeto 1, ilhas 13 a 15), lote 4
(capítulos 10 e 11, que fechou a Parte I) e o conserto da cor do mundo (D-060).

## Onde o projeto está

| | |
|---|---|
| Etapa atual | 11 em andamento — lotes 1 a 6 entregues (capítulos 4 a 17, ilhas 5 a 18): a Parte I inteira e os projetos 1 e 2 da Parte II; o lote seguinte é o projeto 3 (aplicações web, capítulos 18 a 20), e 12 a 14 seguem em sequência, sem parada entre etapas (instrução do usuário) |
| Código de aplicação | mundo 3D com avatar, ciclo de estudo completo e persistência local |
| Mundo 3D | **existe**: dezoito ilhas suspensas **cada uma com forma, marco, vegetação e tom próprios** (D-053), e desde o lote 6.1 cada uma também com **madeira, pedra e folhagem no tom dela** e a **bandeira da trilha** fincada no capim (D-063); pontes ancoradas no capim desenhado, céu, mar, avatar que anda e câmera de terceira pessoa — as ilhas nascem do conteúdo, sem código novo de posicionamento |
| Conteúdo pedagógico | **existe** para as 18 unidades escritas (capítulos 1 a 17: a Parte I inteira e os dois primeiros projetos): missão, leitura (com o que observar), explicação, diagramas, 3 exercícios e 5 perguntas cada — e **todo** exercício com correção automática conferida no Python de verdade |
| Trilhas | **declaradas**: cada unidade pertence a uma trilha, e cada trilha diz o que o console roda ali — a do jogo diz que roda a lógica, e não a biblioteca gráfica (D-061); a de dados diz que roda a parte de dados, e não o gráfico nem a busca pela rede (D-062). No mundo, cada trilha tem bandeira e cor próprias (D-063) |
| Cor do mundo | **conferida contra a luz**: `ui/theme/luzDoMundo.ts` reproduz a conta do Three.js (luzes somadas + tone mapping ACES) e os testes cobram que nenhuma superfície desenhe queimada nem vire buraco (D-060) |
| Telas do ciclo de estudo | **existem**: missão, estudo (leitura + entendimento), prática, avaliação e resultado — com revisão explicada e placar de tentativas |
| Persistência | **existe**: `localStorage`, versão **3**, com migração das duas versões anteriores, aviso honesto de falha e ordem de gravação corrigida (Etapa 8) |
| Correção do exercício | **existe**: conferência por sonda, com o limite declarado na tela; `deuCerto` / `naoConfere` / `naoDeuParaConferir` — agora com **`try` por medida**, para uma medida impossível virar frase e não derrubar as outras (D-052) —, e o exercício conferido guardado **sem** aprovar a ilha (Etapa 10) |
| Execução de código (Pyodide) | **existe como prova de conceito**: console por ilha, interpretador servido pela própria aplicação, carregado sob demanda (Etapa 9). A ligação do Worker com o navegador é roteiro manual |
| Avatar | **existe**: anda pelo capim e pelas pontes, com chão declarado e sem queda (Etapa 5) |
| Livro na tela | **existe como orientação**: qual parte ler, por que, e o que procurar nela — **sem reproduzir texto do livro e sem número de página** (o PDF não está aqui) |
| Testes de navegador | **não executados** — não há navegador neste ambiente. A verificação de imagem é feita por **captura de tela de quem usa**, e foi assim que apareceram as ilhas iguais (D-053), o mundo escuro (D-054), a pedra fora do capim (D-055), a ilha azul-petróleo (D-056), a ponta repetida (D-057) e os quatro defeitos de cor de D-060 |
| Avaliação | **existe e é honesta**: enunciado que diz que a correção roda no cliente, envio exige todas as respostas, revisão explica todas as perguntas (Etapa 7) |

Badge honesto: **o protótipo já ensina e já avalia, com o mundo desenhado — mas ninguém viu o
desenho, porque não há navegador aqui.**

## Como rodar

    cd arquipelago-python
    npm install
    npm run dev          # servidor de desenvolvimento, escuta em 0.0.0.0:5173
    npm test             # 750 testes, em 42 arquivos (o conteúdo não pede teste novo: os testes percorrem o conteúdo real)
    npm run build        # checagem de tipos + build de produção
    npm run typecheck    # apenas a checagem de tipos

A primeira instalação precisa de `npm ci` (ou `npm install`) **antes** de qualquer outro comando: os
arquivos do Pyodide (13,9 MB) são copiados do pacote para `public/pyodide/`, que fica fora do Git.
Os ganchos `predev`, `prebuild` e `pretest` fazem a cópia sozinhos; para refazer na mão existe
`npm run preparar-pyodide`.

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

Na aba **Prática**, cada exercício traz o enunciado, uma dica, **como saber que deu certo**, a solução
possível (fechada até você abrir) e, quando o exercício pode ser conferido, o botão *Escrever e
conferir no console*. O console roda Python de verdade, e **não** baixa nada ao abrir a página — o
interpretador só vem no clique em *Ligar o Python (baixa cerca de 14 MB uma vez)*. Escolhendo o
exercício no console e clicando em *Rodar e conferir*, a conferência mostra item por item o que
esperava e o que veio, e diz **o que ela não julga**. Ela não é nota: quem aprova a ilha é a avaliação.
A mensagem de erro aparece inteira, com traceback; `input()` é recusado com a alternativa escrita; e um
programa que passa de 15 segundos sem responder faz a tela avisar, com o botão *Recomeçar do zero*,
que descarta o Worker — a única forma de interromper um laço infinito (D-041).

## O que foi entregue

### Etapa 1.1 — fundação

- Projeto Vite + React + TypeScript, dependências **exatas** e lockfile versionado.
- `src/ui/theme/tokens.ts`: fonte única das cores, com teste de contraste WCAG AA.
- `src/content/`: o conteúdo tipado das unidades escritas (hoje, as 12 — capítulos 1 a 11) e a regra de
  referência ao livro, com página `null` + `referencia-pendente` e o título do capítulo marcado como
  "a confirmar" quando não foi conferido (D-050).
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

### Etapa 9 — Python de verdade no navegador, com os limites ditos na tela

- `src/python/`: seis arquivos, cada um com uma responsabilidade — `protocolo.ts` (contrato e recusas,
  puro), `interpretadorPyodide.ts` (carrega e executa), `nucleoDoPython.ts` (atende pedido, nunca
  lança), `trabalhadorDoPython.ts` (fiação do Worker), `usePython.ts` (gancho do React, com vigia de
  demora e reinício) e `pyodideLocal.ts` (endereço dos arquivos);
- `scripts/preparar-pyodide.mjs` copia seis arquivos do pacote para `public/pyodide/` (fora do Git), e
  roda nos ganchos `predev`, `prebuild` e `pretest` (D-040);
- `src/ui/paineis/ConsoleDoPython.tsx`, integrado à aba **Prática** de cada unidade, com as soluções
  dos exercícios oferecidas como sugestão de teste;
- **`input()` medido, não imaginado:** a sondagem real ficou 170 s sem resposta e sem erro, e o
  processo teve de ser morto de fora. O console recusa `input(`/`sys.stdin` explicando a alternativa;
- **o conteúdo passou a ser executado em teste.** `pyodideDeVerdade.test.ts` roda os trechos reais das
  quatro unidades no interpretador real e achou **um defeito publicado**: `de numeros[0]` onde devia
  estar `del numeros[0]`, na unidade 4. Os dois trechos que terminam em erro **de propósito** passaram
  a trazer o motivo escrito, visível ao lado do código (D-043);
- **nada promete segurança:** o aviso "O que isto não é" e o teste que o cobra (D-041);
- a trava de acentuação reprovou a etapa uma vez por causa de um **nome de classe** lido como prosa
  (`"exercicio__nota exercicio__nao-roda"`); a classe virou um token só, e a trava ficou como estava.

### Etapa 10 — exercícios com correção automática, e o limite escrito na tela

- `src/learning/correcaoDeExercicio.ts`: a conferência inteira, pura — monta a sonda
  (`programaDaConferencia`), separa a medida da saída (`separarSondagem`), compara o que o programa
  imprimiu (por trecho, **na ordem**), o que ficou guardado (com `repr`, para distinguir `7.0` de `7`)
  e a forma pedida (linhas não vazias, comentário no **código do estudante**), e devolve o veredito item
  por item, com o limite (D-044, D-045);
- `src/content/tiposDeConteudo.ts`: `correcao` no exercício, com `limite` **obrigatório** — correção sem
  limite declarado é recusada pelo validador;
- **dez dos doze exercícios passaram a ter correção**, e os dois que não têm trazem o motivo escrito
  (`naoRodaNoConsole`), visível ao lado do exercício: são comandos de terminal, que só existem no
  computador de quem estuda;
- `src/ui/paineis/ConsoleDoPython.tsx` e `PraticaDaUnidade.tsx`: escolha do exercício no console, botão
  *Rodar e conferir*, veredito com **esperado × obtido**, limite declarado, selo por exercício e o texto
  que diz, na mesma frase, que o resultado está guardado **e** que isso não aprova a ilha;
- o exercício conferido entrou no progresso (`exerciciosResolvidos`, formato 3, com migração da 1 e da 2),
  sem aprovar unidade, sem contar tentativa e sem mudar nota (D-046, D-047);
- **defeito real encontrado e corrigido**: o Pyodide reaproveitava o espaço de nomes entre execuções, e
  uma resposta errada (`print(40)`) passava porque `figurinhas` de uma execução anterior sobrevivia.
  Cada execução passou a rodar num espaço de nomes novo, destruído no fim;
- o teste que roda Python de verdade cobra que **cada solução de referência passe na própria correção**
  e que quatro respostas erradas sejam reprovadas, cada uma pelo item certo.

### Etapa 11 — lote 1: capítulos 4 e 5 nas ilhas 5 e 6

- `src/content/unidades/u05MoinhoDasRepeticoes.ts`: laço `for` (a variável recebe o item, não o índice),
  recuo, `range()` com o segundo limite fora, `len`/`sum`/`max`/`min`, fatias, a diferença entre
  `precos[:]` e `precos` e por que tupla não muda. 3 exercícios (todos com correção), 5 perguntas,
  1 bloco marcado como "não roda neste console" (a tupla que tenta mudar um item);
- `src/content/unidades/u06EncruzilhadaDasDecisoes.ts`: `=` não é `==`, `if`/`elif`/`else` com a
  condição mais estreita primeiro, `and`/`or`/`not`, `in` com listas. 3 exercícios (todos com correção),
  5 perguntas, 1 bloco marcado (`if idade = 18:` → `SyntaxError`);
- **uma unidade nova agora é dado, não código**: as ilhas nasceram no mundo com as pontes certas sem
  tocar em nenhuma conta de posição — a curva, a distância entre centros e o vão das pontes já saíam do
  índice da unidade (D-049);
- **o que quebrou foi o que estava escrito à mão**: `0 de 4 ilhas aprovadas` aparecia em dezenas de
  asserções. Todas as contagens passaram a sair do plano e do conteúdo real, e o teste do interpretador
  de verdade deixou de aceitar "pelo menos dez exercícios com correção" para exigir **todos os que o
  conteúdo declara**;
- **"planejada" virou mentira, e o teste antigo exigia a mentira**: as quatro primeiras unidades já
  tinham ciclo completo e continuavam marcadas como planejadas. O teste agora compara o campo com o
  conteúdo, nas duas direções (D-048), e o painel do projeto mostra as seis unidades como prontas;
- **honestidade sobre o livro mantida**: os capítulos 4 e 5 entraram sem o PDF em mãos — o número do
  capítulo é certo, o título em português está marcado como **a confirmar** e as páginas continuam
  `null` (D-050);
- o lote **não foi visto em navegador nenhum**: o mundo com seis ilhas é provado em teste, e a
  travessia a pé até as ilhas novas é o item 54 do roteiro manual.

### Etapa 11 — lote 2: capítulos 6 e 7 nas ilhas 7 e 8

- `src/content/unidades/u07FarolDosRegistros.ts`: dicionários — chave e valor, acesso e alteração,
  `del`, a consulta segura com `.get()`, o `KeyError` do trecho marcado, as três formas de percorrer
  (`.keys()`, `.values()`, `.items()`) e listas dentro de dicionários. 3 exercícios (todos com
  correção), 5 perguntas, 1 bloco marcado (o `KeyError` de propósito);
- `src/content/unidades/u08EstacaoDasPerguntas.ts`: `input()`, a conversão com `int()`, o laço `while`
  com contador, a condição conferida antes de cada volta, `break` e `continue`, `while` com listas e o
  laço infinito. 3 exercícios (todos com correção), 5 perguntas, 4 trechos marcados (três com
  `input()`, um com `ValueError`), 1 aviso de versão sobre `raw_input()`;
- **o capítulo que precisa de teclado entrou assim mesmo**, e a decisão está registrada: o console da
  ilha não tem teclado, então todo trecho com `input()` está marcado, com a alternativa escrita ao
  lado, e o exercício da tabuada traz as duas soluções — a de verdade e a que roda aqui (D-051);
- **o teste do interpretador de verdade achou um erro no conteúdo do lote**, e o erro era do conteúdo:
  o exercício das chaves em ordem alfabética pedia a saída em uma linha só, e a conferência procura os
  textos esperados **um por linha, na ordem**. O exercício passou a pedir uma chave por linha — e a
  conferência não foi afrouxada para acomodar o texto;
- o mundo ganhou as ilhas 7 e 8 sem uma linha nova de posicionamento, e as pontes 6–7 e 7–8 fecharam
  sozinhas (D-049).

### Etapa 11 — lote 3: capítulos 8 e 9 nas ilhas 9 e 10

- **a sonda da conferência ficou defensiva antes do conteúdo (D-052)**: cada valor medido roda no
  próprio `try`, e a medida que não pode ser feita vira um item com frase em português ("o programa não
  tem esse nome quando termina") — sem isso, uma função com o nome trocado derrubava a conferência
  inteira com um `NameError` que a pessoa não escreveu. O teste do interpretador real passou a exigir
  que o programa **não** termine com erro nesse caso;
- `src/content/unidades/u09OficinaDasFuncoes.ts`: definir função, parâmetro × argumento, chamada por
  posição e por palavra-chave, valor padrão e por que ele vem por último, `return` contra `print` (com o
  `None` aparecendo na tela), devolver dicionário em vez de fila de valores, lista recebida por
  referência, e as três formas de `import`. 3 exercícios (todos com correção), 5 perguntas, nenhum
  trecho marcado;
- `src/content/unidades/u10TorreDasClasses.ts`: classe como molde × objeto, `__init__` e `self`, dois
  objetos com estados independentes, método que muda o estado (a conta que deposita), herança com
  `super().__init__` e um `avisoDeVersao` explicando por que o livro escreve `class Cachorro(object)` e
  `super(Cachorro, self)` — porque era o certo na época. 3 exercícios (todos com correção), 5 perguntas;
- **a conferência agora chama o código de quem estuda**: os exercícios do capítulo 8 medem
  `saudacao("Ana")`, `media([7, 9, 5])` e `descrever_pizza("grande")`; os do capítulo 9 medem
  `rex.nome`, `Conta("Bia").saldo` e `mimi.falar()`. O `limite` de cada exercício diz isso em português,
  inclusive que a conferência não exige o nome do parâmetro (as chamadas dela são por posição);
- **um guarda do projeto apontou um nome de classe CSS como se fosse texto humano**:
  `qa/acentuacao.test.ts` lê strings com espaço como frases, e o nome de classe de dois tokens foi lido
  como prosa — o guarda achou ali uma palavra sem acento. Os nomes viraram um token só
  (`exercicio__aviso-do-console`, `explicacao__aviso-do-console`), sem afrouxar o guarda;
- as ilhas 9 e 10 nasceram do conteúdo, outra vez sem uma linha nova de posicionamento, e as pontes 8–9
  e 9–10 fecharam sozinhas (D-049);
- o lote **não foi visto em navegador nenhum**: o mundo com dez ilhas é provado em teste, e a travessia
  a pé até as ilhas novas é o item 54 do roteiro manual.

### Conserto depois do lote 3: as ilhas estavam todas iguais (D-053)

- **o defeito foi relatado por quem usa o mundo**, e não por um teste: *"as ilhas estão todas
  iguais"*. Era verdade — mesmo raio, mesma altura, mesmas estruturas, mesma cor; só a pedra tremia
  diferente. A suíte aprovava porque cobrava uma ilha por unidade, e nunca perguntou se duas ilhas
  eram diferentes;
- `src/world/geometria/identidade.ts`: o que distingue cada ilha — silhueta (raio 5,2 a 6,9; altura
  7,7 a 10,9; 10 a 18 lados; abertura do perfil), marco, vegetação (2 a 5 árvores, 3 a 6 pedras) e
  tom (dez misturas de tokens, nenhuma cor escrita à mão);
- `src/world/geometria/marcos.ts`: os dez marcos, um por ilha, escolhidos para dizer o que a ilha
  ensina — portal, bancada, estante, barracas, moinho de pás, placas, farol, estação, engrenagens e
  torre. Sete deles têm parte animada (pás, feixe, cata-vento, volante, ponteiro, bandeira e o par de
  engrenagens, que gira em sentidos opostos);
- **três contas de mundo mudaram por causa dos raios diferentes**: o espaçamento entre ilhas passou a
  ser acumulado (`raio + raio + vão`, para o vão continuar constante); a ponte subiu de **borda a
  borda** (com inclinações diferentes, a diferença entre centros deixaria a ponte acima ou abaixo do
  capim de destino); e o chão caminhável passou a ler a inclinação daquela ilha;
- **o que o teste passou a cobrar**: dez marcos, dez silhuetas e dez tons diferentes; nenhum par de
  tons a menos de 40 de distância em RGB; marco dentro do capim com 2% de folga; volume assinado
  positivo (face virada para dentro); eixo de giro certo por marco; e, na árvore 3D, dez marcos
  distintos e **profundidades de pedra distintas**;
- **o que continua sem prova**: a aparência. Não há navegador com WebGL aqui — a conferência visual
  do conserto é o **item 55** do roteiro manual, e quem olha é quem usa.

### Conserto depois do lote 3: a cor do mundo (D-054)

- **o defeito apareceu na primeira captura de tela do mundo**, enviada por quem usa: as ilhas eram
  silhuetas quase negras (paredes em `#1a1714`) com o céu claro. Estava assim desde a Etapa 4;
- eram **duas causas somadas**: a pedra e o capim eram pintados por vértice **e** recebiam a cor da
  situação no material (o Three.js multiplica as duas), e a cor por vértice era gravada em sRGB, que o
  Three.js lê como linear (um cinza médio de paleta chegava à tela como 0,74);
- `geometria/pintura.ts` ganhou `canalLinear`: a mistura continua em sRGB (onde a paleta foi pensada)
  e só o valor gravado no vértice é convertido para linear;
- `Malha.tsx` agora **recusa** tinta em malha pintada — pelo **tipo**, não por comentário: `cor` só
  existe para malha sem cor por vértice. O defeito não pode ser reescrito por acidente;
- a cor de estado entrou no gradiente (`corDeUnidadeBloqueada`), então a ilha bloqueada continua
  reconhecível pela própria pedra; as estruturas, a placa e o farol seguem com `corDaSituacao`;
- **o tom da ilha no capim caiu de 45% para 22%** (D-053 tinha deixado o capim da ilha de tom rosado
  rosado). O tom fica inteiro no marco, que é a assinatura da ilha;
- **três testes novos cobram o que faltava**: malha pintada sem tinta (as 20 malhas de cada ilha),
  canais abaixo de 0,8 (a faixa que só existe em sRGB) e **o capim é verde em todas as ilhas**;
- o caminho antigo (`corDaRocha`, `corDoCapim` e as duas cores de terreno bloqueado pré-calculadas)
  saiu junto, por não ter mais chamador; `escurecerCores` ficou, registrado em D-054.

### Conserto depois do lote 3: a pedra fora do capim e as nuvens escuras (D-055)

- **a pedra da ilha e o capim sorteavam a própria borda de forma independente** (`semente` e
  `semente + 7919`). Resultado visível: as pontas da pedra subiam acima do plano do topo (até **0,72**
  na ilha 1) e apareciam como manchas cinzas no verde; e, em metade das direções, a pedra era mais
  larga que o capim, virando uma moldura cinza em volta do topo;
- `gerarRocha` agora **declara** a irregularidade da borda que usou (`bordaDoTopo`) e `gerarTopo`
  recebe `bordaMinima`: a borda do capim é o maior entre o sorteio dele e o da pedra, coluna a coluna.
  O capim passa a ser, por construção, o teto da ilha;
- o **anel do topo da pedra não tem tremor vertical**. A primeira tentativa foi deixar o tremor só
  descendente, e o teste de orientação reprovou (a coluna que descia torcia a faixa da parede e virava
  uma face para dentro);
- **as nuvens eram claras de cor e escuras na tela**: a luz do mundo tem metade da cor do mar, e a face
  de baixo de cada nuvem recebia só essa metade (calculado: `#4E93A5`). `Malha3D` ganhou `semLuz`, e as
  nuvens são desenhadas chapadas — é a única forma chapada do mundo, e é de propósito;
- **dois testes novos cobram o que faltava**: o capim cobre a pedra em cada direção (no teste da
  árvore 3D, em todas as ilhas) e nenhuma nuvem recebe luz.

### Conserto depois do lote 3: a ilha azul-petróleo e o farol solto (D-056)

- **a ilha parecia uma barbatana azul.** A causa não era a paleta: era a luz. O chão da meia-esfera era
  a cor do **mar** (`#3E8E96`), e é justamente a face virada para baixo que forma a parede de uma ilha
  suspensa. A ponta da pedra saía em `#081112` (preto esverdeado) e a luz que chegava lá era `#72b1bd`.
  O chão da luz passou a ser a rocha clara da paleta (`#8A8580`): mesma luminância (0,237 contra 0,226),
  croma 0,04 contra 0,26. A parede saiu de `#646b6d` (azulada) para `#6c696a` (neutra), e o capim não
  mudou;
- **os pontinhos escuros do céu não eram as nuvens** — a varredura da árvore 3D mostrou que os objetos
  mais altos da cena são os **faróis de estado**, a 21,8–29,0 de altura nas ilhas 7 a 10. As nuvens já
  estavam claras e chapadas desde D-055;
- o farol de estado **ganhou mastro**: um poste fino da paleta desce do farol até o capim, com a base
  enterrada 0,3. O farol continua na mesma altura e continua girando; o que muda é que agora se vê que
  ele está em cima de um poste. **A função não foi tocada** — continua um farol por ilha, com a cor do
  estado dela.

### Conserto depois do lote 3: a ponta da pedra (D-057)

- **a fileira das dez ilhas parecia a mesma ilha repetida**: todas terminavam no mesmo espinho de 0,02
  do raio do topo. D-053 prometeu "de ilha atarracada a ilha em agulha" e só a agulha veio — porque o
  raio da ponta estava **escrito dentro de `gerarRocha`**, igual para todas;
- a ponta passou a ser **da ilha**: `gerarRocha` aceita `pontaDoPerfil` (o padrão 0,02 continua, para
  quem chamar a geometria sem dizer nada), e `identidadeDaIlha` decide com duas fontes — a **família**
  vem da posição no percurso (espinho, ponta rombuda, toco: as três aparecem sempre) e o **valor**
  vem da semente (duas ilhas nunca terminam iguais);
- medido: a largura da ponta vai de **0,11** (ilha 10, um alfinete) a **2,04** (ilha 9, um toco) — em
  ilhas de 5 a 7 de raio, quase duas unidades de diferença;
- o teste novo cobra as três famílias, a diferença entre a menor e a maior ponta, o raio da última
  faixa da malha, e — na árvore 3D — que as dez pontas medidas não sejam todas o mesmo bico.

### Etapa 11 — lote 4: capítulos 10 e 11 nas ilhas 11 e 12 (a Parte I fica inteira)

- `src/content/unidades/u11ArquivoDasGavetas.ts`: `with open(...)`, os três modos (`"r"`, `"w"` que
  apaga, `"a"` que acrescenta), ler linha por linha e o `\n` que vem junto, `try`/`except
  FileNotFoundError`/`else`, e `json.dump`/`json.load` guardando um dicionário. 3 exercícios (todos com
  correção), 5 perguntas, nenhum trecho marcado — **os exercícios de arquivo rodam no console**, que tem
  um sistema de arquivos em memória (D-059);
- `src/content/unidades/u12BalancaDosTestes.ts`: o que é um teste, `assert` com mensagem, a classe
  `TestCase` com `assertEqual`, os casos que quebram (zero, vazio, limite) e o limite do que um teste
  prova. Ensina o **`TextTestRunner`**, e explica com o resultado medido por que o `unittest.main()` do
  livro informa `Ran 0 tests` neste console (D-059);
- **dois marcos novos, estáticos**: o **arquivo de gavetas** (ilha 11) e a **balança de dois pratos**
  (ilha 12). `MARCOS` passou de 10 para 12;
- **dois tons novos**, misturas de tokens escolhidas por distância medida: `#35888a` e `#7a6858`. O menor
  par dos doze tons ficou em 48,9, e o teste cobra 40;
- **a medida achou três contas erradas** nos marcos recém-escritos (D-058): o puxador da gaveta foi feito
  com `cilindro`, que nasce em pé a partir da base — virou uma coluna atravessando as três gavetas, com o
  topo em 3,95 × escala onde a peça mais alta do móvel está em 3,52; a coluna da balança recebeu como
  comprimento a altura do fulcro em vez da diferença até a base, e terminava 0,34 acima da travessa; e o
  `raioOcupado` da balança dizia 1,95 quando a peça ocupa 2,1064 — declarado **menor** que o real. O peso
  também estava no prato que subiu, contando a história ao contrário. Tudo corrigido e remedido;
- **número escrito à mão em teste é dívida**: os testes que contavam ilhas passaram a usar
  `PLANO_DE_UNIDADES.length` e `CORES_DAS_ILHAS.length`, os nomes "as dez ilhas têm dez tons" viraram
  "cada ilha tem um tom diferente", e o painel do projeto passou a derivar o total das unidades dos dados
  — os quatro textos "10 unidades" do painel envelheciam a cada lote;
- todas as seis soluções novas foram **rodadas no Pyodide de verdade**, junto com as medidas da
  conferência: nenhuma exceção, e cada medida deu exatamente o valor declarado (tabela em
  `docs/TEST_REPORT.md`);
- o lote **não foi visto em navegador nenhum**: as duas ilhas novas, os dois marcos e os dois tons são
  provados por medida, e a captura de tela de quem tem WebGL continua sendo a verificação de pixel.

### Conserto depois do lote 4: a cor que chega à tela (D-060)

- **o defeito apareceu na segunda captura de tela** (ilhas 9 a 12), e eram quatro: a laje do mar
  distante era um retângulo de papel branco, as nuvens eram lâminas, o bico de baixo das ilhas era um
  espeto preto e as árvores eram torrões marrons;
- **nenhum teste pegava**, porque todo teste de cor comparava o **token** com a paleta, e o token estava
  certo nos quatro casos. O que decidia a cor era a **luz somada ao material**, comprimida pelo tone
  mapping ACES (o padrão do React Three Fiber);
- **a conta virou módulo** (`ui/theme/luzDoMundo.ts`): sRGB → linear, luzes somadas, ACES, sRGB — com os
  números das luzes guardados e cobrados por teste, para o conserto não envelhecer;
- **medido antes:** mar distante com **1,083** de radiação; parede da biblioteca com **1,001**; ponta do
  penhasco com **0,022** (`#030201` na tela); marcos das ilhas 3, 6, 7 e 10 com 0,96 a **1,49** (pior
  quando a unidade está bloqueada, porque a mistura com a névoa clareia); cabeça do avatar com **1,463**;
- **consertos:** orçamento de luz aplicado onde o mundo desenha (marco, avatar e parede da biblioteca);
  `vazio` virou **`marDistante`** (o nome mentia) e passou a ser desenhado chapado, mais escuro que o
  céu; nuvens com achatamento máximo de 4,5:1 (era 10,9:1); ponta do penhasco em `misturar(rocha, nevoa,
  0,12)`, com o gradiente de profundidade mantido em 2,2×; e a **árvore ganhou duas cores** (tronco de
  madeira, copa de conífera — o token existia e não tinha uso);
- **o preço do orçamento está registrado:** o menor par entre os doze marcos desenhados fica em 33,2; e
  o valor 0,28 para a ponta foi testado e **descartado por medida** (o penhasco virava parede cinza
  uniforme);
- **todos os pixels continuam sem verificação automática:** este conserto foi achado por olho de quem
  usa e medido aqui; a confirmação na tela é a próxima captura.

### Etapa 11 — lote 5: o primeiro projeto do livro vira trilha (capítulos 12 a 14 nas ilhas 13 a 15)

- **a decisão que abriu o lote (D-061):** a Parte II do livro são três **projetos**, e três delas
  dependem de bibliotecas que este console não tem. Medido antes de escrever qualquer linha:
  `import pygame`, `import django` e `import matplotlib` **falham** nesta distribuição do Pyodide;
  `sqlite3`, `csv`, `json` e `random` **funcionam** (biblioteca padrão); e `loadPackage` **resolveria a
  promessa mesmo sem carregar nada**, tentando o CDN para depois falhar em silêncio. Daí as três
  decisões: a Parte II entra como **trilha**, não como ilha comum; o que se pratica é a **lógica** em
  Python puro; e a trilha diz isso na tela, antes da primeira ilha do grupo;
- **o que as unidades ensinam:** o laço de quadros e a nave presa à borda (capítulo 12); as balas em
  lista, a limpeza das que saem da tela e a frota em fileiras que anda e desce (13); a colisão por
  retângulo, vidas, pontos, o nível que acelera e o jogo que recomeça (14);
- **o que ficou de fora, e está dito na tela:** abrir a janela, desenhar a imagem e tocar o som. Nenhum
  bloco de Pygame aparece como se rodasse, e um teste reprova trecho de Pygame sem o aviso;
- **as ilhas 13 a 15 ganharam identidade própria:** marcos `nave`, `enxame` e `mira` (o único marco do
  arquipélago com buraco no meio) e os tons 13 a 15, procurados por medida;
- **duas medidas erraram e foram corrigidas:** a primeira escolha de tom trazia um verde-sálvia que,
  **depois de desenhado**, ficava a 28,5 do tom 6 (piso do projeto: 30) — foi trocado por um cáqui e o
  par mais próximo dos quinze voltou a 32,1; e duas declarações dos marcos novos estavam erradas (raio da
  nave declarado em 1,55 com real 1,0132; altura da mira em 2,98 com real 2,9913, porque são as
  **quinas** das barras dos aros que passam do círculo);
- **duas contas minhas nos exercícios estavam erradas, e o console real pegou:** a frota de `e14-3`
  parava em 520 e não em 340, e a solução de `e15-3` pedia o nível 4 com a variável já em 3. É para isso
  que o teste roda as soluções no Pyodide de verdade.

### Etapa 11 — lote 6: o projeto 2 vira trilha (capítulos 15 a 17 nas ilhas 16 a 18)

**O que entrou.** As três unidades do projeto de dados — 16 (gerar dado), 17 (ler arquivo) e 18 (receber
de fora) —, os marcos `funil`, `prancheta` e `antena`, os tons 16 a 18, e a trilha
`visualizacao-de-dados` declarada **escrita** (D-062). Com dezoito marcos para dezoito ilhas, nenhuma ilha
repete a construção de outra; com dezoito tons, nenhuma repete a cor.

**O que foi medido antes de escrever.** Os `import` no Pyodide desta versão, um a um: `csv`, `json`,
`random`, `datetime`, `statistics`, `math`, `collections`, `urllib.parse`, `os`, `pathlib` e `sqlite3`
rodam; `requests`, `matplotlib`, `numpy` e `pandas` **não existem**. `loadPackage` tentaria o CDN, que
esta rede não alcança (D-040) e resolve sem lançar — o teste honesto é o `import`, e foi ele que decidiu o
que cada unidade promete. A trilha, o texto de cada unidade e a tabela do `BOOK_MAP.md` saíram daí.

**Os nove exercícios foram executados no Python de verdade** antes de entrar no conteúdo, e as saídas
medidas estão no `TEST_REPORT.md`. Dois defeitos foram pegos por teste antes do commit: as respostas
certas das unidades novas se concentravam em três posições (o teste exige as quatro), e a
`estrutura.linhasNaoVazias` de dois exercícios contava linhas de **código** quando o campo mede linhas
**impressas** — o Pyodide reprovou a resposta de referência, que é o que esse teste existe para pegar.

### Conserto depois do lote 6: a ponte no ar, o chão no ar e as ilhas sem vida (D-063)

**O que a captura mostrou.** *"temos alguns problemas com graficos ruins e as pontes não encostam nas
ilhas"*; *"as ilhas poderiam ter caracteristicas do tema que ta sendo abordado, elas estão todas sem
vidas"*. As três queixas foram medidas e as três tinham causa.

**1. A ponte.** `ponteEntre` ancorava as pontas no **raio nominal**, e a borda do capim é um **polígono**
que recua e avança 12% em volta dele. Medido: das 34 pontas, **6 estavam no ar**, a pior a 0,582 além da
borda desenhada, com desvio máximo de **0,941** entre a âncora antiga e a borda real — na ilha de raio 6,
quase um sexto do raio. Agora `fatoresDaBorda` (extraída de `gerarTopo`, mesma semente) e
`bordaDoTopoEmDirecao` dão a borda na direção da ponte, e o teste cobra cada ponta entre a corda mínima e
a borda externa: **0 no ar, 0 enterradas**.

**2. O chão caminhável ia atrás do mesmo erro**, e foi consertado junto: o alcance do pé passou a ser
medido na direção do ponto, pelo mesmo polígono — antes o avatar andava no ar onde a borda recuava.

**3. A ponte bloqueada.** Construía metade do vão a partir da origem, e o que se via era uma tábua
pendurada. Agora as tábuas saem das **duas** pontas, o vão fica no meio (um quarto do total), com travessa
de parada, e o gerador devolve `tabuasConstruidas` e `vaoAberto` como dado.

**4. As ilhas eram a mesma ilha dezoito vezes.** Cinco cores compartilhadas (parede, poste, tronco,
conífera, rocha clara) em todas. Agora `coresDaIlha(tom)` tempera cada uma com o tom da própria ilha —
frações medidas, com o desvio do token e o menor par entre ilhas na tabela de D-063 —, e a copa da árvore
é escurecida, porque sem isso a folhagem da ilha mais clara ficava a 12,0 do capim dela.

**5. O capim vazio.** Arbustos (4 a 9 por ilha) e flores (3 a 7), da mesma malha da pedra solta, sorteados
**depois** dos enfeites que já existiam — árvores e pedras de nenhuma ilha mudaram de lugar.

**6. A marca da trilha.** Uma bandeira por ilha, com quatro formas e quatro cores (uma por trilha), e a
mesma cor no título do grupo na lista de ilhas. O lugar da bandeira foi escolhido fora da linha da ponte.

**O que não foi visto.** Nada disto foi visto em navegador nenhum: o sandbox não tem WebGL, e a
verificação visual depende das capturas do usuário. O roteiro do que conferir na próxima captura está no
`TEST_REPORT.md`.

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
| Nenhum navegador no ambiente | Sem teste de navegador automatizado. O desenho 3D só foi visto por quem usa — foi assim que apareceram "as ilhas estão todas iguais" (D-053), o mundo quase preto (D-054), a pedra fora do capim (D-055), a ilha azul-petróleo (D-056) e a ponta repetida (D-057) | Registrado em `TEST_REPORT.md`, com roteiro manual de 60 itens |
| WebGL ausente | A aparência, a luz e o desempenho da cena continuam sem verificação automática | Só o roteiro manual cobre isso |
| Web Worker nunca rodou em navegador | A fiação do console com a página é roteiro manual (itens 46 a 50), não teste | Nada bloqueia; a Etapa 10 usa o mesmo caminho |
| `public/pyodide/` fora do Git | Quem clonar sem `npm ci` não tem o interpretador | `npm run preparar-pyodide`, chamado pelos ganchos de `dev`, `build` e `test` |

## Decisões que ainda precisam do usuário

1. **Enviar o PDF** e as imagens de referência, ou confirmar que não serão enviados.
2. Reavaliar a densidade do capítulo 2 quando o PDF chegar (D-001 pode mudar para a opção A).
3. Definir se o **modo apresentação** (letreiro, faixa de teclas, pílula de navegação, inspirado
   nas referências) entra no protótipo ou fica para a Etapa 13.

## Próximo passo (em execução, sem parada)

**Etapa 11, lote 7 — o projeto 3: aplicações web (capítulos 18 a 20, ilhas 19 a 21).** O lote 6
escreveu o projeto 2 inteiro e virou a trilha dele para `'escrita'` (D-062); o conserto do lote 6.1
(D-063) tratou o que a captura de tela mostrou. O que vem agora já está declarado em `TRILHAS`: a trilha
`aplicacoes-web` está como `'planejada'`, com o que o console roda ali (o Django **não** roda — medido —, e
o projeto não levanta servidor nenhum: a parte que se escreve é a função que recebe os dados de um pedido
e devolve a resposta). O lote 7 é escrever as três unidades dela, marcos, tons, e virar a situação para
`'escrita'`.

O recorte que já se sabe, pela medição do lote 5: a parte de **dados** roda (`csv`, `json`, `random`,
estatística em Python puro), e o **desenho do gráfico** não (`import matplotlib` falha; o `numpy` que ela
pede não está na cópia local e o CDN está bloqueado). O mesmo cuidado do lote 5 vale aqui: exercício que
ensine a preparar os dados roda e tem correção automática; o gráfico é descrito, não fingido. Vale
lembrar também que o livro usa `pygal.i18n` e `Worldmap`, que **não existem mais** — está na tabela de
adaptações do `BOOK_MAP.md`, e a regra é não ensinar por um caminho morto sem dizer que ele morreu.

O caminho de um lote de conteúdo, para quem continuar: escrever as duas unidades, registrar no plano e
no registro, deixar o validador, os testes de conteúdo e o teste do interpretador de verdade apontarem o
que falta, e conferir em Pyodide **antes** de escrever qualquer afirmação sobre o que roda.

**Ao chegar na Etapa 12, uma decisão de produto vale a pena:** o console não sabe ler o teclado, e o
capítulo 7 mostrou o custo disso. Fazer o console receber as respostas do `input()` (uma lista de linhas
que o programa lê) é o primeiro candidato da Etapa 12 — e, quando existir, os trechos marcados da
unidade 8 são os primeiros a serem reescritos (D-051).

Dependência herdada: o **PDF do livro não está nesta máquina**, então toda página continua `null`, o
título em português dos capítulos 4 a 11 fica marcado como "a confirmar" e a leitura recomendada fala em
capítulo e seção, não em página.

## Como continuar sem mim

1. Ler este arquivo.
2. Ler `docs/STAGES.md` para saber o que está autorizado.
3. Ler `docs/DECISIONS.md` **antes** de mudar qualquer coisa estrutural.
4. Rodar `npm test` e `npm run build` para confirmar que o ponto de partida está saudável.
5. Não antecipar etapa: se a decisão não está registrada, ela ainda não foi tomada.
