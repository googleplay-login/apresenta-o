import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 16 — A Fábrica de Dados.
 * Capítulo 15 do livro: gerar dados (o projeto de visualização de dados).
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 *
 * Primeira unidade da trilha de visualização de dados. O que a unidade escreve é
 * a parte que **gera e conta** os dados — e essa roda no console de verdade
 * (medido: `random`, `statistics` e `collections` existem nesta distribuição).
 * O desenho do gráfico é a parte que o matplotlib faria, e ele **não** roda aqui
 * (medido: `import matplotlib` falha, D-062). Nada aqui depende de números
 * sorteados para a correção passar: os exercícios que usam `random` são conferidos
 * por forma e por soma, e os que exigem valor exato usam dados fixos.
 */
export const u16FabricaDeDados: ConteudoDaUnidade = {
  id: 'u16-fabrica-de-dados',

  missao:
    'Ao final desta unidade, você vai produzir dados com o programa: uma caminhada que se soma passo a passo, a contagem de quantas vezes cada resultado apareceu e a leitura do resultado — sabendo que a parte de desenhar o gráfico fica fora deste console, e por quê.',

  leitura: {
    parte:
      'Capítulo 15 do livro — as partes sobre gerar dados, a caminhada aleatória, os dados que se acumulam em uma lista e o gráfico que sai deles. É o primeiro capítulo do projeto de visualização de dados.',
    porque:
      'Até aqui, dado era o que você digitava: uma lista escrita à mão, um número escolhido por você. Neste capítulo o dado passa a ser produzido pelo próprio programa, em quantidade — cem lançamentos, mil passos de uma caminhada — e a pergunta deixa de ser "como guardo este valor" e passa a ser "o que estes mil valores estão dizendo". É a virada que sustenta o resto do projeto: sem dado em quantidade, não há o que visualizar.',
    oQueObservar: [
      'Como o livro produz o dado: um laço que repete uma escolha e **acumula** o resultado em uma lista. Repare que a lista é o dado — o gráfico é só a leitura dele depois.',
      'A caminhada: cada passo é pequeno e o resultado de cada passo depende do anterior. Repare que a posição nova não é sorteada do zero; ela é a posição anterior mais o passo.',
      'A contagem: quando o livro quer saber quantas vezes cada resultado apareceu, ele usa um dicionário em que a **chave** é o resultado e o valor é quantas vezes ele apareceu. Repare que a chave pode ser criada na hora, quando aparece pela primeira vez.',
      'O que o livro faz com os dados no fim: ordena, compara, pega o maior e o menor, e só então desenha. Grande parte do trabalho de "visualizar" é esta arrumação, e ela acontece antes do gráfico.',
    ],
    semOLivro:
      'Sem o livro em mãos, a unidade continua inteira: a explicação cobre como produzir dado com `random`, como acumular uma caminhada, como contar frequências com um dicionário, e como ler o resultado com `max`, `min` e ordenação. O que o livro acrescenta é o desenho — os gráficos coloridos que ele monta com a biblioteca de desenho —, e essa parte aqui é explicada e não executada, pelo motivo que a unidade declara em vez de esconder.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Existe uma diferença entre um dado que você escreve e um dado que o programa produz. `notas = [9.5, 7.0, 8.0]` é o primeiro caso: três valores, escolhidos por alguém. Um programa que simula cem lançamentos de dado é o segundo: os valores não foram escolhidos, foram gerados — e é justamente por serem muitos que eles começam a mostrar padrões que três números não mostrariam.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A caminhada que se acumula: cada posição sai da anterior',
      codigo:
        'passos = [1, 1, -1, -1, -1, 1, 1, 1, -1, 1]\n\nposicao = 0\ncaminhada = []\nfor passo in passos:\n    posicao = posicao + passo\n    caminhada.append(posicao)\n\nprint("a caminhada terminou em", caminhada[-1])\nprint("o ponto mais alto foi", max(caminhada))',
    },
    {
      tipo: 'diagrama',
      titulo: 'A caminhada como uma lista que cresce',
      descricao:
        'Cada passo que entra muda a posição, e a posição nova é guardada. O que sobra no fim é a lista de todas as posições por onde a caminhada passou — o dado que o gráfico desenharia.',
      partes: [
        {
          rotulo: 'Posição inicial',
          valor: '0',
          nota: 'o ponto de partida, antes de qualquer passo',
        },
        {
          rotulo: 'Um passo',
          valor: '+1 ou −1',
          nota: 'o passo é pequeno de propósito: quem manda no resultado é a soma deles',
        },
        {
          rotulo: 'Posição nova',
          valor: 'anterior + passo',
          nota: 'não é sorteada do zero — é a anterior deslocada, e é isso que faz o desenho parecer uma caminhada',
        },
        {
          rotulo: 'O dado no fim',
          valor: 'a lista inteira',
          nota: 'a última posição é onde parou; `max` e `min` dizem até onde foi',
        },
      ],
    },
    {
      tipo: 'paragrafo',
      texto:
        'Com os dados na mão, a pergunta seguinte é sempre a mesma: quanto apareceu de cada coisa? A resposta se escreve com um dicionário em que a chave é o resultado e o valor é a contagem. E tem um detalhe que confunde na primeira vez: a chave pode não existir ainda quando o resultado aparece pela primeira vez, então a contagem começa do zero — e o jeito de escrever isso sem erro é perguntar ao dicionário se a chave já está lá.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Contando frequências com um dicionário',
      codigo:
        'lancamentos = [3, 5, 3, 1, 6, 3, 2, 5, 3]\n\nfrequencias = {}\nfor face in lancamentos:\n    if face in frequencias:\n        frequencias[face] = frequencias[face] + 1\n    else:\n        frequencias[face] = 1\n\nprint("faces que apareceram:", len(frequencias))\nprint("a mais comum:", max(frequencias, key=frequencias.get))',
    },
    {
      tipo: 'destaque',
      titulo: '`max` com `key` é o que responde "qual apareceu mais"',
      texto:
        '`max(frequencias)` pega a maior **chave**, que é o maior número de face — e não a que apareceu mais vezes. Para comparar pelos valores, você diz ao `max` o que olhar: `max(frequencias, key=frequencias.get)`. É o mesmo `key` que a ordenação usa na unidade 4 (`sorted(..., key=...)`): a função diz "compare por isto aqui", em vez de comparar o item inteiro.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'O mesmo dado, agora gerado pelo programa',
      codigo:
        'import random\n\nrandom.seed(7)\nlancamentos = [random.randint(1, 6) for _ in range(100)]\n\nfrequencias = {}\nfor face in lancamentos:\n    frequencias[face] = frequencias.get(face, 0) + 1\n\nprint("lançamentos:", len(lancamentos))\nprint("faces que apareceram:", len(frequencias))',
    },
    {
      tipo: 'destaque',
      titulo: 'Dado sorteado e dado conferido não combinam',
      texto:
        'O programa acima sorteia números diferentes a cada execução: é isso que ele deve fazer. A consequência prática é que **não dá para conferir um valor exato** de um dado sorteado — o que se confere é a forma: quantos lançamentos foram feitos, se todos os valores estão entre 1 e 6, se a soma das contagens é o número de lançamentos. Os exercícios desta unidade fazem exatamente essa separação: quando o enunciado quer valor exato, ele dá os dados; quando quer sorteio, ele pede as contas que valem para qualquer sorteio. `random.seed(7)` existe para quem quiser repetir a mesma sequência enquanto testa, mas o resultado dela não é uma garantia entre versões do Python.',
    },
    {
      tipo: 'destaque',
      titulo: 'Neste console, o gráfico é a parte que não roda',
      texto:
        'O capítulo chama a biblioteca **matplotlib** para desenhar: `import matplotlib.pyplot as plt`, as listas de valores entrando eixos e a janela do gráfico aparecendo. **Isso não roda aqui**, e a causa é a mesma da trilha do jogo (D-061): medido, `import matplotlib` falha nesta distribuição do Python, e o `numpy` que ela exige não está na cópia local — buscar fora exigiria baixar da internet, e este projeto não faz isso (D-040). O que roda é a parte que decide: o dado gerado, a contagem, o maior, o menor, a ordem. Essa parte é, aliás, a que dá trabalho de verdade: com os dados arrumados, desenhar é uma linha.',
    },
    {
      tipo: 'avisoDeVersao',
      titulo: 'O livro é de 2015/2016, e duas bibliotecas que ele usa saíram de cena',
      texto:
        'Esta é a parte do livro em que mais coisa envelheceu. O **Pygal** — biblioteca de gráficos que a edição do projeto usa para os gráficos de barra e para o **mapa-múndi** — não é mais atualizado, e o módulo de mapa (`pygal.i18n`, `Worldmap`) **deixou de existir**; hoje esses gráficos costumam sair de matplotlib, plotly ou de uma biblioteca de gráficos no navegador. A ideia por trás, essa, continua igual: um gráfico é uma lista de rótulos e uma lista de valores, entregues a quem sabe desenhar. A diferença entre as bibliotecas é a roupa, não o conteúdo.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Vale reparar em uma coisa enquanto você lê o capítulo: o trabalho de verdade não está no gráfico, está nas contas que vêm antes dele. Gerar o dado, contar, ordenar, comparar, tirar a média, olhar o que ficou de fora — é isso que transforma cem números em uma resposta. Quem faz esse caminho com clareza desenha o gráfico em qualquer biblioteca, inclusive na que ainda não existe.',
    },
  ],

  pratica: [
    {
      id: 'e16-1',
      enunciado:
        'Com os passos `[1, 1, -1, -1, -1, 1, 1, 1, -1, 1]`, monte a lista `caminhada` das posições — começando em zero e somando um passo por vez. Mostre onde a caminhada terminou, o ponto mais alto e o mais baixo que ela alcançou.',
      dica: 'A posição começa em 0 e é atualizada **antes** de ir para a lista: `posicao = posicao + passo` e depois `caminhada.append(posicao)`. O ponto mais alto é `max(caminhada)` e o mais baixo é `min(caminhada)`.',
      conferencia: 'Aparece `terminou em 2`, `o mais alto foi 2` e `o mais baixo foi -1`.',
      solucao:
        'passos = [1, 1, -1, -1, -1, 1, 1, 1, -1, 1]\n\nposicao = 0\ncaminhada = []\nfor passo in passos:\n    posicao = posicao + passo\n    caminhada.append(posicao)\n\nprint("terminou em", caminhada[-1])\nprint("o mais alto foi", max(caminhada))\nprint("o mais baixo foi", min(caminhada))',
      correcao: {
        saidaEsperada: ['terminou em 2', 'o mais alto foi 2', 'o mais baixo foi -1'],
        valoresEsperados: [
          {
            rotulo: 'A caminhada guardou uma posição por passo',
            expressao: 'len(caminhada)',
            igualA: '10',
          },
          {
            rotulo: 'A última posição é a soma de todos os passos',
            expressao: 'caminhada[-1]',
            igualA: '2',
          },
          {
            rotulo: 'O ponto mais alto da caminhada',
            expressao: 'max(caminhada)',
            igualA: '2',
          },
          {
            rotulo: 'O ponto mais baixo da caminhada',
            expressao: 'min(caminhada)',
            igualA: '-1',
          },
        ],
        estrutura: { linhasNaoVazias: 3 },
        limite:
          'A conferência olha a lista que ficou e o que o programa imprimiu. Ela não julga a forma do laço — `for` com acumulador, soma acumulada com `itertools` ou até dez `append` escritos à mão dão o mesmo resultado — nem de onde saem o maior e o menor, desde que os três números confiram.',
      },
    },
    {
      id: 'e16-2',
      enunciado:
        'Com os lançamentos `[3, 5, 3, 1, 6, 3, 2, 5, 3]`, conte quantas vezes cada face apareceu usando um dicionário. Mostre quantas faces diferentes apareceram e qual foi a mais comum, com quantas vezes.',
      dica: 'A chave pode não existir ainda: `frequencias.get(face, 0)` devolve 0 quando a face aparece pela primeira vez e a contagem do que já apareceu nas outras. Para achar a mais comum, `max(frequencias, key=frequencias.get)`.',
      conferencia: 'Aparece `faces diferentes: 5` e `a mais comum foi 3, com 4 vezes`.',
      solucao:
        'lancamentos = [3, 5, 3, 1, 6, 3, 2, 5, 3]\n\nfrequencias = {}\nfor face in lancamentos:\n    frequencias[face] = frequencias.get(face, 0) + 1\n\nmais_comum = max(frequencias, key=frequencias.get)\nprint("faces diferentes:", len(frequencias))\nprint("a mais comum foi", mais_comum, "com", frequencias[mais_comum], "vezes")',
      correcao: {
        saidaEsperada: ['faces diferentes: 5', 'a mais comum foi 3 com 4 vezes'],
        valoresEsperados: [
          { rotulo: 'A face mais repetida da lista', expressao: 'mais_comum', igualA: '3' },
          {
            rotulo: 'A contagem da face mais repetida',
            expressao: 'frequencias[mais_comum]',
            igualA: '4',
          },
          {
            rotulo: 'A soma das contagens é o número de lançamentos',
            expressao: 'sum(frequencias.values())',
            igualA: '9',
          },
        ],
        limite:
          'A conferência olha a face mais comum, quantas vezes ela apareceu e se a soma das contagens bate com os lançamentos. Ela não exige dicionário montado à mão: `collections.Counter` também serve, desde que as três medidas confiram. O texto impresso é procurado como o enunciado pede, sem exigir pontuação exata.',
      },
    },
    {
      id: 'e16-3',
      enunciado:
        'Agora gere o dado: sorteie 100 lançamentos de um dado de seis faces com `random.randint(1, 6)`, conte as frequências e mostre quantos lançamentos foram feitos e quantas faces diferentes apareceram. Como o dado é sorteado, não se espera um valor exato — e sim que as contas fechem.',
      dica: '`[random.randint(1, 6) for _ in range(100)]` cria a lista dos cem lançamentos. Depois é a mesma contagem do exercício anterior. `random.seed(7)` antes do sorteio deixa a sequência repetível enquanto você testa.',
      conferencia:
        'Aparece `lançamentos: 100`, e as faces contadas somam 100 — com todos os valores entre 1 e 6.',
      solucao:
        'import random\n\nrandom.seed(7)\nlancamentos = [random.randint(1, 6) for _ in range(100)]\n\nfrequencias = {}\nfor face in lancamentos:\n    frequencias[face] = frequencias.get(face, 0) + 1\n\nprint("lançamentos:", len(lancamentos))\nprint("faces diferentes:", len(frequencias))',
      correcao: {
        saidaEsperada: ['lançamentos: 100'],
        valoresEsperados: [
          {
            rotulo: 'Foram sorteados cem lançamentos',
            expressao: 'len(lancamentos)',
            igualA: '100',
          },
          {
            rotulo: 'Todas as faces estão entre 1 e 6',
            expressao: 'min(lancamentos) >= 1 and max(lancamentos) <= 6',
            igualA: 'True',
          },
          {
            rotulo: 'Nenhuma face passou de seis',
            expressao: 'len(frequencias) <= 6',
            igualA: 'True',
          },
          {
            rotulo: 'A soma das contagens é o número de lançamentos',
            expressao: 'sum(frequencias.values())',
            igualA: '100',
          },
        ],
        estrutura: { linhasNaoVazias: 2 },
        limite:
          'A conferência não olha **quais** faces saíram — elas mudam a cada execução, e é assim que deve ser. Ela cobra a forma do resultado: cem lançamentos, valores de 1 a 6, no máximo seis faces diferentes e a soma das contagens fechando com o total. Uma contagem que perca um lançamento pelo caminho reprova por essa última medida.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p16-1',
      enunciado: 'Por que a caminhada guarda cada posição em uma lista, em vez de guardar só a última?',
      alternativas: [
        'Porque o Python não deixa uma variável ser atualizada mais de dez vezes em um laço',
        'Porque a lista é o dado que o gráfico desenha: sem as posições, não há o que mostrar',
        'Porque a lista ocupa menos memória do que as variáveis usadas no laço',
        'Porque a última posição da lista precisa ser maior que a primeira',
      ],
      correta: 1,
      explicacao:
        'A posição final responde "onde chegou"; a lista de posições responde "por onde passou" — e é essa segunda pergunta que dá um gráfico. Guardar só o fim seria perder justamente o dado que o projeto desta parte do livro existe para desenhar, e também perder `max` e `min`, que saem da lista.',
    },
    {
      id: 'p16-2',
      enunciado: 'Na contagem de frequências, por que a primeira aparição de um resultado precisa de um cuidado a mais?',
      alternativas: [
        'Porque somar 1 a uma chave que ainda não existe dá erro de chave, e é preciso criar a chave valendo 1',
        'Porque o Python conta duas vezes o primeiro item de qualquer lista',
        'Porque o dicionário guarda as chaves em ordem alfabética e a primeira seria reordenada',
        'Porque a primeira aparição sempre vale 0 e não 1',
      ],
      correta: 0,
      explicacao:
        'O dicionário não inventa chave. Na primeira vez que um resultado aparece, `frequencias[face] + 1` procura algo que não existe e o programa para com `KeyError`. As duas saídas comuns são perguntar antes (`if face in frequencias`) ou usar `frequencias.get(face, 0) + 1`, que devolve zero quando a chave falta. É o mesmo erro de chave da unidade 7, agora no meio de uma contagem.',
    },
    {
      id: 'p16-3',
      enunciado: 'O que `max(frequencias, key=frequencias.get)` devolve?',
      alternativas: [
        'A maior contagem do dicionário, ou seja, o número de vezes que a face mais comum saiu',
        'Uma lista com todas as chaves ordenadas da menor contagem para a maior',
        'A chave cuja contagem é a maior: a face que apareceu mais vezes',
        'A soma de todas as contagens do dicionário',
      ],
      correta: 2,
      explicacao:
        'O `max` percorre as **chaves** e usa o valor devolvido por `key` para comparar. Com `key=frequencias.get`, ele compara as contagens e devolve a chave da maior — a face. Para a contagem em si, o caminho é dar mais um passo: `frequencias[mais_comum]`. Sem o `key`, o `max` devolveria a maior face, que quase nunca é a mais comum.',
    },
    {
      id: 'p16-4',
      enunciado: 'Um programa sorteia cem números e conta as frequências. O que dá para conferir nesse resultado?',
      alternativas: [
        'A face que mais saiu, porque ela é sempre a mesma em qualquer execução',
        'Nada: dado sorteado não tem como ser conferido de nenhuma forma',
        'O valor exato da primeira face sorteada, desde que o programa seja rápido',
        'A forma: quantos lançamentos, o intervalo dos valores e a soma das contagens',
      ],
      correta: 3,
      explicacao:
        'Valor sorteado muda a cada execução — o que permanece são as garantias: cem lançamentos, valores entre 1 e 6, e as contagens somando o total. É por isso que a conferência dos exercícios com sorteio mede forma e soma, e a dos exercícios com dados fixos mede valor exato. Confundir as duas coisas é o que faz uma correção automática reprovar um programa certo.',
    },
    {
      id: 'p16-5',
      enunciado: 'Neste console, `import matplotlib` falha. O que isso muda no que esta unidade ensina?',
      alternativas: [
        'Nada do que importa: gerar, contar e ler os dados roda aqui, e o desenho fica explicado',
        'Muda tudo: sem a biblioteca, o capítulo inteiro perde o sentido',
        'Muda o resultado das contas, que passam a ser feitas de outra forma',
        'Obriga a escrever o gráfico em outra linguagem dentro do mesmo programa',
      ],
      correta: 0,
      explicacao:
        'A biblioteca de desenho não decide nada sobre os dados: ela recebe listas prontas e pinta. Gerar a caminhada, contar frequências, achar a mais comum, comparar, ordenar — tudo isso é Python puro e roda aqui, com a correção automática olhando o resultado. O que fica fora é a última linha do processo, e ela está declarada em vez de escondida.',
    },
  ],
}
