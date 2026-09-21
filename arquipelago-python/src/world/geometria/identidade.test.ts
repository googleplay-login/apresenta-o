import { describe, expect, it } from 'vitest'
import { PLANO_DE_UNIDADES } from '../../content/planoDeUnidades'
import { sementeDeTexto } from './aleatorio'
import {
  FAIXAS,
  LUGARES_NA_ILHA,
  MARCOS,
  TONS_DAS_ILHAS,
  assinaturaDaSilhueta,
  identidadeDaIlha,
  posicaoNoCapim,
} from './identidade'
import { CORES_DAS_ILHAS, corDaIlha } from '../../ui/theme/paleta3d'

/**
 * A identidade de cada ilha.
 *
 * Este arquivo existe por causa de um defeito relatado por quem usa: **as ilhas
 * estavam todas iguais**. Era verdade — as dez saíam do mesmo raio, da mesma
 * altura, das mesmas estruturas e da mesma cor, e a única diferença era um tremor
 * pequeno na pedra. De longe, o arquipélago parecia o mesmo lugar repetido.
 *
 * O que se prova aqui, sem precisar de navegador:
 *
 *  - as dez ilhas do percurso têm dez **marcos** diferentes, dez **silhuetas**
 *    diferentes e dez **tons** diferentes;
 *  - a identidade é **determinística**: a mesma ilha tem sempre a mesma cara, o
 *    que é o que permite reconhecer o próprio mundo ao voltar;
 *  - tudo cabe nas faixas declaradas, e o marco cabe no capim da ilha onde ele
 *    fica em pé.
 */

const ILHAS = PLANO_DE_UNIDADES.map((unidade) => ({
  id: unidade.id,
  semente: sementeDeTexto(unidade.id),
}))

const IDENTIDADES = ILHAS.map((ilha, indice) => identidadeDaIlha(indice, ilha.semente))

describe('uma ilha não é a outra', () => {
  it('as dez ilhas do percurso têm dez marcos diferentes', () => {
    const marcos = IDENTIDADES.map((identidade) => identidade.marco)
    expect(marcos).toHaveLength(ILHAS.length)
    expect(new Set(marcos).size, `Marcos repetidos: ${marcos.join(', ')}`).toBe(ILHAS.length)
    expect(new Set(marcos).size).toBeLessThanOrEqual(MARCOS.length)
  })

  it('as dez ilhas têm dez silhuetas diferentes', () => {
    const assinaturas = IDENTIDADES.map(assinaturaDaSilhueta)
    expect(
      new Set(assinaturas).size,
      `Duas ilhas ficaram com a mesma forma: ${assinaturas.join(', ')}`,
    ).toBe(ILHAS.length)
  })

  it('as dez ilhas têm dez tons diferentes', () => {
    const tons = IDENTIDADES.map((identidade) => corDaIlha(identidade.tom))
    expect(new Set(tons).size).toBe(ILHAS.length)
    expect(TONS_DAS_ILHAS).toBe(CORES_DAS_ILHAS.length)
  })

  it('a vegetação não é a mesma em todas', () => {
    const quantidades = IDENTIDADES.map(
      (identidade) => `${identidade.vegetacao.arvores}/${identidade.vegetacao.pedras}`,
    )
    expect(new Set(quantidades).size).toBeGreaterThan(1)
  })

  it('a mesma ilha tem sempre a mesma identidade', () => {
    for (const [indice, ilha] of ILHAS.entries()) {
      expect(identidadeDaIlha(indice, ilha.semente)).toEqual(IDENTIDADES[indice])
    }
  })

  it('mudar a semente muda a silhueta, mas não o marco: o marco é da posição', () => {
    // Quando o arquipélago passar de dez ilhas, o marco volta ao começo da lista.
    // Mesmo assim duas ilhas não ficam iguais: a silhueta continua vindo da
    // semente, que é o id da unidade.
    const primeira = identidadeDaIlha(0, 1234)
    const decimaPrimeira = identidadeDaIlha(10, 1234)

    expect(decimaPrimeira.marco).toBe(primeira.marco)
    expect(assinaturaDaSilhueta(decimaPrimeira)).toBe(assinaturaDaSilhueta(primeira))

    const outraSemente = identidadeDaIlha(10, 4321)
    expect(outraSemente.marco).toBe(primeira.marco)
    expect(assinaturaDaSilhueta(outraSemente)).not.toBe(assinaturaDaSilhueta(primeira))
  })

  it('com dez mil sementes diferentes, as silhuetas se espalham', () => {
    // Se a faixa de variação fosse estreita demais, duas ilhas quaisquer sairiam
    // parecidas e o mundo voltaria a parecer repetido. Aqui se mede a variação
    // real, e não a intenção: quantas silhuetas distintas saem de mil sementes.
    const assinaturas = new Set<string>()
    for (let semente = 1; semente <= 1000; semente += 1) {
      assinaturas.add(assinaturaDaSilhueta(identidadeDaIlha(semente % 7, semente)))
    }
    expect(assinaturas.size).toBeGreaterThan(900)
  })
})

describe('toda identidade cabe no que foi conferido', () => {
  it('respeita as faixas declaradas', () => {
    for (const identidade of IDENTIDADES) {
      const { formato, vegetacao } = identidade

      expect(formato.raioDoTopo).toBeGreaterThanOrEqual(FAIXAS.raioDoTopo.minimo)
      expect(formato.raioDoTopo).toBeLessThanOrEqual(FAIXAS.raioDoTopo.maximo)

      expect(formato.altura).toBeGreaterThanOrEqual(FAIXAS.altura.minimo)
      expect(formato.altura).toBeLessThanOrEqual(FAIXAS.altura.maximo)

      expect(FAIXAS.segmentosRadiais).toContain(formato.segmentosRadiais)

      expect(formato.aneis).toBeGreaterThanOrEqual(FAIXAS.aneis.minimo)
      expect(formato.aneis).toBeLessThanOrEqual(FAIXAS.aneis.maximo)
      expect(Number.isInteger(formato.aneis)).toBe(true)

      expect(formato.amplitude).toBeGreaterThanOrEqual(FAIXAS.amplitude.minimo)
      expect(formato.amplitude).toBeLessThanOrEqual(FAIXAS.amplitude.maximo)

      expect(formato.expoenteDoPerfil).toBeGreaterThanOrEqual(FAIXAS.expoenteDoPerfil.minimo)
      expect(formato.expoenteDoPerfil).toBeLessThanOrEqual(FAIXAS.expoenteDoPerfil.maximo)

      expect(formato.inclinacaoDoCapim).toBeGreaterThanOrEqual(FAIXAS.inclinacaoDoCapim.minimo)
      expect(formato.inclinacaoDoCapim).toBeLessThanOrEqual(FAIXAS.inclinacaoDoCapim.maximo)

      expect(vegetacao.arvores).toBeGreaterThanOrEqual(FAIXAS.arvores.minimo)
      expect(vegetacao.arvores).toBeLessThanOrEqual(FAIXAS.arvores.maximo)
      expect(vegetacao.pedras).toBeGreaterThanOrEqual(FAIXAS.pedras.minimo)
      expect(vegetacao.pedras).toBeLessThanOrEqual(FAIXAS.pedras.maximo)
      expect(vegetacao.distanciaMaxima).toBeGreaterThan(vegetacao.distanciaMinima)
      expect(vegetacao.distanciaMaxima).toBeLessThan(1)
    }
  })

  it('a ilha mais larga ainda deixa vão entre as bordas', () => {
    // A distância entre dois centros é `raio + raio + vão`: se o raio máximo
    // passasse do que a conta prevê, duas ilhas se encostariam e a ponte teria
    // comprimento negativo.
    const maiorRaio = Math.max(...IDENTIDADES.map((identidade) => identidade.formato.raioDoTopo))
    expect(maiorRaio * 2).toBeLessThan(FAIXAS.raioDoTopo.maximo * 2 + 1)
    expect(maiorRaio).toBeLessThanOrEqual(FAIXAS.raioDoTopo.maximo)
  })

  it('as estruturas ficam dentro do capim, e o marco também', () => {
    for (const identidade of IDENTIDADES) {
      const raio = identidade.formato.raioDoTopo

      for (const nome of ['biblioteca', 'mesa', 'placa'] as const) {
        const lugar = LUGARES_NA_ILHA[nome]
        const posicao = posicaoNoCapim(raio, lugar)
        const distancia = Math.hypot(posicao.x, posicao.z)

        expect(
          distancia + lugar.ocupacao * raio,
          `A ${nome} sairia do capim de uma ilha de raio ${raio.toFixed(2)}`,
        ).toBeLessThanOrEqual(raio * 0.98)
      }
    }
  })

  it('os lugares são ângulos diferentes, e nenhum no centro exato', () => {
    const lugares = Object.values(LUGARES_NA_ILHA)
    for (const lugar of lugares) {
      expect(lugar.raio).toBeGreaterThan(0)
      expect(lugar.raio).toBeLessThan(1)
    }
    const angulos = new Set(lugares.map((lugar) => lugar.angulo.toFixed(4)))
    expect(angulos.size).toBe(lugares.length)
  })
})
