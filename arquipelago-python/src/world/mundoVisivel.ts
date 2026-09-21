import type { UnidadePlanejada } from '../content/planoDeUnidades'
import {
  estadoDaUnidade,
  proximaUnidade,
  unidadeEstaAcessivel,
  type EstadoDaUnidade,
  type Progresso,
} from '../learning/percurso'
import { ilhasDoMundo, pontesDoPercurso, type IlhaDoMundo, type TrechoDePonte } from './mapaDoMundo'

/**
 * O que o mundo mostra, dado o progresso.
 *
 * Esta é a única ligação entre o progresso do estudante e a cena 3D. O
 * componente da cena **não** decide nada: ele recebe ilhas com situação já
 * resolvida e pontes com `liberada` já resolvido. Assim não existe uma segunda
 * regra de desbloqueio escondida no desenho, que é justamente o que a decisão
 * D-004 proíbe.
 */

export type IlhaVisivel = IlhaDoMundo & {
  readonly situacao: EstadoDaUnidade
  /** `true` quando o estudante pode entrar (disponível ou aprovada). */
  readonly acessivel: boolean
}

export type PonteVisivel = TrechoDePonte & {
  /** A ponte só está inteira quando a ilha de destino já pode ser visitada. */
  readonly liberada: boolean
}

/** Ilhas com a situação de cada uma, na ordem do percurso. */
export function ilhasVisiveis(
  progresso: Progresso,
  unidades: readonly UnidadePlanejada[],
): readonly IlhaVisivel[] {
  const percurso = unidades.map((unidade) => ({ id: unidade.id, ordem: unidade.ordem }))

  return ilhasDoMundo(unidades).map((ilha) => ({
    ...ilha,
    situacao: estadoDaUnidade(progresso, percurso, ilha.id),
    acessivel: unidadeEstaAcessivel(progresso, percurso, ilha.id),
  }))
}

/** Pontes com o estado de construção, na ordem do percurso. */
export function pontesVisiveis(
  progresso: Progresso,
  unidades: readonly UnidadePlanejada[],
  ilhas: readonly IlhaVisivel[],
): readonly PonteVisivel[] {
  const percurso = unidades.map((unidade) => ({ id: unidade.id, ordem: unidade.ordem }))

  return pontesDoPercurso(ilhas).map((trecho) => ({
    ...trecho,
    // Quem manda é a acessibilidade do destino, medida pelo domínio.
    liberada: unidadeEstaAcessivel(progresso, percurso, trecho.para),
  }))
}

/**
 * A ilha onde o estudante deveria estar agora: a primeira ainda não aprovada.
 * Se todas foram aprovadas, é a última — não existe "nada para fazer".
 */
export function ilhaAtual(
  progresso: Progresso,
  unidades: readonly UnidadePlanejada[],
): IlhaDoMundo | null {
  const percurso = unidades.map((unidade) => ({ id: unidade.id, ordem: unidade.ordem }))
  const proxima = proximaUnidade(progresso, percurso)
  const ordenadas = [...unidades].sort((uma, outra) => uma.ordem - outra.ordem)
  const alvo = proxima?.id ?? ordenadas[ordenadas.length - 1]?.id ?? null

  if (alvo === null) {
    return null
  }

  return ilhasDoMundo(unidades).find((ilha) => ilha.id === alvo) ?? null
}

/** Quantas ilhas já foram aprovadas e quantas existem. Resumo para a tela. */
export function resumoDoMundo(
  progresso: Progresso,
  unidades: readonly UnidadePlanejada[],
): { readonly aprovadas: number; readonly total: number } {
  const percurso = unidades.map((unidade) => ({ id: unidade.id, ordem: unidade.ordem }))
  const aprovadas = percurso.filter(
    (unidade) => estadoDaUnidade(progresso, percurso, unidade.id) === 'aprovada',
  ).length

  return { aprovadas, total: percurso.length }
}
