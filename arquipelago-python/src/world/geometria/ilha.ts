import { criarSorteador, entre } from './aleatorio'

/**
 * Geometria das ilhas, gerada por nós.
 *
 * Decisão D-014: nenhum asset de terceiro. A rocha de cada ilha é um sólido de
 * revolução com irregularidade vinda de um sorteador com semente — portanto
 * **sempre igual** para a mesma semente, e diferente entre ilhas.
 *
 * Tudo aqui é matemática pura: entra número, sai vetor de posições e de índices.
 * Não depende de Three.js nem de DOM, o que permite testar a forma da ilha sem
 * abrir navegador.
 */

export type Malha = {
  /** Posições em sequência x, y, z. */
  readonly posicoes: readonly number[]
  /** Índices dos triângulos, em sequência de três por triângulo. */
  readonly indices: readonly number[]
}

export type OpcoesDaRocha = {
  /** Quantos lados tem cada anel. Mais lados, mais suave. */
  readonly segmentosRadiais: number
  /** Quantos anéis entre o topo e a ponta. Mais anéis, mais detalhe vertical. */
  readonly aneis: number
  readonly semente: number
  /** Raio no topo (onde fica o capim). */
  readonly raioDoTopo: number
  /** Quanto a ilha desce. */
  readonly altura: number
  /** Irregularidade: 0 seria um cone perfeito. */
  readonly amplitude: number
}

export const ROCHA_PADRAO: OpcoesDaRocha = {
  segmentosRadiais: 14,
  aneis: 7,
  semente: 1,
  raioDoTopo: 6,
  altura: 9,
  amplitude: 0.22,
}

/**
 * Raio em função da profundidade.
 *
 * `t` vai de 0 (topo) a 1 (ponta). A curva `(1 - t)^1.7` deixa o corpo cheio perto
 * do topo e afina rápido no fim, que é o formato reconhecível de ilha suspensa —
 * uma parede de rocha com ponta, e não um cone de sorvete.
 */
export function perfilDeRaio(t: number): number {
  const profundidade = Math.min(Math.max(t, 0), 1)
  return (1 - profundidade) ** 1.7
}

/**
 * Gera a malha da rocha: anéis empilhados, fechados em uma ponta embaixo.
 *
 * O topo é aberto de propósito — quem o fecha é o disco de capim, encaixado
 * exatamente no mesmo raio, o que evita faces internas invisíveis.
 */
export function gerarRocha(opcoes: OpcoesDaRocha = ROCHA_PADRAO): Malha {
  const { segmentosRadiais, aneis, semente, raioDoTopo, altura, amplitude } = opcoes

  if (segmentosRadiais < 3) {
    throw new Error(`São necessários ao menos 3 segmentos radiais, e veio ${segmentosRadiais}`)
  }
  if (aneis < 1) {
    throw new Error(`São necessários ao menos 1 anel, e veio ${aneis}`)
  }

  const sortear = criarSorteador(semente)
  const posicoes: number[] = []
  const indices: number[] = []

  // Uma irregularidade por "coluna" de pedra, para a parede ter relevo contínuo
  // em vez de tremer a cada anel. O último valor repete o primeiro, fechando a
  // volta sem emenda visível.
  const relevo: number[] = []
  for (let coluna = 0; coluna <= segmentosRadiais; coluna += 1) {
    relevo.push(
      coluna === segmentosRadiais
        ? (relevo[0] ?? 0)
        : entre(sortear, 1 - amplitude, 1 + amplitude),
    )
  }

  // O raio nunca chega exatamente a zero. Um anel de raio zero seriam vários
  // vértices no mesmo ponto: triângulos sem área, que não desenham nada e ainda
  // confundem qualquer conta de normal. Fica uma tampinha de 2% do raio, que
  // ninguém vê na ponta.
  const raioMinimo = raioDoTopo * 0.02

  for (let anel = 0; anel <= aneis; anel += 1) {
    const t = anel / aneis
    const raioDoAnel = Math.max(raioDoTopo * perfilDeRaio(t), raioMinimo)
    const y = -altura * t

    for (let coluna = 0; coluna <= segmentosRadiais; coluna += 1) {
      const angulo = (coluna / segmentosRadiais) * Math.PI * 2
      // O tremor vertical acompanha o raio local: pedra real não afina reto, mas
      // também não se dobra. Tremor de tamanho fixo na ponta faria a malha se
      // cruzar, e as faces cruzadas apareceriam viradas para dentro.
      const tremor = Math.sin(angulo * 3 + semente) * amplitude * 0.55 * raioDoAnel
      const raio = raioDoAnel * (relevo[coluna] ?? 1)

      posicoes.push(Math.cos(angulo) * raio, y + tremor, Math.sin(angulo) * raio)
    }
  }

  const verticesPorAnel = segmentosRadiais + 1

  for (let anel = 0; anel < aneis; anel += 1) {
    for (let coluna = 0; coluna < segmentosRadiais; coluna += 1) {
      const atual = anel * verticesPorAnel + coluna
      const abaixo = atual + verticesPorAnel
      // Sentido anti-horário visto de fora: o giro vai do vértice da esquerda
      // para o da direita e só então desce. Na ordem contrária, o descarte de
      // face traseira esconde a parede e a ilha fica oca, visível só por dentro.
      // Conferido em `orientacao.test.ts`.
      indices.push(atual, atual + 1, abaixo)
      indices.push(atual + 1, abaixo + 1, abaixo)
    }
  }

  return { posicoes, indices }
}

export type OpcoesDoTopo = {
  readonly segmentosRadiais: number
  readonly aneis: number
  readonly semente: number
  readonly raio: number
  /** Irregularidade da borda, como no topo da rocha. */
  readonly amplitude: number
}

export const TOPO_PADRAO: OpcoesDoTopo = {
  segmentosRadiais: 14,
  aneis: 4,
  semente: 1,
  raio: 6,
  amplitude: 0.12,
}

/**
 * Gera o disco de capim que fecha a ilha por cima.
 *
 * Os anéis internos têm raio ligeiramente maior, para o topo parecer uma
 * pastagem levemente abaulada, e não uma tampa plana.
 */
export function gerarTopo(opcoes: OpcoesDoTopo = TOPO_PADRAO): Malha {
  const { segmentosRadiais, aneis, semente, raio, amplitude } = opcoes

  if (segmentosRadiais < 3) {
    throw new Error(`São necessários ao menos 3 segmentos radiais, e veio ${segmentosRadiais}`)
  }
  if (aneis < 1) {
    throw new Error(`São necessários ao menos 1 anel, e veio ${aneis}`)
  }

  const sortear = criarSorteador(semente + 7919)
  const posicoes: number[] = []
  const indices: number[] = []

  const borda: number[] = []
  for (let coluna = 0; coluna <= segmentosRadiais; coluna += 1) {
    borda.push(
      coluna === segmentosRadiais ? (borda[0] ?? 1) : entre(sortear, 1 - amplitude, 1 + amplitude),
    )
  }

  // Centro
  posicoes.push(0, 0, 0)

  for (let anel = 1; anel <= aneis; anel += 1) {
    const t = anel / aneis
    const raioDoAnel = raio * t
    const y = t * t * raio * 0.06

    for (let coluna = 0; coluna <= segmentosRadiais; coluna += 1) {
      const angulo = (coluna / segmentosRadiais) * Math.PI * 2
      const fator = anel === aneis ? (borda[coluna] ?? 1) : 1
      const r = raioDoAnel * fator

      posicoes.push(Math.cos(angulo) * r, y, Math.sin(angulo) * r)
    }
  }

  const verticesPorAnel = segmentosRadiais + 1

  // Leque do centro para o primeiro anel, no sentido que deixa a normal para
  // cima: é o capim, e ele tem de ser visto de cima.
  for (let coluna = 0; coluna < segmentosRadiais; coluna += 1) {
    indices.push(0, 1 + coluna + 1, 1 + coluna)
  }

  // Anéis seguintes
  for (let anel = 0; anel < aneis - 1; anel += 1) {
    const base = 1 + anel * verticesPorAnel
    const proximo = base + verticesPorAnel

    for (let coluna = 0; coluna < segmentosRadiais; coluna += 1) {
      indices.push(base + coluna, base + coluna + 1, proximo + coluna)
      indices.push(base + coluna + 1, proximo + coluna + 1, proximo + coluna)
    }
  }

  return { posicoes, indices }
}

/** Coloca a malha na posição informada, devolvendo uma malha nova. */
export function deslocarMalha(
  malha: Malha,
  deslocamento: { readonly x: number; readonly y: number; readonly z: number },
): Malha {
  const posicoes: number[] = []
  for (let indice = 0; indice < malha.posicoes.length; indice += 3) {
    posicoes.push(
      (malha.posicoes[indice] ?? 0) + deslocamento.x,
      (malha.posicoes[indice + 1] ?? 0) + deslocamento.y,
      (malha.posicoes[indice + 2] ?? 0) + deslocamento.z,
    )
  }
  return { posicoes, indices: malha.indices }
}

/** Junta duas malhas, ajustando os índices da segunda. */
export function juntarMalhas(primeira: Malha, segunda: Malha): Malha {
  const deslocamentoDeIndice = primeira.posicoes.length / 3
  return {
    posicoes: [...primeira.posicoes, ...segunda.posicoes],
    indices: [
      ...primeira.indices,
      ...segunda.indices.map((indice) => indice + deslocamentoDeIndice),
    ],
  }
}
