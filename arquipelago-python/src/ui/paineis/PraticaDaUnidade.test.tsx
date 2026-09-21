// @vitest-environment jsdom

import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PraticaDaUnidade } from './PraticaDaUnidade'
import type { Exercicio } from '../../content/tiposDeConteudo'
import { CONTEUDO_DAS_UNIDADES } from '../../content/unidades'
import { LINHA_DA_SONDA, MARCADOR_DA_SONDA } from '../../learning/correcaoDeExercicio'
import type { Execucao, Python } from '../../python/usePython'

/**
 * A aba Prática com a conferência automática.
 *
 * O que este arquivo prova: o que a aba oferece a cada exercício — botão de
 * conferir para quem tem correção, motivo escrito para quem não tem — e que o
 * clique leva o exercício escolhido até o console. O que ele **não** prova: a
 * conferência em si, que é do domínio (`src/learning/correcaoDeExercicio.ts`) e
 * do console (`ConsoleDoPython.test.tsx`), com o interpretador de verdade no
 * teste em Node.
 */

afterEach(cleanup)

const COM_CORRECAO: Exercicio = {
  id: 'e0-1',
  enunciado: 'Guarde 40 numa variável e mostre o valor.',
  conferencia: 'O número 40 aparece na tela.',
  solucao: 'figurinhas = 40\nprint(figurinhas)',
  correcao: {
    saidaEsperada: ['40'],
    limite: 'A conferência olha o que foi impresso; ela não julga o estilo do seu código.',
  },
}

const SEM_CORRECAO: Exercicio = {
  id: 'e0-2',
  enunciado: 'Rode um comando no terminal e anote a versão.',
  conferencia: 'Você deve ter obtido algo como "Python 3.14.0".',
  solucao: 'python3 --version',
  naoRodaNoConsole:
    'Comando de terminal, que só existe no seu computador. Para conferir a versão dentro da ilha, escreva `import sys` e depois `print(sys.version)`.',
}

const COM_ADAPTADA: Exercicio = {
  id: 'e0-3',
  enunciado: 'Peça um nome e mostre-o em maiúsculas, sem espaços sobrando.',
  conferencia: 'Com "  ana  " digitado, a resposta é "ANA".',
  solucao: 'nome = input("Seu nome: ")\nprint(nome.strip().upper())',
  naoRodaNoConsole:
    'O console da ilha não tem teclado para o programa ler. Troque a primeira linha por `nome = "  ana  "` e rode o resto.',
  solucaoQueRodaNoConsole: 'nome = "  ana  "\nprint(nome.strip().upper())',
  correcao: {
    saidaEsperada: ['ANA'],
    limite: 'A conferência procura o ANA na saída; ela não confere de onde veio o nome.',
  },
}

describe('a prática com conferência automática', () => {
  it('diz que a conferência não é nota e não aprova a ilha', () => {
    render(<PraticaDaUnidade exercicios={[COM_CORRECAO]} />)

    const aviso = screen.getByText(/no fim desta aba roda Python de verdade/).closest('p')
    expect(aviso?.textContent).toMatch(/não é nota e não aprova a ilha/)
    expect(aviso?.textContent).toMatch(/quem aprova é a avaliação/)
  })

  it('oferece o botão de conferir só para quem tem correção', () => {
    render(<PraticaDaUnidade exercicios={[COM_CORRECAO, SEM_CORRECAO]} />)

    const botoes = screen.getAllByRole('button', { name: 'Escrever e conferir no console' })
    expect(botoes).toHaveLength(1)
    expect(screen.getByText(/Este exercício não tem conferência automática aqui/)).toBeTruthy()
  })

  it('explica por que o exercício sem conferência não tem conferência', () => {
    render(<PraticaDaUnidade exercicios={[SEM_CORRECAO]} />)

    // O motivo aparece duas vezes de propósito: no lugar do botão que não existe
    // (para quem quer conferir agora) e junto da solução, onde ele explica como
    // rodar a mesma coisa aqui dentro.
    const explicacoes = screen.getAllByText(/Comando de terminal, que só existe no seu computador/)
    expect(explicacoes).toHaveLength(2)
    expect(screen.getByText(/Este exercício não tem conferência automática aqui/)).toBeTruthy()
  })

  it('leva o exercício escolhido até o console, que passa a oferecer a conferência', async () => {
    const usuario = userEvent.setup()
    render(<PraticaDaUnidade exercicios={[SEM_CORRECAO, COM_CORRECAO]} />)

    // Antes do clique não há exercício escolhido: o console não mostra "Rodar e conferir".
    expect(screen.queryByRole('button', { name: 'Rodar e conferir' })).toBeNull()

    await usuario.click(screen.getByRole('button', { name: 'Escrever e conferir no console' }))

    const escolha = screen.getByLabelText('Conferir o programa como resposta de') as HTMLSelectElement
    expect(escolha.value).toBe('e0-1')
    expect(screen.getByRole('button', { name: 'Rodar e conferir' })).toBeTruthy()
    // A lista só oferece o que tem conferência: o exercício de terminal fica de fora.
    expect(screen.queryByRole('option', { name: /Exercício 1$/ })).toBeNull()
  })

  it('mostra a versão adaptada da solução quando o console não roda a de referência', () => {
    render(<PraticaDaUnidade exercicios={[COM_ADAPTADA]} />)

    const solucoes = screen.getByText(/A mesma solução, sem o que o console da ilha não tem/).closest('details')
    expect(solucoes?.textContent).toMatch(/nome = input/)
    expect(solucoes?.textContent).toMatch(/nome = "  ana  "/)
  })

  it('a sugestão do console usa a versão que roda aqui, e não a que trava', async () => {
    const usuario = userEvent.setup()
    render(<PraticaDaUnidade exercicios={[COM_ADAPTADA]} />)

    await usuario.click(screen.getByRole('button', { name: 'Usar a solução do exercício 1' }))

    const campo = screen.getByLabelText('Seu programa') as HTMLTextAreaElement
    expect(campo.value).toBe('nome = "  ana  "\nprint(nome.strip().upper())')
  })
})

describe('a prática com o conteúdo real das quatro unidades', () => {
  it('todo exercício real cai em um dos dois casos: conferível aqui, ou explicado', () => {
    // Cobra do conteúdo de verdade a mesma regra que o validador cobra da forma:
    // nenhum exercício pode chegar à tela sem botão **e** sem explicação.
    const problemas: string[] = []

    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      cleanup()
      render(<PraticaDaUnidade exercicios={unidade.pratica} />)

      // `queryAll` e não `getAll`: zero também é resposta legítima aqui — a
      // unidade 2, por exemplo, tem conferência para os três exercícios.
      const botoes = screen.queryAllByRole('button', { name: 'Escrever e conferir no console' })
        .length
      const explicacoes = screen.queryAllByText(/Este exercício não tem conferência automática aqui/)
        .length

      if (botoes + explicacoes !== unidade.pratica.length) {
        problemas.push(
          `${unidade.id}: ${unidade.pratica.length} exercícios, ${botoes} com botão e ${explicacoes} explicados`,
        )
      }
    }

    expect(problemas, `Exercícios sem saída na prática:\n${problemas.join('\n')}`).toEqual([])
  })
})

/**
 * Um interpretador de mentira que responde, para a conferência acontecer de
 * verdade dentro da aba.
 *
 * Sem isto não há veredito: `usePython` num ambiente sem Web Worker nunca
 * devolve execução, e sem execução nenhuma conferência conclui.
 */
function Cobaia({
  exercicios,
  resposta,
  aoMarcarExercicio,
  conferidos,
}: {
  readonly exercicios: readonly Exercicio[]
  readonly resposta: (codigo: string) => readonly string[]
  readonly aoMarcarExercicio?: (exercicioId: string) => void
  readonly conferidos?: readonly string[]
}) {
  const [ultima, setUltima] = useState<Execucao | null>(null)

  const python: Python = {
    estado: 'pronto',
    versao: '3.14.0',
    falha: null,
    carregando: false,
    ultima,
    demorando: false,
    carregar: () => {},
    executar: (codigo) => {
      setUltima({ id: 1, codigo, linhas: resposta(codigo), foiErro: false })
      return null
    },
    reiniciar: () => {},
  }

  return (
    <PraticaDaUnidade
      exercicios={exercicios}
      conferidos={conferidos}
      aoMarcarExercicio={aoMarcarExercicio}
      python={python}
    />
  )
}

/** A linha que o Python teria impresso, com o valor medido pela sonda. */
function sonda(medida: { readonly indice: number; readonly tipo: string; readonly repr: string }): string {
  return MARCADOR_DA_SONDA + JSON.stringify({ ...medida, str: medida.repr })
}

describe('a conferência que deu certo vira conquista guardada — e só ela', () => {
  it('tudo confere: o exercício é marcado no progresso, e o cartão diz que está guardado', async () => {
    const usuario = userEvent.setup()
    const marcar = vi.fn()

    render(
      <Cobaia
        exercicios={[COM_CORRECAO]}
        resposta={() => ['40']}
        aoMarcarExercicio={marcar}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Escrever e conferir no console' }))
    await usuario.type(screen.getByLabelText('Seu programa'), 'figurinhas = 40')
    await usuario.click(screen.getByRole('button', { name: 'Rodar e conferir' }))

    expect(marcar).toHaveBeenCalledExactlyOnceWith('e0-1')
  })

  it('ainda não confere: nada é guardado', async () => {
    const usuario = userEvent.setup()
    const marcar = vi.fn()

    render(
      <Cobaia
        exercicios={[COM_CORRECAO]}
        resposta={() => ['38']}
        aoMarcarExercicio={marcar}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Escrever e conferir no console' }))
    await usuario.type(screen.getByLabelText('Seu programa'), 'figurinhas = 38')
    await usuario.click(screen.getByRole('button', { name: 'Rodar e conferir' }))

    // Caminho não é conquista: quem ainda está tentando não ganha selo.
    expect(marcar).not.toHaveBeenCalled()
  })

  it('a execução nem chegou ao fim: nada é guardado', async () => {
    const usuario = userEvent.setup()
    const marcar = vi.fn()

    function CobaiaComErro() {
      const [ultima, setUltima] = useState<Execucao | null>(null)
      const python: Python = {
        estado: 'pronto',
        versao: '3.14.0',
        falha: null,
        carregando: false,
        ultima,
        demorando: false,
        carregar: () => {},
        executar: (codigo) => {
          setUltima({ id: 1, codigo, linhas: ['NameError'], foiErro: true })
          return null
        },
        reiniciar: () => {},
      }
      return (
        <PraticaDaUnidade
          exercicios={[COM_CORRECAO]}
          aoMarcarExercicio={marcar}
          python={python}
        />
      )
    }

    render(<CobaiaComErro />)
    await usuario.click(screen.getByRole('button', { name: 'Escrever e conferir no console' }))
    await usuario.click(screen.getByRole('button', { name: 'Rodar e conferir' }))

    // "Não deu para conferir" não é conquista nem fracasso: é falta de medida.
    expect(marcar).not.toHaveBeenCalled()
  })

  it('a conferência mede os valores, e a sonda vai junto com o programa', async () => {
    const usuario = userEvent.setup()
    const enviados: string[] = []
    const COM_VALOR: Exercicio = {
      ...COM_CORRECAO,
      correcao: {
        saidaEsperada: ['40'],
        valoresEsperados: [
          { rotulo: '`figurinhas` termina valendo 40', expressao: 'figurinhas', igualA: '40' },
        ],
        limite: COM_CORRECAO.correcao?.limite ?? '',
      },
    }

    render(
      <Cobaia
        exercicios={[COM_VALOR]}
        resposta={(codigo) => {
          enviados.push(codigo)
          return ['40', sonda({ indice: 0, tipo: 'int', repr: '40' })]
        }}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Escrever e conferir no console' }))
    await usuario.type(screen.getByLabelText('Seu programa'), 'figurinhas = 40')
    await usuario.click(screen.getByRole('button', { name: 'Rodar e conferir' }))

    expect(enviados[0]).toContain(LINHA_DA_SONDA)
    expect(screen.getByText(/\`figurinhas\` termina valendo 40/)).toBeTruthy()
  })

  it('exercício já conferido aparece com o selo, e o selo não promete aprovação', () => {
    render(<PraticaDaUnidade exercicios={[COM_CORRECAO]} conferidos={['e0-1']} />)

    const selo = screen.getByText(/guardado no seu progresso/).closest('p')
    expect(selo?.textContent).toMatch(/não aprova a ilha/)
    expect(selo?.textContent).toMatch(/quem aprova é a avaliação/)
  })
})
