import { criarSorteador, entre } from './aleatorio'
import { UNIDADES_POR_TEXTURA } from './texturas'

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
  /**
   * Coordenadas de textura em sequência u, v — uma por vértice.
   *
   * Opcional, e medidas em **unidades do mundo** (uma repetição da textura a cada
   * `UNIDADES_POR_TEXTURA`), e não de 0 a 1 por face: assim a pedra tem a mesma
   * textura na ilha grande e na pequena, e a emenda entre duas peças não aparece.
   * Ver `texturas.ts` (D-064).
   */
  readonly uvs?: readonly number[]
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
  /**
   * Abertura do perfil. `1.7` é o padrão da primeira ilha; menor deixa a pedra
   * mais cheia embaixo (ilha atarracada), maior afina rápido (ilha em agulha).
   * É o número que faz duas ilhas da mesma altura parecerem diferentes.
   */
  readonly expoenteDoPerfil?: number
  /**
   * Raio da ponta da pedra, **como fração do raio do topo** (0,02 padrão).
   *
   * 0,02 é um espinho; 0,35 é um toco rombudo. É o que mais muda a silhueta vista
   * de longe, porque a ponta é a única parte da ilha que aparece sozinha contra o
   * céu. Ver `FAMILIAS_DE_PONTA`, em `identidade.ts`.
   */
  readonly pontaDoPerfil?: number
  /**
   * Quanto a pedra **engrossa** no meio do caminho, antes de afinar na ponta.
   *
   * 0 é a curva seca de antes; 0,3 abre a massa em cerca de um terço. É o número
   * que tira a cara de cone (ver `perfilDeRaio` e D-064).
   */
  readonly barriga?: number
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
export function perfilDeRaio(
  t: number,
  expoente: number = EXPOENTE_DO_PERFIL,
  barriga: number = 0,
): number {
  const profundidade = Math.min(Math.max(t, 0), 1)
  const corpo = (1 - profundidade) ** expoente
  // A barriga: a pedra se abre um pouco abaixo do capim e volta a fechar na
  // direção da ponta. Sem ela o perfil é uma curva monótona, e a captura de tela
  // de 21/09/2026 mostrou como isso lê de longe — "cones inferiores". Com a
  // barriga, o que se vê é uma massa presa por baixo, que é o que uma ilha
  // suspensa deveria parecer. O peso vai a zero na ponta, para a barriga não
  // desfazer a família de ponta da ilha (D-057).
  return corpo * (1 + barriga * Math.sin(Math.PI * Math.min(profundidade * 2, 1)))
}

/** Expoente do perfil da primeira ilha. Cada ilha pode trazer o seu. */
export const EXPOENTE_DO_PERFIL = 1.7

/**
 * A ponta padrão da pedra: quanto do raio do topo sobra na última faixa.
 *
 * 2% é um espinho — a forma que **todas** as dez ilhas tinham, e que fazia a
 * fileira de ilhas parecer a mesma ilha repetida: de longe, dez bicos afiados
 * iguais. Cada ilha agora traz a própria ponta na identidade; este número ficou
 * como o padrão de quem chamar a geometria sem dizer nada.
 */
export const PONTA_PADRAO = 0.02

/**
 * Gera a malha da rocha: anéis empilhados, fechados em uma ponta embaixo.
 *
 * O topo é aberto de propósito — quem o fecha é o disco de capim, encaixado
 * exatamente no mesmo raio, o que evita faces internas invisíveis.
 */
export type MalhaDaRocha = Malha & {
  /**
   * Irregularidade de cada coluna da **borda do topo**, na ordem das colunas.
   *
   * Quem fecha a ilha por cima é o capim, e ele precisa desta lista para não
   * ficar mais estreito que a pedra em nenhuma direção: com duas irregularidades
   * sorteadas de forma independente, a pedra aparecia por fora do capim em cerca
   * de metade das direções — e o topo da ilha virava uma borda cinza em volta de
   * manchas verdes. Ver `bordaMinima` em `gerarTopo` e a decisão D-055.
   */
  readonly bordaDoTopo: readonly number[]
}

export function gerarRocha(opcoes: OpcoesDaRocha = ROCHA_PADRAO): MalhaDaRocha {
  const { segmentosRadiais, aneis, semente, raioDoTopo, altura, amplitude } = opcoes
  const barriga = opcoes.barriga ?? 0
  const expoenteDoPerfil = opcoes.expoenteDoPerfil ?? EXPOENTE_DO_PERFIL

  if (segmentosRadiais < 3) {
    throw new Error(`São necessários ao menos 3 segmentos radiais, e veio ${segmentosRadiais}`)
  }
  if (aneis < 1) {
    throw new Error(`São necessários ao menos 1 anel, e veio ${aneis}`)
  }

  const sortear = criarSorteador(semente)
  const posicoes: number[] = []
  const indices: number[] = []
  const uvs: number[] = []

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

  // O raio da última faixa — a ponta da pedra — é a **borda de baixo** da ilha, e
  // ela é de cada ilha: umas terminam em espinho, outras em toco rombudo. Duas
  // restrições em qualquer caso: o raio nunca chega a zero (um anel de raio zero
  // são vários vértices no mesmo ponto, triângulos sem área que não desenham nada
  // e ainda confundem a conta de normal), e quem escolhe o valor é a identidade da
  // ilha (ver `pontaDoPerfil` em `identidade.ts` e a decisão D-057).
  const raioMinimo = raioDoTopo * (opcoes.pontaDoPerfil ?? PONTA_PADRAO)

  for (let anel = 0; anel <= aneis; anel += 1) {
    const t = anel / aneis
    const raioDoAnel = Math.max(
      raioDoTopo * perfilDeRaio(t, expoenteDoPerfil, barriga),
      raioMinimo,
    )
    const y = -altura * t

    for (let coluna = 0; coluna <= segmentosRadiais; coluna += 1) {
      const angulo = (coluna / segmentosRadiais) * Math.PI * 2
      // O tremor vertical acompanha o raio local: pedra real não afina reto, mas
      // também não se dobra. Tremor de tamanho fixo na ponta faria a malha se
      // cruzar, e as faces cruzadas apareceriam viradas para dentro.
      // O **anel do topo** não tem tremor vertical: é o plano em que o capim se
      // apoia. Com o tremor simétrico, os bicos da pedra subiam acima do capim
      // (até 0,72 de altura, medido na ilha 1) e apareciam como manchas cinzas no
      // meio do verde; a irregularidade que importa no topo é a da **borda**, que
      // vai em `bordaDoTopo`.
      //
      // A primeira tentativa foi manter o tremor, só que descendente. O teste de
      // orientação reprovou: uma coluna descendo 0,6 ao lado de outra no zero
      // torcia a primeira faixa da parede, e uma face virava para dentro do eixo.
      // Tremor zero não tem esse risco.
      // O tremor entra com um **degrau de entrada**: zero no topo e cheio só no
      // terceiro anel. Com 12 a 16 anéis (D-064), o anel logo abaixo do topo está
      // a menos de meia unidade dele, e o tremor cheio ali fazia a pedra passar
      // do plano do capim (medido: 0,032 acima) — a pedra aparecia como mancha
      // cinza no meio do verde. O degrau deixa a parede começar lisa e abrir o
      // relevo um pouco abaixo, que é onde ele se vê.
      const entrada = Math.min(1, (anel / aneis) * 3)
      const tremor =
        anel === 0 ? 0 : Math.sin(angulo * 3 + semente) * amplitude * 0.55 * raioDoAnel * entrada
      const raio = raioDoAnel * (relevo[coluna] ?? 1)

      posicoes.push(Math.cos(angulo) * raio, y + tremor, Math.sin(angulo) * raio)
      // A textura da pedra anda pelo **arco**, e não pelo ângulo: assim ela não
      // estica quando o raio muda, e a pedra grande não fica com a textura
      // esticada em relação à pequena (D-064).
      uvs.push((angulo * raioDoTopo) / UNIDADES_POR_TEXTURA, (y + tremor) / UNIDADES_POR_TEXTURA)
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

  return { posicoes, indices, uvs, bordaDoTopo: relevo }
}

export type OpcoesDoTopo = {
  readonly segmentosRadiais: number
  readonly aneis: number
  readonly semente: number
  readonly raio: number
  /** Irregularidade da borda, como no topo da rocha. */
  readonly amplitude: number
  /** Quanto o capim sobe do centro até a borda. Ver `alturaDoTopo`. */
  readonly inclinacao?: number
  /**
   * Irregularidade mínima da borda, coluna a coluna.
   *
   * Quem fecha a ilha por cima é o capim, e a pedra está logo abaixo dele: se a
   * borda do capim ficar mais estreita que a da pedra em alguma direção, a
   * rocha aparece por fora — foi assim que o topo das ilhas virou uma moldura
   * cinza. Com esta lista, a borda do capim é o **maior** entre o sorteio dele e
   * o da pedra, coluna a coluna. Ver D-055.
   */
  readonly bordaMinima?: readonly number[]
}

/**
 * Quanto o capim sobe do centro até a borda, por unidade de raio.
 *
 * O topo da ilha é um domo suave: o centro é o ponto baixo e a borda é a mais
 * alta. O número importa para quem anda: é a altura em que os pés do avatar
 * ficam e é onde a ponte precisa encostar. Por isso ele mora aqui, numa função
 * só — a geometria e o chão caminhável leem a mesma conta.
 */
export const INCLINACAO_DO_TOPO = 0.06

/** Altura do capim a uma distância do centro da ilha. Fora do raio, fica na borda. */
export function alturaDoTopo(
  raio: number,
  distanciaDoCentro: number,
  inclinacao: number = INCLINACAO_DO_TOPO,
): number {
  const t = Math.min(Math.max(distanciaDoCentro / raio, 0), 1)
  return t * t * raio * inclinacao
}

/**
 * Os fatores da borda do capim, coluna a coluna.
 *
 * É esta lista que faz a borda do topo não ser um círculo perfeito — e é ela que
 * posiciona o último anel do capim. Está separada de `gerarTopo` porque quem
 * precisa **encostar** na ilha tem de ler a mesma lista: a ponte ancorada no
 * raio nominal ficava no ar onde a borda recuava, e entrava no capim onde a
 * borda avançava (ver D-063). A semente e a ordem dos sorteios são as de
 * `gerarTopo`, e não podem mudar: mudar aqui move a borda de todas as ilhas.
 */
export function fatoresDaBorda(opcoes: OpcoesDoTopo): number[] {
  const { segmentosRadiais, semente, amplitude, bordaMinima } = opcoes
  const sortear = criarSorteador(semente + 7919)

  const borda: number[] = []
  for (let coluna = 0; coluna <= segmentosRadiais; coluna += 1) {
    borda.push(
      coluna === segmentosRadiais ? (borda[0] ?? 1) : entre(sortear, 1 - amplitude, 1 + amplitude),
    )
  }

  // O capim é o teto da ilha: ele nunca é mais estreito que a pedra embaixo dele.
  if (bordaMinima !== undefined) {
    for (let coluna = 0; coluna <= segmentosRadiais; coluna += 1) {
      borda[coluna] = Math.max(borda[coluna] ?? 1, bordaMinima[coluna] ?? 1)
    }
  }

  return borda
}

/**
 * Onde a borda do capim está, em uma direção qualquer.
 *
 * A borda do topo é um **polígono**, e não um círculo: os vértices ficam nas
 * colunas, com o fator sorteado, e entre duas colunas a borda é a reta que liga
 * um vértice ao outro. Daí as duas medidas:
 *
 *  - `externo` é o maior dos dois fatores vizinhos: nenhum ponto da ilha passa
 *    disso, e é o limite que a ponte **não** pode ultrapassar;
 *  - `interno` é o menor deles encolhido pelo cosseno do meio-ângulo: essa é a
 *    altura da corda no meio do vão, e um ponto até aqui está **dentro** da
 *    borda em qualquer coluna.
 *
 * Quem precisa garantir contato (a ponte) ancora no `interno`. Quem quer medir
 * a ilha inteira usa o `externo`.
 */
export function bordaDoTopoEmDirecao(opcoes: {
  readonly raio: number
  readonly segmentosRadiais: number
  readonly fatores: readonly number[]
  readonly angulo: number
}): { readonly externo: number; readonly interno: number } {
  const { raio, segmentosRadiais, fatores, angulo } = opcoes
  const voltas = angulo / (Math.PI * 2)
  const dentroDaVolta = ((voltas % 1) + 1) % 1
  const primeira = Math.floor(dentroDaVolta * segmentosRadiais)
  const fatorA = fatores[primeira % segmentosRadiais] ?? 1
  const fatorB = fatores[(primeira + 1) % segmentosRadiais] ?? 1

  return {
    externo: raio * Math.max(fatorA, fatorB),
    // A corda entre dois vértices de raios diferentes: o ponto mais fundo dela
    // está a `min × cos(meio-ângulo)` do centro, e é por isso que o cosseno
    // aparece aqui — sem ele, a conta prometeria contato que a malha não tem.
    interno: raio * Math.min(fatorA, fatorB) * Math.cos(Math.PI / segmentosRadiais),
  }
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
  const { segmentosRadiais, aneis, raio } = opcoes
  const inclinacao = opcoes.inclinacao ?? INCLINACAO_DO_TOPO

  if (segmentosRadiais < 3) {
    throw new Error(`São necessários ao menos 3 segmentos radiais, e veio ${segmentosRadiais}`)
  }
  if (aneis < 1) {
    throw new Error(`São necessários ao menos 1 anel, e veio ${aneis}`)
  }

  const posicoes: number[] = []
  const indices: number[] = []
  const uvs: number[] = []

  const borda = fatoresDaBorda(opcoes)

  // Centro. Ele também precisa de coordenada de textura: sem ela, o vetor de
  // `uvs` ficava com **um a menos** que o de vértices, e a textura da grama
  // chegava deslocada em todos os vértices seguintes — o tipo de defeito que não
  // aparece no código e aparece na tela como listras tortas (achado pelo teste de
  // textura, D-064).
  posicoes.push(0, 0, 0)
  uvs.push(0, 0)

  for (let anel = 1; anel <= aneis; anel += 1) {
    const t = anel / aneis
    const raioDoAnel = raio * t
    // A mesma fórmula que o chão caminhável usa — ver `alturaDoTopo`.
    const y = alturaDoTopo(raio, raioDoAnel, inclinacao)

    for (let coluna = 0; coluna <= segmentosRadiais; coluna += 1) {
      const angulo = (coluna / segmentosRadiais) * Math.PI * 2
      const fator = anel === aneis ? (borda[coluna] ?? 1) : 1
      const r = raioDoAnel * fator

      posicoes.push(Math.cos(angulo) * r, y, Math.sin(angulo) * r)
      // O capim recebe a textura **de cima** (x por z): é uma superfície quase
      // plana, e a grama vista de cima é o que se espera ver.
      uvs.push(
        (Math.cos(angulo) * r) / UNIDADES_POR_TEXTURA,
        (Math.sin(angulo) * r) / UNIDADES_POR_TEXTURA,
      )
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

  return { posicoes, indices, uvs }
}

/**
 * Gira a malha em torno de um eixo que passa pela origem.
 *
 * Usada para montar peça torta a partir de peça reta: dente de engrenagem,
 * pá de moinho, placa apontando para o lado. Rotação não inverte o sentido das
 * faces, então uma malha conferida como "para fora" continua correta depois de
 * girada — e `orientacao.test.ts` cobra isso.
 */
export function rotacionarMalha(
  malha: Malha,
  giro: { readonly eixo: 'x' | 'y' | 'z'; readonly angulo: number },
): Malha {
  const cosseno = Math.cos(giro.angulo)
  const seno = Math.sin(giro.angulo)
  const posicoes: number[] = []

  for (let indice = 0; indice < malha.posicoes.length; indice += 3) {
    const x = malha.posicoes[indice] ?? 0
    const y = malha.posicoes[indice + 1] ?? 0
    const z = malha.posicoes[indice + 2] ?? 0

    if (giro.eixo === 'x') {
      posicoes.push(x, y * cosseno - z * seno, y * seno + z * cosseno)
    } else if (giro.eixo === 'y') {
      posicoes.push(x * cosseno + z * seno, y, -x * seno + z * cosseno)
    } else {
      posicoes.push(x * cosseno - y * seno, x * seno + y * cosseno, z)
    }
  }

  return { posicoes, indices: malha.indices, uvs: malha.uvs }
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
  return { posicoes, indices: malha.indices, uvs: malha.uvs }
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
    uvs: juntarUvs(primeira, segunda),
  }
}

/**
 * As coordenadas de textura de duas malhas, com zeros onde faltar.
 *
 * O que não pode acontecer é o atributo existir com o número de vértices errado —
 * o Three.js desenha isso como textura esticada, e o defeito só aparece na tela.
 */
function juntarUvs(primeira: Malha, segunda: Malha): readonly number[] | undefined {
  if (primeira.uvs === undefined && segunda.uvs === undefined) {
    return undefined
  }
  const verticesDaPrimeira = primeira.posicoes.length / 3
  const verticesDaSegunda = segunda.posicoes.length / 3
  const doPrimeiro = primeira.uvs ?? new Array<number>(verticesDaPrimeira * 2).fill(0)
  const doSegundo = segunda.uvs ?? new Array<number>(verticesDaSegunda * 2).fill(0)
  return [...doPrimeiro, ...doSegundo]
}
