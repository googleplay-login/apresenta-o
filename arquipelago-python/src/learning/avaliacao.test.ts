import { describe, expect, it } from 'vitest'
import {
  ACERTOS_MINIMOS_PADRAO,
  NOTA_MINIMA_PERCENTUAL,
  PERGUNTAS_POR_UNIDADE,
  avaliarRespostas,
  compararNotas,
  contarEmBranco,
  descreverNota,
  foiAprovado,
  percentualExato,
  percentualExibido,
  respostasCompletas,
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
