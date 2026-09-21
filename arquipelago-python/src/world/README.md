# `src/world` — o mundo 3D

Onde vai viver a cena: ilhas suspensas, pontes, céu, água, névoa, câmera e avatar,
com Three.js via React Three Fiber e Drei.

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

**Não implementado.** Etapa 3 (primeira ilha) e Etapa 4 (três ilhas e pontes).
Previsto: geometria própria e materiais simples, sem asset externo.
