import { describe, expect, it } from 'vitest'
import {
  ACERTOS_MINIMOS_PADRAO,
  AVISO_DE_HONESTIDADE,
  NOTA_MINIMA_PERCENTUAL,
  PERGUNTAS_POR_UNIDADE,
  acertosMinimos,
  avaliarRespostas,
  compararNotas,
  contarEmBranco,
  descreverNota,
  foiAprovado,
  numerosEmBranco,
  percentualExato,
  percentualExibido,
  respostasCompletas,
  textoDePendencias,
  textoDoPlacar,
  validarResultado,
} from './avaliacao'

describe('aprovação com nota real de 80%', () => {
  it('aprova 4 de 5 e reprova 3 de 5', () => {
    expect(foiAprovado({ acertos: 4, total: 5 })).toBe(true)
    expect(foiAprovado({ acertos: 3, total: 5 })).toBe(false)
  })

  it('aprova exatamente 80% e reprova logo abaixo', () => {
    expect(foiAprovado({ acertos: 8, total: 10 })).toBe(true)
    expect(foiAprovado({ acertos: 7, total: 10 })).toBe(false)
    expect(foiAprovado({ acertos: 80, total: 100 })).toBe(true)
    expect(foiAprovado({ acertos: 79, total: 100 })).toBe(false)
  })

  it('reprova 3 de 4, que dá 75%', () => {
    expect(foiAprovado({ acertos: 3, total: 4 })).toBe(false)
    expect(foiAprovado({ acertos: 4, total: 4 })).toBe(true)
  })

  it('reprova 2 de 3, que dá 66,6%', () => {
    expect(foiAprovado({ acertos: 2, total: 3 })).toBe(false)
    expect(percentualExato({ acertos: 2, total: 3 })).toBeCloseTo(66.6667, 3)
  })

  it('aprova 100% e reprova zero', () => {
    expect(foiAprovado({ acertos: 5, total: 5 })).toBe(true)
    expect(foiAprovado({ acertos: 0, total: 5 })).toBe(false)
  })

  it('usa a mesma regra que as constantes declaradas', () => {
    expect(foiAprovado({ acertos: ACERTOS_MINIMOS_PADRAO, total: PERGUNTAS_POR_UNIDADE })).toBe(true)
    expect(foiAprovado({ acertos: ACERTOS_MINIMOS_PADRAO - 1, total: PERGUNTAS_POR_UNIDADE })).toBe(
      false,
    )
    expect(NOTA_MINIMA_PERCENTUAL).toBe(80)
  })

  it('nunca aprova abaixo de 80% reais, em nenhum total', () => {
    // Invariante: se aprovou, os acertos reais cobrem os 80%. Sem ponto flutuante.
    for (let total = 1; total <= 60; total += 1) {
      for (let acertos = 0; acertos <= total; acertos += 1) {
        if (foiAprovado({ acertos, total })) {
          expect(acertos * 100).toBeGreaterThanOrEqual(NOTA_MINIMA_PERCENTUAL * total)
        }
      }
    }
  })
})

describe('exibição da nota não engana', () => {
  it('arredonda sempre para baixo, nunca para cima', () => {
    expect(percentualExibido({ acertos: 2, total: 3 })).toBe(66)
    expect(percentualExibido({ acertos: 7, total: 9 })).toBe(77)
    expect(percentualExibido({ acertos: 4, total: 5 })).toBe(80)
    expect(percentualExibido({ acertos: 1, total: 6 })).toBe(16)
  })

  it('nunca mostra 80% ou mais quando a decisão foi reprovar', () => {
    // O defeito que este teste evita: mostrar "80%" e reprovar, ou mostrar "79%"
    // e aprovar. Percentual exibido e decisão não podem se contradizer.
    for (let total = 1; total <= 60; total += 1) {
      for (let acertos = 0; acertos <= total; acertos += 1) {
        const aprovado = foiAprovado({ acertos, total })
        const exibido = percentualExibido({ acertos, total })

        if (aprovado) {
          expect(exibido, `${acertos}/${total} foi aprovado e exibiu ${exibido}%`).toBeGreaterThanOrEqual(80)
        } else {
          expect(exibido, `${acertos}/${total} foi reprovado e exibiu ${exibido}%`).toBeLessThan(80)
        }
      }
    }
  })

  it('descreve a nota com a fração exata e o percentual para baixo', () => {
    expect(descreverNota({ acertos: 4, total: 5 })).toBe('4 de 5 acertos (80%)')
    expect(descreverNota({ acertos: 7, total: 10 })).toBe('7 de 10 acertos (70%)')
    expect(descreverNota({ acertos: 2, total: 3 })).toBe('2 de 3 acertos (66%)')
  })
})

describe('comparação de notas sem ponto flutuante', () => {
  it('diz qual nota é melhor', () => {
    expect(compararNotas({ acertos: 5, total: 5 }, { acertos: 4, total: 5 })).toBeGreaterThan(0)
    expect(compararNotas({ acertos: 4, total: 5 }, { acertos: 5, total: 5 })).toBeLessThan(0)
    expect(compararNotas({ acertos: 4, total: 5 }, { acertos: 4, total: 5 })).toBe(0)
  })

  it('compara corretamente notas de totais diferentes', () => {
    // 8 de 10 (80%) é melhor que 3 de 4 (75%), mesmo com menos "proporção de erro".
    expect(compararNotas({ acertos: 8, total: 10 }, { acertos: 3, total: 4 })).toBeGreaterThan(0)
    expect(compararNotas({ acertos: 1, total: 2 }, { acertos: 4, total: 10 })).toBeGreaterThan(0)
  })
})

describe('validação de resultado impossível', () => {
  it('recusa total zero ou negativo', () => {
    expect(() => validarResultado({ acertos: 0, total: 0 })).toThrow(/Total de perguntas inválido/)
    expect(() => validarResultado({ acertos: 0, total: -5 })).toThrow(/Total de perguntas inválido/)
  })

  it('recusa acertos maiores que o total, negativos ou fracionários', () => {
    expect(() => validarResultado({ acertos: 6, total: 5 })).toThrow(/Acertos inválido/)
    expect(() => validarResultado({ acertos: -1, total: 5 })).toThrow(/Acertos inválido/)
    expect(() => validarResultado({ acertos: 2.5, total: 5 })).toThrow(/Acertos inválido/)
    expect(() => validarResultado({ acertos: 3, total: 5.5 })).toThrow(/Total de perguntas inválido/)
  })
})

describe('perguntas em branco', () => {
  it('exige que todas as perguntas sejam respondidas', () => {
    expect(respostasCompletas([0, 1, 2, 3, 4])).toBe(true)
    expect(respostasCompletas([0, 1, null, 3, 4])).toBe(false)
    expect(respostasCompletas([])).toBe(false)
  })

  it('conta quantas faltam', () => {
    expect(contarEmBranco([0, null, null, 3])).toBe(2)
    expect(contarEmBranco([0, 1, 2, 3])).toBe(0)
  })
})

describe('correção da avaliação', () => {
  const gabarito = [1, 0, 2, 1, 0]

  it('conta os acertos comparando com o gabarito', () => {
    expect(avaliarRespostas([1, 0, 2, 1, 0], gabarito)).toEqual({ acertos: 5, total: 5 })
    expect(avaliarRespostas([1, 0, 2, 1, 9], gabarito)).toEqual({ acertos: 4, total: 5 })
    expect(avaliarRespostas([9, 9, 9, 9, 9], gabarito)).toEqual({ acertos: 0, total: 5 })
  })

  it('recusa envio com pergunta em branco', () => {
    expect(() => avaliarRespostas([1, 0, null, 1, 0], gabarito)).toThrow(/Faltam 1 respostas/)
  })

  it('recusa quantidade de respostas diferente do gabarito', () => {
    expect(() => avaliarRespostas([1, 0, 2], gabarito)).toThrow(/diferente do gabarito/)
  })
})

describe('a honestidade do enunciado', () => {
  it('diz, em texto visível, que a correção roda no navegador e não é antifraude', () => {
    // A regra está em `docs/STATE_MACHINE.md` e `docs/CONTENT_GUIDE.md` desde a
    // Etapa 2 — e não estava na tela até a Etapa 7. O teste cobra as três
    // informações que o enunciado é obrigado a dar.
    expect(AVISO_DE_HONESTIDADE).toMatch(/navegador/)
    expect(AVISO_DE_HONESTIDADE).toMatch(/não é antifraude/)
    expect(AVISO_DE_HONESTIDADE).toMatch(/aprender/)
  })

  it('não promete teste inviolável', () => {
    expect(AVISO_DE_HONESTIDADE).not.toMatch(/inviolável|impossível de burlar|seguro contra/)
  })
})

describe('o que falta responder, com os números das perguntas', () => {
  it('lista os números contando de 1, como na tela', () => {
    expect(numerosEmBranco([0, null, 2, null, null])).toEqual([2, 4, 5])
    expect(numerosEmBranco([0, 1, 2, 3, 4])).toEqual([])
    expect(numerosEmBranco([])).toEqual([])
  })

  it('monta a frase certa para um, dois e cinco em branco', () => {
    expect(textoDePendencias([0, 1, 2, 3, null])).toBe('Falta responder a pergunta 5.')
    expect(textoDePendencias([0, null, 2, null, 4])).toBe('Faltam responder as perguntas 2 e 4.')
    expect(textoDePendencias([null, null, null, null, null])).toBe(
      'Faltam responder as perguntas 1, 2, 3, 4 e 5.',
    )
  })

  it('usa vírgula e "e" na lista, sem repetir a conjunção', () => {
    expect(textoDePendencias([null, null, null, 3, 4])).toBe('Faltam responder as perguntas 1, 2 e 3.')
  })

  it('avisa que dá para enviar quando não falta nada', () => {
    const texto = textoDePendencias([0, 1, 2, 3, 4])
    expect(texto).toMatch(/Todas as 5 perguntas estão respondidas/)
    expect(texto).toMatch(/depois do envio não dá para voltar/)
  })

  it('não diz "faltam algumas": só existe a contagem exata', () => {
    expect(textoDePendencias([0, null, 2, 3, 4])).not.toMatch(/algumas|alguns/)
  })
})

describe('quantos acertos aprovam', () => {
  it('é o primeiro número que passa na regra, medido em inteiros', () => {
    expect(acertosMinimos(5)).toBe(ACERTOS_MINIMOS_PADRAO)
    expect(acertosMinimos(10)).toBe(8)
    expect(acertosMinimos(4)).toBe(4)
    expect(acertosMinimos(3)).toBe(3)
    expect(acertosMinimos(1)).toBe(1)
  })

  it('um acerto a menos reprova, em todos os totais de 1 a 60', () => {
    // A mesma varredura da regra de aprovação, agora amarrada ao número que a
    // tela anuncia. Se os dois discordarem, a tela promete o que a correção nega.
    for (let total = 1; total <= 60; total += 1) {
      const minino = acertosMinimos(total)
      expect(foiAprovado({ acertos: minino, total }), `total ${total}`).toBe(true)
      if (minino > 0) {
        expect(foiAprovado({ acertos: minino - 1, total }), `total ${total}`).toBe(false)
      }
    }
  })

  it('recusa total impossível', () => {
    expect(() => acertosMinimos(0)).toThrow(/inválido/)
    expect(() => acertosMinimos(-3)).toThrow(/inválido/)
    expect(() => acertosMinimos(2.5)).toThrow(/inválido/)
  })
})

describe('o placar da unidade', () => {
  it('conta a tentativa e diz que a nota atual é a melhor', () => {
    const nota = { acertos: 4, total: 5 }
    expect(textoDoPlacar(1, nota, nota)).toBe(
      'Esta foi a tentativa nº 1 — e é a sua melhor nota até agora: 4 de 5 acertos (80%).',
    )
  })

  it('quando a tentativa é pior, mostra a melhor guardada', () => {
    // Reprovar não apaga a aprovação anterior: a melhor nota continua valendo, e
    // a tela precisa dizer isso em vez de exibir só o resultado do momento.
    const texto = textoDoPlacar(2, { acertos: 5, total: 5 }, { acertos: 2, total: 5 })
    expect(texto).toBe('Esta foi a tentativa nº 2. Sua melhor nota até agora: 5 de 5 acertos (100%).')
  })

  it('placar sem tentativa nenhuma é erro de programação, e não texto vazio', () => {
    expect(() => textoDoPlacar(0, { acertos: 0, total: 5 }, { acertos: 0, total: 5 })).toThrow(
      /tentativas inválido/,
    )
  })
})
