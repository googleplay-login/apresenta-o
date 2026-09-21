import type { Exercicio } from '../../content/tiposDeConteudo'

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
 */

type Props = {
  readonly exercicios: readonly Exercicio[]
}

export function PraticaDaUnidade({ exercicios }: Props) {
  return (
    <div className="passo">
      <h3 className="passo__titulo">Prática</h3>
      <p className="passo__aviso">
        Estes exercícios são escritos por você, no seu Python. A conferência abaixo diz o que
        observar no resultado — a correção automática só entra quando o ambiente de execução
        de Python estiver montado e testado.
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
            </details>
          </li>
        ))}
      </ol>
    </div>
  )
}
