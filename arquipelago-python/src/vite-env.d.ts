/**
 * Tipos do ambiente de build do Vite.
 *
 * Necessário para que o TypeScript aceite `import './app.css'` (import de efeito
 * colateral). O `tsconfig.json` usa `"types": []` de propósito, para não incluir
 * automaticamente os tipos de todo pacote instalado; por isso a referência abaixo
 * é explícita.
 */
/// <reference types="vite/client" />
