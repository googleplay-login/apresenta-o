import { useCallback, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraLivre, type ArrastoPendente } from './CameraLivre'
import { Ceu } from './Ceu'
import { Ilha } from './Ilha'
import { Ponte } from './Ponte'
import { useTeclasDeMovimento } from './useTeclasDeMovimento'
import { enquadramentoDaIlha, espalhamentoDasIlhas } from './mapaDoMundo'
import type { IlhaVisivel, PonteVisivel } from './mundoVisivel'
import type { ModoDeCamera } from '../state/sessao'

/**
 * A cena 3D.
 *
 * Recebe tudo pronto: ilhas com situação resolvida, pontes com estado resolvido
 * e o enquadramento pedido. Não lê progresso, não decide liberação, não consulta
 * armazenamento. Isso é o que mantém a regra de aprovação em um lugar só, como
 * manda a decisão D-004 — e é o que permite desenhar a mesma trilha em texto,
 * sem 3D, com as mesmas informações.
 */

type Props = {
  readonly ilhas: readonly IlhaVisivel[]
  readonly pontes: readonly PonteVisivel[]
  readonly modo: ModoDeCamera
  readonly tecladoAtivo: boolean
  /** Ilha a enquadrar quando este valor muda. `null` desliga o pedido. */
  readonly focarEm: { readonly id: string; readonly pedido: number } | null
  readonly aoEscolher: (unidadeId: string) => void
  readonly aoPassarPorCima: (unidadeId: string | null) => void
}

export function Cena({
  ilhas,
  pontes,
  modo,
  tecladoAtivo,
  focarEm,
  aoEscolher,
  aoPassarPorCima,
}: Props) {
  const teclas = useTeclasDeMovimento(tecladoAtivo)
  const arrasto = useRef<ArrastoPendente>({ dx: 0, dy: 0 })
  const [arrastando, setArrastando] = useState(false)
  const ultimoPonto = useRef<{ x: number; y: number } | null>(null)

  const espalhamento = useMemo(() => espalhamentoDasIlhas(ilhas), [ilhas])

  const enquadramento = useMemo(() => {
    if (focarEm === null) {
      return null
    }
    const alvo = ilhas.find((ilha) => ilha.id === focarEm.id)
    return alvo === undefined ? null : enquadramentoDaIlha(alvo)
    // `focarEm.pedido` também entra: e se o estudante pedir de novo a mesma
    // ilha? A câmera tem de voltar para lá mesmo assim.
  }, [focarEm, ilhas])

  const aoChegar = useCallback(() => {
    // Nada a fazer por ora: o aviso de "cheguei" já está no painel. O gancho
    // existe para o polimento da Etapa 13, que vai animar a aproximação.
  }, [])

  const aoPressionar = (evento: React.PointerEvent<HTMLDivElement>) => {
    ultimoPonto.current = { x: evento.clientX, y: evento.clientY }
    setArrastando(true)
    evento.currentTarget.setPointerCapture(evento.pointerId)
  }

  const aoMover = (evento: React.PointerEvent<HTMLDivElement>) => {
    const anterior = ultimoPonto.current
    if (anterior === null) {
      return
    }
    arrasto.current.dx += evento.clientX - anterior.x
    arrasto.current.dy += evento.clientY - anterior.y
    ultimoPonto.current = { x: evento.clientX, y: evento.clientY }
  }

  const aoSoltar = (evento: React.PointerEvent<HTMLDivElement>) => {
    ultimoPonto.current = null
    setArrastando(false)
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId)
    }
  }

  return (
    <div
      className={arrastando ? 'cena cena--arrastando' : 'cena'}
      onPointerDown={aoPressionar}
      onPointerMove={aoMover}
      onPointerUp={aoSoltar}
      onPointerCancel={aoSoltar}
      onPointerLeave={aoSoltar}
      // O mundo 3D não é a única forma de navegar: quem chega por teclado tem a
      // lista de ilhas no painel, com os mesmos destinos.
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 55, near: 0.5, far: 900, position: [0, 12, 30] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => aoPassarPorCima(null)}
      >
        <Ceu />
        <CameraLivre
          modo={modo}
          tecladoAtivo={tecladoAtivo}
          teclas={teclas}
          arrasto={arrasto}
          enquadramento={enquadramento}
          espalhamento={espalhamento}
          aoChegar={aoChegar}
        />
        {pontes.map((ponte) => (
          <Ponte key={`${ponte.de}-${ponte.para}`} ponte={ponte} />
        ))}
        {ilhas.map((ilha) => (
          <Ilha
            key={ilha.id}
            ilha={ilha}
            destacada={focarEm?.id === ilha.id}
            aoEscolher={aoEscolher}
            aoPassarPorCima={aoPassarPorCima}
          />
        ))}
      </Canvas>
    </div>
  )
}
