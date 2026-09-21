import type { ConteudoDaUnidade } from '../tiposDeConteudo'
import { u01PrimeiroPrograma } from './u01PrimeiroPrograma'
import { u02Variaveis } from './u02Variaveis'
import { u03Strings } from './u03Strings'
import { u04Listas } from './u04Listas'
import { u05MoinhoDasRepeticoes } from './u05MoinhoDasRepeticoes'
import { u06EncruzilhadaDasDecisoes } from './u06EncruzilhadaDasDecisoes'

/**
 * Conteúdo escrito até agora, na ordem do percurso.
 *
 * Acrescentar uma unidade nova é acrescentar um arquivo e uma linha aqui — e
 * rodar os testes, que conferem as invariantes do conteúdo (ver
 * `validadorDeConteudo.ts`).
 */
export const CONTEUDO_DAS_UNIDADES: readonly ConteudoDaUnidade[] = [
  u01PrimeiroPrograma,
  u02Variaveis,
  u03Strings,
  u04Listas,
  u05MoinhoDasRepeticoes,
  u06EncruzilhadaDasDecisoes,
]

/** Conteúdo de uma unidade, ou `null` se ela ainda não foi escrita. */
export function conteudoDaUnidade(id: string): ConteudoDaUnidade | null {
  return CONTEUDO_DAS_UNIDADES.find((unidade) => unidade.id === id) ?? null
}
