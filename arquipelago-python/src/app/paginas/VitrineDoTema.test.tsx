import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { VitrineDoTema } from './VitrineDoTema'
import { PARES_DE_CONTRASTE } from '../../ui/theme/tokens'
import { todasAsAmostras } from '../../ui/theme/amostras'

const html = renderToStaticMarkup(<VitrineDoTema />)

describe('guia de estilo', () => {
  it('renderiza sem lançar erro', () => {
    expect(html.length).toBeGreaterThan(2000)
  })

  it('não tem nenhum controle: nem botão, nem link, nem manipulador de clique', () => {
    // O guia é uma folha de espécimes. Um controle falso aqui seria promessa
    // falsa, e a regra do projeto proíbe controle sem efeito.
    expect(html).not.toMatch(/<button/i)
    expect(html).not.toMatch(/<a[\s>]/i)
    expect(html.toLowerCase()).not.toContain('onclick')
    expect(html.toLowerCase()).not.toContain('href=')
    expect(html.toLowerCase()).not.toContain('<input')
    expect(html.toLowerCase()).not.toContain('<select')
  })

  it('mostra todas as cores da interface', () => {
    for (const amostra of todasAsAmostras()) {
      expect(html, `Cor ausente no guia: ${amostra.caminho}`).toContain(amostra.caminho)
    }
  })

  it('mostra os três estados de construção', () => {
    expect(html).toContain('Planejada')
    expect(html).toContain('Em construção')
    expect(html).toContain('Pronta')
  })

  it('mostra a tabela de contraste com todos os pares declarados', () => {
    for (const par of PARES_DE_CONTRASTE) {
      expect(html, `Par ausente na tabela: ${par.onde}`).toContain(par.onde)
    }
  })

  it('avisa que os espécimes do mundo 3D não são controles', () => {
    expect(html).toContain('não são controles')
    expect(html).toContain('não fazem nada')
  })

  it('declara o limite: mede tokens, não pixels', () => {
    expect(html).toContain('Não mede os pixels na tela')
  })

  it('não afirma que o mundo 3D existe', () => {
    expect(html).toContain('ainda não existe')
  })
})
