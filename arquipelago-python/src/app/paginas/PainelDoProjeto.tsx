import { PLANO_DE_UNIDADES } from '../../content/planoDeUnidades'
import { descreverReferencia } from '../../content/referenciaLivro'
import { ESTADO_DO_PROJETO } from '../../learning/resumoDoProjeto'
import { AVISO_DE_HONESTIDADE } from '../../learning/avaliacao'
import { Cartao } from '../../ui/components/Cartao'
import { Chip } from '../../ui/components/Chip'

/**
 * O que existe de verdade hoje, com o comando que comprova cada item.
 * Nada entra nesta lista sem ter sido executado.
 */
const CONSTRUIDO: readonly { readonly item: string; readonly verificar: string }[] = [
  {
    item: 'Projeto React + TypeScript compilando, com versões exatas fixadas.',
    verificar: 'npm run build',
  },
  {
    item: 'Guia de estilo navegável, com a paleta, a tipografia e o contraste conferido.',
    verificar: 'aba "Guia de estilo"',
  },
  {
    item: 'Regras de progressão e de aprovação escritas como funções puras e testadas.',
    verificar: 'npm test',
  },
  {
    item: 'As 10 unidades escritas mapeadas para o livro, com as páginas marcadas como referência pendente.',
    verificar: 'npm test',
  },
  {
    item: 'O mundo 3D: dez ilhas suspensas, pontes, céu, mar e uma pessoa que anda pelo capim.',
    verificar: 'aba "Mundo"',
  },
  {
    item: 'O ciclo de estudo das 10 unidades: missão, leitura orientada, explicação, prática, avaliação e resultado.',
    verificar: 'aba "Mundo"',
  },
  {
    item: 'O conteúdo escrito das 10 unidades: 5 perguntas e 3 exercícios em cada, mais os diagramas da explicação.',
    verificar: 'npm test',
  },
  {
    item: 'O console de Python em cada ilha, com o interpretador servido pela própria aplicação e carregado só quando a pessoa pede.',
    verificar: 'aba "Mundo", na Prática',
  },
  {
    item: 'A conferência automática do exercício, com o limite dela escrito na tela — sem virar nota nem aprovar ilha.',
    verificar: 'aba "Mundo", na Prática',
  },
  {
    item: 'O progresso salvo no navegador, em formato versionado, com migração das versões anteriores.',
    verificar: 'npm test',
  },
  {
    item: 'Documentação de continuidade em docs/.',
    verificar: 'ver os arquivos em docs/',
  },
]

/**
 * O que ainda NÃO existe. Esta lista é o coração desta página: ela impede que a
 * tela vire promessa. Cada linha corresponde a uma etapa futura ainda não
 * autorizada.
 */
const AINDA_NAO_EXISTE: readonly string[] = [
  'A animação de caminhada do avatar: a figura anda, as pernas não se mexem.',
  'O som e a narração: nenhum áudio existe, e não há previsão de ligá-lo por padrão.',
  'As unidades 11 em diante: só as 10 primeiras têm conteúdo escrito.',
  'O teste de navegador automatizado (Playwright): nenhum navegador com WebGL existe neste ambiente.',
  'A conferência do exercício não julga estilo nem impede quem quiser enganar: ela roda no cliente, e a tela diz isso.',
]

export function PainelDoProjeto() {
  return (
    <>
      <Cartao titulo="O que já existe" sobretitulo="Situação real de hoje">
        <p className="cartao__entrada">
          Tudo nesta lista foi executado neste ambiente. Cada item traz como comprovar. As abas
          acima funcionam de verdade — são a única coisa clicável do site, e nenhuma delas
          libera conteúdo.
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

      <Cartao titulo="O que ainda não existe" sobretitulo="Para não haver mal-entendido">
        <p className="cartao__entrada">
          Esta é a parte mais importante da página: cada linha abaixo é um recurso que ainda não
          funciona, e nenhuma delas aparece como botão em lugar nenhum.
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
        <div className="nota">
          <p>
            Esta página não tem nenhum botão de ação. É deliberado: a regra do projeto proíbe
            apresentar recurso que ainda não funciona (D-009).
          </p>
          <p>
            E há uma linha que não pode faltar: <strong>ninguém viu o desenho 3D</strong>. O mundo
            existe, é montado em teste e foi conferido por medidas, mas não há navegador com WebGL
            neste ambiente — pixel, luz e desempenho continuam sem verificação.
          </p>
        </div>
      </Cartao>

      <Cartao titulo="Regras de progressão" sobretitulo="Escritas, testadas e em uso">
        <p className="cartao__entrada">
          As regras que decidem aprovação e desbloqueio vivem como funções puras em{' '}
          <code>src/learning/</code>, e são as mesmas que a tela e o mundo 3D consultam — não
          existe cópia da regra dentro do painel nem da cena.
        </p>
        <dl className="comandos">
          <dt>
            <code>nota real ≥ 80%</code>
          </dt>
          <dd>
            A conta é inteira e exata, sem ponto flutuante. {ESTADO_DO_PROJETO.notaFraca}
          </dd>
          <dt>
            <code>5 perguntas</code>
          </dt>
          <dd>4 acertos aprovam. {ESTADO_DO_PROJETO.reprovacao}</dd>
          <dt>
            <code>um portão por vez</code>
          </dt>
          <dd>{ESTADO_DO_PROJETO.desbloqueio}</dd>
          <dt>
            <code>sem atalho</code>
          </dt>
          <dd>{ESTADO_DO_PROJETO.semAtalho}</dd>
          <dt>
            <code>leitura é registro</code>
          </dt>
          <dd>{ESTADO_DO_PROJETO.leitura}</dd>
          <dt>
            <code>avaliação honesta</code>
          </dt>
          <dd>{AVISO_DE_HONESTIDADE}</dd>
          <dt>
            <code>placar é do progresso</code>
          </dt>
          <dd>{ESTADO_DO_PROJETO.placar}</dd>
        </dl>
      </Cartao>

      <Cartao titulo="Unidades planejadas" sobretitulo="As primeiras ilhas">
        <p className="cartao__entrada">
          Recorte alinhado ao livro. A divisão do capítulo 2 em duas unidades foi uma decisão
          registrada, porque aquele capítulo cobre variáveis, strings, números e comentários —
          denso demais para uma ilha só.
        </p>
        <div className="tabela-rolagem">
          <table className="tabela">
            <caption className="tabela__legenda">
              Plano das unidades. As quatro primeiras têm conteúdo escrito e ciclo completo no ar.
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
                  <td className="tabela__referencia">{descreverReferencia(unidade.referencia)}</td>
                  <td>
                    <Chip situacao={unidade.situacao} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="cartao__rodape">
          &quot;Referência pendente&quot; significa que a página do livro ainda não foi
          verificada. O PDF da obra não está no repositório — e não vai estar, porque o
          repositório é público e o livro tem direitos autorais. Enquanto isso, nenhuma unidade
          inventa um número de página.
        </p>
      </Cartao>

      <Cartao titulo="Como rodar e verificar" sobretitulo="Para quem for continuar">
        <dl className="comandos">
          <dt>
            <code>npm install</code>
          </dt>
          <dd>Instala as dependências exatas registradas no package-lock.json.</dd>
          <dt>
            <code>npm run dev</code>
          </dt>
          <dd>Abre o servidor de desenvolvimento. Ele escuta em 0.0.0.0.</dd>
          <dt>
            <code>npm test</code>
          </dt>
          <dd>
            Roda toda a suíte do projeto — regras, geometria, mundo 3D, conteúdo, leitura,
            interface, acentuação e estilos. A contagem exata e a data de cada execução ficam em
            docs/TEST_REPORT.md, para não envelhecer aqui nesta página.
          </dd>
          <dt>
            <code>npm run build</code>
          </dt>
          <dd>Confere os tipos e gera a versão de produção em dist/.</dd>
        </dl>
      </Cartao>
    </>
  )
}
