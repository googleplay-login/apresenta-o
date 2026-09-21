/**
 * Plano das primeiras unidades de aprendizagem (as primeiras ilhas).
 *
 * ATENÇÃO — o que este arquivo NÃO é:
 *  - não é o estado de progresso do estudante (isso vive em `src/learning/`);
 *  - não é conteúdo de aula (isso vem nas etapas 6 e 7);
 *  - não é o mapa completo do livro (esse é `docs/BOOK_MAP.md`).
 *
 * `situacao` descreve QUANTO NÓS JÁ CONSTRUÍMOS, não o que o estudante pode
 * acessar. A separação é proposital: misturar as duas coisas faria uma unidade
 * "planejada" parecer bloqueada por desempenho do estudante.
 */
import type { ReferenciaLivro } from './referenciaLivro'

/** Quanto do trabalho de construção já foi feito para esta unidade. */
export type SituacaoDeConstrucao = 'planejada' | 'em-construcao' | 'pronta'

export type UnidadePlanejada = {
  /** Identificador estável. Não mudar depois de existir progresso salvo. */
  readonly id: string
  /** Ordem no percurso. 1 é a primeira unidade. */
  readonly ordem: number
  readonly titulo: string
  /** Uma linha sobre o que a unidade ensina. */
  readonly tema: string
  readonly referencia: ReferenciaLivro
  readonly situacao: SituacaoDeConstrucao
}

const PENDENTE = 'referencia-pendente' as const

/**
 * Decisão D-001 (`docs/DECISIONS.md`): o capítulo 2 do livro cobre variáveis,
 * strings, números e comentários — denso demais para uma única ilha. Foi
 * dividido em duas unidades (2a e 2b).
 *
 * O plano começou com 4 ilhas para 3 capítulos. A Etapa 11 (lote 1) acrescentou
 * os capítulos 4 e 5 — uma ilha por capítulo, como no mapa do livro. Nenhuma
 * posição de ilha, ponte ou trilha é escrita à mão: tudo sai do índice da
 * unidade (D-049), e o título de capítulo que não foi conferido no sumário fica
 * marcado como tal, com a página em `null` (D-050).
 */
export const PLANO_DE_UNIDADES: readonly UnidadePlanejada[] = [
  {
    id: 'u01-primeiro-programa',
    ordem: 1,
    titulo: 'A Praia do Primeiro Programa',
    tema: 'Preparar o ambiente, conversar com o interpretador e escrever o primeiro programa.',
    referencia: {
      capitulo: 1,
      tituloCapitulo: 'Iniciando',
      recorteProposto:
        'Instalação e verificação do Python, o que é o interpretador, execução de um programa pelo terminal e leitura das primeiras mensagens de erro.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
  },
  {
    id: 'u02-variaveis-e-print',
    ordem: 2,
    titulo: 'A Oficina das Variáveis',
    tema: 'Guardar valores em variáveis, imprimir na tela, lidar com números e comentar o código.',
    referencia: {
      capitulo: 2,
      tituloCapitulo: 'Variáveis e tipos de dados simples',
      recorteProposto:
        'Recorte 2a: o que são variáveis, regras de nomes, a função print(), inteiros e pontos flutuantes, conversão com str() e comentários.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
  },
  {
    id: 'u03-strings-por-dentro',
    ordem: 3,
    titulo: 'A Ilha das Palavras',
    tema: 'Trabalhar com texto: juntar, separar, limpar, formatar e comparar strings.',
    referencia: {
      capitulo: 2,
      tituloCapitulo: 'Variáveis e tipos de dados simples',
      recorteProposto:
        'Recorte 2b: strings, aspas simples e duplas, mudança de maiúsculas e minúsculas, espaços em branco, concatenação e interpolação moderna com f-strings.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
  },
  {
    id: 'u04-listas-do-mercado',
    ordem: 4,
    titulo: 'As Listas do Mercado',
    tema: 'Criar listas, acessar pelo índice e alterar o conteúdo de uma coleção ordenada.',
    referencia: {
      capitulo: 3,
      tituloCapitulo: 'Introdução às listas',
      recorteProposto:
        'Listas, índice começando em zero, alterar, acrescentar e remover itens, ordenação e o erro de índice fora do intervalo.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
  },
  {
    id: 'u05-moinho-das-repeticoes',
    ordem: 5,
    titulo: 'O Moinho das Repetições',
    tema: 'Percorrer listas com for, gerar sequências com range() e trabalhar com pedaços: fatias, cópia e tuplas.',
    referencia: {
      capitulo: 4,
      // O sumário em português não foi conferido: o PDF não está em mãos, e o
      // texto da obra não está no repositório (D-010). O título do original fica
      // entre parênteses, com a pendência escrita — em vez de uma tradução
      // apresentada como se fosse o sumário.
      tituloCapitulo: 'Working with Lists (do original; título em português a confirmar)',
      recorteProposto:
        'Percorrer a lista com for, erros de recuo, números em sequência com range(), estatísticas simples, fatias, cópia de lista e tuplas.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
  },
  {
    id: 'u06-encruzilhada-das-decisoes',
    ordem: 6,
    titulo: 'A Encruzilhada das Decisões',
    tema: 'Fazer o programa escolher: comparações, if/elif/else e condições combinadas com and, or, not e in.',
    referencia: {
      capitulo: 5,
      // Mesmo caso do capítulo 4: número conferido, título em português não.
      tituloCapitulo: 'if Statements (do original; título em português a confirmar)',
      recorteProposto:
        'Testes condicionais com ==, !=, and, or, not e in, as três formas do if, e o uso de condições com listas.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
  },
]

/** Ordem das unidades planejadas, da primeira à última. */
export function idsEmOrdem(unidades: readonly UnidadePlanejada[]): readonly string[] {
  return [...unidades].sort((a, b) => a.ordem - b.ordem).map((unidade) => unidade.id)
}
