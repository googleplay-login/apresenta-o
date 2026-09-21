import { PARES_DE_CONTRASTE, tipografia } from '../../ui/theme/tokens'
import { arredondarRazao, razaoContraste } from '../../ui/theme/contraste'
import { todasAsAmostras, textoLegivelSobre } from '../../ui/theme/amostras'
import { Cartao } from '../../ui/components/Cartao'
import { Chip } from '../../ui/components/Chip'
import type { SituacaoDeConstrucao } from '../../content/planoDeUnidades'

const AMOSTRAS = todasAsAmostras()

const ESCALA_TIPOGRAFICA: readonly { readonly nome: string; readonly variavel: string }[] = [
  { nome: 'Título de seção', variavel: 'var(--fonte-titulo)' },
  { nome: 'Título de cartão', variavel: 'var(--fonte-subtitulo)' },
  { nome: 'Corpo do texto', variavel: 'var(--fonte-corpo)' },
  { nome: 'Legenda e nota', variavel: 'var(--fonte-legenda)' },
  { nome: 'Etiqueta', variavel: 'var(--fonte-chip)' },
]

const SITUACOES: readonly { readonly situacao: SituacaoDeConstrucao; readonly nota: string }[] = [
  { situacao: 'planejada', nota: 'Ainda não começou. Aparece com névoa no mundo.' },
  { situacao: 'em-construcao', nota: 'Existe trabalho em andamento nesta unidade.' },
  { situacao: 'pronta', nota: 'Conteúdo escrito e revisado. O estudante pode entrar.' },
]

export function VitrineDoTema() {
  return (
    <>
      <Cartao titulo="O que esta página é" sobretitulo="Folha de espécimes">
        <p className="cartao__entrada">
          Aqui está a linguagem visual do Arquipélago aplicada em conteúdo real, para conferir a
          aparência antes de construir a cena 3D. Nada nesta página é clicável e nada aqui existe
          no mundo 3D ainda: são <strong>espécimes</strong>, como as amostras de um mostruário.
        </p>
        <p className="cartao__entrada">
          Não há botão de &quot;entrar na ilha&quot; nem controle de câmera, e isso é
          proposital: nenhuma das duas coisas foi construída. Um controle falso aqui seria uma
          promessa falsa.
        </p>
      </Cartao>

      <Cartao titulo="Paleta" sobretitulo="Fonte única em src/ui/theme/tokens.ts">
        <p className="cartao__entrada">
          Toda cor do projeto vem de um único arquivo. O texto sobre cada amostra escolhe
          automaticamente entre claro e escuro, comparando o contraste real.
        </p>
        <ul className="amostras">
          {AMOSTRAS.map((amostra) => (
            <li
              key={amostra.caminho}
              className="amostra"
              style={{ backgroundColor: amostra.cor, color: textoLegivelSobre(amostra.cor) }}
            >
              <span className="amostra__nome">{amostra.caminho}</span>
              <span className="amostra__valor">{amostra.cor}</span>
            </li>
          ))}
        </ul>
      </Cartao>

      <Cartao titulo="Tipografia" sobretitulo="Cinco tamanhos, nenhum improvisado">
        <ul className="escala">
          {ESCALA_TIPOGRAFICA.map((item) => (
            <li key={item.nome} className="escala__item">
              <p className="escala__amostra" style={{ fontSize: item.variavel }}>
                Ilha das palavras
              </p>
              <p className="escala__rotulo">{item.nome}</p>
            </li>
          ))}
        </ul>
        <p className="cartao__rodape">
          Fonte: {tipografia.familia.split(',')[0]?.replace(/'/g, '')} para o texto e uma fonte
          monoespaçada para código. Ambas são fontes do sistema, nada é baixado.
        </p>
      </Cartao>

      <Cartao titulo="Etiquetas de estado de construção" sobretitulo="O que descrevem">
        <ul className="lista">
          {SITUACOES.map((item) => (
            <li key={item.situacao} className="lista__item">
              <Chip situacao={item.situacao} />
              <span className="lista__texto">{item.nota}</span>
            </li>
          ))}
        </ul>
        <p className="cartao__rodape">
          Estas etiquetas falam do <strong>nosso</strong> trabalho de construção, não do
          desempenho do estudante. São conceitos diferentes de propósito: misturar os dois faria
          uma unidade ainda não escrita parecer bloqueada por nota baixa.
        </p>
      </Cartao>

      <Cartao titulo="Espécimes do mundo 3D" sobretitulo="Como será — ainda não existe">
        <p className="cartao__entrada">
          Estes dois espécimes mostram peças que virão junto com a cena. Estão aqui só para
          conferir cor e forma: <strong>não são controles</strong> e não respondem a nada.
        </p>

        <div className="especime">
          <p className="especime__rotulo">Rótulo de ilha, ancorado no espaço 3D</p>
          <div className="especime__palco especime__palco--ceu">
            <span className="pilula">A Praia do Primeiro Programa</span>
            <span className="pilula__chip">Unidade 1 · Cap. 1</span>
          </div>
          <p className="especime__nota">
            Fundo claro imitando o céu. No mundo, este rótulo fica preso à ilha e acompanha a
            distância.
          </p>
        </div>

        <div className="especime">
          <p className="especime__rotulo">Faixa de teclas, na base da tela</p>
          <div className="especime__palco especime__palco--mar">
            <p className="teclas">
              <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> mover <kbd>Q</kbd>{' '}
              <kbd>E</kbd> subir e descer <kbd>Esc</kbd> fechar painel
            </p>
          </div>
          <p className="especime__nota">
            Estas teclas ainda <strong>não fazem nada</strong>: não existe câmera nem avatar. A
            regra de foco já está decidida — com um painel aberto, as teclas de movimento não
            movem a câmera.
          </p>
        </div>
      </Cartao>

      <Cartao titulo="Contraste conferido" sobretitulo="Calculado agora, não estimado">
        <p className="cartao__entrada">
          Cada par de texto e fundo usado na interface é medido pela fórmula da WCAG 2.1. O
          mínimo para texto normal é 4,5:1; para texto grande, 3:1. Os mesmos pares são
          verificados por teste automático, e o teste reprova se algum cair.
        </p>
        <div className="tabela-rolagem">
          <table className="tabela">
            <caption className="tabela__legenda">
              Pares declarados pela interface, com a razão de contraste medida.
            </caption>
            <thead>
              <tr>
                <th scope="col">Onde aparece</th>
                <th scope="col">Texto</th>
                <th scope="col">Fundo</th>
                <th scope="col">Contraste</th>
                <th scope="col">Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {PARES_DE_CONTRASTE.map((par) => {
                const razao = razaoContraste(par.primeiroPlano, par.fundo)
                const minimo = par.textoGrande ? 3 : 4.5
                return (
                  <tr key={par.onde}>
                    <th scope="row" className="tabela__titulo">
                      {par.onde}
                    </th>
                    <td>
                      <span className="pastilha" style={{ backgroundColor: par.primeiroPlano }} />{' '}
                      {par.primeiroPlano}
                    </td>
                    <td>
                      <span className="pastilha" style={{ backgroundColor: par.fundo }} />{' '}
                      {par.fundo}
                    </td>
                    <td className="tabela__numero">{arredondarRazao(razao)}:1</td>
                    <td className="tabela__numero">{minimo}:1</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="cartao__rodape">
          Limite honesto: isto mede os <strong>tokens de cor</strong>. Não mede os pixels na tela
          — para isso seria preciso um navegador, que este ambiente não tem. A verificação visual
          final está registrada como não executada em <code>docs/TEST_REPORT.md</code>.
        </p>
      </Cartao>
    </>
  )
}
