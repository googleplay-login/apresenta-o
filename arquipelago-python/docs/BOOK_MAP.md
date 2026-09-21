# MAPA DO LIVRO

## Identificação

| Campo | Valor |
|---|---|
| Título (pt-BR) | Curso Intensivo de Python |
| Título original | Python Crash Course |
| Autor | Eric Matthes |
| Editora (pt-BR) | Novatec Editora Ltda. |
| Edição | 1ª edição impressa, maio de 2016 |
| ISBN (pt-BR) | 978-85-7522-602-5 |
| Editora (original) | No Starch Press, © 2015 |
| ISBN (original) | 978-1-59327-603-4 |
| Tradução | Lúcia A. Kinoshita |
| Revisão técnica | Kenneth Love |
| Editor | Rubens Prates |

### Como a identificação foi feita

O texto integral do livro foi fornecido pelo usuário na conversa, como conversão epub (marca
d'água eLivros). Os dados acima estão no próprio material. Portanto a identificação é
**verificada**, e não deduzida.

### Limitação conhecida

O material fornecido **não tem numeração de páginas**: a conversão epub perdeu a paginação. É a
causa raiz da decisão D-010 — nenhuma unidade declara página enquanto o PDF não puder ser
conferido.

## Estrutura da obra

- Introdução
- **Parte I — Conceitos básicos**: capítulos 1 a 11
- **Parte II — Projetos**
  - Projeto 1 — Invasão Alienígena (capítulos 12 a 14, Pygame)
  - Projeto 2 — Visualização de dados (capítulos 15 a 17: matplotlib, passeios aleatórios,
    Pygal, CSV, JSON, mapas, APIs GitHub e Hacker News)
  - Projeto 3 — Aplicações web (capítulos 18 a 20: Django, contas de usuário, Bootstrap,
    implantação no Heroku)
- **Apêndices A a D**: instalar Python; editores de texto; obter ajuda; Git
- Posfácio

## As unidades escritas até agora

Decisão D-001: o capítulo 2 foi dividido em dois recortes. A Etapa 11 acrescentou os capítulos 4 e 5
(lote 1), os capítulos 6 e 7 (lote 2), os capítulos 8 e 9 (lote 3), os capítulos 10 e 11 (lote 4) e os
capítulos 12, 13 e 14 (lote 5), um capítulo por ilha. Com o lote 4, a **Parte I do livro está inteira
mapeada**; com o **lote 5, o primeiro projeto da Parte II está inteiro** (trilha do jogo, ilhas 13 a 15).

### As trilhas (D-061)

Cada unidade declara a sua trilha, e a trilha declara os capítulos que cobre e **o que o console roda
ali**. Não é enfeite: a partir da Parte II o console não roda tudo o que o livro mostra, e quem estuda
precisa saber disso na tela — antes de escrever a primeira linha —, e não no erro.

| Trilha | Projeto | Capítulos | Situação | O que o console roda |
|---|---|---|---|---|
| `conceitos-basicos` | — | 1 a 11 | escrita | Tudo, com uma exceção tratada: o `input()` é recusado (D-051) e os trechos que o usam trazem a versão que roda |
| `invasao-alienigena` | 1 | 12 a 14 | escrita | A **lógica** do jogo em Python puro. O Pygame não existe nesta distribuição do Pyodide (medido) e não há como instalar sem baixar da internet (D-040) |
| `visualizacao-de-dados` | 2 | 15 a 17 | planejada | A parte de dados (`csv`, `json`, `random`, estatística). O gráfico não: medido, `import matplotlib` falha |
| `aplicacoes-web` | 3 | 18 a 20 | planejada | A peça pura de lógica (pedido → resposta). O Django não roda (medido), e o projeto não levanta servidor |

As duas trilhas planejadas estão na lista com `situacao: 'planejada'`, e um teste cobra a coerência nos
dois sentidos: trilha escrita tem unidade, trilha planejada não tem nenhuma.

| # | Unidade | Capítulo | Recorte | Página impressa | Página do PDF |
|---|---|---|---|---|---|
| 1 | A Praia do Primeiro Programa | 1 — Iniciando | Instalação, interpretador, primeiro programa, primeiras mensagens de erro | `null` | `null` |
| 2 | A Oficina das Variáveis | 2 — Variáveis e tipos de dados simples | Recorte 2a: variáveis, nomes, `print()`, inteiros e floats, `str()`, comentários | `null` | `null` |
| 3 | A Ilha das Palavras | 2 — mesmo capítulo | Recorte 2b: strings, maiúsculas e minúsculas, espaços em branco, concatenação, f-strings | `null` | `null` |
| 4 | As Listas do Mercado | 3 — Introdução às listas | Índice zero, alterar, acrescentar, remover, ordenar, erro de índice | `null` | `null` |
| 5 | O Moinho das Repetições | 4 — *Working with Lists* (título do original, a confirmar em português) | Percorrer com `for`, recuo, `range()`, estatísticas simples, fatias, cópia de lista, tuplas | `null` | `null` |
| 6 | A Encruzilhada das Decisões | 5 — *if Statements* (título do original, a confirmar em português) | Testes condicionais, `and`/`or`/`not`, `in` com listas, `if`/`elif`/`else` | `null` | `null` |
| 7 | O Farol dos Registros | 6 — *Dictionaries* (título do original, a confirmar em português) | Chave e valor, acesso e alteração, `get()` e o erro de chave, as três formas de percorrer, listas dentro de dicionários | `null` | `null` |
| 8 | A Estação das Perguntas | 7 — *User Input and while Loops* (título do original, a confirmar em português) | `input()`, conversão com `int()`, `while` com contador, `break` e `continue`, `while` com listas, laço infinito | `null` | `null` |
| 9 | A Oficina das Funções | 8 — *Functions* (título do original, a confirmar em português) | Definir função, parâmetro e argumento, chamada por palavra-chave, valor padrão, `return` contra `print`, devolver estruturas, lista por referência, `import` | `null` | `null` |
| 10 | A Torre das Classes | 9 — *Classes* (título do original, a confirmar em português) | Classe e objeto, `__init__`, `self`, atributos, método que muda o estado, valor padrão, herança com `super()`, biblioteca padrão | `null` | `null` |
| 11 | O Arquivo das Gavetas | 10 — *Files and Exceptions* (título do original, a confirmar em português) | Ler de um arquivo, escrever, acrescentar sem apagar, exceções com `try`/`except`/`else` ou `finally`, guardar dados com `json` | `null` | `null` |
| 12 | A Balança dos Testes | 11 — *Testing Your Code* (título do original, a confirmar em português) | Testar uma função, `assert` com mensagem, classe `TestCase` do `unittest`, asserções, ler a mensagem de um teste que falhou | `null` | `null` |
| 13 | O Estaleiro da Nave | 12 — *Invasão Alienígena*, primeira parte (título do original, a confirmar em português) | As configurações do jogo, a janela e o laço de quadros, a nave como objeto e o movimento preso às bordas | `null` | `null` |
| 14 | O Enxame dos Discos | 13 — *Invasão Alienígena*, segunda parte (título do original, a confirmar em português) | As balas em lista e a limpeza das que saem da tela, o limite de tiros no ar, a frota em fileiras por laços aninhados, a frota que vira e desce | `null` | `null` |
| 15 | O Placar da Batalha | 14 — *Invasão Alienígena*, terceira parte (título do original, a confirmar em português) | Colisão por retângulo, o que sai quando um tiro acerta, vidas, pontos, o nível que acelera e o jogo que recomeça | `null` | `null` |

Os títulos dos capítulos 1 a 3 vieram do texto da obra que foi fornecido. Os **capítulos 4 a 14 foram
acrescentados na Etapa 11** sem esse material em mãos: o número do capítulo e o assunto são certos, e o
título em português está marcado como **a confirmar**. É a mesma regra da página (`null`): campo que não
pode ser conferido não recebe valor inventado.

Uma diferença do lote 5, registrada aqui para não passar por descuido: os títulos dos capítulos 12 a 14
não trazem o nome do capítulo em inglês, como os anteriores. Do projeto original só se sabe o nome que
o próprio livro dá ao conjunto — *Invasão Alienígena* —, e o recorte de cada capítulo é descrito como
"primeira, segunda e terceira parte". Escrever um título em inglês que não foi conferido seria inventar
no lugar exato onde o projeto decidiu não inventar.

Todas com `status: 'referencia-pendente'`. A interface mostra "página: referência pendente" em
vez de um número não verificado.

### O que cada unidade diz da leitura, sem citar o livro

Desde a Etapa 6, cada unidade carrega, além de `parte` (capítulo e seção) e `porque`:

| Campo | O que é | Estado |
|---|---|---|
| `oQueObservar` | Quatro pontos para procurar naquela parte da leitura | Preenchido nas 12 unidades |
| `semOLivro` | Como aprender o mesmo assunto sem o livro em mãos | Preenchido nas 12 unidades |
| `pagina` / `paginaPdf` | Número da página | `null` nas 12 — o PDF não está em mãos (D-010) |

Nenhum dos dois campos cita o livro: eles dizem o que **procurar** e como seguir sem ele.
Nem a interface nem o conteúdo copiam trecho, nome de exemplo ou exercício da obra
(`CONTENT_GUIDE.md`).

## Única evidência de paginação existente

O texto fornecido contém **referências cruzadas internas**, que são o único vestígio de
numeração. Elas **não** formam um mapa e **não** devem ser usadas como página de uma unidade: são
referências a exercícios, com deslocamento desconhecido em relação ao PDF.

Registradas aqui apenas para reconciliação futura contra o PDF:

| Referência no texto | Página citada |
|---|---|
| Exercícios 3.4 a 3.7 | 80 e 81 |
| Exercício 6.3 | 148 |
| `favorite_languages.py` | 150 |
| Exercício 6.4 | 155 |
| `user_profile.py` | 210 |
| Exercício 9.1 | 225 |
| Exercício 9.3 | 226 |
| Exercícios 9.4 e 9.5 | 232 |
| Exercício 9.8 | 241 |
| Exercício 13.5 | 370 |
| Exercício 14.2 | 388 |
| Exercício 18.4 | 523 |
| Exercício 18.6 | 529 |
| Exercício 19.1 | 556 |

### Como usar esta tabela quando o PDF chegar

1. Localizar cada uma das 14 referências no PDF e anotar a página do PDF.
2. Comparar a página impressa citada com a do PDF para descobrir o deslocamento.
3. **Verificar se o deslocamento é constante.** Se não for, o mapa precisa ser construído por
   capítulo, com a página inicial real de cada um.
4. Somente então preencher `paginaImpressa` e `paginaPdf` e mudar o status para `'confirmada'`. O
   teste "não inventa número de página" será ajustado no mesmo commit.

## Obras futuras candidatas (não mapeadas)

A Parte II tem valor pedagógico alto (Pygame, visualização de dados, web), mas depende de conteúdo
que exige adaptação de versão. Ver a tabela abaixo e `CONTENT_GUIDE.md`.

## Adaptações de versão a considerar

O livro assume Python 3.5 e também discute Python 2.7. O projeto roda Python 3.12+ no navegador.
Itens que precisam de adaptação **explícita e visível** ao estudante:

| No livro | Hoje | O que fazer |
|---|---|---|
| `print` sem parênteses (Python 2) | `print()` | Tratar como diferença histórica, sem confundir o iniciante |
| Divisão inteira do Python 2 | `/` devolve float | Explicar a diferença |
| `raw_input()` | `input()` | Mencionar como curiosidade histórica |
| `class X(object)` | `class X` | Usar a forma moderna |
| `super(X, self)` | `super()` | Usar a forma moderna |
| `__unicode__` | `__str__` | Explicar |
| `pygal.i18n`, `Worldmap` | não existem mais | Não usar; ou substituir com aviso |
| Pygame 1.9 | versão atual | Verificar antes de usar |
| Django 1.8/1.9 | versão atual | Verificar antes de usar |
| Heroku Toolbelt | descontinuado | Não ensinar por esse caminho |

Regra: a adaptação **não muda o sentido** do que o autor ensina, e fica **visível** na aula.
