# ARQUITETURA

## A regra que sustenta tudo

> Uma única fonte de verdade decide. O mundo 3D e os painéis de interface apenas **leem** a
> decisão e a apresentam.

```
                    src/learning/            ← DECIDE (funções puras, testáveis)
                   /      │       \
        src/world/    src/ui/    src/persistence/
        (Three.js)   (painéis)   (localStorage)
        desenha      mostra      grava e lê
```

Consequências práticas, e o motivo de cada uma:

| Se a regra ficasse no 3D… | …então |
|---|---|
| Clicar na ponte poderia liberar a ilha | A ponte passa a ser consequência de uma decisão, e não a decisão |
| Mudar parâmetro na URL poderia pular etapa | A interface consulta a mesma função antes de abrir qualquer tela |
| Os painéis e a cena poderiam discordar | Existiriam duas fontes de verdade — o defeito que queremos evitar |
| A regra não seria testável sem montar a cena | `src/learning/` roda em teste puro, sem navegador e sem WebGL |

## Mapa das pastas

| Pasta | Responsabilidade | Estado |
|---|---|---|
| `src/app/` | Casca da aplicação, rotas por hash e as três páginas atuais | Existe |
| `src/world/` | Cena 3D: ilhas, pontes, avatar, câmeras, céu, névoa, chão caminhável e a geometria pura que alimenta tudo. **Sem regra de aprovação** | Existe e testado |
| `src/learning/` | Regras pedagógicas puras: aprovação, disponibilidade, reprovação | Existe e testado |
| `src/content/` | Conteúdo pedagógico como dado tipado, separado dos componentes | Existe para 4 unidades |
| `src/state/` | Estado em memória da sessão: o redutor é o **único** que chama `registrarResultado` | Existe e testado |
| `src/persistence/` | Gravação e leitura do progresso, versionado, com aviso honesto de falha | Existe e testado |
| `src/python/` | Pyodide em Web Worker, sob demanda | Vazio |
| `src/ui/` | Componentes, painéis do ciclo, tema, tokens visuais e mostruário de cores | Existe |
| `src/types/` | Apenas tipos transversais | Vazio |
| `src/utils/` | Apenas auxiliares genéricos sem domínio | Vazio |
| `qa/` | Verificações do projeto (não da aplicação), como a trava de acentuação | Existe |
| `docs/` | Documentação de continuidade | Existe |

Cada pasta vazia tem um `README.md` explicando sua responsabilidade e seus limites. Quem
continuar o trabalho abre a pasta e encontra a regra ali, onde ela importa.

## As três páginas de hoje

| Rota | Página | Para quê |
|---|---|---|
| `#/` | O mundo | Estudar: arquipélago 3D, trilha das ilhas e painel do ciclo de estudo |
| `#/painel` | Painel do projeto | Dizer o estado real: o que existe, o que não existe, o que está planejado |
| `#/tema` | Guia de estilo | Mostrar a linguagem visual em espécimes |

A regra do projeto proíbe alvo clicável **sem efeito** (D-009). É por isso que, numa máquina sem
WebGL, os botões de câmera e o de ligar o 3D **não aparecem**: eles não teriam o que fazer.

## O caminho do dado, do armazenamento até o pixel

```
localStorage ──lerProgresso──► useProgressoPersistido ──► estado.progresso
                                                              │
                                          ┌───────────────────┴────────────────────┐
                                          ▼                                        ▼
                                learning/percurso (decide)                state/sessao (redutor)
                                          │                                        │
                                          ▼                                        ▼
                              world/mundoVisivel (traduz)              ui/paineis (mostra o passo)
                                          │
                                          ▼
                              world/Cena (desenha, sem decidir)
```

Nenhuma seta aponta para trás: a cena não escreve em `learning/`, e o painel não calcula nota. O
único lugar que grava progresso é o redutor, e ele só grava o que `registrarResultado` devolveu.

## O caminho a pé, e por que não há motor de física

Andar pelo arquipélago poderia ser um motor de física. Não é, e a escolha tem motivo (D-029): um
motor traria peso, uma dependência que ninguém pediu e, sobretudo, um comportamento que **não dá
para conferir** neste ambiente — depende de navegador. Em vez disso, as superfícies onde dá para
pisar são declaradas:

| Peça | O que é | Onde |
|---|---|---|
| `world/mapaCaminhavel.ts` | Discos (capim de cada ilha) e faixas (tabuleiro de cada ponte inteira), com a altura do chão em cada ponto | Fonte do "onde se pisa" |
| `world/avatar/passos.ts` | Passo com deslize na beirada, giro do corpo, rota entre ilhas | Fonte do "como se anda" |
| `world/Avatar.tsx` | A figura, e o laço por quadro que escreve a posição no objeto | Desenho |
| `world/CameraDoAvatar.tsx` | Câmera atrás da pessoa, girando em volta dela | Desenho |

Duas invariantes que os testes cobram, e que valem mais do que qualquer sensação de jogo:

- **não existe chão fora do capim e do tabuleiro** — a altura é `null`, e o passo é recusado;
- **só ponte `liberada` vira chão**. A ponte pela metade é visível, clicável e explicável, mas não é
  caminho (D-004, D-030).

A altura do chão não é inventada: `alturaDoTopo()` em `geometria/ilha.ts` é a **mesma** função que
gera o domo do capim, e o topo do tabuleiro sai de `ESPESSURA_DO_TABULEIRO`. Foi essa unificação que
revelou o degrau de 0,36 entre a ponte e a borda da ilha (D-031).

## A cena em duas partes, e por quê

O último passo do caminho acima é desenhar. Ele acontece em dois arquivos, e a divisão não é
estética:

| Arquivo | O que faz | Precisa de WebGL? |
|---|---|---|
| `world/ConteudoDaCena.tsx` | Céu, câmera, pontes e ilhas — o mundo em si | **Não** |
| `world/Cena.tsx` | O `<Canvas>`, o contexto WebGL e os eventos de ponteiro que arrastam a câmera | Sim |

O motivo está em `docs/TEST_REPORT.md`: não existe navegador com WebGL neste ambiente, então tudo
que morasse dentro do `<Canvas>` ficaria sem verificação. Separado, o conteúdo do mundo é montado em
teste pelo `@react-three/test-renderer` — a árvore 3D de verdade, sem placa de vídeo (D-025). O que
a divisão **não** compra: aparência, luz, enquadramento e desempenho continuam sem verificação
automática, porque dependem do desenho na tela.

## Piso técnico

Vite + React + TypeScript. Three.js via React Three Fiber (sem Drei, D-021). CSS responsivo sem
framework. `localStorage` para o progresso (IndexedDB só se o volume exigir, e com autorização).
Vitest para lógica, render e interação em jsdom (D-020); Playwright para teste de navegador, ainda
não instalado.

### Versões resolvidas em 21/09/2026

| Pacote | Versão | Observação |
|---|---|---|
| node | 22.22.3 | ambiente de desenvolvimento |
| npm | 10.9.8 | |
| react / react-dom | 19.2.1 | 19.3.0 não é aceito pelo par de dependências do fiber 9.7.0 |
| vite | 8.3.0 | |
| @vitejs/plugin-react | 6.1.1 | |
| typescript | 7.0.2 | |
| vitest | 5.0.1 | |
| @types/react / @types/react-dom | 19.2.18 / 19.2.7 | |
| three / @react-three/fiber | 0.186.0 / 9.7.0 | a cena entra por importação sob demanda (D-022) |
| @types/three | 0.186.0 | apenas tipos |
| jsdom / @testing-library/react | 30.1.0 / 16.3.3 | desenvolvimento; `@testing-library/dom` 10.4.2 e `user-event` 14.6.7 junto |
| @react-three/test-renderer | 9.1.1 | desenvolvimento; monta a árvore 3D sem placa de vídeo (D-025) |
| @types/node | 26.6.2 | apenas tipos, para a verificação de qualidade em `qa/` |

**Nenhuma dependência sem uso.** `pyodide` chegou a estar instalado na Etapa 1, "para já ficar", e
foi removido na revisão da Etapa 4: nenhum arquivo o importava (D-026). Ele volta na Etapa 9, no
mesmo commit que traz o Web Worker que o usa.

Versões fixadas **exatas** (sem `^`) e `package-lock.json` versionado, para que outra pessoa, em
outra máquina, obtenha exatamente a mesma instalação. Ver `DECISIONS.md` (D-008).

## Tema visual: fonte única

`src/ui/theme/tokens.ts` é o único lugar onde uma cor é escrita. O CSS consome variáveis geradas
por `tokensComoVariaveisCss()`. `src/ui/theme/amostras.ts` lê os tokens para o guia de estilo, e
`contraste.ts` mede os pares. O teste percorre `PARES_DE_CONTRASTE` e falha se algum par não
atingir a WCAG AA.

Mudar a paleta é mudar um arquivo — e o teste avisa se a mudança quebrar a leitura.

**Única exceção:** `index.html` tem uma cor literal (`#dce4ec`) aplicada antes de o React montar,
para evitar o flash branco, quando ainda não existe JavaScript para gerar a variável. Está
comentada no arquivo. Se aparecer uma segunda, é sinal de que a fonte única vazou.

## Travas automáticas

| Verificação | Onde | O que impede |
|---|---|---|
| Contraste dos pares de cor | `src/ui/theme/contraste.test.ts` | Texto ilegível por escolha de cor |
| Todo botão tem rótulo e nenhum controle sem efeito | `src/app/App.test.tsx`, `Mundo.test.tsx` | Controle sem efeito (D-009) |
| Nenhuma resposta corrigida antes do envio | `src/app/paginas/Mundo.interacao.test.tsx` | Correção fora de hora, dica de gabarito |
| Aprovar não pode ser confundido com "já estava aprovada" | `src/state/sessao.test.ts` | Mensagem que mente sobre o histórico |
| Faces de todas as malhas para fora | `src/world/geometria/orientacao.test.ts` | Mundo invisível de fora |
| Nenhuma página inventada | `src/content/planoDeUnidades.test.ts` | Referência de página não verificada (D-010) |
| Aprovação só com 80% reais | `src/learning/avaliacao.test.ts` | Exibição que contradiz a decisão |
| Nenhum atalho de desbloqueio | `src/learning/percurso.test.ts` | Pular portão por rota, clique ou ordem |
| Acentuação do português | `qa/acentuacao.test.ts` | Texto sem acento no código e na documentação (D-015) |
| O mundo desenhado é o mundo prometido | `src/world/ConteudoDaCena.test.tsx` | Ilha sem biblioteca, mesa ou placa; ponte a mais ou a menos (D-025) |
| Nenhum gabarito viciado em uma posição | `src/content/conteudo.test.ts` | Alternativa correta sempre no mesmo lugar, **por unidade** (D-027) |
| Só ponte inteira vira chão | `src/world/mapaCaminhavel.test.ts` | Atravessar a pé onde a aprovação não chegou (D-029, D-030) |
| Ninguém anda para fora do chão | `src/world/avatar/passos.test.ts` | Queda no vazio, travessia por fora do tabuleiro |
| O caminhar funciona quadro a quadro | `src/world/ConteudoDaCena.test.tsx` | Avatar parado, teclas sem efeito, chão errado sob os pés (D-032) |

## Ambiente de execução (preview remoto)

O navegador do usuário **não** é a máquina onde o servidor roda. Por isso:

- o servidor de desenvolvimento escuta em `0.0.0.0` (`server.host: true`);
- `allowedHosts` inclui o domínio do proxy de preview (`.e2b.app`), porque o Vite recusa
  requisição com Host desconhecido;
- nada no código do navegador chama `localhost` para alcançar serviço remoto: caminhos
  relativos.

## Decisões de configuração com motivo

- `tsconfig.json` usa `"types": []` para não incluir automaticamente os tipos de todo pacote
  instalado. As duas referências necessárias são explícitas, no arquivo que precisa delas:
  `vite/client` em `src/vite-env.d.ts` e `node` em `qa/acentuacao.test.ts`.
- `@types/node` é a única dependência de tipos fora do React, e existe por um motivo concreto: o
  teste de acentuação lê arquivos do projeto e o `tsc` recusava `node:fs` sem ela. Não vai para o
  pacote final.
- Um único `tsconfig.json`, em vez dos três do modelo padrão do Vite: menos arquivo, mesma
  checagem. `npm run build` roda `tsc --noEmit` antes de empacotar.
- Teste em ambiente `node`. `jsdom` será adicionado quando existir teste de interação — não
  antes.
- `qa/` fica fora de `src/` porque contém verificação do **projeto**, não da aplicação.
