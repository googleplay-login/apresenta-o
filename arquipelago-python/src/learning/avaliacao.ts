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

/**
 * Quantos acertos aprovam numa avaliação de `total` perguntas.
 *
 * A conta é feita em inteiros, procurando o primeiro número que passa em
 * `foiAprovado` — em vez de `Math.ceil(total * 0.8)`, que dependeria de ponto
 * flutuante justamente no número que decide a aprovação. Para 5 perguntas dá 4.
 */
export function acertosMinimos(total: number): number {
  if (!Number.isInteger(total) || total <= 0) {
    throw new Error(`Total de perguntas inválido: ${total}. Deve ser inteiro maior que zero.`)
  }

  let acertos = 0
  while (!foiAprovado({ acertos, total })) {
    acertos += 1
  }
  return acertos
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

/**
 * O que o enunciado da avaliação é obrigado a dizer, em texto visível.
 *
 * Está aqui, e não escrito à mão na tela, pela mesma razão de sempre: é uma
 * regra do projeto (`STATE_MACHINE.md`, `CONTENT_GUIDE.md`), e regra escrita em
 * dois lugares acaba valendo em um só. Prometer teste secreto inviolável seria
 * mentira sobre a própria robustez — a correção roda no cliente, e quem quiser
 * ver as respostas consegue.
 */
export const AVISO_DE_HONESTIDADE =
  'A correção acontece aqui no seu navegador, e não é antifraude: quem quiser ver as respostas ' +
  'consegue. O objetivo é aprender, não passar.'

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

/**
 * Números das perguntas ainda sem resposta, contando de 1 — como na tela.
 *
 * Devolver os **números** e não só a quantidade existe por um motivo prático:
 * "faltam 2" obriga a pessoa a caçar quais são. Com os números, a tela mostra o
 * que falta e ainda leva o foco até lá.
 */
export function numerosEmBranco(respostas: readonly Resposta[]): readonly number[] {
  const numeros: number[] = []
  respostas.forEach((resposta, indice) => {
    if (resposta === null) {
      numeros.push(indice + 1)
    }
  })
  return numeros
}

/** Lista em português: "3", "3 e 5", "3, 4 e 5". */
function listar(numeros: readonly number[]): string {
  if (numeros.length <= 1) {
    return numeros[0]?.toString() ?? ''
  }
  const ultimo = numeros[numeros.length - 1]
  return `${numeros.slice(0, -1).join(', ')} e ${ultimo}`
}

/**
 * Mensagem de pendência para a tela.
 *
 * Uma frase só, montada aqui para que a contagem, o plural e os números nunca
 * discordem entre si — foi assim que a tela passou a dizer exatamente o que
 * falta, em vez de "faltam algumas".
 */
export function textoDePendencias(respostas: readonly Resposta[]): string {
  const numeros = numerosEmBranco(respostas)

  if (respostas.length === 0) {
    return 'Esta avaliação não tem perguntas.'
  }
  if (numeros.length === 0) {
    return `Todas as ${respostas.length} perguntas estão respondidas. Confira antes de enviar: depois do envio não dá para voltar.`
  }
  if (numeros.length === 1) {
    return `Falta responder a pergunta ${listar(numeros)}.`
  }
  return `Faltam responder as perguntas ${listar(numeros)}.`
}

/**
 * Texto do placar: em que tentativa a pessoa está e qual foi a melhor nota.
 *
 * Compara a nota atual com a melhor guardada para não chamar de "melhor até
 * agora" uma nota que acabou de ser superada — a tela não pode se contradizer
 * no mesmo instante em que mostra o resultado.
 */
export function textoDoPlacar(
  tentativas: number,
  melhorNota: ResultadoDeAvaliacao,
  resultadoAtual: ResultadoDeAvaliacao,
): string {
  if (!Number.isInteger(tentativas) || tentativas < 1) {
    throw new Error(`Número de tentativas inválido: ${tentativas}.`)
  }

  const ordem = `Esta foi a tentativa nº ${tentativas}`
  if (compararNotas(resultadoAtual, melhorNota) >= 0) {
    return `${ordem} — e é a sua melhor nota até agora: ${descreverNota(resultadoAtual)}.`
  }
  return `${ordem}. Sua melhor nota até agora: ${descreverNota(melhorNota)}.`
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
