import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 7 — O Farol dos Registros.
 * Capítulo 6 do livro: dicionários — guardar valores por chave, e não por posição.
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 */
export const u07FarolDosRegistros: ConteudoDaUnidade = {
  id: 'u07-farol-dos-registros',

  missao:
    'Ao final desta unidade, você vai guardar valores por chave, consultar sem quebrar o programa quando a chave não existe e percorrer um dicionário para tratar tudo o que ele guarda.',

  leitura: {
    parte:
      'Capítulo 6 do livro — as partes sobre o que é um dicionário, como usá-lo, percorrê-lo e aninhar estruturas; e a seção sobre o erro de chave inexistente.',
    porque:
      'É o capítulo em que o programa deixa de depender da posição dos itens. Numa lista, o terceiro item é o terceiro; num dicionário, o valor tem nome. Quem lê procurando essa diferença entende de uma vez por que existem as duas estruturas.',
    oQueObservar: [
      'A sintaxe é a mesma da lista, com a chave no lugar do índice: colchetes e, dentro deles, um texto entre aspas. Repare que a chave quase sempre é um texto, e que o valor pode ser qualquer coisa — inclusive outra lista ou outro dicionário.',
      'Duas operações dividem uma linha no livro: acrescentar uma chave nova e alterar o valor de uma chave que já existe usam exatamente a mesma escrita. O Python decide pelo que já está lá, e não por uma instrução diferente.',
      'A seção sobre o erro de chave: pedir uma chave que não existe derruba o programa, e o livro mostra o método que consulta sem derrubar. É a diferença entre perguntar e exigir.',
      'A parte final, sobre aninhamento: lista dentro de dicionário, dicionário dentro de dicionário. É o assunto que volta em todo projeto de verdade, e vale ler devagar.',
    ],
    semOLivro:
      'Sem o livro em mãos, a unidade continua inteira: a explicação cobre o que é um dicionário, as quatro operações básicas, a consulta segura com `.get()`, o modo de percorrer com `.items()`, `.keys()` e `.values()`, e um exemplo de dicionário com listas dentro. O que o livro acrescenta são as variações de aninhamento — e o diagrama desta unidade mostra a estrutura por baixo delas.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Numa lista, cada valor tem um número: o primeiro é o índice 0, o segundo é o índice 1. Isso funciona enquanto a ordem é o que importa. Agora imagine guardar a idade de cada pessoa de uma turma: você precisa de um número para achar o que quer, e basta entrar alguém novo no meio para todos os números mudarem. O dicionário resolve isso guardando o valor atrás de um nome. A lista é uma pilha numerada; o dicionário é uma caixa com etiqueta em cada valor.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Um dicionário, e o valor guardado atrás de uma chave',
      codigo: 'pessoa = {"nome": "Ana", "idade": 34}\n\nprint(pessoa["nome"])   # Ana',
    },
    {
      tipo: 'diagrama',
      titulo: 'A posição e a chave, lado a lado',
      descricao:
        'A mesma ideia de guardar valores, com duas formas de achar o que está lá dentro. A pergunta que decide é sobre o que você sabe: se você sabe a posição, use lista; se você sabe o nome, use dicionário.',
      partes: [
        { rotulo: 'Lista: você pergunta pela posição', valor: 'nomes[0]', nota: 'acha o primeiro item — e o segundo passa a ser o índice 1' },
        { rotulo: 'Dicionário: você pergunta pela chave', valor: 'pessoa["nome"]', nota: 'acha pelo nome da chave, em qualquer ordem' },
        { rotulo: 'Ordem das listas', valor: 'importa', nota: 'inserir no meio desloca todos os índices seguintes' },
        { rotulo: 'Ordem dos dicionários', valor: 'não importa para achar', nota: 'a chave continua a mesma, onde quer que o valor esteja' },
      ],
    },
    {
      tipo: 'paragrafo',
      texto:
        'Para acrescentar uma chave nova e para mudar o valor de uma que já existe, a escrita é a mesma: chaves entre colchetes, sinal de igual, valor. Quem decide qual das duas coisas aconteceu é a chave já existir ou não. Repare que aqui não existe `append`: o dicionário não tem fim, e você acrescenta pelo nome que quiser.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Acrescentar, alterar e remover',
      codigo:
        'pessoa = {"nome": "Ana", "idade": 34}\n\npessoa["cidade"] = "Recife"   # chave nova: acrescenta\npessoa["idade"] = 35          # chave que já existe: altera\n\ndel pessoa["cidade"]          # remove a chave e o valor dela\nprint(pessoa)                 # {\'nome\': \'Ana\', \'idade\': 35}',
    },
    {
      tipo: 'destaque',
      titulo: 'A chave é o que você sabe',
      texto:
        'Escolher entre lista e dicionário não é gosto: é a pergunta que o seu programa faz. "Me dê o terceiro" pede lista. "Me dê a idade da Ana" pede dicionário. Quando as duas perguntas aparecem, o caminho comum é guardar dicionários dentro de uma lista — a lista mantém a ordem, e cada dicionário tem as etiquetas.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Pedir uma chave que não existe com colchetes derruba o programa com `KeyError`. Isso não é um defeito do dicionário: é um aviso de que o programa pediu algo que ninguém guardou. Quando não ter a chave é uma situação normal — e muitas vezes é —, existe `.get()`: ele procura a chave e, se ela não estiver lá, devolve o que você mandar como resposta padrão.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'O que o KeyError diz, quando a chave não está lá',
      codigo: 'pessoa = {"nome": "Ana", "idade": 34}\nprint(pessoa["altura"])',
      naoRodaNoConsole:
        'Este trecho termina em erro de propósito: `KeyError` é justamente o assunto dele. Rode no console e leia a mensagem até o fim — o Python diz qual chave procurou e não encontrou, e essa informação é tudo o que você precisa para corrigir.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A mesma consulta, sem quebrar o programa',
      codigo:
        'pessoa = {"nome": "Ana", "idade": 34}\n\nprint(pessoa.get("altura"))                 # None\nprint(pessoa.get("altura", "não informada")) # não informada',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Para percorrer um dicionário existem três vistas: as chaves, os valores e os dois juntos. A do meio, `.items()`, é a que você vai usar quase sempre — cada volta entrega um par, e o `for` pode receber os dois nomes de uma vez. Sem separar os nomes, cada volta entrega o par inteiro, e imprimir isso mostra uma tupla entre parênteses.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'As três formas de percorrer, e a que você vai usar mais',
      codigo:
        'pessoa = {"nome": "Ana", "idade": 34}\n\nfor chave in pessoa.keys():\n    print(chave)\n\nfor valor in pessoa.values():\n    print(valor)\n\nfor chave, valor in pessoa.items():\n    print(f"{chave}: {valor}")',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Um dicionário pode guardar listas como valores, e isso cobre muitos problemas de uma vez. Cada chave continua identificando o dono dos dados, e a lista guarda tudo o que pertence a ele — as notas de um aluno, os itens de um pedido, as tarefas de um dia.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Listas dentro de um dicionário',
      codigo:
        'notas = {"Ana": [7, 9], "Bia": [8, 8]}\n\nfor nome, lista in notas.items():\n    media = sum(lista) / len(lista)\n    print(f"{nome}: média {media}")',
    },
    {
      tipo: 'destaque',
      titulo: 'O que muda quando a estrutura cresce',
      texto:
        'Ao ler um dicionário com listas dentro, o caminho se escreve da esquerda para a direita, como você pensa: `notas["Ana"][1]` é o segundo valor da Ana. Se isso ficar difícil de ler, o problema não é a linha, é a estrutura — vale parar e perguntar o que você quer guardar antes de continuar escrevendo.',
    },
  ],

  pratica: [
    {
      id: 'e7-1',
      enunciado:
        'Crie um dicionário chamado `precos` com três chaves de texto — `"pao"`, `"leite"` e `"cafe"` — e os valores 7.5, 4.25 e 12.0, nessa ordem. Mostre o preço do café. Depois acrescente a chave `"ovos"` com o valor 15.9 e mostre o dicionário inteiro.',
      dica: 'A chave vai entre colchetes, com aspas por causa do `.get()`. O valor à direita do sinal de igual, sem aspas porque é número.',
      conferencia:
        'Aparece `12.0` e, depois, um dicionário com quatro chaves — a última acrescentada na hora.',
      solucao:
        'precos = {"pao": 7.5, "leite": 4.25, "cafe": 12.0}\n\nprint(precos["cafe"])\n\nprecos["ovos"] = 15.9\nprint(precos)',
      correcao: {
        saidaEsperada: ['12.0'],
        valoresEsperados: [
          { rotulo: '`precos` é um dicionário', expressao: 'precos', tipoEsperado: 'dict' },
          { rotulo: 'São quatro chaves no fim', expressao: 'len(precos)', igualA: '4' },
          {
            rotulo: 'A chave `cafe` guarda um número com casas decimais',
            expressao: 'precos.get("cafe")',
            igualA: '12.0',
          },
          {
            rotulo: 'A chave `ovos` foi acrescentada com o valor certo',
            expressao: 'precos.get("ovos")',
            igualA: '15.9',
          },
        ],
        estrutura: { linhasNaoVazias: 2 },
        limite:
          'A conferência olha o tipo e o tamanho de `precos`, o valor guardado nas chaves `cafe` e `ovos` e conta duas linhas impressas. Ela exige os números **exatamente** como o enunciado pede: `12` no lugar de `12.0` não confere, porque um é inteiro e o outro tem casas decimais. Ela não julga a ordem das chaves na saída nem o nome das suas variáveis auxiliares.',
      },
    },
    {
      id: 'e7-2',
      enunciado:
        'Guarde a idade de três amigos num dicionário chamado `idades`, usando o nome de cada um como chave. Percorra o dicionário com `for` e mostre uma linha por amigo, com o nome e a idade juntos. No fim, mostre quantos amigos foram registrados.',
      dica: '`idades.items()` entrega a chave e o valor de uma vez; o `for` aceita dois nomes separados por vírgula.',
      conferencia:
        'Aparecem três linhas, uma para cada amigo, com o nome e a idade; a última linha é o número 3.',
      solucao:
        'idades = {"Ana": 34, "Bia": 29, "Caio": 41}\n\nfor nome, idade in idades.items():\n    print(f"{nome} tem {idade} anos.")\n\nprint(len(idades))',
      correcao: {
        valoresEsperados: [
          { rotulo: '`idades` é um dicionário', expressao: 'idades', tipoEsperado: 'dict' },
          { rotulo: '`idades` tem três registros', expressao: 'len(idades)', igualA: '3' },
          {
            rotulo: 'Todos os valores são números inteiros',
            expressao: 'all(isinstance(idade, int) for idade in idades.values())',
            igualA: 'True',
          },
          {
            rotulo: 'O primeiro nome em ordem alfabética aparece na saída',
            expressao: 'sorted(idades.keys())[0]',
            apareceNaSaida: true,
          },
        ],
        estrutura: { linhasNaoVazias: 4 },
        limite:
          'A conferência olha o tipo e o tamanho de `idades`, se todos os valores são números inteiros, se o primeiro nome em ordem alfabética aparece na saída e se foram impressas quatro linhas — as três pessoas e a contagem. Ela não sabe quais amigos você escolheu, não confere as idades e não exige `.items()`: percorrer as chaves e usar `idades[nome]` chega ao mesmo resultado.',
      },
    },
    {
      id: 'e7-3',
      enunciado:
        'Crie um dicionário chamado `pessoa` com as chaves `nome` e `cidade`. Pergunte pela chave `altura` com `.get()`, usando `"não informado"` como resposta padrão, e mostre essa resposta. Depois, mostre as chaves de `pessoa` em ordem alfabética, **uma por linha**.',
      dica: 'Para a segunda parte, `sorted()` funciona em cima das chaves: `sorted(pessoa.keys())`. Depois é um `for` simples imprimindo cada uma.',
      conferencia:
        'Aparece `não informado` e, nas duas linhas seguintes, as chaves em ordem alfabética: cidade antes de nome.',
      solucao:
        'pessoa = {"nome": "Ana", "cidade": "Recife"}\n\nprint(pessoa.get("altura", "não informado"))\n\nfor chave in sorted(pessoa.keys()):\n    print(chave)',
      correcao: {
        saidaEsperada: ['não informado', 'cidade', 'nome'],
        valoresEsperados: [
          {
            rotulo: 'A consulta com `.get()` devolveu a resposta padrão',
            expressao: 'pessoa.get("altura", "não informado")',
            igualA: "'não informado'",
          },
          { rotulo: '`pessoa` tem duas chaves', expressao: 'len(pessoa)', igualA: '2' },
        ],
        limite:
          'A conferência procura a resposta padrão e as duas chaves na saída, na ordem em que o exercício pede — cada uma na sua linha —, e olha o que `.get()` devolveu para a chave que não existe. Ela não confere o nome nem a cidade que você escolheu — os seus dados são seus — e não julga se você usou `sorted()` ou escreveu a ordem na mão.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p7-1',
      enunciado: 'O que uma chave de dicionário faz, que o índice de uma lista não faz?',
      alternativas: [
        'Guarda o valor em ordem crescente, sem precisar de índice',
        'Impede que o mesmo valor seja guardado duas vezes',
        'Identifica o valor por um nome, independente da posição',
        'Deixa o valor visível para outros programas do computador',
      ],
      correta: 2,
      explicacao:
        'A chave é um nome de procura, e não uma posição. Com ela, o valor é encontrado pelo que ele significa — a idade da Ana — e não por onde ele caiu na estrutura.',
    },
    {
      id: 'p7-2',
      enunciado:
        'Você escreve `pessoa["altura"] = 1.72` e a chave `altura` ainda não existia no dicionário. O que acontece?',
      alternativas: [
        'O Python para o programa por causa da chave desconhecida',
        'O Python cria a chave `altura` com esse valor',
        'O valor é descartado, porque só chaves declaradas antes valem',
        'O Python cria uma lista nova para guardar valores sem chave',
      ],
      correta: 1,
      explicacao:
        'Acrescentar e alterar usam a mesma escrita: se a chave já existe, o valor é trocado; se não existe, ela é criada. O Python decide pelo estado do dicionário, e não por uma instrução diferente.',
    },
    {
      id: 'p7-3',
      enunciado:
        'O dicionário `pessoa` tem as chaves `nome` e `cidade`. O que `pessoa.get("altura", "não informado")` devolve?',
      alternativas: [
        'Um erro, porque `.get()` só funciona em chaves que existem',
        'A palavra `None`, que é o que o Python devolve para tudo',
        'A chave `altura` criada com o texto `não informado` dentro',
        'O texto `não informado`, porque a chave procurada não existe',
      ],
      correta: 3,
      explicacao:
        '`.get()` procura a chave e devolve a resposta padrão quando não encontra — e não mexe no dicionário. É a diferença entre perguntar e exigir: o segundo valor entre parênteses é só uma resposta, e ele não cria a chave.',
    },
    {
      id: 'p7-4',
      enunciado:
        'No laço `for chave, valor in pessoa.items():`, o que cada volta entrega às duas variáveis?',
      alternativas: [
        'Um par: a chave e o valor guardado atrás dela, na mesma volta',
        'A chave na primeira volta e o valor na segunda, alternando',
        'As duas variáveis recebem a chave; o valor fica guardado para depois',
        'O dicionário inteiro na primeira volta e uma lista vazia na última',
      ],
      correta: 0,
      explicacao:
        '`.items()` entrega cada registro completo, e o `for` reparte o par nas duas variáveis. Sem os dois nomes, a volta entrega uma tupla com os dois valores dentro.',
    },
    {
      id: 'p7-5',
      enunciado: 'A chave `peso` não existe em `dados`. O que acontece em `dados["peso"]`?',
      alternativas: [
        'A consulta devolve `None`, como acontece no `.get()`',
        'A chave é criada com o valor `None` dentro dela',
        'O programa para com `KeyError`, dizendo qual chave faltou',
        'A consulta devolve o último valor guardado no dicionário',
      ],
      correta: 2,
      explicacao:
        'Os colchetes exigem que a chave esteja lá: se não estiver, o Python avisa com `KeyError` e diz qual chave procurou. Quando faltar pode acontecer, use `.get()` — é para isso que ele existe.',
    },
  ],
}
