import { useId, useRef, useState } from 'react'
import { usePython, type Python } from '../../python/usePython'
import { LIMITE_DE_CARACTERES } from '../../python/protocolo'

/**
 * O console de Python da ilha: escrever, rodar, ver o que aconteceu.
 *
 * Três decisões que não são estética:
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
 *    interpretador instalado para usar de verdade (D-041).
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
}

export function ConsoleDoPython({ sugestoes = [], python: injetado }: Props) {
  const doGancho = usePython()
  const python = injetado ?? doGancho
  const [codigo, setCodigo] = useState('')
  const [recusa, setRecusa] = useState<string | null>(null)
  const idDoCampo = useId()
  const idDaSaida = useId()
  const campo = useRef<HTMLTextAreaElement>(null)

  const rodar = () => {
    const motivo = python.executar(codigo)
    setRecusa(motivo)
  }

  const carregarInterpretador = () => {
    setRecusa(null)
    python.carregar()
  }

  return (
    <section className="console" aria-label="Console de Python">
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
              <code>{python.ultima.linhas.join('\n')}</code>
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
    </section>
  )
}
