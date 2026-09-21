import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  /** O que aparece quando o conteúdo falha. */
  readonly alternativa: ReactNode
  /** Rótulo do que falhou, para a mensagem. */
  readonly doQue: string
  readonly children: ReactNode
}

type Estado = { readonly erro: Error | null }

/**
 * Fronteira de erro em volta de um pedaço da tela.
 *
 * Existe por um motivo concreto: a cena 3D depende de placa de vídeo, e placa de
 * vídeo pode falhar em máquina que não está sob o nosso controle. Se ela lançar,
 * o React desmontaria a árvore inteira e o estudante veria uma tela branca, sem
 * explicação e sem caminho. Aqui, a falha vira uma mensagem honesta e a
 * alternativa em texto continua funcionando.
 *
 * Limite claro: isto não conserta a falha, só impede que ela derrube o resto.
 */
export class LimiteDeErro extends Component<Props, Estado> {
  override state: Estado = { erro: null }

  static getDerivedStateFromError(erro: Error): Estado {
    return { erro }
  }

  override componentDidCatch(erro: Error, informacoes: ErrorInfo) {
    // Sem serviço de relatório: o registro fica no console do próprio navegador
    // de quem está usando, e nada sai da máquina.
    console.error(`Falha em ${this.props.doQue}:`, erro, informacoes.componentStack)
  }

  override render() {
    if (this.state.erro !== null) {
      return (
        <div className="falha">
          <h2 className="falha__titulo">O mundo 3D não pôde ser desenhado nesta máquina</h2>
          <p className="falha__texto">
            O motivo relatado pelo navegador foi: <code>{this.state.erro.message}</code>
          </p>
          <p className="falha__texto">
            Nada do seu progresso foi perdido: ele fica guardado à parte do desenho. Abaixo está
            a mesma trilha em texto, com todas as ilhas, lições e avaliações.
          </p>
          {this.props.alternativa}
        </div>
      )
    }

    return this.props.children
  }
}
