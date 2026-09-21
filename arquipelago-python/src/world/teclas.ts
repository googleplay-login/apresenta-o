import type { TeclasDeMovimento } from './camera/movimento'
import { SEM_TECLAS } from './camera/movimento'

/**
 * Tradução de teclas em intenções de movimento.
 *
 * Fica separado do componente por dois motivos: testar sem navegador, e deixar
 * escrito em um lugar só qual tecla faz o quê. É também onde fica registrado que
 * as teclas **acentuadas não são usadas** — `W A S D` funciona em qualquer
 * teclado, e tecla de acento muda de lugar entre layouts.
 */

/** Teclas que interessam ao mundo, pelo `code` do evento (independe do layout). */
export const TECLAS_DE_MOVIMENTO = {
  frente: ['KeyW', 'ArrowUp'],
  tras: ['KeyS', 'ArrowDown'],
  esquerda: ['KeyA', 'ArrowLeft'],
  direita: ['KeyD', 'ArrowRight'],
  subir: ['KeyE'],
  descer: ['KeyQ'],
  rapido: ['ShiftLeft', 'ShiftRight'],
} as const satisfies Record<keyof TeclasDeMovimento, readonly string[]>

/** Verdadeiro se a tecla participa do movimento da câmera. */
export function ehTeclaDeMovimento(codigo: string): boolean {
  return Object.values(TECLAS_DE_MOVIMENTO).some((lista) =>
    (lista as readonly string[]).includes(codigo),
  )
}

/** Atualiza as teclas pressionadas com um evento. Devolve um objeto novo. */
export function aplicarTecla(
  teclas: TeclasDeMovimento,
  codigo: string,
  pressionada: boolean,
): TeclasDeMovimento {
  const resultado: Record<string, boolean> = { ...teclas }

  for (const [intencao, codigos] of Object.entries(TECLAS_DE_MOVIMENTO)) {
    if ((codigos as readonly string[]).includes(codigo)) {
      resultado[intencao] = pressionada
    }
  }

  return resultado as TeclasDeMovimento
}

/** Limpa todas as teclas. Usado quando a janela perde o foco. */
export function soltarTodas(): TeclasDeMovimento {
  // Devolve um objeto novo, e não a constante compartilhada: assim ninguém
  // altera, por acidente, o estado inicial usado em outros lugares.
  return { ...SEM_TECLAS }
}
