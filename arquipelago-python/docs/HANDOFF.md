# HANDOFF — estado atual

Atualizado em **21/09/2026**, ao final das Etapas 1.1, 1.2 e 2.

## Onde o projeto está

| | |
|---|---|
| Etapa atual | 2 concluída; 3 proposta, **não autorizada** |
| Código de aplicação | fundação, tema visual, guia de estilo e regras de progressão |
| Mundo 3D | **não existe** |
| Conteúdo pedagógico | **não existe** (apenas o plano das 4 primeiras unidades) |
| Perguntas de avaliação | **não existem** (as regras existem e são testadas) |
| Telas do ciclo de estudo | **não existem** |
| Persistência | **não existe** |
| Pyodide | **não existe** |

Badge honesto: **o projeto hoje tem alicerce sólido, não é um jogo e não é um curso.**

## Como rodar

    cd arquipelago-python
    npm install
    npm run dev          # servidor de desenvolvimento, escuta em 0.0.0.0:5173
    npm test             # 122 testes, em 9 arquivos
    npm run build        # checagem de tipos + build de produção
    npm run typecheck    # apenas a checagem de tipos

Páginas:

| Rota | O que é |
|---|---|
| `#/` | Painel do projeto: estado real, unidades planejadas, como verificar |
| `#/tema` | Guia de estilo: paleta, tipografia, espécimes e contraste medido |

## O que foi entregue

### Etapa 1.1 — fundação

- Projeto Vite + React + TypeScript, dependências **exatas** e lockfile versionado.
- `src/ui/theme/tokens.ts`: fonte única das cores, com teste de contraste WCAG AA.
- `src/content/`: as 4 primeiras unidades e a regra de referência ao livro, com página `null` +
  `referencia-pendente`.
- `src/app/`: painel do projeto, sem nenhum botão.
- `src/`: esqueleto das pastas, cada uma com `README.md` dizendo sua responsabilidade e limites.
- `docs/`: os documentos de continuidade.

### Etapa 1.2 — guia de estilo

- Segunda página (`#/tema`) com espécimes da linguagem visual.
- Paleta **lida dos tokens**, não redigitada: se um token mudar, a página muda junto.
- Tabela de contraste medida na hora, com os mesmos pares que o teste verifica.
- Navegação por hash, sem dependência nova (D-016).
- **Correção de acentuação** em todo o código e a trava `qa/acentuacao.test.ts` (D-015), para o
  defeito não voltar.

### Etapa 2 — domínio e progressão

`src/learning/`, funções puras, 42 testes só neste módulo:

- aprovado com **80% reais**, em aritmética inteira (`acertos * 5 >= total * 4`);
- percentual exibido **sempre para baixo** — quem faz 79% lê 79%;
- reprovar não bloqueia a unidade nem apaga aprovação anterior;
- melhor nota só melhora; tentativas contadas;
- uma unidade por vez: só a anterior aprovada abre a próxima;
- **registrar resultado em unidade bloqueada é recusado** (D-017);
- nenhuma função aceita rota, hash, clique ou URL;
- progresso versionado e serializável, testado com ida e volta por JSON.

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
| PDF do livro ausente | Toda página continua `null` | Etapas 6 e 7 |
| Imagens de referência ausentes no disco | Cor é estimativa visual, não medida | Nada funciona mal; impede refinar o 3D a partir delas |
| Nenhum navegador no ambiente | Sem teste de navegador automatizado | Registrado em `TEST_REPORT.md` como não executado |

## Decisões que ainda precisam do usuário

1. **Enviar o PDF** e as imagens de referência, ou confirmar que não serão enviados.
2. **Autorizar a Etapa 3** — a primeira ilha 3D, com Three.js.
3. Reavaliar a densidade do capítulo 2 quando o PDF chegar (D-001 pode mudar para a opção A).
4. Definir se o modo apresentação (letreiro, faixa de teclas, pílula de navegação, inspirado nas
   referências) entra no protótipo ou fica para a Etapa 13.

## Próximo passo proposto (não iniciado)

**Etapa 3 — a primeira ilha 3D, com o ciclo completo ponta a ponta.** Uma ilha só, com missão,
leitura recomendada, explicação, prática, avaliação de 5 perguntas, aprovação e ponte liberada —
usando as regras que já existem e já são testadas.

Já decidido para essa etapa:

- Three.js via React Three Fiber e Drei — a primeira dependência de 3D;
- câmera com rotação limitada, mouse e teclado, e a **máquina de foco** de D-012;
- alternativa acessível em lista, com o mesmo ciclo e as mesmas regras;
- tela de fallback funcional quando WebGL não estiver disponível.

Por que a Etapa 3 é grande e precisa de cuidado: ela junta 3D, conteúdo e interface de avaliação
pela primeira vez. Se ela for mal dividida, o risco é entregar uma ilha bonita e vazia.

## Como continuar sem mim

1. Ler este arquivo.
2. Ler `docs/STAGES.md` para saber o que está autorizado.
3. Ler `docs/DECISIONS.md` **antes** de mudar qualquer coisa estrutural.
4. Rodar `npm test` e `npm run build` para confirmar que o ponto de partida está saudável.
5. Não antecipar etapa: se a decisão não está registrada, ela ainda não foi tomada.
