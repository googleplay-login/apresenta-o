import type { ConteudoDaUnidade } from '../../content/tiposDeConteudo'
import { descreverReferencia, type ReferenciaLivro } from '../../content/referenciaLivro'

/**
 * Passo 2 do ciclo, primeira metade: **a leitura no livro**.
 *
 * O ciclo do projeto é: entrar na ilha → consultar a missão → estudar a parte
 * identificada do livro → ler a explicação original → praticar → ser avaliado.
 * Durante três etapas, a parte "estudar a parte identificada do livro" existia
 * como uma linha na missão. Aqui ela vira uma seção de verdade, com três coisas
 * que faltavam:
 *
 *  - **o que procurar naquela parte** — "leia o capítulo 2" não é instrução para
 *    quem nunca estudou programação: a pessoa lê as mesmas páginas e não sabe o
 *    que era para ficar;
 *  - **o que fazer sem o livro** — o projeto não pode supor que o estudante
 *    tenha o livro por perto. A leitura é recomendada, não exigida, e há um
 *    caminho completo sem ela;
 *  - **um lembrete honesto** — o marcador de leitura é da pessoa, para ela não
 *    se perder entre quatro capítulos. O texto diz, na cara, que marcar não
 *    aprova nada.
 *
 * A página continua pendente (D-010): a referência aparece como "referência
 * pendente" e a leitura é indicada por capítulo e assunto, nunca por número.
 */

type Props = {
  readonly conteudo: ConteudoDaUnidade
  /** Referência do plano de unidades, com o status de página (pendente). */
  readonly referencia: ReferenciaLivro | null
  readonly leituraFeita: boolean
  readonly aoMarcarLeitura: (feita: boolean) => void
}

export function LeituraDaUnidade({
  conteudo,
  referencia,
  leituraFeita,
  aoMarcarLeitura,
}: Props) {
  const { leitura } = conteudo

  return (
    <section className="leitura" aria-label="Leitura recomendada no livro">
      <h3 className="passo__titulo">1. Ler no livro</h3>

      <p className="leitura__parte">{leitura.parte}</p>
      <p className="leitura__porque">{leitura.porque}</p>

      {referencia === null ? null : (
        <p className="leitura__referencia">{descreverReferencia(referencia)}</p>
      )}

      <div className="leitura__observar">
        <h4 className="leitura__rotulo">O que procurar nesta leitura</h4>
        <ul className="leitura__lista">
          {leitura.oQueObservar.map((ponto) => (
            <li key={ponto}>{ponto}</li>
          ))}
        </ul>
      </div>

      <aside className="leitura__sem-livro">
        <h4 className="leitura__rotulo">Se você não tem o livro agora</h4>
        <p>{leitura.semOLivro}</p>
      </aside>

      <div className="leitura__marcador">
        <button
          type="button"
          className={leituraFeita ? 'botao botao--pequeno botao--ativo' : 'botao botao--pequeno'}
          aria-pressed={leituraFeita}
          onClick={() => aoMarcarLeitura(!leituraFeita)}
        >
          {leituraFeita ? 'Leitura marcada como feita' : 'Marcar esta leitura como feita'}
        </button>
        <p className="leitura__aviso">
          {leituraFeita
            ? 'Anotado neste navegador. Marcar a leitura não é prova de nada e não muda a sua nota — é só o seu lembrete de onde você parou.'
            : 'O marcador é seu: fica guardado neste navegador e serve para você não se perder entre os capítulos. Ele não aprova a ilha, não abre a ponte e não muda nota nenhuma.'}
        </p>
      </div>
    </section>
  )
}
