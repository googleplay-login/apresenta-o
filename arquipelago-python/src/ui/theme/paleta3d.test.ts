import { describe, expect, it } from 'vitest'
import {
  CORES_DAS_ILHAS,
  CORES_DERIVADAS,
  CORES_DO_MUNDO,
  corDaIlha,
  corDaSituacao,
  corDeUnidadeBloqueada,
  deHex,
  paraHex,
} from './paleta3d'
import { cores, coresDeEstado } from './tokens'
import { misturar } from '../../world/geometria/pintura'

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

/** Média dos canais de uma cor `0xRRGGBB`. Serve para comparar claridade. */
function mediaDeCanais(cor: number): number {
  return (((cor >> 16) & 0xff) + ((cor >> 8) & 0xff) + (cor & 0xff)) / 3
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

describe('os tons das ilhas', () => {
  it('são dez, todos diferentes, e nenhum é preto ou branco puro', () => {
    expect(CORES_DAS_ILHAS).toHaveLength(10)
    const unicos = new Set(CORES_DAS_ILHAS)
    expect(unicos.size).toBe(CORES_DAS_ILHAS.length)

    for (const cor of CORES_DAS_ILHAS) {
      expect(cor).not.toBe(0x000000)
      expect(cor).not.toBe(0xffffff)
    }
  })

  it('são misturas de tokens, e não valores escritos à mão', () => {
    // Se alguém trocar um token, o tom da ilha acompanha sozinho. A conferência
    // refaz três misturas a partir dos tokens do projeto, uma de cada ponta da
    // lista.
    expect(CORES_DAS_ILHAS[0]).toBe(
      misturar(deHex(cores.acento.verde), deHex(cores.acento.verdeClaro), 0.5),
    )
    expect(CORES_DAS_ILHAS[5]).toBe(
      misturar(deHex(cores.terreno.pale), deHex(cores.ceu.alto), 0.3),
    )
    expect(CORES_DAS_ILHAS[9]).toBe(
      misturar(deHex(cores.acento.vermelho), deHex(cores.ceu.horizonte), 0.5),
    )
  })

  it('corDaIlha dá a volta em vez de estourar', () => {
    expect(corDaIlha(0)).toBe(CORES_DAS_ILHAS[0])
    expect(corDaIlha(9)).toBe(CORES_DAS_ILHAS[9])
    expect(corDaIlha(10)).toBe(CORES_DAS_ILHAS[0])
    expect(corDaIlha(-1)).toBe(CORES_DAS_ILHAS[9])
  })

  it('dois tons vizinhos são distinguíveis: nenhum par é quase a mesma cor', () => {
    // Duas ilhas com tons praticamente iguais voltariam a parecer a mesma ilha.
    // O limiar é medido, e não escolhido a dedo: o par mais próximo dos dez está
    // a 48,9 de distância em RGB, e o limite de 40 deixa folga para um ajuste de
    // token sem quebrar o teste por um ponto.
    const canais = (cor: number): readonly [number, number, number] => [
      (cor >> 16) & 0xff,
      (cor >> 8) & 0xff,
      cor & 0xff,
    ]
    for (let um = 0; um < CORES_DAS_ILHAS.length; um += 1) {
      for (let outro = um + 1; outro < CORES_DAS_ILHAS.length; outro += 1) {
        const a = canais(CORES_DAS_ILHAS[um] ?? 0)
        const b = canais(CORES_DAS_ILHAS[outro] ?? 0)
        const distancia = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
        expect(distancia, `Os tons ${um} e ${outro} ficaram parecidos`).toBeGreaterThan(40)
      }
    }
  })
})

describe('cor por situação da unidade', () => {
  it('cada situação tem cor própria, e a aprovada é a mais distinta', () => {
    const situacoes = ['bloqueada', 'disponivel', 'aprovada'] as const
    const cores = situacoes.map(corDaSituacao)
    expect(new Set(cores).size).toBe(3)
  })

  it('a unidade bloqueada lava a cor do terreno em direção à névoa', () => {
    // O terreno de uma ilha ainda não liberada não fica de outra cor: ele fica
    // mais claro e mais perto da névoa, com a mesma forma e o mesmo tom.
    const capim = CORES_DO_MUNDO.capim
    const rocha = CORES_DO_MUNDO.rocha
    expect(corDeUnidadeBloqueada(capim)).toBe(misturar(capim, CORES_DO_MUNDO.nevoa, 0.4))
    expect(mediaDeCanais(corDeUnidadeBloqueada(capim))).toBeGreaterThan(mediaDeCanais(capim))
    expect(mediaDeCanais(corDeUnidadeBloqueada(rocha))).toBeGreaterThan(mediaDeCanais(rocha))
    expect(corDeUnidadeBloqueada(capim)).not.toBe(capim)
    expect(corDeUnidadeBloqueada(rocha)).not.toBe(rocha)
  })
})
