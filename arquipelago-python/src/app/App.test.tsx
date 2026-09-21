import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { App } from './App'
import { PLANO_DE_UNIDADES } from '../content/planoDeUnidades'
import { ESTADO_DO_PROJETO } from '../learning/resumoDoProjeto'

/**
 * Renderiza a aplicação para HTML estático e confere o que ela afirma.
 *
 * O que este teste PROVA: a árvore de componentes monta sem lançar erro e o
 * conteúdo esperado está no HTML gerado.
 *
 * O que este teste NÃO prova: aparência, layout, contraste na tela, teclado e
 * comportamento no navegador. Não existe navegador neste ambiente. Aquela
 * verificação está listada como NÃO EXECUTADA em `docs/TEST_REPORT.md`.
 *
 * Sem `window`, a rota resolvida é a padrão: o painel do projeto.
 */
const html = renderToStaticMarkup(<App />)

describe('casca da aplicação', () => {
  it('renderiza sem lançar erro e gera conteúdo de verdade', () => {
    expect(html.length).toBeGreaterThan(2000)
  })

  it('diz o nome do projeto e em que etapa o desenvolvimento está', () => {
    expect(html).toContain('Arquipélago Python')
    expect(html).toContain('Etapa')
  })

  it('tem exatamente duas abas, e ambas levam a uma rota interna', () => {
    const links = html.match(/href="([^"]*)"/g) ?? []
    expect(links).toEqual(['href="#/"', 'href="#/tema"'])
  })

  it('marca a aba ativa para leitor de tela', () => {
    expect(html).toContain('aria-current="page"')
  })

  it('não tem nenhum botão', () => {
    // Decisão D-009: recurso que não funciona não aparece como controle.
    // Nesta etapa não existe nenhuma função do ciclo de estudo com tela.
    expect(html).not.toMatch(/<button/i)
    expect(html.toLowerCase()).not.toContain('onclick')
  })
})

describe('painel do projeto', () => {
  it('lista explicitamente o que ainda não existe', () => {
    expect(html).toContain('O que ainda não existe')
    expect(html).toContain('Pyodide')
    expect(html).toContain('nenhuma ilha')
  })

  it('explica por que a página não tem botões', () => {
    expect(html).toContain('não tem nenhum botão')
  })

  it('mostra todas as unidades planejadas', () => {
    for (const unidade of PLANO_DE_UNIDADES) {
      expect(html, `Unidade ausente na página: ${unidade.titulo}`).toContain(unidade.titulo)
      expect(html).toContain(unidade.tema)
    }
  })

  it('exibe referência de página pendente e nunca um número de página', () => {
    const ocorrencias = html.match(/referência pendente/g) ?? []
    expect(ocorrencias.length).toBeGreaterThanOrEqual(PLANO_DE_UNIDADES.length)
    expect(html).not.toMatch(/página \d+/i)
  })

  it('descreve as regras usando as constantes reais do domínio', () => {
    // O texto da interface não pode divergir da regra: ele é montado a partir
    // das constantes de src/learning/avaliacao.ts.
    expect(html).toContain(ESTADO_DO_PROJETO.notaFraca)
    expect(html).toContain(ESTADO_DO_PROJETO.reprovacao)
    expect(html).toContain('80%')
    expect(html).toContain('5 perguntas')
  })

  it('não afirma que o mundo 3D já existe', () => {
    expect(html).toContain('O mundo 3D: nenhuma ilha, nenhuma ponte')
  })

  it('declara que o livro não está no repositório', () => {
    expect(html).toContain('não está no repositório')
  })
})
