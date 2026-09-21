// @vitest-environment jsdom
/**
 * Teste da árvore 3D de verdade.
 *
 * O que este teste faz: monta o conteúdo real da cena — os mesmos componentes que
 * rodam no navegador — com o renderizador de teste do React Three Fiber. Não há
 * tela, não há GPU, não há pixel: o que existe é a **árvore de objetos 3D**.
 *
 * Por que ele existe: os outros testes do mundo conferem as regras (`mundoVisivel`),
 * a geometria (`geometria/`) e a página em DOM com a cena substituída por um dublê.
 * Nenhum deles responde à pergunta que sobra — *o mundo que aparece na tela é feito
 * do que o projeto promete?* Se alguém apagar a biblioteca de dentro da ilha, nenhum
 * teste anterior percebe. Este percebe.
 *
 * O que ele prova:
 *  - existe uma ilha por unidade planejada, e nenhuma a mais;
 *  - cada ilha tem biblioteca, mesa com computador e placa de missão — os três
 *    objetos do ciclo de estudo;
 *  - existe uma ponte para cada par vizinho, e nenhuma depois da última ilha;
 *  - a ponte liberada é exatamente a da unidade aprovada, decidida pelo domínio;
 *  - clicar no corpo da ilha escolhe aquela unidade, inclusive bloqueada;
 *  - clicar numa ponte pela metade NÃO atravessa, e a recusa vem de
 *    `decidirTravessia()` — a cena não inventa permissão nenhuma.
 *
 * O que ele NÃO prova: aparência, enquadramento, luz, desempenho e o resultado na
 * tela. Isso continua registrado como não verificado em `docs/TEST_REPORT.md`.
 */
import { describe, expect, it, vi } from 'vitest'
import ReactThreeTestRenderer from '@react-three/test-renderer'
import type { ReactThreeTest } from '@react-three/test-renderer'
import { useRef } from 'react'

declare global {
  // O React procura esta variável global para saber que está sob teste.
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { ConteudoDaCena } from './ConteudoDaCena'
import { decidirTravessia, ilhasVisiveis, pontesVisiveis } from './mundoVisivel'
import type { ArrastoPendente } from './CameraLivre'
import { SEM_TECLAS, type TeclasDeMovimento } from './camera/movimento'
import { chaoDoMundo, type ChaoDoMundo, type Localizacao } from './mapaCaminhavel'
import { caminhanteInicial, type Caminhante } from './avatar/passos'
import { CORES_DERIVADAS, CORES_DO_MUNDO } from '../ui/theme/paleta3d'
import { canalLinear, canais } from './geometria/pintura'
import { PLANO_DE_UNIDADES } from '../content/planoDeUnidades'
import { progressoInicial, registrarResultado } from '../learning/percurso'

const UNIDADES = PLANO_DE_UNIDADES
const UNIDADE_01 = UNIDADES[0]?.id ?? ''
const UNIDADE_02 = UNIDADES[1]?.id ?? ''

/**
 * Componente de apoio: os `ref`s que a cena espera, criados fora do `<Canvas>`.
 *
 * O arrasto e as teclas são mutáveis por natureza (são atualizados a cada quadro,
 * sem passar por estado do React). Na página, quem os cria é a casca `Cena`.
 */
type PropsDaCena = {
  readonly progresso: ReturnType<typeof progressoInicial>
  readonly modo?: 'andar' | 'voar' | 'mapa'
  readonly tecladoAtivo?: boolean
  readonly teclas?: React.RefObject<TeclasDeMovimento>
  readonly caminhante?: React.RefObject<Caminhante | null>
  readonly destino?: { readonly id: string; readonly pedido: number } | null
  readonly aoEscolher?: (unidadeId: string) => void
  readonly aoEscolherPonte?: (ponte: ReturnType<typeof pontesVisiveis>[number]) => void
  readonly aoMudarDeLugar?: (lugar: Localizacao) => void
  readonly aoNaoPoderCaminhar?: (motivo: string) => void
}

function CenaDeTeste({
  progresso,
  modo = 'voar',
  tecladoAtivo = true,
  teclas: teclasDeFora,
  caminhante: caminhanteDeFora,
  destino = null,
  aoEscolher = () => {},
  aoEscolherPonte = () => {},
  aoMudarDeLugar = () => {},
  aoNaoPoderCaminhar = () => {},
}: PropsDaCena) {
  const arrasto = useRef<ArrastoPendente>({ dx: 0, dy: 0 })
  const teclasProprias = useRef(SEM_TECLAS)
  const teclas = teclasDeFora ?? teclasProprias

  const ilhas = ilhasVisiveis(progresso, UNIDADES)
  const pontes = pontesVisiveis(progresso, UNIDADES, ilhas)
  const chao = chaoDoMundo(ilhas, pontes)
  const caminhanteProprio = useRef<Caminhante | null>(caminhanteInicial(chao))
  const caminhante = caminhanteDeFora ?? caminhanteProprio
  const olhar = useRef(0)

  return (
    <ConteudoDaCena
      ilhas={ilhas}
      pontes={pontes}
      chao={chao}
      modo={modo}
      tecladoAtivo={tecladoAtivo}
      teclas={teclas}
      arrasto={arrasto}
      caminhante={caminhante}
      olhar={olhar}
      enquadramento={null}
      espalhamento={30}
      destacadaId={null}
      destinoDeCaminhada={destino}
      aoChegar={() => {}}
      aoEscolher={aoEscolher}
      aoEscolherPonte={aoEscolherPonte}
      aoPassarPorCima={() => {}}
      aoMudarDeLugar={aoMudarDeLugar}
      aoNaoPoderCaminhar={aoNaoPoderCaminhar}
    />
  )
}

/** Progresso com a primeira unidade aprovada com nota máxima. */
function comPrimeiraAprovada() {
  return registrarResultado(progressoInicial(), UNIDADES, UNIDADE_01, { acertos: 5, total: 5 })
}

type No = ReactThreeTest.ReactThreeTestInstance

function comNome(no: No): string {
  return typeof no.props.name === 'string' ? no.props.name : ''
}

function nomesDentro(no: No): readonly string[] {
  return no.findAll((filho) => comNome(filho) !== '').map(comNome)
}

/** A altura do vértice mais alto de uma malha. */
function alturaDoTopoDaMalha(malha: No): number {
  const geometria = (malha.instance as unknown as {
    geometry?: { attributes?: { position?: { array: ArrayLike<number> } } }
  }).geometry
  const posicoes = geometria?.attributes?.position?.array
  if (posicoes === undefined) {
    return 0
  }
  let maior = Number.NEGATIVE_INFINITY
  for (let indice = 1; indice < posicoes.length; indice += 3) {
    maior = Math.max(maior, posicoes[indice] ?? 0)
  }
  return maior
}

/** Uma cor `0xRRGGBB` na escala linear, com o canal de cada componente. */
function corLinear(hex: number): readonly number[] {
  return canais(hex).map(canalLinear)
}

/** A posição do próprio objeto, sem contar os pais. */
function posicaoLocal(no: No): { readonly x: number; readonly y: number; readonly z: number } {
  const position = (no.instance as unknown as { position?: { x: number; y: number; z: number } })
    .position
  return { x: position?.x ?? 0, y: position?.y ?? 0, z: position?.z ?? 0 }
}

/**
 * As medidas de uma malha: altura, largura, profundidade e os extremos em y.
 *
 * É assim que o teste reconhece um mastro sem depender de nome nem de ordem na
 * árvore: um mastro é alto (mais de cinco) e fino (menos de meia unidade de lado).
 */
function medidaDaMalha(malha: No): {
  readonly altura: number
  readonly largura: number
  readonly profundidade: number
  readonly minimoY: number
  readonly maximoY: number
} {
  const posicoes = posicoesDaMalha(malha)
  let minimoX = Number.POSITIVE_INFINITY
  let maximoX = Number.NEGATIVE_INFINITY
  let minimoY = Number.POSITIVE_INFINITY
  let maximoY = Number.NEGATIVE_INFINITY
  let minimoZ = Number.POSITIVE_INFINITY
  let maximoZ = Number.NEGATIVE_INFINITY

  for (let indice = 0; indice < posicoes.length; indice += 3) {
    minimoX = Math.min(minimoX, posicoes[indice] ?? 0)
    maximoX = Math.max(maximoX, posicoes[indice] ?? 0)
    minimoY = Math.min(minimoY, posicoes[indice + 1] ?? 0)
    maximoY = Math.max(maximoY, posicoes[indice + 1] ?? 0)
    minimoZ = Math.min(minimoZ, posicoes[indice + 2] ?? 0)
    maximoZ = Math.max(maximoZ, posicoes[indice + 2] ?? 0)
  }

  return {
    altura: maximoY - minimoY,
    largura: maximoX - minimoX,
    profundidade: maximoZ - minimoZ,
    minimoY,
    maximoY,
  }
}

/** As posições de uma malha, já em lista de números. */
function posicoesDaMalha(malha: No): ArrayLike<number> {
  const geometria = (malha.instance as unknown as {
    geometry?: { attributes?: { position?: { array: ArrayLike<number> } } }
  }).geometry
  const posicoes = geometria?.attributes?.position?.array
  if (posicoes === undefined) {
    throw new Error('A malha não tem posições — a árvore 3D mudou de forma?')
  }
  return posicoes
}

const raioEm = (posicoes: ArrayLike<number>, indice: number): number =>
  Math.hypot(posicoes[indice * 3] ?? 0, posicoes[indice * 3 + 2] ?? 0)

/**
 * O raio de cada coluna do **anel do topo** da pedra, na ordem das colunas.
 *
 * O anel do topo é plano (é o plano em que o capim se apoia), e é o começo da
 * lista — as faixas seguintes descem. As duas malhas da ilha são geradas com o
 * mesmo número de colunas e os mesmos ângulos, então a posição na lista é a
 * mesma direção em ambas.
 */
function bordaDoTopoDaPedra(malha: No): readonly number[] {
  const posicoes = posicoesDaMalha(malha)
  const colunas: number[] = []

  for (let indice = 0; indice < posicoes.length / 3; indice += 1) {
    // O anel do topo é a faixa de y zero no começo da lista.
    if (Math.abs(posicoes[indice * 3 + 1] ?? 0) > 1e-6) {
      break
    }
    colunas.push(raioEm(posicoes, indice))
  }

  return colunas
}

/** O raio de cada coluna do **anel externo** do capim: as últimas colunas da lista. */
function bordaExternaDoCapim(malha: No, quantas: number): readonly number[] {
  const posicoes = posicoesDaMalha(malha)
  const total = posicoes.length / 3
  const colunas: number[] = []
  for (let indice = total - quantas; indice < total; indice += 1) {
    colunas.push(raioEm(posicoes, indice))
  }
  return colunas
}

/** As malhas dentro de um objeto que trazem cor por vértice. */
function malhasComCorDeVertice(no: No): readonly No[] {
  return no
    .findAll((filho) => filho.instance.type === 'Mesh')
    .filter((filho) => {
      const geometria = (filho.instance as unknown as { geometry?: { attributes?: Record<string, unknown> } })
        .geometry
      return geometria?.attributes?.color !== undefined
    })
}

/** A cor do material de uma malha, como número `0xRRGGBB`. */
function corDoMaterial(malha: No): number {
  const material = (malha.instance as unknown as { material?: { color?: { getHex(): number } } }).material
  if (material?.color === undefined) {
    throw new Error('A malha não tem material com cor — a árvore 3D mudou de forma?')
  }
  return material.color.getHex()
}

/** As cores por vértice de uma malha, em sequência r, g, b. */
function coresDeVertice(malha: No): readonly number[] {
  const geometria = (malha.instance as unknown as {
    geometry?: { attributes?: { color?: { array: ArrayLike<number> } } }
  }).geometry
  const cores = geometria?.attributes?.color?.array
  if (cores === undefined) {
    throw new Error('A malha não tem cor por vértice')
  }
  return Array.from(cores)
}

/**
 * A altura da malha: a distância entre o ponto mais baixo e o mais alto.
 *
 * É assim que o teste separa o capim da pedra, e não pelo topo: a pedra também
 * passa um pouco de zero, porque a malha dela tem tremor vertical. O capim é uma
 * cúpula de poucos palmos; a pedra desce a altura inteira da ilha.
 */
function faixaVerticalDaMalha(malha: No): number {
  const geometria = (malha.instance as unknown as {
    geometry?: { attributes?: { position?: { array: ArrayLike<number> } } }
  }).geometry
  const posicoes = geometria?.attributes?.position?.array
  if (posicoes === undefined) {
    return 0
  }
  let menor = Number.POSITIVE_INFINITY
  let maior = Number.NEGATIVE_INFINITY
  for (let indice = 1; indice < posicoes.length; indice += 3) {
    menor = Math.min(menor, posicoes[indice] ?? 0)
    maior = Math.max(maior, posicoes[indice] ?? 0)
  }
  return maior - menor
}

/** Luminância média das cores por vértice, na escala linear. */
function luminanciaMedia(cores: readonly number[]): number {
  let soma = 0
  let quantidade = 0
  for (let indice = 0; indice < cores.length; indice += 3) {
    soma += 0.2126 * (cores[indice] ?? 0) + 0.7152 * (cores[indice + 1] ?? 0) + 0.0722 * (cores[indice + 2] ?? 0)
    quantidade += 1
  }
  return quantidade === 0 ? 0 : soma / quantidade
}

/** Saturação média das cores por vértice: a distância entre o maior e o menor canal. */
function saturacaoMedia(cores: readonly number[]): number {
  let soma = 0
  let quantidade = 0
  for (let indice = 0; indice < cores.length; indice += 3) {
    const canais = [cores[indice] ?? 0, cores[indice + 1] ?? 0, cores[indice + 2] ?? 0]
    soma += Math.max(...canais) - Math.min(...canais)
    quantidade += 1
  }
  return quantidade === 0 ? 0 : soma / quantidade
}

/**
 * O ponto mais fundo (y mínimo) das malhas dentro de um objeto.
 *
 * Serve para medir a **silhueta** sem olhar para a tela: a pedra de cada ilha
 * desce de 0 até a altura dela, então o ponto mais fundo é a altura da ilha —
 * o número que ficou diferente em cada uma quando as ilhas deixaram de ser
 * iguais.
 */
function pontoMaisFundo(no: No): number {
  let fundo = 0
  for (const malha of no.findAll((filho) => filho.instance.type === 'Mesh')) {
    const geometria = (malha.instance as unknown as {
      geometry?: { attributes?: { position?: { array: ArrayLike<number> } } }
    }).geometry
    const posicoes = geometria?.attributes?.position?.array
    if (posicoes === undefined) {
      continue
    }
    for (let indice = 1; indice < posicoes.length; indice += 3) {
      fundo = Math.min(fundo, posicoes[indice] ?? 0)
    }
  }
  return fundo
}

/**
 * Soma os vértices das malhas dentro de um objeto.
 *
 * Serve para medir o que a cena desenha sem olhar para a tela: uma ponte liberada
 * tem o dobro de tábuas da ponte pela metade (`gerarPonte`), então a contagem de
 * vértices é a diferença observável. É o que permite afirmar, com teste, que a
 * aprovação muda o desenho — e não só o estado guardado em algum lugar.
 */
function verticesDentro(no: No): number {
  return no
    .findAll((filho) => filho.instance.type === 'Mesh')
    .reduce((soma, filho) => {
      const geometria = (filho.instance as unknown as { geometry?: { attributes?: { position?: { count: number } } } })
        .geometry
      return soma + (geometria?.attributes?.position?.count ?? 0)
    }, 0)
}

describe('o mundo é feito do que o projeto promete', () => {
  it('tem uma ilha para cada unidade planejada, e nenhuma a mais', async () => {
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    const ids = cena.scene
      .findAll((no) => comNome(no).startsWith('ilha:'))
      .map((no) => comNome(no).replace('ilha:', ''))
      .sort()

    expect(ids).toEqual(UNIDADES.map((unidade) => unidade.id).sort())

    await cena.unmount()
  })

  it('cada ilha tem biblioteca, mesa com computador e placa de missão', async () => {
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    for (const unidade of UNIDADES) {
      const ilha = cena.scene.find((no) => comNome(no) === `ilha:${unidade.id}`)
      const nomes = nomesDentro(ilha)

      for (const parte of ['biblioteca', 'mesa', 'placa']) {
        expect(
          nomes,
          `A ilha «${unidade.titulo}» não tem ${parte}: o ciclo de estudo não teria onde acontecer no mundo 3D`,
        ).toContain(parte)
      }
    }

    await cena.unmount()
  })

  it('marca cada ilha com um farol de estado', async () => {
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    const farois = cena.scene.findAll((no) => comNome(no) === 'farol')
    expect(farois).toHaveLength(UNIDADES.length)

    await cena.unmount()
  })

  it('cada ilha tem um marco próprio, e nenhuma repete o da vizinha', async () => {
    // O defeito relatado por quem usa o mundo: "as ilhas estão todas iguais". A
    // árvore 3D prova o contrário agora — cada ilha carrega um marco diferente,
    // pelo próprio nome.
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    const marcos = cena.scene
      .findAll((no) => comNome(no).startsWith('marco:'))
      .map((no) => comNome(no).replace('marco:', ''))

    expect(marcos).toHaveLength(UNIDADES.length)
    expect(new Set(marcos).size, `Marcos repetidos: ${marcos.join(', ')}`).toBe(UNIDADES.length)

    await cena.unmount()
  })

  it('as pedras das ilhas têm tamanhos diferentes: não é a mesma ilha dez vezes', async () => {
    // A altura da pedra sai da identidade de cada ilha. Medida pela malha que a
    // cena realmente desenha (o ponto mais fundo de cada ilha), ela não pode ser
    // a mesma nas dez — era exatamente isso que fazia o mundo parecer repetido.
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    const profundidades = UNIDADES.map((unidade) => {
      const ilha = cena.scene.find((no) => comNome(no) === `ilha:${unidade.id}`)
      return Math.abs(pontoMaisFundo(ilha))
    })

    expect(new Set(profundidades.map((valor) => valor.toFixed(2))).size).toBe(UNIDADES.length)
    expect(Math.max(...profundidades) - Math.min(...profundidades)).toBeGreaterThan(1)

    await cena.unmount()
  })

  it('liga as ilhas vizinhas com pontes, e não cria ponte depois da última', async () => {
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    const pontes = cena.scene
      .findAll((no) => comNome(no).startsWith('ponte:'))
      .map((no) => comNome(no).replace('ponte:', '').split('->'))

    expect(pontes).toHaveLength(UNIDADES.length - 1)

    for (let indice = 0; indice < pontes.length; indice += 1) {
      expect(pontes[indice]?.[0]).toBe(UNIDADES[indice]?.id)
      expect(pontes[indice]?.[1]).toBe(UNIDADES[indice + 1]?.id)
    }

    await cena.unmount()
  })
})

describe('o mundo não é multiplicado por tinta (D-054)', () => {
  it('malha com cor por vértice é desenhada sem tinta no material', async () => {
    // O defeito: a pedra e o capim eram pintados por vértice **e** recebiam a cor
    // da situação no material. O Three.js multiplica as duas coisas, e as paredes
    // das ilhas saíam em #1a1714 — quase preto. Aqui se cobra o contrário: quem
    // traz a própria cor não recebe tinta (branco é o elemento neutro).
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    let conferidas = 0
    for (const unidade of UNIDADES) {
      const ilha = cena.scene.find((no) => comNome(no) === `ilha:${unidade.id}`)
      for (const malha of malhasComCorDeVertice(ilha)) {
        conferidas += 1
        expect(
          corDoMaterial(malha),
          `A malha pintada de «${unidade.titulo}» está recebendo tinta além da cor dos vértices`,
        ).toBe(0xffffff)
      }
    }

    // Duas por ilha: a pedra e o capim.
    expect(conferidas).toBe(UNIDADES.length * 2)

    await cena.unmount()
  })

  it('as cores por vértice estão na escala linear, e não em sRGB', async () => {
    // Um cinza médio de paleta (0,5 em sRGB) tem de chegar ao vértice como 0,2159,
    // que é a codificação linear. Se chegasse como 0,5, a pedra e o capim
    // sairiam claros demais na tela.
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    const todasAsCores: number[] = []
    for (const unidade of UNIDADES) {
      const ilha = cena.scene.find((no) => comNome(no) === `ilha:${unidade.id}`)
      for (const malha of malhasComCorDeVertice(ilha)) {
        todasAsCores.push(...coresDeVertice(malha))
      }
    }

    // Nenhum canal pode estar na faixa que só existe em sRGB: as cores da paleta
    // usadas no mundo são escuras, e em escala linear todas ficam abaixo de 0,8.
    expect(Math.max(...todasAsCores)).toBeLessThan(0.8)
    // E o capim, que é o mais claro do conjunto, continua bem acima do fundo.
    expect(Math.max(...todasAsCores)).toBeGreaterThan(0.05)

    await cena.unmount()
  })

  it('o capim é verde em todas as ilhas, inclusive nas de tom quente', async () => {
    // O tom da ilha é tempero, não tinta: a 45% do tom, a ilha de tom rosado
    // ficava com capim rosado. Este teste mede o capim de cada ilha e cobra que o
    // verde continue sendo o canal dominante.
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    for (const unidade of UNIDADES) {
      const ilha = cena.scene.find((no) => comNome(no) === `ilha:${unidade.id}`)
      const capim = malhasComCorDeVertice(ilha).find((malha) => faixaVerticalDaMalha(malha) < 1)
      if (capim === undefined) {
        throw new Error(`A ilha «${unidade.titulo}» não tem capim pintado`)
      }

      const cores = coresDeVertice(capim)
      const maiorPorCanal = [0, 1, 2].map((canal) => {
        let maior = 0
        for (let indice = canal; indice < cores.length; indice += 3) {
          maior = Math.max(maior, cores[indice] ?? 0)
        }
        return maior
      })

      expect(
        maiorPorCanal[1],
        `O capim de «${unidade.titulo}» deixou de ser verde: r=${maiorPorCanal[0]?.toFixed(3)}, g=${maiorPorCanal[1]?.toFixed(3)}, b=${maiorPorCanal[2]?.toFixed(3)}`,
      ).toBeGreaterThan(maiorPorCanal[0] ?? 0)
      expect(maiorPorCanal[1]).toBeGreaterThan(maiorPorCanal[2] ?? 0)
    }

    await cena.unmount()
  })

  it('a ilha ainda não liberada continua reconhecível pela própria pedra', async () => {
    // O estado da unidade saiu do material e entrou no gradiente. Se ele não
    // tivesse ido junto, a ilha bloqueada ficaria igual à liberada — e a pessoa
    // perderia a única pista visual de por onde começar.
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    const disponivel = cena.scene.find((no) => comNome(no) === `ilha:${UNIDADE_01}`)
    const bloqueada = cena.scene.find((no) => comNome(no) === `ilha:${UNIDADE_02}`)

    const pedraDe = (ilha: No) =>
      malhasComCorDeVertice(ilha).find((malha) => faixaVerticalDaMalha(malha) >= 1)

    const pedraDisponivel = pedraDe(disponivel)
    const pedraBloqueada = pedraDe(bloqueada)
    if (pedraDisponivel === undefined || pedraBloqueada === undefined) {
      throw new Error('Cada ilha deveria ter a pedra pintada')
    }

    const luz = luminanciaMedia(coresDeVertice(pedraDisponivel))
    const luzBloqueada = luminanciaMedia(coresDeVertice(pedraBloqueada))

    expect(
      luzBloqueada,
      'A pedra da ilha bloqueada deveria ser mais clara: ela se aproxima da névoa',
    ).toBeGreaterThan(luz)
    expect(saturacaoMedia(coresDeVertice(pedraBloqueada))).toBeLessThan(
      saturacaoMedia(coresDeVertice(pedraDisponivel)),
    )
    expect(luzBloqueada).toBeGreaterThan(luz * 1.5)

    await cena.unmount()
  })
})

describe('a ilha é o capim em cima da pedra, e não o contrário (D-055)', () => {
  it('a pedra termina no plano do topo e o capim cobre a pedra em toda direção', async () => {
    // Dois defeitos vistos na captura de tela, um em cada ponta desta conta:
    // a pedra subia **acima** do capim (bicos de até 0,72 virando mancha cinza no
    // verde) e a pedra aparecia **por fora** do capim (duas irregularidades de
    // borda sorteadas de forma independente). Aqui os dois são medidos na malha
    // que vai para a tela, ilha por ilha, direção por direção.
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    for (const unidade of UNIDADES) {
      const ilha = cena.scene.find((no) => comNome(no) === `ilha:${unidade.id}`)
      const pintadas = malhasComCorDeVertice(ilha)
      const pedra = pintadas.find((malha) => faixaVerticalDaMalha(malha) > 1)
      const capim = pintadas.find((malha) => faixaVerticalDaMalha(malha) <= 1)
      if (pedra === undefined || capim === undefined) {
        throw new Error(`A ilha «${unidade.titulo}» deveria ter pedra e capim`)
      }

      const topoDaPedra = alturaDoTopoDaMalha(pedra)
      expect(
        topoDaPedra,
        `A pedra de «${unidade.titulo}» passa acima do plano do topo em ${topoDaPedra.toFixed(3)}`,
      ).toBeLessThanOrEqual(0.001)

      // Coluna a coluna: as duas malhas usam os mesmos ângulos, então dá para
      // comparar direção por direção em vez de só o raio maior.
      const raiosDaPedra = bordaDoTopoDaPedra(pedra)
      const raiosDoCapim = bordaExternaDoCapim(capim, raiosDaPedra.length)
      expect(raiosDoCapim).toHaveLength(raiosDaPedra.length)

      raiosDaPedra.forEach((raioDaPedra, indice) => {
        const raioDoCapim = raiosDoCapim[indice] ?? 0
        expect(
          raioDoCapim,
          `Em «${unidade.titulo}», direção ${indice}: capim ${raioDoCapim.toFixed(2)} < pedra ${raioDaPedra.toFixed(2)}`,
        ).toBeGreaterThanOrEqual(raioDaPedra - 0.01)
      })
    }

    await cena.unmount()
  })
})

describe('as ilhas não terminam todas no mesmo bico (D-057)', () => {
  it('as pontas das ilhas são de tamanhos diferentes, do espinho ao toco', async () => {
    // Medido antes do conserto: as dez pontas tinham 0,02 do raio do topo — o
    // mesmo espinho. Vista de longe, a ponta é a única parte da ilha que aparece
    // sozinha contra o céu, e dez bicos iguais fazem a fileira parecer a mesma
    // ilha repetida.
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    const pontas: number[] = []
    for (const unidade of UNIDADES) {
      const ilha = cena.scene.find((no) => comNome(no) === `ilha:${unidade.id}`)
      const pedra = malhasComCorDeVertice(ilha).find((malha) => faixaVerticalDaMalha(malha) > 1)
      if (pedra === undefined) {
        throw new Error(`A ilha «${unidade.titulo}» deveria ter pedra`)
      }

      const posicoes = posicoesDaMalha(pedra)

      // A última faixa da pedra é a ponta: acha-se pela linha de y mais baixa.
      let maisBaixo = Number.POSITIVE_INFINITY
      for (let indice = 1; indice < posicoes.length; indice += 3) {
        maisBaixo = Math.min(maisBaixo, posicoes[indice] ?? 0)
      }
      let raioDaPonta = 0
      for (let indice = 0; indice < posicoes.length; indice += 3) {
        if (Math.abs((posicoes[indice + 1] ?? 0) - maisBaixo) > 1e-6) {
          continue
        }
        raioDaPonta = Math.max(
          raioDaPonta,
          Math.hypot(posicoes[indice] ?? 0, posicoes[indice + 2] ?? 0),
        )
      }
      pontas.push(raioDaPonta)
    }

    expect(pontas).toHaveLength(UNIDADES.length)
    const menor = Math.min(...pontas)
    const maior = Math.max(...pontas)
    expect(
      maior - menor,
      `Pontas medidas: ${pontas.map((p) => p.toFixed(2)).join(', ')}`,
    ).toBeGreaterThan(1)
    expect(menor).toBeLessThan(0.6)
    expect(maior).toBeGreaterThan(1.4)

    await cena.unmount()
  })
})

describe('a luz do mundo não tinge a pedra de mar (D-056)', () => {
  it('a meia-luz do chão é neutra — a cor do mar deixava a rocha azul', async () => {
    // A rocha da paleta é um cinza quente. Enquanto o chão da meia-luz foi a cor
    // do mar (`#3E8E96`), toda face virada para baixo — que é a parede da ilha
    // suspensa — era iluminada por um verde-azulado saturado, e a rocha saía
    // azul-petróleo: na tela, o arquipélago virou uma fileira de barbatanas.
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    const meiaLuz = cena.scene.findAll(
      (no) => (no.instance as unknown as { type?: string }).type === 'HemisphereLight',
    )
    expect(meiaLuz).toHaveLength(1)

    const cores = meiaLuz[0]?.props.args as [number, number, number]
    const chao = corLinear(cores[1] ?? 0)
    const mar = corLinear(CORES_DO_MUNDO.marFundo)

    const croma = Math.max(...chao) - Math.min(...chao)
    expect(croma, `O chão da luz está saturado demais: croma ${croma.toFixed(3)}`).toBeLessThan(0.1)

    const luminancia = (v: readonly number[]): number =>
      0.2126 * (v[0] ?? 0) + 0.7152 * (v[1] ?? 0) + 0.0722 * (v[2] ?? 0)
    const razao = luminancia(chao) / luminancia(mar)
    // A penumbra embaixo das ilhas tem de continuar: o chão da luz não pode ficar
    // nem claro demais (achata o relevo) nem escuro demais (volta o preto).
    expect(razao).toBeGreaterThan(0.75)
    expect(razao).toBeLessThan(1.25)

    await cena.unmount()
  })
})

describe('o farol de estado fica no alto de um mastro (D-056)', () => {
  it('cada ilha tem um mastro que sai do capim e sustenta o farol', async () => {
    // O farol é o sinal de estado que se vê de longe. Ele flutuava solto acima da
    // ilha: um losango escuro pequeno no céu claro, que na tela lia como entulho.
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    for (const unidade of UNIDADES) {
      const ilha = cena.scene.find((no) => comNome(no) === `ilha:${unidade.id}`)
      const farol = ilha.findAll((no) => comNome(no) === 'farol')[0]
      if (farol === undefined) {
        throw new Error(`A ilha «${unidade.titulo}» deveria ter farol`)
      }

      const malhas = farol.findAll(
        (no) => (no.instance as unknown as { type?: string }).type === 'Mesh',
      )
      expect(malhas.length, `«${unidade.titulo}»: farol sem mastro`).toBeGreaterThanOrEqual(2)

      const mastro = malhas.find((malha) => {
        const medida = medidaDaMalha(malha)
        return medida.altura >= 5 && medida.largura <= 0.3 && medida.profundidade <= 0.3
      })
      if (mastro === undefined) {
        throw new Error(`A ilha «${unidade.titulo}» tem farol, mas nenhuma malha parece mastro`)
      }

      // O mastro desce até o capim: a base fica no plano do topo, e o topo do
      // mastro chega no farol.
      const base = posicaoLocal(mastro).y + medidaDaMalha(mastro).minimoY
      const topoDoMastro = posicaoLocal(mastro).y + medidaDaMalha(mastro).maximoY
      expect(base, `O mastro de «${unidade.titulo}» flutua`).toBeLessThan(0.5)
      expect(base).toBeGreaterThan(-1)
      expect(topoDoMastro).toBeGreaterThan(6)
      expect(topoDoMastro).toBeLessThan(8)
    }

    await cena.unmount()
  })
})

describe('o céu tem nuvens, e nuvem não é cascalho (D-055)', () => {
  it('nenhuma nuvem é escura: as nuvens são desenhadas chapadas, sem luz', async () => {
    // As nuvens são claras de cor (#F1F4F9), mas a luz deste mundo vem de
    // meia-esfera — metade céu, metade mar —, então a face de baixo de cada uma
    // era iluminada pela cor do mar e a nuvem virava um caco escuro no céu claro.
    // A correção foi desenhar a nuvem sem luz; este teste cobra que continue.
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    const nuvens = cena.scene.findAll(
      (no) =>
        (no.instance as unknown as { type?: string }).type === 'Mesh' &&
        (no.instance as unknown as { geometry?: { attributes?: { color?: unknown } } }).geometry
          ?.attributes?.color === undefined &&
        corDoMaterial(no) === CORES_DERIVADAS.nuvem,
    )

    expect(nuvens.length).toBeGreaterThan(4)
    for (const nuvem of nuvens) {
      expect(
        (nuvem.instance as unknown as { material?: { type?: string } }).material?.type,
        'A nuvem voltou a receber luz: ela vai escurecer pela cor do mar',
      ).toBe('MeshBasicMaterial')
    }

    await cena.unmount()
  })
})

describe('as pontes seguem a decisão do domínio', () => {
  it('a ponte pela metade desenha menos tábuas que a ponte inteira', async () => {
    // O estado não fica escondido numa propriedade: ele muda o desenho. A ponte
    // bloqueada para na metade do vão (metade das tábuas), e é isso que o teste mede.
    const bloqueada = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )
    const verticesBloqueada = verticesDentro(
      bloqueada.scene.findAll((no) => comNome(no).startsWith('ponte:'))[0] as No,
    )

    const aprovada = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={comPrimeiraAprovada()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )
    const verticesLiberada = verticesDentro(
      aprovada.scene.findAll((no) => comNome(no).startsWith('ponte:'))[0] as No,
    )

    expect(verticesBloqueada).toBeGreaterThan(0)
    expect(verticesLiberada).toBeGreaterThan(verticesBloqueada)

    await bloqueada.unmount()
    await aprovada.unmount()
  })

  it('aprovar a primeira unidade não muda as pontes seguintes', async () => {
    // Só a ponte da unidade aprovada se abre. Se a cena liberasse as outras junto,
    // o mundo mostraria um caminho que o domínio não autoriza.
    const bloqueada = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )
    const aprovada = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={comPrimeiraAprovada()} aoEscolher={() => {}} aoEscolherPonte={() => {}} />,
    )

    const comparar = (cena: typeof bloqueada): readonly number[] =>
      cena.scene
        .findAll((no) => comNome(no).startsWith('ponte:'))
        .slice(1)
        .map((ponte) => verticesDentro(ponte))

    expect(comparar(aprovada)).toEqual(comparar(bloqueada))

    await bloqueada.unmount()
    await aprovada.unmount()
  })
})

describe('cliques no mundo', () => {
  it('clicar no corpo da ilha escolhe aquela unidade', async () => {
    const aoEscolher = vi.fn()
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste
        progresso={progressoInicial()}
        aoEscolher={aoEscolher}
        aoEscolherPonte={() => {}}
      />,
    )

    const corpoDaSegunda = cena.scene.find(
      (no) => comNome(no) === 'corpo' && no.parent !== null && comNome(no.parent) === `ilha:${UNIDADE_02}`,
    )

    await cena.fireEvent(corpoDaSegunda, 'click', {})

    expect(aoEscolher).toHaveBeenCalledWith(UNIDADE_02)

    await cena.unmount()
  })

  it('ilha bloqueada continua respondendo ao clique, para explicar o bloqueio', async () => {
    // A ilha bloqueada não pode abrir o estudo — quem impede é o domínio e a
    // interface. Mas ela precisa responder: silêncio no clique é o que faz o
    // estudante achar que o programa quebrou.
    const aoEscolher = vi.fn()
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste
        progresso={progressoInicial()}
        aoEscolher={aoEscolher}
        aoEscolherPonte={() => {}}
      />,
    )

    const ultima = UNIDADES[UNIDADES.length - 1]
    const corpoDaUltima = cena.scene.find(
      (no) => comNome(no) === 'corpo' && no.parent !== null && comNome(no.parent) === `ilha:${ultima?.id}`,
    )

    await cena.fireEvent(corpoDaUltima, 'click', {})

    expect(aoEscolher).toHaveBeenCalledWith(ultima?.id)

    await cena.unmount()
  })

  it('clicar numa ponte pela metade não atravessa: falta a aprovação', async () => {
    const aoEscolherPonte = vi.fn()
    const progresso = progressoInicial()
    const ilhas = ilhasVisiveis(progresso, UNIDADES)
    const pontes = pontesVisiveis(progresso, UNIDADES, ilhas)

    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste
        progresso={progresso}
        aoEscolher={() => {}}
        aoEscolherPonte={aoEscolherPonte}
      />,
    )

    const primeiraPonte = cena.scene.findAll((no) => comNome(no).startsWith('ponte:'))[0] as No
    await cena.fireEvent(primeiraPonte, 'click', {})

    // A cena avisou quem a desenha...
    expect(aoEscolherPonte).toHaveBeenCalledTimes(1)

    // ...e a decisão real, feita pela função do domínio, recusa a travessia.
    const ponteClicada = aoEscolherPonte.mock.calls[0]?.[0]
    const decisao = decidirTravessia(ponteClicada, ilhas)

    expect(decisao.tipo).toBe('recusar')
    if (decisao.tipo === 'recusar') {
      expect(decisao.motivo).toContain('80%')
    }

    expect(pontes[0]?.liberada).toBe(false)

    await cena.unmount()
  })

  it('depois da aprovação, a mesma ponte leva à ilha seguinte', async () => {
    const progresso = comPrimeiraAprovada()
    const ilhas = ilhasVisiveis(progresso, UNIDADES)
    const pontes = pontesVisiveis(progresso, UNIDADES, ilhas)

    const primeiraPonte = pontes[0]
    expect(primeiraPonte).toBeDefined()
    if (primeiraPonte === undefined) return

    const decisao = decidirTravessia(primeiraPonte, ilhas)

    expect(decisao.tipo).toBe('atravessar')
    if (decisao.tipo === 'atravessar') {
      expect(decisao.unidadeId).toBe(UNIDADE_02)
    }
  })
})

// ---------------------------------------------------------------------------
// O avatar: a pessoa no mundo
// ---------------------------------------------------------------------------

/** A posição do grupo do avatar na árvore 3D. */
function posicaoDoAvatar(cena: { scene: No }): { x: number; y: number; z: number } {
    const grupo = cena.scene.find((no) => comNome(no) === 'avatar')
    const posicao = grupo.instance.position as { x: number; y: number; z: number }
    return { x: posicao.x, y: posicao.y, z: posicao.z }
}

function chaoDe(progresso: ReturnType<typeof progressoInicial>): ChaoDoMundo {
  const ilhas = ilhasVisiveis(progresso, UNIDADES)
  return chaoDoMundo(ilhas, pontesVisiveis(progresso, UNIDADES, ilhas))
}

describe('o avatar no mundo', () => {
  it('existe, com corpo, cabeça e mochila', async () => {
    const cena = await ReactThreeTestRenderer.create(<CenaDeTeste progresso={progressoInicial()} />)

    const nomes = nomesDentro(cena.scene.find((no) => comNome(no) === 'avatar'))
    for (const parte of ['corpo', 'cabeca', 'mochila', 'braco-esquerdo', 'perna-direita']) {
      expect(nomes, `O avatar não tem ${parte}`).toContain(parte)
    }

    await cena.unmount()
  })

  it('começa no centro da primeira ilha, com os pés no capim', async () => {
    const progresso = progressoInicial()
    const ilhas = ilhasVisiveis(progresso, UNIDADES)
    const chao = chaoDe(progresso)
    const primeira = chao.ilhas[0]
    if (primeira === undefined) {
      throw new Error('Sem a primeira ilha não há mundo')
    }

    const cena = await ReactThreeTestRenderer.create(<CenaDeTeste progresso={progresso} />)
    await cena.advanceFrames(1, 0.016)

    const posicao = posicaoDoAvatar(cena)
    expect(posicao.x).toBeCloseTo(primeira.x, 4)
    expect(posicao.z).toBeCloseTo(primeira.z, 4)
    // A altura é a do capim naquele ponto — não é chute, é o que `chaoEm` diz.
    expect(posicao.y).toBeCloseTo(primeira.altura, 4)
    expect(ilhas[0]?.titulo.length).toBeGreaterThan(0)

    await cena.unmount()
  })

  it('no modo andar, segurar a tecla de frente desloca o avatar', async () => {
    const teclas = { current: { ...SEM_TECLAS, frente: true } }
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} modo="andar" teclas={teclas} />,
    )

    await cena.advanceFrames(1, 0.016)
    const antes = posicaoDoAvatar(cena)

    await cena.advanceFrames(30, 0.016)
    const depois = posicaoDoAvatar(cena)

    const andou = Math.hypot(depois.x - antes.x, depois.z - antes.z)
    expect(andou).toBeGreaterThan(1)

    await cena.unmount()
  })

  it('no modo voo, as mesmas teclas não movem o avatar', async () => {
    const teclas = { current: { ...SEM_TECLAS, frente: true } }
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progressoInicial()} modo="voar" teclas={teclas} />,
    )

    await cena.advanceFrames(1, 0.016)
    const antes = posicaoDoAvatar(cena)

    await cena.advanceFrames(30, 0.016)
    const depois = posicaoDoAvatar(cena)

    expect(depois.x).toBeCloseTo(antes.x, 6)
    expect(depois.z).toBeCloseTo(antes.z, 6)

    await cena.unmount()
  })

  it('com o painel aberto, o teclado não move ninguém', async () => {
    const teclas = { current: { ...SEM_TECLAS, frente: true } }
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste
        progresso={progressoInicial()}
        modo="andar"
        teclas={teclas}
        tecladoAtivo={false}
      />,
    )

    await cena.advanceFrames(1, 0.016)
    const antes = posicaoDoAvatar(cena)
    await cena.advanceFrames(30, 0.016)
    const depois = posicaoDoAvatar(cena)

    expect(depois.x).toBeCloseTo(antes.x, 6)
    expect(depois.z).toBeCloseTo(antes.z, 6)

    await cena.unmount()
  })

  it('em cima da ponte, os pés ficam no tabuleiro — não no capim nem no vazio', async () => {
    const progresso = comPrimeiraAprovada()
    const chao = chaoDe(progresso)
    const ponte = chao.pontes[0]
    if (ponte === undefined) {
      throw new Error('A primeira ponte deveria estar liberada')
    }

    const meio = {
      x: ponte.inicio.x + ponte.direcao[0] * (ponte.comprimento / 2),
      z: ponte.inicio.z + ponte.direcao[1] * (ponte.comprimento / 2),
    }
    const caminhante = { current: { x: meio.x, z: meio.z, giro: 0 } }

    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progresso} modo="andar" caminhante={caminhante} />,
    )
    await cena.advanceFrames(1, 0.016)

    const posicao = posicaoDoAvatar(cena)
    expect(posicao.x).toBeCloseTo(meio.x, 4)
    expect(posicao.z).toBeCloseTo(meio.z, 4)
    // O chão do meio da ponte está entre as duas alturas das ilhas.
    expect(posicao.y).toBeGreaterThan(ponte.inicio.altura)
    expect(posicao.y).toBeLessThan(ponte.alturaNoFim)

    await cena.unmount()
  })

  it('diz onde está: na ilha ao chegar, na ponte ao atravessar', async () => {
    const progresso = comPrimeiraAprovada()
    const chao = chaoDe(progresso)
    const ponte = chao.pontes[0]
    if (ponte === undefined) {
      throw new Error('A primeira ponte deveria estar liberada')
    }

    const lugares: (string | null)[] = []
    const caminhante = { current: caminhanteInicial(chao) }

    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste
        progresso={progresso}
        modo="andar"
        caminhante={caminhante}
        aoMudarDeLugar={(lugar) =>
          lugares.push(lugar === null ? null : lugar.tipo === 'ilha' ? lugar.id : `${lugar.de}->${lugar.para}`)
        }
      />,
    )

    await cena.advanceFrames(1, 0.016)
    expect(lugares).toEqual([UNIDADE_01])

    // Leva o avatar para o meio da ponte e deixa um quadro passar.
    caminhante.current = {
      x: ponte.inicio.x + ponte.direcao[0] * (ponte.comprimento / 2),
      z: ponte.inicio.z + ponte.direcao[1] * (ponte.comprimento / 2),
      giro: 0,
    }
    await cena.advanceFrames(1, 0.016)

    expect(lugares).toEqual([UNIDADE_01, `${UNIDADE_01}->${UNIDADE_02}`])

    await cena.unmount()
  })

  it('se o chão sumir debaixo dele, volta ao começo em vez de flutuar no vazio', async () => {
    const progresso = progressoInicial()
    const chao = chaoDe(progresso)
    const primeira = chao.ilhas[0]
    const segunda = chao.ilhas[1]
    if (primeira === undefined || segunda === undefined) {
      throw new Error('São necessárias ao menos duas ilhas')
    }

    // No meio do vão, onde não há chão nenhum.
    const caminhante = {
      current: { x: (primeira.x + segunda.x) / 2, z: (primeira.z + segunda.z) / 2, giro: 0 },
    }

    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste progresso={progresso} modo="andar" caminhante={caminhante} />,
    )
    await cena.advanceFrames(1, 0.016)

    const posicao = posicaoDoAvatar(cena)
    expect(posicao.x).toBeCloseTo(primeira.x, 4)
    expect(posicao.z).toBeCloseTo(primeira.z, 4)

    await cena.unmount()
  })
})

describe('pedir para ir a pé até outra ilha', () => {
  it('com a ponte inteira, o avatar atravessa e chega', async () => {
    const progresso = comPrimeiraAprovada()
    const chao = chaoDe(progresso)
    const destino = chao.ilhas[1]
    if (destino === undefined) {
      throw new Error('A segunda ilha deveria existir')
    }

    const caminhante = { current: caminhanteInicial(chao) }
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste
        progresso={progresso}
        modo="andar"
        caminhante={caminhante}
        destino={{ id: destino.id, pedido: 1 }}
      />,
    )

    // Uns segundos de caminhada: o suficiente para cruzar o vão.
    await cena.advanceFrames(60 * 6, 0.016)

    const posicao = posicaoDoAvatar(cena)
    expect(posicao.x).toBeCloseTo(destino.x, 2)
    expect(posicao.z).toBeCloseTo(destino.z, 2)

    await cena.unmount()
  })

  it('sem ponte inteira, avisa e não sai do lugar', async () => {
    const progresso = progressoInicial()
    const chao = chaoDe(progresso)
    const destino = chao.ilhas[2]
    if (destino === undefined) {
      throw new Error('A terceira ilha deveria existir')
    }

    const avisos: string[] = []
    const caminhante = { current: caminhanteInicial(chao) }
    const cena = await ReactThreeTestRenderer.create(
      <CenaDeTeste
        progresso={progresso}
        modo="andar"
        caminhante={caminhante}
        destino={{ id: destino.id, pedido: 1 }}
        aoNaoPoderCaminhar={(motivo) => avisos.push(motivo)}
      />,
    )

    await cena.advanceFrames(1, 0.016)
    const antes = posicaoDoAvatar(cena)
    await cena.advanceFrames(120, 0.016)
    const depois = posicaoDoAvatar(cena)

    expect(avisos).toHaveLength(1)
    expect(avisos[0]).toContain(destino.titulo)
    expect(avisos[0]).toContain('ponte')
    expect(depois.x).toBeCloseTo(antes.x, 6)
    expect(depois.z).toBeCloseTo(antes.z, 6)

    await cena.unmount()
  })
})
