/**
 * O interpretador de verdade: Pyodide carregado sob demanda.
 *
 * O que este arquivo faz: carrega o Pyodide de uma URL **uma única vez**, liga a
 * captura de `stdout`/`stderr` e executa os programas que chegam. Ele não
 * conhece React, não conhece a interface e não decide nada sobre o conteúdo.
 *
 * Por que o carregamento é por URL, e não um `import` comum: o Pyodide é um
 * WebAssembly de vários megabytes, com um arquivo de biblioteca padrão ao lado, e
 * ele resolve os próprios arquivos a partir de uma pasta (`indexURL`). O pacote
 * `pyodide` do npm é usado como **fonte desses arquivos** — um script de
 * preparação os copia para `public/pyodide/` (D-040) —, e o carregamento
 * acontece na hora em que a pessoa pede para rodar, não na abertura da página.
 *
 * O que ele **não** é: uma sandbox de segurança. Rodar código Python aqui é
 * rodar código no seu próprio navegador; a interface diz isso em voz alta
 * (D-041). Também não há como interromper um laço infinito de dentro do
 * interpretador — a saída é descartar o trabalhador e começar outro, e é o que o
 * botão de reiniciar faz.
 */

/** O que o resto do programa precisa saber de um interpretador. */
export type Interpretador = {
  /** Versão do **Python** (3.14.0), e não a do Pyodide (314.0.7). */
  readonly versao: string
  executar(codigo: string): Promise<{ readonly texto: string; readonly resultado: string | null }>
}

/** Um espaço de nomes do Python visto do lado do JavaScript. */
type EspacoDeNomes = {
  set(nome: string, valor: unknown): void
  destroy(): void
}

/** O mínimo que usamos do objeto devolvido pelo Pyodide. */
type PyodideCarregado = {
  readonly version: string
  runPython(codigo: string, opcoes?: { globals?: unknown }): unknown
  runPythonAsync(codigo: string, opcoes?: { globals?: unknown }): Promise<unknown>
  setStdout(opcoes: { batched: (texto: string) => void }): void
  setStderr(opcoes: { batched: (texto: string) => void }): void
}

/**
 * Carrega o Pyodide e devolve o interpretador.
 *
 * `urlDoPyodide` é a pasta onde estão `pyodide.mjs`, `pyodide.asm.wasm` e
 * `python_stdlib.zip`. A função aceita URL comum e URL de arquivo — é assim que
 * o mesmo código roda no navegador e no teste em Node, com o interpretador de
 * verdade em vez de um dublê.
 */
export async function criarInterpretadorPyodide(urlDoPyodide: string): Promise<Interpretador> {
  const endereco = urlDoPyodide.endsWith('/') ? urlDoPyodide : `${urlDoPyodide}/`
  const modulo = (await import(/* @vite-ignore */ especificadorDoModulo(endereco))) as {
    loadPyodide: (opcoes: { indexURL: string }) => Promise<PyodideCarregado>
  }

  const pyodide = await modulo.loadPyodide({ indexURL: endereco })

  let acumulado = ''
  pyodide.setStdout({ batched: (texto) => (acumulado += `${texto}\n`) })
  pyodide.setStderr({ batched: (texto) => (acumulado += `${texto}\n`) })

  // `pyodide.version` é a versão do **Pyodide** (por exemplo, 314.0.7), que não
  // é a versão do Python (3.14.0) — dizer a segunda para o estudante seria
  // confundir as duas coisas. Este teste pegou a troca.
  const versaoDoPython = String(
    pyodide.runPython(
      'import sys; f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"',
    ),
  )

  /**
   * Um espaço de nomes novo, para o programa que vai rodar agora.
   *
   * Isto não é detalhe de implementação: é o que faz cada execução começar do
   * zero, como um arquivo `.py` rodado no terminal. Sem espaço novo, o Pyodide
   * reaproveita o mesmo dicionário global, e a variável criada na execução
   * anterior **sobrevive** para a seguinte — o que produz duas coisas ruins ao
   * mesmo tempo: o estudante vê sobras do programa de antes, e a conferência de
   * um exercício mede um valor que veio de outro. O teste do interpretador de
   * verdade cobra o isolamento, e a conferência do exercício depende dele.
   */
  function espacoDeNomesNovo(): EspacoDeNomes {
    const espaco = pyodide.runPython('{}') as EspacoDeNomes
    // `__name__` é o que faz o programa se comportar como programa principal,
    // e não como módulo importado — inclusive na hora de ler mensagem de erro.
    espaco.set('__name__', '__main__')
    return espaco
  }

  return {
    versao: versaoDoPython,

    async executar(codigo: string) {
      acumulado = ''
      const espaco = espacoDeNomesNovo()

      try {
        const bruto = await pyodide.runPythonAsync(codigo, { globals: espaco })
        const resultado = descreverResultado(bruto)

        return { texto: acumulado, resultado }
      } finally {
        // O espaço de nomes é um PyProxy: deixá-lo vivo vaza memória dentro do
        // WebAssembly, e cada execução cria um.
        espaco.destroy()
      }
    },
  }
}

/**
 * Endereço do carregador do Pyodide, a partir da pasta dos arquivos.
 *
 * Aceita as duas formas que aparecem na prática: uma URL (navegador: `/pyodide/`)
 * e um caminho de sistema de arquivos (teste em Node, que carrega o mesmo pacote
 * do disco). Sem esta conversão, o teste em Node tentaria importar um caminho
 * relativo como se fosse módulo do navegador.
 */
function especificadorDoModulo(endereco: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(endereco) || endereco.startsWith('/')) {
    return `${endereco}pyodide.mjs`
  }
  return new URL(`file://${endereco.replace(/\\/g, '/')}pyodide.mjs`).href
}

/**
 * Texto do valor da última expressão, ou `null` quando não há o que mostrar.
 *
 * Objetos que não são de tipo simples voltam do Pyodide como `PyProxy`, e o
 * `toString` deles chama o `str()` do Python — que é exatamente o que se espera
 * ver. O proxy é destruído em seguida: deixar proxies vivos vaza memória dentro
 * do WebAssembly.
 */
function descreverResultado(bruto: unknown): string | null {
  if (bruto === undefined || bruto === null) {
    return null
  }

  if (typeof bruto === 'object') {
    const proxy = bruto as { toString?: () => string; destroy?: () => void }
    let texto: string | null = null

    try {
      texto = typeof proxy.toString === 'function' ? proxy.toString() : null
    } finally {
      if (typeof proxy.destroy === 'function') {
        proxy.destroy()
      }
    }

    return texto === null || texto === '' ? '(objeto)' : texto
  }

  const texto = String(bruto)
  return texto === '' ? null : texto
}
