/**
 * Referencia a uma parte do livro de estudo.
 *
 * REGRA INEGOCIAVEL (registrada em docs/CONTENT_GUIDE.md):
 * nunca inventar numero de pagina. Enquanto o PDF nao estiver disponivel no
 * ambiente, `paginaImpressa` e `paginaPdf` ficam `null` e `status` fica
 * `'referencia-pendente'`. Um numero de pagina errado e pior do que nenhum:
 * ele manda o estudante ler a pagina errada.
 */

/** `'confirmada'` exige paginas preenchidas; `'referencia-pendente'` exige `null`. */
export type StatusReferencia = 'confirmada' | 'referencia-pendente'

export type ReferenciaLivro = {
  /** Numero do capitulo na edicao em portugues (1 a 20 + apendices). */
  readonly capitulo: number
  /** Titulo do capitulo. A conferencia do titulo depende do indice do PDF. */
  readonly tituloCapitulo: string
  /**
   * NOSSA descricao do recorte proposto para esta unidade. Nao e citacao do
   * livro: o livro e fonte de estudo, nao texto a ser reproduzido.
   */
  readonly recorteProposto: string
  /** Pagina da edicao impressa. `null` = nao verificada. */
  readonly paginaImpressa: number | null
  /** Pagina no arquivo PDF usado. `null` = nao verificada. */
  readonly paginaPdf: number | null
  readonly status: StatusReferencia
}

/**
 * Verdadeiro se a referencia esta coerente:
 *  - `'confirmada'` exige as duas paginas preenchidas;
 *  - `'referencia-pendente'` exige as duas paginas nulas.
 *
 * Pagina impressa e pagina de PDF sao coisas diferentes: o deslocamento entre
 * elas nao e constante e nao pode ser presumido.
 */
export function referenciaEstaCoerente(referencia: ReferenciaLivro): boolean {
  const temAsDuasPaginas =
    referencia.paginaImpressa !== null && referencia.paginaPdf !== null
  const naoTemPaginaNenhuma =
    referencia.paginaImpressa === null && referencia.paginaPdf === null

  return referencia.status === 'confirmada' ? temAsDuasPaginas : naoTemPaginaNenhuma
}

/** Texto de exibicao da referencia. Mostra "referencia pendente" quando for o caso. */
export function descreverReferencia(referencia: ReferenciaLivro): string {
  const base = `Cap. ${referencia.capitulo} - ${referencia.tituloCapitulo}`
  if (referencia.status === 'confirmada') {
    return `${base} (pagina ${referencia.paginaImpressa})`
  }
  return `${base} (pagina: referencia pendente)`
}
