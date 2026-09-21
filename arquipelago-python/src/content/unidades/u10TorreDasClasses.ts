import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 10 — A Torre das Classes.
 * Capítulo 9 do livro: classes, objetos, atributos, métodos e herança.
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 */
export const u10TorreDasClasses: ConteudoDaUnidade = {
  id: 'u10-torre-das-classes',

  missao:
    'Ao final desta unidade, você vai escrever uma classe com `__init__`, criar objetos a partir dela, guardar dados em atributos, escrever métodos que mudam esse estado e reaproveitar uma classe com herança.',

  leitura: {
    parte:
      'Capítulo 9 do livro — as partes sobre criar e usar classes, trabalhar com atributos e métodos, valores padrão, herança e importar classes; e a parte final sobre a biblioteca padrão.',
    porque:
      'É o capítulo em que os dados e as ações que mexem neles passam a ficar no mesmo lugar. Depois dele, um programa deixa de ser uma lista de variáveis soltas e passa a ser um conjunto de coisas que sabem fazer o próprio trabalho.',
    oQueObservar: [
      'O método `__init__` e o papel do `self`: ele é o próprio objeto, e aparece como primeiro parâmetro de todo método. Repare que o livro nunca passa `self` na chamada — o Python faz isso por você.',
      'A diferença entre a **classe** e a **instância**: a classe é o molde, e cada objeto criado a partir dela tem os seus próprios valores. Dois objetos da mesma classe não compartilham atributos.',
      'Os métodos que mudam o estado: um método pode alterar um atributo do próprio objeto, e é assim que uma conta bancária passa a ter saldo em vez de só dizer o saldo.',
      'A parte de herança: a classe filha recebe tudo da mãe e acrescenta o que é dela — inclusive com `super().__init__()`, que é o jeito de a filha pedir à mãe que prepare a parte comum.',
    ],
    semOLivro:
      'Sem o livro em mãos, a unidade continua inteira: a explicação cobre a classe como molde, o `__init__`, o `self`, os atributos, um método que muda o estado, um valor padrão no `__init__` e a herança com `super()`. O que o livro acrescenta são as variações de projeto — quantas classes criar, o que é responsabilidade de cada uma — e o passeio pela biblioteca padrão.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Na unidade anterior, cada função fazia uma conta com o que recebia. Classes fazem outra coisa: juntam os **dados** e as **ações** que mexem neles num mesmo lugar. Em vez de um dicionário com as informações de um cachorro e uma função solta que faz ele sentar, existe um cachorro que sabe sentar. A classe é o molde; o objeto é o que sai do molde.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'O molde, e um objeto feito a partir dele',
      codigo:
        'class Cachorro:\n    def __init__(self, nome, idade):\n        self.nome = nome\n        self.idade = idade\n\n    def sentar(self):\n        return f"{self.nome} sentou."\n\nrex = Cachorro("Rex", 3)\nprint(rex.nome)\nprint(rex.sentar())',
    },
    {
      tipo: 'diagrama',
      titulo: 'A classe é o molde; o objeto é o que sai dele',
      descricao:
        'A classe descreve o que todo cachorro tem e faz. Cada objeto criado a partir dela guarda os próprios valores — mudar o nome de um não muda o do outro.',
      partes: [
        { rotulo: 'A classe', valor: 'Cachorro', nota: 'o molde: nome, idade e o que um cachorro faz' },
        { rotulo: 'Primeiro objeto', valor: 'rex = Cachorro("Rex", 3)', nota: 'guardou "Rex" e 3 no próprio espaço' },
        { rotulo: 'Segundo objeto', valor: 'bob = Cachorro("Bob", 5)', nota: 'mesmos atributos, valores diferentes' },
        { rotulo: 'O self', valor: 'self.idade = idade', nota: 'self é o objeto que está sendo preparado' },
      ],
    },
    {
      tipo: 'paragrafo',
      texto:
        'O `__init__` é o método que roda sozinho quando o objeto é criado. Os parâmetros dele são os dados que o objeto precisa para nascer, e cada linha com `self` guarda um valor **dentro daquele objeto**. Por isso o primeiro parâmetro é sempre `self`: é ele que diz "guarde isso em mim". Na hora de criar o objeto, você não escreve `self` — o Python entrega o objeto que acabou de nascer.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Dois objetos, dois estados independentes',
      codigo:
        'class Cachorro:\n    def __init__(self, nome, idade):\n        self.nome = nome\n        self.idade = idade\n\nrex = Cachorro("Rex", 3)\nbob = Cachorro("Bob", 5)\n\nrex.idade = 4\nprint(rex.idade)   # 4\nprint(bob.idade)   # 5 — o outro objeto não mudou',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Um método é uma função que mora na classe, e a diferença prática é o que ele pode fazer: enxergar e alterar os atributos do próprio objeto. É por isso que uma conta bancária consegue guardar o saldo e mudá-lo, em vez de devolver uma conta nova para você guardar.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Um método que muda o estado do próprio objeto',
      codigo:
        'class Conta:\n    def __init__(self, dono, saldo=0):\n        self.dono = dono\n        self.saldo = saldo\n\n    def depositar(self, valor):\n        self.saldo = self.saldo + valor\n\nconta = Conta("Ana", 100)\nconta.depositar(50)\nprint(conta.saldo)   # 150',
    },
    {
      tipo: 'destaque',
      titulo: 'Por que o saldo não vira um dicionário',
      texto:
        'Dava para guardar o dono e o saldo num dicionário e escrever uma função que soma o depósito. A diferença aparece com o tempo: no dicionário, qualquer parte do programa pode escrever `conta["saldo"] = 999` sem passar por regra nenhuma. Na classe, quem mexe no saldo é o método — e as regras ficam escritas num lugar só.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Quando duas classes têm muito em comum, uma pode herdar da outra. A classe filha recebe os métodos e os atributos da mãe e pode acrescentar o que é dela. Se a filha precisa preparar a parte comum, ela chama o `__init__` da mãe com `super()` — sem isso, os atributos que a mãe criaria não existem na filha.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A filha recebe o que a mãe faz e acrescenta o próprio jeito',
      codigo:
        'class Animal:\n    def __init__(self, nome):\n        self.nome = nome\n\n    def falar(self):\n        return "..."\n\nclass Gato(Animal):\n    def falar(self):\n        return "Miau!"\n\nmimi = Gato("Mimi")\nprint(mimi.nome)     # Mimi — veio da classe mãe\nprint(mimi.falar())  # Miau! — o jeito do gato',
    },
    {
      tipo: 'paragrafo',
      texto:
        'E se a filha também tem dados próprios? Aí o `__init__` da filha chama o da mãe e depois guarda o que é dela. A ordem importa: `super().__init__(...)` primeiro, para o objeto já ter o que a mãe prepara antes de a filha mexer nele.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A filha com dados próprios e a chamada ao __init__ da mãe',
      codigo:
        'class Animal:\n    def __init__(self, nome):\n        self.nome = nome\n\nclass Cachorro(Animal):\n    def __init__(self, nome, raca):\n        super().__init__(nome)\n        self.raca = raca\n\nrex = Cachorro("Rex", "vira-lata")\nprint(rex.nome)\nprint(rex.raca)',
    },
    {
      tipo: 'avisoDeVersao',
      titulo: 'A escrita da classe mudou desde o livro',
      texto:
        'O livro mostra `class Cachorro(object):` e, nos exemplos de herança, `super(Cachorro, self).__init__(...)`. Aquilo era o certo na época. Hoje se escreve `class Cachorro:` e `super().__init__(...)` — os parênteses vazios no `super()` fazem o Python descobrir sozinho de qual classe e de qual objeto você está falando. Você ainda encontra a forma antiga em código de dez anos atrás.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'A biblioteca padrão do Python é cheia de classes prontas, e usá-las é o caminho normal — ninguém escreve a própria estrutura de dados para resolver tudo. Importar uma classe é igual a importar uma função, e é assim que se aproveita código que já foi testado por muita gente.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Uma classe da biblioteca padrão, sem escrever nada',
      codigo:
        'from random import choice\n\ncores = ["azul", "verde", "amarelo"]\nprint(choice(cores))\n\nfrom collections import Counter\n\nvotos = ["azul", "verde", "azul"]\nprint(Counter(votos))',
    },
  ],

  pratica: [
    {
      id: 'e10-1',
      enunciado:
        'Escreva uma classe `Cachorro` com um `__init__` que receba `nome` e `idade`, e um método `sentar` que devolva `"<nome> sentou."`. Crie um cachorro chamado `rex`, com 3 anos, e mostre o nome, a idade e o que o método devolve.',
      dica: 'Dentro de um método, os dados do objeto vêm com `self.` na frente. O `__init__` guarda os valores que chegam por parâmetro.',
      conferencia:
        'Aparecem três linhas: `Rex`, `3` e `Rex sentou.` — a última vinda do método.',
      solucao:
        'class Cachorro:\n    def __init__(self, nome, idade):\n        self.nome = nome\n        self.idade = idade\n\n    def sentar(self):\n        return f"{self.nome} sentou."\n\nrex = Cachorro("Rex", 3)\nprint(rex.nome)\nprint(rex.idade)\nprint(rex.sentar())',
      correcao: {
        saidaEsperada: ['Rex', '3', 'Rex sentou.'],
        valoresEsperados: [
          {
            rotulo: 'O objeto `rex` foi criado com o nome recebido',
            expressao: 'rex.nome',
            igualA: "'Rex'",
          },
          {
            rotulo: 'A idade ficou guardada no objeto',
            expressao: 'rex.idade',
            igualA: '3',
          },
          {
            rotulo: 'O método `sentar` devolve um texto',
            expressao: 'rex.sentar()',
            tipoEsperado: 'str',
          },
          {
            rotulo: 'O método devolve a frase com o nome do cachorro',
            expressao: 'rex.sentar()',
            igualA: "'Rex sentou.'",
          },
        ],
        estrutura: { linhasNaoVazias: 3 },
        limite:
          'A conferência olha o que ficou guardado no objeto `rex` — nome e idade — e o que o método `sentar` **devolve**, com a frase do enunciado exatamente como está escrita. Ela não julga a organização interna da classe, não exige que a idade seja um número inteiro declarado no tipo e não confere se você usou f-string. Se o método só imprimir em vez de devolver, ela mostra `None` no lugar da frase.',
      },
    },
    {
      id: 'e10-2',
      enunciado:
        'Escreva uma classe `Conta` com `__init__` recebendo o dono e um saldo que já comece em zero quando ninguém disser outro valor. Ela precisa de um método `depositar` que some o valor ao saldo. Depois, crie `conta = Conta("Ana", 100)`, deposite 50 e mostre o saldo final.',
      dica: '`saldo=0` na definição do `__init__` é o valor padrão. O método soma ao atributo do próprio objeto: `self.saldo = self.saldo + valor`.',
      conferencia: 'Aparece 150 — o saldo inicial mais o depósito.',
      solucao:
        'class Conta:\n    def __init__(self, dono, saldo=0):\n        self.dono = dono\n        self.saldo = saldo\n\n    def depositar(self, valor):\n        self.saldo = self.saldo + valor\n\nconta = Conta("Ana", 100)\nconta.depositar(50)\nprint(conta.saldo)',
      correcao: {
        saidaEsperada: ['150'],
        valoresEsperados: [
          {
            rotulo: 'A conta nasce com o saldo informado',
            expressao: 'Conta("Bia", 100).saldo',
            igualA: '100',
          },
          {
            rotulo: 'Sem saldo informado, a conta nasce em zero',
            expressao: 'Conta("Bia").saldo',
            igualA: '0',
          },
          {
            rotulo: 'O dono ficou guardado no objeto',
            expressao: 'conta.dono',
            igualA: "'Ana'",
          },
          {
            rotulo: 'O depósito somou ao saldo que já havia',
            expressao: 'conta.saldo',
            igualA: '150',
          },
        ],
        estrutura: { linhasNaoVazias: 1 },
        limite:
          'A conferência cria duas contas para conferir o valor padrão, olha o dono e o saldo da conta `conta` depois do depósito que o seu programa fez, e procura o saldo na saída. Ela não chama o método por conta própria: quem deposita é o seu programa. E não julga como a soma foi escrita — soma direta, `+=` ou somar e guardar dão no mesmo.',
      },
    },
    {
      id: 'e10-3',
      enunciado:
        'Escreva uma classe `Animal` com `__init__` recebendo `nome` e um método `falar` que devolva `"..."`. Depois escreva `Gato`, herdando de `Animal`, com um método `falar` que devolva `"Miau!"`. Crie `mimi = Gato("Mimi")` e mostre o nome e o que o gato fala.',
      dica: 'A herança aparece nos parênteses do `class Gato(Animal):`. Chamar o `__init__` da mãe com `super().__init__(nome)` evita repetir o que já está pronto.',
      conferencia: 'Aparecem `Mimi` e `Miau!` — o nome veio da classe mãe.',
      solucao:
        'class Animal:\n    def __init__(self, nome):\n        self.nome = nome\n\n    def falar(self):\n        return "..."\n\nclass Gato(Animal):\n    def falar(self):\n        return "Miau!"\n\nmimi = Gato("Mimi")\nprint(mimi.nome)\nprint(mimi.falar())',
      correcao: {
        saidaEsperada: ['Mimi', 'Miau!'],
        valoresEsperados: [
          {
            rotulo: 'O gato herdou o atributo da classe mãe',
            expressao: 'mimi.nome',
            igualA: "'Mimi'",
          },
          {
            rotulo: 'O gato fala do jeito dele',
            expressao: 'mimi.falar()',
            igualA: "'Miau!'",
          },
          {
            rotulo: 'A classe mãe continua existindo e falando o de sempre',
            expressao: 'Animal("Bicho").falar()',
            igualA: "'...'",
          },
        ],
        estrutura: { linhasNaoVazias: 2 },
        limite:
          'A conferência olha o nome do objeto `mimi` — que só existe se a filha tiver chamado o `__init__` da mãe, direto ou com `super()` — e o que cada uma das duas classes devolve em `falar`. Ela não confere se você usou `super()`, se colocou um `__init__` na filha ou se repetiu o atributo nela: o que importa é o objeto nascer completo e cada classe falar do seu jeito.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p10-1',
      enunciado: 'Para que serve o `self` nos métodos de uma classe?',
      alternativas: [
        'Marca os métodos que podem ser chamados de fora da classe',
        'Guarda uma cópia dos atributos para o método não alterar o objeto',
        'É o próprio objeto: é por ele que o método lê e altera os atributos',
        'Substitui o `__init__` nas classes que criam objetos com herança',
      ],
      correta: 2,
      explicacao:
        'O `self` é o objeto que está sendo usado naquela chamada. Quando você escreve `conta.depositar(50)`, o Python coloca `conta` no lugar do `self` — por isso você não passa o objeto na chamada, e por isso dois objetos da mesma classe guardam valores diferentes.',
    },
    {
      id: 'p10-2',
      enunciado: 'Qual é a diferença entre a classe e o objeto criado a partir dela?',
      alternativas: [
        'A classe é o molde com o que todos têm; o objeto é uma cópia com os próprios valores',
        'A classe existe em tempo de execução; o objeto existe só enquanto o programa é escrito',
        'A classe guarda os métodos; o objeto guarda apenas os nomes dos métodos da classe',
        'Não há diferença: os dois nomes descrevem a mesma coisa em momentos diferentes',
      ],
      correta: 0,
      explicacao:
        'A classe descreve o que todo objeto daquele tipo tem e faz. Cada objeto criado a partir dela tem os próprios atributos: mudar a idade de `rex` não muda a de `bob`, mesmo os dois sendo cachorros.',
    },
    {
      id: 'p10-3',
      enunciado: 'O que acontece quando a classe filha não chama o `__init__` da classe mãe?',
      alternativas: [
        'A filha herda os atributos normalmente, sem precisar de chamada nenhuma',
        'Os atributos que a mãe criaria não existem, e o programa falha ao usá-los',
        'O Python chama o `__init__` da mãe sozinho, mesmo com a filha tendo o seu',
        'A filha deixa de herdar os métodos, mas mantém os atributos da mãe',
      ],
      correta: 1,
      explicacao:
        'Quem cria os atributos é o `__init__` da mãe. Se a filha define o próprio `__init__` e não chama o da mãe, a parte comum não é preparada — e o erro aparece depois, quando algum método tenta usar um atributo que ninguém criou.',
    },
    {
      id: 'p10-4',
      enunciado: 'Um método que só mostra uma mensagem na tela, sem devolver nada, o que entrega a quem chamou?',
      alternativas: [
        'A mensagem mostrada, como se o método a tivesse devolvido',
        'Um texto vazio, que é o valor padrão de métodos sem retorno',
        'O próprio objeto, para permitir encadear chamadas de métodos',
        'Nada: quem chamou recebe `None`, como em qualquer função sem `return`',
      ],
      correta: 3,
      explicacao:
        'Método é função: sem `return`, o valor devolvido é `None`. A mensagem existiu na tela e em nenhum outro lugar — e é essa a diferença entre mostrar e devolver, a mesma da unidade anterior.',
    },
    {
      id: 'p10-5',
      enunciado: 'O que `super().__init__(nome)` faz dentro do `__init__` da classe filha?',
      alternativas: [
        'Cria um segundo objeto, com os atributos da classe mãe, e o devolve',
        'Pede à classe mãe que prepare a parte dela antes de a filha continuar',
        'Impede que a filha sobrescreva qualquer método já definido na mãe',
        'Copia os métodos da mãe para dentro da filha, na hora da execução',
      ],
      correta: 1,
      explicacao:
        'A filha reaproveita o trabalho da mãe em vez de repeti-lo: `super().__init__(nome)` roda o `__init__` da classe mãe, e depois a filha acrescenta o que é só dela. Sem essa chamada, os atributos da mãe não existem no objeto.',
    },
  ],
}
