import { describe, expect, it } from 'vitest'
import { gerarCaixa } from './solidos'
import {
  ajustar,
  canais,
  escurecerCores,
  misturar,
  paraCor,
  pintarPorAltura,
  type Cor3D,
} from './pintura'

const VERMELHO = 0xff0000
const AZUL = 0x0000ff
const BRANCO = 0xffffff
const PRETO = 0x000000

describe('conversão de cor', () => {
  it('separa e junta canais sem perder valor', () => {
    for (const cor of [VERMELHO, AZUL, BRANCO, PRETO, 0x123456, 0xabcdef]) {
      expect(paraCor(canais(cor))).toBe(cor)
    }
  })

  it('lê cada canal na faixa de 0 a 1', () => {
    expect(canais(VERMELHO)).toEqual([1, 0, 0])
    expect(canais(0x808080)).toEqual([128 / 255, 128 / 255, 128 / 255])
  })

  it('corta valores fora da faixa, em vez de estourar o canal', () => {
    // Sem o corte, 1,5 viraria 0x180 no canal e a cor sairia errada em silêncio.
    expect(paraCor([1.5, -0.5, 0.5])).toBe(paraCor([1, 0, 0.5]))
  })
})

describe('mistura e ajuste', () => {
  it('devolve as pontas nos extremos', () => {
    expect(misturar(VERMELHO, AZUL, 0)).toBe(VERMELHO)
    expect(misturar(VERMELHO, AZUL, 1)).toBe(AZUL)
  })

  it('devolve o meio no meio', () => {
    expect(misturar(PRETO, BRANCO, 0.5)).toBe(paraCor([0.5, 0.5, 0.5]))
  })

  it('limita a proporção fora de 0 e 1', () => {
    expect(misturar(VERMELHO, AZUL, -3)).toBe(VERMELHO)
    expect(misturar(VERMELHO, AZUL, 9)).toBe(AZUL)
  })

  it('clareia e escurece mantendo o tom', () => {
    const claro = ajustar(0x808080, 2)
    const escuro = ajustar(0x808080, 0.5)
    expect(claro).toBe(paraCor([1, 1, 1]))
    expect(escuro).toBe(paraCor([64 / 255, 64 / 255, 64 / 255]))
  })
})

describe('pintura por altura', () => {
  /** Caixa de 1 × 10 × 1: as alturas vão de 0 a 10, em passos previsíveis. */
  const caixa = gerarCaixa({ largura: 1, altura: 10, profundidade: 1 })
  const gradiente = { de: 0, para: 10, corDe: PRETO, corPara: BRANCO }

  it('gera uma cor por vértice', () => {
    const pintada = pintarPorAltura(caixa, gradiente)
    expect(pintada.cores.length).toBe(caixa.posicoes.length)
    expect(pintada.posicoes).toBe(caixa.posicoes)
    expect(pintada.indices).toBe(caixa.indices)
  })

  it('pinta a base com a cor de baixo e o topo com a cor de cima', () => {
    const pintada = pintarPorAltura(caixa, gradiente)
    const cores = []
    for (let indice = 0; indice < caixa.posicoes.length; indice += 3) {
      const y = caixa.posicoes[indice + 1] ?? 0
      cores.push({ y, cor: pintada.cores.slice(indice, indice + 3) })
    }

    const embaixo = cores.filter(({ y }) => y === 0)
    const emCima = cores.filter(({ y }) => y === 10)

    expect(embaixo.length).toBeGreaterThan(0)
    expect(emCima.length).toBeGreaterThan(0)
    for (const { cor } of embaixo) {
      expect(cor).toEqual([0, 0, 0])
    }
    for (const { cor } of emCima) {
      expect(cor).toEqual([1, 1, 1])
    }
  })

  it('no meio da faixa, fica no meio das cores', () => {
    const meio = pintarPorAltura(caixa, { ...gradiente, de: -5, para: 5 })
    const indiceDoMeio = caixa.posicoes.findIndex((_, indice) => indice % 3 === 1)
    // Primeiro vértice é da face de baixo, em y = 0: com faixa de -5 a 5, ele
    // está na metade. A cor chega quantizada em 8 bits por canal — 128/255, e
    // não 0,5 exato —, que é a precisão que a placa de vídeo lê de verdade.
    const cor = meio.cores.slice(indiceDoMeio, indiceDoMeio + 3)
    for (const canal of cor) {
      expect(canal).toBeCloseTo(0.5, 2)
    }
  })

  it('fora da faixa, usa a cor da ponta mais próxima', () => {
    const estreito = pintarPorAltura(caixa, { de: 4, para: 6, corDe: VERMELHO, corPara: AZUL })
    const primeiraCor = estreito.cores.slice(0, 3)
    expect(primeiraCor).toEqual(canais(VERMELHO))
  })

  it('com degraus, a passagem fica em faixas', () => {
    const liso = pintarPorAltura(caixa, { ...gradiente, de: 0, para: 10, degraus: 1 })
    const faixas = pintarPorAltura(caixa, { ...gradiente, de: 0, para: 10, degraus: 3 })
    const distintos = (cores: readonly number[]) =>
      new Set(Array.from({ length: cores.length / 3 }, (_, i) => cores.slice(i * 3, i * 3 + 3).join(','))).size

    expect(distintos(faixas.cores)).toBeLessThanOrEqual(4)
    expect(distintos(liso.cores)).toBeGreaterThan(1)
  })

  it('recusa faixa de altura vazia e degraus inválidos', () => {
    expect(() => pintarPorAltura(caixa, { de: 5, para: 5, corDe: PRETO, corPara: BRANCO })).toThrow(
      /duas alturas diferentes/,
    )
    expect(() =>
      pintarPorAltura(caixa, { de: 0, para: 10, corDe: PRETO, corPara: BRANCO, degraus: 0 }),
    ).toThrow(/ao menos 1 degrau/)
  })
})

describe('escurecer cores', () => {
  it('aplica o fator em cada canal e não passa de 1', () => {
    const escurecidas = escurecerCores([1, 0.5, 0.25], 0.5)
    expect(escurecidas).toEqual([0.5, 0.25, 0.125])
  })

  it('não estoura acima de 1', () => {
    expect(escurecerCores([1, 1, 1], 3)).toEqual([1, 1, 1])
  })

  it('mantém o tamanho da lista', () => {
    expect(escurecerCores([0.1, 0.2, 0.3, 0.4, 0.5, 0.6], 0.9).length).toBe(6)
  })
})

describe('tipos', () => {
  it('Cor3D é só um número', () => {
    const cor: Cor3D = 0x123456
    expect(typeof cor).toBe('number')
  })
})
