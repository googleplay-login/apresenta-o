# RELATÓRIO DE TESTES

Regra deste documento: dizer **o que foi realmente executado**, em que ambiente e com que
resultado. Teste não executado aparece como **não executado**, e não como aprovado por leitura de
código.

---

## Execução de 21/09/2026 — Etapas 1.1, 1.2 e 2

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
| Navegador disponível no ambiente | **nenhum** (Chromium e Playwright ausentes) |

### 1. Checagem de tipos — EXECUTADO

    npm run typecheck        # tsc --noEmit

**Resultado: passou, sem erro.**

Falhas reais encontradas e corrigidas durante o desenvolvimento, todas por `tsc`:

| Erro | Causa | Correção |
|---|---|---|
| `TS2882: Cannot find module or type declarations for side-effect import of './app.css'` | `tsconfig.json` usa `"types": []` de propósito, o que exclui os tipos do Vite — e era deles que vinha a declaração do import de CSS | `src/vite-env.d.ts` com referência explícita a `vite/client` |
| `TS6133: 'cores' is declared but its value is never read` | A leitura dos tokens saiu do componente para `src/ui/theme/amostras.ts`, e o import ficou | Import ajustado |
| `TS2554: Expected 4 arguments, but got 3` | Chamada de `registrarResultado` sem a lista de unidades, em um teste | Teste corrigido |
| `TS2591: Cannot find name 'node:fs'` (3 ocorrências) | O teste de acentuação lê arquivos do projeto, e `tsconfig.json` tem `"types": []` | `@types/node` instalado (26.6.2, apenas tipos) e referência explícita em `qa/acentuacao.test.ts` |

O último caso é o mais instrutivo: os **testes passavam** (`npm test` verde), mas o **build
falhava** — porque `tsc --noEmit` roda dentro de `npm run build` e enxerga o `qa/` depois que ele
entrou no `tsconfig.json`. Foi pego por rodar a verificação completa depois da mudança, e não por
confiar na execução anterior.

### 2. Testes automáticos — EXECUTADO

    npm test                 # vitest run

**Resultado: 122 testes, 9 arquivos, todos aprovados.**

| Arquivo | Testes | O que cobre |
|---|---|---|
| `src/ui/theme/contraste.test.ts` | 26 | Fórmula da WCAG e todos os pares de cor da interface |
| `src/learning/percurso.test.ts` | 23 | Desbloqueio, reprovação, melhor nota, recusa de atalho, serialização |
| `src/learning/avaliacao.test.ts` | 19 | Aprovação com 80% reais, exibição que não engana, correção das respostas |
| `src/content/planoDeUnidades.test.ts` | 15 | Invariantes do plano e da referência ao livro |
| `src/app/App.test.tsx` | 12 | Casca da aplicação e painel do projeto |
| `src/ui/theme/amostras.test.ts` | 9 | Mostruário de cores completo |
| `src/app/paginas/VitrineDoTema.test.tsx` | 8 | Guia de estilo |
| `src/app/rotas.test.ts` | 6 | Rotas por hash |
| `qa/acentuacao.test.ts` | 4 | Acentuação do português em código e documentação |

Os números por arquivo mudam a cada incremento; a contagem acima é a desta execução.

#### Provas que valem destacar

**Aprovação e exibição nunca se contradizem** (`avaliacao.test.ts`): dois testes percorrem todos
os totais de 1 a 60 e todos os acertos possíveis — cerca de 3.600 combinações — verificando que:

- aprovado implica pelo menos 80% reais;
- se reprovou, o percentual exibido é menor que 80; se aprovou, é 80 ou mais.

É o que impede a existência de uma nota que apareça como aprovada e reprove (ou o contrário).

**Nenhum atalho de desbloqueio** (`percurso.test.ts`): aprovar a unidade 1 abre somente a 2, e
registrar resultado na 3 lança erro enquanto a 2 não estiver aprovada. Registrar resultado de
unidade inexistente também lança.

**A regra nova encontrou um teste ruim.** Ao endurecer o domínio (D-017), um teste escrito por mim
falhou — ele registrava resultado em unidade bloqueada. A decisão foi corrigir o **teste**, e não
afrouxar a **regra**.

**Referência de página** (`planoDeUnidades.test.ts`): nenhuma unidade pode declarar página
enquanto o PDF não for verificado, e `'confirmada'` exige as duas páginas — a impressa e a do PDF.

**Acentuação** (`qa/acentuacao.test.ts`): varre `src/`, `docs/`, `README.md`, `package.json` e
`index.html` atrás de palavras que nunca são escritas sem acento em português, removendo antes os
identificadores de código. Palavras ambíguas (`esta`/`está`, `e`/`é`, `da`/`dá`) ficam de fora de
propósito. **Este teste não substitui revisão** — ele impede a repetição do erro mais comum.

### 3. Build de produção — EXECUTADO

    npm run build            # tsc --noEmit && vite build

**Resultado: passou.**

    dist/index.html                0.63 kB │ gzip:  0.40 kB
    dist/assets/index-*.css        8.68 kB │ gzip:  1.84 kB
    dist/assets/index-*.js       243.29 kB │ gzip: 76.38 kB
    ✓ built in 156ms

Os 243 kB de JavaScript são o próprio React mais o código do projeto. **Three.js não está
instalado nem incluído nesta etapa.**

### 4. Servidor de desenvolvimento e host do preview — EXECUTADO

    npm run dev

Subiu em 193 ms, escutando em `0.0.0.0:5173` (a porta aparece ligada ao endereço `0.0.0.0`, e
não a `127.0.0.1`).

Verificação por requisição HTTP, com resultados reais:

| Requisição | Resultado |
|---|---|
| `Host: localhost` | **200**, 988 bytes |
| `Host: 5173-abc123.e2b.app` (domínio do preview) | **200**, 988 bytes |
| `Host: evil.example.com` (host não autorizado) | **403** — bloqueado pelo Vite |

O terceiro caso é o que prova que `allowedHosts: ['.e2b.app']` funciona como restrição, e não como
permissão ampla: **não** foi usado `allowedHosts: true`.

### 5. Arquitetura de tokens no build — EXECUTADO

| Verificação | Resultado |
|---|---|
| Cores dos tokens presentes em `dist/assets/*.js` | **7 de 7** conferidas |
| Cores literais em `src/app/app.css` | **nenhuma** — o CSS só usa `var(--...)` |
| Variáveis CSS efetivamente usadas no CSS de produção | **39** usos de `var(--...)` |

As cores aparecem no JavaScript porque são injetadas como estilo embutido no elemento raiz, e o
CSS resolve `var(--...)` pela herança de propriedades. É o desenho previsto em D-005, confirmado
na prática.

---

## NÃO executado nesta etapa

| Verificação | Motivo | Como será feita |
|---|---|---|
| Teste em navegador automatizado (Playwright) | Nenhum navegador instalado no ambiente; o Playwright exigiria download de centenas de MB, e isso não foi autorizado | Etapa 13, ou quando autorizado. Enquanto isso, o roteiro manual abaixo |
| Teste de **interação** no navegador (clique, teclado, foco, rolagem) | Não existe interação além de navegação por link, e não há navegador | Etapa 3, quando o primeiro controle existir |
| Teste de aparencia e contraste **na tela** | Não há navegador. O contraste dos tokens foi calculado e testado; a renderização por pixels, não | Etapa 13 |
| Teste de componente com DOM (`jsdom`) | Não instalado (D-008). O render estático cobre "monta sem erro", não cobre evento | Etapa 3, junto com o primeiro estado |
| Teste de cena 3D | Não existe cena | Etapa 3 |
| Teste de persistência | Não existe persistência | Etapa 8 |
| Teste de WebGL indisponível | Não existe 3D | Etapa 3 |
| Acessibilidade com leitor de tela real | Exige navegador | Etapa 13 |
| Extração de paleta das imagens de referência | Arquivos não chegaram ao disco | Quando os arquivos existirem |
| Compatibilidade com `background-attachment: fixed` no Safari de iOS | Exige aparelho. Em alguns navegadores móveis a propriedade é ignorada, e o horizonte desce junto com a rolagem | Verificação manual, ou troca por `position: fixed` na etapa de polimento |

**Nada da tabela acima está marcado como aprovado.** Não foi executado.

---

## Roteiro manual de verificação visual

Enquanto não houver navegador automatizado, esta verificação é manual e deve ser registrada por
quem a fizer, sem presumir resultado.

1. `npm install` e `npm run dev`.
2. Abrir a página. Conferir que o fundo tem céu claro em cima e mar turquesa embaixo, com o
   horizonte marcado.
3. Conferir que **não existe nenhum botão** na página. As duas abas do topo são links e devem
   funcionar.
4. Ler o cartão "O que ainda não existe" e conferir que cada item é verdade hoje.
5. Conferir que as quatro unidades aparecem com "página: referência pendente" e **nenhum número de
   página**.
6. Abrir a aba **Guia de estilo** e conferir: a paleta aparece completa, a etiqueta âmbar tem
   **texto escuro**, e a tabela de contraste mostra todos os pares com a razão medida.
7. Reduzir a janela até a largura de celular. Conferir que a tabela rola na horizontal em vez de
   quebrar o layout.
8. Aumentar o zoom para 200% e conferir que o texto continua legível e que nada é cortado.
9. Navegar apenas com `Tab`. Conferir indicador de foco visível nas abas e que a ordem de foco faz
   sentido. Conferir que a mudança de aba **não** altera nada de progresso (não existe progresso).

Resultado esperado: 9 de 9 conferidos. Qualquer item que falhe deve ser registrado aqui com a
descrição do que aconteceu.
