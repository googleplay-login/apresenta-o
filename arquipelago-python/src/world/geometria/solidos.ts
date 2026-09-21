import { deslocarMalha, juntarMalhas, type Malha } from './ilha'

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

  return { posicoes, indices }
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

  return { posicoes, indices }
}

/** Junta várias malhas em uma. Atalho para montar estrutura peça por peça. */
export function montar(pecas: readonly Malha[]): Malha {
  return pecas.reduce(juntarMalhas)
}

export type OpcoesDaPonte = {
  /** Distância entre as duas ilhas. */
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
}

export type PonteGerada = {
  /** Tábuas e postes. */
  readonly estrutura: Malha
  /** Corrimão, presente apenas quando a ponte está liberada. */
  readonly corrimao: Malha | null
  /**
   * Quais tábuas existem, por índice.
   *
   * É dado, e não sobra do desenho: a ponte bloqueada tem buraco no meio, e
   * quem quiser dizer em palavras onde ela para — o painel, um teste, a
   * contagem de tábuas da tela — não precisa deduzir isso varrendo a malha.
   */
  readonly tabuasConstruidas: readonly number[]
  /**
   * O trecho que falta, em unidades ao longo da ponte, a partir do início.
   * `null` quando a ponte está inteira.
   */
  readonly vaoAberto: { readonly de: number; readonly ate: number } | null
}

/**
 * Gera a ponte entre duas ilhas.
 *
 * A ponte é desenhada ao longo de +x, a partir da origem, e quem a posiciona no
 * mundo é o componente. Assim a conta de rotação fica em um lugar só.
 */
export function gerarPonte(opcoes: OpcoesDaPonte): PonteGerada {
  const { comprimento, largura, tabuas, liberada } = opcoes

  if (comprimento <= 0 || largura <= 0) {
    throw new Error('Ponte precisa de comprimento e largura maiores que zero')
  }
  if (tabuas < 2) {
    throw new Error(`Ponte precisa de ao menos 2 tábuas, e veio ${tabuas}`)
  }

  const espacamento = comprimento / tabuas
  const espessura = ESPESSURA_DO_TABULEIRO

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
    const x = indice * espacamento
    pecas.push(
      gerarCaixa({
        largura: espacamento * 0.82,
        altura: espessura,
        profundidade: largura,
        centro: { x: x + espacamento / 2, y: 0, z: 0 },
      }),
    )
  }

  // Postes a cada quatro tábuas, sempre no trecho construído, mais um par em cada
  // beirada do buraco: é o par de postes que diz onde a ponte para.
  const intervaloDePoste = Math.max(3, Math.round(tabuas / 4))
  const ondeTemPoste = new Set<number>([0, tabuas])
  for (let indice = 0; indice <= tabuas; indice += intervaloDePoste) {
    ondeTemPoste.add(indice)
  }
  if (!liberada) {
    ondeTemPoste.add(primeiraQueFalta)
    ondeTemPoste.add(ultimaQueFalta + 1)
  }

  for (const indice of [...ondeTemPoste].sort((um, outro) => um - outro)) {
    const x = Math.min(indice * espacamento, comprimento)
    for (const lado of [-1, 1]) {
      pecas.push(
        gerarCilindro({
          raio: 0.16,
          altura: 2.1,
          lados: 6,
          base: { x, y: 0, z: (lado * largura) / 2 },
        }),
      )
    }
  }

  if (!liberada) {
    // A travessa de parada: uma barra atravessada na beirada de cada toco, na
    // altura do joelho. Sem ela, o toco termina em tábua solta e parece
    // inacabado; com ela, o que se vê é uma ponte **interrompida**.
    const alturaDaTravessa = 0.62
    for (const indice of [primeiraQueFalta, ultimaQueFalta + 1]) {
      const x = Math.min(Math.max(indice * espacamento, 0.11), comprimento - 0.11)
      pecas.push(
        gerarCaixa({
          largura: 0.16,
          altura: 0.14,
          profundidade: largura,
          centro: { x, y: alturaDaTravessa, z: 0 },
        }),
      )
    }
  }

  const estrutura = montar(pecas)

  const vaoAberto = liberada
    ? null
    : { de: primeiraQueFalta * espacamento, ate: (ultimaQueFalta + 1) * espacamento }

  if (!liberada) {
    return { estrutura, corrimao: null, tabuasConstruidas, vaoAberto }
  }

  const barras: Malha[] = []
  const alturaDoCorrimao = 2.0
  for (const lado of [-1, 1]) {
    for (let indice = 0; indice < tabuas - 1; indice += 1) {
      const x = indice * espacamento
      barras.push(
        gerarCaixa({
          largura: espacamento * 1.02,
          altura: 0.14,
          profundidade: 0.14,
          centro: { x: x + espacamento / 2, y: alturaDoCorrimao, z: (lado * largura) / 2 },
        }),
      )
    }
  }

  return { estrutura, corrimao: montar(barras), tabuasConstruidas, vaoAberto: null }
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
