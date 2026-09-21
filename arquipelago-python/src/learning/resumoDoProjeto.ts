/**
 * Frases sobre as regras do projeto exibidas na interface.
 *
 * Por que isto existe: os números das regras (80%, 5 perguntas, 4 acertos) não
 * podem ser escritos duas vezes. Aqui eles vêm das constantes de `./avaliacao`,
 * então mudar a regra muda o texto junto. Se estivessem escritos à mão na
 * interface, a tela passaria a mentir sem ninguém perceber.
 *
 * Este é o único motivo de existir deste módulo: manter discurso e regra presos
 * um ao outro.
 */
import {
  ACERTOS_MINIMOS_PADRAO,
  NOTA_MINIMA_PERCENTUAL,
  PERGUNTAS_POR_UNIDADE,
} from './avaliacao'

export const ESTADO_DO_PROJETO = {
  notaFraca:
    `Aprovar exige ${NOTA_MINIMA_PERCENTUAL}% de acertos reais. O que aparece na tela é sempre ` +
    'arredondado para baixo: quem acerta 79% lê 79%, e não 80%.',

  reprovacao:
    `${PERGUNTAS_POR_UNIDADE} perguntas por unidade, ${ACERTOS_MINIMOS_PADRAO} acertos aprovam. ` +
    'Repetir a avaliação não bloqueia a unidade e não apaga uma aprovação anterior.',

  desbloqueio:
    'Aprovar a unidade 2 abre a 3 — e só ela. A 5 continua fechada enquanto a 4 estiver pendente.',

  semAtalho:
    'Nenhuma dessas regras aceita rota, hash ou parâmetro de URL. Abrir um painel ou clicar numa ' +
    'ponte não muda o estado: só um resultado de avaliação válido muda.',

  leitura:
    'Marcar a leitura do livro como feita é registro, não permissão: não aprova a unidade, não ' +
    'abre a ponte e não muda nota nenhuma. Quem decide se a pessoa segue é a nota da avaliação.',
} as const
