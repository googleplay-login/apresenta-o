import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 9 — A Oficina das Funções.
 * Capítulo 8 do livro: funções, argumentos, devolver valores e importar módulos.
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 */
export const u09OficinaDasFuncoes: ConteudoDaUnidade = {
  id: 'u09-oficina-das-funcoes',

  missao:
    'Ao final desta unidade, você vai escrever funções com parâmetros, devolver resultados com `return`, usar valores padrão e importar código pronto de outro módulo.',

  leitura: {
    parte:
      'Capítulo 8 do livro — as partes sobre definir funções, passar argumentos, valores padrão, devolver valores, passar listas e importar módulos; e a seção sobre como escrever funções bem formadas.',
    porque:
      'É o capítulo em que o programa deixa de ser uma sequência de linhas e passa a ter peças. Cada peça tem nome, recebe o que precisa e devolve o que produz — e a partir daqui você escreve código que dá para ler em voz alta e entender sem acompanhar linha por linha.',
    oQueObservar: [
      'A palavra `return` no meio do caminho: ela encerra a função na hora, e tudo depois dela naquele bloco não roda. Repare que o livro usa `return` para devolver um valor e não para imprimir.',
      'A diferença entre o **parâmetro** do `def` e o **argumento** da chamada, e as duas formas de chamar: por posição e por palavra-chave. A segunda existe para quem lê o código saber o que cada valor significa sem contar vírgulas.',
      'O lugar dos parâmetros com valor padrão: eles vêm depois dos obrigatórios. O livro mostra o efeito de inverter a ordem — é erro de sintaxe, e é bom ver a mensagem.',
      'A penúltima parte, sobre passar listas: a função recebe a mesma lista, e não uma cópia. Modificar a lista dentro da função modifica a lista de fora, e o livro mostra o cuidado que isso pede.',
    ],
    semOLivro:
      'Sem o livro em mãos, a unidade continua inteira: a explicação cobre a definição, o parâmetro e o argumento, as duas formas de chamada, o valor padrão, o `return` — inclusive a diferença entre devolver e imprimir —, a função que devolve uma estrutura, a lista recebida por referência e a importação de módulos. O que o livro acrescenta são as variações de estilo e o exemplo do módulo escrito por você mesmo.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Enquanto um programa tem dez linhas, ele cabe na cabeça. Quando chega a cem, o problema não é escrever: é **achar**. A função resolve isso dando nome a um pedaço de trabalho. Você escreve o pedaço uma vez, dá um nome a ele e passa a chamar pelo nome — e quem lê o resto do programa entende o que acontece sem precisar abrir a peça.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A definição e a chamada, separadas por um nome',
      codigo:
        'def saudacao(nome):\n    return f"Olá, {nome}!"\n\nprint(saudacao("Ana"))\nprint(saudacao("Bia"))',
    },
    {
      tipo: 'diagrama',
      titulo: 'O que entra na função e o que sai dela',
      descricao:
        'O nome depois do `def` é a porta de entrada. O valor que entra é copiado para o parâmetro, o bloco roda com ele e o `return` devolve o resultado para quem chamou.',
      partes: [
        { rotulo: 'Chamada', valor: 'saudacao("Ana")', nota: 'o argumento é o texto "Ana"' },
        { rotulo: 'Parâmetro', valor: 'nome = "Ana"', nota: 'o parâmetro só existe dentro da função' },
        { rotulo: 'Corpo', valor: 'f"Olá, {nome}!"', nota: 'monta a frase com o valor recebido' },
        { rotulo: 'Devolvido', valor: '"Olá, Ana!"', nota: 'é isso que a chamada vale no resto do programa' },
      ],
    },
    {
      tipo: 'paragrafo',
      texto:
        'Vale fixar os dois nomes, porque eles se confundem para sempre se você não fixar agora: **parâmetro** é o nome que aparece entre parênteses no `def`; **argumento** é o valor que você entrega na chamada. E há duas formas de entregar: pela ordem dos parâmetros, ou dizendo o nome de cada um. A segunda é mais longa e mais clara — em funções com dois ou três parâmetros, quem lê agradece.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A mesma chamada, escrita de duas formas certas',
      codigo:
        'def descrever_pizza(tamanho, cobertura):\n    return f"Uma pizza {tamanho} de {cobertura}."\n\nprint(descrever_pizza("grande", "calabresa"))\nprint(descrever_pizza(tamanho="grande", cobertura="calabresa"))',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Um parâmetro pode ter um valor que já vem pronto, para quando ninguém disser nada na chamada. Esse valor é o **padrão**, e o parâmetro que tem padrão fica no fim da lista: o Python entrega os argumentos por posição, e um parâmetro com padrão na frente dos obrigatórios deixaria a conta ambígua — por isso é erro de sintaxe.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'O padrão entra em cena quando a chamada não diz nada',
      codigo:
        'def descrever_pizza(tamanho, cobertura="queijo"):\n    return f"Uma pizza {tamanho} de {cobertura}."\n\nprint(descrever_pizza("grande"))\nprint(descrever_pizza("grande", "calabresa"))\nprint(descrever_pizza("pequena", cobertura="marguerita"))',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Agora a confusão mais comum do capítulo, e ela não dá erro nenhum: **imprimir** e **devolver** são coisas diferentes. `print()` mostra alguma coisa na tela e devolve nada. `return` entrega um valor para quem chamou. Uma função que imprime em vez de devolver parece funcionar enquanto você só olha a tela — e devolve `None` para todo o resto do programa.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A função que imprime devolve None — e o None aparece',
      codigo:
        'def dobrar(valor):\n    print(valor * 2)\n\nresultado = dobrar(4)\nprint(resultado)   # None: a função mostrou o dobro, mas não devolveu',
    },
    {
      tipo: 'destaque',
      titulo: 'A pergunta que resolve a dúvida',
      texto:
        'Antes de escrever o fim de uma função, pergunte: "quem me chamou precisa do resultado?". Se precisa, `return`. Se a função só dá recado na tela, `print` basta — e nesse caso vale escrever o nome dela deixando claro que ela mostra, não calcula. Um nome como `mostrar_media` diz as duas coisas de uma vez.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Uma função pode devolver qualquer coisa, inclusive estruturas prontas. Devolver um dicionário é um hábito que economiza parágrafos: em vez de devolver cinco valores em ordem — e depender de quem chama lembrar a ordem —, a função devolve valores com nome.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Devolver um dicionário em vez de uma fila de valores',
      codigo:
        'def criar_pessoa(nome, idade):\n    return {"nome": nome, "idade": idade}\n\npessoa = criar_pessoa("Ana", 34)\nprint(pessoa["nome"])\nprint(pessoa["idade"])',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Quando o argumento é uma lista, a função recebe **a mesma lista**, e não uma cópia. Isso é útil — uma função pode organizar a lista de quem chamou — e perigoso — ela também pode esvaziar ou bagunçar sem avisar. Se a função não deve alterar o que recebeu, passe uma cópia, com a fatia completa que você já conhece: `media(notas[:])`.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A mesma lista, vista por dentro e por fora da função',
      codigo:
        'def guardar(convidados):\n    convidados.append("Zoe")\n\nnomes = ["Ana", "Bia"]\nguardar(nomes)\nprint(nomes)   # [\'Ana\', \'Bia\', \'Zoe\'] — a lista de fora mudou',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Por último, a parte que multiplica o que você consegue fazer: **importar**. Ninguém escreve tudo. O Python vem com uma biblioteca grande, e a linha `import` traz um módulo inteiro para perto de você. Existe também a forma que traz só uma peça — `from math import sqrt` —, e o apelido, com `as`.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Três formas de importar, e a diferença entre elas',
      codigo:
        'import math\nfrom random import choice\nfrom math import sqrt as raiz\n\nprint(math.sqrt(16))\nprint(raiz(81))\ncores = ["azul", "verde", "amarelo"]\nprint(choice(cores))',
    },
    {
      tipo: 'destaque',
      titulo: 'Nomes de função que já explicam o que ela faz',
      texto:
        'A convenção do Python é clara para essa parte: nome de função em minúsculas, com palavras separadas por sublinhado — `calcular_media`, `mostrar_tamanho`. O nome deve dizer o que a função faz, e não como ela faz. Se você não consegue dar um nome curto, geralmente é sinal de que a função está fazendo duas coisas, e o caminho é dividir em duas.',
    },
  ],

  pratica: [
    {
      id: 'e9-1',
      enunciado:
        'Escreva uma função chamada `saudacao` que receba um nome e **devolva** a frase `Olá, <nome>!`. Chame a função duas vezes, com dois nomes diferentes, e mostre as duas frases.',
      dica: 'O `return` vai dentro da função, e quem imprime é o `print` de fora. A frase é montada com f-string.',
      conferencia: 'Aparecem duas linhas, uma para cada nome, no formato `Olá, Ana!`.',
      solucao:
        'def saudacao(nome):\n    return f"Olá, {nome}!"\n\nprint(saudacao("Ana"))\nprint(saudacao("Bia"))',
      correcao: {
        saidaEsperada: ['Olá, Ana!', 'Olá, Bia!'],
        valoresEsperados: [
          {
            rotulo: 'A função devolve a frase pedida, com o nome recebido',
            expressao: 'saudacao("Ana")',
            igualA: "'Olá, Ana!'",
          },
          {
            rotulo: 'A função devolve um texto, e não outra coisa',
            expressao: 'saudacao("Bia")',
            tipoEsperado: 'str',
          },
        ],
        estrutura: { linhasNaoVazias: 2 },
        limite:
          'A conferência chama a sua função com dois nomes e compara o que ela **devolve** com a frase do enunciado, exatamente como está escrita ali. Ela não julga se você usou f-string ou concatenação, e não exige o nome do parâmetro — a chamada é por posição. Mas ela mostra `None` no lugar da frase quando a função só imprime em vez de devolver: quem precisa do valor é quem chamou.',
      },
    },
    {
      id: 'e9-2',
      enunciado:
        'Escreva uma função chamada `media` que receba uma lista de notas e devolva a média. Chame a função com as notas `[7, 9, 5]` e depois com `[10, 10, 8, 8]`, mostrando as duas médias.',
      dica: 'A média é a soma dividida pela quantidade. `sum()` e `len()` resolvem as duas contas, e a divisão com `/` devolve número com casas decimais.',
      conferencia: 'Aparecem as médias 7.0 e 9.0.',
      solucao:
        'def media(notas):\n    return sum(notas) / len(notas)\n\nprint(f"Média: {media([7, 9, 5])}")\nprint(f"Média: {media([10, 10, 8, 8])}")',
      correcao: {
        saidaEsperada: ['Média: 7.0', 'Média: 9.0'],
        valoresEsperados: [
          {
            rotulo: 'A média das três notas é 7.0',
            expressao: 'media([7, 9, 5])',
            igualA: '7.0',
          },
          {
            rotulo: 'Outra lista dá outra média: 4.0',
            expressao: 'media([4, 4])',
            igualA: '4.0',
          },
          {
            rotulo: 'A função devolve número com casas decimais, e não texto',
            expressao: 'media([1, 2])',
            tipoEsperado: 'float',
          },
        ],
        estrutura: { linhasNaoVazias: 2 },
        limite:
          'A conferência chama a sua função com três listas diferentes e olha o que ela devolve — inclusive o tipo, para 7.0 não passar como o texto "7.0". Ela não confere como a conta foi escrita: somar com um laço e dividir chega ao mesmo resultado, e a segunda chamada pode ser com a lista escrita na hora ou guardada numa variável.',
      },
    },
    {
      id: 'e9-3',
      enunciado:
        'Escreva uma função `descrever_pizza` que receba o tamanho e a cobertura, sendo `"queijo"` a cobertura padrão, e devolva uma frase sobre a pizza. Chame a função duas vezes: uma só com o tamanho, e outra dizendo também a cobertura.',
      dica: 'O parâmetro com valor padrão vem depois do obrigatório, e a chamada pode usar o nome do parâmetro para deixar claro o que é cada valor.',
      conferencia:
        'Aparecem duas frases: a primeira fala de queijo, a segunda da cobertura que você escolheu.',
      solucao:
        'def descrever_pizza(tamanho, cobertura="queijo"):\n    return f"Uma pizza {tamanho} de {cobertura}."\n\nprint(descrever_pizza("grande"))\nprint(descrever_pizza("média", "calabresa"))',
      correcao: {
        valoresEsperados: [
          {
            rotulo: 'Sem a cobertura, a função usa o padrão queijo',
            expressao: '"queijo" in descrever_pizza("grande")',
            igualA: 'True',
          },
          {
            rotulo: 'Com a cobertura dita, ela usa o que foi pedido',
            expressao: '"calabresa" in descrever_pizza("grande", "calabresa")',
            igualA: 'True',
          },
          {
            rotulo: 'A função devolve um texto',
            expressao: 'descrever_pizza("pequena")',
            tipoEsperado: 'str',
          },
          {
            rotulo: 'A frase devolvida aparece na tela',
            expressao: 'descrever_pizza("grande")',
            apareceNaSaida: true,
          },
        ],
        estrutura: { linhasNaoVazias: 2 },
        limite:
          'A conferência chama a sua função de três jeitos — com um argumento, com dois e com um de novo — e exige que a cobertura padrão seja o queijo. Ela não confere as palavras exatas da sua frase: para isso olha se o que a função devolveu apareceu na tela. Ela também não exige o nome do segundo parâmetro, porque as chamadas são por posição.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p9-1',
      enunciado: 'Qual é a diferença entre parâmetro e argumento?',
      alternativas: [
        'O argumento é o valor que a função devolve; o parâmetro é o nome dele',
        'O parâmetro é o nome no `def`; o argumento é o valor da chamada',
        'Os dois são a mesma coisa, e o nome muda conforme o livro que você lê',
        'O parâmetro existe só nas funções sem `return`; o argumento nas demais',
      ],
      correta: 1,
      explicacao:
        'O parâmetro é a caixa declarada na definição — `def saudacao(nome)` —, e o argumento é o valor colocado dentro dela numa chamada — `saudacao("Ana")`. A mesma função pode ser chamada com argumentos diferentes quantas vezes você quiser.',
    },
    {
      id: 'p9-2',
      enunciado: 'Uma função que só imprime uma frase, sem `return`, o que devolve para quem a chamou?',
      alternativas: [
        'A frase impressa, como se tivesse devolvido o texto',
        'Uma cópia da linha que apareceu na tela do programa',
        'Um erro, porque toda função precisa devolver algum valor',
        'Nada, e quem recebe o resultado guarda o valor `None`',
      ],
      correta: 3,
      explicacao:
        'Sem `return`, a função devolve `None`. A frase existe na tela e em lugar nenhum além dela: `resultado = funcao()` guarda `None`, e é aí que a confusão entre imprimir e devolver aparece — sem nenhuma mensagem de erro para ajudar.',
    },
    {
      id: 'p9-3',
      enunciado:
        'Com `def descrever_pizza(tamanho, cobertura="queijo")`, o que a chamada `descrever_pizza("grande")` faz?',
      alternativas: [
        'Usa `"queijo"` como cobertura, porque a chamada não disse outra coisa',
        'Deixa `cobertura` vazia, e a frase sai com um espaço no lugar dela',
        'Dá erro, porque a função esperava dois argumentos e recebeu um',
        'Usa o primeiro valor da chamada como cobertura e ignora o tamanho',
      ],
      correta: 0,
      explicacao:
        'O valor padrão existe justamente para isso: quando a chamada não diz nada, o padrão entra. E o parâmetro com padrão fica no fim da lista por isso — assim a ordem dos obrigatórios continua sem ambiguidade.',
    },
    {
      id: 'p9-4',
      enunciado:
        'O que acontece ao chamar `montar(nome="Ana")` quando a função foi definida como `def montar(nome, idade):`?',
      alternativas: [
        'A função roda com `idade` valendo zero, como em outras linguagens',
        'A função roda, e a idade fica indefinida até alguém atribuir',
        'O programa para com `TypeError`, dizendo que falta o argumento `idade`',
        'A função roda duas vezes, uma para cada parâmetro que ela espera',
      ],
      correta: 2,
      explicacao:
        'Argumento com palavra-chave não dispensa os obrigatórios: ele só diz qual parâmetro está recebendo aquele valor. Sem `idade` e sem valor padrão para ela, o Python recusa a chamada e diz exatamente qual argumento faltou.',
    },
    {
      id: 'p9-5',
      enunciado:
        'Por que o parâmetro com valor padrão precisa vir depois dos parâmetros obrigatórios?',
      alternativas: [
        'Porque o Python lê os argumentos da chamada da direita para a esquerda',
        'Porque o valor padrão ocupa memória desde o começo, e a ordem muda o consumo',
        'Porque a função precisa saber o tamanho da lista de parâmetros antes de rodar',
        'Porque o padrão só vale quando a chamada não diz nada, e a posição precisa ficar clara',
      ],
      correta: 3,
      explicacao:
        'Com um parâmetro que pode ficar sem valor no meio da lista, não haveria como saber se o segundo argumento era o dele ou o do seguinte. A regra é a mesma que torna a chamada legível: obrigatórios primeiro, padrões depois.',
    },
  ],
}
