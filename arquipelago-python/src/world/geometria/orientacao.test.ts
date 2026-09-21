import { describe, expect, it } from 'vitest'
import { ROCHA_PADRAO, TOPO_PADRAO, deslocarMalha, gerarRocha, gerarTopo, juntarMalhas } from './ilha'
import { gerarCaixa, gerarCilindro, montar, type Ponto } from './solidos'

/**
 * Orientação das faces.
 *
 * Este arquivo existe por um defeito concreto: uma face com o sentido trocado é
 * descartada pelo descarte de face traseira e simplesmente **desaparece**. O
 * mundo fica oco, ou uma parede some quando a câmera passa de lado, e nada no
 * código indica o problema — só olhando.
 *
 * Como conferir sem abrir navegador: para um sólido convexo, a normal de toda
 * face tem de apontar para longe de um ponto que está dentro dele. É o que
 * `conferirParaFora` faz, usando a regra da mão direita sobre a ordem dos
 * vértices — a mesma regra que a placa de vídeo usa.
 */

type Triangulo = readonly [readonly [number, number, number], readonly [number, number, number], readonly [number, number, number]]

/** Lê os triângulos de uma malha como ternos de pontos. */
function triangulos(posicoes: readonly number[], indices: readonly number[]): Triangulo[] {
  const pontos = (indice: number): readonly [number, number, number] => [
    posicoes[indice * 3] ?? 0,
    posicoes[indice * 3 + 1] ?? 0,
    posicoes[indice * 3 + 2] ?? 0,
  ]

  const lista: Triangulo[] = []
  for (let posicao = 0; posicao < indices.length; posicao += 3) {
    lista.push([
      pontos(indices[posicao] ?? 0),
      pontos(indices[posicao + 1] ?? 0),
      pontos(indices[posicao + 2] ?? 0),
    ])
  }
  return lista
}

/** Produto vetorial `u × w`, na convenção da mão direita. */
function produtoVetorial(
  u: readonly [number, number, number],
  w: readonly [number, number, number],
): readonly [number, number, number] {
  return [
    u[1] * w[2] - u[2] * w[1],
    u[2] * w[0] - u[0] * w[2],
    u[0] * w[1] - u[1] * w[0],
  ]
}

function subtrair(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
): readonly [number, number, number] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function escalar(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function medio(t: Triangulo): readonly [number, number, number] {
  return [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3, (t[0][2] + t[1][2] + t[2][2]) / 3]
}

/**
 * Confere que toda face aponta para fora, visto de um ponto interno.
 * Devolve os triângulos que apontaram para dentro, para a mensagem de falha.
 */
function facesViradasParaDentro(
  posicoes: readonly number[],
  indices: readonly number[],
  pontoInterno: Ponto,
  folga = 0,
): readonly string[] {
  const centro: readonly [number, number, number] = [pontoInterno.x, pontoInterno.y, pontoInterno.z]
  const problemas: string[] = []

  for (const triangulo of triangulos(posicoes, indices)) {
    const normal = produtoVetorial(subtrair(triangulo[1], triangulo[0]), subtrair(triangulo[2], triangulo[0]))
    const doCentroParaFace = subtrair(medio(triangulo), centro)
    // Face degenerada (área zero) também é defeito: não desenha nada.
    const area = Math.hypot(normal[0], normal[1], normal[2])
    if (area < 1e-9) {
      problemas.push(`triângulo sem área em ${medio(triangulo).map((n) => n.toFixed(2)).join(', ')}`)
      continue
    }
    if (escalar(normal, doCentroParaFace) < folga) {
      problemas.push(
        `face aponta para dentro, em ${medio(triangulo).map((n) => n.toFixed(2)).join(', ')}`,
      )
    }
  }

  return problemas
}

describe('caixa', () => {
  it('tem todas as faces viradas para fora', () => {
    const caixa = gerarCaixa({ largura: 2, altura: 3, profundidade: 4 })
    const problemas = facesViradasParaDentro(caixa.posicoes, caixa.indices, { x: 1, y: 1.5, z: 2 })
    expect(problemas, problemas.join('\n')).toEqual([])
  })

  it('continua correta quando centrada em outro ponto', () => {
    const caixa = gerarCaixa({
      largura: 1,
      altura: 1,
      profundidade: 1,
      centro: { x: 10, y: -4, z: 7 },
    })
    const problemas = facesViradasParaDentro(caixa.posicoes, caixa.indices, { x: 10, y: -4, z: 7 })
    expect(problemas, problemas.join('\n')).toEqual([])
  })
})

describe('cilindro', () => {
  it('tem a lateral e as tampas viradas para fora', () => {
    const cilindro = gerarCilindro({ raio: 2, altura: 5, lados: 8 })
    const problemas = facesViradasParaDentro(cilindro.posicoes, cilindro.indices, { x: 0, y: 2.5, z: 0 })
    expect(problemas, problemas.join('\n')).toEqual([])
  })

  it('tem a lateral virada para fora mesmo sem tampas', () => {
    const semTampas = gerarCilindro({ raio: 1.5, altura: 3, lados: 6, comTampas: false })
    const problemas = facesViradasParaDentro(semTampas.posicoes, semTampas.indices, { x: 0, y: 1.5, z: 0 })
    expect(problemas, problemas.join('\n')).toEqual([])
  })

  it('funciona fora da origem', () => {
    const cilindro = gerarCilindro({ raio: 1, altura: 2, lados: 5, base: { x: 30, y: 1, z: -2 } })
    const problemas = facesViradasParaDentro(cilindro.posicoes, cilindro.indices, { x: 30, y: 2, z: -2 })
    expect(problemas, problemas.join('\n')).toEqual([])
  })
})

/**
 * Para um sólido de revolução, o teste certo não é "aponta para longe de um
 * ponto interno" — na ponta, o raio é quase zero e a conta fica no limite. O que
 * vale para toda a parede é: a normal tem de ter componente **radial positiva**,
 * medida na própria altura da face.
 */
function facesAbertasParaDentro(
  posicoes: readonly number[],
  indices: readonly number[],
): readonly string[] {
  const problemas: string[] = []

  for (const triangulo of triangulos(posicoes, indices)) {
    const normal = produtoVetorial(subtrair(triangulo[1], triangulo[0]), subtrair(triangulo[2], triangulo[0]))
    const centro = medio(triangulo)
    const doEixoParaFace: readonly [number, number, number] = [centro[0], 0, centro[2]]
    if (Math.hypot(doEixoParaFace[0], doEixoParaFace[2]) < 1e-6) {
      continue
    }
    if (escalar(normal, doEixoParaFace) <= 0) {
      problemas.push(
        `face virada para o eixo, em ${centro.map((n) => n.toFixed(2)).join(', ')}`,
      )
    }
  }

  return problemas
}

describe('rocha da ilha', () => {
  it('tem a parede virada para fora do eixo da ilha', () => {
    const rocha = gerarRocha(ROCHA_PADRAO)
    const problemas = facesAbertasParaDentro(rocha.posicoes, rocha.indices)
    expect(problemas, problemas.join('\n')).toEqual([])
  })

  it('vale para outras sementes e formatos', () => {
    for (const semente of [1, 7, 99, 12345]) {
      const rocha = gerarRocha({ ...ROCHA_PADRAO, semente, aneis: 3, segmentosRadiais: 8 })
      const problemas = facesAbertasParaDentro(rocha.posicoes, rocha.indices)
      expect(problemas, `semente ${semente}:\n${problemas.join('\n')}`).toEqual([])
    }
  })

  it('não dobra sobre si mesma: nenhuma face fica de costas para quem olha de fora', () => {
    // Uma amplitude alta demais faria a pedra se dobrar e uma face aparecer
    // virada para dentro do vão da vizinha. Este teste fixa o limite.
    for (const amplitude of [0.1, 0.22, 0.35]) {
      const rocha = gerarRocha({ ...ROCHA_PADRAO, amplitude, aneis: 9, segmentosRadiais: 18 })
      const problemas = facesAbertasParaDentro(rocha.posicoes, rocha.indices)
      expect(problemas, `amplitude ${amplitude}:\n${problemas.join('\n')}`).toEqual([])
    }
  })
})

describe('topo da ilha', () => {
  it('tem o capim virado para cima', () => {
    const topo = gerarTopo(TOPO_PADRAO)
    // Ponto interno abaixo do disco: as faces têm de apontar para cima.
    const problemas = facesViradasParaDentro(topo.posicoes, topo.indices, { x: 0, y: -1, z: 0 })
    expect(problemas, problemas.join('\n')).toEqual([])
  })

  it('vale para outras sementes', () => {
    for (const semente of [2, 31, 404]) {
      const topo = gerarTopo({ ...TOPO_PADRAO, semente, aneis: 3, segmentosRadiais: 9 })
      const problemas = facesViradasParaDentro(topo.posicoes, topo.indices, { x: 0, y: -1, z: 0 })
      expect(problemas, `semente ${semente}:\n${problemas.join('\n')}`).toEqual([])
    }
  })
})

describe('composição preserva a orientação', () => {
  it('deslocar não espelha nada', () => {
    const caixa = gerarCaixa({ largura: 1, altura: 1, profundidade: 1 })
    const movida = deslocarMalha(caixa, { x: -5, y: 3, z: 2 })
    const problemas = facesViradasParaDentro(movida.posicoes, movida.indices, { x: -4.5, y: 3.5, z: 2.5 })
    expect(problemas, problemas.join('\n')).toEqual([])
  })

  it('juntar peças mantém cada peça correta', () => {
    const montada = montar([
      gerarCaixa({ largura: 1, altura: 1, profundidade: 1 }),
      gerarCilindro({ raio: 0.5, altura: 2, lados: 6, base: { x: 5, y: 0, z: 0 } }),
    ])

    const triangulosDaCaixa = gerarCaixa({ largura: 1, altura: 1, profundidade: 1 })
    expect(montada.indices.slice(0, triangulosDaCaixa.indices.length)).toEqual([
      ...triangulosDaCaixa.indices,
    ])

    const cilindro = gerarCilindro({ raio: 0.5, altura: 2, lados: 6, base: { x: 5, y: 0, z: 0 } })
    const deslocamento = triangulosDaCaixa.posicoes.length / 3
    expect(montada.indices.slice(triangulosDaCaixa.indices.length)).toEqual([
      ...cilindro.indices.map((indice) => indice + deslocamento),
    ])
  })

  it('a ilha montada não tem triângulo sem área', () => {
    // Um triângulo sem área é quase sempre sinal de vértice repetido por
    // engano ao juntar malhas.
    const ilha = juntarMalhas(gerarRocha(ROCHA_PADRAO), gerarTopo(TOPO_PADRAO))
    const problemas = facesViradasParaDentro(ilha.posicoes, ilha.indices, { x: 0, y: -4, z: 0 }).filter(
      (problema) => problema.startsWith('triângulo sem área'),
    )
    expect(problemas, problemas.join('\n')).toEqual([])
  })
})
