import {
  VERSAO_DO_PROGRESSO,
  progressoInicial,
  type Progresso,
  type ProgressoDaUnidade,
} from '../learning/percurso'

/**
 * Leitura e escrita do progresso no navegador.
 *
 * Regras que este módulo existe para cumprir (ver `docs/STATE_MACHINE.md` e as
 * decisões D-003 e D-017):
 *
 *  - gravar apenas dados **serializáveis e versionados**;
 *  - tratar armazenamento indisponível, cota estourada e JSON corrompido;
 *  - **nunca fingir que salvou**: se a gravação falhar, quem chamou fica sabendo;
 *  - limpar somente as chaves desta aplicação — `localStorage.clear()` é
 *    proibido, porque apagaria dados de outros sites da mesma origem.
 *
 * O armazenamento é injetado, e não acessado direto, para que os testes rodem
 * sem navegador e possam simular cada tipo de falha.
 */

/** Prefixo de todas as chaves desta aplicação. */
export const PREFIXO_DAS_CHAVES = 'arquipelago-python.'

/** Chave do progresso. */
export const CHAVE_DO_PROGRESSO = `${PREFIXO_DAS_CHAVES}progresso`

/** O mínimo que precisamos do `localStorage` — permite dublê em teste. */
export type Armazenamento = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>

export type ResultadoDaLeitura = {
  readonly progresso: Progresso
  /** `null` quando correu tudo bem. Texto em português quando algo falhou. */
  readonly aviso: string | null
}

export type ResultadoDaEscrita = {
  readonly ok: boolean
  readonly aviso: string | null
}

/**
 * Versões de formato que esta versão do programa **entende**.
 *
 * A 1 é a versão sem `leituraFeita`; a 2, a versão sem os exercícios conferidos.
 * Aceitá-las na leitura não é generosidade: é a diferença entre migrar e apagar.
 * Quem aprovou a primeira ilha antes de qualquer marcador existir continua com a
 * aprovação no lugar (D-035, D-047).
 */
export const VERSOES_ACEITAS: readonly number[] = [1, 2, VERSAO_DO_PROGRESSO]

/**
 * O que pode sair do armazenamento: um progresso de alguma versão aceita.
 *
 * Os marcadores criados depois são **opcionais de propósito**: é assim que um
 * progresso de versão anterior passa pela conferência e chega à migração, em vez
 * de ser jogado fora.
 */
export type UnidadeGuardada = {
  readonly aprovada: boolean
  readonly tentativas: number
  readonly melhorNota: { readonly acertos: number; readonly total: number } | null
  readonly leituraFeita?: boolean
  readonly exerciciosResolvidos?: readonly string[]
}

export type ProgressoGuardado = {
  readonly versao: number
  readonly unidades: Readonly<Record<string, UnidadeGuardada>>
}

/** Verdadeiro se o formato lido é um progresso utilizável (versão aceita). */
export function ehProgressoValido(valor: unknown): valor is ProgressoGuardado {
  if (valor === null || typeof valor !== 'object') {
    return false
  }

  const candidato = valor as { versao?: unknown; unidades?: unknown }

  if (typeof candidato.versao !== 'number' || !Number.isInteger(candidato.versao)) {
    return false
  }
  if (!VERSOES_ACEITAS.includes(candidato.versao)) {
    return false
  }
  if (candidato.unidades === null || typeof candidato.unidades !== 'object') {
    return false
  }

  for (const registro of Object.values(candidato.unidades as Record<string, unknown>)) {
    if (registro === null || typeof registro !== 'object') {
      return false
    }
    const unidade = registro as {
      aprovada?: unknown
      tentativas?: unknown
      melhorNota?: unknown
    }
    if (typeof unidade.aprovada !== 'boolean') {
      return false
    }
    if (typeof unidade.tentativas !== 'number' || !Number.isInteger(unidade.tentativas)) {
      return false
    }
    if (unidade.melhorNota !== null) {
      // O formato da nota é conferido: aceitar qualquer coisa aqui deixaria um
      // dado estranho entrar no domínio, onde ele quebraria a comparação.
      const nota = unidade.melhorNota as { acertos?: unknown; total?: unknown }
      if (
        nota === null ||
        typeof nota !== 'object' ||
        typeof nota.acertos !== 'number' ||
        typeof nota.total !== 'number'
      ) {
        return false
      }
    }

    // Cada marcador é conferido **segundo a versão em que ele nasceu**: até a
    // versão em que apareceu, ele pode faltar (a migração o cria); da versão em
    // que aparece em diante, ele é obrigatório. E se vier com outro tipo, o
    // registro inteiro é recusado — adivinhar o que aquele campo queria dizer
    // seria pior do que reconhecer que o arquivo não é confiável.
    const leitura = (unidade as { leituraFeita?: unknown }).leituraFeita
    if (candidato.versao >= 2 || leitura !== undefined) {
      if (typeof leitura !== 'boolean') {
        return false
      }
    }

    const exercicios = (unidade as { exerciciosResolvidos?: unknown }).exerciciosResolvidos
    if (candidato.versao >= 3 || exercicios !== undefined) {
      if (!Array.isArray(exercicios)) {
        return false
      }
      if (exercicios.some((item) => typeof item !== 'string')) {
        return false
      }
    }
  }

  return true
}

/**
 * Traz um progresso de formato antigo para o formato atual.
 *
 * As migrações, em ordem: a 1 → 2 acrescenta `leituraFeita: false`; a 2 → 3
 * acrescenta `exerciciosResolvidos: []`. Nenhuma delas **inventa** conquista:
 * quem não tinha o marcador não tinha marcado nada, e marcar por conta própria
 * seria atribuir ao estudante um ato que ele não praticou — e, no caso dos
 * exercícios, uma conferência que nunca aconteceu (D-047).
 *
 * Recebe um valor já aprovado por `ehProgressoValido`, e devolve sempre um
 * progresso na versão atual.
 */
export function migrarProgresso(valor: unknown): Progresso {
  const antigo = valor as {
    readonly versao: number
    readonly unidades: Record<
      string,
      Omit<ProgressoDaUnidade, 'leituraFeita' | 'exerciciosResolvidos'> & {
        readonly leituraFeita?: boolean
        readonly exerciciosResolvidos?: readonly string[]
      }
    >
  }

  const unidades: Record<string, ProgressoDaUnidade> = {}
  for (const [id, registro] of Object.entries(antigo.unidades)) {
    unidades[id] = {
      aprovada: registro.aprovada,
      tentativas: registro.tentativas,
      melhorNota: registro.melhorNota,
      leituraFeita: registro.leituraFeita ?? false,
      exerciciosResolvidos: [...(registro.exerciciosResolvidos ?? [])],
    }
  }

  return { versao: VERSAO_DO_PROGRESSO, unidades }
}

/** Lê o progresso. Nunca lança: qualquer falha vira aviso e progresso inicial. */
export function lerProgresso(armazenamento: Armazenamento | null): ResultadoDaLeitura {
  if (armazenamento === null) {
    return {
      progresso: progressoInicial(),
      aviso:
        'Este navegador não permite guardar dados no aparelho (modo privado ou armazenamento bloqueado). Você pode estudar normalmente, mas o progresso será perdido ao recarregar a página.',
    }
  }

  let bruto: string | null = null
  try {
    bruto = armazenamento.getItem(CHAVE_DO_PROGRESSO)
  } catch {
    return {
      progresso: progressoInicial(),
      aviso:
        'Não foi possível ler o progresso guardado neste navegador. O placar começa do zero, mas nada foi apagado.',
    }
  }

  if (bruto === null) {
    return { progresso: progressoInicial(), aviso: null }
  }

  let analisado: unknown
  try {
    analisado = JSON.parse(bruto)
  } catch {
    return {
      progresso: progressoInicial(),
      aviso:
        'O progresso guardado estava ilegível e foi ignorado. O placar começa do zero. Nada mais no navegador foi tocado.',
    }
  }

  if (!ehProgressoValido(analisado)) {
    // Um progresso de versão **mais nova** merece uma mensagem própria, e não a
    // de "formato inesperado": o problema não é o arquivo estar estragado, é
    // este programa ser antigo. Vale dizer também o que acontece com o dado —
    // ele não foi apagado agora, mas a próxima gravação passa por cima.
    const versaoLida = (analisado as { versao?: unknown }).versao
    if (typeof versaoLida === 'number' && versaoLida > VERSAO_DO_PROGRESSO) {
      return {
        progresso: progressoInicial(),
        aviso:
          `O progresso guardado foi criado por uma versão mais nova do Arquipélago (versão ` +
          `${versaoLida}, esta entende até a ${VERSAO_DO_PROGRESSO}) e não pôde ser lido. Nada foi ` +
          'apagado agora, mas o novo progresso será gravado por cima dele quando você estudar.',
      }
    }

    return {
      progresso: progressoInicial(),
      aviso:
        'O progresso guardado estava em um formato inesperado e foi ignorado. O placar começa do zero.',
    }
  }

  // Daqui para baixo, o formato é de uma versão que este programa entende —
  // `ehProgressoValido` já recusou o resto. A migração é aplicada e o estudante
  // fica sabendo que o progresso dele veio de uma versão anterior.
  if (analisado.versao !== VERSAO_DO_PROGRESSO) {
    return {
      progresso: migrarProgresso(analisado),
      aviso:
        `O progresso guardado era de uma versão anterior do Arquipélago (versão ` +
        `${analisado.versao}). Ele foi aproveitado: nada foi perdido. Os marcadores que ` +
        'não existiam naquela versão — a leitura feita e os exercícios conferidos — começam ' +
        'vazios, porque não há registro de que tenham acontecido.',
    }
  }

  // Nesta altura o formato é o atual e `ehProgressoValido` já conferiu que
  // `leituraFeita` é booleano em toda unidade: é um `Progresso` de verdade.
  return { progresso: migrarProgresso(analisado), aviso: null }
}

/** Grava o progresso. Devolve se deu certo — e não engole a falha. */
export function gravarProgresso(
  armazenamento: Armazenamento | null,
  progresso: Progresso,
): ResultadoDaEscrita {
  if (armazenamento === null) {
    return {
      ok: false,
      aviso:
        'Este navegador não permite guardar dados, então o progresso não foi salvo. Recarregar a página volta ao início.',
    }
  }

  try {
    // Gravar um progresso sem nenhuma unidade seria deixar lixo guardado: o
    // arquivo diria exatamente o mesmo que a ausência dele. Nesse caso a chave
    // é removida. É o que faz "apagar meu progresso" terminar com o
    // armazenamento limpo de verdade, mesmo que um efeito de gravação rode
    // logo depois.
    if (Object.keys(progresso.unidades).length === 0) {
      armazenamento.removeItem(CHAVE_DO_PROGRESSO)
      return { ok: true, aviso: null }
    }

    armazenamento.setItem(CHAVE_DO_PROGRESSO, JSON.stringify(progresso))
    return { ok: true, aviso: null }
  } catch {
    return {
      ok: false,
      aviso:
        'Não foi possível salvar o progresso: o armazenamento do navegador está cheio ou bloqueado. O que está na tela continua valendo nesta sessão, mas será perdido ao recarregar.',
    }
  }
}

/**
 * Apaga **somente** o progresso desta aplicação.
 *
 * `localStorage.clear()` é proibido: ele apaga dados de todos os sites dessa
 * origem, e o estudante não tem como saber o que mais perdeu.
 */
export function apagarProgresso(armazenamento: Armazenamento | null): ResultadoDaEscrita {
  if (armazenamento === null) {
    return { ok: false, aviso: 'Não há armazenamento acessível para apagar.' }
  }

  try {
    const chaves = chavesDaAplicacao(armazenamento)
    for (const chave of chaves) {
      armazenamento.removeItem(chave)
    }
    return { ok: true, aviso: null }
  } catch {
    return {
      ok: false,
      aviso: 'Não foi possível apagar o progresso guardado. Nada foi alterado.',
    }
  }
}

/** Chaves desta aplicação presentes no armazenamento. Nenhuma de outro site. */
export function chavesDaAplicacao(armazenamento: Armazenamento): readonly string[] {
  const chaves: string[] = []
  for (let indice = 0; indice < armazenamento.length; indice += 1) {
    const chave = armazenamento.key(indice)
    if (chave !== null && chave.startsWith(PREFIXO_DAS_CHAVES)) {
      chaves.push(chave)
    }
  }
  return chaves
}

/**
 * Acesso ao `localStorage` do navegador, ou `null` quando indisponível.
 * A tentativa de escrita é de propósito: alguns navegadores expõem o objeto e
 * recusam a gravação, e é isso que precisa ser detectado.
 */
export function armazenamentoDoNavegador(): Armazenamento | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }
    const teste = `${PREFIXO_DAS_CHAVES}teste`
    window.localStorage.setItem(teste, '1')
    window.localStorage.removeItem(teste)
    return window.localStorage
  } catch {
    return null
  }
}
