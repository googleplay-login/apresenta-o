import type { UnidadeDoPercurso } from '../learning/percurso'
import { PLANO_DE_UNIDADES } from './planoDeUnidades'
import { conteudoDaUnidade } from './unidades'

/**
 * O percurso como o domínio o vê: identificador, ordem e **os exercícios de cada
 * unidade**.
 *
 * Por que isto existe em vez de cada tela montar a sua lista: o progresso guarda
 * *quais exercícios foram conferidos*, e o domínio só aceita marcar exercício que
 * é da unidade (D-046). Se a lista de exercícios morasse na tela, ela seria uma
 * segunda fonte de verdade — e um identificador errado ficaria guardado para
 * sempre sem nunca aparecer em lugar nenhum.
 *
 * A lista sai do **conteúdo**: as mesmas unidades que o mundo desenha e que a
 * aba de prática mostra. Unidade planejada que ainda não tem conteúdo entra com
 * `exercicios: []`, e nada quebra por causa disso.
 */
export const PERCURSO_DO_CONTEUDO: readonly UnidadeDoPercurso[] = PLANO_DE_UNIDADES.map(
  (planejada) => ({
    id: planejada.id,
    ordem: planejada.ordem,
    exercicios: conteudoDaUnidade(planejada.id)?.pratica.map((exercicio) => exercicio.id) ?? [],
  }),
)
