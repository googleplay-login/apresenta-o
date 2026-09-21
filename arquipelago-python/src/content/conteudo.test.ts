import { describe, expect, it } from 'vitest'
import { CONTEUDO_DAS_UNIDADES, conteudoDaUnidade } from './unidades'
import { gabaritoDaUnidade, problemasNoConteudo } from './validadorDeConteudo'
import { PLANO_DE_UNIDADES } from './planoDeUnidades'
import type { ConteudoDaUnidade } from './tiposDeConteudo'
import { PERGUNTAS_POR_UNIDADE, foiAprovado } from '../learning/avaliacao'
import { motivoDaRecusa } from '../python/protocolo'

describe('conteúdo das unidades', () => {
  it('tem conteúdo escrito para todas as unidades planejadas', () => {
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

describe('a trilha do jogo roda no console, e é isso que ela promete', () => {
  it('todo exercício do projeto de jogo tem correção automática e roda aqui', () => {
    // A trilha do projeto de jogo declara, em `oConsoleRoda`, que o que roda é a
    // lógica em Python puro. Este teste cobra a promessa: nenhum exercício dela
    // depende de biblioteca gráfica, e nenhum fica sem correção. Se alguém
    // escrever um exercício com Pygame, ele falha aqui — e a saída certa é
    // escrever a versão que roda, como manda o validador.
    const doJogo = CONTEUDO_DAS_UNIDADES.filter((unidade) =>
      PLANO_DE_UNIDADES.some(
        (planejada) => planejada.id === unidade.id && planejada.trilha === 'invasao-alienigena',
      ),
    )
    expect(doJogo.length).toBeGreaterThan(0)

    for (const unidade of doJogo) {
      for (const exercicio of unidade.pratica) {
        expect(
          exercicio.correcao,
          `${unidade.id}/${exercicio.id} está na trilha do jogo e não tem correção automática`,
        ).toBeDefined()
        expect(
          exercicio.solucaoQueRodaNoConsole ?? exercicio.solucao,
          `${unidade.id}/${exercicio.id} não roda no console desta ilha`,
        ).not.toContain('import pygame')
      }
    }
  })

  it('nenhum trecho de código de biblioteca que não roda aqui é mostrado como se rodasse', () => {
    // Medido neste console: `import pygame` falha (D-061), e `matplotlib`,
    // `numpy`, `pandas`, `requests`, `django` e `tkinter` também (D-062). Se um
    // trecho de código em qualquer unidade importar uma dessas, ele precisa
    // dizer, na tela, por que não roda — e a lista é a medida, não a lembrança.
    const NAO_RODAM_AQUI = [
      'import pygame',
      'import matplotlib',
      'import numpy',
      'import pandas',
      'import requests',
      'import django',
      'import tkinter',
      'from matplotlib',
      'from django',
      'from requests',
    ]

    let comBiblioteca = 0
    let comAviso = 0

    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      for (const bloco of unidade.explicacao) {
        if (bloco.tipo !== 'codigo') {
          continue
        }
        const biblioteca = NAO_RODAM_AQUI.find((marca) => bloco.codigo.includes(marca))
        if (biblioteca === undefined) {
          continue
        }
        comBiblioteca += 1
        expect(
          bloco.naoRodaNoConsole,
          `Um trecho com «${biblioteca}» em ${unidade.id} não diz por que não roda`,
        ).toBeDefined()
        comAviso += 1
      }
    }

    // A igualdade é a regra, e ela vale para qualquer conteúdo futuro: todo trecho
    // que usa uma biblioteca ausente aqui carrega o aviso, e o teste não depende de
    // o número ser um valor fixo. Medido em 21/09/2026: **zero** blocos de código
    // com essas bibliotecas em todo o conteúdo — as unidades 12 a 18 tocam no
    // assunto em **texto**, que é o que a tela do estudante lê. Se um dia entrar um
    // trecho desses, ele entra com aviso, e este mesmo teste continua valendo.
    expect(comAviso).toBe(comBiblioteca)
  })
})

describe('validador de conteúdo', () => {
  it('acusa código que usa biblioteca que não roda aqui sem dizer por quê', () => {
    // A regra existe porque as unidades 12 a 18 tocam em Pygame, matplotlib,
    // requests e Django — todas medidas como ausentes no console (D-061, D-062).
    // O caso abaixo é sintético de propósito: na data desta conferência nenhum
    // conteúdo real mostra essas bibliotecas em bloco de código, e uma regra sem
    // caso de teste é uma regra que pode ter morrido sem ninguém notar.
    const base = CONTEUDO_DAS_UNIDADES[0]!
    const semAviso: ConteudoDaUnidade = {
      ...base,
      explicacao: [
        ...base.explicacao,
        {
          tipo: 'codigo',
          linguagem: 'python',
          legenda: 'Gráfico com a biblioteca de desenho',
          codigo: 'import matplotlib.pyplot as plt\nplt.plot([1, 2, 3])\nplt.show()',
        },
      ],
    }

    expect(problemasNoConteudo(semAviso).some((problema) => problema.includes('matplotlib'))).toBe(true)

    const comAviso: ConteudoDaUnidade = {
      ...semAviso,
      explicacao: semAviso.explicacao.map((bloco) =>
        bloco.tipo === 'codigo' && bloco.codigo.includes('matplotlib')
          ? { ...bloco, naoRodaNoConsole: 'O matplotlib não existe nesta distribuição do Python (medido, D-062).' }
          : bloco,
      ),
    }

    expect(problemasNoConteudo(comAviso).some((problema) => problema.includes('matplotlib'))).toBe(false)
  })

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
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('explicação curta demais')
  })

  it('acusa alternativa do tipo "todas as anteriores"', () => {
    const comDefeito = {
      ...base!,
      perguntas: base!.perguntas.map((pergunta, indice) =>
        indice === 0
          ? { ...pergunta, alternativas: [...pergunta.alternativas.slice(0, 3), 'Todas as anteriores'] }
          : pergunta,
      ),
    }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('não mede entendimento')
  })

  it('acusa enunciado curto demais', () => {
    const comDefeito = {
      ...base!,
      perguntas: base!.perguntas.map((pergunta, indice) =>
        indice === 0 ? { ...pergunta, enunciado: 'O que é?' } : pergunta,
      ),
    }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('enunciado curto demais')
  })

  it('acusa explicação repetida de uma alternativa', () => {
    const comDefeito = {
      ...base!,
      perguntas: base!.perguntas.map((pergunta, indice) =>
        indice === 0 ? { ...pergunta, explicacao: pergunta.alternativas[pergunta.correta] ?? '' } : pergunta,
      ),
    }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('explicação repetida')
  })

  it('acusa a unidade em que a resposta certa é sempre a mais longa', () => {
    // O defeito injetado é o vício de tamanho: em três das cinco perguntas, a
    // alternativa correta fica muito maior que as outras. Quem não estudou
    // acerta escolhendo a maior — o mesmo mal do gabarito viciado em posição.
    const longa =
      'Esta alternativa é longa o bastante para se destacar das demais em qualquer leitura, ' +
      'mesmo para quem só está passando os olhos pelas opções antes de escolher'
    const comDefeito = {
      ...base!,
      perguntas: base!.perguntas.map((pergunta, indice) =>
        indice < 3
          ? {
              ...pergunta,
              alternativas: pergunta.alternativas.map((alternativa, posicao) =>
                posicao === pergunta.correta ? longa : alternativa,
              ),
            }
          : pergunta,
      ),
    }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('a mais longa')
  })

  it('acusa id de unidade vazio', () => {
    expect(problemasNoConteudo({ ...base!, id: '' }).join(' ')).toContain('unidade sem id')
  })
})

describe('o gabarito não se entrega pelo tamanho da alternativa', () => {
  it('nenhuma unidade faz a resposta certa se destacar das outras', () => {
    // Trava independente do validador, medida direto no conteúdo real. Ela
    // existe porque o defeito existia: em u01, as cinco corretas eram as
    // alternativas mais longas, e escolher sempre a maior acertava 5 de 5.
    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      const destacadas: string[] = []

      for (const pergunta of unidade.perguntas) {
        const comprimentos = pergunta.alternativas.map((alternativa) => alternativa.length)
        const daCorreta = comprimentos[pergunta.correta] ?? 0
        const demais = comprimentos.filter((_, indice) => indice !== pergunta.correta)
        const maiorDasDemais = Math.max(0, ...demais)

        if (daCorreta >= maiorDasDemais + 12) {
          destacadas.push(pergunta.id)
        }
      }

      expect(
        destacadas.length,
        `Na unidade ${unidade.id}, a alternativa correta se destaca por tamanho em: ${destacadas.join(', ')}`,
      ).toBeLessThanOrEqual(Math.floor(unidade.perguntas.length / 2))
    }
  })

  it('escolher sempre a alternativa mais longa não acerta a unidade inteira', () => {
    // A prova direta do vício, do ponto de vista de quem está chutando.
    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      const acertos = unidade.perguntas.filter((pergunta) => {
        const comprimentos = pergunta.alternativas.map((alternativa) => alternativa.length)
        const maior = Math.max(...comprimentos)
        return comprimentos[pergunta.correta] === maior
      }).length

      expect(
        acertos,
        `Em ${unidade.id}, marcar sempre a alternativa mais longa acertaria ${acertos} de ${unidade.perguntas.length}`,
      ).toBeLessThan(unidade.perguntas.length)
    }
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

describe('a correção automática do exercício', () => {
  const comCorrecao = CONTEUDO_DAS_UNIDADES.flatMap((unidade) =>
    unidade.pratica.map((exercicio) => ({ unidade, exercicio })),
  )

  it('todo exercício com correção tem o que conferir, e todo limite está escrito', () => {
    const problemas: string[] = []

    for (const { unidade, exercicio } of comCorrecao) {
      if (exercicio.correcao === undefined) {
        continue
      }
      const fonte =
        (exercicio.correcao.saidaEsperada?.length ?? 0) +
        (exercicio.correcao.valoresEsperados?.length ?? 0) +
        (exercicio.correcao.estrutura === undefined ? 0 : 1)
      if (fonte === 0) {
        problemas.push(`${unidade.id}/${exercicio.id}: correção sem nada para conferir`)
      }
      if (exercicio.correcao.limite.trim().length < 40) {
        problemas.push(`${unidade.id}/${exercicio.id}: limite curto demais`)
      }
    }

    expect(problemas, `Correções incompletas:\n${problemas.join('\n')}`).toEqual([])
  })

  it('todo exercício ou tem correção automática, ou explica por que não tem', () => {
    // Sem isto, um exercício novo pode nascer sem conferência e sem motivo — e o
    // estudante fica sem saber se o botão sumiu por engano ou porque aqui não dá.
    const semNada = comCorrecao
      .filter(
        ({ exercicio }) => exercicio.correcao === undefined && exercicio.naoRodaNoConsole === undefined,
      )
      .map(({ unidade, exercicio }) => `${unidade.id}/${exercicio.id}`)

    expect(semNada, 'Exercícios sem conferência e sem motivo escrito').toEqual([])
  })

  it('a correção cobre os exercícios que rodam aqui — e não os que não rodam', () => {
    // Cobra a coerência entre a marcação de "não roda no console" e a existência
    // de correção: exercício marcado como não executável não pode ter correção
    // (ela nunca seria satisfeita); exercício que roda e não é marcado precisa ter.
    const incoerentes: string[] = []

    for (const { unidade, exercicio } of comCorrecao) {
      const recusa = motivoDaRecusa(exercicio.solucao)
      const rodaAqui = recusa === null && exercicio.naoRodaNoConsole === undefined

      if (rodaAqui && exercicio.correcao === undefined) {
        incoerentes.push(`${unidade.id}/${exercicio.id}: roda aqui e não tem correção`)
      }
      if (exercicio.correcao !== undefined && recusa !== null && exercicio.solucaoQueRodaNoConsole === undefined) {
        incoerentes.push(`${unidade.id}/${exercicio.id}: tem correção, mas a solução é recusada aqui`)
      }
    }

    expect(incoerentes, `Correções fora de lugar:\n${incoerentes.join('\n')}`).toEqual([])
  })

  it('toda solução adaptada existe porque a de referência usa o teclado', () => {
    const adaptadas = comCorrecao.filter(
      ({ exercicio }) => exercicio.solucaoQueRodaNoConsole !== undefined,
    )

    expect(adaptadas.length, 'nenhuma solução adaptada no conteúdo — a regra virou enfeite').toBeGreaterThan(0)

    for (const { unidade, exercicio } of adaptadas) {
      expect(
        exercicio.solucaoQueRodaNoConsole,
        `Em ${unidade.id}/${exercicio.id}, a versão adaptada é a própria solução de referência`,
      ).not.toBe(exercicio.solucao)
      expect(
        motivoDaRecusa(exercicio.solucao),
        `Em ${unidade.id}/${exercicio.id}, existe versão adaptada mas a solução de referência roda aqui`,
      ).not.toBeNull()
      expect(
        motivoDaRecusa(exercicio.solucaoQueRodaNoConsole ?? ''),
        `Em ${unidade.id}/${exercicio.id}, a versão adaptada também é recusada pelo console`,
      ).toBeNull()
    }
  })

  it('acusa exercício sem correção e sem motivo escrito', () => {
    const base = CONTEUDO_DAS_UNIDADES[0]!
    const comDefeito = {
      ...base,
      pratica: base.pratica.map((exercicio, indice) =>
        indice === 0 ? { ...exercicio, correcao: undefined, naoRodaNoConsole: undefined } : exercicio,
      ),
    }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('sem correção automática e sem motivo')
  })

  it('acusa correção sem limite declarado', () => {
    // O defeito vai no primeiro exercício **com** correção de cada unidade: nem
    // todo exercício tem uma, e injetar num que não tem não testaria nada.
    const comDefeito = CONTEUDO_DAS_UNIDADES.map((unidade) => ({
      ...unidade,
      pratica: unidade.pratica.map((exercicio) =>
        exercicio.correcao === undefined
          ? exercicio
          : { ...exercicio, correcao: { ...exercicio.correcao, limite: 'confere' } },
      ),
    }))

    expect(comDefeito.flatMap(problemasNoConteudo).join(' ')).toContain(
      'limite da correção curto demais',
    )
  })

  it('acusa correção que não confere nada', () => {
    const base = CONTEUDO_DAS_UNIDADES[0]!
    const comDefeito = {
      ...base,
      pratica: base.pratica.map((exercicio, indice) =>
        indice === 0
          ? {
              ...exercicio,
              correcao: {
                limite:
                  'Este limite é longo o bastante para passar na validação, mas a correção não confere nada.',
              },
            }
          : exercicio,
      ),
    }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('correção não confere nada')
  })

  it('acusa sonda com dois modos de comparação ao mesmo tempo', () => {
    const base = CONTEUDO_DAS_UNIDADES[1]!
    const comDefeito = {
      ...base,
      pratica: base.pratica.map((exercicio, indice) =>
        indice === 0
          ? {
              ...exercicio,
              correcao: {
                limite:
                  'Este limite é longo o bastante para passar, mas a sonda abaixo tem dois modos de comparação.',
                valoresEsperados: [
                  { rotulo: 'ambiguidade', expressao: 'figurinhas', igualA: '40', tipoEsperado: 'int' as const },
                ],
              },
            }
          : exercicio,
      ),
    }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('2 modos de comparação')
  })

  it('acusa tipo de valor que não existe em Python', () => {
    const base = CONTEUDO_DAS_UNIDADES[1]!
    const comDefeito = {
      ...base,
      pratica: base.pratica.map((exercicio, indice) =>
        indice === 0
          ? {
              ...exercicio,
              correcao: {
                limite:
                  'Este limite é longo o bastante para passar, mas o tipo pedido abaixo não existe em Python.',
                valoresEsperados: [
                  { rotulo: 'tipo inventado', expressao: 'idade', tipoEsperado: 'inteiro' as never },
                ],
              },
            }
          : exercicio,
      ),
    }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain('tipo que não existe')
  })

  it('acusa solução adaptada sem dizer por que a de referência não roda', () => {
    const base = CONTEUDO_DAS_UNIDADES[2]!
    const comDefeito = {
      ...base,
      pratica: base.pratica.map((exercicio, indice) =>
        indice === 0
          ? { ...exercicio, solucaoQueRodaNoConsole: 'nome = "Ana"\nprint(nome)', naoRodaNoConsole: undefined }
          : exercicio,
      ),
    }
    expect(problemasNoConteudo(comDefeito).join(' ')).toContain(
      'não diz por que a solução de referência não roda',
    )
  })
})

describe('o que o console da ilha não roda está marcado como tal', () => {
  it('todo trecho recusado pelo console explica o motivo', () => {
    // Este teste amarra conteúdo e console: a mesma função que recusa o programa
    // na tela (`motivoDaRecusa`) é aplicada a todo trecho de código do conteúdo.
    // Se um trecho não roda no console, ele **tem** de dizer por quê — senão a
    // pessoa digita, a tela recusa, e ninguém explica nada.
    for (const unidade of CONTEUDO_DAS_UNIDADES) {
      for (const bloco of unidade.explicacao) {
        if (bloco.tipo !== 'codigo' || bloco.linguagem !== 'python') {
          continue
        }
        const motivo = motivoDaRecusa(bloco.codigo)
        if (motivo !== null) {
          expect(
            bloco.naoRodaNoConsole,
            `Em ${unidade.id}, o bloco «${bloco.legenda ?? bloco.codigo.slice(0, 30)}» é recusado pelo console (${motivo}) e não diz por quê`,
          ).toBeTruthy()
        }
      }

      for (const exercicio of unidade.pratica) {
        const motivo = motivoDaRecusa(exercicio.solucao)
        if (motivo !== null) {
          expect(
            exercicio.naoRodaNoConsole,
            `Em ${unidade.id}, a solução de ${exercicio.id} é recusada pelo console (${motivo}) e não diz por quê`,
          ).toBeTruthy()
        }
      }
    }
  })
})
