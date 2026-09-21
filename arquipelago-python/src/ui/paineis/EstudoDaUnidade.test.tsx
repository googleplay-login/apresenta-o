// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiagramaDaExplicacao, marcarEspacosDasPontas } from './DiagramaDaExplicacao'
import { LeituraDaUnidade } from './LeituraDaUnidade'
import { CONTEUDO_DAS_UNIDADES } from '../../content/unidades'
import { PLANO_DE_UNIDADES } from '../../content/planoDeUnidades'

/**
 * O passo de estudo: a leitura no livro, o marcador e os diagramas.
 *
 * O que este arquivo prova: o texto que o estudante lê, o estado do marcador e a
 * substituição dos espaços no diagrama. O que ele **não** prova: aparência,
 * largura das caixas, contraste e leitura em voz alta por leitor de tela — isso
 * precisa de navegador, e está pendente em `docs/TEST_REPORT.md`.
 */

afterEach(() => {
  cleanup()
})

const UNIDADE = CONTEUDO_DAS_UNIDADES[0]
const PLANEJADA = PLANO_DE_UNIDADES[0]

if (UNIDADE === undefined || PLANEJADA === undefined) {
  throw new Error('Sem conteúdo para testar o passo de estudo')
}

describe('a leitura recomendada dentro do estudo', () => {
  it('mostra qual parte ler e por que ler aquela parte', () => {
    render(
      <LeituraDaUnidade
        conteudo={UNIDADE}
        referencia={PLANEJADA.referencia}
        leituraFeita={false}
        aoMarcarLeitura={() => {}}
      />,
    )

    expect(screen.getByText('1. Ler no livro')).toBeTruthy()
    expect(screen.getByText(UNIDADE.leitura.parte)).toBeTruthy()
    expect(screen.getByText(UNIDADE.leitura.porque)).toBeTruthy()
  })

  it('lista o que procurar na leitura', () => {
    render(
      <LeituraDaUnidade
        conteudo={UNIDADE}
        referencia={PLANEJADA.referencia}
        leituraFeita={false}
        aoMarcarLeitura={() => {}}
      />,
    )

    expect(screen.getByText('O que procurar nesta leitura')).toBeTruthy()
    for (const ponto of UNIDADE.leitura.oQueObservar) {
      expect(screen.getByText(ponto)).toBeTruthy()
    }
  })

  it('diz o que fazer para quem está sem o livro', () => {
    render(
      <LeituraDaUnidade
        conteudo={UNIDADE}
        referencia={PLANEJADA.referencia}
        leituraFeita={false}
        aoMarcarLeitura={() => {}}
      />,
    )

    expect(screen.getByText('Se você não tem o livro agora')).toBeTruthy()
    expect(screen.getByText(UNIDADE.leitura.semOLivro)).toBeTruthy()
  })

  it('diz que a página continua pendente, em vez de inventar um número', () => {
    render(
      <LeituraDaUnidade
        conteudo={UNIDADE}
        referencia={PLANEJADA.referencia}
        leituraFeita={false}
        aoMarcarLeitura={() => {}}
      />,
    )

    expect(screen.getByText(/referência pendente/)).toBeTruthy()
    expect(screen.queryByText(/página \d+/)).toBeNull()
  })

  it('sem referência no plano, não inventa uma linha de referência', () => {
    render(
      <LeituraDaUnidade
        conteudo={UNIDADE}
        referencia={null}
        leituraFeita={false}
        aoMarcarLeitura={() => {}}
      />,
    )

    expect(screen.queryByText(/referência pendente/)).toBeNull()
    expect(screen.getByText(UNIDADE.leitura.parte)).toBeTruthy()
  })
})

describe('o marcador de leitura', () => {
  it('começa desmarcado, e diz que não aprova nada', () => {
    render(
      <LeituraDaUnidade
        conteudo={UNIDADE}
        referencia={PLANEJADA.referencia}
        leituraFeita={false}
        aoMarcarLeitura={() => {}}
      />,
    )

    const botao = screen.getByRole('button', { name: 'Marcar esta leitura como feita' })
    expect(botao.getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByText(/não aprova a ilha, não abre a ponte/)).toBeTruthy()
  })

  it('marcado, o botão desfaz — e o texto continua dizendo a verdade', async () => {
    const usuario = userEvent.setup()
    const aoMarcar = vi.fn()

    render(
      <LeituraDaUnidade
        conteudo={UNIDADE}
        referencia={PLANEJADA.referencia}
        leituraFeita
        aoMarcarLeitura={aoMarcar}
      />,
    )

    const botao = screen.getByRole('button', { name: 'Leitura marcada como feita' })
    expect(botao.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText(/não é prova de nada/)).toBeTruthy()

    await usuario.click(botao)
    expect(aoMarcar).toHaveBeenCalledWith(false)
  })

  it('clicar no botão desmarcado pede para marcar', async () => {
    const usuario = userEvent.setup()
    const aoMarcar = vi.fn()

    render(
      <LeituraDaUnidade
        conteudo={UNIDADE}
        referencia={PLANEJADA.referencia}
        leituraFeita={false}
        aoMarcarLeitura={aoMarcar}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Marcar esta leitura como feita' }))
    expect(aoMarcar).toHaveBeenCalledWith(true)
  })
})

describe('os diagramas', () => {
  it('desenha título, descrição e uma caixa por parte', () => {
    render(
      <DiagramaDaExplicacao
        titulo="Teste"
        descricao="Um desenho de teste"
        partes={[
          { rotulo: 'Primeira', valor: 'a', nota: 'a nota da primeira' },
          { rotulo: 'Segunda', valor: 'b' },
        ]}
      />,
    )

    expect(screen.getByText('Teste')).toBeTruthy()
    expect(screen.getByText('Um desenho de teste')).toBeTruthy()
    expect(screen.getByText('Primeira')).toBeTruthy()
    expect(screen.getByText('a nota da primeira')).toBeTruthy()
    expect(screen.getByText('Segunda')).toBeTruthy()
  })

  it('o texto guardado continua sendo o de verdade: só o desenho troca o espaço', () => {
    const partes = [
      { rotulo: 'O texto', valor: '"  Ilha  "' },
      { rotulo: 'strip()', valor: '"Ilha"' },
    ]

    const { unmount } = render(
      <DiagramaDaExplicacao
        titulo="Espaços"
        descricao="Com os espaços visíveis"
        partes={partes}
        espacosVisiveis
      />,
    )

    // Na tela, os espaços das pontas aparecem como sinal visível...
    expect(screen.getByText('"··Ilha··"')).toBeTruthy()
    // ...e o diagrama diz o que aquele sinal é.
    expect(screen.getByText(/marca um espaço em branco/)).toBeTruthy()

    unmount()

    // Sem a opção ligada, nada é trocado.
    render(
      <DiagramaDaExplicacao titulo="Espaços" descricao="Sem os espaços visíveis" partes={partes} />,
    )
    expect(screen.queryByText('"··Ilha··"')).toBeNull()
    expect(screen.queryByText(/marca um espaço em branco/)).toBeNull()
  })

  it('marca só os espaços das pontas, e não os do meio do texto', () => {
    expect(marcarEspacosDasPontas('"  Ilha  "')).toBe('"··Ilha··"')
    expect(marcarEspacosDasPontas('"duas palavras"')).toBe('"duas palavras"')
    expect(marcarEspacosDasPontas('Ilha')).toBe('Ilha')
    expect(marcarEspacosDasPontas('   ')).toBe('···')
  })

  it('a unidade de espaços em branco é a que precisa do recurso ligado', () => {
    const unidadeDasPalavras = CONTEUDO_DAS_UNIDADES.find(
      (candidata) => candidata.id === 'u03-strings-por-dentro',
    )
    if (unidadeDasPalavras === undefined) {
      throw new Error('A unidade das palavras deveria existir')
    }

    const comEspacos = unidadeDasPalavras.explicacao.filter(
      (bloco) => bloco.tipo === 'diagrama' && bloco.espacosVisiveis === true,
    )

    expect(comEspacos.length).toBeGreaterThanOrEqual(1)
  })
})
