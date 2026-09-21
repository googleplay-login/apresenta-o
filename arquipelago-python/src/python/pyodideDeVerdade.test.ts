import { beforeAll, describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { criarInterpretadorPyodide, type Interpretador } from './interpretadorPyodide'
import { atenderExecucao } from './nucleoDoPython'
import { linhasDaSaida, motivoDaRecusa } from './protocolo'
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
  it('todo trecho não marcado roda sem erro, nas quatro unidades', async () => {
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

    expect(conferidos, 'nenhum trecho de código encontrado no conteúdo').toBeGreaterThanOrEqual(15)
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

    expect(marcados.length, 'nenhum trecho marcado como "não roda" — a marcação sumiu?').toBeGreaterThanOrEqual(3)

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
