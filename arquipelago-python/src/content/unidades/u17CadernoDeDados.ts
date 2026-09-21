import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 17 — O Caderno de Dados.
 * Capítulo 16 do livro: trabalhar com dados que vêm de arquivo (CSV e JSON).
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 *
 * Segunda unidade da trilha de visualização de dados. O livro baixa os arquivos
 * de repositórios públicos pela internet; aqui o arquivo é **escrito pelo próprio
 * programa** e lido de volta, porque este console não faz requisição de rede (e o
 * projeto não faz download em tempo de execução — D-040). Essa diferença está
 * dita na tela. O que se aprende é o mesmo: dado de arquivo chega como **texto**,
 * e text tem de virar número antes de virar conta.
 */
export const u17CadernoDeDados: ConteudoDaUnidade = {
  id: 'u17-caderno-de-dados',

  missao:
    'Ao final desta unidade, você vai ler dados de arquivo: abrir um arquivo de valores separados por vírgula, transformar as colunas de texto em números, calcular a partir deles e guardar o resultado em JSON para não perder o trabalho.',

  leitura: {
    parte:
      'Capítulo 16 do livro — as partes sobre ler dados de arquivos, trabalhar com valores separados por vírgula, formatar os números que vêm como texto e guardar dados em JSON.',
    porque:
      'Na unidade anterior os dados nasciam dentro do próprio programa. Aqui eles chegam de fora — e chegam no formato em que todo dado chega: texto. É esse detalhe que quebra a maior parte dos programas de dados: `"9.5"` não é `9.5`, e somar textos que parecem números é o erro mais comum de quem está começando a trabalhar com arquivos. O capítulo ensina a fazer a conversão e a conferir o que veio.',
    oQueObservar: [
      'O que o `open` devolve e por que o arquivo precisa ser fechado. Repare que o livro usa o `with`: ele abre, entrega o arquivo e fecha sozinho no fim do bloco — inclusive quando dá erro no meio.',
      'A diferença entre a linha crua e a linha tratada: a linha que chega do arquivo traz o `\\n` do fim, e comparar `"Ana\\n"` com `"Ana"` dá falso. Repare onde o livro tira esse resto de linha.',
      'A conversão: todo valor lido de arquivo de texto é `str`, mesmo que pareça número. Repare que a conversão é um passo explícito, e que ela pode falhar quando a célula está vazia ou tem vírgula no lugar do ponto.',
      'O JSON como formato de guardar: o que era lista e dicionário vira texto no arquivo e volta a ser lista e dicionário na leitura. Repare que o formato guarda **estrutura**, e não só valores.',
    ],
    semOLivro:
      'Sem o livro em mãos, a unidade continua inteira: a explicação cobre `open` com `with`, a leitura de CSV, a conversão de texto para número, a formatação da saída e a gravação e leitura em JSON. O que o livro acrescenta é o caminho de baixar os dados de fora, que aqui não acontece (o console não faz requisições) e os gráficos que ele desenha no fim do capítulo, que ficam explicados.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Dado que vem de arquivo tem um formato único por baixo de todas as aparências: **texto**. Um arquivo de valores separados por vírgula (CSV) é texto com linhas e vírgulas; um arquivo JSON é texto com chaves e colchetes. Antes de qualquer conta, alguém precisa transformar esse texto na estrutura que o programa usa — e essa transformação é o assunto deste capítulo.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Um CSV escrito pelo próprio programa, e lido de volta',
      codigo:
        'import csv\n\nwith open("notas.csv", "w", encoding="utf-8") as arquivo:\n    escritor = csv.writer(arquivo)\n    escritor.writerow(["nome", "nota"])\n    escritor.writerow(["Ana", "9.5"])\n    escritor.writerow(["Bruno", "7.0"])\n\nwith open("notas.csv", encoding="utf-8") as arquivo:\n    linhas = list(csv.reader(arquivo))\n\nprint("linhas:", len(linhas))\nprint("a primeira coluna da segunda linha:", linhas[1][0])',
    },
    {
      tipo: 'diagrama',
      titulo: 'A mesma informação em três lugares',
      descricao:
        'A linha do arquivo é texto; o `csv` a transforma em uma lista de colunas; a sua conta precisa dela como número. Cada etapa é uma forma diferente do mesmo dado.',
      partes: [
        {
          rotulo: 'No arquivo',
          valor: 'Ana,9.5',
          nota: 'uma linha de texto, com a vírgula separando as colunas',
        },
        {
          rotulo: 'Depois do `csv`',
          valor: "['Ana', '9.5']",
          nota: 'a linha vira lista — e as **duas** colunas ainda são texto',
        },
        {
          rotulo: 'Depois do `float`',
          valor: '9.5',
          nota: 'só agora é número, e só agora dá para somar',
        },
        {
          rotulo: 'O erro comum',
          valor: "'9.5' + '7.0'",
          nota: "sem a conversão, o programa não soma: ele **junta** os textos em '9.57.0'",
        },
      ],
    },
    {
      tipo: 'destaque',
      titulo: 'A conversão pode falhar, e é bom que falhe',
      texto:
        '`float("9.5")` funciona; `float("")` levanta `ValueError`; `float("9,5")` também — o Python espera ponto como separador decimal, e muita planilha brasileira exporta com vírgula. Não trate isso como um detalhe chato: um programa de dados que engole célula vazia em silêncio produz uma média errada e ninguém descobre. O caminho certo é o da unidade 11 — conferir o que veio e decidir o que fazer quando não der para converter.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'De texto para número, e a conta que só então faz sentido',
      codigo:
        'import csv\n\nwith open("notas.csv", "w", encoding="utf-8") as arquivo:\n    escritor = csv.writer(arquivo)\n    escritor.writerow(["nome", "nota"])\n    escritor.writerow(["Ana", "9.5"])\n    escritor.writerow(["Bruno", "7.0"])\n    escritor.writerow(["Carla", "8.0"])\n\nnotas = []\nwith open("notas.csv", encoding="utf-8") as arquivo:\n    leitor = csv.reader(arquivo)\n    next(leitor)\n    for linha in leitor:\n        notas.append(float(linha[1]))\n\nmedia = sum(notas) / len(notas)\nprint("notas lidas:", len(notas))\nprint("média:", round(media, 2))',
    },
    {
      tipo: 'destaque',
      titulo: 'Aquele `next(leitor)` pula o cabeçalho',
      texto:
        'A primeira linha do arquivo é o nome das colunas — "nome", "nota" —, e não um dado. Se ela entrar na conta, `float("nota")` levanta `ValueError` e o programa para na primeira linha. `next(leitor)` pede a próxima linha do leitor e a devolve **sem** usá-la: é o jeito curto de dizer "pule o cabeçalho". A alternativa é perguntar dentro do laço se a linha é o cabeçalho, o que funciona, mas deixa essa decisão no meio da conta.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Arquivo de texto guarda valores; JSON guarda **estrutura**. Uma lista de dicionários vira texto JSON com um comando e volta a ser lista de dicionários com outro, mantendo os nomes dos campos e os tipos. É por isso que o livro termina o capítulo guardando o resultado em JSON: o dado trabalhado não se perde quando o programa acaba.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Guardar e ler de volta, sem perder os nomes dos campos',
      codigo:
        'import json\n\nnotas = [{"nome": "Ana", "nota": 9.5}, {"nome": "Bruno", "nota": 7.0}]\n\nwith open("notas.json", "w", encoding="utf-8") as arquivo:\n    json.dump(notas, arquivo, ensure_ascii=False)\n\nwith open("notas.json", encoding="utf-8") as arquivo:\n    lidas = json.load(arquivo)\n\nprint("registros:", len(lidas))\nprint("o segundo nome:", lidas[1]["nome"])',
    },
    {
      tipo: 'avisoDeVersao',
      titulo: 'O livro baixa os dados; aqui o arquivo é feito pelo programa',
      texto:
        'No capítulo, os arquivos vêm de fora: o livro baixa um arquivo de dados de um endereço público e trabalha com ele. Este console **não faz requisição de rede** — não é limitação de Python, é decisão do projeto (D-040): nada é baixado em tempo de execução. A consequência para o estudo é pequena, e vale dizer qual é: o que se aprende aqui é o que acontece **depois** de o arquivo chegar — abrir, ler, converter, calcular, guardar. A parte de buscar o arquivo é uma linha (`urlopen`, `requests.get`) e está explicada na próxima unidade, junto com a resposta que ela devolve.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Repare no caminho completo, porque ele é sempre o mesmo: o dado chega como texto, vira estrutura, vira número, passa por contas, e o resultado é guardado de novo. Os nomes das bibliotecas mudam de projeto para projeto; o caminho não. É esse caminho que faz um programa de dados ser conferível — e é ele que a correção automática desta unidade mede.',
    },
  ],

  pratica: [
    {
      id: 'e17-1',
      enunciado:
        'Escreva o arquivo `turma.csv` com o cabeçalho `nome,nota` e três alunos (Ana 9.5, Bruno 7.0, Carla 8.0). Leia o arquivo de volta e mostre quantas linhas o arquivo tem e qual é o primeiro nome da primeira linha de dados.',
      dica: 'Escrever é `csv.writer` com `writerow`; ler é `csv.reader`. O cabeçalho conta como linha do arquivo — são quatro linhas no total, e a primeira linha de **dados** é `linhas[1]`.',
      conferencia: 'Aparece `linhas no arquivo: 4` e `primeiro aluno: Ana`.',
      solucao:
        'import csv\n\nwith open("turma.csv", "w", encoding="utf-8") as arquivo:\n    escritor = csv.writer(arquivo)\n    escritor.writerow(["nome", "nota"])\n    escritor.writerow(["Ana", "9.5"])\n    escritor.writerow(["Bruno", "7.0"])\n    escritor.writerow(["Carla", "8.0"])\n\nwith open("turma.csv", encoding="utf-8") as arquivo:\n    linhas = list(csv.reader(arquivo))\n\nprint("linhas no arquivo:", len(linhas))\nprint("primeiro aluno:", linhas[1][0])',
      correcao: {
        saidaEsperada: ['linhas no arquivo: 4', 'primeiro aluno: Ana'],
        valoresEsperados: [
          {
            rotulo: 'O arquivo tem o cabeçalho e os três alunos',
            expressao: 'len(linhas)',
            igualA: '4',
          },
          {
            rotulo: 'Cada linha do CSV veio como uma lista de colunas',
            expressao: 'len(linhas[0])',
            igualA: '2',
          },
          {
            rotulo: 'O cabeçalho ficou na primeira linha, como o enunciado pede',
            expressao: "linhas[0][0]",
            igualA: "'nome'",
          },
        ],
        limite:
          'A conferência olha o arquivo lido de volta: quantas linhas, quantas colunas e qual é o cabeçalho. Ela não julga como o arquivo foi escrito (à mão com `open` e vírgulas, ou com o `csv`) nem o nome das variáveis, desde que a leitura esteja no formato do enunciado.',
      },
    },
    {
      id: 'e17-2',
      enunciado:
        'Leia o arquivo do exercício anterior, pule o cabeçalho, converta cada nota de texto para número e calcule a média da turma. Mostre quantas notas foram lidas e a média arredondada em duas casas.',
      dica: 'Cada coluna do CSV chega como texto: `float(linha[1])`. Para pular o cabeçalho, `next(leitor)` antes do laço. A média é `sum(notas) / len(notas)`.',
      conferencia: 'Aparece `notas lidas: 3` e `média: 8.17`.',
      solucao:
        'import csv\n\nwith open("turma.csv", "w", encoding="utf-8") as arquivo:\n    escritor = csv.writer(arquivo)\n    escritor.writerow(["nome", "nota"])\n    escritor.writerow(["Ana", "9.5"])\n    escritor.writerow(["Bruno", "7.0"])\n    escritor.writerow(["Carla", "8.0"])\n\nnotas = []\nwith open("turma.csv", encoding="utf-8") as arquivo:\n    leitor = csv.reader(arquivo)\n    next(leitor)\n    for linha in leitor:\n        notas.append(float(linha[1]))\n\nmedia = sum(notas) / len(notas)\nprint("notas lidas:", len(notas))\nprint("média:", round(media, 2))',
      correcao: {
        saidaEsperada: ['notas lidas: 3', 'média: 8.17'],
        valoresEsperados: [
          { rotulo: 'As três notas foram lidas do arquivo', expressao: 'len(notas)', igualA: '3' },
          {
            rotulo: 'As notas viraram números, e não texto',
            expressao: 'all(isinstance(nota, float) for nota in notas)',
            igualA: 'True',
          },
          { rotulo: 'A soma das três notas', expressao: 'sum(notas)', igualA: '24.5' },
          { rotulo: 'A média arredondada em duas casas', expressao: 'round(media, 2)', igualA: '8.17' },
        ],
        limite:
          'A conferência olha as notas lidas, o tipo delas, a soma e a média arredondada. Ela não exige a variável `media` — o valor é medido a partir das notas — nem julga se o cabeçalho foi pulado com `next`, com um `if` ou com uma fatia da lista.',
      },
    },
    {
      id: 'e17-3',
      enunciado:
        'Monte a lista de registros com os mesmos três alunos, usando o campo `nome` e o campo `nota` como **número**. Guarde tudo no arquivo `turma.json`, leia de volta e mostre quantos registros vieram e o nome do segundo.',
      dica: 'Para guardar: `json.dump(registros, arquivo, ensure_ascii=False)`. Para ler: `json.load(arquivo)`. O JSON guarda o 9.5 como número; se for gravado como texto, ele volta como texto.',
      conferencia: 'Aparece `registros: 3` e `o segundo é Bruno`.',
      solucao:
        'import json\n\nregistros = [\n    {"nome": "Ana", "nota": 9.5},\n    {"nome": "Bruno", "nota": 7.0},\n    {"nome": "Carla", "nota": 8.0},\n]\n\nwith open("turma.json", "w", encoding="utf-8") as arquivo:\n    json.dump(registros, arquivo, ensure_ascii=False)\n\nwith open("turma.json", encoding="utf-8") as arquivo:\n    lidos = json.load(arquivo)\n\nprint("registros:", len(lidos))\nprint("o segundo é", lidos[1]["nome"])',
      correcao: {
        saidaEsperada: ['registros: 3', 'o segundo é Bruno'],
        valoresEsperados: [
          { rotulo: 'Os três registros voltaram do arquivo', expressao: 'len(lidos)', igualA: '3' },
          {
            rotulo: 'O nome continua sendo um campo do registro',
            expressao: 'sorted(lidos[0].keys())',
            igualA: "['nome', 'nota']",
          },
          {
            rotulo: 'A nota voltou como número, e não como texto',
            expressao: 'isinstance(lidos[0]["nota"], float)',
            igualA: 'True',
          },
          { rotulo: 'O nome do segundo registro', expressao: 'lidos[1]["nome"]', igualA: "'Bruno'" },
        ],
        limite:
          'A conferência olha o que voltou do arquivo: quantos registros, quais campos e de que tipo é a nota. Ela não julga a ordem das chaves nem o nome do arquivo além do que o enunciado pede — e não confere se você usou `ensure_ascii`: acentos gravados de uma forma ou de outra voltam iguais ao serem lidos.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p17-1',
      enunciado: 'Um arquivo CSV é aberto e lido com o `csv`. O que chega na variável de cada linha?',
      alternativas: [
        'Números, quando a célula parece número',
        'Uma lista de colunas, e cada coluna é texto',
        'Um dicionário com o cabeçalho como chave e as células como valor',
        'Uma única string, com as vírgulas intactas',
      ],
      correta: 1,
      explicacao:
        'O `csv` divide a linha pelas vírgulas e devolve a lista de colunas — mas não adivinha tipo: `9.5` chega como o texto `"9.5"`. A conversão para número é um passo seu, e é justamente por isso que a média de notas "não dá certo" quando alguém esquece de converter: o programa junta os textos em vez de somar.',
    },
    {
      id: 'p17-2',
      enunciado: 'Para que serve o `with` ao abrir um arquivo?',
      alternativas: [
        'Para deixar a leitura do arquivo mais rápida em arquivos grandes',
        'Para o conteúdo do arquivo ser apagado quando o programa terminar',
        'Para impedir que outro programa abra o mesmo arquivo ao mesmo tempo',
        'Para o arquivo ser fechado no fim do bloco, mesmo se der erro no meio',
      ],
      correta: 3,
      explicacao:
        'O `with` fecha o arquivo ao sair do bloco, inclusive quando acontece um erro dentro dele. Sem o `with`, o fechamento depende de você lembrar de chamar `close()` em todos os caminhos do programa — e quando um erro interrompe o caminho, o arquivo fica aberto. Nada disso tem a ver com velocidade nem com apagar o conteúdo: apagar seria abrir com o modo `"w"`, que é outra decisão.',
    },
    {
      id: 'p17-3',
      enunciado: 'A primeira linha de um CSV de dados costuma ser o cabeçalho. O que acontece se ela entrar na conta?',
      alternativas: [
        'A média sai um pouco menor, porque o cabeçalho não tem valor',
        'A conversão do cabeçalho para número falha, e o programa para com erro',
        'O `csv` identifica o cabeçalho sozinho e o remove da lista',
        'Nada: o cabeçalho é ignorado por não ser um número',
      ],
      correta: 1,
      explicacao:
        'O `csv` não sabe o que é cabeçalho: para ele, as linhas são iguais. A primeira é `"nome"`, e `float("nome")` levanta `ValueError` na primeira volta do laço — o programa para antes de calcular qualquer coisa. Daí o `next(leitor)` antes do laço, que consome a linha do cabeçalho sem usá-la.',
    },
    {
      id: 'p17-4',
      enunciado: 'O que o JSON guarda a mais do que um arquivo de texto comum?',
      alternativas: [
        'A estrutura: listas, dicionários, nomes de campos e o tipo dos valores',
        'Uma cópia do programa que gerou o arquivo, para poder repetir a conta depois',
        'Os números em formato binário, para ocuparem menos espaço em disco',
        'A data e a hora de cada valor, para o dado não ficar velho',
      ],
      correta: 0,
      explicacao:
        'Texto comum guarda caracteres; o JSON guarda a **forma** do dado: que existe uma lista, que cada item é um dicionário, que o campo se chama `nota` e que ele é número. Por isso ele volta como a mesma lista de dicionários, sem você precisar recortar linha por linha — e por isso ele é o formato em que as respostas de API chegam, que é o assunto da próxima unidade.',
    },
    {
      id: 'p17-5',
      enunciado: 'Por que, nesta ilha, o arquivo de dados é escrito pelo próprio programa em vez de baixado?',
      alternativas: [
        'Porque o Python do console não sabe abrir arquivos que não tenham sido criados por ele',
        'Porque baixar levaria muito tempo e o estudo ficaria lento',
        'Porque este console não faz requisição de rede: nada é baixado em tempo de execução',
        'Porque os arquivos do livro têm direitos autorais e não podem ser usados',
      ],
      correta: 2,
      explicacao:
        'A decisão é do projeto, e não uma limitação escondida: nada é baixado da internet em tempo de execução (D-040). O que se aprende aqui é o que acontece depois de o arquivo chegar — abrir, ler, converter, calcular, guardar —, e essa parte é idêntica nos dois casos. A parte de buscar o arquivo é uma linha em Python, e ela aparece explicada na unidade seguinte, junto da resposta que devolve.',
    },
  ],
}
