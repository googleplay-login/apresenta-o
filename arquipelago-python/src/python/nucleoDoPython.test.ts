import { describe, expect, it, vi } from 'vitest'
import { atenderExecucao } from './nucleoDoPython'
import type { Interpretador } from './interpretadorPyodide'
import { LIMITE_DE_CARACTERES } from './protocolo'

/**
 * O núcleo que decide o que fazer com o resultado, sem Web Worker nenhum.
 *
 * O trabalhador em si (`trabalhadorDoPython.ts`) não roda em teste neste
 * ambiente: Web Worker é do navegador. O que roda aqui é a parte que **decide**
 * — recusar, empacotar a saída, transformar falha em mensagem —, e é essa parte
 * que erra de verdade.
 */

function interpretadorFalso(
  executar: (codigo: string) => Promise<{ texto: string; resultado: string | null }>,
): Interpretador {
  return { versao: '3.14.0-de-teste', executar }
}

describe('execução aceita', () => {
  it('devolve a saída do programa com o número da execução', async () => {
    const interpretador = interpretadorFalso(async () => ({ texto: 'Olá\n', resultado: null }))

    await expect(atenderExecucao(interpretador, 1, 'print("Olá")')).resolves.toEqual({
      tipo: 'saida',
      id: 1,
      texto: 'Olá\n',
      resultado: null,
    })
  })

  it('devolve o valor da última expressão junto da saída', async () => {
    const interpretador = interpretadorFalso(async () => ({ texto: 'antes\n', resultado: '7' }))

    const resposta = await atenderExecucao(interpretador, 4, 'print("antes")\n3 + 4')

    expect(resposta).toEqual({ tipo: 'saida', id: 4, texto: 'antes\n', resultado: '7' })
  })

  it('não passa o código adiante quando ele está vazio', async () => {
    // Recusar antes de acordar o interpretador é o que evita carregar 14 MB por
    // causa de um campo em branco.
    const executar = vi.fn()
    const resposta = await atenderExecucao(interpretadorFalso(executar), 2, '   ')

    expect(executar).not.toHaveBeenCalled()
    expect(resposta).toEqual({
      tipo: 'recusado',
      id: 2,
      motivo: expect.stringContaining('campo está vazio'),
    })
  })

  it('recusa programa grande demais citando o limite', async () => {
    const executar = vi.fn()
    const resposta = await atenderExecucao(
      interpretadorFalso(executar),
      3,
      'x'.repeat(LIMITE_DE_CARACTERES + 10),
    )

    expect(executar).not.toHaveBeenCalled()
    expect(resposta.tipo).toBe('recusado')
    if (resposta.tipo === 'recusado') {
      expect(resposta.motivo).toContain(`${LIMITE_DE_CARACTERES}`)
    }
  })
})

describe('erro do Python', () => {
  it('transforma a exceção em mensagem para a tela, sem reescrever', async () => {
    const traceback = 'Traceback (most recent call last):\n  File "<exec>", line 1\nZeroDivisionError: division by zero'
    const interpretador = interpretadorFalso(async () => {
      throw new Error(traceback)
    })

    const resposta = await atenderExecucao(interpretador, 9, 'print(1/0)')

    expect(resposta).toEqual({ tipo: 'erroDePython', id: 9, texto: traceback })
  })

  it('nunca devolve texto vazio, mesmo quando o erro não traz mensagem', async () => {
    const interpretador = interpretadorFalso(async () => {
      throw undefined
    })

    const resposta = await atenderExecucao(interpretador, 10, 'print(1)')

    expect(resposta.tipo).toBe('erroDePython')
    if (resposta.tipo === 'erroDePython') {
      expect(resposta.texto).toMatch(/sem dizer por quê/)
    }
  })

  it('não deixa a falha de um programa escapar como promessa rejeitada', async () => {
    // Uma promessa rejeitada dentro do trabalhador vira erro silencioso: a tela
    // espera para sempre. Este teste cobra que a falha vire **resposta**.
    const interpretador = interpretadorFalso(async () => {
      throw new Error('boom')
    })

    await expect(atenderExecucao(interpretador, 11, 'print(1)')).resolves.toMatchObject({
      tipo: 'erroDePython',
    })
  })
})
