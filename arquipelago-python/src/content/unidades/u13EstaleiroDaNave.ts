import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 13 — O Estaleiro da Nave.
 * Capítulo 12 do livro: o começo do projeto de jogo (Invasão Alienígena).
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 *
 * Esta é a primeira unidade da **trilha dos projetos**, e a primeira em que o
 * console não roda o que o livro manda rodar: o Pygame não existe aqui (medido,
 * ver D-061). A unidade inteira é construída em cima disso — o que se escreve na
 * ilha é a **lógica** que o jogo roda por dentro, em Python puro, e o desenho é
 * apresentado como o que a biblioteca faria. Nenhum trecho de Pygame é mostrado
 * como se fosse rodar: todos trazem o motivo escrito na tela.
 */
export const u13EstaleiroDaNave: ConteudoDaUnidade = {
  id: 'u13-estaleiro-da-nave',

  missao:
    'Ao final desta unidade, você vai escrever a parte de um jogo que decide onde as coisas estão: as configurações em um lugar só, uma nave que se move pelo teclado sem sair da janela, e o laço de quadros que faz o jogo acontecer várias vezes por segundo.',

  leitura: {
    parte:
      'Capítulo 12 do livro — as partes sobre criar a janela do jogo, as configurações, a nave e o primeiro tiro. É o capítulo em que o projeto de jogo começa.',
    porque:
      'Nos onze capítulos anteriores, cada programa rodava uma vez, imprimia alguma coisa e acabava. Um jogo não acaba: ele fica em pé, olhando o teclado e redesenhando a tela umas sessenta vezes por segundo, até alguém fechar. Essa diferença — o programa que não termina sozinho — é o assunto deste capítulo, e é ela que faz um jogo ser um jogo, e não um cálculo.',
    oQueObservar: [
      'Onde o livro guarda as configurações do jogo. Repare que largura, altura, cor de fundo e velocidade não ficam espalhadas pelo código: ficam juntas, em um lugar que as outras partes consultam. É a diferença entre ajustar o jogo em um lugar e caçar números pelo programa inteiro.',
      'O laço: o programa entra em uma repetição e fica nela. Dentro dessa repetição acontecem sempre as mesmas três coisas — ver o que a pessoa fez (os eventos), atualizar o que mudou, desenhar de novo. Um quadro é uma volta dessa repetição.',
      'A nave como um objeto: ela tem posição, tem tamanho, e sabe se mover. O livro não guarda a posição da nave em variáveis soltas; guarda em um objeto, junto do que é dela.',
      'O que trava a nave na janela. A posição é um número, e número não sabe de borda: sem uma conferência antes de mover, a nave sai da tela e nunca mais volta. Repare onde o livro coloca essa conferência — antes de aplicar o movimento, não depois.',
    ],
    semOLivro:
      'Sem o livro em mãos, a unidade continua inteira: a explicação cobre o que é o laço de quadros, por que as configurações ficam juntas, como uma nave se move e por que ela precisa ser presa às bordas. O que o livro acrescenta é a montagem do jogo de verdade na sua máquina, com a biblioteca gráfica, a imagem da nave e o som — parte que, aqui, fica explicada e não executada (e a unidade diz por quê, em vez de fingir).',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Um jogo de nave tem três coisas ao mesmo tempo na tela: você aperta uma tecla, a nave anda, e o resto do mundo continua se mexendo. Nada disso é mágico — é uma repetição muito rápida. Sessenta vezes por segundo, o programa pergunta "o que aconteceu desde a última vez?", atualiza as posições e desenha tudo de novo. A cada uma dessas voltas se dá o nome de **quadro**, e o pedaço de código que as repete é o **laço principal** do jogo.',
    },
    {
      tipo: 'diagrama',
      titulo: 'Uma volta do laço principal',
      descricao:
        'O jogo inteiro é esta volta, repetida enquanto alguém estiver jogando. O que muda de um jogo para outro não é a forma do laço: é o que cada passo faz.',
      partes: [
        {
          rotulo: '1. Ver o que aconteceu',
          valor: 'os eventos',
          nota: 'uma tecla apertada, a janela fechada, o mouse clicado — lidos desde a volta anterior',
        },
        {
          rotulo: '2. Atualizar',
          valor: 'as posições',
          nota: 'a nave que anda, as balas que sobem, a frota que desce: cada quadro move tudo um pouco',
        },
        {
          rotulo: '3. Desenhar',
          valor: 'a tela de novo',
          nota: 'o quadro anterior é apagado e o novo é pintado por cima',
        },
        {
          rotulo: '4. Repetir',
          valor: 'enquanto o jogo estiver de pé',
          nota: 'de 30 a 60 vezes por segundo; quando a condição deixa de valer, o jogo acaba',
        },
      ],
    },
    {
      tipo: 'paragrafo',
      texto:
        'A primeira coisa a arrumar em qualquer jogo é onde ficam os números dele. Largura da janela, altura, velocidade da nave, quantas balas cabem no ar: se esses valores estiverem escritos no meio do código, cada ajuste vira uma caçada — e pior, vira um ajuste pela metade, porque o mesmo número aparece em três lugares e alguém esquece um. Aqui, como no livro, eles ficam juntos.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'As configurações do jogo em um lugar só',
      codigo:
        'class Configuracoes:\n    def __init__(self):\n        self.largura = 800\n        self.altura = 600\n        self.velocidade_da_nave = 2.0\n        self.fundo = (230, 240, 250)\n\nconf = Configuracoes()\nprint(conf.largura, conf.altura, conf.velocidade_da_nave)',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Com as configurações no lugar, falta o que o jogo move. A nave é um objeto — a mesma ideia da unidade 10 — e o que ela guarda é o que ela precisa saber de si mesma: onde está, e com que velocidade anda. O que ela **sabe fazer** é se mover.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A nave, e a conta que o movimento faz',
      codigo:
        'class Configuracoes:\n    def __init__(self):\n        self.largura = 800\n        self.velocidade_da_nave = 2.0\n\nclass Nave:\n    def __init__(self, conf):\n        self.conf = conf\n        self.x = conf.largura / 2\n\n    def mover(self, direcao):\n        self.x = self.x + direcao * self.conf.velocidade_da_nave\n\nnave = Nave(Configuracoes())\nfor passo in range(3):\n    nave.mover(-1)\nprint("A nave está em", nave.x)',
    },
    {
      tipo: 'destaque',
      titulo: 'Por que `mover(-1)` e `mover(1)`, e não `mover("esquerda")`',
      texto:
        'A direção entra como número porque é assim que o teclado será lido depois: a tecla da esquerda vira `-1`, a da direita vira `+1`, e a nave não precisa saber de teclas para se mover. Quem traduz tecla em número é a parte do jogo que lê o teclado. Isso é o mesmo princípio da unidade 10: cada objeto sabe o que é dele, e o que não é dele fica fora.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Repare no que aconteceria se o laço acima continuasse: com quatrocentas voltas para a esquerda, a nave sairia da janela pela lateral e continuaria andando no vazio. Na tela, ela desaparece — e quem está jogando acha que o jogo quebrou. A correção é uma conferência antes de aceitar a posição nova: se o resultado passou da borda, a posição fica na borda. Isso vale para os dois lados, e depende da largura da nave, porque o que não pode sair da tela é a nave inteira, não o ponto do meio dela.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A nave presa dentro da janela, por mais que se insista na tecla',
      codigo:
        'class Nave:\n    def __init__(self, x, velocidade, largura, meia_largura):\n        self.x = x\n        self.velocidade = velocidade\n        self.largura = largura\n        self.meia_largura = meia_largura\n\n    def mover(self, direcao):\n        destino = self.x + direcao * self.velocidade\n        minimo = self.meia_largura\n        maximo = self.largura - self.meia_largura\n        if destino < minimo:\n            self.x = minimo\n        elif destino > maximo:\n            self.x = maximo\n        else:\n            self.x = destino\n\nnave = Nave(400, 2.0, 800, 30)\nfor passo in range(250):\n    nave.mover(-1)\nprint("A nave parou em", nave.x)',
    },
    {
      tipo: 'destaque',
      titulo: 'O `if` antes de aplicar, e não depois de aplicar',
      texto:
        'O código acima calcula o destino, decide e **só então** guarda. A outra ordem — mover primeiro, corrigir depois — também funciona, mas dá um quadro de atraso em cada batida na borda, e é justamente ali que a nave treme. Guardar o destino em uma variável antes de decidir tem mais uma vantagem: a decisão fica em um lugar só, e a leitura fica na ordem em que você pensa (primeiro para onde ia, depois onde ficou).',
    },
    {
      tipo: 'destaque',
      titulo: 'Neste console, o Pygame é a parte que não roda',
      texto:
        'O capítulo do livro abre a janela do jogo com a biblioteca Pygame: `import pygame`, `pygame.display.set_mode(...)`, o laço lendo `pygame.event.get()`. **Nada disso roda neste console**, e não é culpa do seu código: o Pygame não faz parte da distribuição do Python que roda aqui, então `import pygame` termina em erro (medido nesta versão, ver D-061). Como o pacote não está na lista da distribuição, também não há o que instalar sem baixar da internet — e este projeto não baixa (D-040). O que fazemos, então, é escrever em Python puro a parte que decide as coisas, que é a parte em que se aprende a programar. Quando você instalar o Python e o Pygame no seu computador, a lógica desta unidade entra no jogo como está: o que muda é quem desenha.',
    },
    {
      tipo: 'avisoDeVersao',
      titulo: 'O livro é de 2015/2016, e o Pygame mudou de número',
      texto:
        'A edição que este projeto segue usa o Pygame 1.9. A versão atual tem número bem maior, e algumas coisas de então foram renomeadas ou simplificadas — por exemplo, o livro apaga o quadro antigo pintando o fundo de novo, e isso continua valendo, mas hoje existem outras formas de fazer o mesmo. A ideia por trás de cada passo é a mesma: abrir a janela, ler os eventos, atualizar as posições, redesenhar. É essa ideia que a unidade ensina, e ela não depende da versão da biblioteca.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'O laço de quadros, contado em Python puro',
      codigo:
        'QUADROS_POR_SEGUNDO = 60\n\nquadros = 0\nrodando = True\nwhile rodando:\n    quadros = quadros + 1\n    if quadros >= 120:\n        rodando = False\n\nsegundos = quadros / QUADROS_POR_SEGUNDO\nprint("passaram", quadros, "quadros,", segundos, "segundos de jogo")',
    },
    {
      tipo: 'paragrafo',
      texto:
        'O laço acima não desenha nada, e ainda assim é o coração do jogo: ele conta quadros até alguém mandar parar. É essa forma que se repete dentro de todo jogo de verdade — a diferença é que, a cada volta, o programa de verdade também lê o teclado e pinta a tela. Repare no detalhe que costuma escapar: a variável `rodando` é a condição do laço, e quem a desliga é o próprio laço, por dentro. Sem isso, o `while` nunca terminaria, e o programa ficaria preso para sempre — o mesmo laço infinito da unidade 8, agora dentro de um jogo.',
    },
  ],

  pratica: [
    {
      id: 'e13-1',
      enunciado:
        'Escreva a classe `Configuracoes`, com `largura` valendo 800 e `velocidade_da_nave` valendo 2.0, e a classe `Nave`, que recebe as configurações, começa no meio da janela e tem um método `mover(direcao)` que soma `direcao * velocidade_da_nave` à posição. Crie a nave, mova três vezes para a esquerda e mostre a posição.',
      dica: 'O meio da janela é `largura / 2`, e `largura / 2` com 800 dá `400.0` — divisão em Python sempre devolve número com casas decimais. A nave guarda as configurações em `self.conf` para não precisar receber a velocidade a cada movimento.',
      conferencia: 'Aparece `A nave está em 394.0`: 400 menos 3 passos de 2.0.',
      solucao:
        'class Configuracoes:\n    def __init__(self):\n        self.largura = 800\n        self.velocidade_da_nave = 2.0\n\nclass Nave:\n    def __init__(self, conf):\n        self.conf = conf\n        self.x = conf.largura / 2\n\n    def mover(self, direcao):\n        self.x = self.x + direcao * self.conf.velocidade_da_nave\n\nnave = Nave(Configuracoes())\nfor passo in range(3):\n    nave.mover(-1)\nprint("A nave está em", nave.x)',
      correcao: {
        saidaEsperada: ['A nave está em 394.0'],
        valoresEsperados: [
          {
            rotulo: 'Depois de três passos para a esquerda, a nave está em 394.0',
            expressao: 'nave.x',
            igualA: '394.0',
          },
          {
            // Medido: a sonda anterior procurava `nave.velocidade_da_nave` e reprovou
            // uma solução certa com `AttributeError` — a pessoa pode guardar a
            // velocidade com outro nome. Esta mede o **efeito**: um passo para a
            // direita anda exatamente a velocidade que veio das configurações.
            rotulo: 'Um passo para a direita anda a velocidade das configurações',
            expressao: '[nave.mover(1), nave.x][1]',
            igualA: '396.0',
          },
        ],
        limite:
          'A conferência olha onde a nave ficou depois dos três passos e de onde saiu a velocidade dela. Ela **não** julga a forma do seu código: a classe pode chamar-se `Configuracao`, os atributos podem ter outros nomes e o laço pode ser `for` ou três chamadas seguidas, desde que a posição final e a velocidade sejam as do enunciado.',
      },
    },
    {
      id: 'e13-2',
      enunciado:
        'A nave não pode sair da janela. Escreva `mover(self, direcao)` de modo que a posição fique presa entre `meia_largura` e `largura - meia_largura`. Depois crie uma nave em 400, com velocidade 2.0, largura 800 e meia largura 30, insista 250 vezes para a esquerda e mostre onde ela parou.',
      dica: 'Cuidado com a ordem: calcule o destino primeiro, decida depois. Se os limites forem 30 e 770, a nave para em 30 e nunca chega a 0.',
      conferencia: 'Aparece `A nave parou em 30`: por mais que se insista, a nave encosta na borda e fica.',
      solucao:
        'class Nave:\n    def __init__(self, x, velocidade, largura, meia_largura):\n        self.x = x\n        self.velocidade = velocidade\n        self.largura = largura\n        self.meia_largura = meia_largura\n\n    def mover(self, direcao):\n        destino = self.x + direcao * self.velocidade\n        minimo = self.meia_largura\n        maximo = self.largura - self.meia_largura\n        if destino < minimo:\n            self.x = minimo\n        elif destino > maximo:\n            self.x = maximo\n        else:\n            self.x = destino\n\nnave = Nave(400, 2.0, 800, 30)\nfor passo in range(250):\n    nave.mover(-1)\nprint("A nave parou em", nave.x)',
      correcao: {
        saidaEsperada: ['A nave parou em 30'],
        valoresEsperados: [
          {
            rotulo: 'Insistindo para a esquerda, a nave para na meia largura',
            expressao: 'nave.x',
            igualA: '30',
          },
          {
            rotulo: 'Um passo para a direita tira a nave da borda',
            expressao: '[nave.mover(1), nave.x][1]',
            igualA: '32.0',
          },
        ],
        limite:
          'A conferência confere onde a nave para depois de 250 passos para a esquerda e se ela ainda **consegue** andar para a direita depois disso. Ela não olha como a trava foi escrita — `if`, `elif`, `min` e `max`, ou uma função separada dão no mesmo — nem confere se a nave para na borda certa quando ela vem da direita.',
      },
    },
    {
      id: 'e13-3',
      enunciado:
        'Escreva o laço de quadros: uma repetição que conta os quadros até 120 e então para, usando uma variável de controle. No fim, mostre quantos quadros passaram e quantos segundos de jogo isso representa, a 60 quadros por segundo.',
      dica: 'A repetição é `while rodando:` e quem desliga o `rodando` é um `if` por dentro. Os segundos são `quadros / 60`.',
      conferencia: 'Aparece `passaram 120 quadros, 2.0 segundos de jogo`.',
      solucao:
        'QUADROS_POR_SEGUNDO = 60\n\nquadros = 0\nrodando = True\nwhile rodando:\n    quadros = quadros + 1\n    if quadros >= 120:\n        rodando = False\n\nsegundos = quadros / QUADROS_POR_SEGUNDO\nprint("passaram", quadros, "quadros,", segundos, "segundos de jogo")',
      correcao: {
        saidaEsperada: ['passaram 120 quadros, 2.0 segundos de jogo'],
        valoresEsperados: [
          { rotulo: 'O laço contou 120 quadros e parou', expressao: 'quadros', igualA: '120' },
          { rotulo: 'O laço terminou, e não ficou preso', expressao: 'rodando', igualA: 'False' },
          { rotulo: 'A conta dos segundos usa os quadros por segundo', expressao: 'segundos', igualA: '2.0' },
        ],
        estrutura: { linhasNaoVazias: 1 },
        limite:
          'A conferência olha a contagem final, a condição desligada e a conta dos segundos. Ela **não** julga a estrutura do laço: `while` com variável de controle, `while quadros < 120` ou um `break` no meio chegam ao mesmo resultado, e qualquer um deles vale. O que ela pega é o laço que não termina ou que conta um quadro a mais.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p13-1',
      enunciado: 'O que é um "quadro" no laço principal de um jogo?',
      alternativas: [
        'Uma imagem gravada em arquivo, que o jogo carrega antes de começar',
        'Uma volta da repetição: ver os eventos, atualizar as posições e desenhar',
        'O tempo que o jogo leva para abrir a janela na tela do computador',
        'A lista de teclas que a pessoa apertou desde que o jogo começou',
      ],
      correta: 1,
      explicacao:
        'Um quadro é uma volta do laço: o jogo pergunta o que aconteceu, aplica as mudanças e desenha tudo de novo. A 60 quadros por segundo, o olho humano vê movimento — mas por dentro são sessenta passos separados, um atrás do outro. É por isso que a velocidade de qualquer coisa no jogo é medida em unidades por quadro.',
    },
    {
      id: 'p13-2',
      enunciado: 'Por que as configurações do jogo ficam todas em uma classe separada?',
      alternativas: [
        'Porque um valor que aparece em três lugares é ajustado pela metade quando alguém esquece um deles',
        'Porque o Python não aceita números escritos dentro de funções',
        'Porque assim o jogo roda mais rápido do que com os valores espalhados',
        'Porque a classe é o único lugar onde o Pygame consegue ler os valores do jogo',
      ],
      correta: 0,
      explicacao:
        'A razão é de manutenção, não de velocidade. A largura da janela é usada para centralizar a nave, para prender a nave na borda e para desenhar o fundo: três usos, um número. Se ele estiver escrito três vezes e alguém mudar duas, o jogo passa a ter uma largura que não é a mesma em todo lugar — e o defeito aparece longe de onde foi causado.',
    },
    {
      id: 'p13-3',
      enunciado: 'A nave precisa parar na borda da janela. Onde entra a conferência do limite?',
      alternativas: [
        'Depois de desenhar, corrigindo a posição se ela ficou fora da tela',
        'Antes de desenhar, mas depois de aplicar o movimento e guardar a posição nova, corrigindo depois',
        'Antes de aplicar o movimento, comparando o destino com os limites e guardando o destino já corrigido',
        'Junto do desenho, deixando a biblioteca gráfica recusar a posição que estiver fora',
      ],
      correta: 2,
      explicacao:
        'Calcular o destino, comparar com os limites e só então guardar mantém a nave correta em todos os quadros — inclusive no exato quadro em que ela encosta na borda. Corrigir depois de aplicar funciona, mas por um quadro a nave já esteve fora, e é ali que ela treme. A biblioteca gráfica não recusa posição fora da tela: ela simplesmente desenha o que couber, e a nave desaparece sem aviso.',
    },
    {
      id: 'p13-4',
      enunciado:
        'Neste console, `import pygame` termina em erro. O que isso significa para as unidades da trilha do jogo?',
      alternativas: [
        'Que o jogo ensinado aqui é diferente do jogo do livro, e vale menos',
        'Que é preciso instalar o Pygame antes de fazer os exercícios desta trilha',
        'Que o Python do console está quebrado e a unidade deveria ser feita em outra linguagem',
        'Que a lógica do jogo continua em Python puro, e o desenho é a parte da biblioteca',
      ],
      correta: 3,
      explicacao:
        'O Pygame não faz parte do Python que roda nesta ilha, e buscar o pacote fora exigiria baixar da internet — coisa que este projeto não faz. O que sobra é a parte maior: a lógica. Onde a nave está, o que acontece quando ela encosta na borda, quantas balas cabem no ar — nada disso depende de estar desenhando na tela, e é isso que os exercícios medem. No seu computador, com o Pygame instalado, a mesma lógica entra no jogo de verdade.',
    },
    {
      id: 'p13-5',
      enunciado: 'O que acontece se nenhuma linha de dentro do laço principal desligar a variável de controle?',
      alternativas: [
        'O laço termina sozinho depois de mil voltas',
        'O programa termina com um erro de sintaxe na linha do `while`',
        'O laço nunca termina: o programa fica preso repetindo sem parar',
        'O laço roda uma vez e desiste, porque a condição não muda',
      ],
      correta: 2,
      explicacao:
        'A condição do laço é lida no começo de cada volta. Se nada dentro do laço a tornar falsa, ela continua verdadeira para sempre e o programa fica preso — é o laço infinito, agora com consequência visível: o jogo não fecha. Em um jogo de verdade, quem costuma desligar essa variável é o evento de fechar a janela, e é por isso que ler os eventos é o passo 1 do laço.',
    },
  ],
}
