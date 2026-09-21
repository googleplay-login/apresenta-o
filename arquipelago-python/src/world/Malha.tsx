import { useEffect, useMemo } from 'react'
import { BufferGeometry, DoubleSide, Float32BufferAttribute, FrontSide } from 'three'
import type { MalhaPintada } from './geometria/pintura'
import type { Malha } from './geometria/ilha'
import { texturaDe, type TipoDeTextura } from './geometria/texturas'

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

type Comuns = {
  /** Opacidade: usada para o realce e para a pedra das ilhas ainda não liberadas. */
  readonly opacidade?: number
  /** Desenha as duas faces. Ligado só onde existe face aberta de propósito. */
  readonly duasFaces?: boolean
  /**
   * Desenha a superfície **lisa**, com normais calculadas por média.
   *
   * A pedra e o capim nasceram facetados (`flatShading`), e a captura de tela de
   * 21/09/2026 mostrou o custo disso nas ilhas: *"os cones inferiores... exibindo
   * arestas duras e visíveis que destroem qualquer ilusão de volume orgânico"*.
   * Nas massas orgânicas — a pedra, o capim, a copa, a nuvem — a superfície passa
   * a ser lisa, e o volume vem da cor por vértice que já existia. Nas peças
   * pequenas e serradas (tábua, caixa, marco) o facetado fica: ali o corte reto é
   * o que se quer ver.
   */
  readonly suave?: boolean
  /**
   * A textura da superfície (D-064), gerada por código em `geometria/texturas.ts`.
   *
   * Precisa das coordenadas de textura da malha: quem aplica textura é malha que
   * passou por `gerarCaixa`/`gerarCilindro`, que são as que calculam `uvs`.
   */
  readonly textura?: TipoDeTextura
  /** Projeta sombra no chão e nas peças de baixo. Padrão: ligado, fora do céu. */
  readonly projetaSombra?: boolean
  /** Recebe sombra das peças de cima. Padrão: ligado. */
  readonly recebeSombra?: boolean
  /**
   * Desenha a forma **chapada**, sem receber luz.
   *
   * Existe por causa das nuvens: elas são claras (`#F1F4F9`), mas a luz deste
   * mundo vem de meia-esfera — metade céu, metade **mar** —, então a face de
   * baixo de cada nuvem era iluminada pela cor do mar e saía verde-escura. No
   * céu claro, as nuvens viravam cascalho escuro flutuando (visto na captura de
   * tela de 21/09/2026). Nuvem é forma, não sólido aceso: quem é chapado não
   * tem face escura. Ver D-055.
   */
  readonly semLuz?: boolean
}

/**
 * Uma malha **sem** cor própria precisa de tinta; uma malha **pintada** não pode
 * recebê-la.
 *
 * Isto é o tipo, e não um comentário, por causa de um defeito real: a pedra e o
 * capim das ilhas eram pintados por vértice e **também** recebiam a cor da
 * situação no material. O Three.js multiplica as duas coisas, e o resultado era
 * um mundo quase preto — as paredes das ilhas saíam em `#1a1714`, e ninguém
 * percebeu por sete etapas porque ninguém tinha visto o mundo desenhado.
 * Multiplicar cor por cor é fácil de escrever e impossível de ver no código.
 */
type Props = Comuns &
  (
    | { readonly malha: Malha & { readonly cores?: undefined }; readonly cor: number }
    | { readonly malha: MalhaPintada; readonly cor?: undefined }
  )

/** Verdadeiro quando a malha traz cores por vértice. */
function temCores(malha: Malha | MalhaPintada): malha is MalhaPintada {
  return 'cores' in malha && Array.isArray((malha as MalhaPintada).cores)
}

/**
 * Branco puro quando a malha traz a própria cor.
 *
 * Não é uma cor da paleta, e por isso não mora em `paleta3d.ts`: é a
 * **ausência de tinta**. Na multiplicação que o Three.js faz, branco é o
 * elemento neutro — é o que garante que a cor pintada por vértice chegue à tela
 * como a paleta a definiu, passada apenas pela luz.
 */
const SEM_TINTA = 0xffffff

export function Malha3D({
  malha,
  cor,
  opacidade = 1,
  duasFaces = false,
  semLuz = false,
  suave = false,
  textura,
  projetaSombra,
  recebeSombra,
}: Props) {
  const geometria = useMemo(() => {
    const nova = new BufferGeometry()
    nova.setAttribute('position', new Float32BufferAttribute([...malha.posicoes], 3))
    nova.setIndex([...malha.indices])
    if (temCores(malha)) {
      nova.setAttribute('color', new Float32BufferAttribute([...malha.cores], 3))
    }
    if (malha.uvs !== undefined) {
      nova.setAttribute('uv', new Float32BufferAttribute([...malha.uvs], 2))
    }
    nova.computeVertexNormals()
    nova.computeBoundingSphere()
    return nova
  }, [malha])

  useEffect(() => () => geometria.dispose(), [geometria])

  const comCores = temCores(malha)
  // As formas do céu e o realce não entram no mapa de sombra: nuvem que projeta
  // sombra escurece o mar inteiro, e o anel de destaque é translúcido.
  const projeta = projetaSombra ?? (!semLuz && opacidade === 1)
  const recebe = recebeSombra ?? !semLuz
  const mapa = textura === undefined ? undefined : texturaDe(textura)

  return (
    <mesh geometry={geometria} castShadow={projeta} receiveShadow={recebe}>
      {semLuz ? (
        <meshBasicMaterial
          color={comCores ? SEM_TINTA : cor}
          vertexColors={comCores}
          transparent={opacidade < 1}
          opacity={opacidade}
          side={duasFaces ? DoubleSide : FrontSide}
        />
      ) : textura !== undefined ? (
        // Com textura, o material é o padrão-físico: ele responde a luz e a sombra
        // com rugosidade, que é o que tira o aspecto de plástico. `metalness` em
        // zero porque nada aqui é metal — o mundo é pedra, madeira e capim.
        <meshStandardMaterial
          color={comCores ? SEM_TINTA : cor}
          map={mapa}
          vertexColors={comCores}
          roughness={0.94}
          metalness={0}
          flatShading={!suave}
          transparent={opacidade < 1}
          opacity={opacidade}
          side={duasFaces ? DoubleSide : FrontSide}
        />
      ) : (
        <meshLambertMaterial
          color={comCores ? SEM_TINTA : cor}
          vertexColors={comCores}
          flatShading={!suave}
          transparent={opacidade < 1}
          opacity={opacidade}
          side={duasFaces ? DoubleSide : FrontSide}
        />
      )}
    </mesh>
  )
}
