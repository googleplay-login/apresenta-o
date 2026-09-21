/**
 * O gancho que liga a interface ao trabalhador do Python.
 *
 * Responsabilidades, e nada além delas:
 *
 *  - criar o trabalhador **quando alguém pede** (e não na abertura da página,
 *    porque o interpretador é grande e a maior parte das pessoas não vai rodar
 *    código na primeira visita);
 *  - carregar o interpretador uma única vez, avisando em que ponto está;
 *  - executar o que for enviado, guardando a saída de cada execução;
 *  - **descartar o trabalhador** quando algo dá errado ou quando a pessoa pede
 *    para reiniciar — é o único jeito de interromper um laço infinito, e é por
 *    isso que o botão existe.
 *
 * O que ele **não** promete: que rodar código de terceiros seja seguro. Isto é
 * um interpretador Python de verdade rodando dentro deste navegador: ele não tem
 * acesso ao sistema de arquivos da máquina nem à rede por padrão, mas não é uma
 * caixa à prova de fuga, e a interface diz isso em voz alta (D-041).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ehResposta,
  linhasDaSaida,
  motivoDaRecusa,
  pedidoDeCarregar,
  pedidoDeExecucao,
  textoDoErro,
  type Resposta,
} from './protocolo'

/**
 * Depois de quanto tempo um programa em execução passa a ser tratado como
 * provável travamento.
 *
 * O interpretador roda no trabalhador, e não há como interromper um laço de
 * dentro do Python: a única saída é descartar o trabalhador. Este prazo não
 * interrompe nada — ele só faz a tela **dizer** que algo demora demais e onde
 * está a saída, em vez de ficar parada parecendo que o programa está errado.
 */
export const PRAZO_SEM_RESPOSTA_MS = 15_000

/** Em que ponto o interpretador está. */
export type EstadoDoPython = 'parado' | 'carregando' | 'pronto' | 'falhou'

/** Uma execução já concluída, como ela aparece na tela. */
export type Execucao = {
  readonly id: number
  readonly codigo: string
  /** Linhas a mostrar: saída impressa, valor da última expressão, ou erro. */
  readonly linhas: readonly string[]
  /** `true` quando o que está em `linhas` é mensagem de erro do Python. */
  readonly foiErro: boolean
}

export type Python = {
  readonly estado: EstadoDoPython
  /** Versão do Python, depois de carregado. */
  readonly versao: string | null
  /** Mensagem honesta quando o carregamento falha. */
  readonly falha: string | null
  readonly carregando: boolean
  readonly ultima: Execucao | null
  /** `true` quando uma execução passou do prazo sem resposta. */
  readonly demorando: boolean
  /** Carrega o interpretador sem executar nada. */
  readonly carregar: () => void
  /** Executa um programa. Devolve o motivo da recusa, ou `null` se foi aceito. */
  readonly executar: (codigo: string) => string | null
  /** Descarta o trabalhador e começa outro do zero. */
  readonly reiniciar: () => void
}

/** Endereço da pasta com os arquivos do Pyodide, servidos pela própria aplicação. */
export function urlDosArquivosDoPyodide(): string {
  const base = typeof document === 'undefined' ? '/' : document.baseURI
  return new URL('pyodide/', base).href
}

/**
 * Cria o trabalhador.
 *
 * `new Worker(new URL(...), { type: 'module' })` é a forma que o empacotador
 * entende: ele separa o arquivo do trabalhador e devolve o endereço certo tanto
 * em desenvolvimento quanto no pacote final.
 */
function criarTrabalhador(): Worker {
  return new Worker(new URL('./trabalhadorDoPython.ts', import.meta.url), { type: 'module' })
}

export function usePython({ ativo = true }: { readonly ativo?: boolean } = {}): Python {
  const [estado, setEstado] = useState<EstadoDoPython>('parado')
  const [versao, setVersao] = useState<string | null>(null)
  const [falha, setFalha] = useState<string | null>(null)
  const [ultima, setUltima] = useState<Execucao | null>(null)
  const [demorando, setDemorando] = useState(false)

  const trabalhador = useRef<Worker | null>(null)
  const proximoId = useRef(1)
  const codigoPorId = useRef(new Map<number, string>())
  /** Prazo em aberto da execução que está rodando, para o vigia do travamento. */
  const prazo = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fecharPrazo = useCallback(() => {
    if (prazo.current !== null) {
      clearTimeout(prazo.current)
      prazo.current = null
    }
  }, [])

  const descartar = useCallback(() => {
    fecharPrazo()
    trabalhador.current?.terminate()
    trabalhador.current = null
    codigoPorId.current.clear()
    setDemorando(false)
  }, [fecharPrazo])

  useEffect(() => descartar, [descartar])

  const responder = useCallback(
    (resposta: Resposta) => {
      if (resposta.tipo !== 'pronto' && resposta.tipo !== 'erroDeCarga') {
        fecharPrazo()
        setDemorando(false)
      }
      switch (resposta.tipo) {
      case 'pronto':
        setVersao(resposta.versao)
        setEstado('pronto')
        break

      case 'saida': {
        const linhas = linhasDaSaida(resposta.texto, resposta.resultado)
        setUltima({
          id: resposta.id,
          codigo: codigoPorId.current.get(resposta.id) ?? '',
          // Programa que roda sem imprimir nada e sem valor final precisa dizer
          // alguma coisa: silêncio na tela parece defeito do programa.
          linhas: linhas.length === 0 ? ['(o programa rodou sem produzir saída)'] : linhas,
          foiErro: false,
        })
        break
      }

      case 'erroDePython':
        setUltima({
          id: resposta.id,
          codigo: codigoPorId.current.get(resposta.id) ?? '',
          linhas: resposta.texto.split('\n'),
          foiErro: true,
        })
        break

      case 'recusado':
        setUltima({
          id: resposta.id,
          codigo: codigoPorId.current.get(resposta.id) ?? '',
          linhas: [resposta.motivo],
          foiErro: true,
        })
        break

      case 'erroDeCarga':
        setFalha(resposta.texto)
        setEstado('falhou')
        break
      }
    },
    [fecharPrazo],
  )

  const carregar = useCallback(() => {
    if (!ativo) {
      return
    }
    if (typeof Worker === 'undefined') {
      // Ambiente sem Web Worker (render estático, navegador antigo). Falhar em
      // silêncio deixaria um botão que não faz nada — o que este projeto proíbe.
      setFalha('Este ambiente não oferece Web Worker, e o Python roda dentro de um.')
      setEstado('falhou')
      return
    }
    if (trabalhador.current === null) {
      const novo = criarTrabalhador()
      novo.addEventListener('message', (evento: MessageEvent<unknown>) => {
        if (ehResposta(evento.data)) {
          responder(evento.data)
        }
      })
      novo.addEventListener('error', (evento) => {
        setFalha(`O trabalhador do Python parou: ${evento.message}`)
        setEstado('falhou')
        descartar()
      })
      trabalhador.current = novo
      setEstado('carregando')
      setFalha(null)
      novo.postMessage(pedidoDeCarregar(urlDosArquivosDoPyodide()))
      return
    }
    if (estado === 'parado') {
      setEstado('carregando')
      trabalhador.current.postMessage(pedidoDeCarregar(urlDosArquivosDoPyodide()))
    }
  }, [ativo, descartar, estado, responder])

  const executar = useCallback(
    (codigo: string): string | null => {
      const motivo = motivoDaRecusa(codigo)
      if (motivo !== null) {
        return motivo
      }

      if (trabalhador.current === null || estado === 'parado' || estado === 'falhou') {
        carregar()
      }

      const id = proximoId.current
      proximoId.current += 1
      codigoPorId.current.set(id, codigo)

      fecharPrazo()
      setDemorando(false)

      // O trabalhador pode ainda não existir neste instante — `carregar` acabou
      // de criá-lo —, e a mensagem fica na fila até ele estar pronto.
      trabalhador.current?.postMessage(pedidoDeExecucao(id, codigo))

      // Vigia: se nada voltar dentro do prazo, a tela passa a dizer que o
      // programa pode estar travado e onde está o botão que resolve. O prazo é
      // reiniciado a cada execução, e não acumula entre elas.
      prazo.current = setTimeout(() => setDemorando(true), PRAZO_SEM_RESPOSTA_MS)

      return null
    },
    [carregar, estado, fecharPrazo],
  )

  const reiniciar = useCallback(() => {
    descartar()
    setEstado('parado')
    setVersao(null)
    setFalha(null)
    setUltima(null)
  }, [descartar])

  return {
    estado,
    versao,
    falha: falha === null ? null : textoDoErro(falha),
    carregando: estado === 'carregando',
    ultima,
    demorando,
    carregar,
    executar,
    reiniciar,
  }
}
