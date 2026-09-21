import { describe, expect, it } from 'vitest'
import { progressoInicial, type Progresso, type UnidadeDoPercurso } from '../learning/percurso'
import {
  PASSOS,
  criarRedutor,
  estadoInicial,
  paraOndeEscapeLeva,
  passoAnterior,
  perguntasEmBranco,
  podeMoverCamera,
  proximoPasso,
  type Acao,
  type Estado,
} from './sessao'

const UNIDADES: readonly UnidadeDoPercurso[] = [
  { id: 'u01', ordem: 1 },
  { id: 'u02', ordem: 2 },
  { id: 'u03', ordem: 3 },
]

const redutor = criarRedutor(UNIDADES)
const GABARITO = [0, 1, 2, 3, 0]

/** Auxiliares tipados: evitam que o literal seja alargado para `string` no `map`. */
const responder = (indice: number, alternativa: number): Acao => ({
  tipo: 'responder',
  indice,
  alternativa,
})
const abrir = (unidadeId = 'u01'): Acao => ({
  tipo: 'abrirUnidade',
  unidadeId,
  totalDePerguntas: GABARITO.length,
})
const enviar: Acao = { tipo: 'enviar', gabarito: GABARITO }

/** Responde tudo certo. */
const todasCertas = (): readonly Acao[] =>
  GABARITO.map((correta, indice) => responder(indice, correta))

/** Responde tudo errado. */
const todasErradas = (): readonly Acao[] =>
  GABARITO.map((correta, indice) => responder(indice, (correta + 1) % 4))

/** Aplica uma sequência de ações a partir de um estado. */
function aplicar(acoes: readonly Acao[], inicial: Estado = estadoInicial()): Estado {
  return acoes.reduce(redutor, inicial)
}

/** Aprova a unidade 1 a partir do estado inicial. */
function comPrimeiraAprovada(): Estado {
  return aplicar([abrir('u01'), ...todasCertas(), enviar])
}

describe('ciclo de passos', () => {
  it('percorre os cinco passos na ordem e para no fim', () => {
    expect(PASSOS).toEqual(['missao', 'estudo', 'pratica', 'avaliacao', 'resultado'])
    expect(proximoPasso('missao')).toBe('estudo')
    expect(proximoPasso('pratica')).toBe('avaliacao')
    expect(proximoPasso('resultado')).toBeNull()
  })

  it('não sai do primeiro passo para trás', () => {
    expect(passoAnterior('missao')).toBeNull()
    expect(passoAnterior('estudo')).toBe('missao')
  })

  it('avança pelo ciclo', () => {
    expect(aplicar([abrir(), { tipo: 'avancar' }, { tipo: 'avancar' }]).sessao.passo).toBe('pratica')
  })

  it('volta pelo ciclo', () => {
    expect(aplicar([abrir(), { tipo: 'avancar' }, { tipo: 'voltar' }]).sessao.passo).toBe('missao')
  })

  it('não passa do último passo', () => {
    expect(
      aplicar([abrir(), { tipo: 'irPara', passo: 'resultado' }, { tipo: 'avancar' }]).sessao.passo,
    ).toBe('resultado')
  })

  it('voltar no primeiro passo não muda nada', () => {
    expect(aplicar([abrir(), { tipo: 'voltar' }]).sessao.passo).toBe('missao')
  })
})

describe('abrir e fechar unidade', () => {
  it('abre na missão, com as perguntas em branco e foco no painel', () => {
    const estado = aplicar([abrir()])
    expect(estado.sessao.unidadeId).toBe('u01')
    expect(estado.sessao.passo).toBe('missao')
    expect(estado.sessao.respostas).toEqual([null, null, null, null, null])
    expect(estado.sessao.foco).toBe('painel')
  })

  it('guarda se a ilha já estava aprovada, e não conta a aprovação de agora', () => {
    // A fotografia é tirada AO ABRIR. Ler o progresso ao vivo faria a tela dizer
    // "você já havia aprovado" logo depois da primeira aprovação — mentira na
    // cara de quem acabou de ver a nota.
    const comAprovacao: Progresso = {
      versao: progressoInicial().versao,
      unidades: { u01: { aprovada: true, tentativas: 1, melhorNota: { acertos: 5, total: 5 } } },
    }

    const jaAprovada = redutor(estadoInicial(comAprovacao), abrir('u01'))
    expect(jaAprovada.sessao.aprovadaAntes).toBe(true)

    const nuncaTentada = redutor(estadoInicial(), abrir('u01'))
    expect(nuncaTentada.sessao.aprovadaAntes).toBe(false)

    const aprovadaAgora = aplicar([abrir('u01'), ...todasCertas(), enviar])
    expect(aprovadaAgora.progresso.unidades.u01?.aprovada).toBe(true)
    expect(aprovadaAgora.sessao.aprovadaAntes).toBe(false)
  })

  it('fechar devolve o foco ao mundo e limpa a sessão', () => {
    const estado = aplicar([abrir(), { tipo: 'fecharUnidade' }])
    expect(estado.sessao.unidadeId).toBeNull()
    expect(estado.sessao.foco).toBe('mundo')
    expect(estado.sessao.respostas).toEqual([])
  })
})

describe('foco do teclado (D-012)', () => {
  it('só move a câmera quando o foco está no mundo', () => {
    expect(podeMoverCamera('mundo')).toBe(true)
    expect(podeMoverCamera('painel')).toBe(false)
  })

  it('com painel aberto, a câmera não pode se mover', () => {
    expect(podeMoverCamera(aplicar([abrir()]).sessao.foco)).toBe(false)
  })

  it('Esc devolve o foco ao mundo', () => {
    expect(paraOndeEscapeLeva('painel')).toBe('mundo')
    expect(paraOndeEscapeLeva('mundo')).toBe('mundo')
  })
})

describe('responder', () => {
  it('guarda a alternativa escolhida', () => {
    const estado = aplicar([abrir(), responder(2, 3)])
    expect(estado.sessao.respostas[2]).toBe(3)
    expect(estado.sessao.respostas[0]).toBeNull()
  })

  it('permite trocar a resposta antes de enviar', () => {
    expect(aplicar([abrir(), responder(0, 1), responder(0, 2)]).sessao.respostas[0]).toBe(2)
  })

  it('ignora resposta fora da faixa', () => {
    const antes = aplicar([abrir()])
    expect(aplicar([responder(99, 0)], antes)).toEqual(antes)
  })

  it('conta quantas faltam', () => {
    expect(perguntasEmBranco(aplicar([abrir(), responder(0, 0), responder(1, 1)]).sessao)).toBe(3)
  })
})

describe('enviar', () => {
  it('recusa envio com pergunta em branco e não muda o estado', () => {
    const antes = aplicar([abrir(), responder(0, 0)])
    expect(aplicar([enviar], antes)).toEqual(antes)
  })

  it('recusa envio com gabarito de tamanho diferente', () => {
    const antes = aplicar([abrir(), ...todasCertas()])
    expect(aplicar([{ tipo: 'enviar', gabarito: [0, 1] }], antes)).toEqual(antes)
  })

  it('aprova com 5 acertos e leva ao passo de resultado', () => {
    const estado = aplicar([abrir(), ...todasCertas(), enviar])

    expect(estado.sessao.resultado).toEqual({ acertos: 5, total: 5 })
    expect(estado.sessao.passo).toBe('resultado')
    expect(estado.progresso.unidades.u01?.aprovada).toBe(true)
  })

  it('aprova com 4 acertos', () => {
    const estado = aplicar([
      abrir(),
      responder(0, GABARITO[0]!),
      responder(1, GABARITO[1]!),
      responder(2, GABARITO[2]!),
      responder(3, GABARITO[3]!),
      responder(4, (GABARITO[4]! + 1) % 4),
      enviar,
    ])

    expect(estado.sessao.resultado?.acertos).toBe(4)
    expect(estado.progresso.unidades.u01?.aprovada).toBe(true)
  })

  it('reprova com 3 acertos e mesmo assim registra a tentativa', () => {
    const estado = aplicar([
      abrir(),
      responder(0, GABARITO[0]!),
      responder(1, GABARITO[1]!),
      responder(2, GABARITO[2]!),
      responder(3, (GABARITO[3]! + 1) % 4),
      responder(4, (GABARITO[4]! + 1) % 4),
      enviar,
    ])

    expect(estado.sessao.resultado?.acertos).toBe(3)
    expect(estado.progresso.unidades.u01?.aprovada).toBe(false)
    expect(estado.progresso.unidades.u01?.tentativas).toBe(1)
  })

  it('reprovando tudo, o resultado é zero acertos e não há aprovação', () => {
    const estado = aplicar([abrir(), ...todasErradas(), enviar])
    expect(estado.sessao.resultado?.acertos).toBe(0)
    expect(estado.progresso.unidades.u01?.aprovada).toBe(false)
  })

  it('recusa registrar resultado em unidade bloqueada, sem mudar o estado', () => {
    // O domínio recusa; o redutor não contorna e não inventa caminho alternativo.
    const antes = aplicar([abrir('u03'), ...todasCertas()])
    const depois = aplicar([enviar], antes)

    expect(depois.progresso.unidades.u03).toBeUndefined()
    expect(depois.sessao.resultado).toBeNull()
    expect(depois.sessao.passo).toBe('missao')
  })

  it('sem unidade aberta, enviar não faz nada', () => {
    const antes = estadoInicial()
    expect(aplicar([enviar], antes)).toEqual(antes)
  })
})

describe('refazer', () => {
  it('limpa as respostas e volta para a avaliação, mantendo a aprovação', () => {
    const refeito = aplicar([{ tipo: 'refazer' }], comPrimeiraAprovada())

    expect(refeito.sessao.passo).toBe('avaliacao')
    expect(refeito.sessao.respostas).toEqual([null, null, null, null, null])
    expect(refeito.sessao.resultado).toBeNull()
    expect(refeito.progresso.unidades.u01?.aprovada).toBe(true)
  })

  it('reprovar e refazer mantém a unidade acessível', () => {
    const reprovado = aplicar([abrir(), ...todasErradas(), enviar, { tipo: 'refazer' }])

    expect(reprovado.sessao.unidadeId).toBe('u01')
    expect(reprovado.sessao.passo).toBe('avaliacao')
    expect(reprovado.progresso.unidades.u01?.aprovada).toBe(false)
  })
})

describe('progresso do percurso pelo redutor', () => {
  it('aprovar a primeira permite abrir a segunda', () => {
    const depois = aplicar([abrir('u02')], comPrimeiraAprovada())
    expect(depois.sessao.unidadeId).toBe('u02')
  })

  it('a terceira continua bloqueada depois da primeira aprovada', () => {
    const antes = comPrimeiraAprovada()
    const tentativa = aplicar([abrir('u03'), ...todasCertas(), enviar], antes)

    expect(tentativa.progresso.unidades.u03).toBeUndefined()
    expect(tentativa.progresso.unidades.u01?.aprovada).toBe(true)
  })

  it('melhor nota só melhora, mesmo depois de reprovar', () => {
    const aprovado = comPrimeiraAprovada()
    const depoisDeReprovar = aplicar([abrir('u01'), ...todasErradas(), enviar], aprovado)

    expect(depoisDeReprovar.progresso.unidades.u01?.aprovada).toBe(true)
    expect(depoisDeReprovar.progresso.unidades.u01?.melhorNota).toEqual({ acertos: 5, total: 5 })
    expect(depoisDeReprovar.progresso.unidades.u01?.tentativas).toBe(2)
  })
})

describe('preferências da sessão', () => {
  it('troca o modo de câmera', () => {
    expect(aplicar([{ tipo: 'definirCamera', camera: 'mapa' }]).sessao.camera).toBe('mapa')
  })

  it('alterna a versão sem 3D', () => {
    expect(aplicar([{ tipo: 'alternarSem3d' }]).sem3d).toBe(true)
    expect(aplicar([{ tipo: 'alternarSem3d' }, { tipo: 'alternarSem3d' }]).sem3d).toBe(false)
  })

  it('substitui o progresso lido do armazenamento', () => {
    const salvo: Progresso = {
      versao: 1,
      unidades: { u01: { aprovada: true, tentativas: 2, melhorNota: { acertos: 5, total: 5 } } },
    }
    expect(
      aplicar([{ tipo: 'substituirProgresso', progresso: salvo }]).progresso.unidades.u01?.aprovada,
    ).toBe(true)
  })

  it('registra e limpa o aviso de gravação', () => {
    const comAviso = aplicar([{ tipo: 'registrarAviso', aviso: 'Armazenamento bloqueado' }])
    expect(comAviso.avisoDeGravacao).toBe('Armazenamento bloqueado')
    expect(aplicar([{ tipo: 'registrarAviso', aviso: null }], comAviso).avisoDeGravacao).toBeNull()
  })

  it('não altera o progresso ao mexer em preferências', () => {
    const inicial = estadoInicial()
    const depois = aplicar(
      [{ tipo: 'definirCamera', camera: 'mapa' }, { tipo: 'alternarSem3d' }],
      inicial,
    )
    expect(depois.progresso).toEqual(inicial.progresso)
  })
})

describe('ações desconhecidas', () => {
  it('devolve o mesmo estado, sem quebrar', () => {
    const inicial = estadoInicial()
    const desconhecida = { tipo: 'acaoQueNaoExiste' } as unknown as Acao
    expect(redutor(inicial, desconhecida)).toEqual(inicial)
  })

  it('o progresso inicial é vazio', () => {
    expect(estadoInicial().progresso).toEqual(progressoInicial())
  })
})
