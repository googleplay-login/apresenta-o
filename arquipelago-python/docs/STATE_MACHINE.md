# MÁQUINA DE ESTADOS DO CICLO DE ESTUDO

> **Estado: as regras e a tela estão implementadas e testadas.**
> `src/learning/` (as regras), `src/state/sessao.ts` (onde elas encontram a interface),
> `src/ui/paineis/` (a tela do ciclo) e `src/persistence/` (o que fica guardado) existem desde a
> Etapa 3.
>
> Este documento registra as regras **antes** de existir tela, para que elas não fossem inventadas
> no meio da interface — que é exatamente como esse tipo de regra acaba duplicada. A regra foi
> escrita primeiro; a tela veio depois e consulta exatamente estas funções.

## O ciclo

```
        ┌─────────────────────────────────────────────────────────┐
        │                                                         │
        ▼                                                         │
   [BLOQUEADA] ──pré-requisito atendido──▶ [DISPONIVEL]           │
        ▲                                     │                   │
        │                                     │ entrar            │
        │                                     ▼                   │
        │                              [MISSÃO EXIBIDA]           │
        │                                     │                   │
        │                                     ▼                   │
        │                              [ESTUDO NO LIVRO]          │
        │                                     │                   │
        │                                     ▼                   │
        │                           [EXPLICAÇÃO ORIGINAL]         │
        │                                     │                   │
        │                                     ▼                   │
        │                                [PRÁTICA]                 │
        │                                     │                   │
        │                                     ▼                   │
        │                             [AVALIAÇÃO ABERTA]           │
        │                                     │                   │
        │                        ┌────────────┴────────────┐      │
        │                        │                         │      │
        │                   nota < 80                  nota ≥ 80 │
        │                        │                         │      │
        │                        ▼                         ▼      │
        │                   [REPROVADA]              [APROVADA]───┘
        │                        │                         │
        └─── refazer ────────────┘                         └──▶ ponte aberta
```

## Onde cada estado vive, hoje

| Estado | Onde está implementado |
|---|---|
| `bloqueada` / `disponivel` / `aprovada` | `estadoDaUnidade()`, em `src/learning/percurso.ts` |
| `aprovada` | `registrarResultado()` — só marca quando `foiAprovado()` é verdadeiro |
| Tentativas | `ProgressoDaUnidade.tentativas` |
| Melhor nota | `ProgressoDaUnidade.melhorNota`, que só melhora |
| `missaoExibida`, `emEstudo`, `emPratica`, `avaliacaoAberta` | `src/state/sessao.ts`, no campo `sessao.passo`: `'missao' \| 'estudo' \| 'pratica' \| 'avaliacao' \| 'resultado'` |
| Foco do teclado (`mundo` x `painel`) | `sessao.foco`, com `podeMoverCamera()`; ver D-012 |
| Aprovação anterior à tentativa atual | `sessao.aprovadaAntes`, fotografada **ao abrir** a ilha |

Os estados de tela ficam em `src/state/`, e não em `src/learning/`: eles descrevem **onde o
estudante está na interface**, e não mudam nenhuma regra de aprovação. Nenhum deles desbloqueia
nada. `sessao.aprovadaAntes` é o único campo que copia um dado do domínio — e é uma cópia
deliberada, porque a pergunta "isto já estava aprovado antes desta tentativa?" precisa de uma
resposta que não mude quando a aprovação acontece (D-023).

## Regras fixadas e implementadas

1. **Aprovação com nota real ≥ 80%**, medida **antes** de qualquer arredondamento de exibição. A
   conta é inteira: `acertos * 5 >= total * 4`. Ponto flutuante erraria — `4 / 5 >= 0.8` é falso
   em binário.
2. **O que aparece na tela não pode enganar.** O percentual exibido é sempre arredondado para
   baixo: quem faz 79% lê 79%.
3. **Reprovar não é punição.** Não bloqueia a unidade atual nem revoga aprovação anterior.
4. **A ponte é consequência, nunca causa.** Só aparece acesa depois da aprovação; clicar nela não
   libera nada.
5. **Nada de atalho.** Nenhuma função recebe rota, hash, clique ou parâmetro de URL. Registrar
   resultado em unidade **bloqueada** é recusado (D-017).
6. **Uma única fonte de verdade.** O mundo 3D e os painéis chamam as mesmas funções.
7. **Exigir resposta em todas as perguntas antes de enviar.** `avaliarRespostas` lança se faltar
   resposta.
8. **Corrigir somente após o envio.** A correção recebe o conjunto completo de respostas; não há
   função para corrigir pergunta por pergunta.
9. **5 perguntas por unidade, 4 acertos aprovam** — no protótipo. O mínimo permanece 80% de
   acertos reais se o número de perguntas mudar.
10. **Desbloquear apenas a próxima unidade.** Aprovar a 3 não abre a 5 se a 4 estiver pendente.
11. **Sem antifraude, e dizendo isso.** A correção roda no cliente; o enunciado informa que quem
    quiser ver as respostas consegue, e que o objetivo é aprender.

## Anti-padrões proibidos

| Anti-padrão | Por que é proibido |
|---|---|
| Regra de aprovação dentro do componente 3D | Duplicaria a fonte de verdade; a cena passaria a decidir |
| Ponte clicável que chama "desbloquear" | A ponte viraria a causa do desbloqueio |
| Estado de progresso guardado só no componente React | Some ao recarregar; não há fonte de verdade |
| Gravar objeto Three.js ou função no `localStorage` | Não é serializável; quebra a migração de formato |
| `localStorage.clear()` | Apaga dados de outras aplicações da mesma origem |
| Arredondar 79,5% para 80% e aprovar | Aprovação mostra nota que não existiu |
| Bloquear a unidade atual após reprovar | Pune o erro, que é parte de aprender |
| Anunciar "teste inviolável" | Mentira sobre a própria robustez |
| Criar progresso para unidade fora do percurso | Abriria caminho para unidade inventada |
| Ler o progresso ao vivo para dizer "você já havia aprovado" | Faria a tela mentir logo depois da primeira aprovação |
| Botão de controle de câmera em máquina sem WebGL | Seria controle sem efeito (D-009) |

## O que ainda precisa de decisão

- Se a avaliação tem limite de tempo (padrão proposto: **não tem**).
- Se o estudante pode voltar a uma unidade aprovada e refazer (padrão proposto: **sim**, sem
  perder a aprovação — e as regras atuais já se comportam assim).
- Formato de exibição da nota. Padrão proposto e **já implementado**: `"4 de 5 acertos (80%)"` —
  a fração é o número exato, e o percentual é derivado dela.
- Número de tentativas visíveis no histórico (padrão proposto: **mostrar**, sem limite).
