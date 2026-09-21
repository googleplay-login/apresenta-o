import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 14 — O Enxame dos Discos.
 * Capítulo 13 do livro: as balas e a frota de alienígenas.
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 *
 * Como na unidade 13, o desenho não roda aqui (o Pygame não está na distribuição
 * do Pyodide — medido, D-061) e o que a unidade escreve é o que o jogo faz com os
 * **dados**: a lista de balas que cresce e encolhe, a frota montada por laços
 * aninhados, e a regra que faz a frota virar e descer. Toda afirmação sobre o que
 * roda foi medida antes de ser escrita.
 */
export const u14EnxameDosDiscos: ConteudoDaUnidade = {
  id: 'u14-enxame-dos-discos',

  missao:
    'Ao final desta unidade, você vai encher a tela: as balas que saem da nave e somem no alto da tela, e uma frota de discos montada por laços aninhados, que anda para os lados e desce um degrau a cada vez que encosta na borda.',

  leitura: {
    parte:
      'Capítulo 13 do livro — as partes sobre acrescentar as balas, remover as balas que saem da tela e criar a frota de alienígenas que se move.',
    porque:
      'A unidade anterior tinha um objeto na tela. Esta tem muitos — e muitos de um jeito que muda o tempo todo: cada bala disparada é uma a mais, cada bala que sai pelo alto é uma a menos. Esse vai e vem é o que separa um programa de um objeto de um programa de centenas deles, e é onde moram dois defeitos clássicos: a lista que só cresce, e o laço que esquece de percorrer a cópia.',
    oQueObservar: [
      'Onde as balas ficam guardadas. Repare que não existe uma variável para cada tiro: existe uma **lista**, e disparar é acrescentar nela. É a mesma ideia da unidade 4 (as listas), agora em movimento.',
      'A limpeza das balas. Repare que as balas que saem pelo alto são **removidas** da lista, e não apenas deixadas de desenhar. Sem isso, o jogo fica mais lento a cada tiro, e a lentidão aparece justamente quando o jogo fica divertido.',
      'A montagem da frota: os dois laços, um dentro do outro. Um percorre as fileiras, o outro percorre as colunas, e a posição de cada alienígena sai da multiplicação do índice pela medida do espaço que ele ocupa.',
      'A regra da borda, que não é sobre a bala e sim sobre a frota: quando **qualquer** alienígena encosta na lateral, a frota inteira muda de direção e desce. Repare que a decisão é da frota, não do alienígena que encostou.',
    ],
    semOLivro:
      'Sem o livro em mãos, a unidade continua inteira: a explicação cobre a lista de balas, a remoção das que saem da tela, o limite de tiros no ar, a montagem da frota com laços aninhados e o movimento que vira e desce. O que o livro acrescenta é a montagem na sua máquina, com a imagem do alienígena, o som do tiro e o desenho no lugar — parte que aqui fica explicada e não executada, pelo motivo que a unidade declara.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Um tiro é um objeto pequeno que sobe reto e some. Se o jogo tivesse um só, bastaria uma variável. Mas quem joga aperta a tecla várias vezes, e os tiros se acumulam no ar ao mesmo tempo — então o que existe é uma **lista de balas**. Disparar é acrescentar um item nela; e o trabalho de cada quadro é mover todas, uma por uma.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A lista de balas: disparar é acrescentar, e cada quadro move todas',
      codigo:
        'balas = []\n\ndef atirar():\n    balas.append({"x": 400, "y": 100})\n\nfor tiro in range(3):\n    atirar()\n\nfor bala in balas:\n    bala["y"] = bala["y"] + 4\n\nprint("no ar:", len(balas), "balas")',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Aqui aparece o defeito que o capítulo do livro trata com cuidado: a lista que só cresce. Uma bala que saiu pelo alto da tela nunca mais volta e nunca mais é vista — mas continua na lista, e o programa continua movendo ela a cada quadro, para sempre. Em um minuto de jogo são centenas de balas invisíveis ocupando o programa. A correção é remover da lista quem já saiu, e a forma de fazer isso sem errar é montar uma **lista nova** com quem ficou.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A limpeza, e por que ela constrói uma lista nova',
      codigo:
        'balas = [{"x": 400, "y": 790}, {"x": 400, "y": 600}, {"x": 400, "y": -6}]\naltura = 600\n\nbalas = [bala for bala in balas if bala["y"] < altura]\nprint("no ar:", len(balas), "balas")',
    },
    {
      tipo: 'destaque',
      titulo: 'Não remova da lista enquanto a percorre',
      texto:
        'O caminho que parece mais curto — percorrer a lista com `for` e remover o item quando ele sai da tela — erra em silêncio: ao remover um item, todos os seguintes andam uma posição para trás, e o `for` pula o próximo sem avisar. Com uma bala de cada vez o problema não aparece; com duas saídas seguidas, uma fica esquecida na lista. Montar a lista nova (`balas = [bala for bala in balas if ...]`) não tem esse problema, porque a lista que se percorre é diferente da que se escreve.',
    },
    {
      tipo: 'diagrama',
      titulo: 'Por que remover durante o `for` pula um item',
      descricao:
        'O `for` anda por **posição**, e não por item: ao remover a bala do meio, as outras escorregam para trás e a posição seguinte passa a apontar para quem ainda não foi olhado.',
      partes: [
        {
          rotulo: 'Antes',
          valor: 'A, B, C',
          nota: 'o laço está olhando a posição 0',
        },
        {
          rotulo: 'Remove o A',
          valor: 'B, C',
          nota: 'o A saiu, e o B tomou o lugar dele na posição 0',
        },
        {
          rotulo: 'O laço vai para a posição 1',
          valor: 'C',
          nota: 'o B ficou para trás, sem ser olhado — é o pulo silencioso',
        },
        {
          rotulo: 'Com a lista nova',
          valor: 'a lista percorrida não muda',
          nota: 'quem manda na limpeza é a condição, e não a posição',
        },
      ],
    },
    {
      tipo: 'paragrafo',
      texto:
        'A segunda coisa desta unidade é a frota. Uma fileira de alienígenas iguais não se escreve alienígena por alienígena: ela se escreve com **dois laços aninhados** — um para as fileiras, outro para as colunas — e a posição de cada um sai da conta do índice dele na fileira. É a unidade 4 (o `for`) encontrando a unidade 5 (a lista dentro de outra estrutura), e é o mesmo caminho do livro.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A frota em fileiras, montada por dois laços',
      codigo:
        'linhas = 3\ncolunas = 8\nespaco = 60\nfrota = []\n\nfor fileira in range(linhas):\n    for coluna in range(colunas):\n        frota.append({"x": coluna * espaco, "y": fileira * 50})\n\nprint("a frota tem", len(frota), "discos")\nprint("o primeiro está em", frota[0]["x"], "e o último em", frota[-1]["x"])',
    },
    {
      tipo: 'destaque',
      titulo: 'A frota anda junta, e a decisão é da frota',
      texto:
        'Na tela, a frota inteira parece um bicho só: ela desliza para a direita, e ao encostar na lateral desce um degrau e passa a deslizar para a esquerda. Isso não é um movimento de cada alienígena — é um movimento do conjunto, com a direção guardada em um lugar só. Se cada alienígena tivesse a sua direção, eles se separariam na primeira batida de borda. E a conferência da borda é "algum deles encostou?", que é a mesma pergunta das unidades 5 e 6 com uma lista no meio.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A frota que anda, vira e desce',
      codigo:
        'largura = 600\nmargem = 30\ndirecao = 1\nfrota = [{"x": 100, "y": 0}, {"x": 400, "y": 0}]\n\nfor passo in range(8):\n    for disco in frota:\n        disco["x"] = disco["x"] + direcao * 30\n    na_borda = any(disco["x"] > largura - margem or disco["x"] < margem for disco in frota)\n    if na_borda:\n        direcao = -direcao\n        for disco in frota:\n            disco["y"] = disco["y"] + 40\n\nprint("direção agora:", direcao)\nprint("os discos desceram para", frota[0]["y"])',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Repare no `any(...)`: ele responde "algum item desta lista atende a esta condição?". Sem ele, a mesma pergunta se escreve com um `for` e uma variável de controle, como na unidade 4 — e as duas formas são certas. O que não pode acontecer é a conferência olhar só o primeiro alienígena: a frota encosta na borda pela ponta, e a ponta muda de lado depois de cada virada.',
    },
    {
      tipo: 'destaque',
      titulo: 'Limitar os tiros no ar é uma decisão de jogo, e também de programa',
      texto:
        'Se a tecla for segurada, o jogo dispara um tiro a cada quadro: sessenta balas por segundo. Além de deixar a tela ilegível, a lista cresce rápido e o jogo começa a ficar pesado. A saída do livro é limitar quantas balas podem existir no ar ao mesmo tempo — disparar passa a ser condicional: `if len(balas) < limite`. É o mesmo raciocínio da trava da nave na unidade anterior: antes de fazer, conferir se pode.',
    },
    {
      tipo: 'avisoDeVersao',
      titulo: 'O livro é de 2015/2016, e a ideia de limpar a lista mudou de roupa',
      texto:
        'Na edição do projeto, a limpeza das balas aparece escrita como um laço que percorre uma **cópia** da lista (`for bala in balas[:]`) e remove da lista de verdade — o jeito da época. Hoje a mesma limpeza costuma ser escrita montando a lista nova, como a unidade mostra, e as duas chegam ao mesmo resultado. A regra por trás é a que continua valendo: **nunca** modificar pelo lado de dentro a lista que se está percorrendo; quem manda na limpeza é a condição, e não a posição na lista.',
    },
  ],

  pratica: [
    {
      id: 'e14-1',
      enunciado:
        'Monte uma frota de 3 fileiras por 8 colunas, com 60 de espaço na horizontal e 50 na vertical, sendo o primeiro disco na origem. Mostre quantos discos a frota tem e onde estão o primeiro e o último.',
      dica: 'São dois `for` aninhados, e o `x` sai da coluna vezes o espaço: `coluna * 60`. O último disco é o da última coluna da última fileira, e em Python a última posição de uma lista é `frota[-1]`.',
      conferencia: 'Aparece `a frota tem 24 discos` e `o último está em 420 e 100`.',
      solucao:
        'linhas = 3\ncolunas = 8\nespaco = 60\nfrota = []\n\nfor fileira in range(linhas):\n    for coluna in range(colunas):\n        frota.append({"x": coluna * espaco, "y": fileira * 50})\n\nprint("a frota tem", len(frota), "discos")\nprint("o último está em", frota[-1]["x"], "e", frota[-1]["y"])',
      correcao: {
        saidaEsperada: ['a frota tem 24 discos', 'o último está em 420 e 100'],
        valoresEsperados: [
          { rotulo: 'A frota tem uma fileira para cada coluna que o enunciado pede', expressao: 'len(frota)', igualA: '24' },
          { rotulo: 'O primeiro disco começa na origem', expressao: 'frota[0]["x"]', igualA: '0' },
          { rotulo: 'O último disco está no fim da última fileira', expressao: 'frota[-1]["x"]', igualA: '420' },
          { rotulo: 'A última fileira é a terceira, a 100 de altura', expressao: 'frota[-1]["y"]', igualA: '100' },
        ],
        limite:
          'A conferência olha os dois extremos da frota e quantos discos existem. Ela **não** julga se os discos são dicionários, tuplas ou objetos — o que ela cobra, pelos nomes que o enunciado deu, é `x` e `y` em cada um — nem em que ordem os laços estão escritos.',
      },
    },
    {
      id: 'e14-2',
      enunciado:
        'Escreva o ciclo de um quadro para as balas: as três balas existentes sobem 4, e as que passaram do alto da tela (600) são removidas da lista. Mostre quantas sobraram e a altura da primeira que sobrou.',
      dica: 'Primeiro mova todas, depois limpe com uma lista nova: `balas = [bala for bala in balas if bala["y"] < 600]`. A bala que está em 604 é a que sai.',
      conferencia: 'Aparece `sobraram 1 balas` e `a primeira está em 4`.',
      solucao:
        'balas = [{"x": 400, "y": 600}, {"x": 400, "y": 0}, {"x": 400, "y": 596}]\naltura = 600\n\nfor bala in balas:\n    bala["y"] = bala["y"] + 4\n\nbalas = [bala for bala in balas if bala["y"] < altura]\n\nprint("sobraram", len(balas), "balas")\nprint("a primeira está em", balas[0]["y"])',
      correcao: {
        saidaEsperada: ['sobraram 1 balas'],
        valoresEsperados: [
          { rotulo: 'Só a bala que não passou do alto continua na lista', expressao: 'len(balas)', igualA: '1' },
          { rotulo: 'A bala que sobrou subiu os quatro do quadro', expressao: 'balas[0]["y"]', igualA: '4' },
        ],
        limite:
          'A conferência olha a lista depois do quadro: quem sobrou e em que altura. Ela não confere **como** a limpeza foi feita — lista nova, laço com `del`, ou `while` — e não julga se a bala que sai é removida por comparação com 600 ou com a altura da janela, desde que o que saiu e o que ficou sejam os do enunciado.',
      },
    },
    {
      id: 'e14-3',
      enunciado:
        'Faça a frota andar 8 passos para a direita, com 30 por passo, em uma janela de 600 de largura e margem de 30. Quando algum disco passar da borda, a frota inteira desce 40 e a direção vira. Mostre a direção no fim e a altura em que os discos ficaram.',
      dica: 'A conferência da borda é `any(...)`: se **algum** disco passou de `largura - margem`, a frota vira e desce. Cuidado: virar a direção não pode ser feito mais de uma vez no mesmo passo.',
      conferencia: 'Aparece `direção agora: -1` e `os discos desceram para 40`.',
      solucao:
        'largura = 600\nmargem = 30\ndirecao = 1\nfrota = [{"x": 100, "y": 0}, {"x": 400, "y": 0}]\n\nfor passo in range(8):\n    for disco in frota:\n        disco["x"] = disco["x"] + direcao * 30\n    na_borda = any(disco["x"] > largura - margem or disco["x"] < margem for disco in frota)\n    if na_borda:\n        direcao = -direcao\n        for disco in frota:\n            disco["y"] = disco["y"] + 40\n\nprint("direção agora:", direcao)\nprint("os discos desceram para", frota[0]["y"])',
      correcao: {
        saidaEsperada: ['direção agora: -1', 'os discos desceram para 40'],
        valoresEsperados: [
          {
            rotulo: 'Depois de encostar na borda, a frota passa a andar para a esquerda',
            expressao: 'direcao',
            igualA: '-1',
          },
          {
            rotulo: 'A frota desceu um degrau, e só um',
            expressao: 'frota[0]["y"]',
            igualA: '40',
          },
          {
            // Medido: a frota anda 30 por passo e vira no primeiro passo em que
            // passa de 570 (o disco mais à direita chega a 580); nos dois passos
            // seguintes, já na direção contrária, ele recua para 520.
            rotulo: 'A frota não ficou parada na borda: depois de virar, andou de volta',
            expressao: 'max(disco["x"] for disco in frota)',
            igualA: '520',
          },
        ],
        limite:
          'A conferência olha a direção final, a descida e onde a frota parou. Ela não julga quantos discos a frota tem (o enunciado não fixa isso), nem a forma da conferência de borda — `any`, `for` com variável de controle ou `max` dão no mesmo. O que ela pega é a frota que desce mais de um degrau ou que vira sem descer.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p14-1',
      enunciado: 'Por que as balas ficam guardadas em uma lista, e não em uma variável cada?',
      alternativas: [
        'Porque a lista desenha as balas na tela e a variável não desenha',
        'Porque o Python só consegue mover objetos que estão dentro de uma lista',
        'Porque a lista guarda as balas em ordem de altura, o que facilita a limpeza',
        'Porque a quantidade de tiros no ar muda o tempo todo',
      ],
      correta: 3,
      explicacao:
        'A quantidade de balas não é conhecida antes de o jogo começar: depende de quantas vezes quem joga apertou a tecla. A lista resolve isso sem escrever uma variável para cada tiro possível — e as mesmas quatro linhas que movem uma bala movem cinquenta, porque o `for` cuida da quantidade.',
    },
    {
      id: 'p14-2',
      enunciado: 'A bala saiu pelo alto da tela e nunca mais volta. O que o programa deve fazer com ela?',
      alternativas: [
        'Deixá-la na lista, mas parar de desenhá-la',
        'Removê-la da lista, para o programa não continuar movendo o que ninguém vê',
        'Devolvê-la para o pé da tela, para ser usada de novo',
        'Marcá-la como inativa, e continuar movendo-a com velocidade zero',
      ],
      correta: 1,
      explicacao:
        'Bala que saiu da tela é lixo: ocupa memória e continua sendo percorrida a cada quadro. Em um jogo com tiros rápidos, são centenas em pouco tempo, e a conta aparece como lentidão. Deixar na lista "para não mexer no laço" é a origem do vazamento — e a lista nova com condição resolve o mesmo sem o risco de pular itens.',
    },
    {
      id: 'p14-3',
      enunciado:
        'Por que remover itens de uma lista enquanto um `for` a percorre pode deixar itens sem serem olhados?',
      alternativas: [
        'Porque o `for` guarda uma cópia dos itens no começo e passa a comparar com valores velhos',
        'Porque o Python proíbe remover itens durante o `for` e interrompe o programa com um erro',
        'Porque remover um item empurra os seguintes para trás, e o `for`, que anda por posição, pula o próximo',
        'Porque o `for` percorre a lista em ordem decrescente quando há remoções',
      ],
      correta: 2,
      explicacao:
        'O `for` não "lembra" do item: ele avança as posições 0, 1, 2... Ao remover o item da posição 0, quem estava em 1 passa para 0, e o `for` segue para a posição 1 — que agora é o item que estava em 2. O item do meio nunca é olhado. Montar uma lista nova com quem ficou evita o problema porque a lista percorrida é diferente da lista escrita.',
    },
    {
      id: 'p14-4',
      enunciado: 'A frota se move como um bloco. Onde fica guardada a direção em que ela anda?',
      alternativas: [
        'Em um lugar só, fora dos alienígenas, junto do resto do estado do jogo',
        'Em cada alienígena, para que todos saibam para onde ir',
        'Na função que desenha, que decide o lado do movimento a cada quadro',
        'Na lista da frota, na posição zero, que é a posição do líder',
      ],
      correta: 0,
      explicacao:
        'A direção é do conjunto, não da peça: se cada alienígena guardasse a sua, bastaria uma virada de borda para metade deles continuar para um lado e a outra metade para o outro — a frota se abriria em duas. Guardar o estado do jogo em um lugar só é o mesmo princípio das configurações, na unidade anterior.',
    },
    {
      id: 'p14-5',
      enunciado: 'Para que serve limitar quantas balas podem existir no ar ao mesmo tempo?',
      alternativas: [
        'Para o jogador não conseguir atirar em mais de um alienígena por vez',
        'Para o jogo não ficar pesado e a tela não ficar ilegível quando a tecla é segurada',
        'Porque o Python recusa listas com mais de vinte itens em um jogo',
        'Para garantir que as balas atinjam a frota antes de saírem pelo alto da tela',
      ],
      correta: 1,
      explicacao:
        'A tecla segurada dispara um tiro por quadro: sessenta por segundo. Sem limite, a lista de balas cresce rápido, o programa fica pesado e a tela vira uma cortina de riscos. O limite é uma decisão de jogo (quantos tiros valem a pena) que também resolve um problema de programa (quanto trabalho cada quadro tem). Nada disso restringe em quantos alienígenas se pode acertar.',
    },
  ],
}
