import { describe, expect, it } from 'vitest'
import {
  LIMITE_DE_CARACTERES,
  ehResposta,
  linhasDaSaida,
  motivoDaRecusa,
  pedidoDeCarregar,
  pedidoDeExecucao,
  textoDoErro,
} from './protocolo'

describe('os pedidos que saem do app', () => {
  it('pede o carregamento com a pasta dos arquivos', () => {
    expect(pedidoDeCarregar('/pyodide/')).toEqual({ tipo: 'carregar', url: '/pyodide/' })
  })

  it('pede a execução com o número da execução e o código', () => {
    expect(pedidoDeExecucao(7, 'print(1)')).toEqual({ tipo: 'executar', id: 7, codigo: 'print(1)' })
  })
})

describe('a recusa antes de acordar o trabalhador', () => {
  it('recusa campo vazio, inclusive com espaços e quebras de linha', () => {
    expect(motivoDaRecusa('')).toMatch(/campo está vazio/)
    expect(motivoDaRecusa('   \n\t ')).toMatch(/campo está vazio/)
  })

  it('recusa programa maior que o limite, dizendo os dois números', () => {
    const gigante = 'x'.repeat(LIMITE_DE_CARACTERES + 1)
    const motivo = motivoDaRecusa(gigante)

    expect(motivo).toContain(`${LIMITE_DE_CARACTERES + 1} caracteres`)
    expect(motivo).toContain(`${LIMITE_DE_CARACTERES}`)
  })

  it('recusa input(), com o motivo medido e o caminho de saída', () => {
    // Medido, não imaginado: com o interpretador de verdade, um programa com
    // `input()` ficou esperando para sempre. A recusa troca um travamento
    // silencioso por uma explicação.
    const motivo = motivoDaRecusa('nome = input("Seu nome: ")')
    expect(motivo).toMatch(/não tem teclado/)
    expect(motivo).toMatch(/nome = "Ana"/)
    expect(motivoDaRecusa('import sys\nsys.stdin.readline()')).toMatch(/não tem teclado/)
  })

  it('não confunde um nome de variável com o input()', () => {
    // `meu_input` não é `input`: o limite de palavra evita acusar código certo.
    expect(motivoDaRecusa('meu_input = 3\nprint(meu_input)')).toBeNull()
    expect(motivoDaRecusa('entrada = "digitado"')).toBeNull()
  })

  it('aceita o limite exato e um programa comum', () => {
    expect(motivoDaRecusa('x'.repeat(LIMITE_DE_CARACTERES))).toBeNull()
    expect(motivoDaRecusa('print("oi")')).toBeNull()
  })
})

describe('o que chega do trabalhador', () => {
  it('aceita as cinco respostas do protocolo', () => {
    expect(ehResposta({ tipo: 'pronto', versao: '3.14.0' })).toBe(true)
    expect(ehResposta({ tipo: 'saida', id: 1, texto: 'oi\n', resultado: null })).toBe(true)
    expect(ehResposta({ tipo: 'saida', id: 1, texto: '', resultado: '5' })).toBe(true)
    expect(ehResposta({ tipo: 'erroDePython', id: 1, texto: 'Traceback…' })).toBe(true)
    expect(ehResposta({ tipo: 'recusado', id: 1, motivo: 'vazio' })).toBe(true)
    expect(ehResposta({ tipo: 'erroDeCarga', texto: 'sem rede' })).toBe(true)
  })

  it('recusa o que não é do protocolo, em vez de deixar entrar', () => {
    expect(ehResposta(null)).toBe(false)
    expect(ehResposta('pronto')).toBe(false)
    expect(ehResposta({ tipo: 'pronto' })).toBe(false)
    expect(ehResposta({ tipo: 'saida', id: 'um', texto: '', resultado: null })).toBe(false)
    expect(ehResposta({ tipo: 'saida', id: 1, texto: '', resultado: 5 })).toBe(false)
    expect(ehResposta({ tipo: 'qualquerOutraCoisa' })).toBe(false)
  })
})

describe('o texto do erro', () => {
  it('usa a mensagem do erro quando existe', () => {
    expect(textoDoErro(new Error('ZeroDivisionError: division by zero'))).toBe(
      'ZeroDivisionError: division by zero',
    )
  })

  it('usa a própria string quando o que chegou é texto', () => {
    expect(textoDoErro('falhou')).toBe('falhou')
  })

  it('nunca devolve vazio, mesmo sem informação nenhuma', () => {
    expect(textoDoErro(undefined)).toMatch(/sem dizer por quê/)
    expect(textoDoErro(new Error('   '))).toMatch(/sem dizer por quê/)
    expect(textoDoErro(42)).toMatch(/sem dizer por quê/)
  })
})

describe('a saída que aparece na tela', () => {
  it('mostra o que foi impresso, linha por linha', () => {
    expect(linhasDaSaida('um\ndois\n', null)).toEqual(['um', 'dois'])
  })

  it('mostra o valor da última expressão com uma seta', () => {
    // O terminal mostra o valor da expressão sozinho; aqui ele aparece com uma
    // seta para não se confundir com o que o programa imprimiu.
    expect(linhasDaSaida('', '5')).toEqual(['→ 5'])
    expect(linhasDaSaida('a soma é\n', '5')).toEqual(['a soma é', '→ 5'])
  })

  it('não inventa linha quando não houve saída nem valor', () => {
    expect(linhasDaSaida('', null)).toEqual([])
    expect(linhasDaSaida('\n', null)).toEqual([])
  })

  it('preserva linha vazia no meio da saída', () => {
    expect(linhasDaSaida('um\n\ntres\n', null)).toEqual(['um', '', 'tres'])
  })
})
