# RELATORIO DE TESTES

Regra deste documento: dizer **o que foi realmente executado**, em que ambiente e
com que resultado. Teste nao executado aparece como **nao executado**, e nao como
aprovado por leitura de codigo.

---

## Execucao de 21/09/2026 - Etapa 1.1

### Ambiente

| Item | Valor |
|---|---|
| Sistema | Linux, sandbox de desenvolvimento |
| Node | 22.22.3 |
| npm | 10.9.8 |
| Vite | 8.3.0 |
| TypeScript | 7.0.2 |
| Vitest | 5.0.1 |
| React | 19.3.0 |
| Navegador disponivel no ambiente | **nenhum** (Chromium e Playwright ausentes) |

### 1. Checagem de tipos - EXECUTADO

    npm run typecheck        # tsc --noEmit

**Resultado: passou, sem erro.**

Durante o desenvolvimento, uma falha real foi encontrada e corrigida:

    src/app/App.tsx(8,8): error TS2882: Cannot find module or type declarations
    for side-effect import of './app.css'.

Causa: o `tsconfig.json` usa `"types": []` de proposito, o que impede a inclusao
automatica dos tipos do Vite - e era justamente desses tipos que vinha a declaracao
do import de CSS. Correcao: `src/vite-env.d.ts` com referencia explicita a
`vite/client`. Nao foi o `types: []` que estava errado, era a referencia que faltava.

### 2. Testes automaticos - EXECUTADO

    npm test                 # vitest run

**Resultado: 47 testes, 3 arquivos, todos aprovados. Duracao 604 ms.**

| Arquivo | Testes | Resultado |
|---|---|---|
| `src/ui/theme/contraste.test.ts` | 24 | aprovado |
| `src/content/planoDeUnidades.test.ts` | 14 | aprovado |
| `src/app/App.test.tsx` | 9 | aprovado |

O que eles verificam, de fato:

**Contraste do tema:**
- extremos da escala WCAG: preto sobre branco = 21:1, cor sobre ela mesma = 1:1;
- o cinza de referencia `#767676` sobre branco = 4.54:1 (valor classico da WCAG);
- simetria: a ordem dos argumentos nao muda a razao;
- luminancia relativa dos extremos (0 e 1);
- normalizacao de cor e recusa de formato invalido (lanca erro em vez de devolver
  valor errado);
- limiares em `atendeAA`, incluindo que ambar sobre branco reprova ate em texto
  grande;
- **todos os 13 pares texto/fundo declarados pela interface**;
- a regressao mais provavel: texto branco sobre o ambar (`#C9A063`) da 2.4:1 e
  **nao** passa - o teste garante que o chip ambar continue com texto escuro;
- as variaveis CSS geradas contem as cores declaradas e nao tem nome duplicado.

**Plano de unidades e referencia de livro:**
- pelo menos uma unidade, sem identificador repetido, com ordem contigua a partir de 1;
- titulo e tema nao vazios;
- **nenhuma unidade declara pagina enquanto o PDF nao estiver mapeado** (D-010) -
  este e o teste que impede alguem de preencher um numero de pagina nao verificado;
- referencia coerente: `'confirmada'` exige as duas paginas; `'referencia-pendente'`
  exige as duas nulas;
- recusa `'confirmada'` com apenas uma das paginas - porque pagina impressa e pagina
  de PDF sao coisas diferentes e o deslocamento entre elas nao pode ser presumido;
- a descricao exibida contem "referencia pendente" em vez de numero inventado;
- nenhuma unidade esta marcada como pronta.

**Renderizacao da pagina inicial** (`react-dom/server`, sem navegador e sem
dependencia nova):
- a arvore de componentes monta e gera HTML, sem lancar erro;
- **nao existe um unico `<button>`, `<a>`, `onclick` ou `href` no HTML gerado** -
  e o teste que sustenta a decisao D-009;
- o nome do projeto e a etapa atual aparecem;
- as quatro unidades planejadas aparecem, com titulo e tema;
- "referencia pendente" aparece pelo menos uma vez por unidade, e a pagina **nao**
  contem nenhum padrao "pagina \<numero\>";
- a pagina declara que o mundo 3D nao existe, que o Pyodide nao existe e que o livro
  nao esta no repositorio.

**Nao provado por este teste:** aparencia, layout, contraste na tela, navegacao por
teclado e comportamento no navegador. Um render estatico nao e um navegador.

### 3. Build de producao - EXECUTADO

    npm run build            # tsc --noEmit && vite build

**Resultado: passou.**

    dist/index.html                0.63 kB | gzip:  0.39 kB
    dist/assets/index-*.css        5.06 kB | gzip:  1.30 kB
    dist/assets/index-*.js       231.51 kB | gzip: 72.87 kB
    23 modulos transformados, 157 ms

Os 231 kB de JavaScript sao o proprio React. Three.js **nao** esta instalado nem
incluido nesta etapa.

### 4. Servidor de desenvolvimento e host do preview - EXECUTADO

    npm run dev

Subiu em 193 ms, escutando em `0.0.0.0:5173` (confirmado: a porta 5173 aparece
ligada ao endereco `0.0.0.0`, e nao a `127.0.0.1`).

Verificacao por requisicao HTTP, com resultados reais:

| Requisicao | Resultado |
|---|---|
| `Host: localhost` | **200**, 988 bytes |
| `Host: 5173-abc123.e2b.app` (dominio do preview) | **200**, 988 bytes |
| `Host: evil.example.com` (host nao autorizado) | **403** - bloqueado pelo Vite |

O terceiro caso e o que prova que `allowedHosts: ['.e2b.app']` esta funcionando como
restricao, e nao como permissao ampla: eu **nao** usei `allowedHosts: true`.

O HTML servido contem `lang="pt-BR"`, o titulo "Arquipelago Python" e a cor de fundo
de pre-pintura, na ordem correta.

### 5. Arquitetura de tokens no build de producao - EXECUTADO

Verificacao de que a fonte unica de cores sobrevive ao empacotamento:

| Verificacao | Resultado |
|---|---|
| Cores dos tokens presentes em `dist/assets/*.js` | **7 de 7** conferidas (`#0f5a4a`, `#c9a063`, `#f6f3eb`, `#5c5852`, `#121212`, `#5fb3b8`, `#c7d2e8`) |
| Cores literais em `src/app/app.css` | **nenhuma** - o CSS so usa `var(--...)` |
| Variaveis CSS efetivamente usadas no CSS de producao | **39** usos de `var(--...)` |

As cores aparecem no JavaScript porque sao injetadas como estilo embutido no
elemento raiz, e o CSS resolve `var(--...)` pela heranca de propriedades CSS. E o
desenho previsto em D-005, confirmado na pratica.

---

## NAO executado nesta etapa

| Verificacao | Motivo | Como sera feita |
|---|---|---|
| Teste em navegador automatizado (Playwright) | Nenhum navegador instalado no ambiente; Playwright exigiria download de centenas de MB, e isso nao foi autorizado | Etapa 13, ou quando autorizado. Enquanto isso, o roteiro manual abaixo |
| Teste de **interacao** no navegador (clique, teclado, foco) | Nao ha interacao nesta etapa e nao ha navegador | Etapa 3, quando o primeiro controle existir |
| Teste de aparencia e contraste **na tela** | Nao ha navegador. O contraste calculado dos tokens foi testado; a renderizacao pelos pixels, nao | Etapa 13 |
| Teste de componente com DOM (`jsdom`) | Nao instalado (D-008). O render estatico cobre "monta sem erro", nao cobre evento | Etapa 2, junto com o primeiro estado |
| Teste de cena 3D | Nao existe cena | Etapa 3 |
| Teste de persistencia | Nao existe persistencia | Etapa 8 |
| Teste de WebGL indisponivel | Nao existe 3D | Etapa 3 |
| Acessibilidade com leitor de tela real | Exige navegador | Etapa 13 |
| Extracao de paleta das imagens de referencia | Arquivos nao chegaram ao disco | Quando os arquivos existirem |
| Compatibilidade com `background-attachment: fixed` no Safari de iOS | Exige dispositivo. Em alguns navegadores moveis essa propriedade e ignorada, e o horizonte desce junto com a rolagem | Verificacao manual em dispositivo, ou troca por `position: fixed` na etapa de polimento |

**Nada da tabela acima esta marcado como aprovado.** Nao foram executados.

---

## Roteiro manual de verificacao visual

Enquanto nao houver navegador automatizado, esta verificacao e manual e deve ser
registrada por quem a fizer, sem presumir resultado.

1. `npm install` e `npm run dev`.
2. Abrir a pagina. Conferir que o fundo tem ceu claro em cima e mar turquesa
   embaixo, com o horizonte marcado.
3. Conferir que **nao existe nenhum botao clicavel** na pagina (D-009).
4. Ler o cartao "O que ainda nao existe" e conferir que cada item e verdade hoje.
5. Conferir que as quatro unidades aparecem com "pagina: referencia pendente" e
   **nenhum numero de pagina**.
6. Reduzir a janela ate a largura de celular. Conferir que a tabela rola na
   horizontal em vez de quebrar o layout.
7. Aumentar o zoom do navegador para 200%. Conferir que o texto continua legivel e
   que nada e cortado.
8. Navegar apenas com `Tab`. Conferir que existe indicador de foco visivel em tudo
   que for focavel - hoje, apenas o conteudo textual.

Resultado esperado: 8 de 8 conferidos. Qualquer item que falhe deve ser registrado
aqui com a descricao do que aconteceu.
