import type { ConteudoDaUnidade } from '../../content/tiposDeConteudo'
import type { Resposta } from '../../learning/avaliacao'
import { contarEmBranco, respostasCompletas } from '../../learning/avaliacao'

/**
 * Passo 4 do ciclo: a avaliação.
 *
 * Detalhes que a interface garante, e que dependem das regras do domínio:
 *
 *  - **toda pergunta precisa de resposta** antes do envio. O botão fica
 *    desabilitado e a tela diz quantas faltam;
 *  - a resposta pode ser trocada quantas vezes quiser, **até** o envio;
 *  - nada é corrigido antes do envio: nem acerto, nem erro, nem dica de qual
 *    alternativa está certa;
 *  - depois do envio, as respostas ficam travadas — corrigir só depois de
 *    enviar é a regra combinada.
 */

type Props = {
  readonly conteudo: ConteudoDaUnidade
  readonly respostas: readonly Resposta[]
  readonly enviado: boolean
  readonly aoResponder: (indice: number, alternativa: number) => void
  readonly aoEnviar: () => void
}

export function AvaliacaoDaUnidade({
  conteudo,
  respostas,
  enviado,
  aoResponder,
  aoEnviar,
}: Props) {
  const faltam = contarEmBranco(respostas)
  const completo = respostasCompletas(respostas)

  return (
    <div className="passo">
      <h3 className="passo__titulo">Avaliação</h3>
      <p className="passo__aviso">
        São {conteudo.perguntas.length} perguntas e você pode errar uma: o mínimo para aprovar é
        80% de acertos reais. O resultado não é arredondado para cima na tela.
      </p>

      <ol className="perguntas">
        {conteudo.perguntas.map((pergunta, indiceDaPergunta) => (
          <li key={pergunta.id} className="pergunta">
            <fieldset className="pergunta__campo" disabled={enviado}>
              <legend className="pergunta__enunciado">
                {indiceDaPergunta + 1}. {pergunta.enunciado}
              </legend>
              {pergunta.alternativas.map((alternativa, indiceDaAlternativa) => (
                <label key={alternativa} className="pergunta__alternativa">
                  <input
                    type="radio"
                    name={pergunta.id}
                    checked={respostas[indiceDaPergunta] === indiceDaAlternativa}
                    onChange={() => aoResponder(indiceDaPergunta, indiceDaAlternativa)}
                  />
                  <span>{alternativa}</span>
                </label>
              ))}
            </fieldset>
          </li>
        ))}
      </ol>

      {enviado ? null : (
        <div className="envio">
          <button type="button" className="botao botao--principal" onClick={aoEnviar} disabled={!completo}>
            Enviar respostas
          </button>
          <p className="envio__estado" role="status">
            {completo
              ? 'Todas as perguntas estão respondidas. Confira antes de enviar: depois do envio não dá para voltar.'
              : `Faltam ${faltam} ${faltam === 1 ? 'pergunta' : 'perguntas'} para responder.`}
          </p>
        </div>
      )}
    </div>
  )
}
