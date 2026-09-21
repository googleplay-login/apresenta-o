import { alturaDoTopo, bordaDoTopoEmDirecao } from './geometria/ilha'
import { ESPESSURA_DO_TABULEIRO } from './geometria/solidos'
import type { IlhaVisivel, PonteVisivel } from './mundoVisivel'

/**
 * O chão onde dá para andar.
 *
 * O mundo é feito de ilhas suspensas no vazio. Quem anda não pode cair: em vez
 * de física, aqui existe **geometria declarada** — uma lista de superfícies onde
 * o pé encontra chão, e uma função que responde "que altura tem o chão neste
 * ponto?". Fora dessas superfícies a resposta é `null`, e quem pergunta trata o
 * `null` como "não pise" (ver `avatar/passos.ts`).
 *
 * Por que assim, e não com um motor de física: o mundo é pequeno e conhecido, e
 * uma regra explícita e testável vale mais do que um motor que ninguém aqui
 * consegue conferir sem navegador. Além disso, a regra que o projeto não pode
 * quebrar — **não desbloquear nada por clique** — continua fora daqui: este
 * arquivo só recebe pontes já resolvidas pelo domínio e considera caminhável
 * aquela que veio `liberada`.
 *
 * O chão tem duas formas, e as duas são convexas:
 *
 *  - **disco**: o capim de uma ilha, com o topo em domo (`alturaDoTopo`);
 *  - **faixa**: o tabuleiro de uma ponte inteira, uma tira reta e inclinada.
 */

/** Raio do corpo do avatar, no plano. A margem que ele precisa para caber. */
export const RAIO_DO_AVATAR = 0.34

/** Espessura do tabuleiro — é o que separa o eixo do chão onde o pé pisa. */
const MEIA_ESPESSURA = ESPESSURA_DO_TABULEIRO / 2

/** O capim de uma ilha, como superfície de caminhada. */
export type ChaoDeIlha = {
  readonly id: string
  readonly titulo: string
  readonly x: number
  readonly z: number
  /** Raio real do capim. A margem do corpo do avatar entra na conferência. */
  readonly raio: number
  /** Altura do capim no centro da ilha. O topo é um domo em volta deste ponto. */
  readonly altura: number
  /**
   * Quanto o capim sobe do centro até a borda desta ilha.
   *
   * Cada ilha tem o seu (ver `geometria/identidade.ts`): uma é mais plana, outra
   * mais abaulada. O chão e a malha do capim usam **o mesmo** número, senão o pé
   * do avatar flutua ou afunda.
   */
  readonly inclinacao: number
  /**
   * Os fatores da borda do capim, coluna a coluna (D-063).
   *
   * O raio acima é nominal; a borda desenhada recua e avança em volta dele. Com
   * o disco do raio nominal, o avatar andava **no ar** onde a borda recuava — e a
   * ponte, ancorada no mesmo raio, começava depois disso. O chão passou a ler a
   * borda de verdade, a mesma que a malha e a ponte usam.
   */
  readonly fatoresDaBorda: readonly number[]
  /** Quantas colunas a borda tem: o polígono do capim. */
  readonly segmentosRadiais: number
}

/** O tabuleiro de uma ponte inteira, como superfície de caminhada. */
export type ChaoDePonte = {
  readonly de: string
  readonly para: string
  /** Onde o tabuleiro começa, já na altura do capim da ilha de origem. */
  readonly inicio: { readonly x: number; readonly z: number; readonly altura: number }
  /** Unidade horizontal que aponta para a ilha de destino. */
  readonly direcao: readonly [number, number]
  readonly comprimento: number
  /** Meia largura real do tabuleiro. A margem do corpo entra na conferência. */
  readonly meiaLargura: number
  /** Altura do topo do tabuleiro no fim, igual à borda da ilha de destino. */
  readonly alturaNoFim: number
}

export type ChaoDoMundo = {
  readonly ilhas: readonly ChaoDeIlha[]
  readonly pontes: readonly ChaoDePonte[]
}

/** Ponto no plano horizontal. A altura é sempre consultada, nunca guardada. */
export type PontoNoPlano = { readonly x: number; readonly z: number }

/** Largura do tabuleiro desenhado por `gerarPonte`, usada em `Ponte.tsx`. */
export const LARGURA_DO_TABULEIRO = 3.2

/**
 * Monta o chão caminhável a partir do que a cena já recebe resolvido.
 *
 * **Só ponte liberada vira chão.** A ponte pela metade existe para ser vista e
 * para explicar o que falta — não para ser atravessada. Quem decide isso é o
 * domínio, e chega pronto em `ponte.liberada`; aqui não há segunda regra de
 * liberação (D-004).
 */
export function chaoDoMundo(
  ilhas: readonly IlhaVisivel[],
  pontes: readonly PonteVisivel[],
): ChaoDoMundo {
  return {
    ilhas: ilhas.map((ilha) => ({
      id: ilha.id,
      titulo: ilha.titulo,
      x: ilha.centro[0],
      z: ilha.centro[2],
      raio: ilha.raio,
      fatoresDaBorda: ilha.bordaDoCapim,
      segmentosRadiais: ilha.identidade.formato.segmentosRadiais,
      altura: ilha.centro[1],
      inclinacao: ilha.identidade.formato.inclinacaoDoCapim,
    })),
    pontes: pontes
      .filter((ponte) => ponte.liberada)
      .map((ponte) => ({
        de: ponte.de,
        para: ponte.para,
        inicio: {
          x: ponte.posicao[0],
          z: ponte.posicao[2],
          // O topo do tabuleiro: o eixo está meia espessura abaixo dele, e é o
          // topo que encosta no capim da borda (ver `mapaDoMundo.ts`).
          altura: ponte.posicao[1] + MEIA_ESPESSURA,
        },
        direcao: ponte.direcao,
        comprimento: ponte.comprimento,
        meiaLargura: LARGURA_DO_TABULEIRO / 2,
        // O fim do tabuleiro é o início mais a subida: `sin(rotacaoZ)` é
        // exatamente a razão entre a subida e o comprimento (ver `ponteEntre`),
        // então a altura no fim sai da própria rotação que a cena usa.
        alturaNoFim:
          ponte.posicao[1] + MEIA_ESPESSURA + ponte.comprimento * Math.sin(ponte.rotacaoZ),
      })),
  }
}

/** Projeção do ponto sobre a faixa da ponte: `t` ao longo e `desvio` para o lado. */
function projecaoNaPonte(
  ponte: ChaoDePonte,
  ponto: PontoNoPlano,
): { readonly t: number; readonly desvio: number } {
  const dx = ponto.x - ponte.inicio.x
  const dz = ponto.z - ponte.inicio.z
  const [ux, uz] = ponte.direcao
  const t = dx * ux + dz * uz
  // Perpendicular à direção, no plano: (-uz, ux).
  const desvio = dx * -uz + dz * ux
  return { t, desvio }
}

/** Distância do ponto ao centro do disco, no plano. */
function distanciaAoCentro(ilha: ChaoDeIlha, ponto: PontoNoPlano): number {
  return Math.hypot(ponto.x - ilha.x, ponto.z - ilha.z)
}

/**
 * A altura do capim no ponto, ou `null` se ali não há chão.
 *
 * O topo da ilha é um domo: mais alto na borda do que no centro. A conta vem da
 * mesma função que gerou a malha, para que ninguém precise lembrar de duas
 * fórmulas.
 */
/**
 * Até onde o pé do avatar chega na direção de um ponto, dentro do capim.
 *
 * A borda do capim é um polígono: o alcance é medido na direção do ponto, e não
 * pelo raio nominal. A margem do corpo é descontada depois, pelo chamador.
 */
function alcanceDoCapim(ilha: ChaoDeIlha, ponto: PontoNoPlano): number {
  const dx = ponto.x - ilha.x
  const dz = ponto.z - ilha.z
  const distancia = Math.hypot(dx, dz)
  if (distancia === 0) {
    return ilha.raio
  }
  return bordaDoTopoEmDirecao({
    raio: ilha.raio,
    segmentosRadiais: ilha.segmentosRadiais,
    fatores: ilha.fatoresDaBorda,
    angulo: Math.atan2(dz, dx),
  }).interno
}

export function chaoEm(chao: ChaoDoMundo, ponto: PontoNoPlano): number | null {
  let encontrado: number | null = null

  for (const ilha of chao.ilhas) {
    const distancia = distanciaAoCentro(ilha, ponto)
    if (distancia <= alcanceDoCapim(ilha, ponto) - RAIO_DO_AVATAR + 1e-9) {
      const altura = ilha.altura + alturaDoTopo(ilha.raio, distancia, ilha.inclinacao)
      // Duas superfícies podem se sobrepor perto da ponte: vale a mais alta, que
      // é a que sustenta o pé.
      encontrado = encontrado === null ? altura : Math.max(encontrado, altura)
    }
  }

  for (const ponte of chao.pontes) {
    const { t, desvio } = projecaoNaPonte(ponte, ponto)
    // As pontas valem uma margem a mais: ali o tabuleiro já está sobre o capim
    // da ilha, e a margem é o que faz as duas superfícies se encontrarem sem
    // fresta no meio do caminho.
    if (t < -RAIO_DO_AVATAR || t > ponte.comprimento + RAIO_DO_AVATAR) {
      continue
    }
    if (Math.abs(desvio) > ponte.meiaLargura - RAIO_DO_AVATAR + 1e-9) {
      continue
    }
    const proporcao = Math.min(Math.max(t / ponte.comprimento, 0), 1)
    const altura = ponte.inicio.altura + (ponte.alturaNoFim - ponte.inicio.altura) * proporcao
    encontrado = encontrado === null ? altura : Math.max(encontrado, altura)
  }

  return encontrado
}

/** `true` quando há chão neste ponto. */
export function pontoPisavel(chao: ChaoDoMundo, ponto: PontoNoPlano): boolean {
  return chaoEm(chao, ponto) !== null
}

/** Onde o avatar está: em cima de uma ilha, sobre uma ponte, ou em lugar nenhum. */
export type Localizacao =
  | { readonly tipo: 'ilha'; readonly id: string }
  | { readonly tipo: 'ponte'; readonly de: string; readonly para: string }
  | null

/**
 * Onde este ponto fica.
 *
 * Ponte primeiro: em cima do tabuleiro o pé está fora do capim, e dizer "ilha"
 * ali seria mentira — mesmo que a projeção caia dentro do disco, o estudante
 * está no vão, e o texto do painel tem de dizer isso.
 */
export function localizacaoEm(chao: ChaoDoMundo, ponto: PontoNoPlano): Localizacao {
  for (const ponte of chao.pontes) {
    const { t, desvio } = projecaoNaPonte(ponte, ponto)
    if (
      t >= 0 &&
      t <= ponte.comprimento &&
      Math.abs(desvio) <= ponte.meiaLargura - RAIO_DO_AVATAR + 1e-9
    ) {
      return { tipo: 'ponte', de: ponte.de, para: ponte.para }
    }
  }

  for (const ilha of chao.ilhas) {
    if (distanciaAoCentro(ilha, ponto) <= ilha.raio - RAIO_DO_AVATAR + 1e-9) {
      return { tipo: 'ilha', id: ilha.id }
    }
  }

  return null
}

/** Onde o avatar começa: o centro da primeira ilha, ou a origem se não houver ilha. */
export function postoInicial(chao: ChaoDoMundo): PontoNoPlano {
  const primeira = chao.ilhas[0]
  return primeira === undefined ? { x: 0, z: 0 } : { x: primeira.x, z: primeira.z }
}

/** A ponte caminhável entre duas ilhas, se ela existir e estiver inteira. */
export function ponteCaminhavel(
  chao: ChaoDoMundo,
  de: string,
  para: string,
): ChaoDePonte | null {
  return (
    chao.pontes.find(
      (ponte) =>
        (ponte.de === de && ponte.para === para) || (ponte.de === para && ponte.para === de),
    ) ?? null
  )
}

/**
 * Como dizer, em palavras, onde o avatar está.
 *
 * A frase é da camada de mundo, e não da tela: as duas dizem a mesma coisa — a
 * lista em texto e o HUD do mundo leem daqui. Devolve `null` quando o ponto não
 * corresponde a nada (o que, com o avatar sempre sobre o chão, não acontece).
 */
export function descricaoDoLugar(chao: ChaoDoMundo, local: Localizacao): string | null {
  if (local === null) {
    return null
  }

  if (local.tipo === 'ilha') {
    const ilha = chao.ilhas.find((candidata) => candidata.id === local.id)
    return ilha === undefined ? null : `na ilha «${ilha.titulo}»`
  }

  const origem = chao.ilhas.find((candidata) => candidata.id === local.de)
  const destino = chao.ilhas.find((candidata) => candidata.id === local.para)
  if (origem === undefined || destino === undefined) {
    return null
  }
  return `na ponte entre «${origem.titulo}» e «${destino.titulo}»`
}
