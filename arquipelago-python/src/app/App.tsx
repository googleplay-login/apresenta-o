import { ETAPA_ATUAL, NOME, VERSAO } from './identidade'
import { ROTAS, type Rota } from './rotas'
import { useRota } from './useRota'
import { Mundo } from './paginas/Mundo'
import { PainelDoProjeto } from './paginas/PainelDoProjeto'
import { VitrineDoTema } from './paginas/VitrineDoTema'
import { tokensComoVariaveisCss } from '../ui/theme/tokens'
import './app.css'

const ABAS: readonly { readonly rota: Rota; readonly rotulo: string }[] = [
  { rota: 'mundo', rotulo: 'Mundo' },
  { rota: 'painel', rotulo: 'Painel do projeto' },
  { rota: 'tema', rotulo: 'Guia de estilo' },
]

/**
 * Casca da aplicação: letreiro, abas, conteúdo e rodapé.
 *
 * As abas são links de verdade (`href` para o hash da rota) — navegar funciona
 * mesmo sem JavaScript depois do primeiro carregamento. Elas existem porque a
 * navegação **funciona**; a regra do projeto proíbe alvo clicável sem efeito.
 */
export function App() {
  const rota = useRota()

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
            Versão {VERSAO} &middot; {ETAPA_ATUAL}
          </p>
        </div>
      </header>

      <nav className="abas" aria-label="Seções do site">
        <div className="abas__conteudo">
          {ABAS.map((aba) => {
            const ativa = rota === aba.rota
            return (
              <a
                key={aba.rota}
                className={ativa ? 'aba aba--ativa' : 'aba'}
                href={ROTAS[aba.rota]}
                aria-current={ativa ? 'page' : undefined}
              >
                {aba.rotulo}
              </a>
            )
          })}
        </div>
      </nav>

      <main className="conteudo">
        {rota === 'mundo' ? <Mundo /> : null}
        {rota === 'painel' ? <PainelDoProjeto /> : null}
        {rota === 'tema' ? <VitrineDoTema /> : null}
      </main>

      <footer className="rodape">
        <div className="rodape__conteudo">
          <p>
            <strong>Aviso de integridade.</strong> O conteúdo das aulas, das missões e das
            perguntas é original. O livro é usado como fonte de estudo e como mapa, nunca
            reproduzido: nenhum capítulo, exercício ou página do livro entra neste repositório.
          </p>
          <p>
            As referências de página ficam marcadas como pendentes até que o livro possa ser
            conferido — e a numeração impressa não é a mesma do arquivo digital.
          </p>
        </div>
      </footer>
    </div>
  )
}
