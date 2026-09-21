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
| 5 | Navegação e avatar | não iniciada |
| 6 | Estudo e leitura do livro na tela | não iniciada |
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

---

## Etapas seguintes — escopo previsto, não detalhado

O detalhamento de cada uma será feito na autorização da própria etapa.

- **5** — navegação e avatar.
- **6** — estudo: leitura recomendada, explicação original, diagrama do livro.
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
