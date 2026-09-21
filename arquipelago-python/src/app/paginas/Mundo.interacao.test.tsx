// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Mundo } from './Mundo'
import { PLANO_DE_UNIDADES } from '../../content/planoDeUnidades'
import { conteudoDaUnidade } from '../../content/unidades'
import { gabaritoDaUnidade } from '../../content/validadorDeConteudo'
import { CHAVE_DO_PROGRESSO } from '../../persistence/progressoSalvo'
import { VERSAO_DO_PROGRESSO } from '../../learning/percurso'
import { AVISO_DE_HONESTIDADE, textoDePendencias, type Resposta } from '../../learning/avaliacao'

/**
 * O ciclo de estudo inteiro, com cliques de verdade, num DOM de verdade.
 *
 * Por que este arquivo existe: até aqui a suíte provava funções puras e HTML
 * estático — nada provava que clicar leva a algum lugar. Sem navegador neste
 * ambiente, `jsdom` é o mais perto que dá para chegar: ele roda o React, dispara
 * eventos e mantém `localStorage`. O WebGL não existe nele, então estes testes
 * percorrem justamente o caminho acessível, sem 3D — que é o caminho de quem
 * está numa máquina sem placa de vídeo.
 *
 * O que continua NÃO verificado aqui: desenho 3D, layout, contraste, arrasto do
 * mouse e desempenho. Isso exige navegador e está em `docs/TEST_REPORT.md` como
 * pendente, com roteiro de teste manual.
 *
 * Cada teste confere o que a tela mostra e o que ficou guardado, porque a maior
 * parte das regras deste projeto é sobre não poder ser contornada pela interface.
 */

const primeira = PLANO_DE_UNIDADES[0]
const segunda = PLANO_DE_UNIDADES[1]

/**
 * O texto do HUD, montado a partir do plano.
 *
 * Escrever o número à mão aqui faria este arquivo inteiro envelhecer em silêncio
 * cada vez que uma ilha nova fosse escrita — e são dezenas de asserções.
 */
const aprovadas = (quantas: number) => `${quantas} de ${PLANO_DE_UNIDADES.length} ilhas aprovadas`

/**
 * Cinco respostas em branco. A mensagem é montada pelo domínio, e não escrita à
 * mão no teste: se o texto mudar, o teste acompanha — o que ele cobra é que a
 * tela diga o que falta, com os números certos.
 */
const CINCO_EM_BRANCO: readonly Resposta[] = [null, null, null, null, null]
const PENDENCIA_DE_CINCO = textoDePendencias(CINCO_EM_BRANCO)

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

/** Abre a ilha pelo cartão da trilha em texto. */
async function abrirIlha(usuario: ReturnType<typeof userEvent.setup>, titulo: string) {
  const cartao = screen.getByRole('heading', { level: 3, name: titulo }).closest('li')
  if (cartao === null) {
    throw new Error(`Cartão da ilha não encontrado: ${titulo}`)
  }
  await usuario.click(within(cartao).getByRole('button', { name: 'Entrar' }))
}

/** Vai direto para o passo da prática pelas abas do painel. */
async function irParaPratica(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.click(screen.getByRole('button', { name: 'Prática' }))
}

/** Vai direto para o passo da avaliação pelas abas do painel. */
async function irParaAvaliacao(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.click(screen.getByRole('button', { name: 'Avaliação' }))
}

/**
 * Responde a avaliação inteira. `erradas` diz quantas perguntas devem ser
 * respondidas com uma alternativa errada, a partir da primeira.
 */
async function responderTudo(
  usuario: ReturnType<typeof userEvent.setup>,
  erradas: number,
  unidadeId: string,
) {
  const conteudo = conteudoDaUnidade(unidadeId)
  if (conteudo === null) {
    throw new Error(`Conteúdo ausente: ${unidadeId}`)
  }

  const gabarito = gabaritoDaUnidade(conteudo)

  // O clique é pelo índice dentro do campo, e não pelo texto da alternativa: o
  // nome acessível passa por normalização de espaços em branco, e uma das
  // alternativas de `u03` tem espaços de propósito (D-034).
  const campos = screen.getAllByRole('group')

  for (const [indice, pergunta] of conteudo.perguntas.entries()) {
    const certa = gabarito[indice] ?? 0
    const escolha = indice < erradas ? (certa + 1) % pergunta.alternativas.length : certa
    const campo = campos[indice]

    if (campo === undefined) {
      throw new Error(`Campo da pergunta ${indice + 1} não encontrado`)
    }

    const alternativas = within(campo).getAllByRole('radio')
    const alternativa = alternativas[escolha]
    if (alternativa === undefined) {
      throw new Error(`Alternativa ${escolha} da pergunta ${indice + 1} não encontrada`)
    }

    await usuario.click(alternativa)
  }
}

describe('abrir e fechar ilhas', () => {
  it('abre a primeira ilha e recebe o foco no painel', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)

    await abrirIlha(usuario, primeira?.titulo ?? '')

    const painel = await screen.findByRole('region', { name: `Unidade ${primeira?.id ?? ''}` })
    expect(within(painel).getByText('Sua missão nesta ilha')).toBeTruthy()

    // A missão aponta para a leitura; a pendência de página é dita no passo
    // Estudo, onde a leitura acontece (D-010).
    expect(within(painel).getByText(/A leitura desta ilha/)).toBeTruthy()

    // O foco entra no painel: com ele aberto, as teclas de movimento não podem
    // continuar chegando à câmera (decisão D-012).
    expect(document.activeElement).toBe(painel)
  })

  it('não abre ilha bloqueada: o botão está desabilitado e nada acontece', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)

    const cartao = screen.getByRole('heading', { level: 3, name: segunda?.titulo ?? '' }).closest('li')
    const botao = within(cartao as HTMLElement).getByRole('button', { name: 'Entrar' })

    expect((botao as HTMLButtonElement).disabled).toBe(true)
    await usuario.click(botao)

    expect(screen.queryByRole('region', { name: `Unidade ${segunda?.id ?? ''}` })).toBeNull()
  })

  it('fecha o painel com Esc, e o mundo volta a aceitar teclado', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)

    await abrirIlha(usuario, primeira?.titulo ?? '')
    await screen.findByRole('region', { name: `Unidade ${primeira?.id ?? ''}` })

    await usuario.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: `Unidade ${primeira?.id ?? ''}` })).toBeNull()
    })

    // O aviso do HUD diz onde o teclado está: fora do painel, o mundo responde.
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).not.toContain('Painel aberto')
    })
  })

  it('não desbloqueia nada pela barra de endereços', async () => {
    // A URL não é fonte de estado de progresso (D-012). Este teste tenta o
    // caminho óbvio: abrir a última ilha por um endereço que a citaria.
    window.location.hash = `#/unidade/${PLANO_DE_UNIDADES[3]?.id ?? ''}?liberada=1`
    render(<Mundo />)

    const cartao = screen
      .getByRole('heading', { level: 3, name: PLANO_DE_UNIDADES[3]?.titulo ?? '' })
      .closest('li')

    const botao = within(cartao as HTMLElement).getByRole('button', { name: 'Entrar' })
    expect((botao as HTMLButtonElement).disabled).toBe(true)
    window.location.hash = ''
  })

  it('fecha o painel e volta para a trilha', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)

    await abrirIlha(usuario, primeira?.titulo ?? '')
    await screen.findByRole('region', { name: `Unidade ${primeira?.id ?? ''}` })

    await usuario.click(screen.getByRole('button', { name: /Fechar/ }))

    await waitFor(() => {
      expect(screen.getByText('As ilhas do arquipélago')).toBeTruthy()
    })
  })
})

describe('avaliação', () => {
  it('recusa o envio enquanto faltar resposta', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)

    await abrirIlha(usuario, primeira?.titulo ?? '')
    await irParaAvaliacao(usuario)

    const enviar = screen.getByRole('button', { name: 'Enviar respostas' })
    expect((enviar as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByText(PENDENCIA_DE_CINCO)).toBeTruthy()

    await usuario.click(enviar)

    // Nada mudou: continua na avaliação, com as opções ainda destravadas e
    // nenhuma nota na tela.
    expect(screen.queryByText('Aprovado nesta ilha')).toBeNull()
    expect(screen.queryByText('Ainda não foi desta vez')).toBeNull()
    expect((screen.getAllByRole('group')[0] as HTMLFieldSetElement).disabled).toBe(false)
  })

  it('não corrige antes do envio: nenhuma marca de certo ou errado', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)

    await abrirIlha(usuario, primeira?.titulo ?? '')
    await irParaAvaliacao(usuario)
    await responderTudo(usuario, 5, primeira?.id ?? '')

    const conteudo = conteudoDaUnidade(primeira?.id ?? '')
    const corretas = (conteudo?.perguntas ?? []).map((pergunta) => pergunta.alternativas[pergunta.correta])

    for (const correta of corretas) {
      if (correta !== undefined) {
        expect(screen.queryByText(/Você acertou/)).toBeNull()
      }
    }

    // Nada de "a resposta certa é ...": a revisão inteira só existe depois do envio.
    expect(screen.queryByText(/A resposta certa é/)).toBeNull()
    expect(screen.queryByText(/Você marcou/)).toBeNull()
    expect(screen.getByText(/Todas as 5 perguntas estão respondidas/)).toBeTruthy()
  })

  it('aprova com 4 de 5, mostra 80% e libera a próxima ilha', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)

    await abrirIlha(usuario, primeira?.titulo ?? '')
    await irParaAvaliacao(usuario)
    await responderTudo(usuario, 1, primeira?.id ?? '')
    await usuario.click(screen.getByRole('button', { name: 'Enviar respostas' }))

    expect(await screen.findByText('Aprovado nesta ilha')).toBeTruthy()
    expect(screen.getByText(/4 de 5 acertos \(80%\)/, { selector: 'p.resultado__nota' })).toBeTruthy()
    // E o placar conta a tentativa a partir do progresso gravado.
    expect(screen.getByText(/tentativa nº 1/)).toBeTruthy()
    expect(screen.getByText(/A ponte para a próxima ilha está inteira/)).toBeTruthy()
  })

  it('reprova com 3 de 5, diz a nota honesta e não bloqueia nada', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)

    await abrirIlha(usuario, primeira?.titulo ?? '')
    await irParaAvaliacao(usuario)
    await responderTudo(usuario, 2, primeira?.id ?? '')
    await usuario.click(screen.getByRole('button', { name: 'Enviar respostas' }))

    expect(await screen.findByText('Ainda não foi desta vez')).toBeTruthy()
    expect(screen.getByText(/3 de 5 acertos \(60%\)/, { selector: 'p.resultado__nota' })).toBeTruthy()
    expect(screen.getByText(/Nada foi bloqueado/)).toBeTruthy()
    // Reprovado: o estudo continua à mão e a avaliação pode ser refeita.
    expect(screen.getByRole('button', { name: 'Rever o estudo' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Refazer a avaliação' })).toBeTruthy()
  })

  it('diz, no enunciado, que a correção roda no navegador e não é antifraude', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)

    await abrirIlha(usuario, primeira?.titulo ?? '')
    await irParaAvaliacao(usuario)

    expect(screen.getByText(AVISO_DE_HONESTIDADE)).toBeTruthy()
  })

  it('reprovar depois de aprovar mantém a aprovação e mostra a melhor nota', async () => {
    // A regra é antiga (reprovar não revoga aprovação nem bloqueia a ilha); este
    // teste percorre o caminho inteiro na tela, incluindo o placar, que passou a
    // contar tentativas no progresso gravado (D-037).
    const usuario = userEvent.setup()
    render(<Mundo />)

    await abrirIlha(usuario, primeira?.titulo ?? '')
    await irParaAvaliacao(usuario)
    await responderTudo(usuario, 0, primeira?.id ?? '')
    await usuario.click(screen.getByRole('button', { name: 'Enviar respostas' }))
    await screen.findByText('Aprovado nesta ilha')

    await usuario.click(screen.getByRole('button', { name: 'Refazer a avaliação' }))
    await responderTudo(usuario, 3, primeira?.id ?? '')
    await usuario.click(screen.getByRole('button', { name: 'Enviar respostas' }))

    expect(await screen.findByText('Ainda não foi desta vez')).toBeTruthy()
    expect(screen.getByText(/tentativa nº 2/)).toBeTruthy()
    expect(screen.getByText(/melhor nota até agora: 5 de 5 acertos \(100%\)/)).toBeTruthy()

    // E o mundo continua com a ilha aprovada: a ponte não voltou atrás. Na
    // trilha, a ilha aprovada troca o botão "Entrar" por "Revisar".
    await usuario.click(screen.getByRole('button', { name: /Fechar/ }))
    const cartao = screen.getByRole('heading', { level: 3, name: primeira?.titulo ?? '' }).closest('li')
    expect(within(cartao as HTMLElement).getByRole('button', { name: 'Revisar' })).toBeTruthy()
    expect(within(cartao as HTMLElement).queryByRole('button', { name: 'Entrar' })).toBeNull()
  })

  it('tranca as respostas depois do envio', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)

    await abrirIlha(usuario, primeira?.titulo ?? '')
    await irParaAvaliacao(usuario)
    await responderTudo(usuario, 0, primeira?.id ?? '')
    await usuario.click(screen.getByRole('button', { name: 'Enviar respostas' }))

    await screen.findByText('Aprovado nesta ilha')
    await usuario.click(screen.getByRole('button', { name: 'Avaliação' }))

    for (const campo of screen.getAllByRole('group')) {
      expect((campo as HTMLFieldSetElement).disabled).toBe(true)
    }
    // Corrigir só depois de enviar: o botão de enviar não volta.
    expect(screen.queryByRole('button', { name: 'Enviar respostas' })).toBeNull()
  })

  it('refazer limpa as respostas e volta a permitir escolher', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)

    await abrirIlha(usuario, primeira?.titulo ?? '')
    await irParaAvaliacao(usuario)
    await responderTudo(usuario, 2, primeira?.id ?? '')
    await usuario.click(screen.getByRole('button', { name: 'Enviar respostas' }))
    await screen.findByText('Ainda não foi desta vez')

    await usuario.click(screen.getByRole('button', { name: 'Refazer a avaliação' }))

    expect(await screen.findByText(PENDENCIA_DE_CINCO)).toBeTruthy()
    const enviar = screen.getByRole('button', { name: 'Enviar respostas' })
    expect((enviar as HTMLButtonElement).disabled).toBe(true)
  })
})

describe('progresso guardado no navegador', () => {
  it('guarda a aprovação e libera a ilha seguinte na mesma sessão', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)

    await abrirIlha(usuario, primeira?.titulo ?? '')
    await irParaAvaliacao(usuario)
    await responderTudo(usuario, 0, primeira?.id ?? '')
    await usuario.click(screen.getByRole('button', { name: 'Enviar respostas' }))
    await screen.findByText('Aprovado nesta ilha')
    expect(screen.getByText(/A ponte para a próxima ilha está inteira/)).toBeTruthy()

    // Aprovar em uma tentativa não pode ser contado como "já estava aprovada".
    expect(screen.queryByText(/Você já havia aprovado/)).toBeNull()

    // Sem 3D, seguir é abrir a missão da ilha recém-liberada.
    await usuario.click(screen.getByRole('button', { name: 'Seguir para a próxima ilha' }))

    const painelSeguinte = await screen.findByRole('region', {
      name: `Unidade ${segunda?.id ?? ''}`,
    })
    expect(within(painelSeguinte).getByText('Sua missão nesta ilha')).toBeTruthy()

    // Fechando, a trilha mostra o que mudou: uma aprovada e a seguinte aberta.
    await usuario.click(screen.getByRole('button', { name: /Fechar/ }))

    await waitFor(() => {
      expect(screen.getByText(aprovadas(1))).toBeTruthy()
    })

    const cartao = screen.getByRole('heading', { level: 3, name: segunda?.titulo ?? '' }).closest('li')
    const botao = within(cartao as HTMLElement).getByRole('button', { name: 'Entrar' })
    expect((botao as HTMLButtonElement).disabled).toBe(false)

    const cartaoAnterior = screen
      .getByRole('heading', { level: 3, name: primeira?.titulo ?? '' })
      .closest('li')
    expect(within(cartaoAnterior as HTMLElement).getByRole('button', { name: 'Revisar' })).toBeTruthy()
  })

  it('grava dado serializável, versionado e sob a chave da aplicação', async () => {
    const usuario = userEvent.setup()
    render(<Mundo />)

    await abrirIlha(usuario, primeira?.titulo ?? '')
    await irParaAvaliacao(usuario)
    await responderTudo(usuario, 0, primeira?.id ?? '')
    await usuario.click(screen.getByRole('button', { name: 'Enviar respostas' }))
    await screen.findByText('Aprovado nesta ilha')

    await waitFor(() => {
      expect(window.localStorage.getItem(CHAVE_DO_PROGRESSO)).not.toBeNull()
    })

    const guardado = JSON.parse(window.localStorage.getItem(CHAVE_DO_PROGRESSO) ?? '{}') as {
      versao?: number
      unidades?: Record<string, { aprovada?: boolean; tentativas?: number }>
    }

    expect(guardado.versao).toBe(VERSAO_DO_PROGRESSO)
    expect(guardado.unidades?.[primeira?.id ?? '']?.aprovada).toBe(true)
    expect(guardado.unidades?.[primeira?.id ?? '']?.tentativas).toBe(1)
    // Somente dado simples: nada de função, componente ou objeto do Three.js.
    expect(JSON.parse(JSON.stringify(guardado))).toEqual(guardado)
  })

  it('lê o progresso guardado antes de gravar, e não o atropela', async () => {
    window.localStorage.setItem(
      CHAVE_DO_PROGRESSO,
      JSON.stringify({
        versao: 1,
        unidades: {
          [segunda?.id ?? '']: { aprovada: true, tentativas: 3, melhorNota: { acertos: 5, total: 5 } },
        },
      }),
    )

    render(<Mundo />)

    // A aprovação guardada aparece já na primeira renderização: a leitura vem
    // antes de qualquer gravação, e o efeito de gravação não a apaga.
    await waitFor(() => {
      expect(screen.getByText(aprovadas(1))).toBeTruthy()
    })
    expect(screen.queryByText(aprovadas(0))).toBeNull()
  })

  it('avisa que o progresso não será guardado quando o navegador recusa gravar', async () => {
    // Modo privado, cota estourada ou armazenamento bloqueado: o estudo continua,
    // mas a tela não pode deixar a pessoa acreditar que o progresso ficou salvo.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError')
    })

    render(<Mundo />)

    expect(await screen.findByText(/não permite guardar dados|não foi possível salvar/i)).toBeTruthy()
    // E o mundo continua jogável: a trilha inteira está na tela.
    expect(screen.getByText(aprovadas(0))).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Entrar' }).length).toBeGreaterThan(0)
  })

  it('apaga só o progresso da aplicação, e só depois de confirmação', async () => {
    // Uma chave de outro site na mesma origem: não pode ser tocada.
    window.localStorage.setItem('outro-site.token', 'nao-mexa')
    window.localStorage.setItem(
      CHAVE_DO_PROGRESSO,
      JSON.stringify({
        versao: 1,
        unidades: { [primeira?.id ?? '']: { aprovada: true, tentativas: 1, melhorNota: null } },
      }),
    )

    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const usuario = userEvent.setup()
    render(<Mundo />)

    await waitFor(() => {
      expect(screen.getByText(aprovadas(1))).toBeTruthy()
    })

    await usuario.click(screen.getByRole('button', { name: 'Apagar meu progresso' }))

    // Recusou a confirmação: nada foi apagado.
    expect(confirmar).toHaveBeenCalled()
    expect(window.localStorage.getItem(CHAVE_DO_PROGRESSO)).not.toBeNull()

    confirmar.mockReturnValue(true)
    await usuario.click(screen.getByRole('button', { name: 'Apagar meu progresso' }))

    await waitFor(() => {
      expect(screen.getByText(aprovadas(0))).toBeTruthy()
    })
    expect(window.localStorage.getItem(CHAVE_DO_PROGRESSO)).toBeNull()
    expect(window.localStorage.getItem('outro-site.token')).toBe('nao-mexa')
  })
})

describe('fim do percurso escrito', () => {
  it('aprovar a última ilha não promete uma ponte que não existe', async () => {
    // Tudo aprovado menos a última: é a última que este teste quer aprovar.
    const idsAprovados = PLANO_DE_UNIDADES.slice(0, -1).map((unidade) => unidade.id)
    window.localStorage.setItem(
      CHAVE_DO_PROGRESSO,
      JSON.stringify({
        versao: 1,
        unidades: Object.fromEntries(
          idsAprovados.map((id) => [
            id,
            { aprovada: true, tentativas: 1, melhorNota: { acertos: 5, total: 5 } },
          ]),
        ),
      }),
    )

    const ultima = PLANO_DE_UNIDADES[PLANO_DE_UNIDADES.length - 1]
    const usuario = userEvent.setup()
    render(<Mundo />)

    await waitFor(() => {
      expect(screen.getByText(aprovadas(PLANO_DE_UNIDADES.length - 1))).toBeTruthy()
    })

    await abrirIlha(usuario, ultima?.titulo ?? '')
    await irParaAvaliacao(usuario)
    await responderTudo(usuario, 0, ultima?.id ?? '')
    await usuario.click(screen.getByRole('button', { name: 'Enviar respostas' }))

    expect(await screen.findByText('Aprovado nesta ilha')).toBeTruthy()
    // Nada de "a ponte para a próxima ilha está inteira": não existe próxima.
    expect(screen.queryByText(/A ponte para a próxima ilha está inteira/)).toBeNull()
    expect(screen.getByText(/última ilha escrita até agora/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Seguir para a próxima ilha' })).toBeNull()

    await usuario.click(screen.getByRole('button', { name: /Fechar/ }))
    await waitFor(() => {
      expect(screen.getByText(aprovadas(PLANO_DE_UNIDADES.length))).toBeTruthy()
    })
  })

  it('com todas aprovadas, o mundo diz que o percurso escrito acabou', async () => {
    // Sem passar o mouse por cima de nada: o HUD mostra a mensagem padrão.
    window.localStorage.setItem(
      CHAVE_DO_PROGRESSO,
      JSON.stringify({
        versao: 1,
        unidades: Object.fromEntries(
          PLANO_DE_UNIDADES.map((unidade) => [
            unidade.id,
            { aprovada: true, tentativas: 1, melhorNota: { acertos: 5, total: 5 } },
          ]),
        ),
      }),
    )

    render(<Mundo />)

    await waitFor(() => {
      expect(screen.getByText(aprovadas(PLANO_DE_UNIDADES.length))).toBeTruthy()
    })
    expect(screen.getByText(/Fim do percurso por enquanto/)).toBeTruthy()

    // E nenhuma ilha fica fechada: revisar tudo continua possível.
    for (const unidade of PLANO_DE_UNIDADES) {
      const cartao = screen.getByRole('heading', { level: 3, name: unidade.titulo }).closest('li')
      const botao = within(cartao as HTMLElement).getByRole('button', { name: /Entrar|Revisar/ })
      expect((botao as HTMLButtonElement).disabled).toBe(false)
    }
  })
})

describe('alternativa sem 3D', () => {
  it('avisa que o 3D não está disponível e mantém a trilha inteira', async () => {
    render(<Mundo />)

    // jsdom não tem WebGL: o aviso honesto aparece em vez de uma tela vazia.
    expect(screen.getByText('Sem desenho 3D nesta máquina')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Voo livre' })).toBeNull()

    for (const unidade of PLANO_DE_UNIDADES) {
      expect(screen.getByRole('heading', { level: 3, name: unidade.titulo })).toBeTruthy()
    }
  })
})

describe('o protótipo jogável, de ponta a ponta', () => {
  it('aprova as ilhas em sequência, sobrevive à recarga e fecha o percurso', async () => {
    const usuario = userEvent.setup()
    const { unmount } = render(<Mundo />)

    expect(await screen.findByText(aprovadas(0))).toBeTruthy()

    for (const [indice, unidade] of PLANO_DE_UNIDADES.entries()) {
      const ultima = indice === PLANO_DE_UNIDADES.length - 1

      // Com o painel aberto, a trilha sai de cena: só se abre a ilha quando o
      // painel ainda não está nela (depois de "Seguir", ele já está).
      if (screen.queryByRole('region', { name: `Unidade ${unidade.id}` }) === null) {
        await abrirIlha(usuario, unidade.titulo)
      }
      await irParaAvaliacao(usuario)
      await responderTudo(usuario, 0, unidade.id)
      await usuario.click(screen.getByRole('button', { name: 'Enviar respostas' }))
      expect(await screen.findByText('Aprovado nesta ilha'), `ilha ${unidade.id}`).toBeTruthy()

      if (indice === 1) {
        // No meio do percurso, a página é recarregada: o progresso tem de
        // sobreviver, e a ilha seguinte tem de continuar destravada.
        unmount()
        render(<Mundo />)
        expect(await screen.findByText(aprovadas(2))).toBeTruthy()
      } else if (!ultima) {
        await usuario.click(screen.getByRole('button', { name: 'Seguir para a próxima ilha' }))
      }
    }

    expect(await screen.findByText(aprovadas(PLANO_DE_UNIDADES.length))).toBeTruthy()

    // Fecha o painel e confere o que o mundo diz com o percurso terminado.
    await usuario.click(screen.getByRole('button', { name: /Fechar/ }))

    // Clicar num cartão dispara `mouseenter`, e o HUD mostra o nome da ilha
    // antes de qualquer outra frase. Sair do cartão devolve o HUD ao estado
    // normal — que é o que está sendo conferido aqui.
    const cartaoDaTerceira = screen
      .getByRole('heading', { level: 3, name: PLANO_DE_UNIDADES[2]?.titulo ?? '' })
      .closest('li')
    fireEvent.mouseLeave(cartaoDaTerceira as HTMLElement)
    expect(
      await screen.findByText(/Todas as ilhas escritas até agora foram aprovadas/),
    ).toBeTruthy()

    // E o que ficou guardado: as unidades aprovadas, sem unidade extra.
    const guardado = JSON.parse(window.localStorage.getItem(CHAVE_DO_PROGRESSO) ?? '{}') as {
      readonly versao?: number
      readonly unidades?: Record<string, { readonly aprovada?: boolean }>
    }
    expect(guardado.versao).toBe(VERSAO_DO_PROGRESSO)
    expect(Object.keys(guardado.unidades ?? {}).sort()).toEqual(
      PLANO_DE_UNIDADES.map((unidade) => unidade.id).sort(),
    )
    for (const unidade of PLANO_DE_UNIDADES) {
      expect(guardado.unidades?.[unidade.id]?.aprovada, `unidade ${unidade.id}`).toBe(true)
    }
  })
})

describe('o exercício conferido, depois de recarregar', () => {
  it('o cartão do exercício conferido volta marcado, e só ele', async () => {
    // O que este teste protege: a aba Prática promete, no cartão, que o
    // resultado conferido está guardado. Se a leitura do progresso não chegasse
    // até o cartão, o selo apareceria e sumiria a cada recarregamento.
    window.localStorage.setItem(
      CHAVE_DO_PROGRESSO,
      JSON.stringify({
        versao: VERSAO_DO_PROGRESSO,
        unidades: {
          [primeira?.id ?? '']: {
            aprovada: false,
            tentativas: 0,
            melhorNota: null,
            leituraFeita: false,
            exerciciosResolvidos: ['e1-2'],
          },
        },
      }),
    )

    const usuario = userEvent.setup()
    render(<Mundo />)

    await abrirIlha(usuario, primeira?.titulo ?? '')
    await irParaPratica(usuario)

    const selos = screen.getAllByText(/este resultado está guardado no seu progresso/)
    expect(selos).toHaveLength(1)

    // O texto do selo diz as duas coisas ao mesmo tempo, e as duas importam:
    // está guardado, e guardar não aprova a ilha.
    const selo = selos[0]?.closest('p')
    expect(selo?.textContent).toMatch(/não aprova a ilha/)
    expect(selo?.textContent).toMatch(/quem aprova é a avaliação/)

    // O selo é do exercício conferido, e não do primeiro da lista: o cartão que
    // o contém começa com o enunciado daquele exercício.
    const exercicio = conteudoDaUnidade(primeira?.id ?? '')?.pratica.find(
      (cada) => cada.id === 'e1-2',
    )
    expect(selo?.closest('li')?.textContent).toContain(exercicio?.enunciado ?? '')
  })

  it('exercício conferido não aprova a ilha nem abre a próxima', async () => {
    window.localStorage.setItem(
      CHAVE_DO_PROGRESSO,
      JSON.stringify({
        versao: VERSAO_DO_PROGRESSO,
        unidades: {
          [primeira?.id ?? '']: {
            aprovada: false,
            tentativas: 0,
            melhorNota: null,
            leituraFeita: false,
            exerciciosResolvidos: ['e1-1', 'e1-2', 'e1-3'],
          },
        },
      }),
    )

    render(<Mundo />)

    await waitFor(() => {
      expect(screen.getByText(aprovadas(0))).toBeTruthy()
    })
    // A segunda ilha continua bloqueada: o caminho é a avaliação, não a prática.
    const cartao = screen.getByRole('heading', { level: 3, name: segunda?.titulo ?? '' }).closest('li')
    expect(cartao?.textContent).toMatch(/bloqueada/i)
  })
})
