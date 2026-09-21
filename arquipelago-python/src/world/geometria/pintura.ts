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
  /** Cores por vértice, em sequência r, g, b de 0 a 1. */
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
    const [r, g, b] = canais(misturar(corDe, corPara, quantizado))
    cores.push(r, g, b)
  }

  return { posicoes: malha.posicoes, indices: malha.indices, cores }
}

/**
 * Soma um deslocamento a todas as cores, mantendo o formato.
 * Usado para escurecer a pedra de uma ilha bloqueada sem gerar outra malha.
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
