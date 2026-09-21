import { useEffect, useId, useRef, useState } from 'react'
import { usePython, type Python } from '../../python/usePython'
import { LIMITE_DE_CARACTERES } from '../../python/protocolo'
import {
  conferirExercicio,
  programaDaConferencia,
  resumoDaConferencia,
  type ResultadoDaConferencia,
  type SituacaoDaConferencia,
} from '../../learning/correcaoDeExercicio'
import type { Exercicio } from '../../content/tiposDeConteudo'

/**
 * O console de Python da ilha: escrever, rodar, ver o que aconteceu.
 *
 * Quatro decisões que não são estética:
 *
 *  - **nada é carregado antes de a pessoa pedir.** O interpretador é grande; a
 *    tela abre com um botão que diz o que vai acontecer, e informa o tamanho
 *    aproximado, em vez de baixar 14 MB de surpresa em quem só queria ler a
 *    lição (D-040);
 *  - **a mensagem de erro aparece inteira.** O texto é a mensagem literal do
 *    Python, com o traceback: ler mensagem de erro é parte de aprender a
 *    programar, e reescrevê-la para parecer amigável tira justamente a
 *    informação de que a pessoa precisa para se virar sozinha (D-042);
 *  - **diz o que isto não é.** O console avisa que o código roda neste navegador,
 *    que não é uma caixa à prova de fuga e que o ambiente não é o mesmo do
 *    computador da pessoa — quem aprender `input()` aqui vai precisar do
 *    interpretador instalado para usar de verdade (D-041);
 *  - **a conferência do exercício é uma medida, e não uma nota.** Ela diz o que
 *    olhou, o que veio e **o que não julga**; o veredito é sobre o programa que
 *    rodou, e o campo de código continua sendo da pessoa (D-044).
 *
 * O botão de recomeçar existe porque um laço infinito não tem como ser
 * interrompido de dentro: descartar o trabalhador descarta o programa travado.
 */

type Props = {
  /** Sugestões de código, normalmente as soluções dos exercícios da unidade. */
  readonly sugestoes?: readonly { readonly titulo: string; readonly codigo: string }[]
  /**
   * O interpretador, injetado. Existe para o teste poder conferir cada estado da
   * tela — carregando, pronto, falhado — sem precisar de um navegador de verdade
   * com Web Worker. Em produção, quem manda é `usePython()`.
   */
  readonly python?: Python
  /**
   * Os exercícios da unidade. Com eles, o console passa a oferecer a conferência:
   * o código digitado pode ser rodado **como resposta** de um deles, com a sonda
   * da correção junto (D-045).
   */
  readonly exercicios?: readonly Exercicio[]
  /** Qual exercício está escolhido para conferir. `null` = nenhum, só rodar. */
  readonly exercicioEscolhido?: string | null
  readonly aoEscolherExercicio?: (exercicioId: string | null) => void
  /** Avisa a aba Prática do resultado de cada conferência, para o cartão de lá. */
  readonly aoConferir?: (exercicioId: string, resultado: ResultadoDaConferencia) => void
}

/** Onde o console fica, para quem quiser pular direto para cá. */
export const ID_DO_CONSOLE = 'console-de-python'

const ROTULO_DA_SITUACAO: Record<SituacaoDaConferencia, string> = {
  deuCerto: 'confere',
  naoConfere: 'não confere',
  naoDeuParaConferir: 'não conferido',
}

export function ConsoleDoPython({
  sugestoes = [],
  python: injetado,
  exercicios = [],
  exercicioEscolhido = null,
  aoEscolherExercicio,
  aoConferir,
}: Props) {
  const doGancho = usePython()
  const python = injetado ?? doGancho
  const [codigo, setCodigo] = useState('')
  const [recusa, setRecusa] = useState<string | null>(null)
  const [pendente, setPendente] = useState<{ readonly exercicioId: string; readonly programa: string } | null>(
    null,
  )
  const [conferencia, setConferencia] = useState<{
    readonly exercicioId: string
    readonly resultado: ResultadoDaConferencia
  } | null>(null)
  const idDoCampo = useId()
  const idDaSaida = useId()
  const idDaEscolha = useId()
  const campo = useRef<HTMLTextAreaElement>(null)

  const exercicioParaConferir =
    exercicios.find((candidato) => candidato.id === exercicioEscolhido) ?? null
  const podeConferir = exercicioParaConferir?.correcao !== undefined

  // Quando a execução que estava pendente chega, ela vira veredito. O programa é
  // reconhecido pelo próprio texto enviado: se outra execução passou na frente,
  // nada é concluído a partir dela.
  useEffect(() => {
    if (pendente === null || python.ultima === null) {
      return
    }
    if (python.ultima.codigo !== pendente.programa) {
      return
    }

    const dono = exercicios.find((candidato) => candidato.id === pendente.exercicioId)
    if (dono?.correcao === undefined) {
      return
    }

    const resultado = conferirExercicio(dono.correcao, python.ultima)
    setPendente(null)
    setConferencia({ exercicioId: dono.id, resultado })
    aoConferir?.(dono.id, resultado)
  }, [aoConferir, exercicios, pendente, python.ultima])

  const rodar = () => {
    setConferencia(null)
    const motivo = python.executar(codigo)
    setRecusa(motivo)
  }

  const conferir = () => {
    if (exercicioParaConferir?.correcao === undefined) {
      return
    }

    // A sonda vai junto com o programa: uma execução só, com o mesmo estado das
    // variáveis — que é o único jeito de medir o que o programa deixou guardado.
    const programa = programaDaConferencia(codigo, exercicioParaConferir.correcao)
    setConferencia(null)

    const motivo = python.executar(programa)
    setRecusa(motivo)
    setPendente(motivo === null ? { exercicioId: exercicioParaConferir.id, programa } : null)
  }

  const carregarInterpretador = () => {
    setRecusa(null)
    python.carregar()
  }

  const quantosExercicios = exercicios.length
  const numeroDoExercicio = (id: string) => exercicios.findIndex((item) => item.id === id) + 1
  const comConferencia = exercicios.filter((item) => item.correcao !== undefined)

  return (
    <section className="console" aria-label="Console de Python" id={ID_DO_CONSOLE}>
      <h4 className="console__titulo">Console de Python</h4>
      <p className="console__texto">
        Escreva o código aqui e rode para ver o resultado na hora. O Python de verdade é
        carregado neste navegador, dentro de um processo separado — por isso a tela não trava
        enquanto o seu programa roda.
      </p>

      <p className="console__aviso">
        <strong>O que isto não é:</strong> não é uma caixa à prova de fuga, e não é o Python do
        seu computador. Nada do que você digitar aqui sai do seu navegador, e nenhum arquivo da
        sua máquina é alcançado — mas quem pede código de outra pessoa para rodar assume o risco.
        Aqui, o código é seu. Recursos que dependem do sistema, como ler arquivos ou pedir dados
        pelo teclado, não funcionam neste console.
      </p>

      {python.demorando ? (
        <p className="console__recusa" role="alert">
          O programa está demorando mais do que o esperado. Se ele entrou em um laço que não
          termina, não há como interrompê-lo de dentro do Python: clique em <strong>Recomeçar do
          zero</strong> para descartar este interpretador e começar outro limpo.
        </p>
      ) : null}

      {python.falha === null ? null : (
        <p className="console__falha" role="alert">
          Não foi possível carregar o Python: {python.falha}
        </p>
      )}

      <div className="console__controles">
        {python.estado === 'pronto' ? (
          <p className="console__estado" role="status">
            Python {python.versao} pronto, rodando neste navegador.
          </p>
        ) : (
          <button
            type="button"
            className="botao botao--principal"
            onClick={carregarInterpretador}
            disabled={python.carregando}
          >
            {python.carregando
              ? 'Carregando o Python…'
              : 'Ligar o Python (baixa cerca de 14 MB uma vez)'}
          </button>
        )}

        {python.estado === 'parado' ? (
          <p className="console__texto">
            O Python ainda não foi carregado: nada foi baixado até você clicar. Se o programa
            travar, o botão de recomeçar aparece aqui.
          </p>
        ) : null}

        {python.estado === 'parado' || python.estado === 'falhou' ? null : (
          <button type="button" className="botao botao--pequeno" onClick={python.reiniciar}>
            Recomeçar do zero
          </button>
        )}
      </div>

      {quantosExercicios === 0 || comConferencia.length === 0 ? null : (
        <div className="console__conferir">
          <label className="console__rotulo" htmlFor={idDaEscolha}>
            Conferir o programa como resposta de
          </label>
          <select
            id={idDaEscolha}
            className="console__escolha"
            value={exercicioEscolhido ?? ''}
            onChange={(evento) =>
              aoEscolherExercicio?.(evento.target.value === '' ? null : evento.target.value)
            }
          >
            <option value="">Nenhum exercício: só rodar</option>
            {comConferencia.map((item) => (
              <option key={item.id} value={item.id}>
                Exercício {numeroDoExercicio(item.id)}
              </option>
            ))}
          </select>
          <p className="console__ajuda">
            Escolhendo um exercício, o botão <strong>Rodar e conferir</strong> roda o seu código
            com uma sonda no fim e compara o resultado com o que o enunciado pede.
          </p>
        </div>
      )}

      <div className="console__campo">
        <label className="console__rotulo" htmlFor={idDoCampo}>
          Seu programa
        </label>
        <textarea
          id={idDoCampo}
          ref={campo}
          className="console__codigo"
          spellCheck={false}
          rows={8}
          value={codigo}
          placeholder={'nome = "Ilha"\nprint(f"Olá, {nome}!")'}
          maxLength={LIMITE_DE_CARACTERES}
          onChange={(evento) => setCodigo(evento.target.value)}
          onKeyDown={(evento) => {
            // Ctrl+Enter (ou Cmd+Enter) roda sem tirar a mão do teclado. A
            // instrução está escrita logo abaixo do campo.
            if (evento.key === 'Enter' && (evento.ctrlKey || evento.metaKey)) {
              evento.preventDefault()
              rodar()
            }
          }}
        />
        <p className="console__ajuda" id={`${idDoCampo}-ajuda`}>
          {codigo.length} de {LIMITE_DE_CARACTERES} caracteres. <kbd>Ctrl</kbd> + <kbd>Enter</kbd>{' '}
          roda o programa.
        </p>
      </div>

      {recusa === null ? null : (
        <p className="console__recusa" role="alert">
          {recusa}
        </p>
      )}

      <div className="console__acoes">
        <button
          type="button"
          className="botao botao--principal"
          onClick={rodar}
          disabled={python.estado === 'carregando'}
          aria-describedby={idDoCampo + '-ajuda'}
        >
          Rodar
        </button>
        {podeConferir ? (
          <button
            type="button"
            className="botao botao--principal"
            onClick={conferir}
            disabled={python.estado === 'carregando'}
          >
            Rodar e conferir
          </button>
        ) : null}
        <button type="button" className="botao" onClick={() => setCodigo('')}>
          Limpar o campo
        </button>
        {sugestoes.map((sugestao) => (
          <button
            key={sugestao.titulo}
            type="button"
            className="botao botao--pequeno"
            onClick={() => {
              setCodigo(sugestao.codigo)
              setRecusa(null)
              campo.current?.focus()
            }}
          >
            {sugestao.titulo}
          </button>
        ))}
      </div>

      <div className="console__saida" aria-live="polite" id={idDaSaida}>
        {python.ultima === null ? (
          <p className="console__texto">A saída do programa aparece aqui.</p>
        ) : (
          <>
            <p className="console__rotulo">
              {python.ultima.foiErro ? 'O Python parou com esta mensagem:' : 'Saída:'}
            </p>
            <pre
              className={
                python.ultima.foiErro ? 'console__resultado console__resultado--erro' : 'console__resultado'
              }
            >
              <code>
                {python.ultima.linhas.length === 0
                  ? '(o programa rodou sem imprimir nada)'
                  : python.ultima.linhas.join('\n')}
              </code>
            </pre>
            {python.ultima.foiErro ? (
              <p className="console__ajuda">
                Mensagem do próprio Python, sem reescrita. A última linha costuma dizer o que
                aconteceu; o resto mostra por onde ele passou.
              </p>
            ) : null}
          </>
        )}
      </div>

      {conferencia === null ? null : (
        <section
          className="conferencia"
          aria-label={`Conferência do exercício ${numeroDoExercicio(conferencia.exercicioId)}`}
        >
          <h5 className="conferencia__titulo">
            Conferência do exercício {numeroDoExercicio(conferencia.exercicioId)}
          </h5>
          <p
            className={`conferencia__situacao conferencia__situacao--${conferencia.resultado.situacao}`}
            role="status"
          >
            {resumoDaConferencia(conferencia.resultado)}
          </p>
          <p className="conferencia__explicacao">{conferencia.resultado.explicacao}</p>

          <ul className="conferencia__itens">
            {conferencia.resultado.itens.map((item, indice) => (
              <li
                key={`${item.rotulo}-${indice}`}
                className={`conferencia__item conferencia__item--${item.situacao}`}
              >
                <span className="conferencia__marca">{ROTULO_DA_SITUACAO[item.situacao]}</span>{' '}
                <strong className="conferencia__rotulo">{item.rotulo}</strong>{' '}
                <span className="conferencia__par">
                  esperado: <code>{item.esperado}</code>
                </span>{' '}
                <span className="conferencia__par">
                  veio: <code>{item.obtido}</code>
                </span>
              </li>
            ))}
          </ul>

          <p className="conferencia__limite">
            <strong>O que esta conferência não julga:</strong> {conferencia.resultado.limite}
          </p>
        </section>
      )}
    </section>
  )
}
