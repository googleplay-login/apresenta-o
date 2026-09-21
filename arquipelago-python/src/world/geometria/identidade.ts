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
  // Lote 5 (Etapa 11): a trilha do projeto de jogo — os capítulos 12 a 14.
  'nave',
  'enxame',
  'mira',
  // Lote 6 (Etapa 11): a trilha do projeto de visualização de dados — os
  // capítulos 15 a 17. As três construções são de famílias diferentes de
  // silhueta, de propósito: um funil que estreita para baixo, um tabuleiro largo
  // e fino de pé, e um mastro fino com a bacia no alto.
  'funil',
  'prancheta',
  'antena',
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
  nave: 'Nave de três aletas',
  enxame: 'Enxame de discos',
  mira: 'Mira de anéis',
  funil: 'Funil de dados',
  prancheta: 'Prancheta de colunas',
  antena: 'Antena de escuta',
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
  /** Quanto a pedra engrossa no meio, antes de afinar na ponta. */
  readonly barriga: number
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
    /**
     * Arbustos: moitas baixas, feitas da mesma pedra redonda das soltas.
     *
     * Entraram no lote 6.1 pelo motivo que a captura mostrou: o capim era uma
     * pastagem lisa com meia dúzia de árvores, e a ilha parecia uma maquete sem
     * vida. Arbusto é barato — é a mesma malha da pedra, com outra cor e outro
     * tamanho — e enche o chão de volume (D-063).
     */
    readonly arbustos: number
    /** Flores: pontinhos quentes no capim, ainda menores que os arbustos. */
    readonly flores: number
    /**
     * Objetos do tema da trilha: a pilha de livros, o disco voador, a torre de
     * barras. Entraram depois da segunda captura, pela queixa de que as ilhas
     * "estão todas sem vidas" (D-063) — são a parte do enfeite que diz **de que
     * parte do livro é a ilha**, e não só que ela é diferente das outras.
     */
    readonly objetos: number
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
  // A contagem de polígonos subiu no lote 6.3, e o motivo está na captura de
  // 21/09/2026: *"as ilhas flutuantes terminam em cones inferiores com uma
  // contagem de polígonos vergonhosamente baixa, exibindo arestas duras e
  // visíveis"*. Dez a dezoito colunas davam uma parede de dez a dezoito faces, e
  // a silhueta ficava um polígono de verdade, com quina a cada 20°. Agora são 24
  // a 36 colunas e 12 a 16 anéis — cerca de quatro vezes os vértices, o que numa
  // ilha é ~500 vértices e não pesa no quadro.
  segmentosRadiais: [24, 28, 32, 36],
  aneis: { minimo: 12, maximo: 16 },
  amplitude: { minimo: 0.16, maximo: 0.3 },
  expoenteDoPerfil: { minimo: 1.35, maximo: 2.15 },
  // A ponta mais fina subiu de 0,02 para 0,1: o espinho de 2% era o formato que
  // todas as ilhas tinham, e é o que a captura chamou de cone. Uma ponta de 10%
  // do raio ainda é uma ponta, e o perfil com barriga (ver `perfilDeRaio`) faz o
  // resto — a massa se abre abaixo do capim e fecha embaixo.
  pontaDoPerfil: { minimo: 0.1, maximo: 0.46 },
  /** Quanto a pedra engrossa no meio do caminho. Zero seria a curva seca. */
  barriga: { minimo: 0.1, maximo: 0.36 },
  inclinacaoDoCapim: { minimo: 0.045, maximo: 0.085 },
  amplitudeDaBorda: { minimo: 0.08, maximo: 0.16 },
  arvores: { minimo: 2, maximo: 5 },
  pedras: { minimo: 3, maximo: 6 },
  arbustos: { minimo: 4, maximo: 9 },
  flores: { minimo: 3, maximo: 7 },
  // Dois a quatro objetos do tema por ilha: com um só, a ilha parecia ter um
  // enfeite perdido; com mais de quatro, o capim virava depósito.
  objetos: { minimo: 2, maximo: 4 },
  distancia: { minimo: 0.55, maximo: 0.82 },
} as const

/** Quantos tons a paleta oferece para as ilhas. Ver `paleta3d.ts`. */
export const TONS_DAS_ILHAS = 18

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
  { nome: 'ponta fina', minimo: 0.1, maximo: 0.16 },
  { nome: 'ponta rombuda', minimo: 0.2, maximo: 0.28 },
  { nome: 'toco', minimo: 0.34, maximo: 0.46 },
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
  // Sorteio novo, e no fim dos que já existiam: a barriga muda a pedra de todas
  // as ilhas de propósito (é o que tira a cara de cone), mas não pode mover a
  // árvore nem a pedra solta de nenhuma delas.
  const barriga = entre(sortear, FAIXAS.barriga.minimo, FAIXAS.barriga.maximo)
  const arvores = FAIXAS.arvores.minimo + Math.floor(sortear() * (FAIXAS.arvores.maximo - FAIXAS.arvores.minimo + 1))
  const pedras = FAIXAS.pedras.minimo + Math.floor(sortear() * (FAIXAS.pedras.maximo - FAIXAS.pedras.minimo + 1))
  const distanciaMinima = entre(sortear, FAIXAS.distancia.minimo, FAIXAS.distancia.maximo)
  // Os dois sorteios novos vêm **depois** de tudo o que já existia: a ordem
  // anterior fica intacta, e nenhuma ilha antiga muda de forma, de árvore ou de
  // pedra por causa desta linha (D-063).
  const arbustos =
    FAIXAS.arbustos.minimo +
    Math.floor(sortear() * (FAIXAS.arbustos.maximo - FAIXAS.arbustos.minimo + 1))
  const flores =
    FAIXAS.flores.minimo +
    Math.floor(sortear() * (FAIXAS.flores.maximo - FAIXAS.flores.minimo + 1))
  // Pelo mesmo motivo dos dois acima: o sorteio novo vem depois dos que já
  // existiam, para que nenhuma ilha antiga mude de árvore, pedra, arbusto ou flor.
  const objetos =
    FAIXAS.objetos.minimo +
    Math.floor(sortear() * (FAIXAS.objetos.maximo - FAIXAS.objetos.minimo + 1))
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
      barriga,
    },
    vegetacao: { arvores, pedras, arbustos, flores, objetos, distanciaMinima, distanciaMaxima },
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
  /**
   * Onde a bandeira da trilha finca (D-063).
   *
   * Fica de lado em relação ao percurso, e não na frente dele: as ilhas se ligam
   * ao longo de x, então o ângulo de −0,3π (≈ −54°) sai da linha da ponte, do
   * marco (−0,58π), da placa (0,42π), da mesa (0,15π) e da biblioteca (0,85π).
   * Fincar a bandeira no caminho da ponte seria trocar um defeito por outro.
   */
  bandeira: { raio: 0.68, angulo: -Math.PI * 0.3, ocupacao: 0.12 },
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
