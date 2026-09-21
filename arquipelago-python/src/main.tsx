import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'

const raiz = document.getElementById('root')

if (!raiz) {
  throw new Error(
    'Elemento #root nao encontrado em index.html. A aplicacao nao pode montar sem ele.',
  )
}

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
