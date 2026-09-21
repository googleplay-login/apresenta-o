import type { Cor3D } from '../../world/geometria/pintura'
import { ajustar, misturar } from '../../world/geometria/pintura'
import { cores, coresDeEstado } from './tokens'

/**
 * Paleta do mundo 3D.
 *
 * O Three.js lê cor como número (`0xRRGGBB`), o CSS lê como texto (`#RRGGBB`).
 * Este arquivo é a **ponte única** entre os dois: toda cor do mundo 3D sai de um
 * token já existente em `tokens.ts`, convertido aqui. Nenhum valor de cor novo é
 * escrito neste arquivo — só conversões e variações calculadas.
 *
 * O teste `paleta3d.test.ts` refaz a conversão a partir dos tokens e compara: se
 * alguém trocar um token visual, o mundo 3D acompanha sozinho, e se alguém
 * escrever um número solto aqui dentro, o teste acusa.
 */

/** Converte `#RRGGBB` em `0xRRGGBB`. Lança se o texto não for uma cor de seis dígitos. */
export function deHex(hex: string): Cor3D {
  const limpo = hex.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(limpo)) {
    throw new Error(`Cor hexadecimal inválida: "${hex}". Esperado #RRGGBB.`)
  }
  return Number.parseInt(limpo, 16)
}

/** Converte `0xRRGGBB` em `#rrggbb`. Usado em teste e em diagnóstico. */
export function paraHex(cor: Cor3D): string {
  return `#${cor.toString(16).padStart(6, '0')}`
}

/** Cores diretas dos tokens — sem variação. */
export const CORES_DO_MUNDO = {
  ceu: deHex(cores.ceu.medio),
  ceuDoAlto: deHex(cores.ceu.alto),
  nevoa: deHex(cores.nevoa),
  capim: deHex(cores.terreno.capim),
  rocha: deHex(cores.terreno.rocha),
  rochaClara: deHex(cores.terreno.rochaClara),
  conifera: deHex(cores.terreno.conifera),
  madeira: deHex(cores.terreno.madeira),
  madeiraClara: deHex(cores.terreno.madeiraClara),
  pale: deHex(cores.terreno.pale),
  mar: deHex(cores.mar.medio),
  marFundo: deHex(cores.mar.fundo),
} as const

const BRANCO = 0xffffff

/**
 * Variações calculadas a partir dos tokens.
 *
 * Cada uma existe por um motivo visual concreto — o telhado da biblioteca
 * precisa se distinguir da parede, o capim precisa ser mais claro que a rocha
 * sob ele — e todas são misturas, e não cores novas.
 */
export const CORES_DERIVADAS = {
  /**
   * Parede da biblioteca: pedra clara puxada para o creme da interface.
   *
   * Medida, esta cor chega à tela com radiação **1,001** — no teto do tone
   * mapping, e uma superfície no teto perde a variação de luz. A mistura **não**
   * foi mudada para consertar isso: quem corrige é o orçamento de luz, aplicado
   * onde o mundo desenha a parede (`corNoOrcamentoDeLuz`, em `Ilha.tsx`). A cor
   * da paleta continua sendo a que foi aprovada, e a regra vale igual para todas
   * as superfícies (D-060).
   */
  parede: misturar(deHex(cores.terreno.pale), deHex(cores.terreno.rochaClara), 0.35),
  /** Telhado: madeira escurecida, para o volume não virar um bloco só. */
  telhado: ajustar(deHex(cores.terreno.madeira), 0.72),
  /** Topo do capim: um passo mais claro, para a grama pegar a luz do céu. */
  capimClaro: ajustar(deHex(cores.terreno.capim), 1.22),
  /** Rocha logo abaixo do capim: mantém a parede clara no alto. */
  rochaDoAlto: misturar(deHex(cores.terreno.rochaClara), deHex(cores.terreno.rocha), 0.3),
  /**
   * Penhasco profundo: a pedra escura dissolvida na névoa, na cor e na luz.
   *
   * A versão anterior era `ajustar(rocha, 0.55)` — a pedra escurecida em 45%. A
   * medição mostrou o que isso dava na tela: **#030201**, preto praticamente puro,
   * e a ponta da ilha virava um bico preto pendurado no céu claro (D-060). A
   * intenção era a ponta "sumir na névoa", e o caminho para isso não é escurecer:
   * é a névoa — a cor do horizonte. Misturar com a névoa também é fiel à
   * profundidade de verdade: o que está longe perde contraste e se aproxima da
   * cor do ar, e não vira preto.
   *
   * O valor 0,12 foi escolhido por medida, entre o bico preto e o cinza chapado:
   *
   *  - com `ajustar(rocha, 0.55)` (o valor antigo), a parede do penhasco ficava em
   *    #100e0e e o bico em #030201 — preto praticamente puro;
   *  - com 0,28, o bico subia para #676766, mas o gradiente contra o alto da pedra
   *    caía para **1,11×**: o penhasco virava uma parede cinza uniforme, sem a
   *    profundidade que é a razão de existir do gradiente;
   *  - com 0,12, a parede fica em #4d4b48 (um cinza escuro legível, e não um
   *    buraco), o bico fica em 0,027 de radiação — 34% acima do piso de luz do
   *    mundo (0,02) — e o gradiente contra o alto da pedra se mantém em **2,2×**.
   */
  rochaDoFundo: misturar(deHex(cores.terreno.rocha), deHex(cores.nevoa), 0.12),
  /** Estrutura da ponte: madeira clara, que se destaca sobre a rocha escura. */
  ponte: deHex(cores.terreno.madeiraClara),
  /** Corrimão: madeira escura, para separar do tabuleiro. */
  corrimao: ajustar(deHex(cores.terreno.madeira), 0.85),
  /** Postes e molduras. */
  poste: deHex(cores.terreno.madeira),
  /** Árvore: tronco e copa. */
  tronco: ajustar(deHex(cores.terreno.madeira), 0.9),
  /** Tela do monitor: o verde da interface, que é a cor da marca. */
  tela: deHex(cores.acento.verde),
  /** Nuvem: branco puxado para o azul do céu. */
  nuvem: misturar(BRANCO, deHex(cores.ceu.alto), 0.25),
  /**
   * O mar distante, sob o arquipélago: a laje grande que a névoa come.
   *
   * O nome antigo era `vazio`, e o nome mentia: a laje é **o mar visto de longe**.
   * Medida, a cor antiga (`misturar(mar.fundo, ceu.horizonte, 0.55)`) chegava à
   * tela com radiação **1,18 de 1,0** — o tone mapping não tinha o que fazer com
   * ela e a laje virava um retângulo de papel branco brilhando no canto da tela
   * (D-060). O mar distante tem de ser **mais escuro** que o céu, na direção do
   * horizonte, e não mais claro.
   *
   * Com 0,30 a radiação cai para 0,85 e a laje fica #bdd5dc: 112 de distância do
   * céu, um passo de cor legível no chão da tela.
   */
  marDistante: misturar(deHex(cores.mar.fundo), deHex(cores.nevoa), 0.3),
  /** Realce de unidade aprovada: verde da marca, direto do token de estado. */
  aprovada: deHex(coresDeEstado.pronta),
  /** Unidade disponível: âmbar da marca. */
  disponivel: deHex(coresDeEstado.emConstrucao),
  /** Unidade bloqueada: cinza da marca. */
  bloqueada: deHex(coresDeEstado.planejada),
} as const

/**
 * Cores do avatar.
 *
 * A figura é o estudante no mundo: precisa se distinguir do capim, da rocha e da
 * madeira das estruturas, sem virar um ponto fora da paleta. O corpo usa o verde
 * da marca — que já é a cor de "unidade aprovada" no HUD e da tela do monitor —,
 * com a mochila no âmbar da marca. As duas são cores que existem nos tokens: aqui
 * não há valor novo escrito à mão.
 */
export const CORES_DO_AVATAR = {
  corpo: deHex(cores.acento.verde),
  /** Braços e pernas: o mesmo verde, um passo mais escuro, para o corpo ter partes. */
  membros: ajustar(deHex(cores.acento.verde), 0.72),
  /** Cabeça: pedra clara, a mesma das paredes, para a figura ter rosto visível. */
  cabeca: deHex(cores.terreno.pale),
  /** Mochila: âmbar da marca, o mesmo das unidades disponíveis. */
  mochila: deHex(cores.acento.ambar),
} as const

/**
 * Cor da estrutura de cada ilha, conforme a situação da unidade.
 *
 * O mundo pinta o estado; quem o decide é `src/learning/percurso.ts`. O 3D não
 * recalcula aprovação em lugar nenhum.
 */
export function corDaSituacao(situacao: 'bloqueada' | 'disponivel' | 'aprovada'): Cor3D {
  return {
    bloqueada: CORES_DERIVADAS.bloqueada,
    disponivel: CORES_DERIVADAS.disponivel,
    aprovada: CORES_DERIVADAS.aprovada,
  }[situacao]
}

/**
 * Os tons das ilhas.
 *
 * Cada ilha recebe um tom, e o tom aparece no marco dela — a construção que só
 * aquela ilha tem. São quinze misturas de tokens existentes, e não quinze valores
 * novos: a regra do projeto continua valendo (D-005), e o teste refaz as misturas
 * a partir dos tokens para provar isso.
 *
 * A lista cresce com o percurso: as ilhas 11 e 12 (capítulos 10 e 11) chegaram
 * com o lote 4, e ganharam tom próprio em vez de repetir o da ilha 1 e o da
 * ilha 2. Quando o arquipélago passar deste tamanho, o tom volta ao começo — e
 * mesmo assim duas ilhas não ficam iguais, porque a silhueta, o marco e a
 * vegetação vêm da semente de cada uma (`geometria/identidade.ts`).
 */
export const CORES_DAS_ILHAS: readonly Cor3D[] = [
  /** Verde da marca: o tom da primeira ilha, o que o projeto já usava. */
  misturar(deHex(cores.acento.verde), deHex(cores.acento.verdeClaro), 0.5),
  /** Âmbar quente, puxado para a madeira clara. */
  misturar(deHex(cores.acento.ambar), deHex(cores.terreno.madeiraClara), 0.35),
  /** Turquesa do mar claro com o mar médio. */
  misturar(deHex(cores.mar.medio), deHex(cores.mar.claro), 0.5),
  /** Terracota: o vermelho da marca com a madeira. */
  misturar(deHex(cores.acento.vermelho), deHex(cores.terreno.madeira), 0.45),
  /** Verde de conífera, um passo mais escuro que o capim. */
  misturar(deHex(cores.terreno.conifera), deHex(cores.terreno.capim), 0.35),
  /** Areia clara, tirada do creme da interface. */
  misturar(deHex(cores.terreno.pale), deHex(cores.ceu.alto), 0.3),
  /** Azul fundo: o horizonte do céu com o mar fundo. */
  misturar(deHex(cores.ceu.horizonte), deHex(cores.mar.fundo), 0.4),
  /** Cinza-esverdeado: pedra clara com o mar médio. */
  misturar(deHex(cores.terreno.rochaClara), deHex(cores.mar.medio), 0.4),
  /** Marrom escuro de madeira com a pedra. */
  misturar(deHex(cores.terreno.madeira), deHex(cores.terreno.rocha), 0.3),
  /** Rosado de pedra: o vermelho da marca lavado no horizonte do céu. */
  misturar(deHex(cores.acento.vermelho), deHex(cores.ceu.horizonte), 0.5),
  /** Verde-água fundo: o mar profundo com o verde da marca. */
  misturar(deHex(cores.mar.fundo), deHex(cores.acento.verdeClaro), 0.2),
  /** Cinza quente: a pedra clara com a madeira — o mais neutro dos doze. */
  misturar(deHex(cores.terreno.rochaClara), deHex(cores.terreno.madeira), 0.5),
  // Lote 5 (Etapa 11): os três tons da trilha do projeto de jogo. Foram
  // procurados por medida, e não escolhidos a dedo (ver D-061): varrendo todas as
  // misturas de dois tokens, dentro da faixa de claridade de um tom de ilha, este
  // é o trio que **mantém a maior distância mínima** entre os quinze tons
  // desenhados — e é essa a medida que vale, porque o orçamento de luz aproxima
  // os tons claros (D-060).
  //
  // A primeira tentativa trouxe um verde-sálvia (`capim + pale × 0,6`) no lugar
  // do tom do meio, escolhido pela distância **crua** (51,3 dos doze antigos).
  // Medido depois de desenhar, ele ficava a **28,5** do tom 6 — abaixo do piso de
  // 30 que o teste cobra —, porque o tom 6 é claro e o orçamento o escurece na
  // direção dele. O cáqui entrou no lugar e o par mais próximo dos quinze voltou
  // para **32,1**, que é o par mais próximo dos doze originais: o lote não
  // empilhou nenhum tom.
  //
  // O matiz dos três (13°, 91° e 129°) cai nos buracos que os doze deixavam no
  // círculo de cores: os antigos vão de 3° a 34° (quentes), 120° (um verde) e
  // 167° a 210° (azuis e turquesas).
  /** Terracota queimada: âmbar com vermelho — o tom do fogo que sai da nave. */
  misturar(deHex(cores.acento.ambar), deHex(cores.acento.vermelho), 0.7),
  /** Cáqui esverdeado: o mar claro com o âmbar — claro e dessaturado. */
  misturar(deHex(cores.mar.claro), deHex(cores.acento.ambar), 0.5),
  /** Verde profundo de alga: o mar fundo com o capim — escuro e saturado. */
  misturar(deHex(cores.mar.fundo), deHex(cores.terreno.capim), 0.6),
] as const

/** O tom de uma ilha, pelo índice. Índices fora da lista dão a volta. */
export function corDaIlha(tom: number): Cor3D {
  const quantidade = CORES_DAS_ILHAS.length
  const escolhido = ((Math.trunc(tom) % quantidade) + quantidade) % quantidade
  return CORES_DAS_ILHAS[escolhido] ?? CORES_DERIVADAS.aprovada
}

/**
 * Como fica uma cor de terreno quando a unidade ainda **não abriu**.
 *
 * É uma mistura em direção à névoa: a ilha bloqueada continua sendo a ilha, com a
 * forma e o tom dela, mas mais lavada e mais longe — o mesmo tratamento que o
 * capim e a rocha já recebiam antes, agora aplicado como função, porque a cor do
 * terreno passou a ser pintada por vértice e uma malha pintada não recebe tinta
 * do material (ver `Malha.tsx` e a decisão D-054).
 *
 * Quem **não** usa isto: as estruturas, a placa de missão e o farol de estado,
 * que continuam com a cor cheia de `corDaSituacao` — é ela que diz, de perto, se
 * a unidade está disponível ou aprovada.
 */
export function corDeUnidadeBloqueada(cor: Cor3D): Cor3D {
  return misturar(cor, CORES_DO_MUNDO.nevoa, 0.4)
}
