# ARQUITETURA

## A regra que sustenta tudo

> Uma única fonte de verdade decide. O mundo 3D e os painéis de interface apenas **leem** a
> decisão e a apresentam.

```
                    src/learning/            ← DECIDE (funções puras, testáveis)
                   /      │       \
        src/world/    src/ui/    src/persistence/
        (Three.js)   (painéis)   (localStorage)
        desenha      mostra      grava e lê
```

Consequências práticas, e o motivo de cada uma:

| Se a regra ficasse no 3D… | …então |
|---|---|
| Clicar na ponte poderia liberar a ilha | A ponte passa a ser consequência de uma decisão, e não a decisão |
| Mudar parâmetro na URL poderia pular etapa | A interface consulta a mesma função antes de abrir qualquer tela |
| Os painéis e a cena poderiam discordar | Existiriam duas fontes de verdade — o defeito que queremos evitar |
| A regra não seria testável sem montar a cena | `src/learning/` roda em teste puro, sem navegador e sem WebGL |

## Mapa das pastas

| Pasta | Responsabilidade | Estado |
|---|---|---|
| `src/app/` | Casca da aplicação, rotas por hash e as três páginas atuais | Existe |
| `src/world/` | Cena 3D: ilhas, pontes, avatar, câmeras, céu, névoa, chão caminhável e a geometria pura que alimenta tudo. **Sem regra de aprovação** | Existe e testado |
| `src/learning/` | Regras pedagógicas puras: aprovação, disponibilidade, reprovação e a conferência do exercício (sonda, comparação, veredito) | Existe e testado |
| `src/content/` | Conteúdo pedagógico como dado tipado, separado dos componentes: missão, leitura orientada, explicação, diagramas, exercícios (com correção declarada) e perguntas. Também o percurso que o domínio enxerga (`percursoDoConteudo.ts`) | Existe para 4 unidades |
| `src/state/` | Estado em memória da sessão: o redutor é o **único** que chama `registrarResultado` | Existe e testado |
| `src/persistence/` | Gravação e leitura do progresso, versionado (formato **3**, com migração da 1 e da 2) e com aviso honesto de falha | Existe e testado |
| `src/python/` | Pyodide em Web Worker, sob demanda: protocolo puro, núcleo, trabalhador, gancho do React e o endereço dos arquivos do interpretador | Existe e testado (D-040 a D-043) |
| `src/ui/` | Componentes, painéis do ciclo (missão, estudo com leitura, prática, avaliação, resultado), tema, tokens visuais e mostruário de cores | Existe |
| `src/types/` | Apenas tipos transversais | Vazio |
| `src/utils/` | Apenas auxiliares genéricos sem domínio | Vazio |
| `qa/` | Verificações do projeto (não da aplicação): a trava de acentuação e a de estilos | Existe |
| `docs/` | Documentação de continuidade | Existe |

Cada pasta vazia tem um `README.md` explicando sua responsabilidade e seus limites. Quem
continuar o trabalho abre a pasta e encontra a regra ali, onde ela importa.

## As três páginas de hoje

| Rota | Página | Para quê |
|---|---|---|
| `#/` | O mundo | Estudar: arquipélago 3D, trilha das ilhas e painel do ciclo de estudo |
| `#/painel` | Painel do projeto | Dizer o estado real: o que existe, o que não existe, o que está planejado |
| `#/tema` | Guia de estilo | Mostrar a linguagem visual em espécimes |

A regra do projeto proíbe alvo clicável **sem efeito** (D-009). É por isso que, numa máquina sem
WebGL, os botões de câmera e o de ligar o 3D **não aparecem**: eles não teriam o que fazer.

## O caminho do dado, do armazenamento até o pixel

```
localStorage ──lerProgresso──► useProgressoPersistido ──► estado.progresso
                                                              │
                                          ┌───────────────────┴────────────────────┐
                                          ▼                                        ▼
                                learning/percurso (decide)                state/sessao (redutor)
                                          │                                        │
                                          ▼                                        ▼
                              world/mundoVisivel (traduz)              ui/paineis (mostra o passo)
                                          │
                                          ▼
                              world/Cena (desenha, sem decidir)
```

Nenhuma seta aponta para trás: a cena não escreve em `learning/`, e o painel não calcula nota. O
único lugar que grava progresso é o redutor, e ele só grava o que `registrarResultado` devolveu.

## O caminho a pé, e por que não há motor de física

Andar pelo arquipélago poderia ser um motor de física. Não é, e a escolha tem motivo (D-029): um
motor traria peso, uma dependência que ninguém pediu e, sobretudo, um comportamento que **não dá
para conferir** neste ambiente — depende de navegador. Em vez disso, as superfícies onde dá para
pisar são declaradas:

| Peça | O que é | Onde |
|---|---|---|
| `world/mapaCaminhavel.ts` | Discos (capim de cada ilha) e faixas (tabuleiro de cada ponte inteira), com a altura do chão em cada ponto | Fonte do "onde se pisa" |
| `world/avatar/passos.ts` | Passo com deslize na beirada, giro do corpo, rota entre ilhas | Fonte do "como se anda" |
| `world/Avatar.tsx` | A figura, e o laço por quadro que escreve a posição no objeto | Desenho |
| `world/CameraDoAvatar.tsx` | Câmera atrás da pessoa, girando em volta dela | Desenho |

Duas invariantes que os testes cobram, e que valem mais do que qualquer sensação de jogo:

- **não existe chão fora do capim e do tabuleiro** — a altura é `null`, e o passo é recusado;
- **só ponte `liberada` vira chão**. A ponte pela metade é visível, clicável e explicável, mas não é
  caminho (D-004, D-030).

A altura do chão não é inventada: `alturaDoTopo()` em `geometria/ilha.ts` é a **mesma** função que
gera o domo do capim, e o topo do tabuleiro sai de `ESPESSURA_DO_TABULEIRO`. Foi essa unificação que
revelou o degrau de 0,36 entre a ponte e a borda da ilha (D-031).

## A avaliação: regra no domínio, frase na tela

A avaliação é o único lugar do projeto em que a pessoa é medida, e por isso mesmo é onde a tela tem
menos liberdade: nenhum texto de avaliação é escrito no componente.

| Peça | O que é | Onde |
|---|---|---|
| `learning/avaliacao.ts` | Aprovação em inteiros, percentual para baixo, `acertosMinimos()`, `textoDePendencias()`, `textoDoPlacar()`, `AVISO_DE_HONESTIDADE` | A regra **e** as frases |
| `state/sessao.ts` | A ação `enviar`, que é o único caminho para `registrarResultado` | O encontro entre tela e regra |
| `ui/paineis/AvaliacaoDaUnidade.tsx` | Perguntas, pendências, atalho de foco | Desenho |
| `ui/paineis/ResultadoDaUnidade.tsx` | Nota, placar, revisão explicada | Desenho |
| `content/validadorDeConteudo.ts` | Forma das perguntas e do gabarito | Trava de conteúdo |

Três coisas que a tela **não** faz, e o motivo:

- **não corrige antes do envio** — nem uma marca de certo ou errado aparece antes disso, e um teste
  percorre a avaliação procurando exatamente essas marcas;
- **não conta tentativa** — o número vem de `ProgressoDaUnidade`, o mesmo que a trilha e a cena
  consultam (D-037);
- **não decide o que é resposta certa** — o gabarito sai de `gabaritoDaUnidade()`, do conteúdo, e a
  comparação é de `avaliarRespostas()`.

## O estudo: leitura orientada, e o que ela não faz

A aba de estudo tem duas seções declaradas — **1. Ler no livro** e **2. Entender do nosso jeito** — e
a separação é a mesma de sempre: dado de um lado, desenho do outro.

| Peça | O que é | Onde |
|---|---|---|
| `content/tiposDeConteudo.ts` | O tipo `leitura` (parte, porquê, `oQueObservar`, `semOLivro`) e o bloco `diagrama` | Forma do conteúdo |
| `ui/paineis/LeituraDaUnidade.tsx` | A leitura na tela, com o marcador | Desenho |
| `ui/paineis/DiagramaDaExplicacao.tsx` | Diagrama em texto: `<figure>`, partes rotuladas e o sinal de espaço | Desenho |
| `learning/percurso.ts` | `marcarLeituraFeita()` / `leituraFoiFeita()` | Registro, **não** decisão |
| `persistence/progressoSalvo.ts` | `leituraFeita` no formato guardado (versão 2) | Gravação |

Três invariantes, todas cobertas por teste:

- **a leitura não aprova ninguém.** `marcarLeituraFeita()` é o único caminho para o registro, e ele
  não encosta em `aprovada`, `tentativas`, `melhorNota` nem em `sessao.passo` (D-033);
- **não se marca sozinho.** Nada marca a leitura ao abrir a aba: registro de um ato que não
  aconteceu é pior do que registro vazio;
- **não há página.** A referência ao livro tem capítulo e seção, e `pagina` continua `null` enquanto o
  PDF não estiver em mãos (D-010).

As três travas que sustentam isso:

| Trava | Onde | O que impede |
|---|---|---|
| Marcar leitura não muda nota nem passo | `src/learning/percurso.test.ts`, `src/state/sessao.test.ts` | Progresso inflado por um clique |
| Nenhuma página inventada | `src/content/planoDeUnidades.test.ts`, `src/content/conteudo.test.ts` | Orientação de leitura que mente sobre o livro |
| Toda `var(--…)` existe entre os tokens | `qa/estilos.test.ts` | Estilo declarado que o navegador ignora em silêncio (D-034, defeito real da Etapa 6) |

O sinal de espaço merece uma nota, porque é o tipo de coisa que se erra por parecer bonita demais:
`marcarEspacosDasPontas()` marca **só** as pontas — depois da aspa de abertura e antes da de fechar —
e nada no meio da frase. Marcar tudo poluiria o diagrama e sugeriria um problema que não existe
(D-034).

## Executar código: o caminho até o Worker

O interpretador é grande (13,9 MB) e roda **fora** da interface, num Web Worker. A divisão em
arquivos segue a mesma ideia da cena 3D: separar o que precisa de navegador do que pode ser conferido
em teste.

| Arquivo | Precisa de navegador? | O que faz |
|---|---|---|
| `src/python/protocolo.ts` | **Não** | Tipos e validação das mensagens, recusas explicadas, texto de erro, junção da saída |
| `src/python/nucleoDoPython.ts` | **Não** | Atende um pedido de execução e devolve resposta — **nunca lança** |
| `src/python/interpretadorPyodide.ts` | Node (via `public/pyodide/`) | Carrega o Pyodide e executa código |
| `src/python/trabalhadorDoPython.ts` | Sim (Worker) | Fiação: escuta e chama o núcleo, sem regra própria |
| `src/python/usePython.ts` | Sim (Worker, DOM) | Cria o Worker no clique, carrega uma vez, executa, vigia a demora, reinicia |

**O que a fronteira do Worker obriga:** tudo que atravessa tem de ser serializável, e por isso o
protocolo existe como tipo. Objeto do Pyodide não atravessa: o valor da última expressão é convertido
para texto **antes** de sair, e o proxy é destruído (`descreverResultado`).

**Recomeçar é descartar.** Não há como interromper um laço infinito por dentro do Python: o botão
*Recomeçar do zero* chama `terminate()` no Worker e começa outro. O aviso de 15 s **não** interrompe
nada; ele só faz a tela dizer que algo demora, em vez de ficar parada parecendo travada (D-041).

## A conferência do exercício: o que roda, e o que se compara

A prática deixou de ser só enunciado e solução: cada exercício que **pode** ser conferido traz a
correção declarada no conteúdo, e a conferência acontece no domínio, não no componente.

| Passo | Onde vive | O que acontece |
|---|---|---|
| 1. O conteúdo declara o que espera | `src/content/unidades/u0*.ts` | `saidaEsperada`, `valoresEsperados` (rótulo, expressão Python, o que deve dar), `estrutura` e o **limite** — obrigatório |
| 2. A sonda é montada | `src/learning/correcaoDeExercicio.ts` (`programaDaConferencia`) | O programa do estudante ganha uma linha-comentário e um `print` marcado por valor a medir (D-045) |
| 3. Roda uma vez só | Worker, o mesmo do console | O programa roda como o estudante escreveu, com a sonda no fim |
| 4. A sonda sai da saída | `separarSondagem` | As linhas `§conferencia§…` viram medidas; o que fica para a tela é a saída do programa |
| 5. O veredito é calculado | `conferirExercicio` | Compara saída (por trecho, na ordem), valores (`repr`/tipo) e forma; devolve item por item |
| 6. O veredito aparece | `src/ui/paineis/ConsoleDoPython.tsx` e `PraticaDaUnidade.tsx` | No console, item por item; no cartão, um resumo e o selo de conferido |
| 7. O que deu certo é guardado | `src/state/sessao.ts` → `learning/percurso.ts` | `marcarExercicio` registra o identificador; **não** aprova, não conta tentativa, não muda nota (D-046) |

**Por que a regra não mora no componente:** o mesmo motivo das pontes e da avaliação. O componente
mostra o que o domínio decidiu; quem decide é `correcaoDeExercicio.ts`, que é puro e testado sem
tela. As três situações do veredito existem justamente para não mentir: `deuCerto`, `naoConfere` e
`naoDeuParaConferir` — a última diz que a conferência **não olhou**, e não que o exercício está
errado (D-044).

**O que a conferência não faz, e está escrito na tela:** ela não julga estilo, não exige uma solução
única e não impede quem quiser enganar. Imprimir o número certo sem calcular nada passa na conferência
da saída — é para isso que existem as sondas de valor, e é por isso que o limite de cada correção
aparece junto do resultado.

## A cena em duas partes, e por quê

O último passo do caminho acima é desenhar. Ele acontece em dois arquivos, e a divisão não é
estética:

| Arquivo | O que faz | Precisa de WebGL? |
|---|---|---|
| `world/ConteudoDaCena.tsx` | Céu, câmera, pontes e ilhas — o mundo em si | **Não** |
| `world/Cena.tsx` | O `<Canvas>`, o contexto WebGL e os eventos de ponteiro que arrastam a câmera | Sim |

O motivo está em `docs/TEST_REPORT.md`: não existe navegador com WebGL neste ambiente, então tudo
que morasse dentro do `<Canvas>` ficaria sem verificação. Separado, o conteúdo do mundo é montado em
teste pelo `@react-three/test-renderer` — a árvore 3D de verdade, sem placa de vídeo (D-025). O que
a divisão **não** compra: aparência, luz, enquadramento e desempenho continuam sem verificação
automática, porque dependem do desenho na tela.

## Piso técnico

Vite + React + TypeScript. Three.js via React Three Fiber (sem Drei, D-021). CSS responsivo sem
framework. `localStorage` para o progresso (IndexedDB só se o volume exigir, e com autorização).
Vitest para lógica, render e interação em jsdom (D-020); Playwright para teste de navegador, ainda
não instalado. **Pyodide** (CPython compilado para WebAssembly) para rodar código de quem estuda,
servido pela própria aplicação e carregado sob demanda num Web Worker (D-040).

### Versões resolvidas em 21/09/2026

| Pacote | Versão | Observação |
|---|---|---|
| node | 22.22.3 | ambiente de desenvolvimento |
| npm | 10.9.8 | |
| react / react-dom | 19.2.1 | 19.3.0 não é aceito pelo par de dependências do fiber 9.7.0 |
| vite | 8.3.0 | |
| @vitejs/plugin-react | 6.1.1 | |
| typescript | 7.0.2 | |
| vitest | 5.0.1 | |
| @types/react / @types/react-dom | 19.2.18 / 19.2.7 | |
| three / @react-three/fiber | 0.186.0 / 9.7.0 | a cena entra por importação sob demanda (D-022) |
| @types/three | 0.186.0 | apenas tipos |
| jsdom / @testing-library/react | 30.1.0 / 16.3.3 | desenvolvimento; `@testing-library/dom` 10.4.2 e `user-event` 14.6.7 junto |
| @react-three/test-renderer | 9.1.1 | desenvolvimento; monta a árvore 3D sem placa de vídeo (D-025) |
| @types/node | 26.6.2 | apenas tipos, para a verificação de qualidade em `qa/` |
| pyodide | 314.0.7 | exata; o CPython que o pacote traz é o 3.14.0 (D-040) |

**Nenhuma dependência sem uso.** `pyodide` chegou a estar instalado na Etapa 1, "para já ficar", e
foi removido na revisão da Etapa 4: nenhum arquivo o importava (D-026). Ele voltou na Etapa 9, fixado exato
(`314.0.7`) e no mesmo commit que traz o Web Worker que o usa (D-040).

Versões fixadas **exatas** (sem `^`) e `package-lock.json` versionado, para que outra pessoa, em
outra máquina, obtenha exatamente a mesma instalação. Ver `DECISIONS.md` (D-008).

## Tema visual: fonte única

`src/ui/theme/tokens.ts` é o único lugar onde uma cor é escrita. O CSS consome variáveis geradas
por `tokensComoVariaveisCss()`. `src/ui/theme/amostras.ts` lê os tokens para o guia de estilo, e
`contraste.ts` mede os pares. O teste percorre `PARES_DE_CONTRASTE` e falha se algum par não
atingir a WCAG AA.

Mudar a paleta é mudar um arquivo — e o teste avisa se a mudança quebrar a leitura.

**Única exceção:** `index.html` tem uma cor literal (`#dce4ec`) aplicada antes de o React montar,
para evitar o flash branco, quando ainda não existe JavaScript para gerar a variável. Está
comentada no arquivo. Se aparecer uma segunda, é sinal de que a fonte única vazou.

## Travas automáticas

| Verificação | Onde | O que impede |
|---|---|---|
| Contraste dos pares de cor | `src/ui/theme/contraste.test.ts` | Texto ilegível por escolha de cor |
| Todo botão tem rótulo e nenhum controle sem efeito | `src/app/App.test.tsx`, `Mundo.test.tsx` | Controle sem efeito (D-009) |
| Nenhuma resposta corrigida antes do envio | `src/app/paginas/Mundo.interacao.test.tsx` | Correção fora de hora, dica de gabarito |
| Aprovar não pode ser confundido com "já estava aprovada" | `src/state/sessao.test.ts` | Mensagem que mente sobre o histórico |
| Faces de todas as malhas para fora | `src/world/geometria/orientacao.test.ts` | Mundo invisível de fora |
| Nenhuma página inventada | `src/content/planoDeUnidades.test.ts` | Referência de página não verificada (D-010) |
| Aprovação só com 80% reais | `src/learning/avaliacao.test.ts` | Exibição que contradiz a decisão |
| Nenhum atalho de desbloqueio | `src/learning/percurso.test.ts` | Pular portão por rota, clique ou ordem |
| Acentuação do português | `qa/acentuacao.test.ts` | Texto sem acento no código e na documentação (D-015) |
| O mundo desenhado é o mundo prometido | `src/world/ConteudoDaCena.test.tsx` | Ilha sem biblioteca, mesa ou placa; ponte a mais ou a menos (D-025) |
| Nenhum gabarito viciado em uma posição | `src/content/conteudo.test.ts` | Alternativa correta sempre no mesmo lugar, **por unidade** (D-027) |
| Só ponte inteira vira chão | `src/world/mapaCaminhavel.test.ts` | Atravessar a pé onde a aprovação não chegou (D-029, D-030) |
| Ninguém anda para fora do chão | `src/world/avatar/passos.test.ts` | Queda no vazio, travessia por fora do tabuleiro |
| O caminhar funciona quadro a quadro | `src/world/ConteudoDaCena.test.tsx` | Avatar parado, teclas sem efeito, chão errado sob os pés (D-032) |
| Toda variável de estilo existe, e com nome válido | `qa/estilos.test.ts` | Estilo silenciosamente ignorado, como `--painel.fundo-elevado` |
| O enunciado da avaliação é honesto, e a revisão explica tudo | `src/learning/avaliacao.test.ts`, `src/ui/paineis/ResultadoDaUnidade.test.tsx` | Avaliação que promete antifraude ou esconde o porquê de quem acertou (D-036) |
| O placar vem do progresso gravado | `src/app/paginas/Mundo.interacao.test.tsx` | Tentativa contada na tela, que mente depois de recarregar (D-037) |
| O gabarito não se entrega por tamanho | `src/content/conteudo.test.ts`, `validadorDeConteudo.ts` | Acertar escolhendo a alternativa mais longa (D-038) |
| O arquivo guardado de versão anterior é migrado, não descartado | `src/persistence/progressoSalvo.test.ts` | Perda de progresso por causa de um campo novo (D-035) |
| Nada é gravado antes de o progresso lido chegar ao estado | `src/persistence/useProgressoPersistido.test.tsx` | A primeira passada de efeitos apagar o progresso guardado (D-039) |
| O protótipo inteiro, da primeira à última ilha, com recarga no meio | `src/app/paginas/Mundo.interacao.test.tsx` | Percurso que só funciona numa sessão, ou que não fecha |
| **Todo trecho de código do conteúdo roda de verdade** no interpretador real | `src/python/pyodideDeVerdade.test.ts`, `src/content/conteudo.test.ts` | Conteúdo publicado que não roda, ou erro proposital que ninguém sabe que é proposital (D-043) |
| O console não promete segurança, e recusa o que travaria a página | `src/ui/paineis/ConsoleDoPython.test.tsx`, `src/python/protocolo.test.ts` | Texto que dá garantia falsa, ou tela parada sem explicação (D-041, D-042) |

## Ambiente de execução (preview remoto)

O navegador do usuário **não** é a máquina onde o servidor roda. Por isso:

- o servidor de desenvolvimento escuta em `0.0.0.0` (`server.host: true`);
- `allowedHosts` inclui o domínio do proxy de preview (`.e2b.app`), porque o Vite recusa
  requisição com Host desconhecido;
- nada no código do navegador chama `localhost` para alcançar serviço remoto: caminhos
  relativos.

## Decisões de configuração com motivo

- `tsconfig.json` usa `"types": []` para não incluir automaticamente os tipos de todo pacote
  instalado. As duas referências necessárias são explícitas, no arquivo que precisa delas:
  `vite/client` em `src/vite-env.d.ts` e `node` em `qa/acentuacao.test.ts`.
- `@types/node` é a única dependência de tipos fora do React, e existe por um motivo concreto: o
  teste de acentuação lê arquivos do projeto e o `tsc` recusava `node:fs` sem ela. Não vai para o
  pacote final.
- Um único `tsconfig.json`, em vez dos três do modelo padrão do Vite: menos arquivo, mesma
  checagem. `npm run build` roda `tsc --noEmit` antes de empacotar.
- Teste em ambiente `node`. `jsdom` será adicionado quando existir teste de interação — não
  antes.
- `qa/` fica fora de `src/` porque contém verificação do **projeto**, não da aplicação.
