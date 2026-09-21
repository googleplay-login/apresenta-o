# `src/world` — o mundo 3D

A cena: ilhas suspensas, pontes, céu, névoa, câmera, e a geometria pura que a alimenta, com
Three.js via React Three Fiber. Sem Drei (D-021): o que faltava foi resolvido com geometria
própria.

## Regra que define este diretório

**Nenhuma regra de aprovação, desbloqueio ou progressão mora aqui.**

O mundo é uma *view*. Ele **lê** o resultado de `src/learning/` e desenha. Se a cena
precisar saber se uma ilha está liberada, ela chama a mesma função pura que os
painéis usam. Uma ponte acesa é consequência de uma regra, nunca a regra em si.

Isso existe para impedir três coisas concretas:

- o estudante clicar na ponte e pular o portão;
- a cena e os painéis discordarem sobre o que está disponível;
- a regra ficar impossível de testar por estar presa dentro do renderizador.

## Estado

**Implementado na Etapa 3.** Sem avatar (Etapa 5) e sem som.

| Arquivo | O que faz |
|---|---|
| `geometria/` | Rocha, topo, sólidos (mesa, placa, biblioteca, árvore, pedra), pintura por altura, gerador determinístico |
| `mapaDoMundo.ts` | Onde cada ilha fica, onde cada ponte vai, enquadramento e espalhamento |
| `mundoVisivel.ts` | O **único** elo entre progresso e cena: traduz a decisão do domínio em algo desenhável |
| `camera/movimento.ts`, `teclas.ts` | Câmera com limites e interpolação; teclas por `code`, sem tecla presa |
| `Cena.tsx`, `Ilha.tsx`, `Ponte.tsx`, `Ceu.tsx`, `CameraLivre.tsx` | A cena em si |
| Clique na ponte | `Ponte.tsx` chama `aoApontar` (cursor) e `aoEscolher` (travessia); **quem decide** é `decidirTravessia()`, em `mundoVisivel.ts` — clicar nunca libera ilha |
| `suporteWebgl.ts` | Pergunta ao navegador se há WebGL **antes** de montar a cena |

Geometria própria, materiais simples, **nenhum asset externo** — e nenhuma regra de aprovação:
`mundoVisivel.ts` recebe situação e acessibilidade já resolvidas pela camada de regras.
