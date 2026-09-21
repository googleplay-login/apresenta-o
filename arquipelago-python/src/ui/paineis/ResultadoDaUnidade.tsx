import type { ConteudoDaUnidade } from '../../content/tiposDeConteudo'
import type { Resposta, ResultadoDeAvaliacao } from '../../learning/avaliacao'
import { descreverNota, foiAprovado } from '../../learning/avaliacao'

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
 */

type Props = {
  readonly conteudo: ConteudoDaUnidade
  readonly respostas: readonly Resposta[]
  readonly resultado: ResultadoDeAvaliacao
  readonly aprovadaAntes: boolean
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
  aoRefazer,
  aoVoltarAoEstudo,
  aoSeguir,
  temProxima,
}: Props) {
  const aprovado = foiAprovado(resultado)

  return (
    <div className="passo">
      <h3 className="passo__titulo">{aprovado ? 'Aprovado nesta ilha' : 'Ainda não foi desta vez'}</h3>

      <p className="resultado__nota" role="status">
        {descreverNota(resultado)}
      </p>

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
            const resposta = respostas[indice] ?? null
            const certa = resposta === pergunta.correta
            return (
              <li key={pergunta.id} className={certa ? 'revisao__item revisao__item--certa' : 'revisao__item revisao__item--errada'}>
                <p className="revisao__enunciado">
                  {indice + 1}. {pergunta.enunciado}
                </p>
                <p className="revisao__marca">
                  {certa ? 'Você acertou' : 'Você errou'} — a resposta certa é:{' '}
                  <strong>{pergunta.alternativas[pergunta.correta]}</strong>
                </p>
                {certa ? null : (
                  <p className="revisao__explicacao">{pergunta.explicacao}</p>
                )}
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
