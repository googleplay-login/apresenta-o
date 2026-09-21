import { beforeAll, describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { criarInterpretadorPyodide, type Interpretador } from './interpretadorPyodide'
import { atenderExecucao } from './nucleoDoPython'
import { execucaoDaResposta, linhasDaSaida, motivoDaRecusa } from './protocolo'
import {
  conferirExercicio,
  programaDaConferencia,
  separarSondagem,
  type ExecucaoParaConferir,
} from '../learning/correcaoDeExercicio'
import type { CorrecaoDoExercicio } from '../content/tiposDeConteudo'
import { CONTEUDO_DAS_UNIDADES } from '../content/unidades'

/**
 * O Pyodide **de verdade**, rodando Python de verdade, neste ambiente.
 *
 * Por que este arquivo existe: uma prova de conceito que só tem dublê não prova
 * nada sobre o interpretador. Aqui o WebAssembly é carregado do mesmo pacote que
 * o navegador baixa (`public/pyodide/`, copiado de `node_modules`), o Python 3.14
 * sobe em Node, e os programas são executados — inclusive os que erram.
 *
 * O que ele **não** prova, e está dito no relatório: que o Web Worker funcione no
 * navegador, que a tela reaja bem, e quanto tempo o carregamento leva de
 * verdade numa conexão comum. Nada disso este ambiente consegue medir.
 *
 * Sem rede: os arquivos são lidos do disco. Se algum dia este teste começar a
 * baixar alguma coisa, é sinal de que o empacotamento mudou.
 */

// Caminho de sistema de arquivos, e não URL: em Node o Pyodide lê os próprios
// arquivos do disco. No navegador a mesma função recebe `/pyodide/`.
const PASTA = join(process.cwd(), 'public', 'pyodide')

let interpretador: Interpretador

beforeAll(async () => {
  interpretador = await criarInterpretadorPyodide(PASTA)
}, 180_000)

describe('o interpretador carregado de verdade', () => {
  it('informa a versão do Python, e não a do Pyodide', () => {
    // `pyodide.version` devolve a versão do **Pyodide** (314.0.7), que não é a
    // versão do Python (3.14.0). Trocar as duas seria mentir sobre o que roda.
    expect(interpretador.versao).toMatch(/^3\.\d+\.\d+$/)
  })

  it('roda um programa e captura o que ele imprime', async () => {
    const resposta = await atenderExecucao(
      interpretador,
      1,
      'nome = "Ilha"\nprint(f"Olá, {nome}!")',
    )

    expect(resposta.tipo).toBe('saida')
    if (resposta.tipo === 'saida') {
      expect(resposta.texto).toBe('Olá, Ilha!\n')
      expect(linhasDaSaida(resposta.texto, resposta.resultado)).toEqual(['Olá, Ilha!'])
    }
  })

  it('devolve o valor da última expressão', async () => {
    const resposta = await atenderExecucao(interpretador, 2, '7 * 6')

    expect(resposta.tipo).toBe('saida')
    if (resposta.tipo === 'saida') {
      expect(resposta.resultado).toBe('42')
    }
  })

  it('captura o erro com o nome e a mensagem do Python', async () => {
    const resposta = await atenderExecucao(interpretador, 3, 'print(1 / 0)')

    expect(resposta.tipo).toBe('erroDePython')
    if (resposta.tipo === 'erroDePython') {
      // A mensagem é a do Python, e o nome do erro é o que a pessoa vai ler no
      // computador dela também: é isso que ensina a ler mensagem de erro (D-042).
      expect(resposta.texto).toContain('ZeroDivisionError')
      expect(resposta.texto).toContain('division by zero')
      expect(resposta.texto).toContain('Traceback')
    }
  })

  it('mostra o erro de sintaxe com a linha e o lugar onde ele está', async () => {
    const resposta = await atenderExecucao(interpretador, 4, 'print("oi"')

    expect(resposta.tipo).toBe('erroDePython')
    if (resposta.tipo === 'erroDePython') {
      expect(resposta.texto).toMatch(/SyntaxError|line/)
    }
  })

  it('roda o que o conteúdo das ilhas pede: listas, laços e formatação', async () => {
    // Este é o teste que interessa para o projeto: o Python que as unidades
    // ensinam é o Python que roda aqui. Se um dia o interpretador do navegador
    // não der conta de um recurso ensinado, é aqui que aparece.
    const programa = [
      'frutas = ["banana", "manga", "uva"]',
      'frutas.insert(0, "kiwi")',
      'for fruta in frutas:',
      '    print(fruta.upper())',
      'print(len(frutas), sorted(frutas)[0])',
    ].join('\n')

    const resposta = await atenderExecucao(interpretador, 5, programa)

    expect(resposta.tipo).toBe('saida')
    if (resposta.tipo === 'saida') {
      expect(resposta.texto).toBe('KIWI\nBANANA\nMANGA\nUVA\n4 banana\n')
    }
  })

  it('aceita f-string, método de string e conversão de tipo juntos', async () => {
    const programa = [
      'preco = 12.5',
      'quantidade = 3',
      'texto = f"Total: R$ {preco * quantidade:.2f}"',
      'print(texto.strip())',
      'print(str(quantidade) + " itens")',
    ].join('\n')

    const resposta = await atenderExecucao(interpretador, 6, programa)

    expect(resposta.tipo).toBe('saida')
    if (resposta.tipo === 'saida') {
      expect(resposta.texto).toBe('Total: R$ 37.50\n3 itens\n')
    }
  })

  it('captura a mensagem de erro escrita pelo próprio programa', async () => {
    const resposta = await atenderExecucao(
      interpretador,
      7,
      'raise ValueError("idade precisa ser número")',
    )

    expect(resposta.tipo).toBe('erroDePython')
    if (resposta.tipo === 'erroDePython') {
      expect(resposta.texto).toContain('ValueError')
      expect(resposta.texto).toContain('idade precisa ser número')
    }
  })

  it('resolve uma dependência da biblioteca padrão, sem rede', async () => {
    // `import` de biblioteca padrão tem de funcionar com os arquivos locais: é
    // isso que separa "o Python está aqui" de "o Python pede a internet".
    const resposta = await atenderExecucao(
      interpretador,
      8,
      'import math\nprint(math.gcd(12, 18))\nprint(round(math.sqrt(2), 3))',
    )

    expect(resposta.tipo).toBe('saida')
    if (resposta.tipo === 'saida') {
      expect(resposta.texto).toBe('6\n1.414\n')
    }
  })

  it('cada execução começa do zero: variável de antes não sobrevive', async () => {
    // Este teste nasceu de um defeito de verdade, encontrado pelo teste da
    // correção: sem espaço de nomes novo, `figurinhas = 40` de uma execução
    // continuava valendo na seguinte — e a conferência de um exercício chegava a
    // aprovar `print(40)` sozinho, medindo a variável deixada pelo programa
    // anterior. Quem roda um `.py` no computador não tem esse comportamento, e
    // aqui também não tem.
    const primeira = await atenderExecucao(interpretador, 50, 'figurinhas = 40\nprint(figurinhas)')
    expect(primeira.tipo).toBe('saida')

    const segunda = await atenderExecucao(interpretador, 51, 'print(figurinhas)')

    expect(segunda.tipo).toBe('erroDePython')
    if (segunda.tipo === 'erroDePython') {
      expect(segunda.texto).toContain("name 'figurinhas' is not defined")
    }
  })

  it('recusa programa vazio antes de executar', async () => {
    const resposta = await atenderExecucao(interpretador, 9, '   ')

    expect(resposta.tipo).toBe('recusado')
  })
})

describe('o código que as ilhas ensinam roda de verdade', () => {
  /**
   * O trecho que a pessoa vai copiar para o console — bloco de explicação ou
   * solução de exercício — precisa rodar **sem erro** no mesmo interpretador que
   * o navegador baixa. Se não rodar, o conteúdo está ensinando algo que não
   * funciona, e quem descobre é o estudante.
   *
   * Os trechos que não rodam no console (comando de terminal, exemplo que erra
   * de propósito, programa que lê o teclado) têm de estar **marcados** como tal,
   * e o outro teste deste bloco cobra isso.
   */
  it('todo trecho não marcado roda sem erro, em todas as unidades', async () => {
    let conferidos = 0
    const problemas: string[] = []

    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      const trechos: { readonly onde: string; readonly codigo: string }[] = []

      for (const bloco of unidade.explicacao) {
        if (bloco.tipo === 'codigo' && bloco.linguagem === 'python' && bloco.naoRodaNoConsole === undefined) {
          trechos.push({ onde: `${unidade.id}/bloco:${bloco.legenda ?? 'sem legenda'}`, codigo: bloco.codigo })
        }
      }
      for (const exercicio of unidade.pratica) {
        if (exercicio.naoRodaNoConsole === undefined) {
          trechos.push({ onde: `${unidade.id}/${exercicio.id}`, codigo: exercicio.solucao })
        }
      }

      for (const trecho of trechos) {
        conferidos += 1
        const resposta = await atenderExecucao(interpretador, 100 + conferidos, trecho.codigo)
        if (resposta.tipo !== 'saida') {
          const texto = resposta.tipo === 'erroDePython' ? resposta.texto.split('\n').slice(-3).join(' | ') : JSON.stringify(resposta)
          problemas.push(`${trecho.onde}: ${texto}`)
        }
      }
    }

    // A conta sai do conteúdo: se um trecho for acrescentado e não rodar, este
    // teste acusa; se a lista de trechos encolher sem ninguém notar, acusa também.
    const esperados = contarTrechosQueRodam()
    expect(esperados, 'nenhum trecho de código encontrado no conteúdo').toBeGreaterThanOrEqual(15)
    expect(conferidos, 'trechos a menos do que o conteúdo tem').toBe(esperados)
    expect(problemas, `Trechos que não rodam:\n${problemas.join('\n')}`).toEqual([])
  }, 180_000)

  it('todo trecho marcado como "não roda" de fato não roda no console', async () => {
    // Cobra o contrário: marcar como "não roda" um programa que roda tiraria do
    // estudante um recurso que funcionaria. Aceita duas formas de "não roda":
    // recusa do console (teclado, tamanho) ou erro do próprio Python.
    const marcados: { readonly onde: string; readonly codigo: string }[] = []

    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      for (const bloco of unidade.explicacao) {
        if (bloco.tipo === 'codigo' && bloco.linguagem === 'python' && bloco.naoRodaNoConsole !== undefined) {
          marcados.push({ onde: `${unidade.id}/bloco:${bloco.legenda ?? 'sem legenda'}`, codigo: bloco.codigo })
        }
      }
      for (const exercicio of unidade.pratica) {
        if (exercicio.naoRodaNoConsole !== undefined) {
          marcados.push({ onde: `${unidade.id}/${exercicio.id}`, codigo: exercicio.solucao })
        }
      }
    }

    expect(marcados.length, 'nenhum trecho marcado como "não roda" — a marcação sumiu?').toBe(
      contarTrechosMarcados(),
    )
    expect(marcados.length).toBeGreaterThanOrEqual(3)

    for (const trecho of marcados) {
      const recusa = motivoDaRecusa(trecho.codigo)
      if (recusa !== null) {
        continue
      }

      const resposta = await atenderExecucao(interpretador, 900, trecho.codigo)
      expect(
        resposta.tipo,
        `${trecho.onde} está marcado como "não roda", mas rodou: ${JSON.stringify(resposta).slice(0, 200)}`,
      ).toBe('erroDePython')
    }
  }, 180_000)
})

/** Roda um programa e devolve o que a correção precisa ver — pelo mesmo caminho da tela. */
async function executar(id: number, programa: string): Promise<ExecucaoParaConferir> {
  const resposta = await atenderExecucao(interpretador, id, programa)
  const execucao = execucaoDaResposta(resposta, programa)
  if (execucao === null) {
    throw new Error(`resposta inesperada do núcleo: ${JSON.stringify(resposta)}`)
  }
  return execucao
}

/** Explica, em uma linha, por que uma conferência não deu certo. */
function pendencias(resultado: ReturnType<typeof conferirExercicio>): string {
  return resultado.itens
    .filter((item) => item.situacao !== 'deuCerto')
    .map((item) => `${item.rotulo}: esperava ${item.esperado}, veio ${item.obtido}`)
    .join(' | ')
}

describe('a correção automática, contra o Python de verdade', () => {
  it('a resposta de referência passa na correção do próprio exercício', async () => {
    // É este teste que impede a correção de mentir. Uma correção que reprovasse
    // a resposta certa seria pior do que não existir: ensinaria o errado a quem
    // acertou. Aqui a solução de cada exercício roda **no interpretador real**,
    // com a sonda da própria correção, e precisa ser aprovada por ela.
    const problemas: string[] = []
    let conferidos = 0

    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      for (const exercicio of unidade.pratica) {
        if (exercicio.correcao === undefined) {
          continue
        }
        conferidos += 1
        const referencia = exercicio.solucaoQueRodaNoConsole ?? exercicio.solucao
        const execucao = await executar(
          1000 + conferidos,
          programaDaConferencia(referencia, exercicio.correcao),
        )
        const resultado = conferirExercicio(exercicio.correcao, execucao)
        if (resultado.situacao !== 'deuCerto') {
          problemas.push(`${unidade.id}/${exercicio.id}: ${resultado.situacao} — ${pendencias(resultado)}`)
        }
      }
    }

    // Todos os exercícios com correção, e não "pelo menos dez": é a conta do
    // conteúdo, para nenhum exercício passar sem ter a solução conferida aqui.
    const comCorrecao = CONTEUDO_DAS_UNIDADES.flatMap((unidade) => unidade.pratica).filter(
      (exercicio) => exercicio.correcao !== undefined,
    ).length
    expect(comCorrecao).toBeGreaterThanOrEqual(10)
    expect(conferidos).toBe(comCorrecao)
    expect(problemas, `A correção reprovou a resposta certa:\n${problemas.join('\n')}`).toEqual([])
  }, 180_000)

  it('a correção reprova respostas erradas de verdade, e cada uma por seu motivo', async () => {
    // Sem esta prova, uma correção que sempre aprovasse passaria no teste acima.
    const casos: readonly {
      readonly exercicio: string
      readonly rotulo: string
      readonly codigo: string
    }[] = [
      {
        exercicio: 'e2-2',
        rotulo: 'imprimir o resultado sem guardar em variável',
        codigo: 'print(40)',
      },
      {
        exercicio: 'e2-3',
        rotulo: 'dividir com // e perder as casas decimais',
        codigo: 'media = (7 + 9 + 5) // 3\nprint(media)',
      },
      {
        exercicio: 'e2-1',
        rotulo: 'guardar a idade como texto',
        codigo:
          'nome = "Ana"\nidade = "34"\naltura = 1.72\nprint("Nome: " + nome)\nprint("Idade: " + idade)\nprint("Altura: " + str(altura))',
      },
      {
        exercicio: 'e4-3',
        rotulo: 'usar .sort() e alterar a lista original',
        codigo:
          'numeros = [42, 7, 19, 3, 28]\nnumeros.sort()\nprint(sum(numeros))\nprint(max(numeros))\nprint(min(numeros))\nprint(numeros)\nprint(numeros)',
      },
    ]

    const problemas: string[] = []

    for (const [indice, caso] of casos.entries()) {
      const exercicio = CONTEUDO_DAS_UNIDADES.flatMap((unidade) => unidade.pratica).find(
        (candidato) => candidato.id === caso.exercicio,
      )
      if (exercicio?.correcao === undefined) {
        problemas.push(`${caso.exercicio}: exercício sem correção no conteúdo`)
        continue
      }

      const execucao = await executar(
        2000 + indice,
        programaDaConferencia(caso.codigo, exercicio.correcao),
      )
      const resultado = conferirExercicio(exercicio.correcao, execucao)
      if (resultado.situacao === 'deuCerto') {
        problemas.push(`${caso.exercicio} (${caso.rotulo}) foi aprovado, e não devia`)
      }
    }

    expect(problemas, `Respostas erradas que a correção aprovou:\n${problemas.join('\n')}`).toEqual(
      [],
    )
  }, 180_000)

  it('a correção não reprova outra resposta certa, com outros dados', async () => {
    const casos: readonly {
      readonly exercicio: string
      readonly codigo: string
    }[] = [
      {
        exercicio: 'e3-1',
        codigo: 'nome = "  ana  "\nprint(nome.strip().upper())',
      },
      {
        exercicio: 'e4-1',
        codigo:
          'cores = ["rosa", "preto", "branco", "cinza"]\nprint("Primeira:", cores[0])\nprint("Última:", cores[-1])\nprint("Quantas:", len(cores))',
      },
      {
        exercicio: 'e4-2',
        codigo:
          'frutas = ["pera", "uva", "manga"]\nprint(frutas)\nfrutas.append("abacate")\nprint(frutas)\nfrutas.insert(0, "kiwi")\nprint(frutas)\nfrutas.remove("uva")\nprint(frutas)',
      },
    ]

    const problemas: string[] = []

    for (const [indice, caso] of casos.entries()) {
      const exercicio = CONTEUDO_DAS_UNIDADES.flatMap((unidade) => unidade.pratica).find(
        (candidato) => candidato.id === caso.exercicio,
      )
      if (exercicio?.correcao === undefined) {
        problemas.push(`${caso.exercicio}: exercício sem correção no conteúdo`)
        continue
      }

      const execucao = await executar(
        3000 + indice,
        programaDaConferencia(caso.codigo, exercicio.correcao),
      )
      const resultado = conferirExercicio(exercicio.correcao, execucao)
      if (resultado.situacao !== 'deuCerto') {
        problemas.push(`${caso.exercicio}: ${resultado.situacao} — ${pendencias(resultado)}`)
      }
    }

    expect(
      problemas,
      `A correção reprovou uma resposta certa, com outros dados:\n${problemas.join('\n')}`,
    ).toEqual([])
  }, 180_000)

  it('sonda que não existe não vira aprovação silenciosa', async () => {
    // Correção nossa, com uma expressão que não existe no programa: a medida não
    // chega, e a conferência tem de dizer isso — e nunca "tudo confere".
    const correcao: CorrecaoDoExercicio = {
      valoresEsperados: [{ rotulo: 'O valor de naoexiste', expressao: 'naoexiste', tipoEsperado: 'int' }],
      limite: 'Correção de teste, montada aqui dentro.',
    }

    const execucao = await executar(
      4000,
      programaDaConferencia('print("oi")', correcao),
    )
    const resultado = conferirExercicio(correcao, execucao)

    // Desde D-052, a medida que falha é declarada: o programa **não** termina com
    // erro, e o item diz que a conferência não conseguiu olhar aquele nome.
    expect(execucao.foiErro).toBe(false)
    expect(resultado.situacao).toBe('naoDeuParaConferir')
    expect(resultado.itens[0]?.obtido).toContain('esse nome')
  }, 180_000)

  it('a sonda sobrevive a aspas, acento, quebra de linha e ao sinal do marcador', async () => {
    const codigo = 'texto = "a§b \\"c\\" \\n d"\nprint("ok")'
    const correcao: CorrecaoDoExercicio = {
      valoresEsperados: [{ rotulo: 'O texto', expressao: 'texto', tipoEsperado: 'str' }],
      limite: 'Correção de teste, montada aqui dentro.',
    }

    const execucao = await executar(4001, programaDaConferencia(codigo, correcao))
    const { doPrograma, sondas } = separarSondagem(execucao.linhas)

    expect(conferirExercicio(correcao, execucao).situacao).toBe('deuCerto')
    expect(doPrograma).toEqual(['ok'])
    expect(sondas).toHaveLength(1)
    expect(sondas[0]?.texto).toBe('a§b "c" \n d')
  }, 180_000)
})

/** Quantos trechos de Python o conteúdo promete que rodam. */
function contarTrechosQueRodam(): number {
  let total = 0
  for (const unidade of CONTEUDO_DAS_UNIDADES) {
    for (const bloco of unidade.explicacao) {
      if (bloco.tipo === 'codigo' && bloco.linguagem === 'python' && bloco.naoRodaNoConsole === undefined) {
        total += 1
      }
    }
    for (const exercicio of unidade.pratica) {
      if (exercicio.naoRodaNoConsole === undefined) {
        total += 1
      }
    }
  }
  return total
}

/** Quantos trechos o conteúdo marca como "não roda no console". */
function contarTrechosMarcados(): number {
  let total = 0
  for (const unidade of CONTEUDO_DAS_UNIDADES) {
    for (const bloco of unidade.explicacao) {
      if (bloco.tipo === 'codigo' && bloco.linguagem === 'python' && bloco.naoRodaNoConsole !== undefined) {
        total += 1
      }
    }
    for (const exercicio of unidade.pratica) {
      if (exercicio.naoRodaNoConsole !== undefined) {
        total += 1
      }
    }
  }
  return total
}
