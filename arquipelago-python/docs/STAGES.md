# ETAPAS

Regra do processo: **executa-se somente a etapa ou subetapa autorizada.** Aprovação de uma etapa
não autoriza a seguinte. Se uma etapa envolver sistemas demais, ela é dividida antes de começar.
E erro encontrado é corrigido **antes** de avançar.

Legenda de estado: `concluída` · `em andamento` · `não iniciada`

| Etapa | Escopo | Estado |
|---|---|---|
| 0 | Análise dos anexos, identificação do livro, plano das três primeiras ilhas | **concluída** |
| 1 | Fundação: projeto, tema visual e documentação | **concluída** (1.1 e 1.2) |
| 2 | Domínio e progressão, testados | **concluída** |
| 3 | Uma ilha 3D, com o ciclo funcionando de ponta a ponta | **concluída** |
| 4 | Três ilhas e as pontes | **concluída** |
| 5 | Navegação e avatar | **concluída** |
| 6 | Estudo e leitura do livro na tela | **concluída** |
| 7 | Avaliação | não iniciada |
| 8 | Persistência local e protótipo jogável | não iniciada |
| 9 | Prova de conceito de Pyodide | não iniciada |
| 10 | Exercícios com correção automática | não iniciada |
| 11 | Expansão curricular, em lotes de 2 a 3 unidades | não iniciada |
| 12 | Recursos complementares | não iniciada |
| 13 | Polimento, acessibilidade e desempenho | não iniciada |
| 14 | Auditoria e entrega | não iniciada |

---

## Etapa 0 — Análise e plano (concluída em 21/09/2026)

Inspeção do repositório, identificação do livro, mapa curricular preliminar, proposta técnica,
riscos e divisão das etapas. Nenhum código escrito.

**Aprendizados que mudaram o plano:**

- o repositório é **público** — o que obrigou à decisão D-003 (PDF e imagens de terceiros nunca
  versionados);
- as imagens de referência não chegaram ao disco — a análise visual é estimativa, e está
  registrada como tal;
- o PDF do livro não está disponível — toda página ficou `null` (D-010);
- as referências visuais são uma **aplicação 3D de verdade** de outro projeto, e uma delas é um
  vídeo dela — o que confirma o requisito de entregar aplicação, e não maquete nem gravação.

## Etapa 1 — Fundação (concluída)

Dividida em subetapas porque envolvia projeto, tema e documentação ao mesmo tempo.

### 1.1 — Projeto, tema visual e documentação (concluída em 21/09/2026)

- projeto Vite + React + TypeScript em `arquipelago-python/`, com versões exatas fixadas e
  `package-lock.json`;
- tema visual derivado das referências, com **fonte única de tokens** e teste de contraste
  WCAG AA;
- as 4 primeiras unidades mapeadas ao livro, em dado tipado, com página `referencia-pendente`;
- os documentos de continuidade em `docs/`;
- esqueleto de `src/` com a responsabilidade e os limites de cada pasta escritos no próprio
  diretório;
- servidor de desenvolvimento escutando em `0.0.0.0`, compatível com preview remoto.

### 1.2 — Guia de estilo navegável (concluída em 21/09/2026)

- segunda página (`#/tema`) com a linguagem visual em **espécimes**: paleta lida dos tokens,
  escala tipográfica, etiquetas de estado, amostras do rótulo de ilha e da faixa de teclas;
- **tabela de contraste medida na hora**, a partir dos pares declarados pela interface;
- navegação por hash, sem dependência nova (D-016);
- nenhum controle falso: nada clicável no guia, e os espécimes do mundo 3D estão rotulados como
  espécimes;
- correção de acentuação em todo o código (D-015) e trava automática em `qa/acentuacao.test.ts`.

**Limite explícito:** nenhum 3D, nenhuma aula, nenhuma pergunta, nenhum armazenamento, nenhum
Pyodide.

## Etapa 2 — Domínio e progressão (concluída em 21/09/2026)

`src/learning/` implementado como funções puras e testadas:

| Arquivo | O que faz |
|---|---|
| `avaliacao.ts` | Nota, aprovação com 80% reais em aritmética inteira, exibição que nunca arredonda para cima, correção das respostas, recusa de envio em branco |
| `percurso.ts` | Estado de cada unidade, desbloqueio de uma por vez, registro de tentativas, melhor nota, progresso versionado e serializável |
| `resumoDoProjeto.ts` | Frases da interface montadas a partir das constantes, para a tela não poder mentir |

**Nada disto tem tela ainda.** É proposital: as regras vêm antes da interface, e não no meio dela.

## Etapa 3 — Primeira ilha 3D (concluída em 21/09/2026)

O escopo executado acabou sendo **maior** que o proposto numa coisa e menor em outra: o mundo já
tem as **quatro** ilhas desenhadas e as pontes entre elas (a Etapa 4 pede três ilhas e as pontes),
mas o **avatar** não existe (Etapa 5), nem o livro na tela (Etapa 6), nem Pyodide (Etapa 9). A
divisão em subetapas foi decisão interna, e não uma parada para autorização.

### 3.1 — Camada pura do mundo (concluída)

- `world/geometria/`: gerador determinístico (`aleatorio.ts`), rocha e topo da ilha (`ilha.ts`),
  sólidos com faces para fora (`solidos.ts`), pintura por altura (`pintura.ts`);
- `world/mapaDoMundo.ts`: onde cada ilha fica, onde cada ponte vai, enquadramento e espalhamento;
- `world/mundoVisivel.ts`: **o único elo** entre progresso e cena — as ilhas chegam com situação e
  acessibilidade já resolvidas, e as pontes com "liberada" já decidido. A cena não decide nada
  (D-004);
- `world/camera/movimento.ts` e `world/teclas.ts`: limites de câmera, interpolação, teclas por
  `code`, sem vazamento de tecla presa.

### 3.2 — Camada visual e o ciclo na tela (concluída)

- cena React Three Fiber (`Cena`, `Ilha`, `Ponte`, `Ceu`, `CameraLivre`), com importação sob
  demanda (D-022);
- painéis do ciclo: missão, estudo, prática, avaliação e resultado;
- HUD com modo de câmera, resumo do placar e teclas; trilha em texto equivalente, com o mesmo
  conteúdo e as mesmas regras — a alternativa acessível **e** a interface de quem está sem placa
  de vídeo;
- persistência ligada à tela (`useProgressoPersistido`), com aviso honesto de falha;
- testes de interação com DOM de verdade (D-020), que acharam dois defeitos reais na primeira
  execução.

**Limite explícito desta etapa:** sem avatar, sem leitura do livro na tela, sem execução de
código, sem som. E o desenho 3D em si continua **não verificado** — não há navegador neste
ambiente (ver `TEST_REPORT.md`).

---

## Etapa 4 — Três ilhas e as pontes (concluída em 21/09/2026)

O mundo já desenhava quatro ilhas e três pontes desde a Etapa 3. O que faltava era a **travessia**:
a ponte como caminho, e não como enfeite.

- **A ponte responde ao clique.** Pela metade, ela recusa a travessia e diz o motivo, com o nome da
  ilha que falta aprovar e a nota mínima. Inteira, ela leva o estudante adiante — com 3D, fechando
  o painel e voando até lá; sem 3D, abrindo a missão da ilha de destino.
- **A decisão é função pura.** `decidirTravessia()`, em `world/mundoVisivel.ts`, recebe a ponte e as
  ilhas já resolvidas pelo domínio e devolve `atravessar` ou `recusar`. Está ali, e não dentro da
  cena, porque a cena 3D não é testável neste ambiente — e porque a regra "clicar na ponte não
  libera nada" precisa ser uma linha de código conferível, não uma promessa.
- **A liberação é visível.** Quando a aprovação chega, as tábuas se estendem de 55% a 100% em meio
  segundo. Uma ponte que já chega pronta na página não se apresenta de novo: a animação é do
  acontecimento, não da montagem.
- **A última ilha não promete o que não tem.** Com as quatro aprovadas, o resultado diz que é a
  última ilha escrita até agora, o botão de seguir não aparece e o HUD anuncia o fim do percurso.

**Limite explícito:** a travessia em 3D é um voo de câmera — não existe avatar que ande pela ponte
(Etapa 5), nem avatar que atravesse sozinho.

### Revisão da Etapa 4 — o mundo deixou de ser intocável (concluída em 21/09/2026)

A revisão da etapa encontrou dois problemas, e os dois eram do tipo que passa despercebido:

- **A cena não podia ser testada.** Um `<Canvas>` do React Three Fiber exige WebGL, e aqui não há.
  O conteúdo do mundo passou a morar em `world/ConteudoDaCena.tsx`, separado da casca
  `world/Cena.tsx` que cria o contexto. Agora **dez testes montam a árvore 3D de verdade** —
  objetos, estruturas e pontes — sem placa de vídeo (D-025). Se alguém apagar a biblioteca de dentro
  da ilha, o teste reprova; antes, nada reprovava.
- **O gabarito estava viciado.** Em `u03Strings`, as cinco respostas corretas estavam na posição 1, e
  o teste existente conferia a variedade **somando** todas as unidades — o vício de uma passava
  escondido no conjunto. As cinco perguntas de cada uma das quatro unidades foram redistribuídas
  pelas quatro posições, e o teste passou a exigir isso unidade por unidade (D-027).

E uma arrumação de dependências: `pyodide` estava instalado desde a Etapa 1 sem nenhum código que o
usasse. Foi removido, e volta na Etapa 9 com o Web Worker que o usa (D-026).

Nada disso amplia o escopo da Etapa 4: é a mesma etapa, verificada de novo — e agora com o mundo
propriamente dito sob teste.

---

## Etapa 5 — Navegação e avatar (concluída em 21/09/2026)

O mundo tinha câmera; faltava gente. Quem se deslocava era a câmera, e "entrar na ilha" era sempre
um voo até ela. Agora existe uma pessoa no arquipélago.

- **O avatar anda de verdade.** `world/avatar/passos.ts` move o corpo pelo chão caminhável:
  velocidade, corrida com `Shift`, giro suave do corpo para onde se anda, e deslize na beirada em
  vez de travar contra a borda. Não existe pulo, gravidade nem queda.
- **Onde dá para pisar é geometria declarada** (`world/mapaCaminhavel.ts`): um disco por ilha — o
  capim, que é um domo — e uma faixa por ponte **inteira**. Fora disso a altura do chão é `null` e o
  passo é recusado: ninguém cai no vazio (D-029).
- **A ponte pela metade não é caminho.** Pedir para ir a pé até uma ilha que depende dela devolve
  uma explicação com o nome da ilha, e o avatar não sai do lugar (D-030).
- **A câmera de terceira pessoa** segue o avatar por trás, e o arrasto gira em volta dele. `W` anda
  para onde se olha, porque a guinada da câmera é a mesma que o passo consulta.
- **Andar é o modo padrão**, e a escolha do modo fica no HUD: `Andar pelo mundo`, `Voo livre`,
  `Vista de mapa`. Nenhum deles libera unidade (D-028).
- **O HUD diz onde a pessoa está** — na ilha «tal» ou na ponte entre «tal» e «tal» —, e a frase sai
  do mesmo módulo que desenha o mundo.
- **A ponte encostou no capim.** O topo do tabuleiro estava 0,36 abaixo da borda da ilha; agora a
  altura do capim tem **uma** fórmula, usada pela malha e pelo chão (D-031).

**Limite explícito:** o avatar não é um personagem animado — não há passada de pernas, expressão,
nem modelo externo. Também não há interação física com as estruturas: atravessar a biblioteca é
possível, porque o chão não tem paredes internas.

---

## Etapa 6 — O estudo com o livro na tela (concluída em 21/09/2026)

A aba de estudo mostrava a explicação e os exercícios, mas a leitura recomendada do livro não existia
em lugar nenhum. Agora ela é um passo visível do ciclo — **e o que ela não é ficou dito.**

- **A leitura tem quatro partes**: qual parte do livro ler, **por que** aquela parte, **o que
  procurar** nela (quatro pontos por unidade) e **o caminho de quem não tem o livro em mãos**, que
  aprende a mesma coisa sem ele. Sem PDF nesta máquina, a referência fala em capítulo e seção e
  **nunca em página** (D-010).
- **O marcador de leitura é registro, não permissão.** `marcarLeituraFeita()` liga e desliga o
  registro naquela unidade, recusa unidade bloqueada, e **não** mexe em aprovação, tentativas, melhor
  nota nem passo. A própria tela diz: marcar a leitura não aprova a ilha, não abre a ponte e não muda
  nota nenhuma (D-033).
- **A aba de estudo virou duas seções declaradas**: *1. Ler no livro* e *2. Entender do nosso jeito*.
  A missão anuncia o que a leitura vai pedir, e o botão leva direto para lá.
- **Os diagramas da explicação são dados, não imagens**: título, descrição e partes rotuladas, em
  `<figure>` com legenda e lista ordenada. Seis diagramas entraram no conteúdo — o caminho de uma
  linha, a variável como etiqueta, por que número e texto não se somam, o que cada método de limpeza
  devolve, os espaços que não se veem, e os dois sentidos da contagem (D-034).
- **Quando o assunto é o espaço em branco, ele aparece.** `marcarEspacosDasPontas()` troca os espaços
  das pontas do valor por um sinal (`·`), com legenda dizendo o que o sinal significa — e **não**
  toca nos espaços do meio, que não são o assunto.
- **O progresso guardado subiu para a versão 2, com migração de verdade** (D-035): quem tinha
  aprovação, tentativas e melhor nota guardados não perde nada; o marcador de leitura começa
  desmarcado, porque marcá-lo sozinho inventaria um ato que não aconteceu.
- **Trava nova:** `qa/estilos.test.ts` compara as `var(--…)` do CSS com os tokens reais, e recusou um
  token com ponto no nome (`--painel.fundo-elevado`) que não existia de verdade.

**Corrigido de passagem:** a página `#/painel` ainda descrevia o projeto como na Etapa 2 — dizia que
não havia ilha, ponte, avatar, pergunta escrita nem gravação no navegador. Passou três etapas
mentindo sobre o próprio estado. A lista foi refeita, e três testes a impedem de voltar atrás.

**Limite explícito:** não há texto do livro na tela — nenhuma linha, nenhum trecho, nenhum PDF. O que
aparece é orientação de leitura escrita por nós e explicação original. E o marcador não altera
nenhuma regra: ele é a pessoa anotando o que fez, não o programa liberando o que ela pode fazer.

---

## Etapas seguintes — escopo previsto, não detalhado

O detalhamento de cada uma será feito na autorização da própria etapa.

- **7** — avaliação: as perguntas de verdade, exigir resposta em todas, corrigir após envio.
- **8** — persistência local versionada e protótipo jogável.
- **9** — prova de conceito de Pyodide em Web Worker, carregado sob demanda.
- **10** — exercícios com correção automática.
- **11** — expansão curricular em lotes de 2 a 3 unidades, uma autorização por lote.
- **12** — recursos complementares.
- **13** — polimento, acessibilidade e desempenho.
- **14** — auditoria e entrega.

## Requisitos do protótipo mínimo

- 3 ilhas: 1 disponível e 2 bloqueadas.
- 5 perguntas por ilha.
- Aprovar com 4 de 5 (80%).
- Ponte liberada após a aprovação.
- Progresso salvo localmente.
- Mouse e teclado.
- Alternativa acessível sem 3D.
- Tratamento de falha de WebGL e de armazenamento indisponível.
