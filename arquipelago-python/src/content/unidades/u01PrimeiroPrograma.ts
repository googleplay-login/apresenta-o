import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 1 — A Praia do Primeiro Programa.
 * Capítulo 1 do livro: instalação, interpretador, primeiro programa e mensagens de erro.
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 */
export const u01PrimeiroPrograma: ConteudoDaUnidade = {
  id: 'u01-primeiro-programa',

  missao:
    'Ao final desta unidade, você vai abrir o terminal, conversar com o interpretador do Python e rodar um programa de três linhas escrito por você.',

  leitura: {
    parte:
      'Capítulo 1 do livro — a parte sobre instalar o Python, conferir se a instalação funcionou e rodar o primeiro programa.',
    porque:
      'O caminho de instalação muda de sistema para sistema, e o livro mostra o seu. Aqui vamos cuidar do que é igual em qualquer máquina: como se fala com o Python e como se lê o que ele responde.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'O Python não é um programa com janela e botões. Ele é um interpretador: um programa que lê o que você escreveu e executa aquilo, uma linha por vez, de cima para baixo. Você escreve, ele responde.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Para conversar com ele, você usa o terminal — uma janela onde se digita comandos como texto puro. Parece tarefa de outro século, e é mesmo: o terminal é a ferramenta mais direta que existe para falar com o computador, e é onde a maior parte do trabalho real em programação acontece.',
    },
    {
      tipo: 'codigo',
      linguagem: 'terminal',
      legenda: 'Conferindo se o Python está instalado. A resposta pode ser um número diferente do mostrado — o que importa é começar com 3.',
      codigo: 'python3 --version',
    },
    {
      tipo: 'codigo',
      linguagem: 'terminal',
      legenda: 'A resposta do computador. Se aparecer uma mensagem de erro, o Python não está instalado: volte ao capítulo 1 do livro.',
      codigo: 'Python 3.14.2',
    },
    {
      tipo: 'destaque',
      titulo: 'Por que às vezes se escreve python e às vezes python3',
      texto:
        'Em muitos sistemas, `python` já é o Python 3; em outros, `python` aponta para uma versão antiga e `python3` é o moderno. Quando `python3` funcionar, use `python3`. Nos exemplos deste arquipélago, aparecem as duas formas porque as duas funcionam em algum sistema.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Agora o primeiro programa. Um programa em Python é um arquivo de texto com a extensão `.py`. Nada de editor especial, nada de formatação escondida: texto puro.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Arquivo primeiro_programa.py',
      codigo: 'print("Olá, arquipélago!")\nprint("Eu escrevi este programa.")',
    },
    {
      tipo: 'codigo',
      linguagem: 'terminal',
      legenda: 'Pedindo ao Python para executar o arquivo',
      codigo: 'python3 primeiro_programa.py',
    },
    {
      tipo: 'paragrafo',
      texto:
        '`print` quer dizer "imprima na tela". Os parênteses carregam o que deve aparecer, e as aspas avisam que aquele conteúdo é texto — não um comando. Trocar as aspas por outra coisa muda tudo, e é o erro mais comum do primeiro dia.',
    },
    {
      tipo: 'destaque',
      titulo: 'Mensagem de erro é informação, não castigo',
      texto:
        'Quando o Python encontra algo que não entende, ele para e explica onde parou. Essa mensagem é a ferramenta de trabalho mais útil que você vai ter. Ler a última linha primeiro economiza muito tempo: ela costuma dizer exatamente o que faltou.',
    },
    {
      tipo: 'codigo',
      linguagem: 'terminal',
      legenda: 'O que aparece quando faltam as aspas. Repare que o Python aponta o lugar.',
      codigo:
        '  File "primeiro_programa.py", line 1\n    print(Olá)\n          ^^^\nSyntaxError: invalid syntax. Perhaps you forgot a comma?',
    },
    {
      tipo: 'paragrafo',
      texto:
        'A palavra `SyntaxError` significa "erro de escrita": o Python não chegou nem a tentar executar. Existe outra família de erros, os de execução, que só aparecem quando aquela linha é realmente rodada — por exemplo `NameError`, quando você usa um nome que não existe. São problemas diferentes e pedem correções diferentes.',
    },
    {
      tipo: 'avisoDeVersao',
      titulo: 'Aviso: o livro é de 2016, e isto mudou desde então',
      texto:
        'O livro também ensina o Python 2, onde se escrevia `print "Olá"` — sem parênteses. Isso não funciona no Python 3 e nunca vai funcionar. Se você encontrar essa forma no capítulo, trate como história: hoje o `print` é sempre uma função, com parênteses. Os exemplos deste arquipélago usam apenas Python 3.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Uma observação prática que economiza sustos: se você rodar `python3` sem dizer qual arquivo, o Python abre um modo de conversa direta, mostrando `>>>`. Nesse modo ele espera uma linha sua e responde na hora. Para sair, digite `exit()`. É ótimo para testar uma ideia pequena sem criar arquivo nenhum.',
    },
  ],

  pratica: [
    {
      id: 'e1-1',
      enunciado:
        'Abra o terminal e descubra qual versão do Python está instalada. Anote o número.',
      conferencia: 'Você deve ter obtido algo como "Python 3.14.2" — começando com 3.',
      solucao: 'python3 --version',
    },
    {
      id: 'e1-2',
      enunciado:
        'Crie um arquivo chamado `sobre_mim.py` que mostre duas linhas na tela: seu nome e uma frase sobre o que você quer aprender. Use `print` duas vezes.',
      dica: 'Cada `print` precisa de parênteses e de aspas em volta do texto.',
      conferencia:
        'Ao rodar `python3 sobre_mim.py`, as duas linhas aparecem, na ordem em que você escreveu.',
      solucao: 'print("Meu nome é Ana")\nprint("Quero aprender a programar para automatizar tarefas")',
    },
    {
      id: 'e1-3',
      enunciado:
        'Provoca um erro de propósito: apague as aspas de um dos textos do exercício anterior, rode o programa e leia a mensagem. Depois conserte.',
      dica: 'Erro provocado de propósito é a forma mais rápida de aprender a ler mensagens.',
      conferencia:
        'Você deve ter visto "SyntaxError" e o Python apontando o arquivo e a linha. Depois de consertar, o programa roda sem mensagem nenhuma de erro.',
      solucao: 'print(Meu nome é Ana)   →  SyntaxError\nprint("Meu nome é Ana")  →  funciona',
    },
  ],

  perguntas: [
    {
      id: 'p1-1',
      enunciado: 'O que o interpretador do Python faz quando você pede para ele rodar um arquivo?',
      alternativas: [
        'Traduz o arquivo inteiro para outra linguagem e o guarda em disco',
        'Lê o arquivo e executa as instruções uma por vez, de cima para baixo',
        'Envia o arquivo para um serviço na internet, que devolve o resultado',
        'Compila o arquivo e gera um programa executável independente',
      ],
      correta: 1,
      explicacao:
        'O interpretador lê e executa na ordem escrita, uma instrução por vez. É isso que permite testar uma ideia rapidamente, sem esperar uma etapa de compilação.',
    },
    {
      id: 'p1-2',
      enunciado: 'Para que servem as aspas em `print("Olá")`?',
      alternativas: [
        'Decorar a saída, deixando o texto em destaque na tela',
        'Indicar que "Olá" é texto, e não o nome de algo que o Python deveria procurar',
        'Avisar ao Python que aquela linha deve ser ignorada',
        'Separar o comando do restante do arquivo',
      ],
      correta: 1,
      explicacao:
        'Sem aspas, o Python entende que "Olá" seria um nome definido em algum lugar do programa. Com aspas, ele entende que é texto a ser mostrado exatamente assim.',
    },
    {
      id: 'p1-3',
      enunciado: 'O que significa `SyntaxError`?',
      alternativas: [
        'O programa rodou até o fim, mas mostrou a resposta errada',
        'Faltou instalar uma biblioteca que o programa usa',
        'O Python não conseguiu nem entender a escrita do programa, e parou antes de executar',
        'O arquivo não foi encontrado no disco',
      ],
      correta: 2,
      explicacao:
        'Erro de sintaxe é erro de escrita, e acontece antes da execução. É diferente de um erro de execução, que só aparece quando aquela linha chega a rodar.',
    },
    {
      id: 'p1-4',
      enunciado:
        'Você roda `python3 programa.py` e não acontece nada, nem erro, nem saída. O arquivo provavelmente:',
      alternativas: [
        'Está vazio, ou tem apenas linhas de comentário — nada que produza saída',
        'Foi salvo no lugar errado e o Python abriu outro arquivo',
        'Tem erro de sintaxe que o Python ignorou',
        'Precisa ser executado como administrador',
      ],
      correta: 0,
      explicacao:
        'Um programa sem instruções que produzam saída termina em silêncio, e isso é sucesso. Silêncio não é erro: é ausência de pedido para mostrar algo.',
    },
    {
      id: 'p1-5',
      enunciado:
        'Se você rodar `python3` sem indicar nenhum arquivo, o que acontece?',
      alternativas: [
        'O Python mostra uma mensagem de erro e encerra',
        'O Python apaga o último arquivo executado',
        'O Python abre uma conversa direta, mostrando `>>>` para você digitar linhas e ver a resposta na hora',
        'O Python instala a versão mais nova automaticamente',
      ],
      correta: 2,
      explicacao:
        'É o modo interativo. Ele serve para testar uma ideia pequena sem criar arquivo, e mostra o resultado assim que você aperta Enter. Para sair, digite `exit()`.',
    },
  ],
}
