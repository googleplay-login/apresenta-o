import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, SRGBColorSpace } from 'three'

/**
 * As texturas do mundo — geradas por código, sem um único arquivo de imagem.
 *
 * A captura de tela de 21/09/2026 foi dura com o material: *"não há mapas de
 * textura reais... a madeira parece plástico marrom fosco e a grama parece
 * tapetes sintéticos sem fios ou profundidade"*. Estava certo: até aqui, cada
 * superfície era uma cor chapada por polígono.
 *
 * **Por que gerar em vez de baixar.** A regra do projeto é asset externo só com
 * licença documentada (D-014), e este ambiente não alcança a rede onde as
 * bibliotecas de textura vivem. A saída é a mesma do resto do mundo: o que não se
 * pode pegar, se escreve. Três decisões:
 *
 *  1. **Nada de `canvas`.** O desenho acontece em vetor de bytes (`DataTexture`),
 *     então a textura existe também no ambiente de teste — se ela dependesse do
 *     navegador, o teste de textura não existiria, e o defeito apareceria só na
 *     tela (que é o caminho mais caro, como já ficou claro três vezes).
 *  2. **Determinística.** Cada textura sai de uma semente fixa, e dois programas
 *     diferentes geram os mesmos bytes. A paisagem não muda de aparelho para
 *     aparelho, e o teste pode comparar.
 *  3. **Neutra, e não colorida.** Os pixels são variação de **luminância** em
 *     volta de 1 (0,72 a 1,0), multiplicados pela cor da peça pelo Three.js. A
 *     paleta continua sendo a fonte da cor (D-060), e o orçamento de luz continua
 *     valendo: a textura só escurece.
 */

/** Uma repetição da textura a cada tantas unidades do mundo. */
export const UNIDADES_POR_TEXTURA = 2

/** O lado da textura, em pixels. 96 é potência de dois o bastante para repetir bem. */
export const LADO_DA_TEXTURA = 96

export type TipoDeTextura = 'grama' | 'pedra' | 'madeira' | 'palha'

/** Ruído determinístico de duas dimensões, em [0, 1). */
function ruido(x: number, y: number, semente: number): number {
  const mistura = Math.imul(x * 374761393 + y * 668265263 + semente * 362437, 2246822519)
  const embaralhado = Math.imul(mistura ^ (mistura >>> 13), 3266489917)
  return ((embaralhado ^ (embaralhado >>> 16)) >>> 0) / 4294967296
}

/** Ruído com duas oitavas: mancha grande por baixo, grão fino por cima. */
function ruidoComOitavas(x: number, y: number, semente: number): number {
  const grande = ruido(Math.floor(x / 6), Math.floor(y / 6), semente)
  const medio = ruido(Math.floor(x / 2), Math.floor(y / 2), semente + 11)
  const fino = ruido(x, y, semente + 29)
  return grande * 0.5 + medio * 0.32 + fino * 0.18
}

/**
 * Os bytes de uma textura, em sequência r, g, b — já em 0 a 255.
 *
 * A luminância fica entre 0,72 e 1,0 de propósito: o valor **médio** abaixo de 1
 * escurece a superfície (a textura multiplica), e o piso de 0,72 é o que impede
 * que um grão escuro vire buraco negro em cima de uma cor já escura.
 */
export function pixelsDaTextura(tipo: TipoDeTextura): Uint8Array {
  const pixels = new Uint8Array(LADO_DA_TEXTURA * LADO_DA_TEXTURA * 3)
  const semente = { grama: 1701, pedra: 2903, madeira: 4409, palha: 6151 }[tipo]

  for (let y = 0; y < LADO_DA_TEXTURA; y += 1) {
    for (let x = 0; x < LADO_DA_TEXTURA; x += 1) {
      let luz = 0.88

      if (tipo === 'grama') {
        // Mancha de altura + fios: os fios são a diferença entre grama e feltro.
        luz = 0.82 + ruidoComOitavas(x, y, semente) * 0.18
        if (ruido(x, y * 3, semente + 7) < 0.16) {
          luz *= 0.86
        }
        if (ruido(x, y, semente + 13) < 0.05) {
          luz *= 0.78
        }
      } else if (tipo === 'pedra') {
        // Grão fino (a pedra é arenosa) com rachaduras raras, mais escuras.
        luz = 0.86 + ruidoComOitavas(x * 2, y * 2, semente) * 0.14
        const pertoDeRachadura = Math.abs(ruidoComOitavas(x / 3, y / 3, semente + 5) - 0.5)
        if (pertoDeRachadura < 0.02) {
          luz *= 0.8
        }
      } else if (tipo === 'madeira') {
        // Veio: variação **comprida** no eixo x e curta no y, como tábua serrada.
        const veio = ruido(Math.floor(x / 8), y, semente)
        luz = 0.84 + veio * 0.12 + ruido(x, y, semente + 3) * 0.06
        if (ruido(Math.floor(x / 8), y, semente + 17) < 0.08) {
          luz *= 0.82
        }
      } else {
        // Palha (telhado e capim seco): feixes grossos e claros.
        luz = 0.86 + ruido(Math.floor(x / 4), Math.floor(y / 2), semente) * 0.14
        if (ruido(x, y, semente + 23) < 0.12) {
          luz *= 0.84
        }
      }

      const limitado = Math.min(Math.max(luz, 0.72), 1)
      const tom = Math.round(limitado * 255)
      const onde = (y * LADO_DA_TEXTURA + x) * 3
      pixels[onde] = tom
      pixels[onde + 1] = tom
      pixels[onde + 2] = tom
    }
  }

  return pixels
}

/**
 * A textura pronta, uma por tipo.
 *
 * Fica guardada de um desenho para o outro: são dezenove ilhas e centenas de
 * peças, e gerar os bytes de novo a cada peça seria trabalho repetido no quadro em
 * que a ilha é montada. O teste cobra que a segunda chamada devolva **a mesma**
 * instância.
 */
const guardadas = new Map<TipoDeTextura, DataTexture>()

export function texturaDe(tipo: TipoDeTextura): DataTexture {
  const pronta = guardadas.get(tipo)
  if (pronta !== undefined) {
    return pronta
  }

  const textura = new DataTexture(pixelsDaTextura(tipo), LADO_DA_TEXTURA, LADO_DA_TEXTURA)
  textura.wrapS = RepeatWrapping
  textura.wrapT = RepeatWrapping
  textura.magFilter = LinearFilter
  textura.minFilter = LinearMipmapLinearFilter
  textura.generateMipmaps = true
  textura.anisotropy = 4
  textura.colorSpace = SRGBColorSpace
  textura.needsUpdate = true

  guardadas.set(tipo, textura)
  return textura
}

/** A luminância média de uma textura, de 0 a 1 — o quanto ela escurece a cor. */
export function luzMediaDaTextura(tipo: TipoDeTextura): number {
  const pixels = pixelsDaTextura(tipo)
  let soma = 0
  for (let indice = 0; indice < pixels.length; indice += 3) {
    soma += (pixels[indice] ?? 0) / 255
  }
  return soma / (pixels.length / 3)
}
