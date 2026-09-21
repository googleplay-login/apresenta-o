/**
 * Gerador de números pseudoaleatórios com semente.
 *
 * Por que não usar `Math.random()`: a geometria do mundo precisa ser **a mesma
 * toda vez que a página abre**. Se a rocha de uma ilha mudasse a cada
 * carregamento, o estudante não reconheceria o próprio mundo, e nenhum teste de
 * geometria seria possível.
 *
 * Algoritmo mulberry32: pequeno, rápido e suficiente para desenhar pedra. Não
 * serve para criptografia — e não é usado para isso.
 */

export type Sorteador = () => number

/** Cria um sorteador determinístico. A mesma semente devolve a mesma sequência. */
export function criarSorteador(semente: number): Sorteador {
  let estado = semente >>> 0

  return function sortear(): number {
    estado = (estado + 0x6d2b79f5) >>> 0
    let resultado = estado
    resultado = Math.imul(resultado ^ (resultado >>> 15), resultado | 1)
    resultado ^= resultado + Math.imul(resultado ^ (resultado >>> 7), resultado | 61)
    return ((resultado ^ (resultado >>> 14)) >>> 0) / 4294967296
  }
}

/** Número entre `minimo` e `maximo`, com o sorteador informado. */
export function entre(sortear: Sorteador, minimo: number, maximo: number): number {
  return minimo + sortear() * (maximo - minimo)
}

/**
 * Semente estável a partir de um texto.
 *
 * Usada para que cada ilha tenha uma rocha própria e sempre igual, derivada do
 * id da unidade — e não de um número solto que alguém precisa gerenciar.
 */
export function sementeDeTexto(texto: string): number {
  let valor = 2166136261
  for (let indice = 0; indice < texto.length; indice += 1) {
    valor ^= texto.charCodeAt(indice)
    valor = Math.imul(valor, 16777619)
  }
  return valor >>> 0
}
