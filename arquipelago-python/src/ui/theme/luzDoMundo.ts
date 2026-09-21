import { canais, misturar, paraCor, paraLinear, paraSrgb, type Cor3D } from '../../world/geometria/pintura'
import { CORES_DERIVADAS, CORES_DO_MUNDO } from './paleta3d'

/**
 * A luz do mundo, e a conta de prever a cor que chega à tela.
 *
 * Por que este arquivo existe: até ele, toda conferência de cor do projeto era
 * feita sobre o **token** — o valor escrito na paleta. A medida que ele permite
 * mostrou que isso não bastava: três cores da paleta chegavam à tela com radiação
 * acima de 1,0, o teto que o tone mapping do React Three Fiber consegue
 * representar, e por isso apareciam queimadas (a nuvem, a laje do mar e a parede
 * da biblioteca) enquanto a ponta do penhasco chegava a **#030201**, quase preto
 * puro, com 0,005 de radiação (D-060). Nenhuma das duas coisas era visível no
 * token: as duas nascem da luz somada ao material.
 *
 * A conta reproduz o caminho do Three.js, passo por passo:
 *
 *   1. a cor do material é sRGB, e o Three.js a converte para linear ao carregar;
 *   2. as luzes entram **somadas**, e em linear (é por isso que a cor de um
 *      material claro aqui pode passar de 1,0 enquanto o token parece razoável);
 *   3. o tone mapping ACES comprime o resultado de volta para a faixa 0 a 1;
 *   4. a tela mostra sRGB.
 *
 * Os números das luzes são os de `world/Ceu.tsx`, e o teste `luzDoMundo.test.ts`
 * cobra que continuem iguais: se alguém aumentar a intensidade lá, o teste de
 * estouro aqui passa a acusar, e o defeito aparece antes da captura de tela.
 *
 * O que este arquivo **não** é: ele não desenha nada e não decide cor nenhuma.
 * Ele prevê. Quem pinta o mundo continua sendo `world/`, a partir dos tokens.
 */

/** Intensidade da meia-luz (`hemisphereLight`) em `world/Ceu.tsx`. */
export const INTENSIDADE_DA_MEIA_LUZ = 1.35
/** Intensidade do sol (`directionalLight`) em `world/Ceu.tsx`. */
export const INTENSIDADE_DO_SOL = 1.15
/** Posição do sol em `world/Ceu.tsx`. */
export const POSICAO_DO_SOL = [60, 90, 40] as const

/** A luz que sobra de tudo o que passa do teto de 1,0 é perdida. */
export const TETO_DE_RADIACAO = 1

export type Direcao = readonly [number, number, number]

/** Direções usadas nas conferências, nomeadas pelo que elas olham no mundo. */
export const DIRECOES = {
  /** Chão e topo de capim: a face virada para o céu. */
  paraCima: [0, 1, 0],
  /** Parede: a face de lado. */
  deLado: [0, 0.2, 0.9],
  /** A ponta do penhasco e a face de baixo das coisas: virada para o chão. */
  paraBaixo: [0.4, -0.9, 0],
} as const satisfies Readonly<Record<string, Direcao>>

function normalizar([x, y, z]: Direcao): readonly [number, number, number] {
  const tamanho = Math.hypot(x, y, z) || 1
  return [x / tamanho, y / tamanho, z / tamanho]
}

/**
 * Irradiância que chega a uma superfície com esta normal, em linear.
 *
 * É a soma das duas luzes do mundo com o peso que a direção de cada uma dá:
 * meia-esfera mistura céu e chão pela inclinação da face, e o sol só ilumina o
 * que aponta para ele.
 */
export function irradiancia(direcao: Direcao): readonly [number, number, number] {
  const [x, y, z] = normalizar(direcao)
  const paraCima = (y + 1) / 2
  const ceu = paraLinear(canais(CORES_DO_MUNDO.ceuDoAlto))
  const chao = paraLinear(canais(CORES_DO_MUNDO.rochaClara))
  const sol = paraLinear(canais(CORES_DO_MUNDO.pale))
  const [solX, solY, solZ] = normalizar(POSICAO_DO_SOL)
  const apontarParaOSol = Math.max(0, x * solX + y * solY + z * solZ)

  const canaisDeLuz = [0, 1, 2].map(
    (i) =>
      ((ceu[i] ?? 0) * paraCima + (chao[i] ?? 0) * (1 - paraCima)) * INTENSIDADE_DA_MEIA_LUZ +
      (sol[i] ?? 0) * INTENSIDADE_DO_SOL * apontarParaOSol,
  )
  return [canaisDeLuz[0] ?? 0, canaisDeLuz[1] ?? 0, canaisDeLuz[2] ?? 0]
}

/**
 * Radiação linear de cada canal de uma cor com luz — antes do tone mapping.
 *
 * É o número que interessa: **acima de 1,0 o canal está queimado** e perde
 * qualquer variação, porque tudo o que passa do teto vira a mesma cor branca.
 * Com `semLuz`, a superfície é desenhada chapada (`meshBasicMaterial`) e a
 * radiação é a própria cor do material.
 */
export function radiacao(cor: Cor3D, direcao: Direcao, semLuz = false): readonly [number, number, number] {
  const albedo = paraLinear(canais(cor))
  const luz = semLuz ? [1, 1, 1] : irradiancia(direcao)
  const resultado = [0, 1, 2].map((i) => (albedo[i] ?? 0) * (luz[i] ?? 0))
  return [resultado[0] ?? 0, resultado[1] ?? 0, resultado[2] ?? 0]
}

/** O maior canal da radiação. Passar de 1,0 é estar queimado. */
export function maiorRadiacao(cor: Cor3D, direcao: Direcao, semLuz = false): number {
  return Math.max(...radiacao(cor, direcao, semLuz))
}

/** O maior canal da radiação, considerando as três direções de referência. */
export function piorRadiacao(cor: Cor3D, semLuz = false): number {
  return Math.max(...Object.values(DIRECOES).map((direcao) => maiorRadiacao(cor, direcao, semLuz)))
}

/** O canal mais escuro, na direção mais desfavorável: é o que decide se a peça some. */
export function piorEscuridao(cor: Cor3D, semLuz = false): number {
  return Math.min(...Object.values(DIRECOES).map((direcao) => Math.max(...radiacao(cor, direcao, semLuz))))
}

/** Luminância linear de uma radiação, na proporção em que o olho pesa os canais. */
export function luzDe(radiacaoDaCor: readonly number[]): number {
  return 0.2126 * (radiacaoDaCor[0] ?? 0) + 0.7152 * (radiacaoDaCor[1] ?? 0) + 0.0722 * (radiacaoDaCor[2] ?? 0)
}

/**
 * O papel de cada cor, que é o que decide se a medição de luz se aplica a ela.
 *
 * `superficie` é tudo o que é desenhado como material — é a essas cores que o
 * teto de radiação e o piso de escuridão se aplicam.
 *
 * `fundo` é a cor do fundo da cena e da névoa, e `luz` é a cor de uma luz: as
 * duas **não** são superfícies. `fonte` é a cor que só existe para virar outra
 * por mistura (a pedra escura que gera a pedra do alto e a do fundo, a madeira que
 * gera o poste e o tronco) e que o mundo de hoje não desenha. Medir a cor do céu como se ela recebesse a luz do
 * mundo dava 1,58 de radiação — um número sem sentido, porque o céu não recebe
 * luz nenhuma: ele **é** a luz. A primeira versão desta conferência tratava as
 * três como superfícies e acusou cinco cores; separar o papel é o que faz o
 * número apontar para um defeito de verdade (D-060).
 */
export type PapelDaCor = 'superficie' | 'fundo' | 'luz' | 'fonte'

const PAPEIS: Readonly<Record<string, PapelDaCor>> = {
  // Fundo da cena e névoa: não são superfícies, são o que o mundo tem atrás e em
  // volta. Nenhuma das duas é desenhada como material.
  ceu: 'fundo',
  nevoa: 'fundo',
  // Cores de luz: a meia-luz e o sol. O mundo **emite** estas cores, não as pinta.
  ceuDoAlto: 'luz',
  pale: 'luz',
  // Fonte de mistura: só entram na conta de outra cor (`paleta3d.ts`), e nenhuma
  // delas é desenhada como material no mundo de hoje. Se alguma passar a ser, o
  // guarda abaixo (`o mundo não desenha cor fora do orçamento`) acusa.
  rocha: 'fonte',
  madeira: 'fonte',
  madeiraClara: 'fonte',
  mar: 'fonte',
  marFundo: 'fonte',
}

/**
 * O teto de radiação para uma cor de **material**.
 *
 * Não é o teto absoluto (1,0): é o teto com folga. Uma superfície exatamente no
 * teto já perdeu toda a variação de luz — é o que acontece com qualquer coisa
 * acima de ~0,92 na curva ACES, que comprime fortemente o topo da faixa. Os 0,92
 * deixam o material claro o bastante para ser claro e escuro o bastante para
 * ainda ter forma.
 */
export const TETO_DE_MATERIAL = 0.92

/**
 * Traz uma cor para dentro do orçamento de luz, mexendo só na claridade.
 *
 * O problema que isto resolve, medido (D-060): o tom de uma ilha é a cor do
 * **marco** dela, e quatro dos doze tons chegam à tela acima do teto — o tom 6
 * (`#e2e5e8`, quase branco) chega a **1,46**, e o marco vira uma silhueta branca
 * chapada, sem volume. O mesmo acontece com o tom 3 (0,96), o 7 (1,14) e o 10
 * (0,96), e piora quando a unidade está **bloqueada**, porque aí o tom é misturado
 * com a névoa e fica mais claro ainda (o tom 3 bloqueado chega a 1,17).
 *
 * A correção podia ser escurecer os tons na paleta — mas o tom é a identidade da
 * ilha, escolhido por distância medida entre os doze (`paleta3d.ts`), e mexer na
 * lista mudaria a identidade para consertar um problema de **luz**. Aqui a lista
 * de tons fica intacta: o que muda é a cor **desenhada**, e só quando ela passa
 * do orçamento. A escala é aplicada na proporção entre os canais, então a cor
 * mantém o matiz e a relação entre eles — o tom continua sendo aquele tom, um
 * pouco mais fundo.
 */
export function corNoOrcamentoDeLuz(cor: Cor3D, teto: number = TETO_DE_MATERIAL): Cor3D {
  if (piorRadiacao(cor) <= teto) {
    return cor
  }

  // Alvo um pouco abaixo do teto: `paraCor` arredonda cada canal para 8 bits, e o
  // passo do arredondamento é maior que a correção necessária no fim da conta —
  // medido, o tom da ilha 3 ficava em 0,9229 com o teto pedido em 0,92 e não
  // descia mais por mais que se repetisse a escala. A margem de 1% é invisível na
  // tela e garante o teto depois do arredondamento.
  const alvo = teto * 0.99

  // A conta é feita em linear, onde a radiação é proporcional à cor: dividir o
  // canal pelo fator divide a radiação pelo mesmo fator. A volta para sRGB passa
  // por `paraCor`, que arredonda cada canal para 8 bits — e o arredondamento pode
  // devolver a cor um fio acima do teto (medido: 0,9229 no tom da ilha 3). Por
  // isso a conferência é refeita e, se ainda passar, escala-se de novo. Convergir
  // é imediato, mas o laço tem fim para não depender disso.
  let atual = cor
  for (let tentativa = 0; tentativa < 4; tentativa += 1) {
    const pior = piorRadiacao(atual)
    if (pior <= teto) {
      return atual
    }
    const fator = alvo / pior
    const canaisDaCor = canais(atual)
    const correto = paraSrgb(paraLinear(canaisDaCor).map((componente) => componente * fator))
    atual = paraCor([correto[0] ?? 0, correto[1] ?? 0, correto[2] ?? 0])
  }

  return atual
}

/** Todas as cores fixas do mundo, com o nome, o papel e se são desenhadas sem luz. */
export const CORES_DO_MUNDO_INTEIRO: readonly {
  readonly nome: string
  readonly cor: Cor3D
  readonly papel: PapelDaCor
  readonly semLuz: boolean
}[] = [
  ...Object.entries(CORES_DO_MUNDO).map(([nome, cor]) => ({
    nome: `CORES_DO_MUNDO.${nome}`,
    cor,
    papel: PAPEIS[nome] ?? 'superficie',
    semLuz: false,
  })),
  ...Object.entries(CORES_DERIVADAS).map(([nome, cor]) => ({
    nome: `CORES_DERIVADAS.${nome}`,
    cor,
    // O sol não é superfície: é a **luz** que o céu desenha como halo, num
    // `shaderMaterial` que soma a cor por cima do gradiente (ver `Ceu.tsx`). O
    // núcleo do sol clarear até o branco é o que se espera de um sol, e medir a
    // cor dele contra o teto das superfícies não quer dizer nada — do mesmo jeito
    // que a cor do céu (D-065).
    papel: nome === 'sol' ? ('luz' as PapelDaCor) : ('superficie' as PapelDaCor),
    // As nuvens (os dois tons) e o mar distante são desenhados chapados
    // (`meshBasicMaterial`), em `world/Ceu.tsx`: não recebem luz nenhuma. A
    // nuvem entrou nesta lista na D-055; o tom de cima, que dá volume a ela,
    // entrou junto (D-065).
    semLuz: nome === 'nuvem' || nome === 'nuvemDoAlto' || nome === 'marDistante',
  })),
]

/** Só as cores que o mundo desenha como superfície. */
export const SUPERFICIES_DO_MUNDO = CORES_DO_MUNDO_INTEIRO.filter(
  (entrada) => entrada.papel === 'superficie',
)

/**
 * As superfícies que cobrem **área grande** na tela.
 *
 * A distinção importa para o piso de luz, e não para o teto: uma peça pequena e
 * escura é um detalhe (a sombra de uma quina, o fundo de uma gaveta), mas uma
 * superfície grande e escura vira um **buraco** no meio da cena. Foi assim que a
 * ponta do penhasco ficou: um bico quase preto (#030201) pendurado no céu claro.
 *
 * O teto, esse vale para toda superfície desenhada, pequena ou grande: qualquer
 * material acima dele perde a variação de luz.
 */
const NOMES_DAS_GRANDES = [
  'CORES_DO_MUNDO.capim',
  'CORES_DO_MUNDO.rochaClara',
  'CORES_DERIVADAS.capimClaro',
  'CORES_DERIVADAS.rochaDoAlto',
  'CORES_DERIVADAS.rochaDoFundo',
  'CORES_DERIVADAS.parede',
  'CORES_DERIVADAS.telhado',
  'CORES_DERIVADAS.ponte',
  'CORES_DERIVADAS.corrimao',
  'CORES_DERIVADAS.poste',
  'CORES_DERIVADAS.tronco',
  'CORES_DERIVADAS.nuvem',
  'CORES_DERIVADAS.marDistante',
] as const

export const SUPERFICIES_GRANDES_DO_MUNDO = CORES_DO_MUNDO_INTEIRO.filter((entrada) =>
  (NOMES_DAS_GRANDES as readonly string[]).includes(entrada.nome),
)

/**
 * Cores da paleta que o mundo **ajusta ao desenhar**, em vez de usar como estão.
 *
 * A regra do projeto é a paleta ser a fonte da verdade, e é — mas a cor de um
 * material não é só a cor: é a cor **vezes a luz**. Estas são as que, medidas na
 * luz deste mundo, passam do orçamento e por isso passam por
 * `corNoOrcamentoDeLuz` no lugar onde o mundo as desenha:
 *
 *  - `parede` (a biblioteca): chega a 1,001 de radiação. O ajuste está em
 *    `world/Ilha.tsx`;
 *  - o **tom de cada ilha** (o marco) e as **cores do avatar**: mesmos motivo e
 *    tratamento, só que não são cores fixas da paleta e sim escolhidas por ilha.
 *
 * A lista é curta de propósito: cada nome aqui é uma cor cujo valor **desenhado**
 * difere do valor da paleta, e por isso ela sai da conferência feita sobre a
 * paleta e entra na conferência feita sobre o desenho. Quem acrescentar uma cor
 * a esta lista tem de acrescentar o ajuste no lugar que desenha.
 */
export const CORES_AJUSTADAS_AO_DESENHAR: readonly string[] = ['CORES_DERIVADAS.parede']

/** O piso de luz: abaixo disto, uma superfície grande vira buraco na cena. */
export const PISO_DE_LUZ = 0.02

/** O piso, só nas direções que a peça mostra: o lado de baixo fica escondido. */
export function piorEscuridaoVisivel(cor: Cor3D): number {
  return Math.min(
    ...[DIRECOES.paraCima, DIRECOES.deLado].map((direcao) => Math.max(...radiacao(cor, direcao))),
  )
}

/** Mistura em sRGB, para o teste comparar com a paleta sem repetir a conta. */
export { misturar }
