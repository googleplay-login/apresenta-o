import { describe, expect, it } from 'vitest'
import {
  estadoDaUnidade,
  exercicioFoiConferido,
  marcarExercicioResolvido,
  progressoInicial,
  registrarResultado,
  type Progresso,
} from '../learning/percurso'
import { PLANO_DE_UNIDADES } from './planoDeUnidades'
import { PERCURSO_DO_CONTEUDO } from './percursoDoConteudo'
import { CONTEUDO_DAS_UNIDADES, conteudoDaUnidade } from './unidades'

/**
 * O percurso que a tela entrega ao domínio — e a prova de que ele descreve o
 * conteúdo de verdade.
 *
 * Existe porque o progresso guarda **quais exercícios foram conferidos**, e o
 * domínio recusa marcar exercício que não é da unidade (D-046). Se a lista do
 * percurso divergisse do conteúdo, a recusa aconteceria em silêncio: o estudante
 * conferiria o exercício, o selo apareceria, e o progresso não guardaria nada.
 * Um teste que só olhasse o domínio com unidades inventadas não pegaria isso.
 */

describe('o percurso montado a partir do conteúdo', () => {
  it('tem uma entrada por unidade do plano, na ordem do percurso', () => {
    const esperado = [...PLANO_DE_UNIDADES]
      .sort((a, b) => a.ordem - b.ordem)
      .map((unidade) => ({ id: unidade.id, ordem: unidade.ordem }))

    expect(PERCURSO_DO_CONTEUDO.map(({ id, ordem }) => ({ id, ordem }))).toEqual(esperado)
  })

  it('declara exatamente os exercícios que a prática mostra — nem mais, nem menos', () => {
    const problemas: string[] = []

    for (const unidade of PERCURSO_DO_CONTEUDO) {
      const conteudo = conteudoDaUnidade(unidade.id)
      if (conteudo === null) {
        // Unidade planejada e ainda sem conteúdo: a lista tem de estar vazia, e
        // não com exercícios prometidos por um plano que não foi escrito.
        if ((unidade.exercicios ?? []).length > 0) {
          problemas.push(`${unidade.id}: sem conteúdo, mas com exercícios declarados`)
        }
        continue
      }

      const daPratica = conteudo.pratica.map((exercicio) => exercicio.id)
      if (JSON.stringify(unidade.exercicios) !== JSON.stringify(daPratica)) {
        problemas.push(
          `${unidade.id}: percurso ${JSON.stringify(unidade.exercicios)} × prática ${JSON.stringify(daPratica)}`,
        )
      }
    }

    expect(problemas, problemas.join('\n')).toEqual([])
  })

  it('não repete identificador de exercício entre unidades', () => {
    const todos = PERCURSO_DO_CONTEUDO.flatMap((unidade) => unidade.exercicios ?? [])
    expect(new Set(todos).size).toBe(todos.length)
  })

  it('o conteúdo escrito entra inteiro no percurso: nenhuma unidade fica de fora', () => {
    const noPercurso = new Set(PERCURSO_DO_CONTEUDO.map((unidade) => unidade.id))
    const fora = CONTEUDO_DAS_UNIDADES.filter((unidade) => !noPercurso.has(unidade.id)).map(
      (unidade) => unidade.id,
    )

    expect(fora, `Conteúdo sem unidade no percurso: ${fora.join(', ')}`).toEqual([])
  })
})

describe('o domínio aceita os exercícios do conteúdo real', () => {
  it('todos os exercícios do conteúdo podem ser marcados, sem nenhuma recusa', () => {
    // Percorre o percurso como o estudante percorre: confere os exercícios da
    // unidade aberta e passa na avaliação para abrir a seguinte.
    const recusados: string[] = []
    const conferidos: string[] = []
    let progresso: Progresso = progressoInicial()

    for (const unidade of PERCURSO_DO_CONTEUDO) {
      for (const exercicioId of unidade.exercicios ?? []) {
        try {
          progresso = marcarExercicioResolvido(progresso, PERCURSO_DO_CONTEUDO, unidade.id, exercicioId)
          conferidos.push(exercicioId)
        } catch (erro) {
          recusados.push(`${unidade.id}/${exercicioId}: ${(erro as Error).message}`)
        }
      }

      // Aprovação para abrir a próxima ilha: 5 de 5, como na avaliação real.
      progresso = registrarResultado(progresso, PERCURSO_DO_CONTEUDO, unidade.id, {
        acertos: 5,
        total: 5,
      })
    }

    expect(recusados, `Exercícios recusados pelo domínio:\n${recusados.join('\n')}`).toEqual([])
    // Se o conteúdo crescer, este número cresce com ele: o teste pede os 12
    // exercícios escritos até agora, para não passar por acidente com lista vazia.
    expect(conferidos).toHaveLength(12)

    for (const unidade of PERCURSO_DO_CONTEUDO) {
      for (const exercicioId of unidade.exercicios ?? []) {
        expect(exercicioFoiConferido(progresso, unidade.id, exercicioId)).toBe(true)
      }
    }
  })

  it('conferir todos os exercícios de todas as unidades não aprova unidade nenhuma', () => {
    // A garantia que sustenta a promessa feita na tela: selo de conferido não é
    // aprovação, e o caminho para a próxima ilha continua sendo a avaliação.
    let progresso: Progresso = progressoInicial()
    const primeira = PERCURSO_DO_CONTEUDO[0]
    const segunda = PERCURSO_DO_CONTEUDO[1]
    expect(primeira).toBeDefined()
    expect(segunda).toBeDefined()

    for (const exercicioId of primeira?.exercicios ?? []) {
      progresso = marcarExercicioResolvido(progresso, PERCURSO_DO_CONTEUDO, primeira!.id, exercicioId)
    }

    expect(progresso.unidades[primeira!.id]?.aprovada).toBe(false)
    expect(estadoDaUnidade(progresso, PERCURSO_DO_CONTEUDO, primeira!.id)).toBe('disponivel')
    expect(estadoDaUnidade(progresso, PERCURSO_DO_CONTEUDO, segunda!.id)).toBe('bloqueada')
  })
})
