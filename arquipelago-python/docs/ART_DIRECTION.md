# DIRECAO VISUAL

## Situacao das referencias

O usuario forneceu tres imagens de referencia: capturas de **uma aplicacao 3D real
e navegavel de outro projeto** ("PERCURSO - Long-to-shorts - Production
Collection"): ilhas flutuantes ligadas por pontes de madeira e cabos, sobre um mar
turquesa, com ilhas rotuladas, paineis de leitura e pilulas de controle.

Uma das tres imagens e, na verdade, **um video gravando a aplicacao** (tem player,
`16:22 / 18:02`, botao de tela cheia). Isso reforca o requisito: **o entregavel e a
aplicacao, nunca a gravacao.**

### Limitacao declarada

Os arquivos de imagem **nao chegaram ao disco** neste ambiente (o anexo nao se
materializou como arquivo; a busca em todos os pontos de montagem nao encontrou
nenhum `.png`). A analise foi feita **visualmente, na conversa**.

Consequencia: as cores abaixo sao **estimativa visual, nao medida por software**.
Nao houve extracao de paleta. Quando os arquivos existirem, a extracao real pode
confirmar ou corrigir estes valores. Nada aqui depende disso para funcionar - o
teste de contraste valida os valores que estao em uso.

## Paleta em uso

Estes valores estao em `src/ui/theme/tokens.ts`, que e a fonte unica. Os pares de
texto e fundo sao verificados por teste automatico (WCAG AA).

| Elemento | Valor | Observacao |
|---|---|---|
| Ceu, alto | `#C7D2E8` | lavanda-azulado palido |
| Ceu, meio | `#DDE5F0` | |
| Ceu, horizonte | `#EDF1F7` | quase branco |
| Nevoa | `#DCE4EC` | ilhas distantes desbotam |
| Mar, claro | `#7FC6C8` | |
| Mar, meio | `#5FB3B8` | |
| Mar, fundo | `#3E8E96` | |
| Painel | `#F6F3EB` | creme, painel de leitura |
| Painel elevado | `#FFFDF7` | |
| Borda de painel | `#D9D2C2` | |
| Texto principal | `#2A2A2A` | |
| Texto secundario | `#554F48` | |
| Texto sobre fundo escuro | `#F2F2F0` | |
| Acento verde | `#0F5A4A` | |
| Acento ambar | `#C9A063` | **exige texto escuro por cima** |
| Acento vermelho | `#B03A2E` | linhas de conexao, playhead |
| Capim | `#4E7A3A` | topo das ilhas |
| Rocha (topo) | `#3A3632` | base conica das ilhas |
| Rocha clara | `#8A8580` | faces iluminadas |
| Pale | `#EDEDE8` | manchas claras |
| Conifera | `#2F5D3A` | arvores simples |
| Madeira | `#6B4A2F` | tabuas das pontes |
| Madeira clara | `#7A5230` | |
| Chrome | `#121212` | faixas de letreiro no topo e na base |

### Licao aprendida no primeiro teste

A primeira escolha para o chip de unidade "planejada" foi o cinza claro da nevoa.
O teste de contraste **reprovou**: cinza claro com texto claro nao atinge 4.5:1.
A cor foi trocada por `#5C5852`, um cinza quente escuro. O mesmo vale para o ambar:
**texto branco sobre `#C9A063` da apenas 2.4:1** e nao passa nem em texto grande, por
isso o chip ambar usa texto escuro.

Isso esta registrado porque e o tipo de erro que volta a ser cometido: escolher cor
por aparencia e nao por contraste.

## Gramatica de interface observada

A copiar (a linguagem, nao o arquivo):

- Faixa escura de letreiro no topo e na base, enquadrando o conteudo.
- Cartao de contexto em maiusculas pequenas com espacamento largo.
- Rotulo ancorado no espaco 3D, em formato de pilula escura, texto claro.
- Sob o rotulo, um chip em maiusculas pequenas separando papel e nivel.
- Painel de leitura creme, borda fina, raio medio, sombra baixa, com botao de
  fechar flutuante.
- Cartao de diagrama com a etapa atual preenchida e as outras apenas contornadas.
- Pilula de navegacao central, com a aba ativa preenchida de escuro.
- Faixa de dica acima da pilula, em maiusculas pequenas com teclas espacadas.

## Interacao observada

`W A S D` mover - `Q E` subir e descer - arrastar para olhar - `Shift` acelerar -
`Esc` sair do modo apresentacao. Modos alternativos: tour guiado, vista de cima,
reiniciar. Clicar numa ilha abre o estudo, com imagem a esquerda e texto a direita.

### Consequencias tecnicas que decorrem disso

1. **Foco de teclado (D-012).** Com painel de leitura aberto, `W A S D` nao pode
   mover a camera. Sem isso o estudante digita e a camera dispara. `Esc` fecha e
   devolve o foco ao mundo.
2. **Toque e arrastar.** No celular, "arrastar para olhar" briga com a rolagem da
   pagina: `touch-action: none` apenas no canvas; rolagem preservada nos paineis.
3. **Seletor de unidades (D-013).** Na referencia e navegacao livre. Aqui so oferece
   destinos desbloqueados, consultando a mesma funcao pura que a ponte.
4. **Vista de cima** e bom recurso de orientacao e de acessibilidade - entra como
   modo de mapa desde o prototipo.

## O que NAO sera copiado

- O botao **"Prompt"**: e funcao de LLM, proibida pelas regras do projeto.
- Chrome de video, webcam em picture-in-picture e a trilha numerada no sentido de
  minutagem de video. (A trilha pode virar mapa de progresso das unidades.)
- O dominio "producao de long-to-shorts" e seu jargao.
- Nomes, marca, textos, diagramas e **qualquer asset**: modelos, texturas e imagens.
- A disposicao espacial concreta das ilhas, que na referencia segue um fluxo de
  edicao de video - e aqui deve seguir o curriculo.

## Direitos

Usamos as imagens como **direcao visual e de interacao**. Geometria e materiais
serao proprios (D-014), portanto **nao ha licenca de terceiro a rastrear**: nada de
terceiro e usado.

O repositorio e **publico**, entao as imagens de referencia **nao** sao versionadas.
Elas ficam em `referencias-locais/`, no `.gitignore` e fora de `public/`, para nunca
serem copiadas para `dist/` nem publicadas.

## Estilo 3D previsto

- Geometria propria e materiais simples no inicio. Sem asset externo.
- Ilhas: topo com capim, parede de rocha com faces irregulares, base conica.
- Vegetacao: coniferas e tufos simples, poucos por ilha.
- Estruturas legendiveis: biblioteca, mesa com monitor, placa de missao.
- Pontes: fileira de tabuas com corrimao, de uma ilha a proxima.
- Distancia tratada com nevoa, e nao com detalhe: e o que faz o mundo parecer maior
  do que o que foi modelado.
- Ilha ainda nao construida aparece **com nevoa e rotulo explicito** - nunca como
  ilha alcancavel e vazia.
