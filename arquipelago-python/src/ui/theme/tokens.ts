/**
 * Tokens visuais do Arquipelago Python - FONTE UNICA DE VERDADE das cores,
 * raios e espacamentos.
 *
 * De onde vem: das tres imagens de referencia fornecidas pelo usuario
 * (capturas de uma aplicacao 3D navegavel de outro projeto). A leitura esta
 * documentada em `docs/ART_DIRECTION.md`.
 *
 * Limite honesto: as cores foram lidas VISUALMENTE nas imagens. Os arquivos
 * nao chegaram ao disco, entao nao houve extracao por software. Os valores
 * sao proximos, nao medidos.
 *
 * Regra: nenhuma cor e escrita duas vezes. O CSS consome estas cores atraves
 * das variaveis geradas por `tokensComoVariaveisCss()`.
 */
import type { CSSProperties } from 'react'
import type { Cor } from './contraste'

export const cores = {
  ceu: {
    alto: '#C7D2E8',
    medio: '#DDE5F0',
    horizonte: '#EDF1F7',
  },
  mar: {
    claro: '#7FC6C8',
    medio: '#5FB3B8',
    fundo: '#3E8E96',
  },
  nevoa: '#DCE4EC',

  painel: {
    fundo: '#F6F3EB',
    fundoElevado: '#FFFDF7',
    borda: '#D9D2C2',
    sombra: 'rgba(28, 39, 48, 0.18)',
  },

  texto: {
    principal: '#2A2A2A',
    secundario: '#5A554E',
    sobreEscuro: '#F2F2F0',
  },

  acento: {
    verde: '#0F5A4A',
    verdeClaro: '#12705C',
    ambar: '#C9A063',
    vermelho: '#B03A2E',
  },

  terreno: {
    capim: '#4E7A3A',
    rocha: '#3A3632',
    rochaClara: '#8A8580',
    pale: '#EDEDE8',
    conifera: '#2F5D3A',
    madeira: '#6B4A2F',
    madeiraClara: '#7A5230',
  },

  chrome: {
    fundo: '#121212',
    fundoElevado: '#1E1E1E',
    borda: '#333333',
  },
} as const satisfies Record<string, unknown>

/**
 * Vocabulario visual derivado das referencias. As cores dos chips de estado
 * sao escuras com texto claro - exceto o ambar, que exige texto escuro.
 * O teste `tokens.test.ts` verifica cada par declarado abaixo.
 */
export const coresDeEstado = {
  /**
   * Ainda com nevoa: nao ha conteudo construido.
   * Cinza quente escuro (#5C5852) e nao o cinza claro da nevoa: o cinza claro
   * nao atinge 4.5:1 com texto claro por cima. Foi o teste de contraste que
   * reprovou a primeira escolha.
   */
  planejada: '#5C5852',
  /** Em construcao nesta etapa do desenvolvimento. */
  emConstrucao: cores.acento.ambar,
  /** Construida e revisada. */
  pronta: cores.acento.verde,
} as const

/** Cor de texto obrigatoria para cada chip de estado (o ambar exige texto escuro). */
export const textoDeEstado = {
  planejada: cores.texto.sobreEscuro,
  emConstrucao: cores.texto.principal,
  pronta: cores.texto.sobreEscuro,
} as const satisfies Record<keyof typeof coresDeEstado, Cor>

export const geometria = {
  raioPainel: '14px',
  raioChip: '999px',
  raioLinha: '10px',
  espaco: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '40px',
  },
  larguraMaximaConteudo: '1100px',
} as const

export const tipografia = {
  familia:
    "'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif",
  familiaMono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  tamanho: {
    titulo: '2rem',
    subtitulo: '1.25rem',
    corpo: '1rem',
    legenda: '0.8125rem',
    chip: '0.75rem',
  },
} as const

/** Um par texto-sobre-fundo declarado pela interface e verificado por teste. */
export type ParDeContraste = {
  /** Onde este par aparece, em portugues, para a mensagem de falha do teste. */
  readonly onde: string
  readonly primeiroPlano: Cor
  readonly fundo: Cor
  /** Texto grande (>= 24px ou >= 18.66px em negrito) tem limiar menor na WCAG AA. */
  readonly textoGrande?: boolean
}

/**
 * Todos os pares texto/fundo que a interface usa hoje. O teste percorre esta
 * lista e falha se algum par nao atingir o minimo da WCAG AA. Ao adicionar um
 * par novo na interface, adicione aqui tambem.
 */
export const PARES_DE_CONTRASTE: readonly ParDeContraste[] = [
  {
    onde: 'corpo do texto no painel creme',
    primeiroPlano: cores.texto.principal,
    fundo: cores.painel.fundo,
  },
  {
    onde: 'texto secundario no painel creme',
    primeiroPlano: cores.texto.secundario,
    fundo: cores.painel.fundo,
  },
  {
    onde: 'texto principal no painel creme elevado',
    primeiroPlano: cores.texto.principal,
    fundo: cores.painel.fundoElevado,
  },
  {
    onde: 'texto secundario no painel creme elevado',
    primeiroPlano: cores.texto.secundario,
    fundo: cores.painel.fundoElevado,
  },
  {
    onde: 'letreiro do chrome escuro',
    primeiroPlano: cores.texto.sobreEscuro,
    fundo: cores.chrome.fundo,
  },
  {
    onde: 'texto sobre chip verde (unidade pronta)',
    primeiroPlano: cores.texto.sobreEscuro,
    fundo: cores.acento.verde,
  },
  {
    onde: 'texto sobre chip verde claro',
    primeiroPlano: cores.texto.sobreEscuro,
    fundo: cores.acento.verdeClaro,
  },
  {
    onde: 'texto sobre chip ambar (texto escuro por exigencia de contraste: branco sobre este ambar da apenas 2.4:1)',
    primeiroPlano: textoDeEstado.emConstrucao,
    fundo: coresDeEstado.emConstrucao,
  },
  {
    onde: 'texto sobre chip de unidade planejada (ainda com nevoa)',
    primeiroPlano: textoDeEstado.planejada,
    fundo: coresDeEstado.planejada,
  },
  {
    onde: 'texto sobre chip de unidade pronta',
    primeiroPlano: textoDeEstado.pronta,
    fundo: coresDeEstado.pronta,
  },
  {
    onde: 'texto principal sobre o ceu (faixa clara)',
    primeiroPlano: cores.texto.principal,
    fundo: cores.ceu.horizonte,
  },
  {
    onde: 'titulo do cartao de contexto sobre o ceu',
    primeiroPlano: cores.texto.principal,
    fundo: cores.ceu.alto,
    textoGrande: true,
  },
  {
    onde: 'texto do rodape no letreiro escuro',
    primeiroPlano: cores.texto.sobreEscuro,
    fundo: cores.chrome.fundo,
  },
]

/** Converte os tokens em variaveis CSS. O CSS nunca repete um valor literal. */
export function tokensComoVariaveisCss(): CSSProperties {
  return {
    '--ceu-alto': cores.ceu.alto,
    '--ceu-medio': cores.ceu.medio,
    '--ceu-horizonte': cores.ceu.horizonte,

    '--mar-claro': cores.mar.claro,
    '--mar-medio': cores.mar.medio,
    '--mar-fundo': cores.mar.fundo,

    '--nevoa': cores.nevoa,

    '--painel-fundo': cores.painel.fundo,
    '--painel-fundo-elevado': cores.painel.fundoElevado,
    '--painel-borda': cores.painel.borda,
    '--painel-sombra': cores.painel.sombra,

    '--texto-principal': cores.texto.principal,
    '--texto-secundario': cores.texto.secundario,
    '--texto-sobre-escuro': cores.texto.sobreEscuro,

    '--acento-verde': cores.acento.verde,
    '--acento-verde-claro': cores.acento.verdeClaro,
    '--acento-ambar': cores.acento.ambar,
    '--acento-vermelho': cores.acento.vermelho,

    '--estado-planejada': coresDeEstado.planejada,
    '--estado-em-construcao': coresDeEstado.emConstrucao,
    '--estado-pronta': coresDeEstado.pronta,
    '--texto-estado-planejada': textoDeEstado.planejada,
    '--texto-estado-em-construcao': textoDeEstado.emConstrucao,
    '--texto-estado-pronta': textoDeEstado.pronta,

    '--terreno-capim': cores.terreno.capim,
    '--terreno-rocha': cores.terreno.rocha,
    '--terreno-rocha-clara': cores.terreno.rochaClara,
    '--terreno-pale': cores.terreno.pale,
    '--terreno-conifera': cores.terreno.conifera,
    '--terreno-madeira': cores.terreno.madeira,
    '--terreno-madeira-clara': cores.terreno.madeiraClara,

    '--chrome-fundo': cores.chrome.fundo,
    '--chrome-fundo-elevado': cores.chrome.fundoElevado,
    '--chrome-borda': cores.chrome.borda,

    '--raio-painel': geometria.raioPainel,
    '--raio-chip': geometria.raioChip,
    '--raio-linha': geometria.raioLinha,
    '--espaco-xs': geometria.espaco.xs,
    '--espaco-sm': geometria.espaco.sm,
    '--espaco-md': geometria.espaco.md,
    '--espaco-lg': geometria.espaco.lg,
    '--espaco-xl': geometria.espaco.xl,
    '--largura-conteudo': geometria.larguraMaximaConteudo,

    '--fonte': tipografia.familia,
    '--fonte-mono': tipografia.familiaMono,
    '--fonte-titulo': tipografia.tamanho.titulo,
    '--fonte-subtitulo': tipografia.tamanho.subtitulo,
    '--fonte-corpo': tipografia.tamanho.corpo,
    '--fonte-legenda': tipografia.tamanho.legenda,
    '--fonte-chip': tipografia.tamanho.chip,
  } as CSSProperties
}
