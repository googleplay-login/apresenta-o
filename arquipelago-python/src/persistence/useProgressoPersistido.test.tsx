// @vitest-environment jsdom

import { useMemo, useReducer } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { useProgressoPersistido } from './useProgressoPersistido'
import { CHAVE_DO_PROGRESSO } from './progressoSalvo'
import { VERSAO_DO_PROGRESSO } from '../learning/percurso'
import { criarRedutor, estadoInicial } from '../state/sessao'

/**
 * O gancho que liga o progresso ao armazenamento do navegador.
 *
 * Este arquivo existe por um defeito real: na primeira passada de efeitos, a
 * gravação rodava **antes** de o progresso lido entrar no estado — e, como
 * gravar um progresso sem unidades significa "não há nada guardado", ela
 * **apagava** o progresso que acabara de ser lido. A regravação seguinte
 * consertava a maior parte das vezes, mas quem recarregasse a página com o
 * armazenamento cheio (ou fechasse a aba nesse intervalo) perdia o progresso
 * inteiro.
 *
 * O que este arquivo prova: nenhuma escrita acontece antes de o progresso
 * guardado chegar ao estado, e uma falha de gravação não deixa o dado apagado.
 * O que ele **não** prova: o comportamento de um navegador de verdade, que fica
 * no roteiro manual de `docs/TEST_REPORT.md`.
 */

const PERCURSO = [
  { id: 'u01', ordem: 1 },
  { id: 'u02', ordem: 2 },
]

const PROGRESSO_GUARDADO = {
  versao: VERSAO_DO_PROGRESSO,
  unidades: {
    u01: {
      aprovada: true,
      tentativas: 2,
      melhorNota: { acertos: 4, total: 5 },
      leituraFeita: true,
    },
  },
}

const GUARDADO_EM_TEXTO = JSON.stringify(PROGRESSO_GUARDADO)

/** Componente mínimo: o gancho, o que a tela mostra e o aviso, quando houver. */
function Cobaia() {
  const redutor = useMemo(() => criarRedutor(PERCURSO), [])
  const [estado, despachar] = useReducer(redutor, undefined, () => estadoInicial())

  useProgressoPersistido({
    progresso: estado.progresso,
    avisoAtual: estado.avisoDeGravacao,
    despachar,
  })

  return (
    <>
      <p>{estado.progresso.unidades['u01']?.aprovada ? 'aprovada' : 'zerada'}</p>
      {estado.avisoDeGravacao === null ? null : (
        <p role="status">{estado.avisoDeGravacao}</p>
      )}
    </>
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('primeira passada de efeitos', () => {
  it('não escreve nada antes de o progresso guardado entrar no estado', async () => {
    window.localStorage.setItem(CHAVE_DO_PROGRESSO, GUARDADO_EM_TEXTO)

    const ordem: string[] = []
    const removerOriginal = Storage.prototype.removeItem
    const gravarOriginal = Storage.prototype.setItem

    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(function (
      this: Storage,
      chave: string,
    ) {
      ordem.push(`removeItem:${chave}`)
      removerOriginal.call(this, chave)
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, chave, valor) {
      ordem.push(`setItem:${chave}`)
      gravarOriginal.call(this, chave, valor)
    })

    render(<Cobaia />)

    // O progresso guardado aparece na tela: a leitura funcionou.
    await waitFor(() => expect(screen.getByText('aprovada')).toBeTruthy())

    // A escrita de teste do próprio módulo (`…teste`) não conta: o que importa é
    // a primeira operação sobre a chave do progresso.
    const naChaveDoProgresso = ordem.filter((linha) => linha.endsWith(CHAVE_DO_PROGRESSO))
    const primeira = naChaveDoProgresso[0]

    expect(
      primeira === undefined || primeira.startsWith('setItem'),
      `A primeira operação sobre o progresso guardado foi destrutiva: ${naChaveDoProgresso.join(' → ')}`,
    ).toBe(true)
  })

  it('não apaga o progresso quando a regravação falha por armazenamento cheio', async () => {
    // Armazenamento cheio **depois** da leitura: a escrita de teste do próprio
    // módulo passa, e só a gravação do progresso falha. É este o cenário em que
    // apagar e não conseguir regravar custa o progresso inteiro.
    window.localStorage.setItem(CHAVE_DO_PROGRESSO, GUARDADO_EM_TEXTO)

    const gravarOriginal = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, chave, valor) {
      if (chave === CHAVE_DO_PROGRESSO) {
        throw new DOMException('QuotaExceededError')
      }
      gravarOriginal.call(this, chave, valor)
    })

    render(<Cobaia />)

    await waitFor(() => expect(screen.getByText('aprovada')).toBeTruthy())

    expect(window.localStorage.getItem(CHAVE_DO_PROGRESSO)).toBe(GUARDADO_EM_TEXTO)
  })
})

describe('aviso de gravação', () => {
  it('diz o que aconteceu quando não foi possível salvar', async () => {
    window.localStorage.setItem(CHAVE_DO_PROGRESSO, GUARDADO_EM_TEXTO)

    const gravarOriginal = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, chave, valor) {
      if (chave === CHAVE_DO_PROGRESSO) {
        throw new DOMException('QuotaExceededError')
      }
      gravarOriginal.call(this, chave, valor)
    })

    render(<Cobaia />)

    // A mensagem não pode ser silenciosa: ela diz que a sessão continua valendo
    // e que o que está na tela será perdido ao recarregar.
    const aviso = await screen.findByRole('status')
    expect(aviso.textContent).toMatch(/não foi possível salvar/i)
    expect(aviso.textContent).toMatch(/recarregar/i)
  })
})
