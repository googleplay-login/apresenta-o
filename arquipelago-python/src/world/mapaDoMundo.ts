import type { IdDeTrilha, UnidadePlanejada } from '../content/planoDeUnidades'
import type { Vetor3 } from './camera/movimento'
import { sementeDeTexto } from './geometria/aleatorio'
import { alturaDoTopo, bordaDoTopoEmDirecao, fatoresDaBorda, TOPO_PADRAO } from './geometria/ilha'
import { identidadeDaIlha, type IdentidadeDaIlha } from './geometria/identidade'
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

/**
 * Raio **nominal** do capim de uma ilha.
 *
 * Não é o raio de todas: cada ilha tem o seu, dentro de uma faixa estreita (ver
 * `geometria/identidade.ts`), e é o raio real que encosta a ponte na borda e
 * delimita o chão caminhável. Este número serve para **espaçar** as ilhas umas
 * das outras, de modo que duas bordas nunca se encostem.
 */
export const RAIO_DA_ILHA = 6

/** Vão entre duas bordas. É o comprimento da ponte liberada. */
export const VAO_DA_PONTE = 9

/**
 * Distância **nominal** entre dois centros: as duas bordas nominais mais o vão.
 *
 * Não é a distância de todo par: cada ilha tem o raio dela, então a distância
 * entre um par é `raio de uma + raio da outra + vão`, e é assim que o trilho
 * mantém o **vão constante** e a ponte com o mesmo comprimento — o que muda de
 * ilha para ilha é o tamanho da pedra, não o caminho entre elas.
 */
export const DISTANCIA_ENTRE_CENTROS = RAIO_DA_ILHA * 2 + VAO_DA_PONTE

/** Quanto cada ilha sobe em relação à anterior. A trilha visivelmente ascende. */
export const SOBE_POR_ILHA = 2.4

/** Uma ilha posicionada no mundo. */
export type IlhaDoMundo = {
  readonly id: string
  readonly ordem: number
  readonly titulo: string
  readonly tema: string
  /**
   * A trilha do livro a que a ilha pertence (D-061).
   *
   * Vem do plano, e não de uma conta feita aqui: a ilha é uma unidade, e a
   * unidade sabe de que parte do livro ela é. Quem quiser o nome da trilha para
   * mostrar na tela usa `trilhaDe(ilha.trilha)`.
   */
  readonly trilha: IdDeTrilha
  /** Índice a partir de zero, na ordem do percurso. */
  readonly indice: number
  /** Semente da geometria: a mesma ilha tem sempre a mesma pedra. */
  readonly semente: number
  /**
   * O que distingue esta ilha de todas as outras: silhueta, marco, vegetação e
   * tom. Vem da semente (o id) e da posição no percurso, e é a **única** fonte
   * desses números — a cena lê daqui, e não recalcula nada.
   */
  readonly identidade: IdentidadeDaIlha
  /** Ponto no **topo do capim**, no centro da ilha. */
  readonly centro: Vetor3
  readonly raio: number
  /**
   * Os fatores da borda do capim, coluna a coluna (D-063).
   *
   * O raio acima é o **nominal**: a borda de verdade recua e avança em volta
   * dele, e quem precisa encostar na ilha — a ponte — tem de ler esta lista. Ela
   * sai da mesma semente e da mesma ordem de sorteios que o capim desenhado, e
   * por isso é a borda que está na tela, e não uma segunda conta parecida.
   */
  readonly bordaDoCapim: readonly number[]
}

/**
 * Posição bruta, antes de centralizar o arquipélago na origem.
 *
 * O avanço em x é **acumulado**, e não uma multiplicação: cada ilha fica a
 * `raio anterior + raio dela + vão` da anterior. Com raios diferentes, essa é a
 * única conta que mantém o vão constante — e é o vão que a ponte precisa vencer.
 */
function posicaoBruta(indice: number, raios: readonly number[]): Vetor3 {
  let x = 0
  for (let passo = 1; passo <= indice; passo += 1) {
    const anterior = raios[passo - 1] ?? RAIO_DA_ILHA
    const atual = raios[passo] ?? RAIO_DA_ILHA
    x += anterior + atual + VAO_DA_PONTE
  }

  return [
    x,
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
  const identidades = ordenadas.map((unidade, indice) =>
    identidadeDaIlha(indice, sementeDeTexto(unidade.id)),
  )
  const raios = identidades.map((identidade) => identidade.formato.raioDoTopo)
  const brutas = ordenadas.map((_, indice) => posicaoBruta(indice, raios))

  const mediaX = brutas.reduce((soma, [x]) => soma + x, 0) / Math.max(brutas.length, 1)
  const mediaZ = brutas.reduce((soma, [, , z]) => soma + z, 0) / Math.max(brutas.length, 1)

  return ordenadas.map((unidade, indice) => {
    const [x, y, z] = brutas[indice] ?? [0, 0, 0]
    // Semente estável: muda com a unidade, nunca com a ordem de desenho.
    const semente = sementeDeTexto(unidade.id)
    const identidade = identidades[indice] ?? identidadeDaIlha(indice, semente)
    return {
      id: unidade.id,
      ordem: unidade.ordem,
      titulo: unidade.titulo,
      tema: unidade.tema,
      trilha: unidade.trilha,
      indice,
      semente,
      identidade,
      centro: [x - mediaX, y, z - mediaZ],
      // O raio que vale é o desta ilha: é ele que a ponte procura para encostar.
      raio: identidade.formato.raioDoTopo,
      // A borda de verdade do capim, e não o círculo do raio nominal (D-063).
      // Sai da mesma semente e da mesma faixa de irregularidade que o capim
      // desenhado em `Ilha.tsx`; aqui a `bordaMinima` fica de fora de propósito,
      // porque ela só **alarga** a borda (o capim nunca é mais estreito que a
      // pedra) — e a ponte ancora na medida mais conservadora das duas.
      bordaDoCapim: fatoresDaBorda({
        ...TOPO_PADRAO,
        semente,
        segmentosRadiais: identidade.formato.segmentosRadiais,
        amplitude: identidade.formato.amplitudeDaBorda,
      }),
    }
  })
}

/**
 * Onde o capim de uma ilha termina, na direção dada.
 *
 * Devolve o raio do ponto mais **interior** da borda naquela direção (a corda
 * entre as duas colunas vizinhas — ver `bordaDoTopoEmDirecao`): ancorar aqui
 * garante que a peça está sobre o capim, e não no ar. É esta conta que a ponte
 * usa nas duas pontas, no lugar do raio nominal que ela usava antes (D-063).
 */
export function bordaDaIlhaEmDirecao(ilha: IlhaDoMundo, ux: number, uz: number): number {
  const { interno } = bordaDoTopoEmDirecao({
    raio: ilha.raio,
    segmentosRadiais: ilha.identidade.formato.segmentosRadiais,
    fatores: ilha.bordaDoCapim,
    angulo: Math.atan2(uz, ux),
  })
  return interno
}

/**
 * A borda **externa** do capim naquela direção: nenhum ponto da ilha passa daqui.
 *
 * Serve para medir, não para ancorar: é o limite que uma peça ancorada não pode
 * ultrapassar, e é o que o teste da ponte cobra.
 */
export function bordaExternaDaIlhaEmDirecao(ilha: IlhaDoMundo, ux: number, uz: number): number {
  const { externo } = bordaDoTopoEmDirecao({
    raio: ilha.raio,
    segmentosRadiais: ilha.identidade.formato.segmentosRadiais,
    fatores: ilha.bordaDoCapim,
    angulo: Math.atan2(uz, ux),
  })
  return externo
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

  // A âncora é a borda **real** do capim, e não o raio nominal: a diferença entre
  // as duas chega a 12% do raio, e era ela que deixava a tábua no ar de um lado e
  // enterrada no capim do outro (D-063).
  const bordaDeOrigem = bordaDaIlhaEmDirecao(uma, ux, uz)
  const bordaDeDestino = bordaDaIlhaEmDirecao(outra, -ux, -uz)

  const inicioX = x1 + ux * bordaDeOrigem
  const inicioZ = z1 + uz * bordaDeOrigem
  const fimX = x2 - ux * bordaDeDestino
  const fimZ = z2 - uz * bordaDeDestino

  const horizontal = Math.hypot(fimX - inicioX, fimZ - inicioZ)
  if (horizontal <= 0) {
    throw new Error(`As ilhas ${uma.id} e ${outra.id} estão encostadas; não há vão a vencer`)
  }

  // Altura do capim nas duas bordas, medida pela mesma função que gera a ilha —
  // com a inclinação de cada uma, porque cada ilha sobe de um jeito. É a
  // diferença entre as duas bordas que a ponte precisa vencer, e não a diferença
  // entre os centros: com inclinações diferentes, as duas contas deixam de
  // coincidir, e a ponte terminaria acima ou abaixo do capim de destino.
  const alturaNaBordaDeOrigem = alturaDoTopo(
    uma.raio,
    uma.raio,
    uma.identidade.formato.inclinacaoDoCapim,
  )
  const alturaNaBordaDeDestino = alturaDoTopo(
    outra.raio,
    outra.raio,
    outra.identidade.formato.inclinacaoDoCapim,
  )

  const vertical = y2 + alturaNaBordaDeDestino - (y1 + alturaNaBordaDeOrigem)
  const comprimento = Math.hypot(horizontal, vertical)

  return {
    de: uma.id,
    para: outra.id,
    posicao: [inicioX, y1 + alturaNaBordaDeOrigem + ALTURA_DO_TABULEIRO, inicioZ],
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
