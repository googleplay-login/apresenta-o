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
 * A versão 2 acrescentou `leituraFeita` a cada unidade; a 3 acrescentou
 * `exerciciosResolvidos`. As migrações preservam o que já estava guardado e são
 * feitas na leitura (`persistence/progressoSalvo.ts`): quem aprovou uma ilha
 * antes desta mudança **não perde nada** por causa de um marcador novo (D-047).
 */
export const VERSAO_DO_PROGRESSO = 3

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
  /**
   * Identificadores dos exercícios de prática **conferidos com tudo certo**.
   *
   * O que entra aqui: exercício cuja conferência automática disse "tudo
   * confere". O que **não** entra: tentativa que ainda não confere (isso é
   * caminho, não conquista), e conferência que não conseguiu olhar.
   *
   * O que isto **não** é: aprovação. Exercício conferido não abre ilha, não conta
   * tentativa e não muda nota — quem aprova é a avaliação (D-046).
   */
  readonly exerciciosResolvidos: readonly string[]
}

/** Registro de unidade como ele era na versão 1 — sem `leituraFeita` nem exercícios. */
export type ProgressoDaUnidadeAntigo = Omit<
  ProgressoDaUnidade,
  'leituraFeita' | 'exerciciosResolvidos'
>

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
  /**
   * Identificadores dos exercícios desta unidade, quando conhecidos.
   *
   * Opcional de propósito: as regras de percurso não precisam de conteúdo, e os
   * testes de domínio montam percursos inventados. Quando a lista existe, marcar
   * exercício confere se ele é **desta** unidade — sem isso, um identificador
   * errado entraria no progresso e nunca apareceria na tela.
   */
  readonly exercicios?: readonly string[]
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

  const anterior: ProgressoDaUnidade = progressoDaUnidade(progresso, unidadeId) ?? progressoDeUnidadeVazia()

  const melhorNota =
    anterior.melhorNota === null || compararNotas(resultado, anterior.melhorNota) > 0
      ? resultado
      : anterior.melhorNota

  const atualizada: ProgressoDaUnidade = {
    aprovada: anterior.aprovada || foiAprovado(resultado),
    tentativas: anterior.tentativas + 1,
    melhorNota,
    // Registrar nota não mexe no marcador de leitura nem nos exercícios: são
    // coisas diferentes, e misturá-las faria a nota decidir o que não é dela.
    leituraFeita: anterior.leituraFeita,
    exerciciosResolvidos: anterior.exerciciosResolvidos,
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

  const anterior: ProgressoDaUnidade = progressoDaUnidade(progresso, unidadeId) ?? progressoDeUnidadeVazia()

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

/** Registro inicial de uma unidade que ainda não foi tocada. */
function progressoDeUnidadeVazia(): ProgressoDaUnidade {
  return {
    aprovada: false,
    tentativas: 0,
    melhorNota: null,
    leituraFeita: false,
    exerciciosResolvidos: [],
  }
}

/**
 * Marca um exercício de prática como conferido com tudo certo.
 *
 * O que esta função **não** faz, e é o ponto dela:
 *
 *  - não aprova a unidade, não conta tentativa e não muda nota (D-046). Se
 *    aprovasse, bastaria conferir três exercícios para abrir a ilha seguinte, e
 *    a regra dos 80% viraria enfeite;
 *  - não aceita exercício de unidade bloqueada: quem não chegou à ilha não tem
 *    exercício dela para conferir;
 *  - não aceita identificador desconhecido, quando a unidade declara os seus —
 *    um id errado ficaria guardado para sempre sem aparecer em lugar nenhum;
 *  - não desfaz: conferir de novo o que já estava conferido devolve o **mesmo**
 *    progresso (a identidade não muda, e por isso nada é regravado).
 *
 * Quem chama é o redutor, a partir do resultado da conferência — e só quando a
 * conferência disse "tudo confere".
 */
export function marcarExercicioResolvido(
  progresso: Progresso,
  unidades: readonly UnidadeDoPercurso[],
  unidadeId: string,
  exercicioId: string,
): Progresso {
  if (exercicioId.trim() === '') {
    throw new Error('Exercício sem identificador não pode ser marcado como conferido.')
  }

  const ordenadas = ordenarUnidades(unidades)
  const unidade = exigirUnidade(ordenadas, unidadeId)

  if (estadoDaUnidade(progresso, ordenadas, unidadeId) === 'bloqueada') {
    throw new Error(
      `A unidade ${unidadeId} está bloqueada. Não há exercício a conferir antes de aprovar a unidade anterior.`,
    )
  }

  if (unidade.exercicios !== undefined && !unidade.exercicios.includes(exercicioId)) {
    throw new Error(
      `O exercício ${exercicioId} não é da unidade ${unidadeId}. O progresso não pode guardar um exercício que não existe.`,
    )
  }

  const anterior = progressoDaUnidade(progresso, unidadeId) ?? progressoDeUnidadeVazia()
  if (anterior.exerciciosResolvidos.includes(exercicioId)) {
    return progresso
  }

  return {
    versao: progresso.versao,
    unidades: {
      ...progresso.unidades,
      [unidadeId]: {
        ...anterior,
        exerciciosResolvidos: [...anterior.exerciciosResolvidos, exercicioId],
      },
    },
  }
}

/** Exercícios já conferidos de uma unidade, na ordem em que foram conferidos. */
export function exerciciosConferidos(progresso: Progresso, unidadeId: string): readonly string[] {
  return progressoDaUnidade(progresso, unidadeId)?.exerciciosResolvidos ?? []
}

/** Verdadeiro se o exercício já foi conferido com tudo certo. */
export function exercicioFoiConferido(
  progresso: Progresso,
  unidadeId: string,
  exercicioId: string,
): boolean {
  return exerciciosConferidos(progresso, unidadeId).includes(exercicioId)
}
