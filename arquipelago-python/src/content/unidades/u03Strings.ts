import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 3 — A Ilha das Palavras.
 * Capítulo 2 do livro, recorte 2b: strings e seus métodos.
 * (A decisão D-001 dividiu o capítulo 2 em duas unidades.)
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 */
export const u03Strings: ConteudoDaUnidade = {
  id: 'u03-strings-por-dentro',

  missao:
    'Ao final desta unidade, você vai limpar, comparar, juntar e formatar textos — e vai saber por que duas palavras iguais podem não ser iguais para o computador.',

  leitura: {
    parte:
      'Capítulo 2 do livro — as partes sobre strings: aspas simples e duplas, mudança de maiúsculas e minúsculas, remoção de espaços em branco, concatenação e interpolação.',
    porque:
      'É onde o livro apresenta os primeiros métodos, com exemplos bem escolhidos. Preste atenção especial na parte sobre espaços em branco: é o assunto que mais causa confusão silenciosa em quem está começando.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Um texto em Python se chama string. Você já usou: é o que vai entre aspas. Pode ser aspa simples ou dupla, e as duas funcionam — o Python só exige que a aspa de abertura e a de fechamento sejam do mesmo tipo.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'As duas formas, e o caso em que a escolha importa',
      codigo:
        "a = 'Ilha'\nb = \"Ilha\"\nprint(a == b)          # True: são o mesmo texto\nc = \"Ele disse 'oi'\"   # aspas dentro de aspas: escolha a de fora",
    },
    {
      tipo: 'paragrafo',
      texto:
        'Rode esse código e repare no `True`. Duas strings são iguais quando têm exatamente os mesmos caracteres. Exatamente: maiúscula não é igual a minúscula, e um espaço a mais também conta.',
    },
    {
      tipo: 'destaque',
      titulo: 'O espaço invisível',
      texto:
        'Espaço no começo ou no fim de um texto é a causa mais comum de bug silencioso para quem está começando. Nada quebra, nada dá erro — e a comparação simplesmente dá `False`. Veio de onde? De um `input()` respondido com espaço sobrando, de um copiar e colar, de uma vírgula que virou espaço. Para ver o invisível, coloque o texto entre colchetes ao imprimir: `print("[" + texto + "]")`.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Vendo o que não se vê',
      codigo:
        'digitado = "Ana "\nprint("[" + digitado + "]")     # [Ana ]\nprint(digitado == "Ana")          # False — por causa do espaço',
    },
    {
      tipo: 'paragrafo',
      texto:
        'A correção tem nome: `.strip()` remove espaços (e quebras de linha) do começo e do fim. Note o ponto antes do nome, e os parênteses depois: esse é o formato de um método — uma ação que pertence àquele texto.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Os três métodos que você mais vai usar no começo',
      codigo:
        'texto = "  ilha das palavras  "\nprint("[" + texto.strip() + "]")   # [ilha das palavras]\nprint(texto.upper())                  # ILHA DAS PALAVRAS\nprint(texto.title())                  # Ilha Das Palavras',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Importante: esses métodos **não modificam** o texto original. Eles devolvem um novo texto com a mudança aplicada. Se você não guardar o resultado em algum lugar, a mudança desaparece.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A diferença entre usar o resultado e perdê-lo',
      codigo:
        'texto = "  ilha  "\ntexto.strip()            # calculou e jogou fora\nprint(texto)             # "  ilha  " — continua igual\n\ntexto = texto.strip()    # agora sim\nprint(texto)             # "ilha"',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Juntar textos se chama concatenação, e usa o `+`. Funciona, mas vira um emaranhado de sinais quando há muitas partes — e obriga a converter todo número com `str()`. Existe uma forma melhor, que o Python ganhou em 2016 e que hoje é o padrão.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A mesma frase, das duas formas',
      codigo:
        'nome = "Ana"\npontos = 15\n\nprint("Jogadora " + nome + " fez " + str(pontos) + " pontos.")\nprint(f"Jogadora {nome} fez {pontos} pontos.")',
    },
    {
      tipo: 'paragrafo',
      texto:
        'A segunda forma se chama f-string. O `f` antes das aspas avisa que ali dentro existem chaves a serem substituídas pelo valor das variáveis. Repare que o número entrou sem `str()`: a f-string converte sozinha. É mais curta de escrever e muito mais fácil de ler depois.',
    },
    {
      tipo: 'avisoDeVersao',
      titulo: 'Aviso: o livro é de 2016, e isto mudou desde então',
      texto:
        'O livro ensina com detalhe o método `.format()`, que era a forma recomendada na época e continua funcionando: `"Jogadora {} fez {} pontos".format(nome, pontos)`. Vale conhecer, porque você vai encontrar `.format()` em código por aí. Mas para escrever código novo hoje, use f-strings: são mais legíveis e menos sujeitas a erro de posição. Este arquipélago usa f-strings nos exemplos.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Um detalhe que confunde no começo: dentro de uma f-string, o conteúdo das chaves é **código**, não texto. Você pode inclusive fazer contas ali dentro, como em `f"{pontos * 2}"`. E, se as chaves não tiverem nada dentro, o Python as trata como texto normal e as mostra — o que também é fonte de confusão.',
    },
  ],

  pratica: [
    {
      id: 'e3-1',
      enunciado:
        'Peça um nome ao usuário e mostre-o em letras maiúsculas, sem espaços sobrando nas pontas.',
      dica: 'Você pode encadear os métodos: primeiro tirar o espaço, depois mudar a caixa.',
      conferencia:
        'Digite "  ana  " e confira que a resposta é "ANA", sem espaços antes ou depois.',
      solucao: 'nome = input("Seu nome: ")\nprint(nome.strip().upper())',
    },
    {
      id: 'e3-2',
      enunciado:
        'Escreva um programa que junte nome e idade numa frase usando f-string, e depois mostre a quantidade de letras do nome.',
      dica: '`len()` devolve o número de caracteres de um texto.',
      conferencia:
        'A frase aparece com os valores no lugar das chaves, e o número de letras é mostrado corretamente.',
      solucao:
        'nome = "Ana"\nidade = 34\nprint(f"{nome} tem {idade} anos.")\nprint(f"O nome tem {len(nome)} letras.")',
    },
    {
      id: 'e3-3',
      enunciado:
        'Reproduza o problema do espaço invisível: peça um texto, mostre-o entre colchetes e depois compare com o mesmo texto sem espaço.',
      dica: 'Você vai precisar comparar duas strings com `==` e imprimir o resultado.',
      conferencia:
        'Com a entrada "ilha ", a comparação com "ilha" mostra False; depois de aplicar `.strip()`, mostra True.',
      solucao:
        'digitado = input("Digite: ")\nprint("[" + digitado + "]")\nprint(digitado == "ilha")\nprint(digitado.strip() == "ilha")',
    },
  ],

  perguntas: [
    {
      id: 'p3-1',
      enunciado: 'O que o método `.strip()` faz?',
      alternativas: [
        'Remove todos os espaços de dentro do texto',
        'Remove espaços e quebras de linha do começo e do fim do texto',
        'Converte o texto para letras minúsculas',
        'Divide o texto em uma lista de palavras',
      ],
      correta: 1,
      explicacao:
        'Ele mexe apenas nas pontas. Espaços no meio do texto permanecem — o que costuma ser exatamente o desejado, e por isso o nome é "strip" e não "remove all spaces".',
    },
    {
      id: 'p3-2',
      enunciado: 'Depois de `texto = "  ilha  "` e `texto.strip()`, o que `print(texto)` mostra?',
      alternativas: [
        '"ilha", sem os espaços',
        'Um erro, porque o resultado foi perdido',
        '"ilha  ", sem os espaços da esquerda',
        '"  ilha  ", com os espaços',
      ],
      correta: 3,
      explicacao:
        'Métodos de texto devolvem um texto novo e não alteram o original. Sem guardar o resultado (`texto = texto.strip()`), a mudança é calculada e descartada. Não dá erro — o que torna a confusão pior.',
    },
    {
      id: 'p3-3',
      enunciado: 'O que a letra `f` faz em `f"Total: {pontos}"`?',
      alternativas: [
        'Avisa que as chaves ali dentro devem ser substituídas pelo valor das variáveis',
        'Define o texto como formato fixo, imutável',
        'Formata o número com casas decimais automáticas',
        'Transforma a frase em um arquivo',
      ],
      correta: 0,
      explicacao:
        'O `f` habilita a interpolação: o que está entre chaves é avaliado como código e o resultado entra no lugar. É por isso que números não precisam de `str()` dentro de uma f-string.',
    },
    {
      id: 'p3-4',
      enunciado: 'Por que `"Ana" == "ana"` devolve `False`?',
      alternativas: [
        'Porque o Python compara o tamanho das palavras primeiro',
        'Porque falta converter os dois textos com `str()`',
        'Porque maiúsculas e minúsculas são caracteres diferentes, e a comparação é exata',
        'Porque o operador `==` só funciona com números',
      ],
      correta: 2,
      explicacao:
        'A comparação é caractere por caractere, e "A" e "a" são caracteres distintos. Quando a intenção é comparar ignorando a caixa, é preciso normalizar os dois lados antes — por exemplo com `.lower()`.',
    },
    {
      id: 'p3-5',
      enunciado: 'O que `"4" + "5"` devolve?',
      alternativas: ['9', '"45"', '45', 'Um erro de tipo, como no caso de texto com número'],
      correta: 1,
      explicacao:
        'Os dois são textos, então o `+` junta em vez de somar: o resultado é o texto "45". Para somar de verdade, seria preciso converter: `int("4") + int("5")`. Esta é a raiz do `TypeError` que aparece quando se esquece a conversão.',
    },
  ],
}
