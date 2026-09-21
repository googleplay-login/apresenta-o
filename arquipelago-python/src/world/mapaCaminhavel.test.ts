import { describe, expect, it } from 'vitest'
import { PLANO_DE_UNIDADES } from '../content/planoDeUnidades'
import { progressoInicial, registrarResultado, type Progresso } from '../learning/percurso'
import { alturaDoTopo } from './geometria/ilha'
import { bordaDaIlhaEmDirecao, bordaExternaDaIlhaEmDirecao } from './mapaDoMundo'
import {
  LARGURA_DO_TABULEIRO,
  RAIO_DO_AVATAR,
  chaoDoMundo,
  chaoEm,
  descricaoDoLugar,
  localizacaoEm,
  pontoPisavel,
  postoInicial,
} from './mapaCaminhavel'
import { ilhasVisiveis, pontesVisiveis, type PonteVisivel } from './mundoVisivel'

const UNIDADES = PLANO_DE_UNIDADES
const IDS = UNIDADES.map((unidade) => unidade.id)

function comAprovadas(quantas: number): Progresso {
  let progresso = progressoInicial()
  for (let indice = 0; indice < quantas; indice += 1) {
    const id = IDS[indice]
    if (id === undefined) {
      throw new Error(`Plano de unidades curto: pedi ${quantas} aprovações e só há ${IDS.length}`)
    }
    progresso = registrarResultado(progresso, UNIDADES, id, { acertos: 5, total: 5 })
  }
  return progresso
}

function mundo(progresso: Progresso) {
  const ilhas = ilhasVisiveis(progresso, UNIDADES)
  const pontes = pontesVisiveis(progresso, UNIDADES, ilhas)
  return { ilhas, pontes, chao: chaoDoMundo(ilhas, pontes) }
}

describe('o chão caminhável nasce do que o domínio resolveu', () => {
  it('tem uma superfície por ilha, com o título de cada uma', () => {
    const { ilhas, chao } = mundo(progressoInicial())

    expect(chao.ilhas).toHaveLength(ilhas.length)
    for (const [indice, ilha] of ilhas.entries()) {
      const superficie = chao.ilhas[indice]
      expect(superficie?.id).toBe(ilha.id)
      expect(superficie?.titulo).toBe(ilha.titulo)
      expect(superficie?.x).toBeCloseTo(ilha.centro[0], 6)
      expect(superficie?.z).toBeCloseTo(ilha.centro[2], 6)
      expect(superficie?.altura).toBeCloseTo(ilha.centro[1], 6)
    }
  })

  it('deixa a ponte pela metade fora do chão: não se atravessa a pé o que não está inteiro', () => {
    const { chao } = mundo(progressoInicial())

    expect(chao.pontes).toHaveLength(0)
  })

  it('abre uma faixa de chão por ponte liberada, e na ordem do percurso', () => {
    const { pontes, chao } = mundo(comAprovadas(2))
    const liberadas = pontes.filter((ponte) => ponte.liberada)

    expect(liberadas).toHaveLength(2)
    expect(chao.pontes.map((ponte) => [ponte.de, ponte.para])).toEqual(
      liberadas.map((ponte) => [ponte.de, ponte.para]),
    )
  })

  it('começa no centro da primeira ilha', () => {
    const { ilhas, chao } = mundo(progressoInicial())
    const primeira = ilhas[0]
    if (primeira === undefined) {
      throw new Error('Sem a primeira ilha não há mundo para testar')
    }

    const posto = postoInicial(chao)
    expect(posto.x).toBeCloseTo(primeira.centro[0], 6)
    expect(posto.z).toBeCloseTo(primeira.centro[2], 6)
  })
})

describe('a altura do chão', () => {
  it('no centro da ilha é a altura do capim no centro', () => {
    const { ilhas, chao } = mundo(progressoInicial())

    for (const ilha of ilhas) {
      const altura = chaoEm(chao, { x: ilha.centro[0], z: ilha.centro[2] })
      expect(altura).toBeCloseTo(ilha.centro[1], 6)
    }
  })

  it('sobe do centro para a borda, porque o capim é um domo', () => {
    const { ilhas, chao } = mundo(progressoInicial())
    const ilha = ilhas[0]
    const superficie = chao.ilhas[0]
    if (ilha === undefined || superficie === undefined) {
      throw new Error('Sem a primeira ilha não há mundo para testar')
    }

    // Onde o capim **desenhado** termina na direção +x (D-063): a borda é um
    // polígono, e o chão caminhável passou a ler o mesmo polígono. O último passo
    // do avatar é a borda menos a margem do corpo.
    const borda = bordaDaIlhaEmDirecao(ilha, 1, 0)
    const ultimoPasso = borda - RAIO_DO_AVATAR
    const passos = [0, 1, 2, 3, 4].map((indice) => (indice / 4) * ultimoPasso)
    const alturas = passos.map((distancia) =>
      chaoEm(chao, { x: ilha.centro[0] + distancia, z: ilha.centro[2] }),
    )

    for (const [indice, altura] of alturas.entries()) {
      expect(altura).not.toBeNull()
      if (indice === 0) {
        continue
      }
      const anterior = alturas[indice - 1] ?? 0
      expect(altura ?? 0).toBeGreaterThanOrEqual(anterior)
    }

    // O número da altura sai da mesma função que gerou a malha do capim, com a
    // inclinação **desta** ilha — cada uma sobe de um jeito.
    const inclinacao = ilha.identidade.formato.inclinacaoDoCapim
    const esperadoNaBorda = ilha.centro[1] + alturaDoTopo(ilha.raio, borda, inclinacao)
    expect(chaoEm(chao, { x: ilha.centro[0] + ultimoPasso, z: ilha.centro[2] })).toBeCloseTo(
      ilha.centro[1] + alturaDoTopo(ilha.raio, ultimoPasso, inclinacao),
      6,
    )
    expect(esperadoNaBorda).toBeGreaterThan(ilha.centro[1])
    // E acima disso não há mais capim: a margem do corpo já foi toda usada.
    expect(chaoEm(chao, { x: ilha.centro[0] + ultimoPasso + 0.2, z: ilha.centro[2] })).toBeNull()

    // A prova de que a conta mudou de verdade: em alguma direção, o capim
    // desenhado termina a mais de um passo do raio nominal. Era essa diferença
    // que deixava o avatar andando no ar (e a ponte no ar, do outro lado).
    const direcoes: readonly (readonly [number, number])[] = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]
    const maiorDesvio = Math.max(
      ...direcoes.map(([ux, uz]) => Math.abs(bordaDaIlhaEmDirecao(ilha, ux, uz) - ilha.raio)),
    )
    expect(maiorDesvio).toBeGreaterThan(0.2)

    // E o alcance do pé continua **dentro** do polígono desenhado, nunca além.
    for (const [ux, uz] of direcoes) {
      const alcance = bordaDaIlhaEmDirecao(ilha, ux, uz)
      const externo = bordaExternaDaIlhaEmDirecao(ilha, ux, uz)
      expect(alcance).toBeLessThanOrEqual(externo)
      expect(alcance).toBeGreaterThan(externo * 0.85)
    }
  })

  it('no topo do tabuleiro é a altura do capim nas duas pontas', () => {
    const { ilhas, chao } = mundo(comAprovadas(1))
    const ponte = chao.pontes[0]
    if (ponte === undefined) {
      throw new Error('A primeira ponte deveria estar liberada com uma aprovação')
    }

    const entradas: readonly { x: number; z: number }[] = [
      { x: ponte.inicio.x, z: ponte.inicio.z },
      {
        x: ponte.inicio.x + ponte.direcao[0] * ponte.comprimento,
        z: ponte.inicio.z + ponte.direcao[1] * ponte.comprimento,
      },
    ]

    // Começo: o capim da borda da ilha de origem. Fim: o da ilha de destino.
    const inclinacaoDe = (indice: number) =>
      ilhas[indice]?.identidade.formato.inclinacaoDoCapim ?? 0.06
    expect(chaoEm(chao, entradas[0] as { x: number; z: number })).toBeCloseTo(
      (ilhas[0]?.centro[1] ?? 0) +
        alturaDoTopo(ilhas[0]?.raio ?? 6, ilhas[0]?.raio ?? 6, inclinacaoDe(0)),
      5,
    )
    expect(chaoEm(chao, entradas[1] as { x: number; z: number })).toBeCloseTo(
      (ilhas[1]?.centro[1] ?? 0) +
        alturaDoTopo(ilhas[1]?.raio ?? 6, ilhas[1]?.raio ?? 6, inclinacaoDe(1)),
      5,
    )
  })

  it('o meio da ponte fica entre as duas pontas: a travessia sobe com a trilha', () => {
    const { chao } = mundo(comAprovadas(1))
    const ponte = chao.pontes[0]
    if (ponte === undefined) {
      throw new Error('A primeira ponte deveria estar liberada com uma aprovação')
    }

    const meio = chaoEm(chao, {
      x: ponte.inicio.x + ponte.direcao[0] * (ponte.comprimento / 2),
      z: ponte.inicio.z + ponte.direcao[1] * (ponte.comprimento / 2),
    })
    expect(meio).not.toBeNull()
    expect(meio ?? 0).toBeGreaterThan(ponte.inicio.altura)
    expect(meio ?? 0).toBeLessThan(ponte.alturaNoFim)
  })

  it('não há chão no vão entre duas ilhas quando a ponte está pela metade', () => {
    const { ilhas, chao } = mundo(progressoInicial())
    const uma = ilhas[0]
    const outra = ilhas[1]
    if (uma === undefined || outra === undefined) {
      throw new Error('São necessárias ao menos duas ilhas')
    }

    const meio = { x: (uma.centro[0] + outra.centro[0]) / 2, z: (uma.centro[2] + outra.centro[2]) / 2 }

    expect(chaoEm(chao, meio)).toBeNull()
    expect(pontoPisavel(chao, meio)).toBe(false)
  })

  it('a faixa caminhável é mais estreita que o tabuleiro, pela largura do corpo', () => {
    const { chao } = mundo(comAprovadas(1))
    const ponte = chao.pontes[0]
    if (ponte === undefined) {
      throw new Error('A primeira ponte deveria estar liberada com uma aprovação')
    }

    const limite = LARGURA_DO_TABULEIRO / 2 - RAIO_DO_AVATAR
    const perto = {
      x: ponte.inicio.x - ponte.direcao[1] * (limite - 0.05),
      z: ponte.inicio.z + ponte.direcao[0] * (limite - 0.05),
    }
    const fora = {
      x: ponte.inicio.x - ponte.direcao[1] * (limite + 0.05),
      z: ponte.inicio.z + ponte.direcao[0] * (limite + 0.05),
    }

    expect(pontoPisavel(chao, perto)).toBe(true)
    expect(pontoPisavel(chao, fora)).toBe(false)
  })
})

describe('onde o avatar está', () => {
  it('reconhece o capim e o tabuleiro', () => {
    const { ilhas, chao } = mundo(comAprovadas(1))
    const uma = ilhas[0]
    const ponte = chao.pontes[0]
    if (uma === undefined || ponte === undefined) {
      throw new Error('Faltou mundo para o teste')
    }

    expect(localizacaoEm(chao, { x: uma.centro[0], z: uma.centro[2] })).toEqual({
      tipo: 'ilha',
      id: uma.id,
    })

    const meioDaPonte = {
      x: ponte.inicio.x + ponte.direcao[0] * (ponte.comprimento / 2),
      z: ponte.inicio.z + ponte.direcao[1] * (ponte.comprimento / 2),
    }
    expect(localizacaoEm(chao, meioDaPonte)).toEqual({
      tipo: 'ponte',
      de: ponte.de,
      para: ponte.para,
    })

    // Ao lado do tabuleiro é vazio, mesmo na altura da ponte: o chão acaba na
    // largura da faixa.
    const aoLadoDoTabuleiro = {
      x: meioDaPonte.x - ponte.direcao[1] * (ponte.meiaLargura + 1),
      z: meioDaPonte.z + ponte.direcao[0] * (ponte.meiaLargura + 1),
    }
    expect(localizacaoEm(chao, aoLadoDoTabuleiro)).toBeNull()
    expect(chaoEm(chao, aoLadoDoTabuleiro)).toBeNull()
  })

  it('no vão, sem ponte, não é lugar nenhum', () => {
    const { ilhas, chao } = mundo(progressoInicial())
    const uma = ilhas[0]
    const outra = ilhas[1]
    if (uma === undefined || outra === undefined) {
      throw new Error('São necessárias ao menos duas ilhas')
    }

    expect(
      localizacaoEm(chao, {
        x: (uma.centro[0] + outra.centro[0]) / 2,
        z: (uma.centro[2] + outra.centro[2]) / 2,
      }),
    ).toBeNull()
  })

  it('descreve o lugar em palavras, para o painel e para o HUD dizerem o mesmo', () => {
    const { ilhas, chao } = mundo(comAprovadas(1))
    const uma = ilhas[0]
    const outra = ilhas[1]
    const ponte = chao.pontes[0]
    if (uma === undefined || outra === undefined || ponte === undefined) {
      throw new Error('Faltou mundo para o teste')
    }

    expect(descricaoDoLugar(chao, { tipo: 'ilha', id: uma.id })).toBe(`na ilha «${uma.titulo}»`)
    expect(descricaoDoLugar(chao, { tipo: 'ponte', de: uma.id, para: outra.id })).toBe(
      `na ponte entre «${uma.titulo}» e «${outra.titulo}»`,
    )
    expect(descricaoDoLugar(chao, null)).toBeNull()
  })

  it('avisa quando o lugar não existe mais no mapa', () => {
    const { chao } = mundo(progressoInicial())

    expect(descricaoDoLugar(chao, { tipo: 'ilha', id: 'ilha-que-nunca-existiu' })).toBeNull()
    expect(descricaoDoLugar(chao, { tipo: 'ponte', de: 'a', para: 'b' })).toBeNull()
    expect(
      descricaoDoLugar(chao, { tipo: 'ponte', de: chao.ilhas[0]?.id ?? '', para: 'b' }),
    ).toBeNull()
  })
})

describe('a ponte caminhável', () => {
  it('é encontrada nos dois sentidos', async () => {
    const { chao } = mundo(comAprovadas(1))
    const ponte = chao.pontes[0] as PonteVisivel | undefined
    if (ponte === undefined) {
      throw new Error('A primeira ponte deveria estar liberada com uma aprovação')
    }

    const { ponteCaminhavel } = await import('./mapaCaminhavel')
    expect(ponteCaminhavel(chao, ponte.de, ponte.para)?.para).toBe(ponte.para)
    expect(ponteCaminhavel(chao, ponte.para, ponte.de)?.de).toBe(ponte.de)
    expect(ponteCaminhavel(chao, 'nada', 'nada')).toBeNull()
  })
})
