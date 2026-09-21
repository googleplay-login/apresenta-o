import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 2 — A Oficina das Variáveis.
 * Capítulo 2 do livro, recorte 2a: variáveis, nomes, print, números e comentários.
 * (A decisão D-001 dividiu o capítulo 2 em duas unidades.)
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 */
export const u02Variaveis: ConteudoDaUnidade = {
  id: 'u02-variaveis-e-print',

  missao:
    'Ao final desta unidade, você vai guardar valores em variáveis, mostrar resultados na tela, misturar números inteiros e decimais e deixar anotações no código para quem ler depois.',

  leitura: {
    parte:
      'Capítulo 2 do livro — as partes sobre variáveis, regras para dar nomes, números inteiros e decimais, a função `str()` e comentários.',
    porque:
      'O livro explica com calma as regras de nomes e a diferença entre tipos de número. Aqui vamos direto ao que costuma travar quem está começando: por que um número e um texto não se somam, e o que fazer com isso.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Uma variável é um nome que você dá a um valor, para não precisar repetir o valor toda vez. Você escolhe o nome; o Python guarda o valor e o devolve sempre que você chamar por ele.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Guardando valores e mostrando o resultado',
      codigo:
        'nome = "Ana"\nidade = 34\nprint(nome)\nprint(idade)',
    },
    {
      tipo: 'paragrafo',
      texto:
        'O sinal `=` aqui não significa "é igual a" como na matemática, e sim "guarde este valor neste nome". É uma instrução, e a ordem importa: o lado direito é calculado antes de ser guardado.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'O valor antigo é usado para calcular o novo',
      codigo: 'pontos = 10\npontos = pontos + 5\nprint(pontos)',
    },
    {
      tipo: 'codigo',
      linguagem: 'terminal',
      legenda: 'Resultado',
      codigo: '15',
    },
    {
      tipo: 'destaque',
      titulo: 'Regras para dar nome a uma variável',
      texto:
        'O nome pode ter letras, números e sublinhado, mas não pode começar com número, não pode ter espaço e não pode ser uma palavra que o Python já usa (como `print` ou `if`). Maiúscula e minúscula são nomes diferentes: `Total` e `total` são duas variáveis distintas. Escolher nomes descritivos não é enfeite: é o que faz o código ser entendido três meses depois.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Existem dois tipos de número que você vai usar o tempo todo, e eles se comportam de maneiras diferentes.',
    },
    {
      tipo: 'lista',
      titulo: 'Os dois tipos de número',
      itens: [
        '`int` — número inteiro, sem parte decimal: 7, -3, 1000.',
        '`float` — número com parte decimal: 3.5, -0.25, 2.0.',
      ],
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Duas divisões que dão resultados diferentes',
      codigo:
        'print(7 / 2)    # 3.5  — a divisão comum sempre devolve decimal\nprint(7 // 2)   # 3    — a divisão inteira descarta a parte decimal',
    },
    {
      tipo: 'avisoDeVersao',
      titulo: 'Aviso: o livro é de 2016, e isto mudou desde então',
      texto:
        'O livro explica que, no Python 2, dividir dois números inteiros descartava a parte decimal (`7 / 2` dava `3`). No Python 3 isso mudou: a divisão comum devolve decimal, e existe `//` quando você quer descartar a parte decimal de propósito. Se o capítulo mostrar o comportamento antigo, é história — nos exemplos daqui, `7 / 2` dá `3.5`.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Agora o travamento mais comum de quem começa: números e textos não se misturam sozinhos. Um número é calculado; um texto é mostrado. Quando o Python precisa juntar os dois, ele exige que você diga o que quer.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A conversão explícita com str()',
      codigo:
        'idade = 34\nprint("Idade: " + str(idade))   # funciona\nprint("Idade: " + idade)         # não funciona',
    },
    {
      tipo: 'codigo',
      linguagem: 'terminal',
      legenda: 'O erro da segunda linha, que você vai ver muitas vezes',
      codigo:
        'TypeError: can only concatenate str (not "int") to str',
    },
    {
      tipo: 'paragrafo',
      texto:
        'A mensagem está dizendo, em inglês técnico: você tentou juntar texto com número, e isso não é permitido. `str()` converte o número em texto e resolve. Existe um caminho mais confortável, que você vai conhecer na unidade das palavras, mas entender o `str()` primeiro ajuda a entender por que o outro caminho existe.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Por último, os comentários: linhas que o Python ignora completamente, começando com `#`. Servem para explicar uma decisão, marcar algo a fazer ou desativar uma linha durante um teste. Comentário não é decoração — é a única forma de passar adiante o motivo de uma escolha que não é óbvia no código.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      codigo:
        '# Cada ponto vale 10 unidades\ntotal = 10 * 10\nprint(total)   # confere o cálculo do placar',
    },
  ],

  pratica: [
    {
      id: 'e2-1',
      enunciado:
        'Crie três variáveis: seu nome, sua idade e sua altura em metros. Mostre cada uma em uma linha, com um rótulo antes do valor.',
      dica: 'Para juntar o rótulo com o número, use `str()` em volta do número.',
      conferencia:
        'As três linhas aparecem, e a altura é mostrada com a parte decimal (algo como 1.72).',
      solucao:
        'nome = "Ana"\nidade = 34\naltura = 1.72\nprint("Nome: " + nome)\nprint("Idade: " + str(idade))\nprint("Altura: " + str(altura))',
    },
    {
      id: 'e2-2',
      enunciado:
        'Guardou 47 figurinhas e ganhou mais 8. Usando uma variável, mostre quantas ficaram depois de dar 15 para um amigo. O resultado deve ser 40.',
      dica: 'Você pode reutilizar a mesma variável mais de uma vez, guardando o novo valor por cima do antigo.',
      conferencia: 'O número mostrado na tela é 40.',
      solucao: 'figurinhas = 47\nfigurinhas = figurinhas + 8\nfigurinhas = figurinhas - 15\nprint(figurinhas)',
    },
    {
      id: 'e2-3',
      enunciado:
        'Escreva um programa que mostre a média de três notas (7, 9 e 5) e que tenha um comentário explicando o cálculo. A média deve dar 7.0.',
      dica: 'A soma das notas dividida por 3 usa `/`, que devolve decimal.',
      conferencia: 'A tela mostra 7.0.',
      solucao: '# A média é a soma das três notas dividida pela quantidade de notas\nmedia = (7 + 9 + 5) / 3\nprint(media)',
    },
  ],

  perguntas: [
    {
      id: 'p2-1',
      enunciado: 'Depois de `pontos = 10` e `pontos = pontos + 5`, quanto vale `pontos`?',
      alternativas: ['5', '10', 'O Python recusa, porque o nome já existia', '15'],
      correta: 3,
      explicacao:
        'O valor antigo (10) é usado no cálculo do lado direito, e o resultado (15) passa a ser o novo valor guardado sob o mesmo nome. Guardar por cima do valor antigo é o uso normal de uma variável.',
    },
    {
      id: 'p2-2',
      enunciado: 'Qual destes é um nome de variável inválido em Python?',
      alternativas: ['2a_nota', 'total_de_pontos', 'media2', '_copia'],
      correta: 0,
      explicacao:
        'Nome não pode começar com número. `2a_nota` parece razoável para uma pessoa, mas o Python lê o "2" inicial como número e não consegue entender o resto.',
    },
    {
      id: 'p2-3',
      enunciado: 'Qual é o resultado de `7 / 2` no Python 3?',
      alternativas: ['3', '4', '3.5', 'Dá erro, porque 7 não é divisível por 2'],
      correta: 2,
      explicacao:
        'A divisão comum sempre devolve decimal quando o resultado não é exato. Para descartar a parte decimal de propósito, existe `//`, que daria 3.',
    },
    {
      id: 'p2-4',
      enunciado: 'Por que `print("Idade: " + 34)` dá erro?',
      alternativas: [
        'Porque o texto tem dois pontos, que é caractere reservado',
        'Porque o sinal de mais junta textos, e o 34 é número: é preciso converter com `str(34)` antes de juntar',
        'Porque `print` aceita apenas um argumento por vez',
        'Porque números grandes precisam de vírgula em vez de mais',
      ],
      correta: 1,
      explicacao:
        'O `+` faz coisas diferentes conforme o tipo: soma números e junta textos. Misturar os dois tipos na mesma operação é o que causa o `TypeError`, e a conversão explícita resolve.',
    },
    {
      id: 'p2-5',
      enunciado: 'Para que serve uma linha que começa com `#`?',
      alternativas: [
        'Para o Python executar aquela linha com prioridade',
        'Para marcar o arquivo como pronto para publicação',
        'Para dividir o programa em arquivos separados',
        'Para o Python ignorar completamente aquela linha, servindo de anotação para quem lê o código',
      ],
      correta: 3,
      explicacao:
        'O comentário é ignorado na execução. Ele existe para pessoas: explicar uma decisão, marcar algo a revisar ou desativar uma linha durante um teste.',
    },
  ],
}
