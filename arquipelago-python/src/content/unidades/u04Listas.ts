import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 4 — As Listas do Mercado.
 * Capítulo 3 do livro: introdução às listas.
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 */
export const u04Listas: ConteudoDaUnidade = {
  id: 'u04-listas-do-mercado',

  missao:
    'Ao final desta unidade, você vai criar listas, chegar a qualquer item pelo índice, acrescentar e remover coisas e pôr a coleção em ordem — sem se perder na contagem.',

  leitura: {
    parte:
      'Capítulo 3 do livro — as partes sobre listas: acessar elementos, alterar, acrescentar, remover, ordenar, e o erro de índice fora do intervalo.',
    porque:
      'O capítulo inteiro é sobre listas, e o livro insiste em um ponto que vale a pena ler devagar: a diferença entre ordenar a lista de verdade e apenas mostrar uma versão ordenada dela.',
    oQueObservar: [
      'A parte sobre índice negativo: o livro mostra que dá para chegar ao último item sem saber quantos itens a lista tem. É o atalho que você vai usar sempre que escrever código de verdade.',
      'As formas de acrescentar e remover: acrescentar ao fim, inserir no meio, apagar por posição e retirar devolvendo o item. Repare no livro que uma delas *devolve* o item — dá para guardar o que saiu.',
      'O trecho sobre ordenar: uma forma muda a lista, a outra devolve uma cópia ordenada. A mesma distinção reaparece na inversão, e é onde quase todo mundo confunde uma com a outra.',
      'O erro de índice fora do intervalo, com a mensagem que o livro mostra. Ela vai aparecer na sua tela mais cedo ou mais tarde, e reconhecê-la economiza meia hora.',
    ],
    semOLivro:
      'Sem o livro em mãos, esta unidade continua inteira: o diagrama abaixo mostra os índices dos dois lados — contando do começo e contando do fim —, e a explicação cobre criar, acessar, acrescentar, remover e ordenar. O que o livro acrescenta é a repetição com listas maiores, que aqui ficaram de fora para o texto caber numa tela.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Uma lista é uma coleção ordenada de valores. Você escreve entre colchetes, separando os itens por vírgula. Ordenada quer dizer que cada item tem uma posição fixa — e é essa posição que permite chegar a ele.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Criando uma lista e chegando a um item pelo índice',
      codigo:
        'frutas = ["banana", "manga", "uva"]\nprint(frutas[0])    # banana\nprint(frutas[2])    # uva',
    },
    {
      tipo: 'destaque',
      titulo: 'A contagem começa em zero',
      texto:
        'O primeiro item está na posição 0, não na 1. Isso não é capricho: é assim na maioria das linguagens, por razões que vêm de como a memória é endereçada. O efeito prático é que o último índice de uma lista de três itens é 2. Enquanto isso não vira automático, conferir sempre vale a pena.',
    },

    {
      tipo: 'diagrama',
      titulo: 'Os dois sentidos da contagem',
      descricao:
        'A mesma lista lida pelos dois lados: de cima para baixo, começando em 0; de baixo para cima, começando em -1. Duas formas de chegar ao mesmo item — e a segunda não precisa saber o tamanho da lista.',
      partes: [
        { rotulo: '0 e -3', valor: 'banana', nota: 'o primeiro item' },
        { rotulo: '1 e -2', valor: 'manga', nota: 'o item do meio' },
        { rotulo: '2 e -1', valor: 'uva', nota: 'o último, alcance por -1 sem contar nada' },
      ],
    },
    {
      tipo: 'paragrafo',
      texto:
        'O Python aceita índices negativos, contando do fim para o começo. `-1` é o último item, `-2` é o penúltimo. É prático e evita contas quando você quer apenas o fim da lista.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      codigo:
        'frutas = ["banana", "manga", "uva"]\nprint(frutas[-1])    # uva\nprint(frutas[-2])    # manga',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Pedir um índice que não existe dá erro — e o erro tem nome: `IndexError`. A mensagem informa qual índice você pediu e qual era o tamanho da lista, o que normalmente basta para descobrir a conta errada.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      codigo: 'frutas = ["banana", "manga", "uva"]\nprint(frutas[3])',
      naoRodaNoConsole:
        'Este trecho termina em erro de propósito: ele existe para mostrar a mensagem do `IndexError`. Rode no console e leia o que o Python diz — é assim que se aprende a reconhecer erro de índice.',
    },
    {
      tipo: 'codigo',
      linguagem: 'terminal',
      legenda: 'A mensagem, que já diz bastante',
      codigo: 'IndexError: list index out of range',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Uma lista pode mudar depois de criada. Você pode trocar um item pelo índice, acrescentar no fim com `.append()`, acrescentar em qualquer posição com `.insert()` e remover de várias formas.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'As quatro operações que você vai usar todo dia',
      codigo:
        'frutas = ["banana", "manga", "uva"]\n\nfrutas[0] = "pera"          # troca pelo índice\nfrutas.append("abacaxi")      # acrescenta no fim\nfrutas.insert(1, "kiwi")      # acrescenta na posição 1, empurrando o resto\ndel frutas[0]                 # remove pelo índice\nfrutas.remove("uva")          # remove pelo valor\n\nprint(frutas)',
    },
    {
      tipo: 'destaque',
      titulo: 'remover() e pop(): dois jeitos de tirar, com usos diferentes',
      texto:
        '`.pop()` remove pelo índice e **devolve** o item removido, o que permite guardá-lo em outro lugar. `.remove()` remove pelo valor e não devolve nada. Guarde a diferença: quando o programa precisa fazer algo com aquilo que saiu, `pop()` é o caminho.',
    },
    {
      tipo: 'avisoDeVersao',
      titulo: 'Aviso: o livro é de 2016, e isto mudou desde então',
      texto:
        'O livro cita `del` e `.pop()` no mesmo trecho, e está certo para a época e para hoje — ambos continuam funcionando. A diferença é de estilo: hoje é mais comum preferir `.pop()` justamente porque devolve o valor, o que deixa a intenção mais clara para quem lê.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Ordenar tem uma pegadinha que vale a unidade inteira. Existem duas coisas parecidas, e elas fazem coisas diferentes.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A lista de verdade e o rascunho ordenado',
      codigo:
        'numeros = [3, 1, 2]\n\nprint(sorted(numeros))    # [1, 2, 3] — mostra uma cópia ordenada\nprint(numeros)            # [3, 1, 2] — a lista continua como estava\n\nnumeros.sort()            # agora ordena de verdade\nprint(numeros)            # [1, 2, 3]',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Traduzindo: `sorted()` devolve uma versão ordenada e deixa a original em paz. `.sort()` modifica a lista de verdade e não devolve nada aproveitável. Usar `print(numeros.sort())` é um erro clássico: aparece `None` na tela, que é o "nada" do Python.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Mais funções que você vai querer ter à mão',
      codigo:
        'numeros = [3, 1, 2]\nprint(len(numeros))       # 3   — quantos itens\nprint(max(numeros))       # 3   — o maior\nprint(min(numeros))       # 1   — o menor\nprint(sum(numeros))       # 6   — a soma\nnumeros.reverse()         # inverte a ordem\ndel numeros[0]            # remove pelo índice',
    },
  ],

  pratica: [
    {
      id: 'e4-1',
      enunciado:
        'Crie uma lista chamada `cores`, com quatro cores. Mostre a primeira, a última (usando índice negativo) e quantas cores existem.',
      dica: 'A última é `[-1]`. A quantidade vem de `len()`.',
      conferencia: 'Aparecem a primeira cor, a última cor e o número 4.',
      solucao:
        'cores = ["azul", "verde", "amarelo", "vermelho"]\nprint(cores[0])\nprint(cores[-1])\nprint(len(cores))',
      correcao: {
        valoresEsperados: [
          { rotulo: '`cores` guarda uma lista', expressao: 'cores', tipoEsperado: 'list' },
          { rotulo: 'A lista tem quatro cores', expressao: 'len(cores)', igualA: '4' },
          {
            rotulo: 'A primeira cor aparece na saída',
            expressao: 'cores[0]',
            apareceNaSaida: true,
          },
          {
            rotulo: 'A última cor aparece na saída',
            expressao: 'cores[-1]',
            apareceNaSaida: true,
          },
          {
            rotulo: 'A quantidade aparece na saída',
            expressao: 'len(cores)',
            apareceNaSaida: true,
          },
        ],
        limite:
          'A conferência olha o tipo e o tamanho da lista e procura na saída a primeira cor, a última e a quantidade. Ela não sabe quais cores você escolheu e não confere a ordem das linhas.',
      },
    },
    {
      id: 'e4-2',
      enunciado:
        'Comece com uma lista chamada `frutas`, com três frutas. Acrescente uma no fim, insira outra no começo e remova a do meio. Mostre a lista a cada passo.',
      dica: 'Para inserir no começo, `insert(0, ...)`. Para remover pelo valor, `.remove()`.',
      conferencia:
        'Cada etapa mostra a lista com um item a mais ou a menos, sempre na ordem certa.',
      solucao:
        'frutas = ["banana", "manga", "uva"]\nprint(frutas)\nfrutas.append("abacaxi")\nprint(frutas)\nfrutas.insert(0, "kiwi")\nprint(frutas)\nfrutas.remove("manga")\nprint(frutas)',
      correcao: {
        valoresEsperados: [
          { rotulo: '`frutas` guarda uma lista', expressao: 'frutas', tipoEsperado: 'list' },
          { rotulo: 'No fim, a lista tem quatro frutas', expressao: 'len(frutas)', igualA: '4' },
          {
            rotulo: 'A lista aparece na saída',
            expressao: 'frutas',
            apareceNaSaida: true,
          },
        ],
        estrutura: { linhasNaoVazias: 4 },
        limite:
          'A conferência olha a lista quando o programa termina (tipo e tamanho) e conta quatro linhas impressas. Ela não sabe quais frutas você escolheu e não confere a ordem exata dos passos — quem confere isso é você, lendo as quatro linhas.',
      },
    },
    {
      id: 'e4-3',
      enunciado:
        'Crie uma lista chamada `numeros`, com cinco números fora de ordem. Mostre a soma, o maior e o menor, depois mostre a lista ordenada — sem alterar a lista original. Confirme que a original continua fora de ordem.',
      dica: 'Use `sorted()` e não `.sort()`, e imprima a original depois para conferir.',
      conferencia:
        'Depois de mostrar a versão ordenada, imprimir a lista original mostra os números na ordem em que você os escreveu.',
      solucao:
        'numeros = [42, 7, 19, 3, 28]\nprint(sum(numeros))\nprint(max(numeros))\nprint(min(numeros))\nprint(sorted(numeros))\nprint(numeros)   # continua fora de ordem',
      correcao: {
        valoresEsperados: [
          { rotulo: '`numeros` guarda uma lista', expressao: 'numeros', tipoEsperado: 'list' },
          { rotulo: 'A lista tem cinco números', expressao: 'len(numeros)', igualA: '5' },
          {
            rotulo: 'A lista original continua fora de ordem',
            expressao: 'sorted(numeros) == numeros',
            igualA: 'False',
          },
          {
            rotulo: 'A soma aparece na saída',
            expressao: 'sum(numeros)',
            apareceNaSaida: true,
          },
          {
            rotulo: 'O maior aparece na saída',
            expressao: 'max(numeros)',
            apareceNaSaida: true,
          },
          {
            rotulo: 'O menor aparece na saída',
            expressao: 'min(numeros)',
            apareceNaSaida: true,
          },
          {
            rotulo: 'A lista original aparece na saída, ainda fora de ordem',
            expressao: 'numeros',
            apareceNaSaida: true,
          },
        ],
        limite:
          'A conferência olha a lista quando o programa termina — tipo, tamanho e se continua fora de ordem, que é o que denuncia o uso de `.sort()` no lugar de `sorted()` — e confere que a soma, o maior, o menor e a lista original aparecem na saída. Ela não confere a ordem das linhas.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p4-1',
      enunciado: 'Em `frutas = ["banana", "manga", "uva"]`, o que `frutas[1]` devolve?',
      alternativas: ['"manga"', '"banana"', '"uva"', 'Um erro, porque a lista tem três itens'],
      correta: 0,
      explicacao:
        'A contagem começa em zero: o índice 0 é "banana", o 1 é "manga" e o 2 é "uva". É o erro de contagem mais comum de todos, e vale conferir antes de culpar o Python.',
    },
    {
      id: 'p4-2',
      enunciado: 'Qual é a diferença entre `sorted(numeros)` e `numeros.sort()`?',
      alternativas: [
        'Não há diferença nenhuma: os dois ordenam a lista do mesmo jeito',
        '`sorted()` só funciona com números, e o `.sort()` só com textos',
        '`sorted()` devolve uma cópia ordenada; `.sort()` altera a lista',
        '`sorted()` ordena ao contrário, e o `.sort()` ordena na ordem normal',
      ],
      correta: 2,
      explicacao:
        'Como `.sort()` não devolve nada, `print(numeros.sort())` mostra `None` — o "nada" do Python. Já `print(sorted(numeros))` mostra a lista ordenada, sem tocar na original.',
    },
    {
      id: 'p4-3',
      enunciado: 'O que `.pop()` faz com a lista em que é chamado?',
      alternativas: [
        'Remove o item pelo valor que você informa, se ele estiver na lista',
        'Remove o último item e devolve o item removido',
        'Esvazia a lista inteira de uma vez, sem devolver nada',
        'Cria uma cópia da lista original sem o primeiro item dela',
      ],
      correta: 1,
      explicacao:
        'Por padrão ele tira o último item e o devolve, permitindo guardá-lo em outro lugar. Aceita também um índice, como em `pop(0)`. Quando o interesse é só remover pelo valor, `.remove()` é mais direto.',
    },
    {
      id: 'p4-4',
      enunciado:
        'Você tem uma lista de três itens e pede `lista[3]`. O que acontece?',
      alternativas: [
        'Devolve o terceiro item, porque 3 é a posição na contagem comum',
        'Devolve `None`, indicando que não há nada ali',
        'Acrescenta um item vazio na posição 3',
        'Dá `IndexError`, porque os índices válidos vão de 0 a 2',
      ],
      correta: 3,
      explicacao:
        'Pedir posição inexistente é erro, e o Python avisa com `IndexError: list index out of range`. Repare que ele não devolve `None`: confundir "não existe" com "existe e está vazio" esconderia o problema em vez de mostrá-lo.',
    },
    {
      id: 'p4-5',
      enunciado:
        'Qual destas linhas acrescenta "kiwi" na **primeira** posição de uma lista existente, empurrando os outros itens?',
      alternativas: [
        'frutas.insert(0, "kiwi")',
        'frutas.append("kiwi")',
        'frutas[0] = "kiwi"',
        'frutas.add("kiwi", 0)',
      ],
      correta: 0,
      explicacao:
        '`insert(0, ...)` coloca o item na posição indicada e desloca o resto. Atenção à diferença: `frutas[0] = "kiwi"` não acrescenta nada — ele **substitui** o primeiro item, apagando o que estava lá.',
    },
  ],
}
