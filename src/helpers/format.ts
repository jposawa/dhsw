import type { Modifier } from '@/types'

/** Sinal explicito: "+2" e "−1" leem melhor que "2" e "-1". */
export const formatSigned = (value: number): string => {
  if (value < 0) {
    return `−${Math.abs(value)}`
  }

  return `+${value}`
}

/** Rotulo em pt-br da origem de um modificador, para o detalhamento na UI. */
export const describeModifierSource = ({ source }: Modifier): string => {
  switch (source.kind) {
    case 'base':
      return 'base'
    case 'class':
    case 'armor':
    case 'weapon':
    case 'item':
    case 'skill':
      return source.name
    case 'subclass':
    case 'ancestry':
    case 'community':
      return `${source.name} — ${source.feature}`
    case 'advancement':
      return `advancement, nível ${source.level}`
    case 'module':
      return source.moduleName
    case 'houseRule':
      return `regra da casa — ${source.rule}`
    case 'situational':
      return source.label
  }
}
