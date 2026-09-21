import { useEffect, useState } from 'react'
import { ROTA_PADRAO, hashAtual, rotaDoHash, type Rota } from './rotas'

/**
 * Rota atual, acompanhando mudanças no hash da URL.
 *
 * O estado inicial é lido de `hashAtual()`, que se protege quando não existe
 * `window` — é o que permite renderizar a aplicação em teste sem navegador.
 */
export function useRota(): Rota {
  const [rota, setRota] = useState<Rota>(() => rotaDoHash(hashAtual()))

  useEffect(() => {
    const aoMudarHash = () => setRota(rotaDoHash(window.location.hash))
    window.addEventListener('hashchange', aoMudarHash)
    return () => window.removeEventListener('hashchange', aoMudarHash)
  }, [])

  return rota ?? ROTA_PADRAO
}
