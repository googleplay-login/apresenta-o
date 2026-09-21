# BRIEF - Arquipelago Python

## O que e

Um **mundo 3D real, navegavel e interativo** para aprender Python. Cada ilha
suspensa e uma unidade de aprendizagem. O estudante entra na ilha, le a missao,
estuda a parte correspondente do livro, le uma explicacao original, pratica,
faz a avaliacao e, alcancando o minimo, ve a ponte para a proxima ilha se abrir.

Palavra que define o entregavel: **aplicacao**. Ver *O que este projeto nao e*.

## O ciclo principal

    entrar na ilha
      -> consultar a missao
      -> estudar a parte identificada do livro
      -> ler a explicacao original
      -> praticar
      -> fazer a avaliacao
      -> nota real >= 80
      -> ponte liberada
      -> proxima ilha

## Fonte de estudo

Eric Matthes, *Curso Intensivo de Python* (traducao de *Python Crash Course*),
Novatec Editora, 1a edicao, maio de 2016. ISBN 978-85-7522-602-5.
Original: No Starch Press, 2015, ISBN 978-1-59327-603-4.

O livro e **fonte de estudo e mapa**, nunca texto a ser reproduzido. Detalhes em
`CONTENT_GUIDE.md`.

## Publico

Quem esta comecando em Python e aprende melhor com contexto visual, movimento e
objetivo claro. Nao pressupoe experiencia anterior com programacao.

## O que este projeto nao e

- **Nao e video, nem imagem, nem maquete estatica, nem cartoes com aparencia de ilha.**
  O mundo tem que ser 3D de verdade, navegavel, com camera e interacao.
- **Nao tem agente, LLM ou geracao automatica de conteudo.** Nao ha botao de prompt.
  Todo texto pedagogico e escrito por nos.
- **Nao tem autenticacao, assinatura, pagamento, multiplayer nem servidor.**
  Nenhum backend sem autorizacao explicita. O progresso e local.
- **Nao guarda segredo no cliente** e **nao promete** que executar codigo arbitrario
  seja seguro.
- **Nao alega antifraude.** A avaliacao roda no cliente e uma pessoa determinada
  consegue ver as respostas. Isso e dito ao estudante com todas as letras. O objetivo
  e aprender, nao policiar.
- **Nao tem botao sem efeito.** Recurso que ainda nao funciona nao aparece na tela.

## Processo de trabalho

Desenvolvimento em etapas pequenas, verificaveis e **aprovadas uma a uma**.
A aprovacao de uma etapa **nao** autoriza a seguinte. Se uma etapa envolver
sistemas demais, ela e dividida antes de comecar.

Cada etapa termina com um relatorio de 8 itens, terminando em
"Aguardando sua autorizacao para continuar". O roteiro completo esta em
`STAGES.md`; o estado atual, em `HANDOFF.md`.

## Acessibilidade

Existe um caminho alternativo completo, sem 3D, que percorre o mesmo ciclo com as
mesmas regras. Nao e uma versao reduzida: e a mesma aplicacao com outra
apresentacao. O tema visual tem teste automatico de contraste (WCAG AA).
