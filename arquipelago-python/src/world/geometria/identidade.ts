import { criarSorteador, entre } from './aleatorio'

/**
 * A identidade visual de uma ilha.
 *
 * Existe por causa de um defeito real, visto por quem usa: com todas as ilhas
 * geradas pelos mesmos números, o arquipélago parecia o mesmo lugar repetido dez
 * vezes. A rocha tremia de jeitos diferentes, mas quem olhava de longe via a
 * mesma altura, o mesmo raio, as mesmas três estruturas e a mesma cor.
 *
 * Aqui cada ilha recebe o que a distingue de todas as outras:
 *
 *  - **silhueta**: raio, altura, quantos lados tem a pedra, quantos anéis, o
 *    quanto ela treme e a abertura do perfil — de ilha atarracada a ilha em
 *    agulha;
 *  - **marco**: a construção que só ela tem, e que se reconhece de longe;
 *  - **vegetação**: quantas árvores e quantas pedras, e a que distância do
 *    centro;
 *  - **tom**: a cor da ilha, tirada da paleta por mistura (nunca escrita à mão).
 *
 * Duas regras que este arquivo **não** quebra:
 *
 *  - é **matemática pura**: entra índice e semente, sai número; nada de Three.js,
 *    nada de React, e portanto tudo testável sem navegador;
 *  - é **determinístico**: a mesma ilha tem sempre a mesma cara, porque os
 *    números vêm da semente da unidade (o id) e da posição dela no percurso. Se
 *    a ilha mudasse a cada carregamento, o estudante não reconheceria o próprio
 *    mundo.
 */

/**
 * Os marcos, na ordem em que aparecem pelo percurso.
 *
 * A lista é percorrida pelo índice da ilha, e não sorteada: assim as ilhas do
 * percurso têm marcos **diferentes**, sem depender de sorte. A lista cresce com o
 * percurso — o lote 4 do capítulo 10 em diante acrescentou o arquivo de gavetas e
 * a balança de dois pratos. Quando o arquipélago passar do tamanho desta lista, o
 * marco volta ao começo — e mesmo assim as duas ilhas não ficam iguais, porque a
 * silhueta, a vegetação e o tom continuam vindo da semente de cada uma.
 */
export const MARCOS = [
  'portal',
  'oficina',
  'estante',
  'mercado',
  'moinho',
  'encruzilhada',
  'farol',
  'estacao',
  'engrenagens',
  'torre',
  'arquivo',
  'balanca',
] as const

export type TipoDeMarco = (typeof MARCOS)[number]

/** Nome do marco em português, como aparece na documentação e no painel. */
export const NOMES_DOS_MARCOS: Readonly<Record<TipoDeMarco, string>> = {
  portal: 'Portal de pedra',
  oficina: 'Bancada de oficina',
  estante: 'Estante alta',
  mercado: 'Barracas do mercado',
  moinho: 'Moinho de pás',
  encruzilhada: 'Placas da encruzilhada',
  farol: 'Farol alto',
  estacao: 'Estação de perguntas',
  engrenagens: 'Par de engrenagens',
  torre: 'Torre de anéis',
  arquivo: 'Arquivo de gavetas',
  balanca: 'Balança de dois pratos',
}

/** O formato da pedra e do capim de uma ilha. */
export type FormatoDaIlha = {
  readonly raioDoTopo: number
  readonly altura: number
  readonly segmentosRadiais: number
  readonly aneis: number
  readonly amplitude: number
  readonly expoenteDoPerfil: number
  /**
   * Raio da ponta da pedra, como fração do raio do topo.
   *
   * É a única parte da ilha que aparece sozinha contra o céu, e é o que mais muda
   * a silhueta vista de longe. Ver `FAMILIAS_DE_PONTA` e a decisão D-057.
   */
  readonly pontaDoPerfil: number
  readonly inclinacaoDoCapim: number
  readonly amplitudeDaBorda: number
}

export type IdentidadeDaIlha = {
  /** Posição no percurso, a partir de zero. Decide o marco e o tom. */
  readonly indice: number
  readonly marco: TipoDeMarco
  readonly nomeDoMarco: string
  /** Índice do tom da ilha na paleta. */
  readonly tom: number
  readonly formato: FormatoDaIlha
  readonly vegetacao: {
    readonly arvores: number
    readonly pedras: number
    /** Faixa onde os enfeites aparecem, medida em raios do capim. */
    readonly distanciaMinima: number
    readonly distanciaMaxima: number
  }
}

/**
 * Faixas de cada número.
 *
 * Estão aqui, e não espalhadas pelo código, por dois motivos: o teste confere
 * que toda identidade cabe nas faixas, e quem for mexer no visual sabe onde está
 * o limite do que já foi conferido. A faixa do raio é estreita de propósito — a
 * distância entre dois centros de ilha é fixa (`mapaDoMundo.ts`), e um raio
 * grande demais encostaria uma ilha na outra.
 */
export const FAIXAS = {
  raioDoTopo: { minimo: 5.2, maximo: 7 },
  altura: { minimo: 7.6, maximo: 11.4 },
  segmentosRadiais: [10, 12, 14, 16, 18],
  aneis: { minimo: 6, maximo: 8 },
  amplitude: { minimo: 0.16, maximo: 0.3 },
  expoenteDoPerfil: { minimo: 1.35, maximo: 2.15 },
  pontaDoPerfil: { minimo: 0.02, maximo: 0.38 },
  inclinacaoDoCapim: { minimo: 0.045, maximo: 0.085 },
  amplitudeDaBorda: { minimo: 0.08, maximo: 0.16 },
  arvores: { minimo: 2, maximo: 5 },
  pedras: { minimo: 3, maximo: 6 },
  distancia: { minimo: 0.55, maximo: 0.82 },
} as const

/** Quantos tons a paleta oferece para as ilhas. Ver `paleta3d.ts`. */
export const TONS_DAS_ILHAS = 12

/**
 * As três famílias de ponta de pedra: como a ilha termina embaixo.
 *
 * A ponta é a única parte da ilha que aparece sozinha contra o céu, e era a
 * **mesma** nas dez: um espinho de 2% do raio. Numa fileira vista de longe, dez
 * bicos afiados iguais fazem o arquipélago parecer a mesma ilha repetida, por mais
 * que a altura, o marco e o tom mudem. Aqui a família sai da **posição** no
 * percurso — para as três aparecerem sempre, e não depender de sorte — e o valor
 * exato sai da **semente**, para duas ilhas nunca ficarem iguais.
 */
export const FAMILIAS_DE_PONTA = [
  { nome: 'espinho', minimo: 0.02, maximo: 0.08 },
  { nome: 'ponta rombuda', minimo: 0.14, maximo: 0.22 },
  { nome: 'toco', minimo: 0.28, maximo: 0.38 },
] as const

/**
 * A identidade de uma ilha.
 *
 * A semente vem do id da unidade (ver `sementeDeTexto`): é ela que faz a pedra,
 * o capim e a vegetação de cada ilha serem sempre os mesmos, e diferentes dos
 * das outras. O índice entra só no marco e no tom, para que duas ilhas não
 * repitam a mesma construção nem a mesma cor.
 */
export function identidadeDaIlha(indice: number, semente: number): IdentidadeDaIlha {
  const sortear = criarSorteador(semente)

  // A ordem dos sorteios é fixa: mudá-la muda a cara de todas as ilhas de uma
  // vez — e o teste que compara as dez identidades acusa a repetição.
  const raioDoTopo = entre(sortear, FAIXAS.raioDoTopo.minimo, FAIXAS.raioDoTopo.maximo)
  const altura = entre(sortear, FAIXAS.altura.minimo, FAIXAS.altura.maximo)
  const segmentosRadiais =
    FAIXAS.segmentosRadiais[
      Math.min(Math.floor(sortear() * FAIXAS.segmentosRadiais.length), FAIXAS.segmentosRadiais.length - 1)
    ] ?? 14
  const aneis = FAIXAS.aneis.minimo + Math.floor(sortear() * (FAIXAS.aneis.maximo - FAIXAS.aneis.minimo + 1))
  const amplitude = entre(sortear, FAIXAS.amplitude.minimo, FAIXAS.amplitude.maximo)
  const expoenteDoPerfil = entre(sortear, FAIXAS.expoenteDoPerfil.minimo, FAIXAS.expoenteDoPerfil.maximo)
  const inclinacaoDoCapim = entre(
    sortear,
    FAIXAS.inclinacaoDoCapim.minimo,
    FAIXAS.inclinacaoDoCapim.maximo,
  )
  const amplitudeDaBorda = entre(sortear, FAIXAS.amplitudeDaBorda.minimo, FAIXAS.amplitudeDaBorda.maximo)
  // A família da ponta vem do índice; o valor exato, da semente. A ordem dos
  // sorteios importa: este entra depois do expoente do perfil e antes da
  // vegetação, e mudar de lugar muda a cara da vegetação de todas as ilhas.
  const familiaDaPonta =
    FAMILIAS_DE_PONTA[
      ((indice % FAMILIAS_DE_PONTA.length) + FAMILIAS_DE_PONTA.length) % FAMILIAS_DE_PONTA.length
    ] ?? FAMILIAS_DE_PONTA[0]
  const pontaDoPerfil = entre(sortear, familiaDaPonta.minimo, familiaDaPonta.maximo)
  const arvores = FAIXAS.arvores.minimo + Math.floor(sortear() * (FAIXAS.arvores.maximo - FAIXAS.arvores.minimo + 1))
  const pedras = FAIXAS.pedras.minimo + Math.floor(sortear() * (FAIXAS.pedras.maximo - FAIXAS.pedras.minimo + 1))
  const distanciaMinima = entre(sortear, FAIXAS.distancia.minimo, FAIXAS.distancia.maximo)
  const distanciaMaxima = Math.min(distanciaMinima + 0.16, 0.92)

  const marco = MARCOS[((indice % MARCOS.length) + MARCOS.length) % MARCOS.length] ?? 'portal'

  return {
    indice,
    marco,
    nomeDoMarco: NOMES_DOS_MARCOS[marco],
    tom: ((indice % TONS_DAS_ILHAS) + TONS_DAS_ILHAS) % TONS_DAS_ILHAS,
    formato: {
      raioDoTopo,
      altura,
      segmentosRadiais,
      aneis,
      amplitude,
      expoenteDoPerfil,
      pontaDoPerfil,
      inclinacaoDoCapim,
      amplitudeDaBorda,
    },
    vegetacao: { arvores, pedras, distanciaMinima, distanciaMaxima },
  }
}

/**
 * Onde as coisas ficam no capim, em raios da ilha.
 *
 * Em raios, e não em unidades: assim as estruturas continuam dentro do capim em
 * toda ilha, do menor raio ao maior, e continuam no mesmo lugar **relativo** —
 * o que faz o mundo ser aprendido uma vez só. O marco fica do lado oposto ao das
 * estruturas de estudo, para não tapar a biblioteca, a mesa e a placa.
 */
export const LUGARES_NA_ILHA = {
  biblioteca: { raio: 0.45, angulo: Math.PI * 0.85, ocupacao: 0.2 },
  mesa: { raio: 0.32, angulo: Math.PI * 0.15, ocupacao: 0.2 },
  placa: { raio: 0.62, angulo: Math.PI * 0.42, ocupacao: 0.15 },
  marco: { raio: 0.4, angulo: -Math.PI * 0.58, ocupacao: 0 },
} as const

/** Posição no capim a partir do lugar e do raio da ilha. */
export function posicaoNoCapim(
  raioDaIlha: number,
  lugar: { readonly raio: number; readonly angulo: number },
): { readonly x: number; readonly z: number } {
  return {
    x: Math.cos(lugar.angulo) * lugar.raio * raioDaIlha,
    z: Math.sin(lugar.angulo) * lugar.raio * raioDaIlha,
  }
}

/**
 * Assinatura da silhueta de uma ilha, arredondada.
 *
 * Serve para comparar duas ilhas sem depender do número exato de casas: duas
 * ilhas com a mesma assinatura teriam a mesma forma, e o mundo voltaria a
 * parecer repetido. O teste das dez ilhas usa isto.
 */
export function assinaturaDaSilhueta(identidade: IdentidadeDaIlha): string {
  const { raioDoTopo, altura, segmentosRadiais, aneis, expoenteDoPerfil } = identidade.formato
  return [
    raioDoTopo.toFixed(2),
    altura.toFixed(2),
    segmentosRadiais,
    aneis,
    expoenteDoPerfil.toFixed(2),
  ].join('/')
}
