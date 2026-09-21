import type { ConteudoDaUnidade } from '../tiposDeConteudo'

/**
 * Unidade 18 — A Estação de Escuta.
 * Capítulo 17 do livro: trabalhar com dados que vêm da internet (respostas de API).
 *
 * Texto original. O livro é a leitura recomendada, não a fonte do texto.
 *
 * Terceira e última unidade da trilha de visualização de dados. O livro usa a
 * biblioteca `requests` para buscar as respostas; aqui a resposta **já chegou** e
 * é entregue como texto, porque este console não faz requisição de rede (D-040) —
 * e, medido, `requests` nem sequer existe nesta distribuição do Python (D-062).
 * A parte que o capítulo ensina depois da busca — virar estrutura, navegar por
 * dentro dela, conferir o que veio, e recusar uma resposta que não dá dado — é
 * exatamente o que a unidade exercita, e roda aqui inteira.
 */
export const u18EstacaoDeEscuta: ConteudoDaUnidade = {
  id: 'u18-estacao-de-escuta',

  missao:
    'Ao final desta unidade, você vai trabalhar com a resposta de uma API: virar texto JSON em estrutura, entrar campo por campo em uma resposta aninhada, lidar com campos que faltam e com respostas que não trazem dado, e ordenar o que veio antes de mostrar.',

  leitura: {
    parte:
      'Capítulo 17 do livro — as partes sobre buscar dados na internet, o formato JSON das respostas, o que fazer com a lista que volta, como ordenar esses dados por um dos campos e o que os limites de uso do serviço (rate limit) significam.',
    porque:
      'Este é o capítulo em que os dados deixam de ser seus: agora quem manda no formato é outra pessoa — o serviço que você consulta. A resposta chega aninhada, com campos que às vezes não vêm, em quantidade maior do que você quer ver, e com regras de uso. Aprender a abrir uma resposta e a se proteger dela é o que separa um programa que funciona no seu computador de um programa que funciona com dado de fora.',
    oQueObservar: [
      'A forma da resposta: o que volta é um dicionário com poucos campos, e o dado útil costuma estar em **uma lista dentro** de um desses campos. Repare que o primeiro passo nunca é o dado — é descobrir onde ele está.',
      'O que o livro faz quando um repositório não tem descrição. Repare que ele **conta** e depois trata, em vez de deixar o programa parar no meio por causa de um registro.'
      ,
      'A ordenação da resposta por um dos campos. Repare que os dados que vêm da internet chegam na ordem do serviço, que quase nunca é a ordem que interessa para a sua pergunta.',
      'O limite de uso: o serviço diz por cabeçalho quantas consultas você ainda pode fazer e quando elas se renovam. Repare que o programa que ignora isso funciona até parar de funcionar, e que a interrupção não tem a ver com o seu código estar errado.',
    ],
    semOLivro:
      'Sem o livro em mãos, a unidade continua inteira: a explicação cobre o formato das respostas de API, como transformar texto JSON em estrutura com `json.loads`, como atravessar dicionários dentro de dicionários, como contar o que falta sem quebrar e como ordenar a lista por um campo. O que fica fora é só a chamada de rede, e o motivo está declarado em vez de escondido: é decisão deste projeto não fazer requisição em tempo de execução.',
  },

  explicacao: [
    {
      tipo: 'paragrafo',
      texto:
        'Quando um programa pede dados a um serviço da internet, o que volta não é uma tabela: é **texto** — a mesma situação da unidade anterior, com uma diferença que muda tudo. No arquivo, o formato era escolhido por você; na resposta de uma API, o formato é escolhido por quem publica o serviço, e costuma ser mais fundo: um dicionário com poucos campos, e o dado que interessa guardado em uma lista dentro de um deles.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'A resposta chega como texto — e o primeiro passo é virar estrutura',
      codigo:
        'import json\n\nresposta = \'{"total": 2, "itens": [{"nome": "pygame", "estrelas": 7100}, {"nome": "arcade", "estrelas": 1700}]}\'\n\ndados = json.loads(resposta)\n\nprint("chaves da resposta:", sorted(dados))\nprint("quantos itens:", len(dados["itens"]))\nprint("o primeiro nome:", dados["itens"][0]["nome"])',
    },
    {
      tipo: 'diagrama',
      titulo: 'A anatomia de uma resposta',
      descricao:
        'O que volta é um dicionário por fora, e o dado útil está no fundo dele. Cada passo da leitura tira uma camada.',
      partes: [
        {
          rotulo: 'A resposta (texto)',
          valor: 'uma linha enorme de texto',
          nota: 'do lado de fora não parece estrutura — parece texto, e para o Python é texto',
        },
        {
          rotulo: 'Depois de `json.loads`',
          valor: 'um dicionário',
          nota: 'as chaves de fora do serviço: às vezes "total", "itens", "data", "mensagem"',
        },
        {
          rotulo: 'A lista dentro dele',
          valor: '`dados["itens"]`',
          nota: 'quase sempre é aqui que está o dado — uma lista de dicionários, um por registro',
        },
        {
          rotulo: 'Um registro',
          valor: '`dados["itens"][0]["nome"]`',
          nota: 'chave após chave, índice após índice: é assim que se atravessa uma resposta aninhada',
        },
      ],
    },
    {
      tipo: 'destaque',
      titulo: 'Nem todo registro tem todo campo',
      texto:
        'Em uma resposta real, o campo que você quer pode simplesmente não existir naquele registro — repositório sem descrição, usuário sem cidade. Acesso direto a uma chave que falta levanta `KeyError`, e o programa para no meio da lista. O caminho seguro é perguntar antes (`if "descricao" in item`) ou usar `item.get("descricao", "")`, que devolve vazio quando a chave falta. E tem uma pergunta antes dessa: **o que fazer com o registro sem o campo** — contar quantos são, pular, ou usar um valor padrão. As três decisões funcionam; o que não funciona é não decidir e deixar o programa parar.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Contar o que falta, sem parar no meio',
      codigo:
        'import json\n\nresposta = \'{"itens": [{"nome": "a", "descricao": "texto"}, {"nome": "b"}, {"nome": "c"}]}\'\n\ndados = json.loads(resposta)\nitens = dados["itens"]\n\ncom_descricao = [item for item in itens if "descricao" in item]\nprint("itens:", len(itens))\nprint("com descrição:", len(com_descricao))\nprint("sem descrição:", len(itens) - len(com_descricao))',
    },
    {
      tipo: 'paragrafo',
      texto:
        'A resposta também pode não trazer dado nenhum. Serviço fora do ar, consulta que não existe, limite de uso atingido: nos três casos o que volta é uma resposta — com uma estrutura diferente e sem a lista de itens. Programa que segue em frente e faz `len(dados["itens"])` quebra com `KeyError` em um lugar que não tem nada a ver com o problema real. Antes de usar a resposta, vale conferir se ela é a resposta que você esperava.',
    },
    {
      tipo: 'codigo',
      linguagem: 'python',
      legenda: 'Conferindo antes de usar — duas respostas, dois caminhos',
      codigo:
        'import json\n\nchegou = \'{"itens": [{"nome": "pygame", "estrelas": 7100}, {"nome": "arcade", "estrelas": 1700}]}\'\ndados = json.loads(chegou)\n\nif "itens" in dados:\n    itens = dados["itens"]\n    ordenados = sorted(itens, key=lambda item: item["estrelas"], reverse=True)\n    print("o mais popular:", ordenados[0]["nome"], ordenados[0]["estrelas"])\nelse:\n    print("a resposta não trouxe itens")',
    },
    {
      tipo: 'destaque',
      titulo: 'A ordem é do serviço, não é a sua',
      texto:
        'A lista que volta vem na ordem que o serviço escolheu — por relevância, por data, por o que ele quiser. `sorted(itens, key=lambda item: item["estrelas"], reverse=True)` reordena pelos seus critérios, e é o mesmo `key` das unidades 4 e 16: uma função que diz **por que campo** comparar. Sem isso, "os dez melhores" seriam os dez primeiros que o serviço resolveu mandar.',
    },
    {
      tipo: 'avisoDeVersao',
      titulo: 'A chamada de rede não roda aqui — e o `requests` do livro não existe mais nesta edição',
      texto:
        'Duas coisas diferentes ficam de fora, e vale separá-las. **A rede não roda aqui**: este console não faz requisição (D-040), e nada é baixado em tempo de execução. O que a unidade faz, então, é entregar a resposta **já chegada**, como texto — e todo o trabalho que o capítulo ensina depois disso roda inteiro. Além disso, o livro usa a biblioteca **`requests`** para fazer a chamada, escrita quando ela era o caminho quase obrigatório; hoje a biblioteca padrão do Python já traz o `urllib.request` para o mesmo trabalho, e medido nesta distribuição o próprio `requests` não está instalado (D-062). Nenhuma das duas ausências muda o que você aprende: a parte difícil de trabalhar com dados de internet nunca foi a linha que busca — foi o que fazer com o que volta.',
    },
    {
      tipo: 'paragrafo',
      texto:
        'Terminada a trilha, o caminho dos dados fica inteiro: gerar (unidade 16), guardar e ler arquivo (17), receber de fora (18) — e, em todos os três casos, o mesmo cuidado no fim: conferir o que chegou antes de calcular, e lembrar que o dado de fora não tem obrigação de vir no formato que você esperava.',
    },
  ],

  pratica: [
    {
      id: 'e18-1',
      enunciado:
        'A resposta de um serviço já chegou, nesta string: `\'{"total": 2, "itens": [{"nome": "pygame", "estrelas": 7100}, {"nome": "arcade", "estrelas": 1700}]}\'`. Transforme o texto em estrutura e mostre quantos itens vieram e qual é o maior número de estrelas entre eles.',
      dica: '`json.loads(resposta)` devolve a estrutura: no caso, um dicionário com a chave `"itens"` valendo uma lista. O maior número de estrelas sai de uma lista de números — `max([item["estrelas"] for item in itens])` ou `max(itens, key=...)`, como você preferir.',
      conferencia: 'Aparece `itens: 2` e `o maior número de estrelas: 7100`.',
      solucao:
        'import json\n\nresposta = \'{"total": 2, "itens": [{"nome": "pygame", "estrelas": 7100}, {"nome": "arcade", "estrelas": 1700}]}\'\n\ndados = json.loads(resposta)\nitens = dados["itens"]\n\nprint("itens:", len(itens))\nprint("o maior número de estrelas:", max(item["estrelas"] for item in itens))',
      correcao: {
        saidaEsperada: ['itens: 2', 'o maior número de estrelas: 7100'],
        valoresEsperados: [
          { rotulo: 'A resposta virou dicionário', expressao: 'type(dados).__name__', igualA: "'dict'" },
          {
            rotulo: 'A lista de itens está dentro da resposta',
            expressao: 'len(itens)',
            igualA: '2',
          },
          {
            rotulo: 'O maior número de estrelas',
            expressao: 'max(item["estrelas"] for item in itens)',
            igualA: '7100',
          },
          {
            rotulo: 'O campo de fora também é acessível',
            expressao: 'dados["total"]',
            igualA: '2',
          },
        ],
        estrutura: { linhasNaoVazias: 2 },
        limite:
          'A conferência age sobre a estrutura que a resposta virou: quantos itens, o maior número de estrelas e o campo de fora. Ela não exige a variável `itens` — pode ser lido direto de `dados["itens"]` — nem uma ordem específica de acessos, desde que o que chegou esteja correto.',
      },
    },
    {
      id: 'e18-2',
      enunciado:
        'Usando esta resposta: `\'{"total": 3, "itens": [{"nome": "a", "descricao": "texto", "estrelas": 30}, {"nome": "b", "estrelas": 12}, {"nome": "c", "estrelas": 47}]}\'`, mostre quantos itens vieram, quantos **têm** o campo `descricao` e quantos não têm.',
      dica: 'Para saber se a chave está no dicionário: `if "descricao" in item` — ou uma list comprehension com essa condição, como no exemplo da explicação. Acesso direto à chave que falta levantaria `KeyError`.',
      conferencia: 'Aparece `itens: 3`, `com descrição: 1` e `sem descrição: 2`.',
      solucao:
        'import json\n\nresposta = \'{"total": 3, "itens": [{"nome": "a", "descricao": "texto", "estrelas": 30}, {"nome": "b", "estrelas": 12}, {"nome": "c", "estrelas": 47}]}\'\n\ndados = json.loads(resposta)\nitens = dados["itens"]\n\ncom_descricao = [item for item in itens if "descricao" in item]\nprint("itens:", len(itens))\nprint("com descrição:", len(com_descricao))\nprint("sem descrição:", len(itens) - len(com_descricao))',
      correcao: {
        saidaEsperada: ['itens: 3', 'com descrição: 1', 'sem descrição: 2'],
        valoresEsperados: [
          { rotulo: 'A resposta trouxe três registros', expressao: 'len(itens)', igualA: '3' },
          {
            rotulo: 'Só um registro tem o campo',
            expressao: 'sum(1 for item in itens if "descricao" in item)',
            igualA: '1',
          },
          {
            rotulo: 'Os outros dois não têm o campo',
            expressao: 'sum(1 for item in itens if "descricao" not in item)',
            igualA: '2',
          },
          {
            rotulo: 'O registro sem o campo continua acessível pelos outros',
            expressao: 'itens[1]["nome"]',
            igualA: "'b'",
          },
        ],
        estrutura: { linhasNaoVazias: 3 },
        limite:
          'A conferência conta o que tem e o que não tem o campo, e confere que o registro sem ele continua utilizável. Ela não exige `in`, `.get()` nem `try` — qualquer caminho vale, desde que o programa **não pare** por causa do registro incompleto.',
      },
    },
    {
      id: 'e18-3',
      enunciado:
        'Chegaram duas respostas. Uma tem itens: `\'{"itens": [{"nome": "a", "estrelas": 30}, {"nome": "b", "estrelas": 12}, {"nome": "c", "estrelas": 47}]}\'`. A outra veio sem o campo `itens`: `\'{"mensagem": "limite de uso atingido"}\'`. Escreva o programa para as duas: se a resposta tiver itens, mostre o nome do mais popular (o de mais estrelas); se não tiver, mostre `sem itens`.',
      dica: 'Antes de usar a resposta, confira: `if "itens" in dados`. Para o mais popular, ordene ou use `max(itens, key=lambda item: item["estrelas"])`. A resposta sem itens não é erro do seu programa — ela só não traz o que você pediu.',
      conferencia:
        'Com a primeira string, aparece `o mais popular é c`; trocando a variável pela segunda, aparece `sem itens`.',
      solucao:
        'import json\n\nchegou = \'{"itens": [{"nome": "a", "estrelas": 30}, {"nome": "b", "estrelas": 12}, {"nome": "c", "estrelas": 47}]}\'\ndados = json.loads(chegou)\n\nif "itens" in dados:\n    itens = dados["itens"]\n    mais_popular = max(itens, key=lambda item: item["estrelas"])\n    print("o mais popular é", mais_popular["nome"])\nelse:\n    print("sem itens")',
      correcao: {
        saidaEsperada: ['o mais popular é c'],
        valoresEsperados: [
          {
            rotulo: 'Com a resposta completa, o mais popular é o c',
            expressao: 'max(itens, key=lambda item: item["estrelas"])["nome"]',
            igualA: "'c'",
          },
          {
            rotulo: 'O maior número de estrelas da resposta',
            expressao: 'max(item["estrelas"] for item in itens)',
            igualA: '47',
          },
          {
            rotulo: 'A resposta sem itens é reconhecida como tal',
            expressao: '"itens" in json.loads(\'{"mensagem": "limite de uso atingido"}\')',
            igualA: 'False',
          },
          {
            rotulo: 'A mensagem da resposta que não trouxe dado continua legível',
            expressao: 'json.loads(\'{"mensagem": "limite de uso atingido"}\')["mensagem"]',
            igualA: "'limite de uso atingido'",
          },
        ],
        estrutura: { linhasNaoVazias: 1 },
        limite:
          'A conferência mede os dois caminhos: o mais popular da resposta completa e o reconhecimento da resposta sem itens. Ela lê as duas respostas do próprio enunciado, então o programa precisa funcionar para a que trouxe itens — a que não trouxe é conferida como dado, e não é preciso imprimir as duas. `max` com `key` e `sorted(...)[0]` valem igual.',
      },
    },
  ],

  perguntas: [
    {
      id: 'p18-1',
      enunciado: 'A resposta de um serviço chega e é transformada com `json.loads`. O que se tem em mãos?',
      alternativas: [
        'Uma tabela com linhas e colunas, pronta para somar',
        'Um dicionário (e, dentro dele, às vezes listas e outros dicionários)',
        'Uma lista de textos, um por campo da resposta',
        'Um arquivo aberto no disco, que precisa ser fechado depois',
      ],
      correta: 1,
      explicacao:
        'A resposta de uma API costuma vir como um dicionário com poucos campos, e o dado útil em uma lista dentro de um deles. Não há tabela nem arquivo: `json.loads` só transforma o texto na estrutura que ele descreve. O primeiro passo para usar a resposta é descobrir **onde** o dado está dentro dela.',
    },
    {
      id: 'p18-2',
      enunciado: 'Em uma lista de registros que veio da internet, alguns não têm o campo que o programa precisa. Qual é a consequência de acessar esse campo direto?',
      alternativas: [
        'O Python devolve `None` em silêncio e a conta sai errada',
        'O campo é criado vazio automaticamente no registro que não tinha',
        'O programa para com `KeyError` no registro incompleto',
        'Os registros sem o campo são pulados e o laço continua',
      ],
      correta: 2,
      explicacao:
        'Acesso direto a uma chave ausente levanta `KeyError` e interrompe o programa — no meio da lista, longe da causa real. As saídas são perguntar antes (`if "descricao" in item`) ou usar `.get()`; e a decisão de o que fazer com o registro incompleto (contar, pular, usar padrão) é sua, não do Python. É o mesmo cuidado com chave ausente da unidade 16, agora com dado que não foi você quem escreveu.',
    },
    {
      id: 'p18-3',
      enunciado: 'Por que ordenar a lista da resposta, se ela já vem em uma ordem?',
      alternativas: [
        'Porque o Python exige que a lista seja ordenada antes de qualquer cálculo',
        'Porque ordenar remove os registros que vieram com campos faltando',
        'Porque a ordenação corrige valores errados enviados pelo serviço',
        'Porque a ordem que vem é a do serviço, e quase nunca é a ordem da sua pergunta',
      ],
      correta: 3,
      explicacao:
        'A ordem da resposta é escolhida por quem publica o serviço — relevância, data, o que ele quiser. `sorted(itens, key=...)` reordena pelo campo que responde à sua pergunta, e "os dez primeiros" só passam a significar "os dez melhores" depois disso. Ordenar não limpa dado nem valida nada: só muda a ordem, e é por isso que ele vem **depois** de conferir o que chegou.',
    },
    {
      id: 'p18-4',
      enunciado: 'Chega uma resposta sem o campo `itens`, com uma mensagem de limite de uso atingido. O que um programa correto faz?',
      alternativas: [
        'Usa a resposta assim mesmo e calcula com a lista vazia',
        'Considera que o serviço está errado e tenta de novo em um laço infinito',
        'Confere se a resposta traz o que ele precisa e escolhe outro caminho',
        'Trata a mensagem como se fosse a lista de itens e segue o programa',
      ],
      correta: 2,
      explicacao:
        'Nem toda resposta traz dado, e uma resposta sem o campo esperado não é falha do seu código — é o serviço dizendo outra coisa, no caso, que o limite de consultas foi atingido. Conferir antes de usar (`if "itens" in dados`) evita um `KeyError` em um ponto que não tem relação com o problema real, e permite responder à situação em vez de travar.',
    },
    {
      id: 'p18-5',
      enunciado: 'O que muda no estudo desta unidade por a chamada de rede não rodar neste console?',
      alternativas: [
        'Nada além da linha que busca: o trabalho com a resposta é o que o capítulo ensina',
        'O capítulo inteiro: sem a busca, não há o que aprender sobre respostas',
        'Muda o formato da resposta, que aqui é sempre o mesmo em qualquer serviço',
        'Muda a ordenação, que passa a ser feita de forma diferente sem a biblioteca',
      ],
      correta: 0,
      explicacao:
        'A busca é uma linha; o trabalho está no que volta: virar texto em estrutura, achar o dado dentro dela, atravessar campos aninhados, lidar com o que falta, ordenar pelos seus critérios e desconfiar de respostas que não trazem dado. Tudo isso roda aqui, com a resposta entregue como já chegada — o mesmo programa funcionaria depois de um `urllib.request` que devolvesse aquele texto.',
    },
  ],
}
