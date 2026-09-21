/// <reference types="node" />

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Trava contra texto em português sem acentuação.
 *
 * Por que isto é um teste e não uma convenção: a primeira versão do projeto saiu inteira sem
 * acento ("nao", "referencia", "codigo"), porque quem escreveu tratou acento como risco de
 * codificação. Não é risco em UTF-8 — era descuido. Num produto em português, isso é defeito
 * visível em toda tela e em toda página de documento.
 *
 * A dificuldade é separar **texto** de **código**: identificadores são escritos sem acento por
 * decisão (D-007) — `referencia.status`, `naoTemPaginaNenhuma`, `em-construcao` — e não podem ser
 * acusados. Por isso o teste primeiro extrai o que é texto humano:
 *
 *  - comentários;
 *  - strings que parecem frase (com espaço ou já acentuadas);
 *  - o conteúdo entre marcas de marcação (JSX e HTML);
 *  - em Markdown, o texto fora dos blocos de código.
 *
 * Palavras ambíguas de propósito ficam de fora da lista:
 *  - `esta` (esta ilha) x `está` (ele está)
 *  - `e` (conjunção) x `é` (verbo)
 *  - `da` (preposição) x `dá` (verbo)
 *
 * `so` está na lista porque `so` não existe em português — só existe `só`.
 *
 * Consequência honesta: o teste pega a maioria dos casos, **não todos**. Ele não substitui
 * revisão; ele impede a repetição do erro mais comum.
 */

const RAIZ = process.cwd()

/** Pastas varridas. `qa` fica de fora: este arquivo contém as palavras erradas. */
const PASTAS = ['src', 'docs']

/** Arquivos soltos na raiz que também fazem parte do produto. */
const ARQUIVOS_DA_RAIZ = ['README.md', 'package.json', 'index.html']

const EXTENSOES = ['.ts', '.tsx', '.md', '.html', '.json']

const PALAVRAS_ERRADAS: readonly string[] = [
  'nao',
  'sao',
  'voce',
  'referencia',
  'codigo',
  'codigos',
  'pagina',
  'paginas',
  'versao',
  'funcao',
  'funcoes',
  'decisao',
  'decisoes',
  'avaliacao',
  'explicacao',
  'configuracao',
  'construcao',
  'numero',
  'proximo',
  'proxima',
  'proprio',
  'propria',
  'usuario',
  'unico',
  'unica',
  'ultimo',
  'ultima',
  'minimo',
  'minima',
  'maximo',
  'maxima',
  'historico',
  'tecnico',
  'pratico',
  'generico',
  'especifico',
  'obrigatorio',
  'acessivel',
  'responsavel',
  'nivel',
  'dominio',
  'criterio',
  'conteudo',
  'area',
  'possivel',
  'necessario',
  'publico',
  'basico',
  'logico',
  'automatico',
  'estatico',
  'dinamico',
  'tambem',
  'apos',
  'atraves',
  'so',
  'ja',
  'sera',
  'tera',
  'fara',
  'ira',
  'ficara',
  'abrira',
]

type Arquivo = { readonly caminho: string; readonly conteudo: string }

function listarArquivos(pasta: string): readonly string[] {
  const encontrados: string[] = []

  for (const entrada of readdirSync(pasta)) {
    const caminho = join(pasta, entrada)
    if (statSync(caminho).isDirectory()) {
      encontrados.push(...listarArquivos(caminho))
    } else if (EXTENSOES.some((extensao) => entrada.endsWith(extensao))) {
      encontrados.push(caminho)
    }
  }

  return encontrados
}

function lerArquivos(): readonly Arquivo[] {
  const caminhos = [
    ...PASTAS.flatMap((pasta) => listarArquivos(join(RAIZ, pasta))),
    ...ARQUIVOS_DA_RAIZ.map((nome) => join(RAIZ, nome)).filter((caminho) => {
      try {
        return statSync(caminho).isFile()
      } catch {
        return false
      }
    }),
  ]

  return caminhos.map((caminho) => ({
    caminho: relative(RAIZ, caminho),
    conteudo: readFileSync(caminho, 'utf8'),
  }))
}

/** Tira do trecho o que é nome de código, caminho de arquivo ou marcação. */
function semCodigo(trecho: string): string {
  return trecho
    .replace(/`[^`]*`/g, ' ')
    // Interpolação dentro de template literal é código, não texto.
    .replace(/\$\{[^}]*\}/g, ' ')
    .replace(/\b[\w-]+(?:\/[\w.-]+)+\b/g, ' ')
    .replace(/\b\w+\.(?:ts|tsx|js|jsx|md|css|json|html|py)\b/g, ' ')
    .replace(/\b\w+\.\w+\b/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[_]/g, ' ')
    .replace(/\b[A-Za-z][A-Za-z0-9]*(?:[A-Z][A-Za-z0-9]*)+\b/g, ' ')
}

/** Strings que são frase. Valor de dado e caminho de módulo ficam de fora. */
function ehFrase(texto: string): boolean {
  return /\s/.test(texto.trim()) || /[À-ÿ]/.test(texto)
}

/** Marcas de código que não aparecem em texto de tela. */
const MARCAS_DE_CODIGO = /['"():;,=]|=>|\bcase\b|\breturn\b|\bfunction\b/

/** Verdadeiro quando o trecho entre `>` e `<` é texto de tela, e não código. */
function ehTextoDeTela(trecho: string): boolean {
  return /[A-Za-zÀ-ÿ]/.test(trecho) && !MARCAS_DE_CODIGO.test(trecho)
}

/** Extrai os trechos de texto humano de um arquivo. */
function extrairTexto(arquivo: Arquivo): readonly string[] {
  const { conteudo, caminho } = arquivo
  const trechos: string[] = []

  if (caminho.endsWith('.md')) {
    // Markdown: tudo, menos os blocos de código.
    return [conteudo.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ')]
  }

  if (caminho.endsWith('.html') || caminho.endsWith('.json')) {
    return [conteudo.replace(/<[^>]*>/g, ' ').replace(/"[^"]*":/g, ' ')]
  }

  for (const achado of conteudo.matchAll(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g)) {
    trechos.push(achado[0])
  }

  // O terceiro ramo aceita barra invertida de propósito: `\n` dentro de uma
  // string é comum no conteúdo (os blocos de código), e excluí-la fazia o par de
  // crases ser pulado — e, com ele, TODOS os pares seguintes, que passavam a
  // casar código com código e a acusar identificador como se fosse texto.
  for (const achado of conteudo.matchAll(/'([^'\\\n]*)'|"([^"\\\n]*)"|`([^`]*)`/g)) {
    const texto = achado[1] ?? achado[2] ?? achado[3] ?? ''
    if (ehFrase(texto)) {
      trechos.push(texto)
    }
  }

  for (const achado of conteudo.matchAll(/>([^<>{}]+)</g)) {
    const possivelTexto = achado[1] ?? ''
    // Entre dois `>` e `<` pode haver código, e não texto: uma função que
    // devolve JSX, um `case 'codigo':`, uma condição. O filtro abaixo exige que
    // o trecho pareça mesmo frase de tela — sem aspas, parênteses, dois-pontos
    // ou sinal de igual, que são marcas de código.
    if (ehTextoDeTela(possivelTexto)) {
      trechos.push(possivelTexto)
    }
  }

  return trechos
}

const ARQUIVOS = lerArquivos()

/**
 * Fronteira de palavra consciente de acento.
 *
 * `\b` não serve aqui: em JavaScript, `\w` é `[A-Za-z0-9_]`, então `\bpagina\b`
 * casaria dentro de "paginação" — a letra "ç" conta como fronteira. O olhar
 * negativo abaixo trata qualquer letra (inclusive acentuada) como parte da
 * palavra, o que é o comportamento correto para português.
 */
const PADRAO = new RegExp(`(?<![\\p{L}\\p{N}_])(${PALAVRAS_ERRADAS.join('|')})(?![\\p{L}\\p{N}_])`, 'giu')

/** Ocorrências de palavra sem acento nos trechos de texto humano do arquivo. */
function defeitosDe(arquivo: Arquivo): readonly string[] {
  return extrairTexto(arquivo).flatMap((trecho, indiceDoTrecho) =>
    semCodigo(trecho)
      .split('\n')
      .flatMap((linha, indiceDaLinha) => {
        const encontradas = linha.match(PADRAO)
        if (encontradas === null) {
          return []
        }
        return [
          `${arquivo.caminho} (trecho ${indiceDoTrecho + 1}, linha ${indiceDaLinha + 1}): ` +
            `"${encontradas.join('", "')}" — ${linha.trim().slice(0, 120)}`,
        ]
      }),
  )
}

describe('acentuação do português no código e na documentação', () => {
  it('tem arquivos para varrer', () => {
    expect(ARQUIVOS.length).toBeGreaterThan(20)
  })

  it('varre código e documentação do projeto', () => {
    const caminhos = ARQUIVOS.map((arquivo) => arquivo.caminho)
    expect(caminhos).toContain('src/learning/percurso.ts')
    expect(caminhos).toContain('docs/DECISIONS.md')
    expect(caminhos).toContain('README.md')
  })

  it('encontra o texto de uma string de prosa e ignora identificadores', () => {
    // Prova de que a extração funciona, nos dois sentidos.
    const comDefeito = extrairTexto({
      caminho: 'falso.tsx',
      conteudo: "const x = 'texto sem acento aqui'\n<p>Outro texto nao acentuado</p>",
    }).join(' ')

    expect(comDefeito).toContain('texto sem acento aqui')
    expect(comDefeito).toContain('Outro texto nao acentuado')

    const semDefeito = extrairTexto({
      caminho: 'falso.ts',
      conteudo: 'const referencia = { status: "referencia-pendente" }\nimport x from "./avaliacao"',
    }).join(' ')

    expect(semDefeito).not.toContain('referencia')

    // O filtro novo não pode virar esconderijo: texto de tela continua sendo
    // olhado, e código entre `>` e `<` continua sendo ignorado.
    const comJsxEComCodigo = extrairTexto({
      caminho: 'falso.tsx',
      conteudo: "return (\n  <p>Falta acento aqui</p>\n)\n\n    case 'codigo':\n",
    }).join(' ')

    expect(comJsxEComCodigo).toContain('Falta acento aqui')
    expect(comJsxEComCodigo).not.toContain("case 'codigo'")
  })

  it('não encontra palavra sem acento em texto humano', () => {
    const defeitos = ARQUIVOS.flatMap(defeitosDe)

    expect(
      defeitos,
      `Texto em português sem acentuação encontrado:\n${defeitos.join('\n')}`,
    ).toEqual([])
  })
})
