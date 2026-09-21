import {
  deslocarMalha,
  juntarMalhas,
  rotacionarMalha,
  type Malha,
} from './ilha'
import { gerarCaixa, gerarCilindro, montar, type Ponto } from './solidos'
import { NOMES_DOS_MARCOS, type TipoDeMarco } from './identidade'

/**
 * Os marcos das ilhas.
 *
 * Cada ilha tem **uma** construção que só ela tem, e que se reconhece de longe.
 * Sem isso, o arquipélago era a mesma ilha repetida: mesmas medidas, mesmas três
 * estruturas de estudo, mesma cor — e quem entrava no mundo não tinha como saber
 * onde estava sem ler o nome.
 *
 * Três regras deste arquivo:
 *
 *  - **nada de asset de terceiro** (D-014): todo marco sai de caixa, cilindro e
 *    rotação, como o resto do mundo;
 *  - **uma malha por marco** (mais a parte que gira, quando existe), porque cada
 *    objeto extra custa um desenho por quadro num celular modesto;
 *  - **matemática pura**: entra medida de ilha, sai vetor de posições e índices —
 *    testável sem navegador, como a geometria toda.
 *
 * A parte que gira é declarada, e não escondida: o componente da ilha recebe a
 * malha, o eixo e a velocidade. Assim o movimento do mundo continua sendo dado,
 * e não conta feita dentro do desenho.
 */

/** O que uma ilha precisa informar para receber o seu marco. */
export type OpcoesDoMarco = {
  readonly raioDaIlha: number
  readonly alturaDaIlha: number
  readonly semente: number
}

/** A parte animada: onde fica o eixo, para que lado gira e com que pressa. */
export type ParteGiratoria = {
  readonly malha: Malha
  /** Onde fica o eixo, em relação à base do marco. */
  readonly posicao: readonly [number, number, number]
  readonly eixo: 'x' | 'y' | 'z'
  /** Voltas por segundo. O sinal indica o sentido. */
  readonly voltasPorSegundo: number
}

export type MarcoGerado = {
  readonly tipo: TipoDeMarco
  readonly nome: string
  readonly fixo: Malha
  /**
   * As partes animadas. É uma lista porque um marco pode ter mais de uma — o par
   * de engrenagens gira nos dois sentidos, como engrenagem de verdade.
   */
  readonly girantes: readonly ParteGiratoria[]
  /** Altura do ponto mais alto, para quem precisa enquadrar a ilha. */
  readonly alturaTotal: number
  /** Maior distância do centro, no plano. Serve para o marco caber na ilha. */
  readonly raioOcupado: number
}

/** Caixa medida a partir do centro. Atalho para não repetir o mesmo objeto. */
function caixa(
  largura: number,
  altura: number,
  profundidade: number,
  centro: Ponto,
): Malha {
  return gerarCaixa({ largura, altura, profundidade, centro })
}

/** Cilindro em pé, a partir da base. */
function cilindro(raio: number, altura: number, lados: number, base?: Ponto): Malha {
  return gerarCilindro({ raio, altura, lados, base })
}

/**
 * Roda dentada, com o eixo virado para o observador (ao longo de z).
 *
 * Um cilindro é sempre em pé neste projeto; para a roda ficar de frente, ele é
 * girado em torno de x. Os dentes são caixas em volta, cada uma girada no seu
 * ângulo — é a mesma peça reta, repetida em círculo.
 */
function gerarEngrenagem(opcoes: {
  readonly raio: number
  readonly dentes: number
  readonly espessura: number
  readonly larguraDoDente: number
}): Malha {
  const { raio, dentes, espessura, larguraDoDente } = opcoes

  const disco = rotacionarMalha(cilindro(raio, espessura, Math.max(9, dentes * 2)), {
    eixo: 'x',
    angulo: Math.PI / 2,
  })

  const pecas: Malha[] = [disco]
  for (let dente = 0; dente < dentes; dente += 1) {
    const angulo = (dente / dentes) * Math.PI * 2
    const alto = raio + larguraDoDente * 0.8
    const bruto = caixa(larguraDoDente, larguraDoDente * 1.6, espessura, {
      x: 0,
      y: 0,
      z: 0,
    })
    const girado = rotacionarMalha(bruto, { eixo: 'z', angulo })
    pecas.push(
      deslocarMalha(girado, {
        x: Math.cos(angulo) * alto - espessura / 2,
        y: Math.sin(angulo) * alto,
        z: 0,
      }),
    )
  }

  // O eixo onde a roda encaixa.
  pecas.push(
    rotacionarMalha(cilindro(raio * 0.23, espessura * 2.6, 8), { eixo: 'x', angulo: Math.PI / 2 }),
  )

  return montar(pecas)
}

/** Portal de pedra: duas colunas e uma viga. A porta de entrada do percurso. */
function portal(escala: number): MarcoGerado {
  const altura = 3.4 * escala
  const distancia = 1.5 * escala
  const pecas: Malha[] = [
    cilindro(0.34 * escala, altura, 6, { x: -distancia, y: 0, z: 0 }),
    cilindro(0.34 * escala, altura, 6, { x: distancia, y: 0, z: 0 }),
    caixa(2 * distancia + 0.9 * escala, 0.5 * escala, 0.6 * escala, {
      x: 0,
      y: altura + 0.25 * escala,
      z: 0,
    }),
    // Pedra-chave, um pouco acima da viga: é o que faz a silhueta lembrar portão.
    caixa(0.7 * escala, 0.45 * escala, 0.66 * escala, {
      x: 0,
      y: altura + 0.72 * escala,
      z: 0,
    }),
    // Dois degraus, para a porta parecer que se atravessa.
    caixa(3.4 * escala, 0.22 * escala, 1.5 * escala, { x: 0, y: 0.11 * escala, z: 0.5 * escala }),
    caixa(2.6 * escala, 0.22 * escala, 1 * escala, { x: 0, y: 0.33 * escala, z: 0.35 * escala }),
  ]

  return {
    tipo: 'portal',
    nome: NOMES_DOS_MARCOS.portal,
    fixo: montar(pecas),
    girantes: [],
    alturaTotal: altura + 0.95 * escala,
    raioOcupado: 2.3 * escala,
  }
}

/** Bancada de oficina, com o volante girando: onde se experimenta o que se aprende. */
function oficina(escala: number): MarcoGerado {
  const alturaDaBancada = 1.05 * escala
  const largura = 2.6 * escala
  const profundidade = 1.3 * escala
  const alturaDoVolante = alturaDaBancada + 0.95 * escala

  const pecas: Malha[] = [
    caixa(largura, 0.22 * escala, profundidade, {
      x: 0,
      y: alturaDaBancada,
      z: 0,
    }),
    // Pernas
    caixa(0.2 * escala, alturaDaBancada, 0.2 * escala, {
      x: -largura * 0.38,
      y: alturaDaBancada / 2,
      z: 0,
    }),
    caixa(0.2 * escala, alturaDaBancada, 0.2 * escala, {
      x: largura * 0.38,
      y: alturaDaBancada / 2,
      z: 0,
    }),
    // Torno preso na bancada
    caixa(0.8 * escala, 0.5 * escala, 0.6 * escala, {
      x: -largura * 0.22,
      y: alturaDaBancada + 0.36 * escala,
      z: 0,
    }),
    // Poste do volante
    cilindro(0.16 * escala, alturaDoVolante, 6, { x: largura * 0.3, y: 0, z: 0 }),
    // Caixa de ferramentas ao lado
    caixa(0.7 * escala, 0.5 * escala, 0.5 * escala, {
      x: -largura * 0.6,
      y: 0.25 * escala,
      z: 0.9 * escala,
    }),
  ]

  const volante = rotacionarMalha(cilindro(0.85 * escala, 0.22 * escala, 12), {
    eixo: 'x',
    angulo: Math.PI / 2,
  })

  return {
    tipo: 'oficina',
    nome: NOMES_DOS_MARCOS.oficina,
    fixo: montar(pecas),
    girantes: [
      {
        malha: volante,
        posicao: [largura * 0.3, alturaDoVolante, 0],
        eixo: 'z',
        voltasPorSegundo: 0.22,
      },
    ],
    alturaTotal: alturaDoVolante + 0.9 * escala,
    raioOcupado: 1.9 * escala,
  }
}

/** Estante alta: prateleiras empilhadas, a ilha onde o conhecimento fica guardado. */
function estante(escala: number): MarcoGerado {
  const largura = 1.9 * escala
  const profundidade = 0.9 * escala
  const altura = 4.4 * escala
  const prateleiras = 5

  const pecas: Malha[] = [
    caixa(0.26 * escala, altura, profundidade, {
      x: -largura / 2 + 0.13 * escala,
      y: altura / 2,
      z: 0,
    }),
    caixa(0.26 * escala, altura, profundidade, {
      x: largura / 2 - 0.13 * escala,
      y: altura / 2,
      z: 0,
    }),
  ]

  for (let nivel = 0; nivel <= prateleiras; nivel += 1) {
    const y = (altura / prateleiras) * nivel
    pecas.push(
      caixa(largura, 0.14 * escala, profundidade, {
        x: 0,
        y,
        z: 0,
      }),
    )
  }

  // Alguns livros: caixas de alturas diferentes, encostadas de um lado.
  for (let livro = 0; livro < 4; livro += 1) {
    const nivel = 1 + (livro % prateleiras)
    pecas.push(
      caixa(0.24 * escala, 0.62 * escala, profundidade * 0.7, {
        x: -largura * 0.28 + livro * 0.34 * escala,
        y: (altura / prateleiras) * nivel + 0.4 * escala,
        z: 0,
      }),
    )
  }

  return {
    tipo: 'estante',
    nome: NOMES_DOS_MARCOS.estante,
    fixo: montar(pecas),
    girantes: [],
    // O topo é a última prateleira mais a altura de um livro em pé nela.
    alturaTotal: altura + 0.75 * escala,
    raioOcupado: 1.35 * escala,
  }
}

/** Arquivo de gavetas: um armário alto, com três gavetas e puxadores. */
function arquivo(escala: number): MarcoGerado {
  const pecas: Malha[] = []

  const largura = 3.2 * escala
  const profundidade = 1.9 * escala
  const altura = 3.4 * escala

  // O corpo do armário
  pecas.push(caixa(largura, altura, profundidade, { x: 0, y: altura / 2, z: 0 }))

  // Três gavetas na frente, cada uma com o puxador. A frente fica para o lado
  // oposto ao das estruturas de estudo: é o mesmo lugar em toda ilha (ver
  // `LUGARES_NA_ILHA`), então o armário é visto de frente por quem chega.
  for (let gaveta = 0; gaveta < 3; gaveta += 1) {
    const centroDaGaveta = (0.75 + gaveta * 1.05) * escala
    pecas.push(
      caixa(largura * 0.82, 0.82 * escala, 0.18 * escala, {
        x: 0,
        y: centroDaGaveta,
        z: -profundidade / 2 - 0.05 * escala,
      }),
    )

    // Puxador: uma barra deitada no meio da gaveta. O cilindro deste projeto
    // nasce em pé, a partir da base (ver `cilindro`), então ele é deitado com um
    // giro em z: sem isso, o "puxador" vira uma coluna que atravessa as três
    // gavetas e passa por cima do armário — medido em 3,95 de altura onde a peça
    // mais alta é a pasta, em 3,52 (ver D-058).
    //
    // O giro leva a barra para o lado negativo de x (de -1,1 a 0), então o
    // deslocamento de meia barra a traz para o meio da gaveta: medido, a barra
    // fica de -0,55 a +0,55 em x, com 0 de centro.
    const comprimentoDoPuxador = 1.1 * escala
    pecas.push(
      deslocarMalha(
        rotacionarMalha(cilindro(0.07 * escala, comprimentoDoPuxador, 6), {
          eixo: 'z',
          angulo: Math.PI / 2,
        }),
        {
          x: comprimentoDoPuxador / 2,
          y: centroDaGaveta,
          z: -profundidade / 2 - 0.18 * escala,
        },
      ),
    )
  }

  // Uma pasta em cima do armário: é o que se guardou ali.
  pecas.push(
    caixa(1.5 * escala, 0.12 * escala, 1.1 * escala, {
      x: -0.5 * escala,
      y: altura + 0.06 * escala,
      z: 0.1 * escala,
    }),
  )

  return {
    tipo: 'arquivo',
    nome: NOMES_DOS_MARCOS.arquivo,
    fixo: montar(pecas),
    girantes: [],
    alturaTotal: altura + 0.12 * escala,
    raioOcupado: 1.9 * escala,
  }
}

/** Balança de dois pratos: o que está previsto de um lado, o que veio do outro. */
function balanca(escala: number): MarcoGerado {
  const pecas: Malha[] = []

  const alturaDoFulcro = 2.6 * escala
  const larguraDaTravessa = 3.6 * escala

  // Base e coluna. A coluna começa em cima da base e vai até o fulcro: como o
  // cilindro nasce na base, o comprimento é a diferença, e não a altura do
  // fulcro — com o comprimento errado, a coluna passava da travessa e a peça
  // ficava 0,34 mais alta do que dizia (medido antes do conserto; ver D-058).
  const alturaDaBase = 0.34 * escala
  pecas.push(caixa(2.4 * escala, alturaDaBase, 1.5 * escala, { x: 0, y: alturaDaBase / 2, z: 0 }))
  pecas.push(cilindro(0.13 * escala, alturaDoFulcro - alturaDaBase, 8, { x: 0, y: alturaDaBase, z: 0 }))

  // A travessa, torta de propósito: um prato está mais baixo que o outro, e a
  // balança está no meio da conferência — é o desenho de comparar duas coisas.
  const inclinacao = 0.16
  const travessa = rotacionarMalha(
    caixa(larguraDaTravessa, 0.16 * escala, 0.16 * escala, { x: 0, y: 0, z: 0 }),
    { eixo: 'z', angulo: -inclinacao },
  )
  pecas.push(deslocarMalha(travessa, { x: 0, y: alturaDoFulcro, z: 0 }))

  // Um prato em cada ponta, pendurado por dois fios.
  const alturaDoPrato = (lado: -1 | 1): number =>
    alturaDoFulcro - Math.tan(inclinacao) * lado * (larguraDaTravessa / 2) + 0.1 * escala

  for (const lado of [-1, 1] as const) {
    const x = (lado * larguraDaTravessa) / 2 - lado * 0.35 * escala
    const y = alturaDoPrato(lado)

    for (const deslocamento of [-0.42, 0.42]) {
      pecas.push(
        cilindro(0.035 * escala, 0.9 * escala, 5, {
          x: x + deslocamento * escala,
          y: y - 0.9 * escala,
          z: 0,
        }),
      )
    }

    pecas.push(caixa(1.15 * escala, 0.1 * escala, 1.15 * escala, { x, y, z: 0 }))
    // A borda do prato, para ele não parecer uma tábua.
    pecas.push(caixa(1.15 * escala, 0.22 * escala, 0.08 * escala, { x, y: y + 0.11 * escala, z: -0.54 * escala }))
    pecas.push(caixa(1.15 * escala, 0.22 * escala, 0.08 * escala, { x, y: y + 0.11 * escala, z: 0.54 * escala }))
  }

  // No prato mais **baixo**, o peso que decidiu a conferência. O lado +1 é o que
  // desce: `alturaDoPrato` soma a inclinação com o sinal trocado, e o peso estava
  // do lado que sobe — a balança contava a história ao contrário.
  const ladoDoPeso = 1 as const
  pecas.push(
    caixa(0.5 * escala, 0.5 * escala, 0.5 * escala, {
      x: (ladoDoPeso * larguraDaTravessa) / 2 - ladoDoPeso * 0.35 * escala,
      y: alturaDoPrato(ladoDoPeso) + 0.3 * escala,
      z: 0,
    }),
  )

  // A peça mais alta é a borda do prato que subiu (o outro prato desceu, e o peso
  // foi com ele): a altura declarada sai daí, mais a mesma folga de 0,01 das
  // outras peças. Antes do conserto a peça media 3,54 de altura e dizia 2,76.
  const alturaTotal =
    Math.max(
      alturaDoFulcro,
      alturaDoPrato(-1) + 0.22 * escala,
      alturaDoPrato(ladoDoPeso) + 0.55 * escala,
    ) +
    0.01 * escala

  return {
    tipo: 'balanca',
    nome: NOMES_DOS_MARCOS.balanca,
    fixo: montar(pecas),
    girantes: [],
    alturaTotal,
    // Medido: o prato da ponta da travessa é a peça que mais se afasta do centro,
    // em 2,1064 de raio para cada unidade de escala. Declarado 1,95 antes do
    // conserto — para baixo, que é o lado perigoso: o marco encosta na borda do
    // capim e o teste de encaixe não teria como perceber (ver D-058).
    raioOcupado: 2.11 * escala,
  }
}

/** Barracas do mercado: três tendas com balcão. */
function mercado(escala: number): MarcoGerado {
  const pecas: Malha[] = []
  const alturaDaTenda = 2.1 * escala

  const lugares: readonly (readonly [number, number])[] = [
    [-2 * escala, 0.6 * escala],
    [2 * escala, 0.6 * escala],
    [0, -1.9 * escala],
  ]

  for (const [x, z] of lugares) {
    const lado = 1.7 * escala
    // Quatro postes
    for (const deslocamentoX of [-lado / 2, lado / 2]) {
      for (const deslocamentoZ of [-lado / 2, lado / 2]) {
        pecas.push(
          cilindro(0.1 * escala, alturaDaTenda, 5, {
            x: x + deslocamentoX,
            y: 0,
            z: z + deslocamentoZ,
          }),
        )
      }
    }
    // Toldo
    pecas.push(
      caixa(lado * 1.35, 0.22 * escala, lado * 1.35, {
        x,
        y: alturaDaTenda + 0.11 * escala,
        z,
      }),
    )
    // Balcão
    pecas.push(
      caixa(lado, 0.8 * escala, lado * 0.45, {
        x,
        y: 0.4 * escala,
        z: z + lado * 0.42,
      }),
    )
  }

  return {
    tipo: 'mercado',
    nome: NOMES_DOS_MARCOS.mercado,
    fixo: montar(pecas),
    girantes: [],
    alturaTotal: alturaDaTenda + 0.24 * escala,
    raioOcupado: 3 * escala,
  }
}

/** Moinho de pás: corpo redondo e quatro pás girando. */
function moinho(escala: number): MarcoGerado {
  const alturaDoCorpo = 3.1 * escala
  const alturaDoEixo = alturaDoCorpo * 0.82
  const comprimentoDaPa = 3.4 * escala

  const pecas: Malha[] = [
    cilindro(1.15 * escala, alturaDoCorpo, 8, { x: 0, y: 0, z: 0 }),
    // Cúpula
    cilindro(1.35 * escala, 0.4 * escala, 8, { x: 0, y: alturaDoCorpo, z: 0 }),
    // Porta, virada para quem chega
    caixa(0.7 * escala, 1.1 * escala, 0.2 * escala, {
      x: 0,
      y: 0.55 * escala,
      z: -1.15 * escala,
    }),
    // Eixo que atravessa e sustenta as pás
    rotacionarMalha(cilindro(0.16 * escala, 1.4 * escala, 6), { eixo: 'x', angulo: Math.PI / 2 }),
  ]

  // Cruz de pás, montada em volta da origem para girar no próprio centro.
  const paHorizontal = caixa(comprimentoDaPa, 0.3 * escala, 0.14 * escala, { x: 0, y: 0, z: 0 })
  const paVertical = caixa(0.3 * escala, comprimentoDaPa, 0.14 * escala, { x: 0, y: 0, z: 0 })
  const pas = montar([paHorizontal, paVertical])

  return {
    tipo: 'moinho',
    nome: NOMES_DOS_MARCOS.moinho,
    fixo: montar(pecas),
    girantes: [
      {
        malha: pas,
        posicao: [0, alturaDoEixo, -0.7 * escala],
        eixo: 'z',
        voltasPorSegundo: 0.16,
      },
    ],
    // As pás passam da cúpula: é a ponta delas que define o alto do moinho.
    alturaTotal: alturaDoEixo + comprimentoDaPa / 2,
    raioOcupado: comprimentoDaPa / 2 + 0.3 * escala,
  }
}

/** Placas da encruzilhada: um poste, três direções, e um cata-vento no alto. */
function encruzilhada(escala: number): MarcoGerado {
  const alturaDoPoste = 3.3 * escala

  const pecas: Malha[] = [
    cilindro(0.18 * escala, alturaDoPoste, 6, { x: 0, y: 0, z: 0 }),
    // Base de pedra
    cilindro(0.6 * escala, 0.28 * escala, 6, { x: 0, y: 0, z: 0 }),
  ]

  const direcoes = [0.2, -0.9, 2.2]
  direcoes.forEach((angulo, indice) => {
    const y = alturaDoPoste * (0.55 + indice * 0.13)
    const placa = caixa(1.5 * escala, 0.44 * escala, 0.12 * escala, {
      x: 0.75 * escala,
      y: 0,
      z: 0,
    })
    const girada = rotacionarMalha(placa, { eixo: 'y', angulo })
    pecas.push(
      deslocarMalha(girada, { x: Math.cos(angulo) * -0.2 * escala, y, z: Math.sin(angulo) * 0.2 * escala }),
    )
  })

  // Cata-vento: seta e cauda, em volta da origem para girar no eixo.
  const catavento = montar([
    caixa(1.9 * escala, 0.12 * escala, 0.1 * escala, { x: 0, y: 0, z: 0 }),
    caixa(0.5 * escala, 0.55 * escala, 0.1 * escala, { x: -1.1 * escala, y: 0, z: 0 }),
  ])

  return {
    tipo: 'encruzilhada',
    nome: NOMES_DOS_MARCOS.encruzilhada,
    fixo: montar(pecas),
    girantes: [
      {
        malha: catavento,
        posicao: [0, alturaDoPoste + 0.25 * escala, 0],
        eixo: 'y',
        voltasPorSegundo: 0.09,
      },
    ],
    // O cata-vento soma a altura da própria cauda acima do poste.
    alturaTotal: alturaDoPoste + 0.6 * escala,
    raioOcupado: 1.1 * escala,
  }
}

/** Farol alto: torre listrada e um feixe de luz girando no alto. */
function farol(escala: number): MarcoGerado {
  const alturas = [1.5, 1.4, 1.3, 1.2]
  const pecas: Malha[] = []
  let y = 0
  alturas.forEach((altura, indice) => {
    const raio = (1.25 - indice * 0.14) * escala
    pecas.push(cilindro(raio, altura * escala, 8, { x: 0, y, z: 0 }))
    y += altura * escala
  })

  const alturaDaTorre = y
  pecas.push(cilindro(1.05 * escala, 1 * escala, 8, { x: 0, y: alturaDaTorre, z: 0 }))
  pecas.push(
    caixa(1.5 * escala, 0.3 * escala, 1.5 * escala, {
      x: 0,
      y: alturaDaTorre + 1.15 * escala,
      z: 0,
    }),
  )
  // Porta
  pecas.push(
    caixa(0.6 * escala, 1 * escala, 0.2 * escala, { x: 0, y: 0.5 * escala, z: -1.25 * escala }),
  )

  // Feixe: uma barra comprida presa no eixo do alto da torre.
  const feixe = caixa(3.2 * escala, 0.16 * escala, 0.5 * escala, {
    x: 1.6 * escala,
    y: 0,
    z: 0,
  })

  return {
    tipo: 'farol',
    nome: NOMES_DOS_MARCOS.farol,
    fixo: montar(pecas),
    girantes: [
      {
        malha: feixe,
        posicao: [0, alturaDaTorre + 0.5 * escala, 0],
        eixo: 'y',
        voltasPorSegundo: 0.3,
      },
    ],
    alturaTotal: alturaDaTorre + 1.3 * escala,
    raioOcupado: 2.1 * escala,
  }
}

/** Estação de perguntas: plataforma com degraus, painel e ponteiro. */
function estacao(escala: number): MarcoGerado {
  const alturaDaPlataforma = 1.1 * escala
  const largura = 3.6 * escala
  const profundidade = 2.4 * escala

  const pecas: Malha[] = [
    caixa(largura, 0.3 * escala, profundidade, { x: 0, y: alturaDaPlataforma, z: 0 }),
  ]

  for (const x of [-largura * 0.38, largura * 0.38]) {
    for (const z of [-profundidade * 0.36, profundidade * 0.36]) {
      pecas.push(
        caixa(0.22 * escala, alturaDaPlataforma, 0.22 * escala, {
          x,
          y: alturaDaPlataforma / 2,
          z,
        }),
      )
    }
  }

  // Três degraus na frente
  for (let degrau = 0; degrau < 3; degrau += 1) {
    pecas.push(
      caixa(1.4 * escala, 0.2 * escala, 0.5 * escala, {
        x: 0,
        y: alturaDaPlataforma - (degrau + 1) * 0.28 * escala + 0.1 * escala,
        z: profundidade / 2 + 0.25 * escala + degrau * 0.5 * escala,
      }),
    )
  }

  // Painel grande, em pé, virado para quem chega
  pecas.push(
    caixa(1.6 * escala, 1.5 * escala, 0.18 * escala, {
      x: 0,
      y: alturaDaPlataforma + 0.9 * escala,
      z: -profundidade * 0.3,
    }),
  )
  pecas.push(
    caixa(0.16 * escala, 1.4 * escala, 0.16 * escala, {
      x: 0,
      y: alturaDaPlataforma + 0.4 * escala,
      z: -profundidade * 0.3,
    }),
  )

  // Ponteiro em cima do painel, girando devagar: o tempo da estação.
  const ponteiro = caixa(1.2 * escala, 0.12 * escala, 0.12 * escala, { x: 0.6 * escala, y: 0, z: 0 })

  return {
    tipo: 'estacao',
    nome: NOMES_DOS_MARCOS.estacao,
    fixo: montar(pecas),
    girantes: [
      {
        malha: ponteiro,
        posicao: [0, alturaDaPlataforma + 1.8 * escala, -profundidade * 0.3],
        eixo: 'y',
        voltasPorSegundo: 0.05,
      },
    ],
    alturaTotal: alturaDaPlataforma + 1.9 * escala,
    raioOcupado: 2.6 * escala,
  }
}

/** Par de engrenagens: a imagem do que uma função faz com o resultado da outra. */
function engrenagens(escala: number): MarcoGerado {
  const raioDaGrande = 1.5 * escala
  const raioDaPequena = 0.85 * escala
  const alturaDoEixo = 1.7 * escala

  const pecas: Malha[] = [
    // Chassi de pedra, onde os dois eixos se apoiam
    caixa(4.2 * escala, 0.4 * escala, 1.4 * escala, { x: 0, y: 0.2 * escala, z: 0 }),
    caixa(0.4 * escala, alturaDoEixo, 0.4 * escala, {
      x: -1.9 * escala,
      y: alturaDoEixo / 2,
      z: 0,
    }),
    caixa(0.4 * escala, alturaDoEixo, 0.4 * escala, {
      x: 2.2 * escala,
      y: alturaDoEixo / 2,
      z: 0,
    }),
  ]

  // As duas rodas ficam com os dentes encostados: a distância entre os centros é
  // a soma dos raios, e a pequena gira mais rápido e ao contrário — como acontece
  // com engrenagem de verdade, onde a roda menor dá mais voltas.
  const distanciaEntreEixos = raioDaGrande + raioDaPequena
  const voltasDaGrande = 0.12

  return {
    tipo: 'engrenagens',
    nome: NOMES_DOS_MARCOS.engrenagens,
    fixo: montar(pecas),
    girantes: [
      {
        malha: gerarEngrenagem({
          raio: raioDaGrande,
          dentes: 12,
          espessura: 0.28 * escala,
          larguraDoDente: 0.3 * escala,
        }),
        posicao: [-distanciaEntreEixos / 2, alturaDoEixo, 0],
        eixo: 'z',
        voltasPorSegundo: voltasDaGrande,
      },
      {
        malha: gerarEngrenagem({
          raio: raioDaPequena,
          dentes: 7,
          espessura: 0.28 * escala,
          larguraDoDente: 0.24 * escala,
        }),
        posicao: [distanciaEntreEixos / 2, alturaDoEixo, 0],
        eixo: 'z',
        voltasPorSegundo: -voltasDaGrande * (raioDaGrande / raioDaPequena),
      },
    ],
    // Os dentes passam do disco: o alto da roda é o raio mais o dente inteiro.
    alturaTotal: alturaDoEixo + raioDaGrande + 1.6 * 0.3 * escala,
    raioOcupado: distanciaEntreEixos / 2 + raioDaGrande + 0.3 * escala,
  }
}

/** Torre de anéis: a mais alta do arquipélago, com bandeira no topo. */
function torre(escala: number): MarcoGerado {
  const aneis = 5
  const pecas: Malha[] = []
  let y = 0
  for (let anel = 0; anel < aneis; anel += 1) {
    const raio = (1.5 - anel * 0.22) * escala
    const altura = (1.05 + anel * 0.06) * escala
    pecas.push(cilindro(raio, altura, 9 - anel, { x: 0, y, z: 0 }))
    y += altura
  }

  // Sacada no alto e mastro
  pecas.push(cilindro(1.05 * escala, 0.22 * escala, 9, { x: 0, y, z: 0 }))
  pecas.push(cilindro(0.09 * escala, 1.1 * escala, 5, { x: 0, y: y + 0.22 * escala, z: 0 }))

  const alturaDoMastro = y + 1.32 * escala

  // Bandeira: pano preso no mastro, em volta da origem para girar no eixo.
  const bandeira = montar([
    caixa(1.15 * escala, 0.62 * escala, 0.06 * escala, { x: 0.66 * escala, y: 0, z: 0 }),
  ])

  return {
    tipo: 'torre',
    nome: NOMES_DOS_MARCOS.torre,
    fixo: montar(pecas),
    girantes: [
      {
        malha: bandeira,
        posicao: [0, alturaDoMastro - 0.4 * escala, 0],
        eixo: 'y',
        voltasPorSegundo: 0.06,
      },
    ],
    alturaTotal: alturaDoMastro,
    raioOcupado: 1.6 * escala,
  }
}

/**
 * Gera o marco de uma ilha.
 *
 * A escala sai do raio da ilha: uma ilha grande recebe um marco grande, e o
 * marco nunca fica maior que o capim onde ele fica em pé — o que o teste
 * `marcos.test.ts` confere para as dez ilhas do percurso.
 */
export function gerarMarco(tipo: TipoDeMarco, opcoes: OpcoesDoMarco): MarcoGerado {
  // `6` é o raio nominal do projeto (ver `RAIO_DA_ILHA` em `mapaDoMundo.ts`):
  // a escala 1 é o mundo que já existia antes de as ilhas ficarem diferentes.
  const escala = opcoes.raioDaIlha / 6
  const marcos: Readonly<Record<TipoDeMarco, (escala: number) => MarcoGerado>> = {
    portal,
    oficina,
    estante,
    mercado,
    moinho,
    encruzilhada,
    farol,
    estacao,
    engrenagens,
    torre,
    arquivo,
    balanca,
  }

  const gerado = marcos[tipo](escala)

  // A semente fica na assinatura do parâmetro por causa da interface: quando um
  // marco precisar variar de ilha para ilha sem mudar de tipo, é daqui que sai o
  // sorteio — e ele já chega determinístico.
  void opcoes.semente

  return gerado
}

/** Junta o marco com a parte giratória, para quem só quer a malha inteira. */
export function malhaInteira(marco: MarcoGerado): Malha {
  return marco.girantes.reduce(
    (junta, parte) =>
      juntarMalhas(
        junta,
        deslocarMalha(parte.malha, {
          x: parte.posicao[0],
          y: parte.posicao[1],
          z: parte.posicao[2],
        }),
      ),
    marco.fixo,
  )
}
