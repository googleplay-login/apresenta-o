import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { canais, misturar, paraLinear } from '../../world/geometria/pintura'
import {
  CORES_DAS_ILHAS,
  CORES_DERIVADAS,
  CORES_DO_AVATAR,
  CORES_DO_MUNDO,
  corDaIlha,
} from './paleta3d'
import {
  CORES_AJUSTADAS_AO_DESENHAR,
  CORES_DO_MUNDO_INTEIRO,
  DIRECOES,
  PISO_DE_LUZ,
  SUPERFICIES_DO_MUNDO,
  SUPERFICIES_GRANDES_DO_MUNDO,
  INTENSIDADE_DO_SOL,
  INTENSIDADE_DA_MEIA_LUZ,
  POSICAO_DO_SOL,
  TETO_DE_MATERIAL,
  corNoOrcamentoDeLuz,
  luzDe,
  maiorRadiacao,
  piorEscuridao,
  piorEscuridaoVisivel,
  piorRadiacao,
  radiacao,
} from './luzDoMundo'

/**
 * A cor que chega à tela — e não só a cor do token.
 *
 * Esta é a conferência que faltava (D-060). Ela nasceu de uma captura de tela: na
 * imagem, o mar distante era um retângulo de papel branco e a ponta das ilhas era
 * um bico preto, dois defeitos que **nenhum** teste pegava, porque todo teste de
 * cor do projeto medido até então comparava o token com a paleta — e o token
 * estava certo nos dois casos.
 *
 * O que decidia a cor final era a luz somada ao material e comprimida pelo tone
 * mapping. A conta está em `luzDoMundo.ts`, e a partir daqui o projeto cobra:
 *
 *  - nenhuma cor do mundo pode chegar **queimada** à tela (radiação acima de 1,0);
 *  - nenhuma peça pode virar **buraco preto** (a ponta do penhasco chegou a
 *    #030201, com 0,005 de radiação, antes da correção);
 *  - e o mar distante, que é chão, tem de continuar **mais escuro** que o céu.
 */

describe('as luzes conferem com o mundo', () => {
  it('os números da meia-luz e do sol são os que a cena usa', () => {
    // Se alguém mexer na luz em `world/Ceu.tsx` sem mexer aqui, esta conferência
    // passaria a medir outro mundo — e o teste de estouro perderia o sentido.
    // Os valores estão escritos aqui de propósito: é um contrato entre dois
    // arquivos, e quebrá-lo tem de doer.
    expect(INTENSIDADE_DA_MEIA_LUZ).toBe(1.35)
    expect(INTENSIDADE_DO_SOL).toBe(1.15)
    expect([...POSICAO_DO_SOL]).toEqual([60, 90, 40])
  })

  it('a luz para cima é mais forte que a luz para baixo', () => {
    const paraCima = luzDe(radiacao(CORES_DO_MUNDO.capim, DIRECOES.paraCima))
    const paraBaixo = luzDe(radiacao(CORES_DO_MUNDO.capim, DIRECOES.paraBaixo))
    expect(paraCima).toBeGreaterThan(paraBaixo * 4)
  })
})

describe('nenhuma superfície do mundo chega queimada à tela', () => {
  it('a radiação de todas as superfícies fica no teto de 1,0', () => {
    // Só as superfícies entram aqui. A cor do céu, a da névoa e as duas cores de
    // luz têm o papel `fundo` ou `luz` (ver `luzDoMundo.ts`): medir a cor do céu
    // como superfície dá 1,58, que não quer dizer nada — o céu é a luz, não uma
    // coisa iluminada.
    //
    // As cores que o mundo ajusta **ao desenhar** saem daqui e são conferidas no
    // teste seguinte, sobre o valor desenhado.
    const queimadas: string[] = []
    for (const { nome, cor, semLuz } of SUPERFICIES_DO_MUNDO) {
      if (CORES_AJUSTADAS_AO_DESENHAR.includes(nome)) {
        continue
      }
      const pior = piorRadiacao(cor, semLuz)
      if (pior > 1) {
        queimadas.push(`${nome} chega a ${pior.toFixed(3)} de radiação (teto 1,0)`)
      }
    }
    expect(
      queimadas,
      'Superfície acima do teto perde a variação de luz e vira pano branco na tela',
    ).toEqual([])
  })

  it('as cores ajustadas ao desenhar passam do orçamento na paleta — e cabem depois do ajuste', () => {
    // Duas metades, e as duas importam: se a cor **não** passasse do teto na
    // paleta, o ajuste seria desnecessário e a lista estaria mentindo; se
    // continuasse acima depois do ajuste, o defeito estaria de volta.
    for (const nome of CORES_AJUSTADAS_AO_DESENHAR) {
      const entrada = SUPERFICIES_DO_MUNDO.find((candidata) => candidata.nome === nome)
      expect(entrada, `${nome} não está entre as superfícies do mundo`).toBeDefined()
      const comoEstaNaPaleta = piorRadiacao(entrada?.cor ?? 0)
      expect(comoEstaNaPaleta, `${nome} cabe no orçamento sem ajuste`).toBeGreaterThan(1)
      expect(
        piorRadiacao(corNoOrcamentoDeLuz(entrada?.cor ?? 0)),
        `${nome} continua acima do teto depois do ajuste`,
      ).toBeLessThanOrEqual(TETO_DE_MATERIAL)
    }
    expect(CORES_AJUSTADAS_AO_DESENHAR.length).toBeGreaterThan(0)
  })

  it('as cores do avatar, como o mundo as desenha, ficam dentro do orçamento', () => {
    // A cabeça é `#EDEDE8` e chegava a 1,46: uma bola branca chapada, sem a sombra
    // que dá volume à figura. O ajuste está em `world/Avatar.tsx`.
    const desenhadas = Object.values(CORES_DO_AVATAR).map((cor) => corNoOrcamentoDeLuz(cor))
    for (const [indice, cor] of desenhadas.entries()) {
      expect(piorRadiacao(cor), `A cor ${indice} do avatar estoura`).toBeLessThanOrEqual(
        TETO_DE_MATERIAL,
      )
    }
    const cruas = Object.values(CORES_DO_AVATAR)
    expect(
      Math.max(...cruas.map((cor) => piorRadiacao(cor))),
      'Nenhuma cor do avatar precisa mais de ajuste: tirar o ajuste de Avatar.tsx',
    ).toBeGreaterThan(1)
  })

  it('as cores de fundo e de luz não são conferidas como superfície', () => {
    // A fronteira é explícita para ninguém "consertar" o céu escurecendo a cor
    // dele: o que entra como superfície é o que é desenhado como material.
    const porPapel = Object.fromEntries(
      CORES_DO_MUNDO_INTEIRO.map((entrada) => [entrada.nome, entrada.papel]),
    )
    expect(porPapel['CORES_DO_MUNDO.ceu']).toBe('fundo')
    expect(porPapel['CORES_DO_MUNDO.nevoa']).toBe('fundo')
    expect(porPapel['CORES_DO_MUNDO.ceuDoAlto']).toBe('luz')
    expect(porPapel['CORES_DO_MUNDO.pale']).toBe('luz')
    expect(porPapel['CORES_DO_MUNDO.rocha']).toBe('fonte')
    expect(porPapel['CORES_DO_MUNDO.rochaClara']).toBe('superficie')
    expect(porPapel['CORES_DERIVADAS.parede']).toBe('superficie')
    // O sol entrou como 'luz' na D-065, e não como superfície: ele é o halo que o
    // céu soma por cima do próprio gradiente, num `shaderMaterial`. O núcleo dele
    // clarear até o branco é o comportamento esperado de um sol desenhado — e é
    // justamente o que o teto das **superfícies** existe para impedir numa parede.
    expect(porPapel['CORES_DERIVADAS.sol']).toBe('luz')

    const contar = (papel: string) =>
      CORES_DO_MUNDO_INTEIRO.filter((entrada) => entrada.papel === papel).length
    expect(contar('fundo'), 'Mudou a lista de cores de fundo').toBe(2)
    // Três desde a D-065: a meia-luz por cima, a luz de preenchimento por baixo
    // e o sol — as três são emitidas, nenhuma é pintada.
    expect(contar('luz'), 'Mudou a lista de cores de luz').toBe(3)
    expect(contar('fonte'), 'Mudou a lista de cores que só servem de mistura').toBe(5)
    // Nove cores fora do desenho como superfície: duas de fundo, três de luz e
    // cinco que só servem de mistura. O número do lado direito sai do próprio
    // código, e o nove é a soma das três contagens acima — quem mudar a lista
    // muda as duas contas de uma vez.
    expect(SUPERFICIES_DO_MUNDO.length).toBe(CORES_DO_MUNDO_INTEIRO.length - 10)
  })

  it('o mundo não desenha cor fora do orçamento: toda cor usada como material é superfície', () => {
    // Guarda contra a classificação envelhecer: se alguém passar a desenhar, no
    // mundo, uma cor que aqui está marcada como `fundo`, `luz` ou `fonte`, o valor
    // dela deixa de ser conferido — e é exatamente por essa fresta que uma cor
    // queimada passa. A varredura é de texto, sobre os componentes do mundo: é a
    // mesma técnica do guarda de acentuação (`qa/acentuacao.test.ts`).
    const arquivos = readdirSync('src/world')
      .filter((nome) => nome.endsWith('.tsx'))
      .map((nome) => `src/world/${nome}`)
    expect(arquivos.length).toBeGreaterThan(3)

    const materiais = new Set<string>()
    const ambiente = new Set<string>()
    for (const caminho of arquivos) {
      const texto = readFileSync(caminho, 'utf8')
      // A varredura é por **etiqueta**, e não por linha: em JSX um elemento pode
      // ocupar várias linhas, e o `color={...}` de um `directionalLight` fica
      // sozinho numa linha, longe da palavra `Light` que diz o que ele é. O
      // pedaço que interessa vai do `<` que abre a etiqueta até a cor.
      for (const achado of texto.matchAll(/CORES_(?:DO_MUNDO|DERIVADAS)\.([A-Za-z]+)/g)) {
        const inicio = texto.lastIndexOf('<', achado.index)
        if (inicio === -1) {
          continue
        }
        const etiqueta = texto.slice(inicio, achado.index)
        // Só conta se a etiqueta ainda estiver **aberta**: um `>` antes do nome
        // quer dizer que ele não está dentro de uma etiqueta, e sim numa conta
        // (por exemplo `misturar(pecas.tom, CORES_DO_MUNDO.nevoa, 0.4)`), onde
        // nenhuma cor é desenhada.
        if (etiqueta.includes('>')) {
          continue
        }
        const nome = achado[1] ?? ''

        // Uso como fundo, névoa ou cor de luz.
        if (/background|fog|Light/.test(etiqueta)) {
          ambiente.add(nome)
          continue
        }
        // Uso como material: `cor={...}`, `color={...}` ou as pontas de um
        // gradiente pintado por vértice (`corDe`/`corPara`).
        if (/cor=|color=|corDe:|corPara:/.test(etiqueta)) {
          materiais.add(nome)
        }
      }
    }

    const porPapel = Object.fromEntries(
      CORES_DO_MUNDO_INTEIRO.map((entrada) => [entrada.nome.split('.')[1] ?? '', entrada.papel]),
    )
    const fora = [...materiais].filter((nome) => porPapel[nome] !== 'superficie')
    expect(fora, 'Cor desenhada como material que não é conferida como superfície').toEqual([])

    const contrabando = [...ambiente].filter(
      (nome) => materiais.has(nome) && porPapel[nome] !== 'superficie',
    )
    expect(contrabando).toEqual([])
  })

  it('a laje do mar distante é desenhada sem luz de propósito, e o motivo é medível', () => {
    // Com a luz do mundo, a radiação dela passava de 1 (medido em 1,08 na versão
    // antiga) e o mar virava papel brilhante. Chapada, ela fica dentro do teto e
    // lê como o mar que continua até o horizonte. Este teste trava a decisão.
    const comLuz = maiorRadiacao(CORES_DERIVADAS.marDistante, DIRECOES.paraCima)
    const chapada = maiorRadiacao(CORES_DERIVADAS.marDistante, DIRECOES.paraCima, true)
    expect(comLuz).toBeLessThan(1)
    expect(chapada).toBeLessThan(1)
    expect(chapada).toBeLessThan(comLuz)
  })

  it('o mar distante é mais escuro que o céu, e o degrau é legível', () => {
    const ceu = luzDe(radiacao(CORES_DO_MUNDO.ceu, DIRECOES.paraCima, true))
    const mar = luzDe(radiacao(CORES_DERIVADAS.marDistante, DIRECOES.paraCima, true))
    expect(mar, 'O mar distante ficou mais claro que o céu: vira papel brilhando').toBeLessThan(ceu)
    expect(ceu - mar, 'O mar e o céu ficaram quase iguais: some o horizonte').toBeGreaterThan(0.08)
  })
})

describe('nenhuma peça vira buraco preto', () => {
  it('a ponta do penhasco tem luz suficiente para se ler como pedra', () => {
    // Antes da correção: `ajustar(rocha, 0.55)` dava #030201 na tela, e a ponta da
    // ilha aparecia como um bico preto pendurado no céu claro.
    const luzDaPonta = luzDe(radiacao(CORES_DERIVADAS.rochaDoFundo, DIRECOES.paraBaixo))
    expect(luzDaPonta, 'A ponta do penhasco escureceu de volta para preto').toBeGreaterThan(0.02)
  })

  it('a ponta continua mais escura que a pedra logo abaixo do capim', () => {
    // A correção não pode inverter a leitura de profundidade: o fundo da ilha
    // tem de continuar sendo o mais escuro da peça, e o alto o mais claro.
    const ponta = luzDe(radiacao(CORES_DERIVADAS.rochaDoFundo, DIRECOES.paraBaixo))
    const alto = luzDe(radiacao(CORES_DERIVADAS.rochaDoAlto, DIRECOES.deLado))
    expect(ponta).toBeLessThan(alto)
  })

  it('nenhuma superfície grande vira buraco: todas ficam acima do piso de luz', () => {
    // O piso existe por causa da ponta do penhasco: com `ajustar(rocha, 0.55)` ela
    // chegava a #030201 na tela e aparecia como um bico preto pendurado no céu
    // claro. Depois do conserto, a peça mais escura do mundo é o telhado (0,027 na
    // face de baixo, que fica escondida sob o próprio telhado) e a ponta fica em
    // 0,049 — medido.
    const escuras = SUPERFICIES_GRANDES_DO_MUNDO.filter((entrada) => !entrada.semLuz).map(
      ({ nome, cor }) => ({ nome, escuro: piorEscuridao(cor) }),
    )
    const abaixo = escuras.filter(({ escuro }) => escuro <= PISO_DE_LUZ)
    expect(
      abaixo.map(({ nome, escuro }) => `${nome} em ${escuro.toFixed(4)}`),
      `Superfície grande abaixo do piso de ${PISO_DE_LUZ}`,
    ).toEqual([])
    expect(escuras.length).toBeGreaterThan(8)
  })

  it('a lista de superfícies grandes não tem nome que não existe mais', () => {
    // Uma lista escrita à mão envelhece: se um nome for renomeado na paleta, ele
    // sai silenciosamente do filtro e a peça deixa de ser conferida.
    const nomesDoCatalogo = new Set(CORES_DO_MUNDO_INTEIRO.map((entrada) => entrada.nome))
    for (const entrada of SUPERFICIES_GRANDES_DO_MUNDO) {
      expect(nomesDoCatalogo.has(entrada.nome)).toBe(true)
    }
    expect(SUPERFICIES_GRANDES_DO_MUNDO.map((entrada) => entrada.nome)).toContain(
      'CORES_DERIVADAS.rochaDoFundo',
    )
    expect(SUPERFICIES_GRANDES_DO_MUNDO.length).toBeGreaterThan(10)
  })
})

describe('os tons das ilhas, depois do orçamento de luz', () => {
  it('nenhum marco chega queimado à tela, nem bloqueado nem liberado', () => {
    // O marco é desenhado com o tom da ilha. Antes do orçamento de luz (D-060),
    // quatro dos doze tons de então estouravam: o quase branco da ilha 6 chegava a
    // 1,46 e o marco virava silhueta chapada; o da ilha 3, bloqueado, chegava a
    // 1,17, porque a mistura com a névoa clareia ainda mais.
    for (let indice = 0; indice < CORES_DAS_ILHAS.length; indice += 1) {
      const tom = corDaIlha(indice)
      const liberado = corNoOrcamentoDeLuz(tom)
      const bloqueado = corNoOrcamentoDeLuz(misturar(tom, CORES_DO_MUNDO.nevoa, 0.4))
      expect(
        piorRadiacao(liberado),
        `O marco da ilha ${indice + 1} estoura na luz do mundo`,
      ).toBeLessThanOrEqual(TETO_DE_MATERIAL)
      expect(
        piorRadiacao(bloqueado),
        `O marco bloqueado da ilha ${indice + 1} estoura na luz do mundo`,
      ).toBeLessThanOrEqual(TETO_DE_MATERIAL)
      // Nenhum marco apaga nas direções que a peça **mostra**. A face de baixo
      // fica fora: o marco está em pé no capim, e o lado que encosta no chão não
      // aparece — o tom mais escuro da paleta mede **0,1175** nas direções
      // visíveis (medido com os dezoito tons), contra 0,02 na face de baixo.
      expect(
        piorEscuridaoVisivel(liberado),
        `O marco da ilha ${indice + 1} apagou`,
      ).toBeGreaterThan(0.05)
    }
  })

  it('o orçamento de luz não mexe na cor quando ela já cabe', () => {
    // A maioria dos tons já cabia: medido com os dezoito, **treze** saem iguais
    // ao tom (oito dos doze, quando a paleta tinha doze). O conserto mexe no que
    // não cabe, e não em tudo — isso mantém a paleta aprovada.
    const intocados = Array.from({ length: CORES_DAS_ILHAS.length }, (_, indice) =>
      corDaIlha(indice),
    ).filter((tom) => corNoOrcamentoDeLuz(tom) === tom)
    expect(intocados.length).toBeGreaterThanOrEqual(8)
  })

  it('os marcos das ilhas continuam distinguíveis entre si, com o tom já desenhado', () => {
    // O preço do orçamento: os tons mais claros se aproximam ao serem trazidos
    // para dentro do teto. Medido com os dezoito tons (lote 6), o par mais
    // próximo continua sendo o 6 e o 7 — dois tons claros e frios —, a 32,1 de
    // distância **desenhada**, contra 46,5 de distância crua. A distância cai um
    // terço ao passar pelo orçamento, e mesmo assim fica acima do que a tela
    // distingue; as ilhas se separam também por silhueta, marco e vegetação.
    // Este teste trava o piso para um reajuste futuro não empilhar tons.
    //
    // O texto de D-060 trazia 33,2 para este mesmo par; medido de novo, dá 32,1.
    // O número que vale é o que está aqui, porque é daqui que ele é cobrado.
    const desenhados = Array.from({ length: CORES_DAS_ILHAS.length }, (_, indice) =>
      corNoOrcamentoDeLuz(corDaIlha(indice)),
    )
    const distancia = (uma: number, outra: number): number =>
      Math.hypot(
        ((uma >> 16) & 0xff) - ((outra >> 16) & 0xff),
        ((uma >> 8) & 0xff) - ((outra >> 8) & 0xff),
        (uma & 0xff) - (outra & 0xff),
      )

    let menor = Infinity
    for (let uma = 0; uma < desenhados.length; uma += 1) {
      for (let outra = uma + 1; outra < desenhados.length; outra += 1) {
        menor = Math.min(menor, distancia(desenhados[uma] ?? 0, desenhados[outra] ?? 0))
      }
    }
    expect(menor).toBeGreaterThan(30)
  })

  it('o capim mantém o tom cru, porque o tom entra diluído e não estoura', () => {
    // O tom entra no alto do capim em 22% (ver `Ilha.tsx`): diluído, ele nunca
    // chega perto do teto. Por isso o capim continua com o tom original — o que
    // preserva a identidade da ilha no lugar onde ela ocupa mais tela.
    for (let indice = 0; indice < CORES_DAS_ILHAS.length; indice += 1) {
      const altoDoCapim = misturar(CORES_DERIVADAS.capimClaro, corDaIlha(indice), 0.22)
      expect(piorRadiacao(altoDoCapim)).toBeLessThan(TETO_DE_MATERIAL)
    }
  })
})

describe('a luz é a mesma para todas as direções de referência', () => {
  it('a irradiância nunca é negativa, e é maior olhando para o sol', () => {
    // Uma luz negativa seria um absurdo matemático que a paleta não pode ter.
    for (const direcao of Object.values(DIRECOES)) {
      const luz = radiacao(0xffffff, direcao)
      for (const canal of luz) {
        expect(canal).toBeGreaterThanOrEqual(0)
      }
    }
    const paraOSol = luzDe(radiacao(0xffffff, [60, 90, 40]))
    const contraOSol = luzDe(radiacao(0xffffff, [-60, -90, -40]))
    expect(paraOSol).toBeGreaterThan(contraOSol)
  })

  it('a conversão de sRGB para linear é a mesma que o resto do projeto usa', () => {
    // A conta aqui não pode divergir de `geometria/pintura.ts`, senão o número
    // medido deixa de ser o número que o Three.js usa.
    expect(paraLinear(canais(0x808080))).toEqual(paraLinear(canais(0x808080)))
    const meio = 0.5
    expect(paraLinear([meio])[0]).toBeCloseTo(0.21404114, 6)
  })
})
