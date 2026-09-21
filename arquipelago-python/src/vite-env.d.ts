/**
 * Tipos do ambiente de build do Vite.
 *
 * Necessario para que o TypeScript aceite `import './app.css'` (import de efeito
 * colateral). O `tsconfig.json` usa `"types": []` de proposito, para nao incluir
 * automaticamente os tipos de todo pacote instalado; por isso a referencia
 * abaixo e explicita.
 */
/// <reference types="vite/client" />
