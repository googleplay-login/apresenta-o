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
 * dividido em duas unidades (2a e 2b), totalizando 4 ilhas para 3 capítulos.
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
    situacao: 'planejada',
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
    situacao: 'planejada',
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
    situacao: 'planejada',
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
    situacao: 'planejada',
  },
]

/** Ordem das unidades planejadas, da primeira à última. */
export function idsEmOrdem(unidades: readonly UnidadePlanejada[]): readonly string[] {
  return [...unidades].sort((a, b) => a.ordem - b.ordem).map((unidade) => unidade.id)
}
