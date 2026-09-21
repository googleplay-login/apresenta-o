// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * O caminho com 3D, com DOM de verdade e a cena trocada por um marcador.
 *
 * O que este arquivo prova: quando há placa de vídeo, a cena é buscada,
 * montada e trocada pelo texto em tempo real; os controles de câmera aparecem e
 * funcionam; abrir e fechar o painel devolve o teclado ao mundo.
 *
 * O que continua NÃO provado: os pixels. Triângulo, luz, névoa, câmera e
 * arrasto de mouse só existem com WebGL, que não há aqui nem neste ambiente de
 * desenvolvimento. Está registrado como NÃO EXECUTADO em `docs/TEST_REPORT.md`,
 * com roteiro de teste manual.
 */

let cenaMontada = 0

vi.mock('../../world/Cena', () => ({
  Cena: () => {
    cenaMontada += 1
    return <div data-cena-de-teste="1">cena de mentira</div>
  },
}))

vi.mock('../../world/suporteWebgl', () => ({
  temWebgl: () => true,
  useSuporteWebgl: () => true,
}))

const { Mundo } = await import('./Mundo')

afterEach(() => {
  cleanup()
  cenaMontada = 0
  window.localStorage.clear()
})

describe('mundo com 3D disponível', () => {
  it('busca e monta a cena, saindo do aviso de carregamento', async () => {
    render(<Mundo />)

    expect(await screen.findByText('cena de mentira')).toBeTruthy()
    expect(cenaMontada).toBe(1)
    expect(screen.queryByText(/Preparando o mundo 3D/)).toBeNull()
  })

  it('oferece voo livre e vista de mapa, e marca o modo escolhido', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)
    await screen.findByText('cena de mentira')

    const voo = screen.getByRole('button', { name: 'Voo livre' })
    const mapa = screen.getByRole('button', { name: 'Vista de mapa' })

    expect(voo.className).toContain('botao--ativo')
    expect(mapa.className).not.toContain('botao--ativo')

    await usuario.click(mapa)

    expect(screen.getByRole('button', { name: 'Vista de mapa' }).className).toContain(
      'botao--ativo',
    )
    expect(screen.getByRole('button', { name: 'Voo livre' }).className).not.toContain('botao--ativo')
  })

  it('ensina as teclas enquanto o foco está no mundo', async () => {
    render(<Mundo />)
    await screen.findByText('cena de mentira')

    expect(screen.getByText('Como pilotar')).toBeTruthy()
  })

  it('troca a cena pela alternativa em texto quando o estudante desliga o 3D', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)
    await screen.findByText('cena de mentira')

    await usuario.click(screen.getByRole('button', { name: 'Usar sem 3D' }))

    await waitFor(() => {
      expect(screen.queryByText('cena de mentira')).toBeNull()
    })
    expect(screen.getByText('Modo sem 3D ligado')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Voo livre' })).toBeNull()

    // E volta: o 3D é uma escolha, não uma porta de mão única.
    await usuario.click(screen.getByRole('button', { name: 'Ligar o 3D' }))
    expect(await screen.findByText('cena de mentira')).toBeTruthy()
  })

  it('abre a ilha pelo cartão e tira as teclas do mundo enquanto o painel está aberto', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)
    await screen.findByText('cena de mentira')

    const cartao = screen.getByRole('heading', { level: 3, name: 'A Praia do Primeiro Programa' }).closest('li')
    await usuario.click(
      (cartao as HTMLElement).querySelector('button') as HTMLButtonElement,
    )

    await screen.findByRole('region', { name: 'Unidade u01-primeiro-programa' })
    // Com o painel aberto, a dica de pilotagem sai da tela: as teclas agora
    // pertencem ao estudo, e não à câmera (D-012).
    expect(screen.queryByText('Como pilotar')).toBeNull()
  })
})
