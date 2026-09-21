/**
 * Copia os arquivos do Pyodide do pacote instalado para `public/pyodide/`.
 *
 * Roda antes de `dev`, de `build` e de `test` de integração, para que os
 * arquivos existam sem ninguém precisar lembrar do passo. Repetir a cópia é
 * barato: arquivo igual não é reescrito.
 */
import { createRequire } from 'node:module'
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)))
const ORIGEM = join(RAIZ, 'node_modules', 'pyodide')
const DESTINO = join(RAIZ, 'public', 'pyodide')

const ARQUIVOS = [
  'pyodide.mjs',
  'pyodide.mjs.map',
  'pyodide.asm.mjs',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
]

if (!existsSync(ORIGEM)) {
  console.error(
    'Os arquivos do Pyodide não estão instalados. Rode `npm install` antes — o pacote vem do package.json.',
  )
  process.exit(1)
}

mkdirSync(DESTINO, { recursive: true })

let copiados = 0
for (const nome of ARQUIVOS) {
  const origem = join(ORIGEM, nome)
  const destino = join(DESTINO, nome)

  if (!existsSync(origem)) {
    console.error(`Falta o arquivo ${nome} no pacote do Pyodide.`)
    process.exit(1)
  }

  const igual =
    existsSync(destino) &&
    statSync(origem).size === statSync(destino).size &&
    readFileSync(origem).equals(readFileSync(destino))

  if (!igual) {
    copyFileSync(origem, destino)
    copiados += 1
  }
}

const versao = createRequire(import.meta.url)('pyodide/package.json').version
console.log(
  copiados === 0
    ? `Pyodide ${versao}: arquivos já estavam em public/pyodide/.`
    : `Pyodide ${versao}: ${copiados} arquivo(s) copiado(s) para public/pyodide/.`,
)
