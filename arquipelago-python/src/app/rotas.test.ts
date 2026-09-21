import { describe, expect, it } from 'vitest'
import { ROTA_PADRAO, ROTAS, enderecoDaRota, hashAtual, rotaDoHash } from './rotas'

describe('tradução de hash em rota', () => {
  it('reconhece as rotas conhecidas', () => {
    expect(rotaDoHash('')).toBe('painel')
    expect(rotaDoHash('#')).toBe('painel')
    expect(rotaDoHash('#/')).toBe('painel')
    expect(rotaDoHash('#/tema')).toBe('tema')
  })

  it('tolera barra final, maiúsculas e espaços', () => {
    expect(rotaDoHash('#/tema/')).toBe('tema')
    expect(rotaDoHash('#/TEMA')).toBe('tema')
    expect(rotaDoHash('  #/tema  ')).toBe('tema')
  })

  it('cai na rota padrão quando o hash não existe', () => {
    expect(rotaDoHash('#/inexistente')).toBe(ROTA_PADRAO)
    expect(rotaDoHash('#/tema/extra')).toBe(ROTA_PADRAO)
    expect(rotaDoHash('lixo')).toBe(ROTA_PADRAO)
  })

  it('não deixa o hash escolher estado de progresso', () => {
    // A rota é só apresentação. Nenhum hash conhecido ou inventado devolve algo
    // diferente de uma das rotas declaradas — não existe rota que desbloqueie
    // unidade, e este teste existe para que isso continue verdadeiro.
    const tentativas = [
      '#/ilha/3',
      '#/unidade/u04?liberada=1',
      '#/tema#/painel',
      '#/desbloquear',
      '#/u04-listas-do-mercado',
    ]

    for (const hash of tentativas) {
      expect(Object.keys(ROTAS)).toContain(rotaDoHash(hash))
    }
  })

  it('gera endereço a partir da rota', () => {
    expect(enderecoDaRota('painel')).toBe('#/')
    expect(enderecoDaRota('tema')).toBe('#/tema')
  })
})

describe('hash atual fora do navegador', () => {
  it('devolve texto vazio quando não existe window', () => {
    // É o que permite renderizar a aplicação em teste sem navegador.
    expect(hashAtual()).toBe('')
    expect(rotaDoHash(hashAtual())).toBe('painel')
  })
})
