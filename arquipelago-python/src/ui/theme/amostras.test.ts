import { describe, expect, it } from 'vitest'
import { coletarAmostras, todasAsAmostras, textoLegivelSobre } from './amostras'
import { cores, coresDeEstado } from './tokens'
import { razaoContraste } from './contraste'

const CAMINHOS = todasAsAmostras().map((amostra) => amostra.caminho)

describe('mostruário de cores', () => {
  it('mostra todas as cores declaradas nos tokens', () => {
    // Se alguém acrescentar uma cor e esquecer o mostruário, este teste avisa:
    // o guia não pode ficar incompleto.
    expect(CAMINHOS).toContain('ceu.alto')
    expect(CAMINHOS).toContain('ceu.horizonte')
    expect(CAMINHOS).toContain('mar.fundo')
    expect(CAMINHOS).toContain('painel.fundo')
    expect(CAMINHOS).toContain('texto.principal')
    expect(CAMINHOS).toContain('acento.verde')
    expect(CAMINHOS).toContain('terreno.madeira')
    expect(CAMINHOS).toContain('chrome.fundo')
    expect(CAMINHOS).toContain('estado.planejada')
    expect(CAMINHOS).toContain('estado.emConstrucao')
    expect(CAMINHOS).toContain('estado.pronta')
  })

  it('devolve o valor real de cada token', () => {
    const ceu = todasAsAmostras().find((amostra) => amostra.caminho === 'ceu.alto')
    expect(ceu?.cor).toBe(cores.ceu.alto)

    const planejada = todasAsAmostras().find((amostra) => amostra.caminho === 'estado.planejada')
    expect(planejada?.cor).toBe(coresDeEstado.planejada)
  })

  it('não repete caminho de token', () => {
    expect(new Set(CAMINHOS).size).toBe(CAMINHOS.length)
  })

  it('encontra todas as folhas de um objeto aninhado', () => {
    const amostras = coletarAmostras({ a: { b: '#111111', c: { d: '#222222' } }, e: '#333333' })
    expect(amostras.map((amostra) => amostra.caminho)).toEqual(['a.b', 'a.c.d', 'e'])
  })

  it('ignora valores que não são cor sólida', () => {
    // `painel.sombra` é rgba com transparência: não entra no mostruário nem nas
    // contas de contraste, porque a fórmula exige cor opaca.
    const amostras = coletarAmostras({
      cor: '#111111',
      sombra: 'rgba(28, 39, 48, 0.18)',
      numero: 3 as unknown as string,
      nulo: null as unknown as string,
    })
    expect(amostras).toEqual([{ caminho: 'cor', cor: '#111111' }])
  })

  it('não inclui a sombra do painel entre as amostras', () => {
    expect(CAMINHOS).not.toContain('painel.sombra')
  })
})

describe('texto legível sobre uma cor', () => {
  it('usa texto escuro sobre fundo claro', () => {
    expect(textoLegivelSobre(cores.ceu.horizonte)).toBe(cores.texto.principal)
    expect(textoLegivelSobre(cores.painel.fundo)).toBe(cores.texto.principal)
  })

  it('usa texto claro sobre fundo escuro', () => {
    expect(textoLegivelSobre(cores.chrome.fundo)).toBe(cores.texto.sobreEscuro)
    expect(textoLegivelSobre(cores.acento.verde)).toBe(cores.texto.sobreEscuro)
  })

  it('escolhe sempre a opção de maior contraste', () => {
    for (const amostra of todasAsAmostras()) {
      const escolhido = textoLegivelSobre(amostra.cor)
      const outro = escolhido === cores.texto.principal ? cores.texto.sobreEscuro : cores.texto.principal

      expect(
        razaoContraste(escolhido, amostra.cor),
        `Em ${amostra.caminho} (${amostra.cor}) o texto escolhido não é o de maior contraste`,
      ).toBeGreaterThanOrEqual(razaoContraste(outro, amostra.cor))
    }
  })
})
