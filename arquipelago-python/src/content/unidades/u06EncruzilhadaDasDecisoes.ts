import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 6 — A Encruzilhada das Decisões.
 * Capítulo 5 do livro: testes condicionais, if, elif, else.
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 */
export const u06EncruzilhadaDasDecisoes: ConteudoDaUnidade = {
  id: 'u06-encruzilhada-das-decisoes',

  missao:
    'Ao final desta unidade, você vai escrever programas que escolhem o que fazer: comparar valores, combinar condições com `and`, `or` e `not`, perguntar se algo está dentro de uma lista e decidir entre vários caminhos com `if`, `elif` e `else`.',

  leitura: {
    parte:
      'Capítulo 5 do livro — as partes sobre testes condicionais, `if`, `if`/`else`, a cadeia de `if`/`elif`/`else` e o uso de condições com listas.',
    porque:
      'Até aqui o programa fazia sempre a mesma coisa, na mesma ordem. Neste capítulo ele passa a escolher, e aparecem duas armadilhas que valem atenção: `=` não é `==`, e o primeiro teste verdadeiro de uma cadeia `elif` encerra a decisão inteira.',
    oQueObservar: [
      'A diferença entre `=`, `==` e `!=`: um guarda, outro compara igualdade, o terceiro compara diferença. Repare que o livro volta a esse ponto mais de uma vez, porque é o erro que aparece em quase todo programa iniciante.',
      'A ordem dos `elif`: o primeiro cujo teste dá certo vence, e os seguintes nem são avaliados. Uma condição ampla colocada antes engole os casos que vêm depois.',
      'Como o `and` e o `or` mudam o resultado: `and` exige os dois lados verdadeiros, `or` exige um. Trocar um pelo outro é a diferença entre aceitar todo mundo e não aceitar ninguém.',
      'O uso de `in` com listas: o jeito de perguntar se um valor está dentro de uma coleção sem escrever laço nenhum. É o que transforma uma verificação de cinco itens em uma linha.',
    ],
    semOLivro:
      'Sem o livro em mãos, a unidade continua inteira: o diagrama mostra os dois caminhos de uma decisão, e a explicação cobre comparação, `and`, `or`, `not`, `in` e a cadeia de `elif` com a ordem que importa. O que o livro acrescenta é a lista longa de testes condicionais para treinar, que aqui virou a conferência dos seus próprios programas.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Uma decisão no programa é uma pergunta com resposta de sim ou não, seguida do que fazer em cada caso. A pergunta é uma condição; o Python responde `True` ou `False`; o bloco indentado abaixo roda só quando a resposta for `True`.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Dois caminhos, um deles escolhido',
      codigo:
        'idade = 20\n\nif idade >= 18:\n    print("pode entrar sozinho")\nelse:\n    print("entra com um responsável")',
    },
    {
      tipo: 'diagrama',
      titulo: 'A bifurcação',
      descricao:
        'Toda decisão tem três partes: a pergunta, o caminho de quem responde sim e o caminho de quem responde não. O `else` é opcional — sem ele, o programa simplesmente segue quando a resposta é não.',
      partes: [
        { rotulo: 'a pergunta', valor: 'idade >= 18', nota: 'vale True ou False' },
        { rotulo: 'se for sim', valor: '"pode entrar sozinho"', nota: 'o bloco indentado sob o if' },
        { rotulo: 'se for não', valor: '"entra com um responsável"', nota: 'o bloco indentado sob o else' },
      ],
    },
    {
      tipo: 'destaque',
      titulo: 'Um sinal guarda, dois sinais comparam',
      texto:
        '`idade = 20` guarda o valor na variável. `idade == 20` pergunta se os dois são iguais, e devolve `True` ou `False`. Parecidos, com efeitos opostos: escrever o primeiro onde o segundo era esperado derruba o programa com `SyntaxError`, antes mesmo de executar.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Quando existem mais de dois caminhos, o encadeamento é feito com `elif`. Ele é lido de cima para baixo, e a leitura para no primeiro teste que der certo.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Quatro caminhos, um escolhido',
      codigo:
        'hora = 14\n\nif hora < 6:\n    print("madrugada")\nelif hora < 12:\n    print("manhã")\nelif hora < 18:\n    print("tarde")\nelse:\n    print("noite")',
    },
    {
      tipo: 'destaque',
      titulo: 'A ordem dos testes decide o resultado',
      texto:
        'No exemplo acima, a primeira condição é a mais estreita (`hora < 6`) e as seguintes vão alargando. Se a ordem fosse invertida — `hora < 18` primeiro —, qualquer hora do dia cairia ali e as outras linhas nunca seriam alcançadas. Condição mais específica primeiro é a regra prática.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Condições podem ser combinadas. `and` exige que os dois lados sejam verdadeiros; `or` se contenta com um; `not` inverte o que vem depois dele. Os parênteses servem para dizer qual combinação você quer primeiro.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Combinando condições',
      codigo:
        'temperatura = 28\nchovendo = False\n\nprint(temperatura > 25 and not chovendo)   # True — as duas partes valem\nprint(temperatura > 30 or chovendo)        # False — nenhuma das duas vale',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Para perguntar se um valor está dentro de uma lista existe `in`, e ele responde `True` ou `False`. É a forma curta de uma verificação que, sem ele, precisaria de um laço inteiro.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Perguntando pela lista inteira',
      codigo:
        'convidados = ["ana", "bia", "caio"]\npedido = "bia"\n\nif pedido in convidados:\n    print("está na lista")\nelse:\n    print("não está na lista")',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'O erro que todo mundo comete uma vez',
      codigo: 'idade = 18\n\nif idade = 18:\n    print("maior de idade")',
      naoRodaNoConsole:
        'Este trecho termina em erro de propósito: `=` guarda valor e `==` compara, e o Python recusa o programa **antes** de executá-lo. Rode no console e leia o `SyntaxError` — a mensagem aponta a linha e o lugar exato do problema, e reconhecê-la economiza bastante tempo.',
    },
    {
      tipo: 'destaque',
      titulo: 'Decidir não é adivinhar',
      texto:
        'Uma condição bem escrita pergunta exatamente o que o programa precisa saber. `if idade > 18` e `if idade >= 18` parecem a mesma coisa e diferem em um valor — justamente o valor que costuma importar: a idade mínima, o preço exato, o dia do vencimento.',
    },
  ],

  pratica: [
    {
      id: 'e6-1',
      enunciado:
        'Comece com `idade = 15`. Decida em que faixa a pessoa está — até 11 anos é "criança", de 12 a 17 é "adolescente", 18 ou mais é "adulto" — e guarde a palavra escolhida na variável `faixa`. Depois imprima `faixa`.',
      dica: 'Uma cadeia de `if`/`elif`/`else`, com a condição mais estreita primeiro.',
      conferencia: 'A tela mostra a palavra "adolescente", e a variável `faixa` guarda exatamente essa palavra.',
      solucao:
        'idade = 15\n\nif idade < 12:\n    faixa = "criança"\nelif idade < 18:\n    faixa = "adolescente"\nelse:\n    faixa = "adulto"\n\nprint(faixa)',
      correcao: {
        saidaEsperada: ['adolescente'],
        valoresEsperados: [
          { rotulo: '`idade` guarda 15', expressao: 'idade', igualA: '15' },
          { rotulo: '`faixa` guarda a palavra escolhida', expressao: 'faixa', tipoEsperado: 'str' },
          {
            rotulo: 'Para 15 anos, a faixa é "adolescente"',
            expressao: 'faixa',
            igualA: "'adolescente'",
          },
        ],
        limite:
          'A conferência olha a idade guardada, o valor de `faixa` e procura a palavra na saída. Ela não julga como você escreveu as condições, e não confere maiúsculas: se `faixa` guarda a palavra certa para aquela idade, está certo.',
      },
    },
    {
      id: 'e6-2',
      enunciado:
        'Crie uma lista chamada `convidados` com três nomes e uma variável `pedido` com um nome que **não** esteja na lista. Use `in` para decidir e imprima uma frase de cada caso: quem está na lista entra, quem não está espera. Explique num comentário por que você usou `in` em vez de comparar nome por nome.',
      dica: '`if pedido in convidados:` responde a pergunta inteira, para qualquer tamanho de lista.',
      conferencia: 'Como o pedido não está na lista, aparece a frase de espera — e não a de entrada.',
      solucao:
        'convidados = ["ana", "bia", "caio"]\npedido = "davi"\n\n# `in` pergunta pela lista inteira de uma vez: não preciso comparar nome por nome,\n# e continua funcionando quando a lista crescer.\nif pedido in convidados:\n    print("pode entrar")\nelse:\n    print("aguarde na recepção")',
      correcao: {
        valoresEsperados: [
          { rotulo: '`convidados` guarda uma lista', expressao: 'convidados', tipoEsperado: 'list' },
          { rotulo: 'A lista tem três nomes', expressao: 'len(convidados)', igualA: '3' },
          { rotulo: '`pedido` é texto', expressao: 'pedido', tipoEsperado: 'str' },
          {
            rotulo: 'O pedido não está na lista, como o enunciado pede',
            expressao: 'pedido in convidados',
            igualA: 'False',
          },
        ],
        estrutura: { comentario: true },
        limite:
          'A conferência olha se `convidados` é uma lista de três itens, se `pedido` é texto, se ele realmente **não** está na lista e se existe um comentário no seu código. Ela não lê o comentário e não julga a frase que você escolheu para imprimir.',
      },
    },
    {
      id: 'e6-3',
      enunciado:
        'Numa atração, entra quem tem 12 anos ou mais **e** está acompanhado, **ou** quem tem 16 anos ou mais. Comece com `idade = 14` e `acompanhada = True`, guarde a decisão na variável `podeEntrar` — um valor verdadeiro ou falso, não um texto — e imprima `podeEntrar` junto de uma frase que diga o que foi decidido.',
      dica: '`and` exige os dois lados; `or` exige um. Os parênteses deixam claro qual combinação vem primeiro.',
      conferencia:
        'Aparece `True`, e `podeEntrar` guarda um valor verdadeiro ou falso — e não o texto "sim".',
      solucao:
        'idade = 14\nacompanhada = True\n\npodeEntrar = (idade >= 12 and acompanhada) or idade >= 16\n\nprint("pode entrar?", podeEntrar)',
      correcao: {
        valoresEsperados: [
          { rotulo: '`idade` guarda 14', expressao: 'idade', igualA: '14' },
          {
            rotulo: '`acompanhada` guarda um valor verdadeiro ou falso',
            expressao: 'acompanhada',
            tipoEsperado: 'bool',
          },
          {
            rotulo: '`podeEntrar` guarda um valor verdadeiro ou falso, e não um texto',
            expressao: 'podeEntrar',
            tipoEsperado: 'bool',
          },
          {
            rotulo: 'Com 14 anos e acompanhada, a decisão é entrar',
            expressao: 'podeEntrar',
            igualA: 'True',
          },
        ],
        limite:
          'A conferência olha os valores guardados no fim do programa: a idade, o acompanhamento e a decisão — que precisa ser um valor verdadeiro ou falso, e não o texto "sim" nem "não". Ela não julga a frase que você imprimiu nem o jeito como você escreveu a condição.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p6-1',
      enunciado: 'Qual é a diferença entre `=` e `==` no Python?',
      alternativas: [
        'Não há diferença: os dois comparam se dois valores são iguais',
        '`=` guarda um valor num nome; `==` compara dois valores e devolve verdadeiro ou falso',
        '`=` serve para números e `==` serve para textos e listas',
        '`==` guarda um valor no nome, e o `=` pergunta se os dois valores são iguais',
      ],
      correta: 1,
      explicacao:
        'Confundir os dois é o erro que mais aparece no começo: `if idade = 18:` derruba o programa com `SyntaxError`, porque o Python recusa a atribuição dentro da condição antes mesmo de executar.',
    },
    {
      id: 'p6-2',
      enunciado: 'Numa cadeia de `if`/`elif`/`else`, quantos blocos são executados?',
      alternativas: [
        'Todos os blocos cuja condição for verdadeira, em ordem',
        'Sempre dois: um do `if` e um do `else`',
        'Depende de quantos `elif` você escreveu na cadeia',
        'No máximo um: o primeiro bloco cuja condição for verdadeira',
      ],
      correta: 3,
      explicacao:
        'A cadeia é lida de cima para baixo e para no primeiro teste verdadeiro — os seguintes nem chegam a ser avaliados. Por isso a ordem importa: uma condição ampla colocada antes engole os casos que vinham depois.',
    },
    {
      id: 'p6-3',
      enunciado:
        'Com `temperatura = 32` e `chovendo = False`, o que a expressão `temperatura > 30 or chovendo` devolve?',
      alternativas: [
        'True, porque um dos lados é verdadeiro',
        'False, porque os dois lados precisam ser verdadeiros',
        'True, porque o `or` sempre devolve verdadeiro quando há números',
        'Um erro, porque não dá para comparar número com verdadeiro ou falso',
      ],
      correta: 0,
      explicacao:
        'O `or` pede um lado verdadeiro, não os dois: `temperatura > 30` já basta para o resultado ser `True`. Se fosse `and`, o resultado seria `False`, porque `chovendo` não é verdadeiro.',
    },
    {
      id: 'p6-4',
      enunciado: 'Você quer saber se o nome "bia" está na lista `convidados`. Qual é a forma direta?',
      alternativas: [
        'if convidados == "bia":',
        'if "bia" = convidados:',
        'if "bia" in convidados:',
        'if convidados.append("bia"):',
      ],
      correta: 2,
      explicacao:
        'O `in` pergunta pela lista inteira e responde verdadeiro ou falso, sem laço e sem contador. Comparar a lista com um item (`==`) perguntaria se a lista **é** o item, o que nunca é verdade.',
    },
    {
      id: 'p6-5',
      enunciado:
        'Para decidir se alguém entra sozinho, a condição é `idade >= 18`. O que muda se você escrever `idade > 18`?',
      alternativas: [
        'Nada: as duas condições aceitam exatamente a mesma faixa de idades',
        'Quem tem exatamente 18 anos passa a ser recusado',
        'Quem tem menos de 18 anos passa a ser aceito',
        'O programa passa a dar erro sempre que a idade for 18',
      ],
      correta: 1,
      explicacao:
        'O `>=` inclui o limite e o `>` exclui. A diferença aparece em um único valor — e costuma ser exatamente o valor que importa: a idade mínima, o preço exato, o dia do vencimento.',
    },
  ],
}
