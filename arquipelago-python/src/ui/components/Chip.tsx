import type { SituacaoDeConstrucao } from '../../content/planoDeUnidades'

const ROTULO: Record<SituacaoDeConstrucao, string> = {
  planejada: 'Planejada',
  'em-construcao': 'Em construção',
  pronta: 'Pronta',
}

type Props = {
  readonly situacao: SituacaoDeConstrucao
}

/**
 * Etiqueta de estado no estilo das referências: maiúsculas pequenas, fundo
 * escuro, texto claro. O tom âmbar exige texto escuro — ver o teste de contraste
 * em `../theme/contraste.test.ts`.
 */
export function Chip({ situacao }: Props) {
  return <span className={`chip chip--${situacao}`}>{ROTULO[situacao]}</span>
}
