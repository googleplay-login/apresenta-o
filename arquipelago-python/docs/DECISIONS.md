# DECISÕES

Registro do que foi decidido, com o motivo e a consequência. Uma decisão sem motivo registrado
vira folclore: a próxima pessoa não sabe se pode mudá-la.

Formato: `D-nnn`, data, decisão, contexto, alternativas, consequência.
Decisão reversível foi tomada com padrão proposto, e não com pergunta.

---

## D-001 — Dividir o capítulo 2 do livro em duas unidades
**21/09/2026** — aprovada pelo usuário (opção B).

**Decisão:** as três primeiras unidades passam a ser quatro: Cap. 1; Cap. 2 recorte 2a
(variáveis, `print()`, números, comentários); Cap. 2 recorte 2b (strings e seus métodos);
Cap. 3 (listas).

**Contexto:** o capítulo 2 cobre variáveis, strings inteiras, números e comentários. Mantido
como uma ilha única, viraria uma sessão longa demais e quebraria o ritmo do ciclo.

**Alternativas:** (A) comprimir o capítulo em uma ilha enxuta; (B) dividir em duas; (C) esperar
o PDF e decidir pela densidade real em páginas.

**Consequência:** quatro ilhas cobrem três capítulos. A densidade pode ser reavaliada quando o
PDF estiver disponível.

---

## D-002 — Aplicação nova em pasta própria
**21/09/2026** — aprovada pelo usuário.

**Decisão:** a aplicação nasce em `arquipelago-python/`, dentro deste repositório, sem tocar em
`Nova pasta/index.html.html`.

**Contexto:** o repositório já continha um site institucional estático (Clínica Estelo), sem
nenhuma relação com este projeto. Regra do usuário: preservar trabalho existente.

**Consequência:** os dois projetos convivem no mesmo repositório, sem dependência entre eles. O
site existente não será sobrescrito, movido nem apagado.

---

## D-003 — PDF do livro e imagens de terceiros nunca entram no Git
**21/09/2026** — decisão técnica, verificada.

**Decisão:** `livro-local/` e `referencias-locais/` ficam no `.gitignore`, e ambas fora de
`public/`.

**Contexto:** verificado com `gh repo view` que o repositório é **público** (`isPrivate: false`).
Publicar o PDF de um livro comercial seria violação de direito autoral. As imagens de referência
são capturas de um produto de terceiros, com direitos não esclarecidos.

**Consequência:** a memória durável do projeto é a **derivação escrita** dessas referências
(`ART_DIRECTION.md`), não os arquivos. Ficarem fora de `public/` garante que nunca sejam
copiadas para `dist/` nem publicadas por um deploy.

---

## D-004 — Uma única fonte de verdade para as regras de progressão
**21/09/2026** — decisão de arquitetura.

**Decisão:** as regras pedagógicas vivem em `src/learning/` como funções puras. A cena 3D e os
painéis apenas consultam. Não existe regra de aprovação dentro do mundo 3D nem na interface.

**Contexto:** o usuário proibiu explicitamente que o estudante desbloqueie uma unidade abrindo um
painel, mudando parâmetro na URL ou clicando numa ponte.

**Consequência:** a ponte é **consequência** de uma decisão, nunca a decisão. O mesmo resultado
aparece no 3D e na alternativa acessível, porque ambos leem a mesma função.

---

## D-005 — Tokens de tema como fonte única das cores
**21/09/2026** — decisão de implementação.

**Decisão:** toda cor vive em `src/ui/theme/tokens.ts`. O CSS consome variáveis geradas. Nenhuma
cor literal em arquivo `.css`.

**Contexto:** paleta duplicada entre TypeScript e CSS desvia silenciosamente, e desvio de cor
quebra contraste sem ninguém perceber.

**Consequência:** mudar a paleta é mudar um arquivo. O teste percorre `PARES_DE_CONTRASTE` e
falha se algum par deixar de atender à WCAG AA. Exceção declarada: a cor de pré-pintura em
`index.html` (ver `ARCHITECTURE.md`).

---

## D-006 — Separar "quanto já construímos" de "o que o estudante pode acessar"
**21/09/2026** — decisão de modelagem.

**Decisão:** `SituacaoDeConstrucao` (`planejada` | `em-construcao` | `pronta`) descreve o
progresso do **desenvolvimento**. O estado do estudante é outro conceito:
`EstadoDaUnidade` (`bloqueada` | `disponivel` | `aprovada`), em `src/learning/percurso.ts`.

**Contexto:** misturar os dois produz a confusão clássica: uma unidade "planejada" aparecer como
se estivesse bloqueada por desempenho do estudante.

**Consequência:** são dois tipos distintos, em módulos distintos, e nenhum importa o outro.

---

## D-007 — Idioma no código
**21/09/2026** — padrão adotado (reversível).

**Decisão:** identificadores de **domínio** em português (`UnidadePlanejada`, `ReferenciaLivro`,
`percursoDaUnidade`). Termos de **ecossistema e infraestrutura** permanecem em inglês
(`useState`, `createRoot`, `tokens`, `contrastRatio`). Identificadores **não** levam acento, por
compatibilidade com ferramentas; todo o resto — comentário, texto de interface, documento — leva
acento correto (D-015).

**Contexto:** traduzir `useState` para `usarEstado` atrapalha quem conhece o ecossistema; manter
`unitPlanned` obriga a traduzir mentalmente o domínio, que é onde está a regra de negócio.

**Consequência:** convenção mista e deliberada, documentada aqui para não parecer descuido.

---

## D-008 — Versões exatas e sem dependência por conveniência
**21/09/2026** — decisão de implementação.

**Decisão:** dependências instaladas com `--save-exact`. `package-lock.json` versionado.
**Nenhuma** dependência adicional sem necessidade demonstrada.

**Contexto:** regra do usuário: registrar versões resolvidas, manter lockfile, não adicionar
dependência por conveniência.

**Consequência:** até aqui, 10 pacotes (2 de produção, 8 de desenvolvimento). `jsdom` **não** foi
instalado: os testes atuais são de função pura e de render estático, sem eventos. Será adicionado
quando existir teste de interação. Um roteador de mercado também não entrou: a navegação por hash
custou 40 linhas e nenhuma dependência (D-016).

**Única adição posterior, com motivo declarado:** `@types/node` (26.6.2), exigida pelo `tsc` para
o teste de acentuação, que lê arquivos do projeto. É pacote **de tipos**, não entra no pacote
final, e a referência a ele é explícita em um único arquivo (`qa/acentuacao.test.ts`), mantendo o
`"types": []` do `tsconfig.json`.

---

## D-009 — Nenhum botão sem efeito
**21/09/2026** — decisão de experiência, derivada de regra do usuário.

**Decisão:** recurso não implementado não aparece como botão. O painel do projeto **não tem
nenhum botão**, e explica por quê. As duas abas de navegação são links, porque navegar
**funciona** de verdade.

**Contexto:** um botão "Entrar na ilha" que não faz nada é promessa vazia e destrói a confiança
no primeiro contato.

**Consequência:** um teste reprova o painel se aparecer um `<button>`, um `onclick` ou um link
que não seja uma rota interna. No guia de estilo, a regra é mais rígida: nada clicável.

---

## D-010 — Página de livro nula até verificação
**21/09/2026** — decisão de conteúdo.

**Decisão:** `paginaImpressa` e `paginaPdf` ficam `null` e `status` fica `'referencia-pendente'`
enquanto o livro não puder ser conferido. A interface exibe "página: referência pendente".

**Contexto:** o texto do livro chegou como conversão epub, sem numeração de páginas. Página
impressa e página de PDF são coisas diferentes e o deslocamento entre elas **não é constante** —
não pode ser presumido.

**Consequência:** `referenciaEstaCoerente()` recusa referência `'confirmada'` com apenas uma das
duas páginas, e um teste impede que alguém preencha um número não verificado. Número de página
errado é pior do que número nenhum: manda o estudante ler a página errada.

---

## D-011 — Servidor escuta em 0.0.0.0 e aceita o host do preview
**21/09/2026** — decisão de ambiente.

**Decisão:** `server.host: true` e `allowedHosts: ['.e2b.app']`.

**Contexto:** o preview é remoto e servido por um domínio proxied. Sem `allowedHosts` o Vite
responde "Blocked request. This host is not allowed", e o servidor preso em `127.0.0.1` seria
inalcançável pelo navegador do usuário.

**Consequência:** a lista de hosts é restrita ao domínio do ambiente de desenvolvimento — não foi
usado `allowedHosts: true`, que aceitaria qualquer host. Verificado por requisição: host do
preview responde 200, host estranho responde 403.

---

## D-012 — Máquina de foco de teclado desde o início
**21/09/2026** — decisão derivada das referências visuais. **Ainda não implementada** (depende da
Etapa 3).

**Decisão:** quando existir cena 3D, o foco de teclado terá regra explícita: com um painel de
leitura aberto, `W A S D` **não** move a câmera; `Esc` fecha o painel e devolve o foco ao mundo.

**Contexto:** nas imagens de referência, `W A S D` voa e `Esc` sai do modo apresentação. Sem
separação de foco, o estudante digita uma resposta e a câmera dispara.

**Consequência:** entra no escopo do protótipo 3D desde a primeira ilha, e não como polimento
final.

---

## D-013 — Navegação entre unidades restrita ao que está liberado
**21/09/2026** — decisão derivada das referências visuais.

**Decisão:** o seletor de unidades (equivalente ao "Explorar estações" das referências) só
oferece destinos desbloqueados.

**Contexto:** nas referências ele é navegação livre. Aqui, navegação livre entre unidades é
exatamente o vetor de burla proibido pelo usuário.

**Consequência:** divergência deliberada em relação à referência. O seletor consulta a mesma
função pura que a ponte e os painéis.

---

## D-014 — Referência visual não é asset
**21/09/2026** — decisão de direitos e de método.

**Decisão:** as imagens de referência orientam direção visual e de interação. **Nenhum** asset,
texto, diagrama, nome ou marca de terceiro é reaproveitado. Geometria e materiais são próprios.

**Contexto:** as imagens são capturas de outra aplicação. Regra do usuário: asset externo exige
licença conhecida e documentada.

**Consequência:** não há licença de terceiro a rastrear, porque nada de terceiro é usado. O botão
"Prompt" da referência é função de LLM e **não** será replicado.

---

## D-015 — Acentuação correta em todo texto em português
**21/09/2026** — correção de defeito encontrado pelo próprio autor.

**Decisão:** todo texto em português — interface, conteúdo, comentário de código e documento —
usa **acentuação correta**. Identificadores e nomes de arquivo permanecem sem acento, por
compatibilidade com ferramentas.

**Contexto:** a primeira entrega saiu inteira sem acento — palavras como "não", "referência" e
"código" apareciam escritas sem o acento que lhes é próprio. A justificativa silenciosa era medo
de problema de codificação. Em UTF-8 não há problema algum: era descuido, e num produto em
português isso é defeito visível em toda tela e em toda página. Corrigido antes de avançar para a
etapa seguinte (regra do usuário: corrigir erros antes de ir para a próxima).

**Consequência:** `qa/acentuacao.test.ts` varre código e documentação atrás de palavras que nunca
são escritas sem acento em português, removendo antes os identificadores de código. Palavras
ambíguas de propósito ficam de fora (`esta`/`está`, `e`/`é`, `da`/`dá`), então a trava pega a
maioria dos casos e **não substitui revisão** — isso está escrito no próprio arquivo.

---

## D-016 — Navegação por hash, sem biblioteca de rotas
**21/09/2026** — padrão adotado (reversível).

**Decisão:** duas rotas (`#/` e `#/tema`) resolvidas por um mapa de hash para rota, em
`src/app/rotas.ts`, com um hook de 15 linhas. Sem dependência.

**Contexto:** o guia de estilo precisava de endereço próprio. Um roteador de mercado traria uma
dependência inteira para duas rotas. Caminho de URL exigiria regra de reescrita no servidor.

**Consequência:** `rotaDoHash` desconhecido cai na rota padrão, sem erro. Um teste garante que
nenhum hash — conhecido ou inventado — devolve algo além das rotas declaradas: não existe rota
que desbloqueie unidade.

---

## D-017 — Resultado de avaliação só é aceito em unidade acessível
**21/09/2026** — endurecimento das regras, durante a Etapa 2.

**Decisão:** `registrarResultado` recusa unidade **bloqueada**, lançando erro. A decisão anterior
era aceitar e simplesmente não desbloquear.

**Contexto:** aceitar permitia acumular aprovação numa unidade ainda fechada e "chegar antes" do
portão — exatamente o atalho que o usuário proibiu. Um teste escrito por mim falhou por causa da
regra nova; a decisão foi **corrigir o teste**, não afrouxar a regra.

**Consequência:** a única entrada capaz de mudar o estado exige unidade acessível e resultado de
avaliação válido. Registrar resultado de unidade inexistente também lança — assim ninguém cria
progresso para uma unidade que não existe no percurso.

---

## D-018 — Aprovação e exibição nunca se contradizem
**21/09/2026** — decisão de implementação derivada de regra do usuário.

**Decisão:** a comparação de aprovação é feita em **inteiros** (`acertos * 5 >= total * 4`), e o
percentual exibido é **sempre arredondado para baixo**.

**Contexto:** `4 / 5 >= 0.8` é falso em ponto flutuante binário, porque 0,8 não é representável
exatamente. Uma regra de aprovação não pode depender disso. E arredondar para cima na tela faria
79,6% aparecer como 80% para quem foi reprovado.

**Consequência:** dois testes percorrem todos os totais de 1 a 60 e falham se a decisão e o
percentual exibido se contradizerem — isto é, se alguém reprovado vir "80%" ou alguém aprovado
vir menos de 80%.

---

## D-019 — Guia de estilo como página, e não como documento
**21/09/2026** — padrão adotado (reversível).

**Decisão:** a linguagem visual é apresentada em uma página navegável (`#/tema`) que mostra
espécimes, a paleta real lida dos tokens e a **tabela de contraste medida na hora**.

**Contexto:** validar a aparência antes de construir a cena 3D. Um documento com imagens
envelheceria em silêncio; a página lê os tokens de verdade, então não pode divergir deles.

**Consequência:** se um token mudar, a página muda junto. Se uma cor for acrescentada, um teste
avisa que ela não apareceu no mostruário. O que a página **não** faz: medir os pixels na tela —
isso continua registrado como não executado em `TEST_REPORT.md`.

---

## D-020 — Testes de interação com DOM de verdade, e não só com HTML estático
**21/09/2026** — decisão de verificação, na Etapa 3.

**Decisão:** acrescentar `jsdom`, `@testing-library/react`, `@testing-library/dom` e
`@testing-library/user-event` (todas de desenvolvimento, versões fixas) e rodar os testes de
interação **por arquivo**, com `// @vitest-environment jsdom` na primeira linha. A configuração
global continua em `node`.

**Contexto:** até aqui a suíte provava funções puras e HTML gerado por `renderToStaticMarkup`.
Isso não prova que clicar leva a algum lugar — e boa parte das regras deste projeto é sobre não
poder ser contornada pela interface. Sem navegador neste ambiente, o DOM simulado é o mais perto
que dá para chegar.

**Consequência:** o ciclo inteiro (missão → estudo → prática → avaliação → resultado) é
percorrido com cliques, teclado e `localStorage` de verdade. Dois defeitos reais apareceram no
primeiro dia de uso desta suíte: a tela dizia "você já havia aprovado" logo depois da primeira
aprovação, e "Seguir para a próxima ilha" não fazia nada visível na versão sem 3D. Os dois foram
corrigidos no código.

**Limite declarado:** `jsdom` não desenha nada. Aparência, contraste, layout, arrasto de mouse e
WebGL continuam **não executados**, com roteiro manual em `TEST_REPORT.md`.

---

## D-021 — Sem `@react-three/drei` no protótipo
**21/09/2026** — padrão adotado (reversível).

**Decisão:** remover `@react-three/drei` das dependências. O mundo usa apenas `three` e
`@react-three/fiber`.

**Contexto:** a biblioteca foi instalada junto com as outras, na suposição de que os ajudantes de
cena seriam usados. Não foram: nenhum componente do `drei` aparece em `src/`. Como o compilador de
pacote não inclui o que ninguém importa, o arquivo final não mudou com a remoção — o que muda é a
árvore de dependências instalada, a superfície para revisar e a mensagem: o projeto usa o que
declara. Se algum ajudante fizer falta (controles de órbita, por exemplo), ele volta com
justificativa escrita.

---

## D-022 — A cena 3D entra por importação sob demanda
**21/09/2026** — decisão de desempenho, na Etapa 3.

**Decisão:** `Cena` é carregada com `React.lazy` + `import()` dinâmico, com um aviso honesto
enquanto o pacote chega.

**Contexto:** o `three` responde pela maior parte do pacote final. A trilha em texto é a
alternativa de quem não tem placa de vídeo — e também o caminho de quem tem uma conexão ruim.
Não faz sentido obrigar essas pessoas a baixar o desenho do mundo.

**Consequência medida:** o pacote principal caiu de **1.184 kB (329 kB gzip)** para
**276 kB (88 kB gzip)**; a cena virou um segundo arquivo de 910 kB (242 kB gzip), buscado só
quando há WebGL e o modo 3D está ligado.

---

## D-023 — A aprovação anterior é fotografada ao abrir a ilha
**21/09/2026** — defeito encontrado por teste, na Etapa 3.

**Decisão:** `sessao.aprovadaAntes` é gravado pela ação `abrirUnidade`, e não lido do progresso a
cada desenho.

**Contexto:** a tela de resultado tem duas mensagens: "a ponte para a próxima ilha está inteira" e
"você já havia aprovado esta ilha — a nova tentativa não tirou nada do que já valia". A segunda
dependia de `progresso.unidades[id].aprovada`, lido ao vivo. Como a própria aprovação muda esse
campo, quem aprovava pela primeira vez lia **"você já havia aprovado"** — mentira, na cara de quem
acabou de ver a nota.

**Consequência:** a pergunta "isto já estava aprovado **antes** desta tentativa?" tem resposta
estável durante toda a sessão da ilha. Um teste de interação cobre os dois casos, e um teste do
redutor confirma que a aprovação conquistada agora **não** conta como anterior.

---

## D-024 — A travessia é decidida por função pura, e o clique nunca libera
**21/09/2026** — decisão de arquitetura, na Etapa 4.

**Decisão:** o que acontece ao clicar numa ponte é decidido por `decidirTravessia(ponte, ilhas)`,
função pura em `src/world/mundoVisivel.ts`, que devolve `atravessar` ou `recusar` com o motivo
escrito.

**Contexto:** a regra do projeto proíbe que clicar numa ponte desbloqueie uma unidade. Se a decisão
morasse dentro do componente da cena, ela seria **inverificável** neste ambiente — não há WebGL para
testá-la — e ficaria fácil de quebrar sem ninguém notar. Como função pura, é testada exaustivamente:
um teste percorre todos os progressos possíveis do começo até três aprovações e falha se a travessia
acontecer sem o domínio ter liberado o destino.

**Consequência:** a ponte pela metade **responde** ao clique — não fica em silêncio —, mas a
resposta é uma explicação (`recusar`), e não uma passagem. O cursor de "mãozinha" é do CSS da cena,
não escrito à mão no `<canvas>`: quem desenha avisa que o mouse está em cima, e o estilo continua na
folha de estilo.

---

## D-025 — O conteúdo do mundo é separado da casca que o desenha
**21/09/2026** — decisão de testabilidade, na revisão da Etapa 4.

**Decisão:** `world/ConteudoDaCena.tsx` monta céu, câmera, pontes e ilhas; `world/Cena.tsx` fica com a
casca — o `<Canvas>`, o WebGL e os eventos de ponteiro que arrastam a câmera.

**Contexto:** um `<Canvas>` do React Three Fiber exige placa de vídeo e um `ResizeObserver` de
verdade; montá-lo aqui é impossível (registrado em `TEST_REPORT.md`). Com tudo dentro de um arquivo
só, o mundo era verificado apenas por **dublê**: os testes de página trocavam a cena por um marcador,
e o pior caso possível — alguém apagar a biblioteca de dentro da ilha, ou o computador da mesa — não
seria percebido por nenhum teste. Separando o conteúdo da casca, o teste monta a **árvore 3D real**
com `@react-three/test-renderer`: sem placa de vídeo, sem pixel, mas com os objetos verdadeiros.

**Consequência:** dez testes conferem que existe uma ilha por unidade planejada, que cada ilha tem
biblioteca, mesa e placa de missão, que há uma ponte para cada par vizinho e nenhuma depois da
última, que clicar no corpo da ilha escolhe aquela unidade e que a ponte bloqueada **desenha menos
tábuas** que a liberada. Continua sem provar aparência — para isso é preciso navegador, e continua
pendente. Os grupos da cena ganharam `name` estável (`ilha:*`, `corpo`, `biblioteca`, `mesa`,
`placa`, `farol`, `ponte:A->B`) por causa desses testes; um nome trocado por descuido reprova o
teste em vez de passar despercebido.

---

## D-026 — Nenhuma dependência entra antes do código que a usa
**21/09/2026** — correção de rumo, na revisão da Etapa 4.

**Decisão:** `pyodide` foi **removido** de `devDependencies` e volta quando a Etapa 9 escrever o
primeiro código que o usa.

**Contexto:** a dependência tinha sido instalada junto com o pacote, na Etapa 1, "para já ficar".
Nenhum arquivo a importava: era peso morto no `package.json`, do tipo que envelhece sem ninguém
notar — e o `src/python/README.md` dizia, ao mesmo tempo, que a dependência nem estava instalada. A
instalação do Pyodide é dezenas de megabytes; anunciá-la sem uso é ruído na auditoria de
dependências.

**Consequência:** o `package.json` só lista o que o projeto usa. A Etapa 9 acrescenta o pacote no
mesmo commit que traz o Web Worker.

---

## D-027 — A posição da alternativa correta varia, e o teste cobra isso por unidade
**21/09/2026** — defeito real encontrado por revisão, na revisão da Etapa 4.

**Decisão:** em cada unidade, as cinco perguntas distribuem a alternativa correta pelas **quatro
posições**, usando todas; e o teste passa a exigir essa variedade **unidade por unidade**.

**Contexto:** `u03Strings` tinha as cinco respostas corretas na posição 1. Quem não sabe o conteúdo
percebe o padrão e acerta 100% — pior: quem estuda de verdade passa a desconfiar do que aprendeu. O
teste que existia somava todas as unidades em um único conjunto de posições e parava em "há pelo
menos três posições diferentes no arquivo inteiro", o que uma única unidade viciada satisfazia
sozinha. O agregado escondia o defeito local.

**Consequência:** as cinco perguntas de cada unidade agora usam posições diferentes, verificadas
individualmente, e o checklist de `CONTENT_GUIDE.md` ganhou o item correspondente para quem escrever
as próximas unidades. Corrigir isso mexeu em oito arquivos de conteúdo pedagógico, e é por isso que
a regra fica escrita: padrão de gabarito é defeito de conteúdo, não detalhe de formatação.
