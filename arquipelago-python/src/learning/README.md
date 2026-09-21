# `src/learning` - as regras do ensino

O cerebro pedagogico do projeto: o que conta como aprovado, qual unidade esta
disponivel, o que acontece quando o estudante reprova.

## Regra que define este diretorio

Funcoes **puras**, sem React, sem Three.js, sem acesso a armazenamento, sem rede.
Entrada e saida de dados simples. Tudo aqui deve ser testavel com Vitest sem montar
tela nenhuma.

Este e o **unico lugar** que decide. A cena 3D e os paineis consultam este modulo;
nenhum dos dois decide por conta propria. E o que garante que o mesmo resultado
aparece no mundo 3D e na alternativa acessivel sem 3D.

Decisoes ja fixadas para quando for implementado:
- aprovacao exige nota real >= 80 **antes** de qualquer arredondamento de exibicao;
- reprovar nao bloqueia a unidade atual nem revoga aprovacao anterior;
- o avaliador roda no cliente e **nao e antifraude** - isso sera dito ao estudante,
  sem prometer teste secreto inviolavel.

## Estado

Nao implementado. Etapa 2.
