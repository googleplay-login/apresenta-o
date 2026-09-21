import { describe, expect, it } from 'vitest'
import type { Malha } from './ilha'
import type { MalhaPintada } from './pintura'
import {
  NOMES_DOS_OBJETOS,
  OBJETO_DA_TRILHA,
  gerarObjetoDoTema,
  tipoDeObjetoDaTrilha,
  type PapelDaCor,
  type TipoDeObjetoDoTema,
} from './objetosDoTema'

/**
 * Os objetos do tema, conferidos por medida.
 *
 * A lição de D-058 vale igual aqui: **declarar menos do que a peça ocupa é o lado
 * que morde**. O raio ocupado é o que garante que o objeto caiba no capim, e a
 * altura é o que garante que ele não fure o marco do vizinho. As duas medidas são
 * cobradas contra a malha montada, e não contra a intenção de quem escreveu.
 */

const CORES_DE_TESTE: Readonly<Record<PapelDaCor, number>> = {
  pedra: 0x9aa3a8,
  madeira: 0x8a6a4a,
  acento: 0xc0503a,
}

/** O ponto mais alto da malha. */
function alturaMaxima(malha: Malha): number {
  let maior = 0
  for (let indice = 1; indice < malha.posicoes.length; indice += 3) {
    maior = Math.max(maior, malha.posicoes[indice] ?? 0)
  }
  return maior
}

/** A maior distância horizontal de um vértice até o eixo do objeto. */
function raioMaximo(malha: Malha): number {
  let maior = 0
  for (let indice = 0; indice < malha.posicoes.length; indice += 3) {
    const x = malha.posicoes[indice] ?? 0
    const z = malha.posicoes[indice + 2] ?? 0
    maior = Math.max(maior, Math.hypot(x, z))
  }
  return maior
}

function objeto(tipo: TipoDeObjetoDoTema) {
  return gerarObjetoDoTema({ tipo, escala: 1, cores: CORES_DE_TESTE })
}

const TIPOS: readonly TipoDeObjetoDoTema[] = [
  'pilha-de-livros',
  'disco-voador',
  'torre-de-barras',
  'armario-de-servidor',
]

describe('os objetos do tema das trilhas', () => {
  it('toda trilha tem o seu objeto, e dois objetos nunca são o mesmo', () => {
    // A consequência que o teste protege: uma trilha nova (a de aplicações web, no
    // lote 7) que entrasse sem objeto não passaria em silêncio — `OBJETO_DA_TRILHA`
    // é um mapa completo, e o tipo não deixa faltar chave.
    const tiposDasTrilhas = Object.values(OBJETO_DA_TRILHA)
    expect(tiposDasTrilhas).toHaveLength(4)
    expect(new Set(tiposDasTrilhas).size).toBe(4)

    for (const trilha of Object.keys(OBJETO_DA_TRILHA) as (keyof typeof OBJETO_DA_TRILHA)[]) {
      expect(tipoDeObjetoDaTrilha(trilha)).toBe(OBJETO_DA_TRILHA[trilha])
    }
  })

  it('o nome de cada objeto está declarado, e é o que a tela mostra', () => {
    for (const tipo of TIPOS) {
      expect(NOMES_DOS_OBJETOS[tipo].length).toBeGreaterThan(6)
      expect(objeto(tipo).nome).toBe(NOMES_DOS_OBJETOS[tipo])
    }
  })

  it('a altura declarada corresponde à malha, e o raio também', () => {
    for (const tipo of TIPOS) {
      const gerado = objeto(tipo)
      const altura = Math.max(...gerado.partes.map((parte) => alturaMaxima(parte.malha)))
      const raio = Math.max(...gerado.partes.map((parte) => raioMaximo(parte.malha)))

      expect(
        gerado.alturaTotal,
        `A altura declarada de «${gerado.nome}» é menor que a peça: ${gerado.alturaTotal} < ${altura}`,
      ).toBeGreaterThanOrEqual(altura - 0.001)
      expect(
        gerado.raioOcupado,
        `O raio declarado de «${gerado.nome}» é menor que a peça: ${gerado.raioOcupado} < ${raio}`,
      ).toBeGreaterThanOrEqual(raio - 0.001)
    }
  })

  it('o objeto cabe numa ilha do menor raio, onde ele for colocado', () => {
    // O lugar do objeto no capim é escolhido pela ilha (entre 55% e 92% do raio),
    // e o teste do mundo cobra a folga até as estruturas. O que se cobra aqui é o
    // tamanho: com escala 1, nenhum objeto passa de um quinto do raio de uma ilha
    // pequena — e nenhum é mais alto que o marco mais baixo.
    for (const tipo of TIPOS) {
      const gerado = objeto(tipo)
      expect(gerado.raioOcupado).toBeLessThanOrEqual(1)
      expect(gerado.alturaTotal).toBeLessThanOrEqual(1.8)
    }
  })

  it('a malha sai pintada por vértice, com uma cor por vértice e três papéis', () => {
    for (const tipo of TIPOS) {
      const gerado = objeto(tipo)
      const pintada: MalhaPintada = gerado.malha
      const vertices = pintada.posicoes.length / 3

      expect(pintada.cores).toHaveLength(vertices * 3)
      expect(pintada.indices.length).toBeGreaterThan(0)
      for (const canal of pintada.cores) {
        expect(canal).toBeGreaterThanOrEqual(0)
        expect(canal).toBeLessThanOrEqual(1)
      }

      // Três papéis: pedra, madeira e acento. O acento é o que dá a cor da trilha
      // ao objeto, e sem ele o objeto seria uma peça de uma cor só — a diferença
      // entre "temático" e "colorido" está aqui.
      expect(new Set(gerado.partes.map((parte) => parte.papel)).size).toBeGreaterThanOrEqual(2)
      expect(gerado.partes.some((parte) => parte.papel === 'acento')).toBe(true)
    }
  })

  it('a escala multiplica as duas medidas, e não só uma', () => {
    const cheio = objeto('disco-voador')
    const metade = gerarObjetoDoTema({ tipo: 'disco-voador', escala: 0.5, cores: CORES_DE_TESTE })

    expect(metade.alturaTotal).toBeCloseTo(cheio.alturaTotal / 2, 6)
    expect(metade.raioOcupado).toBeCloseTo(cheio.raioOcupado / 2, 6)
  })
})
