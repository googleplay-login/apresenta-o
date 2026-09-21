# HANDOFF — estado atual

Atualizado em **21/09/2026**, ao final da **Etapa 3**.

## Onde o projeto está

| | |
|---|---|
| Etapa atual | 3 concluída; 4 a 14 em sequência, sem parada entre etapas (instrução do usuário) |
| Código de aplicação | mundo 3D, ciclo de estudo completo e persistência local |
| Mundo 3D | **existe**: quatro ilhas suspensas, pontes, céu, mar e câmera livre |
| Conteúdo pedagógico | **existe** para as 4 primeiras unidades: missão, leitura, explicação, 3 exercícios e 5 perguntas cada |
| Telas do ciclo de estudo | **existem**: missão, estudo, prática, avaliação e resultado |
| Persistência | **existe**: `localStorage`, versionada, com aviso honesto de falha |
| Execução de código (Pyodide) | **não existe** — Etapa 9 |
| Avatar | **não existe** — Etapa 5 |
| Livro na tela | **não existe** — Etapa 6 |
| Testes de navegador | **não executados** — não há navegador neste ambiente |

Badge honesto: **o protótipo já ensina e já avalia, com o mundo desenhado — mas ninguém viu o
desenho, porque não há navegador aqui.**

## Como rodar

    cd arquipelago-python
    npm install
    npm run dev          # servidor de desenvolvimento, escuta em 0.0.0.0:5173
    npm test             # 398 testes, em 25 arquivos
    npm run build        # checagem de tipos + build de produção
    npm run typecheck    # apenas a checagem de tipos

Páginas:

| Rota | O que é |
|---|---|
| `#/` | **O mundo**: arquipélago 3D, HUD, e a trilha em texto com o painel do ciclo de estudo |
| `#/painel` | Painel do projeto: estado real, unidades planejadas, como verificar |
| `#/tema` | Guia de estilo: paleta, tipografia, espécimes e contraste medido |

Como usar o mundo, em uma linha: `W A S D` (ou setas) para andar, `Q`/`E` para subir e descer,
`Shift` para acelerar, arrastar o mouse para olhar, clique numa ilha liberada para abrir a missão.
Com o painel aberto, as teclas de movimento ficam desligadas e `Esc` fecha o painel (D-012).

## O que foi entregue

### Etapa 1.1 — fundação

- Projeto Vite + React + TypeScript, dependências **exatas** e lockfile versionado.
- `src/ui/theme/tokens.ts`: fonte única das cores, com teste de contraste WCAG AA.
- `src/content/`: as 4 primeiras unidades e a regra de referência ao livro, com página `null` +
  `referencia-pendente`.
- `src/`: esqueleto das pastas, cada uma com `README.md` dizendo sua responsabilidade e limites.
- `docs/`: os documentos de continuidade.

### Etapa 1.2 — guia de estilo

- Segunda página (`#/tema`) com espécimes da linguagem visual.
- Paleta **lida dos tokens**, não redigitada: se um token mudar, a página muda junto.
- Tabela de contraste medida na hora, com os mesmos pares que o teste verifica.
- Navegação por hash, sem dependência nova (D-016).
- **Correção de acentuação** em todo o código e a trava `qa/acentuacao.test.ts` (D-015).

### Etapa 2 — domínio e progressão

`src/learning/`, funções puras:

- aprovado com **80% reais**, em aritmética inteira (`acertos * 5 >= total * 4`);
- percentual exibido **sempre para baixo** — quem faz 79% lê 79%;
- reprovar não bloqueia a unidade nem apaga aprovação anterior;
- melhor nota só melhora; tentativas contadas;
- uma unidade por vez: só a anterior aprovada abre a próxima;
- **registrar resultado em unidade bloqueada é recusado** (D-017);
- nenhuma função aceita rota, hash, clique ou URL;
- progresso versionado e serializável.

### Etapa 3 — o mundo e o ciclo na tela

Camada pura:

- `world/geometria/`: gerador determinístico, rocha e topo da ilha, sólidos com **faces para
  fora**, pintura por altura, árvores, pedras, mesa, placa, biblioteca, farol;
- `world/mapaDoMundo.ts`: posição das ilhas, vão das pontes, enquadramento e espalhamento;
- `world/mundoVisivel.ts`: o **único** elo progresso ↔ cena. As ilhas chegam com situação e
  acessibilidade resolvidas, as pontes com "liberada" decidido. A cena não aprova nada (D-004);
- `world/camera/movimento.ts` e `world/teclas.ts`: câmera com limites, interpolação, teclas por
  `code` sem tecla presa.

Camada visual:

- `world/Cena.tsx` e companhia: célula de céu, mar, nuvens com semente fixa, ilha com estruturas e
  farol girando, pontes inteiras ou pela metade conforme a liberação, destaque no mouse;
- `ui/paineis/`: os cinco passos do ciclo, com abas, foco ao abrir e `Esc` fechando;
- `app/paginas/Mundo.tsx`: HUD (modo de câmera, placar, ajuda de teclas, avisos), trilha em texto
  equivalente ao mundo, e a ligação com a persistência;
- importação sob demanda da cena (D-022): o pacote principal ficou em 88 kB comprimidos.

Verificação:

- `jsdom` + Testing Library nos testes de interação (D-020): o ciclo inteiro é percorrido com
  cliques, teclado e `localStorage` de verdade. Dois defeitos reais apareceram na primeira
  execução e foram corrigidos no código, não no teste.

## Arquivos de referência rápida

| Assunto | Arquivo |
|---|---|
| O que é o projeto, o que não é | `docs/BRIEF.md` |
| Camadas, pastas, versões, travas automáticas | `docs/ARCHITECTURE.md` |
| Decisões com motivo e consequência | `docs/DECISIONS.md` |
| Livro, capítulos, páginas pendentes | `docs/BOOK_MAP.md` |
| Como escrever conteúdo | `docs/CONTENT_GUIDE.md` |
| Ciclo, estados, regras de aprovação | `docs/STATE_MACHINE.md` |
| Paleta, referência visual, o que não copiar | `docs/ART_DIRECTION.md` |
| Etapas e o que está autorizado | `docs/STAGES.md` |
| Testes realmente executados | `docs/TEST_REPORT.md` |

## Pendências herdadas

| Pendência | Efeito | Bloqueia o que |
|---|---|---|
| PDF do livro ausente | Toda página continua `null` | Etapas 6 e 7 (conferir página) |
| Imagens de referência ausentes no disco | Cor é estimativa visual, não medida | Refinar o 3D a partir delas |
| Nenhum navegador no ambiente | Sem teste de navegador automatizado, e o desenho 3D **não foi visto por ninguém** | Registrado em `TEST_REPORT.md`, com roteiro manual de 15 itens |
| Pyodide ausente | Sem execução de código | Etapa 9 |

## Decisões que ainda precisam do usuário

1. **Enviar o PDF** e as imagens de referência, ou confirmar que não serão enviados.
2. Reavaliar a densidade do capítulo 2 quando o PDF chegar (D-001 pode mudar para a opção A).
3. Definir se o **modo apresentação** (letreiro, faixa de teclas, pílula de navegação, inspirado
   nas referências) entra no protótipo ou fica para a Etapa 13.

## Próximo passo (em execução, sem parada)

**Etapa 4 — três ilhas e as pontes.** O mundo já desenha as quatro ilhas e as pontes; o que falta
é fazer a ponte e o desbloqueio mudarem de estado **na frente do usuário**, com a cena lendo a
decisão de `src/learning/` (que já existe e já é testada) e a travessia levando a câmera ou o
estudante à ilha seguinte.

## Como continuar sem mim

1. Ler este arquivo.
2. Ler `docs/STAGES.md` para saber o que está autorizado.
3. Ler `docs/DECISIONS.md` **antes** de mudar qualquer coisa estrutural.
4. Rodar `npm test` e `npm run build` para confirmar que o ponto de partida está saudável.
5. Não antecipar etapa: se a decisão não está registrada, ela ainda não foi tomada.
