import { describe, expect, it } from 'vitest'
import {
  LIMITES,
  SEM_TECLAS,
  ajustarAosLimites,
  aplicarMovimento,
  aplicarOlhar,
  cameraDeMapa,
  cameraInicial,
  direcaoDoOlhar,
  interpolarCamera,
  menorArco,
  mirarEm,
  suavizar,
  type CameraVoadora,
  type TeclasDeMovimento,
} from './movimento'

const ORIGEM: CameraVoadora = { x: 0, y: 20, z: 0, guinada: 0, inclinacao: 0 }

const TECLAS = (parcial: Partial<TeclasDeMovimento>): TeclasDeMovimento => ({
  ...SEM_TECLAS,
  ...parcial,
})

describe('movimento relativo ao olhar', () => {
  it('com guinada zero, ir para a frente diminui z', () => {
    const depois = aplicarMovimento(ORIGEM, TECLAS({ frente: true }), 1)
    expect(depois.z).toBeLessThan(ORIGEM.z)
    expect(depois.x).toBeCloseTo(0, 6)
  })

  it('com guinada de 90 graus, ir para a frente diminui x', () => {
    const girada: CameraVoadora = { ...ORIGEM, guinada: Math.PI / 2 }
    const depois = aplicarMovimento(girada, TECLAS({ frente: true }), 1)
    expect(depois.x).toBeLessThan(girada.x)
    expect(depois.z).toBeCloseTo(girada.z, 5)
  })

  it('andar para a direita é perpendicular a andar para a frente', () => {
    const frente = aplicarMovimento(ORIGEM, TECLAS({ frente: true }), 1)
    const direita = aplicarMovimento(ORIGEM, TECLAS({ direita: true }), 1)

    const vetorFrente = [frente.x - ORIGEM.x, frente.z - ORIGEM.z]
    const vetorDireita = [direita.x - ORIGEM.x, direita.z - ORIGEM.z]
    const produtoInterno = (vetorFrente[0] ?? 0) * (vetorDireita[0] ?? 0) + (vetorFrente[1] ?? 0) * (vetorDireita[1] ?? 0)

    expect(produtoInterno).toBeCloseTo(0, 5)
  })

  it('teclas opostas se cancelam', () => {
    const depois = aplicarMovimento(ORIGEM, TECLAS({ frente: true, tras: true }), 1)
    expect(depois.x).toBeCloseTo(ORIGEM.x, 6)
    expect(depois.z).toBeCloseTo(ORIGEM.z, 6)
  })

  it('subir e descer mexem só na altura', () => {
    const subiu = aplicarMovimento(ORIGEM, TECLAS({ subir: true }), 1)
    expect(subiu.y).toBeGreaterThan(ORIGEM.y)
    expect(subiu.x).toBeCloseTo(ORIGEM.x, 6)

    const desceu = aplicarMovimento(ORIGEM, TECLAS({ descer: true }), 1)
    expect(desceu.y).toBeLessThan(ORIGEM.y)
  })

  it('sem tecla nenhuma, nada se move', () => {
    expect(aplicarMovimento(ORIGEM, SEM_TECLAS, 1)).toEqual({ ...ORIGEM, y: ORIGEM.y })
  })

  it('a tecla de correr aumenta a distância percorrida', () => {
    const normal = aplicarMovimento(ORIGEM, TECLAS({ frente: true }), 1)
    const rapido = aplicarMovimento(ORIGEM, TECLAS({ frente: true, rapido: true }), 1)
    expect(Math.abs(rapido.z - ORIGEM.z)).toBeGreaterThan(Math.abs(normal.z - ORIGEM.z))
  })

  it('ignora intervalo de tempo negativo ou absurdo', () => {
    // Um quadro perdido pode entregar delta enorme; sem limite, a câmera
    // atravessaria o mundo de uma vez.
    const negativo = aplicarMovimento(ORIGEM, TECLAS({ frente: true }), -5)
    expect(negativo).toEqual(ORIGEM)

    const enorme = aplicarMovimento(ORIGEM, TECLAS({ frente: true }), 30)
    const limitado = aplicarMovimento(ORIGEM, TECLAS({ frente: true }), 0.1)
    expect(enorme.z).toBeCloseTo(limitado.z, 6)
  })
})

describe('limites do mundo', () => {
  it('não deixa a câmera descer abaixo do chão nem subir demais', () => {
    const baixo = ajustarAosLimites({ ...ORIGEM, y: -50 })
    expect(baixo.y).toBe(LIMITES.alturaMinima)

    const alto = ajustarAosLimites({ ...ORIGEM, y: 999 })
    expect(alto.y).toBe(LIMITES.alturaMaxima)
  })

  it('não deixa a câmera se afastar além do raio máximo', () => {
    const longe = ajustarAosLimites({ ...ORIGEM, x: 900, z: 0 })
    expect(Math.hypot(longe.x, longe.z)).toBeCloseTo(LIMITES.distanciaMaxima, 6)
  })

  it('ao trazer de volta, preserva a direção de onde estava', () => {
    // Trazer pela direção certa evita o efeito de "saltar para o lado".
    const longe = ajustarAosLimites({ ...ORIGEM, x: 300, z: 300 })
    expect(Math.abs(longe.x)).toBeCloseTo(Math.abs(longe.z), 6)
    expect(Math.sign(longe.x)).toBe(1)
  })

  it('dentro dos limites, não altera nada além da inclinação', () => {
    const dentro: CameraVoadora = { x: 3, y: 30, z: 4, guinada: 1, inclinacao: 0.2 }
    expect(ajustarAosLimites(dentro)).toEqual(dentro)
  })

  it('a inclinação nunca passa do limite, nem em disparada', () => {
    let camera = ORIGEM
    for (let i = 0; i < 200; i += 1) {
      camera = aplicarOlhar(camera, 0, 100)
    }
    expect(camera.inclinacao).toBeGreaterThanOrEqual(-LIMITES.inclinacaoMaxima)
    expect(camera.inclinacao).toBeLessThanOrEqual(LIMITES.inclinacaoMaxima)
  })
})

describe('arrastar para olhar', () => {
  it('arrastar para a direita gira o olhar', () => {
    const depois = aplicarOlhar(ORIGEM, 100, 0)
    expect(depois.guinada).not.toBe(ORIGEM.guinada)
  })

  it('arrastar para cima e para baixo muda a inclinação em sentidos opostos', () => {
    const paraCima = aplicarOlhar(ORIGEM, 0, -100)
    const paraBaixo = aplicarOlhar(ORIGEM, 0, 100)
    expect(paraCima.inclinacao).toBeGreaterThan(ORIGEM.inclinacao)
    expect(paraBaixo.inclinacao).toBeLessThan(ORIGEM.inclinacao)
  })

  it('não move a câmera, só a direção', () => {
    const depois = aplicarOlhar(ORIGEM, 250, 120)
    expect([depois.x, depois.y, depois.z]).toEqual([ORIGEM.x, ORIGEM.y, ORIGEM.z])
  })
})

describe('direção do olhar', () => {
  it('com guinada zero e inclinação zero, aponta para -z', () => {
    const [x, y, z] = direcaoDoOlhar(ORIGEM)
    expect(x).toBeCloseTo(0, 6)
    expect(y).toBeCloseTo(0, 6)
    expect(z).toBeCloseTo(-1, 6)
  })

  it('olhando para cima, a componente vertical fica positiva', () => {
    const [, y] = direcaoDoOlhar({ ...ORIGEM, inclinacao: 0.5 })
    expect(y).toBeGreaterThan(0)
  })

  it('é sempre um vetor unitário', () => {
    for (const guinada of [-2, -1, 0, 1, 2, 3]) {
      for (const inclinacao of [-1.3, -0.5, 0, 0.5, 1.3]) {
        const [x, y, z] = direcaoDoOlhar({ ...ORIGEM, guinada, inclinacao })
        expect(Math.hypot(x, y, z)).toBeCloseTo(1, 6)
      }
    }
  })
})

describe('apontar para um alvo', () => {
  const alvo = [0, 0, 0] as const

  it('mantém a câmera onde está e só muda a direção', () => {
    const camera: CameraVoadora = { x: 10, y: 20, z: 30, guinada: 0, inclinacao: 0 }
    const apontada = mirarEm(camera, alvo)
    expect([apontada.x, apontada.y, apontada.z]).toEqual([camera.x, camera.y, camera.z])
  })

  it('depois de apontar, o alvo fica na direção do olhar', () => {
    const camera: CameraVoadora = { x: 12, y: 18, z: 25, guinada: 2.5, inclinacao: -1 }
    const apontada = mirarEm(camera, alvo)

    const [dx, dy, dz] = direcaoDoOlhar(apontada)
    const distancia = Math.hypot(camera.x - alvo[0], camera.y - alvo[1], camera.z - alvo[2])

    expect(apontada.x + dx * distancia).toBeCloseTo(alvo[0], 4)
    expect(apontada.y + dy * distancia).toBeCloseTo(alvo[1], 4)
    expect(apontada.z + dz * distancia).toBeCloseTo(alvo[2], 4)
  })

  it('alvo exatamente na vertical não quebra a conta', () => {
    const camera: CameraVoadora = { x: 0, y: 50, z: 0, guinada: 1.2, inclinacao: 0 }
    const apontada = mirarEm(camera, [0, 0, 0])
    expect(Number.isFinite(apontada.guinada)).toBe(true)
    expect(apontada.guinada).toBe(1.2)
    expect(apontada.inclinacao).toBeLessThan(0)
  })
})

describe('transições', () => {
  it('suavizar começa em 0, termina em 1 e é monótona', () => {
    expect(suavizar(0)).toBe(0)
    expect(suavizar(1)).toBe(1)
    expect(suavizar(0.5)).toBeCloseTo(0.5, 6)

    let anterior = 0
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const atual = suavizar(t)
      expect(atual).toBeGreaterThanOrEqual(anterior - 1e-9)
      anterior = atual
    }
  })

  it('aceita valores fora da faixa sem estourar', () => {
    expect(suavizar(-1)).toBe(0)
    expect(suavizar(2)).toBe(1)
  })

  it('interpolação em t=0 devolve a origem e em t=1 o destino', () => {
    const destino: CameraVoadora = { x: 10, y: 30, z: -5, guinada: 1, inclinacao: 0.5 }
    expect(interpolarCamera(ORIGEM, destino, 0)).toEqual(ORIGEM)

    const fim = interpolarCamera(ORIGEM, destino, 1)
    expect(fim.x).toBeCloseTo(destino.x, 6)
    expect(fim.y).toBeCloseTo(destino.y, 6)
    expect(fim.z).toBeCloseTo(destino.z, 6)
    expect(fim.inclinacao).toBeCloseTo(destino.inclinacao, 6)
  })

  it('usa o caminho mais curto ao girar, sem dar a volta completa', () => {
    const de: CameraVoadora = { ...ORIGEM, guinada: 0.1 }
    const para: CameraVoadora = { ...ORIGEM, guinada: -0.1 }
    const meio = interpolarCamera(de, para, 0.5)
    expect(meio.guinada).toBeCloseTo(0, 5)
  })

  it('menorArco escolhe sempre o caminho curto', () => {
    expect(menorArco(0, Math.PI / 2)).toBeCloseTo(Math.PI / 2, 6)
    expect(menorArco(0, -Math.PI / 2)).toBeCloseTo(-Math.PI / 2, 6)
    // Girar de 3 rad para -3 rad é meia volta curta no outro sentido.
    expect(Math.abs(menorArco(3, -3))).toBeLessThan(Math.PI)
  })
})

describe('posições prontas', () => {
  it('a vista de mapa fica acima do arquipélago e olhando para baixo', () => {
    const mapa = cameraDeMapa(100)
    expect(mapa.y).toBeGreaterThan(50)
    expect(mapa.inclinacao).toBeLessThan(0)
  })

  it('a vista de mapa cresce com o espalhamento das ilhas', () => {
    expect(cameraDeMapa(400).y).toBeGreaterThan(cameraDeMapa(80).y)
  })

  it('a câmera inicial fica acima da primeira ilha', () => {
    const inicial = cameraInicial([0, 0, 0])
    expect(inicial.y).toBeGreaterThan(0)
    expect(ajustarAosLimites(inicial)).toEqual(inicial)
  })
})
