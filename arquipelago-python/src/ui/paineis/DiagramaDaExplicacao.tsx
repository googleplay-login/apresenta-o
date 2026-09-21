import type { ParteDoDiagrama } from '../../content/tiposDeConteudo'

/**
 * Desenha um diagrama da explicação.
 *
 * O livro tem figuras — a caixa da variável, os índices de uma lista. As figuras
 * são de terceiros e não entram aqui; o que entra é a **ideia**, redesenhada como
 * caixas de texto com rótulo, valor e nota.
 *
 * Duas decisões que não são de estilo:
 *
 *  - **é texto, e não imagem.** Uma figura de bitmap não é lida por leitor de
 *    tela, não acompanha o tamanho da fonte e não pode ser conferida por teste.
 *    Caixas de texto são lidas em voz alta, acompanham o zoom e são conferidas;
 *  - **os espaços das pontas podem ficar visíveis.** Num diagrama sobre espaços
 *    em branco, o espaço é invisível: os três resultados sairiam idênticos na
 *    tela. Com `espacosVisiveis`, o espaço das pontas vira `·` e o desenho ganha
 *    uma legenda dizendo o que aquele sinal é — o texto guardado continua sendo
 *    o de verdade, e quem troca o sinal é só a apresentação.
 */

type Props = {
  readonly titulo: string
  readonly descricao: string
  readonly partes: readonly ParteDoDiagrama[]
  readonly espacosVisiveis?: boolean
}

/** Sinal que representa um espaço quando eles precisam aparecer. */
export const SINAL_DE_ESPACO = '·'

/**
 * Troca os espaços das pontas pelo sinal visível, sem mexer no miolo do texto.
 *
 * "Pontas" aqui inclui o que está logo dentro de aspas, porque os valores dos
 * diagramas são escritos como em Python — `"  Ilha  "` —, e é justamente depois
 * da aspa de abertura e antes da de fechamento que ficam os espaços que a
 * unidade das palavras discute. Espaços no meio do texto não são tocados: eles
 * não são o assunto, e marcar tudo deixaria o diagrama poluído.
 */
export function marcarEspacosDasPontas(valor: string): string {
  const marca = (espacos: string) => SINAL_DE_ESPACO.repeat(espacos.length)

  return valor
    .replace(/(^|["'])( +)/g, (_achado, anterior: string, espacos: string) => anterior + marca(espacos))
    .replace(/( +)($|["'])/g, (_achado, espacos: string, seguinte: string) => marca(espacos) + seguinte)
}

export function DiagramaDaExplicacao({ titulo, descricao, partes, espacosVisiveis }: Props) {
  return (
    <figure className="diagrama" aria-label={`Diagrama: ${titulo}`}>
      <figcaption className="diagrama__titulo">{titulo}</figcaption>
      <p className="diagrama__descricao">{descricao}</p>

      <ol className="diagrama__partes">
        {partes.map((parte) => (
          <li className="diagrama__parte" key={parte.rotulo}>
            <span className="diagrama__rotulo">{parte.rotulo}</span>
            <span className="diagrama__valor">
              {espacosVisiveis ? marcarEspacosDasPontas(parte.valor) : parte.valor}
            </span>
            {parte.nota ? <span className="diagrama__nota">{parte.nota}</span> : null}
          </li>
        ))}
      </ol>

      {espacosVisiveis ? (
        <p className="diagrama__legenda">
          O sinal {SINAL_DE_ESPACO} marca um espaço em branco. Os textos do diagrama são os de
          verdade: o sinal existe só para você poder ver onde eles estão.
        </p>
      ) : null}
    </figure>
  )
}
