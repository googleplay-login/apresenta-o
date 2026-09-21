import type { UnidadePlanejada } from '../content/planoDeUnidades'
import type { Vetor3 } from './camera/movimento'
import { sementeDeTexto } from './geometria/aleatorio'
import { alturaDoTopo } from './geometria/ilha'
import { ESPESSURA_DO_TABULEIRO } from './geometria/solidos'

/**
 * Onde cada ilha fica no mundo, e como as pontes ligam uma à outra.
 *
 * Este módulo é matemática pura: recebe o plano de unidades e devolve posições.
 * Nada de Three.js, nada de React. Duas razões:
 *
 *  - o mesmo cálculo serve para a cena 3D, para o painel de texto e para o
 *    seletor de destino — não existe uma segunda conta de "onde fica a ilha";
 *  - a conta de rotação das pontes é o tipo de conta que erra em silêncio: a
 *    ponte fica torta, ou não encosta na ilha, e ninguém vê no código. Aqui ela
 *    é conferida por teste, comparando com a própria biblioteca `three`.
 */

/** Raio do capim de cada ilha. É o raio usado para encostar a ponte na borda. */
export const RAIO_DA_ILHA = 6

/** Vão entre duas bordas. É o comprimento da ponte liberada. */
export const VAO_DA_PONTE = 9

/** Distância entre os centros: duas bordas mais o vão. */
export const DISTANCIA_ENTRE_CENTROS = RAIO_DA_ILHA * 2 + VAO_DA_PONTE

/** Quanto cada ilha sobe em relação à anterior. A trilha visivelmente ascende. */
export const SOBE_POR_ILHA = 2.4

/** Uma ilha posicionada no mundo. */
export type IlhaDoMundo = {
  readonly id: string
  readonly ordem: number
  readonly titulo: string
  readonly tema: string
  /** Índice a partir de zero, na ordem do percurso. */
  readonly indice: number
  /** Semente da geometria: a mesma ilha tem sempre a mesma pedra. */
  readonly semente: number
  /** Ponto no **topo do capim**, no centro da ilha. */
  readonly centro: Vetor3
  readonly raio: number
}

/** Posição bruta, antes de centralizar o arquipélago na origem. */
function posicaoBruta(indice: number): Vetor3 {
  return [
    indice * DISTANCIA_ENTRE_CENTROS,
    indice * SOBE_POR_ILHA,
    // Curva em S: as ilhas não ficam alinhadas, e a paisagem ganha profundidade.
    Math.sin(indice * 0.7) * 10,
  ]
}

/**
 * Posiciona as ilhas na ordem do percurso, com o conjunto centralizado na origem.
 *
 * Centralizar importa: a câmera de mapa olha para a origem, e um arquipélago
 * deslocado para +x apareceria fora de quadro.
 */
export function ilhasDoMundo(unidades: readonly UnidadePlanejada[]): readonly IlhaDoMundo[] {
  const ordenadas = [...unidades].sort((uma, outra) => uma.ordem - outra.ordem)
  const brutas = ordenadas.map((_, indice) => posicaoBruta(indice))

  const mediaX = brutas.reduce((soma, [x]) => soma + x, 0) / Math.max(brutas.length, 1)
  const mediaZ = brutas.reduce((soma, [, , z]) => soma + z, 0) / Math.max(brutas.length, 1)

  return ordenadas.map((unidade, indice) => {
    const [x, y, z] = brutas[indice] ?? [0, 0, 0]
    return {
      id: unidade.id,
      ordem: unidade.ordem,
      titulo: unidade.titulo,
      tema: unidade.tema,
      indice,
      // Semente estável: muda com a unidade, nunca com a ordem de desenho.
      semente: sementeDeTexto(unidade.id),
      centro: [x - mediaX, y, z - mediaZ],
      raio: RAIO_DA_ILHA,
    }
  })
}

/** A ponte que sai de `uma` e chega em `outra`, com a transformação pronta. */
export type TrechoDePonte = {
  readonly de: string
  readonly para: string
  /** Onde fica o início da ponte, no mundo. */
  readonly posicao: Vetor3
  /** Rotação em torno do eixo vertical, em radianos. */
  readonly rotacaoY: number
  /** Inclinação em torno do eixo Z, para a ponte subir junto com a trilha. */
  readonly rotacaoZ: number
  readonly comprimento: number
  /** Unidade horizontal que vai de `uma` para `outra`. */
  readonly direcao: readonly [number, number]
}

/**
 * Altura do **eixo** do tabuleiro em relação ao capim da borda.
 *
 * O tabuleiro tem espessura: metade dele fica abaixo do eixo e metade acima.
 * Com o eixo rebaixado em meia espessura, o **topo** do tabuleiro cai exatamente
 * na altura do capim na borda da ilha. A ponte encosta na grama, sem degrau — e
 * o pé do avatar passa de uma para o outro sem escalar nada.
 */
const ALTURA_DO_TABULEIRO = -ESPESSURA_DO_TABULEIRO / 2

/**
 * Calcula a ponte entre duas ilhas.
 *
 * A ponte é gerada ao longo do eixo +x, com o início na origem. Aqui se calcula
 * onde esse início fica e quanto girar — em Y para apontar na direção da outra
 * ilha, em Z para acompanhar a subida da trilha.
 *
 * A ordem das rotações importa. O `Euler` do Three.js, na ordem padrão `XYZ`,
 * aplica primeiro Z e depois Y, que é exatamente o que se quer: inclinar no
 * plano vertical e só então girar no horizontal. O teste confere isso contra a
 * própria biblioteca, e não contra uma cópia da fórmula.
 */
export function ponteEntre(uma: IlhaDoMundo, outra: IlhaDoMundo): TrechoDePonte {
  const [x1, y1, z1] = uma.centro
  const [x2, y2, z2] = outra.centro

  const dx = x2 - x1
  const dz = z2 - z1
  const distancia = Math.hypot(dx, dz)
  if (distancia === 0) {
    throw new Error(`As ilhas ${uma.id} e ${outra.id} estão no mesmo ponto; não há vão a vencer`)
  }

  const ux = dx / distancia
  const uz = dz / distancia

  const inicioX = x1 + ux * uma.raio
  const inicioZ = z1 + uz * uma.raio
  const fimX = x2 - ux * outra.raio
  const fimZ = z2 - uz * outra.raio

  const horizontal = Math.hypot(fimX - inicioX, fimZ - inicioZ)
  if (horizontal <= 0) {
    throw new Error(`As ilhas ${uma.id} e ${outra.id} estão encostadas; não há vão a vencer`)
  }

  const vertical = y2 - y1
  const comprimento = Math.hypot(horizontal, vertical)

  // Altura do capim na borda, medida pela mesma função que gera a ilha.
  const alturaNaBorda = alturaDoTopo(uma.raio, uma.raio)

  return {
    de: uma.id,
    para: outra.id,
    posicao: [inicioX, y1 + alturaNaBorda + ALTURA_DO_TABULEIRO, inicioZ],
    rotacaoY: Math.atan2(-uz, ux),
    rotacaoZ: Math.atan2(vertical, horizontal),
    comprimento,
    direcao: [ux, uz],
  }
}

/** Todas as pontes do percurso, na ordem. */
export function pontesDoPercurso(ilhas: readonly IlhaDoMundo[]): readonly TrechoDePonte[] {
  const pontes: TrechoDePonte[] = []
  for (let indice = 0; indice < ilhas.length - 1; indice += 1) {
    const uma = ilhas[indice]
    const outra = ilhas[indice + 1]
    if (uma && outra) {
      pontes.push(ponteEntre(uma, outra))
    }
  }
  return pontes
}

/**
 * Onde a câmera deve ficar para olhar uma ilha de perto, e para onde olhar.
 *
 * A posição é calculada a partir da borda virada para a frente do percurso, para
 * não colocar a câmera dentro da pedra nem de costas para as estruturas.
 */
export function enquadramentoDaIlha(ilha: IlhaDoMundo): {
  readonly camera: Vetor3
  readonly alvo: Vetor3
} {
  const [x, y, z] = ilha.centro
  const distancia = ilha.raio * 2.6

  return {
    camera: [x - distancia * 0.35, y + ilha.raio * 1.15, z + distancia],
    alvo: [x, y + 1.2, z],
  }
}

/** Distância entre a primeira e a última ilha. Serve para enquadrar o mapa. */
export function espalhamentoDasIlhas(ilhas: readonly IlhaDoMundo[]): number {
  const primeira = ilhas[0]
  const ultima = ilhas[ilhas.length - 1]
  if (!primeira || !ultima) {
    return 0
  }
  return Math.hypot(
    ultima.centro[0] - primeira.centro[0],
    ultima.centro[2] - primeira.centro[2],
  )
}
