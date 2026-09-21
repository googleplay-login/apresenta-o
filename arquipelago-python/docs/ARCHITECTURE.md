# ARQUITETURA

## A regra que sustenta tudo

> Uma unica fonte de verdade decide. O mundo 3D e os paineis de interface apenas
> **leem** a decisao e a apresentam.

```
                    src/learning/            <- DECIDE (funcoes puras, testaveis)
                   /      |       \
        src/world/    src/ui/    src/persistence/
        (Three.js)   (paineis)   (localStorage)
        desenha      mostra      grava e le
```

Consequencias praticas, e o motivo de cada uma:

| Se a regra ficasse no 3D... | ...entao |
|---|---|
| Clicar na ponte poderia liberar a ilha | A ponte passa a ser consequencia de uma decisao, nao a decisao |
| Mudar parametro na URL poderia pular etapa | A interface consulta a mesma funcao antes de abrir qualquer tela |
| Os paineis e a cena poderiam discordar | Existem duas fontes de verdade - o defeito que queremos evitar |
| A regra nao seria testavel sem montar a cena | `src/learning/` roda em teste puro, sem browser e sem WebGL |

## Mapa das pastas

| Pasta | Responsabilidade | Estado |
|---|---|---|
| `src/app/` | Composicao da aplicacao e da pagina inicial | Existe |
| `src/world/` | Cena 3D: ilhas, pontes, camera, ceu, agua, nevoa. **Sem regra de aprovacao** | Vazio |
| `src/learning/` | Regras pedagogicas puras: aprovacao, disponibilidade, reprovacao | Vazio |
| `src/content/` | Conteudo pedagogico como dado tipado, separado dos componentes | Iniciado |
| `src/state/` | Estado em memoria da sessao | Vazio |
| `src/persistence/` | Gravacao e leitura do progresso, versionado | Vazio |
| `src/python/` | Pyodide em Web Worker, sob demanda | Vazio |
| `src/ui/` | Componentes, tema e tokens visuais | Iniciado |
| `src/types/` | Apenas tipos transversais | Vazio |
| `src/utils/` | Apenas auxiliares genericos sem dominio | Vazio |
| `docs/` | Documentacao de continuidade | Existe |

Cada pasta vazia tem um `README.md` explicando sua responsabilidade e seus limites.
O motivo e simples: quem continuar o trabalho abre a pasta e encontra a regra ali,
no lugar onde ela importa.

## Piso tecnico

Vite + React + TypeScript. Three.js via React Three Fiber e Drei entra na Etapa 3.
CSS responsivo sem framework. `localStorage` na Etapa 8 (IndexedDB so se o volume
exigir, e com autorizacao). Vitest para teste de logica; Playwright para teste de
navegador.

### Versoes resolvidas em 21/09/2026

| Pacote | Versao | Observacao |
|---|---|---|
| node | 22.22.3 | ambiente de desenvolvimento |
| npm | 10.9.8 | |
| react / react-dom | 19.3.0 | |
| vite | 8.3.0 | |
| @vitejs/plugin-react | 6.1.1 | |
| typescript | 7.0.2 | |
| vitest | 5.0.1 | |
| @types/react / @types/react-dom | 19.3.0 | |

Versoes fixadas **exatas** (sem `^`) e `package-lock.json` versionado. O objetivo e
que outra pessoa, em outra maquina, obtenha exatamente a mesma instalacao.
Ver `DECISIONS.md` (D-008).

## Tema visual: fonte unica

`src/ui/theme/tokens.ts` e o unico lugar onde uma cor e escrita. O CSS consome
variaveis geradas por `tokensComoVariaveisCss()`. Nenhuma cor literal em `.css` -
e o teste `tokens.test.ts` verifica os pares de contraste declarados.

Consequencia: mudar a paleta e mudar **um** arquivo, e o teste avisa se a mudanca
quebrar a leitura.

## Ambiente de execucao (preview remoto)

O navegador do usuario **nao** e a maquina onde o servidor roda. Por isso:

- o servidor de desenvolvimento escuta em `0.0.0.0` (`server.host: true`);
- `allowedHosts` inclui o dominio do proxy de preview (`.e2b.app`), porque o Vite
  recusa requisicao com Host desconhecido;
- nada no codigo do navegador chama `localhost` para alcancar servico remoto:
  caminhos relativos.

## Decisoes de configuracao com motivo

- `tsconfig.json` usa `"types": []` para nao incluir automaticamente os tipos de
  todo pacote instalado. A referencia ao Vite e explicita em `src/vite-env.d.ts`.
- Um unico `tsconfig.json`, em vez dos tres do modelo padrao do Vite: menos arquivo,
  mesma checagem. `npm run build` roda `tsc --noEmit` antes de empacotar.
- Teste em ambiente `node`. `jsdom` sera adicionado quando existir teste de
  componente - nao antes.
