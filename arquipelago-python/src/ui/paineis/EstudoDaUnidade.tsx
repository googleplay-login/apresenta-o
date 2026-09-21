import type { Bloco, ConteudoDaUnidade } from '../../content/tiposDeConteudo'

/**
 * Passo 2 do ciclo: o estudo.
 *
 * Desenha os blocos da explicação na ordem em que foram escritos. Cada tipo de
 * bloco tem um desenho próprio, e o aviso de versão tem um só: ele existe para
 * dizer, sem rodeios, onde o livro de 2016 ficou desatualizado — e para deixar
 * claro que, em 2016, aquilo estava certo.
 */
export function EstudoDaUnidade({ conteudo }: { readonly conteudo: ConteudoDaUnidade }) {
  return (
    <div className="passo">
      <h3 className="passo__titulo">Entendendo</h3>
      {conteudo.explicacao.map((bloco, indice) => (
        <BlocoDaExplicacao key={`${bloco.tipo}-${indice}`} bloco={bloco} />
      ))}
    </div>
  )
}

function BlocoDaExplicacao({ bloco }: { readonly bloco: Bloco }) {
  switch (bloco.tipo) {
    case 'paragrafo':
      return <p className="explicacao__paragrafo">{bloco.texto}</p>

    case 'codigo':
      return (
        <figure className="explicacao__codigo">
          <pre>
            <code className={`linguagem-${bloco.linguagem}`}>{bloco.codigo}</code>
          </pre>
          {bloco.legenda ? <figcaption>{bloco.legenda}</figcaption> : null}
        </figure>
      )

    case 'destaque':
      return (
        <aside className="explicacao__destaque">
          <h4>{bloco.titulo}</h4>
          <p>{bloco.texto}</p>
        </aside>
      )

    case 'avisoDeVersao':
      return (
        <aside className="explicacao__aviso">
          <h4>{bloco.titulo}</h4>
          <p>{bloco.texto}</p>
        </aside>
      )

    case 'lista':
      return (
        <div className="explicacao__lista">
          {bloco.titulo ? <h4>{bloco.titulo}</h4> : null}
          <ul>
            {bloco.itens.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )

    default:
      return null
  }
}
