import { describe, expect, it } from 'vitest'
import type { CorrecaoDoExercicio } from '../content/tiposDeConteudo'
import {
  LINHA_DA_SONDA,
  MARCADOR_DA_SONDA,
  TIPOS_DE_VALOR,
  codigoDoEstudante,
  conferirExercicio,
  descreverTipo,
  programaDaConferencia,
  resumoDaConferencia,
  separarSondagem,
} from './correcaoDeExercicio'

/**
 * A correção do exercício, isolada do interpretador.
 *
 * O que este arquivo prova: o que a conferência olha, com que rigor, e o que ela
 * diz quando **não consegue** olhar. O interpretador de verdade entra em
 * `src/python/pyodideDeVerdade.test.ts`, que roda as soluções de referência do
 * conteúdo e exige que cada uma passe na correção do próprio exercício.
 */

const LIMITE = 'A conferência olha a saída; ela não julga o estilo do seu código.'

function correcao(parcial: Partial<CorrecaoDoExercicio> = {}): CorrecaoDoExercicio {
  return { limite: LIMITE, ...parcial }
}

/** Uma sonda como o Python a imprimiria: JSON depois do marcador. */
function linhaDaSonda(medida: {
  readonly indice: number
  readonly tipo: string
  readonly repr: string
  readonly str?: string
}): string {
  return (
    MARCADOR_DA_SONDA +
    JSON.stringify({
      indice: medida.indice,
      tipo: medida.tipo,
      repr: medida.repr,
      str: medida.str ?? medida.repr,
    })
  )
}

function semErro(linhas: readonly string[], codigo = 'print(1)'): Parameters<typeof conferirExercicio>[1] {
  return { codigo, linhas, foiErro: false }
}

describe('a sonda que mede valores', () => {
  it('não acrescenta nada quando a correção não mede valores', () => {
    const codigo = 'print("oi")'
    expect(programaDaConferencia(codigo, correcao({ saidaEsperada: ['oi'] }))).toBe(codigo)
  })

  it('acrescenta uma linha por valor medido, depois do código do estudante', () => {
    const programa = programaDaConferencia(
      'figurinhas = 40\nprint(figurinhas)',
      correcao({
        valoresEsperados: [
          { rotulo: 'A variável figurinhas', expressao: 'figurinhas', igualA: '40' },
          { rotulo: 'A quantidade de itens', expressao: 'len(cores)', tipoEsperado: 'int' },
        ],
      }),
    )

    expect(programa.startsWith('figurinhas = 40\nprint(figurinhas)\n')).toBe(true)
    expect(programa).toContain(LINHA_DA_SONDA)
    expect(programa.match(/print\(/g)?.length).toBe(3)
    // O índice de cada sonda existe para a leitura saber qual valor é qual.
    expect(programa).toContain('"indice": 0')
    expect(programa).toContain('"indice": 1')
  })

  it('o código do estudante é recuperável inteiro, sem o bloco da sonda', () => {
    const codigoDoAluno = '# calcula a média\nmedia = (7 + 9 + 5) / 3\nprint(media)'
    const programa = programaDaConferencia(
      codigoDoAluno,
      correcao({ valoresEsperados: [{ rotulo: 'media', expressao: 'media', igualA: '7.0' }] }),
    )

    expect(codigoDoEstudante(programa)).toBe(`${codigoDoAluno}\n`)
    expect(codigoDoEstudante(codigoDoAluno)).toBe(codigoDoAluno)
  })

  it('separa a saída do programa das medidas da sonda', () => {
    const { doPrograma, sondas } = separarSondagem([
      '40',
      linhaDaSonda({ indice: 0, tipo: 'int', repr: '40' }),
      'fim',
    ])

    expect(doPrograma).toEqual(['40', 'fim'])
    expect(sondas).toEqual([{ indice: 0, tipo: 'int', textoRepr: '40', texto: '40' }])
  })

  it('aguenta um valor que contém o sinal do marcador e quebra de linha', () => {
    // É por isso que o resto da linha é JSON, e não texto separado por sinais.
    const { sondas } = separarSondagem([
      linhaDaSonda({ indice: 0, tipo: 'str', repr: "'a§b\\nc'", str: 'a§b\nc' }),
    ])

    expect(sondas).toHaveLength(1)
    expect(sondas[0]?.texto).toBe('a§b\nc')
  })

  it('sonda ilegível não conta como saída do programa nem como medida', () => {
    const { doPrograma, sondas } = separarSondagem([`${MARCADOR_DA_SONDA}nada disso`, 'ok'])

    expect(doPrograma).toEqual(['ok'])
    expect(sondas).toEqual([])
  })
})

describe('conferir a saída', () => {
  it('encontra os textos esperados na ordem', () => {
    const resultado = conferirExercicio(
      correcao({ saidaEsperada: ['Primeira', 'Última'] }),
      semErro(['Primeira: azul', 'Última: vermelho']),
    )

    expect(resultado.situacao).toBe('deuCerto')
    expect(resultado.itens).toHaveLength(2)
    expect(resultado.itens[0]?.obtido).toBe('"Primeira: azul"')
  })

  it('reprova quando os textos aparecem fora de ordem', () => {
    const resultado = conferirExercicio(
      correcao({ saidaEsperada: ['Primeira', 'Última'] }),
      semErro(['Última: vermelho', 'Primeira: azul']),
    )

    expect(resultado.situacao).toBe('naoConfere')
    expect(resultado.itens[1]?.obtido).toBe('não apareceu na saída')
  })

  it('não reprova por linhas a mais: quem está aprendendo imprime para ver', () => {
    const resultado = conferirExercicio(
      correcao({ saidaEsperada: ['40'] }),
      semErro(['47', '55', '40']),
    )

    expect(resultado.situacao).toBe('deuCerto')
  })

  it('diz o que faltou quando o texto não aparece', () => {
    const resultado = conferirExercicio(correcao({ saidaEsperada: ['7.0'] }), semErro(['7']))

    expect(resultado.situacao).toBe('naoConfere')
    expect(resultado.itens[0]?.esperado).toBe('"7.0"')
    expect(resultado.explicacao).toMatch(/Uma coisa não confere/)
  })
})

describe('conferir os valores medidos', () => {
  it('confere o valor exato pelo repr, distinguindo 7.0 de 7', () => {
    const certo = conferirExercicio(
      correcao({ valoresEsperados: [{ rotulo: 'A média', expressao: 'media', igualA: '7.0' }] }),
      semErro([linhaDaSonda({ indice: 0, tipo: 'float', repr: '7.0' })]),
    )
    expect(certo.situacao).toBe('deuCerto')

    const errado = conferirExercicio(
      correcao({ valoresEsperados: [{ rotulo: 'A média', expressao: 'media', igualA: '7.0' }] }),
      semErro([linhaDaSonda({ indice: 0, tipo: 'int', repr: '7' })]),
    )
    expect(errado.situacao).toBe('naoConfere')
    expect(errado.itens[0]?.obtido).toBe('7')
  })

  it('confere o tipo, e diz em português o que veio no lugar', () => {
    const resultado = conferirExercicio(
      correcao({
        valoresEsperados: [{ rotulo: 'A altura', expressao: 'altura', tipoEsperado: 'float' }],
      }),
      semErro([linhaDaSonda({ indice: 0, tipo: 'str', repr: "'1.72'" })]),
    )

    expect(resultado.situacao).toBe('naoConfere')
    expect(resultado.itens[0]?.esperado).toBe('um número com casas decimais')
    expect(resultado.itens[0]?.obtido).toBe('um texto')
  })

  it('confere que o valor apareceu na saída, e mostra o que saiu', () => {
    const resultado = conferirExercicio(
      correcao({
        valoresEsperados: [{ rotulo: 'A soma', expressao: 'sum(numeros)', apareceNaSaida: true }],
      }),
      semErro(
        ['42', linhaDaSonda({ indice: 0, tipo: 'int', repr: '42' })],
        'numeros = [7, 20, 15]\nprint(sum(numeros))',
      ),
    )

    expect(resultado.situacao).toBe('deuCerto')
    expect(resultado.itens[0]?.obtido).toBe('"42"')
  })

  it('quando o valor existe mas não foi impresso, diz o valor guardado', () => {
    const resultado = conferirExercicio(
      correcao({
        valoresEsperados: [{ rotulo: 'A soma', expressao: 'sum(numeros)', apareceNaSaida: true }],
      }),
      semErro([linhaDaSonda({ indice: 0, tipo: 'str', repr: "'42'", str: '42' })]),
    )

    expect(resultado.situacao).toBe('naoConfere')
    expect(resultado.itens[0]?.obtido).toBe("não aparece na saída (o valor guardado é '42')")
  })

  it('valor vazio não vale como aparecer na saída', () => {
    const resultado = conferirExercicio(
      correcao({
        valoresEsperados: [{ rotulo: 'O texto', expressao: 'nome', apareceNaSaida: true }],
      }),
      semErro([linhaDaSonda({ indice: 0, tipo: 'str', repr: "''", str: '' })]),
    )

    expect(resultado.situacao).toBe('naoConfere')
    expect(resultado.itens[0]?.obtido).toBe('o valor é vazio, e nada apareceu na saída')
  })

  it('sonda que não chegou a ser medida não vira reprovação', () => {
    const resultado = conferirExercicio(
      correcao({ valoresEsperados: [{ rotulo: 'A lista', expressao: 'frutas', tipoEsperado: 'list' }] }),
      semErro(['nada de sonda aqui']),
    )

    expect(resultado.situacao).toBe('naoDeuParaConferir')
    expect(resultado.itens[0]?.situacao).toBe('naoDeuParaConferir')
    expect(resultado.itens[0]?.obtido).toBe('a conferência não chegou a olhar este valor')
  })
})

describe('conferir a forma exigida pelo enunciado', () => {
  it('conta as linhas não vazias impressas', () => {
    const certo = conferirExercicio(
      correcao({ estrutura: { linhasNaoVazias: 2 } }),
      semErro(['Ana', 'Quero aprender']),
    )
    expect(certo.situacao).toBe('deuCerto')

    const errado = conferirExercicio(
      correcao({ estrutura: { linhasNaoVazias: 2 } }),
      semErro(['Ana']),
    )
    expect(errado.situacao).toBe('naoConfere')
    expect(errado.itens[0]?.esperado).toBe('2')
    expect(errado.itens[0]?.obtido).toBe('1')
  })

  it('linha vazia não conta como linha impressa', () => {
    const resultado = conferirExercicio(
      correcao({ estrutura: { linhasNaoVazias: 2 } }),
      semErro(['Ana', '   ', 'Quero aprender']),
    )
    expect(resultado.situacao).toBe('deuCerto')
  })

  it('exige comentário no código do estudante quando o enunciado pede', () => {
    const resultado = conferirExercicio(
      correcao({ estrutura: { comentario: true } }),
      semErro(['7.0'], '# a média é a soma dividida por três\nmedia = 3\nprint(media)'),
    )

    expect(resultado.situacao).toBe('deuCerto')
  })

  it('a linha da sonda não vale como comentário do estudante', () => {
    // A sentinela da sonda é uma linha de comentário; se ela contasse, um
    // programa sem comentário nenhum passaria na conferência que exige comentário.
    const programa = programaDaConferencia(
      'media = 3\nprint(media)',
      correcao({
        estrutura: { comentario: true },
        valoresEsperados: [{ rotulo: 'media', expressao: 'media', igualA: '3' }],
      }),
    )

    const resultado = conferirExercicio(
      correcao({
        estrutura: { comentario: true },
        valoresEsperados: [{ rotulo: 'media', expressao: 'media', igualA: '3' }],
      }),
      semErro([linhaDaSonda({ indice: 0, tipo: 'int', repr: '3' })], programa),
    )

    expect(resultado.situacao).toBe('naoConfere')
    expect(resultado.itens.map((item) => item.rotulo)).toContain('Comentário explicando o cálculo')
    expect(resultado.itens.find((item) => item.rotulo.startsWith('Comentário'))?.obtido).toBe(
      'não existe',
    )
  })
})

describe('quando o programa não chega ao fim', () => {
  it('não reprova: diz que não deu para conferir, com a mensagem do Python', () => {
    const resultado = conferirExercicio(
      correcao({ saidaEsperada: ['40'] }),
      {
        codigo: 'print(40)',
        linhas: [
          'Traceback (most recent call last):',
          '  File "<exec>", line 1, in <module>',
          "NameError: name 'figurinhas' is not defined",
        ],
        foiErro: true,
      },
    )

    expect(resultado.situacao).toBe('naoDeuParaConferir')
    expect(resultado.itens).toHaveLength(1)
    expect(resultado.itens[0]?.obtido).toBe('Traceback (most recent call last):')
    expect(resultado.explicacao).toMatch(/não chegou ao fim/)
    expect(resultado.limite).toBe(LIMITE)
  })

  it('reconhece a recusa do console como "não deu para conferir"', () => {
    const resultado = conferirExercicio(correcao({ saidaEsperada: ['ANA'] }), {
      codigo: 'nome = input()',
      linhas: ['Este console não tem teclado para o programa ler: `input()` ficaria esperando.'],
      foiErro: true,
    })

    expect(resultado.situacao).toBe('naoDeuParaConferir')
    expect(resultado.itens[0]?.obtido).toMatch(/não tem teclado/)
  })
})

describe('a frase que resume a conferência', () => {
  it('resume os três casos', () => {
    const deuCerto = conferirExercicio(correcao({ saidaEsperada: ['a'] }), semErro(['a']))
    const naoConfere = conferirExercicio(correcao({ saidaEsperada: ['a'] }), semErro(['b']))
    const naoDeu = conferirExercicio(correcao({ saidaEsperada: ['a'] }), {
      codigo: '',
      linhas: ['parou'],
      foiErro: true,
    })

    expect(resumoDaConferencia(deuCerto)).toBe('Conferido: tudo confere')
    expect(resumoDaConferencia(naoConfere)).toBe('Conferido: ainda não confere')
    expect(resumoDaConferencia(naoDeu)).toBe('Conferência não concluída')
  })

  it('não inventa explicação para correção sem nada a conferir', () => {
    const resultado = conferirExercicio(correcao(), semErro(['qualquer coisa']))
    expect(resultado.situacao).toBe('deuCerto')
    expect(resultado.explicacao).toMatch(/não tem o que conferir/)
  })

  it('descreve tipos conhecidos e não finge conhecer o resto', () => {
    expect(descreverTipo('int')).toBe('um número inteiro')
    expect(descreverTipo('set')).toBe('do tipo set')
    expect(TIPOS_DE_VALOR).toContain('float')
    expect(TIPOS_DE_VALOR).not.toContain('set')
  })
})
