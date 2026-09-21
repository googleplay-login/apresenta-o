import { describe, expect, it } from 'vitest'
import {
  descreverReferencia,
  referenciaEstaCoerente,
  type ReferenciaLivro,
} from './referenciaLivro'
import { PLANO_DE_UNIDADES, idsEmOrdem, type UnidadePlanejada } from './planoDeUnidades'

describe('invariantes do plano de unidades', () => {
  it('tem pelo menos uma unidade planejada', () => {
    expect(PLANO_DE_UNIDADES.length).toBeGreaterThan(0)
  })

  it('nao repete identificadores', () => {
    const ids = PLANO_DE_UNIDADES.map((unidade) => unidade.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('usa ordem contigua comecando em 1', () => {
    const ordens = PLANO_DE_UNIDADES.map((unidade) => unidade.ordem).sort((a, b) => a - b)
    expect(ordens).toEqual(Array.from({ length: ordens.length }, (_, indice) => indice + 1))
  })

  it('nao deixa titulo nem tema vazios', () => {
    for (const unidade of PLANO_DE_UNIDADES) {
      expect(unidade.titulo.trim().length, `Unidade ${unidade.id} sem titulo`).toBeGreaterThan(0)
      expect(unidade.tema.trim().length, `Unidade ${unidade.id} sem tema`).toBeGreaterThan(0)
    }
  })

  it('devolve os identificadores na ordem do percurso', () => {
    expect(idsEmOrdem(PLANO_DE_UNIDADES)).toEqual(
      [...PLANO_DE_UNIDADES].sort((a, b) => a.ordem - b.ordem).map((unidade) => unidade.id),
    )
    expect(idsEmOrdem(PLANO_DE_UNIDADES)[0]).toBe('u01-primeiro-programa')
  })

  it('nao inventa numero de pagina enquanto o PDF nao estiver mapeado', () => {
    // Este e o teste mais importante deste arquivo. Ele existe para impedir que
    // alguem preencha uma pagina "mais ou menos" sem ter verificado o PDF.
    for (const unidade of PLANO_DE_UNIDADES) {
      const { referencia } = unidade
      if (referencia.status === 'referencia-pendente') {
        expect(
          referencia.paginaImpressa,
          `Unidade ${unidade.id} esta como pendente mas declara pagina impressa`,
        ).toBeNull()
        expect(
          referencia.paginaPdf,
          `Unidade ${unidade.id} esta como pendente mas declara pagina de PDF`,
        ).toBeNull()
      }
    }
  })

  it('mantem toda referencia coerente', () => {
    for (const unidade of PLANO_DE_UNIDADES) {
      expect(
        referenciaEstaCoerente(unidade.referencia),
        `Referencia incoerente na unidade ${unidade.id}`,
      ).toBe(true)
    }
  })

  it('aponta as paginas como referencia pendente em vez de exibir numero inventado', () => {
    for (const unidade of PLANO_DE_UNIDADES) {
      expect(descreverReferencia(unidade.referencia)).toContain('referencia pendente')
    }
  })
})

describe('coerencia de ReferenciaLivro', () => {
  const base: ReferenciaLivro = {
    capitulo: 2,
    tituloCapitulo: 'Variaveis e tipos de dados simples',
    recorteProposto: 'Recorte de teste.',
    paginaImpressa: null,
    paginaPdf: null,
    status: 'referencia-pendente',
  }

  it('aceita referencia pendente sem paginas', () => {
    expect(referenciaEstaCoerente(base)).toBe(true)
  })

  it('aceita referencia confirmada com as duas paginas', () => {
    expect(
      referenciaEstaCoerente({ ...base, status: 'confirmada', paginaImpressa: 21, paginaPdf: 27 }),
    ).toBe(true)
  })

  it('recusa confirmada com apenas uma das paginas', () => {
    // Pagina impressa e pagina de PDF sao coisas diferentes: o deslocamento
    // nao e constante e nao pode ser presumido.
    expect(
      referenciaEstaCoerente({ ...base, status: 'confirmada', paginaImpressa: 21, paginaPdf: null }),
    ).toBe(false)
    expect(
      referenciaEstaCoerente({ ...base, status: 'confirmada', paginaImpressa: null, paginaPdf: 27 }),
    ).toBe(false)
  })

  it('recusa pendente com pagina preenchida', () => {
    expect(referenciaEstaCoerente({ ...base, paginaImpressa: 21, paginaPdf: 27 })).toBe(false)
  })

  it('descreve a referencia confirmada com o numero da pagina impressa', () => {
    const confirmada: ReferenciaLivro = {
      ...base,
      status: 'confirmada',
      paginaImpressa: 21,
      paginaPdf: 27,
    }
    expect(descreverReferencia(confirmada)).toBe(
      'Cap. 2 - Variaveis e tipos de dados simples (pagina 21)',
    )
  })
})

describe('estado de construcao das unidades', () => {
  it('nao declara nenhuma unidade como pronta nesta etapa do projeto', () => {
    // Garante que a pagina de status nao prometa conteudo que ainda nao existe.
    // Quando a primeira unidade ficar pronta de verdade, este teste deve ser
    // atualizado junto com a entrega - e nao antes.
    const descricao = PLANO_DE_UNIDADES.map((unidade: UnidadePlanejada) => unidade.situacao)
    expect(descricao.every((situacao) => situacao === 'planejada')).toBe(true)
  })
})
