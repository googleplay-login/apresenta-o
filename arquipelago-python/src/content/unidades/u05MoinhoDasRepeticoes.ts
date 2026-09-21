import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 5 — O Moinho das Repetições.
 * Capítulo 4 do livro: percorrer listas, gerar números e trabalhar com pedaços.
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 */
export const u05MoinhoDasRepeticoes: ConteudoDaUnidade = {
  id: 'u05-moinho-das-repeticoes',

  missao:
    'Ao final desta unidade, você vai percorrer uma lista com `for` sem se preocupar com índices, gerar sequências de números com `range()` e trabalhar com pedaços da lista — inclusive copiando-a de verdade.',

  leitura: {
    parte:
      'Capítulo 4 do livro — as partes sobre percorrer uma lista com `for`, a função `range()`, as estatísticas simples de uma lista de números, as fatias e as tuplas.',
    porque:
      'É o capítulo em que o programa deixa de repetir uma linha escrita à mão para cada item. Ele também mostra duas armadilhas que valem leitura atenta: o último número do `range()` não entra, e o segundo limite da fatia também não.',
    oQueObservar: [
      'O `for` entrega o **item**, e não a posição: o nome depois do `in` é escolhido por você e vale dentro do bloco. Repare que o livro nunca pergunta o índice para imprimir os itens de uma lista.',
      'O recuo do bloco: o que está dentro do laço e o que fica de fora é decidido pela margem. O livro dedica uma seção inteira aos erros de recuo, e vale ler com atenção — é o erro de digitação mais comum de todos.',
      'Os dois limites do `range()` e da fatia: o primeiro entra, o segundo fica de fora. Duas contagens que parecem erradas e estão certas, e que reaparecem em quase todo programa de verdade.',
      'A seção sobre cópia de lista: um nome novo apontando para a mesma lista **não** é uma cópia. O livro mostra a fatia completa como o jeito de copiar de verdade, e é ali que muita gente se queima pela primeira vez.',
    ],
    semOLivro:
      'Sem o livro em mãos, a unidade continua inteira: o diagrama mostra o que o `for` entrega a cada volta, e a explicação cobre `range()`, estatísticas de uma lista de números, fatias, cópia de lista e tuplas. O que o livro acrescenta é a sequência de exercícios sobre recuo, que aqui virou a conferência do seu próprio programa.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Até agora, para mostrar três cores você escreveu três linhas. Com uma lista de cinquenta itens, isso não é programa: é digitação. O `for` percorre a lista de cima para baixo e, a cada volta, entrega o item — sem contagem, sem índice e sem saber quantos itens existem.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Uma linha para cada item, sem escrever uma linha para cada item',
      codigo: 'cores = ["azul", "verde", "amarelo"]\n\nfor cor in cores:\n    print(cor)',
    },
    {
      tipo: 'diagrama',
      titulo: 'O que o for entrega a cada volta',
      descricao:
        'O laço vai descendo a lista e entregando um item por vez, na ordem. Depois da última volta, o nome do laço continua guardando o último item — o que às vezes engana.',
      partes: [
        { rotulo: '1ª volta', valor: 'azul', nota: 'o nome do laço guarda este item enquanto o bloco roda' },
        { rotulo: '2ª volta', valor: 'verde', nota: 'o item anterior é substituído, sem aviso' },
        { rotulo: '3ª volta', valor: 'amarelo', nota: 'último item da lista' },
        { rotulo: 'depois do laço', valor: 'amarelo', nota: 'o nome continua valendo, com o último item' },
      ],
    },
    {
      tipo: 'paragrafo',
      texto:
        'O recuo é o que diz onde o bloco termina. Todo o código indentado abaixo do `for` roda a cada volta; a primeira linha sem recuo fica fora do laço. É por isso que o erro de recuo aparece tanto: o Python não adivinha a sua intenção, ele lê a margem.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Dentro e fora do laço',
      codigo:
        'cores = ["azul", "verde", "amarelo"]\n\nfor cor in cores:\n    print(cor)          # dentro: roda a cada volta\n\nprint("fim")           # fora: roda uma vez, no fim',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Para gerar números em sequência existe `range()`. Ela recebe o começo, o fim e, se você quiser, o passo. O detalhe que confunde no começo: o número final **não** entra na sequência.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'range() com dois e com três argumentos',
      codigo:
        'print(list(range(1, 5)))      # [1, 2, 3, 4]\nprint(list(range(0, 10, 2)))  # [0, 2, 4, 6, 8]\nprint(list(range(5)))         # [0, 1, 2, 3, 4]',
    },
    {
      tipo: 'destaque',
      titulo: 'O segundo número fica de fora',
      texto:
        '`range(1, 5)` não inclui o 5. Para chegar até o 5, o caminho é `range(1, 6)`. A mesma regra vale para a fatia de uma lista, mais adiante: dois limites, e o segundo fica de fora. Guarde isso uma vez e você evita aquele programa que "quase funciona".',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Com uma lista de números, algumas contas já vêm prontas: quantos itens, a soma, o maior e o menor. Elas evitam o laço manual que quase todo mundo escreve na primeira semana.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'As quatro contas que você vai repetir sempre',
      codigo:
        'notas = [7, 9, 6, 8]\n\nprint(len(notas))   # 4  — quantos itens\nprint(sum(notas))   # 30 — a soma\nprint(max(notas))   # 9  — o maior\nprint(min(notas))   # 6  — o menor',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Uma fatia é um pedaço da lista, e se escreve com dois limites separados por dois-pontos. O primeiro limite indica onde o pedaço começa; o segundo, onde ele para — e o item dessa posição **não** entra. Limite ausente quer dizer "até o fim" ou "desde o começo".',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Três fatias, e a mesma regra do segundo limite',
      codigo:
        'letras = ["a", "b", "c", "d", "e"]\n\nprint(letras[1:3])   # [\'b\', \'c\'] — para antes do índice 3\nprint(letras[:2])    # [\'a\', \'b\'] — desde o começo\nprint(letras[-2:])   # [\'d\', \'e\'] — os dois últimos',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Agora a armadilha que vale a unidade: `apelido = original` **não** copia a lista. Ele dá um segundo nome à mesma lista. O jeito de copiar de verdade é pedir uma fatia completa, sem limites.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Um segundo nome e uma cópia de verdade, lado a lado',
      codigo:
        'original = ["a", "b", "c"]\napelido = original\ncopia = original[:]\n\napelido.append("x")\ncopia.append("y")\n\nprint(original)   # [\'a\', \'b\', \'c\', \'x\'] — o apelido mexeu aqui\nprint(copia)      # [\'a\', \'b\', \'c\', \'y\'] — a cópia ficou de fora',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Por último, a tupla: uma coleção ordenada que **não** muda depois de criada. Escreve-se entre parênteses, e tudo que você aprendeu de índice funciona nela — o que não funciona é trocar um item.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Ler uma tupla funciona igual a ler uma lista',
      codigo: 'medidas = (10, 20, 30)\n\nprint(medidas[0])   # 10\nprint(len(medidas)) # 3',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'O que a tupla recusa',
      codigo: 'medidas = (10, 20, 30)\nmedidas[0] = 99',
      naoRodaNoConsole:
        'Este trecho termina em erro de propósito: a tupla recusa a troca de um item, e o `TypeError` que aparece é a explicação. Rode no console e leia a mensagem — ela diz que tuplas não aceitam atribuição por índice, e não que o número 99 está errado.',
    },
    {
      tipo: 'destaque',
      titulo: 'Imutável não quer dizer inútil',
      texto:
        'A tupla serve justamente para o que não deve mudar: um par de coordenadas, uma data, uma configuração fixa. Quando alguém tenta alterar por engano, o programa reclama na hora — em vez de seguir com um valor trocado que ninguém pediu.',
    },
  ],

  pratica: [
    {
      id: 'e5-1',
      enunciado:
        'Crie uma lista chamada `turma` com cinco nomes. Percorra a lista com `for` e imprima cada nome em uma linha. No fim, mostre quantos nomes a turma tem.',
      dica: 'O laço já entrega cada nome; a quantidade vem de `len(turma)`, depois do laço.',
      conferencia: 'Aparecem os cinco nomes, um por linha, e depois o número 5.',
      solucao:
        'turma = ["Ana", "Bia", "Caio", "Duda", "Eva"]\n\nfor nome in turma:\n    print(nome)\n\nprint(len(turma))',
      correcao: {
        valoresEsperados: [
          { rotulo: '`turma` guarda uma lista', expressao: 'turma', tipoEsperado: 'list' },
          { rotulo: 'A lista tem cinco nomes', expressao: 'len(turma)', igualA: '5' },
          { rotulo: 'O primeiro nome aparece na saída', expressao: 'turma[0]', apareceNaSaida: true },
          { rotulo: 'O último nome aparece na saída', expressao: 'turma[-1]', apareceNaSaida: true },
        ],
        estrutura: { linhasNaoVazias: 6 },
        limite:
          'A conferência olha o tipo e o tamanho da lista, procura o primeiro e o último nome na saída e conta seis linhas impressas — os cinco nomes e a quantidade. Ela não sabe quais nomes você escolheu, não confere a ordem das linhas e não exige que o laço tenha sido usado: imprimir os nomes um por um também passa.',
      },
    },
    {
      id: 'e5-2',
      enunciado:
        'Crie uma lista chamada `pares` com os números pares de 2 a 10, usando `range()`. Mostre a lista e, na linha seguinte, a soma desses números. Escreva um comentário no código explicando por que o limite de parada do `range()` é 11, e não 10.',
      dica: '`range()` aceita três argumentos: começo, fim (fora) e passo. O comentário é uma linha começando com `#`.',
      conferencia: 'Aparecem a lista com os cinco pares e, depois, a soma 30.',
      solucao:
        '# O 11 fica de fora, mas o 10 entra: o limite de parada do range nunca é incluído.\npares = list(range(2, 11, 2))\n\nprint(pares)\nprint(sum(pares))',
      correcao: {
        valoresEsperados: [
          { rotulo: '`pares` guarda uma lista', expressao: 'pares', tipoEsperado: 'list' },
          { rotulo: 'São cinco pares', expressao: 'len(pares)', igualA: '5' },
          { rotulo: 'A soma deu 30', expressao: 'sum(pares)', igualA: '30' },
          { rotulo: 'A lista aparece na saída', expressao: 'pares', apareceNaSaida: true },
        ],
        estrutura: { comentario: true },
        limite:
          'A conferência olha o tipo, o tamanho e a soma da lista, procura a lista na saída e confere que existe um comentário no seu código. Ela **não lê** o comentário: não julga se a explicação ficou boa nem se o motivo está certo — quem lê isso é você, e quem quiser conferir de verdade lê o código.',
      },
    },
    {
      id: 'e5-3',
      enunciado:
        'Crie uma lista chamada `precos` com quatro números fora de ordem. Guarde a primeira metade da lista numa variável chamada `metade`, usando uma fatia, e mostre essa fatia. Depois mostre a lista inteira ordenada, sem alterar `precos`, e por último mostre `precos` de novo, para provar que ela continua como estava.',
      dica: 'Fatias usam dois limites e o segundo fica de fora. Para ordenar sem mexer na original, `sorted()`.',
      conferencia:
        'A fatia mostra dois números; a versão ordenada mostra os quatro em ordem crescente; a última linha mostra a lista na ordem em que você a escreveu.',
      solucao:
        'precos = [42, 7, 19, 3]\nmetade = precos[:2]\n\nprint(metade)\nprint(sorted(precos))\nprint(precos)',
      correcao: {
        valoresEsperados: [
          { rotulo: '`precos` guarda uma lista', expressao: 'precos', tipoEsperado: 'list' },
          { rotulo: 'A lista tem quatro números', expressao: 'len(precos)', igualA: '4' },
          { rotulo: '`metade` guarda uma lista', expressao: 'metade', tipoEsperado: 'list' },
          { rotulo: 'A fatia ficou com dois números', expressao: 'len(metade)', igualA: '2' },
          {
            rotulo: 'A lista original continua fora de ordem',
            expressao: 'sorted(precos) == precos',
            igualA: 'False',
          },
          { rotulo: 'A fatia aparece na saída', expressao: 'metade', apareceNaSaida: true },
          {
            rotulo: 'A lista ordenada aparece na saída',
            expressao: 'sorted(precos)',
            apareceNaSaida: true,
          },
          { rotulo: 'A lista original aparece na saída', expressao: 'precos', apareceNaSaida: true },
        ],
        limite:
          'A conferência olha o tamanho das duas listas, confere que a original continua fora de ordem — que é o que denuncia o uso de `.sort()` no lugar de `sorted()` — e procura as três listas na saída. Ela não confere quais números você escolheu nem a ordem das linhas.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p5-1',
      enunciado: 'No laço `for nome in turma:`, o que a variável `nome` contém a cada volta?',
      alternativas: [
        'A posição do item na lista, começando em zero',
        'A lista inteira, para você escolher dentro do bloco qual item quer',
        'O item daquela volta — um dos nomes da lista, sempre na ordem',
        'A quantidade de itens que já passaram pelo laço até aqui',
      ],
      correta: 2,
      explicacao:
        'O `for` desce a lista e entrega o item, não o índice. Quem precisa da posição pede `enumerate()` ou mantém um contador — e quem só quer o item não precisa pensar em contagem nenhuma.',
    },
    {
      id: 'p5-2',
      enunciado: 'Quantos números `list(range(1, 5))` devolve, e quais são eles?',
      alternativas: [
        'Quatro números: 1, 2, 3 e 4',
        'Cinco números, começando em um: 1, 2, 3, 4 e 5',
        'Cinco números, começando em zero: 0, 1, 2, 3 e 4',
        'Quatro números, começando em zero: 0, 1, 2 e 3',
      ],
      correta: 0,
      explicacao:
        'O primeiro limite entra e o segundo fica de fora. Para chegar até o 5 o caminho é `range(1, 6)` — e a mesma regra vale para a fatia de uma lista, logo adiante na unidade.',
    },
    {
      id: 'p5-3',
      enunciado: 'Em `letras = ["a", "b", "c", "d", "e"]`, o que a fatia `letras[-2:]` devolve?',
      alternativas: [
        'Os dois primeiros itens da lista, ou seja `["a", "b"]`',
        'Um erro, porque fatias não aceitam número negativo',
        'A lista inteira, menos o último item dela',
        'Os dois últimos itens da lista, ou seja `["d", "e"]`',
      ],
      correta: 3,
      explicacao:
        'O índice negativo conta do fim e o limite ausente significa "até o fim da lista". É o par mais útil do dia a dia: `[-2:]` são os dois últimos, sejam quantos itens a lista tiver.',
    },
    {
      id: 'p5-4',
      enunciado:
        'Você escreve `apelido = original`, sem fatia e sem cópia. O que acontece depois disso?',
      alternativas: [
        'O Python cria uma cópia, e as duas listas passam a ser independentes',
        'Os dois nomes apontam para a mesma lista, e mexer em um mexe no outro',
        'O nome antigo deixa de valer, e só o nome novo continua funcionando',
        'As duas listas ficam iguais até alguém usar `.append()` em uma delas',
      ],
      correta: 1,
      explicacao:
        'A igualdade entre listas não copia nada: dá um segundo nome ao mesmo objeto. Para copiar de verdade, `original[:]` ou `list(original)` — e é por isso que a fatia completa aparece tanto em código de quem já se queimou com isso.',
    },
    {
      id: 'p5-5',
      enunciado: 'Uma tupla guarda três números. Qual destas operações dá erro no Python?',
      alternativas: [
        'Mostrar o primeiro item: `medidas[0]`',
        'Perguntar o tamanho dela: `len(medidas)`',
        'Trocar um item: `medidas[0] = 99`',
        'Percorrer a tupla com um laço `for`',
      ],
      correta: 2,
      explicacao:
        'A tupla é imutável: dá para ler, percorrer e medir, mas não para trocar um item depois de criada. O `TypeError` desse caso é a mesma proteção que torna a tupla útil — ela não muda por acidente.',
    },
  ],
}
