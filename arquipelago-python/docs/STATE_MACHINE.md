# MAQUINA DE ESTADOS DO CICLO DE ESTUDO

> **Status: desenhada, NAO implementada.** Nada aqui existe em codigo ainda.
> A implementacao comeca na Etapa 2 (`src/learning/`) e ganha tela na Etapa 6.
> Registrado agora para que as regras de aprovacao nao sejam inventadas depois,
> no meio da interface - que e exatamente como esse tipo de regra acaba duplicada.

## O ciclo

```
        +---------------------------------------------------------+
        |                                                         |
        v                                                         |
   [BLOQUEADA] --pre-requisito atendido--> [DISPONIVEL]           |
        ^                                     |                   |
        |                                     | entrar            |
        |                                     v                   |
        |                              [MISSAO EXIBIDA]           |
        |                                     |                   |
        |                                     v                   |
        |                              [ESTUDO NO LIVRO]          |
        |                                     |                   |
        |                                     v                   |
        |                           [EXPLICACAO ORIGINAL]         |
        |                                     |                   |
        |                                     v                   |
        |                                [PRATICA]                 |
        |                                     |                   |
        |                                     v                   |
        |                             [AVALIACAO ABERTA]           |
        |                                     |                   |
        |                        +------------+------------+      |
        |                        |                         |      |
        |                   nota < 80                  nota >= 80 |
        |                        |                         |      |
        |                        v                         v      |
        |                   [REPROVADA]              [APROVADA]---+
        |                        |                         |
        +--- refazer ------------+                         +--> ponte aberta
```

## Estados

Nomes previstos para o dominio (`src/learning/`), em portugues, conforme D-007.

| Estado | Significado |
|---|---|
| `bloqueada` | O pre-requisito da unidade anterior ainda nao foi atendido |
| `disponivel` | Pode entrar; o ciclo ainda nao comecou ou foi reiniciado |
| `missaoExibida` | O estudante abriu a missao |
| `emEstudo` | Leitura recomendada em andamento |
| `emPratica` | Exercicios de escrita em andamento |
| `avaliacaoAberta` | As perguntas estao na tela |
| `aprovada` | Nota real maior ou igual a 80 |
| `reprovada` | Nota real menor que 80; a unidade continua acessivel |

## Regras fixadas

Estas regras foram definidas pelo usuario **antes** de qualquer implementacao.
Sao restricoes, nao sugestoes.

1. **Aprovacao com nota real >= 80**, medida **antes** de qualquer arredondamento de
   exibicao. Uma nota 79,6 pode aparecer como "80%" na tela e **nao** aprova.
   Se a exibicao arredonda, ela nao pode enganar quem le: mostrar "79%" ou mostrar
   o valor sem arredondar para cima.
2. **Reprovar nao bloqueia a unidade atual** nem revoga aprovacao anterior. O
   estudante refaz a avaliacao. Reprovar nao e punicao.
3. **A ponte e consequencia, nunca causa.** Ela so aparece acesa depois da
   aprovacao. Clicar na ponte nao libera nada.
4. **Nada de atalho por interface ou URL.** Abrir painel, mudar parametro na URL ou
   clicar numa ponte **nao** desbloqueia unidade. Toda entrada passa pela mesma
   funcao pura.
5. **Uma unica fonte de verdade.** O mundo 3D e os paineis chamam
   `src/learning/`. Nenhum dos dois decide sozinho.
6. **Exigir resposta em todas as perguntas antes de enviar.** Sem isso, enviar em
   branco vira estrategia.
7. **Corrigir somente apos o envio.** Nada de correcao imediata por pergunta: isso
   transforma a avaliacao em tentativa e erro e mede persistencia, nao aprendizado.
8. **5 perguntas por unidade, aprovacao com 4 acertos.** No prototipo. O numero de
   perguntas pode crescer depois, mantendo o minimo em 80% de acertos reais.
9. **Desbloquear apenas a proxima unidade.** Aprovar a unidade 3 nao libera a 5 se
   a 4 estiver pendente.
10. **Sem antifraude, e dizendo isso.** A correcao roda no cliente. O enunciado
    informa que quem quiser ver as respostas consegue, e que o objetivo e aprender.

## Anti-padroes proibidos

| Anti-padrao | Por que e proibido |
|---|---|
| Regra de aprovacao dentro do componente 3D | Duplicaria a fonte de verdade; a cena passaria a decidir |
| Ponte clicavel que chama "desbloquear" | A ponte vira a causa do desbloqueio |
| Estado de progresso guardado so no componente React | Some ao recarregar; nao ha fonte de verdade |
| Gravar objeto Three.js ou funcao no `localStorage` | Nao e serializavel; quebra a migracao de formato |
| `localStorage.clear()` | Apaga dados de outras aplicacoes da mesma origem |
| Arredondar 79,5 para 80 e aprovar | Aprovacao mostra nota que nao existiu |
| Bloquear a unidade atual apos reprovar | Puna o erro, que e parte de aprender |
| Anunciar "teste inviolavel" | Mentira sobre a propria robustez |

## O que ainda precisa de decisao

- Se a avaliacao tem limite de tempo (padrao proposto: **nao tem**).
- Se o estudante pode voltar a uma unidade aprovada e refazer (padrao proposto:
  **sim**, sem perder a aprovacao).
- Formato de exibicao da nota: percentual inteiro com aviso, ou fracao de acertos.
  Padrao proposto: **"4 de 5 acertos (80%)"** - a fracao e o numero exato, e o
  percentual e derivado dela.
- Numero de tentativas visiveis no historico (padrao proposto: **mostrar**, sem
  limite).
