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
  gerarMesa,
  gerarPedra,
  gerarPlaca,
} from './geometria/solidos'
import { Malha3D } from './Malha'
import type { IlhaVisivel } from './mundoVisivel'
import { criarSorteador, entre } from './geometria/aleatorio'
import {
  CORES_DERIVADAS,
  CORES_DO_MUNDO,
  corDaIlha,
  corDaSituacao,
  corDeUnidadeBloqueada,
} from '../ui/theme/paleta3d'

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

    const rocha = pintarPorAltura(
      gerarRocha({
        ...ROCHA_PADRAO,
        semente,
        raioDoTopo: formato.raioDoTopo,
        altura: formato.altura,
        segmentosRadiais: formato.segmentosRadiais,
        aneis: formato.aneis,
        amplitude: formato.amplitude,
        expoenteDoPerfil: formato.expoenteDoPerfil,
      }),
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

    const escala = formato.raioDoTopo / 6

    return {
      rocha,
      capim,
      realce,
      marco,
      tom,
      posicoes: {
        biblioteca: posicaoNoCapim(formato.raioDoTopo, LUGARES_NA_ILHA.biblioteca),
        mesa: posicaoNoCapim(formato.raioDoTopo, LUGARES_NA_ILHA.mesa),
        placa: posicaoNoCapim(formato.raioDoTopo, LUGARES_NA_ILHA.placa),
        marco: posicaoNoCapim(formato.raioDoTopo, LUGARES_NA_ILHA.marco),
      },
      biblioteca: gerarBiblioteca({ largura: 2.1 * escala, altura: 1.7 * escala, profundidade: 1.6 * escala }),
      mesa: gerarMesa({ largura: 2.2 * escala, altura: 1.0 * escala }),
      placa: gerarPlaca({ altura: 2.2 * escala, largura: 1.5 * escala }),
      arvores: enfeites.map((enfeite) => gerarArvore({ altura: enfeite.altura, raio: enfeite.raio })),
      pedras: pedrasSoltas.map((pedra) => ({ ...pedra, malha: gerarPedra({ raio: pedra.raio }) })),
      enfeites,
    }
    // As dependências são **números**, e não o objeto da identidade: a identidade
    // é função pura de (índice, semente), e um objeto novo a cada renderização do
    // mundo faria a ilha inteira ser remontada sem necessidade.
  }, [ilha.semente, ilha.situacao, identidade.indice])

  const corDaEstrutura = corDaSituacao(ilha.situacao)
  // O marco mantém o tom da ilha; o que muda quando a unidade ainda não abriu é
  // ele ficar mais perto da névoa, como o capim e a rocha daquela ilha.
  const corDoMarco =
    ilha.situacao === 'bloqueada'
      ? misturar(pecas.tom, CORES_DO_MUNDO.nevoa, 0.4)
      : pecas.tom

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
          <Malha3D malha={pecas.biblioteca} cor={CORES_DERIVADAS.parede} />
        </group>

        <group name="mesa" position={[pecas.posicoes.mesa.x, 0, pecas.posicoes.mesa.z]}>
          <Malha3D malha={pecas.mesa} cor={CORES_DERIVADAS.poste} />
        </group>

        <group name="placa" position={[pecas.posicoes.placa.x, 0, pecas.posicoes.placa.z]}>
          <Malha3D malha={pecas.placa} cor={corDaEstrutura} />
        </group>

        {pecas.arvores.map((arvore, indice) => {
          const enfeite = pecas.enfeites[indice]
          return (
            <group key={`arvore-${indice}`} position={[enfeite?.x ?? 0, 0, enfeite?.z ?? 0]}>
              <Malha3D malha={arvore} cor={CORES_DERIVADAS.tronco} />
            </group>
          )
        })}

        {pecas.pedras.map((pedra, indice) => (
          <group key={`pedra-${indice}`} position={[pedra.x, 0, pedra.z]}>
            <Malha3D malha={pedra.malha} cor={CORES_DO_MUNDO.rochaClara} />
          </group>
        ))}
      </group>

      {/* Farol de estado: gira devagar acima da ilha. Cor diz o estado; a forma
          não muda, porque quem lê a cor também lê o painel e a lista em texto. */}
      <group name="farol" ref={farol} position={[0, 7.4, 0]}>
        <mesh>
          <octahedronGeometry args={[ilha.acessivel ? 0.62 : 0.42, 0]} />
          <meshLambertMaterial color={corDaEstrutura} flatShading />
        </mesh>
      </group>
    </group>
  )
}
