import { describe, expect, it } from 'vitest'
import { Euler, Vector3 } from 'three'
import { PLANO_DE_UNIDADES } from '../content/planoDeUnidades'
import { sementeDeTexto } from './geometria/aleatorio'
import { alturaDoTopo } from './geometria/ilha'
import { ESPESSURA_DO_TABULEIRO, gerarPonte } from './geometria/solidos'
import {
  DISTANCIA_ENTRE_CENTROS,
  bordaDaIlhaEmDirecao,
  bordaExternaDaIlhaEmDirecao,
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

  it('mantém as ilhas separadas, com o vão constante entre as bordas', () => {
    // Cada ilha tem o raio dela, então o avanço em x é `raio + raio + vão`: o
    // que muda de uma ilha para outra é o tamanho da pedra, e não o caminho. Se
    // as ilhas encostassem, a ponte teria comprimento negativo — e o vão do
    // meio do percurso seria diferente do vão das pontas.
    for (let indice = 0; indice < ILHAS.length - 1; indice += 1) {
      const uma = ILHAS[indice]!
      const outra = ILHAS[indice + 1]!
      const distancia = Math.hypot(
        outra.centro[0] - uma.centro[0],
        outra.centro[2] - uma.centro[2],
      )
      expect(outra.centro[0] - uma.centro[0]).toBeCloseTo(
        uma.raio + outra.raio + VAO_DA_PONTE,
        6,
      )
      // A curva em S só afasta mais as bordas: no plano, o vão nunca é menor
      // que o previsto.
      expect(distancia - uma.raio - outra.raio).toBeGreaterThanOrEqual(VAO_DA_PONTE - 1e-9)
    }

    // E o vão é o mesmo em todo o percurso, embora os raios não sejam.
    const raios = new Set(ILHAS.map((ilha) => ilha.raio.toFixed(3)))
    expect(raios.size).toBeGreaterThan(1)
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
    // O vão agora é medido de **borda desenhada a borda desenhada** (D-063), e
    // não entre os raios nominais: as duas medidas diferentes que aparecem aqui
    // são as duas bordas externas, que é o maior vão possível, e a distância
    // entre os centros, que é o menor comprimento impossível.
    for (let indice = 0; indice < ILHAS.length - 1; indice += 1) {
      const uma = ILHAS[indice]!
      const outra = ILHAS[indice + 1]!
      const ponte = ponteEntre(uma, outra)
      const [ux, uz] = ponte.direcao
      const maiorVao =
        Math.hypot(outra.centro[0] - uma.centro[0], outra.centro[2] - uma.centro[2]) -
        bordaExternaDaIlhaEmDirecao(uma, ux, uz) -
        bordaExternaDaIlhaEmDirecao(outra, -ux, -uz)

      expect(ponte.comprimento).toBeGreaterThan(maiorVao - 0.001)
      expect(ponte.comprimento).toBeLessThan(DISTANCIA_ENTRE_CENTROS)
    }
  })

  it('ancora no capim desenhado, e não no raio nominal', () => {
    // A prova de que o defeito da captura era real: ancorada no raio nominal, a
    // ponte ficava fora do capim (no ar) em pelo menos uma das pontas — e o
    // quanto disso está medido abaixo. Nenhuma ponta pode passar da borda
    // externa, e todas têm de chegar perto dela.
    let maiorDesvio = 0
    let pontasNoArAntes = 0

    for (let indice = 0; indice < ILHAS.length - 1; indice += 1) {
      const uma = ILHAS[indice]!
      const outra = ILHAS[indice + 1]!
      const ponte = ponteEntre(uma, outra)
      const [ux, uz] = ponte.direcao

      // O fim sai da **mesma** transformação que o desenho usa: o Three.js
      // aplica as duas rotações, e a projeção horizontal do tabuleiro é menor
      // que o comprimento quando a ponte sobe.
      const fim = new Vector3(ponte.comprimento, 0, 0).applyEuler(
        new Euler(0, ponte.rotacaoY, ponte.rotacaoZ, 'XYZ'),
      )
      fim.add(new Vector3(...ponte.posicao))

      const pontas = [
        {
          ilha: uma,
          distancia: Math.hypot(ponte.posicao[0] - uma.centro[0], ponte.posicao[2] - uma.centro[2]),
          direcao: [ux, uz] as const,
        },
        {
          ilha: outra,
          distancia: Math.hypot(fim.x - outra.centro[0], fim.z - outra.centro[2]),
          direcao: [-ux, -uz] as const,
        },
      ]

      for (const ponta of pontas) {
        const interno = bordaDaIlhaEmDirecao(ponta.ilha, ponta.direcao[0], ponta.direcao[1])
        const externo = bordaExternaDaIlhaEmDirecao(ponta.ilha, ponta.direcao[0], ponta.direcao[1])

        // Ancorada: dentro do polígono desenhado...
        expect(ponta.distancia).toBeLessThanOrEqual(externo + 1e-9)
        // ...e encostada nele, e não enterrada no capim.
        expect(ponta.distancia).toBeGreaterThan(interno - 1e-6)

        maiorDesvio = Math.max(maiorDesvio, Math.abs(ponta.ilha.raio - ponta.distancia))
        if (ponta.ilha.raio > externo) {
          pontasNoArAntes += 1
        }
      }
    }

    // Medido: com o raio nominal, alguma ponta ficaria no ar; e a maior diferença
    // entre a âncora certa e a nominal passa de um terço de unidade.
    expect(pontasNoArAntes).toBeGreaterThan(0)
    expect(maiorDesvio).toBeGreaterThan(0.33)
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
        new Vector3(-ponte.direcao[0], 0, -ponte.direcao[1]).multiplyScalar(
          bordaDaIlhaEmDirecao(outra, -ponte.direcao[0], -ponte.direcao[1]),
        ),
      )

      expect(fim.x).toBeCloseTo(bordaEsperada.x, 5)
      expect(fim.y + ESPESSURA_DO_TABULEIRO / 2).toBeCloseTo(
        bordaEsperada.y +
          alturaDoTopo(outra.raio, outra.raio, outra.identidade.formato.inclinacaoDoCapim),
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

      const borda = bordaDaIlhaEmDirecao(uma, ponte.direcao[0], ponte.direcao[1])
      const esperadoX = uma.centro[0] + ponte.direcao[0] * borda
      const esperadoZ = uma.centro[2] + ponte.direcao[1] * borda
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

  it('deita a rampa de entrada no capim, e não no ar', () => {
    // A queixa mais concreta do estudante (21/09/2026): "as pontes não encostam
    // nas ilhas". Medido antes de mudar, as duas pontas do tabuleiro caíam no
    // ponto mais interior da borda do capim, com margem **0,000** e degrau
    // **0,000** — e ainda assim a ponte parecia terminar no ar, porque encostar
    // por zero não se vê. Agora a estrutura entra cerca de um metro na ilha, e a
    // rampa é gerada com o declive daquele capim: aqui se confere que o topo da
    // rampa pousa na altura do capim, com folga de menos de um palmo.
    for (let indice = 0; indice < ILHAS.length - 1; indice += 1) {
      const uma = ILHAS[indice]!
      const outra = ILHAS[indice + 1]!
      const ponte = ponteEntre(uma, outra)
      const desenho = gerarPonte({
        comprimento: ponte.comprimento,
        largura: 3.2,
        tabuas: 12,
        liberada: true,
        declivesDaEntrada: ponte.declivesDaEntrada,
        semente: 1,
      })

      const [decliveDaOrigem, decliveDoDestino] = ponte.declivesDaEntrada
      // O declive declarado é o do capim, medido pela derivada da mesma função
      // que desenha a ilha — e não um número escolhido aqui.
      expect(decliveDaOrigem).toBeCloseTo(
        2 * uma.identidade.formato.inclinacaoDoCapim,
        10,
      )
      expect(decliveDoDestino).toBeCloseTo(
        2 * outra.identidade.formato.inclinacaoDoCapim,
        10,
      )

      const angulo = Math.atan(decliveDaOrigem)
      const avanco = desenho.entrada * Math.cos(angulo)
      const ondePousa = bordaDaIlhaEmDirecao(uma, ponte.direcao[0], ponte.direcao[1]) - avanco
      const capim = uma.centro[1] + alturaDoTopo(uma.raio, ondePousa, uma.identidade.formato.inclinacaoDoCapim)
      const topoDaRampa = ponte.posicao[1] - desenho.entrada * Math.sin(angulo) + ESPESSURA_DO_TABULEIRO / 2

      // A rampa cobre pelo menos um metro de capim, e a ponta dela fica a menos
      // de um palmo da superfície.
      expect(avanco).toBeGreaterThanOrEqual(1)
      expect(Math.abs(topoDaRampa - capim)).toBeLessThan(0.1)
    }
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
