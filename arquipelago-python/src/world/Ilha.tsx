import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { ROCHA_PADRAO, TOPO_PADRAO, gerarRocha, gerarTopo } from './geometria/ilha'
import { pintarPorAltura } from './geometria/pintura'
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
  corDaRocha,
  corDaSituacao,
  corDoCapim,
} from '../ui/theme/paleta3d'

/**
 * Uma ilha do arquipélago: a pedra, o capim, as estruturas e o farol de estado.
 *
 * A ilha é montada uma única vez por semente (`useMemo`) e depois só é
 * posicionada no mundo. A cor de cada peça vem da paleta 3D, que por sua vez
 * vem dos tokens: aqui não existe valor de cor escrito à mão.
 *
 * O que a ilha **não** decide: se ela está liberada. Isso chega pronto em
 * `situacao`, calculado pelo domínio em `mundoVisivel.ts`. Se a regra de
 * aprovação mudar, ela muda em um lugar só.
 */

type Props = {
  readonly ilha: IlhaVisivel
  readonly destacada: boolean
  readonly aoEscolher: (unidadeId: string) => void
  readonly aoPassarPorCima: (unidadeId: string | null) => void
}

/** Nome do grupo que recebe o clique. Usado pelo teste da árvore 3D. */
const CORPO_DO_MUNDO = 'corpo'

/** Posições das estruturas no capim. Fixas, para toda ilha parecer habitada do mesmo jeito. */
const ESTRUTURAS = {
  biblioteca: { x: -2.7, z: -1.5, giro: Math.PI },
  mesa: { x: 1.7, z: 1.1, giro: Math.PI },
  placa: { x: 3.6, z: 2.3, giro: Math.PI * 0.75 },
} as const

export function Ilha({ ilha, destacada, aoEscolher, aoPassarPorCima }: Props) {
  const [sobre, setSobre] = useState(false)
  const farol = useRef<Group>(null)

  const pecas = useMemo(() => {
    const semente = ilha.semente
    const rocha = pintarPorAltura(gerarRocha({ ...ROCHA_PADRAO, semente }), {
      de: -ROCHA_PADRAO.altura,
      para: 0,
      corDe: CORES_DERIVADAS.rochaDoFundo,
      corPara: CORES_DERIVADAS.rochaDoAlto,
      degraus: 6,
    })
    const capim = pintarPorAltura(gerarTopo({ ...TOPO_PADRAO, semente }), {
      de: 0,
      para: 0.4,
      corDe: corDoCapim(ilha.situacao),
      corPara: CORES_DERIVADAS.capimClaro,
      degraus: 3,
    })

    // Enfeite determinístico: a mesma ilha tem sempre as mesmas árvores, e
    // ilhas diferentes têm enfeites diferentes. Nada de posição sorteada a cada
    // renderização, o que faria a paisagem tremer.
    const sortear = criarSorteador(semente + 101)
    const enfeites = Array.from({ length: 3 }, () => {
      const angulo = entre(sortear, 0, Math.PI * 2)
      const distancia = entre(sortear, 3.4, 4.8)
      return {
        x: Math.cos(angulo) * distancia,
        z: Math.sin(angulo) * distancia,
        altura: entre(sortear, 2.6, 3.8),
        raio: entre(sortear, 0.7, 1.0),
      }
    })

    const pedras = Array.from({ length: 4 }, (_, indice) => {
      const angulo = entre(sortear, 0, Math.PI * 2)
      const distancia = entre(sortear, 4.2, 5.4)
      return {
        x: Math.cos(angulo) * distancia,
        z: Math.sin(angulo) * distancia,
        raio: entre(sortear, 0.18, 0.34) * (indice % 2 === 0 ? 1 : 0.8),
      }
    })

    return {
      rocha,
      capim,
      biblioteca: gerarBiblioteca({ largura: 2.1, altura: 1.7, profundidade: 1.6 }),
      mesa: gerarMesa({ largura: 2.2, altura: 1.0 }),
      placa: gerarPlaca({ altura: 2.2, largura: 1.5 }),
      arvores: enfeites.map((enfeite) =>
        gerarArvore({ altura: enfeite.altura, raio: enfeite.raio }),
      ),
      pedras: pedras.map((pedra) => ({ ...pedra, malha: gerarPedra({ raio: pedra.raio }) })),
      enfeites,
    }
  }, [ilha.semente, ilha.situacao])

  const corDaEstrutura = corDaSituacao(ilha.situacao)

  useFrame((_, delta) => {
    if (farol.current !== null) {
      farol.current.rotation.y += delta * 0.6
    }
  })

  const interativo = ilha.acessivel

  return (
    <group name={`ilha:${ilha.id}`} position={[ilha.centro[0], ilha.centro[1], ilha.centro[2]]}>
      <Malha3D malha={pecas.rocha} cor={corDaRocha(ilha.situacao)} />
      <Malha3D malha={pecas.capim} cor={corDoCapim(ilha.situacao)} duasFaces />

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
          <Malha3D
            malha={pecas.capim}
            cor={corDaEstrutura}
            opacidade={sobre ? 0.42 : 0.22}
          />
        ) : null}

        <group name="biblioteca" position={[ESTRUTURAS.biblioteca.x, 0, ESTRUTURAS.biblioteca.z]} rotation={[0, ESTRUTURAS.biblioteca.giro, 0]}>
          <Malha3D malha={pecas.biblioteca} cor={CORES_DERIVADAS.parede} />
        </group>

        <group name="mesa" position={[ESTRUTURAS.mesa.x, 0, ESTRUTURAS.mesa.z]} rotation={[0, ESTRUTURAS.mesa.giro, 0]}>
          <Malha3D malha={pecas.mesa} cor={CORES_DERIVADAS.poste} />
        </group>

        <group name="placa" position={[ESTRUTURAS.placa.x, 0, ESTRUTURAS.placa.z]} rotation={[0, ESTRUTURAS.placa.giro, 0]}>
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
