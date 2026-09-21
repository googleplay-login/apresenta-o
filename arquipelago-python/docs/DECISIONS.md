# DECISOES

Registro do que foi decidido, com o motivo e a consequencia. Uma decisao sem
motivo registrado vira folclore: a proxima pessoa nao sabe se pode mudar.

Formato: `D-nnn`, data, decisao, contexto, alternativas, consequencia.
Decisao reversivel foi tomada com padrao proposto, e nao com pergunta.

---

## D-001 - Dividir o capitulo 2 do livro em duas unidades
**21/09/2026** - aprovada pelo usuario (opcao B).

**Decisao:** as tres primeiras unidades passam a ser quatro: Cap. 1; Cap. 2 recorte
2a (variaveis, `print()`, numeros, comentarios); Cap. 2 recorte 2b (strings e seus
metodos); Cap. 3 (listas).

**Contexto:** o capitulo 2 cobre variaveis, strings inteiras, numeros e comentarios.
Mantido como uma ilha unica, viraria uma unica sessao longa demais e quebraria o
ritmo do ciclo.

**Alternativas:** (A) comprimir o capitulo em uma ilha enxuta; (B) dividir em duas;
(C) esperar o PDF e decidir pela densidade real em paginas.

**Consequencia:** quatro ilhas cobrem tres capitulos. O mapa em `BOOK_MAP.md` reflete
essa divisao. A densidade ainda pode ser reavaliada quando o PDF estiver disponivel.

---

## D-002 - Aplicacao nova em pasta propria
**21/09/2026** - aprovada pelo usuario.

**Decisao:** a aplicacao nasce em `arquipelago-python/`, dentro deste repositorio,
sem tocar em `Nova pasta/index.html.html`.

**Contexto:** o repositorio ja continha um site institucional estatico (Clinica
Estelo), sem nenhuma relacao com este projeto. Regra do usuario: preservar trabalho
existente.

**Consequencia:** os dois projetos convivem no mesmo repositorio sem dependencia
entre eles. O site existente nao sera sobrescrito, movido nem apagado.

---

## D-003 - PDF do livro e imagens de terceiros nunca entram no Git
**21/09/2026** - decisao tecnica, verificada.

**Decisao:** `livro-local/` e `referencias-locais/` ficam no `.gitignore`, e ambas
fora de `public/`.

**Contexto:** verificado com `gh repo view` que o repositorio e **publico**
(`isPrivate: false`). Publicar o PDF de um livro comercial seria violacao de direito
autoral. As imagens de referencia sao capturas de um produto de terceiros, com
direitos nao esclarecidos.

**Consequencia:** a memoria durável do projeto e a **derivacao escrita** dessas
referencias (`ART_DIRECTION.md`), nao os arquivos. Ficarem fora de `public/` garante
que nunca sejam copiadas para `dist/` nem publicadas por um deploy.

---

## D-004 - Uma unica fonte de verdade para as regras de progressao
**21/09/2026** - decisao de arquitetura.

**Decisao:** as regras pedagogicas vivem em `src/learning/` como funcoes puras. A
cena 3D e os paineis apenas consultam. Nao existe regra de aprovacao dentro do
mundo 3D nem na interface.

**Contexto:** o usuario proibiu explicitamente que o estudante desbloqueie uma
unidade abrindo um painel, mudando parametro na URL ou clicando numa ponte.

**Consequencia:** a ponte e **consequencia** de uma decisao, nunca a decisao. O mesmo
resultado aparece no 3D e na alternativa acessivel, porque ambos leem a mesma
funcao. Ver `ARCHITECTURE.md`.

---

## D-005 - Tokens de tema como fonte unica das cores
**21/09/2026** - decisao de implementacao.

**Decisao:** toda cor vive em `src/ui/theme/tokens.ts`. O CSS consome variaveis
geradas. Nenhuma cor literal em arquivo `.css`.

**Contexto:** paleta duplicada entre TS e CSS desvia silenciosamente, e desvio de
cor quebra contraste sem ninguem perceber.

**Consequencia:** mudar a paleta e mudar um arquivo. O teste percorre
`PARES_DE_CONTRASTE` e falha se algum par deixar de atender a WCAG AA. Os valores
passaram no primeiro teste executado (ver `TEST_REPORT.md`).

**Unica excecao, declarada:** `index.html` tem uma cor de fundo literal
(`#dce4ec`) aplicada antes de o React montar. E deliberada - evita o flash branco
no carregamento, e nesse momento ainda nao existe JavaScript para gerar a variavel.
Esta comentada no proprio arquivo. E a unica cor do projeto fora de `tokens.ts`, e
deve continuar sendo: se aparecer uma segunda, e sinal de que a fonte unica vazou.

---

## D-006 - Separar "quanto ja construimos" de "o que o estudante pode acessar"
**21/09/2026** - decisao de modelagem.

**Decisao:** `SituacaoDeConstrucao` (`planejada` | `em-construcao` | `pronta`)
descreve o progresso do **desenvolvimento**. O estado de progressao do estudante e
outro conceito, que pertence a `src/learning/` e ainda nao existe.

**Contexto:** misturar os dois produz a confusao classica: uma unidade "planejada"
aparece como se estivesse bloqueada por desempenho do estudante.

**Consequencia:** o tipo do dominio do estudante sera criado na Etapa 2, sem
reaproveitar `SituacaoDeConstrucao`.

---

## D-007 - Idioma no codigo
**21/09/2026** - padrao adotado (reversivel).

**Decisao:** identificadores de **dominio** em portugues (`UnidadePlanejada`,
`ReferenciaLivro`, `descreverReferencia`, `referenciaEstaCoerente`). Termos de
**ecossistema e infraestrutura** permanecem em ingles (`useState`, `createRoot`,
`tokens`, `contrastRatio`).

**Contexto:** traduzir `useState` para `usarEstado` atrapalha quem conhece o
ecossistema; manter `unitPlanned` obriga a traduzir mentalmente o dominio, que e
onde esta a regra de negocio.

**Consequencia:** convencao mista e deliberada, documentada aqui para nao parecer
descuido.

---

## D-008 - Versoes exatas e sem dependencia por conveniencia
**21/09/2026** - decisao de implementacao.

**Decisao:** dependencias instaladas com `--save-exact`. `package-lock.json`
versionado. **Nenhuma** dependencia adicional sem necessidade demonstrada.

**Contexto:** regra do usuario: registrar versoes resolvidas, manter lockfile, nao
adicionar dependencia por conveniencia.

**Consequencia:** nesta etapa foram instalados exatamente 9 pacotes (2 de producao,
7 de desenvolvimento). `jsdom` **nao** foi instalado: os testes atuais sao de funcao
pura e nao precisam de DOM. Sera adicionado quando existir teste de componente.
Versoes em `ARCHITECTURE.md`.

---

## D-009 - Nenhum botao sem efeito
**21/09/2026** - decisao de experiencia, derivada de regra do usuario.

**Decisao:** recurso nao implementado nao aparece como botao. A pagina inicial da
Etapa 1.1 **nao tem nenhum botao**, e explica por que.

**Contexto:** um botao "Entrar na ilha" que nao faz nada e uma promessa vazia e
destroi a confianca justamente no primeiro contato.

**Consequencia:** a pagina mostra o estado real do projeto, com o comando que
comprova cada item, e lista explicitamente o que ainda nao existe.

---

## D-010 - Pagina de livro nula ate verificacao
**21/09/2026** - decisao de conteudo.

**Decisao:** `paginaImpressa` e `paginaPdf` ficam `null` e `status` fica
`'referencia-pendente'` enquanto o livro nao puder ser conferido. A interface exibe
"pagina: referencia pendente".

**Contexto:** o texto do livro chegou como conversao epub, sem numeracao de paginas.
Pagina impressa e pagina de PDF sao coisas diferentes e o deslocamento entre elas
**nao e constante** - nao pode ser presumido.

**Consequencia:** `referenciaEstaCoerente()` recusa referencia `'confirmada'` com
apenas uma das duas paginas, e um teste impede que alguem preencha um numero nao
verificado. Numero de pagina errado e pior do que numero nenhum: manda o estudante
ler a pagina errada.

---

## D-011 - Servidor escuta em 0.0.0.0 e aceita o host do preview
**21/09/2026** - decisao de ambiente.

**Decisao:** `server.host: true` e `allowedHosts: ['.e2b.app']`.

**Contexto:** o preview e remoto e servido por um dominio proxied. Sem `allowedHosts`
o Vite responde "Blocked request. This host is not allowed", e o servidor preso em
`127.0.0.1` seria inalcancavel pelo navegador do usuario.

**Consequencia:** a lista de hosts e restrita ao dominio do ambiente de
desenvolvimento - nao foi usado `allowedHosts: true`, que aceitaria qualquer host.

---

## D-012 - Maquina de foco de teclado desde o inicio
**21/09/2026** - decisao derivada das referencias visuais. **Ainda nao implementada.**

**Decisao:** quando existir cena 3D, o foco de teclado tera regra explicita: com um
painel de leitura aberto, `W A S D` **nao** move a camera; `Esc` fecha o painel e
devolve o foco ao mundo.

**Contexto:** nas imagens de referencia, `W A S D` voa e `Esc` sai do modo
apresentacao. Sem separacao de foco, o estudante digita uma resposta e a camera
dispara.

**Consequencia:** entra no escopo do prototipo 3D desde a primeira ilha, e nao como
polimento final. Ver `ART_DIRECTION.md`.

---

## D-013 - Navegacao entre unidades restrita ao que esta liberado
**21/09/2026** - decisao derivada das referencias visuais.

**Decisao:** o seletor de unidades (equivalente ao "Explorar estacoes" das
referencias) so oferece destinos desbloqueados.

**Contexto:** nas referencias ele e navegacao livre. Aqui, navegacao livre entre
unidades e exatamente o vetor de burla proibido pelo usuario.

**Consequencia:** divergencia deliberada em relacao a referencia. O seletor consulta
a mesma funcao pura que a ponte e os paineis.

---

## D-014 - Referencia visual nao e asset
**21/09/2026** - decisao de direitos e de metodo.

**Decisao:** as imagens de referencia orientam direcao visual e de interacao.
**Nenhum** asset, texto, diagrama, nome ou marca de terceiro e reaproveitado.
Geometria e materiais serao proprios.

**Contexto:** as imagens sao capturas de outra aplicacao. Regra do usuario: asset
externo exige licenca conhecida e documentada.

**Consequencia:** nao ha licenca de terceiro a rastrear, porque nada de terceiro e
usado. O botao "Prompt" da referencia e funcao de LLM e **nao** sera replicado.
