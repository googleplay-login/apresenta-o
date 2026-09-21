import { describe, expect, it } from 'vitest'
import {
  VERSAO_DO_PROGRESSO,
  descreverEstado,
  estadoDaUnidade,
  ordenarUnidades,
  progressoDaUnidade,
  progressoInicial,
  proximaUnidade,
  registrarResultado,
  resumoDaUnidade,
  unidadeEstaAcessivel,
  type Progresso,
  type UnidadeDoPercurso,
} from './percurso'

/** Quatro unidades, como o percurso planejado. */
const UNIDADES: readonly UnidadeDoPercurso[] = [
  { id: 'u01', ordem: 1 },
  { id: 'u02', ordem: 2 },
  { id: 'u03', ordem: 3 },
  { id: 'u04', ordem: 4 },
]

const APROVADO = { acertos: 5, total: 5 }
const REPROVADO = { acertos: 2, total: 5 }

/** Aprova uma unidade a partir de um progresso. */
function aprovando(progresso: Progresso, unidadeId: string): Progresso {
  return registrarResultado(progresso, UNIDADES, unidadeId, APROVADO)
}

describe('progresso inicial', () => {
  it('começa vazio e com a versão do formato registrada', () => {
    const progresso = progressoInicial()
    expect(progresso.versao).toBe(VERSAO_DO_PROGRESSO)
    expect(progresso.unidades).toEqual({})
  })

  it('tem a primeira unidade disponível e todas as outras bloqueadas', () => {
    const progresso = progressoInicial()
    expect(estadoDaUnidade(progresso, UNIDADES, 'u01')).toBe('disponivel')
    expect(estadoDaUnidade(progresso, UNIDADES, 'u02')).toBe('bloqueada')
    expect(estadoDaUnidade(progresso, UNIDADES, 'u03')).toBe('bloqueada')
    expect(estadoDaUnidade(progresso, UNIDADES, 'u04')).toBe('bloqueada')
  })

  it('não permite entrar em unidade bloqueada', () => {
    const progresso = progressoInicial()
    expect(unidadeEstaAcessivel(progresso, UNIDADES, 'u01')).toBe(true)
    expect(unidadeEstaAcessivel(progresso, UNIDADES, 'u02')).toBe(false)
  })
})

describe('desbloqueio de uma unidade por vez', () => {
  it('aprovar a primeira abre somente a segunda', () => {
    const progresso = aprovando(progressoInicial(), 'u01')

    expect(estadoDaUnidade(progresso, UNIDADES, 'u01')).toBe('aprovada')
    expect(estadoDaUnidade(progresso, UNIDADES, 'u02')).toBe('disponivel')
    expect(estadoDaUnidade(progresso, UNIDADES, 'u03')).toBe('bloqueada')
    expect(estadoDaUnidade(progresso, UNIDADES, 'u04')).toBe('bloqueada')
  })

  it('pular a segunda não abre a terceira', () => {
    // Aprovar 1 e depois tentar a 3 no mesmo progresso: a 3 continua bloqueada,
    // porque quem abre a 3 é a aprovação da 2.
    const depoisDaPrimeira = aprovando(progressoInicial(), 'u01')
    expect(unidadeEstaAcessivel(depoisDaPrimeira, UNIDADES, 'u03')).toBe(false)
  })

  it('recusa registrar resultado de unidade bloqueada', () => {
    // Sem esta recusa, daria para acumular aprovação numa unidade fechada e
    // "chegar antes" do portão. Não existe caminho alternativo: a única entrada
    // capaz de mudar o estado exige uma unidade acessível.
    const depoisDaPrimeira = aprovando(progressoInicial(), 'u01')

    expect(() => registrarResultado(depoisDaPrimeira, UNIDADES, 'u03', APROVADO)).toThrow(
      /está bloqueada/,
    )
    expect(() => registrarResultado(progressoInicial(), UNIDADES, 'u02', APROVADO)).toThrow(
      /está bloqueada/,
    )
    expect(progressoDaUnidade(depoisDaPrimeira, 'u03')).toBeNull()
  })

  it('aprovar em sequência abre todas', () => {
    let progresso = progressoInicial()
    for (const unidade of UNIDADES) {
      progresso = aprovando(progresso, unidade.id)
    }

    for (const unidade of UNIDADES) {
      expect(estadoDaUnidade(progresso, UNIDADES, unidade.id)).toBe('aprovada')
    }
    expect(proximaUnidade(progresso, UNIDADES)).toBeNull()
  })

  it('aponta a próxima unidade a estudar', () => {
    const progresso = aprovando(aprovando(progressoInicial(), 'u01'), 'u02')
    expect(proximaUnidade(progresso, UNIDADES)?.id).toBe('u03')
  })
})

describe('reprovação não pune', () => {
  it('reprovar deixa a unidade acessível e não muda o estado de portão', () => {
    const progresso = registrarResultado(progressoInicial(), UNIDADES, 'u01', REPROVADO)

    expect(estadoDaUnidade(progresso, UNIDADES, 'u01')).toBe('disponivel')
    expect(unidadeEstaAcessivel(progresso, UNIDADES, 'u01')).toBe(true)
    expect(estadoDaUnidade(progresso, UNIDADES, 'u02')).toBe('bloqueada')
  })

  it('reprovar depois de aprovar não revoga a aprovação', () => {
    const aprovada = aprovando(progressoInicial(), 'u01')
    const depoisDeReprovar = registrarResultado(aprovada, UNIDADES, 'u01', REPROVADO)

    expect(estadoDaUnidade(depoisDeReprovar, UNIDADES, 'u01')).toBe('aprovada')
    expect(estadoDaUnidade(depoisDeReprovar, UNIDADES, 'u02')).toBe('disponivel')
  })

  it('conta as tentativas sem limite', () => {
    let progresso = progressoInicial()
    for (let i = 0; i < 7; i += 1) {
      progresso = registrarResultado(progresso, UNIDADES, 'u01', REPROVADO)
    }

    expect(progressoDaUnidade(progresso, 'u01')?.tentativas).toBe(7)
    expect(progressoDaUnidade(progresso, 'u01')?.aprovada).toBe(false)
  })
})

describe('melhor nota', () => {
  it('guarda a melhor nota, que só melhora', () => {
    let progresso = registrarResultado(progressoInicial(), UNIDADES, 'u01', {
      acertos: 4,
      total: 5,
    })
    expect(progressoDaUnidade(progresso, 'u01')?.melhorNota).toEqual({ acertos: 4, total: 5 })

    progresso = registrarResultado(progresso, UNIDADES, 'u01', APROVADO)
    expect(progressoDaUnidade(progresso, 'u01')?.melhorNota).toEqual({ acertos: 5, total: 5 })

    // Tentativa pior depois não apaga a melhor nota nem a aprovação.
    progresso = registrarResultado(progresso, UNIDADES, 'u01', REPROVADO)
    expect(progressoDaUnidade(progresso, 'u01')?.melhorNota).toEqual({ acertos: 5, total: 5 })
    expect(progressoDaUnidade(progresso, 'u01')?.aprovada).toBe(true)
    expect(progressoDaUnidade(progresso, 'u01')?.tentativas).toBe(3)
  })

  it('não foi aprovada enquanto a melhor nota não alcançar o mínimo', () => {
    const progresso = registrarResultado(progressoInicial(), UNIDADES, 'u01', {
      acertos: 3,
      total: 5,
    })
    expect(progressoDaUnidade(progresso, 'u01')?.aprovada).toBe(false)
  })
})

describe('progresso é imutável e serializável', () => {
  it('não altera o progresso anterior', () => {
    const antes = progressoInicial()
    const depois = aprovando(antes, 'u01')

    expect(antes.unidades).toEqual({})
    expect(depois.unidades).not.toBe(antes.unidades)
    expect(progressoDaUnidade(antes, 'u01')).toBeNull()
  })

  it('sobrevive à ida e volta pelo JSON', () => {
    // O progresso vai ser gravado em armazenamento local. Se ele não sobrevive
    // a JSON, a gravação vai falhar mais tarde, quando a persistência existir.
    const aprovada = aprovando(progressoInicial(), 'u01')
    const progresso = registrarResultado(aprovada, UNIDADES, 'u02', REPROVADO)
    const copiado = JSON.parse(JSON.stringify(progresso)) as Progresso

    expect(copiado).toEqual(progresso)
    expect(estadoDaUnidade(copiado, UNIDADES, 'u01')).toBe('aprovada')
    expect(estadoDaUnidade(copiado, UNIDADES, 'u02')).toBe('disponivel')
    expect(progressoDaUnidade(copiado, 'u02')?.tentativas).toBe(1)
    expect(progressoDaUnidade(copiado, 'u02')?.melhorNota).toEqual(REPROVADO)
  })
})

describe('unidade desconhecida é recusada', () => {
  it('recusa consultar o estado de uma unidade fora do percurso', () => {
    expect(() => estadoDaUnidade(progressoInicial(), UNIDADES, 'u99')).toThrow(
      /Unidade desconhecida: u99/,
    )
  })

  it('recusa registrar resultado de uma unidade fora do percurso', () => {
    // É o que impede alguém de criar progresso para uma unidade inventada.
    expect(() => registrarResultado(progressoInicial(), UNIDADES, 'u99', APROVADO)).toThrow(
      /Unidade desconhecida: u99/,
    )
  })
})

describe('ordenação do percurso', () => {
  it('ordena por ordem, independente da ordem de entrada', () => {
    const baguncadas: readonly UnidadeDoPercurso[] = [
      { id: 'u03', ordem: 3 },
      { id: 'u01', ordem: 1 },
      { id: 'u04', ordem: 4 },
      { id: 'u02', ordem: 2 },
    ]
    expect(ordenarUnidades(baguncadas).map((unidade) => unidade.id)).toEqual([
      'u01',
      'u02',
      'u03',
      'u04',
    ])
  })

  it('recusa identificador repetido', () => {
    expect(() => ordenarUnidades([{ id: 'u01', ordem: 1 }, { id: 'u01', ordem: 2 }])).toThrow(
      /Unidade repetida/,
    )
  })

  it('recusa ordem repetida, que quebraria a ideia de unidade anterior', () => {
    expect(() => ordenarUnidades([{ id: 'u01', ordem: 1 }, { id: 'u02', ordem: 1 }])).toThrow(
      /Ordem repetida/,
    )
  })
})

describe('texto de exibição', () => {
  it('descreve os três estados', () => {
    expect(descreverEstado('bloqueada')).toBe('Bloqueada')
    expect(descreverEstado('disponivel')).toBe('Disponível')
    expect(descreverEstado('aprovada')).toBe('Aprovada')
  })

  it('resume estado, tentativas e melhor nota', () => {
    // Primeira tentativa aprova com 100%; a segunda repete a mesma nota.
    const aprovada = aprovando(progressoInicial(), 'u01')
    const progresso = registrarResultado(aprovada, UNIDADES, 'u01', { acertos: 5, total: 5 })
    const resumo = resumoDaUnidade(progresso, UNIDADES, 'u01')

    expect(progressoDaUnidade(progresso, 'u01')?.tentativas).toBe(2)
    expect(resumo.estado).toBe('aprovada')
    expect(resumo.texto).toBe('Aprovada · 2 tentativas · melhor nota: 5 de 5 acertos (100%)')
  })

  it('resume unidade nunca tentada sem falar de nota', () => {
    expect(resumoDaUnidade(progressoInicial(), UNIDADES, 'u01')).toEqual({
      estado: 'disponivel',
      texto: 'Disponível',
    })
  })
})
