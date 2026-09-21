/**
 * Plano das primeiras unidades de aprendizagem (as primeiras ilhas).
 *
 * ATENCAO - o que este arquivo NAO e:
 *  - nao e o estado de progresso do estudante (isso pertence a `src/learning/`,
 *    ainda nao implementado);
 *  - nao e conteudo de aula (isso pertence a `src/content/`, em etapa propria);
 *  - nao e o mapa completo do livro (esse e `docs/BOOK_MAP.md`).
 *
 * `situacao` descreve QUANTO NOS JA CONSTRUIMOS, nao o que o estudante pode
 * acessar. A separacao e proposital: misturar as duas coisas foi o erro que
 * queremos evitar quando o 3D existir.
 */
import type { ReferenciaLivro } from './referenciaLivro'

/** Quanto do trabalho de construcao ja foi feito para esta unidade. */
export type SituacaoDeConstrucao = 'planejada' | 'em-construcao' | 'pronta'

export type UnidadePlanejada = {
  /** Identificador estavel. Nao mudar depois de existir progresso salvo. */
  readonly id: string
  /** Ordem no percurso. 1 e a primeira unidade. */
  readonly ordem: number
  readonly titulo: string
  /** Uma linha sobre o que a unidade ensina. */
  readonly tema: string
  readonly referencia: ReferenciaLivro
  readonly situacao: SituacaoDeConstrucao
}

const PENDENTE = 'referencia-pendente' as const

/**
 * Decisao D-001 (docs/DECISIONS.md): o capitulo 2 do livro cobre variaveis,
 * strings, numeros e comentarios - denso demais para uma unica ilha. Foi
 * dividido em duas unidades (2a e 2b), totalizando 4 ilhas para os 3 primeiros
 * capitulos.
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
        'Instalacao e verificacao do Python, o que e o interpretador, execucao de um programa pelo terminal e leitura das primeiras mensagens de erro.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'planejada',
  },
  {
    id: 'u02-variaveis-e-print',
    ordem: 2,
    titulo: 'A Oficina das Variaveis',
    tema: 'Guardar valores em variaveis, imprimir na tela, lidar com numeros e comentar o codigo.',
    referencia: {
      capitulo: 2,
      tituloCapitulo: 'Variaveis e tipos de dados simples',
      recorteProposto:
        'Recorte 2a: o que sao variaveis, regras de nomes, funcao print(), inteiros e pontos flutuantes, conversao com str() e comentarios.',
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
      tituloCapitulo: 'Variaveis e tipos de dados simples',
      recorteProposto:
        'Recorte 2b: strings, aspas simples e duplas, mudanca de maiusculas e minusculas, espacos em branco, concatenacao e interpolacao moderna com f-strings.',
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
    tema: 'Criar listas, acessar pelo indice e alterar o conteudo de uma colecao ordenada.',
    referencia: {
      capitulo: 3,
      tituloCapitulo: 'Introducao as listas',
      recorteProposto:
        'Listas, indice comecando em zero, alterar, acrescentar e remover itens, ordenacao e o erro de indice fora do intervalo.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'planejada',
  },
]

/** Ordem das unidades planejadas, do primeiro ao ultimo. */
export function idsEmOrdem(unidades: readonly UnidadePlanejada[]): readonly string[] {
  return [...unidades].sort((a, b) => a.ordem - b.ordem).map((unidade) => unidade.id)
}
