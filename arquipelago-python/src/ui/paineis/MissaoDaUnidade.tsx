import type { ConteudoDaUnidade } from '../../content/tiposDeConteudo'

/**
 * Passo 1 do ciclo: a missão.
 *
 * Diz o que o estudante vai saber fazer ao final e qual parte do livro sustenta
 * esse estudo. Sem números de página: a referência de página está marcada como
 * pendente (`docs/BOOK_MAP.md`), e inventar um número seria pior do que não ter.
 */
export function MissaoDaUnidade({ conteudo }: { readonly conteudo: ConteudoDaUnidade }) {
  return (
    <div className="passo">
      <h3 className="passo__titulo">Sua missão nesta ilha</h3>
      <p className="passo__missao">{conteudo.missao}</p>

      <section className="leitura">
        <h4 className="leitura__titulo">O que ler no livro</h4>
        <p className="leitura__parte">{conteudo.leitura.parte}</p>
        <p className="leitura__porque">{conteudo.leitura.porque}</p>
        <p className="leitura__nota">
          A referência de página está pendente: o livro ainda não pôde ser conferido página a
          página, e a numeração impressa não é a mesma do arquivo digital. Por isso a leitura é
          indicada pela parte do capítulo, e não por página.
        </p>
      </section>
    </div>
  )
}
