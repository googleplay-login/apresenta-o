# MAPA DO LIVRO

## Identificacao

| Campo | Valor |
|---|---|
| Titulo (pt-BR) | Curso Intensivo de Python |
| Titulo original | Python Crash Course |
| Autor | Eric Matthes |
| Editora (pt-BR) | Novatec Editora Ltda. |
| Edicao | 1a edicao impressa, maio de 2016 |
| ISBN (pt-BR) | 978-85-7522-602-5 |
| Editora (original) | No Starch Press, (c) 2015 |
| ISBN (original) | 978-1-59327-603-4 |
| Traducao | Lucia A. Kinoshita |
| Revisao tecnica | Kenneth Love |
| Editor | Rubens Prates |

### Como a identificacao foi feita

O texto integral do livro foi fornecido pelo usuario na conversa, como conversao
epub (marca d'agua eLivros). Os dados acima estao no proprio material. Portanto a
identificacao e **verificada**, e nao deduzida.

### Limitacao conhecida

O material fornecido **nao tem numeracao de paginas**. A conversao epub perdeu a
paginacao. Isso e a causa raiz da decisao D-010: nenhuma unidade declara pagina
enquanto o PDF nao puder ser conferido.

## Estrutura da obra

- Introducao
- **Parte I - Conceitos basicos**: capitulos 1 a 11
- **Parte II - Projetos**
  - Projeto 1 - Invasao Alienigena (capitulos 12 a 14, Pygame)
  - Projeto 2 - Visualizacao de dados (capitulos 15 a 17: matplotlib, passeios
    aleatorios, Pygal, CSV, JSON, mapas, APIs GitHub e Hacker News)
  - Projeto 3 - Aplicacoes web (capitulos 18 a 20: Django, contas de usuario,
    Bootstrap, implantacao no Heroku)
- **Apendices A a D**: instalar Python; editores de texto; obter ajuda; Git
- Posfacio

## As quatro primeiras unidades

Decisao D-001: o capitulo 2 foi dividido em dois recortes.

| # | Unidade | Capitulo | Recorte | Pagina impressa | Pagina do PDF |
|---|---|---|---|---|---|
| 1 | A Praia do Primeiro Programa | 1 - Iniciando | Instalacao, interpretador, primeiro programa, primeiras mensagens de erro | `null` | `null` |
| 2 | A Oficina das Variaveis | 2 - Variaveis e tipos de dados simples | Recorte 2a: variaveis, nomes, `print()`, inteiros e floats, `str()`, comentarios | `null` | `null` |
| 3 | A Ilha das Palavras | 2 - mesmo capitulo | Recorte 2b: strings, maiusculas e minusculas, espacos em branco, concatenacao, f-strings | `null` | `null` |
| 4 | As Listas do Mercado | 3 - Introducao as listas | Indice zero, alterar, acrescentar, remover, ordenar, erro de indice | `null` | `null` |

Todas com `status: 'referencia-pendente'`. A interface mostra
"pagina: referencia pendente" em vez de um numero nao verificado.

## Unica evidencia de paginacao existente

O texto fornecido contem **referencias cruzadas internas**, que sao o unico vestigio
de numeracao. Elas **nao** formam um mapa e **nao** devem ser usadas como pagina de
uma unidade: sao referencias a exercicios, com deslocamento desconhecido em relacao
ao PDF.

Registradas aqui apenas para reconciliacao futura contra o PDF:

| Referencia no texto | Pagina citada |
|---|---|
| Exercicios 3.4 a 3.7 | 80 e 81 |
| Exercicio 6.3 | 148 |
| `favorite_languages.py` | 150 |
| Exercicio 6.4 | 155 |
| `user_profile.py` | 210 |
| Exercicio 9.1 | 225 |
| Exercicio 9.3 | 226 |
| Exercicios 9.4 e 9.5 | 232 |
| Exercicio 9.8 | 241 |
| Exercicio 13.5 | 370 |
| Exercicio 14.2 | 388 |
| Exercicio 18.4 | 523 |
| Exercicio 18.6 | 529 |
| Exercicio 19.1 | 556 |

### Como usar esta tabela quando o PDF chegar

1. Localizar cada uma das 14 referencias no PDF e anotar a pagina do PDF.
2. Comparar a pagina impressa citada com a do PDF para descobrir o deslocamento.
3. **Verificar se o deslocamento e constante.** Se nao for, o mapa precisa ser
   construido por capitulo, com a pagina inicial real de cada um.
4. Somente entao preencher `paginaImpressa` e `paginaPdf` e mudar o status para
   `'confirmada'`. O teste `nao inventa numero de pagina` sera ajustado no mesmo
   commit.

## Obras futuras candidatas (nao mapeadas)

A Parte II tem valor pedagogico alto (Pygame, visualizacao de dados, web), mas
depende de conteudo que exige adaptacao de versao. Ver `CONTENT_GUIDE.md`.

## Adaptacoes de versao a considerar

O livro assume Python 3.5 e tambem discute Python 2.7. O projeto roda Python 3.12+
no navegador. Itens que precisam de adaptacao **explicita e visivel** ao estudante:

| No livro | Hoje | O que fazer |
|---|---|---|
| `print` sem parenteses (Python 2) | `print()` | Tratar como diferenca historica, sem confundir o iniciante |
| Divisao inteira do Python 2 | `/` devolve float | Explicar a diferenca |
| `raw_input()` | `input()` | Mencionar como curiosidade historica |
| `class X(object)` | `class X` | Usar a forma moderna |
| `super(X, self)` | `super()` | Usar a forma moderna |
| `__unicode__` | `__str__` | Explicar |
| `pygal.i18n`, `Worldmap` | nao existem mais | Nao usar; ou substituir com aviso |
| Pygame 1.9 | versao atual | Verificar antes de usar |
| Django 1.8/1.9 | versao atual | Verificar antes de usar |
| Heroku Toolbelt | descontinuado | Nao ensinar por esse caminho |

Regra: a adaptacao **nao muda o sentido** do que o autor ensina, e fica **visivel**
na aula. Ver `CONTENT_GUIDE.md`.
