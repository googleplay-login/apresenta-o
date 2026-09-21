/**
 * O protocolo entre a aplicação e o trabalhador que executa Python.
 *
 * Por que existe um protocolo, e não uma chamada direta: o interpretador do
 * Python é um WebAssembly grande, e ele é carregado dentro de um **Web Worker**
 * — um programa separado, sem acesso ao DOM. A conversa entre os dois lados
 * precisa ser explícita, em dados serializáveis, e é por isso que ela mora aqui:
 * assim dá para conferir, em teste, cada mensagem que atravessa essa fronteira.
 *
 * Nada aqui é código do Pyodide. Este arquivo é puro: recebe, valida e devolve
 * dados. Quem realmente carrega o interpretador é `interpretadorPyodide.ts`, e
 * quem atende as mensagens é `trabalhadorDoPython.ts`.
 *
 * Limite de caracteres: existe para não travar a página. Colar um arquivo de
 * megabytes num `textarea` e mandar para o trabalhador transforma um erro de
 * digitação em travamento do navegador. O limite é generoso para o que este
 * projeto pede — exercícios de curso introdutório — e é dito em voz alta quando
 * é atingido.
 */

/** Maior programa que o campo aceita, em caracteres. */
export const LIMITE_DE_CARACTERES = 4000

/** Recados que o app envia ao trabalhador. */
export type Pedido =
  /** `url` é a pasta onde estão os arquivos do Pyodide (ver D-040). */
  | { readonly tipo: 'carregar'; readonly url: string }
  | { readonly tipo: 'executar'; readonly id: number; readonly codigo: string }

/** Recados que o trabalhador devolve ao app. */
export type Resposta =
  | { readonly tipo: 'pronto'; readonly versao: string }
  | {
      readonly tipo: 'saida'
      readonly id: number
      readonly texto: string
      /** Valor da última expressão, quando houver um que dê para mostrar. */
      readonly resultado: string | null
    }
  | {
      /**
       * Erro do Python. O texto é a **mensagem literal** do interpretador, com o
       * traceback: é informação para quem está aprendendo, e o projeto não
       * reescreve mensagem de erro para parecer mais amigável (D-042).
       */
      readonly tipo: 'erroDePython'
      readonly id: number
      readonly texto: string
    }
  | { readonly tipo: 'recusado'; readonly id: number; readonly motivo: string }
  | { readonly tipo: 'erroDeCarga'; readonly texto: string }

/** Pedido de carregamento do interpretador, apontando para os arquivos. */
export function pedidoDeCarregar(url: string): Pedido {
  return { tipo: 'carregar', url }
}

/** Pedido de execução de um programa. */
export function pedidoDeExecucao(id: number, codigo: string): Pedido {
  return { tipo: 'executar', id, codigo }
}

/**
 * Recusa o que este console **não** tem como atender, dizendo o que fazer.
 *
 * A recusa de `input()` foi medida, e não imaginada: um programa com `input()`
 * ficou esperando para sempre no interpretador carregado de verdade — não
 * devolveu resposta nem erro, e o processo teve de ser morto de fora. Dentro do
 * console isso seria pior do que um erro: a tela ficaria parada, sem explicação,
 * e a pessoa acharia que o programa dela está errado.
 *
 * A conferência é por texto, e por isso é **guarda, não cadeia**: quem quiser
 * burlar consegue (bastam dois pedaços de texto que juntos formem `input(`). O
 * objetivo aqui não é impedir alguém de fazer algo, é não deixar a tela travar
 * em silêncio por causa de uma linha comum de exercício.
 */
const USA_TECLADO = /\binput\s*\(|\bsys\.stdin\b/

export function motivoDaRecusa(codigo: string): string | null {
  if (codigo.trim() === '') {
    return 'Não há nada para rodar: o campo está vazio.'
  }
  if (codigo.length > LIMITE_DE_CARACTERES) {
    return `O programa tem ${codigo.length} caracteres, e o limite aqui é ${LIMITE_DE_CARACTERES}.`
  }
  if (USA_TECLADO.test(codigo)) {
    return (
      'Este console não tem teclado para o programa ler: `input()` ficaria esperando para ' +
      'sempre. Escreva o valor direto no código — por exemplo, `nome = "Ana"` no lugar do ' +
      '`input()` — ou rode este programa no Python do seu computador.'
    )
  }
  return null
}

/** Verdadeiro se o que chegou do trabalhador é uma resposta que este app entende. */
export function ehResposta(valor: unknown): valor is Resposta {
  if (valor === null || typeof valor !== 'object') {
    return false
  }

  const candidato = valor as {
    tipo?: unknown
    id?: unknown
    texto?: unknown
    versao?: unknown
    resultado?: unknown
    motivo?: unknown
  }

  switch (candidato.tipo) {
    case 'pronto':
      return typeof candidato.versao === 'string'
    case 'saida':
      return (
        typeof candidato.id === 'number' &&
        typeof candidato.texto === 'string' &&
        (candidato.resultado === null || typeof candidato.resultado === 'string')
      )
    case 'erroDePython':
      return typeof candidato.id === 'number' && typeof candidato.texto === 'string'
    case 'recusado':
      return typeof candidato.id === 'number' && typeof candidato.motivo === 'string'
    case 'erroDeCarga':
      return typeof candidato.texto === 'string'
    default:
      return false
  }
}

/**
 * Texto do erro, a partir do que foi lançado.
 *
 * O Pyodide lança um `PythonError` cujo `message` traz o traceback completo. Se
 * vier outra coisa — porque a falha foi antes do Python, no carregamento ou na
 * comunicação —, o texto ainda precisa ser útil, e nunca vazio.
 */
export function textoDoErro(erro: unknown): string {
  if (erro instanceof Error && erro.message.trim() !== '') {
    return erro.message
  }
  if (typeof erro === 'string' && erro.trim() !== '') {
    return erro
  }
  return 'O Python parou sem dizer por quê. Nenhuma saída foi produzida.'
}

/**
 * Junta a saída do programa com o valor da última expressão, quando houver.
 *
 * `print` e o valor da última linha são coisas diferentes em Python: num
 * terminal, o valor aparece porque o modo interativo o mostra. Aqui ele aparece
 * com uma seta, para não se confundir com o que foi impresso.
 */
export function linhasDaSaida(saida: string, resultado: string | null): readonly string[] {
  const linhas = saida.replace(/\n$/, '') === '' ? [] : saida.replace(/\n$/, '').split('\n')
  return resultado === null ? linhas : [...linhas, `→ ${resultado}`]
}

/**
 * Uma execução concluída, como ela fica depois de traduzida.
 *
 * Morar aqui, e não no gancho do React, tem um motivo de teste: a tradução da
 * resposta do trabalhador é exatamente a mesma coisa que a correção do exercício
 * precisa receber. Com a tradução num módulo puro, o teste que roda o Python de
 * verdade usa o **mesmo caminho** que a tela usa — e não uma cópia que pode
 * envelhecer sem ninguém perceber.
 */
export type Execucao = {
  readonly id: number
  readonly codigo: string
  /** Linhas a mostrar: saída impressa, valor da última expressão, ou erro. */
  readonly linhas: readonly string[]
  /** `true` quando o que está em `linhas` é mensagem de erro ou recusa. */
  readonly foiErro: boolean
}

/**
 * Traduz a resposta do trabalhador na execução correspondente.
 *
 * Devolve `null` para as respostas que não são de execução (carregamento pronto,
 * falha de carga) — elas mudam outro estado, e não este.
 *
 * A saída **não** é enfeitada aqui: programa que roda sem imprimir nada devolve
 * lista vazia. Quem conta ao estudante que nada saiu é a tela; quem confere o
 * exercício precisa da verdade — uma linha inventada faria a conferência contar
 * uma linha impressa que não existiu.
 */
export function execucaoDaResposta(resposta: Resposta, codigo: string): Execucao | null {
  switch (resposta.tipo) {
    case 'saida':
      return {
        id: resposta.id,
        codigo,
        linhas: linhasDaSaida(resposta.texto, resposta.resultado),
        foiErro: false,
      }
    case 'erroDePython':
      return { id: resposta.id, codigo, linhas: resposta.texto.split('\n'), foiErro: true }
    case 'recusado':
      return { id: resposta.id, codigo, linhas: [resposta.motivo], foiErro: true }
    default:
      return null
  }
}
