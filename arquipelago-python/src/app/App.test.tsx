import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { App } from './App'
import { PLANO_DE_UNIDADES } from '../content/planoDeUnidades'

/**
 * Renderiza a pagina para HTML estatico e confere o que ela afirma.
 *
 * O que este teste PROVA: a arvore de componentes monta sem lancar erro, e o
 * conteudo esperado esta no HTML gerado.
 *
 * O que este teste NAO prova: aparencia, layout, contraste na tela, teclado e
 * comportamento no navegador. Nao existe navegador neste ambiente. Aquela
 * verificacao esta listada como NAO EXECUTADA em docs/TEST_REPORT.md.
 */
const html = renderToStaticMarkup(<App />)

describe('pagina inicial', () => {
  it('renderiza sem lancar erro e gera conteudo de verdade', () => {
    expect(html.length).toBeGreaterThan(2000)
  })

  it('nao tem nenhum botao, link ou manipulador de clique', () => {
    // Decisao D-009: recurso que nao funciona nao aparece como botao.
    // Nesta etapa nao existe nenhuma funcao do ciclo de estudo, logo a pagina
    // inteira nao pode ter um unico alvo clicavel.
    expect(html).not.toMatch(/<button/i)
    expect(html).not.toMatch(/<a[\s>]/i)
    expect(html.toLowerCase()).not.toContain('onclick')
    expect(html.toLowerCase()).not.toContain('href=')
  })

  it('diz o nome do projeto e em que etapa o desenvolvimento esta', () => {
    expect(html).toContain('Arquipelago Python')
    expect(html).toContain('Etapa 1.1')
  })

  it('lista explicitamente o que ainda nao existe', () => {
    expect(html).toContain('O que ainda nao existe')
    expect(html).toContain('Pyodide')
    expect(html).toContain('nenhuma ilha')
  })

  it('explica por que a pagina nao tem botoes', () => {
    expect(html).toContain('nao tem nenhum botao')
  })

  it('mostra todas as unidades planejadas', () => {
    for (const unidade of PLANO_DE_UNIDADES) {
      expect(html, `Unidade ausente na pagina: ${unidade.titulo}`).toContain(unidade.titulo)
      expect(html).toContain(unidade.tema)
    }
  })

  it('exibe referencia de pagina pendente e nunca um numero de pagina', () => {
    const ocorrencias = html.match(/referencia pendente/g) ?? []
    expect(ocorrencias.length).toBeGreaterThanOrEqual(PLANO_DE_UNIDADES.length)
    // Nenhum "(pagina 123)" pode aparecer enquanto o PDF nao for verificado.
    expect(html).not.toMatch(/pagina \d+/i)
  })

  it('nao afirma que o mundo 3D ja existe', () => {
    expect(html).toContain('O mundo 3D: nenhuma ilha, nenhuma ponte')
  })

  it('declara que o livro nao esta no repositorio', () => {
    expect(html).toContain('nao esta no repositorio')
  })
})
