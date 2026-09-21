import { PLANO_DE_UNIDADES } from '../../content/planoDeUnidades'
import { descreverReferencia } from '../../content/referenciaLivro'
import { ESTADO_DO_PROJETO } from '../../learning/resumoDoProjeto'
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
    item: 'As 4 primeiras unidades mapeadas para o livro, com as páginas marcadas como referência pendente.',
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
  'O mundo 3D: nenhuma ilha, nenhuma ponte, nenhuma câmera, nenhum avatar.',
  'As aulas: nenhuma explicação, nenhum exemplo e nenhum exercício escritos.',
  'As missões: nenhum enunciado, nenhuma prática guiada.',
  'As perguntas de avaliação: existem as REGRAS, mas nenhuma pergunta escrita.',
  'O placar do estudante: as funções existem e são testadas, mas não há tela que as use.',
  'O progresso salvo: nada é gravado no navegador. Ao recarregar, o placar volta ao início.',
  'A execução de Python no navegador (Pyodide): nada de código roda ainda.',
  'A alternativa acessível sem 3D: o caminho em lista ainda não foi construído.',
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
          O Arquipélago ainda não é um jogo, nem um curso. Hoje ele é o alicerce onde as duas
          coisas vão ser construídas.
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
            Esta página não tem nenhum botão. É deliberado: a regra do projeto proíbe apresentar
            recurso que ainda não funciona, e nenhuma das funções do ciclo de estudo tem tela
            hoje.
          </p>
          <p>
            Um botão &quot;Entrar na ilha&quot; aqui seria promessa vazia. Ele aparece quando a
            ilha existir de verdade.
          </p>
        </div>
      </Cartao>

      <Cartao titulo="Regras de progressão já decididas" sobretitulo="Escritas e testadas, ainda sem tela">
        <p className="cartao__entrada">
          As regras que decidem aprovação e desbloqueio já existem como funções puras em{' '}
          <code>src/learning/</code>, com testes. Elas ainda não têm interface — e é por isso que
          não há botão nesta página.
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
              Plano das primeiras unidades. Nenhuma delas tem conteúdo escrito ainda.
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
          <dd>Roda os testes de contraste, das regras de progressão e do plano de unidades.</dd>
          <dt>
            <code>npm run build</code>
          </dt>
          <dd>Confere os tipos e gera a versão de produção em dist/.</dd>
        </dl>
      </Cartao>
    </>
  )
}
