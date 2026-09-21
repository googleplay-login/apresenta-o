import {
  deslocarMalha,
  juntarMalhas,
  rotacionarMalha,
  INCLINACAO_DO_TOPO,
  type Malha,
} from './ilha'
import { UNIDADES_POR_TEXTURA } from './texturas'
import { criarSorteador, entre } from './aleatorio'

/**
 * Sólidos simples, montados por nós.
 *
 * Cada estrutura do mundo (biblioteca, mesa, placa, ponte) é **uma** malha
 * gerada aqui e desenhada como um único objeto. Isso tem uma razão prática: uma
 * ponte com trinta tábuas como trinta objetos são trinta desenhos por quadro;
 * como uma malha só, é um. O mundo cabe no orçamento de um celular modesto.
 *
 * Tudo é função pura: entra medida, sai vetor de posições e índices. Testável
 * sem navegador, como o resto da geometria.
 */

/**
 * Espessura do tabuleiro da ponte.
 *
 * Exportada porque outra conta depende dela: o topo do tabuleiro fica em
 * `posicao.y + ESPESSURA_DO_TABULEIRO / 2`, e é onde o pé do avatar pisa. Com a
 * constante em um lugar só, mudar a espessura não deixa o avatar flutuando.
 */
export const ESPESSURA_DO_TABULEIRO = 0.22

export type Ponto = { readonly x: number; readonly y: number; readonly z: number }

export type OpcoesDaCaixa = {
  readonly largura: number
  readonly altura: number
  readonly profundidade: number
  /** Canto ou centro de referência. Padrão: canto em (0,0,0), crescendo para +x, +y, +z. */
  readonly centro?: Ponto | false
}

/** Caixa retangular, com 6 faces e normais voltadas para fora. */
export function gerarCaixa(opcoes: OpcoesDaCaixa): Malha {
  const { largura, altura, profundidade } = opcoes
  const centro = opcoes.centro === undefined ? false : opcoes.centro

  if (largura <= 0 || altura <= 0 || profundidade <= 0) {
    throw new Error('Caixa precisa de largura, altura e profundidade maiores que zero')
  }

  // Canto inferior esquerdo. Sem centro informado, a caixa cresce a partir da origem.
  const x0 = centro === false ? 0 : centro.x - largura / 2
  const y0 = centro === false ? 0 : centro.y - altura / 2
  const z0 = centro === false ? 0 : centro.z - profundidade / 2

  const x1 = x0 + largura
  const y1 = y0 + altura
  const z1 = z0 + profundidade

  // Cada face lista os quatro cantos no sentido anti-horário **visto de fora**.
  // Isso não é detalhe de estilo: com o sentido trocado, o descarte de face
  // traseira esconde a face, e a caixa fica oca. O arquivo
  // `orientacao.test.ts` confere isto face por face.
  const posicoes = [
    // baixo (-y): visto de baixo, o giro é x0z0 → x1z0 → x1z1 → x0z1
    x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1,
    // cima (+y)
    x0, y1, z0, x0, y1, z1, x1, y1, z1, x1, y1, z0,
    // frente (-z)
    x0, y0, z0, x0, y1, z0, x1, y1, z0, x1, y0, z0,
    // trás (+z)
    x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1,
    // esquerda (-x)
    x0, y0, z1, x0, y1, z1, x0, y1, z0, x0, y0, z0,
    // direita (+x)
    x1, y0, z0, x1, y1, z0, x1, y1, z1, x1, y0, z1,
  ]

  const indices = [
    0, 1, 2, 0, 2, 3, // baixo
    4, 5, 6, 4, 6, 7, // cima
    8, 9, 10, 8, 10, 11, // frente
    12, 13, 14, 12, 14, 15, // trás
    16, 17, 18, 16, 18, 19, // esquerda
    20, 21, 22, 20, 22, 23, // direita
  ]

  // As coordenadas de textura, em unidades do mundo (D-064): cada face usa os
  // dois eixos que ela tem, então a textura é contínua de uma peça para a outra e
  // não estica na peça grande. Sem isso, a caixa receberia a textura inteira em
  // cada face — a diferença entre "tábua" e "adesivo".
  const uvs = [
    ...uvDeFace(x0, z0, x1, z1, false), // baixo (x por z)
    ...uvDeFace(x0, z0, x1, z1, true), // cima
    ...uvDeFace(x0, y0, x1, y1, true), // frente (x por y)
    ...uvDeFace(x0, y0, x1, y1, false), // trás
    ...uvDeFace(z1, y0, z0, y1, true), // esquerda (z por y)
    ...uvDeFace(z0, y0, z1, y1, false), // direita
  ]

  return { posicoes, indices, uvs }
}

/**
 * As quatro coordenadas de textura de uma face retangular, em unidades do mundo.
 *
 * `invertido` troca a ordem dos dois cantos no segundo eixo — é o que mantém a
 * textura do lado de dentro para fora, em vez de espelhada, nas faces opostas.
 */
function uvDeFace(
  a0: number,
  b0: number,
  a1: number,
  b1: number,
  invertido: boolean,
): readonly number[] {
  const escala = UNIDADES_POR_TEXTURA
  const au0 = a0 / escala
  const au1 = a1 / escala
  const bv0 = b0 / escala
  const bv1 = b1 / escala
  return invertido
    ? [au0, bv0, au0, bv1, au1, bv1, au1, bv0]
    : [au0, bv1, au0, bv0, au1, bv0, au1, bv1]
}

export type OpcoesDoCilindro = {
  readonly raio: number
  readonly altura: number
  readonly lados: number
  /** Centro da base. Padrão: origem. */
  readonly base?: Ponto
  /** `true` fecha as tampas de cima e de baixo. */
  readonly comTampas?: boolean
}

/** Cilindro em pé, a partir da base. Usado para postes e troncos. */
export function gerarCilindro(opcoes: OpcoesDoCilindro): Malha {
  const { raio, altura, lados, comTampas = true } = opcoes
  const base = opcoes.base ?? { x: 0, y: 0, z: 0 }

  if (raio <= 0 || altura <= 0) {
    throw new Error('Cilindro precisa de raio e altura maiores que zero')
  }
  if (lados < 3) {
    throw new Error(`Cilindro precisa de ao menos 3 lados, e veio ${lados}`)
  }

  const posicoes: number[] = []
  const indices: number[] = []

  for (let lado = 0; lado <= lados; lado += 1) {
    const angulo = (lado / lados) * Math.PI * 2
    const x = base.x + Math.cos(angulo) * raio
    const z = base.z + Math.sin(angulo) * raio
    posicoes.push(x, base.y, z)
    posicoes.push(x, base.y + altura, z)
  }

  for (let lado = 0; lado < lados; lado += 1) {
    const baixo = lado * 2
    const cima = baixo + 1
    const proximoBaixo = baixo + 2
    const proximaCima = baixo + 3
    // Lateral anti-horária vista de fora do cilindro.
    indices.push(baixo, cima, proximoBaixo)
    indices.push(cima, proximaCima, proximoBaixo)
  }

  if (comTampas) {
    const centroDeBaixo = posicoes.length / 3
    posicoes.push(base.x, base.y, base.z)
    const centroDeCima = posicoes.length / 3
    posicoes.push(base.x, base.y + altura, base.z)

    for (let lado = 0; lado < lados; lado += 1) {
      const baixo = lado * 2
      const cima = baixo + 1
      const proximoBaixo = baixo + 2
      const proximaCima = baixo + 3

      // Tampa de baixo olha para -y, a de cima para +y.
      indices.push(centroDeBaixo, baixo, proximoBaixo)
      indices.push(centroDeCima, proximaCima, cima)
    }
  }

  // A lateral recebe a textura pelo comprimento do arco (para não esticar em
  // cilindro grosso) e pela altura; as tampas, pelo plano.
  const uvs: number[] = []
  for (let lado = 0; lado <= lados; lado += 1) {
    const volta = ((lado / lados) * Math.PI * 2 * raio) / UNIDADES_POR_TEXTURA
    uvs.push(volta, base.y / UNIDADES_POR_TEXTURA)
    uvs.push(volta, (base.y + altura) / UNIDADES_POR_TEXTURA)
  }
  if (comTampas) {
    uvs.push(base.x / UNIDADES_POR_TEXTURA, base.z / UNIDADES_POR_TEXTURA)
    uvs.push(base.x / UNIDADES_POR_TEXTURA, base.z / UNIDADES_POR_TEXTURA)
  }

  return { posicoes, indices, uvs }
}

/** Junta várias malhas em uma. Atalho para montar estrutura peça por peça. */
export function montar(pecas: readonly Malha[]): Malha {
  return pecas.reduce(juntarMalhas)
}

export type OpcoesDaPonte = {
  /** Distância entre as duas ilhas, medida nas bordas do capim. */
  readonly comprimento: number
  readonly largura: number
  /** Quantas tábuas cabem no vão. */
  readonly tabuas: number
  /**
   * Ponte liberada: tábuas de ponta a ponta e corrimão.
   *
   * Bloqueada: as tábuas saem das **duas** pontas e o que falta é o meio — a
   * ponte interrompida, e não a ponte pela metade. A versão anterior construía
   * metade do vão a partir da ilha de origem, e a captura mostrou o resultado:
   * uma tábua pendurada no ar, sem encostar em lugar nenhum, e um arquipélago
   * que parecia quebrado em vez de bloqueado (D-063).
   */
  readonly liberada: boolean
  /**
   * Quanto a entrada da ponte avança **para dentro** da ilha, em metros.
   *
   * É a correção da queixa mais concreta do estudante (21/09/2026): *"as pontes
   * não encostam nas ilhas"*. Medido antes de mudar, o tabuleiro **encostava**:
   * as duas pontas caíam no ponto mais interior da borda do capim, com margem
   * exata de 0,000 — e a altura das duas pontas batia com o capim, degrau 0,000.
   * Só que encostar por zero não se vê: a tábua da ponta fica rente à borda do
   * capim, escondida por ela, e o que se lê numa captura é uma ponte que termina
   * no ar. Aqui a ponte **entra** na ilha: uma rampa de `entrada` metros deita
   * sobre o capim, com a inclinação dele, e a estrutura ganha pernas de apoio —
   * nada mais fica suspenso.
   */
  readonly entrada?: number
  /**
   * O declive do capim em cada ponta (origem e destino), em tangente.
   *
   * Vale `2 × inclinacaoDoCapim`: o capim sobe em direção à borda, e a derivada
   * da parábola `t²·raio·inclinacao` na borda (t = 1) é exatamente o dobro da
   * inclinação. É o que deita a rampa de entrada **no chão**, em vez de deixá-la
   * paralela ao horizonte com a ponta no ar.
   */
  readonly declivesDaEntrada?: readonly [number, number]
  /** Semente do desenho: as tábuas variam entre si, e a semente fixa como. */
  readonly semente?: number
}

export type PonteGerada = {
  /** Tábuas, pernas, entradas e postes. */
  readonly estrutura: Malha
  /** As barras do corrimão, quando a ponte está liberada. */
  readonly corrimao: Malha | null
  /** Índices das tábuas construídas, na ordem. */
  readonly tabuasConstruidas: readonly number[]
  /** O trecho aberto no meio, quando a ponte está bloqueada. */
  readonly vaoAberto: { readonly de: number; readonly ate: number } | null
  /** Quanto cada entrada avança para dentro da ilha. */
  readonly entrada: number
  /** O que a estrutura cobre no total: o vão mais as duas entradas. */
  readonly comprimentoTotal: number
}

/** Quanto a ponte entra na ilha em cada ponta. */
const ENTRADA_PADRAO = 1.1
/** Altura do corrimão acima do tabuleiro, e da barra do meio. */
const ALTURA_DO_CORRIMAO = 1
const ALTURA_DO_CORRIMAO_DO_MEIO = 0.52
/** Altura do poste que sustenta o corrimão. */
const ALTURA_DO_POSTE = 1.05
/** Quanto as pernas descem abaixo do tabuleiro, no meio e nas pontas. */
const DESCIDA_DA_PERNA = 1.7
const DESCIDA_DA_PERNA_DA_PONTA = 2.6
/** De quantos em quantos metros entra um par de pernas. */
const PASSO_DA_PERNA = 3.1

/**
 * Uma ponte: tabuleiro de tábuas, pernas de apoio, entradas deitadas no capim e
 * corrimão.
 *
 * **O que mudou, e por quê.** A ponte anterior tinha tábua, poste de 2,1 metros e
 * mais nada: os postes subiam do tabuleiro para o alto e, quando a ponte estava
 * bloqueada, não havia corrimão nenhum — o que se via eram estacas espetadas ao
 * acaso, sem apoio embaixo e sem nada em cima (a queixa das capturas). Agora:
 *
 *  - **entradas**: dois metros de rampa deitados no capim de cada ilha, na
 *    inclinação dele, para o encontro da ponte com a ilha ser visível de longe;
 *  - **pernas**: pares de esteios descendo do tabuleiro — mais fundos nas pontas,
 *    onde entram na encosta da ilha — amarrados por um travessão. É o apoio que
 *    faltava: nada da ponte fica pendurado no ar;
 *  - **corrimão de verdade**: dois postes por par de tábuas e **duas** barras
 *    (a do alto e a do meio), em vez de uma barra solta no ar a dois metros;
 *  - **tábuas desiguais**: largura, folga e posição de cada tábua saem da
 *    semente, então a prancha repetida de ponta a ponta — *"pranchas repetidas
 *    roboticamente"*, na captura — deixou de existir. Tudo determinístico: a
 *    mesma semente dá a mesma ponte.
 */
export function gerarPonte(opcoes: OpcoesDaPonte): PonteGerada {
  const {
    comprimento,
    largura,
    tabuas,
    liberada,
    entrada = ENTRADA_PADRAO,
    declivesDaEntrada = [2 * INCLINACAO_DO_TOPO, 2 * INCLINACAO_DO_TOPO],
    semente = 1,
  } = opcoes

  if (comprimento <= 0 || largura <= 0) {
    throw new Error('Ponte precisa de comprimento e largura maiores que zero')
  }
  if (tabuas < 2) {
    throw new Error(`Ponte precisa de ao menos 2 tábuas, e veio ${tabuas}`)
  }
  if (entrada <= 0) {
    throw new Error(`Entrada da ponte precisa ser maior que zero, e veio ${entrada}`)
  }

  const espacamento = comprimento / tabuas
  const espessura = ESPESSURA_DO_TABULEIRO
  const sortear = criarSorteador(semente)

  // O buraco do meio: quantas tábuas faltam quando a ponte está bloqueada. Com
  // menos de duas, o vão não se lê de longe; com muito mais, a ponte deixa de
  // parecer uma ponte. Um quarto do total (no mínimo duas) é o que a distância
  // de câmera do mundo mostra como "aqui ainda não dá para passar".
  const faltando = liberada ? 0 : Math.max(2, Math.round(tabuas * 0.25))
  const primeiraQueFalta = Math.floor((tabuas - faltando) / 2)
  const ultimaQueFalta = primeiraQueFalta + faltando - 1
  const construida = (indice: number): boolean =>
    indice >= 0 && indice < tabuas && (liberada || indice < primeiraQueFalta || indice > ultimaQueFalta)

  const tabuasConstruidas: number[] = []
  const pecas: Malha[] = []

  for (let indice = 0; indice < tabuas; indice += 1) {
    if (!construida(indice)) {
      continue
    }
    tabuasConstruidas.push(indice)
    // A folga entre tábuas e o deslocamento lateral saem da semente: sem isso, a
    // ponte é uma fileira de pranchas idênticas, que foi o que a captura chamou
    // de "pranchas repetidas roboticamente".
    const folga = entre(sortear, 0.06, 0.14)
    const deslocamento = entre(sortear, -0.03, 0.03) * largura
    pecas.push(
      gerarCaixa({
        largura: espacamento * (1 - folga),
        altura: espessura,
        profundidade: largura * entre(sortear, 0.95, 1),
        centro: {
          x: indice * espacamento + espacamento / 2,
          y: entre(sortear, -0.012, 0.012),
          z: deslocamento,
        },
      }),
    )
  }

  // ── Pernas ────────────────────────────────────────────────────────────────
  // Um par a cada três metros, sempre com um par em cada ponta: nas pontas as
  // pernas descem mais, porque é a encosta da ilha que elas vão encontrar.
  const ondeTemPerna: number[] = []
  for (let x = 0; x < comprimento; x += PASSO_DA_PERNA) {
    ondeTemPerna.push(x)
  }
  ondeTemPerna.push(comprimento)

  const zDaPerna = largura / 2 - 0.16
  for (const x of ondeTemPerna) {
    const naPonta = x <= 0.001 || x >= comprimento - 0.001
    const descida = naPonta ? DESCIDA_DA_PERNA_DA_PONTA : DESCIDA_DA_PERNA
    for (const lado of [-1, 1]) {
      pecas.push(
        gerarCilindro({
          raio: 0.13,
          altura: descida,
          lados: 6,
          base: { x, y: -descida, z: lado * zDaPerna },
        }),
      )
    }
    // O travessão amarra o par de pernas por baixo do tabuleiro. Sem ele, o par
    // fica parecendo duas estacas soltas — a queixa das capturas.
    pecas.push(
      gerarCaixa({
        largura: 0.16,
        altura: 0.14,
        profundidade: largura - 0.3,
        centro: { x, y: -0.75, z: 0 },
      }),
    )
  }

  // ── Entradas ──────────────────────────────────────────────────────────────
  // Uma rampa por ponta, deitada no capim: o topo dela encosta no tabuleiro e a
  // ponta desce o que o capim desce naquela distância.
  for (const [indiceDaPonta, declive] of declivesDaEntrada.entries()) {
    const naOrigem = indiceDaPonta === 0
    const angulo = Math.atan(declive)
    const inclinada = rotacionarMalha(
      gerarCaixa({ largura: entrada, altura: espessura, profundidade: largura * 0.92 }),
      { eixo: 'z', angulo: naOrigem ? angulo : -angulo },
    )
    pecas.push(
      deslocarMalha(inclinada, {
        // A rampa da origem cresce para −x (para dentro da ilha de origem); a do
        // destino cresce para +x, a partir do fim do vão.
        x: naOrigem
          ? -entrada * Math.cos(angulo)
          : comprimento,
        y: naOrigem ? -entrada * Math.sin(angulo) : 0,
        z: 0,
      }),
    )
    // Duas pernas curtas ferram a rampa no capim: sem elas, a entrada se apoia
    // só na quina do tabuleiro.
    for (const lado of [-1, 1]) {
      pecas.push(
        gerarCilindro({
          raio: 0.1,
          altura: 0.5,
          lados: 6,
          base: {
            x: naOrigem ? -entrada * 0.75 : comprimento + entrada * 0.75,
            y: -entrada * 0.75 * declive - 0.5,
            z: lado * (largura / 2 - 0.3),
          },
        }),
      )
    }
  }

  const zDoPoste = largura / 2 - 0.12

  // ── Postes do corrimão ────────────────────────────────────────────────────
  // Um par a cada duas tábuas quando a ponte está liberada; quando está
  // bloqueada, um par em cada beirada do buraco, que é onde a travessa de parada
  // se apoia.
  const ondeTemPoste: number[] = []
  if (liberada) {
    for (let indice = 0; indice <= tabuas; indice += 2) {
      ondeTemPoste.push(Math.min(indice * espacamento, comprimento))
    }
  } else {
    for (const indice of [primeiraQueFalta, ultimaQueFalta + 1]) {
      ondeTemPoste.push(Math.min(Math.max(indice * espacamento, 0.11), comprimento - 0.11))
    }
  }
  for (const x of ondeTemPoste) {
    for (const lado of [-1, 1]) {
      pecas.push(
        gerarCilindro({
          raio: 0.09,
          altura: ALTURA_DO_POSTE,
          lados: 6,
          base: { x, y: 0, z: lado * zDoPoste },
        }),
      )
    }
  }

  if (!liberada) {
    // A travessa de parada: uma barra atravessada entre os dois postes de cada
    // toco, na altura do joelho. Sem ela, o toco termina em tábua solta e parece
    // inacabado; com ela, o que se vê é uma ponte **interrompida**.
    for (const x of ondeTemPoste) {
      pecas.push(
        gerarCaixa({
          largura: 0.16,
          altura: 0.14,
          profundidade: largura,
          centro: { x, y: 0.62, z: 0 },
        }),
      )
    }
  }

  const estrutura = montar(pecas)

  const vaoAberto = liberada
    ? null
    : { de: primeiraQueFalta * espacamento, ate: (ultimaQueFalta + 1) * espacamento }

  if (!liberada) {
    return {
      estrutura,
      corrimao: null,
      tabuasConstruidas,
      vaoAberto,
      entrada,
      comprimentoTotal: comprimento + entrada * 2,
    }
  }

  const barras: Malha[] = []
  for (const lado of [-1, 1]) {
    for (const altura of [ALTURA_DO_CORRIMAO, ALTURA_DO_CORRIMAO_DO_MEIO]) {
      for (let indice = 0; indice < tabuas; indice += 1) {
        const x = indice * espacamento
        barras.push(
          gerarCaixa({
            largura: espacamento * 1.04,
            altura: altura === ALTURA_DO_CORRIMAO ? 0.16 : 0.1,
            profundidade: 0.1,
            centro: { x: x + espacamento / 2, y: altura, z: lado * zDoPoste },
          }),
        )
      }
    }
  }

  return {
    estrutura,
    corrimao: montar(barras),
    tabuasConstruidas,
    vaoAberto: null,
    entrada,
    comprimentoTotal: comprimento + entrada * 2,
  }
}

export type OpcoesDaBiblioteca = {
  readonly largura: number
  readonly altura: number
  readonly profundidade: number
}

/** Biblioteca da ilha: um volume com prateleiras à mostra na face da frente. */
export function gerarBiblioteca(opcoes: OpcoesDaBiblioteca): Malha {
  const { largura, altura, profundidade } = opcoes
  const pecas: Malha[] = [gerarCaixa({ largura, altura, profundidade })]

  const prateleiras = 3
  for (let indice = 1; indice <= prateleiras; indice += 1) {
    const y = (altura / (prateleiras + 1)) * indice
    pecas.push(
      gerarCaixa({
        largura: largura * 0.86,
        altura: 0.09,
        profundidade: 0.16,
        // Salta para fora da face da frente, onde o estudante vê.
        centro: { x: largura / 2, y, z: -profundidade / 2 - 0.08 },
      }),
    )
  }

  // Telhado levemente maior, para a silhueta lembrar um prédio, e não um cubo.
  pecas.push(
    gerarCaixa({
      largura: largura * 1.12,
      altura: 0.24,
      profundidade: profundidade * 1.12,
      centro: { x: largura / 2, y: altura + 0.12, z: 0 },
    }),
  )

  return montar(pecas)
}

/** Mesa de trabalho com monitor: onde ficam a explicação e o ambiente de código. */
export function gerarMesa(opcoes: { readonly largura: number; readonly altura: number }): Malha {
  const { largura, altura } = opcoes
  const tampa = 0.22
  const profundidade = largura * 0.6

  if (altura <= tampa) {
    throw new Error(`A mesa precisa ser mais alta que a tampa de ${tampa}, e veio ${altura}`)
  }

  // O tampo fica em cima e as pernas descem até o chão: a mesa é ancorada no
  // capim, e não no tampo. Ancorar no tampo deixaria as pernas enterradas.
  const alturaDasPernas = altura - tampa
  const espessuraDaPerna = 0.18
  const recuo = Math.min(0.3, largura * 0.12)
  const pecas: Malha[] = [
    gerarCaixa({
      largura,
      altura: tampa,
      profundidade,
      centro: { x: largura / 2, y: altura - tampa / 2, z: 0 },
    }),
  ]

  for (const x of [recuo, largura - recuo - espessuraDaPerna]) {
    for (const z of [recuo, profundidade - recuo - espessuraDaPerna]) {
      pecas.push(
        gerarCaixa({
          largura: espessuraDaPerna,
          altura: alturaDasPernas,
          profundidade: espessuraDaPerna,
          centro: { x: x + espessuraDaPerna / 2, y: alturaDasPernas / 2, z: z + espessuraDaPerna / 2 },
        }),
      )
    }
  }

  // Monitor em pé sobre o tampo.
  pecas.push(
    gerarCaixa({
      largura: 0.5,
      altura: 0.12,
      profundidade: 0.4,
      centro: { x: largura / 2, y: altura + 0.06, z: -0.05 },
    }),
  )
  pecas.push(
    gerarCaixa({
      largura: 1.9,
      altura: 1.25,
      profundidade: 0.14,
      centro: { x: largura / 2, y: altura + 0.8, z: -0.05 },
    }),
  )

  return montar(pecas)
}

/** Placa de missão: poste com uma tábua escrita, virada para quem chega. */
export function gerarPlaca(opcoes: { readonly altura: number; readonly largura: number }): Malha {
  const { altura, largura } = opcoes
  return montar([
    gerarCilindro({ raio: 0.14, altura, lados: 6 }),
    gerarCaixa({
      largura,
      altura: altura * 0.34,
      profundidade: 0.12,
      centro: { x: largura / 2, y: altura * 0.78, z: 0 },
    }),
  ])
}

/**
 * Árvore simples: tronco e duas camadas de copa.
 *
 * Poucas por ilha, de propósito. Árvore em excesso numa ilha suspensa pequena
 * vira silhueta confusa, e o que precisa ficar visível são as estruturas.
 */
export type ArvoreEmPartes = {
  /** O tronco, que sai do chão e atravessa a copa. */
  readonly tronco: Malha
  /** A copa: os dois anéis de folhagem. */
  readonly copa: Malha
}

/**
 * Conífera em duas partes: tronco e copa.
 *
 * Por que em partes: até a captura de tela que abriu a D-060, a árvore inteira —
 * tronco **e** copa — era desenhada com a cor da madeira (`CORES_DERIVADAS.tronco`,
 * `#60422A`). Na tela, a copa saía marrom e a árvore virava um torrão de terra em
 * pé: a folhagem não se distinguia do tronco nem da pedra solta ao lado. A cor da
 * copa é o token da conífera (`cores.terreno.conifera`), que existia na paleta
 * justamente para isto e não tinha nenhum uso.
 */
export function gerarArvore(opcoes: { readonly altura: number; readonly raio: number }): ArvoreEmPartes {
  const { altura, raio } = opcoes
  return {
    tronco: gerarCilindro({ raio: raio * 0.16, altura: altura * 0.42, lados: 6 }),
    copa: montar([
      gerarCilindro({
        raio,
        altura: altura * 0.34,
        lados: 7,
        base: { x: 0, y: altura * 0.4, z: 0 },
      }),
      gerarCilindro({
        raio: raio * 0.7,
        altura: altura * 0.3,
        lados: 7,
        base: { x: 0, y: altura * 0.66, z: 0 },
      }),
    ]),
  }
}

/** Bola de pedra solta no capim. Detalhe barato que tira a cara de "caixa vazia". */
export function gerarPedra(opcoes: { readonly raio: number }): Malha {
  return gerarCilindro({ raio: opcoes.raio, altura: opcoes.raio * 0.8, lados: 5 })
}

/**
 * Uma esfera de meridianos e anéis — o volume redondo que o mundo não tinha.
 *
 * Existe por causa da nuvem. O bolsão de nuvem era `gerarPedra`, que é um prisma
 * de cinco lados: a nuvem ficava com quinas retas de cristal, e a crítica de
 * 21/09/2026 pediu justamente o contrário dele. As faces de cima e de baixo são
 * tapadas com leques, como no cilindro, e as coordenadas de textura correm no
 * sentido do meridiano e da altura, para o ruído não esticar no equador.
 */
export function gerarEsfera(opcoes: {
  readonly raio: number
  readonly meridianos?: number
  readonly aneis?: number
}): Malha {
  const { raio, meridianos = 10, aneis = 6 } = opcoes
  const posicoes: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let anel = 0; anel <= aneis; anel += 1) {
    const phi = (anel / aneis) * Math.PI
    const y = Math.cos(phi) * raio
    const raioDoAnel = Math.sin(phi) * raio

    for (let meridiano = 0; meridiano <= meridianos; meridiano += 1) {
      const angulo = (meridiano / meridianos) * Math.PI * 2
      posicoes.push(
        Math.cos(angulo) * raioDoAnel,
        y,
        Math.sin(angulo) * raioDoAnel,
      )
      uvs.push(
        (angulo * raio) / UNIDADES_POR_TEXTURA,
        ((y + raio) / UNIDADES_POR_TEXTURA),
      )
    }
  }

  const porAnel = meridianos + 1
  for (let anel = 0; anel < aneis; anel += 1) {
    for (let meridiano = 0; meridiano < meridianos; meridiano += 1) {
      const a = anel * porAnel + meridiano
      const b = a + 1
      const c = a + porAnel
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  return { posicoes, indices, uvs }
}

/**
 * Uma nuvem: três a cinco bolsões da mesma pedra redonda, montados e achatados.
 *
 * A captura de 21/09/2026 foi direta: *"o céu é um gradiente sem graça de branco
 * e azul claro, sem nuvens volumétricas"*. Até então cada nuvem era **uma** caixa
 * achatada — barata, e visivelmente uma caixa. Aqui ela é um conjunto de bolsões
 * com deslocamentos e tamanhos sorteados da semente, então nenhuma nuvem é igual
 * à outra e nenhuma tem quina reta. A malha é **uma só** por nuvem: cinco pedras
 * separadas custariam cinco desenhos por quadro.
 */
export function gerarNuvem(opcoes: {
  readonly largura: number
  readonly altura: number
  readonly profundidade: number
  readonly semente: number
}): Malha {
  const { largura, altura, profundidade, semente } = opcoes
  const sortear = criarSorteador(semente)
  const quantos = 4 + Math.floor(sortear() * 3)
  const pecas: Malha[] = []

  for (let indice = 0; indice < quantos; indice += 1) {
    const bolsao = gerarEsfera({ raio: 1, meridianos: 9, aneis: 5 })
    // Cada bolsão é um elipsoide achatado: escala diferente em cada eixo, e a
    // soma deles é que dá o contorno irregular de nuvem. Uma esfera perfeita
    // escalada igual nos três eixos viraria uma bola.
    const escalaX = (largura * entre(sortear, 0.45, 0.85)) / 2
    const escalaY = (altura * entre(sortear, 0.6, 1)) / 2
    const escalaZ = (profundidade * entre(sortear, 0.45, 0.85)) / 2
    const escalado: Malha = {
      posicoes: bolsao.posicoes.map((valor, posicao) =>
        valor * (posicao % 3 === 0 ? escalaX : posicao % 3 === 1 ? escalaY : escalaZ),
      ),
      indices: bolsao.indices,
      uvs: bolsao.uvs,
    }
    pecas.push(
      deslocarMalha(escalado, {
        x: entre(sortear, -0.34, 0.34) * largura,
        y: entre(sortear, -0.2, 0.2) * altura,
        z: entre(sortear, -0.34, 0.34) * profundidade,
      }),
    )
  }

  return montar(pecas)
}

/**
 * As quatro formas de bandeira, uma por trilha do livro.
 *
 * A bandeira existe para responder a uma pergunta que a captura deixou clara: de
 * longe, o arquipélago dizia "ilhas" e não dizia **de que parte do livro** cada
 * uma é. O marco responde por dentro (cada ilha tem o seu), e a bandeira responde
 * de fora: mesma forma e mesma cor para as ilhas da mesma trilha, então quem
 * olha o mundo vê os quatro grupos antes de ler qualquer nome.
 *
 * São quatro silhuetas distintas, e todas saem de caixas: flâmula (triangular),
 * retangular, de duas caudas (o retângulo com o recorte no meio) e quadrada.
 */
export type FormaDeBandeira = 'flamula' | 'retangular' | 'duas-caudas' | 'quadrada'

export type BandeiraGerada = {
  /** O pano, na altura do topo do mastro. */
  readonly pano: Malha
  /** O mastro, do capim até acima do pano. */
  readonly mastro: Malha
  /** Altura total, para quem precisa enquadrar. */
  readonly alturaTotal: number
  /** Maior distância do mastro, no plano. */
  readonly raioOcupado: number
}

/** Bandeira da trilha: mastro fino com o pano preso no alto, indo para +x. */
export function gerarBandeira(opcoes: {
  readonly forma: FormaDeBandeira
  readonly altura: number
  readonly largura: number
}): BandeiraGerada {
  const { forma, altura, largura } = opcoes
  const espessura = 0.06

  // As formas são feitas de **faixas horizontais**, e a lista de frações de
  // largura de cada faixa é a forma. Assim as quatro saem do mesmo pedaço de
  // código, e a diferença entre elas é dado, e não quatro blocos copiados.
  const faixas: Record<FormaDeBandeira, readonly number[]> = {
    // De cima para baixo, cada faixa mais curta: o que se lê é um triângulo.
    flamula: [1, 0.66, 0.33],
    // O pano inteiro: uma faixa só.
    retangular: [1],
    // Duas caudas: a faixa do meio recua, e a borda fica com um recorte.
    'duas-caudas': [1, 0.45, 1],
    // Quadrada: duas faixas, e o pano é menor que o das outras.
    quadrada: [1, 1],
  }
  const larguras = faixas[forma]
  const alturaDoPano = forma === 'quadrada' ? altura * 0.22 : altura * 0.34
  const larguraDoPano = forma === 'quadrada' ? largura * 0.7 : largura
  const alturaDaFaixa = alturaDoPano / larguras.length
  const base = altura - alturaDoPano

  const pano = montar(
    larguras.map((fracao, indice) =>
      gerarCaixa({
        largura: Math.max(larguraDoPano * fracao, 0.08),
        altura: alturaDaFaixa,
        profundidade: espessura,
        centro: {
          x: (larguraDoPano * fracao) / 2,
          y: base + alturaDoPano - (indice + 0.5) * alturaDaFaixa,
          z: 0,
        },
      }),
    ),
  )

  return {
    pano,
    mastro: gerarCilindro({ raio: 0.07, altura, lados: 6 }),
    alturaTotal: altura,
    raioOcupado: larguraDoPano,
  }
}

export { deslocarMalha }
