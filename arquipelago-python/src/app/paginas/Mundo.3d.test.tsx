// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PonteVisivel } from '../../world/mundoVisivel'
import { conteudoDaUnidade } from '../../content/unidades'
import { gabaritoDaUnidade } from '../../content/validadorDeConteudo'

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

/**
 * A cena de mentira também expõe as pontes como botões.
 *
 * Assim o caminho do clique na ponte — que na cena de verdade acontece sobre
 * geometria, e não sobre HTML — pode ser percorrido aqui: a decisão continua
 * sendo a de `decidirTravessia()`, que é função pura e testada à parte.
 */
vi.mock('../../world/Cena', () => ({
  Cena: (props: {
    readonly pontes: readonly PonteVisivel[]
    readonly aoEscolherPonte: (ponte: PonteVisivel) => void
  }) => {
    cenaMontada += 1
    return (
      <div data-cena-de-teste="1">
        cena de mentira
        {props.pontes.map((ponte) => (
          <button
            key={`${ponte.de}-${ponte.para}`}
            type="button"
            onClick={() => props.aoEscolherPonte(ponte)}
          >
            ponte para {ponte.para}
          </button>
        ))}
      </div>
    )
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

describe('travessia pelas pontes', () => {
  it('clicar na ponte pela metade não abre nada e explica o que falta', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)
    await screen.findByText('cena de mentira')

    await usuario.click(screen.getByRole('button', { name: 'ponte para u02-variaveis-e-print' }))

    // O aviso diz o que falta, com o nome da ilha de origem e a nota mínima.
    const aviso = await screen.findByText(/pela metade de propósito/)
    expect(aviso.textContent).toContain('A Praia do Primeiro Programa')
    expect(aviso.textContent).toContain('80%')

    // E nada foi aberto: a ponte não é caminho para dentro da ilha.
    expect(screen.queryByRole('region', { name: 'Unidade u02-variaveis-e-print' })).toBeNull()
    expect(screen.queryByText('Sua missão nesta ilha')).toBeNull()
  })

  it('depois da aprovação, a ponte inteira leva o estudante à ilha seguinte', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)
    await screen.findByText('cena de mentira')

    // Aprova a primeira ilha pelo caminho normal: entrar, avaliar, enviar.
    const cartao = screen
      .getByRole('heading', { level: 3, name: 'A Praia do Primeiro Programa' })
      .closest('li')
    await usuario.click((cartao as HTMLElement).querySelector('button') as HTMLButtonElement)
    await usuario.click(screen.getByRole('button', { name: 'Avaliação' }))

    const conteudo = conteudoDaUnidade('u01-primeiro-programa')
    if (conteudo === null) {
      throw new Error('Conteúdo da primeira unidade ausente')
    }
    const gabarito = gabaritoDaUnidade(conteudo)
    for (const [indice, pergunta] of conteudo.perguntas.entries()) {
      const certa = pergunta.alternativas[gabarito[indice] ?? 0] ?? ''
      await usuario.click(screen.getByRole('radio', { name: certa }))
    }
    await usuario.click(screen.getByRole('button', { name: 'Enviar respostas' }))
    await screen.findByText('Aprovado nesta ilha')

    // Com 3D, atravessar a ponte é fechar o painel e voar até lá: a câmera é o
    // deslocamento, e não a abertura de outra tela.
    await usuario.click(screen.getByRole('button', { name: 'ponte para u02-variaveis-e-print' }))

    await waitFor(() => {
      expect(
        screen.queryByRole('region', { name: 'Unidade u01-primeiro-programa' }),
      ).toBeNull()
    })
    expect(screen.getByText('Como pilotar')).toBeTruthy()
    // A ponte não libera aprovação nenhuma: quem faz isso é o domínio, e a
    // segunda ilha só apareceu porque a primeira foi aprovada acima.
    expect(screen.queryByText(/pela metade de propósito/)).toBeNull()
  })
})
