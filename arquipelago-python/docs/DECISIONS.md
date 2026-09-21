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

---

## D-028 — O modo padrão é andar: a câmera deixou de ser o viajante
**21/09/2026** — decisão de produto, na Etapa 5.

**Decisão:** o mundo abre no modo `andar`, com um avatar no centro da primeira ilha e a câmera
atrás dele. `voar` e `mapa` continuam existindo como modos escolhidos.

**Contexto:** nas etapas 3 e 4 quem se deslocava era a câmera. Isso funciona para conhecer o
conjunto, mas não é o que o projeto promete: o estudante deveria **entrar** na ilha. Com a câmera
como viajante, "entrar" era sempre um voo, e a ilha um cenário visto de longe.

**Consequência:** existe uma pessoa no mundo, e ela anda pelo capim e pelas pontes. Os outros dois
modos continuam disponíveis no mesmo lugar: voar livre serve para conhecer o arquipélago e voltar
rápido; a vista de mapa serve de orientação. Nenhum dos três libera unidade — a regra de aprovação
não olha para a câmera (D-004).

---

## D-029 — O chão caminhável é geometria declarada, não motor de física
**21/09/2026** — decisão de arquitetura, na Etapa 5.

**Decisão:** onde dá para pisar é uma lista de superfícies com altura consultável
(`world/mapaCaminhavel.ts`): um disco por ilha, uma faixa por ponte inteira. Fora delas, a altura do
chão é `null`, e o passo é recusado.

**Contexto:** um motor de física resolveria colisão, gravidade e queda — e traria três problemas
para este projeto: peso no pacote, mais uma dependência que não foi pedida, e um comportamento que
**não dá para conferir neste ambiente**, porque depende de navegador. Além disso, o mundo é pequeno
e conhecido: quatro ilhas, três pontes, superfícies convexas.

**Consequência:** "não cair" é uma propriedade testável em funções puras, e há teste que caminha por
todos os trechos de uma rota conferindo que existe chão embaixo de cada ponto. O preço: o avatar
desliza pela beirada em vez de escorregar por uma rampa, e não existe pulo, gravidade nem queda. Se
o projeto quiser isso depois, a substituição é local — o resto da aplicação pergunta a `chaoEm()` e
não sabe como a conta é feita.

---

## D-030 — A rota a pé só existe por ponte inteira, e a recusa é dita em voz alta
**21/09/2026** — decisão de regra, na Etapa 5.

**Decisão:** `rotaAte()` devolve `null` quando o caminho depende de uma ponte pela metade, e a cena
devolve o motivo ao estudante, com o nome da ilha. Nenhum caminho por cima do vão é inventado.

**Contexto:** era tentador deixar o avatar "atravessar" um vão onde a ponte está pela metade — o
mundo é visual, e o buraco é largo. Seria mentira sobre a regra do projeto: a ponte pela metade é o
que diz que falta aprovação. Um avatar que atravessa mesmo assim ensina que o bloqueio é decorativo.

**Consequência:** pedir para ir a pé a uma ilha distante, sem as aprovações no meio do caminho,
devolve uma explicação em vez de movimento — e o teste confere as duas coisas: que o aviso acontece
(e nomeia a ilha) e que o avatar **não** saiu do lugar.

---

## D-031 — Uma fórmula só para a altura do capim, e a ponte encostada nele
**21/09/2026** — defeito encontrado ao ligar o caminhar à geometria, na Etapa 5.

**Decisão:** `alturaDoTopo(raio, distância)` vive em `geometria/ilha.ts` e é usada tanto para gerar a
malha do capim quanto para responder onde o pé pisa. A espessura do tabuleiro
(`ESPESSURA_DO_TABULEIRO`) saiu de dentro de `gerarPonte` para que a altura do topo da ponte seja
calculada, e não chutada.

**Contexto:** o capim é um domo — sobe 0,36 da unidade no centro para a borda —, e a ponte estava
desenhada na altura do **centro** da ilha. No papel, ninguém notava; no mundo, a ponte encostava
0,36 abaixo do capim da borda, e o avatar daria um degrau invisível ao atravessar. O defeito estava
lá desde a Etapa 3: só apareceu quando algo precisou **saber** a altura.

**Consequência:** a ponte agora encosta no capim da borda, e há teste que confere isso no topo do
tabuleiro (não no eixo dele). Mudar a espessura ou a inclinação do capim em um lugar só continua
funcionando: as duas pontas leem a mesma função.

---

## D-032 — O avatar é feito de primitivas, e o caminhar é verificado por quadros
**21/09/2026** — decisão de arte e de teste, na Etapa 5.

**Decisão:** o avatar é montado com primitivas do Three.js (cilindro, esfera, caixa), pintado com
cores derivadas dos tokens. E o caminhar é verificado com `advanceFrames` do `@react-three/test-
renderer`: a mesma árvore que roda no navegador, com quadros passando de verdade.

**Contexto:** um modelo externo (GLTF) traria licença, peso e um arquivo a mais para auditar — o
oposto do que o projeto pede. E o caminhar é exatamente o tipo de coisa que "inspeção de código"
não prova: depende de tempo, ordem de quadro e chão. Com `advanceFrames`, o teste monta a cena real,
segura `W` por trinta quadros e mede o deslocamento; pede uma caminhada até outra ilha e confere que
o avatar chegou.

**Consequência:** o que continua sem verificação é **pixel**: a figura agrada? As proporções são
boas ao lado das estruturas? O passo parece passo? Isso é do roteiro manual, e não está marcado como
aprovado em lugar nenhum. O avatar também não tem animação de caminhada — as pernas ficam paradas —,
e isso está dito no código e no relatório.

---

## D-033 — A leitura faz parte do ciclo, e o marcador não é permissão
**21/09/2026** — decisão de produto e de domínio, na Etapa 6.

**Decisão:** a leitura recomendada do livro é um passo visível do ciclo, com a parte indicada, o
porquê daquela parte, o que procurar nela e o caminho para quem não tem o livro em mãos. E existe um
marcador — "leitura feita" — que a pessoa liga e desliga. O marcador é **registro**: ele não entra em
nenhuma regra de aprovação, não abre ponte e não muda nota.

**Contexto:** dizer "leia o capítulo 2" e deixar a pessoa seguir sem que isso apareça em lugar nenhum
transforma a leitura em enfeite; por outro lado, fazer da leitura um **requisito** de aprovação
criaria uma regra que o programa não tem como verificar — ele não sabe se alguém leu. Requisito não
verificável ou é mentira ou vira obstáculo: quem já sabe o assunto ficaria travado num botão.

**Consequência:** `marcarLeituraFeita()` recusa unidade bloqueada e não toca em `aprovada`,
`tentativas`, `melhorNota` nem em `sessao.passo`. A tela diz, com todas as letras, que marcar a
leitura **não aprova a ilha, não abre a ponte e não muda nota nenhuma**. O teste percorre "zero a
três aprovações" e confere que a nota não se mexe em nenhum caso. E o texto da leitura nunca promete
página: fala em capítulo e seção, porque toda página continua `null` (D-010).

## D-034 — O diagrama é desenhado em texto, e o espaço vira sinal
**21/09/2026** — decisão de conteúdo e de arte, na Etapa 6.

**Decisão:** os diagramas da explicação são **dados**, não imagens: um título, uma descrição e uma
lista de partes rotuladas. Quando o assunto é o que o espaço em branco faz numa string, o diagrama
liga `espacosVisiveis` e as pontas dos valores passam a aparecer com um sinal visível (`·`),
explicado em legenda.

**Contexto:** uma imagem por diagrama significaria arquivo a mais, peso a mais, licença a mais e
texto que ninguém lê em voz alta — além de não acompanhar a tipografia da página. E o espaço em
branco é justamente o que "se vê" pior numa tela: `" Ilha "` e `"Ilha"` parecem iguais, e é essa
diferença que a unidade das strings discute.

**Consequência:** `marcarEspacosDasPontas()` marca só o começo e o fim do valor — depois da aspa de
abertura e antes da de fechar —, e **não** toca nos espaços do meio: marcar tudo deixaria o diagrama
ilegível e sugeriria um problema que não existe. O sinal é `·`, e não um espaço sublinhado ou um
realce colorido, porque precisa sobreviver a copiar-e-colar e a leitor de tela. O diagrama é um
`<figure>` com `figcaption` e `<ol>`: quem não vê a caixa lê a lista na ordem. Sem `espacosVisiveis`
ligado, nenhum sinal aparece — nada de sinal decorativo onde não há espaço a mostrar (D-009).

## D-035 — O progresso guardado chegou à versão 2, com migração de verdade
**21/09/2026** — decisão de persistência, na Etapa 6.

**Decisão:** o campo `leituraFeita` obrigou a subir o formato guardado para a **versão 2**. A versão
1 é **migrada**, não descartada: aprovação, tentativas e melhor nota atravessam intactas, e o
marcador de leitura começa desmarcado.

**Contexto:** a alternativa — apagar o que estava guardado quando o formato muda — custaria a alguém
que já tinha aprovado ilhas o progresso inteiro por causa de um campo novo. E a outra alternativa,
marcar `leituraFeita: true` na migração, seria pior: inventaria um registro de leitura que ninguém
fez.

**Consequência:** `VERSOES_ACEITAS = [1, 2]`, `migrarProgresso()` devolve sempre um `Progresso` da
versão atual, e o aviso de migração diz o que foi aproveitado e o que recomeçou. Versão **mais nova**
que a atual tem mensagem própria ("por cima"): o arquivo não é apagado, e a pessoa é avisada em vez
de perder dados em silêncio. Versão não numérica ou atual corrompida continua sendo "formato
inesperado". `ehProgressoValido` é guardião de `ProgressoGuardado` — com `leituraFeita` opcional —, e
**não** de `Progresso`: só a migração produz a versão completa (o `tsc` já foi enganado por essa
tentação uma vez, e está registrado em `TEST_REPORT.md`).
