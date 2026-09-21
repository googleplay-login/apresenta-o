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
2. **Leitura recomendada** — qual parte do livro ler, **por que** aquela parte, **o que procurar**
   nela (`oQueObservar`, uma lista curta) e **o caminho de quem não tem o livro agora**
   (`semOLivro`). Sem número de página enquanto o PDF não for verificado (D-010). A leitura é
   orientação escrita por nós: **nenhuma linha do livro entra na tela**, nem como citação.
3. **Explicação original** — o que é, por que existe, o que costuma dar errado, com exemplo
   próprio. Curta: o estudante já leu o livro.
4. **Prática** — exercícios para escrever código, do menor para o maior.

E, ao final, a avaliação — que é assunto de `STATE_MACHINE.md`.

O marcador "leitura feita" é **registro da pessoa**, e não requisito: quem escreve o conteúdo não deve
prometer em texto que marcar a leitura libera alguma coisa, porque não libera (D-033).

## Os diagramas

Um diagrama é **dado**, não imagem: título, descrição e uma lista de partes, cada uma com rótulo,
valor e (quando ajuda) uma nota. Ele existe para mostrar o que o texto sozinho mostra mal — o caminho
de uma linha, o que um método devolve, dois sentidos de uma contagem (D-034).

Regras ao escrever:

- **pelo menos duas partes**, com rótulos **únicos** e nenhum valor vazio (o validador cobra);
- os rótulos dizem o que aquilo é ("A variável", "O valor guardado"), e não "parte 1";
- o valor é o código ou o resultado, curto o bastante para caber numa linha;
- a descrição diz o que olhar, e não repete o título;
- quando o assunto for **espaço em branco**, ligue `espacosVisiveis` **naquele** diagrama — e só
  nele. Com a opção ligada, só as pontas do valor aparecem com o sinal `·`, com legenda explicando o
  sinal. Diagrama que liga a opção sem ter espaço nas pontas reprova no teste: sinal decorativo onde
  não há espaço a mostrar é ruído.

Exemplo de forma (inventado, para mostrar o formato):

```ts
diagrama: {
  titulo: 'O que o método devolve',
  descricao: 'Cada método devolve algo diferente; o sinal · mostra espaços.',
  espacosVisiveis: true,
  partes: [
    { rotulo: 'Entrada', valor: '"  Ilha  "', nota: 'com espaços nas pontas' },
    { rotulo: 'strip()', valor: '"Ilha"' },
  ],
}
```

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

## O tamanho da alternativa correta não entrega o gabarito (D-038)

A alternativa certa costuma ficar mais longa sozinha: quem escreve quer ser preciso, e precisão pede
palavras. O efeito, somado, é um atalho — quem não estudou marca sempre a mais longa e acerta.

Regras ao escrever:

- em cada unidade, **no máximo metade** das perguntas pode ter a correta como a mais longa por 12
  caracteres ou mais — o validador cobra;
- o caminho para consertar **não** é encurtar a verdade até ela ficar obscura: é dar aos distratores
  o mesmo cuidado. Distrator plausível e específico costuma ficar tão longo quanto a resposta certa;
- alternativa do tipo "todas as anteriores" e "nenhuma das anteriores" é proibida: não mede
  entendimento;
- enunciado com menos de 20 caracteres e explicação com menos de 40 são recusados pelo validador.

Este defeito existiu de verdade: em `u01`, as cinco corretas eram as mais longas (D-038).

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
- [ ] A leitura recomendada é específica (qual parte, por que, o que observar, e o caminho sem o
      livro).
- [ ] Nenhuma linha do livro aparece na tela, nem como citação.
- [ ] Cada diagrama tem duas ou mais partes, rótulos únicos e nenhum valor vazio.
- [ ] `espacosVisiveis` está ligado só onde há espaço em branco para mostrar — e é verdade.
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
