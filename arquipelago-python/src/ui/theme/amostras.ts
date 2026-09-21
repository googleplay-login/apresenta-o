/**
 * Leitura dos tokens para exibição em mostruário.
 *
 * Vive separado do componente para poder ser testado: a garantia que interessa é
 * que o guia de estilo mostre **todas** as cores declaradas. Um guia que esquece
 * uma cor é pior do que não existir, porque passa confiança falsa.
 */
import { razaoContraste } from './contraste'
import { cores, coresDeEstado } from './tokens'

export type Amostra = {
  /** Caminho do token, como `ceu.alto` ou `estado.planejada`. */
  readonly caminho: string
  readonly cor: string
}

const COR_HEX = /^#[0-9a-f]{6}$/i

/**
 * Percorre um objeto de tokens e devolve toda cor **hexadecimal**, com o caminho.
 *
 * Valores que não são cor sólida ficam de fora de propósito: `painel.sombra` é um
 * `rgba` com transparência e não pode ser medido pela fórmula de contraste, que
 * exige cor opaca. Mostrá-lo como amostra ao lado das outras sugeriria uma
 * comparação que não existe.
 */
export function coletarAmostras(objeto: object, prefixo = ''): readonly Amostra[] {
  const amostras: Amostra[] = []

  for (const [chave, valor] of Object.entries(objeto)) {
    const caminho = prefixo ? `${prefixo}.${chave}` : chave

    if (typeof valor === 'string') {
      if (COR_HEX.test(valor)) {
        amostras.push({ caminho, cor: valor })
      }
    } else if (valor !== null && typeof valor === 'object') {
      amostras.push(...coletarAmostras(valor, caminho))
    }
  }

  return amostras
}

/** Todas as cores da interface: as fixas e as de estado. */
export function todasAsAmostras(): readonly Amostra[] {
  return [...coletarAmostras(cores), ...coletarAmostras(coresDeEstado, 'estado')]
}

/**
 * Escolhe, entre o texto claro e o escuro, o que tem mais contraste sobre a cor
 * de fundo informada.
 *
 * Não garante que o resultado atenda à WCAG — garantir isso exige mudar a cor de
 * fundo. Garante apenas que a melhor das duas opções disponíveis é usada, e
 * mostra a razão medida para quem quiser conferir.
 */
export function textoLegivelSobre(corDeFundo: string): string {
  const comClaro = razaoContraste(cores.texto.sobreEscuro, corDeFundo)
  const comEscuro = razaoContraste(cores.texto.principal, corDeFundo)
  return comClaro >= comEscuro ? cores.texto.sobreEscuro : cores.texto.principal
}
