import { useCallback, useState } from 'react'
import type { Exercicio } from '../../content/tiposDeConteudo'
import {
  resumoDaConferencia,
  type ResultadoDaConferencia,
} from '../../learning/correcaoDeExercicio'
import type { Python } from '../../python/usePython'
import { ConsoleDoPython, ID_DO_CONSOLE } from './ConsoleDoPython'

/**
 * Passo 3 do ciclo: a prática.
 *
 * Cada exercício pede código escrito pelo próprio estudante. Três coisas mudaram
 * nesta aba quando a conferência automática chegou:
 *
 *  - o exercício diz **como conferir**, e não mais "depois a correção chega": o
 *    console roda o programa com a sonda da correção e compara o resultado com o
 *    que o enunciado pede (D-044);
 *  - a conferência **não é nota e não aprova ilha**. Quem aprova é a avaliação,
 *    com as perguntas — e isso está escrito na tela, porque um selo de
 *    "conferido" ao lado de um cartão costuma ser lido como aprovação;
 *  - o que a conferência **não** julga aparece junto do resultado. Correção que
 *    não diz o próprio limite é promessa, e promessa a gente não faz.
 *
 * A solução continua fechada até o estudante abrir: tentar antes de ver é o que
 * faz o exercício valer alguma coisa.
 */

type Props = {
  readonly exercicios: readonly Exercicio[]
  /**
   * Exercícios já conferidos com tudo certo, vindos do progresso guardado.
   *
   * Chegam de fora, e não de um estado local, por um motivo concreto: recarregar
   * a página não pode apagar o que a pessoa já conquistou. O estado local deste
   * componente guarda só o **resultado da conferência nesta visita** — o
   * detalhe item por item, que não vai para disco (D-046).
   */
  readonly conferidos?: readonly string[]
  /** Avisa o progresso de que este exercício foi conferido com tudo certo. */
  readonly aoMarcarExercicio?: (exercicioId: string) => void
  /**
   * Interpretador de Python, para o teste poder injetar um de mentira.
   *
   * Em produção ninguém passa nada: o console usa o gancho real, que fala com o
   * Web Worker. É o mesmo recurso de `ConsoleDoPython`, e existe porque rodar
   * Python de verdade dentro do jsdom não é possível (o interpretador é WebAssembly
   * e precisa de um Worker).
   */
  readonly python?: Python
}

export function PraticaDaUnidade({
  exercicios,
  conferidos = [],
  aoMarcarExercicio,
  python,
}: Props) {
  const [escolhido, setEscolhido] = useState<string | null>(null)
  const [conferencias, setConferencias] = useState<
    Readonly<Record<string, ResultadoDaConferencia>>
  >({})

  const guardarConferencia = useCallback(
    (exercicioId: string, resultado: ResultadoDaConferencia) => {
      setConferencias((atuais) =>
        atuais[exercicioId] === resultado ? atuais : { ...atuais, [exercicioId]: resultado },
      )

      // Só o resultado *tudo confere* vira conquista guardada. "Não deu para
      // conferir" não é conquista, e "ainda não confere" é caminho — guardar
      // qualquer um dos dois faria o selo mentir sobre o que aconteceu.
      if (resultado.situacao === 'deuCerto') {
        aoMarcarExercicio?.(exercicioId)
      }
    },
    [aoMarcarExercicio],
  )

  const irParaOConsole = (exercicioId: string) => {
    setEscolhido(exercicioId)

    // O console fica no fim da aba. Levar a pessoa até lá é o gesto que ela
    // espera de um botão que diz "escrever e conferir" — e a rolagem é pedida
    // só se o ambiente souber rolar (em teste, não sabe).
    const consoleDaIlha = document.getElementById(ID_DO_CONSOLE)
    if (typeof consoleDaIlha?.scrollIntoView === 'function') {
      consoleDaIlha.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="passo">
      <h3 className="passo__titulo">Prática</h3>
      <p className="passo__aviso">
        Estes exercícios são escritos por você. O <strong>console</strong> no fim desta aba roda
        Python de verdade, aqui dentro, e confere o que você escreveu quando o exercício tem como
        ser conferido. A conferência olha o resultado do programa — ela não é nota e não aprova a
        ilha: quem aprova é a avaliação, com as perguntas.
      </p>

      <ol className="exercicios">
        {exercicios.map((exercicio, indice) => {
          const conferencia = conferencias[exercicio.id]
          const jaConferido = conferidos.includes(exercicio.id)

          return (
            <li key={exercicio.id} className="exercicio">
              <h4 className="exercicio__titulo">Exercício {indice + 1}</h4>
              <p className="exercicio__enunciado">{exercicio.enunciado}</p>

              {exercicio.dica ? (
                <details className="exercicio__detalhe">
                  <summary>Uma dica, se travar</summary>
                  <p>{exercicio.dica}</p>
                </details>
              ) : null}

              <p className="exercicio__conferencia">
                <strong>Como saber que deu certo:</strong> {exercicio.conferencia}
              </p>

              {conferencia === undefined ? null : (
                <p
                  className={`exercicio__resultado exercicio__resultado--${conferencia.situacao}`}
                  role="status"
                >
                  <strong>{resumoDaConferencia(conferencia)}</strong> — o detalhe de cada item
                  está na conferência, dentro do console.
                </p>
              )}

              {jaConferido ? (
                <p className="exercicio__conferido" role="note">
                  <strong>Conferido</strong> — este resultado está guardado no seu progresso. Guardar
                  não aprova a ilha: quem aprova é a avaliação, com as perguntas.
                </p>
              ) : null}

              {exercicio.correcao === undefined ? (
                <p className="exercicio__aviso-do-console" role="note">
                  Este exercício não tem conferência automática aqui
                  {exercicio.naoRodaNoConsole === undefined ? '.' : `. ${exercicio.naoRodaNoConsole}`}
                </p>
              ) : (
                <p className="exercicio__acoes">
                  <button
                    type="button"
                    className="botao botao--pequeno"
                    onClick={() => irParaOConsole(exercicio.id)}
                  >
                    Escrever e conferir no console
                  </button>
                </p>
              )}

              <details className="exercicio__detalhe">
                <summary>Ver uma solução possível</summary>
                <pre>
                  <code>{exercicio.solucao}</code>
                </pre>
                <p className="exercicio__nota">
                  Existe mais de um jeito certo. Se o seu resultado confere, ele vale.
                </p>
                {exercicio.solucaoQueRodaNoConsole === undefined ? null : (
                  <>
                    <p className="exercicio__nota">
                      A mesma solução, sem o que o console da ilha não tem — para rodar aqui:
                    </p>
                    <pre>
                      <code>{exercicio.solucaoQueRodaNoConsole}</code>
                    </pre>
                  </>
                )}
                {exercicio.naoRodaNoConsole === undefined ? null : (
                  <p className="exercicio__aviso-do-console" role="note">
                    No console desta ilha: {exercicio.naoRodaNoConsole}
                  </p>
                )}
              </details>
            </li>
          )
        })}
      </ol>

      <ConsoleDoPython
        python={python}
        exercicios={exercicios}
        exercicioEscolhido={escolhido}
        aoEscolherExercicio={setEscolhido}
        aoConferir={guardarConferencia}
        sugestoes={exercicios.map((exercicio, indice) => ({
          titulo: `Usar a solução do exercício ${indice + 1}`,
          codigo: exercicio.solucaoQueRodaNoConsole ?? exercicio.solucao,
        }))}
      />
    </div>
  )
}
