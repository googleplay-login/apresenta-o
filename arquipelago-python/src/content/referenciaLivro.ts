/**
 * Referência a uma parte do livro de estudo.
 *
 * REGRA INEGOCIÁVEL (registrada em `docs/CONTENT_GUIDE.md`): nunca inventar
 * número de página. Enquanto o PDF não estiver disponível no ambiente,
 * `paginaImpressa` e `paginaPdf` ficam `null` e `status` fica
 * `'referencia-pendente'`. Um número de página errado é pior do que nenhum: ele
 * manda o estudante ler a página errada.
 */

/** `'confirmada'` exige páginas preenchidas; `'referencia-pendente'` exige `null`. */
export type StatusReferencia = 'confirmada' | 'referencia-pendente'

export type ReferenciaLivro = {
  /** Número do capítulo na edição em português (1 a 20 + apêndices). */
  readonly capitulo: number
  /** Título do capítulo. A conferência do título depende do índice do PDF. */
  readonly tituloCapitulo: string
  /**
   * NOSSA descrição do recorte proposto para esta unidade. Não é citação do
   * livro: o livro é fonte de estudo, não texto a ser reproduzido.
   */
  readonly recorteProposto: string
  /** Página da edição impressa. `null` = não verificada. */
  readonly paginaImpressa: number | null
  /** Página no arquivo PDF usado. `null` = não verificada. */
  readonly paginaPdf: number | null
  readonly status: StatusReferencia
}

/**
 * Verdadeiro se a referência está coerente:
 *  - `'confirmada'` exige as duas páginas preenchidas;
 *  - `'referencia-pendente'` exige as duas páginas nulas.
 *
 * Página impressa e página de PDF são coisas diferentes: o deslocamento entre
 * elas não é constante e não pode ser presumido.
 */
export function referenciaEstaCoerente(referencia: ReferenciaLivro): boolean {
  const temAsDuasPaginas =
    referencia.paginaImpressa !== null && referencia.paginaPdf !== null
  const naoTemPaginaNenhuma =
    referencia.paginaImpressa === null && referencia.paginaPdf === null

  return referencia.status === 'confirmada' ? temAsDuasPaginas : naoTemPaginaNenhuma
}

/** Texto de exibição da referência. Mostra "referência pendente" quando for o caso. */
export function descreverReferencia(referencia: ReferenciaLivro): string {
  const base = `Cap. ${referencia.capitulo} — ${referencia.tituloCapitulo}`
  if (referencia.status === 'confirmada') {
    return `${base} (página ${referencia.paginaImpressa})`
  }
  return `${base} (página: referência pendente)`
}
