import { describe, expect, it } from 'vitest'
import {
  ROCHA_PADRAO,
  TOPO_PADRAO,
  deslocarMalha,
  gerarRocha,
  gerarTopo,
  juntarMalhas,
  perfilDeRaio,
  type Malha,
} from './ilha'

/** Confere que uma malha é utilizável: sem NaN, índices dentro da faixa. */
function conferirMalha(malha: Malha, nome: string): void {
  expect(malha.posicoes.length % 3, `${nome}: posições não são múltiplo de 3`).toBe(0)
  expect(malha.indices.length % 3, `${nome}: índices não formam triângulos`).toBe(0)

  for (const valor of malha.posicoes) {
    expect(Number.isFinite(valor), `${nome}: posição com valor inválido`).toBe(true)
  }

  const totalDeVertices = malha.posicoes.length / 3
  for (const indice of malha.indices) {
    expect(Number.isInteger(indice), `${nome}: índice não inteiro`).toBe(true)
    expect(indice, `${nome}: índice fora da faixa`).toBeGreaterThanOrEqual(0)
    expect(indice, `${nome}: índice fora da faixa`).toBeLessThan(totalDeVertices)
  }
}

describe('perfil da rocha', () => {
  it('começa no raio cheio e termina em zero', () => {
    expect(perfilDeRaio(0)).toBe(1)
    expect(perfilDeRaio(1)).toBe(0)
  })

  it('diminui conforme desce', () => {
    let anterior = perfilDeRaio(0)
    for (let t = 0.05; t <= 1; t += 0.05) {
      const atual = perfilDeRaio(t)
      expect(atual).toBeLessThanOrEqual(anterior)
      anterior = atual
    }
  })

  it('não estoura com valores fora da faixa', () => {
    expect(perfilDeRaio(-5)).toBe(1)
    expect(perfilDeRaio(9)).toBe(0)
  })

  it('afina rápido perto da ponta, dando forma de ilha e não de cone', () => {
    // Na metade da altura, a ilha ainda tem mais de um terço do raio do topo.
    expect(perfilDeRaio(0.5)).toBeGreaterThan(0.3)
  })
})

describe('malha da rocha', () => {
  it('gera malha utilizável', () => {
    conferirMalha(gerarRocha(), 'rocha padrão')
  })

  it('é determinística para a mesma semente', () => {
    // Se a rocha mudasse a cada render, o estudante não reconheceria o mundo.
    expect(gerarRocha({ ...ROCHA_PADRAO, semente: 5 })).toEqual(
      gerarRocha({ ...ROCHA_PADRAO, semente: 5 }),
    )
  })

  it('muda quando a semente muda', () => {
    expect(gerarRocha({ ...ROCHA_PADRAO, semente: 1 }).posicoes).not.toEqual(
      gerarRocha({ ...ROCHA_PADRAO, semente: 2 }).posicoes,
    )
  })

  it('tem um vértice por coluna em cada anel', () => {
    const opcoes = { ...ROCHA_PADRAO, segmentosRadiais: 8, aneis: 3 }
    const malha = gerarRocha(opcoes)
    expect(malha.posicoes.length / 3).toBe((opcoes.segmentosRadiais + 1) * (opcoes.aneis + 1))
  })

  it('gera dois triângulos por quadrado da malha', () => {
    const opcoes = { ...ROCHA_PADRAO, segmentosRadiais: 8, aneis: 3 }
    const malha = gerarRocha(opcoes)
    expect(malha.indices.length / 3).toBe(opcoes.segmentosRadiais * opcoes.aneis * 2)
  })

  it('respeita o raio do topo', () => {
    const malha = gerarRocha({ ...ROCHA_PADRAO, raioDoTopo: 5, amplitude: 0 })
    // Primeiro anel: todos os vértices a 5 unidades do eixo.
    for (let coluna = 0; coluna <= ROCHA_PADRAO.segmentosRadiais; coluna += 1) {
      const x = malha.posicoes[coluna * 3] ?? 0
      const z = malha.posicoes[coluna * 3 + 2] ?? 0
      expect(Math.hypot(x, z)).toBeCloseTo(5, 6)
    }
  })

  it('desce até a altura pedida e nunca abaixo', () => {
    const altura = 7
    const malha = gerarRocha({ ...ROCHA_PADRAO, altura, amplitude: 0 })
    const alturas: number[] = []
    for (let i = 1; i < malha.posicoes.length; i += 3) {
      alturas.push(malha.posicoes[i] ?? 0)
    }
    expect(Math.max(...alturas)).toBeCloseTo(0, 6)
    expect(Math.min(...alturas)).toBeCloseTo(-altura, 6)
  })

  it('a irregularidade não estoura a amplitude declarada', () => {
    const amplitude = 0.1
    const raioDoTopo = 4
    const malha = gerarRocha({ ...ROCHA_PADRAO, amplitude, raioDoTopo })
    const limite = raioDoTopo * (1 + amplitude) * 1.0001

    for (let i = 0; i < malha.posicoes.length; i += 3) {
      const raio = Math.hypot(malha.posicoes[i] ?? 0, malha.posicoes[i + 2] ?? 0)
      expect(raio).toBeLessThanOrEqual(limite)
    }
  })

  it('recusa configuração impossível em vez de gerar malha torta', () => {
    expect(() => gerarRocha({ ...ROCHA_PADRAO, segmentosRadiais: 2 })).toThrow(/3 segmentos/)
    expect(() => gerarRocha({ ...ROCHA_PADRAO, aneis: 0 })).toThrow(/1 anel/)
  })
})

describe('malha do topo', () => {
  it('gera malha utilizável', () => {
    conferirMalha(gerarTopo(), 'topo padrão')
  })

  it('é determinística para a mesma semente', () => {
    expect(gerarTopo({ ...TOPO_PADRAO, semente: 3 })).toEqual(
      gerarTopo({ ...TOPO_PADRAO, semente: 3 }),
    )
  })

  it('tem o centro mais o número de vértices dos anéis', () => {
    const opcoes = { ...TOPO_PADRAO, segmentosRadiais: 6, aneis: 2 }
    const malha = gerarTopo(opcoes)
    expect(malha.posicoes.length / 3).toBe(1 + (opcoes.segmentosRadiais + 1) * opcoes.aneis)
  })

  it('começa no centro, na altura zero', () => {
    const malha = gerarTopo()
    expect(malha.posicoes.slice(0, 3)).toEqual([0, 0, 0])
  })

  it('tem o raio da borda próximo do raio pedido', () => {
    const raio = 6
    const malha = gerarTopo({ ...TOPO_PADRAO, raio, amplitude: 0.12 })
    const ultimoAnel = malha.posicoes.length - (TOPO_PADRAO.segmentosRadiais + 1) * 3

    for (let i = ultimoAnel; i < malha.posicoes.length; i += 3) {
      const r = Math.hypot(malha.posicoes[i] ?? 0, malha.posicoes[i + 2] ?? 0)
      expect(r).toBeGreaterThan(raio * 0.85)
      expect(r).toBeLessThan(raio * 1.15)
    }
  })

  it('recusa configuração impossível', () => {
    expect(() => gerarTopo({ ...TOPO_PADRAO, segmentosRadiais: 1 })).toThrow(/3 segmentos/)
    expect(() => gerarTopo({ ...TOPO_PADRAO, aneis: 0 })).toThrow(/1 anel/)
  })
})

describe('operações sobre malhas', () => {
  it('desloca todos os vértices pelo mesmo vetor', () => {
    const original: Malha = { posicoes: [1, 2, 3, -1, -2, -3], indices: [0, 1, 0] }
    const deslocada = deslocarMalha(original, { x: 10, y: 20, z: 30 })

    expect(deslocada.posicoes).toEqual([11, 22, 33, 9, 18, 27])
    expect(deslocada.indices).toEqual(original.indices)
  })

  it('não altera a malha original ao deslocar', () => {
    const original: Malha = { posicoes: [1, 2, 3], indices: [0, 0, 0] }
    deslocarMalha(original, { x: 1, y: 1, z: 1 })
    expect(original.posicoes).toEqual([1, 2, 3])
  })

  it('junta malhas ajustando os índices da segunda', () => {
    const primeira: Malha = { posicoes: [0, 0, 0, 1, 0, 0, 0, 1, 0], indices: [0, 1, 2] }
    const segunda: Malha = { posicoes: [5, 5, 5, 6, 5, 5, 5, 6, 5], indices: [0, 1, 2] }
    const junta = juntarMalhas(primeira, segunda)

    expect(junta.posicoes.length).toBe(18)
    expect(junta.indices).toEqual([0, 1, 2, 3, 4, 5])
    conferirMalha(junta, 'malha juntada')
  })

  it('a malha juntada continua determinística', () => {
    const montar = () =>
      juntarMalhas(gerarRocha({ ...ROCHA_PADRAO, semente: 11 }), gerarTopo({ ...TOPO_PADRAO, semente: 11 }))
    expect(montar()).toEqual(montar())
  })
})
