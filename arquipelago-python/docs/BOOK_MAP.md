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

## As quatro primeiras unidades

Decisão D-001: o capítulo 2 foi dividido em dois recortes.

| # | Unidade | Capítulo | Recorte | Página impressa | Página do PDF |
|---|---|---|---|---|---|
| 1 | A Praia do Primeiro Programa | 1 — Iniciando | Instalação, interpretador, primeiro programa, primeiras mensagens de erro | `null` | `null` |
| 2 | A Oficina das Variáveis | 2 — Variáveis e tipos de dados simples | Recorte 2a: variáveis, nomes, `print()`, inteiros e floats, `str()`, comentários | `null` | `null` |
| 3 | A Ilha das Palavras | 2 — mesmo capítulo | Recorte 2b: strings, maiúsculas e minúsculas, espaços em branco, concatenação, f-strings | `null` | `null` |
| 4 | As Listas do Mercado | 3 — Introdução às listas | Índice zero, alterar, acrescentar, remover, ordenar, erro de índice | `null` | `null` |

Todas com `status: 'referencia-pendente'`. A interface mostra "página: referência pendente" em
vez de um número não verificado.

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
