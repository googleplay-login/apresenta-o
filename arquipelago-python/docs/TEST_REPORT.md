# RELATÓRIO DE TESTES

Regra deste documento: dizer **o que foi realmente executado**, em que ambiente e com que
resultado. Teste não executado aparece como **não executado**, e não como aprovado por leitura de
código.

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

Resultado esperado: 19 de 19 conferidos. Qualquer item que falhe deve ser registrado aqui.

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
