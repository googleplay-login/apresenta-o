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

  return problemas
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

  if (pergunta.enunciado.trim() === '') {
    problemas.push(`${onde}: pergunta ${pergunta.id} sem enunciado`)
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
  if (pergunta.explicacao.trim() === '') {
    problemas.push(`${onde}: pergunta ${pergunta.id} sem explicação para depois do envio`)
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
