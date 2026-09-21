# GUIA DE CONTEÚDO

Como escrever o conteúdo pedagógico do Arquipélago. Vale para aula, missão, exemplo, exercício e
pergunta de avaliação.

## Regra número um: o texto é original

O livro é **fonte de estudo e mapa**. Não é texto a ser copiado, resumido ou parafraseado de
perto.

Pode:

- apontar para o que o estudante deve ler ("leia o capítulo 2, a parte sobre strings, antes de
  praticar");
- ensinar o mesmo assunto com **explicação, exemplos e exercícios escritos por nós**;
- usar a mesma ordem de assuntos, porque ela é boa.

Não pode:

- copiar trecho do livro;
- reproduzir exercícios do livro (nem "adaptados", com o mesmo enunciado);
- traduzir um trecho e apresentar como nosso;
- usar os nomes de exemplo do livro (`magician.py`, `alice.py`, `favorite_languages.py`) como se
  fossem nossos;
- colocar o PDF ou qualquer parte dele no repositório.

Motivo: o repositório é público. Além disso, o valor do projeto está na explicação própria —
copiar o livro tornaria o Arquipélago um livro pior, com gráficos.

## Estrutura de uma unidade

Cada unidade tem quatro partes, nesta ordem:

1. **Missão** — uma frase que diz o que o estudante vai saber fazer ao final. Escrita como
   capacidade, e não como assunto: "escrever um programa que guarda um valor em uma variável e o
   mostra na tela" em vez de "introdução a variáveis".
2. **Leitura recomendada** — qual parte do livro ler e por que aquela parte. Sem número de página
   enquanto o PDF não for verificado (D-010).
3. **Explicação original** — o que é, por que existe, o que costuma dar errado, com exemplo
   próprio. Curta: o estudante já leu o livro.
4. **Prática** — exercícios para escrever código, do menor para o maior.

E, ao final, a avaliação — que é assunto de `STATE_MACHINE.md`.

## Avisos obrigatórios

Toda unidade sobre um recurso do livro que mudou de versão precisa de um aviso **visível** ao
estudante. Exemplos: strings formatadas (o livro ensina `format()`, hoje se usa f-string),
classes (`class X(object)` virou `class X`), Pygame, Django, Heroku. Ver a tabela em
`BOOK_MAP.md`.

O aviso diz o que mudou e o que usar hoje. Ele **não** corrige o livro nem sugere que o autor
errou: em 2015, aquilo era o certo.

## Tom

- Segunda pessoa, direto: "você vai guardar o valor".
- Frase curta. Um conceito por frase.
- Sem jargão não explicado. Se usar um termo técnico, explique na primeira vez.
- Sem humor que dependa de conhecer programação.
- Erro não é vergonha: mensagem de erro é informação. Boa parte do aprendizado inicial é ler
  mensagem de erro.

## Idioma e acentuação

Português do Brasil, **com acentuação correta** — inclusive nos nomes de arquivo do conteúdo
(D-015). Termos de programação permanecem como são em Python (`for`, `while`, `print`), porque o
estudante vai encontrá-los no código, na documentação oficial e no livro.

Uma trava automática (`qa/acentuacao.test.ts`) varre código e documentação atrás de palavras
escritas sem acento. Texto novo que reintroduza o defeito reprova o teste.

## Verdade obrigatória sobre a avaliação

Todo enunciado de avaliação informa, em texto visível, que:

- a correção acontece no próprio navegador;
- **não é antifraude** — quem quiser ver as respostas consegue;
- o objetivo é aprender, não passar.

Prometer "teste secreto inviolável" seria mentira sobre a própria robustez. A regra vale igual
para execução de código: quando o Pyodide entrar (Etapa 9), nada afirma que rodar código de
terceiros é seguro.

## A posição da alternativa correta varia (D-027)

Cinco perguntas, quatro alternativas. Se a correta cai sempre na mesma posição, quem não estudou
acerta pelo padrão e quem estudou desconfia do que aprendeu — o defeito é pior do que parece.

Regras ao escrever as próximas unidades:

- cada unidade usa as **quatro posições**, sem repetir uma e deixar outra de fora;
- unidade nova não copia a distribuição da anterior: o padrão que se repete entre ilhas também é
  padrão;
- quem escreve confere a posição depois de escrever, e não de memória.

O teste `src/content/conteudo.test.ts` cobra isso **unidade por unidade**. Existe porque já falhou
uma vez: `u03Strings` tinha as cinco respostas na posição 1, e o teste antigo somava todas as
unidades antes de conferir, então o vício de uma unidade passava escondido no conjunto.

## Sem segredo no cliente

Chave de API, senha, token ou qualquer credencial **não** entra no código do navegador. Tudo que
roda no cliente é público, por definição.

## Mensagens de erro do Python

Mensagem de erro é **citação literal** do interpretador, e não conteúdo do livro: pode ser
exibida exatamente como aparece, em bloco de código.

## Checklist antes de considerar uma unidade pronta

- [ ] A missão está escrita como capacidade, não como assunto.
- [ ] A leitura recomendada é específica (qual parte, por que).
- [ ] A explicação é original e cabe em uma tela.
- [ ] O exemplo é próprio e roda no Python atual.
- [ ] Existe aviso de versão, se o assunto mudou desde o livro.
- [ ] Os exercícios são próprios e incluem prática de escrever código.
- [ ] A avaliação tem 5 perguntas e aprova com 4 acertos.
- [ ] As posições das alternativas corretas usam as quatro posições, conferidas **nesta unidade**.
- [ ] O enunciado da avaliação diz que não há antifraude.
- [ ] O texto não tem trecho, nome de exemplo nem exercício do livro.
- [ ] Nenhum número de página foi inventado (ver D-010).
- [ ] O texto está acentuado corretamente.
