import { describe, expect, it } from 'vitest'
import {
  descreverReferencia,
  referenciaEstaCoerente,
  type ReferenciaLivro,
} from './referenciaLivro'
import { PLANO_DE_UNIDADES, TRILHAS, idsEmOrdem, trilhaDe } from './planoDeUnidades'
import { conteudoDaUnidade } from './unidades'

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

describe('as trilhas do livro', () => {
  it('toda unidade pertence a uma trilha declarada', () => {
    // A trilha é o que diz de que parte do livro a ilha é, e o que o console
    // roda ali. Unidade sem trilha declarada seria uma ilha sem lugar no mapa.
    for (const unidade of PLANO_DE_UNIDADES) {
      expect(
        TRILHAS.some((trilha) => trilha.id === unidade.trilha),
        `A unidade ${unidade.id} aponta para a trilha ${unidade.trilha}, que não existe`,
      ).toBe(true)
    }
  })

  it('o capítulo da unidade está entre os capítulos da trilha dela', () => {
    for (const unidade of PLANO_DE_UNIDADES) {
      const trilha = trilhaDe(unidade.trilha)
      expect(
        trilha.capitulos.includes(unidade.referencia.capitulo),
        `A unidade ${unidade.id} é do capítulo ${unidade.referencia.capitulo}, fora da trilha ${trilha.id}`,
      ).toBe(true)
    }
  })

  it('a situação da trilha bate com o que existe: escrita tem unidade, planejada não tem', () => {
    // Este é o teste que impede a lista de trilhas de envelhecer dizendo que uma
    // parte está escrita quando ainda não está — e o contrário também.
    for (const trilha of TRILHAS) {
      const unidades = PLANO_DE_UNIDADES.filter((unidade) => unidade.trilha === trilha.id)
      if (trilha.situacao === 'escrita') {
        expect(unidades.length, `A trilha ${trilha.id} diz que está escrita e não tem unidade`).toBeGreaterThan(0)
      } else {
        expect(unidades.length, `A trilha ${trilha.id} diz que está planejada e já tem unidade`).toBe(0)
      }
    }
  })

  it('toda trilha diz o que o console roda ali, e diz com o motivo', () => {
    // A partir da Parte II o console não roda tudo o que o livro mostra. Uma
    // trilha que não declarasse isso deixaria a pessoa descobrindo no erro.
    for (const trilha of TRILHAS) {
      expect(trilha.oConsoleRoda.trim().length, `A trilha ${trilha.id} não diz o que o console roda`).toBeGreaterThan(60)
      expect(trilha.resumo.trim().length).toBeGreaterThan(30)
    }
  })

  it('as trilhas de projeto são as três do livro, com os capítulos em ordem', () => {
    const projetos = TRILHAS.filter((trilha) => trilha.projeto !== null)
    expect(projetos.map((trilha) => trilha.projeto)).toEqual([1, 2, 3])
    for (const trilha of projetos) {
      const capitulos = [...trilha.capitulos]
      expect(capitulos).toEqual([...capitulos].sort((a, b) => a - b))
      expect(capitulos.length).toBeGreaterThan(1)
    }
    // A trilha dos conceitos é a Parte I inteira: os capítulos 1 a 11.
    const conceitos = TRILHAS.find((trilha) => trilha.id === 'conceitos-basicos')
    expect(conceitos?.capitulos).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
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
  it('não promete conteúdo que ainda não existe', () => {
    // A página de status não pode dizer "pronta" de uma unidade sem aula escrita:
    // seria prometer o que o estudante não encontraria ao entrar.
    const mentindo = PLANO_DE_UNIDADES.filter(
      (unidade) => conteudoDaUnidade(unidade.id) === null && unidade.situacao === 'pronta',
    )

    expect(mentindo.map((unidade) => unidade.id)).toEqual([])
  })

  it('não deixa unidade com conteúdo escrito marcada como "planejada"', () => {
    // O contrário também engana, e é o que aconteceu até a Etapa 11: as quatro
    // primeiras unidades tinham conteúdo completo — missão, leitura, explicação,
    // exercícios e perguntas — e o painel do projeto continuava mostrando
    // "planejada". O teste antigo exigia exatamente isso, e por isso mentia junto.
    const paradas = PLANO_DE_UNIDADES.filter(
      (unidade) => conteudoDaUnidade(unidade.id) !== null && unidade.situacao === 'planejada',
    )

    expect(paradas.map((unidade) => unidade.id)).toEqual([])
  })
})
