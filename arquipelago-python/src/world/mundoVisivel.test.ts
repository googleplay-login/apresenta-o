import { describe, expect, it } from 'vitest'
import { PLANO_DE_UNIDADES } from '../content/planoDeUnidades'
import { progressoInicial, registrarResultado, type Progresso } from '../learning/percurso'
import {
  ilhaAtual,
  ilhasVisiveis,
  pontesVisiveis,
  resumoDoMundo,
} from './mundoVisivel'

/** Aprova as unidades indicadas, em ordem, usando o domínio de verdade. */
function comAprovadas(...ids: readonly string[]): Progresso {
  const percurso = PLANO_DE_UNIDADES.map((unidade) => ({ id: unidade.id, ordem: unidade.ordem }))
  return ids.reduce(
    (progresso, id) => registrarResultado(progresso, percurso, id, { acertos: 5, total: 5 }),
    progressoInicial(),
  )
}

const PRIMEIRA = PLANO_DE_UNIDADES[0]!.id
const SEGUNDA = PLANO_DE_UNIDADES[1]!.id
const TERCEIRA = PLANO_DE_UNIDADES[2]!.id

describe('ilhas visíveis', () => {
  it('no começo, só a primeira está acessível', () => {
    const ilhas = ilhasVisiveis(progressoInicial(), PLANO_DE_UNIDADES)
    expect(ilhas.length).toBe(PLANO_DE_UNIDADES.length)
    expect(ilhas[0]?.situacao).toBe('disponivel')
    expect(ilhas[0]?.acessivel).toBe(true)
    for (const ilha of ilhas.slice(1)) {
      expect(ilha.situacao).toBe('bloqueada')
      expect(ilha.acessivel).toBe(false)
    }
  })

  it('aprovar a primeira abre a segunda e apenas ela', () => {
    const ilhas = ilhasVisiveis(comAprovadas(PRIMEIRA), PLANO_DE_UNIDADES)
    expect(ilhas[0]?.situacao).toBe('aprovada')
    expect(ilhas[1]?.situacao).toBe('disponivel')
    expect(ilhas[2]?.situacao).toBe('bloqueada')
  })

  it('a situação vem do domínio, e não de uma cópia da regra', () => {
    // Aprovar fora de ordem tem de ser recusado pelo domínio, e o mundo não pode
    // inventar um caminho alternativo para a ilha aparecer acessível.
    expect(() => comAprovadas(SEGUNDA)).toThrow(/bloqueada/)
    const ilhas = ilhasVisiveis(progressoInicial(), PLANO_DE_UNIDADES)
    expect(ilhas.find((ilha) => ilha.id === SEGUNDA)?.acessivel).toBe(false)
  })

  it('mantém as coordenadas do mapa, sem alterar posição', () => {
    const semProgresso = ilhasVisiveis(progressoInicial(), PLANO_DE_UNIDADES)
    const comProgresso = ilhasVisiveis(comAprovadas(PRIMEIRA, SEGUNDA), PLANO_DE_UNIDADES)
    expect(comProgresso.map((ilha) => ilha.centro)).toEqual(
      semProgresso.map((ilha) => ilha.centro),
    )
  })
})

describe('pontes visíveis', () => {
  it('no começo, nenhuma ponte está liberada', () => {
    const progresso = progressoInicial()
    const ilhas = ilhasVisiveis(progresso, PLANO_DE_UNIDADES)
    const pontes = pontesVisiveis(progresso, PLANO_DE_UNIDADES, ilhas)

    expect(pontes.length).toBe(PLANO_DE_UNIDADES.length - 1)
    expect(pontes.every((ponte) => !ponte.liberada)).toBe(true)
  })

  it('aprovar a primeira libera exatamente a ponte para a segunda', () => {
    const progresso = comAprovadas(PRIMEIRA)
    const ilhas = ilhasVisiveis(progresso, PLANO_DE_UNIDADES)
    const pontes = pontesVisiveis(progresso, PLANO_DE_UNIDADES, ilhas)

    const liberadas = pontes.filter((ponte) => ponte.liberada)
    expect(liberadas.length).toBe(1)
    expect(liberadas[0]?.para).toBe(SEGUNDA)
    expect(liberadas[0]?.de).toBe(PRIMEIRA)
  })

  it('a ponte anterior continua liberada depois de avançar', () => {
    const progresso = comAprovadas(PRIMEIRA, SEGUNDA)
    const ilhas = ilhasVisiveis(progresso, PLANO_DE_UNIDADES)
    const pontes = pontesVisiveis(progresso, PLANO_DE_UNIDADES, ilhas)

    expect(pontes.filter((ponte) => ponte.liberada).map((ponte) => ponte.para)).toEqual([
      SEGUNDA,
      TERCEIRA,
    ])
  })

  it('cada ponte liga ilhas vizinhas, na ordem', () => {
    const ilhas = ilhasVisiveis(progressoInicial(), PLANO_DE_UNIDADES)
    const pontes = pontesVisiveis(progressoInicial(), PLANO_DE_UNIDADES, ilhas)

    for (let indice = 0; indice < pontes.length; indice += 1) {
      expect(pontes[indice]?.de).toBe(ilhas[indice]?.id)
      expect(pontes[indice]?.para).toBe(ilhas[indice + 1]?.id)
    }
  })
})

describe('ilha atual', () => {
  it('no começo é a primeira', () => {
    expect(ilhaAtual(progressoInicial(), PLANO_DE_UNIDADES)?.id).toBe(PRIMEIRA)
  })

  it('depois de aprovar, é a próxima ainda não aprovada', () => {
    expect(ilhaAtual(comAprovadas(PRIMEIRA), PLANO_DE_UNIDADES)?.id).toBe(SEGUNDA)
    expect(ilhaAtual(comAprovadas(PRIMEIRA, SEGUNDA), PLANO_DE_UNIDADES)?.id).toBe(TERCEIRA)
  })

  it('quando todas são aprovadas, continua apontando para uma ilha — a última', () => {
    const todas = PLANO_DE_UNIDADES.map((unidade) => unidade.id)
    const ultima = PLANO_DE_UNIDADES[PLANO_DE_UNIDADES.length - 1]!.id
    expect(ilhaAtual(comAprovadas(...todas), PLANO_DE_UNIDADES)?.id).toBe(ultima)
  })

  it('sem unidades, não há ilha atual', () => {
    expect(ilhaAtual(progressoInicial(), [])).toBeNull()
  })
})

describe('resumo do mundo', () => {
  it('conta as aprovadas sobre o total', () => {
    expect(resumoDoMundo(progressoInicial(), PLANO_DE_UNIDADES)).toEqual({
      aprovadas: 0,
      total: PLANO_DE_UNIDADES.length,
    })
    expect(resumoDoMundo(comAprovadas(PRIMEIRA), PLANO_DE_UNIDADES)).toEqual({
      aprovadas: 1,
      total: PLANO_DE_UNIDADES.length,
    })
  })
})
