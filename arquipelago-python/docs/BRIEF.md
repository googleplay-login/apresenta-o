# BRIEF — Arquipélago Python

## O que é

Um **mundo 3D real, navegável e interativo** para aprender Python. Cada ilha suspensa é uma
unidade de aprendizagem. O estudante entra na ilha, lê a missão, estuda a parte correspondente
do livro, lê uma explicação original, pratica, faz a avaliação e, alcançando o mínimo, vê a
ponte para a próxima ilha se abrir.

Palavra que define o entregável: **aplicação**. Ver *O que este projeto não é*.

## O ciclo principal

    entrar na ilha
      → consultar a missão
      → estudar a parte identificada do livro
      → ler a explicação original
      → praticar
      → fazer a avaliação
      → nota real ≥ 80%
      → ponte liberada
      → próxima ilha

## Fonte de estudo

Eric Matthes, *Curso Intensivo de Python* (tradução de *Python Crash Course*), Novatec Editora,
1ª edição, maio de 2016. ISBN 978-85-7522-602-5. Original: No Starch Press, 2015,
ISBN 978-1-59327-603-4.

O livro é **fonte de estudo e mapa**, nunca texto a ser reproduzido. Detalhes em
`CONTENT_GUIDE.md`.

## Público

Quem está começando em Python e aprende melhor com contexto visual, movimento e objetivo claro.
Não pressupõe experiência anterior com programação.

## O que este projeto não é

- **Não é vídeo, nem imagem, nem maquete estática, nem cartões com aparência de ilha.** O mundo
  tem de ser 3D de verdade, navegável, com câmera e interação.
- **Não tem agente, LLM nem geração automática de conteúdo.** Não há botão de prompt. Todo texto
  pedagógico é escrito por nós.
- **Não tem autenticação, assinatura, pagamento, multiplayer nem servidor.** Nenhum backend sem
  autorização explícita. O progresso é local.
- **Não guarda segredo no cliente** e **não promete** que executar código arbitrário seja seguro.
- **Não alega antifraude.** A avaliação roda no cliente e uma pessoa determinada consegue ver as
  respostas. Isso é dito ao estudante com todas as letras. O objetivo é aprender, não policiar.
- **Não tem botão sem efeito.** Recurso que ainda não funciona não aparece na tela.

## Processo de trabalho

Desenvolvimento em etapas pequenas, verificáveis e **aprovadas uma a uma**. A aprovação de uma
etapa **não** autoriza a seguinte. Se uma etapa envolver sistemas demais, ela é dividida antes
de começar.

Cada etapa termina com um relatório de 8 itens, terminando em "Aguardando sua autorização para
continuar". O roteiro completo está em `STAGES.md`; o estado atual, em `HANDOFF.md`.

## Acessibilidade

Existe um caminho alternativo completo, sem 3D, que percorre o mesmo ciclo com as mesmas regras.
Não é uma versão reduzida: é a mesma aplicação com outra apresentação. O tema visual tem teste
automático de contraste (WCAG AA).
