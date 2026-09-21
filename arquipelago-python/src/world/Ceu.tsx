import { useMemo } from 'react'
import { Malha3D } from './Malha'
import { gerarCaixa } from './geometria/solidos'
import { CORES_DERIVADAS, CORES_DO_MUNDO } from '../ui/theme/paleta3d'
import { criarSorteador, entre } from './geometria/aleatorio'

/**
 * Céu, névoa, luz e nuvens.
 *
 * Por que não há sombra projetada: sombra de verdade exige uma segunda passagem
 * de desenho por luz e encarece o quadro inteiro. O volume das ilhas vem da cor
 * pintada por altura (`geometria/pintura.ts`), que custa uma vez só. Se um dia a
 * sombra se justificar, ela entra aqui, com medida de desempenho antes e depois.
 *
 * As nuvens são poucas e fixas: elas existem para dar profundidade embaixo das
 * ilhas, não para encher a tela. São caixas achatadas com semente fixa, então a
 * nuvem fica sempre no mesmo lugar — a paisagem não treme a cada carregamento.
 *
 * As nuvens são desenhadas **sem luz** (`semLuz`): com a luz do mundo, a face de
 * baixo delas recebia a cor do mar e cada nuvem virava um caco escuro no céu
 * claro. É a única forma chapada do mundo, e é de propósito.
 */

const NUVENS = 14

export function Ceu() {
  const nuvens = useMemo(() => {
    const sortear = criarSorteador(20260421)
    return Array.from({ length: NUVENS }, () => {
      const angulo = entre(sortear, 0, Math.PI * 2)
      const distancia = entre(sortear, 30, 150)
      return {
        x: Math.cos(angulo) * distancia,
        z: Math.sin(angulo) * distancia,
        y: entre(sortear, -70, -26),
        largura: entre(sortear, 16, 44),
        altura: entre(sortear, 3, 7),
        profundidade: entre(sortear, 14, 34),
      }
    })
  }, [])

  const nuvem = useMemo(() => gerarCaixa({ largura: 1, altura: 1, profundidade: 1 }), [])

  return (
    <>
      <color attach="background" args={[CORES_DO_MUNDO.ceu]} />
      <fog attach="fog" args={[CORES_DO_MUNDO.nevoa, 90, 420]} />

      {/*
        Luz: meia-luz do céu mais um sol baixo, para a pedra ter dois lados.

        O chão da meia-luz **não** é a cor do mar, e isso é uma decisão (D-056).
        Era, e o mar é um verde-azulado saturado (`#3E8E96`): toda face virada
        para baixo — que é justamente a parede da pedra, na ilha suspensa — era
        iluminada por ele, e a rocha cinza da paleta saía **azul-petróleo**
        escuro. Na tela, o arquipélago virava uma fileira de barbatanas.
        O chão da meia-luz é a luz que volta de baixo, difusa e sem cor própria;
        e a rocha clara da paleta tem quase a mesma luminância do mar (0,24 contra
        0,23), então a penumbra embaixo das ilhas continua igual.
      */}
      <hemisphereLight args={[CORES_DO_MUNDO.ceuDoAlto, CORES_DO_MUNDO.rochaClara, 1.35]} />
      <directionalLight
        color={CORES_DO_MUNDO.pale}
        intensity={1.15}
        position={[60, 90, 40]}
      />

      {/* Mar distante, bem abaixo: uma laje grande e plana, que a névoa come. */}
      <mesh position={[0, -180, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[900, 900]} />
        <meshLambertMaterial color={CORES_DERIVADAS.vazio} />
      </mesh>

      {nuvens.map((nuvemDaVez, indice) => (
        <group
          key={`nuvem-${indice}`}
          position={[nuvemDaVez.x, nuvemDaVez.y, nuvemDaVez.z]}
          scale={[nuvemDaVez.largura, nuvemDaVez.altura, nuvemDaVez.profundidade]}
        >
          <Malha3D malha={nuvem} cor={CORES_DERIVADAS.nuvem} duasFaces semLuz />
        </group>
      ))}
    </>
  )
}
