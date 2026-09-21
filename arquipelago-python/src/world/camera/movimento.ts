/**
 * Movimento da câmera, em matemática pura.
 *
 * Por que não deixar isso dentro do componente da cena: movimento com limite,
 * direção relativa ao olhar e aproximação suave são exatamente o tipo de conta
 * que erra em silêncio. Aqui ela é testável sem abrir navegador — e a cena usa
 * o resultado pronto.
 */

export type Vetor3 = readonly [number, number, number]

export type CameraVoadora = {
  readonly x: number
  readonly y: number
  readonly z: number
  /** Rotação horizontal, em radianos. 0 olha para -z. */
  readonly guinada: number
  /** Rotação vertical, em radianos. Positivo olha para cima. */
  readonly inclinacao: number
}

export const LIMITES = {
  alturaMinima: 4,
  alturaMaxima: 90,
  /** Raio máximo a partir da origem do arquipélago. */
  distanciaMaxima: 260,
  /** Quanto a inclinação pode passar do horizonte, para cima e para baixo. */
  inclinacaoMaxima: 1.35,
} as const

/** Quais teclas de movimento estão pressionadas. */
export type TeclasDeMovimento = {
  readonly frente: boolean
  readonly tras: boolean
  readonly esquerda: boolean
  readonly direita: boolean
  readonly subir: boolean
  readonly descer: boolean
  readonly rapido: boolean
}

export const SEM_TECLAS: TeclasDeMovimento = {
  frente: false,
  tras: false,
  esquerda: false,
  direita: false,
  subir: false,
  descer: false,
  rapido: false,
}

export const VELOCIDADE_BASE = 14
export const FATOR_RAPIDO = 2.6
/** Segundos para desacelerar e parar. Dá a sensação de voo, em vez de teletransporte. */
export const AMORTECIMENTO = 6

export type OpcoesDeMovimento = {
  readonly velocidade?: number
  readonly limites?: typeof LIMITES
}

/**
 * Aplica um passo de movimento e devolve uma câmera nova.
 *
 * O movimento é relativo ao olhar: "frente" é para onde a câmera aponta, girando
 * em torno do eixo vertical. Sem isso, quem gira e aperta `W` andaria sempre para
 * o mesmo lado do mundo, o que é desorientador.
 */
export function aplicarMovimento(
  camera: CameraVoadora,
  teclas: TeclasDeMovimento,
  deltaSegundos: number,
  opcoes: OpcoesDeMovimento = {},
): CameraVoadora {
  const limites = opcoes.limites ?? LIMITES
  const velocidade = opcoes.velocidade ?? VELOCIDADE_BASE
  const passo = Math.min(Math.max(deltaSegundos, 0), 0.1) * velocidade * (teclas.rapido ? FATOR_RAPIDO : 1)

  const eixoFrente = (teclas.frente ? 1 : 0) - (teclas.tras ? 1 : 0)
  const eixoLado = (teclas.direita ? 1 : 0) - (teclas.esquerda ? 1 : 0)
  const eixoAltura = (teclas.subir ? 1 : 0) - (teclas.descer ? 1 : 0)

  const seno = Math.sin(camera.guinada)
  const cosseno = Math.cos(camera.guinada)

  // Para onde a câmera aponta, projetado no plano horizontal.
  const frenteX = -seno
  const frenteZ = -cosseno
  // Perpendicular à direita.
  const direitaX = cosseno
  const direitaZ = -seno

  const x = camera.x + (frenteX * eixoFrente + direitaX * eixoLado) * passo
  const z = camera.z + (frenteZ * eixoFrente + direitaZ * eixoLado) * passo
  const y = camera.y + eixoAltura * passo

  return ajustarAosLimites({ ...camera, x, y, z }, limites)
}

/** Traz a câmera de volta para dentro dos limites, sem alterar a direção do olhar. */
export function ajustarAosLimites(
  camera: CameraVoadora,
  limites: typeof LIMITES = LIMITES,
): CameraVoadora {
  const y = Math.min(Math.max(camera.y, limites.alturaMinima), limites.alturaMaxima)

  const distancia = Math.hypot(camera.x, camera.z)
  if (distancia <= limites.distanciaMaxima || distancia === 0) {
    return { ...camera, y, inclinacao: limitarInclinacao(camera.inclinacao, limites) }
  }

  const fator = limites.distanciaMaxima / distancia
  return {
    ...camera,
    x: camera.x * fator,
    z: camera.z * fator,
    y,
    inclinacao: limitarInclinacao(camera.inclinacao, limites),
  }
}

function limitarInclinacao(inclinacao: number, limites: typeof LIMITES): number {
  return Math.min(Math.max(inclinacao, -limites.inclinacaoMaxima), limites.inclinacaoMaxima)
}

/**
 * Aplica o arrasto do mouse ou do dedo.
 *
 * `dx` e `dy` são pixels percorridos. A sensibilidade converte pixels em
 * radianos; o sinal da guinada é negativo para o mundo girar no mesmo sentido do
 * gesto, como se o estudante empurrasse a paisagem.
 */
export function aplicarOlhar(
  camera: CameraVoadora,
  dx: number,
  dy: number,
  sensibilidade = 0.0035,
  limites: typeof LIMITES = LIMITES,
): CameraVoadora {
  return {
    ...camera,
    guinada: camera.guinada - dx * sensibilidade,
    inclinacao: limitarInclinacao(camera.inclinacao - dy * sensibilidade, limites),
  }
}

/** Vetor unitário para onde a câmera aponta. */
export function direcaoDoOlhar(camera: CameraVoadora): Vetor3 {
  const cossenoDaInclinacao = Math.cos(camera.inclinacao)
  return [
    -Math.sin(camera.guinada) * cossenoDaInclinacao,
    Math.sin(camera.inclinacao),
    -Math.cos(camera.guinada) * cossenoDaInclinacao,
  ]
}

/**
 * Aponta a câmera para um ponto do mundo, mantendo onde ela está.
 *
 * É o que o botão "ir para a unidade atual" usa: em vez de teletransportar sem
 * aviso, a câmera continua onde está e passa a olhar para a ilha. O estudante
 * não perde a noção de onde estava.
 */
export function mirarEm(camera: CameraVoadora, alvo: Vetor3): CameraVoadora {
  const dx = alvo[0] - camera.x
  const dy = alvo[1] - camera.y
  const dz = alvo[2] - camera.z

  const distanciaHorizontal = Math.hypot(dx, dz)
  // Caso degenerado: alvo exatamente na vertical. Não há guinada definida, então
  // mantém a atual e só ajusta a inclinação.
  const guinada =
    distanciaHorizontal < 1e-6 ? camera.guinada : Math.atan2(-dx, -dz)
  const inclinacao = Math.atan2(dy, distanciaHorizontal)

  return {
    ...camera,
    guinada,
    inclinacao: limitarInclinacao(inclinacao, LIMITES),
  }
}

/** Interpolação linear entre dois números. */
export function interpolar(de: number, para: number, t: number): number {
  const proporcao = Math.min(Math.max(t, 0), 1)
  return de + (para - de) * proporcao
}

/**
 * Interpolação suave: começa devagar, acelera e termina devagar.
 * Usada na transição da câmera, para o movimento não ser um solavanco.
 */
export function suavizar(t: number): number {
  const proporcao = Math.min(Math.max(t, 0), 1)
  return proporcao * proporcao * (3 - 2 * proporcao)
}

/** Interpola duas câmeras. A guinada usa o caminho mais curto, sem dar a volta. */
export function interpolarCamera(de: CameraVoadora, para: CameraVoadora, t: number): CameraVoadora {
  const suave = suavizar(t)
  const diferencaDeGuinada = menorArco(de.guinada, para.guinada)

  return {
    x: interpolar(de.x, para.x, suave),
    y: interpolar(de.y, para.y, suave),
    z: interpolar(de.z, para.z, suave),
    guinada: de.guinada + diferencaDeGuinada * suave,
    inclinacao: interpolar(de.inclinacao, para.inclinacao, suave),
  }
}

/** Menor diferença angular entre dois ângulos, considerando a volta de 2π. */
export function menorArco(de: number, para: number): number {
  const diferenca = (para - de) % (Math.PI * 2)
  if (diferenca > Math.PI) {
    return diferenca - Math.PI * 2
  }
  if (diferenca < -Math.PI) {
    return diferenca + Math.PI * 2
  }
  return diferenca
}

/**
 * Posição de câmera para ver o arquipélago inteiro de cima.
 * `espalhamento` é a distância entre a primeira e a última ilha.
 */
export function cameraDeMapa(espalhamento: number): CameraVoadora {
  const altura = Math.max(60, espalhamento * 0.85)
  return { x: 0, y: altura, z: espalhamento * 0.35, guinada: 0, inclinacao: -1.1 }
}

/** Posição inicial: perto da primeira ilha, olhando para ela. */
export function cameraInicial(primeiraIlha: Vetor3, distancia = 26): CameraVoadora {
  return {
    x: primeiraIlha[0] - 6,
    y: primeiraIlha[1] + 12,
    z: primeiraIlha[2] + distancia,
    guinada: 0,
    inclinacao: -0.18,
  }
}
