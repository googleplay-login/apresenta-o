# `src/persistence` - o progresso salvo

Leitura e escrita do progresso no navegador (`localStorage`; IndexedDB apenas se
o volume exigir, e com autorizacao).

## Regras que definem este diretorio

- Somente dados **serializaveis e versionados**: nada de objetos Three.js,
  componentes React ou funcoes. O formato tem numero de versao desde o primeiro dia,
  para permitir migracao sem perder o progresso de ninguem.
- Tratar cota excedida, modo privado, navegador que bloqueia armazenamento e JSON
  corrompido. Se a gravacao falhar, dizer que falhou - **nunca fingir que salvou**.
- Limpar apenas as chaves desta aplicacao. `localStorage.clear()` e proibido: ele
  apaga dados de outros sites que compartilham a mesma origem.

## Estado

Nao implementado. Etapa 8.
