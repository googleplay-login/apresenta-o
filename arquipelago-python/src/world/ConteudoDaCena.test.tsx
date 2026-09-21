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
import { SEM_TECLAS } from './camera/movimento'
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
function CenaDeTeste({
  progresso,
  aoEscolher,
  aoEscolherPonte,
}: {
  readonly progresso: ReturnType<typeof progressoInicial>
  readonly aoEscolher: (unidadeId: string) => void
  readonly aoEscolherPonte: (ponte: ReturnType<typeof pontesVisiveis>[number]) => void
}) {
  const arrasto = useRef<ArrastoPendente>({ dx: 0, dy: 0 })
  const teclas = useRef(SEM_TECLAS)
  const ilhas = ilhasVisiveis(progresso, UNIDADES)
  const pontes = pontesVisiveis(progresso, UNIDADES, ilhas)

  return (
    <ConteudoDaCena
      ilhas={ilhas}
      pontes={pontes}
      modo="voar"
      tecladoAtivo
      teclas={teclas}
      arrasto={arrasto}
      enquadramento={null}
      espalhamento={30}
      destacadaId={null}
      aoChegar={() => {}}
      aoEscolher={aoEscolher}
      aoEscolherPonte={aoEscolherPonte}
      aoPassarPorCima={() => {}}
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
