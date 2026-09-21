import { describe, expect, it } from 'vitest'
import { CONTEUDO_DAS_UNIDADES, conteudoDaUnidade } from './unidades'
import { gabaritoDaUnidade, problemasNoConteudo } from './validadorDeConteudo'
import { PLANO_DE_UNIDADES } from './planoDeUnidades'
import { PERGUNTAS_POR_UNIDADE, foiAprovado } from '../learning/avaliacao'

describe('conteúdo das unidades', () => {
  it('tem conteúdo escrito para as quatro unidades planejadas', () => {
    expect(CONTEUDO_DAS_UNIDADES.length).toBe(PLANO_DE_UNIDADES.length)
  })

  it('cobre exatamente as unidades do plano, na mesma ordem', () => {
    // Este teste amarra conteúdo e plano. Sem ele, escrever o conteúdo da
    // unidade 5 e esquecer de registrá-la no plano (ou o contrário) passaria
    // silenciosamente, e a ilha apareceria sem aula dentro.
    const idsDoPlano = [...PLANO_DE_UNIDADES].sort((a, b) => a.ordem - b.ordem).map((u) => u.id)
    const idsDoConteudo = CONTEUDO_DAS_UNIDADES.map((unidade) => unidade.id)
    expect(idsDoConteudo).toEqual(idsDoPlano)
  })

  it('não tem problema de conteúdo em nenhuma unidade', () => {
    const problemas = CONTEUDO_DAS_UNIDADES.flatMap(problemasNoConteudo)
    expect(problemas, `Problemas encontrados:\n${problemas.join('\n')}`).toEqual([])
  })

  it('tem cinco perguntas por unidade, com quatro alternativas cada', () => {
    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      expect(unidade.perguntas.length).toBe(PERGUNTAS_POR_UNIDADE)
      for (const pergunta of unidade.perguntas) {
        expect(pergunta.alternativas.length).toBe(4)
      }
    }
  })

  it('tem gabarito coerente com a quantidade de perguntas', () => {
    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      const gabarito = gabaritoDaUnidade(unidade)
      expect(gabarito.length).toBe(PERGUNTAS_POR_UNIDADE)
      for (const indice of gabarito) {
        expect(indice).toBeGreaterThanOrEqual(0)
        expect(indice).toBeLessThan(4)
      }
    }
  })

  it('não distribui a resposta correta sempre no mesmo lugar', () => {
    // Se todas as corretas estivessem na alternativa A, o estudante aprenderia a
    // chutar em vez de aprender o conteúdo.
    //
    // A checagem é POR UNIDADE, e não somando todas: a versão anterior deste teste
    // olhava o conjunto inteiro e aceitava desde que houvesse três posições em algum
    // lugar. Com isso, a unidade 3 passou com as cinco respostas na MESMA posição —
    // cinco perguntas acertáveis marcando sempre a segunda alternativa. O defeito
    // estava escondido atrás de uma média que parecia boa.
    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      const posicoes = unidade.perguntas.map((pergunta) => pergunta.correta)
      const posicoesUsadas = new Set(posicoes)

      expect(
        posicoesUsadas.size,
        `A unidade ${unidade.id} concentra as respostas certas em poucas posições: ${posicoes.join(', ')}`,
      ).toBe(4)

      // E cada posição precisa aparecer de fato como resposta certa de alguma pergunta:
      // quatro posições distintas em cinco perguntas deixariam uma de fora.
      for (let indice = 0; indice < 4; indice += 1) {
        expect(
          posicoes.includes(indice),
          `A unidade ${unidade.id} nunca usa a alternativa de índice ${indice} como correta`,
        ).toBe(true)
      }
    }
  })

  it('permite aprovar cada unidade com 4 acertos e reprovar com 3', () => {
    // Confere que a regra de aprovação funciona com o conteúdo real, e não
    // apenas com números inventados no teste do domínio.
    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      const total = unidade.perguntas.length
      expect(foiAprovado({ acertos: 4, total }), `${unidade.id} não aprova com 4 acertos`).toBe(true)
      expect(foiAprovado({ acertos: 3, total }), `${unidade.id} aprova com 3 acertos`).toBe(false)
    }
  })

  it('encontra o conteúdo por id e devolve nulo para unidade sem conteúdo', () => {
    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      expect(conteudoDaUnidade(unidade.id)?.id).toBe(unidade.id)
    }
    expect(conteudoDaUnidade('u99-inexistente')).toBeNull()
  })

  it('não deixa texto com excesso de espaço em branco nas pontas', () => {
    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      expect(unidade.missao).toBe(unidade.missao.trim())
      expect(unidade.leitura.parte).toBe(unidade.leitura.parte.trim())
      expect(unidade.leitura.porque).toBe(unidade.leitura.porque.trim())
    }
  })
})

describe('validador de conteúdo', () => {
  const base = CONTEUDO_DAS_UNIDADES[0]

  it('aprova um conteúdo correto', () => {
    expect(problemasNoConteudo(base!)).toEqual([])
  })

  it('acusa pergunta apontando para alternativa inexistente', () => {
    const comDefeito = {
      ...base!,
      perguntas: base!.perguntas.map((pergunta, indice) =>
        indice === 0 ? { ...pergunta, correta: 9 } : pergunta,
      ),
    }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('alternativa inexistente')
  })

  it('acusa quantidade de alternativas fora do padrão', () => {
    const comDefeito = {
      ...base!,
      perguntas: base!.perguntas.map((pergunta, indice) =>
        indice === 0 ? { ...pergunta, alternativas: ['uma', 'duas'], correta: 0 } : pergunta,
      ),
    }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('alternativas, e o padrão é 4')
  })

  it('acusa alternativas repetidas', () => {
    const comDefeito = {
      ...base!,
      perguntas: base!.perguntas.map((pergunta, indice) =>
        indice === 0
          ? { ...pergunta, alternativas: ['igual', 'igual', 'outra', 'mais uma'], correta: 0 }
          : pergunta,
      ),
    }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('alternativas repetidas')
  })

  it('acusa exercício sem solução de referência', () => {
    const comDefeito = {
      ...base!,
      pratica: base!.pratica.map((exercicio, indice) =>
        indice === 0 ? { ...exercicio, solucao: '' } : exercicio,
      ),
    }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('sem solução de referência')
  })

  it('acusa explicação vazia', () => {
    expect(problemasNoConteudo({ ...base!, explicacao: [] }).join(' ')).toContain(
      'explicação vazia',
    )
  })

  it('acusa número de perguntas diferente do declarado', () => {
    const comDefeito = { ...base!, perguntas: base!.perguntas.slice(0, 3) }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('o mínimo declarado é 5')
  })

  it('acusa pergunta sem explicação para depois do envio', () => {
    const comDefeito = {
      ...base!,
      perguntas: base!.perguntas.map((pergunta, indice) =>
        indice === 0 ? { ...pergunta, explicacao: '' } : pergunta,
      ),
    }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('sem explicação')
  })

  it('acusa id de unidade vazio', () => {
    expect(problemasNoConteudo({ ...base!, id: '' }).join(' ')).toContain('unidade sem id')
  })
})

describe('a leitura recomendada, que virou parte do ciclo', () => {
  it('diz o que procurar na leitura, e não só qual capítulo ler', () => {
    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      expect(
        unidade.leitura.oQueObservar.length,
        `A unidade ${unidade.id} não diz o que procurar no livro`,
      ).toBeGreaterThanOrEqual(3)
    }
  })

  it('diz o que fazer quando o livro não está em mãos', () => {
    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      // O projeto não pode supor que o estudante tenha o livro: a leitura é
      // recomendada, e precisa existir um caminho completo sem ela.
      expect(unidade.leitura.semOLivro).toMatch(/livro/)
      expect(unidade.leitura.semOLivro.length).toBeGreaterThan(80)
    }
  })

  it('nenhum ponto de observação manda procurar página', () => {
    // A página continua pendente (D-010). Um ponto de observação que citasse
    // número de página estaria inventando referência.
    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      for (const ponto of unidade.leitura.oQueObservar) {
        expect(ponto).not.toMatch(/página \d+/i)
      }
      expect(unidade.leitura.parte).not.toMatch(/página \d+/i)
    }
  })
})

describe('os diagramas', () => {
  it('cada unidade tem ao menos um diagrama, e todos têm duas caixas ou mais', () => {
    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      const diagramas = unidade.explicacao.filter((bloco) => bloco.tipo === 'diagrama')

      expect(diagramas.length, `A unidade ${unidade.id} não tem diagrama`).toBeGreaterThanOrEqual(1)

      for (const diagrama of diagramas) {
        if (diagrama.tipo !== 'diagrama') {
          continue
        }
        expect(diagrama.partes.length).toBeGreaterThanOrEqual(2)
        for (const parte of diagrama.partes) {
          expect(parte.rotulo.trim()).not.toBe('')
          expect(parte.valor.trim()).not.toBe('')
        }
      }
    }
  })

  it('não repete rótulo dentro do mesmo diagrama', () => {
    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      for (const bloco of unidade.explicacao) {
        if (bloco.tipo !== 'diagrama') {
          continue
        }
        const rotulos = bloco.partes.map((parte) => parte.rotulo)
        expect(new Set(rotulos).size, `${unidade.id}: rótulos repetidos em «${bloco.titulo}»`).toBe(
          rotulos.length,
        )
      }
    }
  })

  it('acusa diagrama com uma caixa só, rótulo repetido ou caixa vazia', () => {
    const base = CONTEUDO_DAS_UNIDADES[0]
    if (base === undefined) {
      throw new Error('Sem conteúdo para testar o validador')
    }

    const comDiagrama = (partes: readonly { rotulo: string; valor: string }[]) => ({
      ...base,
      explicacao: [
        { tipo: 'diagrama' as const, titulo: 'Teste', descricao: 'Um teste', partes },
      ],
    })

    expect(
      problemasNoConteudo(comDiagrama([{ rotulo: 'a', valor: '1' }])).join(' '),
    ).toContain('ao menos duas caixas')

    expect(
      problemasNoConteudo(
        comDiagrama([
          { rotulo: 'a', valor: '1' },
          { rotulo: 'a', valor: '2' },
        ]),
      ).join(' '),
    ).toContain('rótulo repetido')

    expect(
      problemasNoConteudo(
        comDiagrama([
          { rotulo: 'a', valor: '' },
          { rotulo: 'b', valor: '2' },
        ]),
      ).join(' '),
    ).toContain('rótulo ou valor vazio')
  })

  it('acusa leitura sem pontos de observação e sem caminho para quem não tem o livro', () => {
    const base = CONTEUDO_DAS_UNIDADES[0]
    if (base === undefined) {
      throw new Error('Sem conteúdo para testar o validador')
    }

    const semObservar = {
      ...base,
      leitura: { ...base.leitura, oQueObservar: [] },
    }
    expect(problemasNoConteudo(semObservar).join(' ')).toContain('sem pontos de observação')

    const semAlternativa = {
      ...base,
      leitura: { ...base.leitura, semOLivro: 'sem livro' },
    }
    expect(problemasNoConteudo(semAlternativa).join(' ')).toContain('curto demais ou vazio')
  })
})
