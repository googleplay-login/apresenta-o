import { describe, expect, it } from 'vitest'
import { PLANO_DE_UNIDADES } from '../../content/planoDeUnidades'
import { sementeDeTexto } from './aleatorio'
import {
  LUGARES_NA_ILHA,
  MARCOS,
  identidadeDaIlha,
  posicaoNoCapim,
  type TipoDeMarco,
} from './identidade'
import { gerarMarco, malhaInteira } from './marcos'
import { deslocarMalha, juntarMalhas, rotacionarMalha, type Malha } from './ilha'
import { gerarCaixa, gerarCilindro } from './solidos'

/**
 * Os marcos das ilhas.
 *
 * Cada marco é a construção que só uma ilha tem. Este arquivo cobra o que a
 * geometria promete:
 *
 *  - todas as construções existem, são diferentes entre si e cabem no capim;
 *  - a malha está fechada e com as faces **para fora** — o defeito que o descarte
 *    de face traseira esconde: a peça some quando a câmera passa de lado;
 *  - os marcos animados têm mesmo uma parte girando, e ela gira no eixo certo —
 *    as pás do moinho e as engrenagens giram no plano em que estão montadas.
 */

const ILHAS = PLANO_DE_UNIDADES.map((unidade, indice) => {
  const semente = sementeDeTexto(unidade.id)
  const identidade = identidadeDaIlha(indice, semente)
  return {
    id: unidade.id,
    identidade,
    marco: gerarMarco(identidade.marco, {
      raioDaIlha: identidade.formato.raioDoTopo,
      alturaDaIlha: identidade.formato.altura,
      semente,
    }),
  }
})

/** Volume assinado da malha. Positivo quando as faces apontam para fora. */
function volumeAssinado(malha: Malha): number {
  const pontos = (indice: number): readonly [number, number, number] => [
    malha.posicoes[indice * 3] ?? 0,
    malha.posicoes[indice * 3 + 1] ?? 0,
    malha.posicoes[indice * 3 + 2] ?? 0,
  ]

  let volume = 0
  for (let posicao = 0; posicao < malha.indices.length; posicao += 3) {
    const [a, b, c] = [
      pontos(malha.indices[posicao] ?? 0),
      pontos(malha.indices[posicao + 1] ?? 0),
      pontos(malha.indices[posicao + 2] ?? 0),
    ]
    // Produto misto a · (b × c) / 6: soma dos tetraedros com o vértice na origem.
    volume +=
      (a[0] * (b[1] * c[2] - b[2] * c[1]) +
        a[1] * (b[2] * c[0] - b[0] * c[2]) +
        a[2] * (b[0] * c[1] - b[1] * c[0])) /
      6
  }
  return volume
}

/** Altura máxima de uma malha, a partir de y = 0 (o capim). */
function alturaMaxima(malha: Malha): number {
  let maxima = Number.NEGATIVE_INFINITY
  for (let indice = 1; indice < malha.posicoes.length; indice += 3) {
    maxima = Math.max(maxima, malha.posicoes[indice] ?? 0)
  }
  return maxima
}

describe('os marcos existem e são diferentes', () => {
  it('gera um marco para cada tipo da lista, sem sobrar nem faltar', () => {
    const tipos = new Set(ILHAS.map((ilha) => ilha.marco.tipo))
    expect([...tipos].sort()).toEqual([...MARCOS].sort())
  })

  it('cada marco tem geometria de verdade', () => {
    for (const { marco } of ILHAS) {
      expect(marco.fixo.posicoes.length, `${marco.nome} sem vértices`).toBeGreaterThan(0)
      expect(marco.fixo.posicoes.length % 3).toBe(0)
      expect(marco.fixo.indices.length % 3).toBe(0)
      expect(marco.alturaTotal).toBeGreaterThan(1)
      expect(marco.raioOcupado).toBeGreaterThan(0)
    }
  })

  it('as construções são todas diferentes entre si', () => {
    // Duas ilhas com o mesmo marco seriam a mesma construção repetida — o defeito
    // que o projeto acabou de consertar. A contagem de vértices e a altura não
    // bastariam para provar diferença (dois marcos podem empatar), então a
    // comparação é pela assinatura: nome, vértices e volume.
    const assinaturas = ILHAS.map((ilha) =>
      [
        ilha.marco.tipo,
        ilha.marco.fixo.posicoes.length,
        volumeAssinado(malhaInteira(ilha.marco)).toFixed(2),
      ].join('|'),
    )
    expect(new Set(assinaturas).size).toBe(ILHAS.length)
  })

  it('o mesmo marco é sempre igual: a construção não treme entre renderizações', () => {
    for (const { identidade, marco } of ILHAS) {
      const deNovo = gerarMarco(identidade.marco, {
        raioDaIlha: identidade.formato.raioDoTopo,
        alturaDaIlha: identidade.formato.altura,
        semente: sementeDeTexto(identidade.marco),
      })
      expect(deNovo.fixo.posicoes).toEqual(marco.fixo.posicoes)
    }
  })
})

describe('o marco cabe no capim onde ele fica em pé', () => {
  it('não passa da borda da ilha', () => {
    for (const { identidade, marco } of ILHAS) {
      const raio = identidade.formato.raioDoTopo
      const ondeFica = posicaoNoCapim(raio, LUGARES_NA_ILHA.marco)
      const distanciaAoCentro = Math.hypot(ondeFica.x, ondeFica.z)

      expect(
        distanciaAoCentro + marco.raioOcupado,
        `${marco.nome} sairia do capim de uma ilha de raio ${raio.toFixed(2)}`,
      ).toBeLessThanOrEqual(raio * 0.98)
    }
  })

  it('fica do lado oposto às estruturas do estudo, para não tapá-las', () => {
    const marco = LUGARES_NA_ILHA.marco
    for (const nome of ['biblioteca', 'mesa', 'placa'] as const) {
      const estrutura = LUGARES_NA_ILHA[nome]
      const diferenca = Math.abs(estrutura.angulo - marco.angulo)
      const menorArco = Math.min(diferenca, Math.PI * 2 - diferenca)
      // Meia volta de folga: nem junto, nem exatamente em frente às três.
      expect(menorArco, `O marco ficou perto demais da ${nome}`).toBeGreaterThan(Math.PI / 3)
    }
  })
})

describe('as faces dos marcos apontam para fora', () => {
  it('o volume de todos os marcos é positivo, e portanto as faces estão voltadas para fora', () => {
    // A malha é fechada (caixas e cilindros com tampa). Se qualquer peça fosse
    // montada com o sentido trocado, o volume assinado cairia — e a peça
    // desapareceria na tela por causa do descarte de face traseira.
    for (const { marco } of ILHAS) {
      expect(
        volumeAssinado(marco.fixo),
        `O marco ${marco.nome} tem face virada para dentro`,
      ).toBeGreaterThan(0)
    }
  })

  it('girar uma peça não inverte as faces dela', () => {
    // Esta é a conta que a montagem dos marcos usa (dentes de engrenagem, pás,
    // placas viradas para o lado). A prova é a mesma regra do volume, agora sobre
    // uma peça convexa, onde dá para comparar antes e depois.
    const caixa = gerarCaixa({ largura: 1, altura: 0.6, profundidade: 0.4, centro: { x: 0, y: 0, z: 0 } })
    const cilindro = gerarCilindro({ raio: 0.4, altura: 0.8, lados: 7 })

    for (const angulo of [0, 0.3, Math.PI / 3, Math.PI, Math.PI * 1.5, Math.PI * 2]) {
      for (const eixo of ['x', 'y', 'z'] as const) {
        const girada = rotacionarMalha(caixa, { eixo, angulo })
        expect(volumeAssinado(girada)).toBeCloseTo(volumeAssinado(caixa), 9)
      }
      expect(volumeAssinado(rotacionarMalha(cilindro, { eixo: 'x', angulo }))).toBeCloseTo(
        volumeAssinado(cilindro),
        9,
      )
    }
  })

  it('deslocar e juntar malhas também não inverte nada', () => {
    const caixa = gerarCaixa({ largura: 1, altura: 1, profundidade: 1, centro: { x: 0, y: 0.5, z: 0 } })
    const deslocada = deslocarMalha(caixa, { x: 3, y: 1, z: -2 })
    expect(volumeAssinado(deslocada)).toBeCloseTo(volumeAssinado(caixa), 9)
    expect(volumeAssinado(juntarMalhas(caixa, deslocada))).toBeCloseTo(
      volumeAssinado(caixa) * 2,
      9,
    )
  })
})

describe('as partes animadas existem e giram no eixo certo', () => {
  const TIPOS_COM_GIRO: readonly TipoDeMarco[] = [
    'oficina',
    'moinho',
    'encruzilhada',
    'farol',
    'estacao',
    'engrenagens',
    'torre',
  ]

  it('todo marco animado tem parte giratória, e nenhum marco parado inventa uma', () => {
    for (const { identidade, marco } of ILHAS) {
      const esperaGiro = TIPOS_COM_GIRO.includes(identidade.marco)
      expect(
        marco.girantes.length > 0,
        `${marco.nome} ${esperaGiro ? 'deveria' : 'não deveria'} ter parte giratória`,
      ).toBe(esperaGiro)
    }
  })

  it('as pás do moinho e as engrenagens giram no plano em que estão montadas', () => {
    // O eixo é a direção **perpendicular** ao plano da peça. Pás e engrenagens
    // ficam de pé (no plano xy), então giram em z; cata-vento, feixe de luz e
    // bandeira giram em y.
    const eixoEsperado: Readonly<Record<TipoDeMarco, 'x' | 'y' | 'z' | null>> = {
      portal: null,
      oficina: 'z',
      estante: null,
      mercado: null,
      moinho: 'z',
      encruzilhada: 'y',
      farol: 'y',
      estacao: 'y',
      engrenagens: 'z',
      torre: 'y',
      arquivo: null,
      balanca: null,
    }

    for (const { identidade, marco } of ILHAS) {
      const esperado = eixoEsperado[identidade.marco]
      for (const parte of marco.girantes) {
        expect(parte.eixo, `${marco.nome} gira no eixo errado`).toBe(esperado)
        expect(Math.abs(parte.voltasPorSegundo)).toBeGreaterThan(0)
        expect(Number.isFinite(parte.voltasPorSegundo)).toBe(true)
        expect(parte.malha.posicoes.length).toBeGreaterThan(0)
      }
    }
  })

  it('as duas engrenagens giram em sentidos opostos, e a pequena mais rápido', () => {
    const par = ILHAS.find((ilha) => ilha.identidade.marco === 'engrenagens')
    if (par === undefined) {
      throw new Error('O percurso deveria ter uma ilha com o par de engrenagens')
    }

    const [grande, pequena] = par.marco.girantes
    if (grande === undefined || pequena === undefined) {
      throw new Error('O par de engrenagens deveria ter duas rodas')
    }

    expect(Math.sign(grande.voltasPorSegundo)).not.toBe(Math.sign(pequena.voltasPorSegundo))
    expect(Math.abs(pequena.voltasPorSegundo)).toBeGreaterThan(Math.abs(grande.voltasPorSegundo))
  })

  it('a parte giratória fica na altura declarada, e não no chão', () => {
    for (const { marco } of ILHAS) {
      for (const parte of marco.girantes) {
        expect(parte.posicao[1]).toBeGreaterThan(0.5)
        expect(parte.posicao[1]).toBeLessThanOrEqual(marco.alturaTotal + 0.5)
      }
    }
  })

  it('a altura total declarada corresponde à malha', () => {
    for (const { marco } of ILHAS) {
      const maisAlto = Math.max(alturaMaxima(marco.fixo), ...marco.girantes.map((parte) => parte.posicao[1] + alturaMaxima(parte.malha)))
      expect(marco.alturaTotal).toBeGreaterThanOrEqual(maisAlto - 0.001)
    }
  })
})
