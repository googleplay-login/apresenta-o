# `src/python` - executar Python no navegador

Pyodide em Web Worker, carregado **sob demanda**, para o estudante rodar codigo sem
instalar nada.

## Regras que definem este diretorio

- Sem segredo no cliente. Tudo que roda no navegador e visivel para quem quiser ver.
- Nao prometer que executar codigo arbitrario e seguro. Nao e, e o texto do exercicio
  nao vai dizer que e.
- Carregar somente quando o estudante pedir para executar: manter o download pesado
  fora do carregamento inicial.

## Estado

Nao implementado. Etapa 9 (prova de conceito) e Etapa 10 (exercicios avaliados).
Nesta etapa nao existe nem a dependencia do Pyodide instalada.
