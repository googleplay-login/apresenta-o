import { useCallback, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { ArrastoPendente } from './CameraLivre'
import { ConteudoDaCena } from './ConteudoDaCena'
import { useTeclasDeMovimento } from './useTeclasDeMovimento'
import type { ChaoDoMundo, Localizacao } from './mapaCaminhavel'
import { caminhanteInicial, type Caminhante } from './avatar/passos'
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
 *
 * Esta casca cuida do que exige navegador — o `<Canvas>` e os eventos de ponteiro
 * que arrastam a câmera. O conteúdo do mundo mora em `ConteudoDaCena.tsx`, que
 * pode ser montado e conferido sem placa de vídeo (decisão D-025).
 */

type Props = {
  readonly ilhas: readonly IlhaVisivel[]
  readonly pontes: readonly PonteVisivel[]
  /** O chão caminhável, já montado a partir das ilhas e pontes resolvidas. */
  readonly chao: ChaoDoMundo
  readonly modo: ModoDeCamera
  readonly tecladoAtivo: boolean
  /** Ilha a enquadrar quando este valor muda. `null` desliga o pedido. */
  readonly focarEm: { readonly id: string; readonly pedido: number } | null
  /** Ilha a alcançar a pé, pedida pela interface. Ignorado fora do modo `andar`. */
  readonly destinoDeCaminhada: { readonly id: string; readonly pedido: number } | null
  readonly aoEscolher: (unidadeId: string) => void
  /** Clique numa ponte. Quem decide se a travessia acontece é `Mundo`. */
  readonly aoEscolherPonte: (ponte: PonteVisivel) => void
  readonly aoPassarPorCima: (unidadeId: string | null) => void
  /** Onde o avatar está, para o HUD e a lista em texto dizerem o mesmo. */
  readonly aoMudarDeLugar: (lugar: Localizacao) => void
  /** Não há caminho a pé até onde pediram. A cena explica o motivo. */
  readonly aoNaoPoderCaminhar: (motivo: string) => void
}

export function Cena({
  ilhas,
  pontes,
  chao,
  modo,
  tecladoAtivo,
  focarEm,
  destinoDeCaminhada,
  aoEscolher,
  aoEscolherPonte,
  aoPassarPorCima,
  aoMudarDeLugar,
  aoNaoPoderCaminhar,
}: Props) {
  const teclas = useTeclasDeMovimento(tecladoAtivo)
  const arrasto = useRef<ArrastoPendente>({ dx: 0, dy: 0 })
  // A posição do avatar e a guinada da câmera vivem em `ref`, e não em estado do
  // React: as duas mudam a cada quadro, e re-renderizar a árvore sessenta vezes
  // por segundo seria desperdício.
  const caminhante = useRef<Caminhante | null>(caminhanteInicial(chao))
  const olhar = useRef(0)
  const [arrastando, setArrastando] = useState(false)
  const [ponteSob, setPonteSob] = useState<string | null>(null)
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

  const classes = ['cena']
  if (arrastando) {
    classes.push('cena--arrastando')
  }
  if (ponteSob !== null && !arrastando) {
    classes.push('cena--ponte')
  }

  return (
    <div
      className={classes.join(' ')}
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
        // A sombra. Sem esta linha, as flags `castShadow`/`receiveShadow` que o
        // `Malha3D` já liga em cada peça não têm efeito nenhum, e o mundo volta a
        // ser uniformemente iluminado — que foi a crítica de 21/09/2026.
        shadows="soft"
        onPointerMissed={() => aoPassarPorCima(null)}
      >
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
          enquadramento={enquadramento}
          espalhamento={espalhamento}
          destacadaId={focarEm?.id ?? null}
          destinoDeCaminhada={destinoDeCaminhada}
          aoChegar={aoChegar}
          aoEscolher={aoEscolher}
          aoEscolherPonte={aoEscolherPonte}
          aoApontarPonte={(apontada) => setPonteSob(apontada === null ? null : apontada.para)}
          aoPassarPorCima={aoPassarPorCima}
          aoMudarDeLugar={aoMudarDeLugar}
          aoNaoPoderCaminhar={aoNaoPoderCaminhar}
        />
      </Canvas>
    </div>
  )
}
