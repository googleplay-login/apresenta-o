import { menorArco, type TeclasDeMovimento } from '../camera/movimento'
import {
  RAIO_DO_AVATAR,
  localizacaoEm,
  ponteCaminhavel,
  pontoPisavel,
  type ChaoDoMundo,
  type PontoNoPlano,
} from '../mapaCaminhavel'

/**
 * O avatar que anda pelo arquipélago: para onde vai, e como.
 *
 * Tudo aqui é função pura sobre números. O desenho do avatar e o laço de quadro
 * ficam em `Avatar.tsx`; a decisão de onde ele pode estar fica em
 * `mapaCaminhavel.ts`. Este arquivo cuida do movimento: entrar nas teclas, virar
 * o corpo, deslizar na beirada em vez de travar, e seguir um caminho até outra
 * ilha.
 *
 * Duas regras que valem a pena escrever, porque são o que separa "andar" de
 * "atravessar o vazio":
 *
 *  - **o avatar não cai.** Se o passo cair fora do chão, ele é recusado; se cair
 *    fora só de um lado, o deslocamento continua no outro (é o que faz a pessoa
 *    deslizar pela borda, em vez de ficar presa na parede invisível);
 *  - **a rota a pé só existe por ponte inteira.** `rotaAte()` devolve `null`
 *    quando o caminho depende de uma ponte que ainda está pela metade — e quem
 *    chamou tem de dizer isso ao estudante, em vez de inventar um caminho.
 */

/** Para onde o avatar olha, e onde ele está. A altura vem do chão, não daqui. */
export type Caminhante = {
  readonly x: number
  readonly z: number
  /** Giro do corpo em torno do eixo vertical, em radianos. */
  readonly giro: number
}

/** Passos por segundo andando. Mais devagar que o voo (14), porque é a pé. */
export const VELOCIDADE_A_PE = 6

/** Multiplicador com `Shift`. Não é corrida de atleta: é pressa de quem já sabe. */
export const FATOR_CORRIDA = 1.9

/** Passo máximo por quadro, para uma aba em segundo plano não dar um salto. */
const PASSO_MAXIMO = 0.1

/** Quanto o corpo gira por segundo ao mudar de direção. */
const GIRO_POR_SEGUNDO = 9

/** Folga para dentro da beirada, ao escolher o ponto de entrada de uma ponte. */
const FOLGA = 0.05

/** Onde o avatar começa: no centro da primeira ilha. */
export function caminhanteInicial(chao: ChaoDoMundo): Caminhante {
  const primeira = chao.ilhas[0]
  return primeira === undefined
    ? { x: 0, z: 0, giro: 0 }
    : { x: primeira.x, z: primeira.z, giro: 0 }
}

/** Para onde o corpo deve apontar para olhar nesta direção. */
export function giroPara(direcao: PontoNoPlano): number {
  return Math.atan2(direcao.x, direcao.z)
}

/**
 * A direção pedida pelas teclas, relativa a para onde a câmera olha.
 *
 * Sem isso, quem gira a câmera e aperta `W` andaria sempre para o mesmo lado do
 * mundo. A convenção é a mesma do voo livre (`camera/movimento.ts`): frente é
 * `(-sin, -cos)` da guinada, direita é `(cos, -sin)`.
 */
export function direcaoDoPasso(
  teclas: TeclasDeMovimento,
  guinadaDaCamera: number,
): PontoNoPlano | null {
  const frente = (teclas.frente ? 1 : 0) - (teclas.tras ? 1 : 0)
  const lado = (teclas.direita ? 1 : 0) - (teclas.esquerda ? 1 : 0)
  if (frente === 0 && lado === 0) {
    return null
  }

  const seno = Math.sin(guinadaDaCamera)
  const cosseno = Math.cos(guinadaDaCamera)

  const x = -seno * frente + cosseno * lado
  const z = -cosseno * frente - seno * lado
  const comprimento = Math.hypot(x, z)
  if (comprimento === 0) {
    return null
  }
  return { x: x / comprimento, z: z / comprimento }
}

/** Vira o corpo na direção pedida, sem dar um giro de meia volta instantâneo. */
function girar(giro: number, destino: number, delta: number): number {
  const passo = Math.min(GIRO_POR_SEGUNDO * delta, 1)
  return giro + menorArco(giro, destino) * passo
}

/**
 * Um passo a pé, com deslize na beirada.
 *
 * A ordem das tentativas importa: primeiro o passo inteiro; depois só o eixo X;
 * depois só o Z; e, se nenhum couber, o avatar fica onde está. É isso que faz
 * caminhar contra a borda do capim deslizar ao longo dela em vez de parar.
 */
export function passoAMao(
  chao: ChaoDoMundo,
  caminhante: Caminhante,
  teclas: TeclasDeMovimento,
  guinadaDaCamera: number,
  deltaSegundos: number,
): Caminhante {
  const direcao = direcaoDoPasso(teclas, guinadaDaCamera)
  const delta = Math.min(Math.max(deltaSegundos, 0), PASSO_MAXIMO)

  if (direcao === null || delta === 0) {
    return caminhante
  }

  const velocidade = VELOCIDADE_A_PE * (teclas.rapido ? FATOR_CORRIDA : 1)
  const dx = direcao.x * velocidade * delta
  const dz = direcao.z * velocidade * delta

  const tentativas: readonly PontoNoPlano[] = [
    { x: caminhante.x + dx, z: caminhante.z + dz },
    { x: caminhante.x + dx, z: caminhante.z },
    { x: caminhante.x, z: caminhante.z + dz },
  ]

  for (const tentativa of tentativas) {
    if (pontoPisavel(chao, tentativa)) {
      return { x: tentativa.x, z: tentativa.z, giro: girar(caminhante.giro, giroPara(direcao), delta) }
    }
  }

  return caminhante
}

/** A borda da ilha `de` na direção da outra ilha: onde a ponte começa, a pé. */
function bordaDeSaida(chao: ChaoDoMundo, ponte: { de: string; para: string; direcao: readonly [number, number] }): PontoNoPlano {
  const ilha = chao.ilhas.find((candidata) => candidata.id === ponte.de)
  if (ilha === undefined) {
    return { x: 0, z: 0 }
  }
  const recuo = ilha.raio - RAIO_DO_AVATAR - FOLGA
  return { x: ilha.x + ponte.direcao[0] * recuo, z: ilha.z + ponte.direcao[1] * recuo }
}

/** A borda da ilha `para`: onde a ponte termina. */
function bordaDeChegada(chao: ChaoDoMundo, ponte: { de: string; para: string; direcao: readonly [number, number] }): PontoNoPlano {
  const ilha = chao.ilhas.find((candidata) => candidata.id === ponte.para)
  if (ilha === undefined) {
    return { x: 0, z: 0 }
  }
  const recuo = ilha.raio - RAIO_DO_AVATAR - FOLGA
  return { x: ilha.x - ponte.direcao[0] * recuo, z: ilha.z - ponte.direcao[1] * recuo }
}

function indiceDaIlha(chao: ChaoDoMundo, id: string): number {
  return chao.ilhas.findIndex((ilha) => ilha.id === id)
}

/**
 * Um caminho a pé até uma ilha, em linha reta entre pontos de apoio.
 *
 * O arquipélago é uma corrente: ilha, ponte, ilha, ponte. Por isso a rota não
 * precisa de busca de caminho — precisa de saber por quais pontes passar, e
 * passar por elas na ordem. Cada trecho da rota fica **dentro** do chão
 * caminhável, e há teste que amostra os trechos para provar isso.
 *
 * Devolve `null` quando não há passagem a pé: ponte pela metade, ilha fora do
 * plano, ou ponto de partida no vazio. Nenhum caminho é inventado.
 */
export function rotaAte(
  chao: ChaoDoMundo,
  origem: PontoNoPlano,
  ilhaDestinoId: string,
): readonly PontoNoPlano[] | null {
  const indiceDestino = indiceDaIlha(chao, ilhaDestinoId)
  if (indiceDestino < 0) {
    return null
  }

  const local = localizacaoEm(chao, origem)
  if (local === null) {
    return null
  }

  const caminho: PontoNoPlano[] = []
  let atual: number

  if (local.tipo === 'ponte') {
    const ponte = ponteCaminhavel(chao, local.de, local.para)
    const indiceDe = indiceDaIlha(chao, local.de)
    if (ponte === null || indiceDe < 0) {
      return null
    }
    // Em cima da ponte, o primeiro passo é terminar de atravessá-la — para o
    // lado onde fica o destino.
    if (indiceDestino > indiceDe) {
      caminho.push(bordaDeChegada(chao, ponte))
      atual = indiceDe + 1
    } else {
      caminho.push(bordaDeSaida(chao, ponte))
      atual = indiceDe
    }
  } else {
    atual = indiceDaIlha(chao, local.id)
  }

  while (atual < indiceDestino) {
    const daqui = chao.ilhas[atual]
    const adiante = chao.ilhas[atual + 1]
    if (daqui === undefined || adiante === undefined) {
      return null
    }
    const ponte = ponteCaminhavel(chao, daqui.id, adiante.id)
    if (ponte === null) {
      return null
    }
    caminho.push(bordaDeSaida(chao, ponte))
    caminho.push(bordaDeChegada(chao, ponte))
    atual += 1
  }

  while (atual > indiceDestino) {
    const daqui = chao.ilhas[atual]
    const atras = chao.ilhas[atual - 1]
    if (daqui === undefined || atras === undefined) {
      return null
    }
    const ponte = ponteCaminhavel(chao, atras.id, daqui.id)
    if (ponte === null) {
      return null
    }
    // De costas, a primeira borda é a da ilha onde o avatar está.
    caminho.push(bordaDeChegada(chao, ponte))
    caminho.push(bordaDeSaida(chao, ponte))
    atual -= 1
  }

  const destino = chao.ilhas[indiceDestino]
  if (destino === undefined) {
    return null
  }
  caminho.push({ x: destino.x, z: destino.z })

  return caminho
}

export type Caminhada = {
  readonly caminhante: Caminhante
  /** Pontos de apoio que ainda faltam. Vazio quando chegou. */
  readonly restante: readonly PontoNoPlano[]
  readonly chegou: boolean
}

/**
 * Anda ao longo de uma rota, gastando o tempo do quadro.
 *
 * O corpo vira para onde está indo, com giro suavizado — o avatar não dá meia
 * volta instantânea.
 */
export function seguirRota(
  caminhante: Caminhante,
  rota: readonly PontoNoPlano[],
  deltaSegundos: number,
  correr = false,
): Caminhada {
  const delta = Math.min(Math.max(deltaSegundos, 0), PASSO_MAXIMO)
  const velocidade = VELOCIDADE_A_PE * (correr ? FATOR_CORRIDA : 1)
  let orcamento = velocidade * delta

  const restante = [...rota]
  let x = caminhante.x
  let z = caminhante.z
  let giro = caminhante.giro

  while (orcamento > 0) {
    const alvo = restante[0]
    if (alvo === undefined) {
      break
    }

    const dx = alvo.x - x
    const dz = alvo.z - z
    const distancia = Math.hypot(dx, dz)

    if (distancia < 1e-6) {
      restante.shift()
      continue
    }

    giro = girar(giro, giroPara({ x: dx, z: dz }), delta)

    if (distancia <= orcamento) {
      x = alvo.x
      z = alvo.z
      orcamento -= distancia
      restante.shift()
      continue
    }

    const proporcao = orcamento / distancia
    x += dx * proporcao
    z += dz * proporcao
    orcamento = 0
  }

  return { caminhante: { x, z, giro }, restante, chegou: restante.length === 0 }
}
