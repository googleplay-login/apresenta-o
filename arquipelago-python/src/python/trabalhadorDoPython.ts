/**
 * O trabalhador: o Python roda fora da linha principal.
 *
 * Por que em Web Worker, e não na página: carregar e executar o interpretador
 * bloqueia quem está rodando. Na linha principal, isso congela a tela — o botão
 * não responde, a animação para, e um laço `while True` no programa do estudante
 * travaria a aba inteira, sem saída. No trabalhador, quem trava é o trabalhador,
 * e a página continua viva: o botão de reiniciar descarta o trabalhador e começa
 * outro.
 *
 * Este arquivo é **só fiação**: escutar mensagem, chamar o núcleo, responder. A
 * decisão do que fazer com o resultado mora em `nucleoDoPython.ts`, que roda em
 * teste; aqui não há nada para testar que não exija um navegador de verdade.
 */
import { criarInterpretadorPyodide, type Interpretador } from './interpretadorPyodide'
import { atenderExecucao } from './nucleoDoPython'
import { textoDoErro, type Pedido } from './protocolo'

/** Onde fica o Web Worker que carrega o interpretador. */
const URL_DO_PYODIDE = new URL('pyodide/', self.location.href).href

let interpretador: Interpretador | null = null
let carregando: Promise<Interpretador> | null = null

function responder(mensagem: unknown): void {
  self.postMessage(mensagem)
}

function carregar(url: string): Promise<Interpretador> {
  if (interpretador !== null) {
    return Promise.resolve(interpretador)
  }
  if (carregando === null) {
    carregando = criarInterpretadorPyodide(url)
      .then((novo) => {
        interpretador = novo
        responder({ tipo: 'pronto', versao: novo.versao })
        return novo
      })
      .catch((erro: unknown) => {
        carregando = null
        responder({ tipo: 'erroDeCarga', texto: textoDoErro(erro) })
        throw erro
      })
  }
  return carregando
}

self.addEventListener('message', (evento: MessageEvent<unknown>) => {
  const pedido = evento.data as Pedido
  if (!ehPedido(pedido)) {
    responder({ tipo: 'erroDeCarga', texto: 'O trabalhador recebeu um pedido que não entende.' })
    return
  }

  if (pedido.tipo === 'carregar') {
    void carregar(pedido.url === '' ? URL_DO_PYODIDE : pedido.url).catch(() => {
      // A mensagem de erro já foi enviada em `carregar`.
    })
    return
  }

  void (async () => {
    try {
      const pronto = await carregar(URL_DO_PYODIDE)
      const resposta = await atenderExecucao(pronto, pedido.id, pedido.codigo)
      responder(resposta)
    } catch (erro) {
      responder({ tipo: 'erroDeCarga', texto: textoDoErro(erro) })
    }
  })()
})

function ehPedido(valor: unknown): valor is Pedido {
  if (valor === null || typeof valor !== 'object') {
    return false
  }
  const candidato = valor as { tipo?: unknown; id?: unknown; codigo?: unknown; url?: unknown }
  if (candidato.tipo === 'carregar') {
    return typeof candidato.url === 'string'
  }
  if (candidato.tipo === 'executar') {
    return typeof candidato.id === 'number' && typeof candidato.codigo === 'string'
  }
  return false
}
