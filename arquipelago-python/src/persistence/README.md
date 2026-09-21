# `src/persistence` — o progresso salvo

Leitura e escrita do progresso no navegador (`localStorage`; IndexedDB apenas se o
volume exigir, e com autorização).

## Regras que definem este diretório

- Somente dados **serializáveis e versionados**. O formato já tem número de versão
  (`VERSAO_DO_PROGRESSO`, em `src/learning/percurso.ts`), desde o primeiro dia, para
  permitir migração sem perder o progresso de ninguém.
- Nada de objeto Three.js, componente React ou função gravada.
- Tratar cota excedida, modo privado, navegador que bloqueia armazenamento e JSON
  corrompido. **Se a gravação falhar, dizer que falhou** — nunca fingir que salvou.
- Limpar apenas as chaves desta aplicação. `localStorage.clear()` é proibido: ele
  apaga dados de outros sites da mesma origem.

## Estado

**Implementado na Etapa 3**, antes do previsto (a Etapa 8 pedia o protótipo jogável; guardar o
progresso passou a fazer falta assim que o ciclo teve tela).

| Arquivo | O que faz |
|---|---|
| `progressoSalvo.ts` | Ler, gravar, validar formato e versão, apagar só as chaves da aplicação |
| `useProgressoPersistido.ts` | Liga o estado ao armazenamento: lê **uma vez, antes de gravar**, e mostra o aviso quando falha |

Regras que valem na prática: um progresso sem nenhuma unidade **não é gravado** (a chave é
removida, em vez de guardar o nada); falha de escrita vira aviso visível, nunca silêncio;
`apagarProgresso` percorre as chaves com o prefixo da aplicação e não toca em mais nada.
