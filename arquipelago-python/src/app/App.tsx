import type { ReactNode } from 'react'
import { ETAPA_ATUAL, NOME, VERSAO } from './identidade'
import { PLANO_DE_UNIDADES } from '../content/planoDeUnidades'
import { descreverReferencia } from '../content/referenciaLivro'
import { Cartao } from '../ui/components/Cartao'
import { Chip } from '../ui/components/Chip'
import { tokensComoVariaveisCss } from '../ui/theme/tokens'
import './app.css'

/**
 * O que existe de verdade nesta etapa, com o comando que comprova cada item.
 * Nada entra nesta lista sem ter sido executado.
 */
const CONSTRUIDO: readonly { readonly item: string; readonly verificar: string }[] = [
  {
    item: 'Projeto React + TypeScript compilando, com versoes exatas fixadas.',
    verificar: 'npm run build',
  },
  {
    item: 'Tema visual derivado das imagens de referencia, com teste automatico de contraste (WCAG AA).',
    verificar: 'npm test',
  },
  {
    item: 'As 4 primeiras unidades mapeadas para o livro, com as paginas marcadas como referencia pendente.',
    verificar: 'npm test',
  },
  {
    item: 'Documentacao de continuidade em docs/ (brief, arquitetura, decisoes, mapa do livro e etapas).',
    verificar: 'ver os arquivos em docs/',
  },
]

/**
 * O que ainda NAO existe. Esta lista e o coracao desta pagina: ela impede que a
 * tela vire uma promessa. Cada linha aqui corresponde a uma etapa futura ainda
 * nao autorizada.
 */
const AINDA_NAO_EXISTE: readonly string[] = [
  'O mundo 3D: nenhuma ilha, nenhuma ponte, nenhuma camera, nenhum avatar.',
  'As aulas: nenhuma explicacao, nenhum exemplo e nenhum exercicio escritos.',
  'A missao de cada ilha: nenhum enunciado, nenhuma pratica guiada.',
  'A avaliacao: nenhuma pergunta, nenhuma nota, nenhuma regra de aprovacao.',
  'O progresso salvo: nada e gravado no navegador, nem localmente nem remotamente.',
  'A execucao de Python no navegador (Pyodide): nada de codigo roda ainda.',
  'A alternativa acessivel sem 3D: o caminho em lista ainda nao foi construido.',
]

/** Por que a pagina nao tem botoes: a razao e uma regra do projeto, nao um esquecimento. */
const AUSENCIA_DE_BOTOES: ReactNode = (
  <>
    <p>
      Esta pagina nao tem nenhum botao. E deliberado: a regra do projeto proibe apresentar
      recurso que ainda nao funciona, e nenhuma das funcoes do ciclo de estudo existe hoje.
    </p>
    <p>
      Um botao &quot;Entrar na ilha&quot; aqui seria uma promessa vazia. Ele aparece quando a ilha
      existir de verdade.
    </p>
  </>
)

export function App() {
  return (
    <div className="app" style={tokensComoVariaveisCss()}>
      <header className="letreiro">
        <div className="letreiro__conteudo">
          <h1 className="letreiro__titulo">{NOME}</h1>
          <p className="letreiro__subtitulo">
            Estudar Python percorrendo um mundo 3D, acompanhando o livro{' '}
            <cite>Curso Intensivo de Python</cite> (Eric Matthes, Novatec).
          </p>
          <p className="letreiro__etapa">
            Versao {VERSAO} &middot; {ETAPA_ATUAL}
          </p>
        </div>
      </header>

      <main className="conteudo">
        <Cartao titulo="O que ja existe" sobretitulo="Situacao real de hoje">
          <p className="cartao__entrada">
            Tudo nesta lista foi executado neste ambiente. Cada item traz o comando que comprova.
          </p>
          <ul className="lista">
            {CONSTRUIDO.map((linha) => (
              <li key={linha.item} className="lista__item">
                <span className="lista__texto">{linha.item}</span>
                <code className="lista__comando">{linha.verificar}</code>
              </li>
            ))}
          </ul>
        </Cartao>

        <Cartao titulo="O que ainda nao existe" sobretitulo="Para nao haver mal-entendido">
          <p className="cartao__entrada">
            O Arquipelago ainda nao e um jogo, nem um curso. Hoje ele e o alicerce onde as duas
            coisas vao ser construidas.
          </p>
          <ul className="lista lista--ausente">
            {AINDA_NAO_EXISTE.map((linha) => (
              <li key={linha} className="lista__item">
                <span className="marca-ausente" aria-hidden="true">
                  &#10005;
                </span>
                <span className="lista__texto">{linha}</span>
              </li>
            ))}
          </ul>
          <div className="nota">{AUSENCIA_DE_BOTOES}</div>
        </Cartao>

        <Cartao titulo="Unidades planejadas" sobretitulo="As primeiras ilhas">
          <p className="cartao__entrada">
            Recorte alinhado ao livro. A divisao do capitulo 2 em duas unidades foi uma decisao
            registrada, porque aquele capitulo cobre variaveis, strings, numeros e comentarios -
            denso demais para uma ilha so.
          </p>
          <div className="tabela-rolagem">
            <table className="tabela">
              <caption className="tabela__legenda">
                Plano das primeiras unidades. Nenhuma delas tem conteudo escrito ainda.
              </caption>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Ilha</th>
                  <th scope="col">O que ensina</th>
                  <th scope="col">Onde ler no livro</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {PLANO_DE_UNIDADES.map((unidade) => (
                  <tr key={unidade.id}>
                    <td className="tabela__numero">{unidade.ordem}</td>
                    <th scope="row" className="tabela__titulo">
                      {unidade.titulo}
                    </th>
                    <td>{unidade.tema}</td>
                    <td className="tabela__referencia">
                      {descreverReferencia(unidade.referencia)}
                    </td>
                    <td>
                      <Chip situacao={unidade.situacao} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="cartao__rodape">
            &quot;Referencia pendente&quot; significa que a pagina do livro ainda nao foi
            verificada. O PDF da obra nao esta no repositorio - e nao vai estar, porque ele e
            publico e o livro tem direitos autorais. Enquanto isso, nenhuma unidade inventa um
            numero de pagina.
          </p>
        </Cartao>

        <Cartao titulo="Como rodar e verificar" sobretitulo="Para quem for continuar">
          <dl className="comandos">
            <dt>
              <code>npm install</code>
            </dt>
            <dd>Instala as dependencias exatas registradas no package-lock.json.</dd>
            <dt>
              <code>npm run dev</code>
            </dt>
            <dd>Abre o servidor de desenvolvimento. Ele escuta em 0.0.0.0.</dd>
            <dt>
              <code>npm test</code>
            </dt>
            <dd>Roda os testes de contraste do tema e das invariantes do plano de unidades.</dd>
            <dt>
              <code>npm run build</code>
            </dt>
            <dd>Confere os tipos e gera a versao de producao em dist/.</dd>
          </dl>
        </Cartao>
      </main>

      <footer className="rodape">
        <div className="rodape__conteudo">
          <p>
            <strong>Aviso de integridade.</strong> O conteudo das aulas, das missoes e das
            perguntas sera original. O livro e usado como fonte de estudo e como mapa, nunca
            reproduzido: nenhum capitulo, exercicio ou pagina do livro entra neste repositorio.
          </p>
          <p>
            As explicacoes, os exemplos e as perguntas do Arquipelago sao escritos por nos. As
            referencias de pagina ficam nulas ate que o livro possa ser conferido.
          </p>
        </div>
      </footer>
    </div>
  )
}
