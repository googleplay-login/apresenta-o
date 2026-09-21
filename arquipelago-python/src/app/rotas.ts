/**
 * Rotas da aplicação, resolvidas pelo `hash` da URL.
 *
 * Por que hash e não caminho: funciona igual em desenvolvimento, no build de
 * produção e em qualquer hospedagem estática, sem precisar de regra de reescrita
 * no servidor.
 *
 * Importante: a rota **não** carrega estado de progresso. Nenhuma função de
 * `src/learning/` aceita rota, hash ou parâmetro de URL como entrada — é o que
 * impede alguém de desbloquear uma unidade pela barra de endereços. As rotas
 * trocam o que está na tela, e só.
 */

export const ROTAS = {
  mundo: '#/',
  painel: '#/painel',
  tema: '#/tema',
} as const

export type Rota = keyof typeof ROTAS

/** Rota usada quando o hash está vazio ou não corresponde a nada conhecido. */
export const ROTA_PADRAO: Rota = 'mundo'

const POR_HASH: ReadonlyMap<string, Rota> = new Map([
  ['', 'mundo'],
  ['#', 'mundo'],
  ['#/', 'mundo'],
  ['#/mundo', 'mundo'],
  ['#/painel', 'painel'],
  ['#/tema', 'tema'],
])

/** Traduz um hash em rota. Valor desconhecido cai na rota padrão, sem erro. */
export function rotaDoHash(hash: string): Rota {
  const chave = hash.trim().toLowerCase().replace(/\/+$/, '') || '#'
  return POR_HASH.get(chave) ?? ROTA_PADRAO
}

/** Endereço de uma rota, para usar em links. */
export function enderecoDaRota(rota: Rota): string {
  return ROTAS[rota]
}

/** Hash atual, com proteção para ambiente sem `window` (teste e render estático). */
export function hashAtual(): string {
  return typeof window === 'undefined' ? '' : window.location.hash
}
