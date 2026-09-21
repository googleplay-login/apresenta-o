import { VERSAO_DO_PROGRESSO, progressoInicial, type Progresso } from '../learning/percurso'

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

/** Verdadeiro se o formato lido é um progresso utilizável. */
export function ehProgressoValido(valor: unknown): valor is Progresso {
  if (valor === null || typeof valor !== 'object') {
    return false
  }

  const candidato = valor as { versao?: unknown; unidades?: unknown }

  if (typeof candidato.versao !== 'number' || !Number.isInteger(candidato.versao)) {
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
  }

  return true
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
    return {
      progresso: progressoInicial(),
      aviso:
        'O progresso guardado estava em um formato inesperado e foi ignorado. O placar começa do zero.',
    }
  }

  if (analisado.versao !== VERSAO_DO_PROGRESSO) {
    // Quando existir migração, ela entra aqui. Enquanto não existir, a escolha
    // honesta é começar do zero e DIZER isso, e não fingir que migrou.
    return {
      progresso: progressoInicial(),
      aviso:
        `O progresso guardado é de uma versão anterior do Arquipélago (versão ${analisado.versao}, ` +
        `atual ${VERSAO_DO_PROGRESSO}) e não pôde ser aproveitado. O placar começa do zero.`,
    }
  }

  return { progresso: analisado, aviso: null }
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
