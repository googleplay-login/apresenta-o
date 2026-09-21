import { useEffect, useMemo } from 'react'
import { BufferGeometry, DoubleSide, Float32BufferAttribute, FrontSide } from 'three'
import type { MalhaPintada } from './geometria/pintura'
import type { Malha } from './geometria/ilha'

/**
 * Desenha uma malha nossa na cena.
 *
 * As malhas do mundo são geradas por nós (ver `geometria/`), então aqui só
 * acontece a passagem de vetor de números para `BufferGeometry`. Três detalhes
 * que não são óbvios:
 *
 *  - a geometria é criada **uma vez** por malha e descartada ao sair da cena.
 *    Sem o descarte, cada remontagem do componente deixaria memória de placa de
 *    vídeo pendurada;
 *  - `flatShading` é o que dá a cara facetada de pedra. Sem ele, as normais
 *    suavizam os cantos e a rocha vira uma bolha;
 *  - quando a malha vem pintada por altura, a cor passa a vir do **vértice**, e
 *    a cor do material só serve de base para a multiplicação.
 */

type Props = {
  readonly malha: Malha | MalhaPintada
  /** Cor base do material. */
  readonly cor: number
  /** Opacidade: usada para a pedra das ilhas ainda não liberadas. */
  readonly opacidade?: number
  /** Desenha as duas faces. Ligado só onde existe face aberta de propósito. */
  readonly duasFaces?: boolean
}

/** Verdadeiro quando a malha traz cores por vértice. */
function temCores(malha: Malha | MalhaPintada): malha is MalhaPintada {
  return 'cores' in malha && Array.isArray((malha as MalhaPintada).cores)
}

export function Malha3D({ malha, cor, opacidade = 1, duasFaces = false }: Props) {
  const geometria = useMemo(() => {
    const nova = new BufferGeometry()
    nova.setAttribute('position', new Float32BufferAttribute([...malha.posicoes], 3))
    nova.setIndex([...malha.indices])
    if (temCores(malha)) {
      nova.setAttribute('color', new Float32BufferAttribute([...malha.cores], 3))
    }
    nova.computeVertexNormals()
    nova.computeBoundingSphere()
    return nova
  }, [malha])

  useEffect(() => () => geometria.dispose(), [geometria])

  const comCores = temCores(malha)

  return (
    <mesh geometry={geometria} castShadow={false} receiveShadow={false}>
      <meshLambertMaterial
        color={cor}
        vertexColors={comCores}
        flatShading
        transparent={opacidade < 1}
        opacity={opacidade}
        side={duasFaces ? DoubleSide : FrontSide}
      />
    </mesh>
  )
}
