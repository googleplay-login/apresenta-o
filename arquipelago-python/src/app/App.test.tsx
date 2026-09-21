import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { App } from './App'
import { Mundo } from './paginas/Mundo'
import { PainelDoProjeto } from './paginas/PainelDoProjeto'
import { VitrineDoTema } from './paginas/VitrineDoTema'
import { PLANO_DE_UNIDADES } from '../content/planoDeUnidades'

/**
 * Renderiza a aplicação para HTML estático e confere o que ela afirma.
 *
 * O que este teste PROVA: a árvore de componentes monta sem lançar erro, o
 * conteúdo esperado está no HTML gerado, e o que a tela promete bate com as
 * constantes do domínio.
 *
 * O que este teste NÃO prova: aparência, layout, contraste na tela, teclado,
 * arrasto do mouse, desempenho e comportamento real do WebGL. Não existe
 * navegador neste ambiente. Aquela verificação está listada como NÃO EXECUTADA
 * em `docs/TEST_REPORT.md`.
 *
 * Sem `window` — é o caso aqui —, a rota resolvida é a padrão (`mundo`) e
 * `temWebgl()` devolve `false`. O HTML abaixo mostra, portanto, a alternativa em
 * texto do mundo: a trilha de ilhas, que é o caminho acessível e também o que
 * aparece numa máquina sem placa de vídeo.
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

  it('tem exatamente três abas, e todas levam a uma rota interna', () => {
    const links = html.match(/href="([^"]*)"/g) ?? []
    expect(links).toEqual(['href="#/"', 'href="#/painel"', 'href="#/tema"'])
  })

  it('marca a aba ativa para leitor de tela', () => {
    expect(html).toContain('aria-current="page"')
  })

  it('abre no mundo, não numa página sobre o projeto', () => {
    // A rota padrão é a tela de trabalho. Quem abre o site quer estudar.
    expect(html).toContain('As ilhas do arquipélago')
    expect(html).toContain(`0 de ${PLANO_DE_UNIDADES.length} ilhas aprovadas`)
  })

  it('tem controles de verdade, e todos declaram o que fazem', () => {
    // A regra D-009 continua valendo — controle sem efeito não entra na tela.
    // Agora existem funções reais: abrir unidade, trocar a câmera, apagar
    // progresso. Todo `<button>` da casca tem rótulo em texto.
    const botoes = html.match(/<button[^>]*>([^<]*)<\/button>/g) ?? []
    expect(botoes.length).toBeGreaterThan(3)

    for (const botao of botoes) {
      const rotulo = (botao.match(/>([^<]*)<\/button>$/) ?? [])[1] ?? ''
      expect(rotulo.trim().length, `Botão sem rótulo: ${botao}`).toBeGreaterThan(0)
    }
  })

  it('anuncia a alternativa em texto quando não há desenho 3D', () => {
    expect(html).toContain('Sem desenho 3D nesta máquina')
    expect(html).toContain('A trilha inteira continua funcionando em texto')
  })

  it('explica que o progresso fica nesta máquina e que não há conta', () => {
    expect(html).toContain('O progresso fica guardado neste navegador')
    expect(html).toContain('Não há conta')
  })
})

describe('página do mundo', () => {
  const mundo = renderToStaticMarkup(<Mundo />)

  it('lista todas as unidades planejadas, na ordem do percurso', () => {
    for (const unidade of PLANO_DE_UNIDADES) {
      expect(mundo, `Unidade ausente na trilha: ${unidade.titulo}`).toContain(unidade.titulo)
      expect(mundo).toContain(unidade.tema)
    }

    const posicoes = PLANO_DE_UNIDADES.map((unidade) => mundo.indexOf(unidade.titulo))
    expect(posicoes).toEqual([...posicoes].sort((a, b) => a - b))
  })

  it('começa com a primeira ilha liberada e as outras três bloqueadas', () => {
    expect(mundo).toContain('ilha-cartao--disponivel')
    expect((mundo.match(/ilha-cartao--bloqueada/g) ?? []).length).toBe(
      PLANO_DE_UNIDADES.length - 1,
    )
    expect(mundo).not.toContain('ilha-cartao--aprovada')
  })

  it('desabilita o botão de entrar nas ilhas bloqueadas', () => {
    // Desabilitado de verdade, no elemento. Não é só cor mais clara: quem usa
    // teclado ou leitor de tela também não entra.
    const desabilitados = mundo.match(/<button[^>]*disabled[^>]*>Entrar<\/button>/g) ?? []
    expect(desabilitados.length).toBe(PLANO_DE_UNIDADES.length - 1)
    expect(mundo).toContain('>Entrar<')
  })

  it('diz qual ilha abre a seguinte', () => {
    expect(mundo).toContain('Bloqueada: aprovar')
    expect(mundo).toContain(PLANO_DE_UNIDADES[0]?.titulo ?? '')
  })

  it('não promete 3D quando não há WebGL, nem oferece botão sem efeito', () => {
    // Sem placa de vídeo, um botão "Ligar o 3D" não teria o que ligar. Ele não é
    // mostrado: controle que não faz nada não entra na tela (D-009).
    expect(mundo).toContain('Sem desenho 3D nesta máquina')
    expect(mundo).not.toContain('Ligar o 3D')
    expect(mundo).not.toContain('Usar sem 3D')
    expect(mundo).not.toContain('Voo livre')
  })

  it('não menciona número de página do livro', () => {
    expect(mundo).not.toMatch(/página \d+/i)
  })
})

describe('painel do projeto', () => {
  const painel = renderToStaticMarkup(<PainelDoProjeto />)

  it('lista explicitamente o que ainda não existe', () => {
    expect(painel).toContain('O que ainda não existe')
    // O que continua ausente, dito na cara: sem navegador com WebGL, o teste de
    // navegador automatizado não existe, e as unidades 7 em diante não foram
    // escritas. O Pyodide saiu desta lista na Etapa 9 — e a conferência do
    // exercício, na Etapa 10: recurso pronto não fica na lista de ausentes.
    expect(painel).toContain('Playwright')
    // O número vem do plano: a primeira unidade sem conteúdo muda a cada lote, e
    // um literal aqui envelheceria junto (D-058).
    expect(painel).toContain(`unidades ${PLANO_DE_UNIDADES.length + 1} em diante`)
    expect(painel).not.toContain('nada de código roda ainda')
  })

  it('mostra todas as unidades planejadas', () => {
    for (const unidade of PLANO_DE_UNIDADES) {
      expect(painel, `Unidade ausente na página: ${unidade.titulo}`).toContain(unidade.titulo)
      expect(painel).toContain(unidade.tema)
    }
  })

  it('exibe referência de página pendente e nunca um número de página', () => {
    const ocorrencias = painel.match(/referência pendente/g) ?? []
    expect(ocorrencias.length).toBeGreaterThanOrEqual(PLANO_DE_UNIDADES.length)
    expect(painel).not.toMatch(/página \d+/i)
  })

  it('declara que o livro não está no repositório', () => {
    expect(painel).toContain('não está no repositório')
  })

  it('não afirma que recurso pronto está ausente', () => {
    // Esta lista envelheceu uma vez: durante três etapas o painel continuou
    // dizendo "nenhuma ilha, nenhuma ponte, nenhum avatar" e "nada é gravado no
    // navegador". Texto de estado que mente é defeito, e o teste trava o retorno.
    expect(painel).toMatch(/ilhas suspensas, pontes, céu, mar/)
    // O número de ilhas vem de `PLANO_DE_UNIDADES`: com duas ilhas novas no lote 4,
    // um texto que dissesse "dez" seria mentira, e o teste não fixa o número para
    // não travar o próximo lote.
    expect(painel).toMatch(new RegExp(`${PLANO_DE_UNIDADES.length} ilhas suspensas`))
    expect(painel).not.toContain('nenhuma ilha, nenhuma ponte')
    expect(painel).not.toContain('nada é gravado no navegador')
    expect(painel).not.toContain('nenhuma pergunta escrita')
    expect(painel).not.toContain('não há tela que as use')
  })

  it('avisa que o desenho 3D não foi visto por ninguém', () => {
    expect(painel).toContain('ninguém viu o desenho 3D')
  })

  it('diz que a leitura marcada não aprova nem muda nota', () => {
    expect(painel).toContain('leitura é registro')
    expect(painel).toContain('não aprova a unidade')
  })
})

describe('guia de estilo', () => {
  const vitrine = renderToStaticMarkup(<VitrineDoTema />)

  it('mostra as cores e os estados do tema', () => {
    expect(vitrine.length).toBeGreaterThan(1000)
    expect(vitrine).toMatch(/#[0-9a-f]{6}/i)
  })
})
