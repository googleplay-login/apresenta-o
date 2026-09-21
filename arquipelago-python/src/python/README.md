# `src/python` — executar Python no navegador

Pyodide em Web Worker, carregado **sob demanda**, para o estudante rodar código sem
instalar nada.

## Regras que definem este diretório

- Sem segredo no cliente. Tudo que roda no navegador é visível para quem quiser ver.
- **Não prometer** que executar código arbitrário é seguro. Não é, e o texto do
  exercício não vai dizer que é.
- Carregar somente quando o estudante pedir para executar, mantendo o download
  pesado fora do carregamento inicial.

## Estado

**Não implementado.** Etapas 9 (prova de conceito) e 10 (exercícios com correção
automática). Nesta etapa não existe nem a dependência do Pyodide instalada.
