import { describe, expect, it } from 'vitest'
import { Euler, Vector3 } from 'three'
import { PLANO_DE_UNIDADES } from '../content/planoDeUnidades'
import { sementeDeTexto } from './geometria/aleatorio'
import { alturaDoTopo } from './geometria/ilha'
import { ESPESSURA_DO_TABULEIRO } from './geometria/solidos'
import {
  DISTANCIA_ENTRE_CENTROS,
  RAIO_DA_ILHA,
  SOBE_POR_ILHA,
  VAO_DA_PONTE,
  enquadramentoDaIlha,
  espalhamentoDasIlhas,
  ilhasDoMundo,
  pontesDoPercurso,
  ponteEntre,
} from './mapaDoMundo'

const ILHAS = ilhasDoMundo(PLANO_DE_UNIDADES)

describe('posição das ilhas', () => {
  it('gera uma ilha por unidade do plano, na ordem', () => {
    expect(ILHAS.length).toBe(PLANO_DE_UNIDADES.length)
    const ids = ILHAS.map((ilha) => ilha.id)
    const doPlano = [...PLANO_DE_UNIDADES].sort((a, b) => a.ordem - b.ordem).map((u) => u.id)
    expect(ids).toEqual(doPlano)
  })

  it('não depende da ordem em que as unidades chegam', () => {
    const embaralhadas = [...PLANO_DE_UNIDADES].reverse()
    expect(ilhasDoMundo(embaralhadas)).toEqual(ILHAS)
  })

  it('mantém as ilhas separadas: nenhuma encosta na outra', () => {
    // A curva em S afasta um pouco mais os centros: a distância em x é sempre a
    // distância entre centros, e a distância real no plano é maior ou igual.
    for (let indice = 0; indice < ILHAS.length - 1; indice += 1) {
      const uma = ILHAS[indice]!
      const outra = ILHAS[indice + 1]!
      const distancia = Math.hypot(
        outra.centro[0] - uma.centro[0],
        outra.centro[2] - uma.centro[2],
      )
      expect(distancia).toBeGreaterThanOrEqual(DISTANCIA_ENTRE_CENTROS)
      expect(outra.centro[0] - uma.centro[0]).toBeCloseTo(DISTANCIA_ENTRE_CENTROS, 6)
      // O vão entre as bordas nunca é menor que o previsto: se fosse, as ilhas
      // se sobreporiam e a ponte teria comprimento negativo.
      expect(distancia - uma.raio - outra.raio).toBeGreaterThanOrEqual(VAO_DA_PONTE)
    }
  })

  it('sobe uma ilha em relação à anterior', () => {
    for (let indice = 2; indice < ILHAS.length; indice += 1) {
      const diferenca = ILHAS[indice]!.centro[1] - ILHAS[indice - 1]!.centro[1]
      expect(diferenca).toBeCloseTo(SOBE_POR_ILHA, 6)
    }
  })

  it('centraliza o arquipélago na origem', () => {
    // A câmera de mapa olha para a origem. Arquipélago deslocado sairia de quadro.
    const mediaX = ILHAS.reduce((soma, ilha) => soma + ilha.centro[0], 0) / ILHAS.length
    const mediaZ = ILHAS.reduce((soma, ilha) => soma + ilha.centro[2], 0) / ILHAS.length
    expect(mediaX).toBeCloseTo(0, 6)
    expect(mediaZ).toBeCloseTo(0, 6)
  })

  it('dá a mesma semente para o mesmo id, e sementes diferentes para ilhas diferentes', () => {
    const sementes = ILHAS.map((ilha) => ilha.semente)
    expect(new Set(sementes).size).toBe(ILHAS.length)
    expect(sementeDeTexto('u01-primeiro-programa')).toBe(sementeDeTexto('u01-primeiro-programa'))
  })

  it('carrega título e tema do plano, sem inventar texto', () => {
    for (const ilha of ILHAS) {
      const doPlano = PLANO_DE_UNIDADES.find((unidade) => unidade.id === ilha.id)
      expect(ilha.titulo).toBe(doPlano?.titulo)
      expect(ilha.tema).toBe(doPlano?.tema)
    }
  })

  it('lida com mundo vazio e com uma ilha só, sem quebrar', () => {
    expect(ilhasDoMundo([])).toEqual([])
    const sozinha = ilhasDoMundo([PLANO_DE_UNIDADES[0]!])
    expect(sozinha.length).toBe(1)
    expect(sozinha[0]!.centro[0]).toBeCloseTo(0, 6)
    expect(espalhamentoDasIlhas(sozinha)).toBe(0)
  })
})

describe('ponte entre duas ilhas', () => {
  it('produz uma ponte por par de ilhas vizinhas', () => {
    expect(pontesDoPercurso(ILHAS).length).toBe(ILHAS.length - 1)
  })

  it('tem o comprimento do vão, e não da distância entre centros', () => {
    for (const ponte of pontesDoPercurso(ILHAS)) {
      expect(ponte.comprimento).toBeLessThan(DISTANCIA_ENTRE_CENTROS)
      expect(ponte.comprimento).toBeGreaterThan(DISTANCIA_ENTRE_CENTROS - 2 * RAIO_DA_ILHA - 0.001)
    }
  })

  it('termina na borda da outra ilha, com o topo encostado no capim', () => {
    // A ponte é gerada ao longo de +x. Aplicando a rotação calculada em Z e
    // depois em Y sobre o vetor (comprimento, 0, 0), o fim da ponte tem de cair
    // exatamente na borda da ilha de destino. O teste usa a própria biblioteca,
    // e não uma segunda cópia da conta: é o Three.js que decide se está certo.
    //
    // A altura é conferida **no topo do tabuleiro**, não no eixo dele: é o topo
    // que recebe o pé do avatar. Encostado no capim da borda, a travessia a pé
    // acontece sem degrau.
    for (let indice = 0; indice < ILHAS.length - 1; indice += 1) {
      const uma = ILHAS[indice]!
      const outra = ILHAS[indice + 1]!
      const ponte = ponteEntre(uma, outra)

      const euler = new Euler(0, ponte.rotacaoY, ponte.rotacaoZ, 'XYZ')
      const fim = new Vector3(ponte.comprimento, 0, 0).applyEuler(euler)
      fim.add(new Vector3(...ponte.posicao))

      const bordaEsperada = new Vector3(...outra.centro).add(
        new Vector3(-ponte.direcao[0], 0, -ponte.direcao[1]).multiplyScalar(outra.raio),
      )

      expect(fim.x).toBeCloseTo(bordaEsperada.x, 5)
      expect(fim.y + ESPESSURA_DO_TABULEIRO / 2).toBeCloseTo(
        bordaEsperada.y + alturaDoTopo(outra.raio, outra.raio),
        5,
      )
      expect(fim.z).toBeCloseTo(bordaEsperada.z, 5)
    }
  })

  it('começa na borda da ilha de origem', () => {
    for (let indice = 0; indice < ILHAS.length - 1; indice += 1) {
      const uma = ILHAS[indice]!
      const outra = ILHAS[indice + 1]!
      const ponte = ponteEntre(uma, outra)

      const esperadoX = uma.centro[0] + ponte.direcao[0] * uma.raio
      const esperadoZ = uma.centro[2] + ponte.direcao[1] * uma.raio
      expect(ponte.posicao[0]).toBeCloseTo(esperadoX, 5)
      expect(ponte.posicao[2]).toBeCloseTo(esperadoZ, 5)
    }
  })

  it('sobe quando a ilha de destino é mais alta', () => {
    const ponte = ponteEntre(ILHAS[0]!, ILHAS[1]!)
    expect(ponte.rotacaoZ).toBeGreaterThan(0)
  })

  it('recusa ilhas no mesmo ponto', () => {
    const uma = ILHAS[0]!
    expect(() => ponteEntre(uma, uma)).toThrow(/mesmo ponto/)
  })
})

describe('enquadramento da ilha', () => {
  it('põe a câmera fora da pedra e acima do capim', () => {
    for (const ilha of ILHAS) {
      const { camera, alvo } = enquadramentoDaIlha(ilha)
      const distanciaHorizontal = Math.hypot(
        camera[0] - ilha.centro[0],
        camera[2] - ilha.centro[2],
      )
      expect(distanciaHorizontal).toBeGreaterThan(ilha.raio)
      expect(camera[1]).toBeGreaterThan(ilha.centro[1])
      expect(alvo[1]).toBeGreaterThan(ilha.centro[1])
    }
  })

  it('olha para o centro da ilha', () => {
    const ilha = ILHAS[0]!
    const { alvo } = enquadramentoDaIlha(ilha)
    expect(alvo[0]).toBeCloseTo(ilha.centro[0], 6)
    expect(alvo[2]).toBeCloseTo(ilha.centro[2], 6)
  })
})
