import type { Malha } from './ilha'

/**
 * Pintura por altura, no vértice.
 *
 * Por que pintar em vez de acender luzes: sombra projetada de verdade custa uma
 * segunda passagem de desenho por quadro e, num mundo de pedras, quase não se
 * nota a diferença. Já um gradiente pintado no próprio vértice — rocha clara em
 * cima, escura na ponta — dá volume à ilha de graça, porque o custo é pago uma
 * vez, na montagem da malha, e não a cada quadro.
 *
 * A cor não vem daqui: vem dos tokens visuais (`src/ui/theme/paleta3d.ts`). Este
 * arquivo só faz a conta de misturar.
 */

/** Cor no formato numérico usado pelo Three.js: `0xRRGGBB`. */
export type Cor3D = number

/** Separa uma cor em canais de 0 a 1, que é como o atributo de cor é lido. */
export function canais(cor: Cor3D): readonly [number, number, number] {
  return [((cor >> 16) & 0xff) / 255, ((cor >> 8) & 0xff) / 255, (cor & 0xff) / 255]
}

/** Junta canais de 0 a 1 de volta em `0xRRGGBB`, com corte nos extremos. */
export function paraCor(canaisDaCor: readonly [number, number, number]): Cor3D {
  const limitar = (valor: number) => Math.round(Math.min(Math.max(valor, 0), 1) * 255)
  return (limitar(canaisDaCor[0]) << 16) | (limitar(canaisDaCor[1]) << 8) | limitar(canaisDaCor[2])
}

/**
 * Converte um canal de sRGB (0 a 1) para a escala **linear**.
 *
 * Por que isto existe: o Three.js lê a cor de um material em sRGB e converte
 * sozinho, mas **não** converte a cor que vem por vértice — ela é usada como
 * está, na escala linear. Pintar o vértice com o número de sRGB fazia toda a
 * pedra e todo o capim saírem mais claros do que a paleta manda (0,5 de sRGB
 * tratado como 0,5 de linear sai na tela como 0,74). Com a conversão aqui, a cor
 * da paleta é a cor que chega à tela, passada pela luz do mundo.
 */
export function canalLinear(componente: number): number {
  const limitado = Math.min(Math.max(componente, 0), 1)
  return limitado <= 0.04045 ? limitado / 12.92 : ((limitado + 0.055) / 1.055) ** 2.4
}

/** Converte as três componentes sRGB de uma cor (0 a 1) para a escala linear. */
export function paraLinear(componentes: readonly number[]): readonly number[] {
  return componentes.map(canalLinear)
}

/** Mistura duas cores. `t` de 0 devolve a primeira, de 1 devolve a segunda. */
export function misturar(uma: Cor3D, outra: Cor3D, t: number): Cor3D {
  const proporcao = Math.min(Math.max(t, 0), 1)
  const a = canais(uma)
  const b = canais(outra)
  return paraCor([
    a[0] + (b[0] - a[0]) * proporcao,
    a[1] + (b[1] - a[1]) * proporcao,
    a[2] + (b[2] - a[2]) * proporcao,
  ])
}

/**
 * Clareia (`fator` > 1) ou escurece (`fator` < 1) uma cor, sem estourar o
 * limite de cada canal. Usado para tirar variações de um token, em vez de
 * escrever um segundo valor de cor solto no código.
 */
export function ajustar(cor: Cor3D, fator: number): Cor3D {
  const [r, g, b] = canais(cor)
  return paraCor([r * fator, g * fator, b * fator])
}

export type GradienteDeAltura = {
  /** Altura em que a cor começa. */
  readonly de: number
  /** Altura em que a cor termina. */
  readonly para: number
  readonly corDe: Cor3D
  readonly corPara: Cor3D
  /**
   * Quantos degraus tem o gradiente. Acima de 1, a passagem fica em faixas
   * visíveis — o que combina com a pedra facetada e evita o degradê liso, que
   * em malha de poucos triângulos vira mancha.
   */
  readonly degraus?: number
}

export type MalhaPintada = Malha & {
  /**
   * Cores por vértice, em sequência r, g, b de 0 a 1, **em escala linear** —
   * que é a escala que o Three.js espera no atributo `color`. Ver `canalLinear`.
   */
  readonly cores: readonly number[]
}

/**
 * Pinta cada vértice conforme a altura, misturando as duas cores do gradiente.
 *
 * Fora da faixa, a cor é a da ponta mais próxima: nada fica preto nem estoura.
 */
export function pintarPorAltura(malha: Malha, gradiente: GradienteDeAltura): MalhaPintada {
  const { de, para, corDe, corPara, degraus = 1 } = gradiente

  if (para === de) {
    throw new Error('Gradiente de altura precisa de duas alturas diferentes')
  }
  if (degraus < 1) {
    throw new Error(`Gradiente precisa de ao menos 1 degrau, e veio ${degraus}`)
  }

  const cores: number[] = []

  for (let indice = 1; indice < malha.posicoes.length; indice += 3) {
    const y = malha.posicoes[indice] ?? 0
    const bruto = (y - de) / (para - de)
    const limitado = Math.min(Math.max(bruto, 0), 1)
    const quantizado = degraus === 1 ? limitado : Math.round(limitado * degraus) / degraus
    // A mistura acontece na escala sRGB — que é onde a paleta foi pensada — e só
    // o resultado final é convertido para a escala linear, que é a que o Three.js
    // espera no atributo de cor do vértice.
    const [r, g, b] = paraLinear(canais(misturar(corDe, corPara, quantizado)))
    cores.push(r ?? 0, g ?? 0, b ?? 0)
  }

  return { posicoes: malha.posicoes, indices: malha.indices, cores }
}

/**
 * Multiplica todas as cores por um fator, mantendo o formato.
 *
 * Opera sobre cores **já pintadas** (portanto em escala linear). Serve para
 * escurecer uma malha pintada sem gerar outra malha.
 */
export function escurecerCores(cores: readonly number[], fator: number): readonly number[] {
  const resultado: number[] = []
  for (let indice = 0; indice < cores.length; indice += 3) {
    resultado.push(
      Math.min(Math.max((cores[indice] ?? 0) * fator, 0), 1),
      Math.min(Math.max((cores[indice + 1] ?? 0) * fator, 0), 1),
      Math.min(Math.max((cores[indice + 2] ?? 0) * fator, 0), 1),
    )
  }
  return resultado
}
