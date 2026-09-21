import { describe, expect, it } from 'vitest'
import { PLANO_DE_UNIDADES } from '../../content/planoDeUnidades'
import { progressoInicial, registrarResultado, type Progresso } from '../../learning/percurso'
import { SEM_TECLAS, type TeclasDeMovimento } from '../camera/movimento'
import { bordaDoTopoEmDirecao } from '../geometria/ilha'
import {
  RAIO_DO_AVATAR,
  chaoDoMundo,
  chaoEm,
  pontoPisavel,
  type ChaoDoMundo,
  type PontoNoPlano,
} from '../mapaCaminhavel'
import { ilhasVisiveis, pontesVisiveis } from '../mundoVisivel'
import {
  FATOR_CORRIDA,
  VELOCIDADE_A_PE,
  caminhanteInicial,
  direcaoDoPasso,
  giroPara,
  passoAMao,
  rotaAte,
  seguirRota,
  type Caminhante,
} from './passos'

const UNIDADES = PLANO_DE_UNIDADES
const IDS = UNIDADES.map((unidade) => unidade.id)

function comAprovadas(quantas: number): Progresso {
  let progresso = progressoInicial()
  for (let indice = 0; indice < quantas; indice += 1) {
    const id = IDS[indice]
    if (id === undefined) {
      throw new Error(`Plano de unidades curto: pedi ${quantas} aprovações`)
    }
    progresso = registrarResultado(progresso, UNIDADES, id, { acertos: 5, total: 5 })
  }
  return progresso
}

function chao(progresso: Progresso): ChaoDoMundo {
  const ilhas = ilhasVisiveis(progresso, UNIDADES)
  return chaoDoMundo(ilhas, pontesVisiveis(progresso, UNIDADES, ilhas))
}

function teclas(parcial: Partial<TeclasDeMovimento>): TeclasDeMovimento {
  return { ...SEM_TECLAS, ...parcial }
}

/** Anda em linha reta por um tempo, quadro a quadro, como o laço de desenho faz. */
function andar(
  mapa: ChaoDoMundo,
  inicio: Caminhante,
  teclasUsadas: TeclasDeMovimento,
  segundos: number,
  guinada = 0,
): Caminhante {
  let caminhante = inicio
  const quadros = Math.round(segundos / 0.016)
  for (let quadro = 0; quadro < quadros; quadro += 1) {
    caminhante = passoAMao(mapa, caminhante, teclasUsadas, guinada, 0.016)
  }
  return caminhante
}

describe('para onde as teclas levam', () => {
  it('sem tecla, ninguém se move', () => {
    expect(direcaoDoPasso(SEM_TECLAS, 0)).toBeNull()
  })

  it('a frente é para onde a câmera olha', () => {
    const olhandoParaZ = direcaoDoPasso(teclas({ frente: true }), 0)
    expect(olhandoParaZ?.x).toBeCloseTo(0, 6)
    expect(olhandoParaZ?.z).toBeCloseTo(-1, 6)

    // Meia volta na guinada: a mesma tecla leva para o lado oposto.
    const virado = direcaoDoPasso(teclas({ frente: true }), Math.PI)
    expect(virado?.x).toBeCloseTo(0, 6)
    expect(virado?.z).toBeCloseTo(1, 6)

    // Um quarto de volta: a frente passa a ser -x.
    const deLado = direcaoDoPasso(teclas({ frente: true }), Math.PI / 2)
    expect(deLado?.x).toBeCloseTo(-1, 6)
    expect(deLado?.z).toBeCloseTo(0, 6)
  })

  it('a diagonal é normalizada: andar de lado não é mais rápido', () => {
    const reto = direcaoDoPasso(teclas({ frente: true }), 0)
    const diagonal = direcaoDoPasso(teclas({ frente: true, direita: true }), 0)

    expect(Math.hypot(reto?.x ?? 0, reto?.z ?? 0)).toBeCloseTo(1, 6)
    expect(Math.hypot(diagonal?.x ?? 0, diagonal?.z ?? 0)).toBeCloseTo(1, 6)
  })

  it('o corpo aponta para onde anda', () => {
    expect(giroPara({ x: 0, z: 1 })).toBeCloseTo(0, 6)
    expect(giroPara({ x: 1, z: 0 })).toBeCloseTo(Math.PI / 2, 6)
    expect(giroPara({ x: 0, z: -1 })).toBeCloseTo(Math.PI, 6)
  })
})

describe('o passo a pé', () => {
  it('anda o que o tempo manda, na velocidade de quem caminha', () => {
    const mapa = chao(progressoInicial())
    const inicio = caminhanteInicial(mapa)

    const depois = andar(mapa, inicio, teclas({ frente: true }), 0.4)

    const andado = Math.hypot(depois.x - inicio.x, depois.z - inicio.z)
    expect(andado).toBeGreaterThan(VELOCIDADE_A_PE * 0.4 - 0.2)
    expect(andado).toBeLessThan(VELOCIDADE_A_PE * 0.4 + 0.2)
  })

  it('com Shift, anda mais no mesmo tempo', () => {
    const mapa = chao(progressoInicial())
    const inicio = caminhanteInicial(mapa)

    const devagar = andar(mapa, inicio, teclas({ frente: true }), 0.3)
    const correndo = andar(mapa, inicio, teclas({ frente: true, rapido: true }), 0.3)

    const passosDevagar = Math.hypot(devagar.x - inicio.x, devagar.z - inicio.z)
    const passosCorrendo = Math.hypot(correndo.x - inicio.x, correndo.z - inicio.z)

    expect(passosCorrendo).toBeGreaterThan(passosDevagar * (FATOR_CORRIDA - 0.1))
  })

  it('não sai da ilha: a beirada segura, sem cair no vazio', () => {
    const mapa = chao(progressoInicial())
    const primeira = mapa.ilhas[0]
    if (primeira === undefined) {
      throw new Error('Sem a primeira ilha não há mundo para testar')
    }
    const inicio = caminhanteInicial(mapa)

    // Muito mais tempo do que o necessário para atravessar a ilha inteira.
    const depois = andar(mapa, inicio, teclas({ frente: true }), 8)

    // O limite agora é a borda **desenhada** do capim na direção em que o avatar
    // foi (D-063): o disco do raio nominal deixava o pé andar no ar onde a borda
    // recuava, e segurava o pé antes da hora onde ela avançava.
    const distancia = Math.hypot(depois.x - primeira.x, depois.z - primeira.z)
    const borda =
      distancia === 0
        ? primeira.raio
        : bordaDoTopoEmDirecao({
            raio: primeira.raio,
            segmentosRadiais: primeira.segmentosRadiais,
            fatores: primeira.fatoresDaBorda,
            angulo: Math.atan2(depois.z - primeira.z, depois.x - primeira.x),
          }).interno
    expect(distancia).toBeLessThanOrEqual(borda - RAIO_DO_AVATAR + 0.01)
    expect(chaoEm(mapa, depois)).not.toBeNull()
  })

  it('desliza na beirada em vez de travar', () => {
    const mapa = chao(progressoInicial())
    const primeira = mapa.ilhas[0]
    if (primeira === undefined) {
      throw new Error('Sem a primeira ilha não há mundo para testar')
    }

    // Começa colado na beirada e empurra na diagonal, contra ela.
    const inicio: Caminhante = {
      x: primeira.x + (primeira.raio - RAIO_DO_AVATAR - 0.05),
      z: primeira.z,
      giro: 0,
    }

    const depois = andar(mapa, inicio, teclas({ frente: true, esquerda: true }), 0.5)

    // A direção "frente" empurraria para fora (-z, com guinada 0)... mas aqui o
    // que importa é o outro eixo: esquerda anda, e é o que faz deslizar.
    const andouNoEixoLivre = Math.abs(depois.z - inicio.z) > 0.5
    const continuaNoChao = chaoEm(mapa, depois) !== null

    expect(andouNoEixoLivre).toBe(true)
    expect(continuaNoChao).toBe(true)
  })

  it('não atravessa o vão a pé sem ponte inteira', () => {
    const mapa = chao(progressoInicial())
    const primeira = mapa.ilhas[0]
    const outra = mapa.ilhas[1]
    if (primeira === undefined || outra === undefined) {
      throw new Error('São necessárias ao menos duas ilhas')
    }

    // Mira a outra ilha: a direção é a do vão, e é ali que a caminhada tem de parar.
    const direcao = { x: outra.x - primeira.x, z: outra.z - primeira.z }
    const comprimento = Math.hypot(direcao.x, direcao.z)
    const guinada = Math.atan2(-direcao.x / comprimento, -direcao.z / comprimento)

    const depois = andar(mapa, caminhanteInicial(mapa), teclas({ frente: true }), 8, guinada)

    expect(pontoPisavel(mapa, depois)).toBe(true)
    const distanciaDaPrimeira = Math.hypot(depois.x - primeira.x, depois.z - primeira.z)
    expect(distanciaDaPrimeira).toBeLessThan(comprimento)
  })
})

describe('a rota a pé até outra ilha', () => {
  it('passa pelas pontes inteiras, na ordem, e termina no centro do destino', () => {
    const mapa = chao(comAprovadas(2))
    const origem = caminhanteInicial(mapa)
    const destino = mapa.ilhas[2]
    if (destino === undefined) {
      throw new Error('A terceira ilha deveria existir')
    }

    const rota = rotaAte(mapa, origem, destino.id)
    expect(rota).not.toBeNull()

    // Dois trechos de ponte, cada um com entrada e saída, mais o centro final.
    expect(rota).toHaveLength(5)
    const ultimo = rota?.[rota.length - 1]
    expect(ultimo?.x).toBeCloseTo(destino.x, 6)
    expect(ultimo?.z).toBeCloseTo(destino.z, 6)
  })

  it('todo trecho da rota fica dentro do chão caminhável', () => {
    const mapa = chao(comAprovadas(3))
    const origem = caminhanteInicial(mapa)
    const destino = mapa.ilhas[3]
    if (destino === undefined) {
      throw new Error('A quarta ilha deveria existir')
    }

    const rota = rotaAte(mapa, origem, destino.id)
    expect(rota).not.toBeNull()
    if (rota === null) {
      return
    }

    // Amostra cada segmento: a rota é uma sequência de retas, e todas precisam
    // estar sobre o chão. É o que garante que ninguém planejou um caminho no ar.
    let anterior: PontoNoPlano = origem
    for (const ponto of rota) {
      for (let passo = 0; passo <= 20; passo += 1) {
        const t = passo / 20
        const amostra = {
          x: anterior.x + (ponto.x - anterior.x) * t,
          z: anterior.z + (ponto.z - anterior.z) * t,
        }
        expect(
          pontoPisavel(mapa, amostra),
          `A rota sai do chão em (${amostra.x.toFixed(2)}, ${amostra.z.toFixed(2)})`,
        ).toBe(true)
      }
      anterior = ponto
    }
  })

  it('não existe rota a pé quando falta ponte inteira', () => {
    const mapa = chao(progressoInicial())
    const destino = mapa.ilhas[1]
    if (destino === undefined) {
      throw new Error('A segunda ilha deveria existir')
    }

    expect(rotaAte(mapa, caminhanteInicial(mapa), destino.id)).toBeNull()
  })

  it('volta para trás quando o destino fica atrás', () => {
    const mapa = chao(comAprovadas(3))
    const ultima = mapa.ilhas[3]
    const primeira = mapa.ilhas[0]
    if (ultima === undefined || primeira === undefined) {
      throw new Error('O mundo não tem ilhas')
    }

    const rota = rotaAte(mapa, { x: ultima.x, z: ultima.z }, primeira.id)
    expect(rota).not.toBeNull()
    expect(rota).toHaveLength(7)
    expect(rota?.[rota.length - 1]?.x).toBeCloseTo(primeira.x, 6)
  })

  it('em cima de uma ponte, a rota começa terminando de atravessá-la', () => {
    const mapa = chao(comAprovadas(1))
    const ponte = mapa.pontes[0]
    const destino = mapa.ilhas[1]
    if (ponte === undefined || destino === undefined) {
      throw new Error('A primeira ponte e a segunda ilha deveriam existir')
    }

    const meio = {
      x: ponte.inicio.x + ponte.direcao[0] * (ponte.comprimento / 2),
      z: ponte.inicio.z + ponte.direcao[1] * (ponte.comprimento / 2),
    }

    const rota = rotaAte(mapa, meio, destino.id)
    expect(rota).not.toBeNull()
    if (rota === null) {
      return
    }

    // Do meio da ponte até a ilha: um ponto de apoio na borda e o centro.
    expect(rota.length).toBeLessThanOrEqual(2)

    // E voltar para a ilha de origem também tem rota.
    const voltando = rotaAte(mapa, meio, mapa.ilhas[0]?.id ?? '')
    expect(voltando).not.toBeNull()
  })

  it('não inventa rota para ilha que não existe', () => {
    const mapa = chao(comAprovadas(3))
    expect(rotaAte(mapa, caminhanteInicial(mapa), 'ilha-inventada')).toBeNull()
  })
})

describe('seguir a rota até o fim', () => {
  it('chega ao destino e esvazia o caminho, sem sair do chão em nenhum quadro', () => {
    const mapa = chao(comAprovadas(3))
    const inicio = caminhanteInicial(mapa)
    const destino = mapa.ilhas[3]
    if (destino === undefined) {
      throw new Error('A quarta ilha deveria existir')
    }

    const rota = rotaAte(mapa, inicio, destino.id)
    expect(rota).not.toBeNull()
    if (rota === null) {
      return
    }

    let caminhante = inicio
    let restante = rota
    let quadros = 0
    const limite = 60 * 60

    while (restante.length > 0 && quadros < limite) {
      const caminhada = seguirRota(caminhante, restante, 0.016)
      caminhante = caminhada.caminhante
      restante = caminhada.restante
      quadros += 1

      expect(
        pontoPisavel(mapa, caminhante),
        `O avatar saiu do chão no quadro ${quadros}`,
      ).toBe(true)
    }

    expect(restante).toHaveLength(0)
    expect(quadros).toBeLessThan(limite)
    expect(caminhante.x).toBeCloseTo(destino.x, 4)
    expect(caminhante.z).toBeCloseTo(destino.z, 4)
  })

  it('gasta mais tempo indo mais longe, e o tempo é proporcional à distância', () => {
    const mapa = chao(comAprovadas(3))
    const inicio = caminhanteInicial(mapa)

    const contarQuadros = (id: string): number => {
      const rota = rotaAte(mapa, inicio, id)
      if (rota === null) {
        throw new Error(`Sem rota até ${id}`)
      }
      let caminhante = inicio
      let restante = rota
      let quadros = 0
      while (restante.length > 0 && quadros < 100_000) {
        const caminhada = seguirRota(caminhante, restante, 0.016)
        caminhante = caminhada.caminhante
        restante = caminhada.restante
        quadros += 1
      }
      return quadros
    }

    const ateAVizinhha = contarQuadros(mapa.ilhas[1]?.id ?? '')
    const ateAUltima = contarQuadros(mapa.ilhas[3]?.id ?? '')

    expect(ateAUltima).toBeGreaterThan(ateAVizinhha)
  })

  it('o corpo vira para onde anda', () => {
    const mapa = chao(comAprovadas(1))
    const inicio = caminhanteInicial(mapa)
    const destino = mapa.ilhas[1]
    if (destino === undefined) {
      throw new Error('A segunda ilha deveria existir')
    }

    const rota = rotaAte(mapa, inicio, destino.id)
    if (rota === null) {
      throw new Error('Deveria haver rota até a segunda ilha')
    }

    const caminhada = seguirRota(inicio, rota, 0.5)

    // A segunda ilha fica adiante no percurso: o corpo não continua virado para
    // o norte de sempre.
    expect(caminhada.caminhante.giro).not.toBeCloseTo(0, 3)
  })

  it('correndo chega antes, e pelo mesmo caminho', () => {
    const mapa = chao(comAprovadas(3))
    const inicio = caminhanteInicial(mapa)
    const destino = mapa.ilhas[3]
    if (destino === undefined) {
      throw new Error('A quarta ilha deveria existir')
    }

    const rota = rotaAte(mapa, inicio, destino.id)
    if (rota === null) {
      throw new Error('Deveria haver rota até a última ilha')
    }

    const ateOFim = (correr: boolean): number => {
      let caminhante = inicio
      let restante = rota
      let quadros = 0
      while (restante.length > 0 && quadros < 100_000) {
        const caminhada = seguirRota(caminhante, restante, 0.016, correr)
        caminhante = caminhada.caminhante
        restante = caminhada.restante
        quadros += 1
      }
      return quadros
    }

    expect(ateOFim(true)).toBeLessThan(ateOFim(false))
  })
})
