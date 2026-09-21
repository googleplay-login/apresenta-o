import { describe, expect, it } from 'vitest'
import type { Malha } from './ilha'
import {
  gerarArvore,
  gerarBiblioteca,
  gerarCaixa,
  gerarCilindro,
  gerarMesa,
  gerarPedra,
  gerarPlaca,
  gerarPonte,
  montar,
} from './solidos'
import { juntarMalhas } from './ilha'

/** Confere invariantes que valem para toda malha: índices válidos e sem NaN. */
function conferirMalha(malha: Malha, onde: string) {
  const vertices = malha.posicoes.length / 3

  expect(malha.posicoes.length % 3, `${onde}: posições devem vir em trios`).toBe(0)
  expect(malha.indices.length % 3, `${onde}: índices devem vir em trios`).toBe(0)

  for (const valor of malha.posicoes) {
    expect(Number.isFinite(valor), `${onde}: posição não finita (${valor})`).toBe(true)
  }

  for (const indice of malha.indices) {
    expect(Number.isInteger(indice), `${onde}: índice não inteiro (${indice})`).toBe(true)
    expect(indice, `${onde}: índice fora da malha (${indice})`).toBeGreaterThanOrEqual(0)
    expect(indice, `${onde}: índice fora da malha (${indice})`).toBeLessThan(vertices)
  }

  return vertices
}

/** Caixa envolvente, para conferir se a peça cabe onde deveria. */
function limites(malha: Malha) {
  const xs = malha.posicoes.filter((_valor, indice) => indice % 3 === 0)
  const ys = malha.posicoes.filter((_valor, indice) => indice % 3 === 1)
  const zs = malha.posicoes.filter((_valor, indice) => indice % 3 === 2)
  return {
    x: [Math.min(...xs), Math.max(...xs)] as const,
    y: [Math.min(...ys), Math.max(...ys)] as const,
    z: [Math.min(...zs), Math.max(...zs)] as const,
  }
}

describe('caixa', () => {
  it('tem quatro vértices por face e doze triângulos', () => {
    // As faces não compartilham vértices: com vértice compartilhado, a aresta
    // ficaria suavizada e a caixa pareceria uma bolha. Aqui cada face tem os
    // seus, o que mantém o canto vivo.
    const caixa = gerarCaixa({ largura: 2, altura: 3, profundidade: 4 })
    expect(conferirMalha(caixa, 'caixa')).toBe(6 * 4)
    expect(caixa.indices.length / 3).toBe(12)
  })

  it('cresce a partir da origem quando não recebe centro', () => {
    const caixa = gerarCaixa({ largura: 2, altura: 3, profundidade: 4 })
    expect(limites(caixa)).toEqual({ x: [0, 2], y: [0, 3], z: [0, 4] })
  })

  it('fica centrada quando recebe o centro', () => {
    const caixa = gerarCaixa({
      largura: 2,
      altura: 2,
      profundidade: 2,
      centro: { x: 10, y: 20, z: 30 },
    })
    expect(limites(caixa)).toEqual({ x: [9, 11], y: [19, 21], z: [29, 31] })
  })

  it('recusa medidas inválidas', () => {
    expect(() => gerarCaixa({ largura: 0, altura: 1, profundidade: 1 })).toThrow(/maiores que zero/)
    expect(() => gerarCaixa({ largura: 1, altura: 1, profundidade: -1 })).toThrow(
      /maiores que zero/,
    )
  })
})

describe('cilindro', () => {
  it('tem um vértice por lado, em cima e embaixo, mais os centros das tampas', () => {
    const cilindro = gerarCilindro({ raio: 1, altura: 2, lados: 6 })
    // 7 colunas (a última fecha a volta) × 2 alturas, mais os dois centros
    expect(conferirMalha(cilindro, 'cilindro')).toBe(7 * 2 + 2)
  })

  it('começa na base e termina na altura pedida', () => {
    const cilindro = gerarCilindro({ raio: 1, altura: 2.5, lados: 8, base: { x: 0, y: 1, z: 0 } })
    expect(limites(cilindro).y).toEqual([1, 3.5])
  })

  it('respeita o raio em x e z', () => {
    const cilindro = gerarCilindro({ raio: 3, altura: 1, lados: 12 })
    expect(limites(cilindro).x[0]).toBeCloseTo(-3, 5)
    expect(limites(cilindro).x[1]).toBeCloseTo(3, 5)
    expect(limites(cilindro).z[0]).toBeCloseTo(-3, 5)
  })

  it('pode ser gerado sem tampas', () => {
    const semTampas = gerarCilindro({ raio: 1, altura: 1, lados: 5, comTampas: false })
    const comTampas = gerarCilindro({ raio: 1, altura: 1, lados: 5, comTampas: true })
    expect(semTampas.posicoes.length).toBe(comTampas.posicoes.length - 6)
  })

  it('recusa poucos lados e medidas inválidas', () => {
    expect(() => gerarCilindro({ raio: 1, altura: 1, lados: 2 })).toThrow(/ao menos 3 lados/)
    expect(() => gerarCilindro({ raio: 0, altura: 1, lados: 6 })).toThrow(/maiores que zero/)
  })
})

describe('montagem', () => {
  it('montar é o mesmo que juntar as peças em sequência', () => {
    const pecas = [
      gerarCaixa({ largura: 1, altura: 1, profundidade: 1 }),
      gerarCilindro({ raio: 0.5, altura: 2, lados: 6 }),
      gerarCaixa({ largura: 2, altura: 1, profundidade: 1 }),
    ]
    expect(montar(pecas)).toEqual(pecas.reduce(juntarMalhas))
  })

  it('mantém os índices válidos ao juntar peças', () => {
    conferirMalha(montar([gerarCaixa({ largura: 1, altura: 1, profundidade: 1 }), gerarMesa({ largura: 2, altura: 1 })]), 'montagem')
  })
})

describe('ponte', () => {
  const base = { comprimento: 10, largura: 3, tabuas: 10 }

  it('usa todas as tábuas quando liberada, e para no meio quando bloqueada', () => {
    const liberada = gerarPonte({ ...base, liberada: true })
    const bloqueada = gerarPonte({ ...base, liberada: false })

    expect(bloqueada.corrimao).toBeNull()
    expect(liberada.corrimao).not.toBeNull()
    // Tábuas + postes: a bloqueada tem menos peças que a liberada.
    expect(bloqueada.estrutura.posicoes.length).toBeLessThan(liberada.estrutura.posicoes.length)
  })

  it('vai de ponta a ponta quando liberada', () => {
    const { estrutura } = gerarPonte({ ...base, liberada: true })
    const caixa = limites(estrutura)
    // As tábuas são centradas na vaga de cada uma, com uma folga pequena entre
    // elas: a ponte cobre o vão inteiro, sem encostar na divisa exata.
    expect(caixa.x[0]).toBeLessThan(0.5)
    expect(caixa.x[1]).toBeGreaterThan(9.5)
  })

  it('deixa o vão aberto quando bloqueada', () => {
    const { estrutura } = gerarPonte({ ...base, liberada: false })
    const fim = limites(estrutura).x[1]
    expect(fim).toBeLessThan(10)
    expect(fim).toBeGreaterThan(0)
  })

  it('tem corrimão só quando liberada, e o corrimão é uma malha válida', () => {
    const { corrimao } = gerarPonte({ ...base, liberada: true })
    expect(corrimao).not.toBeNull()
    conferirMalha(corrimao!, 'corrimão')
  })

  it('recusa comprimento, largura e número de tábuas inválidos', () => {
    expect(() => gerarPonte({ comprimento: 0, largura: 3, tabuas: 4, liberada: true })).toThrow(
      /maiores que zero/,
    )
    expect(() => gerarPonte({ comprimento: 10, largura: 3, tabuas: 1, liberada: true })).toThrow(
      /ao menos 2 tábuas/,
    )
  })
})

describe('estruturas da ilha', () => {
  it('biblioteca: cabe na largura pedida, com telhado um pouco maior', () => {
    const biblioteca = gerarBiblioteca({ largura: 4, altura: 3, profundidade: 3 })
    const caixa = limites(biblioteca)
    // O corpo vai de 0 a 4; o telhado passa um pouco dos dois lados, de
    // propósito: é ele que dá a silhueta de prédio.
    expect(caixa.x[0]).toBeLessThan(0)
    expect(caixa.x[1]).toBeGreaterThan(4)
    expect(caixa.y[1]).toBeGreaterThan(3)
    expect(caixa.z[1]).toBeLessThanOrEqual(3 * 1.12)
    conferirMalha(biblioteca, 'biblioteca')
  })

  it('mesa: tem tampa na altura pedida, com pernas abaixo', () => {
    const mesa = gerarMesa({ largura: 2.4, altura: 1.1 })
    const caixa = limites(mesa)
    // Nada abaixo do capim: a mesa é ancorada no chão. Este teste já reprovou a
    // primeira versão, em que as pernas ficavam enterradas.
    expect(caixa.y[0]).toBeGreaterThanOrEqual(0)
    // O monitor passa do tampo: é ele que define o topo.
    expect(caixa.y[1]).toBeGreaterThan(1.1)
    expect(caixa.x[1]).toBeLessThanOrEqual(2.5)
    conferirMalha(mesa, 'mesa')
  })

  it('recusa mesa mais baixa que o tampo', () => {
    expect(() => gerarMesa({ largura: 2, altura: 0.1 })).toThrow(/mais alta que a tampa/)
  })

  it('placa: o poste vai do chão até a altura pedida', () => {
    const placa = gerarPlaca({ altura: 3, largura: 1.6 })
    expect(limites(placa).y).toEqual([0, 3])
  })

  it('árvore: cresce a partir do chão e não passa da altura', () => {
    const arvore = gerarArvore({ altura: 5, raio: 1.4 })
    const caixa = limites(arvore)
    expect(caixa.y[0]).toBe(0)
    expect(caixa.y[1]).toBeCloseTo(5 * 0.96, 5)
    conferirMalha(arvore, 'árvore')
  })

  it('pedra: pequena e no chão', () => {
    const pedra = gerarPedra({ raio: 0.4 })
    expect(limites(pedra).y[1]).toBeLessThan(1)
    conferirMalha(pedra, 'pedra')
  })
})
