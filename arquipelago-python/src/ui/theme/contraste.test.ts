import { describe, expect, it } from 'vitest'
import {
  LIMIAR_AA_TEXTO_NORMAL,
  atendeAA,
  canaisRgb,
  luminanciaRelativa,
  normalizarCor,
  razaoContraste,
} from './contraste'
import { PARES_DE_CONTRASTE, cores, textoDeEstado, tokensComoVariaveisCss } from './tokens'

describe('cálculo de contraste (WCAG 2.1)', () => {
  it('usa os extremos conhecidos da escala', () => {
    expect(razaoContraste('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(razaoContraste('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })

  it('acerta o cinza de referência #767676 sobre branco (4,54:1)', () => {
    // Valor clássico da WCAG: o cinza mais claro que ainda passa em AA sobre branco.
    expect(razaoContraste('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
  })

  it('é simétrica: a ordem dos argumentos não muda o resultado', () => {
    expect(razaoContraste('#2A2A2A', '#F6F3EB')).toBeCloseTo(
      razaoContraste('#F6F3EB', '#2A2A2A'),
      10,
    )
  })

  it('calcula a luminância relativa dos extremos', () => {
    expect(luminanciaRelativa('#000000')).toBeCloseTo(0, 10)
    expect(luminanciaRelativa('#ffffff')).toBeCloseTo(1, 10)
  })

  it('aceita cor em maiúscula e com espaços, e normaliza para minúscula', () => {
    expect(normalizarCor('  #F6F3EB ')).toBe('#f6f3eb')
    expect(canaisRgb('#F6F3EB')).toEqual([246, 243, 235])
  })

  it('recusa cor em formato inválido em vez de devolver um valor errado', () => {
    expect(() => normalizarCor('#abc')).toThrow(/Cor inválida/)
    expect(() => normalizarCor('rgb(1,2,3)')).toThrow(/Cor inválida/)
    expect(() => normalizarCor('#gggggg')).toThrow(/Cor inválida/)
  })

  it('respeita os limiares da WCAG AA em atendeAA', () => {
    expect(atendeAA('#767676', '#ffffff')).toBe(true)
    expect(atendeAA('#C9A063', '#ffffff')).toBe(false)
    expect(atendeAA('#C9A063', '#ffffff', { textoGrande: true })).toBe(false)
    expect(atendeAA('#000000', '#ffffff', { textoGrande: true })).toBe(true)
  })
})

describe('paleta do Arquipélago (tokens reais da interface)', () => {
  it('declara os pares essenciais de leitura', () => {
    expect(PARES_DE_CONTRASTE.length).toBeGreaterThanOrEqual(8)
  })

  it.each(PARES_DE_CONTRASTE.map((par) => [par.onde, par] as const))(
    'atende AA: %s',
    (_onde, par) => {
      const razao = razaoContraste(par.primeiroPlano, par.fundo)
      const limiar = par.textoGrande ? 3 : LIMIAR_AA_TEXTO_NORMAL
      expect(
        razao,
        `Contraste insuficiente em "${par.onde}": ${razao.toFixed(2)}:1 ` +
          `(mínimo ${limiar}:1) entre ${par.primeiroPlano} e ${par.fundo}`,
      ).toBeGreaterThanOrEqual(limiar)
    },
  )

  it('usa texto claro sobre etiqueta escura e texto escuro sobre a etiqueta âmbar', () => {
    // Este teste existe para impedir a regressão mais fácil de cometer:
    // colocar texto branco sobre o âmbar, que dá apenas 2,4:1.
    expect(razaoContraste(textoDeEstado.emConstrucao, cores.acento.ambar)).toBeGreaterThanOrEqual(
      4.5,
    )
    expect(razaoContraste(cores.texto.sobreEscuro, cores.acento.ambar)).toBeLessThan(3)
    expect(textoDeEstado.emConstrucao).toBe(cores.texto.principal)
  })

  it('gera variáveis CSS para todas as cores declaradas', () => {
    const variaveis = tokensComoVariaveisCss() as Record<string, string>
    const valores = Object.values(variaveis)

    for (const cor of [
      cores.painel.fundo,
      cores.texto.principal,
      cores.acento.verde,
      cores.ceu.alto,
      cores.mar.fundo,
      cores.chrome.fundo,
    ]) {
      expect(valores, `A cor ${cor} não aparece nas variáveis CSS geradas`).toContain(cor)
    }
  })

  it('não repete variáveis CSS (nome duplicado indica fonte de verdade duplicada)', () => {
    const variaveis = tokensComoVariaveisCss() as Record<string, string>
    const nomes = Object.keys(variaveis)
    expect(new Set(nomes).size).toBe(nomes.length)
    for (const nome of nomes) {
      expect(nome.startsWith('--')).toBe(true)
    }
  })
})
