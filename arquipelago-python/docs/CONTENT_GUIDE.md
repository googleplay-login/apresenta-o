# GUIA DE CONTEUDO

Como escrever o conteudo pedagogico do Arquipelago. Vale para aula, missao,
exemplo, exercicio e pergunta de avaliacao.

## Regra numero um: o texto e original

O livro e **fonte de estudo e mapa**. Nao e texto a ser copiado, resumido ou
parafraseado de perto.

Pode:
- apontar para o que o estudante deve ler ("leia o capitulo 2, a parte sobre
  strings, antes de praticar");
- ensinar o mesmo assunto com **explicacao, exemplos e exercicios escritos por nos**;
- usar a mesma ordem de assuntos, porque ela e boa.

Nao pode:
- copiar trecho do livro;
- reproduzir exercicios do livro (nem "adaptados", com o mesmo enunciado);
- traduzir um trecho e apresentar como nosso;
- usar os nomes de exemplo do livro (`magician.py`, `alice.py`, `favorite_languages.py`)
  como se fossem nossos;
- colocar o PDF ou qualquer parte dele no repositorio.

Motivo: o repositorio e publico. Alem disso, o valor do projeto esta na explicacao
propria - copiar o livro tornaria o Arquipelago um livro pior, com graficos.

## Estrutura de uma unidade

Cada unidade tem quatro partes, nesta ordem:

1. **Missao** - uma frase que diz o que o estudante vai saber fazer ao final.
   Escrita como capacidade, nao como assunto: "escrever um programa que guarda um
   valor em uma variavel e o mostra na tela" em vez de "introducao a variaveis".
2. **Leitura recomendada** - qual parte do livro ler e por que aquela parte.
   Sem numero de pagina enquanto o PDF nao for verificado (D-010).
3. **Explicacao original** - o que e, por que existe, o que costuma dar errado,
   com exemplo proprio. Curta: o estudante ja leu o livro.
4. **Pratica** - exercicios para escrever codigo, do menor para o maior.

E, ao final, a avaliacao - que e assunto de `STATE_MACHINE.md`.

## Avois obrigatorios

Toda unidade sobre um recurso do livro que mudou de versao precisa de um aviso
**visivel** ao estudante. Exemplos: strings formatadas (o livro ensina `format()`,
hoje se usa f-string), classes (`class X(object)` virou `class X`), Pygame, Django,
Heroku. Ver a tabela em `BOOK_MAP.md`.

O aviso diz o que mudou e o que usar hoje. Ele **nao** corrige o livro nem sugere
que o autor errou: em 2015 aquilo era o certo.

## Tom

- Segunda pessoa, direto: "voce vai guardar o valor".
- Frase curta. Um conceito por frase.
- Sem jargao nao explicado. Se usar um termo tecnico, explique na primeira vez.
- Sem humor que dependa de conhecer programacao.
- Erro nao e vergonha: mensagem de erro e informacao. Boa parte do aprendizado
  inicial e ler mensagem de erro.

## Verdade obrigatoria sobre a avaliacao

Todo enunciado de avaliacao informa, em texto visivel, que:

- a correcao acontece no proprio navegador;
- **nao e antifraude** - quem quiser ver as respostas consegue;
- o objetivo e aprender, nao passar.

Prometer "teste secreto inviolavel" seria mentira, e a regra do projeto proibe
mentir sobre a propria robustez. Vale o mesmo para execucao de codigo: quando o
Pyodide entrar (Etapa 9), nada afirma que rodar codigo de terceiros e seguro.

## Sem segredo no cliente

Chave de API, senha, token ou qualquer credencial **nao** entra no codigo do
navegador. Tudo que roda no cliente e publico, por definicao.

## Idioma

Portugues do Brasil, inclusive nos nomes de arquivo do conteudo. Termos de
programacao permanecem como sao em Python (`for`, `while`, `print`), porque o
estudante vai encontra-los no codigo, na documentacao oficial e no livro.

## Frases das mensagens de erro do Python

Mensagem de erro e **citacao literal** do interpretador, e nao conteudo do livro:
pode ser exibida exatamente como aparece, entre bloco de codigo.

## Checklist antes de considerar uma unidade pronta

- [ ] A missao esta escrita como capacidade, nao como assunto.
- [ ] A leitura recomendada e especifica (qual parte, por que).
- [ ] A explicacao e original e cabe em uma tela.
- [ ] O exemplo e proprio e roda no Python atual.
- [ ] Existe aviso de versao, se o assunto mudou desde o livro.
- [ ] Os exercicios sao proprios e tem pratica de escrever codigo.
- [ ] A avaliacao tem 5 perguntas e aprova com 4 acertos.
- [ ] O enunciado da avaliacao diz que nao ha antifraude.
- [ ] O texto nao tem trecho, nome de exemplo ou exercicio do livro.
- [ ] Nenhum numero de pagina foi inventado (ver D-010).
