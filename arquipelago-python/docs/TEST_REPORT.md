# RELATÓRIO DE TESTES

Regra deste documento: dizer **o que foi realmente executado**, em que ambiente e com que
resultado. Teste não executado aparece como **não executado**, e não como aprovado por leitura de
código.

---

## Execução de 21/09/2026 — lote 6: o projeto de dados (capítulos 15 a 17, ilhas 16 a 18) e o conserto do lote 6.1

Versão **0.20.0**. O lote 6 escreveu a trilha de visualização de dados; o 6.1 consertou o que a captura de
tela do usuário mostrou. Os dois entraram no mesmo commit.

### 1. O que o console roda na trilha de dados — medido, `import` por `import`

Executado no Pyodide desta versão do projeto (`/tmp/sondas/dados.mjs`, Node v22.22.3), com o resultado do
`import` e não com a expectativa:

| módulo | resultado |
| --- | --- |
| `csv`, `json`, `random`, `datetime`, `statistics`, `math`, `collections`, `urllib.parse`, `os`, `pathlib`, `sqlite3` | **OK** |
| `requests` | falha (não existe nesta distribuição) |
| `matplotlib`, `numpy`, `pandas` | falham |

As contas que os exercícios usam foram medidas na mesma execução: CSV escrito e lido (`2 9.5 9.5`),
`json.dump`/`json.load` (`1 Ana 9.5`), `json.loads` de uma resposta (`2 10`), `urlencode`
(`https://api.exemplo.com/procura?q=python&sort=stars`), `random.seed(7)` reproduzível na mesma execução
(`[3, 2, 4, 6, 1, 1, 5, 1, 3, 5] 31`), `collections.Counter` (`{3: 3, 5: 1, 1: 1}` `[(3, 3)]`).

### 2. A paleta de dezoito tons — escolhida pela distância desenhada

A alternativa era deixar o tom **ciclar** em quinze. A sonda que varre todas as misturas de dois tokens
respondeu, nos dois cenários:

| | menor par **cru** | menor par **desenhado** | tons intocados pelo orçamento | pior radiação | pior escuridão visível |
| --- | --- | --- | --- | --- | --- |
| 15 tons (antes do lote 6) | 48,9 entre os dez originais | 32,1 (par 6 e 7) | 13 de 18 | 0,914 (teto 0,92) | 0,1175 |
| **18 tons (lote 6)** | **46,5** | **32,1 (o mesmo par 6 e 7)** | **13** | **0,914** | **0,1175** |

Ou seja: os três tons novos **não empilharam** nenhum tom — o par mais próximo dos dezoito é o mesmo dos
doze originais. Foi essa medida que decidiu contra o ciclo.

### 3. O mundo com dezoito ilhas e dezessete pontes

| | valor |
| --- | --- |
| ilhas / pontes | **18 / 17** |
| extensão em x | **−182,7 a 184,3** |
| espalhamento | **355,1** |
| câmera de mapa (altura) | **301,8** |
| marcos distintos / tons distintos / silhuetas distintas | **18 / 18 / 18** |

### 4. O conserto do lote 6.1 — a ponte, o chão e as cores, com número

| | antes | depois |
| --- | --- | --- |
| pontas de ponte **no ar** (das 34) | **6** (a pior a 0,582 além da borda desenhada) | **0** |
| pontas enterradas no capim | — | **0** |
| maior desvio entre a âncora e a borda real | **0,941** | — (a âncora é a borda) |
| folga mínima até a borda externa | — | **0,171** |
| ponte bloqueada | metade do vão, a partir da origem | **dois tocos, vão de um quarto no meio** |

As cores por ilha foram escolhidas medindo três coisas em cada fração: desvio máximo do token, menor par
entre ilhas e distância mínima ao capim da própria ilha. Duas primeiras tentativas foram reprovadas pela
medida — a copa em 0,32 **sem** escurecer ficava a **12,0** do capim da ilha mais clara, e a flor
misturada com o capim claro caía para **30,1**. O que passou está na tabela de D-063 (madeira 0,20 · pedra
0,16 · copa 0,18 + escurecer 0,8 · arbusto 0,30 · flor âmbar puro).

### 5. Testes executados

- **`npx vitest run`** — **43 arquivos, 785 testes, todos aprovados** (eram 43 e 779). Os novos cobram: a
  trilha de dados escrita e coerente com o conteúdo; os três marcos com declarado ≥ medido e o eixo de
  giro certo; as cores por ilha (dezoito madeiras, dezoito pedras, dezoito copas distintas, todas dentro do
  orçamento de luz e sem sumir no capim); a ponte ancorada no capim desenhado (as duas pontas dentro do
  polígono, e a prova de que a âncora antiga deixaria ponta no ar); a ponte bloqueada com vão no meio; o
  chão caminhável seguindo o polígono; arbustos, flores e bandeira em cada ilha; e a árvore com duas cores,
  madeira diferente por ilha.
- **`npx tsc --noEmit`** — limpo.
- **`npm run build`** — 606 ms; `index` 573,65 kB (gz 172,38), `Cena` 925,31 kB (gz 246,70), CSS 25,62 kB
  (gz 4,15).
- **Pyodide de verdade** — `pyodideDeVerdade.test.ts` executa as 9 respostas de referência dos exercícios
  novos no Python real e confere a correção; foi ele que pegou os dois defeitos de gabarito do lote.
- **`qa/acentuacao.test.ts`** — dentro da suíte: a trava de acentuação do português em código e
  documentação passou (ela lê o texto dos arquivos e cobra as palavras que a língua exige).

### 6. Verificação visual — **não executada**

O sandbox **não tem navegador nem WebGL**: nenhuma captura foi produzida aqui, e nada nesta seção foi
aprovado por olhar. O que se sabe é por medida: a ponte encosta (0 pontas no ar), o chão segue o capim, e
as cores estão dentro do orçamento de luz. O que depende de olhar, com o roteiro da próxima captura:

1. **Ponte** — de perto, no ponto de encontro com cada ilha: o tabuleiro tem de **encostar** no capim, sem
   degrau nem vão, nas duas pontas. Se ainda houver fresta, o número a medir é a distância entre o fim do
   tabuleiro e a borda do capim naquela direção.
2. **Ponte bloqueada** — de longe: o que se vê é uma ponte **interrompida** (dois tocos, vão no meio), e
   não uma tábua pendurada.
3. **Ilhas diferentes** — de longe: madeira, pedra e folhagem mudam de ilha para ilha, e a bandeira da
   trilha é visível antes do nome.
4. **Vida no capim** — de perto: arbustos e flores, e a árvore com tronco e copa bem separados.

---

## Execução de 21/09/2026 — lote 5: a Parte II vira trilha (capítulos 12 a 14, ilhas 13 a 15)

Versão **0.19.0**. O lote começou por uma medição, porque a pergunta que o `HANDOFF` tinha deixado em
aberto era exatamente essa: como ensinar três projetos que dependem de bibliotecas que este console não
tem? A resposta está em **D-061**.

### 1. Medição do console, feita antes de escrever o conteúdo

Executado no Pyodide do projeto (a cópia local de `public/pyodide/`, sem rede):

| Comando | Resultado medido |
|---|---|
| `import pygame` | **falha** — não está na distribuição |
| `import django` | **falha** — idem |
| `import matplotlib` | **falha** — o `numpy` que ela pede não está na cópia local |
| `import numpy`, `import pandas`, `import tkinter`, `import turtle` | **falham** |
| `import sqlite3` | **funciona** — biblioteca padrão (dentro do `python_stdlib.zip`) |
| `py.loadPackage('numpy')` | **não levanta erro** e **não carrega**: tenta o CDN, a rede está bloqueada, e a promessa resolve assim mesmo |
| `py.loadPackage('matplotlib')` | idem, com as sete dependências tentadas uma a uma |

A última linha virou decisão de projeto: **não confiar no `loadPackage` para dizer "carregou"**. Ele
resolve a promessa mesmo quando a carga falha, então o teste de "importou" tem de ser o `import`.

### 2. O que o lote entregou, e o que foi conferido no console de verdade

Os três exercícios de cada unidade nova rodam no Python de verdade e passam na própria correção —
18 arquivos de teste no total. Durante essa conferência, **duas contas minhas estavam erradas** e o
console real pegou as duas:

| Onde | O que eu esperava | O que o console mediu |
|---|---|---|
| `u14/e14-3` | a frota parada em 340 depois de virar | **520** — a frota vira em 580 e recua dois passos |
| `u15/e15-3` | `nível 3: 3.0` | nada: a solução pedia o nível 4, porque a variável já valia 3 e o código somava 1 |

Também caiu uma terceira, na mesma bateria: a sonda de `e13-1` procurava `nave.velocidade_da_nave`, e
uma solução **certa** reprovou com `AttributeError` porque guardava a velocidade com outro nome. A sonda
passou a medir o **efeito** (um passo para a direita anda exatamente a velocidade), e não o nome do
atributo — é a regra de D-052 aplicada de novo.

### 3. Medição do mundo com quinze ilhas

| Medida | Valor |
|---|---|
| ilhas / pontes | **15 / 14** |
| x | −145,3 a 145,9 |
| z | −11,5 a 8,2 |
| y (topo) | 0,0 a 33,6 |
| marcos distintos | **15** (portal a mira) |
| tons distintos | **15** (índices 0 a 14) |
| espalhamento | 291,3 |
| câmera de mapa | y 247,6, z 102,0 (limite de distância: 260) |
| pontas de pedra distintas | 12 (as 3 famílias, com o valor exato saindo da semente) |

### 4. Os tons novos, e a medida que mudou a escolha

Os três tons da trilha do jogo foram procurados por varredura (todas as misturas de dois tokens dentro
da faixa de claridade de um tom de ilha), exigindo 45 de distância dos doze antigos e matizes separados:

| Tom | Mistura | Matiz | Distância mínima dos doze (crua) | Depois de desenhado |
|---|---|---|---|---|
| 13 | âmbar + vermelho × 0,7 | 13° | 48,5 | 48,5 |
| 14 | mar claro + âmbar × 0,5 | 91° | 51,3 | 51,3 |
| 15 | mar fundo + capim × 0,6 | 129° | 51,9 | 51,9 |

A primeira tentativa trazia um **verde-sálvia** (`capim + pale × 0,6`, 51,3 cru) no lugar do tom 14. O
teste do orçamento de luz mede os tons **desenhados**, e ali ele ficava a **28,5** do tom 6 — abaixo do
piso de 30 do projeto, porque o tom 6 é claro e o orçamento o escurece na direção dele. Com o cáqui, o
par mais próximo dos quinze voltou a **32,1**, que é o par mais próximo dos doze originais: o lote não
empilhou nenhum tom.

### 5. Os marcos novos, e as duas declarações que a medida corrigiu

Medido com escala 1 (`raioDaIlha = 6`):

| Marco | Altura declarada × real | Raio declarado × real |
|---|---|---|
| `nave` | 3,8100 × 3,8100 | 1,55 → **1,02** × **1,0132** |
| `enxame` | 3,0800 × 3,0800 | 1,2300 × 1,2300 |
| `mira` | 2,98 → **3,00** × **2,9913** | 1,08 → **1,10** × **1,0942** |

As duas correções têm a mesma causa e o mesmo risco: as barras dos aros da mira são **caixas giradas**, e
são as **quinas** delas que passam do círculo — não a espessura no ponto mais alto; e as aletas da nave
são o que mais se afasta do centro, não a base. Declarar menos do que a peça ocupa é o lado perigoso: a
peça sairia do capim sem ninguém ver no código.

### 6. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro, na versão 0.19.0.

### 7. Testes automáticos — EXECUTADO

**43 arquivos, 779 testes, todos aprovados** (eram 43 e 771). Os testes novos cobram:

- **toda unidade pertence a uma trilha declarada**, e o capítulo dela está entre os da trilha;
- **a situação da trilha bate com o que existe**: trilha `'escrita'` tem unidade, trilha `'planejada'`
  não tem nenhuma — assim a lista não envelhece dizendo que uma parte está pronta quando não está;
- **toda trilha declara o que o console roda ali**, com texto de tamanho suficiente para explicar;
- **as trilhas de projeto são as três do livro**, com os capítulos em ordem, e a dos conceitos é a
  Parte I inteira (capítulos 1 a 11);
- **todo exercício da trilha do jogo tem correção automática e roda aqui**, e nenhum trecho de código da
  trilha importa Pygame sem dizer por que não roda;
- **a tela do mundo mostra a trilha de cada grupo e o aviso do console** antes da primeira ilha do grupo.

Três guardiões já existentes pegaram defeitos meus no caminho, e vale registrar quais, porque é a prova
de que eles servem para alguma coisa: o **gabarito** reprovou a unidade 13 (as cinco respostas certas em
duas posições, e a correta sendo a mais longa em três perguntas de cinco), o **teste de estilo** reprovou
três variáveis de CSS que não existem no tema, e o **teste de altura dos marcos** reprovou a mira.

### 8. Build de produção — EXECUTADO, passou

    dist/index.html                                0.63 kB │ gzip:   0.40 kB
    dist/assets/trabalhadorDoPython-BzMdATh1.js    2.60 kB
    dist/assets/index-C3PGqUsh.css                25.48 kB │ gzip:   4.12 kB
    dist/assets/index-0JUJuvGM.js                514.49 kB │ gzip: 155.39 kB
    dist/assets/Cena-BUJCg8I_.js                 924.93 kB │ gzip: 246.63 kB

    ✓ built in 601ms

### 9. Não executado

- **Nenhum pixel foi visto.** As ilhas 13 a 15, os marcos `nave`, `enxame` e `mira` e os três tons novos
  nunca foram vistos na tela: os testes provam a árvore de objetos 3D, a geometria medida e a cor
  calculada, e a verificação de imagem continua dependendo de uma captura de tela de quem tem WebGL.
- **O jogo do livro não foi jogado** — nem aqui (não há Pygame) nem em outro lugar. O que se prova é que
  a lógica roda e que a correção aprova as soluções de referência.
- **Nada foi medido em tela cheia**, em outra proporção de janela, nem com leitor de tela.

---

## Execução de 21/09/2026 — a cor que chega à tela (captura do mundo, ilhas 9 a 12)

Versão **0.18.0**. Esta execução nasceu de uma **captura de tela** enviada por quem usa o mundo, com o
pedido de corrigir o que estivesse errado. Quatro defeitos foram encontrados e consertados; a novidade
deste relatório é que a conferência de cor passou a ser feita **sobre a cor que chega à tela**, e não
sobre o token da paleta. A decisão completa está em **D-060**.

### 1. O que a conta mostrou, medida

A luz do mundo (meia-esfera de 1,35 + sol de 1,15, em `world/Ceu.tsx`) somada ao material e comprimida
pelo tone mapping ACES (o padrão do React Three Fiber) explicou os quatro defeitos:

| Superfície | Cor do token | Radiação | O que a tela mostrava |
|---|---|---|---|
| laje do mar distante (`vazio`) | `#b9ccd3` | **1,083** | `#cedfe4` — retângulo de papel branco |
| nuvem | `#f1f4f9` | 1,718 (chapada) | clara, mas com achatamento de até **10,9:1** |
| parede da biblioteca | `#cac9c4` | **1,001** | no teto do tone mapping |
| ponta do penhasco | `#201e1c` | 0,022 | `#030201` — bico preto |
| marco da ilha 6 (tom quase branco) | `#e2e5e8` | **1,463** | silhueta branca, sem volume |
| marco da ilha 6, bloqueado | `#e0e5ea` | **1,490** | idem |
| marco da ilha 3 (e bloqueado) | `#6fbdc0` | 0,96 (**1,17**) | no teto, pior bloqueado |
| marco da ilha 7 (e bloqueado) | `#a7c9d0` | **1,14** (**1,28**) | idem |
| marco da ilha 10 (e bloqueado) | `#cf9693` | 0,96 (**1,01**) | idem |
| cabeça do avatar | `#ededd8` | **1,463** | bola branca sem sombra |

### 2. Os consertos, e o número de cada um

1. **Orçamento de luz no desenho** (`corNoOrcamentoDeLuz`, `ui/theme/luzDoMundo.ts`): aplicado ao marco
   de cada ilha, às cores do avatar e à parede da biblioteca. Oito dos doze tons não mudaram nada;
   quatro entraram no orçamento. Depois: **todos os marcos ≤ 0,911** de radiação, bloqueados inclusive;
   o menor par entre os doze marcos desenhados ficou em **33,2** (era 48,9 entre os tons crus) — o par
   é o das ilhas 6 e 7, dois tons claros e frios.
2. **Mar distante** (`vazio` → `marDistante`): `misturar(mar.fundo, nevoa, 0.30)` = `#89aeb6`, desenhado
   **chapado** (`meshBasicMaterial`), como as nuvens. Antes: radiação 1,083. Depois: **0,787**, e a tela
   mostra `#bdd5dc` — **112 de distância** do céu (`#d7dadd`), contra 42 antes. O mar passou a ser mais
   escuro que o céu, que é a leitura certa de horizonte.
3. **Nuvens**: medidas de 14 a 32 de largura, 5 a 9 de altura e 12 a 26 de profundidade. Achatamento
   máximo: **4,5:1** (era 10,9:1); mínimo 2,3:1.
4. **Ponta do penhasco**: `misturar(rocha, nevoa, 0.12)` = `#4a4745`. A parede sai de `#100e0e` para
   `#4d4b48`, a ponta fica com **0,027** de radiação (piso do mundo: 0,02) e o gradiente contra o alto
   da pedra fica em **2,2×**. Com 0,28 (tentado antes e descartado por medida) o gradiente caía para
   1,11× e o penhasco virava parede cinza uniforme.
5. **Árvore**: tronco e copa em malhas separadas — tronco com `CORES_DERIVADAS.tronco`, copa com o token
   `cores.terreno.conifera`, que existia na paleta e não tinha uso.

### 3. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro, na versão 0.18.0.

### 4. Testes automáticos — EXECUTADO

**43 arquivos, 771 testes, todos aprovados** (eram 42 e 750).

O arquivo novo é `src/ui/theme/luzDoMundo.test.ts` (21 testes), e ele cobra: os números das luzes
iguais aos de `Ceu.tsx`; nenhuma superfície desenhada acima de 1,0; nenhuma superfície grande abaixo do
piso de 0,02; o mar distante mais escuro que o céu; os doze marcos (bloqueados e liberados) dentro do
orçamento e ainda distinguíveis entre si; o capim com o tom cru; as cores do avatar dentro do orçamento;
e um **guarda de texto** que varre os `.tsx` do mundo e recusa cor desenhada como material que não esteja
classificada como superfície. Os papéis das cores (superfície, fundo, luz, fonte) são conferidos por
contagem, para a classificação não envelhecer em silêncio.

Em `src/world/`: a árvore em duas partes tem teste novo (tronco de madeira, copa verde, uma parte de
cada por árvore) — e ele foi conferido **contra o defeito**: com a copa de volta na cor da madeira, o
teste falha (medido: «A Praia do Primeiro Programa» ficou sem copa de árvore).

### 5. Build de produção — EXECUTADO, passou

    dist/index.html                                0.63 kB │ gzip:   0.40 kB
    dist/assets/trabalhadorDoPython-BzMdATh1.js    2.60 kB
    dist/assets/index-gX3ovVZb.css                25.11 kB │ gzip:   4.06 kB
    dist/assets/index-D_s8EGzc.js                453.20 kB │ gzip: 138.00 kB
    dist/assets/Cena-DnANYuU5.js                 922.86 kB │ gzip: 246.04 kB

    ✓ built in 642ms

### 6. Não executado

- **Nenhum pixel foi visto por mim.** Não há navegador com WebGL neste ambiente: os quatro defeitos
  foram encontrados por olho de quem usa e medidos aqui na conta da luz; a confirmação de que o conserto
  ficou certo na tela é a próxima captura.
- **Nada foi conferido em tela cheia, nem em outra proporção de janela.** O que os testes provam é a
  árvore de objetos 3D e a cor calculada, não o enquadramento.

---

## Execução de 21/09/2026 — lote 4 da Etapa 11 (capítulos 10 e 11: arquivos e testes)

Versão **0.17.0**. Este lote tinha duas metades: duas ilhas novas de conteúdo (unidades 11 e 12) e o
maquinário do mundo que elas exigem — dois marcos e dois tons. As duas metades tiveram defeito achado
por medida, e os dois estão registrados aqui com o número que os denunciou.

### 1. O defeito de geometria, medido antes do conserto

O teste `a altura total declarada corresponde à malha` reprovou no primeiro marco novo que ele mediu.
A sonda que mediu peça por peça encontrou **três** erros no mesmo trecho, todos de sinal ou de
referência:

| Peça | Declarado | Medido | Causa |
|---|---|---|---|
| `arquivo` — puxador de gaveta | barra deitada no meio da gaveta | topo em **3,95 × escala** (a peça mais alta do móvel era a pasta, em 3,52) | `cilindro` nasce **em pé, a partir da base**: sem girar, o puxador virou uma coluna que atravessa as três gavetas |
| `balanca` — coluna do fulcro | terminava no fulcro (2,6 × escala) | terminava em **2,94 × escala** | o comprimento do cilindro foi declarado como a altura do fulcro, e não como a diferença até a base — a coluna passava 0,34 acima da travessa |
| `balanca` — `raioOcupado` | 1,95 × escala | **2,1064 × escala** | o prato da ponta da travessa é a peça que mais se afasta do centro; o valor declarado era **menor** que o real, que é o lado perigoso: o marco encostaria na borda do capim sem nenhum teste reclamar |

O peso da balança estava, ainda, no prato **errado**: o desenho conta que um prato desceu porque
recebeu o peso, e o peso estava no prato que subiu — a balança contava a história ao contrário.

Depois do conserto, medida final (em unidades de escala), com o mundo todo montado:

| Peça | x | y | raio | declarado |
|---|---|---|---|---|
| `arquivo` | -1,600 a +1,600 (a largura pedida, simétrica) | 0 a **3,520** | **1,8608** | altura 3,520 · raio 1,900 |
| `balanca` | -2,025 a +2,025 | 0 a **3,210** | **2,1064** | altura 3,220 · raio 2,110 |

A remedição do `arquivo` pegou ainda um segundo erro do mesmo puxador: o giro em z leva a barra para o
lado **negativo** de x (de -1,1 a 0), então o deslocamento de meia barra é o que a traz para o meio da
gaveta — sem ele, os três puxadores ficavam empurrados para a esquerda, saindo pela lateral do móvel.
Corrigido no mesmo passo, e a medida do intervalo de x é o que prova: a peça ocupa exatamente a largura
declarada, de -1,600 a +1,600. A correção está em **D-058**.

### 2. O defeito de conteúdo, medido no intérprete

A unidade do capítulo 11 é a primeira em que o texto depende do que o **console** sabe rodar. Antes de
escrever, cada peça foi executada no Pyodide deste projeto, com o mesmo espaço de nomes que o console
usa (`__name__` de programa principal). O que a medição mostrou:

| Trecho | Resultado medido |
|---|---|
| `unittest.TextTestRunner` com dois testes | `Ran 2 tests in 0.001s` / `OK` |
| `unittest.TextTestRunner` com um teste errado de propósito | `... FAIL`, `AssertionError: 8 != 9`, `FAILED (failures=1)` |
| `unittest.main(argv=["prog"], exit=False)` | `Ran 0 tests in 0.000s` / **`NO TESTS RAN`** — e **sem exceção**: o programa termina como se tivesse dado certo |
| `assert dobro(4) == 9, "mensagem"` | a mensagem chega à tela junto do `AssertionError` |
| `hasattr` das asserções | `assertEqual`, `assertTrue`, `assertFalse`, `assertIn`, `assertRaises` existem |
| `open()`, `json.dump/load`, `os.path.exists` no console | funcionam, com sistema de arquivos **em memória** |

Por causa da terceira linha, a unidade **não** manda usar `unittest.main()` — ela ensina o
`TextTestRunner` e explica por que, com o resultado medido escrito na tela. O notebook do lote está em
**D-059**.

### 3. Execução dos seis exercícios novos, no Pyodide de verdade

As três soluções de cada unidade foram rodadas no Pyodide (Node, mesmo pacote servido pela aplicação),
junto com as medidas que a conferência automática faz. Resultado, sem nenhuma exceção:

| Exercício | Saída medida | Medidas da conferência |
|---|---|---|
| `e11-1` (gravar e reler duas linhas) | `['Ana', 'estudando Python']` | `open(...).read().splitlines()` = `['Ana', 'estudando Python']` |
| `e11-2` (primeira linha, com arquivo ausente) | `['(vazio)']` | `'(vazio)'` com o arquivo ausente; `'primeira'` com o arquivo escrito na hora |
| `e11-3` (dicionário em `json`) | `['1.72']` | chaves `['altura', 'nome']`; tipo da altura `float` |
| `e12-1` (`dobro` com três `assert`) | `['os testes passaram']` | `8`, `0`, `-6` |
| `e12-2` (`TestCase` com dois testes) | `['... OK']` + `Ran 2 tests` | `True`, `False`; `OK` na saída |
| `e12-3` (`desconto` com valor padrão) | `['tudo conferido']` | `90.0`, `40.0`, `0.0` |

### 4. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro, na versão 0.17.0.

### 5. Testes automáticos — EXECUTADO

**42 arquivos, 750 testes, todos aprovados.**

Entre eles, os que este lote fez valer: as ilhas 11 e 12 têm marco, silhueta e tom **diferentes de
todas as outras** (comparação por par, com o menor par de tons em 48,9 de distância); os doze tipos de
marco são exatamente os doze de `MARCOS`, sem sobrar nem faltar; a altura declarada de todo marco
cabe na malha; o conteúdo novo passa pelo validador (5 perguntas em 4 posições distintas, 3 exercícios
com correção e limite, referência de página pendente); e nenhum trecho de código novo é recusado pelo
console.

Os nomes de teste que diziam "dez" viraram "cada ilha" ou o número que vem do plano, e os testes que
contavam ilhas passaram a usar `PLANO_DE_UNIDADES.length` e `CORES_DAS_ILHAS.length`: número de ilha
escrito à mão no teste é o que quebrou quando o lote 4 chegou.

### 6. Build de produção — EXECUTADO, passou

    dist/index.html                                0.63 kB │ gzip:   0.40 kB
    dist/assets/trabalhadorDoPython-BzMdATh1.js    2.60 kB
    dist/assets/index-gX3ovVZb.css                25.11 kB │ gzip:   4.06 kB
    dist/assets/index-9bE1eJG8.js                453.18 kB │ gzip: 137.99 kB
    dist/assets/Cena-BGmaUM_P.js                 920.87 kB │ gzip: 245.31 kB

    ✓ built in 668ms

### 7. Não executado neste lote

- **Nada foi visto em navegador.** Não há navegador com WebGL neste ambiente: a cena com as duas ilhas
  novas, os dois marcos novos e os dois tons novos continua **sem verificação de pixel** — depende de
  captura de tela de quem tem WebGL (itens 60 e 61 do roteiro manual).
- **`pytest` não foi executado nem recomendado**: medido como ausente no Pyodide (D-059), e instalá-lo
  exigiria baixar pacote da internet.

---

## Execução de 21/09/2026 — a ponta da pedra (captura de tela da fileira de ilhas)

### 1. O defeito, medido

A captura de longe mostrou a fileira das dez ilhas como uma fila de piões: todas com o **mesmo bico
afiado** embaixo. Medido na geometria, antes do conserto: as dez ilhas terminavam com raio de **0,02 do
raio do topo** — o mesmo espinho em todas, porque o número estava escrito dentro de `gerarRocha`.

| Ilha | Família (depois) | Largura da ponta |
|---|---|---|
| 1 | espinho | 0,43 |
| 2 | ponta rombuda | 1,48 |
| 3 | toco | 1,90 |
| 4 | espinho | 0,32 |
| 5 | ponta rombuda | 1,10 |
| 6 | toco | 1,87 |
| 7 | espinho | 0,15 |
| 8 | ponta rombuda | 1,17 |
| 9 | toco | 2,04 |
| 10 | espinho | 0,11 |

A correção está em **D-057**.

### 2. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro.

### 3. Testes automáticos — EXECUTADO

    npm test

**42 arquivos, 750 testes, todos passando** (eram 42 e 746).

| Arquivo | Testes | O que o conserto acrescentou |
|---|---|---|
| `src/world/geometria/identidade.test.ts` | 14 | Três casos novos: cada ilha tem ponta dentro da faixa, as **três famílias** aparecem entre as dez, e a diferença entre a menor e a maior passa de 0,25 (era 11) |
| `src/world/geometria/ilha.test.ts` | 28 | Dois casos novos: o raio da última faixa é o que a ilha pediu (0,02 / 0,2 / 0,35) e o padrão continua 0,02 para quem não diz nada (era 26) |
| `src/world/ConteudoDaCena.test.tsx` | 31 | Um caso novo na árvore 3D: as dez pontas medidas **não são todas o mesmo bico** — a maior menos a menor passa de 1 unidade (era 30) |

### 4. Build de produção — EXECUTADO, passou

    npm run build

| Arquivo | Tamanho | Gzip |
|---|---|---|
| `dist/assets/index-*.js` | 420,61 kB | 128,64 kB |
| `dist/assets/Cena-*.js` | 919,60 kB | 244,90 kB |
| `dist/assets/index-*.css` | 25,11 kB | 4,06 kB |
| `dist/assets/trabalhadorDoPython-*.js` | 2,60 kB | — |

### 5. O que NÃO foi executado — e não está marcado como aprovado

- **Os pixels.** A medida é geometria, não tela: neste ambiente não há GPU. Se, na tela, as pontas
  ainda parecerem parecidas, quem diz é quem olha — item **60** do roteiro manual.
- A ponta mais larga (2,04 na ilha 9) é quase **40% do raio do capim**: se na tela ela parecer um
  degrau em vez de pedra quebrada, o conserto é a faixa da família "toco", em `FAMILIAS_DE_PONTA`.

## Execução de 21/09/2026 — a ilha azul-petróleo e o farol solto no céu (capturas de tela)

### 1. Os dois defeitos, medidos

As capturas seguintes mostraram o arquipélago como uma fileira de **barbatanas escuras** (topo verde,
corpo azul-afiado) e **pontinhos escuros** no céu. Medidos com os tokens e as duas luzes do mundo
(modelo de meia-esfera mais sol direcional, por canal):

| Face | Antes (chão da luz = mar) | Depois (chão da luz = rocha clara) |
|---|---|---|
| Parede da pedra (topo) | `#646b6d` azulado | **`#6c696a`** neutro |
| Parede da pedra (meio) | `#3f4444` | **`#454442`** |
| Ponta da pedra (para baixo) | **`#081112`** | **`#12100f`** |
| Luz que chega na face de baixo | `#72b1bd` verde-azulada | **`#aba9ab`** neutra |
| Capim (topo) | `#60ac63` | `#60ac63` (não muda) |

Os pontinhos do céu **não eram as nuvens**: a varredura da árvore 3D mostrou que os objetos mais altos
da cena são os **faróis de estado** (losangos de 24 vértices), a 21,8–29,0 de altura nas ilhas 7 a 10 —
e que as nuvens, essas sim, já estavam claras e chapadas desde D-055. A correção está em **D-056**.

### 2. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro.

### 3. Testes automáticos — EXECUTADO

    npm test

**42 arquivos, 746 testes, todos passando** (eram 42 e 744).

| Arquivo | Testes | O que o conserto acrescentou |
|---|---|---|
| `src/world/ConteudoDaCena.test.tsx` | 30 | Dois casos novos: o chão da meia-luz é **neutro** (croma abaixo de 0,1) e com a luminância do mar preservada (razão entre 0,75 e 1,25); e cada ilha tem **mastro**, com a base no plano do topo e o topo entre 6 e 8 (era 28) |

### 4. Build de produção — EXECUTADO, passou

    npm run build

| Arquivo | Tamanho | Gzip |
|---|---|---|
| `dist/assets/index-*.js` | 420,34 kB | 128,54 kB |
| `dist/assets/Cena-*.js` | 919,57 kB | 244,89 kB |
| `dist/assets/index-*.css` | 25,11 kB | 4,06 kB |
| `dist/assets/trabalhadorDoPython-*.js` | 2,60 kB | — |

### 5. O que NÃO foi executado — e não está marcado como aprovado

- **Os pixels.** As cores acima são **conta** (tokens × luz, por canal), não leitura de tela: não há
  GPU neste ambiente. Se a pedra ainda parecer azulada, ou o farol ainda parecer solto, quem diz é
  quem olha — itens **58** e **59** do roteiro manual.
- **A forma do arquipélago não foi julgada**, só medida. O perfil afunilado da ilha continua o mesmo
  desde a Etapa 4.

## Execução de 21/09/2026 — a pedra fora do capim e as nuvens escuras (capturas de tela)

### 1. Os dois defeitos, medidos

A segunda e a terceira capturas de tela do mundo mostraram as ilhas como **barcos** (casco escuro
afiado, convés claro, manchas verdes) e **pontinhos escuros** espalhados no céu claro. Medidos na
árvore 3D da ilha 1, antes do conserto:

| Medida | Antes | Depois |
|---|---|---|
| Altura da ponta mais alta da pedra | **+0,72** | **0,00** |
| Raio máximo da pedra | 7,50 | 7,50 |
| Raio máximo do capim | 6,87 (**menor que a pedra**) | 7,50 |
| Cor da face de baixo da nuvem (estimada) | `#4E93A5` | `#F1F4F9` (chapada) |

Duas causas, uma em cada malha: a pedra e o capim sorteavam a própria irregularidade de forma
independente (então a pedra subia acima e aparecia por fora), e as nuvens eram desenhadas **com luz**
num mundo cuja luz tem metade da cor do mar. A correção está em **D-055**.

### 2. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro.

### 3. Testes automáticos — EXECUTADO

    npm test

**42 arquivos, 744 testes, todos passando** (eram 42 e 739).

| Arquivo | Testes | O que o conserto acrescentou |
|---|---|---|
| `src/world/geometria/ilha.test.ts` | 26 | Três casos novos: o anel do topo da pedra é plano em cinco sementes, a borda declarada bate com o raio de cada coluna, e **o capim nunca é mais estreito que a pedra, coluna a coluna** (era 23) |
| `src/world/ConteudoDaCena.test.tsx` | 28 | Dois casos novos na árvore 3D: a pedra termina no plano do topo e o capim cobre a pedra **em cada direção**, nas dez ilhas; e nenhuma nuvem recebe luz (todas com material chapado) (era 26) |

**Um teste antigo pegou a primeira tentativa.** A correção começou com o tremor do topo só
descendente. `orientacao.test.ts` reprovou: *"face virada para o eixo, em -2.41, -0.89, 4.31"* — uma
coluna descendo 0,6 ao lado de outra no zero torcia a primeira faixa da parede. O conserto definitivo
foi **tremor zero** no anel do topo.

### 4. Build de produção — EXECUTADO, passou

    npm run build

| Arquivo | Tamanho | Gzip |
|---|---|---|
| `dist/assets/index-*.js` | 420,34 kB | 128,54 kB |
| `dist/assets/Cena-*.js` | 919,40 kB | 244,84 kB |
| `dist/assets/index-*.css` | 25,11 kB | 4,06 kB |
| `dist/assets/trabalhadorDoPython-*.js` | 2,60 kB | — |

### 5. O que NÃO foi executado — e não está marcado como aprovado

- **Os pixels.** Sem navegador com WebGL aqui, o que se prova é a geometria (medida coluna a coluna) e
  a árvore 3D (material das nuvens). Se o **topo** das ilhas ainda mostrar pedra, ou se as nuvens
  ficarem claras demais, quem diz é quem olha: itens **56** e **57** do roteiro manual.
- **A forma geral da ilha não foi julgada**, só medida: o perfil afunilado para baixo (o "casco") é
  intencional desde a Etapa 4 e não foi tocado.

## Execução de 21/09/2026 — a cor do mundo (defeito visto em captura de tela)

### 1. O defeito, medido

A primeira captura de tela do mundo, enviada por quem usa, mostrou as ilhas como **silhuetas quase
negras** — paredes em `#1a1714`, pontas em `#0e0c0a` — com o céu claro ao fundo. Estava assim desde a
Etapa 4, e nenhum teste percebia: a suíte nunca olhou cor. Duas causas somadas (cor por cor na malha
pintada, e cor por vértice gravada em sRGB que o Three.js lê como linear) mais uma terceira, da
correção anterior (tom da ilha a 45% no capim, que deixava o capim rosado na ilha de tom quente). A
correção está em **D-054**.

### 2. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro. A mudança de `Malha3D` para tipo de união (`cor` só para malha **sem** cor por vértice)
apontou os dois lugares exatos do defeito antes de qualquer teste rodar.

### 3. Testes automáticos — EXECUTADO

    npm test

**42 arquivos, 739 testes, todos passando** (eram 42 e 733).

| Arquivo | Testes | O que a correção acrescentou |
|---|---|---|
| `src/world/geometria/pintura.test.ts` | 20 | Três casos novos: os valores publicados da conversão sRGB → linear (0,5 → 0,2140; 0,2 → 0,0331), a monotonia da função, e a prova de que a pintura grava a cor convertida (era 17) |
| `src/world/ConteudoDaCena.test.tsx` | 26 | Quatro casos novos na árvore 3D: malha pintada **sem tinta** no material (as 20 malhas das dez ilhas), todos os canais abaixo de 0,8 (a faixa que só existe em sRGB), **o capim é verde nas dez ilhas**, e a pedra da ilha bloqueada continua mais clara e menos saturada que a da liberada (era 22) |
| `src/ui/theme/paleta3d.test.ts` | 12 | O caminho antigo (`corDaRocha`, `corDoCapim`, e as duas cores de terreno bloqueado pré-calculadas) saiu; entrou `corDeUnidadeBloqueada`, com a prova de que ela clareia a cor e não a substitui (era 13) |

### 4. O que muda na tela, medido

Estimativa a partir dos tokens e das duas luzes do mundo (hemisférica 1,35 e direcional 1,15). **É
conta, não pixel:** não há GPU neste ambiente.

| Ponto | Antes | Depois |
|---|---|---|
| Parede da pedra | `#1a1714` | `#44413d` |
| Topo da pedra | `#332e2a` | `#948e89` |
| Ponta da pedra | `#0e0c0a` | `#1d1b19` |
| Alto do capim (tom verde) | `#397728` | `#66b261` |
| Alto do capim (tom quente) | `#477c2c` | `#9cc073` |
| Alto do capim (tom turquesa) | `#407f2f` | `#81cc80` |

### 5. Build de produção — EXECUTADO, passou

    npm run build

| Arquivo | Tamanho | Gzip |
|---|---|---|
| `dist/assets/index-*.js` | 420,23 kB | 128,50 kB |
| `dist/assets/Cena-*.js` | 919,25 kB | 244,79 kB |
| `dist/assets/index-*.css` | 25,11 kB | 4,06 kB |
| `dist/assets/trabalhadorDoPython-*.js` | 2,60 kB | — |

### 6. O que NÃO foi executado — e não está marcado como aprovado

- **Os pixels continuam sem verificação automática.** A correção foi medida em conta e provada em
  teste; **a confirmação de que o mundo ficou bom é de quem olha** — item 55 do roteiro manual.
- **As intensidades das luzes não foram tocadas.** Elas vieram da Etapa 4, escolhidas às cegas. Se o
  mundo parecer claro demais depois desta correção, o conserto é o par de números em `Ceu.tsx`, e a
  decisão é de quem vê.

## Execução de 21/09/2026 — identidade visual das ilhas (defeito relatado por quem usa)

### 1. O defeito, e por que a suíte não o via

Relato de quem abriu a aplicação no navegador: **"as ilhas estão todas iguais"**. Era verdade. As dez
ilhas usavam o mesmo raio, a mesma altura, as mesmas estruturas e a mesma cor; a semente só tremia a
pedra um pouco. A suíte aprovava porque cobrava **uma ilha por unidade**, com as estruturas certas e
as pontes certas — e nunca perguntou se duas ilhas eram diferentes. Defeito invisível para o teste,
óbvio para o olho. A correção está registrada em **D-053**.

### 2. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro, com `geometria/identidade.ts`, `geometria/marcos.ts` e os testes novos.

### 3. Testes automáticos — EXECUTADO

    npm test

**42 arquivos, 733 testes, todos passando** (eram 40 arquivos e 702 testes no lote 3).

| Arquivo | Testes | O que o conserto acrescentou |
|---|---|---|
| `src/world/geometria/identidade.test.ts` | 11 | **Novo.** As dez ilhas têm dez marcos, dez silhuetas e dez tons diferentes; a identidade é determinística; tudo cabe nas faixas; o marco cabe no capim |
| `src/world/geometria/marcos.test.ts` | 14 | **Novo.** Os dez marcos existem, são diferentes entre si, o volume assinado é positivo (face virada para dentro é o defeito que o descarte de face traseira esconde), girar não inverte faces, e cada marco gira no eixo certo |
| `src/world/ConteudoDaCena.test.tsx` | 22 | Dois casos novos na árvore 3D: dez marcos distintos entre as dez ilhas e **profundidades de pedra distintas** — a prova de que não é a mesma ilha repetida (eram 20) |
| `src/ui/theme/paleta3d.test.ts` | 13 | Os dez tons: todos diferentes, nenhum par a menos de 40 de distância em RGB, e três misturas refeitas a partir dos tokens (eram 9) |
| `src/world/mapaDoMundo.test.ts` | 16 | O vão entre bordas agora é constante com raios diferentes, e o avanço em x é `raio + raio + vão` (era `índice × distância`) |
| `src/world/mapaCaminhavel.test.ts` | 15 | A inclinação do capim é a **daquela** ilha, e não uma constante do projeto |

### 4. Build de produção — EXECUTADO, passou

    npm run build

| Arquivo | Tamanho | Gzip | Antes do conserto |
|---|---|---|---|
| `dist/index.html` | 0,63 kB | 0,40 kB | igual |
| `dist/assets/index-*.js` | 420,23 kB | 128,50 kB | 417,14 kB |
| `dist/assets/index-*.css` | 25,11 kB | 4,06 kB | igual |
| `dist/assets/Cena-*.js` | 919,08 kB | 244,72 kB | 912,10 kB |
| `dist/assets/trabalhadorDoPython-*.js` | 2,60 kB | — | igual |

Os marcos e a identidade custaram 6,98 kB no pedaço da cena e 3,09 kB no principal.

### 5. O que NÃO foi executado — e não está marcado como aprovado

- **A aparência continua sem verificação automática.** Não há navegador com WebGL neste ambiente. O
  que se prova aqui é a geometria (medição) e a árvore 3D (composição) — **não** os pixels. Este
  defeito foi encontrado por quem usa, e a conferência visual da correção também é de quem usa:
  roteiro manual, **item 55**.
- **O enquadramento dos marcos grandes** (`mercado`, `estação`, `engrenagens`, `farol`) é próximo da
  borda do capim: o teste garante 2% de folga sobre o raio, mas se na tela algum deles parecer
  apertado, o conserto é o número em `LUGARES_NA_ILHA` (ver D-053).

## Execução de 21/09/2026 — Etapa 11, lote 3 (capítulos 8 e 9: ilhas 9 e 10)

### 1. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro, com as duas unidades novas (`u09OficinaDasFuncoes`, `u10TorreDasClasses`), dez unidades no
plano e no registro, e os títulos dos capítulos 8 e 9 marcados como não conferidos (D-050).

### 2. Testes automáticos — EXECUTADO

    npm test

**40 arquivos, 702 testes, todos passando.** Os dois testes a mais vieram da mudança feita **antes** do
conteúdo: a sonda da conferência ganhou `try` por medida (D-052), e o módulo puro passou a provar que
uma medida que falha vira item declarado sem derrubar as outras. De novo, o conteúdo novo em si não
exigiu teste novo — os testes percorrem o conteúdo real.

| Arquivo | Testes | O que o lote 3 mudou aqui |
|---|---|---|
| `src/learning/correcaoDeExercicio.test.ts` | 27 | Dois casos novos: cada medida no seu `try`; uma medida que falha (`NameError`) e a medida seguinte conferida normalmente (era 25) |
| `src/python/pyodideDeVerdade.test.ts` | 18 | Roda no Pyodide real **73 trechos** que o conteúdo promete que rodam (eram 54) e os **13 marcados** (mesmo número do lote 2) — e o caso da sonda que não existe passou a exigir que o programa **não** termine com erro |
| `src/content/conteudo.test.ts` | 42 | Percorre **dez** unidades: forma, correção com `limite`, gabarito em quatro posições por unidade, diagramas e nenhum trecho do livro |
| `src/content/percursoDoConteudo.test.ts` | 6 | A conta de exercícios saiu do conteúdo: **30 exercícios** (eram 24), todos aceitos pelo domínio |
| `src/content/planoDeUnidades.test.ts` | 16 | Compara `situacao` com o conteúdo nas duas direções para as dez unidades (D-048) |
| `src/app/paginas/Mundo.interacao.test.tsx` | 24 | O HUD virou `0 de 10 ilhas aprovadas`, derivado do plano; o percurso de ponta a ponta aprova **dez** ilhas em sequência |
| `src/world/*.test.ts*` | — | Uma ilha por unidade planejada e uma ponte por par vizinho continuam valendo para as dez, sem alteração no teste |

Números do conteúdo, medidos pelo teste que roda Python de verdade: **10 unidades**, **56 blocos de
código** de Python na explicação, **30 exercícios** (28 com correção), **73 trechos que rodam** e
**13 trechos marcados** como "não roda neste console".

### 3. O que a mudança na conferência consertou (D-052)

O lote começou pela sonda, e não pelo conteúdo, por um motivo concreto: o capítulo 8 usa **chamadas**
nas expressões medidas (`saudacao("Ana")`). Se o nome da função da pessoa estivesse diferente, o
programa da sonda terminava com `NameError` no meio e a conferência inteira virava "não deu para
conferir" — com um traceback de Python apontando para uma linha que ninguém escreveu. Agora cada medida
roda no próprio `try`, e a que falha vira um item com frase curta em português ("o programa não tem
esse nome quando termina (NameError)"), enquanto as outras continuam sendo conferidas. O teste que roda
soluções no interpretador real foi endurecido para exigir isso.

Um detalhe do guarda de acentuação apareceu aqui: `qa/acentuacao.test.ts` lê strings com espaço como
frases humanas, e um nome de classe CSS de dois tokens foi lido como se fosse texto — o guarda achou
ali uma palavra sem acento. A saída foi usar nome de classe de **um token só**
(`exercicio__aviso-do-console`, `explicacao__aviso-do-console`), sem afrouxar o guarda.

### 4. Build de produção — EXECUTADO, passou

    npm run build

| Arquivo | Tamanho | Gzip |
|---|---|---|
| `dist/index.html` | 0,63 kB | 0,40 kB |
| `dist/assets/index-*.js` | 417,14 kB | 127,39 kB |
| `dist/assets/index-*.css` | 25,11 kB | 4,06 kB |
| `dist/assets/Cena-*.js` | 912,10 kB | 242,34 kB |
| `dist/assets/trabalhadorDoPython-*.js` | 2,60 kB | — |

O pedaço principal cresceu 32,92 kB com as duas unidades (384,22 → 417,14), e o pedaço da cena 3D
continuou **sem mudar um byte** pelo terceiro lote seguido.

### 5. O que NÃO foi executado — e não está marcado como aprovado

- **Nenhum navegador.** As ilhas 9 e 10 nunca foram vistas por ninguém: prova-se o mundo montado em
  teste (dez ilhas, uma ponte por par vizinho), o conteúdo e a conferência — não a aparência.
- **O `input()` de verdade** segue sem rodar por aqui: o console recusa, e o teste de verdade confere a
  **recusa** e a versão adaptada (D-051).
- **A travessia a pé até as ilhas 9 e 10**: geometria e mapa caminhável passam em teste; a caminhada de
  verdade é roteiro manual (item 54, agora cobrindo todas as ilhas escritas depois da quarta).

## Execução de 21/09/2026 — Etapa 11, lote 2 (capítulos 6 e 7: ilhas 7 e 8)

### 1. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro, com as duas unidades novas (`u07FarolDosRegistros`, `u08EstacaoDasPerguntas`), oito unidades
no plano e no registro, e o título do capítulo marcado como não conferido (D-050).

### 2. Testes automáticos — EXECUTADO

    npm test

**40 arquivos, 700 testes, todos passando.** O número de testes **não cresceu** com o lote — e isso é
resultado do lote 1: os testes percorrem o conteúdo real, então cada unidade nova é verificada sem
teste novo.

| Arquivo | Testes | O que o lote 2 mudou aqui |
|---|---|---|
| `src/python/pyodideDeVerdade.test.ts` | 18 | Roda no Pyodide real **54 trechos** que o conteúdo promete que rodam (eram 40) e os **13 marcados** (eram 8) — os três com `input()` entram pela recusa do console, e o do `ValueError` pelo erro do próprio Python |
| `src/content/conteudo.test.ts` | 42 | Percorre **oito** unidades: forma, correção com `limite`, gabarito em quatro posições por unidade, diagramas e nenhum trecho do livro |
| `src/content/percursoDoConteudo.test.ts` | 6 | A conta de exercícios saiu do conteúdo: **24 exercícios** (eram 18), todos aceitos pelo domínio |
| `src/content/planoDeUnidades.test.ts` | 16 | Compara `situacao` com o conteúdo nas duas direções para as oito unidades (D-048) |
| `src/app/paginas/Mundo.interacao.test.tsx` | 24 | O HUD virou `0 de 8 ilhas aprovadas`, derivado do plano; o percurso de ponta a ponta aprova **oito** ilhas em sequência |
| `src/world/*.test.ts*` | — | Uma ilha por unidade planejada e uma ponte por par vizinho continuam valendo para as oito, sem alteração no teste |

Números do conteúdo, medidos pelo teste que roda Python de verdade: **8 unidades**, **43 blocos de
código** de Python na explicação, **24 exercícios** (22 com correção), **54 trechos que rodam** e
**13 trechos marcados** como "não roda neste console".

### 3. O defeito que o teste achou — e que era do conteúdo

O exercício `e7-3` pedia as chaves do dicionário em ordem alfabética em uma linha (`print(sorted(...))`).
A conferência procura os textos esperados **um por linha, na ordem** — e a terceira chave estava na
mesma linha da segunda, então a resposta certa foi reprovada. Quem decidiu foi o teste que roda a
solução de referência no interpretador real, com a mesma conferência da tela.

O conserto foi no **conteúdo**, não na conferência: o exercício passou a pedir uma chave por linha, com
um `for`. Afrouxar a conferência para aceitar duas chaves na mesma linha também resolveria o exercício
— e enfraqueceria a conferência inteira para acomodar um enunciado.

### 4. Build de produção — EXECUTADO, passou

    npm run build

| Arquivo | Tamanho | Gzip |
|---|---|---|
| `dist/index.html` | 0,63 kB | 0,40 kB |
| `dist/assets/index-*.js` | 384,22 kB | 118,33 kB |
| `dist/assets/index-*.css` | 25,11 kB | 4,06 kB |
| `dist/assets/Cena-*.js` | 912,10 kB | 242,34 kB |
| `dist/assets/trabalhadorDoPython-*.js` | 2,60 kB | — |

O pedaço principal cresceu 30,50 kB com as duas unidades (353,72 → 384,22), e o pedaço da cena 3D
continuou **sem mudar um byte** pelo segundo lote seguido.

### 5. O que NÃO foi executado — e não está marcado como aprovado

- **Nenhum navegador.** As ilhas 7 e 8 nunca foram vistas por ninguém: prova-se o mundo montado em
  teste (oito ilhas, uma ponte por par vizinho), o conteúdo e a conferência — não a aparência.
- **O `input()` de verdade** não roda em lugar nenhum daqui: o console recusa, e o teste de verdade
  confere a **recusa** e a versão adaptada. Ler o teclado continua sendo coisa do computador de quem
  estuda (D-051).
- **A travessia a pé até as ilhas 7 e 8**: geometria e mapa caminhável passam em teste; a caminhada de
  verdade é roteiro manual (item 54, agora cobrindo todas as ilhas escritas depois da quarta).

## Execução de 21/09/2026 — Etapa 11, lote 1 (capítulos 4 e 5: ilhas 5 e 6)

### 1. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro, com as duas unidades novas (`u05MoinhoDasRepeticoes`, `u06EncruzilhadaDasDecisoes`), o
registro em `CONTEUDO_DAS_UNIDADES`, o plano com seis unidades e o teste de verdade com contagem
derivada do conteúdo.

### 2. Testes automáticos — EXECUTADO

    npm test

**40 arquivos, 700 testes, todos passando.** O que a expansão mudou, e o que ela cobra sem precisar
de teste novo:

| Arquivo | Testes | O que a expansão mudou aqui |
|---|---|---|
| `src/content/conteudo.test.ts` | 42 | Passou a percorrer **seis** unidades: forma do conteúdo, correção com `limite`, motivos escritos, gabarito distribuído pelas quatro posições **unidade por unidade**, diagramas com rótulos únicos e nenhum trecho do livro |
| `src/content/planoDeUnidades.test.ts` | 16 | Dois testes novos, e o antigo trocado: "não promete conteúdo que não existe" (unidade sem conteúdo não pode estar `pronta`) e "não deixa unidade com conteúdo escrito marcada como planejada" — os dois contra o conteúdo real (D-048) |
| `src/content/percursoDoConteudo.test.ts` | 6 | A conta de exercícios saiu do conteúdo: **18 exercícios** (era 12) e o teste exige que o domínio aceite **todos** eles; a contagem fixa `12` virou o total do próprio conteúdo |
| `src/python/pyodideDeVerdade.test.ts` | 18 | Roda no Pyodide real **40 trechos** que o conteúdo promete que rodam (eram 23) e os **8 marcados** (eram 6), com as contagens saindo do conteúdo: se um trecho novo não rodar, o teste acusa |
| `src/app/paginas/Mundo.interacao.test.tsx` | 24 | A contagem do HUD virou `0 de 6 ilhas aprovadas`, derivada de `PLANO_DE_UNIDADES.length`; o percurso de ponta a ponta aprova **seis** ilhas em sequência, com recarga no meio |
| `src/content/*` (validador) | — | Recusa identificador de exercício repetido entre unidades — é o que garante que `e5-*` e `e6-*` não colidem com nada |

Números do conteúdo, medidos pelo teste que roda Python de verdade: **6 unidades**, **30 blocos de
código** na explicação, **18 exercícios** (16 com correção), **40 trechos que rodam** e **8 trechos
marcados** como "não roda neste console".

### 3. Build de produção — EXECUTADO, passou

    npm run build

| Arquivo | Tamanho | Gzip |
|---|---|---|
| `dist/assets/index-*.js` | 353,72 kB | 110,13 kB |
| `dist/assets/Cena-*.js` | 912,10 kB | 242,34 kB |
| `dist/assets/index-*.css` | 25,11 kB | 4,06 kB |
| `dist/assets/trabalhadorDoPython-*.js` | 2,60 kB | — |

O pedaço principal cresceu **27,61 kB** (326,11 → 353,72): o conteúdo novo é dado que entra no
JavaScript. O pedaço da cena 3D **não mudou um byte** — as ilhas 5 e 6 nasceram da conta que já
existia (D-049), e nenhum código de mundo foi escrito para elas.

### 4. O que NÃO foi executado — e não está marcado como aprovado

- **Nenhum navegador.** As ilhas 5 e 6 nunca foram vistas por ninguém: o que se prova aqui é o mundo
  montado em teste (seis ilhas, uma ponte por par vizinho), o conteúdo e a correção — não a aparência.
- **A travessia a pé até as ilhas novas** com o avatar: geometria e mapa caminhável passam em teste,
  mas a caminhada de verdade é roteiro manual (item 54).

### 5. Roteiro manual das ilhas novas (item 54)

54. **As ilhas escritas depois da quarta existem, com as pontes certas**: abrir o mundo e contar as
    ilhas suspensas — devem ser **dez**, na mesma curva em S, com uma ponte entre cada par vizinho
    (9 pontes). Com a quinta ilha ainda não aprovada, a ponte 4–5 deve aparecer pela metade, como as
    outras fechadas. Aprovar a ilha 4 (responder as perguntas, 4 de 5) e conferir que a ponte 4–5 fica
    inteira e que a travessia a pé, com `W`, leva o avatar até a ilha 5; entrar nela e conferir missão,
    leitura (capítulo 4), explicação, os 3 exercícios e as 5 perguntas. Repetir ilha por ilha até a 10
    (capítulos 5, 6, 7, 8 e 9). Os itens 51 a 53 valem para os exercícios novos — inclusive o do
    capítulo 5, em que a conferência exige um valor **booleano** (`True`); o da tabuada, em que ela exige
    o número inteiro 7 no lugar do que o `input()` teria devolvido; e os do capítulo 8 e do capítulo 9,
    em que ela chama a **função** e o **método** escritos por quem estuda — e mostra a frase "o programa
    não tem esse nome quando termina" quando o nome combinado no enunciado não existe (D-052).

55. **As ilhas não são todas iguais**: entrar no mundo e olhar o arquipélago de longe. Cada ilha deve
    ter **forma própria** (raio entre ~5,2 e ~6,9; altura da pedra entre ~7,7 e ~10,9; algumas de 10
    lados, outras de 18), **marco próprio** e **tom próprio** — portal na primeira, bancada na
    segunda, estante na terceira, barracas na quarta, moinho na quinta, placas na sexta, farol na
    sétima, estação na oitava, engrenagens na nona e torre na décima. Conferir também que as partes
    animadas giram: pás do moinho, feixe do farol, cata-vento, volante da bancada, ponteiro da
    estação, bandeira da torre e o par de engrenagens em sentidos opostos. Nenhuma ilha deve parecer
    a mesma ilha com outro nome. Se alguma parecer, registrar aqui qual e em que ponto.

56. **O topo de cada ilha é capim, não pedra**: olhar o arquipélago de longe e depois de perto. O topo
    das dez ilhas tem de ser **verde**, com a pedra aparecendo só nas paredes de baixo. Não pode haver
    mancha cinza ou bege no meio do verde (eram os bicos da pedra atravessando o capim) nem moldura
    cinza em volta do capim (era a pedra mais larga que o capim).
57. **As nuvens são claras**: os pontinhos no céu devem ser da cor do céu, quase brancos. Nenhum deles
    pode parecer cascalho ou entulho escuro flutuando (era a face de baixo de cada nuvem, iluminada
    pela cor do mar).

58. **A pedra das ilhas é cinza, não azul.** Olhar uma ilha de lado, com o céu atrás: a parede tem de
    ser cinza claro em cima e cinza escuro embaixo, do mesmo cinza quente da paleta. Nenhuma parede
    pode parecer azul-petróleo, verde-azulada ou "barbatana". O capim do topo continua verde.
59. **O farol de estado fica no alto de um mastro.** Em cada ilha deve haver um losango no alto de um
    poste fino, saindo do capim — e não um losango solto no céu. Conferir também que o losango gira
    devagar e que a cor diz o estado: âmbar na ilha disponível, cinza nas bloqueadas.

60. **As ilhas não terminam todas no mesmo bico.** Olhar o arquipélago de longe, de lado: embaixo de
    cada ilha a pedra termina de um jeito — algumas em espinho fino, outras em ponta rombuda e outras
    em toco de pedra largo. Duas ilhas não podem terminar exatamente iguais. Se todas parecerem um
    bico afiado, registrar aqui.

Resultado esperado, somando as etapas 5 a 11: **60 de 60 itens conferidos**. Qualquer item que falhe
deve ser registrado aqui.

## Execução de 21/09/2026 — Etapa 10 (exercícios com correção automática)

### 1. Checagem de tipos — EXECUTADO, passou

    npx tsc --noEmit

Sem erro, com os tipos novos da correção (`TipoDeValor`, `ValorEsperado`, `EstruturaEsperada`,
`CorrecaoDoExercicio`), o módulo puro da conferência, a ação `marcarExercicio`, o formato 3 do
progresso e o percurso montado a partir do conteúdo.

### 2. Testes automáticos — EXECUTADO

    npm test

**40 arquivos, 699 testes, todos passando.** Os que interessam a esta etapa:

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

Resultado esperado, somando as etapas 5 a 10: **53 de 53 itens conferidos**.
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
