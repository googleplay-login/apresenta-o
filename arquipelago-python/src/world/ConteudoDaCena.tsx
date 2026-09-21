import { CameraLivre, type ArrastoPendente } from './CameraLivre'
import { Ceu } from './Ceu'
import { Ilha } from './Ilha'
import { Ponte } from './Ponte'
import type { TeclasDeMovimento } from './camera/movimento'
import type { IlhaVisivel, PonteVisivel } from './mundoVisivel'
import type { ModoDeCamera } from '../state/sessao'

/**
 * O conteúdo do mundo 3D, sem a casca que o desenha.
 *
 * Este arquivo existe por um motivo prático: um `<Canvas>` precisa de WebGL de
 * verdade para montar, e o conteúdo dele não. Separando os dois, o teste consegue
 * construir a árvore 3D inteira — ilhas, estruturas, pontes, câmera — e conferir
 * composição e fiação sem placa de vídeo. É o que dá valor ao teste de
 * `ConteudoDaCena.test.tsx`: sem esta separação, testar o mundo dependeria de GPU
 * e simplesmente não seria feito.
 *
 * O que este componente **não** faz continua valendo: ele não lê progresso, não
 * consulta armazenamento e não decide liberação. Recebe ilhas e pontes com a
 * situação já resolvida por `mundoVisivel.ts`, que por sua vez pergunta ao domínio.
 * É a decisão D-004 em forma de arquivo.
 */

type Props = {
  readonly ilhas: readonly IlhaVisivel[]
  readonly pontes: readonly PonteVisivel[]
  readonly modo: ModoDeCamera
  readonly tecladoAtivo: boolean
  readonly teclas: React.RefObject<TeclasDeMovimento>
  readonly arrasto: React.RefObject<ArrastoPendente>
  readonly enquadramento: {
    readonly camera: readonly [number, number, number]
    readonly alvo: readonly [number, number, number]
  } | null
  readonly espalhamento: number
  /** Id da ilha em destaque, quando a interface pediu para enquadrar uma. */
  readonly destacadaId: string | null
  readonly aoChegar: () => void
  readonly aoEscolher: (unidadeId: string) => void
  readonly aoEscolherPonte: (ponte: PonteVisivel) => void
  /** Avisa que o ponteiro entrou ou saiu de uma ponte; `null` quando saiu. */
  readonly aoApontarPonte?: (ponte: PonteVisivel | null) => void
  readonly aoPassarPorCima: (unidadeId: string | null) => void
}

export function ConteudoDaCena({
  ilhas,
  pontes,
  modo,
  tecladoAtivo,
  teclas,
  arrasto,
  enquadramento,
  espalhamento,
  destacadaId,
  aoChegar,
  aoEscolher,
  aoEscolherPonte,
  aoApontarPonte,
  aoPassarPorCima,
}: Props) {
  return (
    <>
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
        <Ponte
          key={`${ponte.de}-${ponte.para}`}
          ponte={ponte}
          aoEscolher={aoEscolherPonte}
          aoApontar={(apontada) => {
            aoApontarPonte?.(apontada)
            // O nome que aparece no HUD é o da ilha de destino: é para lá que a
            // ponte leva, e é o que o estudante quer saber antes de clicar.
            aoPassarPorCima(apontada === null ? null : apontada.para)
          }}
        />
      ))}
      {ilhas.map((ilha) => (
        <Ilha
          key={ilha.id}
          ilha={ilha}
          destacada={destacadaId === ilha.id}
          aoEscolher={aoEscolher}
          aoPassarPorCima={aoPassarPorCima}
        />
      ))}
    </>
  )
}
