import { useState } from 'react'

/**
 * O navegador consegue desenhar o mundo 3D?
 *
 * Esta pergunta é feita **antes** de montar a cena, e não depois de ela falhar.
 * Sem placa de vídeo disponível — navegador antigo, aceleração desligada,
 * máquina virtual sem GPU —, o `<Canvas>` do React Three Fiber lança e deixa a
 * tela em branco. Aqui a resposta negativa leva para a alternativa acessível,
 * que é a mesma trilha em texto e funciona igual.
 *
 * O contexto de teste é criado e descartado na hora. Criar contexto de teste é
 * barato e não inicializa a cena.
 */
export function temWebgl(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  try {
    const tela = document.createElement('canvas')
    const contexto =
      tela.getContext('webgl2') ??
      tela.getContext('webgl') ??
      tela.getContext('experimental-webgl')

    if (!contexto) {
      return false
    }

    // Devolve a memória do contexto de teste. Navegadores limitam quantos
    // contextos WebGL podem existir ao mesmo tempo: deixar este pendurado
    // poderia impedir o contexto de verdade de ser criado logo depois.
    const perda = (contexto as WebGLRenderingContext).getExtension('WEBGL_lose_context')
    perda?.loseContext()

    return true
  } catch {
    return false
  }
}

/**
 * Resposta de `temWebgl()`, calculada uma única vez, na montagem.
 *
 * A resposta é preguiçosa de propósito. Com o valor inicial fixo em `false` e a
 * resposta chegando depois, num `useEffect`, a tela mostraria a alternativa em
 * texto por um quadro para quem tem placa de vídeo — um piscar de mensagem
 * errada. O inicializador preguiçoso roda uma vez por montagem, não a cada
 * desenho, então não há custo repetido nem risco de esbarrar no limite de
 * contextos do navegador.
 *
 * Em ambiente sem `window` — teste e renderização estática —, `temWebgl()`
 * devolve `false`, e a alternativa em texto é o que aparece.
 */
export function useSuporteWebgl(): boolean {
  const [suportado] = useState(() => temWebgl())
  return suportado
}
