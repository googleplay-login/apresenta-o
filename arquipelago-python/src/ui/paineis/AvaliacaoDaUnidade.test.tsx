// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AvaliacaoDaUnidade } from './AvaliacaoDaUnidade'
import { CONTEUDO_DAS_UNIDADES } from '../../content/unidades'
import {
  AVISO_DE_HONESTIDADE,
  acertosMinimos,
  type Resposta,
} from '../../learning/avaliacao'

/**
 * O passo de avaliação, com DOM de verdade.
 *
 * O que este arquivo prova: o que a tela diz, o que ela não diz antes do envio,
 * para onde o teclado vai e quando o botão de enviar libera. O que ele **não**
 * prova: aparência, leitura em voz alta por leitor de tela e o comportamento do
 * envio no domínio — isso é `src/learning/avaliacao.test.ts` e
 * `src/app/paginas/Mundo.interacao.test.tsx`.
 */

afterEach(() => {
  cleanup()
})

const UNIDADE = CONTEUDO_DAS_UNIDADES[0]

if (UNIDADE === undefined) {
  throw new Error('Sem conteúdo para testar a avaliação')
}

const TOTAL = UNIDADE.perguntas.length
const EM_BRANCO: readonly Resposta[] = Array.from({ length: TOTAL }, () => null)

function desenhar(respostas: readonly Resposta[], enviado = false, aoEnviar = () => {}) {
  return render(
    <AvaliacaoDaUnidade
      conteudo={UNIDADE!}
      respostas={respostas}
      enviado={enviado}
      aoResponder={() => {}}
      aoEnviar={aoEnviar}
    />,
  )
}

describe('o enunciado da avaliação', () => {
  it('diz que a correção roda no navegador e que não é antifraude', () => {
    desenhar(EM_BRANCO)
    expect(screen.getByText(AVISO_DE_HONESTIDADE)).toBeTruthy()
  })

  it('diz quantos acertos aprovam, com o número vindo do domínio', () => {
    desenhar(EM_BRANCO)
    expect(screen.getByText(new RegExp(`${acertosMinimos(TOTAL)} acertos já aprovam`))).toBeTruthy()
  })

  it('avisa que a nota na tela não é arredondada para cima', () => {
    desenhar(EM_BRANCO)
    expect(screen.getByText(/nunca é arredondado para cima/)).toBeTruthy()
  })

  it('não corrige nada antes do envio', () => {
    // A regra combinada é corrigir só depois de enviar. Antes disso não pode
    // existir nenhuma marca de certo, de errado, nem a resposta certa na tela.
    desenhar(EM_BRANCO)

    expect(screen.queryByText(/Você acertou/)).toBeNull()
    expect(screen.queryByText(/A resposta certa é/)).toBeNull()
    expect(screen.queryByText(/Você marcou/)).toBeNull()
  })
})

describe('o envio incompleto', () => {
  it('mantém o botão desabilitado e diz quais perguntas faltam', async () => {
    desenhar([0, null, 2, null, null])

    const enviar = screen.getByRole('button', { name: 'Enviar respostas' })
    expect((enviar as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByText('Faltam responder as perguntas 2, 4 e 5.')).toBeTruthy()

    // Clicar num botão desabilitado não faz nada — nem chega ao domínio.
    const usuario = userEvent.setup()
    await usuario.click(enviar)
    expect(screen.queryByText(/Você acertou/)).toBeNull()
  })

  it('liga o botão ao estado por aria-describedby', () => {
    desenhar(EM_BRANCO)

    const enviar = screen.getByRole('button', { name: 'Enviar respostas' })
    const descrito = enviar.getAttribute('aria-describedby')
    expect(descrito).toBeTruthy()
    expect(document.getElementById(descrito ?? '')?.textContent).toMatch(/Faltam responder/)
  })

  it('oferece um atalho por pergunta em branco', () => {
    desenhar([0, null, 2, null, null])

    expect(screen.getByRole('button', { name: 'Responder a pergunta 2' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Responder a pergunta 4' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Responder a pergunta 5' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Responder a pergunta 1' })).toBeNull()
  })

  it('leva o foco para a pergunta quando o atalho é usado', async () => {
    // Sem isso, quem navega por teclado teria de atravessar a avaliação inteira
    // para achar o que ficou em branco.
    desenhar(EM_BRANCO)
    const usuario = userEvent.setup()

    await usuario.click(screen.getByRole('button', { name: 'Responder a pergunta 3' }))

    const campo = screen.getByRole('radio', {
      name: UNIDADE!.perguntas[2]?.alternativas[0] ?? '',
    })
    expect(document.activeElement).toBe(campo)
  })
})

describe('o envio completo', () => {
  it('libera o botão e explica o que vem depois', () => {
    desenhar([0, 1, 2, 3, 4])

    const enviar = screen.getByRole('button', { name: 'Enviar respostas' })
    expect((enviar as HTMLButtonElement).disabled).toBe(false)
    expect(screen.getByText(/Todas as 5 perguntas estão respondidas/)).toBeTruthy()
    expect(screen.queryByText(/^Falta/)).toBeNull()
  })

  it('chama o envio uma única vez por clique', async () => {
    const aoEnviar = vi.fn()
    desenhar([0, 1, 2, 3, 4], false, aoEnviar)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Enviar respostas' }))

    expect(aoEnviar).toHaveBeenCalledTimes(1)
  })

  it('depois do envio tranca as respostas e o botão desaparece', () => {
    // Corrigir só depois de enviar inclui o outro lado: depois de enviar, não se
    // mexe mais nas respostas.
    desenhar([0, 1, 2, 3, 4], true)

    for (const campo of screen.getAllByRole('group')) {
      expect((campo as HTMLFieldSetElement).disabled).toBe(true)
    }
    expect(screen.queryByRole('button', { name: 'Enviar respostas' })).toBeNull()
  })
})
