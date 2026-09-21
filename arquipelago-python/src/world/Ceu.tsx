import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BackSide,
  Color,
  Object3D,
  Vector3,
  type DirectionalLight,
} from 'three'
import { Malha3D } from './Malha'
import { gerarNuvem } from './geometria/solidos'
import { CORES_DERIVADAS, CORES_DO_MUNDO } from '../ui/theme/paleta3d'
import { pintarPorAltura } from './geometria/pintura'
import { criarSorteador, entre } from './geometria/aleatorio'

/**
 * Céu, névoa, sol, nuvens e sombra.
 *
 * A captura de tela de 21/09/2026 foi a pior crítica visual que este projeto
 * recebeu, e três dos quatro pontos eram daqui: *"não há ... sombreamento de
 * contato. Tudo parece uniformemente iluminado de forma estúpida, o que achata os
 * objetos e tira totalmente a percepção de profundidade e relevo"* e *"o céu é um
 * gradiente sem graça de branco e azul claro, sem nuvens volumétricas, atmosfera
 * ou horizonte"*.
 *
 * **O que mudou, e por quê.**
 *
 *  1. **O céu virou material próprio** (`shaderMaterial`): um gradiente de altura
 *     de verdade, com a névoa entrando por baixo do horizonte e um sol com halo.
 *     Antes era uma cor chapada (`color attach="background"`), que é o que a
 *     captura chamou de gradiente sem graça — na verdade era pior: era uma cor.
 *  2. **A sombra entrou.** Até aqui este arquivo dizia, com razão de custo, que
 *     sombra exigiria uma segunda passagem de desenho por luz. A crítica deixou
 *     claro que a falta dela era o que achatava tudo, e o custo passou a ser
 *     aceitável: **uma** luz projeta sombra, com o mapa de 2048 e o enquadramento
 *     acompanhando o que a câmera olha. Luz parada em `[60, 90, 40]` com o
 *     enquadramento fixo do mundo inteiro daria sombra de 5 pixels por unidade —
 *     pior que não ter.
 *  3. **As nuvens ganharam volume** (`gerarNuvem`): cada uma é um conjunto de
 *     bolsões, pintados por altura, e não uma caixa achatada. Continuam **sem
 *     luz** (o motivo está em D-055: com a luz do mundo, a face de baixo recebia a
 *     cor do mar e cada nuvem virava um caco escuro) — o volume vem da cor pintada.
 */

/** As nuvens. Mais que antes, e em três faixas de altitude. */
const NUVENS = 22

/** A direção de onde o sol vem, normalizada — a mesma para o desenho, a luz e a sombra. */
const DIRECAO_DO_SOL = new Vector3(0.42, 0.72, 0.55).normalize()

const VERTICE = /* glsl */ `
  varying vec3 vMundo;
  void main() {
    vMundo = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAGMENTO = /* glsl */ `
  varying vec3 vMundo;
  uniform vec3 corDoAlto;
  uniform vec3 corDoHorizonte;
  uniform vec3 corDaNevoa;
  uniform vec3 direcaoDoSol;
  uniform vec3 corDoSol;

  void main() {
    vec3 direcao = normalize(vMundo - cameraPosition);
    float altura = clamp(direcao.y, -1.0, 1.0);

    // O gradiente de altura: forte no zênite, claro no horizonte, e a névoa
    // tomando conta abaixo dele — é ela que faz o mar distante sumir no horizonte
    // em vez de terminar numa linha.
    vec3 cor = mix(corDoHorizonte, corDoAlto, pow(clamp(altura, 0.0, 1.0), 0.55));
    cor = mix(cor, corDaNevoa, smoothstep(0.03, -0.3, altura));

    // O sol: um disco pequeno e um halo largo. Sem o halo, o sol é um ponto
    // perdido; com ele, a luz tem direção, que é o que dá relevo ao resto.
    float paraOSol = max(dot(direcao, normalize(direcaoDoSol)), 0.0);
    cor += corDoSol * (pow(paraOSol, 260.0) * 1.1 + pow(paraOSol, 9.0) * 0.18);

    gl_FragColor = vec4(cor, 1.0);

    // As duas linhas abaixo não são enfeite: sem elas este material ficaria **fora**
    // do tone mapping e da conversão de cor que todos os outros materiais fazem, e
    // o encontro do céu com a névoa apareceria como uma emenda de cor.
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

/**
 * O sol: a luz que projeta sombra, e o enquadramento da sombra.
 *
 * O enquadramento acompanha o que a câmera olha, quadro a quadro: a caixa de
 * sombra tem de ser pequena para a sombra ter resolução, e tem de estar onde se
 * está olhando. No modo mapa (a câmera a duzentas unidades) ela se alarga — a
 * sombra fica mais grosseira ali, e é o preço certo: de longe ninguém confere
 * sombra de estrutura.
 */
function Sol() {
  const luz = useRef<DirectionalLight>(null)
  const alvo = useMemo(() => new Object3D(), [])
  const foco = useMemo(() => new Vector3(), [])
  const paraOnde = useMemo(() => new Vector3(), [])

  useFrame(({ camera }) => {
    const atual = luz.current
    if (atual === null) {
      return
    }

    camera.getWorldDirection(paraOnde)
    // O foco é um ponto à frente da câmera, onde ela olha: é ali que a sombra
    // precisa de detalhe.
    foco.copy(camera.position).addScaledVector(paraOnde, 55)

    atual.position.copy(foco).addScaledVector(DIRECAO_DO_SOL, 130)
    alvo.position.copy(foco)
    alvo.updateMatrixWorld()

    const lado = Math.min(Math.max(camera.position.distanceTo(foco) * 1.6, 45), 220)
    const caixa = atual.shadow.camera
    caixa.left = -lado
    caixa.right = lado
    caixa.top = lado
    caixa.bottom = -lado
    caixa.updateProjectionMatrix()
  })

  return (
    <>
      <primitive object={alvo} />
      <directionalLight
        ref={luz}
        target={alvo}
        color={CORES_DO_MUNDO.pale}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        // `normalBias` é o que evita o serrilhado de sombra nas faces que quase
        // encostam na própria superfície (o capim logo abaixo de uma tábua); o
        // `bias` pequeno tira o resto do "acne" sem descolar a sombra do pé.
        shadow-normalBias={0.035}
        shadow-bias={-0.0004}
        shadow-camera-near={1}
        shadow-camera-far={420}
      />
    </>
  )
}

export function Ceu() {
  const nuvens = useMemo(() => {
    const sortear = criarSorteador(20260421)
    return Array.from({ length: NUVENS }, () => {
      const angulo = entre(sortear, 0, Math.PI * 2)
      const distancia = entre(sortear, 28, 165)
      const largura = entre(sortear, 12, 34)
      const altura = entre(sortear, 4.5, 9)
      const profundidade = entre(sortear, 10, 28)
      return {
        x: Math.cos(angulo) * distancia,
        z: Math.sin(angulo) * distancia,
        // Três faixas: as nuvens de baixo dão a profundidade sob as ilhas
        // (o motivo original delas), e as de cima povoam o céu que a captura
        // chamou de vazio.
        y: entre(sortear, -74, 46),
        malha: pintarPorAltura(
          gerarNuvem({
            largura,
            altura,
            profundidade,
            semente: Math.floor(entre(sortear, 1, 900000)),
          }),
          {
            de: -altura * 0.5,
            para: altura * 0.5,
            corDe: CORES_DERIVADAS.nuvem,
            corPara: CORES_DERIVADAS.nuvemDoAlto,
            degraus: 3,
          },
        ),
      }
    })
  }, [])

  const uniformes = useMemo(
    () => ({
      corDoAlto: { value: new Color(CORES_DO_MUNDO.ceuDoAlto) },
      corDoHorizonte: { value: new Color(CORES_DO_MUNDO.ceu) },
      corDaNevoa: { value: new Color(CORES_DO_MUNDO.nevoa) },
      direcaoDoSol: { value: DIRECAO_DO_SOL.clone() },
      corDoSol: { value: new Color(CORES_DERIVADAS.sol) },
    }),
    [],
  )

  return (
    <>
      {/* A cor de fundo fica como rede de segurança: se o material do céu falhar
          em alguma placa, o mundo continua com céu, e não com preto. */}
      <color attach="background" args={[CORES_DO_MUNDO.ceu]} />
      <fog attach="fog" args={[CORES_DO_MUNDO.nevoa, 90, 420]} />

      <mesh frustumCulled={false} renderOrder={-1}>
        <sphereGeometry args={[760, 32, 16]} />
        <shaderMaterial
          vertexShader={VERTICE}
          fragmentShader={FRAGMENTO}
          uniforms={uniformes}
          side={BackSide}
          depthWrite={false}
          toneMapped
        />
      </mesh>

      {/*
        A meia-luz do céu: o preenchimento que impede que a face virada para o
        lado oposto ao sol vire breu. O chão dela **não** é a cor do mar, e isso
        continua sendo uma decisão (D-056): o mar é verde-azulado saturado, e a
        rocha grey que só recebe luz de baixo saía azul-petróleo escura.
      */}
      <hemisphereLight args={[CORES_DO_MUNDO.ceuDoAlto, CORES_DO_MUNDO.rochaClara, 1.05]} />
      <Sol />

      {/*
        Mar distante, bem abaixo: uma laje grande e plana, que a névoa come.

        A laje **não** recebe luz, e isso é uma decisão medida (D-060). Com a luz
        do mundo, a radiação dela chegava a 1,08 — acima do teto de 1,0 que o tone
        mapping (ACES, o padrão do React Three Fiber) consegue representar. Tudo o
        que passa do teto vira a mesma cor: a laje ficava chapada, sem variação de
        luz, e clara demais para um chão abaixo do horizonte. Na cor da névoa, ela
        lê como o mar que continua até o horizonte — que é o que ela é.
      */}
      <mesh position={[0, -180, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false}>
        <planeGeometry args={[1400, 1400]} />
        <meshBasicMaterial color={CORES_DERIVADAS.marDistante} />
      </mesh>

      {nuvens.map((nuvemDaVez, indice) => (
        <group
          key={`nuvem:${indice}`}
          // Nome estável: é por ele que o teste da cena chega à nuvem, já que a
          // cor deixou de ser o marcador quando a nuvem passou a ser pintada por
          // altura (dois tons de branco, para ganhar volume).
          name={`nuvem:${indice}`}
          position={[nuvemDaVez.x, nuvemDaVez.y, nuvemDaVez.z]}
        >
          <Malha3D malha={nuvemDaVez.malha} semLuz duasFaces suave />
        </group>
      ))}
    </>
  )
}
