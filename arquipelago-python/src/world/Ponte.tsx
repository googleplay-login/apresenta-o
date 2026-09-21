import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { gerarPonte } from './geometria/solidos'
import { Malha3D } from './Malha'
import { CORES_DERIVADAS } from '../ui/theme/paleta3d'
import type { PonteVisivel } from './mundoVisivel'

/**
 * Ponte entre duas ilhas.
 *
 * A ponte bloqueada não é um objeto diferente: são as mesmas tábuas, parando no
 * meio do vão. O buraco à frente é o aviso — e o painel em texto diz o mesmo com
 * palavras, para quem não vê o mundo 3D.
 *
 * A transformação (posição, giro e inclinação) vem calculada de
 * `mapaDoMundo.ts`, conferida por teste contra a própria biblioteca. Aqui só se
 * aplica.
 *
 * Dois comportamentos que a ponte tem, e que não são enfeite:
 *
 *  - **ela responde ao clique mesmo pela metade.** Clicar numa ponte bloqueada
 *    não libera nada — quem decide é `decidirTravessia()` —, mas também não pode
 *    ficar em silêncio: o estudante recebe o motivo, com o nome da ilha que falta
 *    aprovar;
 *  - **quando a aprovação chega, as tábuas se estendem.** A geometria nova já
 *    vem completa; a escala cresce de 55% até 100% em meio segundo. É o que faz
 *    a liberação ser um acontecimento visível, e não um estado que já estava lá.
 */

type Props = {
  readonly ponte: PonteVisivel
  /** Quantas tábuas cabem no vão. Menos tábuas, mais vão aberto. */
  readonly tabuas?: number
  readonly aoEscolher: (ponte: PonteVisivel) => void
  /**
   * Avisa que o mouse está sobre esta ponte (ou saiu dela).
   *
   * Quem muda o cursor é o CSS, e não este componente: o cursor pertence à
   * camada de apresentação, e escrever estilo direto no `<canvas>` seria o tipo
   * de atalho que depois ninguém encontra.
   */
  readonly aoApontar?: (ponte: PonteVisivel | null) => void
}

/** De quanto a ponte parte quando as tábuas terminam de crescer. */
const ESCALA_INICIAL = 0.55
/** Velocidade do crescimento, em fração por segundo. */
const VELOCIDADE_DO_CRESCIMENTO = 1.9
export function Ponte({ ponte, tabuas = 12, aoEscolher, aoApontar }: Props) {
  const [sobre, setSobre] = useState(false)
  const grupo = useRef<Group>(null)
  const escala = useRef(1)
  const crescendo = useRef(false)
  const estadoAnterior = useRef(ponte.liberada)

  const pecas = useMemo(
    () =>
      gerarPonte({
        comprimento: ponte.comprimento,
        largura: 3.2,
        tabuas,
        liberada: ponte.liberada,
      }),
    [ponte.comprimento, ponte.liberada, tabuas],
  )

  // Só cresce quando o estado MUDA na frente do estudante. Uma ponte que já
  // chegou liberada na página não precisa se apresentar de novo.
  useEffect(() => {
    if (estadoAnterior.current === ponte.liberada) {
      return
    }
    estadoAnterior.current = ponte.liberada
    if (ponte.liberada && grupo.current !== null) {
      escala.current = ESCALA_INICIAL
      grupo.current.scale.x = ESCALA_INICIAL
      crescendo.current = true
    }
  }, [ponte.liberada])

  // Se a ponte sair da cena com o mouse em cima, a cena precisa saber: sem isso,
  // o cursor ficaria de "mãozinha" sobre o vazio.
  useEffect(() => () => aoApontar?.(null), [aoApontar])

  useFrame((_, delta) => {
    if (!crescendo.current || grupo.current === null) {
      return
    }

    // Passo limitado: se a aba ficou parada, o primeiro quadro depois disso não
    // pode dar um salto — o crescimento precisa durar o que promete.
    const passo = Math.min(delta * VELOCIDADE_DO_CRESCIMENTO, 0.25)
    escala.current = Math.min(1, escala.current + passo)

    // O vão é ao longo do eixo X local, então é nele que a escala cresce.
    grupo.current.scale.x = escala.current

    if (escala.current >= 1) {
      crescendo.current = false
    }
  })

  const corDaEstrutura = sobre ? CORES_DERIVADAS.corrimao : CORES_DERIVADAS.ponte

  return (
    <group
      // Nome estável para o teste da árvore 3D: identifica a ponte pelo par de
      // ilhas que ela liga.
      name={`ponte:${ponte.de}->${ponte.para}`}
      ref={grupo}
      position={[ponte.posicao[0], ponte.posicao[1], ponte.posicao[2]]}
      rotation={[0, ponte.rotacaoY, ponte.rotacaoZ]}
      onClick={(evento) => {
        evento.stopPropagation()
        aoEscolher(ponte)
      }}
      onPointerOver={(evento) => {
        evento.stopPropagation()
        setSobre(true)
        aoApontar?.(ponte)
      }}
      onPointerOut={() => {
        setSobre(false)
        aoApontar?.(null)
      }}
    >
      <Malha3D malha={pecas.estrutura} cor={corDaEstrutura} />
      {pecas.corrimao === null ? null : (
        <Malha3D malha={pecas.corrimao} cor={CORES_DERIVADAS.corrimao} />
      )}
    </group>
  )
}
