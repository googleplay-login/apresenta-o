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
      /**
       * Motivo pelo qual este trecho **não** roda no console da ilha.
       *
       * O console de Python roda o que a pessoa digitar; alguns trechos do
       * conteúdo não fazem sentido lá — comando de terminal, exemplo que mostra
       * um erro de propósito, programa que pede dados pelo teclado. Em vez de
       * deixar o estudante descobrir isso travando a tela, o trecho diz por quê.
       */
      readonly naoRodaNoConsole?: string
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
  | {
      /**
       * Diagrama **nosso**, com as ideias que o livro também desenha.
       *
       * O livro tem figuras — a caixa da variável, os índices de uma string, as
       * posições de uma lista. Elas são de terceiros e não podem ser copiadas. O
       * que se aproveita é a **ideia**, e ela é redesenhada aqui como caixas de
       * texto: cada parte tem um rótulo e um valor. Desenho em texto tem duas
       * vantagens concretas além da licença — é lido em voz alta por leitor de
       * tela, e é conferido por teste.
       */
      readonly tipo: 'diagrama'
      readonly titulo: string
      /** Uma frase dizendo o que o desenho mostra. */
      readonly descricao: string
      readonly partes: readonly ParteDoDiagrama[]
      /**
       * Mostra os espaços das pontas como um sinal visível na tela.
       *
       * Existe por um motivo concreto: num diagrama sobre espaços em branco, o
       * espaço em branco é invisível — o desenho mostraria três resultados
       * idênticos e não explicaria nada. Ligado, o espaço das pontas aparece
       * como `·` e o diagrama ganha uma legenda dizendo isso. O valor guardado
       * continua sendo o texto de verdade: quem troca o sinal é só o desenho.
       */
      readonly espacosVisiveis?: boolean
    }

/** Uma caixa do diagrama: o rótulo em cima, o valor dentro, a nota embaixo. */
export type ParteDoDiagrama = {
  readonly rotulo: string
  readonly valor: string
  /** Explicação curta daquela parte. Opcional. */
  readonly nota?: string
}

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
  /** Motivo pelo qual a solução não roda no console da ilha. Opcional. */
  readonly naoRodaNoConsole?: string
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
    /**
     * O que procurar naquela parte, em pontos curtos.
     *
     * Existe porque "leia o capítulo 2" não é instrução: quem nunca estudou
     * programação lê as mesmas páginas e não sabe o que era para ficar. Estes
     * pontos são o que o estudante deve conseguir **reconhecer ao voltar**.
     */
    readonly oQueObservar: readonly string[]
    /**
     * O que fazer quando o livro não está em mãos.
     *
     * O projeto não pode supor que o estudante tenha o livro por perto — nem que
     * tenha o livro. Este texto diz, sem drama, que a leitura pode ficar para
     * depois e que a explicação original cobre o assunto.
     */
    readonly semOLivro: string
  }
  readonly explicacao: readonly Bloco[]
  readonly pratica: readonly Exercicio[]
  /** Cinco perguntas. O mínimo de acertos é 4 — ver `src/learning/avaliacao.ts`. */
  readonly perguntas: readonly Pergunta[]
}
