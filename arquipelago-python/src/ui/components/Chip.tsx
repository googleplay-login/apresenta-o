import type { SituacaoDeConstrucao } from '../../content/planoDeUnidades'

const ROTULO: Record<SituacaoDeConstrucao, string> = {
  planejada: 'Planejada',
  'em-construcao': 'Em construcao',
  pronta: 'Pronta',
}

type Props = {
  readonly situacao: SituacaoDeConstrucao
}

/**
 * Etiqueta de estado no estilo das referencias: maiusculas pequenas, fundo
 * escuro, texto claro. O tom ambar exige texto escuro - ver o teste de
 * contraste em `../theme/contraste.test.ts`.
 */
export function Chip({ situacao }: Props) {
  return <span className={`chip chip--${situacao}`}>{ROTULO[situacao]}</span>
}
