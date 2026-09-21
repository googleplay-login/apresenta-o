import type { Exercicio } from '../../content/tiposDeConteudo'
import { ConsoleDoPython } from './ConsoleDoPython'

/**
 * Passo 3 do ciclo: a prática.
 *
 * Cada exercício pede código escrito pelo próprio estudante, e a conferência é
 * feita por ele — o ambiente de execução de Python chega na etapa do Pyodide, e
 * a correção automática, depois dela. Enquanto isso não existe, o exercício diz
 * com o que comparar e como saber que deu certo, em vez de oferecer um botão
 * "verificar" que não verifica nada.
 *
 * A solução fica fechada até o estudante abrir: tentar antes de ver é o que faz
 * o exercício valer alguma coisa.
 *
 * Desde a Etapa 9 há um **console de Python** nesta mesma aba: quem não tem o
 * Python instalado na máquina pode escrever e rodar o exercício ali, sem sair da
 * ilha. Ele é carregado apenas quando a pessoa clica — e continua **sem** dizer
 * que corrige o exercício, porque corrigir é assunto da Etapa 10.
 */

type Props = {
  readonly exercicios: readonly Exercicio[]
}

export function PraticaDaUnidade({ exercicios }: Props) {
  return (
    <div className="passo">
      <h3 className="passo__titulo">Prática</h3>
      <p className="passo__aviso">
        Estes exercícios são escritos por você. A conferência abaixo diz o que observar no
        resultado. Se você não tem o Python instalado nesta máquina, use o console no fim desta
        aba: ele roda Python de verdade e mostra a saída na hora.
      </p>

      <ol className="exercicios">
        {exercicios.map((exercicio, indice) => (
          <li key={exercicio.id} className="exercicio">
            <h4 className="exercicio__titulo">
              Exercício {indice + 1}
            </h4>
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

            <details className="exercicio__detalhe">
              <summary>Ver uma solução possível</summary>
              <pre>
                <code>{exercicio.solucao}</code>
              </pre>
              <p className="exercicio__nota">
                Existe mais de um jeito certo. Se o seu resultado confere, ele vale.
              </p>
              {exercicio.naoRodaNoConsole === undefined ? null : (
                <p className="exercicio__aviso-do-console" role="note">
                  No console desta ilha: {exercicio.naoRodaNoConsole}
                </p>
              )}
            </details>
          </li>
        ))}
      </ol>

      <ConsoleDoPython
        sugestoes={exercicios.map((exercicio, indice) => ({
          titulo: `Usar a solução do exercício ${indice + 1}`,
          codigo: exercicio.solucao,
        }))}
      />
    </div>
  )
}
