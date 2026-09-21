import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  aplicarMovimento,
  aplicarOlhar,
  cameraDeMapa,
  cameraInicial,
  interpolarCamera,
  mirarEm,
  suavizar,
  type CameraVoadora,
  type TeclasDeMovimento,
  type Vetor3,
} from './camera/movimento'
import type { ModoDeCamera } from '../state/sessao'

/**
 * Câmera do mundo.
 *
 * A posição da câmera **não** é estado do React: ela muda a cada quadro, e
 * re-renderizar a árvore sessenta vezes por segundo seria desperdício. Ela vive
 * num `useRef` e é escrita direto no objeto de câmera do Three.js dentro do laço
 * de desenho.
 *
 * Duas transições são suaves, e não teletransporte: ir para a vista de mapa e ir
 * para uma ilha escolhida. Mexer no teclado cancela a transição — quem está
 * pilotando tem a palavra final.
 */

/** Segundos da transição de câmera. Curto o bastante para não irritar. */
export const DURACAO_DA_TRANSICAO = 1.1

/** Arrasto pendente, em pixels, acumulado desde o último quadro. */
export type ArrastoPendente = { dx: number; dy: number }

type Props = {
  readonly modo: ModoDeCamera
  /** `false` quando o foco está num painel: aí o teclado não move a câmera. */
  readonly tecladoAtivo: boolean
  readonly teclas: React.RefObject<TeclasDeMovimento>
  readonly arrasto: React.RefObject<ArrastoPendente>
  /** Enquadramento pedido pela interface, ou `null` para voo livre. */
  readonly enquadramento: { readonly camera: Vetor3; readonly alvo: Vetor3 } | null
  /** Distância entre a primeira e a última ilha, para enquadrar a vista de mapa. */
  readonly espalhamento: number
  /** Chamado quando a câmera termina de chegar a um destino. */
  readonly aoChegar: () => void
}

export function CameraLivre({
  modo,
  tecladoAtivo,
  teclas,
  arrasto,
  enquadramento,
  espalhamento,
  aoChegar,
}: Props) {
  const camera = useThree((estado) => estado.camera)
  const posicao = useRef<CameraVoadora>(cameraInicial([0, 0, 0]))
  const transicao = useRef<{
    readonly de: CameraVoadora
    readonly para: CameraVoadora
    decorrido: number
  } | null>(null)
  const reservada = useRef<CameraVoadora>(posicao.current)

  // A câmera é tratada como quem olha: primeiro o giro vertical, depois o
  // horizontal. Com a ordem padrão do Three.js, girar na horizontal entortaria
  // a imagem.
  useEffect(() => {
    camera.rotation.order = 'YXZ'
  }, [camera])

  // Vista de mapa, e a volta dela.
  useEffect(() => {
    transicao.current =
      modo === 'mapa'
        ? { de: posicao.current, para: cameraDeMapa(espalhamento), decorrido: 0 }
        : { de: posicao.current, para: reservada.current, decorrido: 0 }
  }, [modo, espalhamento])

  // Destino escolhido na interface: enquadra a ilha e continua olhando para ela.
  useEffect(() => {
    if (enquadramento === null) {
      return
    }
    const destino = mirarEm(
      {
        x: enquadramento.camera[0],
        y: enquadramento.camera[1],
        z: enquadramento.camera[2],
        guinada: posicao.current.guinada,
        inclinacao: posicao.current.inclinacao,
      },
      enquadramento.alvo,
    )
    transicao.current = { de: posicao.current, para: destino, decorrido: 0 }
  }, [enquadramento])

  useFrame((_, deltaBruto) => {
    // Passo limitado: se a aba fica em segundo plano, o `delta` vem enorme e,
    // sem limite, a câmera atravessaria o mundo inteiro de uma vez.
    const delta = Math.min(Math.max(deltaBruto, 0), 0.1)

    // Olhar com o mouse vale mesmo durante a transição, e cancela a transição:
    // nenhum gesto do estudante é ignorado.
    const pendente = arrasto.current
    if (pendente.dx !== 0 || pendente.dy !== 0) {
      posicao.current = aplicarOlhar(posicao.current, pendente.dx, pendente.dy)
      pendente.dx = 0
      pendente.dy = 0
      transicao.current = null
    }

    const emTransicao = transicao.current
    if (emTransicao !== null) {
      const andou = tecladoAtivo && houveToque(teclas.current)
      emTransicao.decorrido += delta

      if (andou) {
        transicao.current = null
      } else {
        const proporcao = Math.min(emTransicao.decorrido / DURACAO_DA_TRANSICAO, 1)
        posicao.current = interpolarCamera(emTransicao.de, emTransicao.para, suavizar(proporcao))
        if (proporcao >= 1) {
          transicao.current = null
          aoChegar()
        }
      }
    }

    if (transicao.current === null && tecladoAtivo) {
      posicao.current = aplicarMovimento(posicao.current, teclas.current, delta)
    }

    // A posição de voo livre é a que a vista de mapa restaura ao voltar.
    if (modo === 'voar' && transicao.current === null) {
      reservada.current = posicao.current
    }

    camera.position.set(posicao.current.x, posicao.current.y, posicao.current.z)
    camera.rotation.set(posicao.current.inclinacao, posicao.current.guinada, 0)
  })

  return null
}

/** Verdadeiro se alguma tecla de movimento está pressionada. */
export function houveToque(teclas: TeclasDeMovimento): boolean {
  return (
    teclas.frente ||
    teclas.tras ||
    teclas.esquerda ||
    teclas.direita ||
    teclas.subir ||
    teclas.descer
  )
}
