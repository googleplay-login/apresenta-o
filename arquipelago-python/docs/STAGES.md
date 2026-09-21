# ETAPAS

Regra do processo: **executa-se somente a etapa ou subetapa autorizada.** Aprovacao
de uma etapa nao autoriza a seguinte. Se uma etapa envolver sistemas demais, ela e
dividida antes de comecar.

Legenda de estado: `concluida` - `em andamento` - `nao iniciada`

| Etapa | Escopo | Estado |
|---|---|---|
| 0 | Analise dos anexos, identificacao do livro, plano das tres primeiras ilhas | **concluida** |
| 1 | Fundacao: projeto, tema visual e documentacao | **em andamento (1.1 concluida)** |
| 2 | Dominio e progressao, testados | nao iniciada |
| 3 | Uma ilha 3D, com o ciclo funcionando de ponta a ponta | nao iniciada |
| 4 | Tres ilhas e as pontes | nao iniciada |
| 5 | Navegacao e avatar | nao iniciada |
| 6 | Estudo e leitura do livro na tela | nao iniciada |
| 7 | Avaliacao | nao iniciada |
| 8 | Persistencia local e prototipo jogavel | nao iniciada |
| 9 | Prova de conceito de Pyodide | nao iniciada |
| 10 | Exercicios avaliados automaticamente | nao iniciada |
| 11 | Expansao curricular, em lotes de 2 a 3 unidades | nao iniciada |
| 12 | Recursos complementares | nao iniciada |
| 13 | Polimento, acessibilidade e desempenho | nao iniciada |
| 14 | Auditoria e entrega | nao iniciada |

---

## Etapa 0 - Analise e plano (concluida em 21/09/2026)

Inspecao do repositorio, identificacao do livro, mapa curricular preliminar,
proposta tecnica, riscos e divisao das etapas. Nenhum codigo escrito.

**Aprendizados que mudaram o plano:**
- o repositorio e **publico** - o que obrigou a decisao D-003 (PDF e imagens de
  terceiros nunca versionados);
- as imagens de referencia nao chegaram ao disco - a analise visual e estimativa,
  registrada como tal;
- o PDF do livro nao esta disponivel - toda pagina ficou `null` (D-010);
- as referencias visuais sao uma **aplicacao 3D de verdade** de outro projeto, e
  uma delas e um video dela - o que confirma o requisito de entregar aplicacao, e
  nao maquete nem gravacao.

## Etapa 1 - Fundacao (em andamento)

Dividida em subetapas porque envolve projeto, tema e documentacao ao mesmo tempo.

### 1.1 - Projeto, tema visual e documentacao. **CONCLUIDA em 21/09/2026**

Entregue:
- projeto Vite + React + TypeScript em `arquipelago-python/`, com versoes exatas
  fixadas e `package-lock.json`;
- tema visual derivado das referencias, com **fonte unica de tokens** e teste de
  contraste WCAG AA;
- as 4 primeiras unidades mapeadas ao livro, em dado tipado, com pagina
  `referencia-pendente`;
- os 10 documentos de continuidade em `docs/`;
- esqueleto de `src/` com a responsabilidade e os limites de cada pasta escritos
  no proprio diretorio;
- servidor de desenvolvimento escutando em `0.0.0.0`, compativel com preview remoto.

**Limite explicito:** nenhum 3D, nenhuma aula, nenhuma pergunta, nenhum
armazenamento, nenhum Pyodide. A pagina inicial **nao tem um unico botao**, por
D-009.

### 1.2 - Previa visual do tema (a autorizar)

Objetivo: uma pagina que mostre a linguagem visual funcionando - ceu, mar, painel
creme, chips, tipografia - **sem** 3D e **sem** conteudo pedagogico, para validar o
tema antes de investir na cena.

Nao inclui: ilha, ponte, camera, Three.js.

> Aguardando autorizacao. Nao iniciada.

---

## Etapas seguintes - escopo previsto, nao detalhado

O detalhamento de cada uma sera feito na autorizacao da propria etapa. Registro do
que **nao** pode ser antecipado:

- **2** - `src/learning/` com funcoes puras: aprovacao (nota real >= 80 antes de
  arredondar), disponibilidade, efeito da reprovacao, desbloqueio apenas da proxima
  unidade. Testado com Vitest. **Sem React e sem Three.js.**
- **3** - primeira ilha 3D com o ciclo completo funcionando ponta a ponta. Uma ilha
  so, com tudo funcionando, **antes** de existir a segunda. E aqui que a maquina de
  foco de teclado (D-012) entra.
- **4** - tres ilhas e as pontes, com o desenho da cena lendo a decisao de
  `src/learning/`.
- **5** - navegacao e avatar.
- **6** - estudo: leitura recomendada, explicacao original, diagrama do livro.
- **7** - avaliacao: 5 perguntas, exigir resposta em todas, corrigir apos envio.
- **8** - persistencia local versionada e prototipo jogavel.
- **9** - prova de conceito de Pyodide em Web Worker, carregado sob demanda.
- **10** - exercicios com correcao automatica.
- **11** - expansao curricular em lotes de 2 a 3 unidades, uma autorizacao por lote.
- **12** - recursos complementares.
- **13** - polimento, acessibilidade e desempenho.
- **14** - auditoria e entrega.

## Requisitos do prototipo minimo

- 3 ilhas: 1 disponivel e 2 bloqueadas.
- 5 perguntas por ilha.
- Aprovar com 4 de 5 (80%).
- Ponte liberada apos a aprovacao.
- Progresso salvo localmente.
- Mouse e teclado.
- Alternativa acessivel sem 3D.
- Tratamento de falha de WebGL e de armazenamento indisponivel.
