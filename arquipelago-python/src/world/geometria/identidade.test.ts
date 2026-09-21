import { describe, expect, it } from 'vitest'
import { PLANO_DE_UNIDADES } from '../../content/planoDeUnidades'
import { sementeDeTexto } from './aleatorio'
import {
  FAMILIAS_DE_PONTA,
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
 * estavam todas iguais**. Era verdade — as dez primeiras saíam do mesmo raio, da mesma
 * altura, das mesmas estruturas e da mesma cor, e a única diferença era um tremor
 * pequeno na pedra. De longe, o arquipélago parecia o mesmo lugar repetido.
 *
 * O que se prova aqui, sem precisar de navegador:
 *
 *  - as ilhas do percurso têm **marcos** diferentes, **silhuetas** diferentes e
 *    **tons** diferentes, uma a uma;
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
  it('cada ilha do percurso tem um marco diferente', () => {
    const marcos = IDENTIDADES.map((identidade) => identidade.marco)
    expect(marcos).toHaveLength(ILHAS.length)
    expect(new Set(marcos).size, `Marcos repetidos: ${marcos.join(', ')}`).toBe(ILHAS.length)
    expect(new Set(marcos).size).toBeLessThanOrEqual(MARCOS.length)
  })

  it('cada ilha tem uma silhueta diferente', () => {
    const assinaturas = IDENTIDADES.map(assinaturaDaSilhueta)
    expect(
      new Set(assinaturas).size,
      `Duas ilhas ficaram com a mesma forma: ${assinaturas.join(', ')}`,
    ).toBe(ILHAS.length)
  })

  it('cada ilha tem um tom diferente', () => {
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
    // O marco sai do **índice**, e a silhueta sai da **semente**. Duas provas:
    // a mesma posição com sementes diferentes dá o mesmo marco, e posições que
    // distam o tamanho da lista dão o mesmo marco (a lista dá a volta).
    const primeira = identidadeDaIlha(0, 1234)
    const comOutraSemente = identidadeDaIlha(0, 4321)

    expect(comOutraSemente.marco).toBe(primeira.marco)
    expect(assinaturaDaSilhueta(comOutraSemente)).not.toBe(assinaturaDaSilhueta(primeira))

    const voltaALista = identidadeDaIlha(MARCOS.length, 1234)
    expect(voltaALista.marco).toBe(primeira.marco)
    expect(assinaturaDaSilhueta(voltaALista)).toBe(assinaturaDaSilhueta(primeira))

    // E enquanto houver marco na lista, nenhuma ilha do percurso repete o da
    // vizinha: as ilhas 11 e 12 (capítulos 10 e 11) ganharam construções próprias.
    const doze = Array.from({ length: MARCOS.length }, (_, indice) => identidadeDaIlha(indice, 7).marco)
    expect(new Set(doze).size).toBe(MARCOS.length)
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

describe('a ponta da pedra (D-057)', () => {
  it('cada ilha tem a própria ponta, e todas cabem na faixa', () => {
    for (let indice = 0; indice < 10; indice += 1) {
      const { formato } = identidadeDaIlha(indice, 1000 + indice)
      expect(formato.pontaDoPerfil).toBeGreaterThanOrEqual(FAIXAS.pontaDoPerfil.minimo)
      expect(formato.pontaDoPerfil).toBeLessThanOrEqual(FAIXAS.pontaDoPerfil.maximo)
    }
  })

  it('as três famílias aparecem, e a diferença entre elas se vê de longe', () => {
    // A ponta é a única parte da ilha que aparece sozinha contra o céu. Enquanto
    // todas terminavam no mesmo espinho de 2% do raio, a fileira de ilhas parecia
    // a mesma ilha repetida — por mais que altura, marco e tom mudassem.
    const pontas = Array.from(
      { length: 10 },
      (_, indice) => identidadeDaIlha(indice, 42).formato.pontaDoPerfil,
    )
    const menor = Math.min(...pontas)
    const maior = Math.max(...pontas)

    expect(FAMILIAS_DE_PONTA).toHaveLength(3)
    for (const familia of FAMILIAS_DE_PONTA) {
      const destaFamilia = pontas.filter(
        (ponta) => ponta >= familia.minimo && ponta <= familia.maximo,
      )
      expect(destaFamilia.length, `a família «${familia.nome}» não apareceu`).toBeGreaterThan(0)
    }

    // O espinho tem 0,15 a 0,43 de largura em unidades; o toco, quase 2. A
    // diferença passa de uma unidade inteira em qualquer ilha do mundo.
    expect(maior - menor).toBeGreaterThan(0.25)
  })

  it('a família da ponta segue a posição no percurso, e o valor segue a semente', () => {
    // Família por índice: as três aparecem sempre, sem depender de sorte. Valor
    // por semente: duas ilhas nunca terminam exatamente iguais.
    const daPrimeira = identidadeDaIlha(0, 7).formato.pontaDoPerfil
    const daQuarta = identidadeDaIlha(3, 7).formato.pontaDoPerfil
    const daSegunda = identidadeDaIlha(1, 7).formato.pontaDoPerfil

    expect(daQuarta).toBeLessThan(0.1)
    expect(daSegunda).toBeGreaterThan(0.1)

    // Mesmo índice, semente diferente: o valor muda.
    const comOutraSemente = identidadeDaIlha(0, 8).formato.pontaDoPerfil
    expect(comOutraSemente).not.toBe(daPrimeira)
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
