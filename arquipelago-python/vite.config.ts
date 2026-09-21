import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * Configuracao de desenvolvimento e teste.
 *
 * Decisoes que precisam de justificativa ficam registradas em docs/DECISIONS.md.
 * Resumo:
 *  - `host: true`      -> escuta em 0.0.0.0. O ambiente de preview e remoto: o
 *                         navegador do usuario NAO e esta maquina, entao o
 *                         servidor nao pode ficar preso em 127.0.0.1.
 *  - `allowedHosts`    -> o preview e servido por um dominio proxied
 *                         (*.e2b.app). Sem isso o Vite recusa a requisicao
 *                         ("Blocked request. This host is not allowed").
 *                         Restrito ao dominio do preview, nao `true`.
 *  - `test.environment`-> os testes desta etapa sao funcoes puras (sem DOM),
 *                         entao rodam em Node. jsdom sera adicionado apenas
 *                         quando existir teste de componente.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['.e2b.app'],
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ['.e2b.app'],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
