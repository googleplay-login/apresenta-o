/**
 * A correção automática de um exercício de prática.
 *
 * O que esta correção é: uma conferência **honesta e limitada** sobre o que o
 * programa produziu. Ela olha três coisas, e só três:
 *
 *  1. o que o programa **imprimiu** — os textos esperados são procurados, na
 *     ordem, dentro da saída;
 *  2. os **valores que ficaram guardados** — a sonda mede o valor real de
 *     variáveis e expressões depois que o programa roda, e compara com o que o
 *     conteúdo espera: o valor exato, o tipo, ou o fato de o valor ter aparecido
 *     na saída;
 *  3. a **forma** exigida pelo enunciado — quantas linhas, se há comentário.
 *
 * O que ela **não** é, e é o ponto principal deste arquivo: ela não julga estilo,
 * não exige uma solução única, não entende a intenção de quem escreveu e **não
 * impede** quem quiser enganar. Imprimir o número certo sem calcular nada passa
 * na conferência da saída — é para isso que existe a sonda de valores, que mede a
 * variável depois do programa rodar, e é por isso que o limite de cada correção
 * aparece escrito na tela, junto do resultado. A regra do projeto vale aqui
 * igual: nada de prometer teste inviolável (D-036, D-044).
 *
 * A sonda é uma decisão técnica com consequência prática: em vez de duas
 * execuções do programa (uma para ver a saída, outra para medir valores), o
 * projeto acrescenta **linhas marcadas** ao fim do programa do estudante e roda
 * tudo de uma vez. Uma execução só, o mesmo interpretador, o mesmo estado das
 * variáveis — porque medir `figurinhas` num programa que rodou de novo, do zero,
 * mediria outra coisa (D-045).
 */
import type { CorrecaoDoExercicio, TipoDeValor, ValorEsperado } from '../content/tiposDeConteudo'

/**
 * Marca o começo de uma linha da sonda.
 *
 * O caractere `§` foi escolhido por não aparecer em programa de curso
 * introdutório. Ainda assim, o caso está tratado: se o programa do estudante
 * imprimir o marcador, a linha é lida como sonda e não como saída — e o que
 * acontece está dito no limite da correção, não escondido. O resto da linha é
 * JSON, e não texto separado por sinais: assim um valor que contenha aspas,
 * quebras de linha ou o próprio sinal não desmonta a leitura.
 */
export const MARCADOR_DA_SONDA = '§conferencia§'

/**
 * Primeira linha do bloco que a sonda acrescenta ao programa.
 *
 * Ela existe para que o programa do estudante possa ser recuperado inteiro:
 * `codigoDoEstudante` corta o texto nesta linha. Sem isso, o comentário do
 * próprio bloco da sonda faria um programa sem comentário nenhum passar na
 * conferência que exige comentário.
 */
export const LINHA_DA_SONDA = '# ---- conferência do Arquipélago: linhas acrescentadas aqui ----'

/** Uma medida lida de volta da sonda. */
export type Sondagem = {
  readonly indice: number
  readonly tipo: string
  /** `repr()` do valor — o que o Python mostra no modo interativo. */
  readonly textoRepr: string
  /** `str()` do valor — o que `print` mostra. */
  readonly texto: string
}

/** O que o programa produziu, como a conferência precisa ver. */
export type ExecucaoParaConferir = {
  /** O código que rodou — com a sonda, quando havia sonda. */
  readonly codigo: string
  /** As linhas que vieram do interpretador: saída do programa ou erro. */
  readonly linhas: readonly string[]
  /** `true` quando o interpretador parou com erro ou recusou o programa. */
  readonly foiErro: boolean
}

export type SituacaoDaConferencia = 'deuCerto' | 'naoConfere' | 'naoDeuParaConferir'

/** Uma conferência: o que se esperava, o que veio. */
export type ItemDaConferencia = {
  readonly rotulo: string
  readonly situacao: SituacaoDaConferencia
  readonly esperado: string
  readonly obtido: string
}

export type ResultadoDaConferencia = {
  /** `deuCerto` só quando **todos** os itens deram certo. */
  readonly situacao: SituacaoDaConferencia
  readonly itens: readonly ItemDaConferencia[]
  /** O que a conferência olhou, em uma frase. */
  readonly explicacao: string
  /** O que a conferência **não** julga. Vem do conteúdo e aparece na tela. */
  readonly limite: string
}

const COMO_SE_DESCREVE_O_TIPO: Readonly<Record<string, string>> = {
  str: 'um texto',
  int: 'um número inteiro',
  float: 'um número com casas decimais',
  bool: 'verdadeiro ou falso',
  list: 'uma lista',
  tuple: 'uma tupla',
  dict: 'um dicionário',
  NoneType: 'nada (o valor None)',
}

/** Nome do tipo em português, para a tela. Tipo desconhecido sai como veio. */
export function descreverTipo(nome: string): string {
  return COMO_SE_DESCREVE_O_TIPO[nome] ?? `do tipo ${nome}`
}

/**
 * Monta o programa que roda na conferência: o do estudante, com a sonda no fim.
 *
 * Sem valores a medir, a sonda não existe e o programa é o do estudante, sem uma
 * linha a mais. Com valores, cada um vira um `print` marcado cujo resto da linha
 * é JSON com o índice, o **tipo real**, o `repr` e o `str` do valor. O `repr` é o
 * que permite distinguir `7.0` de `7`; o `str` é o que `print` mostraria, e é o
 * que permite conferir se um valor apareceu na saída.
 *
 * As expressões vêm do conteúdo e são escritas por nós; ainda assim, o teste que
 * roda o conteúdo de verdade no interpretador real confere cada uma delas. Uma
 * expressão quebrada não pode chegar à tela como se fosse culpa do estudante.
 */
export function programaDaConferencia(codigo: string, correcao: CorrecaoDoExercicio): string {
  const valores = correcao.valoresEsperados ?? []
  if (valores.length === 0) {
    return codigo
  }

  const marca = JSON.stringify(MARCADOR_DA_SONDA)
  const sondas = valores.map((valor, indice) => {
    const medida =
      `{"indice": ${indice}, "tipo": type(${valor.expressao}).__name__, ` +
      `"repr": repr(${valor.expressao}), "str": str(${valor.expressao})}`
    return `print(${marca} + __arquipelago_json.dumps(${medida}))`
  })

  return [
    codigo,
    LINHA_DA_SONDA,
    'import json as __arquipelago_json',
    ...sondas,
    '',
  ].join('\n')
}

/** O programa do estudante, sem o bloco que a sonda acrescenta. */
export function codigoDoEstudante(codigo: string): string {
  const onde = codigo.indexOf(LINHA_DA_SONDA)
  return onde === -1 ? codigo : codigo.slice(0, onde)
}

/**
 * Separa a saída do programa das linhas da sonda.
 *
 * O que o estudante vê é a saída do programa dele. As linhas da sonda são
 * instrumento de medida, e ficariam parecendo erro de quem escreveu.
 */
export function separarSondagem(linhas: readonly string[]): {
  readonly doPrograma: readonly string[]
  readonly sondas: readonly Sondagem[]
} {
  const doPrograma: string[] = []
  const sondas: Sondagem[] = []

  for (const linha of linhas) {
    if (!linha.startsWith(MARCADOR_DA_SONDA)) {
      doPrograma.push(linha)
      continue
    }

    let bruto: unknown
    try {
      bruto = JSON.parse(linha.slice(MARCADOR_DA_SONDA.length))
    } catch {
      // Sonda ilegível não é saída do programa nem medida: fica de fora das
      // duas, e a conferência dirá que não conseguiu olhar aquele valor.
      continue
    }

    if (bruto === null || typeof bruto !== 'object') {
      continue
    }
    const medida = bruto as { indice?: unknown; tipo?: unknown; repr?: unknown; str?: unknown }
    if (typeof medida.indice !== 'number') {
      continue
    }

    sondas.push({
      indice: medida.indice,
      tipo: typeof medida.tipo === 'string' ? medida.tipo : '',
      textoRepr: typeof medida.repr === 'string' ? medida.repr : '',
      texto: typeof medida.str === 'string' ? medida.str : '',
    })
  }

  return { doPrograma, sondas }
}

/** Um item que deu certo, montado a partir do que foi comparado. */
function itemQueDeuCerto(rotulo: string, esperado: string, obtido: string): ItemDaConferencia {
  return { rotulo, situacao: 'deuCerto', esperado, obtido }
}

function itemQueNaoConfere(rotulo: string, esperado: string, obtido: string): ItemDaConferencia {
  return { rotulo, situacao: 'naoConfere', esperado, obtido }
}

function entreAspas(texto: string): string {
  return `"${texto.trim()}"`
}

/**
 * Procura os textos esperados na saída, **na ordem**, cada um a partir de onde o
 * anterior foi encontrado.
 *
 * A procura é por trecho, e não por linha idêntica, por um motivo concreto:
 * `print("Idade:", idade)` mostra `Idade: 34`, e exigir a linha exata `34`
 * reprovaria um programa certo. O que vier a mais na saída não é erro — quem
 * está aprendendo costuma imprimir no meio do caminho para ver o que acontece, e
 * isso é bom sinal, não defeito.
 */
function conferirSaida(
  saidaEsperada: readonly string[],
  doPrograma: readonly string[],
): readonly ItemDaConferencia[] {
  const itens: ItemDaConferencia[] = []
  let apartirDe = 0

  saidaEsperada.forEach((texto, indice) => {
    const rotulo =
      saidaEsperada.length === 1 ? 'Texto esperado na saída' : `Texto esperado ${indice + 1}`
    const esperado = entreAspas(texto)

    const posicao = doPrograma.findIndex(
      (linha, onde) => onde >= apartirDe && linha.includes(texto),
    )

    if (posicao === -1) {
      itens.push(itemQueNaoConfere(rotulo, esperado, 'não apareceu na saída'))
      return
    }

    apartirDe = posicao + 1
    itens.push(itemQueDeuCerto(rotulo, esperado, entreAspas(doPrograma[posicao] ?? '')))
  })

  return itens
}

/** Confere um valor medido pela sonda: pelo texto exato, pelo tipo, ou na saída. */
function conferirValor(
  valor: ValorEsperado,
  indice: number,
  sondas: readonly Sondagem[],
  doPrograma: readonly string[],
): ItemDaConferencia {
  const esperado = 'tipoEsperado' in valor
    ? descreverTipo(valor.tipoEsperado)
    : 'igualA' in valor
      ? valor.igualA
      : `o valor de ${valor.expressao} aparecer na saída`

  const medida = sondas.find((sonda) => sonda.indice === indice)
  if (medida === undefined) {
    // A sonda existe, mas não chegou a imprimir: acontece quando o programa
    // termina antes dela (uma saída antecipada, por exemplo). Dizer "não
    // confere" aqui seria culpar o programa por algo que a conferência não viu.
    return {
      rotulo: valor.rotulo,
      situacao: 'naoDeuParaConferir',
      esperado,
      obtido: 'a conferência não chegou a olhar este valor',
    }
  }

  if ('tipoEsperado' in valor) {
    const obtido = descreverTipo(medida.tipo)
    return medida.tipo === valor.tipoEsperado
      ? itemQueDeuCerto(valor.rotulo, esperado, obtido)
      : itemQueNaoConfere(valor.rotulo, esperado, obtido)
  }

  if ('igualA' in valor) {
    return medida.textoRepr.trim() === valor.igualA.trim()
      ? itemQueDeuCerto(valor.rotulo, valor.igualA, medida.textoRepr)
      : itemQueNaoConfere(valor.rotulo, valor.igualA, medida.textoRepr)
  }

  const onde = doPrograma.findIndex((linha) => linha.includes(medida.texto))
  if (medida.texto.trim() === '') {
    return itemQueNaoConfere(valor.rotulo, esperado, 'o valor é vazio, e nada apareceu na saída')
  }
  return onde === -1
    ? itemQueNaoConfere(
        valor.rotulo,
        esperado,
        `não aparece na saída (o valor guardado é ${medida.textoRepr})`,
      )
    : itemQueDeuCerto(valor.rotulo, esperado, entreAspas(doPrograma[onde] ?? ''))
}

/**
 * Confere o exercício contra o que o programa produziu.
 *
 * Devolve sempre um resultado — inclusive quando não deu para conferir. "Não deu
 * para conferir" é uma resposta legítima e diferente de "não confere": a
 * primeira diz que a conferência não chegou lá, a segunda diz que chegou e o
 * resultado foi outro. Misturar as duas seria dizer ao estudante que ele errou
 * quando o programa nem rodou.
 */
export function conferirExercicio(
  correcao: CorrecaoDoExercicio,
  execucao: ExecucaoParaConferir,
): ResultadoDaConferencia {
  const { doPrograma, sondas } = separarSondagem(execucao.linhas)

  if (execucao.foiErro) {
    const primeiraLinha = execucao.linhas.find((linha) => linha.trim() !== '') ?? ''
    return {
      situacao: 'naoDeuParaConferir',
      itens: [
        {
          rotulo: 'O programa rodar até o fim',
          situacao: 'naoDeuParaConferir',
          esperado: 'terminar sem erro',
          obtido:
            primeiraLinha.trim() === ''
              ? 'o programa parou sem dizer por quê'
              : primeiraLinha.trim(),
        },
      ],
      explicacao:
        'O programa não chegou ao fim, então não há resultado para conferir. A mensagem do Python está logo acima: conserte o que ela aponta e rode de novo.',
      limite: correcao.limite,
    }
  }

  const itens: ItemDaConferencia[] = [
    ...conferirSaida(correcao.saidaEsperada ?? [], doPrograma),
    ...(correcao.valoresEsperados ?? []).map((valor, indice) =>
      conferirValor(valor, indice, sondas, doPrograma),
    ),
  ]

  const linhasPedidas = correcao.estrutura?.linhasNaoVazias
  if (linhasPedidas !== undefined) {
    const impressas = doPrograma.filter((linha) => linha.trim() !== '').length
    const rotulo = 'Quantidade de linhas impressas'
    const esperado = `${linhasPedidas}`
    itens.push(
      impressas === linhasPedidas
        ? itemQueDeuCerto(rotulo, esperado, `${impressas}`)
        : itemQueNaoConfere(rotulo, esperado, `${impressas}`),
    )
  }

  if (correcao.estrutura?.comentario === true) {
    const rotulo = 'Comentário explicando o cálculo'
    // A sonda não acrescenta nenhuma linha começada por `#`, então um comentário
    // encontrado aqui só pode ter vindo do programa do estudante.
    const temComentario = codigoDoEstudante(execucao.codigo)
      .split('\n')
      .some((linha) => linha.trimStart().startsWith('#'))
    itens.push(
      temComentario
        ? itemQueDeuCerto(rotulo, 'existe', 'existe')
        : itemQueNaoConfere(rotulo, 'existe', 'não existe'),
    )
  }

  const naoPassou = itens.some((item) => item.situacao === 'naoConfere')
  const naoConferiu = itens.some((item) => item.situacao === 'naoDeuParaConferir')
  const situacao: SituacaoDaConferencia = naoPassou
    ? 'naoConfere'
    : naoConferiu
      ? 'naoDeuParaConferir'
      : 'deuCerto'

  return { situacao, itens, explicacao: explicacaoDa(situacao, itens), limite: correcao.limite }
}

function explicacaoDa(
  situacao: SituacaoDaConferencia,
  itens: readonly ItemDaConferencia[],
): string {
  if (itens.length === 0) {
    return 'Este exercício não tem o que conferir automaticamente.'
  }

  switch (situacao) {
    case 'deuCerto':
      return 'Tudo o que esta conferência olha deu certo. Isto não é nota: o que aprova a ilha é a avaliação, e o que a conferência não olha está dito abaixo.'
    case 'naoConfere': {
      const quantos = itens.filter((item) => item.situacao === 'naoConfere').length
      return quantos === 1
        ? 'Uma coisa não confere — veja qual, abaixo. O resto deu certo.'
        : `${quantos} coisas não conferem — veja quais, abaixo. O resto deu certo.`
    }
    case 'naoDeuParaConferir':
      return 'A conferência não conseguiu olhar tudo o que precisava. Isto não quer dizer que o exercício está errado.'
  }
}

/** Frase curta para o cartão do exercício, longe do console. */
export function resumoDaConferencia(resultado: ResultadoDaConferencia): string {
  switch (resultado.situacao) {
    case 'deuCerto':
      return 'Conferido: tudo confere'
    case 'naoConfere':
      return 'Conferido: ainda não confere'
    case 'naoDeuParaConferir':
      return 'Conferência não concluída'
  }
}

/**
 * Lista os tipos de valor que o conteúdo pode exigir.
 *
 * Existe para o validador do conteúdo poder recusar um tipo escrito errado
 * (`'inteiro'`, `'texto'`) antes de ele virar uma comparação que nunca dá certo.
 */
export const TIPOS_DE_VALOR: readonly TipoDeValor[] = [
  'str',
  'int',
  'float',
  'bool',
  'list',
  'tuple',
  'dict',
]
