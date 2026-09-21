import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

/**
 * O outro lado do mundo: o que aparece quando existe placa de vídeo.
 *
 * A cena de verdade depende de WebGL e de um navegador, que não existem aqui.
 * Este arquivo troca a cena por um marcador e diz "há WebGL" para poder olhar o
 * resto: HUD completo, controles de câmera, aviso de teclas e o painel de
 * estudo aberto no passo certo.
 *
 * O que continua NÃO verificado aqui: o desenho 3D em si — triângulos, luz,
 * câmera, arrasto do mouse. Isso exige navegador e está listado como NÃO
 * EXECUTADO em `docs/TEST_REPORT.md`.
 */

vi.mock('../../world/Cena', () => ({
  Cena: () => <div data-cena-de-teste="1" />,
}))

vi.mock('../../world/suporteWebgl', () => ({
  temWebgl: () => true,
  useSuporteWebgl: () => true,
}))

const { Mundo } = await import('./Mundo')

const html = renderToStaticMarkup(<Mundo />)

describe('mundo com desenho 3D disponível', () => {
  it('mostra um aviso honesto enquanto o pacote da cena é buscado', () => {
    // A cena entra por importação sob demanda, então a primeira renderização
    // estática mostra o aviso de carregamento — nunca um retângulo vazio. Que a
    // cena monta depois disso é o que o teste com DOM verifica
    // (`Mundo.3d.test.tsx`).
    expect(html).toContain('Preparando o mundo 3D')
    expect(html).not.toContain('data-cena-de-teste')
  })

  it('mantém a trilha em texto ao lado, sem depender da cena', () => {
    expect(html).toContain('As ilhas do arquipélago')
  })

  it('oferece os dois modos de câmera, com um deles marcado como ativo', () => {
    expect(html).toContain('Voo livre')
    expect(html).toContain('Vista de mapa')
    expect((html.match(/botao--ativo/g) ?? []).length).toBe(1)
  })

  it('oferece a saída para a versão em texto', () => {
    expect(html).toContain('Usar sem 3D')
    expect(html).not.toContain('Sem desenho 3D nesta máquina')
  })

  it('ensina a pilotar, em vez de deixar o usuário adivinhar', () => {
    expect(html).toContain('Como pilotar')
    expect(html).toContain('Arrastar com o mouse')
  })

  it('não abre nenhum painel de estudo antes de escolher uma ilha', () => {
    expect(html).not.toContain('painel__corpo')
    expect(html).toContain('Passe o mouse sobre uma ilha para ver o nome dela')
  })
})
