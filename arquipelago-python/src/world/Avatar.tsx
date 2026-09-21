import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { CORES_DO_AVATAR } from '../ui/theme/paleta3d'
import type { TeclasDeMovimento } from './camera/movimento'
import {
  chaoEm,
  localizacaoEm,
  pontoPisavel,
  postoInicial,
  type ChaoDoMundo,
  type Localizacao,
  type PontoNoPlano,
} from './mapaCaminhavel'
import {
  caminhanteInicial,
  passoAMao,
  rotaAte,
  seguirRota,
  type Caminhante,
} from './avatar/passos'

/**
 * O avatar: a pessoa que anda pelo arquipélago.
 *
 * É a figura mais simples que ainda é gente — corpo, cabeça, braços e uma
 * mochila —, montada com primitivas do Three.js e pintada com as cores da marca.
 * Nada de modelo importado: o mundo é feito das nossas peças, e o avatar também.
 *
 * Três coisas que este componente faz e que não são óbvias:
 *
 *  - **a posição não é estado do React.** Ela muda a cada quadro; re-renderizar a
 *    árvore sessenta vezes por segundo seria desperdício. A posição vive num
 *    `ref` e é escrita direto no grupo do Three.js, como a câmera livre faz;
 *  - **o lugar onde ele está é estado do React**, mas só quando muda. O HUD
 *    precisa dizer "você está na ilha tal", e isso muda uma vez a cada travessia;
 *  - **o `chaoEm()` é conferido a cada quadro.** Se o chão sumir debaixo dele —
 *    progresso apagado, ponte que fecha —, o avatar volta ao começo da trilha em
 *    vez de ficar flutuando no vazio.
 *
 * O avatar é desenhado em todos os modos de câmera, mas só anda no modo "andar":
 * quem está voando pelo mapa vê onde a pessoa ficou.
 */

type Props = {
  readonly chao: ChaoDoMundo
  readonly caminhante: React.RefObject<Caminhante | null>
  /** Guinada e inclinação da câmera: o passo é relativo a para onde se olha. */
  readonly olhar: React.RefObject<number>
  /** `false` quando o foco está num painel: aí o teclado não move ninguém. */
  readonly tecladoAtivo: boolean
  readonly teclas: React.RefObject<TeclasDeMovimento>
  /** Destino pedido pela interface: uma ilha a alcançar a pé. */
  readonly destino: { readonly id: string; readonly pedido: number } | null
  readonly aoMudarDeLugar: (lugar: Localizacao) => void
  readonly aoNaoPoderCaminhar: (motivo: string) => void
}

export function Avatar({
  chao,
  caminhante,
  olhar,
  tecladoAtivo,
  teclas,
  destino,
  aoMudarDeLugar,
  aoNaoPoderCaminhar,
}: Props) {
  const grupo = useRef<Group>(null)
  const rota = useRef<readonly PontoNoPlano[]>([])
  const lugarAnterior = useRef<string | null>(null)
  const [, forcarReleitura] = useState(0)

  const posicaoInicial = useMemo(() => caminhanteInicial(chao), [chao])
  if (caminhante.current === null) {
    // `null` significa "ainda não começou a andar": o avatar nasce no centro da
    // primeira ilha.
    caminhante.current = posicaoInicial
  }

  // Destino pedido: calcula a rota uma vez, e diz com franqueza quando não há
  // caminho a pé. Inventar caminho por cima do vão seria pior que a recusa.
  useEffect(() => {
    if (destino === null) {
      return
    }

    const alvo = chao.ilhas.find((ilha) => ilha.id === destino.id)
    if (alvo === undefined) {
      return
    }

    const caminho = rotaAte(chao, caminhante.current ?? posicaoInicial, destino.id)
    if (caminho === null) {
      rota.current = []
      aoNaoPoderCaminhar(
        `Não há caminho a pé até «${alvo.titulo}»: falta uma ponte inteira no meio do trajeto. ` +
          'Use o voo livre ou a lista de ilhas para chegar lá.',
      )
      return
    }

    rota.current = caminho
  }, [destino, chao, caminhante, posicaoInicial, aoNaoPoderCaminhar])

  useFrame((_, deltaBruto) => {
    const delta = Math.min(Math.max(deltaBruto, 0), 0.1)
    const atual = caminhante.current ?? posicaoInicial

    // Chão que sumiu: volta ao começo da trilha, em vez de flutuar sobre o vazio.
    const onde = pontoPisavel(chao, atual) ? atual : postoInicial(chao)
    const giro = onde === atual ? atual.giro : 0
    let novo: Caminhante = { x: onde.x, z: onde.z, giro }

    if (rota.current.length > 0) {
      const caminhada = seguirRota(novo, rota.current, delta, teclas.current.rapido)
      novo = caminhada.caminhante
      rota.current = caminhada.restante
    } else if (tecladoAtivo) {
      novo = passoAMao(chao, novo, teclas.current, olhar.current, delta)
    }

    caminhante.current = novo

    const altura = chaoEm(chao, novo) ?? (chao.ilhas[0]?.altura ?? 0)
    if (grupo.current !== null) {
      grupo.current.position.set(novo.x, altura, novo.z)
      grupo.current.rotation.y = novo.giro
    }

    // O lugar entra no React só quando muda: é o que o HUD mostra.
    const local = localizacaoEm(chao, novo)
    const chave =
      local === null
        ? null
        : local.tipo === 'ilha'
          ? `ilha:${local.id}`
          : `ponte:${local.de}>${local.para}`

    if (chave !== lugarAnterior.current) {
      lugarAnterior.current = chave
      aoMudarDeLugar(local)
      // Uma releitura por troca de lugar: o HUD e a lista em texto passam a
      // apontar para onde a pessoa está. Não é por quadro — é por acontecimento.
      forcarReleitura((valor) => valor + 1)
    }
  })

  return (
    <group name="avatar" ref={grupo}>
      {/* Corpo: um cilindro de poucos lados, na altura de uma pessoa baixa, para
          parecer gente ao lado das estruturas de 1,7 a 2,2 unidades. */}
      <mesh name="corpo" position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.84, 8]} />
        <meshLambertMaterial color={CORES_DO_AVATAR.corpo} flatShading />
      </mesh>

      <mesh name="cabeca" position={[0, 1.24, 0]}>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshLambertMaterial color={CORES_DO_AVATAR.cabeca} flatShading />
      </mesh>

      {/* Braços: dois cilindros inclinados, para a figura não ser um poste. */}
      <mesh name="braco-esquerdo" position={[-0.3, 0.72, 0]} rotation={[0, 0, 0.24]}>
        <cylinderGeometry args={[0.07, 0.07, 0.62, 6]} />
        <meshLambertMaterial color={CORES_DO_AVATAR.membros} flatShading />
      </mesh>
      <mesh name="braco-direito" position={[0.3, 0.72, 0]} rotation={[0, 0, -0.24]}>
        <cylinderGeometry args={[0.07, 0.07, 0.62, 6]} />
        <meshLambertMaterial color={CORES_DO_AVATAR.membros} flatShading />
      </mesh>

      {/* Pernas: ficam paradas — não há animação de caminhada nesta etapa. */}
      <mesh name="perna-esquerda" position={[-0.12, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.42, 6]} />
        <meshLambertMaterial color={CORES_DO_AVATAR.membros} flatShading />
      </mesh>
      <mesh name="perna-direita" position={[0.12, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.42, 6]} />
        <meshLambertMaterial color={CORES_DO_AVATAR.membros} flatShading />
      </mesh>

      {/* Mochila, nas costas: a figura olha para +z, então as costas ficam em -z. */}
      <mesh name="mochila" position={[0, 0.72, -0.26]}>
        <boxGeometry args={[0.34, 0.44, 0.18]} />
        <meshLambertMaterial color={CORES_DO_AVATAR.mochila} flatShading />
      </mesh>
    </group>
  )
}
