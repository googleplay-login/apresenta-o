import { describe, expect, it } from 'vitest'
import {
  CORES_DERIVADAS,
  CORES_DO_MUNDO,
  corDaRocha,
  corDaSituacao,
  corDoCapim,
  deHex,
  paraHex,
} from './paleta3d'
import { cores, coresDeEstado } from './tokens'

/** Todas as cores que o mundo 3D usa, com o nome de onde vieram. */
function todasAsCores(): readonly { readonly nome: string; readonly cor: number }[] {
  return [
    ...Object.entries(CORES_DO_MUNDO).map(([nome, cor]) => ({ nome: `CORES_DO_MUNDO.${nome}`, cor })),
    ...Object.entries(CORES_DERIVADAS).map(([nome, cor]) => ({
      nome: `CORES_DERIVADAS.${nome}`,
      cor,
    })),
  ]
}

describe('conversão hexadecimal', () => {
  it('converte os dois sentidos sem perder valor', () => {
    expect(deHex('#0F5A4A')).toBe(0x0f5a4a)
    expect(paraHex(0x0f5a4a)).toBe('#0f5a4a')
    expect(deHex('0F5A4A')).toBe(0x0f5a4a)
  })

  it('converte toda cor usada no mundo 3D de volta para o mesmo texto', () => {
    for (const { nome, cor } of todasAsCores()) {
      expect(deHex(paraHex(cor)), `${nome} não sobreviveu à ida e volta`).toBe(cor)
    }
  })

  it('recusa texto que não é cor de seis dígitos', () => {
    for (const ruim of ['#12345', 'vermelho', '#GGGGGG', '', '#1234567']) {
      expect(() => deHex(ruim), `deveria recusar "${ruim}"`).toThrow(/hexadecimal inválida/)
    }
  })
})

describe('origem das cores do mundo', () => {
  it('vem dos tokens visuais, sem valor solto', () => {
    // Este teste é a trava contra alguém escrever `0x123456` direto no arquivo
    // do mundo 3D. Se o token mudar, o mundo acompanha; se o valor for escrito à
    // mão, o teste acusa e a decisão D-005 continua valendo.
    expect(CORES_DO_MUNDO.ceu).toBe(deHex(cores.ceu.medio))
    expect(CORES_DO_MUNDO.ceuDoAlto).toBe(deHex(cores.ceu.alto))
    expect(CORES_DO_MUNDO.nevoa).toBe(deHex(cores.nevoa))
    expect(CORES_DO_MUNDO.capim).toBe(deHex(cores.terreno.capim))
    expect(CORES_DO_MUNDO.rocha).toBe(deHex(cores.terreno.rocha))
    expect(CORES_DO_MUNDO.rochaClara).toBe(deHex(cores.terreno.rochaClara))
    expect(CORES_DO_MUNDO.conifera).toBe(deHex(cores.terreno.conifera))
    expect(CORES_DO_MUNDO.madeira).toBe(deHex(cores.terreno.madeira))
    expect(CORES_DO_MUNDO.madeiraClara).toBe(deHex(cores.terreno.madeiraClara))
    expect(CORES_DO_MUNDO.pale).toBe(deHex(cores.terreno.pale))
    expect(CORES_DO_MUNDO.mar).toBe(deHex(cores.mar.medio))
    expect(CORES_DO_MUNDO.marFundo).toBe(deHex(cores.mar.fundo))
  })

  it('as cores de estado vêm dos tokens de estado', () => {
    expect(CORES_DERIVADAS.bloqueada).toBe(deHex(coresDeEstado.planejada))
    expect(CORES_DERIVADAS.disponivel).toBe(deHex(coresDeEstado.emConstrucao))
    expect(CORES_DERIVADAS.aprovada).toBe(deHex(coresDeEstado.pronta))
  })

  it('as derivadas são variações, e não cores fora da paleta', () => {
    // Nenhuma variação deve virar preto puro nem branco puro: seria uma cor que
    // não existe nos tokens. A nuvem é a única que chega perto do branco, e de
    // propósito.
    for (const { nome, cor } of todasAsCores()) {
      if (nome === 'CORES_DERIVADAS.nuvem') {
        expect(cor).not.toBe(0xffffff)
        continue
      }
      expect(cor, `${nome} ficou preto puro`).not.toBe(0x000000)
      expect(cor, `${nome} ficou branco puro`).not.toBe(0xffffff)
    }
  })
})

describe('cor por situação da unidade', () => {
  it('cada situação tem cor própria, e a aprovada é a mais distinta', () => {
    const situacoes = ['bloqueada', 'disponivel', 'aprovada'] as const
    const cores = situacoes.map(corDaSituacao)
    expect(new Set(cores).size).toBe(3)
  })

  it('capim e rocha mudam quando a unidade está bloqueada', () => {
    expect(corDoCapim('bloqueada')).not.toBe(corDoCapim('disponivel'))
    expect(corDaRocha('bloqueada')).not.toBe(corDaRocha('disponivel'))
  })

  it('capim e rocha de unidade acessível são os tokens, sem desvio', () => {
    expect(corDoCapim('disponivel')).toBe(deHex(cores.terreno.capim))
    expect(corDoCapim('aprovada')).toBe(deHex(cores.terreno.capim))
    expect(corDaRocha('disponivel')).toBe(deHex(cores.terreno.rocha))
  })
})
