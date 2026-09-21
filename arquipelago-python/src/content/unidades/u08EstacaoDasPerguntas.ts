import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 8 — A Estação das Perguntas.
 * Capítulo 7 do livro: entrada de dados pelo teclado e laços `while`.
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 *
 * Aviso que o conteúdo dá de si mesmo: o console da ilha **não tem teclado**.
 * Todo trecho com `input()` está marcado como "não roda no console", com a
 * alternativa escrita ao lado — trocar a linha do `input()` por um valor direto.
 * O laço `while`, que é a outra metade do capítulo, roda inteiro.
 */
export const u08EstacaoDasPerguntas: ConteudoDaUnidade = {
  id: 'u08-estacao-das-perguntas',

  missao:
    'Ao final desta unidade, você vai fazer o programa perguntar e esperar uma resposta, converter o que veio do teclado e repetir um trecho enquanto uma condição for verdadeira — sem cair em laço infinito.',

  leitura: {
    parte:
      'Capítulo 7 do livro — as partes sobre a função `input()`, sobre converter o que foi digitado e sobre os laços `while`, com as seções de `break`, `continue` e uso de `while` com listas.',
    porque:
      'Até aqui, todo programa rodou do começo ao fim sem parar. Este capítulo ensina as duas primeiras formas de o programa decidir o próprio caminho em tempo de execução: esperar uma resposta de quem usa e repetir enquanto fizer sentido. É também o capítulo em que aparece o único erro que não dá mensagem de erro — o laço que nunca termina.',
    oQueObservar: [
      'A função `input()` para o programa e devolve o que foi digitado — sempre como **texto**, mesmo que a pessoa digite um número. Repare no livro que a conversão para número é um passo separado, com `int()` ou `float()`.',
      'O texto entre parênteses do `input()` é o convite que aparece na tela. O livro sempre escreve um convite útil, e não uma linha vazia: é a diferença entre um programa que conversa e um programa que espera calado.',
      'A ordem do `while`: a condição é conferida **antes** de cada volta, e o corpo do laço é quem muda a condição. Vale ler olhando para o que muda dentro do bloco — é ali que o laço decide se continua ou para.',
      'As seções de `break` e de `while` com listas: o livro usa os dois para sair de um laço por dentro e para esvaziar uma lista item por item, que são os dois padrões que você vai repetir para o resto da vida.',
    ],
    semOLivro:
      'Sem o livro em mãos, a unidade continua inteira: a explicação mostra o `input()` e a conversão do que ele devolve, o `while` com contador, a diferença entre parar pela condição e parar com `break`, e o `while` que esvazia uma lista. O que o livro acrescenta são as variações de menu e de lista com remoção — que são combinações destas mesmas peças.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Todos os programas até aqui sabiam tudo de antemão: os valores estavam escritos no código. `input()` muda isso. Quando o programa chega nessa linha, ele para e espera — a luz fica acesa até alguém responder. O que a função devolve é o que a pessoa digitou.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'O programa pergunta, espera e usa a resposta',
      codigo:
        'nome = input("Qual é o seu nome? ")\nprint(f"Olá, {nome}!")',
      naoRodaNoConsole:
        'O console da ilha não tem teclado para o programa ler: o `input()` ficaria esperando uma resposta que nunca chega. Para rodar este trecho aqui, troque a primeira linha por `nome = "Ana"` — o resto do programa é o mesmo, e o resultado é o que você veria digitando.',
    },
    {
      tipo: 'destaque',
      titulo: 'O que fazer quando o console não tem teclado',
      texto:
        'Nesta ilha, trechos com `input()` aparecem com uma alternativa escrita ao lado, e ela é sempre a mesma ideia: onde haveria uma pergunta, escreva o valor direto no código. O programa perde a conversa e ganha a possibilidade de rodar aqui — e o que se aprende é exatamente o mesmo, porque o `input()` não faz nada além de devolver texto. No seu computador, com o Python instalado, rode o trecho original e digite a resposta.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Existe um detalhe em `input()` que causa mais confusão do que qualquer outro: ele devolve **texto**, sempre. Se a pessoa digitar 34, o programa recebe os caracteres `"34"` — e `"34"` não é o número 34. Somar 1 a isso não dá 35; dá erro. Para tratar a resposta como número, converta na hora de guardar.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A resposta vem como texto: a conversão é um passo seu',
      codigo: 'idade = int(input("Qual é a sua idade? "))\nprint(idade + 1)',
      naoRodaNoConsole:
        'Sem teclado, o `input()` não roda aqui. A versão que roda é `idade = int("34")`: o texto entre aspas faz o papel do que teria sido digitado, e o resto da linha é igual.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A conversão sozinha, que é o que este trecho ensina',
      codigo:
        'digitado = "34"\nidade = int(digitado)\n\nprint(idade + 1)     # 35\nprint(digitado + "1") # 341 — texto com texto só junta',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'O que acontece quando o texto não é um número',
      codigo: 'preco = int("doze reais")',
      naoRodaNoConsole:
        'Este trecho termina em erro de propósito: `ValueError` é a resposta do Python para um texto que não é número. Rode no console e leia a mensagem — ela mostra o texto que não pôde ser convertido, e é por isso que existe a conversão separada da pergunta.',
    },
    {
      tipo: 'avisoDeVersao',
      titulo: 'No Python 2, a função tinha outro nome',
      texto:
        'O livro também fala do Python 2.7, em que `input()` interpretava o que era digitado e `raw_input()` devolvia texto. Hoje existe só o segundo comportamento, com o nome do primeiro: `input()` devolve sempre texto. Se você encontrar `raw_input()` em algum código antigo, é a mesma função com o nome velho.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'O `while` repete um bloco **enquanto** uma condição for verdadeira. A condição é conferida antes de cada volta; se já for falsa na primeira, o bloco não roda nenhuma vez. E é por isso que todo `while` precisa de alguém mudando algo dentro dele: se nada muda, a condição continua verdadeira e o programa nunca sai dali.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'O contador que muda dentro do laço — a peça que faz o laço terminar',
      codigo:
        'contador = 1\n\nwhile contador <= 5:\n    print(contador)\n    contador = contador + 1\n\nprint("fim")',
    },
    {
      tipo: 'diagrama',
      titulo: 'A condição é conferida antes de cada volta',
      descricao:
        'O caminho de um `while` que conta de 1 a 5: a mesma pergunta é feita toda vez, e a resposta decide se o bloco roda de novo. Quando a resposta muda para falso, o programa segue depois do laço.',
      partes: [
        { rotulo: 'Antes da 1ª volta', valor: 'contador = 1', nota: '1 é menor ou igual a 5: entra' },
        { rotulo: 'Antes da 5ª volta', valor: 'contador = 5', nota: 'ainda entra, e imprime o 5' },
        { rotulo: 'Depois do bloco', valor: 'contador = 6', nota: 'é a linha de dentro que muda a condição' },
        { rotulo: 'Antes da 6ª volta', valor: 'contador = 6', nota: '6 não é menor ou igual a 5: o laço termina' },
      ],
    },
    {
      tipo: 'paragrafo',
      texto:
        'Duas palavras mudam o caminho por dentro do laço. `break` sai na hora, sem conferir mais nada. `continue` volta para o começo e confere a condição de novo, sem terminar a volta atual. Os dois têm uso legítimo, mas os dois também escondem a decisão: quem lê precisa procurar dentro do bloco para saber quando o laço termina. Um laço que para pela condição é mais fácil de ler.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Parar por dentro, com break',
      codigo:
        'contador = 0\n\nwhile True:\n    contador = contador + 1\n    if contador == 3:\n        break\n    print(contador)\n\nprint("saiu com", contador)',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Com listas, o `while` aparece em um padrão que vale memorizar: esvaziar a lista item por item, usando `pop()` — que tira o último e devolve o que tirou. A condição é a própria lista: enquanto ela tiver algo dentro, continue.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A lista como condição do laço',
      codigo:
        'convidados = ["Ana", "Bia", "Caio"]\n\nwhile convidados:\n    nome = convidados.pop()\n    print(nome)\n\nprint(len(convidados))   # 0 — a lista ficou vazia',
    },
    {
      tipo: 'destaque',
      titulo: 'O único erro que não dá mensagem de erro',
      texto:
        'Um laço infinito não quebra o programa: ele simplesmente nunca acaba, e a tela fica parada. É o único erro de programação que não avisa. Se o seu programa travar, procure o `while` e pergunte o que, dentro do bloco, muda a condição. No console desta ilha, um programa que passe de quinze segundos sem responder faz a tela avisar, com o botão *Recomeçar do zero* — porque um laço infinito não tem como ser interrompido por dentro.',
    },
  ],

  pratica: [
    {
      id: 'e8-1',
      enunciado:
        'Some os números de 1 a 10 com um laço `while`, guardando o número atual numa variável chamada `contador` e a soma numa variável chamada `total`. No fim, mostre o valor de `total`.',
      dica: 'Antes do laço, `total` começa em zero e `contador` em um. Dentro do laço, some o número ao total e depois passe para o próximo.',
      conferencia: 'Aparece 55 — a soma de 1 até 10.',
      solucao:
        'contador = 1\ntotal = 0\n\nwhile contador <= 10:\n    total = total + contador\n    contador = contador + 1\n\nprint(total)',
      correcao: {
        saidaEsperada: ['55'],
        valoresEsperados: [
          { rotulo: '`total` guarda a soma certa', expressao: 'total', igualA: '55' },
          {
            rotulo: 'O contador parou logo depois do 10',
            expressao: 'contador',
            igualA: '11',
          },
        ],
        estrutura: { linhasNaoVazias: 1 },
        limite:
          'A conferência olha o valor guardado em `total` e em `contador` e procura a soma na saída. O contador terminar em 11 é o esperado: é a primeira vez que a condição falhou, e é isso que faz o laço parar. Ela não vê como você escreveu o laço — um `for` com `range()` chega ao mesmo resultado — e não julga a ordem das somas.',
      },
    },
    {
      id: 'e8-2',
      enunciado:
        'Pergunte um número e mostre a tabuada dele de 1 a 5, uma linha por multiplicação, usando um `while`. Como o console da ilha não tem teclado, troque a primeira linha por `tabuada = 7` para rodar aqui — no seu computador, use `input()` e escolha qualquer número.',
      dica: 'Guarde o número, um contador começando em 1, e multiplique os dois dentro do laço, mostrando o resultado em cada volta.',
      conferencia:
        'Com `tabuada = 7`, aparecem cinco linhas: de `7 x 1 = 7` até `7 x 5 = 35`.',
      solucao:
        'tabuada = int(input("Qual tabuada? "))\ncontador = 1\n\nwhile contador <= 5:\n    print(f"{tabuada} x {contador} = {tabuada * contador}")\n    contador = contador + 1',
      naoRodaNoConsole:
        'Este exercício pede um número pelo teclado, e o console da ilha não tem teclado: o `input()` ficaria esperando para sempre. Troque a primeira linha por `tabuada = 7` e rode o resto igual — a multiplicação e o laço são os mesmos.',
      solucaoQueRodaNoConsole:
        'tabuada = 7\ncontador = 1\n\nwhile contador <= 5:\n    print(f"{tabuada} x {contador} = {tabuada * contador}")\n    contador = contador + 1',
      correcao: {
        saidaEsperada: ['7 x 1 = 7', '7 x 5 = 35'],
        valoresEsperados: [
          { rotulo: '`tabuada` guarda o número inteiro do exercício', expressao: 'tabuada', igualA: '7' },
          {
            rotulo: 'O contador parou logo depois do 5',
            expressao: 'contador',
            igualA: '6',
          },
        ],
        estrutura: { linhasNaoVazias: 5 },
        limite:
          'A conferência procura a primeira e a última linha da tabuada do 7 na saída, olha os valores guardados em `tabuada` e `contador` e conta cinco linhas impressas. Ela não confere as linhas do meio nem o formato do texto: `7 x 2 = 14` e `7 * 2 = 14` passam os dois. No seu computador, com `input()`, ela não tem como saber que número você escolheu — é por isso que aqui o exercício fixa o 7.',
      },
    },
    {
      id: 'e8-3',
      enunciado:
        'Crie a lista `convidados` com três nomes. Use um `while` que tire um nome por vez com `pop()` e imprima esse nome. Depois do laço, mostre `len(convidados)`.',
      dica: 'A condição do laço pode ser a própria lista: enquanto ela tiver itens, o `while` continua. `pop()` tira o último item e devolve o que tirou.',
      conferencia:
        'Aparecem os três nomes, um por linha, na ordem inversa da lista, e depois o número 0.',
      solucao:
        'convidados = ["Ana", "Bia", "Caio"]\n\nwhile convidados:\n    nome = convidados.pop()\n    print(nome)\n\nprint(len(convidados))',
      correcao: {
        saidaEsperada: ['0'],
        valoresEsperados: [
          {
            rotulo: 'A lista ficou vazia depois do laço',
            expressao: 'convidados',
            igualA: '[]',
          },
        ],
        estrutura: { linhasNaoVazias: 4 },
        limite:
          'A conferência olha a lista depois do laço — ela precisa estar vazia — e conta quatro linhas impressas: os três nomes e o zero. Ela não sabe quais nomes você escolheu nem a ordem em que apareceram, e não confere se você usou `pop()`: remover com `remove()` e um `for` chega ao mesmo resultado, com outro caminho.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p8-1',
      enunciado: 'Uma pessoa digita `34` quando o programa chama `input()`. O que o programa recebe?',
      alternativas: [
        'O número inteiro 34, pronto para somar com outros números',
        'O texto `"34"`, que só vira número depois de uma conversão',
        'Um erro, porque o teclado sempre devolve texto e números não valem',
        'O valor `None`, até que a conversão seja feita com `int()`',
      ],
      correta: 1,
      explicacao:
        '`input()` devolve sempre texto, e o texto `"34"` não é o número 34. Somar 1 a ele dá erro, e é para isso que existe `int()`. O livro mostra a conversão como um passo separado da pergunta, e não como detalhe.',
    },
    {
      id: 'p8-2',
      enunciado: 'Em `while contador <= 5:`, quando a condição é conferida?',
      alternativas: [
        'Uma vez só, antes do laço começar, e nunca mais',
        'Depois que o bloco de dentro termina de rodar inteiro',
        'Antes de cada volta e, se já for falsa, o bloco não roda',
        'Somente quando o programa encontra um `break` no caminho',
      ],
      correta: 2,
      explicacao:
        'A pergunta é feita antes de cada volta, inclusive antes da primeira. Se ela já for falsa na chegada, o bloco não roda nenhuma vez — e é por isso que o corpo do laço precisa mudar algo: quem muda a resposta é o que está dentro.',
    },
    {
      id: 'p8-3',
      enunciado: 'O que `break` faz dentro de um laço `while`?',
      alternativas: [
        'Sai do laço na hora, sem conferir a condição de novo',
        'Volta para o começo do laço, sem terminar a volta atual',
        'Encerra o programa inteiro, como se tivesse chegado ao fim',
        'Pula a próxima volta, continuando a atual até o fim',
      ],
      correta: 0,
      explicacao:
        '`break` interrompe o laço ali mesmo. Quem volta para o começo é `continue`. Os dois funcionam, e os dois escondem a decisão dentro do bloco: quando der, prefira escrever a condição no `while`.',
    },
    {
      id: 'p8-4',
      enunciado: 'Um `while` roda para sempre, sem nunca dar mensagem de erro. Qual é a causa mais comum?',
      alternativas: [
        'O interpretador do Python não sabe contar voltas de laço',
        'O bloco de dentro imprime algo a cada volta, e isso trava a tela',
        'A lista usada no laço ficou vazia antes de o `while` começar',
        'A condição nunca muda para falso, porque nada dentro do bloco a altera',
      ],
      correta: 3,
      explicacao:
        'Laço infinito é o único erro que não avisa: o programa continua fazendo a mesma coisa. O conserto é sempre o mesmo — encontrar, dentro do bloco, a linha que deveria mudar a condição, e conferir por que ela não está mudando.',
    },
    {
      id: 'p8-5',
      enunciado:
        'Com a lista `convidados = ["Ana", "Bia"]`, o que a condição `while convidados:` pergunta?',
      alternativas: [
        'Se a lista existe, mesmo que esteja vazia',
        'Se a lista ainda tem algum item dentro dela',
        'Se o primeiro item da lista não é uma string vazia',
        'Se a lista é do mesmo tipo declarado na criação',
      ],
      correta: 1,
      explicacao:
        'Uma lista vazia vale como falso, e uma lista com itens vale como verdadeiro. Por isso `while convidados:` é a forma curta de dizer "enquanto ainda houver convidados" — e por isso o laço termina sozinho quando o último item sai.',
    },
  ],
}
