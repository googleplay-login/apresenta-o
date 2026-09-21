/**
 * Onde os arquivos do Pyodide moram, e por que eles são copiados.
 *
 * O pacote `pyodide` do npm traz o interpretador (um WebAssembly de cerca de
 * 10 MB), a biblioteca padrão em um `.zip` e o carregador. Ele é usado como
 * **fonte** desses arquivos: um script os copia para `public/pyodide/` antes de
 * o servidor subir e antes do empacotamento.
 *
 * Por que copiar, em vez de importar direto do `node_modules`: o Pyodide resolve
 * os próprios arquivos por uma URL (`indexURL`), e essa URL precisa existir no
 * pacote final — o `node_modules` não vai para o site. Copiar também deixa
 * claro que os arquivos vêm do pacote instalado, e não de um CDN de terceiros:
 * nada aqui busca código em servidor alheio (D-040).
 *
 * Por que os arquivos **não** entram no Git: são ~14 MB de binário que podem ser
 * reproduzidos a partir do `package-lock.json`, e o repositório é público. Quem
 * clona roda `npm install` e o script roda sozinho.
 */

/** Pasta, dentro de `public/`, servida como `/pyodide/…`. */
export const PASTA_PUBLICA_DO_PYODIDE = 'public/pyodide'

/** Arquivos necessários para carregar e rodar o interpretador. */
export const ARQUIVOS_DO_PYODIDE: readonly string[] = [
  'pyodide.mjs',
  'pyodide.asm.mjs',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
]
