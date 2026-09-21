/// <reference types="node" />
// @vitest-environment node
/**
 * A folha de estilo usa as variáveis que o tema define?
 *
 * Esta verificação existe por causa de um defeito real: o CSS chegou a pedir
 * `var(--painel.fundo-elevado)`, com ponto no lugar do hífen. Nada quebrou, nada
 * avisou — o navegador simplesmente ignorou a linha e o texto ficou com a cor
 * errada. Num ambiente sem navegador, esse tipo de erro é invisível: nenhum
 * teste de jsdom lê CSS, e ninguém vê a tela.
 *
 * Então a conferência é de texto, e é honesta quanto ao que faz: compara os
 * nomes pedidos no CSS com os nomes gerados por `tokensComoVariaveisCss()`. Ela
 * não julga se a cor é bonita nem se o contraste está bom — disso cuida
 * `src/ui/theme/contraste.test.ts`.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { tokensComoVariaveisCss } from '../src/ui/theme/tokens'

const CAMINHO_DO_CSS = fileURLToPath(new URL('../src/app/app.css', import.meta.url))
const css = readFileSync(CAMINHO_DO_CSS, 'utf8')

/** Todas as variáveis definidas pelo tema, com o `--` na frente. */
const definidas = new Set(Object.keys(tokensComoVariaveisCss()))

/** Todas as variáveis pedidas pelo CSS, na ordem em que aparecem. */
function variaveisPedidas(): readonly string[] {
  const pedidas: string[] = []
  const padrao = /var\(\s*(--[A-Za-z0-9_.-]+)/g

  for (const achado of css.matchAll(padrao)) {
    if (achado[1] !== undefined) {
      pedidas.push(achado[1])
    }
  }

  return pedidas
}

describe('a folha de estilo e o tema', () => {
  it('o tema define um número plausível de variáveis', () => {
    expect(definidas.size).toBeGreaterThan(20)
  })

  it('não pede nenhuma variável que o tema não defina', () => {
    const desconhecidas = [...new Set(variaveisPedidas())].filter(
      (nome) => !definidas.has(nome),
    )

    expect(
      desconhecidas,
      `Estas variáveis são pedidas no CSS e não existem nos tokens: ${desconhecidas.join(', ')}`,
    ).toEqual([])
  })

  it('não escreve nome de variável com ponto', () => {
    // A forma errada que já entrou uma vez: `--painel.fundo-elevado`. O ponto
    // não existe em nome de variável CSS, e o navegador ignora a declaração
    // inteira sem dizer nada.
    const comPonto = variaveisPedidas().filter((nome) => nome.includes('.'))
    expect(comPonto).toEqual([])
  })

  it('pede as variáveis com o mesmo nome que o tema gera', () => {
    // Nomes de variável aqui são kebab-case: o tema converte os tokens para
    // isso. Se alguém escrever `--painelFundoElevado` no CSS, o valor não
    // chega — e o teste acima também pegaria, mas esta mensagem é mais direta.
    const camelCase = variaveisPedidas().filter((nome) => /[A-Z]/.test(nome))
    expect(camelCase).toEqual([])
  })
})
