import { describe, expect, it } from 'vitest'
import { SEM_TECLAS, type TeclasDeMovimento } from './camera/movimento'
import { TECLAS_DE_MOVIMENTO, aplicarTecla, ehTeclaDeMovimento, soltarTodas } from './teclas'

describe('mapa de teclas', () => {
  it('reconhece as teclas de movimento', () => {
    for (const codigo of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'ShiftLeft']) {
      expect(ehTeclaDeMovimento(codigo), `${codigo} deveria mover a câmera`).toBe(true)
    }
  })

  it('reconhece as setas como alternativa às letras', () => {
    // Nem todo mundo usa WASD; as setas custam nada e ajudam.
    for (const codigo of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
      expect(ehTeclaDeMovimento(codigo)).toBe(true)
    }
  })

  it('ignora teclas que não são de movimento', () => {
    // Digitar uma resposta não pode mexer na câmera (decisão D-012).
    for (const codigo of ['KeyZ', 'Space', 'Enter', 'Escape', 'Digit1', 'Backspace']) {
      expect(ehTeclaDeMovimento(codigo), `${codigo} não deveria mover a câmera`).toBe(false)
    }
  })

  it('não usa tecla acentuada em nenhuma intenção', () => {
    // Teclas acentuadas mudam de lugar entre layouts de teclado.
    const todas = Object.values(TECLAS_DE_MOVIMENTO).flat()
    for (const codigo of todas) {
      expect(codigo).toMatch(/^[A-Za-z0-9]+$/)
    }
  })
})

describe('aplicar uma tecla', () => {
  it('marca a intenção correspondente', () => {
    const teclas = aplicarTecla(SEM_TECLAS, 'KeyW', true)
    expect(teclas.frente).toBe(true)
    expect(teclas.tras).toBe(false)
  })

  it('desmarca ao soltar', () => {
    const pressionada = aplicarTecla(SEM_TECLAS, 'KeyD', true)
    const solta = aplicarTecla(pressionada, 'KeyD', false)
    expect(solta.direita).toBe(false)
  })

  it('devolve objeto novo, sem alterar o anterior', () => {
    const antes = { ...SEM_TECLAS }
    const depois = aplicarTecla(antes, 'KeyE', true)
    expect(antes.subir).toBe(false)
    expect(depois).not.toBe(antes)
  })

  it('aceita as duas formas de correr', () => {
    expect(aplicarTecla(SEM_TECLAS, 'ShiftLeft', true).rapido).toBe(true)
    expect(aplicarTecla(SEM_TECLAS, 'ShiftRight', true).rapido).toBe(true)
  })

  it('não muda nada com tecla desconhecida', () => {
    expect(aplicarTecla(SEM_TECLAS, 'KeyP', true)).toEqual(SEM_TECLAS)
  })

  it('mantém as outras intenções ao mexer em uma', () => {
    const duas = aplicarTecla(aplicarTecla(SEM_TECLAS, 'KeyW', true), 'KeyE', true)
    expect(duas.frente).toBe(true)
    expect(duas.subir).toBe(true)
    expect(duas.tras).toBe(false)
  })
})

describe('soltar tudo', () => {
  it('devolve o estado sem nenhuma tecla', () => {
    expect(soltarTodas()).toEqual(SEM_TECLAS)
  })

  it('não compartilha referência com o estado inicial', () => {
    // Se compartilhasse, mexer no resultado alteraria o estado inicial usado
    // em outros lugares.
    const soltas: TeclasDeMovimento = soltarTodas()
    expect(soltas).not.toBe(SEM_TECLAS)
    expect({ ...soltas }).toEqual(SEM_TECLAS)
  })
})
