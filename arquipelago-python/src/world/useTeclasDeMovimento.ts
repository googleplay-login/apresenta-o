import { useEffect, useRef } from 'react'
import type { TeclasDeMovimento } from './camera/movimento'
import { aplicarTecla, ehTeclaDeMovimento, soltarTodas } from './teclas'

/**
 * Teclado do mundo.
 *
 * Regras que este componente garante, e que a decisão D-012 pede:
 *
 *  - as teclas de movimento só agem quando o foco está no mundo (`ativo`);
 *  - os ouvintes existem apenas enquanto o mundo está em foco — com o painel
 *    aberto, nenhuma tecla é capturada, então digitar uma resposta não move a
 *    câmera nem consome a tecla que o campo de texto precisa;
 *  - se a janela perder o foco, todas as teclas são soltas. Sem isso, trocar de
 *    aba com `W` pressionado deixaria a câmera voando para sempre.
 *
 * As teclas chegam por referência (`useRef`), e não por estado: a cada quadro
 * quem lê é o laço de desenho da cena, e re-renderizar a árvore a cada tecla
 * pressionada seria desperdício.
 */
export function useTeclasDeMovimento(ativo: boolean): React.RefObject<TeclasDeMovimento> {
  const teclas = useRef<TeclasDeMovimento>(soltarTodas())

  useEffect(() => {
    if (!ativo) {
      teclas.current = soltarTodas()
      return
    }

    const aoPressionar = (evento: KeyboardEvent) => {
      if (!ehTeclaDeMovimento(evento.code)) {
        return
      }
      // Sem isto, as setas rolam a página enquanto a câmera se move.
      evento.preventDefault()
      teclas.current = aplicarTecla(teclas.current, evento.code, true)
    }

    const aoSoltar = (evento: KeyboardEvent) => {
      if (!ehTeclaDeMovimento(evento.code)) {
        return
      }
      teclas.current = aplicarTecla(teclas.current, evento.code, false)
    }

    const aoPerderFoco = () => {
      teclas.current = soltarTodas()
    }

    window.addEventListener('keydown', aoPressionar)
    window.addEventListener('keyup', aoSoltar)
    window.addEventListener('blur', aoPerderFoco)

    return () => {
      window.removeEventListener('keydown', aoPressionar)
      window.removeEventListener('keyup', aoSoltar)
      window.removeEventListener('blur', aoPerderFoco)
      teclas.current = soltarTodas()
    }
  }, [ativo])

  return teclas
}
