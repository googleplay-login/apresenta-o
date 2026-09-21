import type { Bloco, ConteudoDaUnidade } from '../../content/tiposDeConteudo'
import type { ReferenciaLivro } from '../../content/referenciaLivro'
import { DiagramaDaExplicacao } from './DiagramaDaExplicacao'
import { LeituraDaUnidade } from './LeituraDaUnidade'

/**
 * Passo 2 do ciclo: o estudo — em duas metades, na ordem em que se estuda.
 *
 * **Primeiro a leitura no livro**, com o que procurar lá e o que fazer se o
 * livro não estiver à mão. **Depois a explicação original**, que é onde o
 * assunto é explicado com o nosso texto. A ordem importa: a leitura é o insumo,
 * e a explicação é a leitura já digerida — quem lê a explicação sem ter passado
 * pelo livro fica com a impressão de que aprendeu, e quem passa pelo livro antes
 * reconhece na explicação aquilo que já viu.
 *
 * Cada tipo de bloco da explicação tem um desenho próprio. O aviso de versão
 * existe para dizer, sem rodeios, onde o livro de 2016 ficou desatualizado — e
 * para deixar claro que, em 2016, aquilo estava certo.
 */
type Props = {
  readonly conteudo: ConteudoDaUnidade
  readonly referencia: ReferenciaLivro | null
  readonly leituraFeita: boolean
  readonly aoMarcarLeitura: (feita: boolean) => void
}

export function EstudoDaUnidade({
  conteudo,
  referencia,
  leituraFeita,
  aoMarcarLeitura,
}: Props) {
  return (
    <div className="passo">
      <LeituraDaUnidade
        conteudo={conteudo}
        referencia={referencia}
        leituraFeita={leituraFeita}
        aoMarcarLeitura={aoMarcarLeitura}
      />

      <section className="entendendo" aria-label="Explicação original">
        <h3 className="passo__titulo">2. Entender do nosso jeito</h3>
        {conteudo.explicacao.map((bloco, indice) => (
          <BlocoDaExplicacao key={`${bloco.tipo}-${indice}`} bloco={bloco} />
        ))}
      </section>
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
          {bloco.naoRodaNoConsole === undefined ? null : (
            <p className="explicacao__aviso-do-console" role="note">
              No console desta ilha: {bloco.naoRodaNoConsole}
            </p>
          )}
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

    case 'diagrama':
      return (
        <DiagramaDaExplicacao
          titulo={bloco.titulo}
          descricao={bloco.descricao}
          partes={bloco.partes}
          espacosVisiveis={bloco.espacosVisiveis}
        />
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
