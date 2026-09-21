import { describe, expect, it } from 'vitest'
import {
  VERSAO_DO_PROGRESSO,
  descreverEstado,
  exercicioFoiConferido,
  exerciciosConferidos,
  marcarExercicioResolvido,
  estadoDaUnidade,
  ordenarUnidades,
  progressoDaUnidade,
  progressoInicial,
  proximaUnidade,
  leituraFoiFeita,
  marcarLeituraFeita,
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

describe('marcador de leitura', () => {
  it('marca a leitura da unidade acessível sem tocar em nota nem em tentativa', () => {
    const comLeitura = marcarLeituraFeita(progressoInicial(), UNIDADES, 'u01')

    expect(leituraFoiFeita(comLeitura, 'u01')).toBe(true)
    expect(progressoDaUnidade(comLeitura, 'u01')).toEqual({
      aprovada: false,
      tentativas: 0,
      melhorNota: null,
      leituraFeita: true,
      exerciciosResolvidos: [],
    })
  })

  it('não aprova a unidade e não abre a seguinte: quem abre é a nota', () => {
    // Esta é a garantia central do marcador. Se ele liberasse a ilha seguinte, a
    // regra dos 80% viraria enfeite: bastaria clicar "li" quatro vezes.
    const soComLeitura = marcarLeituraFeita(progressoInicial(), UNIDADES, 'u01')

    expect(estadoDaUnidade(soComLeitura, UNIDADES, 'u01')).toBe('disponivel')
    expect(estadoDaUnidade(soComLeitura, UNIDADES, 'u02')).toBe('bloqueada')
    expect(unidadeEstaAcessivel(soComLeitura, UNIDADES, 'u02')).toBe(false)
    expect(proximaUnidade(soComLeitura, UNIDADES)?.id).toBe('u01')
  })

  it('marcar duas vezes não muda nada', () => {
    const uma = marcarLeituraFeita(progressoInicial(), UNIDADES, 'u01')
    const duas = marcarLeituraFeita(uma, UNIDADES, 'u01')

    expect(duas).toBe(uma)
  })

  it('desmarca quando pedido, e voltar ao começo não apaga a aprovação', () => {
    const aprovada = aprovando(progressoInicial(), 'u01')
    const marcada = marcarLeituraFeita(aprovada, UNIDADES, 'u01')
    const desmarcada = marcarLeituraFeita(marcada, UNIDADES, 'u01', false)

    expect(leituraFoiFeita(desmarcada, 'u01')).toBe(false)
    expect(progressoDaUnidade(desmarcada, 'u01')?.aprovada).toBe(true)
    expect(progressoDaUnidade(desmarcada, 'u01')?.melhorNota).toEqual(APROVADO)
  })

  it('recusa marcar leitura de unidade bloqueada', () => {
    expect(() => marcarLeituraFeita(progressoInicial(), UNIDADES, 'u02')).toThrow(/bloqueada/)
  })

  it('recusa unidade fora do percurso', () => {
    expect(() => marcarLeituraFeita(progressoInicial(), UNIDADES, 'u99')).toThrow(/não existe/)
  })

  it('registrar nota depois da leitura preserva o marcador', () => {
    const comLeitura = marcarLeituraFeita(progressoInicial(), UNIDADES, 'u01')
    const comNota = registrarResultado(comLeitura, UNIDADES, 'u01', APROVADO)

    expect(progressoDaUnidade(comNota, 'u01')?.leituraFeita).toBe(true)
    expect(progressoDaUnidade(comNota, 'u01')?.aprovada).toBe(true)
  })

  it('não existe caminho que marque leitura em unidade bloqueada e abra o portão', () => {
    // Varredura: para todo progresso possível com zero, uma, duas e três
    // aprovações, marcar leitura nas unidades acessíveis não muda o estado de
    // nenhuma unidade — só o marcador.
    const acessiveis = (progresso: Progresso): readonly string[] =>
      UNIDADES.filter((unidade) => unidadeEstaAcessivel(progresso, UNIDADES, unidade.id)).map(
        (unidade) => unidade.id,
      )

    const construir = (quantas: number): Progresso => {
      let progresso = progressoInicial()
      for (let indice = 0; indice < quantas; indice += 1) {
        progresso = aprovando(progresso, UNIDADES[indice]?.id ?? '')
      }
      return progresso
    }

    for (let quantas = 0; quantas <= 3; quantas += 1) {
      const antes = construir(quantas)
      let depois = antes
      for (const id of acessiveis(antes)) {
        depois = marcarLeituraFeita(depois, UNIDADES, id)
      }

      for (const unidade of UNIDADES) {
        expect(estadoDaUnidade(depois, UNIDADES, unidade.id)).toBe(
          estadoDaUnidade(antes, UNIDADES, unidade.id),
        )
      }
      expect(proximaUnidade(depois, UNIDADES)?.id).toBe(proximaUnidade(antes, UNIDADES)?.id)
    }
  })
})

describe('exercício conferido entra no progresso — e não aprova nada', () => {
  /** Percurso em que as unidades declaram os próprios exercícios. */
  const COM_EXERCICIOS: readonly UnidadeDoPercurso[] = [
    { id: 'u01', ordem: 1, exercicios: ['e1-1', 'e1-2', 'e1-3'] },
    { id: 'u02', ordem: 2, exercicios: ['e2-1'] },
  ]

  it('guarda o exercício conferido sem tocar em nota, tentativa nem leitura', () => {
    const comExercicio = marcarExercicioResolvido(
      progressoInicial(),
      COM_EXERCICIOS,
      'u01',
      'e1-2',
    )

    expect(exerciciosConferidos(comExercicio, 'u01')).toEqual(['e1-2'])
    expect(exercicioFoiConferido(comExercicio, 'u01', 'e1-2')).toBe(true)
    expect(exercicioFoiConferido(comExercicio, 'u01', 'e1-1')).toBe(false)
    expect(progressoDaUnidade(comExercicio, 'u01')).toEqual({
      aprovada: false,
      tentativas: 0,
      melhorNota: null,
      leituraFeita: false,
      exerciciosResolvidos: ['e1-2'],
    })
  })

  it('não abre a unidade seguinte: quem abre é a avaliação', () => {
    // Se exercício conferido abrisse ilha, bastaria conferir três exercícios para
    // pular a avaliação, e a regra dos 80% viraria enfeite (D-046).
    let progresso = progressoInicial()
    for (const exercicio of ['e1-1', 'e1-2', 'e1-3']) {
      progresso = marcarExercicioResolvido(progresso, COM_EXERCICIOS, 'u01', exercicio)
    }

    expect(estadoDaUnidade(progresso, COM_EXERCICIOS, 'u01')).toBe('disponivel')
    expect(estadoDaUnidade(progresso, COM_EXERCICIOS, 'u02')).toBe('bloqueada')
    expect(proximaUnidade(progresso, COM_EXERCICIOS)?.id).toBe('u01')
  })

  it('conferir de novo o que já estava conferido devolve o mesmo progresso', () => {
    // A identidade importa: é ela que decide se há gravação. Regravar o mesmo
    // conteúdo a cada clique seria escrita à toa no navegador de quem estuda.
    const uma = marcarExercicioResolvido(progressoInicial(), COM_EXERCICIOS, 'u01', 'e1-2')
    const duas = marcarExercicioResolvido(uma, COM_EXERCICIOS, 'u01', 'e1-2')

    expect(duas).toBe(uma)
  })

  it('recusa exercício de unidade bloqueada', () => {
    expect(() => marcarExercicioResolvido(progressoInicial(), COM_EXERCICIOS, 'u02', 'e2-1')).toThrow(
      /bloqueada/,
    )
  })

  it('recusa exercício que não é da unidade, quando a unidade declara os seus', () => {
    expect(() =>
      marcarExercicioResolvido(progressoInicial(), COM_EXERCICIOS, 'u01', 'e9-9'),
    ).toThrow(/não é da unidade/)
  })

  it('recusa identificador vazio e unidade desconhecida', () => {
    expect(() => marcarExercicioResolvido(progressoInicial(), COM_EXERCICIOS, 'u01', '  ')).toThrow(
      /sem identificador/,
    )
    expect(() =>
      marcarExercicioResolvido(progressoInicial(), COM_EXERCICIOS, 'u99', 'e1-1'),
    ).toThrow(/desconhecida/)
  })

  it('registrar nota preserva os exercícios conferidos, e conferir preserva a nota', () => {
    const comExercicio = marcarExercicioResolvido(progressoInicial(), COM_EXERCICIOS, 'u01', 'e1-1')
    const comNota = registrarResultado(comExercicio, COM_EXERCICIOS, 'u01', REPROVADO)

    expect(comNota.unidades.u01?.exerciciosResolvidos).toEqual(['e1-1'])
    expect(comNota.unidades.u01?.tentativas).toBe(1)
    expect(comNota.unidades.u01?.melhorNota).toEqual(REPROVADO)
  })

  it('a ordem de conferência é preservada na lista', () => {
    let progresso = progressoInicial()
    progresso = marcarExercicioResolvido(progresso, COM_EXERCICIOS, 'u01', 'e1-3')
    progresso = marcarExercicioResolvido(progresso, COM_EXERCICIOS, 'u01', 'e1-1')

    expect(exerciciosConferidos(progresso, 'u01')).toEqual(['e1-3', 'e1-1'])
    expect(exerciciosConferidos(progresso, 'u02')).toEqual([])
  })
})
