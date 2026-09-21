import { PERGUNTAS_POR_UNIDADE } from '../learning/avaliacao'
import type { ConteudoDaUnidade, Pergunta } from './tiposDeConteudo'

/**
 * Validação do conteúdo pedagógico.
 *
 * Função pura, chamada por teste. Existe porque conteúdo é dado, e dado erra:
 * uma pergunta sem alternativa correta válida, um exercício sem solução, duas
 * unidades com o mesmo id. Nada disso quebra o build, mas tudo isso quebra a
 * experiência do estudante — e ele é quem descobre, no meio do estudo.
 *
 * O que este validador **não** faz: julgar se o texto é bom, se a explicação
 * ensina ou se a alternativa errada é plausível. Isso continua sendo revisão
 * humana. Ele verifica forma e coerência, e só isso.
 */

const LINGUAGENS = ['python', 'terminal'] as const

/**
 * A partir de quantos caracteres a alternativa correta se destaca das outras.
 *
 * Diferença pequena é coincidência de redação; diferença grande vira **pista**.
 * Uma alternativa certa muito mais longa que as erradas ensina a acertar por
 * tamanho, sem saber o assunto — o mesmo defeito do gabarito viciado em uma
 * posição (D-027), só que medido em caracteres.
 */
const VANTAGEM_DE_TAMANHO = 12

/**
 * Expressões que transformam a pergunta em sorteio.
 *
 * "Todas as anteriores" não mede entendimento: quem não estudou responde a mesma
 * coisa em qualquer pergunta, e quem marcou errado não descobre por quê.
 */
const EXPRESSOES_PROIBIDAS = [
  'todas as anteriores',
  'nenhuma das anteriores',
  'todas estão corretas',
  'nenhuma está correta',
] as const

/**
 * Problemas de um diagrama.
 *
 * Um diagrama com uma caixa só não desenha nada, e um com rótulos repetidos
 * confunde mais do que explica. Estas duas coisas são forma, e forma erra em
 * silêncio no meio de um texto longo — por isso são conferidas por teste.
 */
function problemasNoDiagrama(
  bloco: { readonly titulo: string; readonly descricao: string; readonly partes: readonly { readonly rotulo: string; readonly valor: string }[] },
  onde: string,
): readonly string[] {
  const problemas: string[] = []

  if (bloco.titulo.trim() === '') {
    problemas.push(`${onde}: sem título`)
  }
  if (bloco.descricao.trim() === '') {
    problemas.push(`${onde}: sem descrição do que o desenho mostra`)
  }
  if (bloco.partes.length < 2) {
    problemas.push(`${onde}: precisa de ao menos duas caixas para mostrar alguma coisa`)
  }

  const rotulos = new Set<string>()
  for (const parte of bloco.partes) {
    if (parte.rotulo.trim() === '' || parte.valor.trim() === '') {
      problemas.push(`${onde}: caixa com rótulo ou valor vazio`)
    }
    if (rotulos.has(parte.rotulo)) {
      problemas.push(`${onde}: rótulo repetido (${parte.rotulo})`)
    }
    rotulos.add(parte.rotulo)
  }

  return problemas
}

/**
 * Motivo de não rodar no console: quando existe, precisa **explicar**.
 *
 * "Não roda" sem motivo é a mesma coisa que um botão sem efeito: a pessoa fica
 * sem saber se o problema é o programa dela, o conteúdo ou o console.
 */
function problemasNoMotivoDeNaoRodar(
  motivo: string | undefined,
  onde: string,
): readonly string[] {
  if (motivo === undefined) {
    return []
  }
  if (motivo.trim().length < 40) {
    return [`${onde}: motivo de não rodar no console curto demais ("${motivo}")`]
  }
  return []
}

/** Reclamações encontradas. Vazio significa conteúdo consistente. */
export function problemasNoConteudo(unidade: ConteudoDaUnidade): readonly string[] {
  const problemas: string[] = []
  const onde = `unidade ${unidade.id}`

  if (unidade.id.trim() === '') {
    problemas.push('unidade sem id')
  }
  if (unidade.missao.trim().length < 20) {
    problemas.push(`${onde}: missão curta demais ou vazia`)
  }
  if (unidade.leitura.parte.trim() === '' || unidade.leitura.porque.trim() === '') {
    problemas.push(`${onde}: leitura recomendada incompleta`)
  }
  if (unidade.leitura.oQueObservar.length === 0) {
    problemas.push(`${onde}: leitura recomendada sem pontos de observação`)
  }
  if (unidade.leitura.oQueObservar.some((ponto) => ponto.trim() === '')) {
    problemas.push(`${onde}: ponto de observação vazio na leitura recomendada`)
  }
  if (unidade.leitura.semOLivro.trim().length < 20) {
    problemas.push(`${onde}: texto de "sem o livro" curto demais ou vazio`)
  }
  if (unidade.explicacao.length === 0) {
    problemas.push(`${onde}: explicação vazia`)
  }

  for (const [indice, bloco] of unidade.explicacao.entries()) {
    if (bloco.tipo === 'codigo') {
      if (bloco.codigo.trim() === '') {
        problemas.push(`${onde}: bloco de código ${indice + 1} vazio`)
      }
      if (!LINGUAGENS.includes(bloco.linguagem)) {
        problemas.push(`${onde}: bloco de código ${indice + 1} com linguagem desconhecida`)
      }
      problemas.push(
        ...problemasNoMotivoDeNaoRodar(
          bloco.naoRodaNoConsole,
          `${onde}: bloco de código ${indice + 1}`,
        ),
      )
    } else if (bloco.tipo === 'lista') {
      if (bloco.itens.length === 0) {
        problemas.push(`${onde}: lista ${indice + 1} sem itens`)
      }
    } else if (bloco.tipo === 'diagrama') {
      problemas.push(...problemasNoDiagrama(bloco, `${onde}: diagrama ${indice + 1}`))
    } else if (bloco.texto.trim() === '') {
      problemas.push(`${onde}: bloco ${indice + 1} com texto vazio`)
    }
  }

  if (unidade.pratica.length === 0) {
    problemas.push(`${onde}: nenhum exercício de prática`)
  }

  const idsDeExercicio = new Set<string>()
  for (const exercicio of unidade.pratica) {
    if (idsDeExercicio.has(exercicio.id)) {
      problemas.push(`${onde}: exercício repetido (${exercicio.id})`)
    }
    idsDeExercicio.add(exercicio.id)

    if (exercicio.enunciado.trim() === '') {
      problemas.push(`${onde}: exercício ${exercicio.id} sem enunciado`)
    }
    if (exercicio.solucao.trim() === '') {
      problemas.push(`${onde}: exercício ${exercicio.id} sem solução de referência`)
    }
    if (exercicio.conferencia.trim() === '') {
      problemas.push(`${onde}: exercício ${exercicio.id} sem critério de conferência`)
    }
    problemas.push(
      ...problemasNoMotivoDeNaoRodar(
        exercicio.naoRodaNoConsole,
        `${onde}: exercício ${exercicio.id}`,
      ),
    )
  }

  problemas.push(...problemasNasPerguntas(unidade))

  return problemas
}

function problemasNasPerguntas(unidade: ConteudoDaUnidade): readonly string[] {
  const problemas: string[] = []
  const onde = `unidade ${unidade.id}`

  if (unidade.perguntas.length !== PERGUNTAS_POR_UNIDADE) {
    problemas.push(
      `${onde}: tem ${unidade.perguntas.length} perguntas, e o mínimo declarado é ${PERGUNTAS_POR_UNIDADE}`,
    )
  }

  const ids = new Set<string>()
  for (const pergunta of unidade.perguntas) {
    problemas.push(...problemasNaPergunta(pergunta, onde, ids))
  }

  // Nenhuma pergunta isolada precisa ser perfeita; o vício aparece no conjunto.
  const destacadas = unidade.perguntas.filter((pergunta) => corretaEDestaque(pergunta)).length
  const permitidas = Math.floor(unidade.perguntas.length / 2)
  if (destacadas > permitidas) {
    problemas.push(
      `${onde}: em ${destacadas} de ${unidade.perguntas.length} perguntas a alternativa correta é ` +
        `a mais longa por ${VANTAGEM_DE_TAMANHO} caracteres ou mais (o limite é ${permitidas}): ` +
        'dá para acertar escolhendo a maior.',
    )
  }

  return problemas
}

/**
 * Verdadeiro quando a alternativa correta se destaca por tamanho.
 *
 * Empate não conta: duas alternativas do mesmo tamanho não destacam nada. O que
 * conta é a correta ser a maior **e** passar das demais por uma margem visível.
 */
function corretaEDestaque(pergunta: Pergunta): boolean {
  const comprimentos = pergunta.alternativas.map((alternativa) => alternativa.length)
  const comprimentoDaCorreta = comprimentos[pergunta.correta]
  if (comprimentoDaCorreta === undefined) {
    return false
  }
  const demais = comprimentos.filter((_, indice) => indice !== pergunta.correta)
  const maiorDasDemais = Math.max(0, ...demais)
  return comprimentoDaCorreta >= maiorDasDemais + VANTAGEM_DE_TAMANHO
}

function problemasNaPergunta(
  pergunta: Pergunta,
  onde: string,
  ids: Set<string>,
): readonly string[] {
  const problemas: string[] = []

  if (ids.has(pergunta.id)) {
    problemas.push(`${onde}: pergunta repetida (${pergunta.id})`)
  }
  ids.add(pergunta.id)

  if (pergunta.enunciado.trim().length < 20) {
    problemas.push(`${onde}: pergunta ${pergunta.id} com enunciado curto demais ou vazio`)
  }
  if (pergunta.alternativas.length !== 4) {
    problemas.push(
      `${onde}: pergunta ${pergunta.id} tem ${pergunta.alternativas.length} alternativas, e o padrão é 4`,
    )
  }
  if (pergunta.correta < 0 || pergunta.correta >= pergunta.alternativas.length) {
    problemas.push(`${onde}: pergunta ${pergunta.id} aponta para alternativa inexistente`)
  }
  if (new Set(pergunta.alternativas).size !== pergunta.alternativas.length) {
    problemas.push(`${onde}: pergunta ${pergunta.id} tem alternativas repetidas`)
  }
  if (pergunta.alternativas.some((alternativa) => alternativa.trim() === '')) {
    problemas.push(`${onde}: pergunta ${pergunta.id} tem alternativa vazia`)
  }
  if (pergunta.explicacao.trim().length < 40) {
    problemas.push(`${onde}: pergunta ${pergunta.id} com explicação curta demais ou vazia`)
  }
  if (pergunta.alternativas.includes(pergunta.explicacao.trim())) {
    problemas.push(`${onde}: pergunta ${pergunta.id} explicação repetida de uma alternativa`)
  }

  for (const alternativa of pergunta.alternativas) {
    const minuscula = alternativa.toLowerCase()
    if (EXPRESSOES_PROIBIDAS.some((expressao) => minuscula.includes(expressao))) {
      problemas.push(
        `${onde}: pergunta ${pergunta.id} com alternativa "${alternativa}" — não mede entendimento`,
      )
    }
  }

  return problemas
}

/**
 * Gabarito de uma unidade: os índices corretos, na ordem das perguntas.
 * É o que a correção usa — o componente nunca decide o que está certo.
 */
export function gabaritoDaUnidade(unidade: ConteudoDaUnidade): readonly number[] {
  return unidade.perguntas.map((pergunta) => pergunta.correta)
}
