# RELATÓRIO DE TESTES

Regra deste documento: dizer **o que foi realmente executado**, em que ambiente e com que
resultado. Teste não executado aparece como **não executado**, e não como aprovado por leitura de
código.

---

## Execução de 21/09/2026 — Etapa 10 (exercícios com correção automática)

### 1. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro, com os tipos novos da correção (`TipoDeValor`, `ValorEsperado`, `EstruturaEsperada`,
`CorrecaoDoExercicio`), o módulo puro da conferência, a ação `marcarExercicio`, o formato 3 do
progresso e o percurso montado a partir do conteúdo.

### 2. Testes automáticos — EXECUTADO

    npm test

**40 arquivos, 697 testes, todos passando.** Os que interessam a esta etapa:

| Arquivo | Testes | O que cobre |
|---|---|---|
| `src/learning/correcaoDeExercicio.test.ts` | 25 | Montagem da sonda, separação da saída, comparação por trecho e por ordem, `repr` × tipo, linhas não vazias, comentário, erro do programa, sonda ausente, os três vereditos |
| `src/python/pyodideDeVerdade.test.ts` | 18 | **Pyodide de verdade**: a resposta de referência passa na correção do próprio exercício (os 10 exercícios que têm correção), quatro respostas erradas são reprovadas com o item certo, sonda sobrevive a `§`/aspas/quebra de linha, e cada execução começa do zero |
| `src/content/conteudo.test.ts` + `percursoDoConteudo.test.ts` | 42 + 6 | Forma da correção (limite obrigatório, um modo de comparação por sonda, tipo existente), e o percurso do conteúdo: **os 12 exercícios reais podem ser marcados**, nenhum é recusado, e marcar todos não aprova unidade nenhuma |
| `src/ui/paineis/ConsoleDoPython.test.tsx` | 29 | Programa + sonda enviados juntos, veredito item por item, saída sem a linha da sonda, erro ⇒ "não deu para conferir", rodar sem conferir não conclui nada |
| `src/ui/paineis/PraticaDaUnidade.test.tsx` | 12 | Botão só para quem tem correção, motivo escrito para quem não tem, e **só `deuCerto` chama o progresso**: "ainda não confere" e "não deu para conferir" não marcam nada |
| `src/learning/percurso.test.ts` | 39 | Exercício conferido entra no progresso sem tocar em nota, tentativa ou leitura; recusa unidade bloqueada, unidade desconhecida e exercício que não é da unidade |
| `src/state/sessao.test.ts` | 47 | A ação `marcarExercicio` pelo redutor: sem unidade aberta não faz nada, exercício de outra unidade não muda estado, e conferir de novo não gera progresso novo (é o progresso que decide a gravação) |
| `src/persistence/progressoSalvo.test.ts` + `useProgressoPersistido.test.tsx` | 30 + 5 | Migração da versão 2 (exercícios começam vazios), arquivo da versão atual sem o campo (recusado), lista com item que não é texto (recusada), e o exercício conferido **gravado e lido de volta** |
| `src/app/paginas/Mundo.interacao.test.tsx` | 24 | Com o progresso guardado, o cartão do exercício conferido volta com o selo — e só ele; conferir os três exercícios da ilha 1 não aprova a ilha nem abre a 2 |

### 3. Build de produção — EXECUTADO, passou

    npm run build

| Arquivo | Tamanho | Gzip |
|---|---|---|
| `dist/index.html` | 0,63 kB | 0,40 kB |
| `dist/assets/index-*.js` | 326,11 kB | 102,42 kB |
| `dist/assets/index-*.css` | 25,11 kB | 4,06 kB |
| `dist/assets/Cena-*.js` | 912,10 kB | 242,34 kB |
| `dist/assets/trabalhadorDoPython-*.js` | 2,60 kB | — |

### 4. Servidor de desenvolvimento e arquivos do interpretador — EXECUTADO

    npm run dev

- `GET /` → **200**; `GET /pyodide/pyodide.mjs` → **200** (`text/javascript`, 17.931 bytes);
- `GET /pyodide/pyodide.asm.wasm` → **200** (9.598.218 bytes);
- pedido com `Host` e `Origin` de outro domínio (como no preview remoto) → **200**, sem
  "Blocked request".

### 5. O que NÃO foi executado — e não está marcado como aprovado

- **O Web Worker em um navegador.** Continua valendo o que a Etapa 9 registrou: não há navegador neste
  ambiente. A conferência é provada em jsdom (interpretador dublado, mas **o veredito é o de verdade**:
  `conferirExercicio` roda igual) e em Node (Pyodide real). A fiação com o navegador é roteiro manual.
- **O download real, o cache HTTP e o `terminate()` com Worker de verdade**: só no navegador.
- **Aparência da conferência na tela** (cores do veredito, quebra de linha do cartão): sem verificação
  automática de layout, como nas etapas anteriores.

### 6. Roteiro manual da conferência (itens 51 a 53)

51. **Conferir um exercício, com o valor medido**: ilha 2 → aba **Prática** → *Escrever e conferir no
    console* no exercício das figurinhas; ligar o Python; escrever um programa que guarde 40 em
    `figurinhas` e imprima o valor; clicar em **Rodar e conferir**. Deve aparecer a conferência com o
    item do texto esperado e o item do valor medido, ambos com **esperado × obtido** — e a linha da
    sonda **não** pode aparecer na saída. Depois rodar de novo com 38: o item do valor deve mostrar
    `esperado: 40` e `obtido: 38`, sem sumir a explicação nem o limite da conferência.
52. **A conferência não aprova a ilha**: com o exercício conferido, tentar entrar na ilha seguinte
    (deve continuar bloqueada) e conferir na aba **Avaliação** que a nota e as tentativas continuam
    zeradas. O caminho para a próxima ilha é responder as perguntas e acertar 4 de 5.
53. **O selo sobrevive ao recarregamento**: depois de conferir um exercício com tudo certo, recarregar
    a página, abrir a mesma ilha na aba Prática e conferir que o cartão daquele exercício aparece com
    *"Conferido — este resultado está guardado no seu progresso"* — e que os outros cartões não. Depois
    limpar só a chave do progresso no navegador (não o armazenamento inteiro) e conferir que o selo
    some, e que o resto do armazenamento do site continua intacto.

Resultado esperado, somando as etapas 5 a 10: **53 de 53 itens conferidos**. Qualquer item que falhe
deve ser registrado aqui.

---

## Execução de 21/09/2026 — Etapa 9 (prova de conceito do Pyodide em Web Worker)

### 1. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro, com os seis módulos novos, o Worker, o console e os testes que rodam o Pyodide de verdade
(o arquivo de teste importa a biblioteca e é compilado como qualquer outro).

### 2. Testes automáticos — EXECUTADO

    npm test

**Resultado: 610 testes, 37 arquivos, todos aprovados** (eram 553/33 antes desta etapa).

| O que foi acrescentado | Onde | Testes |
|---|---|---|
| Protocolo: recusas explicadas (campo vazio, limite de 4.000 caracteres, `input()`), validação das mensagens, texto de erro nunca vazio, junção da saída com o valor da última expressão | `src/python/protocolo.test.ts` | 16 |
| Núcleo: execução bem-sucedida, erro de Python, falha antes do Python — e a garantia de que **nunca lança** | `src/python/nucleoDoPython.test.ts` | 7 |
| **Pyodide de verdade, em Node**: listas, laços, f-string, `import math`, traceback de `TypeError`/`IndexError`/`SyntaxError`, e o conteúdo real das quatro unidades executado | `src/python/pyodideDeVerdade.test.ts` | 12 |
| A tela do console: o que ela diz antes de baixar, a recusa, a saída, o erro literal, o aviso de demora, o botão de recomeçar e o que ela **não** promete | `src/ui/paineis/ConsoleDoPython.test.tsx` | 21 |
| Ligação entre conteúdo e console: motivo de recusa com 40 caracteres ou mais, e a lista de trechos que não rodam bate com o que o interpretador de verdade aceita | `src/content/conteudo.test.ts` | 32 (no total) |

**Defeito real encontrado nesta etapa, e por execução — não por leitura.** O teste que roda o
conteúdo das quatro unidades no interpretador de verdade reprovou três trechos. Dois são erros **de
propósito**, escritos para a pessoa ver a mensagem do Python: o `TypeError` da conversão com `str()`
(unidade 2) e o `IndexError` de `frutas[3]` (unidade 4). O terceiro era **defeito de verdade**: a
unidade 4 escrevia

    de numeros[0]             # remove pelo índice

onde devia estar `del numeros[0]`. Estava publicado desde a reescrita das unidades e nenhum dos 553
testes anteriores pegou, porque **nenhum deles jamais executou o conteúdo** — todos conferiam forma,
tipo e tamanho. Corrigido, e os dois trechos propositais passaram a trazer o motivo escrito, visível
na tela ao lado do código (D-043).

**Prova de que a execução é a execução de verdade, e não uma simulação:** `pyodideDeVerdade.test.ts`
carrega `public/pyodide/pyodide.mjs`, executa `runPython` com o código real dos blocos e das soluções,
e compara a mensagem de erro com o que o CPython escreve. A versão exibida na tela ("Python 3.14.0") é
lida de `sys.version_info` — a primeira tentativa usou `pyodide.version`, que é a versão **do Pyodide**
(314.0.7), e o teste pegou a troca.

**Achado menor, mas registrado por honestidade:** a trava de acentuação reprovou a etapa uma vez, e
por um motivo que não era texto sem acento: ela lê **string com espaço** como se fosse prosa, e a
classe composta `"exercicio__nota exercicio__nao-roda"` foi lida como frase — acusando `nao`, que
é a forma sem acento. A classe virou um token só (`exercicio__aviso-do-console`), e a trava ficou
como estava. Enfraquecer a trava para acomodar um nome de classe seria trocar a defesa por
conveniência.

### 3. Build de produção — EXECUTADO, passou

    dist/index.html                             0.63 kB │ gzip:   0.40 kB
    dist/assets/trabalhadorDoPython-*.js        2.47 kB
    dist/assets/index-*.css                    23.04 kB │ gzip:   3.81 kB
    dist/assets/index-*.js                    310.75 kB │ gzip:  98.23 kB
    dist/assets/Cena-*.js                     912.10 kB │ gzip: 242.34 kB

O Worker sai como **arquivo separado** (2,47 kB) — é o que garante que o interpretador não entre no
pacote principal. O aviso de pacote grande do empacotador é conhecido e é do mundo 3D (`Cena`), não
desta etapa; dividir a cena por rota é assunto de desempenho (Etapa 13), não de correção.

### 4. Arquivos do Pyodide servidos pela aplicação — EXECUTADO

Com o servidor de desenvolvimento em `0.0.0.0` e o cabeçalho do host do preview:

| Arquivo | Resultado |
|---|---|
| `/pyodide/pyodide.asm.wasm` (9,6 MB) | **200**, `application/wasm` — o tipo certo, que o `WebAssembly.instantiateStreaming` exige |
| `/pyodide/python_stdlib.zip` (2,5 MB) | **200** |
| `/pyodide/pyodide.mjs`, `pyodide.asm.mjs`, `pyodide-lock.json` | **200** |
| `/`, `src/python/usePython.ts`, `src/ui/paineis/ConsoleDoPython.tsx` | **200**, sem erro de transformação |

Nenhuma requisição a host externo: os cinco endereços acima são da própria origem.

### 5. O que NÃO foi executado — e não está marcado como aprovado

- **O Web Worker em um navegador.** Não há navegador neste ambiente. O que os testes cobrem é o
  protocolo, o núcleo e a tela **com o Worker dublado**; em Node o Pyodide real é carregado **no mesmo
  processo**, sem Worker. A fiação `postMessage` ↔ navegador é roteiro manual (itens 46 a 50).
- **O download real pelos ganchos do navegador** (cache HTTP, `Content-Encoding`, bloqueio por
  política de conteúdo): só no navegador.
- **Interromper um laço infinito de verdade no navegador**: `terminate()` foi exercitado em teste de
  unidade com Worker dublado; o comportamento com o Worker real é roteiro manual.
- **A versão do Python que o Pyodide de verdade relata no navegador**: em Node foi 3.14.0.

### 6. Roteiro manual do console (itens 46 a 50)

46. **O console liga e roda**: abrir a ilha 1 → aba **Prática** → *Rode no console desta ilha*; clicar
    em **Ligar o Python (baixa cerca de 14 MB uma vez)** e conferir o aviso de carregamento; depois de
    pronto, conferir a versão do Python mostrada; rodar `print("olá")` e conferir a saída. Na aba
    *Rede* do navegador, conferir que os pedidos vão para a **própria origem** e que nenhum sai para
    outro host.
47. **O download acontece uma vez**: recarregar a página e ligar o console de novo. Na segunda vez, os
    arquivos grandes (`pyodide.asm.wasm`, `python_stdlib.zip`) devem vir do cache do navegador; fechar
    a aba e reabrir não deve baixar de novo.
48. **Laço infinito tem saída**: rodar `while True: pass`. Depois de cerca de 15 segundos deve aparecer
    o aviso de demora com o botão **Recomeçar do zero**; a página precisa continuar respondendo
    (rolar, trocar de aba, fechar o painel). Clicar em Recomeçar, esperar carregar e conferir que
    `print(1)` volta a funcionar.
49. **`input()` é recusado com explicação**: rodar `nome = input("Seu nome: ")`. Deve aparecer a
    recusa explicando que não há teclado para o programa ler, com a alternativa escrita no código — e
    **nada pode travar**. Depois rodar `nome = "Ana"` e conferir que funciona.
50. **Trecho marcado mostra o motivo**: nas unidades 2 e 4, o bloco da conversão com `str()`, o bloco
    do índice fora da lista e as soluções marcadas devem exibir o motivo logo abaixo do código, antes
    de qualquer tentativa de rodar. Rodar os dois trechos de erro proposital e conferir a mensagem
    real do Python (`TypeError`, `IndexError`).

Resultado esperado até esta etapa: 50 de 50 conferidos. Qualquer item que falhe deve ser registrado aqui.

---

## Execução de 21/09/2026 — Etapa 8 (persistência e protótipo jogável)

### 1. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro, com o gancho de persistência corrigido e o teste novo em `.tsx`.

### 2. Testes automáticos — EXECUTADO

    npm test

**Resultado: 553 testes, 33 arquivos, todos aprovados** (eram 548/32 antes desta etapa).

| O que foi acrescentado | Onde |
|---|---|
| Nenhuma escrita na chave do progresso antes de o valor guardado entrar no estado | `src/persistence/useProgressoPersistido.test.tsx` |
| Armazenamento cheio depois da leitura não deixa o progresso apagado | `src/persistence/useProgressoPersistido.test.tsx` |
| A falha de gravação aparece na tela, dizendo o que continua valendo | `src/persistence/useProgressoPersistido.test.tsx` |
| O protótipo inteiro: quatro ilhas aprovadas em sequência, com recarga no meio | `src/app/paginas/Mundo.interacao.test.tsx` |
| O percurso terminado: placar em 4 de 4, HUD de fim e o arquivo guardado com as quatro unidades | `src/app/paginas/Mundo.interacao.test.tsx` |
| Navegador que recusa gravar: aviso na tela **e** trilha inteira jogável | `src/app/paginas/Mundo.interacao.test.tsx` |

**Defeito real encontrado nesta etapa — e o mais grave do projeto até agora.** O efeito de leitura e
o de gravação do progresso rodam na **mesma** passada, e a gravação ainda enxergava o progresso do
primeiro render, que é vazio. Como gravar um progresso sem unidades significa "não há nada guardado",
a primeira gravação **removia a chave** que a leitura acabara de ler. A gravação seguinte regravava
tudo, e por isso ninguém notava — mas com o armazenamento cheio (ou a aba fechando nesse intervalo) o
progresso era perdido. A prova está no relatório do próprio teste: a sequência observada na chave era

    removeItem:arquipelago-python.progresso → setItem:arquipelago-python.progresso

e, com a escrita recusada, o valor guardado terminava em `null`. Os 548 testes anteriores não pegaram
isso porque todos conferiam o **estado final** da tela, que ficava certo. Corrigido em
`useProgressoPersistido`, com a guarda da primeira gravação (D-039).

**Prova de mutação da correção:** desligar a guarda faz os dois testes novos falharem; religá-la, os
dois passam. A prova foi executada, e não presumida.

### 3. Build de produção — EXECUTADO, passou

    dist/index.html                0.63 kB │ gzip:   0.40 kB
    dist/assets/index-*.css       20.77 kB │ gzip:   3.57 kB
    dist/assets/index-*.js       300.92 kB │ gzip:  95.28 kB
    dist/assets/Cena-*.js        912.10 kB │ gzip: 242.34 kB

### 4. Servidor de desenvolvimento — EXECUTADO

`/`, `src/persistence/useProgressoPersistido.ts`, `src/persistence/progressoSalvo.ts` e
`src/app/paginas/Mundo.tsx` → **200**, sem erro de transformação.

### 5. O protótipo jogável, e o caminho percorrido

O teste de ponta a ponta percorre o protótipo **sem 3D** — que é o caminho de quem está numa máquina
sem placa de vídeo, e o único possível neste ambiente. Ele abre as quatro ilhas na ordem, responde as
vinte perguntas, envia as quatro avaliações, recarrega a página no meio, confere o placar a cada
aprovação, confere que a ilha seguinte destravou, e termina com o HUD anunciando o fim do percurso.
O que **não** está coberto: o mesmo percurso com o mundo 3D desenhado — isso é roteiro manual.

### 6. O que continua NÃO executado

Recarga de página num navegador de verdade, modo privado, cota estourada de verdade, fechar a aba no
meio de uma gravação, e o mundo 3D. O roteiro manual abaixo ganhou os itens 42 a 45.

---

## Execução de 21/09/2026 — Etapa 7 (a avaliação revisada)

### 1. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro, com as duas props novas do painel de resultado (`tentativas`, `melhorNota`) e as funções
novas do domínio. Um detalhe de forma foi corrigido durante a escrita: um comentário de linha dentro
da lista de props de um componente JSX — o `tsc` aceita, mas é frágil de ler, e ele saiu para fora.

### 2. Testes automáticos — EXECUTADO

    npm test

**Resultado: 548 testes, 32 arquivos, todos aprovados** (eram 505/30 antes desta etapa).

| O que foi acrescentado | Onde |
|---|---|
| O aviso de honestidade diz navegador, não é antifraude e aprender — e não promete inviolabilidade | `src/learning/avaliacao.test.ts` |
| Os números das perguntas em branco, contando de 1 como na tela | `src/learning/avaliacao.test.ts` |
| A frase de pendência com um, dois e cinco em branco, com vírgula e "e" | `src/learning/avaliacao.test.ts` |
| Nenhum "faltam algumas": só existe a contagem exata | `src/learning/avaliacao.test.ts` |
| Quantos acertos aprovam, medido em inteiros de 1 a 60 perguntas | `src/learning/avaliacao.test.ts` |
| O placar conta a tentativa, mostra a melhor nota e recusa tentativa zero | `src/learning/avaliacao.test.ts` |
| O enunciado da avaliação diz as três coisas obrigatórias, antes das perguntas | `src/ui/paineis/AvaliacaoDaUnidade.test.tsx` (11 testes) |
| Nada de marca de certo ou errado antes do envio | `src/ui/paineis/AvaliacaoDaUnidade.test.tsx` |
| O botão de enviar fica ligado ao estado por `aria-describedby` | `src/ui/paineis/AvaliacaoDaUnidade.test.tsx` |
| Um atalho por pergunta em branco, e o foco vai até a pergunta | `src/ui/paineis/AvaliacaoDaUnidade.test.tsx` |
| Depois do envio, os campos trancam e o botão de enviar desaparece | `src/ui/paineis/AvaliacaoDaUnidade.test.tsx` |
| A revisão explica as cinco perguntas, certas incluídas | `src/ui/paineis/ResultadoDaUnidade.test.tsx` (11 testes) |
| Em cada erro, o que foi marcado e qual era a resposta certa | `src/ui/paineis/ResultadoDaUnidade.test.tsx` |
| Pergunta em branco é dita em branco, e não inventada | `src/ui/paineis/ResultadoDaUnidade.test.tsx` |
| O foco vai para o anúncio do resultado ao aparecer | `src/ui/paineis/ResultadoDaUnidade.test.tsx` |
| Reprovar depois de aprovar mantém a aprovação e mostra a melhor nota, ponta a ponta | `src/app/paginas/Mundo.interacao.test.tsx` |
| O validador acusa "todas as anteriores", enunciado curto e explicação repetida | `src/content/conteudo.test.ts` |
| O validador acusa a unidade em que a correta é sempre a mais longa (defeito injetado) | `src/content/conteudo.test.ts` |
| Nenhuma unidade entrega o gabarito pelo tamanho, medido no conteúdo real | `src/content/conteudo.test.ts` |

**Defeito real encontrado nesta etapa:** em `u01-primeiro-programa`, **as cinco** alternativas
corretas eram as mais longas; somando as quatro unidades, 11 de 20 perguntas tinham o vício. Quem não
estudou nada acertava a primeira ilha inteira marcando sempre a alternativa maior. O teste que existia
cuidava da **posição** da resposta (D-027) e não do **tamanho** — o mesmo defeito, medido de outro
jeito. As quatro unidades foram reescritas (distratores mais específicos, corretas mais enxutas) e a
regra entrou no validador (D-038).

**Defeito de documento cumprido:** os documentos prometiam, desde a Etapa 2, que o enunciado da
avaliação diria que a correção roda no cliente e que não há antifraude. Não dizia. Passou a dizer, e
o texto virou constante única (D-036).

### 3. Build de produção — EXECUTADO, passou

    dist/index.html                0.63 kB │ gzip:   0.40 kB
    dist/assets/index-*.css       20.77 kB │ gzip:   3.57 kB
    dist/assets/index-*.js       300.50 kB │ gzip:  95.18 kB
    dist/assets/Cena-*.js        912.10 kB │ gzip: 242.34 kB

### 4. Servidor de desenvolvimento — EXECUTADO

Dez caminhos conferidos com `curl -H 'Host: 5173-x.e2b.app'` — `/`, os painéis da avaliação e do
resultado, o painel da unidade, `learning/avaliacao.ts`, o validador, o conteúdo de `u01` e a página
do mundo: todos **200**, nenhum "Internal server error". Isto prova que os módulos compilam e são
servidos; **não** prova aparência.

### 5. Prova da trava de estilos — EXECUTADO

`--nao-existe-este-token` foi acrescentado de propósito ao `app.css` e a suíte de `qa/` reprovou,
nomeando a variável. O arquivo voltou ao estado anterior e a suíte passou de novo. A trava não é
decorativa.

### 6. O que continua NÃO executado

Aparência da avaliação e da revisão, contraste do aviso de honestidade, comportamento real de foco
com leitor de tela, teclado de verdade, e o placar depois de recarregar a página num navegador real.
O roteiro manual abaixo ganhou os itens 37 a 41.

---

## Execução de 21/09/2026 — Etapa 6 (o estudo com o livro na tela)

### 1. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro, com o conteúdo tipado novo (`oQueObservar`, `semOLivro`, `diagrama`) e a migração de
formato. Dois ajustes apareceram durante a escrita e foram feitos na hora: `ehProgressoValido` passou
a devolver `ProgressoGuardado` (a versão antiga não tem `leituraFeita`, e o guardião antigo mentia
sobre o tipo), e as fixtures de teste passaram a importar `VERSAO_DO_PROGRESSO` em vez de repetir um
número solto.

### 2. Testes automáticos — EXECUTADO

    npm test

**Resultado: 505 testes, 30 arquivos, todos aprovados** (eram 462/28 antes desta etapa).

| O que foi acrescentado | Onde |
|---|---|
| Marcar a leitura não muda aprovação, tentativas, melhor nota nem passo | `src/learning/percurso.test.ts` |
| Marcar leitura em unidade bloqueada é recusado, com erro | `src/learning/percurso.test.ts` |
| Idempotência: marcar duas vezes devolve o mesmo objeto, e nada mais se move | `src/learning/percurso.test.ts` |
| Zero a três aprovações na conta: o marcador nunca altera nota em nenhum caso | `src/learning/percurso.test.ts` |
| Versão 1 do arquivo guardado é migrada, preservando aprovação, tentativas e melhor nota | `src/persistence/progressoSalvo.test.ts` |
| A migração deixa o marcador de leitura **desmarcado**, e diz isso no aviso | `src/persistence/progressoSalvo.test.ts` |
| Versão futura tem aviso próprio ("por cima"), sem apagar o arquivo | `src/persistence/progressoSalvo.test.ts` |
| A ação `marcarLeitura` não move o passo nem mexe em respostas e resultado | `src/state/sessao.test.ts` |
| Com o painel aberto no estudo, o teclado do mundo continua desligado | `src/state/sessao.test.ts` |
| Todas as unidades têm `oQueObservar` e `semOLivro`, e a leitura continua sem página | `src/content/conteudo.test.ts` |
| Cada diagrama tem duas ou mais partes, rótulos únicos e nenhum valor vazio | `src/content/conteudo.test.ts` |
| Só a unidade das strings liga `espacosVisiveis` — e ela tem espaço de sobra para mostrar | `src/content/conteudo.test.ts` |
| A leitura aparece como passo do estudo, com o porquê e o que observar na tela | `src/ui/paineis/EstudoDaUnidade.test.tsx` (12 testes) |
| O marcador muda de estado na tela e diz que não aprova nada | `src/ui/paineis/EstudoDaUnidade.test.tsx` |
| O diagrama desenha as partes na ordem, com rótulo e valor | `src/ui/paineis/EstudoDaUnidade.test.tsx` |
| Só as pontas ganham o sinal de espaço; o miolo do texto fica intacto | `src/ui/paineis/EstudoDaUnidade.test.tsx` |
| Toda `var(--…)` usada no CSS existe entre os tokens, e o nome não tem ponto | `qa/estilos.test.ts` (4 testes) |
| O painel do projeto não afirma que recurso pronto está ausente | `src/app/App.test.tsx` |
| O painel avisa que ninguém viu o desenho 3D, e que a leitura marcada não aprova | `src/app/App.test.tsx` |

**Defeito real encontrado nesta etapa:** `app.css` usava `var(--painel.fundo-elevado)` — nome com
ponto, que `tokensComoVariaveisCss()` nunca produz. A declaração era simplesmente ignorada pelo
navegador, e o fundo do diagrama ficava com a cor de baixo. O teste de estilos pegou na primeira
execução; virou `--painel-fundo-elevado`.

**Terceiro defeito, de texto:** a página **Painel do projeto** (`#/painel`) continuava dizendo, desde
a Etapa 2, que "nenhuma ilha, nenhuma ponte, nenhum avatar" existia, que "nada é gravado no
navegador" e que não havia "nenhuma pergunta escrita". Tudo isso passou a ser falso nas Etapas 3, 4 e
5, e a página seguiu mentindo por três etapas — ninguém tinha motivo para reler aquele texto. A lista
foi refeita com o estado real (inclusive o aviso de que **ninguém viu o desenho 3D**), e três testes
novos em `src/app/App.test.tsx` travam o retorno do texto velho.

**Segundo defeito, na própria trava de testes:** a regra de "só as pontas" ganharam sinal precisou
mudar de ideia uma vez. A primeira versão marcava o começo e o fim **da string inteira** e deixava
`"  Ilha  "` intacto, porque as pontas do valor são aspas, não espaços. O teste escrito para essa
regra falhou por motivo certo, a função passou a olhar também o que está logo dentro das aspas, e a
regra ficou: espaços depois da aspa de abertura e antes da de fechamento aparecem; os do meio, não.

### 3. Build de produção — EXECUTADO, passou

    dist/index.html                0.63 kB │ gzip:   0.40 kB
    dist/assets/index-*.css       20.26 kB │ gzip:   3.52 kB
    dist/assets/index-*.js       298.06 kB │ gzip:  94.42 kB
    dist/assets/Cena-*.js        912.10 kB │ gzip: 242.34 kB

A cena continua em bloco separado (D-022). O pacote principal cresceu ~3,6 kB comprimidos: a leitura
orientada, os diagramas e o marcador entraram no bloco que a pessoa já carrega.

### 4. Servidor de desenvolvimento — EXECUTADO

    curl -H 'Host: 5173-x.e2b.app' http://127.0.0.1:5173/<caminho>

`/`, `/src/ui/paineis/LeituraDaUnidade.tsx`, `/src/ui/paineis/DiagramaDaExplicacao.tsx`,
`/src/ui/paineis/EstudoDaUnidade.tsx`, `/src/ui/paineis/MissaoDaUnidade.tsx`,
`/src/ui/paineis/PainelDaUnidade.tsx`, `/src/state/sessao.ts`, `/src/persistence/progressoSalvo.ts`,
`/src/learning/percurso.ts` e `/src/content/unidades/u03.ts` → todos **200**, nenhum
"Internal server error". Isto prova que os módulos novos compilam e são servidos; **não** prova
aparência.

### 5. O que continua NÃO executado

Aparência da leitura e dos diagramas na tela, a legibilidade do sinal de espaço (`·`) em tamanho
real, o contraste do diagrama, a leitura por leitor de tela das seções novas, e **a migração da
versão 1 aplicada sobre um `localStorage` de navegador de verdade**. Nenhum desses itens está marcado
como aprovado. O roteiro manual abaixo ganhou os itens 31 a 36.

---

## Execução de 21/09/2026 — Etapa 5 (navegação e avatar)

### 1. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro. Três ajustes de tipo apareceram durante a escrita e foram corrigidos na hora: o `ref` do
avatar passou a aceitar `null` (ele existe antes de começar a andar), o teste da rota precisou do
tipo do ponto do plano, e a prop nova da cena obrigou a página a montar o chão uma vez e passá-lo
adiante — o que era exatamente a intenção.

### 2. Testes automáticos — EXECUTADO

    npm test

**Resultado: 462 testes, 28 arquivos, todos aprovados** (eram 416/26 antes desta etapa).

| O que foi acrescentado | Onde |
|---|---|
| Só ponte liberada vira chão: com o progresso inicial não há faixa nenhuma | `src/world/mapaCaminhavel.test.ts` (15 testes) |
| O capim é um domo: a altura no centro é a do centro da ilha, e sobe até a borda | `src/world/mapaCaminhavel.test.ts` |
| O topo do tabuleiro encosta no capim das **duas** pontas | `src/world/mapaCaminhavel.test.ts` |
| A faixa caminhável é mais estreita que o tabuleiro, pela largura do corpo | `src/world/mapaCaminhavel.test.ts` |
| Onde é capim, onde é tabuleiro, e onde não é lugar nenhum | `src/world/mapaCaminhavel.test.ts` |
| As teclas movem na direção da câmera, e a diagonal não é mais rápida | `src/world/avatar/passos.test.ts` (19 testes) |
| A beirada segura: andar oito segundos em linha reta não tira o avatar do capim | `src/world/avatar/passos.test.ts` |
| Contra a borda, o corpo desliza em vez de travar | `src/world/avatar/passos.test.ts` |
| Sem ponte inteira, não há rota a pé — e a rota não sai do chão em nenhum ponto | `src/world/avatar/passos.test.ts` |
| Seguir a rota chega ao destino, quadro a quadro, sem pisar fora do chão | `src/world/avatar/passos.test.ts` |
| O avatar existe, com corpo, cabeça, braços, pernas e mochila | `src/world/ConteudoDaCena.test.tsx` |
| Segurar a tecla de frente desloca o avatar no modo andar, e não nos outros | `src/world/ConteudoDaCena.test.tsx` |
| Com o painel aberto, o teclado não move ninguém | `src/world/ConteudoDaCena.test.tsx` |
| Em cima da ponte, os pés ficam no tabuleiro (entre as duas alturas) | `src/world/ConteudoDaCena.test.tsx` |
| O lugar é anunciado quando muda: na ilha ao chegar, na ponte ao atravessar | `src/world/ConteudoDaCena.test.tsx` |
| Chão que sumiu debaixo do avatar: ele volta ao começo, em vez de flutuar | `src/world/ConteudoDaCena.test.tsx` |
| Pedir para ir a pé com a ponte inteira: o avatar atravessa e chega | `src/world/ConteudoDaCena.test.tsx` |
| Pedir para ir a pé sem ponte inteira: avisa, nomeia a ilha, e não anda | `src/world/ConteudoDaCena.test.tsx` |
| Ao lado do tabuleiro é vazio: o chão acaba na largura da faixa | `src/world/mapaCaminhavel.test.ts` |
| Três modos de câmera, com o padrão em andar e o escolhido marcado | `src/app/paginas/Mundo.3d.test.tsx` |
| A ajuda de teclas muda com o modo, sem prometer tecla sem efeito | `src/app/paginas/Mundo.3d.test.tsx` |
| No modo andar, atravessar a ponte pede caminhada; em voo, pede enquadramento | `src/app/paginas/Mundo.3d.test.tsx` |
| A ponte encosta no capim da borda (no topo do tabuleiro, não no eixo) | `src/world/mapaDoMundo.test.ts` |

**Defeito real encontrado nesta etapa:** o tabuleiro da ponte estava 0,36 abaixo do capim da borda
da ilha, porque a ponte era desenhada na altura do **centro** da ilha e o capim é um domo. Ninguém
notava olhando o código; apareceu quando o pé do avatar passou a precisar da altura exata. Corrigido
na geometria e coberto por teste (D-031). Um segundo defeito, menor: o teste que conferia o fim da
ponte media o **eixo** do tabuleiro — o que passava com o degrau lá. Agora mede o topo.

### 3. Build de produção — EXECUTADO, passou

    dist/index.html                0.63 kB │ gzip:   0.40 kB
    dist/assets/index-*.css       18.33 kB │ gzip:   3.25 kB
    dist/assets/index-*.js       285.53 kB │ gzip:  90.77 kB
    dist/assets/Cena-*.js        912.10 kB │ gzip: 242.34 kB

A cena continua em bloco separado, buscado só quando há 3D (D-022). O avatar e o chão caminhável
somam ~8 kB comprimidos ao pacote principal — menos do que custaria uma biblioteca de física.

### 4. O que continua NÃO executado

Aparência do avatar e do mundo, animação das pernas (que **não existe**), sensação de velocidade,
enquadramento da câmera de terceira pessoa, custo por quadro com o avatar em cena, teclado de
verdade e leitor de tela. Nada disso tem teste neste ambiente, e nada disso está marcado como
aprovado. O roteiro manual abaixo ganhou os itens do avatar.

---

## Execução de 21/09/2026 — revisão da Etapa 4 (a árvore 3D sob teste)

Esta execução é da revisão da Etapa 4: o mundo passou a ser montado em teste, e um defeito de
conteúdo foi corrigido. Nada de etapa nova.

### 1. Checagem de tipos — EXECUTADO, passou

Sem erro, com a árvore 3D sob teste e os nomes novos nos grupos da cena.

### 2. Testes automáticos — EXECUTADO

    npm test

**Resultado: 416 testes, 26 arquivos, todos aprovados** (eram 406/25 antes desta revisão).

| O que foi acrescentado | Onde |
|---|---|
| Uma ilha para cada unidade planejada, e nenhuma a mais | `src/world/ConteudoDaCena.test.tsx` (10 testes novos) |
| Cada ilha tem biblioteca, mesa com computador e placa de missão | `src/world/ConteudoDaCena.test.tsx` |
| Um farol de estado por ilha | `src/world/ConteudoDaCena.test.tsx` |
| Uma ponte por par vizinho, e nenhuma depois da última ilha | `src/world/ConteudoDaCena.test.tsx` |
| A ponte bloqueada desenha menos tábuas que a liberada (medido em vértices) | `src/world/ConteudoDaCena.test.tsx` |
| Aprovar a primeira unidade não mexe nas pontes seguintes | `src/world/ConteudoDaCena.test.tsx` |
| Clique na ilha escolhe a unidade; ilha bloqueada responde com o bloqueio | `src/world/ConteudoDaCena.test.tsx` |
| Clique na ponte pela metade é recusado por `decidirTravessia`, com o motivo | `src/world/ConteudoDaCena.test.tsx` |
| Distribuição das respostas corretas pelas quatro posições, **por unidade** | `src/content/conteudo.test.ts` (reforçado) |

**Defeito real encontrado nesta revisão:** em `u03Strings`, as cinco respostas corretas estavam na
posição 1. O teste que existia conferia a variedade somando todas as unidades em um conjunto único, e
passava. As quatro unidades foram redistribuídas — u01 `[2,1,3,0,2]`, u02 `[3,0,2,1,3]`, u03
`[1,3,0,2,1]`, u04 `[0,2,1,3,0]` — e o teste passou a exigir as quatro posições dentro de **cada**
unidade (D-027).

**O que o teste novo prova, e o que ele não prova:** ele monta a árvore 3D real — os mesmos
componentes do navegador — com o renderizador de teste do React Three Fiber. Prova composição,
quantidade e fiação. **Não prova aparência:** luz, cor, enquadramento, legibilidade e desempenho
seguem sem verificação, porque dependem de pixel.

### 3. Build de produção — EXECUTADO, passou

    dist/index.html                0.63 kB │ gzip:   0.40 kB
    dist/assets/index-*.css       18.25 kB │ gzip:   3.24 kB
    dist/assets/index-*.js       277.22 kB │ gzip:  88.09 kB
    dist/assets/Cena-*.js        911.08 kB │ gzip: 242.09 kB

O aviso do empacotador sobre o bloco de 911 kB é conhecido e aceito por ora: é o `three`, que só
chega quando o modo 3D é ligado (D-022). Reduzir esse número é assunto da Etapa 13.

### 4. O que continua NÃO executado

Tudo o que depende de navegador real: aparência do mundo, luz, enquadramento, o cursor de mãozinha
sobre a ponte, a animação das tábuas, o voo da câmera e o desempenho. Ver o roteiro manual abaixo.

---

## Execução de 21/09/2026 — Etapa 4 (as pontes como travessia)

### 1. Checagem de tipos — EXECUTADO, passou

Sem erro. Um defeito de ordem de declaração foi pego na hora: `todasAprovadas` era calculado antes
de `resumo` existir (`TS2448`); a linha subiu para depois do cálculo do resumo.

### 2. Testes automáticos — EXECUTADO

    npm test

**Resultado: 406 testes, 25 arquivos, todos aprovados** (eram 398/25 antes desta etapa).

| O que foi acrescentado | Onde |
|---|---|
| Travessia decidida por função pura: recusa com motivo, libera depois da aprovação | `src/world/mundoVisivel.test.ts` (4 testes novos) |
| Varredura de todos os progressos possíveis: nenhuma combinação permite atravessar sem liberação | `src/world/mundoVisivel.test.ts` |
| Clique na ponte pela metade não abre nada e explica o que falta | `src/app/paginas/Mundo.3d.test.tsx` |
| Clique na ponte inteira fecha o painel e leva adiante | `src/app/paginas/Mundo.3d.test.tsx` |
| Aprovar a última ilha não promete uma ponte que não existe | `src/app/paginas/Mundo.interacao.test.tsx` |
| Com tudo aprovado, o HUD anuncia o fim do percurso e nenhuma ilha fica fechada | `src/app/paginas/Mundo.interacao.test.tsx` |

**Defeito real encontrado por teste nesta etapa:** com as quatro ilhas aprovadas, a tela de
resultado ainda dizia "a ponte para a próxima ilha está inteira" — e não existe próxima. O texto
passou a distinguir os dois casos, e há teste para o caso da última ilha.

### 3. Build de produção — EXECUTADO, passou

    dist/index.html                0.63 kB │ gzip:   0.40 kB
    dist/assets/index-*.css       18.25 kB │ gzip:   3.24 kB
    dist/assets/index-*.js       277.22 kB │ gzip:  88.08 kB
    dist/assets/Cena-*.js        910.51 kB │ gzip: 241.97 kB

### 4. O que continua NÃO executado

O movimento das tábuas da ponte ao ser liberada, o cursor de mãozinha sobre a ponte e o voo da
câmera até a ilha de destino: os três dependem de WebGL e de navegador. Ficam no roteiro manual
abaixo, e **não** estão marcados como aprovados.

---

## Execução de 21/09/2026 — Etapa 3 (o mundo 3D e o ciclo de estudo da primeira ilha)

### Ambiente

| Item | Valor |
|---|---|
| Sistema | Linux, sandbox de desenvolvimento |
| Node | 22.22.3 |
| npm | 10.9.8 |
| Vite | 8.3.0 |
| TypeScript | 7.0.2 |
| Vitest | 5.0.1 |
| React | 19.2.1 |
| three / @react-three/fiber | 0.186.0 / 9.7.0 |
| `jsdom` para os testes de interação | 30.1.0 |
| Navegador disponível no ambiente | **nenhum** (Chromium e Playwright ausentes) |

### 1. Checagem de tipos — EXECUTADO

    npm run typecheck        # tsc --noEmit

**Resultado: passou, sem erro**, com `strict`, `noUnusedLocals`, `noUnusedParameters` e
`noUncheckedIndexedAccess` ligados.

Falhas reais pegas por `tsc` nesta etapa:

| Erro | Causa | Correção |
|---|---|---|
| `TS2724: 'TeclasDeMovimento' is not exported by './teclas'` | O tipo mora em `world/camera/movimento.ts`, e o import apontava para `world/teclas.ts` | Import corrigido |
| `TS6133: 'usuario' is declared but its value is never read` | Variável de teste criada e não usada depois de uma reescrita | Removida |
| `TS2322` em literais de ação dentro de `map` | O literal era alargado para `string` | Funções auxiliares anotadas, em vez de `as` espalhado |

### 2. Testes automáticos — EXECUTADO

    npm test                 # vitest run

**Resultado: 398 testes, 25 arquivos, todos aprovados. Duração: ~11 s.**

| Arquivo | Testes | O que cobre |
|---|---|---|
| `src/state/sessao.test.ts` | 36 | Redutor do ciclo: passos, foco, responder, enviar, refazer, atalhos recusados |
| `src/world/camera/movimento.test.ts` | 30 | Câmera: limites de altura e distância, teclas, interpolação, vista de mapa |
| `src/ui/theme/contraste.test.ts` | 26 | Fórmula WCAG e todos os pares de cor da interface |
| `src/learning/percurso.test.ts` | 23 | Desbloqueio, reprovação, melhor nota, recusa de atalho, serialização |
| `src/world/geometria/ilha.test.ts` | 23 | Perfil da rocha, tremor proporcional, malha do topo |
| `src/persistence/progressoSalvo.test.ts` | 22 | Leitura, escrita, versão, corrupção, cota, apagar só o que é nosso |
| `src/world/geometria/solidos.test.ts` | 22 | Caixa, ponte, mesa, placa, biblioteca, árvore; formas fechadas |
| `src/app/App.test.tsx` | 19 | Casca, abas, rota padrão, trilha em texto, painel do projeto |
| `src/learning/avaliacao.test.ts` | 19 | Aprovação com 80% reais, exibição que não engana, correção |
| `src/content/conteudo.test.ts` | 18 | Invariantes do conteúdo das 4 unidades |
| `src/world/geometria/pintura.test.ts` | 17 | Cor por altura e suavização da pintura |
| `src/world/mapaDoMundo.test.ts` | 16 | Posições, pontes, enquadramento, espalhamento |
| `src/app/paginas/Mundo.interacao.test.tsx` | 16 | **Ciclo completo com cliques, teclado e `localStorage` de verdade (jsdom)** |
| `src/content/planoDeUnidades.test.ts` | 15 | Plano das unidades e referência de página pendente |
| `src/world/mundoVisivel.test.ts` | 13 | O único elo progresso ↔ cena |
| `src/world/geometria/orientacao.test.ts` | 13 | **Faces para fora**: nenhuma malha invertida |
| `src/world/teclas.test.ts` | 12 | Teclas por `code`, soltar todas, sem vazamento |
| `src/world/geometria/aleatorio.test.ts` | 10 | Gerador determinístico e semente de texto |
| `src/ui/theme/amostras.test.ts` | 9 | Mostruário de cores completo |
| `src/ui/theme/paleta3d.test.ts` | 9 | Ponte única CSS ↔ Three |
| `src/app/paginas/VitrineDoTema.test.tsx` | 8 | Guia de estilo |
| `src/app/rotas.test.ts` | 7 | Rotas por hash e a recusa de rota que desbloqueie unidade |
| `src/app/paginas/Mundo.test.tsx` | 6 | Mundo com 3D (cena trocada por marcador), render estático |
| `src/app/paginas/Mundo.3d.test.tsx` | 5 | Mundo com 3D em jsdom: cena monta, câmera troca, teclas saem do mundo |
| `qa/acentuacao.test.ts` | 4 | Acentuação do português em código e documentação |

Os números por arquivo mudam a cada incremento; a contagem acima é a desta execução.

#### Provas que valem destacar nesta etapa

**O ciclo inteiro é percorrido com evento de verdade** (`Mundo.interacao.test.tsx`, 16 testes):

- abrir a ilha pelo cartão leva o foco para o painel (`document.activeElement` conferido);
- ilha bloqueada tem botão **desabilitado de verdade** e clicar nele não abre nada;
- com pergunta em branco, o envio é recusado, a tela diz quantas faltam e **nada é corrigido**;
- **nenhuma marca de certo ou errado aparece antes do envio** — nem por texto, nem por classe;
- 4 de 5 aprova e mostra "4 de 5 acertos (80%)"; 3 de 5 reprova e mostra 60%, sem bloquear nada;
- depois do envio as respostas ficam travadas (`fieldset` desabilitado) e o botão de enviar some;
- refazer limpa as respostas e reabre a escolha;
- aprovar grava no `localStorage` sob a chave da aplicação, com `versao: 1`, e a ilha seguinte
  passa a aceitar entrada;
- abrir a página com progresso guardado mostra o placar já na primeira renderização — prova que a
  leitura acontece **antes** da gravação, e não depois;
- "Apagar meu progresso" não faz nada sem confirmação, e depois de confirmada apaga **somente** a
  chave da aplicação (a chave de outro site da mesma origem continua intacta);
- hash de endereço como `#/unidade/u04-listas-do-mercado?liberada=1` **não** abre ilha bloqueada.

**A trava de orientação funcionou de novo** (`orientacao.test.ts`): a rocha é um sólido de
revolução, e o teste por "ponto interno" falha perto da ponta (raio ≈ 0). A verificação passou a
usar o componente radial da normal; e um teste separado recusa malha dobrada.

**Nenhuma palavra sem acento** (`qa/acentuacao.test.ts`): a extração de texto ganhou um filtro para
não confundir código entre `>` e `<` com texto de tela — `case 'codigo':` deixou de ser falso
positivo — e um teste novo garante que o filtro não virou esconderijo: texto entre tags continua
sendo olhado.

#### Defeitos reais encontrados pelos testes nesta etapa

| Defeito | Como apareceu | Correção |
|---|---|---|
| Todas as faces com enrolamento invertido — o mundo era invisível de fora | `orientacao.test.ts` | `solidos.ts` e `ilha.ts` corrigidos; o teste ficou |
| Pernas da mesa abaixo do chão | Teste de sólidos | `gerarMesa` reancorada |
| Tremor da rocha com amplitude fixa dobrava a malha na ponta | Teste de geometria | Tremor proporcional ao raio do anel, com piso |
| A tela dizia "você já havia aprovado" logo depois da primeira aprovação | Teste de interação | A aprovação anterior passou a ser fotografada ao abrir a ilha (`sessao.aprovadaAntes`) |
| "Seguir para a próxima ilha" não fazia nada visível na versão sem 3D | Teste de interação | Sem 3D, seguir abre a missão da próxima ilha, pelo mesmo caminho que confere a liberação |
| Botão "Ligar o 3D" aparecia em máquina sem WebGL, sem ter o que ligar | Teste de app | Os controles de câmera e o botão de 3D só aparecem quando há o que controlar |
| Erro de inicialização (`Cannot access 'com3d' before initialization`) | Teste de interação | Declaração movida para antes dos callbacks que a usam |

### 3. Build de produção — EXECUTADO

    npm run build            # tsc --noEmit && vite build

**Resultado: passou.**

    dist/index.html                0.63 kB │ gzip:   0.40 kB
    dist/assets/index-*.css       18.22 kB │ gzip:   3.23 kB
    dist/assets/index-*.js       276.11 kB │ gzip:  87.74 kB
    dist/assets/Cena-*.js        909.66 kB │ gzip: 241.71 kB
    ✓ built in 650 ms

A cena virou um arquivo separado por importação sob demanda (D-022). Quem estuda sem 3D baixa
**88 kB** comprimidos, e não 330 kB: o `three` só chega a quem tem placa de vídeo.

### 4. Servidor de desenvolvimento e host do preview — EXECUTADO

    npm run dev

| Requisição | Resultado |
|---|---|
| `http://localhost:5173/` | **200** |
| `http://localhost:5173/src/app/paginas/Mundo.tsx` | **200**, compilado pelo Vite, sem erro de transformação |
| `Host: 5173-*.e2b.app` (domínio do preview) | **200** (verificado antes da reescrita da página; `allowedHosts: ['.e2b.app']` inalterado) |
| `Host: evil.example.com` (host não autorizado) | **403** — bloqueado pelo Vite |

O servidor escuta em `0.0.0.0:5173` (conferido com `ss -ltnp`: endereço `*:5173`).

---

## NÃO executado até agora

| Verificação | Motivo | Como será feita |
|---|---|---|
| Desenho 3D na tela: triângulos, luz, névoa, cores, enquadramento | Nenhum navegador com WebGL neste ambiente. O `three` compila e a cena monta em jsdom com a cena trocada por marcador — o que **não** é o mesmo que ver o mundo | Etapa 13, com navegador. Enquanto isso, o roteiro manual abaixo |
| Interação 3D: arrastar o mouse para olhar, clicar na ilha, voar com `W A S D` | Idem: dependem de WebGL | Roteiro manual abaixo |
| Layout, contraste **na tela**, comportamento do `background-attachment` no iOS | Exige navegador/aparelho. O contraste dos tokens é calculado e testado; os pixels, não | Etapa 13 |
| Teste em navegador automatizado (Playwright) | Nenhum navegador instalado; o Playwright baixaria centenas de MB | Etapa 13, ou quando autorizado |
| Acessibilidade com leitor de tela real | Exige navegador | Etapa 13 |
| Execução de Python (Pyodide) | Não existe nesta etapa, por decisão | Etapa 9 |
| Extração de paleta das imagens de referência | Arquivos não chegaram ao disco | Quando os arquivos existirem |

**Nada da tabela acima está marcado como aprovado.** Não foi executado.

---

## Roteiro manual de verificação visual (Etapa 3)

Quando houver navegador, esta é a lista a percorrer. Quem fizer deve registrar o resultado item a
item, sem presumir sucesso.

1. `npm install` e `npm run dev`. Abrir o endereço mostrado.
2. **O mundo aparece?** Conferir ilhas suspensas sobre o mar, com céu em cima, névoa ao fundo e
   nuvens. Nada deve estar preto, branco ou "de dentro para fora".
3. Arrastar com o mouse: a câmera olha em volta. `W A S D` anda, `Q`/`E` sobem e descem, `Shift`
   acelera. Nenhuma dessas teclas deve rolar a página.
4. Clicar em **Vista de mapa**: a câmera sobe e mostra as quatro ilhas; clicar em **Voo livre**
   volta ao modo livre.
5. Passar o mouse sobre uma ilha: o nome dela aparece no HUD, e ela dá sinal de destaque.
6. Clicar na **primeira** ilha: o painel abre no passo **Missão**, com o foco dentro dele. Tentar
   andar com `W`: a câmera **não** deve se mover (D-012).
7. Teclar `Esc`: o painel fecha e a câmera volta a responder.
8. Clicar nas ilhas 2, 3 e 4: **nada** deve abrir, e deve aparecer a explicação de qual ilha falta
   aprovar.
9. Dentro da primeira ilha, percorrer Missão → Estudo → Prática → Avaliação pelas abas. Conferir
   os acentos, os blocos de código e o texto sem número de página.
10. Responder 4 das 5 perguntas e tentar enviar: o envio deve estar bloqueado, com a contagem do
    que falta. Responder a última e enviar: **"4 de 5 acertos (80%)"** e a ilha 2 passa a aceitar
    entrada.
11. Recarregar a página: o mundo deve voltar com a ilha 1 aprovada e a 2 liberada.
12. **Apagar meu progresso**, confirmando: as quatro ilhas voltam a ficar como no começo, e nada
    mais no navegador é apagado.
13. Reduzir a janela até a largura de celular: a lista de ilhas vem **antes** do palco 3D, e o HUD
    não cobre os botões.
14. Navegar só com `Tab` e `Enter`. O foco não pode ficar preso no painel, e todo botão precisa
    ter rótulo lido em voz alta.
15. Com zoom de 200%, conferir que nada é cortado.
16. **Ponte pela metade**: clicar numa ponte que ainda não está inteira. Deve aparecer a explicação
    com o nome da ilha que falta aprovar, e **nada** deve abrir.
17. **Ponte inteira**: depois de aprovar a primeira ilha, clicar na ponte entre a primeira e a
    segunda. A câmera deve voar até a segunda ilha. O cursor do mouse deve virar mãozinha ao passar
    sobre a ponte.
18. **A liberação se vê**: no momento em que a aprovação acontece, as tábuas da ponte devem se
    estender até completar o vão, em cerca de meio segundo.
19. **Fim do percurso**: com as quatro ilhas aprovadas, o HUD deve anunciar que o percurso escrito
    acabou, e nenhuma ilha deve ficar fechada.

### Roteiro manual — o avatar (Etapa 5)

20. **Ele está lá**: ao abrir o mundo no modo padrão, deve aparecer uma pessoa no centro da primeira
    ilha, com a câmera atrás dela. Se a figura estiver flutuando, ou com os pés dentro do capim, o
    item falhou.
21. **Andar**: `W A S D` (ou as setas) move a pessoa pela ilha. Ela não deve atravessar a borda do
    capim nem sumir no vão. `Shift` deve deixar visivelmente mais rápido.
22. **A beirada segura**: caminhar contra a borda por vários segundos. A pessoa deve parar ou
    deslizar pela borda — nunca cair no vazio.
23. **A ponte encosta**: no modo andar, com a primeira ponte liberada, caminhar da ilha até a ponte.
    O pé deve passar do capim para o tabuleiro **sem degrau** — é o defeito corrigido em D-031, e é
    exatamente o que só se vê na tela.
24. **Atravessar a pé**: clicar na ponte inteira no modo andar. A pessoa deve andar até a outra ilha
    e parar no centro dela, sem atravessar o vão em linha reta por fora do tabuleiro.
25. **O HUD acompanha**: a frase do lugar deve mudar ao entrar na ponte ("Você está na ponte entre
    «…» e «…»") e ao chegar na outra ilha.
26. **Sem ponte inteira, a recusa**: pedir para ir a pé a uma ilha distante, com ponte pela metade no
    meio. Deve aparecer a explicação com o nome da ilha, e a pessoa **não** deve se mover.
27. **A câmera não briga**: arrastar o mouse deve girar a câmera em volta da pessoa sem atravessar o
    chão nem entrar na pedra. `W` depois de girar deve andar para onde a câmera aponta.
28. **As teclas de voo somem**: no modo andar, `Q` e `E` não devem fazer nada — e a lista "Como
    pilotar" não pode citá-las. Ao trocar para `Voo livre`, a lista muda.
29. **Ordem de quadro**: andando e girando ao mesmo tempo, a câmera não deve tremer nem ficar um
    quadro atrás da pessoa.
30. **Desempenho**: andar com o mundo inteiro em cena deve manter a animação fluida num aparelho
    modesto. Sem medida neste ambiente, isto é o item mais frágil do roteiro — e o único que pede
    olhar um contador de quadros.

### Roteiro manual — o estudo com o livro na tela (Etapa 6)

31. **A leitura é um passo**: abrir a primeira ilha e ir até a aba **Estudo**. A seção **1. Ler no
    livro** deve vir **antes** da explicação, com a parte indicada (capítulo e seção), o porquê e a
    lista do que procurar. Nenhum número de página deve aparecer.
32. **O caminho sem livro**: logo abaixo, "Se você não tem o livro agora" deve trazer uma saída que
    ensine sem o livro. Não pode haver botão de abrir PDF nem link para arquivo que não existe.
33. **O marcador não mente**: clicar em "Marcar esta leitura como feita". O botão deve passar a
    "Leitura marcada como feita", e o texto ao lado deve dizer que isso **não** aprova a ilha, não
    abre a ponte e não muda nota. Conferir no painel: a nota e o placar não podem ter mudado.
34. **O marcador sobrevive**: recarregar a página e voltar ao estudo. O marcador deve continuar
    marcado, e a nota, igual. Desmarcar e recarregar: deve continuar desmarcado.
35. **Os diagramas são legíveis**: percorrer as quatro ilhas e conferir que os diagramas aparecem com
    título, descrição e as partes na ordem, que o texto das partes não é cortado, e que a lista é lida
    em voz alta por leitor de tela sem perder rótulos.
36. **O sinal de espaço se entende**: na unidade das strings, o diagrama com `espacosVisiveis` deve
    mostrar `·` só nas pontas dos valores (depois da aspa de abertura e antes da de fechar), com uma
    legenda dizendo o que o sinal significa — e **nenhum** `·` nos espaços do meio das frases. Num
    navegador com leitor de tela, a legenda precisa ser lida.

### Roteiro manual — a avaliação (Etapa 7)

37. **O aviso antes das perguntas**: abrir a aba **Avaliação**. Antes da primeira pergunta deve
    aparecer, com destaque próprio, a frase dizendo que a correção roda no navegador, que não é
    antifraude e que o objetivo é aprender. Ela precisa ser lida sem esforço — se passar despercebida,
    o item falhou.
38. **Falta responder, e a tela diz o quê**: responder duas perguntas e olhar o rodapé da avaliação.
    A frase deve citar os **números** das que faltam, e cada uma deve ter um botão que leva o cursor
    de teclado até ela. O botão de enviar deve continuar apagado.
39. **Depois do envio, a revisão**: enviar e percorrer a revisão inteira. Cada pergunta deve trazer o
    que foi marcado, qual era a resposta certa e a explicação — **inclusive** nas que foram
    acertadas. Nenhum texto de explicação pode aparecer antes do envio.
40. **O placar**: conferir a linha "Esta foi a tentativa nº 1". Fechar o painel, reabrir a ilha,
    refazer a avaliação errando mais e conferir a linha "tentativa nº 2" com a melhor nota anterior;
    a ilha deve continuar marcada como aprovada na trilha. Recarregar a página e conferir que a
    contagem de tentativas continua lá.
41. **Foco ao enviar**: com leitor de tela ou navegando só por teclado, enviar a avaliação. O foco
    deve ir para o anúncio do resultado ("Aprovado nesta ilha" ou "Ainda não foi desta vez"), e não
    ficar perdido no fim do formulário.

### Roteiro manual — persistência e protótipo (Etapa 8)

42. **O progresso sobrevive à recarga**: aprovar a primeira ilha, recarregar com `F5` e conferir que o
    placar volta em "1 de 4 ilhas aprovadas", que a segunda ilha aceita entrada e que o marcador de
    leitura continua como estava. Fazer o mesmo depois de aprovar a terceira.
43. **Abas abertas ao mesmo tempo**: abrir a aplicação em duas abas, aprovar uma ilha numa e recarregar
    a outra. A segunda deve mostrar o progresso mais recente gravado (a última gravação vence) — e
    nenhuma das duas pode apagar a chave do progresso em nenhum momento.
44. **Navegador que não guarda**: abrir numa janela privada. A trilha inteira deve funcionar, e o
    aviso dizendo que o progresso não será guardado precisa aparecer sem que seja preciso procurar por
    ele. Estudar, aprovar uma ilha e conferir que o aviso permanece.
45. **Apagar só o nosso**: guardar um dado qualquer de outro site na mesma origem (por exemplo, criar
    uma chave no console do navegador), clicar em **Apagar meu progresso**, confirmar, e conferir que
    o dado do outro site continua lá e que o Arquipélago voltou ao começo.

Resultado esperado: 45 de 45 conferidos. Qualquer item que falhe deve ser registrado aqui.

---

## Execução de 21/09/2026 — Etapas 1.1, 1.2 e 2 (histórico)

### Ambiente

Node 22.22.3 · npm 10.9.8 · Vite 8.3.0 · TypeScript 7.0.2 · Vitest 5.0.1 · React 19.3.0 ·
**nenhum navegador**.

### 1. Checagem de tipos — EXECUTADO, passou

Falhas reais corrigidas: `TS2882` (import de CSS sem os tipos do Vite → `src/vite-env.d.ts`),
`TS6133` (import sem uso), `TS2554` (chamada de `registrarResultado` sem a lista de unidades),
`TS2591` (`node:fs` sem tipos → `@types/node` e referência explícita em `qa/acentuacao.test.ts`).

O último caso é o mais instrutivo: os **testes passavam**, mas o **build falhava** — porque
`tsc --noEmit` roda dentro de `npm run build`. Lição registrada: depois de mexer em `qa/`, rodar a
verificação completa.

### 2. Testes automáticos — EXECUTADO

**122 testes, 9 arquivos, todos aprovados.**

Provas que valem destacar: aprovação e exibição nunca se contradizem (dois testes percorrem
~3.600 combinações de acertos e totais de 1 a 60); nenhum atalho de desbloqueio; referência de
página sempre pendente até o PDF ser conferido; acentuação varrida em `src/` e `docs/`.

### 3. Build de produção — EXECUTADO, passou

    dist/index.html              0.63 kB │ gzip:  0.40 kB
    dist/assets/index-*.css      8.68 kB │ gzip:  1.84 kB
    dist/assets/index-*.js     243.29 kB │ gzip: 76.38 kB

### 4. Servidor e host do preview — EXECUTADO

`localhost` 200 · `5173-abc123.e2b.app` 200 · `evil.example.com` **403** (prova de que
`allowedHosts: ['.e2b.app']` restringe, e não libera em geral).

### 5. Arquitetura de tokens no build — EXECUTADO

7 de 7 cores dos tokens presentes no JavaScript de produção; nenhuma cor literal em `app.css`;
39 usos de `var(--...)`.
