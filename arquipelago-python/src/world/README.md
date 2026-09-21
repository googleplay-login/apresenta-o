# `src/world` - o mundo 3D

Onde vive a cena: ilhas suspensas, pontes, ceu, agua, nevoa, camera e avatar, com
Three.js via React Three Fiber e Drei.

## Regra que define este diretorio

**Nenhuma regra de aprovacao, desbloqueio ou progressao mora aqui.**

O mundo e uma *view*. Ele **le** o resultado de `src/learning/` e desenha. Se a cena
precisar saber se uma ilha esta liberada, ela chama a mesma funcao pura que os paineis
de interface usam. Uma ponte acesa e consequencia de uma regra, nunca a regra em si.

Isto existe para impedir tres coisas concretas:
- o estudante clicar na ponte e pular o portao;
- a cena e os paineis discordarem sobre o que esta disponivel;
- a regra ficar impossivel de testar por estar presa dentro do renderizador.

## Estado

Nao implementado. Etapa 3 (primeira ilha) e Etapa 4 (tres ilhas e pontes).
Previsto: geometria propria e materiais simples, sem asset externo.
