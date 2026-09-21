import { describe, expect, it } from 'vitest'
import {
  CORES_DAS_ILHAS,
  CORES_DERIVADAS,
  CORES_DO_MUNDO,
  corDaIlha,
  corDaSituacao,
  corDeUnidadeBloqueada,
  coresDaIlha,
  deHex,
  paraHex,
} from './paleta3d'
import { TONS_DAS_ILHAS } from '../../world/geometria/identidade'
import { cores, coresDeEstado } from './tokens'
import { misturar } from '../../world/geometria/pintura'
import {
  TETO_DE_MATERIAL,
  corNoOrcamentoDeLuz,
  piorEscuridaoVisivel,
  piorRadiacao,
} from './luzDoMundo'

/** Distância entre duas cores em RGB, a mesma conta dos outros testes de tom. */
function distancia(uma: number, outra: number): number {
  return Math.hypot(
    ((uma >> 16) & 0xff) - ((outra >> 16) & 0xff),
    ((uma >> 8) & 0xff) - ((outra >> 8) & 0xff),
    (uma & 0xff) - (outra & 0xff),
  )
}

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
  it('os tons são todos diferentes, e nenhum é preto ou branco puro', () => {
    // A contagem sai do tamanho da lista, e não de um número escrito aqui: o lote
    // 5 acrescentou os tons 13 a 15, e um literal 12 teria reprovado o crescimento
    // por motivo errado (D-061). Quem cobra a quantidade é `identidade.test.ts`,
    // comparando com `TONS_DAS_ILHAS`.
    expect(CORES_DAS_ILHAS.length).toBeGreaterThanOrEqual(3)
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
    // As duas últimas nasceram com o lote 4, quando as ilhas 11 e 12 deixaram de
    // repetir o tom das duas primeiras.
    expect(CORES_DAS_ILHAS[10]).toBe(
      misturar(deHex(cores.mar.fundo), deHex(cores.acento.verdeClaro), 0.2),
    )
    expect(CORES_DAS_ILHAS[11]).toBe(
      misturar(deHex(cores.terreno.rochaClara), deHex(cores.terreno.madeira), 0.5),
    )
    // Os três do lote 5 — os tons da trilha do projeto de jogo. Eles não estão
    // mais no fim da lista: o lote 6 acrescentou os da trilha de dados depois
    // deles, e a posição passou a ser contada a partir do fim.
    const ultimo = CORES_DAS_ILHAS.length - 1
    expect(CORES_DAS_ILHAS[ultimo - 5]).toBe(
      misturar(deHex(cores.acento.ambar), deHex(cores.acento.vermelho), 0.7),
    )
    expect(CORES_DAS_ILHAS[ultimo - 4]).toBe(
      misturar(deHex(cores.mar.claro), deHex(cores.acento.ambar), 0.5),
    )
    expect(CORES_DAS_ILHAS[ultimo - 3]).toBe(
      misturar(deHex(cores.mar.fundo), deHex(cores.terreno.capim), 0.6),
    )
    // As três últimas são do lote 6: os tons da trilha de visualização de dados,
    // escolhidos pela distância **depois de desenhados** (D-062).
    expect(CORES_DAS_ILHAS[ultimo - 2]).toBe(
      misturar(deHex(cores.ceu.horizonte), deHex(cores.acento.ambar), 0.5),
    )
    expect(CORES_DAS_ILHAS[ultimo - 1]).toBe(
      misturar(deHex(cores.mar.claro), deHex(cores.acento.vermelho), 0.5),
    )
    expect(CORES_DAS_ILHAS[ultimo]).toBe(
      misturar(deHex(cores.mar.medio), deHex(cores.acento.verdeClaro), 0.2),
    )
  })

  it('corDaIlha dá a volta em vez de estourar', () => {
    // Os índices saem do tamanho da lista: com dois tons novos no lote 4, o
    // literal 10 e o `-1` antigo deixariam de provar a volta (D-058).
    const ultimo = CORES_DAS_ILHAS.length - 1
    expect(corDaIlha(0)).toBe(CORES_DAS_ILHAS[0])
    expect(corDaIlha(ultimo)).toBe(CORES_DAS_ILHAS[ultimo])
    expect(corDaIlha(CORES_DAS_ILHAS.length)).toBe(CORES_DAS_ILHAS[0])
    expect(corDaIlha(-1)).toBe(CORES_DAS_ILHAS[ultimo])
    expect(corDaIlha(-CORES_DAS_ILHAS.length)).toBe(CORES_DAS_ILHAS[0])
  })

  it('dois tons vizinhos são distinguíveis: nenhum par é quase a mesma cor', () => {
    // Duas ilhas com tons praticamente iguais voltariam a parecer a mesma ilha.
    // O limiar é medido, e não escolhido a dedo: entre os **dezoito** tons, o par
    // mais próximo está a 46,5 de distância em RGB cru (era 48,9 entre os dez), e
    // o limite de 40 deixa folga para um ajuste de token sem quebrar o teste por
    // um ponto. Depois do orçamento de luz a distância desenhada cai para 32,1 —
    // medida em `luzDoMundo.test.ts`, que é onde ela é cobrada.
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

describe('as cores próprias de cada ilha (D-063)', () => {
  it('cada ilha tem a sua madeira, a sua pedra e a sua folhagem', () => {
    // Antes disto, as dezoito ilhas desenhavam a biblioteca com a mesma cor, a
    // mesa com a mesma cor e as árvores com a mesma cor: o que variava era o
    // capim e o marco, e a captura de tela disse o resultado — "elas estão todas
    // sem vida". Aqui a conferência é a consequência direta: dezoito ilhas,
    // dezoito madeiras.
    const madeiras = new Set<number>()
    const pedras = new Set<number>()
    const copas = new Set<number>()

    for (let indice = 0; indice < TONS_DAS_ILHAS; indice += 1) {
      const cores = coresDaIlha(indice)
      madeiras.add(cores.madeira)
      pedras.add(cores.pedra)
      copas.add(cores.copa)

      // A estrutura continua sendo madeira e pedra: o tom entra como tempero, e
      // não como tinta. Os limites são os **medidos** (D-063): 53,9 de desvio da
      // madeira, 38,5 da pedra e 53,1 da copa escurecida — com uma folga de dois
      // pontos para um ajuste de token não reprovar o teste por um fio.
      expect(distancia(cores.madeira, CORES_DERIVADAS.poste)).toBeLessThan(56)
      expect(distancia(cores.pedra, CORES_DERIVADAS.parede)).toBeLessThan(41)
      expect(distancia(cores.copa, CORES_DO_MUNDO.conifera)).toBeLessThan(56)
    }

    expect(madeiras.size).toBe(TONS_DAS_ILHAS)
    expect(pedras.size).toBe(TONS_DAS_ILHAS)
    expect(copas.size).toBe(TONS_DAS_ILHAS)
  })

  it('toda cor de estrutura cabe no orçamento de luz da ilha dela', () => {
    for (let indice = 0; indice < TONS_DAS_ILHAS; indice += 1) {
      const cores = coresDaIlha(indice)
      for (const [nome, cor] of Object.entries(cores)) {
        const desenhada = corNoOrcamentoDeLuz(cor)
        expect(
          piorRadiacao(desenhada),
          `A ${nome} da ilha ${indice + 1} estoura na luz do mundo`,
        ).toBeLessThanOrEqual(TETO_DE_MATERIAL)
        expect(
          piorEscuridaoVisivel(desenhada),
          `A ${nome} da ilha ${indice + 1} apaga nas direções visíveis`,
        ).toBeGreaterThan(0.05)
      }
    }
  })

  it('a flor não se confunde com o capim, e a madeira não se confunde com a pedra', () => {
    // Duas conferências de leitura, e não de gosto: a flor é o ponto quente do
    // capim (se ela encostasse na cor da grama, não seria vista), e a madeira
    // tem de continuar mais escura que a pedra em toda ilha — é o contraste que
    // separa a mesa da biblioteca.
    let menorFlor = Infinity
    let menorMadeiraPedra = Infinity
    let menorCopaCapim = Infinity

    for (let indice = 0; indice < TONS_DAS_ILHAS; indice += 1) {
      const cores = coresDaIlha(indice)
      const capim = corDaIlha(indice)
      menorFlor = Math.min(menorFlor, distancia(cores.flor, capim))
      menorMadeiraPedra = Math.min(menorMadeiraPedra, distancia(cores.madeira, cores.pedra))
      menorCopaCapim = Math.min(menorCopaCapim, distancia(cores.copa, capim))
      // E o arbusto: perto do capim de propósito, mas não colado nele.
      expect(distancia(cores.arbusto, capim)).toBeGreaterThan(20)
    }

    // Medidos (D-063): flor 42,9 · copa 35,1 · madeira contra pedra 158,3.
    expect(menorFlor).toBeGreaterThan(40)
    expect(menorCopaCapim).toBeGreaterThan(30)
    expect(menorMadeiraPedra).toBeGreaterThan(30)
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
