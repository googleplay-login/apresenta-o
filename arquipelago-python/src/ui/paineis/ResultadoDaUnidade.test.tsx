// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { ResultadoDaUnidade } from './ResultadoDaUnidade'
import { CONTEUDO_DAS_UNIDADES } from '../../content/unidades'
import { type Resposta } from '../../learning/avaliacao'
import userEvent from '@testing-library/user-event'

/**
 * O passo de resultado, com DOM de verdade.
 *
 * O que este arquivo prova: a nota exibida, o placar, o que a revisão conta de
 * cada pergunta e o que a tela promete sobre a próxima ilha. O que ele **não**
 * prova: aparência, contraste e leitura em voz alta.
 *
 * O caso mais importante aqui é o da explicação: ela aparece em **todas** as
 * perguntas, inclusive nas que a pessoa acertou (D-036).
 */

afterEach(() => {
  cleanup()
})

const UNIDADE = CONTEUDO_DAS_UNIDADES[0]

if (UNIDADE === undefined) {
  throw new Error('Sem conteúdo para testar o resultado')
}

const TOTAL = UNIDADE.perguntas.length

/** Respostas que acertam `quantos` perguntas e erram o resto. */
function respostasComAcertos(quantos: number): readonly Resposta[] {
  return UNIDADE!.perguntas.map((pergunta, indice) =>
    indice < quantos ? pergunta.correta : (pergunta.correta + 1) % pergunta.alternativas.length,
  )
}

function desenhar(props: {
  acertos: number
  aprovadaAntes?: boolean
  tentativas?: number
  melhorAcertos?: number
  temProxima?: boolean
}) {
  const respostas = respostasComAcertos(props.acertos)
  return render(
    <ResultadoDaUnidade
      conteudo={UNIDADE!}
      respostas={respostas}
      resultado={{ acertos: props.acertos, total: TOTAL }}
      aprovadaAntes={props.aprovadaAntes ?? false}
      tentativas={props.tentativas ?? 1}
      melhorNota={{ acertos: props.melhorAcertos ?? props.acertos, total: TOTAL }}
      aoRefazer={() => {}}
      aoVoltarAoEstudo={() => {}}
      aoSeguir={() => {}}
      temProxima={props.temProxima ?? true}
    />,
  )
}

describe('a nota e o placar', () => {
  it('mostra a fração exata e o percentual', () => {
    desenhar({ acertos: 4 })

    expect(screen.getByText('Aprovado nesta ilha')).toBeTruthy()
    expect(screen.getByText('4 de 5 acertos (80%)')).toBeTruthy()
  })

  it('conta a tentativa e diz qual é a melhor nota até agora', () => {
    desenhar({ acertos: 3, tentativas: 2, melhorAcertos: 4 })

    expect(screen.getByText('Ainda não foi desta vez')).toBeTruthy()
    expect(screen.getByText(/tentativa nº 2/)).toBeTruthy()
    expect(screen.getByText(/melhor nota até agora: 4 de 5 acertos \(80%\)/)).toBeTruthy()
  })

  it('não promete a próxima ilha quando esta é a última', () => {
    desenhar({ acertos: 5, temProxima: false })

    expect(screen.getByText(/última ilha escrita até agora/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Seguir para a próxima ilha' })).toBeNull()
  })

  it('reconhece quem já havia aprovado a ilha antes desta tentativa', () => {
    desenhar({ acertos: 5, aprovadaAntes: true })

    expect(screen.getByText(/já havia aprovado esta ilha/)).toBeTruthy()
  })

  it('não bloqueia nada quando reprova', () => {
    desenhar({ acertos: 2 })

    expect(screen.getByText(/Nada foi bloqueado/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Rever o estudo' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Refazer a avaliação' })).toBeTruthy()
  })
})

describe('a revisão de cada pergunta', () => {
  it('explica todas as perguntas, e não só as erradas', () => {
    // Quem acertou por sorte é quem mais precisa da explicação. Esconder o
    // "porquê" de quem acertou trata acerto como fim, e não como parte do estudo.
    desenhar({ acertos: 5 })

    for (const pergunta of UNIDADE!.perguntas) {
      expect(screen.getByText(pergunta.explicacao)).toBeTruthy()
    }
  })

  it('mostra o que a pessoa marcou e qual era a resposta certa', () => {
    desenhar({ acertos: 2 })

    const errada = UNIDADE!.perguntas[3]
    const marcada = errada?.alternativas[(errada.correta + 1) % errada.alternativas.length] ?? ''
    const certa = errada?.alternativas[errada.correta] ?? ''

    // Uma linha por pergunta errada, dizendo as duas coisas: o que foi marcado e
    // qual era a resposta certa.
    expect(screen.getAllByText(/^Você marcou/).length).toBe(TOTAL - 2)
    expect(screen.getAllByText(certa).length).toBeGreaterThan(0)
    expect(screen.getAllByText(marcada).length).toBeGreaterThan(0)
  })

  it('conta os acertos na revisão, sem maquiar os erros', () => {
    desenhar({ acertos: 3 })

    expect(screen.getAllByText(/^Você acertou\.$/).length).toBe(3)
    expect(screen.getAllByText(/^Você marcou/).length).toBe(TOTAL - 3)
  })

  it('trata pergunta deixada em branco, em vez de fingir que foi respondida', () => {
    // Não deveria acontecer — o envio exige todas as respostas —, mas a tela de
    // resultado não pode inventar uma marcação que não existiu.
    const respostas = respostasComAcertos(5).map((resposta, indice) => (indice === 1 ? null : resposta))

    render(
      <ResultadoDaUnidade
        conteudo={UNIDADE!}
        respostas={respostas}
        resultado={{ acertos: 4, total: TOTAL }}
        aprovadaAntes={false}
        tentativas={1}
        melhorNota={{ acertos: 4, total: TOTAL }}
        aoRefazer={() => {}}
        aoVoltarAoEstudo={() => {}}
        aoSeguir={() => {}}
        temProxima
      />,
    )

    expect(screen.getByText(/Esta ficou em branco/)).toBeTruthy()
  })
})

describe('o foco e as ações', () => {
  it('leva o foco para o anúncio do resultado', () => {
    // A tela inteira mudou por causa de um clique: quem usa leitor de tela
    // precisa ouvir o anúncio, e quem usa teclado precisa saber onde está.
    desenhar({ acertos: 4 })

    expect(document.activeElement).toBe(screen.getByText('Aprovado nesta ilha'))
  })

  it('leva para a próxima ilha quando há aprovação e há próxima', async () => {
    let seguiu = 0
    render(
      <ResultadoDaUnidade
        conteudo={UNIDADE!}
        respostas={respostasComAcertos(5)}
        resultado={{ acertos: 5, total: TOTAL }}
        aprovadaAntes={false}
        tentativas={1}
        melhorNota={{ acertos: 5, total: TOTAL }}
        aoRefazer={() => {}}
        aoVoltarAoEstudo={() => {}}
        aoSeguir={() => {
          seguiu += 1
        }}
        temProxima
      />,
    )

    await userEvent.setup().click(screen.getByRole('button', { name: 'Seguir para a próxima ilha' }))
    expect(seguiu).toBe(1)
  })
})
