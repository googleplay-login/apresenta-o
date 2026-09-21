import type { ReactNode } from 'react'

type Props = {
  readonly titulo: string
  /** Linha curta em maiusculas pequenas, como no letreiro das referencias. */
  readonly sobretitulo?: string
  readonly children: ReactNode
}

/**
 * Painel creme de leitura. Vem da referencia visual: fundo creme, borda fina,
 * raio medio, sombra baixa. Nao tem estado nem interacao de propositio nesta
 * etapa.
 */
export function Cartao({ titulo, sobretitulo, children }: Props) {
  return (
    <section className="cartao">
      {sobretitulo ? <p className="cartao__sobretitulo">{sobretitulo}</p> : null}
      <h2 className="cartao__titulo">{titulo}</h2>
      {children}
    </section>
  )
}
