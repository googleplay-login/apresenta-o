import { deslocarMalha, rotacionarMalha, type Malha } from './ilha'
import { gerarCaixa, gerarCilindro, montar } from './solidos'
import { canais, paraLinear, type Cor3D, type MalhaPintada } from './pintura'
import type { TipoDeTextura } from './texturas'
import type { IdDeTrilha } from '../../content/planoDeUnidades'

/**
 * Os objetos que dizem **de que parte do livro é a ilha**.
 *
 * A captura de tela de 21/09/2026 mostrou o arquipélago inteiro e disse o que
 * faltava: *"as ilhas poderiam ter caracteristicas do tema que ta sendo abordado,
 * elas estão todas sem vidas"*. Cada ilha já tinha o seu marco, a sua vegetação e
 * o seu tom (D-053), e desde o conserto do lote 6.1 o capim tem arbustos, flores e
 * a bandeira da trilha (D-063). O que faltava era isto: **objetos do assunto**.
 *
 * A regra é uma família de objeto por trilha, e não por unidade: a trilha é a
 * parte do livro (os conceitos, o jogo, os dados, a web), e é ela que o estudante
 * atravessa por várias ilhas. Assim os quatro objetos dizem a mesma coisa que a
 * bandeira diz — e a mesma cor de trilha aparece nos dois.
 *
 *   | trilha | objeto | por quê |
 *   | --- | --- | --- |
 *   | conceitos-basicos | pilha de livros | a parte do livro em que se estuda a linguagem |
 *   | invasao-alienigena | disco voador pousado | o jogo que a trilha constrói |
 *   | visualizacao-de-dados | torre de barras | o gráfico que o livro desenha e que aqui não roda |
 *   | aplicacoes-web | armário de servidor | o serviço que a trilha ainda vai escrever (lote 7) |
 *
 * Três decisões de construção, e todas por custo:
 *
 *  - **uma malha por objeto**, pintada por vértice. Cada objeto tem duas ou três
 *    cores (pedra, madeira e o acento da trilha), e a pintura por vértice resolve
 *    isso em **um** desenho por quadro, em vez de um por peça — o mundo inteiro
 *    cabe no orçamento de um celular modesto;
 *  - **nada de asset de terceiro**: caixa, cilindro e rotação, como o resto;
 *  - **matemática pura**: entra medida, sai vetor de posições, índices e cores —
 *    testável sem navegador, como a geometria toda.
 */

/** Qual objeto do tema uma trilha usa. Um por trilha, e sempre o mesmo. */
export type TipoDeObjetoDoTema =
  | 'pilha-de-livros'
  | 'disco-voador'
  | 'torre-de-barras'
  | 'armario-de-servidor'

/**
 * O papel da cor de cada peça — o nome do que a peça **é**, e não o nome da cor.
 *
 * Quem decide a cor é a ilha (as cores dela, e o acento da trilha), e é por isso
 * que o gerador recebe um mapa de papéis: a mesma pilha de livros fica com a
 * madeira da ilha 3 e a da ilha 17, que são cores diferentes — e as duas com o
 * acento da própria trilha.
 */
export type PapelDaCor = 'pedra' | 'madeira' | 'acento'

/**
 * O acabamento de cada objeto: a textura que ele veste e se a superfície é lisa.
 *
 * Mora aqui, e não no `Ilha.tsx`, porque é propriedade do objeto — quem desenha
 * não deveria saber que a torre de barras é de madeira e o disco voador é liso.
 * A textura é gerada por código em `geometria/texturas.ts` (D-064).
 */
const ACABAMENTO: Readonly<
  Record<TipoDeObjetoDoTema, { readonly textura?: TipoDeTextura; readonly suave: boolean }>
> = {
  // Livros: o papel da capa e das folhas pede o grão da palha.
  'pilha-de-livros': { textura: 'palha', suave: false },
  // Disco: casco curvo, e o único objeto do tema com superfície contínua — é o
  // que mais sofre com o facetado, e o que a captura viu como "bloco de Lego".
  'disco-voador': { suave: true },
  // Barras do gráfico: madeira pintada, como o resto da ilha.
  'torre-de-barras': { textura: 'madeira', suave: false },
  // Armário: chapas de metal. Sem textura: nenhuma das quatro serve, e forçar
  // uma delas deixaria a chapa com cara de madeira.
  'armario-de-servidor': { suave: false },
}

export type ParteDoObjeto = {
  readonly malha: Malha
  readonly papel: PapelDaCor
}

export type ObjetoDoTema = {
  readonly tipo: TipoDeObjetoDoTema
  readonly nome: string
  /** A textura do acabamento, quando existe uma que sirva. */
  readonly textura?: TipoDeTextura
  /** Superfície lisa (normais suavizadas) ou facetada (arestas vivas). */
  readonly suave: boolean
  /** A malha que vai para a cena: **uma**, com as cores por vértice. */
  readonly malha: MalhaPintada
  /** As peças antes da pintura, para o teste medir. Não vai para a cena. */
  readonly partes: readonly ParteDoObjeto[]
  /** Altura declarada, medida com escala 1 (ver o teste). */
  readonly alturaTotal: number
  /** Raio ocupado declarado, medido com escala 1 (ver o teste). */
  readonly raioOcupado: number
}

export const OBJETO_DA_TRILHA: Readonly<Record<IdDeTrilha, TipoDeObjetoDoTema>> = {
  'conceitos-basicos': 'pilha-de-livros',
  'invasao-alienigena': 'disco-voador',
  'visualizacao-de-dados': 'torre-de-barras',
  'aplicacoes-web': 'armario-de-servidor',
}

export function tipoDeObjetoDaTrilha(trilha: IdDeTrilha): TipoDeObjetoDoTema {
  return OBJETO_DA_TRILHA[trilha]
}

/** Junta as peças em uma malha só, dando a cada vértice a cor do seu papel. */
function pintarPartes(
  partes: readonly ParteDoObjeto[],
  cores: Readonly<Record<PapelDaCor, Cor3D>>,
): MalhaPintada {
  const posicoes: number[] = []
  const indices: number[] = []
  const coresDosVertices: number[] = []
  let deslocamento = 0

  for (const parte of partes) {
    const [r, g, b] = paraLinear(canais(cores[parte.papel]))
    const quantosVertices = parte.malha.posicoes.length / 3
    posicoes.push(...parte.malha.posicoes)
    for (const indice of parte.malha.indices) {
      indices.push(indice + deslocamento)
    }
    for (let vertice = 0; vertice < quantosVertices; vertice += 1) {
      coresDosVertices.push(r ?? 0, g ?? 0, b ?? 0)
    }
    deslocamento += quantosVertices
  }

  return { posicoes, indices, cores: coresDosVertices }
}

/**
 * A pilha de livros: o retrato da parte do livro em que se aprende a linguagem.
 *
 * Quatro livros empilhados, cada um girado um pouco em relação ao de baixo — o
 * desalinho é o que faz ler "pilha" de longe, e não "caixa baixa". As capas são a
 * madeira da ilha e as lombadas são o acento da trilha.
 */
function pilhaDeLivros(escala: number): readonly ParteDoObjeto[] {
  const partes: ParteDoObjeto[] = []
  const livros = [
    { altura: 0.24, largura: 1.12, profundidade: 0.78, giro: 0.1, deslocamento: 0.06 },
    { altura: 0.2, largura: 1.02, profundidade: 0.72, giro: -0.16, deslocamento: -0.08 },
    { altura: 0.26, largura: 1.16, profundidade: 0.8, giro: 0.05, deslocamento: 0.02 },
    { altura: 0.18, largura: 0.9, profundidade: 0.66, giro: 0.2, deslocamento: -0.04 },
  ]
  let alturaAcumulada = 0

  for (const livro of livros) {
    // A caixa nasce centrada; o giro acontece em volta do próprio centro, e depois
    // o livro sobe para o topo da pilha. Assim cada livro assenta no de baixo,
    // mesmo com o giro.
    const corpo = gerarCaixa({
      largura: livro.largura * escala,
      altura: livro.altura * escala,
      profundidade: livro.profundidade * escala,
      centro: { x: 0, y: 0, z: 0 },
    })
    partes.push({
      malha: deslocarMalha(rotacionarMalha(corpo, { eixo: 'y', angulo: livro.giro }), {
        x: livro.deslocamento * escala,
        y: (alturaAcumulada + livro.altura / 2) * escala,
        z: 0,
      }),
      papel: 'madeira',
    })
    alturaAcumulada += livro.altura
  }

  // A lombada de acento: uma tira fina na frente de cada livro, que é o que dá a
  // cor da trilha à pilha. Sem ela, a pilha inteira seria uma cor só.
  let alturaDaTira = 0
  for (const livro of livros) {
    const tira = gerarCaixa({
      largura: livro.largura * 0.72 * escala,
      altura: livro.altura * 0.5 * escala,
      profundidade: 0.04 * escala,
      centro: { x: 0, y: 0, z: 0 },
    })
    partes.push({
      malha: deslocarMalha(rotacionarMalha(tira, { eixo: 'y', angulo: livro.giro }), {
        x: livro.deslocamento * escala,
        y: (alturaDaTira + livro.altura / 2) * escala,
        z: (livro.profundidade / 2 + 0.02) * escala,
      }),
      papel: 'acento',
    })
    alturaDaTira += livro.altura
  }

  return partes
}

/**
 * O disco voador pousado: o retrato da trilha do jogo.
 *
 * Um anel largo encostado no capim (a borda), um casco baixo por cima e a cúpula
 * de acento no alto — mais a haste fina do sinal. É o objeto mais **baixo e mais
 * largo** dos quatro, de propósito: de longe ele é uma elipse, e não um poste.
 */
function discoVoador(escala: number): readonly ParteDoObjeto[] {
  const partes: ParteDoObjeto[] = []

  partes.push({
    malha: deslocarMalha(gerarCilindro({ raio: 0.95 * escala, altura: 0.08 * escala, lados: 14 }), {
      x: 0,
      y: 0.04 * escala,
      z: 0,
    }),
    papel: 'pedra',
  })
  partes.push({
    malha: deslocarMalha(gerarCilindro({ raio: 0.7 * escala, altura: 0.22 * escala, lados: 14 }), {
      x: 0,
      y: 0.19 * escala,
      z: 0,
    }),
    papel: 'pedra',
  })
  partes.push({
    malha: deslocarMalha(gerarCilindro({ raio: 0.36 * escala, altura: 0.3 * escala, lados: 12 }), {
      x: 0,
      y: 0.45 * escala,
      z: 0,
    }),
    papel: 'acento',
  })
  partes.push({
    malha: deslocarMalha(gerarCilindro({ raio: 0.045 * escala, altura: 0.34 * escala, lados: 6 }), {
      x: 0,
      y: 0.6 * escala,
      z: 0,
    }),
    papel: 'acento',
  })

  // As três janelas do casco: pequenos cubos encostados na borda do disco, que
  // separam o casco da sombra do próprio anel quando a luz vem de cima.
  for (const angulo of [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3]) {
    const janela = gerarCaixa({
      largura: 0.16 * escala,
      altura: 0.1 * escala,
      profundidade: 0.16 * escala,
      centro: { x: 0, y: 0, z: 0 },
    })
    partes.push({
      malha: deslocarMalha(rotacionarMalha(janela, { eixo: 'y', angulo }), {
        x: Math.cos(angulo) * 0.66 * escala,
        y: 0.2 * escala,
        z: Math.sin(angulo) * 0.66 * escala,
      }),
      papel: 'acento',
    })
  }

  return partes
}

/**
 * A torre de barras: o retrato da trilha de dados.
 *
 * Quatro colunas de alturas diferentes sobre uma laje, como o gráfico de barras
 * que o livro desenha — e que aqui **não roda** (medido: `matplotlib` não existe
 * nesta distribuição, D-062). O desenho do gráfico não roda; a ideia dele, sim:
 * cada coluna é um valor, e o que se lê de longe é a comparação.
 */
function torreDeBarras(escala: number): readonly ParteDoObjeto[] {
  const partes: ParteDoObjeto[] = []

  partes.push({
    malha: deslocarMalha(
      gerarCaixa({
        largura: 1.5 * escala,
        altura: 0.16 * escala,
        profundidade: 0.72 * escala,
        centro: { x: 0, y: 0, z: 0 },
      }),
      { x: 0, y: 0.08 * escala, z: 0 },
    ),
    papel: 'pedra',
  })

  const alturas = [0.5, 0.95, 0.7, 1.25]
  alturas.forEach((altura, indice) => {
    const x = (-0.51 + indice * 0.34) * escala
    partes.push({
      malha: deslocarMalha(
        gerarCaixa({
          largura: 0.24 * escala,
          altura: altura * escala,
          profundidade: 0.6 * escala,
          centro: { x: 0, y: 0, z: 0 },
        }),
        { x, y: (0.16 + altura / 2) * escala, z: 0 },
      ),
      papel: 'acento',
    })
  })

  return partes
}

/**
 * O armário de servidor: o retrato da trilha de aplicações web.
 *
 * Ainda não há ilha desta trilha (o lote 7 é quem a escreve), e o objeto existe
 * desde já por um motivo de teste: o mapa de objetos por trilha fica completo, e
 * o teste cobra que **toda** trilha tenha o seu — uma trilha nova que entrasse sem
 * objeto não passaria em silêncio.
 */
function armarioDeServidor(escala: number): readonly ParteDoObjeto[] {
  const partes: ParteDoObjeto[] = []

  partes.push({
    malha: deslocarMalha(
      gerarCaixa({
        largura: 1.0 * escala,
        altura: 0.14 * escala,
        profundidade: 0.8 * escala,
        centro: { x: 0, y: 0, z: 0 },
      }),
      { x: 0, y: 0.07 * escala, z: 0 },
    ),
    papel: 'pedra',
  })
  partes.push({
    malha: deslocarMalha(
      gerarCaixa({
        largura: 0.86 * escala,
        altura: 1.5 * escala,
        profundidade: 0.66 * escala,
        centro: { x: 0, y: 0, z: 0 },
      }),
      { x: 0, y: 0.89 * escala, z: 0 },
    ),
    papel: 'pedra',
  })

  for (const y of [0.42, 0.72, 1.02, 1.32]) {
    partes.push({
      malha: deslocarMalha(
        gerarCaixa({
          largura: 0.68 * escala,
          altura: 0.06 * escala,
          profundidade: 0.05 * escala,
          centro: { x: 0, y: 0, z: 0 },
        }),
        { x: 0, y: y * escala, z: 0.34 * escala },
      ),
      papel: 'acento',
    })
  }

  partes.push({
    malha: deslocarMalha(
      gerarCaixa({
        largura: 0.14 * escala,
        altura: 0.14 * escala,
        profundidade: 0.14 * escala,
        centro: { x: 0, y: 0, z: 0 },
      }),
      { x: 0.26 * escala, y: 1.68 * escala, z: 0.2 * escala },
    ),
    papel: 'acento',
  })

  return partes
}

/** O nome de cada objeto, do jeito que a tela e o relatório o chamam. */
export const NOMES_DOS_OBJETOS: Readonly<Record<TipoDeObjetoDoTema, string>> = {
  'pilha-de-livros': 'Pilha de livros',
  'disco-voador': 'Disco voador pousado',
  'torre-de-barras': 'Torre de barras',
  'armario-de-servidor': 'Armário de servidor',
}

/**
 * As medidas declaradas de cada objeto, com **escala 1**.
 *
 * Ficam aqui, e não escondidas no gerador, porque o teste as cobra contra a malha
 * montada: declarar menos do que a peça ocupa é o lado que morde — o objeto sairia
 * do capim sem ninguém ver no código (a lição de D-058).
 */
const MEDIDAS: Readonly<Record<TipoDeObjetoDoTema, { readonly altura: number; readonly raio: number }>> = {
  'pilha-de-livros': { altura: 0.88, raio: 0.8 },
  'disco-voador': { altura: 0.94, raio: 0.95 },
  // A torre de barras nasceu com 0,83 de raio declarado, e a peça ocupa 0,8319: a
  // **quina** da laje (0,75 por 0,36) passa mais longe do centro do que a barra
  // mais larga. É a mesma conta que errou nos marcos do lote 4 (D-058), e o teste
  // pegou de novo — declarar menos do que a peça ocupa é o lado que morde.
  'torre-de-barras': { altura: 1.41, raio: 0.84 },
  'armario-de-servidor': { altura: 1.75, raio: 0.64 },
}

const GERADORES: Readonly<Record<TipoDeObjetoDoTema, (escala: number) => readonly ParteDoObjeto[]>> = {
  'pilha-de-livros': pilhaDeLivros,
  'disco-voador': discoVoador,
  'torre-de-barras': torreDeBarras,
  'armario-de-servidor': armarioDeServidor,
}

export function gerarObjetoDoTema(opcoes: {
  readonly tipo: TipoDeObjetoDoTema
  readonly escala: number
  readonly cores: Readonly<Record<PapelDaCor, Cor3D>>
}): ObjetoDoTema {
  const { tipo, escala, cores } = opcoes
  const partes = GERADORES[tipo](escala)
  const medida = MEDIDAS[tipo]

  const acabamento = ACABAMENTO[tipo]

  return {
    tipo,
    nome: NOMES_DOS_OBJETOS[tipo],
    textura: acabamento.textura,
    suave: acabamento.suave,
    malha: pintarPartes(partes, cores),
    partes,
    alturaTotal: medida.altura * escala,
    raioOcupado: medida.raio * escala,
  }
}

/** A malha inteira de um objeto, para quem precisa medir (o teste) — pintada ou não. */
export function malhaDoObjeto(objeto: ObjetoDoTema): Malha {
  return montar(objeto.partes.map((parte) => parte.malha))
}
