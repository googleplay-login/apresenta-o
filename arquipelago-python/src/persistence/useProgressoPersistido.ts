import { useCallback, useEffect, useRef } from 'react'
import type { Progresso } from '../learning/percurso'
import type { Acao } from '../state/sessao'
import {
  apagarProgresso,
  armazenamentoDoNavegador,
  gravarProgresso,
  lerProgresso,
  type Armazenamento,
} from './progressoSalvo'

/**
 * Liga o progresso ao armazenamento do navegador.
 *
 * Regras que este gancho respeita, e que vêm das decisões do projeto:
 *
 *  - **nunca finge que salvou.** Se a gravação falhar, a mensagem vai para a
 *    tela, em português, dizendo o que aconteceu e o que continua valendo;
 *  - **grava só dado serializável**: o que vai para o armazenamento é o objeto
 *    de progresso — número e texto —, nunca componente, função ou objeto do
 *    Three.js;
 *  - **não apaga nada que não seja nosso**: `apagarProgresso` remove apenas as
 *    chaves com o prefixo da aplicação, jamais um `clear()` na origem inteira;
 *  - **a leitura acontece uma vez**, antes de qualquer gravação. Sem isso, o
 *    primeiro efeito de gravação passaria por cima do que estava salvo.
 */

export type EstadoDaPersistencia = {
  /** Zera o progresso guardado. Devolve `false` quando não foi possível. */
  readonly apagar: () => boolean
  /** `true` quando o navegador não permite guardar dados. */
  readonly indisponivel: boolean
}

type Props = {
  readonly progresso: Progresso
  /** Aviso já mostrado, para não repetir a mesma mensagem a cada gravação. */
  readonly avisoAtual: string | null
  readonly despachar: (acao: Acao) => void
  /** `false` em render sem navegador (teste e render estático). */
  readonly ativo?: boolean
}

export function useProgressoPersistido({
  progresso,
  avisoAtual,
  despachar,
  ativo = true,
}: Props): EstadoDaPersistencia {
  const armazenamento = useRef<Armazenamento | null>(null)
  const leituraFeita = useRef(false)
  const indisponivel = useRef(false)

  const avisar = useCallback(
    (aviso: string | null) => {
      if (aviso !== null && aviso !== avisoAtual) {
        despachar({ tipo: 'registrarAviso', aviso })
      }
    },
    [avisoAtual, despachar],
  )

  useEffect(() => {
    if (!ativo || leituraFeita.current) {
      return
    }

    const meio = armazenamentoDoNavegador()
    armazenamento.current = meio
    indisponivel.current = meio === null

    const { progresso: salvo, aviso } = lerProgresso(meio)
    leituraFeita.current = true
    despachar({ tipo: 'substituirProgresso', progresso: salvo })
    avisar(aviso)
  }, [ativo, avisar, despachar])

  useEffect(() => {
    if (!ativo || !leituraFeita.current) {
      return
    }

    const resultado = gravarProgresso(armazenamento.current, progresso)
    if (resultado.ok) {
      // Uma gravação que deu certo limpa o aviso da tentativa anterior.
      if (avisoAtual !== null && avisoAtual.includes('salvar')) {
        despachar({ tipo: 'registrarAviso', aviso: null })
      }
      return
    }

    avisar(resultado.aviso)
  }, [ativo, avisoAtual, despachar, progresso, avisar])

  const apagar = useCallback(() => {
    const resultado = apagarProgresso(armazenamento.current)
    if (!resultado.ok) {
      avisar(resultado.aviso)
      return false
    }
    return true
  }, [avisar])

  return { apagar, indisponivel: indisponivel.current }
}
