import { describe, expect, it } from 'vitest'
import { VERSAO_DO_PROGRESSO, progressoInicial, type Progresso } from '../learning/percurso'
import {
  CHAVE_DO_PROGRESSO,
  PREFIXO_DAS_CHAVES,
  apagarProgresso,
  armazenamentoDoNavegador,
  chavesDaAplicacao,
  ehProgressoValido,
  gravarProgresso,
  lerProgresso,
  type Armazenamento,
} from './progressoSalvo'

/** Armazenamento de mentira, com controle de falha por teste. */
function criarArmazenamento(inicial: Record<string, string> = {}): Armazenamento & {
  readonly dados: Record<string, string>
} {
  const dados: Record<string, string> = { ...inicial }

  return {
    dados,
    getItem: (chave: string) => dados[chave] ?? null,
    setItem: (chave: string, valor: string) => {
      dados[chave] = valor
    },
    removeItem: (chave: string) => {
      delete dados[chave]
    },
    key: (indice: number) => Object.keys(dados)[indice] ?? null,
    get length() {
      return Object.keys(dados).length
    },
  }
}

const PROGRESSO_VALIDO: Progresso = {
  versao: VERSAO_DO_PROGRESSO,
  unidades: {
    u01: { aprovada: true, tentativas: 2, melhorNota: { acertos: 5, total: 5 }, leituraFeita: false },
  },
}

describe('progresso inicial', () => {
  it('devolve progresso vazio quando não há nada guardado, sem aviso', () => {
    const resultado = lerProgresso(criarArmazenamento())
    expect(resultado.progresso).toEqual({ versao: VERSAO_DO_PROGRESSO, unidades: {} })
    expect(resultado.aviso).toBeNull()
  })
})

describe('ida e volta', () => {
  it('grava e lê o mesmo progresso', () => {
    const armazenamento = criarArmazenamento()
    expect(gravarProgresso(armazenamento, PROGRESSO_VALIDO).ok).toBe(true)

    const lido = lerProgresso(armazenamento)
    expect(lido.progresso).toEqual(PROGRESSO_VALIDO)
    expect(lido.aviso).toBeNull()
  })

  it('não guarda um progresso vazio: apaga a chave em vez de escrever o nada', () => {
    const armazenamento = criarArmazenamento()
    expect(Object.keys(armazenamento.dados)).toEqual([])

    // Primeiro acesso: nenhuma unidade tocada, então nada é gravado.
    expect(gravarProgresso(armazenamento, progressoInicial()).ok).toBe(true)
    expect(Object.keys(armazenamento.dados)).toEqual([])

    // Depois de haver o que guardar, a chave existe.
    gravarProgresso(armazenamento, PROGRESSO_VALIDO)
    expect(Object.keys(armazenamento.dados)).toEqual([CHAVE_DO_PROGRESSO])

    // E volta a sumir quando o progresso é zerado.
    expect(gravarProgresso(armazenamento, progressoInicial()).ok).toBe(true)
    expect(armazenamento.getItem(CHAVE_DO_PROGRESSO)).toBeNull()
    expect(lerProgresso(armazenamento).progresso.unidades).toEqual({})
  })

  it('grava sob uma chave com prefixo da aplicação', () => {
    const armazenamento = criarArmazenamento()
    gravarProgresso(armazenamento, PROGRESSO_VALIDO)
    expect(Object.keys(armazenamento.dados)).toEqual([CHAVE_DO_PROGRESSO])
    expect(CHAVE_DO_PROGRESSO.startsWith(PREFIXO_DAS_CHAVES)).toBe(true)
  })
})

describe('falhas de leitura não quebram a aplicação', () => {
  it('armazenamento indisponível vira aviso, e não erro', () => {
    const resultado = lerProgresso(null)
    expect(resultado.progresso.unidades).toEqual({})
    expect(resultado.aviso).toContain('não permite guardar dados')
  })

  it('JSON corrompido é ignorado com aviso, e não lança', () => {
    const armazenamento = criarArmazenamento({ [CHAVE_DO_PROGRESSO]: '{isso não é json' })
    const resultado = lerProgresso(armazenamento)

    expect(resultado.progresso.unidades).toEqual({})
    expect(resultado.aviso).toContain('ilegível')
  })

  it('formato inesperado é ignorado com aviso', () => {
    const armazenamento = criarArmazenamento({ [CHAVE_DO_PROGRESSO]: '{"algo":"diferente"}' })
    const resultado = lerProgresso(armazenamento)
    expect(resultado.aviso).toContain('formato inesperado')
  })

  it('recusa progresso de versão mais nova, e diz que é do futuro — não que está estragado', () => {
    const armazenamento = criarArmazenamento({
      [CHAVE_DO_PROGRESSO]: JSON.stringify({ versao: 99, unidades: {} }),
    })
    const resultado = lerProgresso(armazenamento)

    expect(resultado.progresso.versao).toBe(VERSAO_DO_PROGRESSO)
    expect(resultado.aviso).toContain('versão mais nova')
    expect(resultado.aviso).toContain('99')
    // O aviso não pode prometer que o dado antigo está a salvo.
    expect(resultado.aviso).toContain('por cima')
  })

  it('acusa formato inesperado quando a versão nem é número', () => {
    const armazenamento = criarArmazenamento({
      [CHAVE_DO_PROGRESSO]: JSON.stringify({ versao: 'um', unidades: {} }),
    })

    expect(lerProgresso(armazenamento).aviso).toContain('formato inesperado')
  })

  it('migra o progresso da versão 1: a aprovação continua, a leitura começa desmarcada', () => {
    // Como era o arquivo antes do marcador de leitura existir.
    const antigo = {
      versao: 1,
      unidades: {
        u01: { aprovada: true, tentativas: 2, melhorNota: { acertos: 5, total: 5 } },
        u02: { aprovada: false, tentativas: 1, melhorNota: { acertos: 3, total: 5 } },
      },
    }
    const armazenamento = criarArmazenamento({ [CHAVE_DO_PROGRESSO]: JSON.stringify(antigo) })
    const resultado = lerProgresso(armazenamento)

    expect(resultado.progresso.versao).toBe(VERSAO_DO_PROGRESSO)
    expect(resultado.progresso.unidades.u01?.aprovada).toBe(true)
    expect(resultado.progresso.unidades.u01?.tentativas).toBe(2)
    expect(resultado.progresso.unidades.u02?.melhorNota).toEqual({ acertos: 3, total: 5 })
    // A migração não atribui ao estudante um ato que ele não praticou.
    expect(resultado.progresso.unidades.u01?.leituraFeita).toBe(false)
    expect(resultado.progresso.unidades.u02?.leituraFeita).toBe(false)
    // E o estudante fica sabendo que o arquivo dele veio de outra versão.
    expect(resultado.aviso).toContain('versão anterior')
    expect(resultado.aviso).toContain('aproveitado')
  })

  it('migra também o progresso da versão 1 já com o marcador, sem perder o que estava marcado', () => {
    // Arquivo híbrido: versão 1, mas com o campo do marcador dentro. É o que sai
    // de uma versão intermediária, e recusá-lo seria perder trabalho de alguém.
    const hibrido = {
      versao: 1,
      unidades: {
        u01: { aprovada: true, tentativas: 1, melhorNota: { acertos: 5, total: 5 }, leituraFeita: true },
      },
    }
    const armazenamento = criarArmazenamento({ [CHAVE_DO_PROGRESSO]: JSON.stringify(hibrido) })

    expect(lerProgresso(armazenamento).progresso.unidades.u01?.leituraFeita).toBe(true)
  })

  it('recusa registro com leituraFeita de tipo errado, em vez de adivinhar', () => {
    const errado = {
      versao: VERSAO_DO_PROGRESSO,
      unidades: {
        u01: {
          aprovada: true,
          tentativas: 1,
          melhorNota: { acertos: 5, total: 5 },
          leituraFeita: 'sim',
        },
      },
    }
    const armazenamento = criarArmazenamento({ [CHAVE_DO_PROGRESSO]: JSON.stringify(errado) })

    expect(lerProgresso(armazenamento).aviso).toContain('formato inesperado')
  })

  it('erro do próprio armazenamento ao ler vira aviso', () => {
    const armazenamento: Armazenamento = {
      ...criarArmazenamento(),
      getItem: () => {
        throw new Error('bloqueado')
      },
    }
    const resultado = lerProgresso(armazenamento)
    expect(resultado.aviso).toContain('Não foi possível ler')
    expect(resultado.progresso.unidades).toEqual({})
  })
})

describe('falhas de gravação são ditas, nunca escondidas', () => {
  it('cota estourada devolve falha e explica', () => {
    const armazenamento: Armazenamento = {
      ...criarArmazenamento(),
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    const resultado = gravarProgresso(armazenamento, PROGRESSO_VALIDO)

    expect(resultado.ok).toBe(false)
    expect(resultado.aviso).toContain('Não foi possível salvar')
  })

  it('sem armazenamento, devolve falha com motivo', () => {
    const resultado = gravarProgresso(null, PROGRESSO_VALIDO)
    expect(resultado.ok).toBe(false)
    expect(resultado.aviso).toContain('não permite guardar dados')
  })
})

describe('validação do formato', () => {
  it('aceita um progresso bem formado', () => {
    expect(ehProgressoValido(PROGRESSO_VALIDO)).toBe(true)
  })

  it('recusa valores que não são objeto', () => {
    for (const valor of [null, undefined, 3, 'texto', true, []]) {
      expect(ehProgressoValido(valor)).toBe(false)
    }
  })

  it('recusa versão ausente ou não inteira', () => {
    expect(ehProgressoValido({ unidades: {} })).toBe(false)
    expect(ehProgressoValido({ versao: 1.5, unidades: {} })).toBe(false)
  })

  it('recusa registro de unidade malformado', () => {
    const semAprovada = { versao: 1, unidades: { u01: { tentativas: 1, melhorNota: null } } }
    expect(ehProgressoValido(semAprovada)).toBe(false)

    const tentativasErradas = {
      versao: 1,
      unidades: { u01: { aprovada: false, tentativas: 'duas', melhorNota: null } },
    }
    expect(ehProgressoValido(tentativasErradas)).toBe(false)
  })

  it('recusa nota malformada', () => {
    // Aceitar isto deixaria dado estranho entrar no domínio, onde ele quebraria
    // a comparação de notas sem aviso.
    const notaErrada = {
      versao: 1,
      unidades: { u01: { aprovada: true, tentativas: 1, melhorNota: { acertos: 'cinco' } } },
    }
    expect(ehProgressoValido(notaErrada)).toBe(false)
  })

  it('aceita unidade nunca tentada', () => {
    const nova = {
      versao: 1,
      unidades: { u01: { aprovada: false, tentativas: 0, melhorNota: null } },
    }
    expect(ehProgressoValido(nova)).toBe(true)
  })
})

describe('apagar só o que é nosso', () => {
  it('remove as chaves da aplicação e preserva as dos outros', () => {
    // `localStorage.clear()` apagaria dados de todos os sites da mesma origem.
    // Este teste é a trava contra essa linha aparecer aqui.
    const armazenamento = criarArmazenamento({
      [CHAVE_DO_PROGRESSO]: JSON.stringify(PROGRESSO_VALIDO),
      [`${PREFIXO_DAS_CHAVES}outra-coisa`]: 'x',
      'outro-site.token': 'segredo de outra aplicação',
      'tema-do-usuario': 'escuro',
    })

    const resultado = apagarProgresso(armazenamento)

    expect(resultado.ok).toBe(true)
    expect(armazenamento.dados['outro-site.token']).toBe('segredo de outra aplicação')
    expect(armazenamento.dados['tema-do-usuario']).toBe('escuro')
    expect(armazenamento.dados[CHAVE_DO_PROGRESSO]).toBeUndefined()
    expect(armazenamento.dados[`${PREFIXO_DAS_CHAVES}outra-coisa`]).toBeUndefined()
  })

  it('lista apenas as chaves da aplicação', () => {
    const armazenamento = criarArmazenamento({
      [CHAVE_DO_PROGRESSO]: '{}',
      'outro-site.token': 'x',
    })
    expect(chavesDaAplicacao(armazenamento)).toEqual([CHAVE_DO_PROGRESSO])
  })

  it('devolve falha quando não há armazenamento', () => {
    expect(apagarProgresso(null).ok).toBe(false)
  })

  it('erro ao apagar devolve falha sem lançar', () => {
    const armazenamento: Armazenamento = {
      ...criarArmazenamento({ [CHAVE_DO_PROGRESSO]: '{}' }),
      removeItem: () => {
        throw new Error('bloqueado')
      },
    }
    expect(apagarProgresso(armazenamento).ok).toBe(false)
  })
})

describe('acesso ao armazenamento do navegador', () => {
  it('devolve null quando não existe window', () => {
    // É o que acontece no render em Node, usado nos testes de componente.
    expect(armazenamentoDoNavegador()).toBeNull()
  })
})
