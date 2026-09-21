# `src/learning` — as regras do ensino

O cérebro pedagógico do projeto: o que conta como aprovado, qual unidade está
aberta, o que acontece quando o estudante reprova.

## Regra que define este diretório

Funções **puras**: sem React, sem Three.js, sem armazenamento, sem rede, sem rota.
Entrada e saída de dados simples. Tudo aqui é testável sem montar tela nenhuma.

Este é o **único lugar** que decide. A cena 3D e os painéis consultam; nenhum dos
dois decide por conta própria. É o que garante que o mesmo resultado apareça no mundo
3D e na alternativa acessível sem 3D.

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `avaliacao.ts` | Nota, aprovação com 80% reais, exibição que não engana, correção das respostas |
| `percurso.ts` | Estado de cada unidade, desbloqueio, registro de tentativas, melhor nota |
| `resumoDoProjeto.ts` | Frases da interface montadas a partir das constantes, para a tela não mentir |

## Regras já implementadas e testadas

- aprovação exige **80% reais**, comparados em inteiros (`acertos * 5 >= total * 4`) —
  sem ponto flutuante, que erraria em casos como 4 de 5;
- o percentual exibido é **sempre arredondado para baixo**: quem acerta 79% lê 79%;
- reprovar **não** bloqueia a unidade nem apaga aprovação anterior;
- a melhor nota só melhora;
- abrir a unidade 3 exige a 2 aprovada — e **registrar resultado em unidade bloqueada
  é recusado**;
- nenhuma função aceita rota, hash, clique ou parâmetro de URL: a única entrada capaz
  de mudar o estado é um resultado de avaliação válido;
- o progresso é serializável (testado com ida e volta por JSON) e versionado.

## O que ainda não existe

Interface, persistência e as perguntas de verdade. Etapas 6, 7 e 8.
