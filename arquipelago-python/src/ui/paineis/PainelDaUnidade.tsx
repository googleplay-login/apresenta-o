import { useEffect, useRef } from 'react'
import type { ConteudoDaUnidade } from '../../content/tiposDeConteudo'
import type { Resposta, ResultadoDeAvaliacao } from '../../learning/avaliacao'
import { PASSOS, proximoPasso, type Passo } from '../../state/sessao'
import { AvaliacaoDaUnidade } from './AvaliacaoDaUnidade'
import { EstudoDaUnidade } from './EstudoDaUnidade'
import { MissaoDaUnidade } from './MissaoDaUnidade'
import { PraticaDaUnidade } from './PraticaDaUnidade'
import { ResultadoDaUnidade } from './ResultadoDaUnidade'

/**
 * Painel do ciclo de estudo: missão, estudo, prática, avaliação e resultado.
 *
 * Ele é a alternativa acessível **e** a interface principal: a mesma trilha roda
 * com o mundo 3D desenhado ou sem ele. Quem chega por teclado, quem usa leitor
 * de tela e quem está numa máquina sem placa de vídeo percorre exatamente os
 * mesmos passos, com o mesmo conteúdo — o conteúdo vem do mesmo arquivo.
 *
 * Detalhes que não são decoração:
 *  - o foco entra no painel ao abrir e volta para o mundo ao fechar, para o
 *    teclado não ficar preso em lugar nenhum (D-012);
 *  - `Esc` fecha o painel. Está escrito na tela, e não só no código;
 *  - os passos são botões de verdade: navegar entre eles funciona.
 */

export type PropsDoPainel = {
  readonly conteudo: ConteudoDaUnidade
  readonly passo: Passo
  readonly respostas: readonly Resposta[]
  readonly resultado: ResultadoDeAvaliacao | null
  readonly aprovadaAntes: boolean
  readonly temProxima: boolean
  readonly aoIrPara: (passo: Passo) => void
  readonly aoAvancar: () => void
  readonly aoVoltar: () => void
  readonly aoResponder: (indice: number, alternativa: number) => void
  readonly aoEnviar: () => void
  readonly aoRefazer: () => void
  readonly aoFechar: () => void
  readonly aoSeguir: () => void
}

const ROTULO: Record<Passo, string> = {
  missao: 'Missão',
  estudo: 'Estudo',
  pratica: 'Prática',
  avaliacao: 'Avaliação',
  resultado: 'Resultado',
}

export function PainelDaUnidade(props: PropsDoPainel) {
  const { conteudo, passo, aoFechar, aoAvancar, aoVoltar, aoIrPara } = props
  const referencia = useRef<HTMLElement>(null)

  // Ao abrir o painel (ou trocar de unidade), o foco vai para ele. Sem isso, o
  // teclado continuaria no mundo e as setas moveriam a câmera por baixo.
  useEffect(() => {
    referencia.current?.focus()
  }, [conteudo.id])

  const seguinte = proximoPasso(passo)
  const enviado = props.resultado !== null

  return (
    <aside
      className="painel"
      ref={referencia}
      tabIndex={-1}
      role="region"
      aria-label={`Unidade ${conteudo.id}`}
      onKeyDown={(evento) => {
        if (evento.key === 'Escape') {
          evento.stopPropagation()
          aoFechar()
        }
      }}
    >
      <header className="painel__topo">
        <p className="painel__sobretitulo">Ilha {conteudo.id}</p>
        <h2 className="painel__titulo">{conteudo.missao}</h2>
        <button type="button" className="botao botao--fechar" onClick={aoFechar}>
          Fechar <kbd>Esc</kbd>
        </button>
      </header>

      <nav className="passos" aria-label="Passos da unidade">
        {PASSOS.map((cada) => (
          <button
            key={cada}
            type="button"
            className={cada === passo ? 'passo-aba passo-aba--ativa' : 'passo-aba'}
            aria-current={cada === passo ? 'step' : undefined}
            onClick={() => aoIrPara(cada)}
          >
            {ROTULO[cada]}
          </button>
        ))}
      </nav>

      <div className="painel__corpo">
        {passo === 'missao' ? <MissaoDaUnidade conteudo={conteudo} /> : null}

        {passo === 'estudo' ? <EstudoDaUnidade conteudo={conteudo} /> : null}

        {passo === 'pratica' ? <PraticaDaUnidade exercicios={conteudo.pratica} /> : null}

        {passo === 'avaliacao' ? (
          <AvaliacaoDaUnidade
            conteudo={conteudo}
            respostas={props.respostas}
            enviado={enviado}
            aoResponder={props.aoResponder}
            aoEnviar={props.aoEnviar}
          />
        ) : null}

        {passo === 'resultado' ? (
          props.resultado === null ? (
            <p className="passo__aviso">
              Nenhum resultado ainda. Responda a avaliação para ver a nota aqui.
            </p>
          ) : (
            <ResultadoDaUnidade
              conteudo={conteudo}
              respostas={props.respostas}
              resultado={props.resultado}
              aprovadaAntes={props.aprovadaAntes}
              temProxima={props.temProxima}
              aoRefazer={props.aoRefazer}
              aoVoltarAoEstudo={() => aoIrPara('estudo')}
              aoSeguir={props.aoSeguir}
            />
          )
        ) : null}
      </div>

      <footer className="painel__rodape">
        <button type="button" className="botao" onClick={aoVoltar} disabled={passo === 'missao'}>
          Voltar
        </button>
        {passo === 'avaliacao' ? null : (
          <button
            type="button"
            className="botao botao--principal"
            onClick={aoAvancar}
            disabled={seguinte === null}
          >
            {seguinte === null ? 'Fim do ciclo' : `Ir para ${ROTULO[seguinte]}`}
          </button>
        )}
      </footer>
    </aside>
  )
}
