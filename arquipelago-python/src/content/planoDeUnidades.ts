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
  /** A que trilha do livro a unidade pertence. Ver `TRILHAS`. */
  readonly trilha: IdDeTrilha
}

/**
 * A que parte do livro uma unidade pertence.
 *
 * O livro tem duas metades, e elas não são a mesma coisa: a Parte I ensina
 * conceitos, capítulo a capítulo, e a Parte II é feita de **três projetos**, cada
 * um com três capítulos. Cada unidade declara a sua trilha, e a trilha declara o
 * que se espera dela — inclusive o que o **console** consegue rodar ali, que é a
 * diferença de verdade entre as duas metades (D-061).
 */
export type IdDeTrilha =
  | 'conceitos-basicos'
  | 'invasao-alienigena'
  | 'visualizacao-de-dados'
  | 'aplicacoes-web'

export type Trilha = {
  readonly id: IdDeTrilha
  readonly nome: string
  /** Número do projeto do livro, ou `null` quando a trilha é a dos conceitos. */
  readonly projeto: number | null
  /** Capítulos do livro que a trilha cobre, em ordem. */
  readonly capitulos: readonly number[]
  readonly resumo: string
  /** `'escrita'` quando todas as unidades da trilha já têm conteúdo. */
  readonly situacao: 'escrita' | 'planejada'
  /**
   * O que o console da ilha roda nesta trilha.
   *
   * Todo texto aqui é **medido** no console do projeto, e não deduzido: `import
   * pygame`, `import django` e `import matplotlib` foram executados no Pyodide
   * desta versão, e os três falham (D-061). A trilha dos conceitos é a única em
   * que o console roda tudo o que as unidades mostram.
   */
  readonly oConsoleRoda: string
}

/**
 * As trilhas do percurso, na ordem em que aparecem no livro.
 *
 * A trilha **planejada** é uma promessa de escopo já registrada em
 * `docs/BOOK_MAP.md` — ela existe aqui para que a unidade saiba onde vai entrar,
 * e o teste cobra que uma trilha marcada como `'escrita'` tenha unidades, e que
 * uma marcada como `'planejada'` não tenha nenhuma. Assim a lista não pode
 * envelhecer dizendo o que não é.
 */
export const TRILHAS: readonly Trilha[] = [
  {
    id: 'conceitos-basicos',
    nome: 'Conceitos básicos',
    projeto: null,
    capitulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    resumo:
      'A Parte I do livro: onze capítulos de conceito, um por capítulo, com o capítulo 2 dividido em dois recortes (D-001).',
    situacao: 'escrita',
    oConsoleRoda:
      'Tudo o que as unidades mostram roda neste console, com uma exceção já tratada: o teclado. O `input()` é recusado (D-051), e os trechos que o usam trazem a versão que roda aqui.',
  },
  {
    id: 'invasao-alienigena',
    nome: 'Projeto 1 — Invasão Alienígena',
    projeto: 1,
    capitulos: [12, 13, 14],
    resumo:
      'O primeiro projeto do livro: um jogo de nave que atira em uma frota de alienígenas, com vidas, pontos e níveis.',
    situacao: 'escrita',
    oConsoleRoda:
      'A **lógica** do jogo, em Python puro. O Pygame não existe aqui, e não é falta de instalação: medido, `import pygame` falha na distribuição do Pyodide que este projeto usa, e o pacote não está na lista dela — buscar fora exigiria baixar da internet, e este projeto não faz isso (D-040). O que roda é o que o jogo faz com os dados: a nave presa à borda, as balas que saem da tela, a frota que anda e desce, a colisão por retângulo, as vidas, os pontos e o nível que acelera.',
  },
  {
    id: 'visualizacao-de-dados',
    nome: 'Projeto 2 — Visualização de dados',
    projeto: 2,
    capitulos: [15, 16, 17],
    resumo:
      'O segundo projeto do livro: gerar dados, ler arquivos CSV e JSON e desenhar gráficos (matplotlib, Pygal, mapas e APIs).',
    situacao: 'escrita',
    oConsoleRoda:
      'A parte de **dados**, em Python puro — e ela é quase toda: medido, `csv`, `json`, `random`, `datetime`, `statistics`, `collections` e `urllib.parse` rodam neste console. Não rodam o desenho nem a busca: `import matplotlib` falha e o `numpy`/`pandas` que ele pede também (o `loadPackage` tentaria baixar do CDN, e a rede está bloqueada — D-040), e o `requests` do capítulo 17 não existe nesta distribuição. O que fica fora está declarado em cada unidade, e a resposta da API entra na ilha **já chegada**, como texto.',
  },
  {
    id: 'aplicacoes-web',
    nome: 'Projeto 3 — Aplicações web',
    projeto: 3,
    capitulos: [18, 19, 20],
    resumo:
      'O terceiro projeto do livro: um site com Django, contas de usuário, formulários e implantação.',
    situacao: 'planejada',
    oConsoleRoda:
      'O pedaço de **lógica** de uma aplicação web: a função que recebe os dados de um pedido e devolve a resposta. O Django não roda — medido, `import django` falha — e este projeto não levanta servidor nenhum: sem porta, sem rede e sem backend, que é o que as regras do projeto proíbem sem autorização (D-061).',
  },
]

/** A trilha de um identificador. Lança se o identificador não existir. */
export function trilhaDe(id: IdDeTrilha): Trilha {
  const encontrada = TRILHAS.find((trilha) => trilha.id === id)
  if (encontrada === undefined) {
    throw new Error(`Trilha desconhecida: ${id}`)
  }
  return encontrada
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
    trilha: 'conceitos-basicos',
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
    trilha: 'conceitos-basicos',
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
    trilha: 'conceitos-basicos',
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
    trilha: 'conceitos-basicos',
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
    trilha: 'conceitos-basicos',
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
    trilha: 'conceitos-basicos',
  },
  {
    id: 'u07-farol-dos-registros',
    ordem: 7,
    titulo: 'O Farol dos Registros',
    tema: 'Guardar valores por chave com dicionários: consultar, acrescentar, percorrer e aninhar estruturas.',
    referencia: {
      capitulo: 6,
      // O sumário em português não foi conferido: o PDF não está em mãos (D-010).
      tituloCapitulo: 'Dictionaries (do original; título em português a confirmar)',
      recorteProposto:
        'O que é um dicionário, acesso e alteração por chave, a consulta segura com get(), o erro de chave inexistente, as três formas de percorrer e o aninhamento de listas dentro de dicionários.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
    trilha: 'conceitos-basicos',
  },
  {
    id: 'u08-estacao-das-perguntas',
    ordem: 8,
    titulo: 'A Estação das Perguntas',
    tema: 'Fazer o programa perguntar com input(), converter o que veio do teclado e repetir com while até a condição mudar.',
    referencia: {
      capitulo: 7,
      // Mesmo caso dos capítulos anteriores: número conferido, título em português não.
      tituloCapitulo: 'User Input and while Loops (do original; título em português a confirmar)',
      recorteProposto:
        'A função input(), a conversão com int() e float(), o laço while com contador, break e continue, o uso de while com listas e o cuidado com o laço infinito.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
    trilha: 'conceitos-basicos',
  },
  {
    id: 'u09-oficina-das-funcoes',
    ordem: 9,
    titulo: 'A Oficina das Funções',
    tema: 'Escrever funções com parâmetros, devolver resultados com return, usar valores padrão e importar módulos.',
    referencia: {
      capitulo: 8,
      tituloCapitulo: 'Functions (do original; título em português a confirmar)',
      recorteProposto:
        'Definir funções, passar argumentos por posição e por palavra-chave, valores padrão, return e a diferença entre devolver e imprimir, funções que devolvem estruturas, listas recebidas por referência e importação de módulos.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
    trilha: 'conceitos-basicos',
  },
  {
    id: 'u10-torre-das-classes',
    ordem: 10,
    titulo: 'A Torre das Classes',
    tema: 'Criar classes com __init__, guardar dados em atributos, escrever métodos que mudam o estado e reaproveitar com herança.',
    referencia: {
      capitulo: 9,
      tituloCapitulo: 'Classes (do original; título em português a confirmar)',
      recorteProposto:
        'Criar e usar classes, o método __init__ e o self, atributos, valores padrão, métodos que alteram o estado, herança com super(), importação de classes e a biblioteca padrão.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
    trilha: 'conceitos-basicos',
  },
  {
    id: 'u11-arquivo-das-gavetas',
    ordem: 11,
    titulo: 'O Arquivo das Gavetas',
    tema: 'Gravar e ler arquivos, acrescentar sem apagar, tratar o arquivo que não existe e guardar dados com json.',
    referencia: {
      capitulo: 10,
      tituloCapitulo: 'Files and Exceptions (do original; título em português a confirmar)',
      recorteProposto:
        'Ler de um arquivo, escrever em um arquivo, acrescentar, exceções com try/except/else, e guardar dados com json.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
    trilha: 'conceitos-basicos',
  },
  {
    id: 'u12-balanca-dos-testes',
    ordem: 12,
    titulo: 'A Balança dos Testes',
    tema: 'Escrever testes com assert e com unittest, escolher os casos que importam e saber o que um teste não prova.',
    referencia: {
      capitulo: 11,
      tituloCapitulo: 'Testing Your Code (do original; título em português a confirmar)',
      recorteProposto:
        'Testar uma função, o que um caso de teste verifica, a classe TestCase com asserções, e o que fazer quando um teste falha.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
    trilha: 'conceitos-basicos',
  },
  {
    id: 'u13-estaleiro-da-nave',
    ordem: 13,
    titulo: 'O Estaleiro da Nave',
    tema:
      'As configurações do jogo, o laço que desenha cada quadro e a nave como um objeto que se move preso às bordas da janela.',
    referencia: {
      capitulo: 12,
      tituloCapitulo: 'Invasão Alienígena, primeira parte (do original; título em português a confirmar)',
      recorteProposto:
        'O primeiro recorte do projeto de jogo: as configurações do jogo em um lugar só, a janela, o laço de quadros com os eventos, a nave como classe com posição e o movimento preso às bordas.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
    trilha: 'invasao-alienigena',
  },
  {
    id: 'u14-enxame-dos-discos',
    ordem: 14,
    titulo: 'O Enxame dos Discos',
    tema:
      'As balas em lista — quem sai da tela é removido — e a frota montada por laços aninhados, que anda de lado e desce ao encostar na borda.',
    referencia: {
      capitulo: 13,
      tituloCapitulo: 'Invasão Alienígena, segunda parte (do original; título em português a confirmar)',
      recorteProposto:
        'O segundo recorte do projeto de jogo: acrescentar as balas, removê-las quando saem da tela, limitar quantas ficam no ar, montar a frota em fileiras com laços aninhados e fazer a frota andar e descer.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
    trilha: 'invasao-alienigena',
  },
  {
    id: 'u15-placar-da-batalha',
    ordem: 15,
    titulo: 'O Placar da Batalha',
    tema:
      'Colisão por retângulo, vidas que diminuem, pontos que sobem, nível que acelera a frota e o jogo que recomeça.',
    referencia: {
      capitulo: 14,
      tituloCapitulo: 'Invasão Alienígena, terceira parte (do original; título em português a confirmar)',
      recorteProposto:
        'O fecho do projeto de jogo: quando um tiro acerta um alienígena, quando a frota alcança a nave, vidas, pontos, o nível que aumenta com a frota derrotada e o jogo que termina e recomeça.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
    trilha: 'invasao-alienigena',
  },
  {
    id: 'u16-fabrica-de-dados',
    ordem: 16,
    titulo: 'A Fábrica de Dados',
    tema:
      'Dado produzido pelo programa: a caminhada que se acumula passo a passo, a contagem de frequências em um dicionário e a leitura do que apareceu.',
    referencia: {
      capitulo: 15,
      tituloCapitulo: 'Gerando dados (do original; título em português a confirmar)',
      recorteProposto:
        'O primeiro recorte do projeto de dados: um laço que produz os valores, a caminhada aleatória acumulada em uma lista, a contagem de quantas vezes cada resultado apareceu e a leitura do resultado com maior, menor e ordem.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
    trilha: 'visualizacao-de-dados',
  },
  {
    id: 'u17-caderno-de-dados',
    ordem: 17,
    titulo: 'O Caderno de Dados',
    tema:
      'Dado que vem de arquivo: abrir, ler valores separados por vírgula, converter texto em número, calcular e guardar o resultado em JSON.',
    referencia: {
      capitulo: 16,
      tituloCapitulo: 'Trabalhando com dados de arquivos (do original; título em português a confirmar)',
      recorteProposto:
        'O segundo recorte do projeto de dados: escrever e ler um arquivo de valores separados por vírgula, pular o cabeçalho, converter as colunas de texto para número, calcular a média e guardar e reler os registros em JSON.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
    trilha: 'visualizacao-de-dados',
  },
  {
    id: 'u18-estacao-de-escuta',
    ordem: 18,
    titulo: 'A Estação de Escuta',
    tema:
      'Dado que vem de fora: a resposta de uma API como texto, a estrutura aninhada, campos que faltam, resposta sem dado e a ordem que é do serviço.',
    referencia: {
      capitulo: 17,
      tituloCapitulo: 'Trabalhando com APIs (do original; título em português a confirmar)',
      recorteProposto:
        'O fecho do projeto de dados: a resposta de um serviço no formato JSON, transformar a resposta em estrutura, entrar campo por campo na lista que veio dentro dela, contar os registros sem o campo esperado, reconhecer a resposta que não trouxe dado e reordenar a lista pelo campo que interessa.',
      paginaImpressa: null,
      paginaPdf: null,
      status: PENDENTE,
    },
    situacao: 'pronta',
    trilha: 'visualizacao-de-dados',
  },
]

/** Ordem das unidades planejadas, da primeira à última. */
export function idsEmOrdem(unidades: readonly UnidadePlanejada[]): readonly string[] {
  return [...unidades].sort((a, b) => a.ordem - b.ordem).map((unidade) => unidade.id)
}
