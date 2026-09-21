import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 11 — O Arquivo das Gavetas.
 * Capítulo 10 do livro: ler e escrever arquivos, exceções e guardar dados em json.
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 *
 * Uma coisa que este capítulo tem de diferente dos anteriores: o console da ilha
 * **tem** sistema de arquivos. É um sistema de arquivos de mentira, que vive na
 * memória da página (ver D-058) — mas `open()` funciona de verdade ali dentro,
 * então os exemplos de arquivo rodam, e não precisam de aviso de "não roda aqui".
 */
export const u11ArquivoDasGavetas: ConteudoDaUnidade = {
  id: 'u11-arquivo-das-gavetas',

  missao:
    'Ao final desta unidade, você vai gravar texto em um arquivo, ler o que ficou gravado, acrescentar sem apagar o que já havia, tratar o caso do arquivo que não existe sem derrubar o programa e guardar um dicionário inteiro com `json`.',

  leitura: {
    parte:
      'Capítulo 10 do livro — as partes sobre ler de um arquivo, escrever em um arquivo, exceções com `try`/`except`/`else`, e a parte final sobre guardar dados com `json`.',
    porque:
      'É o capítulo em que o programa deixa de esquecer. Até aqui, tudo o que o programa montava existia só enquanto ele rodava; com arquivo, o que foi feito em uma execução pode ser lido na seguinte — e é isso que separa um exercício de um programa que serve para alguma coisa.',
    oQueObservar: [
      'O `with open(...) as arquivo`: repare que o livro nunca chama `arquivo.close()`. O `with` fecha o arquivo por você, mesmo quando algo dá errado no meio — e arquivo aberto e não fechado é uma das fontes de erro mais chatas de achar.',
      'A letra que acompanha o `open`: `"r"` para ler, `"w"` para escrever (e **apagar** o que havia), `"a"` para acrescentar no fim. Trocar `"a"` por `"w"` sem querer é o jeito mais rápido de apagar o diário inteiro.',
      'Como o livro lê o arquivo linha por linha, e o que ele faz com o `\\n` que vem junto de cada linha. Repare no método que tira esse `\\n` antes de mostrar.',
      'O bloco `try`/`except`: o programa tenta fazer a parte arriscada, e diz o que fazer quando a parte arriscada falha. Repare que a exceção tem **nome** — e que cada tipo de problema tem o seu.',
    ],
    semOLivro:
      'Sem o livro em mãos, a unidade continua inteira: a explicação cobre abrir com `with` e dizer o que se quer fazer com o arquivo, gravar, ler linha por linha, acrescentar no fim, pegar o erro de arquivo que não existe, e guardar um dicionário com `json`. O que o livro acrescenta são os exemplos maiores — um arquivo de piadas sendo lido de várias formas, a lista de convidados gravada e relida — e a discussão sobre o que fazer com cada tipo de erro.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Tudo o que os programas das unidades anteriores montaram viveu o tempo da execução: a lista de convidados, o dicionário do registro, o objeto da conta. Quando o programa acaba, aquilo acaba junto. Arquivo é o contrário disso — é onde o dado fica **depois** do programa, e de onde ele volta na próxima vez. Pense numa gaveta: você não carrega a gaveta com você, mas sabe onde ela está e o que tem dentro.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Gravando duas linhas num arquivo',
      codigo:
        'with open("bilhete.txt", "w", encoding="utf-8") as arquivo:\n    arquivo.write("Ana\\n")\n    arquivo.write("estudando Python\\n")\n\nprint("gravei o bilhete")',
    },
    {
      tipo: 'paragrafo',
      texto:
        'O `open` recebe o nome do arquivo e **o que você pretende fazer com ele**. A letra que vem depois do nome — o modo — decide tudo: se o arquivo for gravado de novo em outro dia, a letra escolhida hoje decide se o bilhete de ontem continua ali ou não. O `with` é o que garante que o arquivo será fechado, mesmo se o programa falhar no meio da tarefa.',
    },
    {
      tipo: 'diagrama',
      titulo: 'As três letras do modo, e o que cada uma faz com o que já estava gravado',
      descricao:
        'O mesmo arquivo, aberto de três formas diferentes. Só uma delas preserva o que já havia dentro.',
      partes: [
        {
          rotulo: 'r — ler',
          valor: 'open("bilhete.txt", "r")',
          nota: 'só lê; se o arquivo não existir, o programa para com FileNotFoundError',
        },
        {
          rotulo: 'w — escrever',
          valor: 'open("bilhete.txt", "w")',
          nota: 'cria o arquivo e apaga o que havia dentro; é o modo mais perigoso dos três',
        },
        {
          rotulo: 'a — acrescentar',
          valor: 'open("bilhete.txt", "a")',
          nota: 'escreve no fim, sem tocar no que já estava lá',
        },
        {
          rotulo: 'with',
          valor: 'with open(...) as arquivo:',
          nota: 'fecha o arquivo por você, inclusive quando algo dá errado no meio',
        },
      ],
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Lendo o arquivo linha por linha',
      codigo:
        'with open("bilhete.txt", encoding="utf-8") as arquivo:\n    for linha in arquivo:\n        print(linha.rstrip())',
    },
    {
      tipo: 'destaque',
      titulo: 'O `\\n` que vem junto de cada linha',
      texto:
        'Cada linha lida de um arquivo traz o `\\n` do fim. Se você imprimir sem tirar, aparece uma linha em branco entre uma linha e a seguinte — o `print` já pula uma linha por conta própria. O `rstrip()` resolve isso: ele devolve o texto sem os espaços em branco das pontas. Repare que o enunciado de um exercício costuma reclamar quando sobra linha em branco.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Arquivo que não existe é o erro mais comum deste capítulo, e ele **não** precisa derrubar o programa. O Python devolve esse problema como uma exceção: uma situação que interrompe o fluxo normal, com nome e tudo. O `try` diz "tente isto", e o `except` diz o que fazer quando der errado. O `else` é a parte que roda só quando **não** deu errado — útil quando você quer deixar claro o caminho feliz.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Tentando ler um arquivo que pode não existir',
      codigo:
        'try:\n    with open("agenda.txt", encoding="utf-8") as arquivo:\n        print(arquivo.readline().rstrip())\nexcept FileNotFoundError:\n    print("A agenda ainda está vazia.")\nelse:\n    print("agenda lida")',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Guardar texto é útil, mas quase sempre o que se quer guardar é **estrutura**: uma lista de nomes, um dicionário de configurações. O módulo `json` transforma estruturas do Python em texto e o texto de volta em estrutura, e é por isso que ele é o jeito mais comum de guardar dados de um programa pequeno — o arquivo continua legível por gente, e qualquer linguagem consegue lê-lo depois.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Um dicionário inteiro indo para o arquivo, e voltando',
      codigo:
        'import json\n\nperfil = {"nome": "Ana", "altura": 1.72}\n\nwith open("perfil.json", "w", encoding="utf-8") as arquivo:\n    json.dump(perfil, arquivo)\n\nwith open("perfil.json", encoding="utf-8") as arquivo:\n    lido = json.load(arquivo)\n\nprint(lido["altura"])',
    },
    {
      tipo: 'destaque',
      titulo: 'O arquivo do console da ilha vive na memória',
      texto:
        'No console desta ilha existe um sistema de arquivos de verdade, com `open`, `json` e `os.path` funcionando — pode experimentar à vontade. Mas ele vive na **memória da página**: os arquivos que você gravar aqui somem quando a página é recarregada, e não aparecem na pasta do seu computador. Para guardar de um dia para o outro, rode o mesmo programa no Python do seu computador — é o mesmo código.',
    },
  ],

  pratica: [
    {
      id: 'e11-1',
      enunciado:
        'Escreva um programa que grave o arquivo `bilhete.txt` com duas linhas — `Ana` e `estudando Python` — e depois abra o mesmo arquivo e mostre as duas linhas. Não pode sobrar linha em branco entre elas.',
      dica: 'Grave com o modo `"w"`, usando `"\\n"` no fim de cada linha. Para mostrar, abra de novo com o `with` e use um laço sobre o arquivo, tirando o fim de linha com `rstrip()`.',
      conferencia: 'Aparecem `Ana` e `estudando Python`, uma por linha, sem linha vazia no meio.',
      solucao:
        'with open("bilhete.txt", "w", encoding="utf-8") as arquivo:\n    arquivo.write("Ana\\n")\n    arquivo.write("estudando Python\\n")\n\nwith open("bilhete.txt", encoding="utf-8") as arquivo:\n    for linha in arquivo:\n        print(linha.rstrip())',
      correcao: {
        saidaEsperada: ['Ana', 'estudando Python'],
        valoresEsperados: [
          {
            rotulo: 'O arquivo ficou com as duas linhas, na ordem pedida',
            expressao: 'open("bilhete.txt", encoding="utf-8").read().splitlines()',
            igualA: "['Ana', 'estudando Python']",
          },
        ],
        estrutura: { linhasNaoVazias: 2 },
        limite:
          'A conferência abre o arquivo que o seu programa gravou e confere o que ficou escrito lá dentro, além de procurar as duas linhas na saída. Ela não julga **como** o arquivo foi gravado: `write` duas vezes, `write` de um texto só com `"\\n"` no meio, ou um `for` sobre uma lista de nomes dão no mesmo. E não confere se você fechou o arquivo — quem faz isso é o `with`.',
      },
    },
    {
      id: 'e11-2',
      enunciado:
        'Escreva a função `primeiro_nome(caminho)`, que devolve a primeira linha do arquivo sem o `\\n` do fim — e devolve o texto `(vazio)` quando o arquivo não existe, sem deixar o programa quebrar. Depois chame a função com `"nao-existe.txt"` e mostre o que ela devolveu.',
      dica: 'A função precisa de `try` e `except FileNotFoundError`. Para tirar o `\\n` da linha lida, `rstrip()` serve; para ler só a primeira linha, `readline()`.',
      conferencia: 'Aparece `(vazio)`, e o programa termina sem erro, mesmo o arquivo não existindo.',
      solucao:
        'def primeiro_nome(caminho):\n    try:\n        with open(caminho, encoding="utf-8") as arquivo:\n            return arquivo.readline().rstrip()\n    except FileNotFoundError:\n        return "(vazio)"\n\nprint(primeiro_nome("nao-existe.txt"))',
      correcao: {
        saidaEsperada: ['(vazio)'],
        valoresEsperados: [
          {
            rotulo: 'Com arquivo que não existe, a função devolve o aviso em vez de quebrar',
            expressao: 'primeiro_nome("nao-existe.txt")',
            igualA: "'(vazio)'",
          },
          {
            rotulo: 'Com arquivo que existe, a função devolve a primeira linha, sem o fim de linha',
            expressao:
              'open("teste-do-exercicio.txt", "w", encoding="utf-8").write("primeira\\nsegunda\\n") and primeiro_nome("teste-do-exercicio.txt")',
            igualA: "'primeira'",
          },
        ],
        estrutura: { linhasNaoVazias: 1 },
        limite:
          'A conferência chama a sua função duas vezes: com um arquivo que não existe — e aí ela tem de devolver `(vazio)` sem deixar o erro passar — e com um arquivo que ela mesma escreve antes, para ver se a primeira linha volta sem o `\\n`. Ela não julga se você usou `readline()` ou leu o arquivo inteiro, nem como escreveu o `try`.',
      },
    },
    {
      id: 'e11-3',
      enunciado:
        'Guarde um dicionário com o seu nome e a sua altura em `perfil.json`, usando `json.dump`. Depois leia o arquivo de volta com `json.load` e mostre apenas a altura.',
      dica: 'A altura precisa ser um número com casas decimais (por exemplo `1.72`), e não texto entre aspas — quem grava com `json.dump` mantém o tipo. Abra para escrita com `"w"` e para leitura sem letra nenhuma.',
      conferencia: 'Aparece um número com casas decimais, e o arquivo `perfil.json` passa a existir com as duas chaves.',
      solucao:
        'import json\n\nperfil = {"nome": "Ana", "altura": 1.72}\n\nwith open("perfil.json", "w", encoding="utf-8") as arquivo:\n    json.dump(perfil, arquivo)\n\nwith open("perfil.json", encoding="utf-8") as arquivo:\n    lido = json.load(arquivo)\n\nprint(lido["altura"])',
      correcao: {
        saidaEsperada: ['1.'],
        valoresEsperados: [
          {
            rotulo: 'O arquivo tem as duas chaves, e o json foi gravado de verdade',
            expressao: 'sorted(json.load(open("perfil.json", encoding="utf-8")))',
            igualA: "['altura', 'nome']",
          },
          {
            rotulo: 'A altura ficou gravada como número, e não como texto',
            expressao: 'json.load(open("perfil.json", encoding="utf-8"))["altura"]',
            tipoEsperado: 'float',
          },
        ],
        limite:
          'A conferência abre o arquivo que o seu programa gravou, lê com `json` e olha as duas chaves: ela confere que a altura foi gravada como número, e não como texto. Os valores são seus — o nome e a altura não são conferidos, porque são dados pessoais. Escrito `1` no lugar de `1.0`, a altura é recusada: o enunciado pede um número com casas decimais.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p11-1',
      enunciado: 'Um arquivo já com três linhas gravadas é aberto com o modo `"w"`. O que acontece com o que já estava lá?',
      alternativas: [
        'Continua onde está, e o que for escrito agora entra depois das três linhas',
        'Só é apagado se o que for escrito agora tiver mais de três linhas',
        'Vai para o fim do arquivo, guardado para o programa ler antes de escrever',
        'É apagado: o modo `"w"` esvazia o arquivo antes de a primeira linha ser escrita',
      ],
      correta: 3,
      explicacao:
        'O modo `"w"` abre para escrita **do zero**: se o arquivo existia, o conteúdo dele vai embora. Para escrever no fim sem apagar, o modo é `"a"`, de acrescentar. É por isso que o `open` pergunta primeiro o que você quer fazer com o arquivo, e só depois deixa você escrever.',
    },
    {
      id: 'p11-2',
      enunciado: 'Para que serve o `with` em `with open("diario.txt") as arquivo:`?',
      alternativas: [
        'Garante que o arquivo será fechado, inclusive se o programa falhar no meio do bloco',
        'Guarda o conteúdo do arquivo na memória, para que o disco não precise ser lido duas vezes',
        'Impede que outro programa abra o mesmo arquivo enquanto este estiver trabalhando nele',
        'Confere se o arquivo existe antes de abrir, e cria um vazio quando ele não existe',
      ],
      correta: 0,
      explicacao:
        'O `with` é quem fecha o arquivo, dê certo ou dê errado o que está dentro do bloco. Sem ele, você teria de lembrar de chamar `close()` em todos os caminhos do programa — inclusive no caminho em que algo deu errado — e esquecer isso deixa o arquivo aberto.',
    },
    {
      id: 'p11-3',
      enunciado: 'O que o `except FileNotFoundError:` faz em um programa que tenta abrir um arquivo?',
      alternativas: [
        'Verifica antes se o arquivo existe, e pula o `try` quando ele não existe',
        'Cria o arquivo vazio, para que o programa continue sem precisar de outra tentativa',
        'Diz o que fazer quando o erro acontece, em vez de deixar o programa parar naquele ponto',
        'Transforma o erro em aviso e segue lendo o arquivo assim mesmo, com o conteúdo vazio',
      ],
      correta: 2,
      explicacao:
        'O `except` é o plano B da parte arriscada: o `try` tenta, e o erro com **esse nome** cai ali dentro. O programa não para; ele escolhe outro caminho. Repare que o nome importa: se acontecer um erro diferente, ele não é pego por esse `except`.',
    },
    {
      id: 'p11-4',
      enunciado: 'Por que ler um arquivo linha por linha com `for` costuma vir com um `rstrip()` no `print`?',
      alternativas: [
        'Porque o `rstrip()` apaga os caracteres acentuados, que o Python não consegue imprimir',
        'Porque cada linha lida já traz o `\\n` do fim, e o `print` pularia a linha duas vezes',
        'Porque sem ele o Python mostra o caminho completo do arquivo antes de cada linha',
        'Porque o arquivo guarda um espaço em branco no começo de cada linha, e ele atrapalha a leitura',
      ],
      correta: 1,
      explicacao:
        'A linha que vem do arquivo inclui o `\\n` que separava aquela linha da próxima. Como o `print` já pula uma linha depois de mostrar, o resultado seriam duas quebras seguidas — uma linha em branco entre cada linha do texto. O `rstrip()` tira esses espaços em branco do fim.',
    },
    {
      id: 'p11-5',
      enunciado: 'Que vantagem um arquivo `json` tem sobre um arquivo que você mesmo escreve com `write` e separadores?',
      alternativas: [
        'O `json` guarda a estrutura — listas e dicionários — e o tipo de cada valor, e o arquivo continua legível',
        'O `json` ocupa menos espaço, porque guarda os números em forma compacta em vez de texto',
        'O `json` não pode ser aberto por outras linguagens, o que protege os dados de quem não tem a senha',
        'O `json` guarda o programa inteiro junto do dado, para que ele possa ser relido sem o código',
      ],
      correta: 0,
      explicacao:
        'Com `write` você é obrigado a inventar um formato e a combiná-lo entre quem grava e quem lê — e a partir da segunda estrutura, cada campo novo vira um problema. O `json` já resolve isso: dicionário vira objeto, lista vira lista, número vira número, e qualquer linguagem lê o mesmo arquivo.',
    },
  ],
}
