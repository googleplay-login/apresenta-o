import type { ReactNode } from 'react'

type Props = {
  readonly titulo: string
  /** Linha curta em maiúsculas pequenas, como no letreiro das referências. */
  readonly sobretitulo?: string
  readonly children: ReactNode
}

/**
 * Painel creme de leitura. Vem da referência visual: fundo creme, borda fina,
 * raio médio, sombra baixa. Não tem estado nem interação própria.
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
