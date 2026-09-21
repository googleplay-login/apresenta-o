/**
 * Cálculo de contraste segundo a WCAG 2.1.
 *
 * Função pura, sem dependência de DOM ou de React. Existe para que a paleta
 * derivada das referências visuais seja VERIFICADA por teste, e não apenas
 * escolhida a olho: cor de texto sobre cor de fundo erra o mínimo de leitura com
 * muita facilidade.
 *
 * Referência da fórmula: WCAG 2.1, luminância relativa (critério 1.4.3).
 */

/** Cor no formato `#rrggbb` (maiúsculas ou minúsculas). */
export type Cor = string

const FORMATO_HEX = /^#[0-9a-f]{6}$/

/** Valida e normaliza uma cor. Lança se o formato for inválido. */
export function normalizarCor(cor: Cor): string {
  const normalizada = cor.trim().toLowerCase()
  if (!FORMATO_HEX.test(normalizada)) {
    throw new Error(`Cor inválida: "${cor}". Formato esperado: #rrggbb`)
  }
  return normalizada
}

/** Converte `#rrggbb` nos três canais 0-255. */
export function canaisRgb(cor: Cor): readonly [number, number, number] {
  const normalizada = normalizarCor(cor)
  return [
    Number.parseInt(normalizada.slice(1, 3), 16),
    Number.parseInt(normalizada.slice(3, 5), 16),
    Number.parseInt(normalizada.slice(5, 7), 16),
  ]
}

/** Lineariza um canal de 0-255 conforme a WCAG. */
function linearizar(canal: number): number {
  const proporcao = canal / 255
  return proporcao <= 0.03928 ? proporcao / 12.92 : ((proporcao + 0.055) / 1.055) ** 2.4
}

/** Luminância relativa (0 = preto, 1 = branco). */
export function luminanciaRelativa(cor: Cor): number {
  const [r, g, b] = canaisRgb(cor)
  return 0.2126 * linearizar(r) + 0.7152 * linearizar(g) + 0.0722 * linearizar(b)
}

/** Razão de contraste entre duas cores. Vai de 1 (idênticas) a 21 (preto e branco). */
export function razaoContraste(uma: Cor, outra: Cor): number {
  const primeira = luminanciaRelativa(uma)
  const segunda = luminanciaRelativa(outra)
  const maisClara = Math.max(primeira, segunda)
  const maisEscura = Math.min(primeira, segunda)
  return (maisClara + 0.05) / (maisEscura + 0.05)
}

/** Contraste mínimo da WCAG AA para texto normal. */
export const LIMIAR_AA_TEXTO_NORMAL = 4.5

/** Contraste mínimo da WCAG AA para texto grande (≥ 24px, ou ≥ 18,66px em negrito). */
export const LIMIAR_AA_TEXTO_GRANDE = 3

/** Arredonda a razão para exibição em relatório (duas casas). */
export function arredondarRazao(razao: number): number {
  return Math.round(razao * 100) / 100
}

/** Verdadeiro se o par atende ao mínimo da WCAG AA. */
export function atendeAA(
  primeiroPlano: Cor,
  fundo: Cor,
  opcoes: { textoGrande?: boolean } = {},
): boolean {
  const limiar = opcoes.textoGrande ? LIMIAR_AA_TEXTO_GRANDE : LIMIAR_AA_TEXTO_NORMAL
  return razaoContraste(primeiroPlano, fundo) >= limiar
}
