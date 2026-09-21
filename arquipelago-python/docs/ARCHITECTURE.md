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
| `src/app/` | Casca da aplicação, rotas por hash e as duas páginas atuais | Existe |
| `src/world/` | Cena 3D: ilhas, pontes, câmera, céu, água, névoa. **Sem regra de aprovação** | Vazio |
| `src/learning/` | Regras pedagógicas puras: aprovação, disponibilidade, reprovação | Existe e testado |
| `src/content/` | Conteúdo pedagógico como dado tipado, separado dos componentes | Iniciado |
| `src/state/` | Estado em memória da sessão | Vazio |
| `src/persistence/` | Gravação e leitura do progresso, versionado | Vazio |
| `src/python/` | Pyodide em Web Worker, sob demanda | Vazio |
| `src/ui/` | Componentes, tema, tokens visuais e mostruário de cores | Existe |
| `src/types/` | Apenas tipos transversais | Vazio |
| `src/utils/` | Apenas auxiliares genéricos sem domínio | Vazio |
| `qa/` | Verificações do projeto (não da aplicação), como a trava de acentuação | Existe |
| `docs/` | Documentação de continuidade | Existe |

Cada pasta vazia tem um `README.md` explicando sua responsabilidade e seus limites. Quem
continuar o trabalho abre a pasta e encontra a regra ali, onde ela importa.

## As duas páginas de hoje

| Rota | Página | Para quê |
|---|---|---|
| `#/` | Painel do projeto | Dizer o estado real: o que existe, o que não existe, o que está planejado |
| `#/tema` | Guia de estilo | Mostrar a linguagem visual em espécimes, antes de existir cena 3D |

Nenhuma das duas tem botão. Elas têm **links** de navegação, e links funcionam de verdade — a
regra do projeto proíbe apenas alvo clicável **sem efeito**.

## Piso técnico

Vite + React + TypeScript. Three.js via React Three Fiber e Drei entra na Etapa 3. CSS
responsivo sem framework. `localStorage` na Etapa 8 (IndexedDB só se o volume exigir, e com
autorização). Vitest para lógica e render; Playwright para teste de navegador.

### Versões resolvidas em 21/09/2026

| Pacote | Versão | Observação |
|---|---|---|
| node | 22.22.3 | ambiente de desenvolvimento |
| npm | 10.9.8 | |
| react / react-dom | 19.3.0 | |
| vite | 8.3.0 | |
| @vitejs/plugin-react | 6.1.1 | |
| typescript | 7.0.2 | |
| vitest | 5.0.1 | |
| @types/react / @types/react-dom | 19.3.0 | |
| @types/node | 26.6.2 | apenas tipos, para a verificação de qualidade em `qa/` |

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
| Nenhum botão na página | `src/app/App.test.tsx` | Controle sem efeito (D-009) |
| Nenhuma página inventada | `src/content/planoDeUnidades.test.ts` | Referência de página não verificada (D-010) |
| Aprovação só com 80% reais | `src/learning/avaliacao.test.ts` | Exibição que contradiz a decisão |
| Nenhum atalho de desbloqueio | `src/learning/percurso.test.ts` | Pular portão por rota, clique ou ordem |
| Acentuação do português | `qa/acentuacao.test.ts` | Texto sem acento no código e na documentação (D-015) |

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
