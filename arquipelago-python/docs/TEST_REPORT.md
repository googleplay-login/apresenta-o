# RELATÓRIO DE TESTES

Regra deste documento: dizer **o que foi realmente executado**, em que ambiente e com que
resultado. Teste não executado aparece como **não executado**, e não como aprovado por leitura de
código.

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

Resultado esperado: 15 de 15 conferidos. Qualquer item que falhe deve ser registrado aqui.

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
