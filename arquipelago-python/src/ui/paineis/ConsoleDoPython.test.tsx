// @vitest-environment jsdom

import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConsoleDoPython } from './ConsoleDoPython'
import { usePython, type Execucao, type Python } from '../../python/usePython'
import { LIMITE_DE_CARACTERES, motivoDaRecusa } from '../../python/protocolo'

/**
 * O console de Python na tela.
 *
 * O que este arquivo prova: o que a tela diz antes de carregar qualquer coisa,
 * o que acontece com uma recusa, o que aparece na saída e o que o console
 * **não** promete. O que ele **não** prova: que o Web Worker funcione no
 * navegador — isso é do roteiro manual, e o Python de verdade é exercitado em
 * `src/python/pyodideDeVerdade.test.ts`, rodando em Node.
 */

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

/** Um interpretador falso, com o estado que o teste quiser. */
function falso(parcial: Partial<Python> = {}): Python {
  return {
    estado: 'parado',
    versao: null,
    falha: null,
    carregando: false,
    ultima: null,
    demorando: false,
    carregar: () => {},
    executar: () => null,
    reiniciar: () => {},
    ...parcial,
  }
}

describe('antes de carregar', () => {
  it('diz quanto vai baixar, e não baixa nada sozinho', () => {
    const carregar = vi.fn()
    render(<ConsoleDoPython python={falso({ carregar })} />)

    const botao = screen.getByRole('button', { name: /Ligar o Python \(baixa cerca de 14 MB uma vez\)/ })
    expect(botao).toBeTruthy()
    // Nada é carregado por abrir a aba: o download só começa no clique (D-040).
    expect(carregar).not.toHaveBeenCalled()
  })

  it('avisa que o Python ainda não foi carregado', () => {
    render(<ConsoleDoPython python={falso()} />)
    expect(screen.getByText(/ainda não foi carregado: nada foi baixado até você clicar/)).toBeTruthy()
  })

  it('não oferece o botão de recomeçar enquanto não há o que recomeçar', () => {
    render(<ConsoleDoPython python={falso()} />)
    expect(screen.queryByRole('button', { name: 'Recomeçar do zero' })).toBeNull()
  })

  it('diz o que o console não é, sem prometer segurança', () => {
    render(<ConsoleDoPython python={falso()} />)

    // O aviso é um parágrafo com um `<strong>` no começo: o texto do elemento
    // que carrega o `<strong>` é só o rótulo, e o corpo está no parágrafo.
    const aviso = screen.getByText(/O que isto não é:/).closest('p')
    expect(aviso?.textContent).toMatch(/não é uma caixa à prova de fuga/)
    expect(aviso?.textContent).toMatch(/não é o Python do seu computador/)
    expect(aviso?.textContent).toMatch(/assume o risco/)
    expect(aviso?.textContent).not.toMatch(/totalmente seguro|à prova de tudo|inviolável/i)
  })

  it('não promete ler arquivos nem pedir dados pelo teclado', () => {
    render(<ConsoleDoPython python={falso()} />)
    expect(screen.getByText(/não funcionam neste console/)).toBeTruthy()
  })
})

describe('carregando e pronto', () => {
  it('o clique no botão pede o carregamento', async () => {
    const carregar = vi.fn()
    render(<ConsoleDoPython python={falso({ carregar })} />)

    await userEvent.setup().click(screen.getByRole('button', { name: /Ligar o Python/ }))
    expect(carregar).toHaveBeenCalledTimes(1)
  })

  it('enquanto carrega, o botão diz o que está acontecendo e não dá para clicar de novo', () => {
    render(<ConsoleDoPython python={falso({ estado: 'carregando', carregando: true })} />)

    const botao = screen.getByRole('button', { name: 'Carregando o Python…' })
    expect((botao as HTMLButtonElement).disabled).toBe(true)
  })

  it('quando fica pronto, mostra a versão do Python e o botão de recomeçar', () => {
    render(<ConsoleDoPython python={falso({ estado: 'pronto', versao: '3.14.0' })} />)

    expect(screen.getByRole('status').textContent).toBe('Python 3.14.0 pronto, rodando neste navegador.')
    expect(screen.getByRole('button', { name: 'Recomeçar do zero' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Ligar o Python/ })).toBeNull()
  })
})

describe('o programa que demora demais', () => {
  it('diz que pode estar travado, e onde está a saída', () => {
    // O interpretador não tem como interromper um laço infinito por dentro: a
    // saída é descartar o trabalhador. A tela precisa dizer isso em vez de
    // ficar parada como se o programa estivesse certo.
    render(
      <ConsoleDoPython python={falso({ estado: 'pronto', versao: '3.14.0', demorando: true })} />,
    )

    const aviso = screen.getByRole('alert')
    expect(aviso.textContent).toMatch(/demorando mais do que o esperado/)
    expect(aviso.textContent).toMatch(/Recomeçar do zero/)
    expect(screen.getByRole('button', { name: 'Recomeçar do zero' })).toBeTruthy()
  })
})

describe('a falha do carregamento', () => {
  it('aparece na tela, com o motivo, em vez de sumir', () => {
    render(
      <ConsoleDoPython
        python={falso({ estado: 'falhou', falha: 'Este ambiente não oferece Web Worker.' })}
      />,
    )

    expect(screen.getByRole('alert').textContent).toMatch(/não foi possível carregar o python/i)
    expect(screen.getByRole('alert').textContent).toMatch(/Web Worker/)
  })
})

describe('rodar um programa', () => {
  it('recusa campo vazio com o motivo, sem chamar o interpretador', async () => {
    const executar = vi.fn(() => motivoDaRecusa(''))
    render(<ConsoleDoPython python={falso({ estado: 'pronto', versao: '3.14.0', executar })} />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Rodar' }))

    expect(executar).toHaveBeenCalledWith('')
    expect(screen.getByRole('alert').textContent).toMatch(/campo está vazio/)
  })

  it('leva o código digitado para o interpretador', async () => {
    const executar = vi.fn(() => null)
    const usuario = userEvent.setup()
    render(<ConsoleDoPython python={falso({ estado: 'pronto', versao: '3.14.0', executar })} />)

    await usuario.type(screen.getByLabelText('Seu programa'), 'print("oi")')
    await usuario.click(screen.getByRole('button', { name: 'Rodar' }))

    expect(executar).toHaveBeenCalledWith('print("oi")')
  })

  it('mostra a saída do programa', () => {
    const ultima: Execucao = { id: 1, codigo: 'print("oi")', linhas: ['oi'], foiErro: false }
    render(<ConsoleDoPython python={falso({ estado: 'pronto', versao: '3.14.0', ultima })} />)

    expect(screen.getByText('Saída:')).toBeTruthy()
    expect(screen.getByText('oi')).toBeTruthy()
  })

  it('mostra o valor da última expressão junto da saída', () => {
    const ultima: Execucao = {
      id: 2,
      codigo: 'print("soma")\n2 + 3',
      linhas: ['soma', '→ 5'],
      foiErro: false,
    }
    render(<ConsoleDoPython python={falso({ estado: 'pronto', versao: '3.14.0', ultima })} />)

    // A saída é um bloco de código com várias linhas: o `textContent` tem a
    // quebra de linha, e o nome acessível do `pre` não.
    const saida = screen.getByText(/→ 5/).closest('pre')
    expect(saida?.textContent).toBe('soma\n→ 5')
  })

  it('mostra a mensagem de erro do Python inteira, sem reescrever', () => {
    const traceback = 'Traceback (most recent call last):\nZeroDivisionError: division by zero'
    const ultima: Execucao = {
      id: 3,
      codigo: 'print(1/0)',
      linhas: traceback.split('\n'),
      foiErro: true,
    }
    render(<ConsoleDoPython python={falso({ estado: 'pronto', versao: '3.14.0', ultima })} />)

    expect(screen.getByText(/O Python parou com esta mensagem:/)).toBeTruthy()
    expect(screen.getByText(/ZeroDivisionError: division by zero/)).toBeTruthy()
    expect(screen.getByText(/Mensagem do próprio Python, sem reescrita/)).toBeTruthy()
  })

  it('diz quando o programa rodou sem produzir saída', () => {
    const ultima: Execucao = {
      id: 4,
      codigo: 'x = 1',
      linhas: ['(o programa rodou sem produzir saída)'],
      foiErro: false,
    }
    render(<ConsoleDoPython python={falso({ estado: 'pronto', versao: '3.14.0', ultima })} />)

    expect(screen.getByText(/o programa rodou sem produzir saída/)).toBeTruthy()
  })
})

describe('o campo de código', () => {
  it('conta os caracteres e diz o limite', async () => {
    const usuario = userEvent.setup()
    render(<ConsoleDoPython python={falso()} />)

    const campo = screen.getByLabelText('Seu programa')
    await usuario.type(campo, 'print(1)')

    expect(campo.getAttribute('maxlength')).toBe(String(LIMITE_DE_CARACTERES))
    expect(screen.getByText(new RegExp(`8 de ${LIMITE_DE_CARACTERES} caracteres`))).toBeTruthy()
  })

  it('Ctrl+Enter roda o programa sem tirar a mão do teclado', async () => {
    const executar = vi.fn(() => null)
    const usuario = userEvent.setup()
    render(<ConsoleDoPython python={falso({ estado: 'pronto', versao: '3.14.0', executar })} />)

    await usuario.type(screen.getByLabelText('Seu programa'), '1 + 1')
    await usuario.keyboard('{Control>}{Enter}{/Control}')

    expect(executar).toHaveBeenCalledWith('1 + 1')
  })

  it('limpa o campo quando pedido', async () => {
    const usuario = userEvent.setup()
    render(<ConsoleDoPython python={falso()} />)

    const campo = screen.getByLabelText('Seu programa') as HTMLTextAreaElement
    await usuario.type(campo, 'print(1)')
    await usuario.click(screen.getByRole('button', { name: 'Limpar o campo' }))

    expect(campo.value).toBe('')
  })

  it('as sugestões preenchem o campo com o código do exercício', async () => {
    const usuario = userEvent.setup()
    render(
      <ConsoleDoPython
        python={falso()}
        sugestoes={[{ titulo: 'Usar a solução do exercício 1', codigo: 'print("kiwi")' }]}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Usar a solução do exercício 1' }))

    expect((screen.getByLabelText('Seu programa') as HTMLTextAreaElement).value).toBe('print("kiwi")')
  })
})

describe('o gancho de verdade, num ambiente sem Web Worker', () => {
  it('falha em voz alta, em vez de deixar um botão sem efeito', async () => {
    // jsdom não tem Web Worker — que é exatamente a situação de um navegador
    // antigo. O que este teste cobra é a regra do projeto: sem o recurso, dizer
    // que ele não existe (D-009), e nunca um botão que não faz nada.
    function Cobaia() {
      const python = usePython()
      const [cliques, setCliques] = useState(0)

      return (
        <>
          <button
            type="button"
            onClick={() => {
              setCliques(cliques + 1)
              python.carregar()
            }}
          >
            Ligar
          </button>
          <p>{python.estado}</p>
          <p>{python.falha ?? 'sem falha'}</p>
        </>
      )
    }

    render(<Cobaia />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Ligar' }))

    expect(screen.getByText('falhou')).toBeTruthy()
    expect(screen.getByText(/não oferece Web Worker/)).toBeTruthy()
  })
})
