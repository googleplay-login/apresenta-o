import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { aplicarOlhar, type CameraVoadora } from './camera/movimento'
import type { ArrastoPendente } from './CameraLivre'
import { chaoEm, type ChaoDoMundo } from './mapaCaminhavel'
import type { Caminhante } from './avatar/passos'

/**
 * A câmera de terceira pessoa: atrás do avatar, olhando para ele.
 *
 * É o que faz "andar" ser andar: quem se desloca é a pessoa, e a câmera a
 * acompanha. Antes disso a câmera era o viajante — voar pelo mundo e mover a
 * câmera eram a mesma coisa.
 *
 * O arrasto continua mudando o olhar, e é a **mesma** guinada que o avatar usa
 * para decidir para onde anda (`avatar/passos.ts`): empurrar `W` leva para onde a
 * câmera aponta. Por isso a guinada mora num `ref` compartilhado, e não dentro
 * deste componente — dois lugares precisam dela, e nenhum dos dois pode
 * re-renderizar a cada quadro.
 *
 * A câmera orbita em volta do avatar, a uma distância fixa, com a altura tirada
 * da inclinação do olhar. A inclinação tem um piso próprio (-0,35 rad): abaixo
 * disso a câmera passaria por baixo do chão e a ilha taparia a vista.
 */

type Props = {
  readonly chao: ChaoDoMundo
  readonly caminhante: React.RefObject<Caminhante | null>
  /** Guinada (giro em torno do vertical) compartilhada com o avatar. */
  readonly olhar: React.RefObject<number>
  readonly arrasto: React.RefObject<ArrastoPendente>
  readonly inclinacaoInicial?: number
}

/** Distância do avatar, em unidades do mundo. */
export const DISTANCIA_DO_AVATAR = 10.5

/** Altura do ponto para onde a câmera olha: o peito do avatar, não os pés. */
export const ALTURA_DO_ALVO = 1

/** Piso da inclinação: mais baixo que isto, a câmera entra no chão. */
export const INCLINACAO_MINIMA = -0.35

export function CameraDoAvatar({
  chao,
  caminhante,
  olhar,
  arrasto,
  inclinacaoInicial = -0.12,
}: Props) {
  const camera = useThree((estado) => estado.camera)
  const inclinacao = useRef(inclinacaoInicial)

  useEffect(() => {
    camera.rotation.order = 'YXZ'
  }, [camera])

  useFrame(() => {
    // O arrasto gira a câmera em volta da pessoa. O avatar não gira junto: quem
    // vira o corpo é o movimento, em `passos.ts`.
    const pendente = arrasto.current
    if (pendente.dx !== 0 || pendente.dy !== 0) {
      const referencia: CameraVoadora = {
        x: 0,
        y: 0,
        z: 0,
        guinada: olhar.current,
        inclinacao: inclinacao.current,
      }
      const depois = aplicarOlhar(referencia, pendente.dx, pendente.dy)
      olhar.current = depois.guinada
      inclinacao.current = Math.max(depois.inclinacao, INCLINACAO_MINIMA)
      pendente.dx = 0
      pendente.dy = 0
    }

    const pessoa = caminhante.current
    if (pessoa === null) {
      return
    }

    const chaoSobOsPes = chaoEm(chao, pessoa) ?? (chao.ilhas[0]?.altura ?? 0)
    const alvoY = chaoSobOsPes + ALTURA_DO_ALVO

    // Esfera em volta do alvo: a altura sai do seno da inclinação e o recuo
    // horizontal do cosseno. Assim a câmera nunca chega mais perto do que o
    // raio, e girar em torno do avatar não corta a ilha.
    const recuo = DISTANCIA_DO_AVATAR * Math.cos(inclinacao.current)
    const subida = DISTANCIA_DO_AVATAR * Math.sin(inclinacao.current)

    camera.position.set(
      pessoa.x + Math.sin(olhar.current) * recuo,
      alvoY + subida,
      pessoa.z + Math.cos(olhar.current) * recuo,
    )
    camera.lookAt(pessoa.x, alvoY, pessoa.z)
  })

  return null
}
