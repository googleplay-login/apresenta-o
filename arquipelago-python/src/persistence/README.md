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

**Não implementado.** Etapa 8. O formato do dado já existe e é testado (inclusive a
ida e volta por JSON), mas ninguém grava nada ainda.
