import type { Progresso, UnidadeDoPercurso } from '../learning/percurso'
import { progressoDaUnidade, progressoInicial, registrarResultado } from '../learning/percurso'
import {
  avaliarRespostas,
  contarEmBranco,
  respostasCompletas,
  type Resposta,
  type ResultadoDeAvaliacao,
} from '../learning/avaliacao'

/**
 * Estado da aplicação: o progresso do estudante e a sessão em curso.
 *
 * Este módulo é onde as duas coisas se encontram, e é o **único** lugar que
 * chama `registrarResultado`. Nenhum componente altera progresso: eles despacham
 * ações. Isso mantém a regra de aprovação em um só lugar, como manda a decisão
 * D-004.
 *
 * O redutor é criado por uma fábrica que recebe a lista de unidades. Assim os
 * testes usam um percurso pequeno e inventado, sem depender do conteúdo real, e
 * o componente usa o percurso de verdade.
 */

/** Etapa do ciclo de estudo em que o estudante está. */
export type Passo = 'missao' | 'estudo' | 'pratica' | 'avaliacao' | 'resultado'

/**
 * Ordem do ciclo. É o que define para onde `avancar` leva.
 * Os passos são de **tela**, e não mudam nenhuma regra de aprovação.
 */
export const PASSOS: readonly Passo[] = ['missao', 'estudo', 'pratica', 'avaliacao', 'resultado']

/** Onde está o foco do teclado. Ver decisão D-012. */
export type Foco = 'mundo' | 'painel'

/**
 * Modo de câmera.
 *
 * - `andar` — o avatar anda pelo chão, e a câmera o acompanha de perto. É o modo
 *   padrão: o mundo foi feito para ser percorrido a pé, e a pessoa no mundo é o
 *   que separa "olhar um arquipélago" de "entrar na ilha".
 * - `voar` — voo livre, para conhecer o conjunto e voltar rápido de onde se
 *   estava. É também o modo de quem quer atravessar sem caminhar.
 * - `mapa` — vista de cima, que serve de orientação e de alternativa a quem não
 *   consegue usar o mouse.
 *
 * Os dois caminhos levam aos mesmos lugares, com as mesmas regras: nenhum modo
 * de câmera libera unidade (D-004).
 */
export type ModoDeCamera = 'andar' | 'voar' | 'mapa'

export type Sessao = {
  readonly unidadeId: string | null
  readonly passo: Passo
  readonly respostas: readonly Resposta[]
  readonly resultado: ResultadoDeAvaliacao | null
  /**
   * `true` quando a ilha **já estava aprovada antes desta sessão**.
   *
   * É gravado no momento de abrir a ilha, e não lido a cada desenho. A diferença
   * importa: se fosse lido ao vivo, a primeira aprovação de uma ilha faria a
   * tela dizer "você já havia aprovado" — o que seria mentira, na cara de quem
   * acabou de ver a nota.
   */
  readonly aprovadaAntes: boolean
  readonly foco: Foco
  readonly camera: ModoDeCamera
}

export type Estado = {
  readonly progresso: Progresso
  readonly sessao: Sessao
  /** `true` quando o estudante escolheu a versão sem 3D. */
  readonly sem3d: boolean
  /** Mensagem de falha ao gravar, quando houver. Nunca escondida. */
  readonly avisoDeGravacao: string | null
}

export type Acao =
  | { readonly tipo: 'abrirUnidade'; readonly unidadeId: string; readonly totalDePerguntas: number }
  | { readonly tipo: 'irPara'; readonly passo: Passo }
  | { readonly tipo: 'avancar' }
  | { readonly tipo: 'voltar' }
  | { readonly tipo: 'responder'; readonly indice: number; readonly alternativa: number }
  | { readonly tipo: 'enviar'; readonly gabarito: readonly number[] }
  | { readonly tipo: 'refazer' }
  | { readonly tipo: 'fecharUnidade' }
  | { readonly tipo: 'definirFoco'; readonly foco: Foco }
  | { readonly tipo: 'definirCamera'; readonly camera: ModoDeCamera }
  | { readonly tipo: 'alternarSem3d' }
  | { readonly tipo: 'substituirProgresso'; readonly progresso: Progresso }
  | { readonly tipo: 'registrarAviso'; readonly aviso: string | null }

/** Sessão vazia: nenhuma unidade aberta, foco no mundo. */
export function sessaoInicial(): Sessao {
  return {
    unidadeId: null,
    passo: 'missao',
    respostas: [],
    resultado: null,
    aprovadaAntes: false,
    foco: 'mundo',
    camera: 'andar',
  }
}

export function estadoInicial(progresso: Progresso = progressoInicial()): Estado {
  return { progresso, sessao: sessaoInicial(), sem3d: false, avisoDeGravacao: null }
}

/**
 * Verdadeiro se o foco permite mover a câmera **e o avatar** com `W A S D`.
 *
 * Decisão D-012: com um painel aberto, as teclas de movimento **não** podem
 * mover ninguém. Sem isso, o estudante digita uma resposta e a câmera dispara —
 * ou o avatar caminha sozinho para dentro do mar enquanto ele escreve.
 */
export function podeMoverCamera(foco: Foco): boolean {
  return foco === 'mundo'
}

/** Para onde `Esc` leva. Sempre de volta ao mundo, e nunca para outra tela. */
export function paraOndeEscapeLeva(foco: Foco): Foco {
  return foco === 'painel' ? 'mundo' : 'mundo'
}

/** Próximo passo do ciclo, ou `null` se já está no último. */
export function proximoPasso(passo: Passo): Passo | null {
  const indice = PASSOS.indexOf(passo)
  return indice < 0 || indice === PASSOS.length - 1 ? null : (PASSOS[indice + 1] ?? null)
}

/** Passo anterior do ciclo, ou `null` se já está no primeiro. */
export function passoAnterior(passo: Passo): Passo | null {
  const indice = PASSOS.indexOf(passo)
  return indice <= 0 ? null : (PASSOS[indice - 1] ?? null)
}

/** Cria o redutor sobre um percurso. */
export function criarRedutor(unidades: readonly UnidadeDoPercurso[]) {
  return function redutor(estado: Estado, acao: Acao): Estado {
    switch (acao.tipo) {
      case 'abrirUnidade': {
        return {
          ...estado,
          sessao: {
            ...estado.sessao,
            unidadeId: acao.unidadeId,
            passo: 'missao',
            respostas: Array.from({ length: acao.totalDePerguntas }, () => null),
            resultado: null,
            // Fotografia do progresso neste instante. A aprovação conquistada
            // agora não pode contar como aprovação anterior.
            aprovadaAntes: progressoDaUnidade(estado.progresso, acao.unidadeId)?.aprovada ?? false,
            foco: 'painel',
          },
        }
      }

      case 'irPara': {
        return { ...estado, sessao: { ...estado.sessao, passo: acao.passo } }
      }

      case 'avancar': {
        const seguinte = proximoPasso(estado.sessao.passo)
        return seguinte === null ? estado : { ...estado, sessao: { ...estado.sessao, passo: seguinte } }
      }

      case 'voltar': {
        const anterior = passoAnterior(estado.sessao.passo)
        return anterior === null ? estado : { ...estado, sessao: { ...estado.sessao, passo: anterior } }
      }

      case 'responder': {
        const { respostas } = estado.sessao
        if (acao.indice < 0 || acao.indice >= respostas.length) {
          return estado
        }
        const novas = respostas.map((resposta, indice) =>
          indice === acao.indice ? acao.alternativa : resposta,
        )
        return { ...estado, sessao: { ...estado.sessao, respostas: novas } }
      }

      case 'enviar': {
        const { unidadeId, respostas } = estado.sessao
        if (unidadeId === null) {
          return estado
        }
        // A correção recusa envio em branco — a mesma regra do domínio, sem
        // cópia aqui. Se faltar resposta, nada muda e o erro é do domínio.
        if (!respostasCompletas(respostas) || acao.gabarito.length !== respostas.length) {
          return estado
        }

        const resultado = avaliarRespostas(respostas, acao.gabarito)

        try {
          const progresso = registrarResultado(estado.progresso, unidades, unidadeId, resultado)
          return {
            ...estado,
            progresso,
            sessao: { ...estado.sessao, resultado, passo: 'resultado' },
          }
        } catch {
          // Unidade bloqueada ou desconhecida: o domínio recusou. O estado fica
          // como estava, e não existe caminho alternativo que contorne isso.
          return estado
        }
      }

      case 'refazer': {
        const total = estado.sessao.respostas.length
        return {
          ...estado,
          sessao: {
            ...estado.sessao,
            passo: 'avaliacao',
            respostas: Array.from({ length: total }, () => null),
            resultado: null,
          },
        }
      }

      case 'fecharUnidade': {
        return {
          ...estado,
          sessao: { ...estado.sessao, unidadeId: null, foco: 'mundo', resultado: null, respostas: [] },
        }
      }

      case 'definirFoco':
        return { ...estado, sessao: { ...estado.sessao, foco: acao.foco } }

      case 'definirCamera':
        return { ...estado, sessao: { ...estado.sessao, camera: acao.camera } }

      case 'alternarSem3d':
        return { ...estado, sem3d: !estado.sem3d }

      case 'substituirProgresso':
        return { ...estado, progresso: acao.progresso }

      case 'registrarAviso':
        return { ...estado, avisoDeGravacao: acao.aviso }

      default:
        return estado
    }
  }
}

/** Quantas perguntas ainda faltam responder na sessão atual. */
export function perguntasEmBranco(sessao: Sessao): number {
  return contarEmBranco(sessao.respostas)
}
