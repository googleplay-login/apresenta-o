import { describe, expect, it } from 'vitest'
import { criarSorteador, entre, sementeDeTexto } from './aleatorio'

describe('sorteador com semente', () => {
  it('devolve sempre a mesma sequência para a mesma semente', () => {
    // É isto que garante que o mundo não muda de forma ao recarregar a página.
    const primeira = Array.from({ length: 8 }, criarSorteador(42))
    const segunda = Array.from({ length: 8 }, criarSorteador(42))
    expect(primeira).toEqual(segunda)
  })

  it('devolve sequências diferentes para sementes diferentes', () => {
    const primeira = Array.from({ length: 8 }, criarSorteador(1))
    const segunda = Array.from({ length: 8 }, criarSorteador(2))
    expect(primeira).not.toEqual(segunda)
  })

  it('devolve sempre entre 0 e 1', () => {
    const sortear = criarSorteador(1234)
    for (let i = 0; i < 2000; i += 1) {
      const valor = sortear()
      expect(valor).toBeGreaterThanOrEqual(0)
      expect(valor).toBeLessThan(1)
    }
  })

  it('espalha os valores de forma razoavelmente uniforme', () => {
    // Não é um teste de qualidade estatística: é uma trava contra um gerador
    // quebrado, que devolveria sempre o mesmo valor.
    const sortear = criarSorteador(7)
    const faixas = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    const total = 20000

    for (let i = 0; i < total; i += 1) {
      const indice = Math.floor(sortear() * 10)
      faixas[indice] = (faixas[indice] ?? 0) + 1
    }

    for (const quantidade of faixas) {
      expect(quantidade).toBeGreaterThan(total / 10 - total / 20)
      expect(quantidade).toBeLessThan(total / 10 + total / 20)
    }
  })

  it('não devolve número inválido', () => {
    const sortear = criarSorteador(0)
    for (let i = 0; i < 500; i += 1) {
      expect(Number.isFinite(sortear())).toBe(true)
    }
  })
})

describe('faixa de valores', () => {
  it('devolve valor dentro do intervalo pedido', () => {
    const sortear = criarSorteador(99)
    for (let i = 0; i < 500; i += 1) {
      const valor = entre(sortear, -3, 5)
      expect(valor).toBeGreaterThanOrEqual(-3)
      expect(valor).toBeLessThan(5)
    }
  })
})

describe('semente a partir de texto', () => {
  it('é estável para o mesmo texto', () => {
    expect(sementeDeTexto('u01-primeiro-programa')).toBe(sementeDeTexto('u01-primeiro-programa'))
  })

  it('muda quando o texto muda', () => {
    expect(sementeDeTexto('u01')).not.toBe(sementeDeTexto('u02'))
  })

  it('devolve inteiro sem sinal de 32 bits', () => {
    for (const texto of ['a', 'u01-primeiro-programa', 'ilha com acentuação: ção']) {
      const semente = sementeDeTexto(texto)
      expect(Number.isInteger(semente)).toBe(true)
      expect(semente).toBeGreaterThanOrEqual(0)
      expect(semente).toBeLessThanOrEqual(4294967295)
    }
  })

  it('distingue textos parecidos', () => {
    // Colisão aqui significaria duas ilhas com a mesma rocha.
    const sementes = ['u01', 'u02', 'u03', 'u04'].map(sementeDeTexto)
    expect(new Set(sementes).size).toBe(4)
  })
})
