import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 15 — O Placar da Batalha.
 * Capítulo 14 do livro: o fecho do projeto de jogo — colisão, vidas, pontos e nível.
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 *
 * Fecha a trilha do projeto 1. Como as duas anteriores, o que a unidade escreve
 * roda aqui em Python puro, e o desenho é a parte que o Pygame faria (medido:
 * `import pygame` falha nesta distribuição do Pyodide, D-061). A colisão por
 * retângulo é o exercício mais importante do capítulo, e é aquele em que a versão
 * do livro e a nossa podem divergir no detalhe — por isso ela é medida, e o
 * limite da correção diz exatamente o que está sendo julgado.
 */
export const u15PlacarDaBatalha: ConteudoDaUnidade = {
  id: 'u15-placar-da-batalha',

  missao:
    'Ao final desta unidade, você vai decidir quando as coisas se acertam: a colisão entre o tiro e o disco, a perda de vida quando a frota alcança a nave, os pontos que sobem e o nível que faz a frota descer mais rápido — e o jogo que termina e começa de novo.',

  leitura: {
    parte:
      'Capítulo 14 do livro — as partes sobre quando um tiro acerta um alienígena, quando a frota alcança a nave, as vidas, os pontos e o nível.',
    porque:
      'Até aqui o jogo tem objetos que se movem, mas nada **acontece**: ninguém perde, ninguém ganha, nada muda de velocidade. Este capítulo é o que transforma movimento em jogo — três perguntas respondidas a cada quadro: alguma bala encostou em algum disco? a frota chegou na nave? ainda há vidas? A resposta muda o estado do jogo, e é isso que dá sentido a tudo que veio antes.',
    oQueObservar: [
      'A conferência de encostar: o livro compara **retângulos**, e não pontos. Um objeto grande não precisa estar no mesmo ponto do outro para encostar nele — basta que os dois espaços se sobreponham. Repare em como a sobreposição vira quatro comparações de números.',
      'O que o livro faz quando o tiro acerta: a bala some **e** o alienígena some. Repare que as duas saídas são limpezas de lista, do mesmo tipo da unidade anterior, e que a ordem entre elas importa.',
      'As vidas: quando a frota alcança a nave, o livro não termina o jogo de imediato — ele tira uma vida, esvazia a tela e recomeça a frota mais embaixo. Só quando as vidas acabam o jogo para de verdade.',
      'A velocidade que aumenta com o nível, e por que ela é uma **mistura** de dois números: uma velocidade de base, que é sempre a mesma, e um fator que cresce a cada frota derrotada.',
    ],
    semOLivro:
      'Sem o livro em mãos, a unidade continua inteira: a explicação cobre a colisão entre retângulos e o caso de encostar sem sobrepor, a limpeza das duas listas, as vidas, os pontos, o nível que acelera e o fim do jogo. O que o livro acrescenta é a montagem na sua máquina — as imagens, os sons, o placar escrito na tela e o botão de recomeçar — parte que aqui fica explicada e não executada, com o motivo declarado.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Para saber se um tiro acertou, o jeito ingênuo seria comparar posições: se o `x` da bala for igual ao `x` do disco e o `y` também, acertou. Isso quase nunca funcionaria. Os dois são objetos com tamanho, e o tiro acerta quando encosta na **borda** do disco, não quando chega ao centro dele. Além disso, os números mudam de quatro em quatro unidades a cada quadro, e uma colisão de verdade raramente cai em um ponto exato: o que existe é uma faixa de valores, e é ela que precisa ser conferida.',
    },
    {
      tipo: 'diagrama',
      titulo: 'Dois retângulos encostados',
      descricao:
        'Cada objeto do jogo ocupa um retângulo. Dois retângulos estão sobrepostos quando, nas **duas** direções, um começa antes de o outro terminar. Se qualquer direção estiver separada, não há colisão.',
      partes: [
        {
          rotulo: 'Cada um tem',
          valor: 'x, y, largura, altura',
          nota: 'o canto de cima à esquerda, e o tamanho que o objeto ocupa',
        },
        {
          rotulo: 'Na horizontal',
          valor: 'x do A < x + largura do B',
          nota: 'e, ao mesmo tempo, o x do B antes do fim do A — os dois lados precisam passar',
        },
        {
          rotulo: 'Na vertical',
          valor: 'a mesma conta com y e altura',
          nota: 'as duas direções ao mesmo tempo é o que faz a sobreposição de verdade',
        },
        {
          rotulo: 'Encostado sem invadir',
          valor: 'não é colisão',
          nota: 'se a borda de um está exatamente na borda do outro, eles se tocam, e não se sobrepõem',
        },
      ],
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A colisão por retângulo, em uma função',
      codigo:
        'def colide(um, outro):\n    separados_na_horizontal = (\n        um["x"] + um["largura"] <= outro["x"] or outro["x"] + outro["largura"] <= um["x"]\n    )\n    separados_na_vertical = (\n        um["y"] + um["altura"] <= outro["y"] or outro["y"] + outro["altura"] <= um["y"]\n    )\n    return not separados_na_horizontal and not separados_na_vertical\n\ntiro = {"x": 0, "y": 0, "largura": 10, "altura": 10}\ndisco = {"x": 9, "y": 9, "largura": 10, "altura": 10}\nprint("acertou:", colide(tiro, disco))',
    },
    {
      tipo: 'destaque',
      titulo: 'A forma do livro e a nossa olham a mesma coisa por lados opostos',
      texto:
        'O caminho mais comum de escrever esta conferência — e o que o livro usa — é perguntar se um **não** está totalmente à direita, à esquerda, acima ou abaixo do outro, e responder "encostou" quando nenhuma dessas quatro coisas é verdade. A função acima pergunta o contrário ("estão separados?") e no fim inverte a resposta. Dá no mesmo: as quatro comparações são as mesmas. O jeito mais fácil de errar, nos dois caminhos, é o sinal de menor ou maior na comparação das bordas — e a consequência é sempre a mesma: disparos que atravessam os discos sem acertar.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Com a colisão respondida, cada quadro do jogo passa a ter uma lista de decisões: para cada bala, para cada disco, encostou? Quando encosta, as duas coisas somem — a bala e o disco — e os pontos sobem. Isso é feito de trás para a frente, percorrendo as listas por índice e removendo quem saiu, porque dois encostes podem acontecer no mesmo quadro, e remover um item no meio do caminho desloca os seguintes.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Um quadro de acertos: a bala e o disco saem, e os pontos sobem',
      codigo:
        'balas = [{"x": 0, "y": 0, "largura": 10, "altura": 10}]\ndiscos = [{"x": 9, "y": 9, "largura": 10, "altura": 10}, {"x": 300, "y": 300, "largura": 10, "altura": 10}]\npontos = 0\n\ndef colide(um, outro):\n    return not (\n        um["x"] + um["largura"] <= outro["x"]\n        or outro["x"] + outro["largura"] <= um["x"]\n        or um["y"] + um["altura"] <= outro["y"]\n        or outro["y"] + outro["altura"] <= um["y"]\n    )\n\nfor indice_da_bala in range(len(balas) - 1, -1, -1):\n    bala = balas[indice_da_bala]\n    for indice_do_disco in range(len(discos) - 1, -1, -1):\n        if colide(bala, discos[indice_do_disco]):\n            discos.pop(indice_do_disco)\n            balas.pop(indice_da_bala)\n            pontos = pontos + 10\n            break\n\nprint("pontos:", pontos)\nprint("discos na tela:", len(discos))',
    },
    {
      tipo: 'destaque',
      titulo: 'As listas são percorridas de trás para a frente',
      texto:
        'Percorrer por índice **de trás para a frente** (`range(len(lista) - 1, -1, -1)`) é o que permite remover itens no meio do caminho sem pular nenhum: ao remover o item da posição 3, os que estão depois dele já foram visitados, e os que estão antes não mudam de posição. É o mesmo problema da limpeza de balas da unidade anterior, resolvido de outro jeito — e o `break` depois do acerto é o que impede a mesma bala de derrubar dois discos.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Falta o que dá consequência ao jogo: perder. Quando a frota chega perto o bastante da nave, quem foi atingido é o jogador — e a forma de o jogo reagir é tirar uma vida e recomeçar a frota mais embaixo, no centro da tela. As vidas não são um contador solto: elas decidem se o jogo continua. Enquanto houver vidas, o laço principal segue repetindo; quando a última vai embora, o laço termina e o jogo mostra o que aconteceu.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A vida que vai embora, e o jogo que continua ou acaba',
      codigo:
        'vidas = 3\nfrota = [{"x": 400, "y": 300}]\nnave = {"x": 400, "y": 570, "largura": 60, "altura": 40}\n\nfor disco in frota:\n    if disco["y"] >= nave["y"] - 40:\n        vidas = vidas - 1\n        frota = []\n\nprint("vidas:", vidas)\nprint("a frota foi refeita:", len(frota) == 0)',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Para o jogo ficar mais difícil conforme se joga, o nível entra na conta da velocidade. O caminho mais simples é somar um passo fixo a cada nível: a velocidade do primeiro nível é a de base, e cada frota derrotada soma meio ponto. Vale a pena reparar no que **não** se faz aqui: não se guarda a velocidade como um número que vai sendo multiplicado a cada nível, porque aí cada nível dependeria do anterior e um ajuste no meio do jogo viraria uma caçada — guarda-se o nível, e a velocidade é calculada a partir dele.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'O nível que acelera a frota, e o jogo que recomeça',
      codigo:
        'VELOCIDADE_BASE = 2.0\nPASSO_DO_NIVEL = 0.5\n\ndef velocidade_do_nivel(nivel):\n    return VELOCIDADE_BASE + (nivel - 1) * PASSO_DO_NIVEL\n\nnivel = 1\nvidas = 3\njogo_ativo = True\n\nfor frota_derrotada in range(3):\n    nivel = nivel + 1\n    if not jogo_ativo:\n        break\n\nprint("nível:", nivel)\nprint("velocidade da frota:", velocidade_do_nivel(nivel))\nprint("jogo ativo:", jogo_ativo)',
    },
    {
      tipo: 'destaque',
      titulo: 'Recomeçar é voltar o estado ao começo, e não reescrever o jogo',
      texto:
        'Terminar e começar de novo não exige um segundo programa: exige devolver as variáveis do jogo ao valor inicial — vidas de volta a três, pontos a zero, nível a um, a frota refeita e o jogo ativo outra vez. É por isso que faz diferença ter o estado do jogo em um lugar só, como as configurações da unidade 13: reiniciar é uma função que mexe nesse estado, e não um caminho paralelo no código.',
    },
    {
      tipo: 'avisoDeVersao',
      titulo: 'O livro é de 2015/2016, e a colisão de retângulos hoje tem nome próprio',
      texto:
        'A conferência que a unidade escreve à mão é exatamente o que o Pygame oferece pronto em `rect.colliderect(outro)` — e o que bibliotecas mais novas oferecem como `colliderect` ou `intersects`. Na edição do projeto, o livro usa os retângulos da própria biblioteca gráfica. Como aqui não há biblioteca gráfica (medido: `import pygame` falha nesta distribuição, D-061), a unidade escreve a conta em Python puro — e ela é a mesma conta: quatro comparações de bordas. Escrever à mão uma vez é o que faz a versão da biblioteca deixar de ser uma caixa-preta.',
    },
  ],

  pratica: [
    {
      id: 'e15-1',
      enunciado:
        'Escreva a função `colide(um, outro)`, que recebe dois retângulos com `x`, `y`, `largura` e `altura` e devolve `True` quando os dois se sobrepõem. Confira três casos: um tiro que invade o disco, dois que só se encostam e dois separados. Mostre o resultado dos três.',
      dica: 'A pergunta mais fácil de escrever é a contrária: "estão separados?". Se um termina antes de o outro começar, na horizontal **ou** na vertical, eles não se encostam. A resposta é a negação disso.',
      conferencia: 'Aparece `invadindo: True`, `encostados: False` e `separados: False`.',
      solucao:
        'def colide(um, outro):\n    separados_na_horizontal = (\n        um["x"] + um["largura"] <= outro["x"] or outro["x"] + outro["largura"] <= um["x"]\n    )\n    separados_na_vertical = (\n        um["y"] + um["altura"] <= outro["y"] or outro["y"] + outro["altura"] <= um["y"]\n    )\n    return not separados_na_horizontal and not separados_na_vertical\n\ntiro = {"x": 0, "y": 0, "largura": 10, "altura": 10}\ninvadindo = {"x": 9, "y": 9, "largura": 10, "altura": 10}\nencostado = {"x": 10, "y": 0, "largura": 10, "altura": 10}\ndistante = {"x": 40, "y": 0, "largura": 10, "altura": 10}\n\nprint("invadindo:", colide(tiro, invadindo))\nprint("encostados:", colide(tiro, encostado))\nprint("separados:", colide(tiro, distante))',
      correcao: {
        saidaEsperada: ['invadindo: True', 'encostados: False', 'separados: False'],
        valoresEsperados: [
          {
            rotulo: 'Sobrepostos, a função diz que houve colisão',
            expressao: 'colide({"x": 0, "y": 0, "largura": 10, "altura": 10}, {"x": 9, "y": 9, "largura": 10, "altura": 10})',
            igualA: 'True',
          },
          {
            rotulo: 'Encostados pela borda, sem invadir, não é colisão',
            expressao: 'colide({"x": 0, "y": 0, "largura": 10, "altura": 10}, {"x": 10, "y": 0, "largura": 10, "altura": 10})',
            igualA: 'False',
          },
          {
            rotulo: 'Um retângulo dentro do outro ainda é colisão',
            expressao: 'colide({"x": 0, "y": 0, "largura": 30, "altura": 30}, {"x": 5, "y": 5, "largura": 5, "altura": 5})',
            igualA: 'True',
          },
        ],
        limite:
          'A conferência chama a sua função com três pares de retângulos e olha a resposta de cada um. Ela não confere o nome dos parâmetros, se você usou dicionário ou outro formato que responda a `["x"]`, nem a forma da conta. O caso que ela pega de propósito é o mais errado dos fáceis: considerar colisão o encostar sem invadir.',
      },
    },
    {
      id: 'e15-2',
      enunciado:
        'Escreva a classe `Jogo`, com `vidas` começando em 3, `pontos` em 0 e um método `acertou()` que soma 10 pontos e um método `perdeu_vida()` que tira uma vida. Depois acerte cinco vezes, perca uma vida e mostre pontos, vidas e se o jogo continua.',
      dica: 'Os atributos são criados no `__init__` e mudados pelos métodos: `self.pontos = self.pontos + 10`. O jogo continua enquanto `self.vidas > 0`.',
      conferencia: 'Aparece `pontos: 50`, `vidas: 2` e `o jogo continua: True`.',
      solucao:
        'class Jogo:\n    def __init__(self):\n        self.vidas = 3\n        self.pontos = 0\n\n    def acertou(self):\n        self.pontos = self.pontos + 10\n\n    def perdeu_vida(self):\n        self.vidas = self.vidas - 1\n\n    def continua(self):\n        return self.vidas > 0\n\njogo = Jogo()\nfor acerto in range(5):\n    jogo.acertou()\njogo.perdeu_vida()\n\nprint("pontos:", jogo.pontos)\nprint("vidas:", jogo.vidas)\nprint("o jogo continua:", jogo.continua())',
      correcao: {
        saidaEsperada: ['pontos: 50', 'vidas: 2', 'o jogo continua: True'],
        valoresEsperados: [
          { rotulo: 'Cinco acertos somam cinquenta pontos', expressao: 'jogo.pontos', igualA: '50' },
          { rotulo: 'Uma vida a menos depois de ser atingido', expressao: 'jogo.vidas', igualA: '2' },
          {
            rotulo: 'Com duas vidas, o jogo continua',
            expressao: '[jogo.perdeu_vida(), jogo.perdeu_vida(), jogo.perdeu_vida(), jogo.continua()][3]',
            igualA: 'False',
          },
        ],
        limite:
          'A conferência olha os pontos, as vidas e o que acontece quando as vidas acabam. Ela não julga o nome dos métodos, nem se a conta dos pontos está em `acertou()` ou em outro lugar — o que ela cobra é que acertar cinco vezes valha 50, que perder vida desconte uma, e que com zero vidas o jogo não continue.',
      },
    },
    {
      id: 'e15-3',
      enunciado:
        'Escreva `velocidade_do_nivel(nivel)`, que devolve a velocidade da frota naquele nível: 2.0 no primeiro, e meio ponto a mais a cada nível seguinte. Depois suba três níveis e mostre a velocidade do nível 1 e a do nível 3.',
      dica: 'A conta é `2.0 + (nivel - 1) * 0.5`. O primeiro nível não soma nada: é por isso que o `nivel - 1` está ali.',
      conferencia: 'Aparece `nível 1: 2.0` e `nível 3: 3.0`.',
      solucao:
        'VELOCIDADE_BASE = 2.0\nPASSO_DO_NIVEL = 0.5\n\ndef velocidade_do_nivel(nivel):\n    return VELOCIDADE_BASE + (nivel - 1) * PASSO_DO_NIVEL\n\nnivel = 1\nfor frota_derrotada in range(2):\n    nivel = nivel + 1\n\nprint("nível 1:", velocidade_do_nivel(1))\nprint("nível 3:", velocidade_do_nivel(nivel))',
      correcao: {
        saidaEsperada: ['nível 1: 2.0', 'nível 3: 3.0'],
        valoresEsperados: [
          { rotulo: 'O primeiro nível usa a velocidade de base, sem soma', expressao: 'velocidade_do_nivel(1)', igualA: '2.0' },
          { rotulo: 'O terceiro nível soma dois passos de meio ponto', expressao: 'velocidade_do_nivel(3)', igualA: '3.0' },
          { rotulo: 'A função serve para qualquer nível, e não só para os três do enunciado', expressao: 'velocidade_do_nivel(11)', igualA: '7.0' },
        ],
        estrutura: { linhasNaoVazias: 2 },
        limite:
          'A conferência olha a velocidade que a sua função devolve em três níveis, sendo o terceiro deles um nível que o enunciado não usa. Ela não julga a forma da conta (`base + (nivel - 1) * passo` e `base + nivel * passo - passo` dão no mesmo) nem de onde saem os números, desde que os três valores confiram.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p15-1',
      enunciado: 'Por que a colisão do jogo é conferida entre retângulos, e não entre pontos?',
      alternativas: [
        'Porque o retângulo é mais rápido de comparar do que dois números',
        'Porque o Python não sabe comparar pontos com casas decimais',
        'Porque o retângulo guarda a cor do objeto, e a cor decide quem ganhou',
        'Porque os objetos têm tamanho: encostar acontece na borda, e não só no centro',
      ],
      correta: 3,
      explicacao:
        'Comparar pontos exigiria que o centro do tiro caísse exatamente no centro do disco — coisa que quase nunca acontece, porque as posições mudam de algumas unidades a cada quadro. O retângulo resolve porque representa o espaço que o objeto ocupa: se os dois espaços se sobrepõem, houve encontro, mesmo que os centros estejam longe.',
    },
    {
      id: 'p15-2',
      enunciado: 'Dois retângulos estão com as bordas exatamente encostadas, sem invadir um ao outro. Isso é colisão?',
      alternativas: [
        'Sim: qualquer contato derruba o objeto',
        'Depende da velocidade: encostar devagar conta como colisão',
        'Não: encostar não é sobrepor, e a conferência dos lados pega isso',
        'Sim, desde que os dois tenham a mesma altura',
      ],
      correta: 2,
      explicacao:
        'A conferência pergunta se um começa antes de o outro terminar. Se a borda direita de um está exatamente na borda esquerda do outro, essa condição é falsa e os dois estão separados — encostados, mas separados. É um caso-limite que vale a pena testar de propósito: é ali que o sinal de menor ou maior na comparação erra, e o erro aparece como tiro que atravessa o disco sem derrubá-lo.',
    },
    {
      id: 'p15-3',
      enunciado: 'Quando o tiro acerta, o que precisa sair do jogo?',
      alternativas: [
        'Os dois: a bala e o disco, e os pontos somam uma vez',
        'Só o disco, para o tiro continuar subindo e poder acertar outro',
        'Só a bala, porque o disco já foi contado nos pontos',
        'Nenhum dos dois: eles ficam no lugar, marcados como derrotados',
      ],
      correta: 0,
      explicacao:
        'Um tiro que atravessa a frota derrubando vários discos não é o que se espera de um jogo — por isso a bala some junto do disco, e o `break` encerra a busca daquela bala. Deixar os dois "marcados" faria o programa continuar movendo o que ninguém vê: o mesmo problema das balas que saíam da tela na unidade anterior.',
    },
    {
      id: 'p15-4',
      enunciado: 'A frota alcançou a nave e o jogador ainda tem vidas. O que o jogo faz?',
      alternativas: [
        'Termina na hora, e a tela mostra os pontos finais',
        'Tira uma vida, esvazia a tela e recomeça a frota mais embaixo',
        'Devolve a vida depois de alguns segundos, sem interromper o jogo',
        'Para de mover a frota e espera o jogador apertar uma tecla para continuar',
      ],
      correta: 1,
      explicacao:
        'Perder uma vida é um recomeço parcial: a frota volta do alto, mais perto da nave conforme o nível, e o jogo segue. O fim de verdade só chega quando a última vida vai embora — e é essa contagem que decide se o laço principal continua rodando. É a diferença entre "o jogo deu errado" e "o jogo acabou", que é justamente o que faz o jogo ter consequência.',
    },
    {
      id: 'p15-5',
      enunciado: 'Por que a velocidade da frota é calculada a partir do nível, em vez de ser multiplicada a cada nível novo?',
      alternativas: [
        'Porque multiplicar deixaria a velocidade impossível de guardar no progresso',
        'Porque o Python arredonda os resultados de multiplicação e desalinharia a frota',
        'Porque, calculada do nível, a velocidade de qualquer nível pode ser conferida depois sem repetir o jogo inteiro',
        'Porque somar é mais rápido do que multiplicar dentro do laço principal',
      ],
      correta: 2,
      explicacao:
        'Se a velocidade de cada nível saísse da anterior, o valor dependeria de toda a partida até ali — e conferi-la exigiria refazer o caminho. Calculada do nível, ela é uma função: você pergunta "qual é a velocidade do nível 7?" e a resposta sai na hora, do mesmo jeito que o estado do jogo (vidas, pontos, nível) é o que se guarda para continuar de onde parou.',
    },
  ],
}
