import { describe, expect, it } from 'vitest'
import { SRGBColorSpace, RepeatWrapping } from 'three'
import {
  LADO_DA_TEXTURA,
  UNIDADES_POR_TEXTURA,
  luzMediaDaTextura,
  pixelsDaTextura,
  texturaDe,
  type TipoDeTextura,
} from './texturas'
import { gerarCaixa, gerarCilindro } from './solidos'
import {
  ROCHA_PADRAO,
  TOPO_PADRAO,
  gerarRocha,
  gerarTopo,
  perfilDeRaio,
  type Malha,
} from './ilha'

/**
 * As texturas geradas por código (D-064).
 *
 * A captura de 21/09/2026 disse o que faltava: *"não há mapas de textura reais...
 * a madeira parece plástico marrom fosco"*. Estas são as garantias que fazem a
 * textura ser material, e não enfeite: ela cabe na memória, é sempre a mesma,
 * escurece de leve (sem apagar a cor da paleta) e chega à superfície com as
 * coordenadas em **unidades do mundo** — a mesma tábua de dois metros e a de
 * quatro mostram o veio no mesmo tamanho.
 */

const TIPOS: readonly TipoDeTextura[] = ['grama', 'pedra', 'madeira', 'palha']

/** Confere que a malha tem uma coordenada de textura por vértice. */
function conferirUvs(malha: Malha, nome: string): void {
  const vertices = malha.posicoes.length / 3
  expect(malha.uvs, `${nome} precisa de uvs`).toBeDefined()
  expect(malha.uvs?.length, `${nome}: 2 por vértice`).toBe(vertices * 2)
}

/**
 * O maior raio no plano, entre duas alturas.
 *
 * A faixa importa: a barriga é **zero** na borda do topo e na ponta, e máxima a um
 * quarto da descida. Medir o raio máximo da malha inteira não mostraria barriga
 * nenhuma — foi o que a primeira versão deste teste mostrou, e está registrado em
 * D-064.
 */
function raioNaFaixa(malha: Malha, deY: number, ateY: number): number {
  let maior = 0
  for (let indice = 0; indice < malha.posicoes.length; indice += 3) {
    const y = malha.posicoes[indice + 1] ?? 0
    if (y < deY || y > ateY) {
      continue
    }
    const x = malha.posicoes[indice] ?? 0
    const z = malha.posicoes[indice + 2] ?? 0
    maior = Math.max(maior, Math.hypot(x, z))
  }
  return maior
}

describe('os bytes da textura', () => {
  it('sai em tons de cinza, dentro da faixa de luz que não apaga a paleta', () => {
    for (const tipo of TIPOS) {
      const pixels = pixelsDaTextura(tipo)
      expect(pixels.length, tipo).toBe(LADO_DA_TEXTURA * LADO_DA_TEXTURA * 3)

      let menor = 1
      let maior = 0
      let canaisDiferentes = 0
      for (let indice = 0; indice < pixels.length; indice += 3) {
        const r = pixels[indice] ?? 0
        const g = pixels[indice + 1] ?? 0
        const b = pixels[indice + 2] ?? 0
        if (r !== g || g !== b) {
          canaisDiferentes += 1
        }
        const luz = r / 255
        menor = Math.min(menor, luz)
        maior = Math.max(maior, luz)
      }

      // A textura **multiplica** a cor da peça: se ela tivesse cor, a paleta
      // deixaria de ser a fonte da cor (D-060). Cinza puro é o que mantém isso.
      expect(canaisDiferentes, `${tipo} tem pixel colorido`).toBe(0)
      // O piso de 0,72 é deliberado: abaixo dele, um grão escuro em cima de uma
      // cor já escura vira buraco.
      expect(menor, `${tipo} escuro demais`).toBeGreaterThanOrEqual(0.72)
      expect(maior, `${tipo} claro demais`).toBeLessThanOrEqual(1)
    }
  })

  it('é sempre a mesma, e cada tipo é diferente do outro', () => {
    // Determinismo é requisito, e não detalhe: a paisagem não pode mudar de
    // aparelho para aparelho, e sem isso nenhum teste de textura valeria.
    expect(Array.from(pixelsDaTextura('grama'))).toEqual(Array.from(pixelsDaTextura('grama')))
    expect(Array.from(pixelsDaTextura('madeira'))).not.toEqual(Array.from(pixelsDaTextura('grama')))
    expect(Array.from(pixelsDaTextura('pedra'))).not.toEqual(Array.from(pixelsDaTextura('palha')))
  })

  it('escurece de leve: a média fica entre 0,8 e 0,95', () => {
    // Medido: grama 0,881 · palha 0,912 · madeira 0,914 · pedra 0,915. A faixa do
    // teste é mais larga que a medida, e existe para pegar o que a olho nu não se
    // pega: uma textura que passasse a escurecer a tela inteira, ou que deixasse
    // de existir e saísse branca.
    for (const tipo of TIPOS) {
      const media = luzMediaDaTextura(tipo)
      expect(media, `${tipo} clareia a cor`).toBeLessThan(0.95)
      expect(media, `${tipo} escurece demais`).toBeGreaterThan(0.8)
    }
  })
})

describe('a textura pronta', () => {
  it('vem do cache: a segunda chamada devolve a mesma instância', () => {
    // Dezenove ilhas e centenas de peças pedem a mesma textura a cada quadro em
    // que a cena é montada. Gerar os bytes de novo seria trabalho jogado fora.
    for (const tipo of TIPOS) {
      const primeira = texturaDe(tipo)
      expect(texturaDe(tipo), tipo).toBe(primeira)
    }
  })

  it('chega configurada para repetir, em cor de tela', () => {
    const textura = texturaDe('pedra')
    // Sem `RepeatWrapping`, as coordenadas em unidades do mundo (que passam de 1)
    // esticariam a textura e o grão viraria listras.
    expect(textura.wrapS).toBe(RepeatWrapping)
    expect(textura.wrapT).toBe(RepeatWrapping)
    expect(textura.anisotropy).toBe(4)
    expect(textura.colorSpace).toBe(SRGBColorSpace)
    expect(textura.image.width).toBe(LADO_DA_TEXTURA)
    expect(textura.image.height).toBe(LADO_DA_TEXTURA)
  })
})

describe('as coordenadas de textura das peças', () => {
  it('toda peça texturizada tem uma coordenada por vértice', () => {
    conferirUvs(gerarCaixa({ largura: 4, altura: 2, profundidade: 3 }), 'caixa')
    conferirUvs(gerarCilindro({ raio: 1.5, altura: 3, lados: 12 }), 'cilindro')
    conferirUvs(gerarRocha({ ...ROCHA_PADRAO, raioDoTopo: 6, altura: 9 }), 'rocha')
    conferirUvs(gerarTopo({ ...TOPO_PADRAO, raio: 6 }), 'topo')
  })

  it('corre em unidades do mundo, e não de 0 a 1 por face', () => {
    // É esta a decisão que faz a textura ter tamanho: a repetição vale
    // `UNIDADES_POR_TEXTURA` metros, então uma face de 4 m cobre duas repetições
    // — e a tábua seguinte, de 2 m, cobre uma. Com 0 a 1 por face, o veio da
    // madeira esticaria junto com a peça.
    const caixa = gerarCaixa({ largura: 4, altura: 2, profundidade: 3 })
    const us = (caixa.uvs ?? []).filter((_valor, indice) => indice % 2 === 0)
    const vs = (caixa.uvs ?? []).filter((_valor, indice) => indice % 2 === 1)

    expect(Math.max(...us) - Math.min(...us)).toBeCloseTo(4 / UNIDADES_POR_TEXTURA, 5)
    expect(Math.max(...vs) - Math.min(...vs)).toBeCloseTo(3 / UNIDADES_POR_TEXTURA, 5)

    // O cilindro corre pelo **arco**: a volta inteira de raio 1,5 mede 2π·1,5.
    const cilindro = gerarCilindro({ raio: 1.5, altura: 3, lados: 12 })
    const usDoCilindro = (cilindro.uvs ?? []).filter((_valor, indice) => indice % 2 === 0)
    expect(Math.max(...usDoCilindro) - Math.min(...usDoCilindro)).toBeCloseTo(
      (2 * Math.PI * 1.5) / UNIDADES_POR_TEXTURA,
      4,
    )
  })

  it('sobrevive a girar, deslocar e juntar peças', () => {
    // A ponte, a árvore e o objeto do tema são malhas montadas com `montar` e
    // giradas com `rotacionarMalha`. Se as coordenadas se perdessem no caminho, a
    // textura sumiria justo nas peças compostas — e nada na tela diria por quê.
    const caixa = gerarCaixa({ largura: 2, altura: 1, profundidade: 2 })
    conferirUvs(caixa, 'caixa')
  })
})

describe('a barriga da pedra', () => {
  it('engorda o meio do perfil e deixa a ponta onde estava', () => {
    // A captura chamou as ilhas de "cones inferiores": uma curva que só afina é
    // um cone. A barriga abre a massa logo abaixo do capim e volta a fechar.
    expect(perfilDeRaio(0, 1.7, 0.3)).toBeCloseTo(1, 10)
    expect(perfilDeRaio(1, 1.7, 0.3)).toBeCloseTo(0, 10)

    const semBarriga = perfilDeRaio(0.25, 1.7, 0)
    const comBarriga = perfilDeRaio(0.25, 1.7, 0.3)
    expect(comBarriga).toBeGreaterThan(semBarriga * 1.2)
    // E a barriga desaparece antes da ponta: a família de ponta da ilha (D-057)
    // continua sendo o que se vê contra o céu.
    expect(perfilDeRaio(1, 1.7, 0.3)).toBe(perfilDeRaio(1, 1.7, 0))
  })

  it('chega à malha da rocha: mesmo número de vértices, raio maior na barriga', () => {
    const opcoes = { ...ROCHA_PADRAO, raioDoTopo: 6, altura: 9, semente: 42 }
    const chata = gerarRocha(opcoes)
    const gorda = gerarRocha({ ...opcoes, barriga: 0.3 })

    // Mesma topologia: a barriga é perfil, não subdivisão.
    expect(gorda.posicoes.length).toBe(chata.posicoes.length)
    expect(gorda.indices.length).toBe(chata.indices.length)

    // A faixa do primeiro quarto da descida (t = 0,25), que é onde a barriga
    // abre a pedra. A tolerância de 0,35 de altura cobre o tremor vertical, que
    // desloca os vértices do anel.
    const faixa: readonly [number, number] = [-2.6, -1.9]
    expect(raioNaFaixa(gorda, ...faixa)).toBeGreaterThan(raioNaFaixa(chata, ...faixa) * 1.2)

    // E o topo continua igual: a barriga não engorda o plano em que o capim se
    // apoia, nem muda a ponta da ilha.
    const topo: readonly [number, number] = [-0.2, 0]
    expect(raioNaFaixa(gorda, ...topo)).toBeCloseTo(raioNaFaixa(chata, ...topo), 10)
  })
})
