import { Suspense, lazy, useCallback, useMemo, useReducer, useState } from 'react'
import { LimiteDeErro } from '../../ui/components/LimiteDeErro'
import { corDaTrilha, paraCss } from '../../ui/theme/paleta3d'
import { PainelDaUnidade } from '../../ui/paineis/PainelDaUnidade'
import { PLANO_DE_UNIDADES, trilhaDe, type IdDeTrilha } from '../../content/planoDeUnidades'
import { conteudoDaUnidade } from '../../content/unidades'
import { PERCURSO_DO_CONTEUDO } from '../../content/percursoDoConteudo'
import { gabaritoDaUnidade } from '../../content/validadorDeConteudo'
import {
  exerciciosConferidos,
  leituraFoiFeita,
  progressoDaUnidade,
  progressoInicial,
  proximaUnidade,
} from '../../learning/percurso'
import { criarRedutor, estadoInicial, podeMoverCamera, type Passo } from '../../state/sessao'
import { useProgressoPersistido } from '../../persistence/useProgressoPersistido'
import { useSuporteWebgl } from '../../world/suporteWebgl'
import {
  decidirTravessia,
  ilhaAtual,
  ilhasVisiveis,
  pontesVisiveis,
  resumoDoMundo,
  type IlhaVisivel,
  type PonteVisivel,
} from '../../world/mundoVisivel'
import { chaoDoMundo, descricaoDoLugar, type Localizacao } from '../../world/mapaCaminhavel'

/**
 * A tela do mundo: o arquipélago, o painel de estudo e a lista de ilhas.
 *
 * Onde as regras ficam: **em lugar nenhum desta tela**. Ela despacha ações para
 * o redutor de `src/state/sessao.ts`, que é o único que chama o domínio de
 * progressão. A tela não decide se uma unidade está liberada, não calcula nota e
 * não grava na mão: lê o que o domínio devolveu e mostra.
 *
 * Por que a tela funciona sem 3D: a lista de ilhas e o painel de estudo cobrem
 * exatamente os mesmos passos. O mundo 3D é a forma principal, não a única — e
 * numa máquina sem placa de vídeo a trilha continua inteira.
 */

const UNIDADES = PLANO_DE_UNIDADES

/**
 * As ilhas agrupadas por trilha, na ordem do percurso.
 *
 * O agrupamento é por **trilhas vizinhas**: se o percurso voltar a uma trilha
 * depois de sair dela, ela aparece duas vezes — o que é verdade na tela, porque o
 * caminho passa por ali duas vezes. Preservar a ordem evita o defeito de reordenar
 * as ilhas para caber em um agrupamento bonito.
 */
function gruposDeTrilha(
  ilhas: readonly IlhaVisivel[],
): readonly { readonly trilha: IdDeTrilha; readonly ilhas: readonly IlhaVisivel[] }[] {
  const grupos: { trilha: IdDeTrilha; ilhas: IlhaVisivel[] }[] = []
  for (const ilha of ilhas) {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo !== undefined && ultimo.trilha === ilha.trilha) {
      ultimo.ilhas.push(ilha)
    } else {
      grupos.push({ trilha: ilha.trilha, ilhas: [ilha] })
    }
  }
  return grupos
}
/**
 * O percurso visto pelo domínio, montado a partir do conteúdo
 * (`content/percursoDoConteudo.ts`) porque os exercícios conferidos fazem parte
 * dele agora. A tela não monta a própria lista: lista paralela é lista que
 * envelhece sem ninguém perceber.
 */
const PERCURSO = PERCURSO_DO_CONTEUDO

/**
 * A cena 3D entra por importação sob demanda.
 *
 * Motivo concreto: o desenho do mundo é o pedaço mais pesado da aplicação — o
 * Three.js e as bibliotecas de cena respondem por boa parte do pacote final. Quem
 * não tem placa de vídeo não deve baixar nada disso: a trilha em texto é o
 * caminho de quem está sem 3D, e ela precisa abrir leve. Com a importação sob
 * demanda, o arquivo da cena só é buscado quando `com3d` é verdadeiro.
 */
const Cena = lazy(() =>
  import('../../world/Cena').then((modulo) => ({ default: modulo.Cena })),
)

export function Mundo() {
  const redutor = useMemo(() => criarRedutor(PERCURSO), [])
  const [estado, despachar] = useReducer(redutor, undefined, () => estadoInicial())
  const [sobreIlha, setSobreIlha] = useState<string | null>(null)
  const [focarEm, setFocarEm] = useState<{ id: string; pedido: number } | null>(null)
  const [caminhada, setCaminhada] = useState<{ id: string; pedido: number } | null>(null)
  const [lugar, setLugar] = useState<Localizacao>(null)
  const [avisoDoMundo, setAvisoDoMundo] = useState<string | null>(null)
  const suporta3d = useSuporteWebgl()

  const { apagar } = useProgressoPersistido({
    progresso: estado.progresso,
    avisoAtual: estado.avisoDeGravacao,
    despachar,
  })

  // Está aqui em cima, e não junto do desenho: vários callbacks decidem o que
  // fazer a partir desta resposta, e um `const` usado por engano antes de ser
  // declarado derruba o componente inteiro.
  const com3d = suporta3d && !estado.sem3d

  const ilhas = useMemo(() => ilhasVisiveis(estado.progresso, UNIDADES), [estado.progresso])
  const pontes = useMemo(
    () => pontesVisiveis(estado.progresso, UNIDADES, ilhas),
    [estado.progresso, ilhas],
  )
  // O chão caminhável é montado aqui, uma vez, e desce pronto para a cena — que
  // não recalcula nada. Fora do 3D ele também serve: é dele que sai a frase do
  // HUD dizendo onde o avatar está ("na ilha tal", "na ponte entre tal e tal").
  // As duas pontas leem o mesmo objeto, e é por isso que não podem discordar.
  const chao = useMemo(() => chaoDoMundo(ilhas, pontes), [ilhas, pontes])
  const resumo = useMemo(() => resumoDoMundo(estado.progresso, UNIDADES), [estado.progresso])
  const unidadeDoMomento = useMemo(() => ilhaAtual(estado.progresso, UNIDADES), [estado.progresso])
  const todasAprovadas = resumo.total > 0 && resumo.aprovadas === resumo.total
  const proxima = useMemo(() => proximaUnidade(estado.progresso, PERCURSO), [estado.progresso])

  const unidadeAbertaId = estado.sessao.unidadeId
  const conteudo = unidadeAbertaId === null ? null : conteudoDaUnidade(unidadeAbertaId)
  // A referência ao livro vive no plano de unidades, não no conteúdo: é lá que
  // ela existe desde a Etapa 1, com o status de página. Aqui só se busca a da
  // unidade aberta, para o painel poder dizer onde a leitura está — inclusive
  // quando ela ainda está pendente.
  const referencia =
    unidadeAbertaId === null
      ? null
      : UNIDADES.find((unidade) => unidade.id === unidadeAbertaId)?.referencia ?? null
  const leituraFeita = unidadeAbertaId === null ? false : leituraFoiFeita(estado.progresso, unidadeAbertaId)
  const exerciciosJaConferidos =
    unidadeAbertaId === null ? [] : exerciciosConferidos(estado.progresso, unidadeAbertaId)
  // Placar: quantas tentativas esta ilha já teve e qual foi a melhor nota. Vem
  // do progresso, e não de um contador da tela — o número precisa ser o mesmo
  // depois de recarregar a página (D-037).
  const progressoDestaIlha =
    unidadeAbertaId === null ? null : progressoDaUnidade(estado.progresso, unidadeAbertaId)

  const abrirUnidade = useCallback(
    (unidadeId: string) => {
      const ilha = ilhas.find((cada) => cada.id === unidadeId)
      const material = conteudoDaUnidade(unidadeId)

      if (ilha === undefined || material === null) {
        setAvisoDoMundo('Esta ilha ainda não tem conteúdo escrito. Nada foi aberto.')
        return
      }

      if (!ilha.acessivel) {
        const anterior = ilhas[ilha.indice - 1]
        setAvisoDoMundo(
          anterior === undefined
            ? `A ilha "${ilha.titulo}" ainda está bloqueada.`
            : `A ilha "${ilha.titulo}" abre quando você aprovar "${anterior.titulo}". Você pode estudar a ilha anterior quantas vezes quiser.`,
        )
        return
      }

      setAvisoDoMundo(null)
      despachar({
        tipo: 'abrirUnidade',
        unidadeId,
        totalDePerguntas: material.perguntas.length,
      })
    },
    [ilhas, despachar],
  )

  const fecharUnidade = useCallback(() => {
    despachar({ tipo: 'fecharUnidade' })
  }, [despachar])

  /**
   * Levar até uma ilha: a pé no modo `andar`, de câmera nos outros modos.
   *
   * O pedido de caminhada não carrega posição nenhuma: quem conhece a posição do
   * avatar é a cena. Aqui só se diz **para onde ir**; a cena decide se há caminho
   * a pé e, quando não há, devolve o motivo (ver `Avatar.tsx`).
   */
  const irParaIlha = useCallback(
    (unidadeId: string) => {
      if (estado.sessao.camera === 'andar') {
        setCaminhada((atual) => ({ id: unidadeId, pedido: (atual?.pedido ?? 0) + 1 }))
        return
      }
      setFocarEm((atual) => ({ id: unidadeId, pedido: (atual?.pedido ?? 0) + 1 }))
    },
    [estado.sessao.camera],
  )

  /**
   * Travessia: clique na ponte, ou o botão "Seguir para a próxima ilha".
   *
   * A decisão mora em `decidirTravessia()`, que é função pura e testada — porque
   * a regra do projeto exige que clicar numa ponte **não** libere nada. Aqui só
   * se executa a decisão: ou a câmera voa (com 3D), ou a missão do destino abre
   * (sem 3D), ou aparece o motivo de a ponte estar pela metade.
   */
  const atravessarAte = useCallback(
    (unidadeId: string) => {
      if (com3d) {
        despachar({ tipo: 'fecharUnidade' })
        irParaIlha(unidadeId)
        return
      }
      abrirUnidade(unidadeId)
    },
    [abrirUnidade, com3d, despachar, irParaIlha],
  )

  const escolherPonte = useCallback(
    (ponte: PonteVisivel) => {
      const decisao = decidirTravessia(ponte, ilhas)

      if (decisao.tipo === 'recusar') {
        setAvisoDoMundo(decisao.motivo)
        return
      }

      setAvisoDoMundo(null)
      atravessarAte(decisao.unidadeId)
    },
    [atravessarAte, ilhas],
  )

  /**
   * "Seguir para a próxima ilha": o que muda é o que existe para ver.
   *
   * Com 3D, o painel fecha e a câmera voa até a ilha recém-liberada — o
   * estudante continua de onde estava. Sem 3D, não há para onde voar: seguir é
   * abrir a missão da próxima ilha direto, pelo mesmo caminho de abertura (que
   * confere a liberação). Em nenhum dos dois casos o botão promete o que não faz.
   */
  const seguirParaAProxima = useCallback(() => {
    if (proxima === null) {
      despachar({ tipo: 'fecharUnidade' })
      return
    }

    atravessarAte(proxima.id)
  }, [atravessarAte, despachar, proxima])

  const zerarProgresso = useCallback(() => {
    const confirmado = window.confirm(
      'Apagar o progresso guardado neste navegador? As ilhas voltam ao começo e não há como desfazer.',
    )
    if (!confirmado) {
      return
    }
    if (apagar()) {
      despachar({ tipo: 'substituirProgresso', progresso: progressoInicial() })
      despachar({ tipo: 'registrarAviso', aviso: null })
    }
  }, [apagar, despachar])

  const nomeSobreIlha =
    sobreIlha === null ? null : ilhas.find((ilha) => ilha.id === sobreIlha)?.titulo ?? null

  const ondeEsta = descricaoDoLugar(chao, lugar)
  const AoNaoPoderCaminhar = useCallback((motivo: string) => {
    setAvisoDoMundo(motivo)
  }, [])
  const AoMudarDeLugar = useCallback((novo: Localizacao) => {
    setLugar(novo)
  }, [])

  return (
    <div className="mundo">
      <section className="mundo__palco" aria-label="Mundo 3D do arquipélago">
        {com3d ? (
          <LimiteDeErro
            doQue="a cena 3D"
            alternativa={
              <p className="falha__texto">
                Use a lista de ilhas ao lado: ela leva às mesmas lições, com o mesmo conteúdo e as
                mesmas avaliações.
              </p>
            }
          >
            <Suspense fallback={<p className="cena__carregando">Preparando o mundo 3D…</p>}>
              <Cena
                ilhas={ilhas}
                pontes={pontes}
                chao={chao}
                modo={estado.sessao.camera}
                tecladoAtivo={podeMoverCamera(estado.sessao.foco)}
                focarEm={focarEm}
                destinoDeCaminhada={estado.sessao.camera === 'andar' ? caminhada : null}
                aoEscolher={abrirUnidade}
                aoEscolherPonte={escolherPonte}
                aoPassarPorCima={setSobreIlha}
                aoMudarDeLugar={AoMudarDeLugar}
                aoNaoPoderCaminhar={AoNaoPoderCaminhar}
              />
            </Suspense>
          </LimiteDeErro>
        ) : (
          <div className="mundo__sem3d">
            <h2 className="mundo__sem3d-titulo">
              {suporta3d ? 'Modo sem 3D ligado' : 'Sem desenho 3D nesta máquina'}
            </h2>
            <p className="mundo__sem3d-texto">
              {suporta3d
                ? 'Você escolheu a versão em texto. A trilha é a mesma: todas as ilhas, as lições e as avaliações continuam aqui.'
                : 'O navegador não ofereceu um contexto WebGL, que é o que desenha o mundo. A trilha inteira continua funcionando em texto, abaixo.'}
            </p>
          </div>
        )}

        <div className="hud">
          <div className="hud__linha">
            <p className="hud__resumo">
              {resumo.aprovadas} de {resumo.total} ilhas aprovadas
            </p>
            {com3d ? (
              <button
                type="button"
                className="botao botao--pequeno"
                onClick={() => unidadeDoMomento !== null && irParaIlha(unidadeDoMomento.id)}
                disabled={unidadeDoMomento === null}
              >
                Olhar a ilha atual
              </button>
            ) : null}
            {suporta3d ? (
              <button
                type="button"
                className="botao botao--pequeno"
                onClick={() => despachar({ tipo: 'alternarSem3d' })}
              >
                {estado.sem3d ? 'Ligar o 3D' : 'Usar sem 3D'}
              </button>
            ) : null}
          </div>

          {/*
            Os controles de câmera só aparecem quando existe câmera para
            controlar. Botão desabilitado por falta de placa de vídeo seria
            ruído: a explicação de por que o 3D não está aí fica no aviso acima.
          */}
          {com3d ? (
            <div className="hud__linha">
              <button
                type="button"
                className={
                  estado.sessao.camera === 'andar'
                    ? 'botao botao--pequeno botao--ativo'
                    : 'botao botao--pequeno'
                }
                onClick={() => despachar({ tipo: 'definirCamera', camera: 'andar' })}
              >
                Andar pelo mundo
              </button>
              <button
                type="button"
                className={
                  estado.sessao.camera === 'voar'
                    ? 'botao botao--pequeno botao--ativo'
                    : 'botao botao--pequeno'
                }
                onClick={() => despachar({ tipo: 'definirCamera', camera: 'voar' })}
              >
                Voo livre
              </button>
              <button
                type="button"
                className={
                  estado.sessao.camera === 'mapa'
                    ? 'botao botao--pequeno botao--ativo'
                    : 'botao botao--pequeno'
                }
                onClick={() => despachar({ tipo: 'definirCamera', camera: 'mapa' })}
              >
                Vista de mapa
              </button>
            </div>
          ) : null}

          {com3d && estado.sessao.camera === 'andar' ? (
            <p className="hud__lugar" role="status">
              {ondeEsta === null ? 'Procurando onde você está…' : `Você está ${ondeEsta}`}
            </p>
          ) : null}

          <p className="hud__sobre" role="status">
            {nomeSobreIlha ??
              (estado.sessao.foco === 'painel'
                ? 'Painel aberto: o teclado está com o estudo.'
                : todasAprovadas
                  ? 'Todas as ilhas escritas até agora foram aprovadas. Fim do percurso por enquanto.'
                  : 'Passe o mouse sobre uma ilha para ver o nome dela.')}
          </p>

          {com3d && estado.sessao.foco === 'mundo' ? (
            <details className="hud__teclas ajuda-de-teclas">
              <summary>Como pilotar</summary>
              {estado.sessao.camera === 'andar' ? (
                <ul>
                  <li>
                    <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> ou as setas: andar pela
                    ilha e pelas pontes
                  </li>
                  <li>
                    <kbd>Shift</kbd>: correr
                  </li>
                  <li>Arrastar com o mouse: girar a câmera em volta de você</li>
                  <li>Clique numa ilha liberada: abrir a missão dela</li>
                  <li>
                    Clique numa ponte inteira: ir a pé até a ilha seguinte. Ponte pela metade
                    explica o que falta para ela ficar inteira
                  </li>
                </ul>
              ) : (
                <ul>
                  <li>
                    <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> ou as setas: voar
                  </li>
                  <li>
                    <kbd>E</kbd> sobe, <kbd>Q</kbd> desce
                  </li>
                  <li>
                    <kbd>Shift</kbd>: mais rápido
                  </li>
                  <li>Arrastar com o mouse: olhar em volta</li>
                  <li>Clique numa ilha liberada: abrir a missão dela</li>
                  <li>
                    Clique numa ponte inteira: voar até a ilha seguinte. Ponte pela metade explica
                    o que falta para ela ficar inteira
                  </li>
                </ul>
              )}
            </details>
          ) : null}
        </div>
      </section>

      <section className="mundo__lado" aria-label="Ilhas e estudo">
        {estado.avisoDeGravacao === null ? null : (
          <div className="aviso aviso--gravacao" role="alert">
            <p>{estado.avisoDeGravacao}</p>
            <button
              type="button"
              className="botao botao--pequeno"
              onClick={() => despachar({ tipo: 'registrarAviso', aviso: null })}
            >
              Entendi
            </button>
          </div>
        )}

        {avisoDoMundo === null ? null : (
          <div className="aviso" role="status">
            <p>{avisoDoMundo}</p>
          </div>
        )}

        {conteudo === null ? (
          <TrilhaDeIlhas
            ilhas={ilhas}
            com3d={com3d}
            aoAbrir={abrirUnidade}
            aoOlhar={irParaIlha}
            aoPassarPorCima={setSobreIlha}
            aoZerar={zerarProgresso}
          />
        ) : (
          <PainelDaUnidade
            conteudo={conteudo}
            referencia={referencia}
            leituraFeita={leituraFeita}
            aoMarcarLeitura={(feita) => despachar({ tipo: 'marcarLeitura', feita })}
            exerciciosConferidos={exerciciosJaConferidos}
            aoMarcarExercicio={(exercicioId) => despachar({ tipo: 'marcarExercicio', exercicioId })}
            passo={estado.sessao.passo}
            respostas={estado.sessao.respostas}
            resultado={estado.sessao.resultado}
            aprovadaAntes={estado.sessao.aprovadaAntes}
            tentativas={progressoDestaIlha?.tentativas ?? 0}
            melhorNota={progressoDestaIlha?.melhorNota ?? null}
            temProxima={proxima !== null && proxima.id !== conteudo.id}
            aoIrPara={(passo: Passo) => despachar({ tipo: 'irPara', passo })}
            aoAvancar={() => despachar({ tipo: 'avancar' })}
            aoVoltar={() => despachar({ tipo: 'voltar' })}
            aoResponder={(indice, alternativa) =>
              despachar({ tipo: 'responder', indice, alternativa })
            }
            aoEnviar={() => despachar({ tipo: 'enviar', gabarito: gabaritoDaUnidade(conteudo) })}
            aoRefazer={() => despachar({ tipo: 'refazer' })}
            aoFechar={fecharUnidade}
            aoSeguir={seguirParaAProxima}
          />
        )}
      </section>
    </div>
  )
}

/** Lista das ilhas: a trilha em texto, com estado, ação e a mesma ordem do mundo. */
function TrilhaDeIlhas({
  ilhas,
  com3d,
  aoAbrir,
  aoOlhar,
  aoPassarPorCima,
  aoZerar,
}: {
  readonly ilhas: readonly IlhaVisivel[]
  readonly com3d: boolean
  readonly aoAbrir: (unidadeId: string) => void
  readonly aoOlhar: (unidadeId: string) => void
  readonly aoPassarPorCima: (unidadeId: string | null) => void
  readonly aoZerar: () => void
}) {
  return (
    <div className="trilha">
      <h2 className="trilha__titulo">As ilhas do arquipélago</h2>
      <p className="trilha__texto">
        Cada ilha é uma unidade. A ponte para a ilha seguinte fica inteira quando você aprova a
        atual com pelo menos 80% de acertos.
      </p>

      {/* Cada trilha do livro é um grupo com título, e o grupo diz o que o
          **console** roda ali. Isso importa porque a partir da Parte II o console
          não roda tudo o que o livro mostra — o Pygame e o Django não existem
          nesta ilha (medido, D-061) — e quem estuda precisa saber disso antes de
          escrever a primeira linha, não depois de o erro aparecer. */}
      {gruposDeTrilha(ilhas).map((grupo) => (
        <section key={grupo.trilha} className="trilha__grupo" aria-labelledby={`trilha-${grupo.trilha}`}>
          <h3 className="trilha__grupo-titulo" id={`trilha-${grupo.trilha}`}>
            {/* A marca da trilha é a mesma cor da bandeira que a ilha finca no
                capim (D-063): a lista e o mundo dizem a mesma coisa, e quem viu
                a bandeira verde acha o grupo sem ler. */}
            <span
              className="trilha__grupo-marca"
              style={{ background: paraCss(corDaTrilha(grupo.trilha)) }}
              aria-hidden="true"
            />
            {trilhaDe(grupo.trilha).nome}
          </h3>
          <p className="trilha__grupo-texto">{trilhaDe(grupo.trilha).resumo}</p>
          <p className="trilha__grupo-console">
            <strong>Nesta trilha, o console roda:</strong> {trilhaDe(grupo.trilha).oConsoleRoda}
          </p>

          <ol className="trilha__lista">
        {grupo.ilhas.map((ilha) => (
          <li
            key={ilha.id}
            className={`ilha-cartao ilha-cartao--${ilha.situacao}`}
            onMouseEnter={() => aoPassarPorCima(ilha.id)}
            onMouseLeave={() => aoPassarPorCima(null)}
          >
            <p className="ilha-cartao__sobretitulo">Ilha {ilha.ordem}</p>
            <h3 className="ilha-cartao__titulo">{ilha.titulo}</h3>
            <p className="ilha-cartao__tema">{ilha.tema}</p>

            {ilha.situacao === 'bloqueada' ? (
              <p className="ilha-cartao__aviso">
                Bloqueada: aprovar{' '}
                <strong>{ilhas[ilha.indice - 1]?.titulo ?? 'a ilha anterior'}</strong> abre esta.
              </p>
            ) : null}

            <div className="ilha-cartao__acoes">
              <button
                type="button"
                className="botao botao--pequeno botao--principal"
                onClick={() => aoAbrir(ilha.id)}
                disabled={!ilha.acessivel}
              >
                {ilha.situacao === 'aprovada' ? 'Revisar' : 'Entrar'}
              </button>
              {com3d ? (
                <button
                  type="button"
                  className="botao botao--pequeno"
                  onClick={() => aoOlhar(ilha.id)}
                >
                  Ver de perto
                </button>
              ) : null}
            </div>
          </li>
        ))}
          </ol>
        </section>
      ))}

      <div className="trilha__rodape">
        <p className="trilha__texto">
          O progresso fica guardado neste navegador, nesta máquina. Não há conta e nada é enviado
          para servidor nenhum.
        </p>
        <button type="button" className="botao botao--pequeno" onClick={aoZerar}>
          Apagar meu progresso
        </button>
      </div>
    </div>
  )
}
