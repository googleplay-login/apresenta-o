import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 12 — A Balança dos Testes.
 * Capítulo 11 do livro: testar o próprio código, com `unittest`.
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 *
 * Este capítulo é o que mais depende de medição antes de ser escrito, porque o
 * que roda aqui **não** é o que o livro manda rodar: medido no Pyodide deste
 * projeto (ver D-059), `unittest.main()` informa "Ran 0 tests" no console, e
 * `pytest` nem está instalado. O que roda é `assert` e a classe `TestCase`
 * conduzida pelo `TextTestRunner` — e é isso que os exemplos usam, com o motivo
 * escrito na tela em vez de escondido.
 */
export const u12BalancaDosTestes: ConteudoDaUnidade = {
  id: 'u12-balanca-dos-testes',

  missao:
    'Ao final desta unidade, você vai escrever testes para o seu próprio código: um `assert` para o caso simples, uma classe `TestCase` com dois testes para uma função, e a perceber por que um teste que passa não prova que o programa está certo.',

  leitura: {
    parte:
      'Capítulo 11 do livro — as partes sobre testar uma função, o que um caso de teste verifica, asserções de `unittest` e o que fazer quando um teste falha.',
    porque:
      'É o capítulo em que o programa passa a ter quem o defenda de você mesmo. Nas unidades anteriores, conferir se o código funcionava dependia de lembrar de todos os casos e testá-los na mão, um por um — e bastava esquecer um caso para o erro passar. Escrever o teste é escrever a lista dos casos que importam, e deixar a máquina conferir os outros.',
    oQueObservar: [
      'Onde o livro coloca o teste em relação ao código: ele escreve a função, escreve os testes e só então roda. Repare que o teste não mostra nada — ele **compara**, e só se queixa quando a comparação falha.',
      'A asserção: cada método que começa com `assert` é uma frase do tipo "isto tem de ser igual àquilo". `assertEqual` é a mais comum, e o nome dela já diz o que ela confere.',
      'O que aparece quando um teste falha: o livro mostra a mensagem com o que era esperado e o que veio. Essa mensagem é o motivo de existir teste — sem ela, você só saberia que algo deu errado.',
      'O nome que o livro dá a cada teste. Um nome bom diz o que aquele teste garante, e é o que você lê primeiro quando uma dúzia de testes falha de uma vez.',
    ],
    semOLivro:
      'Sem o livro em mãos, a unidade continua inteira: a explicação cobre o que é um teste, o `assert` com mensagem, a classe `TestCase` com `assertEqual`, o que a mensagem de falha mostra, e o limite do que um teste prova. O que o livro acrescenta é a prática — a função de nomes que ele testa no capítulo inteiro, os casos que ele escolhe testar e a leitura da saída de um teste que falhou de propósito.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Nas unidades anteriores, quem conferia o programa era você: rodar, olhar a saída, comparar com o que se esperava. Isso funciona até a terceira vez que você mexe no código — e a partir daí começa a custar mais do que parece, porque cada mudança obriga a repetir a conferência inteira na memória. Um teste é essa conferência escrita em código, para ser repetida pela máquina, do mesmo jeito, quantas vezes for preciso.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Uma função, e os casos que ela precisa atender',
      codigo:
        'def dobro(n):\n    return n * 2\n\nassert dobro(4) == 8\nassert dobro(0) == 0\nassert dobro(-3) == -6\n\nprint("os três testes passaram")',
    },
    {
      tipo: 'diagrama',
      titulo: 'O que um teste compara',
      descricao:
        'Todo teste tem o mesmo formato: um valor que veio, um valor que se esperava, e uma comparação. O que muda entre um teste e outro é só o que se compara.',
      partes: [
        {
          rotulo: 'O que se esperava',
          valor: '8',
          nota: 'o resultado que o seu raciocínio diz que a função devolve para 4',
        },
        {
          rotulo: 'O que veio',
          valor: 'dobro(4)',
          nota: 'o que a função devolveu de verdade, quando o teste rodou',
        },
        {
          rotulo: 'A comparação',
          valor: 'assert dobro(4) == 8',
          nota: 'se os dois lados forem iguais, o teste passa em silêncio',
        },
        {
          rotulo: 'Quando não bate',
          valor: 'AssertionError',
          nota: 'o programa para ali e diz qual comparação falhou — é a mensagem que interessa',
        },
      ],
    },
    {
      tipo: 'paragrafo',
      texto:
        'O `assert` é o teste mais simples que existe: uma linha, uma comparação, e uma mensagem opcional depois de vírgula. Ele serve para os casos soltos, e é o que muitas pessoas usam no dia a dia. Quando os testes passam a ser muitos, porém, um por um vira bagunça — e é aí que entra a biblioteca de testes que o livro apresenta: uma classe que junta os testes de uma mesma coisa, e um programa que roda todos e informa quantos passaram.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Os mesmos casos, dentro de uma classe de testes',
      codigo:
        'import unittest\n\ndef dobro(n):\n    return n * 2\n\nclass TesteDobro(unittest.TestCase):\n    def test_numero_positivo(self):\n        self.assertEqual(dobro(4), 8)\n\n    def test_zero(self):\n        self.assertEqual(dobro(0), 0)\n\nsuite = unittest.TestLoader().loadTestsFromTestCase(TesteDobro)\nunittest.TextTestRunner(verbosity=2).run(suite)',
    },
    {
      tipo: 'destaque',
      titulo: 'No console desta ilha, o `unittest` roda com o `TextTestRunner`',
      texto:
        'O livro manda terminar o arquivo de teste com `unittest.main()`, e no seu computador isso funciona. Aqui, não: este console roda cada programa em um espaço de nomes novo, e o `unittest.main()` procura os testes no módulo principal do interpretador — que não é onde o seu código acabou de ser definido. O que aparece é `Ran 0 tests` seguido de `NO TESTS RAN`, sem erro nenhum: a saída diz que nada rodou, e o seu teste simplesmente não foi executado. Medido neste projeto (D-059). As duas linhas do `TextTestRunner` fazem o mesmo trabalho, rodam aqui e ainda mostram o nome de cada teste. Se você rodar o mesmo programa no Python do seu computador, o `unittest.main()` volta a funcionar.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Um teste que passa não prova que o programa está certo — prova que **aquele caso** está certo. `dobro(4)` devolver 8 não diz nada sobre `dobro(0)`, e nada sobre `dobro("4")`. É por isso que a parte mais difícil de testar não é escrever o teste, é escolher os casos: o valor comum, o zero, o negativo, a lista vazia, o número bem grande. Um teste bom é a lista dos casos em que você já errou alguma vez.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Um teste que falha de propósito — e a mensagem que ele dá',
      codigo:
        'import unittest\n\ndef dobro(n):\n    return n * 2\n\nclass TesteDobro(unittest.TestCase):\n    def test_errado_de_proposito(self):\n        self.assertEqual(dobro(4), 9)\n\nsuite = unittest.TestLoader().loadTestsFromTestCase(TesteDobro)\nunittest.TextTestRunner(verbosity=2).run(suite)',
    },
    {
      tipo: 'destaque',
      titulo: 'A linha que interessa quando um teste falha',
      texto:
        'Rodando o teste acima, a saída termina em `AssertionError: 8 != 9`: primeiro o que veio, depois o que se esperava. É essa a mensagem que faz o teste valer a pena — ela diz **qual** comparação falhou e **o que** apareceu no lugar. Repare também na primeira linha: o nome do teste aparece antes do `FAIL`, e é por ele que você sabe onde olhar. O resultado final vem resumido em `FAILED (failures=1)`.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Os casos que costumam quebrar, virados em teste',
      codigo:
        'def media(lista):\n    if not lista:\n        return 0.0\n    return sum(lista) / len(lista)\n\nassert media([10, 10]) == 10.0\nassert media([]) == 0.0\nassert media([1, 2]) == 1.5\n\nprint("os casos-limite passaram")',
    },
    {
      tipo: 'destaque',
      titulo: 'Não existe só o `assertEqual`',
      texto:
        'A classe `TestCase` traz uma asserção para cada tipo de comparação, e cada uma dá uma mensagem melhor do que um `assert` solto daria: `assertEqual` para igualdade, `assertTrue` e `assertFalse` para o que é verdadeiro ou falso, `assertIn` para procurar um item em uma lista ou um trecho em um texto, `assertRaises` para conferir que um erro aconteceu onde ele devia acontecer. Conferido no console desta ilha: essas cinco existem. Escolher a asserção certa é metade do trabalho de escrever um teste legível.',
    },
    {
      tipo: 'avisoDeVersao',
      titulo: 'O livro é de 2015/2016, e a ferramenta de teste mudou de nome',
      texto:
        'Naquela edição, a biblioteca de testes apresentada é o `unittest`, que vem junto com o Python e é a que esta unidade usa. Edições mais novas do mesmo livro falam de `pytest`, que é mais enxuto de escrever e hoje é o mais usado no mercado. O `pytest` **não** está instalado no console desta ilha: ele não vem com o Python, e instalá-lo exigiria baixar um pacote da internet — coisa que este projeto não faz (D-059). O que você aprender aqui com `unittest` e `assert` vale inteiro lá: um teste continua sendo um valor esperado comparado com o valor que veio.',
    },
  ],

  pratica: [
    {
      id: 'e12-1',
      enunciado:
        'Escreva a função `dobro(n)` e três `assert` para ela: um com número positivo, um com o zero e um com número negativo. No fim, mostre `os testes passaram`.',
      dica: 'A função é uma linha. Os testes também: cada `assert` compara `dobro(...)` com o que você espera, e o `print` fica depois dos três.',
      conferencia: 'Aparece `os testes passaram`, e nenhum `AssertionError` interrompe o programa.',
      solucao:
        'def dobro(n):\n    return n * 2\n\nassert dobro(4) == 8\nassert dobro(0) == 0\nassert dobro(-3) == -6\n\nprint("os testes passaram")',
      correcao: {
        saidaEsperada: ['os testes passaram'],
        valoresEsperados: [
          { rotulo: 'A função devolve o dobro de um número positivo', expressao: 'dobro(4)', igualA: '8' },
          { rotulo: 'A função devolve zero para zero', expressao: 'dobro(0)', igualA: '0' },
          { rotulo: 'A função devolve o dobro de um número negativo', expressao: 'dobro(-3)', igualA: '-6' },
        ],
        estrutura: { linhasNaoVazias: 1 },
        limite:
          'A conferência chama a sua função com os três números que o enunciado pede e olha a linha `os testes passaram` na saída. Ela **não** confere quantos `assert` você escreveu, nem se escreveu algum: o que se prova é que a função responde certo aos três casos e que o programa chegou ao fim sem `AssertionError`.',
      },
    },
    {
      id: 'e12-2',
      enunciado:
        'Escreva a função `maior_de_idade(idade)`, que devolve `True` para 18 ou mais e `False` para menos. Depois escreva uma classe de testes com **dois** testes — um que passa uma idade de maior e outro que passa uma idade de menor — e rode a classe com o `TextTestRunner`.',
      dica: 'A classe herda de `unittest.TestCase`, e cada teste é um método cujo nome começa com `test_`. Dentro dele, `self.assertEqual(...)`. Para rodar: `unittest.TestLoader().loadTestsFromTestCase(...)` e `unittest.TextTestRunner(verbosity=2).run(suite)`.',
      conferencia: 'A saída do `unittest` termina em `OK`, e diz que rodou 2 testes.',
      solucao:
        'import unittest\n\ndef maior_de_idade(idade):\n    return idade >= 18\n\nclass TesteMaioridade(unittest.TestCase):\n    def test_dezoito_anos(self):\n        self.assertEqual(maior_de_idade(18), True)\n\n    def test_dezessete_anos(self):\n        self.assertEqual(maior_de_idade(17), False)\n\nsuite = unittest.TestLoader().loadTestsFromTestCase(TesteMaioridade)\nunittest.TextTestRunner(verbosity=2).run(suite)',
      correcao: {
        valoresEsperados: [
          { rotulo: 'A função devolve `True` para quem tem 18 anos', expressao: 'maior_de_idade(18)', igualA: 'True' },
          { rotulo: 'A função devolve `False` para quem tem 17 anos', expressao: 'maior_de_idade(17)', igualA: 'False' },
          {
            rotulo: 'O `unittest` informa que os testes passaram',
            expressao: '"OK"',
            apareceNaSaida: true,
          },
        ],
        limite:
          'A conferência olha a função (nos dois idades do enunciado) e procura o `OK` que o `unittest` imprime quando a classe inteira passa. Ela não confere quantos testes você escreveu dentro da classe, nem os nomes que deu a eles, e não sabe se você rodou a classe com `loadTestsFromTestCase` ou montando a suíte à mão.',
      },
    },
    {
      id: 'e12-3',
      enunciado:
        'Escreva `desconto(preco, percentual=10)`, que devolve o preço já com o desconto aplicado, e três `assert`: preço 100 sem dizer o percentual, preço 50 com 20%, e preço 0. No fim, mostre `tudo conferido`.',
      dica: 'O valor padrão vai na própria definição: `def desconto(preco, percentual=10):`. Cuidado com a conta: o preço final é `preco - preco * percentual / 100`, e com o preço zero o resultado tem de ser `0.0`.',
      conferencia: 'Aparece `tudo conferido`, e os três casos dão 90.0, 40.0 e 0.0.',
      solucao:
        'def desconto(preco, percentual=10):\n    return preco - preco * percentual / 100\n\nassert desconto(100) == 90.0\nassert desconto(50, 20) == 40.0\nassert desconto(0) == 0.0\n\nprint("tudo conferido")',
      correcao: {
        saidaEsperada: ['tudo conferido'],
        valoresEsperados: [
          { rotulo: 'Sem dizer o percentual, o desconto é o padrão do enunciado', expressao: 'desconto(100)', igualA: '90.0' },
          { rotulo: 'Com percentual informado, a função usa o percentual que recebeu', expressao: 'desconto(50, 20)', igualA: '40.0' },
          { rotulo: 'Preço zero dá zero, e não erro', expressao: 'desconto(0)', igualA: '0.0' },
        ],
        estrutura: { linhasNaoVazias: 1 },
        limite:
          'A conferência chama a sua função nos três casos do enunciado e olha a linha `tudo conferido` na saída. Ela não julga como a conta foi escrita — `preco * (1 - percentual / 100)`, `preco - preco * percentual / 100` e outras formas dão no mesmo — e não confere o texto dos seus `assert`.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p12-1',
      enunciado: 'Qual é o trabalho de uma linha como `assert dobro(4) == 8`?',
      alternativas: [
        'Mostrar na tela o resultado da comparação, para o programador conferir com os olhos',
        'Corrigir o valor devolvido pela função, quando a comparação não bate com o esperado',
        'Guardar o valor 8 para que a função possa ser chamada de novo sem responder diferente',
        'Comparar o que a função devolveu com o que se esperava, e interromper o programa quando não bate',
      ],
      correta: 3,
      explicacao:
        'O `assert` afirma uma coisa e cobra o resultado dessa afirmação. Se a comparação bate, ele não mostra nada e o programa segue; se não bate, o programa para ali com `AssertionError`. Não é ele que corrige nada — quem corrige é você, depois de ler a mensagem.',
    },
    {
      id: 'p12-2',
      enunciado: 'Uma função tem todos os testes passando. O que isso prova sobre ela?',
      alternativas: [
        'Que aqueles casos testados estão certos — e nada sobre os casos que ninguém testou',
        'Que a função está correta para qualquer entrada, porque teste é prova matemática',
        'Que a função não tem erro de digitação, já que o Python teria reclamado antes',
        'Que os testes foram escritos pelo próprio autor da função, e por isso são confiáveis',
      ],
      correta: 0,
      explicacao:
        'Teste que passa é evidência sobre os casos que ele cobre, não sobre a função inteira. `dobro(4)` devolver 8 não diz nada sobre `dobro(0)`, `dobro("4")` ou `dobro(4.0)`. É por isso que escolher os casos — zero, negativo, vazio, limite — vale mais do que escrever muitos testes parecidos.',
    },
    {
      id: 'p12-3',
      enunciado: 'Por que o nome de cada teste importa (`test_idade_dezoito_anos` em vez de `teste1`)?',
      alternativas: [
        'Porque o Python recusa nomes de método que não comecem com `test_`',
        'Porque o nome precisa ser diferente do nome de todos os outros métodos do programa',
        'Porque é o nome que aparece na saída quando o teste falha, e é por ele que se sabe o que quebrou',
        'Porque o `unittest` ordena os testes pelo nome, e nomes numerados rodariam fora de ordem',
      ],
      correta: 2,
      explicacao:
        'Quando dez testes falham de uma vez, a primeira coisa que se lê é a lista de nomes. `test_idade_dezoito_anos` já diz o que quebrou; `teste1` obriga a abrir o código e descobrir. O prefixo `test_` existe para o `unittest` achar os testes — é a parte obrigatória do nome, e não o nome inteiro.',
    },
    {
      id: 'p12-4',
      enunciado: 'O que aparece quando um teste escrito com `unittest` falha?',
      alternativas: [
        'Uma linha dizendo apenas `F`, e o programa segue com os testes seguintes em silêncio',
        'A mensagem da asserção, com o que era esperado e o que veio, junto do nome do teste',
        'O código inteiro da função testada, com a linha do erro destacada em vermelho',
        'Nada na tela: a falha fica guardada para ser consultada depois, com outro comando',
      ],
      correta: 1,
      explicacao:
        'A mensagem de falha traz o nome do teste, o que a asserção esperava e o valor que apareceu de verdade. É essa a informação que faz o teste valer a pena: sem ela, você só saberia que algo deu errado, e teria de descobrir o quê caçando o erro na mão — que é exatamente o trabalho que o teste veio economizar.',
    },
    {
      id: 'p12-5',
      enunciado: 'Por que o enunciado de um exercício costuma pedir testes com o zero e com a lista vazia, além do caso comum?',
      alternativas: [
        'Porque o `unittest` não roda o programa se esses casos não estiverem testados',
        'Porque esses casos deixam a saída dos testes mais curta, o que ajuda a ler o resultado',
        'Porque são os casos em que a conta dá zero, e zero é o resultado mais fácil de conferir',
        'Porque é neles que mora a maior parte dos erros, e o caso comum costuma passar sozinho',
      ],
      correta: 3,
      explicacao:
        'Dividir por zero, somar lista vazia, comparar com o limite: é nesses cantos que o programa quebra, e é justamente onde ninguém testa na pressa. O caso comum você já conferiu ao escrever a função; o caso-limite só se descobre escrevendo o teste — e é aí que o teste paga o que custou.',
    },
  ],
}
