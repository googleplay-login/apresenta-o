# HANDOFF - estado atual

Atualizado em **21/09/2026**, ao final da Etapa 1.1.

## Onde o projeto esta

| | |
|---|---|
| Etapa atual | 1.1 concluida; 1.2 proposta, **nao autorizada** |
| Codigo de aplicacao | fundacao, tema visual e dado de planejamento |
| Mundo 3D | nao existe |
| Conteudo pedagogico | nao existe (apenas o plano das 4 primeiras unidades) |
| Avaliacao | nao existe |
| Persistencia | nao existe |
| Pyodide | nao existe |

Badge honesto: **o projeto hoje e um alicerce bonito, nao um jogo e nao um curso.**

## Como rodar

    cd arquipelago-python
    npm install
    npm run dev          # servidor de desenvolvimento, escuta em 0.0.0.0:5173
    npm test             # 47 testes
    npm run build        # checagem de tipos + build de producao
    npm run typecheck    # apenas a checagem de tipos

## O que foi entregue na Etapa 1.1

- Projeto Vite + React + TypeScript, dependencias **exatas** e lockfile versionado.
- `src/ui/theme/tokens.ts`: fonte unica das cores, com teste de contraste WCAG AA.
- `src/content/`: as 4 primeiras unidades e a regra de referencia ao livro, com
  pagina `null` + `referencia-pendente`.
- `src/app/`: pagina inicial honesta, **sem nenhum botao**, que lista o que existe
  (com o comando que comprova) e o que ainda nao existe. Ha um teste que reprova a
  pagina se aparecer um `<button>`, um `<a>` ou um `onclick` no HTML gerado.
- `src/`: esqueleto das pastas, cada uma com `README.md` dizendo sua
  responsabilidade e seus limites.
- `docs/`: os 10 documentos de continuidade.
- Servidor configurado para o preview remoto (`0.0.0.0` + `allowedHosts`).

## Arquivos de referencia rapida

| Assunto | Arquivo |
|---|---|
| O que e o projeto, o que nao e | `docs/BRIEF.md` |
| Camadas, pastas, versoes, por que | `docs/ARCHITECTURE.md` |
| Decisoes com motivo e consequencia | `docs/DECISIONS.md` |
| Livro, capitulos, paginas pendentes | `docs/BOOK_MAP.md` |
| Como escrever conteudo | `docs/CONTENT_GUIDE.md` |
| Ciclo, estados, regras de aprovacao | `docs/STATE_MACHINE.md` |
| Paleta, referencia visual, o que nao copiar | `docs/ART_DIRECTION.md` |
| Etapas e estado de cada uma | `docs/STAGES.md` |
| Testes realmente executados | `docs/TEST_REPORT.md` |

## Pendencias herdadas

| Pendencia | Efeito | Bloqueia o que |
|---|---|---|
| PDF do livro ausente | Toda pagina continua `null` | Etapas 6 e 7 (estudo e avaliacao) |
| Imagens de referencia ausentes no disco | Cores sao estimativa visual, nao medida | Nada funciona mal; impede conferir a paleta e refinar a direcao visual |
| Nenhum navegador no ambiente | Sem teste de navegador automatizado | Registrado em `TEST_REPORT.md` como nao executado |

## Decisoes que ainda precisam do usuario

1. **Reavaliar a densidade do capitulo 2** quando o PDF chegar (D-001 pode ser
   revertida para a opcao A se o recorte se mostrar enxuto demais).
2. **Enviar o PDF** e as imagens de referencia, ou confirmar que nao serao enviados.
3. **Autorizar (ou nao) a Etapa 1.2** - previa visual do tema, sem 3D.
4. Definir se o modo apresentacao (cartao de contexto, faixa de dica, pilula de
   navegacao, inspirado nas referencias) faz parte do escopo do prototipo ou fica
   para a Etapa 13.

## Proximo passo proposto (nao iniciado)

**Etapa 1.2 - Previa visual do tema.** Uma pagina que mostre a linguagem visual
funcionando - ceu, mar, painel creme, chips, tipografia, estados de unidade - sem
3D e sem conteudo pedagogico, para validar o tema antes de construir a cena.

Motivo de ser uma subetapa separada: o tema ja esta implementado e testado, entao
validar a aparencia agora custa pouco. Se a aparencia mudar depois, muda em um
arquivo. Se o tema estiver errado, e melhor descobrir antes de existir cena.

## Como continuar sem mim

1. Ler este arquivo.
2. Ler `docs/STAGES.md` para saber o que esta autorizado.
3. Ler `docs/DECISIONS.md` **antes** de mudar qualquer coisa estrutural.
4. Rodar `npm test` e `npm run build` para confirmar que o ponto de partida esta
   saudavel.
5. Nao antecipar etapa: se a decisao nao esta registrada, ela ainda nao foi tomada.
