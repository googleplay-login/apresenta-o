# `src/python` — executar Python no navegador

Pyodide em Web Worker, carregado **sob demanda**, para o estudante rodar código sem instalar nada.

## Regras que definem este diretório

- Sem segredo no cliente. Tudo que roda no navegador é visível para quem quiser ver.
- **Não prometer** que executar código arbitrário é seguro. Não é, e o texto da tela não diz que é
  (D-041).
- Carregar somente quando o estudante pedir, mantendo o download pesado (cerca de 14 MB) fora do
  carregamento inicial.
- Nada vem de CDN: os arquivos do Pyodide são servidos pela própria aplicação (D-040).
- Nenhuma mensagem de erro é reescrita: o traceback chega à tela como o Python escreveu (D-042).

## Os arquivos, um por um

| Arquivo | Responsabilidade |
|---|---|
| `protocolo.ts` | O contrato entre a aplicação e o Worker: tipos das mensagens, validação do que chega, recusas explicadas e junção da saída. **Puro** — não conhece Pyodide nem React. |
| `interpretadorPyodide.ts` | Carrega o Pyodide e executa código. É o único arquivo que fala com a biblioteca; roda **dentro** do Worker. |
| `nucleoDoPython.ts` | O que acontece a cada pedido de execução: tenta rodar, captura o que o Python escreveu, e transforma falha em resposta — nunca lança. |
| `trabalhadorDoPython.ts` | A fiação: escuta o Worker e chama o núcleo. Sem regra de negócio (o teste proíbe). |
| `usePython.ts` | O gancho do React: cria o Worker no clique, carrega uma vez, executa, avisa quando algo demora e sabe reiniciar. |
| `pyodideLocal.ts` | O endereço da pasta `public/pyodide/`, em um lugar só. |

## Como o interpretador chega à pasta pública

`scripts/preparar-pyodide.mjs` copia seis arquivos de `node_modules/pyodide` para `public/pyodide/`,
e roda nos ganchos `predev`, `prebuild` e `pretest`. A pasta está no `.gitignore` — 13,9 MB de
binário não pertencem a um repositório público — e é reconstruída a partir do lockfile:

    npm ci
    npm run preparar-pyodide   # ou qualquer um dos três ganchos acima

## Estado

**Prova de conceito implementada** (Etapa 9). Funciona ponta a ponta em teste: `protocolo.test.ts` e
`nucleoDoPython.test.ts` (puros), `pyodideDeVerdade.test.ts` (o Pyodide **de verdade**, rodando em
Node, executando o conteúdo real das quatro unidades) e `src/ui/paineis/ConsoleDoPython.test.tsx`
(a tela, com o Worker dublado).

**Limite honesto:** o Web Worker em si **nunca foi executado num navegador** — não há navegador nem
WebGL neste ambiente. O que está provado é o contrato, o núcleo, a tela e o interpretador real; a
fiação do Worker com o navegador é roteiro manual (itens 46 a 50 do `docs/TEST_REPORT.md`).

O que **não** está aqui, de propósito: correção automática de exercício (Etapa 10) e qualquer forma
de dizer que rodar código de terceiros é seguro.
