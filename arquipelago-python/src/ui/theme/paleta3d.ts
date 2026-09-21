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
  /** Parede da biblioteca: pedra clara puxada para o creme da interface. */
  parede: misturar(deHex(cores.terreno.pale), deHex(cores.terreno.rochaClara), 0.35),
  /** Telhado: madeira escurecida, para o volume não virar um bloco só. */
  telhado: ajustar(deHex(cores.terreno.madeira), 0.72),
  /** Topo do capim: um passo mais claro, para a grama pegar a luz do céu. */
  capimClaro: ajustar(deHex(cores.terreno.capim), 1.22),
  /** Rocha logo abaixo do capim: mantém a parede clara no alto. */
  rochaDoAlto: misturar(deHex(cores.terreno.rochaClara), deHex(cores.terreno.rocha), 0.3),
  /** Penhasco profundo: quase preto, para a ponta sumir na névoa. */
  rochaDoFundo: ajustar(deHex(cores.terreno.rocha), 0.55),
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
  /** Mar profundo, sob o arquipélago. */
  vazio: misturar(deHex(cores.mar.fundo), deHex(cores.ceu.horizonte), 0.55),
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
 * aquela ilha tem. São doze misturas de tokens existentes, e não doze valores
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
