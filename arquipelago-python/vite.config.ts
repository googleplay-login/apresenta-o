import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * Configuração de desenvolvimento e teste.
 *
 * Decisões que precisam de justificativa ficam registradas em `docs/DECISIONS.md`.
 * Resumo:
 *  - `host: true`       → escuta em 0.0.0.0. O ambiente de preview é remoto: o
 *                         navegador do usuário NÃO é esta máquina, então o
 *                         servidor não pode ficar preso em 127.0.0.1.
 *  - `allowedHosts`     → o preview é servido por um domínio proxied
 *                         (*.e2b.app). Sem isso o Vite recusa a requisição
 *                         ("Blocked request. This host is not allowed").
 *                         Restrito ao domínio do preview, não `true`.
 *  - `test.environment` → os testes atuais são de funções puras e de render
 *                         estático, sem DOM nem eventos, então rodam em Node.
 *                         `jsdom` será adicionado quando existir teste de
 *                         interação — não antes.
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
    include: ['src/**/*.test.{ts,tsx}', 'qa/**/*.test.ts'],
  },
})
