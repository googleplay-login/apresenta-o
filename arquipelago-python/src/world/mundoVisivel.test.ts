import { describe, expect, it } from 'vitest'
import { PLANO_DE_UNIDADES } from '../content/planoDeUnidades'
import { progressoInicial, registrarResultado, type Progresso } from '../learning/percurso'
import {
  decidirTravessia,
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

describe('travessia pela ponte', () => {
  it('recusa atravessar a ponte pela metade, e diz qual aprovação falta', () => {
    const progresso = progressoInicial()
    const ilhas = ilhasVisiveis(progresso, PLANO_DE_UNIDADES)
    const pontes = pontesVisiveis(progresso, PLANO_DE_UNIDADES, ilhas)

    const decisao = decidirTravessia(pontes[0]!, ilhas)

    expect(decisao.tipo).toBe('recusar')
    if (decisao.tipo === 'recusar') {
      expect(decisao.motivo).toContain(PLANO_DE_UNIDADES[0]!.titulo)
      expect(decisao.motivo).toContain('80%')
      expect(decisao.motivo).toContain('pela metade')
    }
  })

  it('libera a travessia depois da aprovação', () => {
    const progresso = comAprovadas(PRIMEIRA)
    const ilhas = ilhasVisiveis(progresso, PLANO_DE_UNIDADES)
    const pontes = pontesVisiveis(progresso, PLANO_DE_UNIDADES, ilhas)

    const decisao = decidirTravessia(pontes[0]!, ilhas)

    expect(decisao).toEqual({
      tipo: 'atravessar',
      unidadeId: SEGUNDA,
      titulo: PLANO_DE_UNIDADES[1]!.titulo,
    })
  })

  it('clicar na ponte nunca substitui a aprovação', () => {
    // A pergunta que este teste responde: existe alguma combinação em que a
    // travessia aconteça sem o domínio ter liberado o destino? Percorrendo todos
    // os progressos possíveis do começo até duas aprovações, a resposta é não.
    const progressos = [
      progressoInicial(),
      comAprovadas(PRIMEIRA),
      comAprovadas(PRIMEIRA, SEGUNDA),
      comAprovadas(PRIMEIRA, SEGUNDA, TERCEIRA),
    ]

    for (const progresso of progressos) {
      const ilhas = ilhasVisiveis(progresso, PLANO_DE_UNIDADES)
      const pontes = pontesVisiveis(progresso, PLANO_DE_UNIDADES, ilhas)

      for (const ponte of pontes) {
        const decisao = decidirTravessia(ponte, ilhas)
        const destino = ilhas.find((ilha) => ilha.id === ponte.para)

        if (decisao.tipo === 'atravessar') {
          expect(destino?.acessivel).toBe(true)
          expect(ponte.liberada).toBe(true)
        } else {
          expect(destino?.acessivel === true && ponte.liberada).toBe(false)
        }
      }
    }
  })

  it('recusa uma ponte para ilha que não existe no percurso', () => {
    const ilhas = ilhasVisiveis(progressoInicial(), PLANO_DE_UNIDADES)
    const ponteInventada = {
      ...pontesVisiveis(progressoInicial(), PLANO_DE_UNIDADES, ilhas)[0]!,
      para: 'u99-ilha-inventada',
      liberada: true,
    }

    expect(decidirTravessia(ponteInventada, ilhas).tipo).toBe('recusar')
  })
})
