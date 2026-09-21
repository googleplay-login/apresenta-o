/**
 * Tipos do conteúdo pedagógico.
 *
 * O conteúdo é **dado**, não componente. Isso permite três coisas que
 * interessam diretamente:
 *
 *  - validar o conteúdo por teste, sem montar tela (ver `validadorDeConteudo.ts`);
 *  - manter a aula longe do código de renderização, para que reescrever um texto
 *    não envolva mexer em componente;
 *  - garantir que a mesma aula apareça no mundo 3D e na alternativa acessível,
 *    porque as duas leem o mesmo dado.
 *
 * Todo o texto aqui dentro é **original**. O livro é fonte de estudo e mapa,
 * nunca texto a ser reproduzido — ver `docs/CONTENT_GUIDE.md`.
 */

/** Bloco da explicação. A ordem do vetor é a ordem em que o estudante lê. */
export type Bloco =
  | { readonly tipo: 'paragrafo'; readonly texto: string }
  | {
      readonly tipo: 'codigo'
      readonly linguagem: 'python' | 'terminal'
      /** Legenda opcional, para dizer o que aquele código mostra. */
      readonly legenda?: string
      readonly codigo: string
    }
  | { readonly tipo: 'destaque'; readonly titulo: string; readonly texto: string }
  | {
      /**
       * Aviso de que o livro é de 2015/2016 e algo mudou desde então.
       * Nunca corrige o autor: em 2015, aquilo era o certo.
       */
      readonly tipo: 'avisoDeVersao'
      readonly titulo: string
      readonly texto: string
    }
  | { readonly tipo: 'lista'; readonly titulo?: string; readonly itens: readonly string[] }

/** Exercício de prática. Sempre pede código escrito pelo estudante. */
export type Exercicio = {
  readonly id: string
  readonly enunciado: string
  /** Ajuda para quando travar. Opcional: nem todo exercício precisa. */
  readonly dica?: string
  /** O que conferir no próprio resultado, sem depender de correção automática. */
  readonly conferencia: string
  /** Solução de referência, para comparar **depois** de tentar. */
  readonly solucao: string
}

/** Pergunta de avaliação: quatro alternativas, uma correta. */
export type Pergunta = {
  readonly id: string
  readonly enunciado: string
  readonly alternativas: readonly string[]
  /** Índice da alternativa correta em `alternativas`. */
  readonly correta: number
  /** Explicação mostrada **depois** do envio, não antes. */
  readonly explicacao: string
}

/** Toda a unidade: o que se lê, o que se pratica e o que se responde. */
export type ConteudoDaUnidade = {
  /** Precisa bater com o `id` de `PLANO_DE_UNIDADES` — é conferido por teste. */
  readonly id: string
  /** O que o estudante vai saber fazer ao final. Capacidade, não assunto. */
  readonly missao: string
  readonly leitura: {
    /** Qual parte do livro ler. Sem número de página (D-010). */
    readonly parte: string
    readonly porque: string
  }
  readonly explicacao: readonly Bloco[]
  readonly pratica: readonly Exercicio[]
  /** Cinco perguntas. O mínimo de acertos é 4 — ver `src/learning/avaliacao.ts`. */
  readonly perguntas: readonly Pergunta[]
}
