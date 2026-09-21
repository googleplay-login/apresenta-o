import type { ConteudoDaUnidade } from '../../content/tiposDeConteudo'

/**
 * Passo 1 do ciclo: a missão.
 *
 * Diz o que o estudante vai saber fazer ao final e onde fica a parte do livro
 * que sustenta o estudo. A leitura completa — o que procurar lá e o marcador —
 * mora no passo Estudo, que é onde ela acontece; aqui fica só o endereço dela e
 * o caminho para chegar.
 *
 * Sem número de página: a referência está pendente (D-010), e inventar um número
 * seria pior do que não ter.
 */
export function MissaoDaUnidade({
  conteudo,
  aoIrParaEstudo,
}: {
  readonly conteudo: ConteudoDaUnidade
  readonly aoIrParaEstudo: () => void
}) {
  return (
    <div className="passo">
      <h3 className="passo__titulo">Sua missão nesta ilha</h3>
      <p className="passo__missao">{conteudo.missao}</p>

      <section className="leitura leitura--resumo">
        <h4 className="leitura__titulo">A leitura desta ilha</h4>
        <p className="leitura__parte">{conteudo.leitura.parte}</p>
        <p className="leitura__nota">
          O que procurar nessa leitura, o caminho para quem está sem o livro e o marcador de onde
          você parou ficam no passo <strong>Estudo</strong> — junto com a explicação original.
        </p>
        <button type="button" className="botao botao--pequeno" onClick={aoIrParaEstudo}>
          Ir para o Estudo
        </button>
      </section>
    </div>
  )
}
