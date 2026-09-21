import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { ROCHA_PADRAO, TOPO_PADRAO, gerarRocha, gerarTopo } from './geometria/ilha'
import { pintarPorAltura, misturar } from './geometria/pintura'
import { gerarMarco } from './geometria/marcos'
import { LUGARES_NA_ILHA, posicaoNoCapim } from './geometria/identidade'
import {
  gerarArvore,
  gerarBiblioteca,
  gerarCaixa,
  gerarMesa,
  gerarPedra,
  gerarPlaca,
} from './geometria/solidos'
import { Malha3D } from './Malha'
import { gerarBandeira } from './geometria/solidos'
import type { FormaDeBandeira } from './geometria/solidos'
import { gerarObjetoDoTema, tipoDeObjetoDaTrilha } from './geometria/objetosDoTema'
import type { IdDeTrilha } from '../content/planoDeUnidades'
import type { IlhaVisivel } from './mundoVisivel'
import { criarSorteador, entre } from './geometria/aleatorio'
import {
  CORES_DERIVADAS,
  CORES_DO_MUNDO,
  corDaIlha,
  corDaSituacao,
  corDaTrilha,
  coresDaIlha,
  corDeUnidadeBloqueada,
} from '../ui/theme/paleta3d'
import { corNoOrcamentoDeLuz } from '../ui/theme/luzDoMundo'

/**
 * Uma ilha do arquipélago: a pedra, o capim, o marco, as estruturas do estudo e
 * o farol de estado.
 *
 * **Cada ilha é diferente das outras**, e de propósito. A silhueta (raio,
 * altura, número de lados, abertura do perfil), o marco, a vegetação e o tom
 * vêm de `geometria/identidade.ts`, que os deriva da semente da unidade e da
 * posição dela no percurso. Antes disso, o arquipélago era a mesma ilha repetida
 * dez vezes: dava para andar sem saber onde se estava.
 *
 * A ilha é montada uma vez por identidade (`useMemo`) e depois só é posicionada.
 * A cor de cada peça vem da paleta 3D, que por sua vez vem dos tokens: aqui não
 * existe valor de cor escrito à mão.
 *
 * Duas coisas que a ilha **não** decide:
 *
 *  - se ela está liberada: isso chega pronto em `situacao` e `acessivel`,
 *    calculados pelo domínio em `mundoVisivel.ts`;
 *  - onde ela fica: isso vem em `centro`, calculado por `mapaDoMundo.ts`,
 *    que também é quem usa o raio real da ilha para encostar a ponte.
 */

type Props = {
  readonly ilha: IlhaVisivel
  readonly destacada: boolean
  readonly aoEscolher: (unidadeId: string) => void
  readonly aoPassarPorCima: (unidadeId: string | null) => void
}

/** Nome do grupo que recebe o clique. Usado pelo teste da árvore 3D. */
const CORPO_DO_MUNDO = 'corpo'

/**
 * Quanto do tom da ilha entra no alto do capim.
 *
 * O tom é a assinatura da ilha, e o lugar dela é o **marco** — onde ele aparece
 * inteiro. No capim ele é tempero: a 45% (o primeiro valor que esteve aqui), uma
 * ilha de tom turquesa ficava com capim turquesa, e o capim deixava de ser capim.
 * A 22% a diferença entre as ilhas se vê, e o chão continua verde em todas.
 */
const TOM_NO_CAPIM = 0.22

/**
 * Altura do farol de estado acima do capim, e a largura do mastro dele.
 *
 * O farol é o sinal de estado que se vê de longe, e ele **flutuava solto** acima
 * da ilha: um losango escuro pequeno no céu claro, que na tela lia como entulho.
 * O mastro resolve sem tirar o sinal de longe — o farol continua onde estava, mas
 * agora se vê que está em cima de um poste, e não solto no ar.
 */
const ALTURA_DO_FAROL = 7.4

/**
 * Folga mínima, em radianos, entre um objeto do tema e as estruturas da ilha.
 *
 * O objeto do tema é do tamanho de uma árvore pequena, e as estruturas ficam em
 * lugares fixos (`LUGARES_NA_ILHA`). Sem esta folga, um disco voador podia nascer
 * dentro da biblioteca ou em cima do tabuleiro da ponte — e o defeito apareceria
 * só na captura de tela, que é o caminho mais caro possível para descobrir.
 */
const FOLGA_DAS_ESTRUTURAS = 0.5

/** Folga até a linha da ponte, em radianos: as ilhas se ligam ao longo de x. */
const FOLGA_DA_PONTE = 0.32

/**
 * A forma do pano de cada trilha (D-063).
 *
 * Quatro silhuetas, uma por parte do livro: quem olha o arquipélago de longe
 * separa os grupos pela forma, e a cor da trilha (a mesma do painel) confirma.
 * A trilha de aplicações web ainda não tem ilha, mas já tem forma: quando as
 * unidades dela existirem, não falta nada do lado do mundo.
 */
const FORMAS_DE_BANDEIRA: Readonly<Record<IdDeTrilha, FormaDeBandeira>> = {
  'conceitos-basicos': 'flamula',
  'invasao-alienigena': 'retangular',
  'visualizacao-de-dados': 'duas-caudas',
  'aplicacoes-web': 'quadrada',
}

/** Largura do mastro do farol. Fino o bastante para parecer um poste. */
const LARGURA_DO_MASTRO = 0.09

/** Quanto do mastro fica enterrado no capim, para não haver fresta na base. */
const FUNDO_DO_MASTRO = 0.3



/** A menor diferença entre dois ângulos, no intervalo de −π a π. */
function diferencaDeAngulo(um: number, outro: number): number {
  const volta = Math.PI * 2
  let diferenca = (um - outro) % volta
  if (diferenca > Math.PI) {
    diferenca -= volta
  }
  if (diferenca < -Math.PI) {
    diferenca += volta
  }
  return diferenca
}

/** Os ângulos já ocupados por uma estrutura, e o da linha da ponte (0 e π). */
function folgasDoAngulo(angulo: number): { readonly estruturas: number; readonly ponte: number } {
  let estruturas = Infinity
  for (const lugar of Object.values(LUGARES_NA_ILHA)) {
    estruturas = Math.min(estruturas, Math.abs(diferencaDeAngulo(angulo, lugar.angulo)))
  }
  const ponte = Math.min(
    Math.abs(diferencaDeAngulo(angulo, 0)),
    Math.abs(diferencaDeAngulo(angulo, Math.PI)),
  )
  return { estruturas, ponte }
}

/**
 * Um ângulo livre no capim para um objeto do tema.
 *
 * Sorteia e confere: dezesseis tentativas, e a primeira que respeitar as duas
 * folgas (das estruturas e da linha da ponte) é a escolhida. Se nenhuma passar —
 * o que é possível numa ilha pequena —, fica a **melhor** das dezesseis, e não a
 * última: usar a última poderia pôr o disco voador dentro da biblioteca.
 */
function escolherAnguloLivre(sortear: () => number): number {
  let melhor = 0
  let melhorFolga = -Infinity

  for (let tentativa = 0; tentativa < 16; tentativa += 1) {
    const angulo = entre(sortear, 0, Math.PI * 2)
    const folga = folgasDoAngulo(angulo)
    // A folga da ponte vale um pouco mais na escolha: encostar na linha da ponte
    // é pior do que encostar numa estrutura, porque a ponte é por onde se anda.
    const nota = Math.min(folga.estruturas, folga.ponte + 0.18)
    if (nota > melhorFolga) {
      melhor = angulo
      melhorFolga = nota
    }
    if (folga.estruturas >= FOLGA_DAS_ESTRUTURAS && folga.ponte >= FOLGA_DA_PONTE) {
      break
    }
  }

  return melhor
}

export function Ilha({ ilha, destacada, aoEscolher, aoPassarPorCima }: Props) {
  const [sobre, setSobre] = useState(false)
  const farol = useRef<Group>(null)
  const girando = useRef<(Group | null)[]>([])

  const identidade = ilha.identidade

  const pecas = useMemo(() => {
    const { semente } = ilha
    const formato = identidade.formato
    const tom = corDaIlha(identidade.tom)

    // A cor de estado entra nas **duas pontas** do gradiente: a malha é pintada
    // por vértice, e uma malha pintada não recebe tinta do material — se o estado
    // não estivesse aqui, a ilha bloqueada ficaria igual à liberada (ver
    // `Malha.tsx` e a decisão D-054).
    const comEstado = (cor: number): number =>
      ilha.situacao === 'bloqueada' ? corDeUnidadeBloqueada(cor) : cor

    // A pedra crua primeiro: é dela que sai a irregularidade da borda do topo, e
    // é ela que o capim recebe para nunca ficar mais estreito que a pedra. A
    // malha pintada guarda só posições e índices — a borda é lida aqui.
    const pedraCrua = gerarRocha({
      ...ROCHA_PADRAO,
      semente,
      raioDoTopo: formato.raioDoTopo,
      altura: formato.altura,
      segmentosRadiais: formato.segmentosRadiais,
      aneis: formato.aneis,
      amplitude: formato.amplitude,
      expoenteDoPerfil: formato.expoenteDoPerfil,
      pontaDoPerfil: formato.pontaDoPerfil,
    })

    const rocha = pintarPorAltura(
      pedraCrua,
      {
        de: -formato.altura,
        para: 0,
        corDe: comEstado(CORES_DERIVADAS.rochaDoFundo),
        corPara: comEstado(CORES_DERIVADAS.rochaDoAlto),
        degraus: 6,
      },
    )

    const capim = pintarPorAltura(
      gerarTopo({
        ...TOPO_PADRAO,
        semente,
        raio: formato.raioDoTopo,
        segmentosRadiais: formato.segmentosRadiais,
        amplitude: formato.amplitudeDaBorda,
        inclinacao: formato.inclinacaoDoCapim,
        // O capim é o teto da ilha: nunca mais estreito que a pedra embaixo dele.
        bordaMinima: pedraCrua.bordaDoTopo,
      }),
      {
        de: 0,
        para: 0.4,
        corDe: comEstado(CORES_DO_MUNDO.capim),
        // O alto do capim recebe um pouco do tom da ilha: é onde o tom aparece
        // na maior área da tela sem competir com a cor de estado, que fica na
        // base — a parte que diz "esta ilha ainda não abriu".
        corPara: comEstado(misturar(CORES_DERIVADAS.capimClaro, tom, TOM_NO_CAPIM)),
        degraus: 3,
      },
    )

    // Anel de destaque: a mesma cúpula do capim, pintada de uma cor só. Como
    // toda malha com cor por vértice é desenhada sem tinta, o realce carrega a
    // cor de estado dentro dele — e o valor da opacidade continua vindo do
    // componente, porque opacidade não é cor.
    const corDoRealce = corDaSituacao(ilha.situacao)
    const realce = pintarPorAltura(
      gerarTopo({
        ...TOPO_PADRAO,
        semente,
        raio: formato.raioDoTopo,
        segmentosRadiais: formato.segmentosRadiais,
        amplitude: formato.amplitudeDaBorda,
        inclinacao: formato.inclinacaoDoCapim,
      }),
      { de: 0, para: 1, corDe: corDoRealce, corPara: corDoRealce },
    )

    const marco = gerarMarco(identidade.marco, {
      raioDaIlha: formato.raioDoTopo,
      alturaDaIlha: formato.altura,
      semente,
    })

    // Enfeite determinístico: a mesma ilha tem sempre as mesmas árvores, e
    // ilhas diferentes têm enfeites diferentes — em quantidade e em lugar. Nada
    // de posição sorteada a cada renderização, o que faria a paisagem tremer.
    const sortear = criarSorteador(semente + 101)
    const { arvores, pedras, distanciaMinima, distanciaMaxima } = identidade.vegetacao

    const enfeites = Array.from({ length: arvores }, () => {
      const angulo = entre(sortear, 0, Math.PI * 2)
      const distancia = entre(sortear, distanciaMinima, distanciaMaxima) * formato.raioDoTopo
      return {
        x: Math.cos(angulo) * distancia,
        z: Math.sin(angulo) * distancia,
        altura: entre(sortear, 2.5, 4.1) * (formato.raioDoTopo / 6),
        raio: entre(sortear, 0.6, 1.05) * (formato.raioDoTopo / 6),
      }
    })

    const pedrasSoltas = Array.from({ length: pedras }, (_, indice) => {
      const angulo = entre(sortear, 0, Math.PI * 2)
      const distancia = entre(sortear, distanciaMinima * 1.12, Math.min(distanciaMaxima + 0.06, 0.95)) * formato.raioDoTopo
      return {
        x: Math.cos(angulo) * distancia,
        z: Math.sin(angulo) * distancia,
        raio: entre(sortear, 0.16, 0.34) * (indice % 2 === 0 ? 1 : 0.8),
      }
    })

    // Arbustos e flores entram por último no sorteio: as árvores e as pedras de
    // cada ilha continuam exatamente onde estavam (D-063).
    const arbustos = Array.from({ length: identidade.vegetacao.arbustos }, () => {
      const angulo = entre(sortear, 0, Math.PI * 2)
      const distancia = entre(sortear, distanciaMinima, Math.min(distanciaMaxima + 0.04, 0.9)) * formato.raioDoTopo
      return {
        x: Math.cos(angulo) * distancia,
        z: Math.sin(angulo) * distancia,
        raio: entre(sortear, 0.34, 0.72) * (formato.raioDoTopo / 6),
      }
    })

    const flores = Array.from({ length: identidade.vegetacao.flores }, () => {
      const angulo = entre(sortear, 0, Math.PI * 2)
      const distancia = entre(sortear, distanciaMinima * 0.9, distanciaMaxima) * formato.raioDoTopo
      return {
        x: Math.cos(angulo) * distancia,
        z: Math.sin(angulo) * distancia,
        raio: entre(sortear, 0.09, 0.16) * (formato.raioDoTopo / 6),
      }
    })

    // Os objetos do tema entram por último, e por dois motivos: os sorteios de
    // árvore, pedra, arbusto e flor não se movem (D-063), e o ângulo deles ainda
    // passa por um teste de folga contra as estruturas — o que só é possível
    // depois de todos os lugares conhecidos.
    const escala = formato.raioDoTopo / 6
    const objetos = Array.from({ length: identidade.vegetacao.objetos }, () => {
      const angulo = escolherAnguloLivre(sortear)
      const distancia =
        entre(sortear, distanciaMinima * 1.02, Math.min(distanciaMaxima + 0.02, 0.92)) * formato.raioDoTopo
      return {
        x: Math.cos(angulo) * distancia,
        z: Math.sin(angulo) * distancia,
        rotacaoY: entre(sortear, 0, Math.PI * 2),
      }
    })

    return {
      rocha,
      capim,
      realce,
      marco,
      tom,
      posicoes: {
        bandeira: posicaoNoCapim(formato.raioDoTopo, LUGARES_NA_ILHA.bandeira),
        biblioteca: posicaoNoCapim(formato.raioDoTopo, LUGARES_NA_ILHA.biblioteca),
        mesa: posicaoNoCapim(formato.raioDoTopo, LUGARES_NA_ILHA.mesa),
        placa: posicaoNoCapim(formato.raioDoTopo, LUGARES_NA_ILHA.placa),
        marco: posicaoNoCapim(formato.raioDoTopo, LUGARES_NA_ILHA.marco),
      },
      biblioteca: gerarBiblioteca({ largura: 2.1 * escala, altura: 1.7 * escala, profundidade: 1.6 * escala }),
      mesa: gerarMesa({ largura: 2.2 * escala, altura: 1.0 * escala }),
      placa: gerarPlaca({ altura: 2.2 * escala, largura: 1.5 * escala }),
      bandeira: gerarBandeira({
        forma: FORMAS_DE_BANDEIRA[ilha.trilha],
        altura: 2.6 * escala,
        largura: 1.15 * escala,
      }),
      mastro: gerarCaixa({
        largura: LARGURA_DO_MASTRO,
        altura: ALTURA_DO_FAROL + FUNDO_DO_MASTRO,
        profundidade: LARGURA_DO_MASTRO,
      }),
      arvores: enfeites.map((enfeite) => gerarArvore({ altura: enfeite.altura, raio: enfeite.raio })),
      pedras: pedrasSoltas.map((pedra) => ({ ...pedra, malha: gerarPedra({ raio: pedra.raio }) })),
      arbustos: arbustos.map((arbusto) => ({ ...arbusto, malha: gerarPedra({ raio: arbusto.raio }) })),
      flores: flores.map((flor) => ({ ...flor, malha: gerarPedra({ raio: flor.raio }) })),
      objetos,
      objeto: tipoDeObjetoDaTrilha(ilha.trilha),
      escala,
      enfeites,
    }
    // As dependências são **números**, e não o objeto da identidade: a identidade
    // é função pura de (índice, semente), e um objeto novo a cada renderização do
    // mundo faria a ilha inteira ser remontada sem necessidade.
  }, [ilha.semente, ilha.situacao, identidade.indice])

  const corDaEstrutura = corDaSituacao(ilha.situacao)
  // O marco mantém o tom da ilha; o que muda quando a unidade ainda não abriu é
  // ele ficar mais perto da névoa, como o capim e a rocha daquela ilha.
  //
  // A cor passa pelo **orçamento de luz** antes de virar material (D-060). Sem
  // ele, quatro dos doze tons chegavam à tela acima do teto do tone mapping — o
  // tom da ilha 6, quase branco, chegava a 1,46 e o marco virava uma silhueta
  // branca chapada, sem volume. A cor do capim não precisa disso: o tom entra
  // nela diluído em 22%, e o capim mais claro de todos fica em 0,63.
  const corDoMarco = corNoOrcamentoDeLuz(
    ilha.situacao === 'bloqueada'
      ? misturar(pecas.tom, CORES_DO_MUNDO.nevoa, 0.4)
      : pecas.tom,
  )

  // As estruturas vestem o tom da ilha (D-063): sem isto, as dezoito ilhas
  // desenhavam a mesma madeira e a mesma pedra, e a única coisa que mudava de uma
  // para a outra era o capim. Tudo passa pelo orçamento de luz, como o marco.
  const cores = coresDaIlha(identidade.tom)
  const corDaMadeira = corNoOrcamentoDeLuz(cores.madeira)
  const corDaPedra = corNoOrcamentoDeLuz(cores.pedra)
  const corDaCopa = corNoOrcamentoDeLuz(cores.copa)
  const corDoTronco = corNoOrcamentoDeLuz(cores.tronco)
  const corDoArbusto = corNoOrcamentoDeLuz(cores.arbusto)
  const corDaFlor = corNoOrcamentoDeLuz(cores.flor)
  // O acento dos objetos do tema é a cor da trilha — a mesma da bandeira e a
  // mesma do título do grupo na lista: uma cor por parte do livro (D-063).
  const corDoAcento = corNoOrcamentoDeLuz(corDaTrilha(ilha.trilha))

  /**
   * As malhas dos objetos do tema: **uma por objeto**, com as cores por vértice.
   *
   * São montadas aqui, e não no `useMemo` da ilha, porque dependem de cores que só
   * existem depois do orçamento de luz (D-060) — e o teste de cor do mundo cobra
   * que nada chegue à tela acima do teto. Cada objeto tem três papéis de cor: a
   * pedra e a madeira da ilha, mais o acento da trilha.
   */
  const objetosDoTema = useMemo(
    () =>
      pecas.objetos.map(() =>
        gerarObjetoDoTema({
          tipo: pecas.objeto,
          escala: pecas.escala,
          cores: { pedra: corDaPedra, madeira: corDaMadeira, acento: corDoAcento },
        }),
      ),
    [pecas.objetos, pecas.objeto, pecas.escala, corDaPedra, corDaMadeira, corDoAcento],
  )

  useFrame((_, delta) => {
    if (farol.current !== null) {
      farol.current.rotation.y += delta * 0.6
    }

    pecas.marco.girantes.forEach((parte, indice) => {
      const grupo = girando.current[indice]
      if (grupo !== null && grupo !== undefined) {
        grupo.rotation[parte.eixo] += delta * parte.voltasPorSegundo * Math.PI * 2
      }
    })
  })

  const interativo = ilha.acessivel

  return (
    <group name={`ilha:${ilha.id}`} position={[ilha.centro[0], ilha.centro[1], ilha.centro[2]]}>
      {/* Pedra e capim são pintados por vértice: a cor já vem na malha, e o
          estado da unidade está dentro da pintura. Passar tinta aqui seria
          multiplicar cor por cor — o defeito que deixou o mundo quase preto. */}
      <Malha3D malha={pecas.rocha} />
      <Malha3D malha={pecas.capim} duasFaces />

      <group
        // Nome com prefixo para o teste: o Grupo 2 é o corpo interativo da ilha, e
        // separa `ilha:*` (a posição onde ela está) de `corpo:*`, que é o que aceita
        // clique.
        name={CORPO_DO_MUNDO}
        onClick={(evento) => {
          evento.stopPropagation()
          aoEscolher(ilha.id)
        }}
        onPointerOver={(evento) => {
          evento.stopPropagation()
          setSobre(true)
          aoPassarPorCima(ilha.id)
        }}
        onPointerOut={() => {
          setSobre(false)
          aoPassarPorCima(null)
        }}
      >
        {/* Anel de destaque: some quando a ilha não pode ser visitada, para não
            sugerir um clique que não existe. */}
        {interativo && (sobre || destacada) ? (
          <Malha3D malha={pecas.realce} opacidade={sobre ? 0.42 : 0.22} />
        ) : null}

        {/* O marco: a construção que só esta ilha tem. Nome com o tipo, para o
            teste da árvore 3D conseguir cobrar que nenhuma ilha repete a do
            vizinho. */}
        <group
          name={`marco:${pecas.marco.tipo}`}
          position={[pecas.posicoes.marco.x, 0, pecas.posicoes.marco.z]}
        >
          <Malha3D malha={pecas.marco.fixo} cor={corDoMarco} />
          {pecas.marco.girantes.map((parte, indice) => (
            <group key={`giro-${indice}`} position={[parte.posicao[0], parte.posicao[1], parte.posicao[2]]}>
              <group
                ref={(no) => {
                  girando.current[indice] = no
                }}
              >
                <Malha3D malha={parte.malha} cor={corDoMarco} />
              </group>
            </group>
          ))}
        </group>

        <group name="biblioteca" position={[pecas.posicoes.biblioteca.x, 0, pecas.posicoes.biblioteca.z]}>
          {/* A parede é a cor mais clara do mundo e chega a 1,001 de radiação: passa
              pelo orçamento de luz como o marco e o avatar (D-060). */}
          <Malha3D malha={pecas.biblioteca} cor={corDaPedra} />
        </group>

        <group name="mesa" position={[pecas.posicoes.mesa.x, 0, pecas.posicoes.mesa.z]}>
          <Malha3D malha={pecas.mesa} cor={corDaMadeira} />
        </group>

        <group name="placa" position={[pecas.posicoes.placa.x, 0, pecas.posicoes.placa.z]}>
          <Malha3D malha={pecas.placa} cor={corDaEstrutura} />
        </group>

        {pecas.arvores.map((arvore, indice) => {
          const enfeite = pecas.enfeites[indice]
          return (
            <group key={`arvore-${indice}`} name={`arvore:${indice}`} position={[enfeite?.x ?? 0, 0, enfeite?.z ?? 0]}>
              {/* Duas cores, e não uma (D-060): o tronco é madeira e a copa é o
                  verde da conífera. Com uma cor só, a copa saía marrom e a árvore
                  virava um torrão de terra em pé. */}
              <Malha3D malha={arvore.tronco} cor={corDoTronco} />
              <Malha3D malha={arvore.copa} cor={corDaCopa} />
            </group>
          )
        })}

        {/* A bandeira da trilha: mesma forma e mesma cor para as ilhas da mesma
            parte do livro. O pano aponta para o lado de fora da ilha, e é a
            primeira coisa que se vê de longe. */}
        <group
          name={`bandeira:${ilha.trilha}`}
          position={[pecas.posicoes.bandeira.x, 0, pecas.posicoes.bandeira.z]}
        >
          <Malha3D malha={pecas.bandeira.mastro} cor={corDaMadeira} />
          <Malha3D malha={pecas.bandeira.pano} cor={corNoOrcamentoDeLuz(corDaTrilha(ilha.trilha))} />
        </group>

        {pecas.pedras.map((pedra, indice) => (
          <group key={`pedra-${indice}`} name={`pedra:${indice}`} position={[pedra.x, 0, pedra.z]}>
            <Malha3D malha={pedra.malha} cor={corDaPedra} />
          </group>
        ))}

        {/* Arbustos e flores: o que enche o capim e tira a cara de pastagem
            vazia que a captura mostrou (D-063). São a mesma malha da pedra solta
            — barata de gerar e de desenhar —, com outra cor e outro tamanho. */}
        {pecas.arbustos.map((arbusto, indice) => (
          <group key={`arbusto-${indice}`} name={`arbusto:${indice}`} position={[arbusto.x, 0, arbusto.z]}>
            <Malha3D malha={arbusto.malha} cor={corDoArbusto} />
          </group>
        ))}

        {pecas.flores.map((flor, indice) => (
          <group key={`flor-${indice}`} name={`flor:${indice}`} position={[flor.x, 0, flor.z]}>
            <Malha3D malha={flor.malha} cor={corDaFlor} />
          </group>
        ))}

        {/* Os objetos do tema da trilha: uma pilha de livros nas ilhas dos
            conceitos, um disco voador pousado nas do jogo, uma torre de barras nas
            de dados. É o que a segunda captura pediu — ilhas com características do
            assunto que está sendo ensinado, e não só ilhas diferentes entre si.
            Vão **pintados por vértice** (pedra e madeira da ilha, acento da
            trilha), que é o que mantém um desenho por objeto. */}
        {objetosDoTema.map((objeto, indice) => {
          const lugar = pecas.objetos[indice]
          return (
            <group
              key={`objeto-${indice}`}
              name={`objeto:${objeto.tipo}:${indice}`}
              position={[lugar?.x ?? 0, 0, lugar?.z ?? 0]}
              rotation={[0, lugar?.rotacaoY ?? 0, 0]}
            >
              <Malha3D malha={objeto.malha} duasFaces />
            </group>
          )
        })}
      </group>

      {/* Farol de estado: gira devagar acima da ilha, no alto do mastro. Cor diz o
          estado; a forma não muda, porque quem lê a cor também lê o painel e a
          lista em texto. */}
      <group name="farol" ref={farol} position={[0, ALTURA_DO_FAROL, 0]}>
        {/* O mastro desce do farol até o capim. A caixa nasce com a base em y = 0,
            então ela é deslocada para baixo o comprimento inteiro: assim a base
            fica enterrada no capim e o topo encosta no farol. */}
        <group position={[0, -(ALTURA_DO_FAROL + FUNDO_DO_MASTRO), 0]}>
          <Malha3D malha={pecas.mastro} cor={corDaMadeira} />
        </group>
        <mesh>
          <octahedronGeometry args={[ilha.acessivel ? 0.62 : 0.42, 0]} />
          <meshLambertMaterial color={corDaEstrutura} flatShading />
        </mesh>
      </group>
    </group>
  )
}
