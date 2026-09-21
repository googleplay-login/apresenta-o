import { useMemo } from 'react'
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
 */

type Props = {
  readonly ponte: PonteVisivel
  /** Quantas tábuas cabem no vão. Menos tábuas, mais vão aberto. */
  readonly tabuas?: number
}

export function Ponte({ ponte, tabuas = 12 }: Props) {
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

  return (
    <group
      position={[ponte.posicao[0], ponte.posicao[1], ponte.posicao[2]]}
      rotation={[0, ponte.rotacaoY, ponte.rotacaoZ]}
    >
      <Malha3D malha={pecas.estrutura} cor={CORES_DERIVADAS.ponte} />
      {pecas.corrimao === null ? null : (
        <Malha3D malha={pecas.corrimao} cor={CORES_DERIVADAS.corrimao} />
      )}
    </group>
  )
}
