import { useEffect, useRef } from 'react'
import type { ConteudoDaUnidade } from '../../content/tiposDeConteudo'
import type { Resposta, ResultadoDeAvaliacao } from '../../learning/avaliacao'
import { descreverNota, foiAprovado, textoDoPlacar } from '../../learning/avaliacao'

/**
 * Passo 5 do ciclo: o resultado.
 *
 * A nota é mostrada como fração exata e como percentual arredondado **para
 * baixo**: 4 de 5 aparece como "4 de 5 acertos (80%)", e o texto nunca diz que
 * passou quando não passou.
 *
 * Reprovar não bloqueia nada: a ilha continua aberta, o estudo continua
 * acessível e a ponte para a próxima só espera a aprovação. É por isso que a
 * tela de reprovação não tem tom de castigo.
 *
 * Duas decisões desta tela merecem registro:
 *
 *  - **a explicação aparece em todas as perguntas**, certas e erradas (D-036).
 *    Quem acertou por sorte é quem mais precisa dela, e esconder a explicação de
 *    quem acertou trata acerto como fim, não como parte do aprendizado;
 *  - a revisão mostra **o que a pessoa marcou**, e não só que errou. Sem isso,
 *    quem errou precisa lembrar de memória o que escolheu para entender o erro.
 *
 * O foco vai para o anúncio da nota quando o resultado aparece: a tela inteira
 * mudou por causa de um clique, e quem usa leitor de tela precisa ouvir isso.
 */

type Props = {
  readonly conteudo: ConteudoDaUnidade
  readonly respostas: readonly Resposta[]
  readonly resultado: ResultadoDeAvaliacao
  readonly aprovadaAntes: boolean
  /** Quantas tentativas esta unidade já teve, contando esta. */
  readonly tentativas: number
  /** Melhor nota guardada, já contando esta tentativa. */
  readonly melhorNota: ResultadoDeAvaliacao
  readonly aoRefazer: () => void
  readonly aoVoltarAoEstudo: () => void
  readonly aoSeguir: () => void
  readonly temProxima: boolean
}

export function ResultadoDaUnidade({
  conteudo,
  respostas,
  resultado,
  aprovadaAntes,
  tentativas,
  melhorNota,
  aoRefazer,
  aoVoltarAoEstudo,
  aoSeguir,
  temProxima,
}: Props) {
  const aprovado = foiAprovado(resultado)
  const titulo = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    titulo.current?.focus()
  }, [])

  return (
    <div className="passo">
      <h3 className="passo__titulo" ref={titulo} tabIndex={-1}>
        {aprovado ? 'Aprovado nesta ilha' : 'Ainda não foi desta vez'}
      </h3>

      <p className="resultado__nota" role="status">
        {descreverNota(resultado)}
      </p>

      <p className="resultado__placar">{textoDoPlacar(tentativas, melhorNota, resultado)}</p>

      <p className="resultado__texto">
        {aprovado
          ? aprovadaAntes
            ? 'Você já havia aprovado esta ilha — a nova tentativa não tirou nada do que já valia.'
            : temProxima
              ? 'A ponte para a próxima ilha está inteira. A ilha continua disponível para revisão.'
              : // A última ilha não tem ponte para lugar nenhum: prometer uma seria mentira.
                'Esta é a última ilha escrita até agora, e não há ponte saindo dela. As próximas unidades entram conforme o conteúdo for escrito — e o que você já aprovou continua valendo.'
          : 'Nada foi bloqueado: a ilha continua aberta, o estudo segue à mão e você pode refazer a avaliação quantas vezes quiser.'}
      </p>

      <section className="revisao">
        <h4 className="revisao__titulo">O que cada pergunta queria</h4>
        <ol className="revisao__lista">
          {conteudo.perguntas.map((pergunta, indice) => {
            const marcada = respostas[indice] ?? null
            const certa = marcada === pergunta.correta
            const respostaCerta = pergunta.alternativas[pergunta.correta] ?? ''
            const respostaMarcada = marcada === null ? null : (pergunta.alternativas[marcada] ?? null)

            return (
              <li
                key={pergunta.id}
                className={certa ? 'revisao__item revisao__item--certa' : 'revisao__item revisao__item--errada'}
              >
                <p className="revisao__enunciado">
                  {indice + 1}. {pergunta.enunciado}
                </p>
                <p className="revisao__marca">
                  {certa ? (
                    <>Você acertou.</>
                  ) : respostaMarcada === null ? (
                    <>
                      Esta ficou em branco. A resposta certa é: <strong>{respostaCerta}</strong>
                    </>
                  ) : (
                    <>
                      Você marcou <strong>{respostaMarcada}</strong>. A resposta certa é:{' '}
                      <strong>{respostaCerta}</strong>
                    </>
                  )}
                </p>
                <p className="revisao__explicacao">{pergunta.explicacao}</p>
              </li>
            )
          })}
        </ol>
      </section>

      <div className="resultado__acoes">
        <button type="button" className="botao" onClick={aoVoltarAoEstudo}>
          Rever o estudo
        </button>
        <button type="button" className="botao" onClick={aoRefazer}>
          Refazer a avaliação
        </button>
        {aprovado && temProxima ? (
          <button type="button" className="botao botao--principal" onClick={aoSeguir}>
            Seguir para a próxima ilha
          </button>
        ) : null}
      </div>
    </div>
  )
}
