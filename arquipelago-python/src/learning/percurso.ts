/**
 * Percurso: quais unidades estão abertas, e o que muda o estado delas.
 *
 * Regras fixadas (ver `docs/STATE_MACHINE.md`):
 *  - a primeira unidade está sempre disponível;
 *  - uma unidade abre quando a **anterior** está aprovada — só ela, uma por vez;
 *  - reprovar **não** bloqueia a unidade atual nem apaga aprovação anterior;
 *  - **nada** aqui aceita rota, hash, clique ou parâmetro de URL. A única entrada
 *    capaz de mudar o estado é `registrarResultado`, e ela exige um resultado de
 *    avaliação válido.
 *
 * Este módulo depende apenas do tipo estrutural `UnidadeDoPercurso`, e não de
 * `src/content/`. Assim as regras não ficam presas ao conteúdo do livro.
 */
import {
  compararNotas,
  descreverNota,
  foiAprovado,
  validarResultado,
  type ResultadoDeAvaliacao,
} from './avaliacao'

/**
 * Versão do formato de progresso.
 *
 * A versão 2 acrescentou `leituraFeita` a cada unidade. A migração da 1 para a 2
 * preserva o que já estava guardado e é feita na leitura
 * (`persistence/progressoSalvo.ts`): quem aprovou uma ilha antes desta mudança
 * **não perde nada** por causa de um marcador de leitura.
 */
export const VERSAO_DO_PROGRESSO = 2

export type ProgressoDaUnidade = {
  readonly aprovada: boolean
  readonly tentativas: number
  /** Melhor nota já obtida. `null` quando ainda não houve tentativa. */
  readonly melhorNota: ResultadoDeAvaliacao | null
  /**
   * `true` quando o estudante marcou a leitura recomendada como feita.
   *
   * É um **marcador pessoal**, escrito pela própria pessoa: não é prova de
   * leitura e não entra em nenhuma conta de aprovação. Guardá-lo importa porque
   * a trilha tem quatro unidades com quatro leituras, e "onde eu parei" é
   * exatamente o tipo de coisa que se esquece entre uma sessão e outra.
   */
  readonly leituraFeita: boolean
}

/** Registro de unidade como ele era na versão 1 do formato — sem `leituraFeita`. */
export type ProgressoDaUnidadeAntigo = Omit<ProgressoDaUnidade, 'leituraFeita'>

/**
 * Progresso do estudante. Estrutura **serializável e versionada**: apenas
 * números, textos e booleanos. Nenhum objeto de cena, componente ou função.
 */
export type Progresso = {
  readonly versao: number
  readonly unidades: Readonly<Record<string, ProgressoDaUnidade>>
}

/** O mínimo que uma unidade precisa ter para participar do percurso. */
export type UnidadeDoPercurso = {
  readonly id: string
  readonly ordem: number
}

export type EstadoDaUnidade = 'bloqueada' | 'disponivel' | 'aprovada'

const ROTULO_DO_ESTADO: Record<EstadoDaUnidade, string> = {
  bloqueada: 'Bloqueada',
  disponivel: 'Disponível',
  aprovada: 'Aprovada',
}

/** Progresso de quem nunca estudou nada. */
export function progressoInicial(): Progresso {
  return { versao: VERSAO_DO_PROGRESSO, unidades: {} }
}

/** Progresso de uma unidade, ou `null` se nunca foi tocada. */
export function progressoDaUnidade(progresso: Progresso, unidadeId: string): ProgressoDaUnidade | null {
  return progresso.unidades[unidadeId] ?? null
}

/**
 * Ordena as unidades e recusa duplicidade de identificador ou de ordem.
 * Ordem repetida quebraria a ideia de "unidade anterior" de forma silenciosa.
 */
export function ordenarUnidades(
  unidades: readonly UnidadeDoPercurso[],
): readonly UnidadeDoPercurso[] {
  const ids = new Set<string>()
  const ordens = new Set<number>()

  for (const unidade of unidades) {
    if (ids.has(unidade.id)) {
      throw new Error(`Unidade repetida no percurso: ${unidade.id}`)
    }
    if (ordens.has(unidade.ordem)) {
      throw new Error(`Ordem repetida no percurso: ${unidade.ordem}`)
    }
    ids.add(unidade.id)
    ordens.add(unidade.ordem)
  }

  return [...unidades].sort((uma, outra) => uma.ordem - outra.ordem)
}

/** Lança se o identificador não existir no percurso. Evita estado para unidade inexistente. */
function exigirUnidade(
  unidades: readonly UnidadeDoPercurso[],
  unidadeId: string,
): UnidadeDoPercurso {
  const encontrada = unidades.find((unidade) => unidade.id === unidadeId)
  if (!encontrada) {
    throw new Error(
      `Unidade desconhecida: ${unidadeId}. O progresso não pode ser criado para uma unidade que não existe no percurso.`,
    )
  }
  return encontrada
}

/** A unidade imediatamente anterior no percurso, ou `null` se for a primeira. */
function unidadeAnterior(
  unidadesOrdenadas: readonly UnidadeDoPercurso[],
  unidadeId: string,
): UnidadeDoPercurso | null {
  const indice = unidadesOrdenadas.findIndex((unidade) => unidade.id === unidadeId)
  if (indice <= 0) {
    return null
  }
  return unidadesOrdenadas[indice - 1] ?? null
}

/** Estado de uma unidade para o estudante. */
export function estadoDaUnidade(
  progresso: Progresso,
  unidades: readonly UnidadeDoPercurso[],
  unidadeId: string,
): EstadoDaUnidade {
  const ordenadas = ordenarUnidades(unidades)
  exigirUnidade(ordenadas, unidadeId)

  if (progressoDaUnidade(progresso, unidadeId)?.aprovada === true) {
    return 'aprovada'
  }

  const anterior = unidadeAnterior(ordenadas, unidadeId)
  if (anterior === null) {
    return 'disponivel'
  }

  return progressoDaUnidade(progresso, anterior.id)?.aprovada === true ? 'disponivel' : 'bloqueada'
}

/** Verdadeiro se o estudante pode entrar na unidade (disponível ou aprovada). */
export function unidadeEstaAcessivel(
  progresso: Progresso,
  unidades: readonly UnidadeDoPercurso[],
  unidadeId: string,
): boolean {
  return estadoDaUnidade(progresso, unidades, unidadeId) !== 'bloqueada'
}

/** A primeira unidade ainda não aprovada, na ordem do percurso. `null` se todas foram aprovadas. */
export function proximaUnidade(
  progresso: Progresso,
  unidades: readonly UnidadeDoPercurso[],
): UnidadeDoPercurso | null {
  const ordenadas = ordenarUnidades(unidades)

  for (const unidade of ordenadas) {
    if (estadoDaUnidade(progresso, ordenadas, unidade.id) !== 'aprovada') {
      return unidade
    }
  }

  return null
}

/**
 * Registra o resultado de uma avaliação. **É a única função que muda o estado.**
 *
 * Garantias:
 *  - aprovação nunca é removida por uma tentativa posterior;
 *  - a melhor nota só melhora;
 *  - reprovar não bloqueia nada, apenas conta tentativa;
 *  - lança para unidade desconhecida, evitando criar progresso de fora do percurso.
 */
export function registrarResultado(
  progresso: Progresso,
  unidades: readonly UnidadeDoPercurso[],
  unidadeId: string,
  resultado: ResultadoDeAvaliacao,
): Progresso {
  validarResultado(resultado)
  exigirUnidade(ordenarUnidades(unidades), unidadeId)

  // Recusa registrar resultado de unidade bloqueada. Sem isso, seria possível
  // acumular aprovação numa unidade ainda fechada e "chegar antes" do portão.
  if (estadoDaUnidade(progresso, unidades, unidadeId) === 'bloqueada') {
    throw new Error(
      `A unidade ${unidadeId} está bloqueada. Não é possível registrar resultado antes de aprovar a unidade anterior.`,
    )
  }

  const anterior: ProgressoDaUnidade = progressoDaUnidade(progresso, unidadeId) ?? {
    aprovada: false,
    tentativas: 0,
    melhorNota: null,
    leituraFeita: false,
  }

  const melhorNota =
    anterior.melhorNota === null || compararNotas(resultado, anterior.melhorNota) > 0
      ? resultado
      : anterior.melhorNota

  const atualizada: ProgressoDaUnidade = {
    aprovada: anterior.aprovada || foiAprovado(resultado),
    tentativas: anterior.tentativas + 1,
    melhorNota,
    // Registrar nota não mexe no marcador de leitura: são coisas diferentes.
    leituraFeita: anterior.leituraFeita,
  }

  return {
    versao: progresso.versao,
    unidades: { ...progresso.unidades, [unidadeId]: atualizada },
  }
}

/** Texto de exibição do estado. */
export function descreverEstado(estado: EstadoDaUnidade): string {
  return ROTULO_DO_ESTADO[estado]
}

/** Resumo de uma unidade para exibir: estado, tentativas e melhor nota. */
export function resumoDaUnidade(
  progresso: Progresso,
  unidades: readonly UnidadeDoPercurso[],
  unidadeId: string,
): { readonly estado: EstadoDaUnidade; readonly texto: string } {
  const estado = estadoDaUnidade(progresso, unidades, unidadeId)
  const registro = progressoDaUnidade(progresso, unidadeId)

  if (!registro || registro.melhorNota === null) {
    return { estado, texto: descreverEstado(estado) }
  }

  const tentativas = registro.tentativas === 1 ? '1 tentativa' : `${registro.tentativas} tentativas`
  return { estado, texto: `${descreverEstado(estado)} · ${tentativas} · melhor nota: ${descreverNota(registro.melhorNota)}` }
}

/**
 * Marca (ou desmarca) a leitura recomendada de uma unidade.
 *
 * O que esta função **não** faz, e é o ponto principal dela:
 *
 *  - não aprova nada, não conta tentativa e não muda nota;
 *  - não abre a unidade seguinte. Quem abre é `registrarResultado`, e só ela. Um
 *    marcador de leitura não pode ser atalho para o portão — se fosse, a regra
 *    dos 80% viraria enfeite: bastaria clicar "li" quatro vezes;
 *  - não cria progresso de unidade bloqueada: unidade bloqueada não tem leitura
 *    a marcar, porque o estudante ainda não chegou lá.
 *
 * Chamar duas vezes com o mesmo valor não muda nada: marcar de novo o que já
 * está marcado é o gesto mais comum que existe.
 */
export function marcarLeituraFeita(
  progresso: Progresso,
  unidades: readonly UnidadeDoPercurso[],
  unidadeId: string,
  feita = true,
): Progresso {
  const ordenadas = ordenarUnidades(unidades)
  exigirUnidade(ordenadas, unidadeId)

  if (estadoDaUnidade(progresso, ordenadas, unidadeId) === 'bloqueada') {
    throw new Error(
      `A unidade ${unidadeId} está bloqueada. Não há leitura a marcar antes de aprovar a unidade anterior.`,
    )
  }

  const anterior: ProgressoDaUnidade = progressoDaUnidade(progresso, unidadeId) ?? {
    aprovada: false,
    tentativas: 0,
    melhorNota: null,
    leituraFeita: false,
  }

  if (anterior.leituraFeita === feita) {
    return progresso
  }

  return {
    versao: progresso.versao,
    unidades: {
      ...progresso.unidades,
      [unidadeId]: { ...anterior, leituraFeita: feita },
    },
  }
}

/** Verdadeiro se o estudante já marcou a leitura desta unidade como feita. */
export function leituraFoiFeita(progresso: Progresso, unidadeId: string): boolean {
  return progressoDaUnidade(progresso, unidadeId)?.leituraFeita ?? false
}
