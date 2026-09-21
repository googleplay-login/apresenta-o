import type { ConteudoDaUnidade } from '../tiposDeConteudo'
import { u01PrimeiroPrograma } from './u01PrimeiroPrograma'
import { u02Variaveis } from './u02Variaveis'
import { u03Strings } from './u03Strings'
import { u04Listas } from './u04Listas'
import { u05MoinhoDasRepeticoes } from './u05MoinhoDasRepeticoes'
import { u06EncruzilhadaDasDecisoes } from './u06EncruzilhadaDasDecisoes'
import { u07FarolDosRegistros } from './u07FarolDosRegistros'
import { u08EstacaoDasPerguntas } from './u08EstacaoDasPerguntas'
import { u09OficinaDasFuncoes } from './u09OficinaDasFuncoes'
import { u10TorreDasClasses } from './u10TorreDasClasses'
import { u11ArquivoDasGavetas } from './u11ArquivoDasGavetas'
import { u12BalancaDosTestes } from './u12BalancaDosTestes'
import { u13EstaleiroDaNave } from './u13EstaleiroDaNave'
import { u14EnxameDosDiscos } from './u14EnxameDosDiscos'
import { u15PlacarDaBatalha } from './u15PlacarDaBatalha'
import { u16FabricaDeDados } from './u16FabricaDeDados'
import { u17CadernoDeDados } from './u17CadernoDeDados'
import { u18EstacaoDeEscuta } from './u18EstacaoDeEscuta'

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
  u07FarolDosRegistros,
  u08EstacaoDasPerguntas,
  u09OficinaDasFuncoes,
  u10TorreDasClasses,
  u11ArquivoDasGavetas,
  u12BalancaDosTestes,
  u13EstaleiroDaNave,
  u14EnxameDosDiscos,
  u15PlacarDaBatalha,
  u16FabricaDeDados,
  u17CadernoDeDados,
  u18EstacaoDeEscuta,
]

/** Conteúdo de uma unidade, ou `null` se ela ainda não foi escrita. */
export function conteudoDaUnidade(id: string): ConteudoDaUnidade | null {
  return CONTEUDO_DAS_UNIDADES.find((unidade) => unidade.id === id) ?? null
}
