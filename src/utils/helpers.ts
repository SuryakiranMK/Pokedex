import { TYPE_COLORS, TYPE_EFFECTIVENESS } from './constants'

export const formatPokemonId = (id: number): string => `#${String(id).padStart(4, '0')}`

export const formatStatName = (stat: string): string => {
  const map: Record<string, string> = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    speed: 'Speed',
  }
  return map[stat] || stat
}

export const formatHeight = (height: number): string => {
  const meters = height / 10
  const feet = Math.floor(meters * 3.281)
  const inches = Math.round((meters * 3.281 - feet) * 12)
  return `${meters.toFixed(1)}m (${feet}'${inches}")`
}

export const formatWeight = (weight: number): string => {
  const kg = weight / 10
  const lbs = (kg * 2.205).toFixed(1)
  return `${kg.toFixed(1)}kg (${lbs} lbs)`
}

export const capitalize = (str: string): string =>
  str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export const getGenderRatio = (rate: number): { male: number; female: number } | null => {
  if (rate === -1) return null
  const female = (rate / 8) * 100
  return { male: 100 - female, female }
}

export const getTypeColor = (type: string) => TYPE_COLORS[type] ?? TYPE_COLORS.normal

export const getTypeGradient = (types: string[]): string => {
  if (types.length === 0) return 'from-gray-600 to-gray-800'
  if (types.length === 1) return TYPE_COLORS[types[0]]?.gradient ?? 'from-gray-600 to-gray-800'
  const c1 = TYPE_COLORS[types[0]]?.bg ?? '#888'
  const c2 = TYPE_COLORS[types[1]]?.bg ?? '#444'
  return `linear-gradient(135deg, ${c1}, ${c2})`
}

export const getGeneration = (id: number): number => {
  if (id <= 151) return 1
  if (id <= 251) return 2
  if (id <= 386) return 3
  if (id <= 493) return 4
  if (id <= 649) return 5
  if (id <= 721) return 6
  if (id <= 809) return 7
  if (id <= 905) return 8
  return 9
}

export const extractIdFromUrl = (url: string): number => {
  const parts = url.split('/').filter(Boolean)
  return parseInt(parts[parts.length - 1])
}

export const debounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export const fuzzyMatch = (text: string, query: string): boolean => {
  if (!query) return true
  const t = text.toLowerCase()
  const q = query.toLowerCase()
  let qi = 0
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++
  }
  return qi === q.length
}

export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const getStatPercentage = (stat: number, max = 255) => Math.round((stat / max) * 100)

export const calculateTypeEffectiveness = (
  attackType: string,
  defendTypes: string[]
): number => {
  let multiplier = 1
  const rule = TYPE_EFFECTIVENESS[attackType.toLowerCase()]
  if (!rule) return multiplier

  defendTypes.forEach((def) => {
    const d = def.toLowerCase()
    if (rule.superEffective.includes(d)) multiplier *= 2
    else if (rule.notEffective.includes(d)) multiplier *= 0.5
    else if (rule.immune.includes(d)) multiplier *= 0
  })

  return multiplier
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
