/**
 * Regras de avaliação.
 *
 * Este módulo é **puro**: não conhece React, Three.js, armazenamento, rede,
 * rota nem parâmetro de URL. Ele recebe números e devolve decisão. É o que
 * permite testar a regra de aprovação sem montar tela nenhuma.
 *
 * O detalhe mais importante está em `foiAprovado`: a comparação é feita em
 * **inteiros**, sem ponto flutuante. `4 / 5 >= 0.8` é falso em ponto flutuante
 * binário (0.8 não é representável exatamente), e uma regra de aprovação não
 * pode depender disso.
 */

/** Acertos e total de perguntas de uma avaliação. */
export type ResultadoDeAvaliacao = {
  readonly acertos: number
  readonly total: number
}

/** Percentual mínimo de acertos reais para aprovar. */
export const NOTA_MINIMA_PERCENTUAL = 80

/** Número de perguntas por unidade no protótipo. */
export const PERGUNTAS_POR_UNIDADE = 5

/** Acertos necessários em `PERGUNTAS_POR_UNIDADE` perguntas. */
export const ACERTOS_MINIMOS_PADRAO = 4

/** Lança se o resultado for impossível (não inteiro, negativo ou maior que o total). */
export function validarResultado(resultado: ResultadoDeAvaliacao): void {
  const { acertos, total } = resultado

  if (!Number.isInteger(total) || total <= 0) {
    throw new Error(`Total de perguntas inválido: ${total}. Deve ser inteiro maior que zero.`)
  }
  if (!Number.isInteger(acertos) || acertos < 0 || acertos > total) {
    throw new Error(
      `Acertos inválido: ${acertos} para um total de ${total}. Deve ser inteiro entre 0 e ${total}.`,
    )
  }
}

/**
 * Verdadeiro quando os acertos atingem o mínimo, medido **antes** de qualquer
 * arredondamento de exibição.
 *
 * `acertos / total >= 4 / 5` é equivalente, em inteiros, a `acertos * 5 >= total * 4`.
 */
export function foiAprovado(resultado: ResultadoDeAvaliacao): boolean {
  validarResultado(resultado)
  return resultado.acertos * 5 >= resultado.total * 4
}

/** Percentual exato. Pode ter dízima (2 de 3 = 66,666...). */
export function percentualExato(resultado: ResultadoDeAvaliacao): number {
  validarResultado(resultado)
  return (resultado.acertos * 100) / resultado.total
}

/**
 * Percentual para exibir na tela, **sempre arredondado para baixo**.
 *
 * Arredondar para cima é o defeito que isso evita: 79,6% apareceria como "80%" e
 * o estudante leria que passou quando não passou.
 */
export function percentualExibido(resultado: ResultadoDeAvaliacao): number {
  return Math.floor(percentualExato(resultado))
}

/**
 * Compara duas notas sem ponto flutuante: devolve positivo se `uma` for melhor.
 * Usado para guardar a melhor nota do estudante.
 */
export function compararNotas(uma: ResultadoDeAvaliacao, outra: ResultadoDeAvaliacao): number {
  validarResultado(uma)
  validarResultado(outra)
  return uma.acertos * outra.total - outra.acertos * uma.total
}

/** Texto de exibição da nota: a fração exata mais o percentual para baixo. */
export function descreverNota(resultado: ResultadoDeAvaliacao): string {
  return `${resultado.acertos} de ${resultado.total} acertos (${percentualExibido(resultado)}%)`
}

/** Uma resposta ainda não dada é `null`; resposta dada é o índice da alternativa. */
export type Resposta = number | null

/** Verdadeiro quando todas as perguntas foram respondidas. */
export function respostasCompletas(respostas: readonly Resposta[]): boolean {
  return respostas.length > 0 && respostas.every((resposta) => resposta !== null)
}

/** Quantas perguntas ainda faltam responder. */
export function contarEmBranco(respostas: readonly Resposta[]): number {
  return respostas.filter((resposta) => resposta === null).length
}

/** Um resultado só é aceito se todas as perguntas tiverem resposta. */
export function avaliarRespostas(
  respostas: readonly Resposta[],
  gabarito: readonly number[],
): ResultadoDeAvaliacao {
  if (respostas.length !== gabarito.length) {
    throw new Error(
      `Quantidade de respostas (${respostas.length}) diferente do gabarito (${gabarito.length}).`,
    )
  }
  if (!respostasCompletas(respostas)) {
    throw new Error(
      `Faltam ${contarEmBranco(respostas)} respostas. Todas as perguntas precisam ser respondidas antes de enviar.`,
    )
  }

  const acertos = respostas.reduce<number>(
    (soma, resposta, indice) => (resposta === gabarito[indice] ? soma + 1 : soma),
    0,
  )

  return { acertos, total: gabarito.length }
}
