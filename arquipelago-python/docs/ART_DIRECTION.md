# DIREÇÃO VISUAL

## Situação das referências

O usuário forneceu três imagens de referência: capturas de **uma aplicação 3D real e navegável
de outro projeto** ("PERCURSO — Long-to-shorts · Production Collection"): ilhas flutuantes
ligadas por pontes de madeira e cabos, sobre um mar turquesa, com ilhas rotuladas, painéis de
leitura e pílulas de controle.

Uma das três imagens é, na verdade, **um vídeo gravando a aplicação** (tem player,
`16:22 / 18:02`, botão de tela cheia). Isso reforça o requisito: **o entregável é a aplicação,
nunca a gravação.**

### Limitação declarada

Os arquivos de imagem **não chegaram ao disco** neste ambiente: o anexo não se materializou como
arquivo, e a busca em todos os pontos de montagem não encontrou nenhum `.png`. A análise foi feita
**visualmente, na conversa**.

Consequência: as cores abaixo são **estimativa visual, não medida por software**. Não houve
extração de paleta. Quando os arquivos existirem, a extração real pode confirmar ou corrigir
estes valores. Nada aqui depende disso para funcionar — o teste de contraste valida os valores
que estão em uso.

## Paleta em uso

Estes valores estão em `src/ui/theme/tokens.ts`, que é a fonte única. Os pares de texto e fundo
são verificados por teste automático (WCAG AA) e aparecem medidos na página `#/tema`.

| Elemento | Valor | Observação |
|---|---|---|
| Céu, alto | `#C7D2E8` | lavanda-azulado pálido |
| Céu, meio | `#DDE5F0` | |
| Céu, horizonte | `#EDF1F7` | quase branco |
| Névoa | `#DCE4EC` | ilhas distantes desbotam |
| Mar, claro | `#7FC6C8` | |
| Mar, meio | `#5FB3B8` | |
| Mar, fundo | `#3E8E96` | |
| Painel | `#F6F3EB` | creme, painel de leitura |
| Painel elevado | `#FFFDF7` | |
| Borda de painel | `#D9D2C2` | |
| Texto principal | `#2A2A2A` | |
| Texto secundário | `#554F48` | |
| Texto sobre fundo escuro | `#F2F2F0` | |
| Acento verde | `#0F5A4A` | |
| Acento âmbar | `#C9A063` | **exige texto escuro por cima** |
| Acento vermelho | `#B03A2E` | linhas de conexão, marcador |
| Capim | `#4E7A3A` | topo das ilhas |
| Rocha (topo) | `#3A3632` | base cônica das ilhas |
| Rocha clara | `#8A8580` | faces iluminadas |
| Pale | `#EDEDE8` | manchas claras |
| Conífera | `#2F5D3A` | árvores simples |
| Madeira | `#6B4A2F` | tábuas das pontes |
| Madeira clara | `#7A5230` | |
| Chrome | `#121212` | faixas de letreiro no topo e na base |
| Estado "planejada" | `#5C5852` | névoa ainda não construída |
| Estado "em construção" | `#C9A063` | âmbar |
| Estado "pronta" | `#0F5A4A` | verde |

### Lições aprendidas no primeiro teste

A primeira escolha para a etiqueta de unidade "planejada" foi o cinza claro da névoa. O teste de
contraste **reprovou**: cinza claro com texto claro não atinge 4,5:1. A cor foi trocada por
`#5C5852`, um cinza quente escuro.

O mesmo vale para o âmbar: **texto branco sobre `#C9A063` dá apenas 2,4:1** e não passa nem em
texto grande, por isso a etiqueta âmbar usa texto escuro.

Isso está registrado porque é o tipo de erro que volta a ser cometido: escolher cor por aparência
e não por contraste.

## Gramática de interface observada

A copiar (a linguagem, não o arquivo):

- Faixa escura de letreiro no topo e na base, enquadrando o conteúdo.
- Cartão de contexto em maiúsculas pequenas com espaçamento largo.
- Rótulo ancorado no espaço 3D, em formato de pílula escura, texto claro.
- Sob o rótulo, uma etiqueta em maiúsculas pequenas separando papel e nível.
- Painel de leitura creme, borda fina, raio médio, sombra baixa, com botão de fechar flutuante.
- Cartão de diagrama com a etapa atual preenchida e as outras apenas contornadas.
- Pílula de navegação central, com a aba ativa preenchida de escuro.
- Faixa de dica acima da pílula, em maiúsculas pequenas com teclas espaçadas.

## Interação observada

`W A S D` mover — `Q E` subir e descer — arrastar para olhar — `Shift` acelerar — `Esc` sair do
modo apresentação. Modos alternativos: tour guiado, vista de cima, reiniciar. Clicar numa ilha
abre o estudo, com imagem à esquerda e texto à direita.

### Consequências técnicas que decorrem disso

1. **Foco de teclado (D-012).** Com painel de leitura aberto, `W A S D` não pode mover a câmera.
   Sem isso o estudante digita e a câmera dispara. `Esc` fecha e devolve o foco ao mundo.
2. **Toque e arrastar.** No celular, "arrastar para olhar" briga com a rolagem da página:
   `touch-action: none` apenas no canvas; rolagem preservada nos painéis.
3. **Seletor de unidades (D-013).** Na referência é navegação livre. Aqui só oferece destinos
   desbloqueados, consultando a mesma função pura que a ponte.
4. **Vista de cima** é bom recurso de orientação e de acessibilidade — entra como modo de mapa
   desde o protótipo.

## O que NÃO será copiado

- O botão **"Prompt"**: é função de LLM, proibida pelas regras do projeto.
- Chrome de vídeo, webcam em picture-in-picture e a trilha numerada no sentido de minutagem de
  vídeo. (A trilha pode virar mapa de progresso das unidades.)
- O domínio "produção de long-to-shorts" e seu jargão.
- Nomes, marca, textos, diagramas e **qualquer asset**: modelos, texturas e imagens.
- A disposição espacial concreta das ilhas, que na referência segue um fluxo de edição de vídeo —
  e aqui deve seguir o currículo.

## Direitos

Usamos as imagens como **direção visual e de interação**. Geometria e materiais são próprios
(D-014), portanto **não há licença de terceiro a rastrear**: nada de terceiro é usado.

O repositório é **público**, então as imagens de referência **não** são versionadas. Elas ficam em
`referencias-locais/`, no `.gitignore` e fora de `public/`, para nunca serem copiadas para `dist/`
nem publicadas.

## O marco e o tom de cada ilha (D-053)

Cada ilha tem uma construção que só ela tem, e um tom próprio. Os dois saem da posição no percurso;
a forma da pedra e a vegetação saem da semente da unidade. Os números abaixo foram **medidos** a
partir do conteúdo real, e não escritos à mão.

| # | Ilha | Marco | Raio do capim | Altura da pedra | Lados | Tom |
|---|---|---|---|---|---|---|
| 1 | A Praia do Primeiro Programa | Portal de pedra | 6,67 | 8,01 | 14 | `#106553` |
| 2 | A Oficina das Variáveis | Bancada de oficina | 6,83 | 8,43 | 16 | `#ad8551` |
| 3 | A Ilha das Palavras | Estante alta | 5,23 | 9,72 | 10 | `#6fbdc0` |
| 4 | As Listas do Mercado | Barracas do mercado | 5,33 | 8,96 | 18 | `#91412e` |
| 5 | O Moinho das Repetições | Moinho de pás | 5,77 | 9,29 | 12 | `#3a673a` |
| 6 | A Encruzilhada das Decisões | Placas da encruzilhada | 5,28 | 7,73 | 10 | `#e2e5e8` |
| 7 | O Farol dos Registros | Farol alto | 5,24 | 8,53 | 10 | `#a7c9d0` |
| 8 | A Estação das Perguntas | Estação de perguntas | 6,88 | 8,88 | 12 | `#799796` |
| 9 | A Oficina das Funções | Par de engrenagens | 6,02 | 9,98 | 12 | `#5c4430` |
| 10 | A Torre das Classes | Torre de anéis | 5,62 | 10,93 | 12 | `#cf9693` |

### A cadeia de cor do mundo (D-054)

Do token até o pixel, a cor percorre três passos, e cada um tem um lugar:

1. **A paleta** (`tokens.ts`) define a cor em sRGB, em texto `#RRGGBB`. Nenhum valor de cor nasce
   fora dela.
2. **A mistura** acontece em sRGB (`geometria/pintura.ts`), que é onde a paleta foi pensada.
3. **O que chega ao vértice** é **convertido para a escala linear** (`canalLinear`), porque o Three.js
   lê a cor do vértice sem converter. E uma malha que traz cores por vértice é desenhada **sem tinta
   no material** — o branco é o elemento neutro da multiplicação, e é o que faz a cor da paleta ser a
   cor que chega à tela, passada apenas pela luz.

O que o desenho **não** faz: multiplicar cor por cor. Era o que deixava as paredes das ilhas em
`#1a1714`, praticamente pretas, e o defeito só apareceu quando alguém viu o mundo na tela.

Regras que valem para as dez:

- **nenhum tom é valor novo**: todos são misturas de tokens de `tokens.ts`, e o teste
  `paleta3d.test.ts` refaz três delas a partir dos tokens (D-005);
- **a cor de estado manda no que é do estado**: capim, rocha, placa de missão e farol de estado
  continuam contando se a unidade está bloqueada, disponível ou aprovada. O tom da ilha aparece no
  marco e no alto do capim — onde não compete com a leitura do estado;
- **o marco nunca passa da borda**: ele fica a 40% do raio, e o teste cobra que caiba com 2% de folga
  em todas as ilhas;
- **o tom fica inteiro no marco e entra a 22% no alto do capim**: o tom é assinatura, não tinta. A 45%
  (o primeiro valor usado), uma ilha de tom rosado ficava com capim rosado — e capim deixava de ser
  capim. Hoje o teste mede o capim das dez ilhas e cobra que o verde seja o canal dominante;
- **o marco fica do lado oposto às estruturas do estudo**, para não tapar a biblioteca, a mesa e a
  placa de missão.

## Estilo 3D previsto

- Geometria própria e materiais simples no início. Sem asset externo.
- Ilhas: topo com capim, parede de rocha com faces irregulares, base cônica.
- Vegetação: coníferas e tufos simples, poucos por ilha.
- Estruturas legíveis: biblioteca, mesa com monitor, placa de missão.
- Pontes: fileira de tábuas com corrimão, de uma ilha à próxima.
- Distância tratada com névoa, e não com detalhe: é o que faz o mundo parecer maior do que o que
  foi modelado.
- Ilha ainda não construída aparece **com névoa e rótulo explícito** — nunca como ilha alcançável
  e vazia.

---

## O avatar (Etapa 5)

A figura que anda pelo mundo é a coisa mais simples que ainda é gente: corpo cilíndrico, cabeça
esférica, dois braços, duas pernas e uma mochila. Sem modelo externo — licença, peso e auditoria de
arquivo a mais —, e com as cores vindo dos tokens (`CORES_DO_AVATAR` em `ui/theme/paleta3d.ts`):

| Parte | Cor | Por quê |
|---|---|---|
| Corpo | Verde da marca | É a cor da tela do monitor e do estado "aprovada": a pessoa pertence ao mundo |
| Braços e pernas | O mesmo verde, escurecido | Dá partes ao corpo sem virar duas figuras diferentes |
| Cabeça | Pedra clara (o mesmo tom das paredes) | O rosto é o ponto mais claro, e é o que se enxerga de longe |
| Mochila | Âmbar da marca | O mesmo âmbar das unidades disponíveis, nas costas de quem estuda |

Três decisões visuais que ficam registradas porque o ambiente não permite conferi-las:

- **a figura é pequena em relação às estruturas** (1,3 unidades de altura, contra 1,7 da biblioteca e
  2,2 da placa). A intenção é parecer gente do lado das coisas, não um monumento;
- **as pernas não se movem.** Não há animação de caminhada nesta etapa. Quem for olhar o mundo no
  navegador deve saber disso antes de achar que quebrou;
- **a câmera fica a 10,5 unidades atrás e um pouco acima**, olhando o peito da pessoa. Perto o
  bastante para ver o caminho à frente, longe o bastante para não cortar a ilha.

Nada disso foi visto em tela: sem navegador com WebGL neste ambiente, proporção, cor e enquadramento
seguem **não verificados**, com itens próprios no roteiro manual de `docs/TEST_REPORT.md`.
