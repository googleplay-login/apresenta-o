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

  it('não repete identificadores', () => {
    const ids = PLANO_DE_UNIDADES.map((unidade) => unidade.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('usa ordem contígua começando em 1', () => {
    const ordens = PLANO_DE_UNIDADES.map((unidade) => unidade.ordem).sort((a, b) => a - b)
    expect(ordens).toEqual(Array.from({ length: ordens.length }, (_, indice) => indice + 1))
  })

  it('não deixa título nem tema vazios', () => {
    for (const unidade of PLANO_DE_UNIDADES) {
      expect(unidade.titulo.trim().length, `Unidade ${unidade.id} sem título`).toBeGreaterThan(0)
      expect(unidade.tema.trim().length, `Unidade ${unidade.id} sem tema`).toBeGreaterThan(0)
    }
  })

  it('devolve os identificadores na ordem do percurso', () => {
    expect(idsEmOrdem(PLANO_DE_UNIDADES)).toEqual(
      [...PLANO_DE_UNIDADES].sort((a, b) => a.ordem - b.ordem).map((unidade) => unidade.id),
    )
    expect(idsEmOrdem(PLANO_DE_UNIDADES)[0]).toBe('u01-primeiro-programa')
  })

  it('não inventa número de página enquanto o PDF não estiver mapeado', () => {
    // Este é o teste mais importante deste arquivo. Ele existe para impedir que
    // alguém preencha uma página "mais ou menos" sem ter verificado o PDF.
    for (const unidade of PLANO_DE_UNIDADES) {
      const { referencia } = unidade
      if (referencia.status === 'referencia-pendente') {
        expect(
          referencia.paginaImpressa,
          `Unidade ${unidade.id} está como pendente mas declara página impressa`,
        ).toBeNull()
        expect(
          referencia.paginaPdf,
          `Unidade ${unidade.id} está como pendente mas declara página de PDF`,
        ).toBeNull()
      }
    }
  })

  it('mantém toda referência coerente', () => {
    for (const unidade of PLANO_DE_UNIDADES) {
      expect(
        referenciaEstaCoerente(unidade.referencia),
        `Referência incoerente na unidade ${unidade.id}`,
      ).toBe(true)
    }
  })

  it('aponta as páginas como referência pendente em vez de exibir número inventado', () => {
    for (const unidade of PLANO_DE_UNIDADES) {
      expect(descreverReferencia(unidade.referencia)).toContain('referência pendente')
    }
  })

  it('mostra o capítulo e o título do capítulo na descrição', () => {
    const primeira = PLANO_DE_UNIDADES[0]
    expect(primeira).toBeDefined()
    expect(descreverReferencia(primeira!.referencia)).toBe('Cap. 1 — Iniciando (página: referência pendente)')
  })
})

describe('coerência de ReferenciaLivro', () => {
  const base: ReferenciaLivro = {
    capitulo: 2,
    tituloCapitulo: 'Variáveis e tipos de dados simples',
    recorteProposto: 'Recorte de teste.',
    paginaImpressa: null,
    paginaPdf: null,
    status: 'referencia-pendente',
  }

  it('aceita referência pendente sem páginas', () => {
    expect(referenciaEstaCoerente(base)).toBe(true)
  })

  it('aceita referência confirmada com as duas páginas', () => {
    expect(
      referenciaEstaCoerente({ ...base, status: 'confirmada', paginaImpressa: 21, paginaPdf: 27 }),
    ).toBe(true)
  })

  it('recusa confirmada com apenas uma das páginas', () => {
    // Página impressa e página de PDF são coisas diferentes: o deslocamento
    // não é constante e não pode ser presumido.
    expect(
      referenciaEstaCoerente({ ...base, status: 'confirmada', paginaImpressa: 21, paginaPdf: null }),
    ).toBe(false)
    expect(
      referenciaEstaCoerente({ ...base, status: 'confirmada', paginaImpressa: null, paginaPdf: 27 }),
    ).toBe(false)
  })

  it('recusa pendente com página preenchida', () => {
    expect(referenciaEstaCoerente({ ...base, paginaImpressa: 21, paginaPdf: 27 })).toBe(false)
  })

  it('descreve a referência confirmada com o número da página impressa', () => {
    const confirmada: ReferenciaLivro = {
      ...base,
      status: 'confirmada',
      paginaImpressa: 21,
      paginaPdf: 27,
    }
    expect(descreverReferencia(confirmada)).toBe(
      'Cap. 2 — Variáveis e tipos de dados simples (página 21)',
    )
  })
})

describe('estado de construção das unidades', () => {
  it('não declara nenhuma unidade como pronta nesta etapa do projeto', () => {
    // Garante que a página de status não prometa conteúdo que ainda não existe.
    // Quando a primeira unidade ficar pronta de verdade, este teste deve ser
    // atualizado junto com a entrega — e não antes.
    const situacoes = PLANO_DE_UNIDADES.map((unidade: UnidadePlanejada) => unidade.situacao)
    expect(situacoes.every((situacao) => situacao === 'planejada')).toBe(true)
  })
})
