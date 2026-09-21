/**
 * O núcleo que atende um pedido de execução.
 *
 * Ele é a parte **testável** do trabalhador: recebe um `Interpretador` (de
 * verdade ou dublê), um pedido e devolve a resposta do protocolo. O trabalhador
 * em si — `trabalhadorDoPython.ts` — é só a fiação: escutar mensagem, chamar
 * isto, responder. Essa separação existe porque Web Worker não roda em teste
 * neste ambiente, mas a regra de o que fazer com o resultado roda.
 *
 * Duas responsabilidades moram aqui, e só aqui:
 *
 *  - **recusar** programa vazio ou grande demais, com o motivo escrito;
 *  - transformar falha do Python em `erroDePython` com o texto **literal** do
 *    interpretador, sem reescrever a mensagem e sem esconder o traceback
 *    (D-042).
 */
import type { Interpretador } from './interpretadorPyodide'
import { motivoDaRecusa, textoDoErro, type Resposta } from './protocolo'

/** Atende um pedido de execução: nunca lança, sempre devolve uma resposta. */
export async function atenderExecucao(
  interpretador: Interpretador,
  id: number,
  codigo: string,
): Promise<Resposta> {
  const motivo = motivoDaRecusa(codigo)
  if (motivo !== null) {
    return { tipo: 'recusado', id, motivo }
  }

  try {
    const { texto, resultado } = await interpretador.executar(codigo)
    return { tipo: 'saida', id, texto, resultado }
  } catch (erro) {
    return { tipo: 'erroDePython', id, texto: textoDoErro(erro) }
  }
}
