import { useId, useRef } from 'react'
import type { ConteudoDaUnidade } from '../../content/tiposDeConteudo'
import type { Resposta } from '../../learning/avaliacao'
import {
  AVISO_DE_HONESTIDADE,
  acertosMinimos,
  numerosEmBranco,
  respostasCompletas,
  textoDePendencias,
} from '../../learning/avaliacao'

/**
 * Passo 4 do ciclo: a avaliação.
 *
 * Detalhes que a interface garante, e que dependem das regras do domínio:
 *
 *  - **toda pergunta precisa de resposta** antes do envio. O botão fica
 *    desabilitado, e a tela diz **quais** perguntas faltam — não só quantas — e
 *    leva o foco até a pergunta quando a pessoa pede;
 *  - a resposta pode ser trocada quantas vezes quiser, **até** o envio;
 *  - nada é corrigido antes do envio: nem acerto, nem erro, nem dica de qual
 *    alternativa está certa;
 *  - depois do envio, as respostas ficam travadas — corrigir só depois de
 *    enviar é a regra combinada;
 *  - o aviso de honestidade aparece **antes** das perguntas, e não escondido no
 *    rodapé: a correção roda no cliente e não é antifraude (D-036).
 *
 * O texto das mensagens sai de `learning/avaliacao.ts`, e não daqui: contagem,
 * plural e números vêm da mesma função que a correção usa.
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
  const completo = respostasCompletas(respostas)
  const numerosPendentes = numerosEmBranco(respostas)
  const idDaPendencia = useId()

  /**
   * Um foco por pergunta, para o botão "Responder a pergunta N" levar o teclado
   * até lá. Sem isso, quem navega por teclado teria de atravessar a avaliação
   * inteira para achar o que ficou em branco.
   */
  const focos = useRef<Array<HTMLInputElement | null>>([])

  const total = conteudo.perguntas.length
  const minimo = acertosMinimos(total)

  return (
    <div className="passo">
      <h3 className="passo__titulo">Avaliação</h3>

      <p className="passo__aviso">
        São {total} perguntas: {minimo} acertos já aprovam. O resultado na tela nunca é
        arredondado para cima.
      </p>

      <p className="honestidade">{AVISO_DE_HONESTIDADE}</p>

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
                    ref={(elemento) => {
                      // Só o primeiro radio da pergunta recebe o foco de resgate.
                      if (indiceDaAlternativa === 0) {
                        focos.current[indiceDaPergunta] = elemento
                      }
                    }}
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
          <button
            type="button"
            className="botao botao--principal"
            onClick={aoEnviar}
            disabled={!completo}
            aria-describedby={idDaPendencia}
          >
            Enviar respostas
          </button>

          <p id={idDaPendencia} className="envio__estado" role="status">
            {textoDePendencias(respostas)}
          </p>

          {numerosPendentes.length === 0 ? null : (
            <ul className="envio__pendencias">
              {numerosPendentes.map((numero) => (
                <li key={numero}>
                  <button
                    type="button"
                    className="botao botao--pequeno"
                    onClick={() => focos.current[numero - 1]?.focus()}
                  >
                    Responder a pergunta {numero}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
