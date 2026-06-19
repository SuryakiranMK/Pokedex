// ============================================================
// Complete PokéAPI TypeScript Types
// ============================================================

export interface NamedAPIResource {
  name: string
  url: string
}

export interface APIResource {
  url: string
}

// ---------- Pokémon ----------
export interface Pokemon {
  id: number
  name: string
  base_experience: number
  height: number
  is_default: boolean
  order: number
  weight: number
  abilities: PokemonAbility[]
  forms: NamedAPIResource[]
  held_items: PokemonHeldItem[]
  location_area_encounters: string
  moves: PokemonMove[]
  past_types: PokemonTypePast[]
  sprites: PokemonSprites
  cries: { latest: string; legacy: string }
  species: NamedAPIResource
  stats: PokemonStat[]
  types: PokemonType[]
}

export interface PokemonAbility {
  is_hidden: boolean
  slot: number
  ability: NamedAPIResource
}

export interface PokemonHeldItem {
  item: NamedAPIResource
  version_details: { rarity: number; version: NamedAPIResource }[]
}

export interface PokemonMove {
  move: NamedAPIResource
  version_group_details: {
    level_learned_at: number
    move_learn_method: NamedAPIResource
    version_group: NamedAPIResource
  }[]
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: NamedAPIResource
}

export interface PokemonType {
  slot: number
  type: NamedAPIResource
}

export interface PokemonTypePast {
  generation: NamedAPIResource
  types: PokemonType[]
}

export interface PokemonSprites {
  back_default: string | null
  back_female: string | null
  back_shiny: string | null
  back_shiny_female: string | null
  front_default: string | null
  front_female: string | null
  front_shiny: string | null
  front_shiny_female: string | null
  other: {
    dream_world: { front_default: string | null; front_female: string | null }
    home: { front_default: string | null; front_female: string | null; front_shiny: string | null; front_shiny_female: string | null }
    'official-artwork': { front_default: string | null; front_shiny: string | null }
    showdown: { front_default: string | null; back_default: string | null }
  }
  versions: Record<string, Record<string, { front_default: string | null; back_default: string | null }>>
}

// ---------- Species ----------
export interface PokemonSpecies {
  id: number
  name: string
  order: number
  gender_rate: number
  capture_rate: number
  base_happiness: number
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  hatch_counter: number
  has_gender_differences: boolean
  forms_switchable: boolean
  growth_rate: NamedAPIResource
  pokedex_numbers: { entry_number: number; pokedex: NamedAPIResource }[]
  egg_groups: NamedAPIResource[]
  color: NamedAPIResource
  shape: NamedAPIResource
  evolves_from_species: NamedAPIResource | null
  evolution_chain: APIResource
  habitat: NamedAPIResource | null
  generation: NamedAPIResource
  names: { name: string; language: NamedAPIResource }[]
  flavor_text_entries: { flavor_text: string; language: NamedAPIResource; version: NamedAPIResource }[]
  form_descriptions: { description: string; language: NamedAPIResource }[]
  genera: { genus: string; language: NamedAPIResource }[]
  varieties: { is_default: boolean; pokemon: NamedAPIResource }[]
}

// ---------- Evolution Chain ----------
export interface EvolutionChain {
  id: number
  baby_trigger_item: NamedAPIResource | null
  chain: ChainLink
}

export interface ChainLink {
  is_baby: boolean
  species: NamedAPIResource
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
}

export interface EvolutionDetail {
  item: NamedAPIResource | null
  trigger: NamedAPIResource
  gender: number | null
  held_item: NamedAPIResource | null
  known_move: NamedAPIResource | null
  known_move_type: NamedAPIResource | null
  location: NamedAPIResource | null
  min_affection: number | null
  min_beauty: number | null
  min_happiness: number | null
  min_level: number | null
  needs_overworld_rain: boolean
  party_species: NamedAPIResource | null
  party_type: NamedAPIResource | null
  relative_physical_stats: number | null
  time_of_day: string
  trade_species: NamedAPIResource | null
  turn_upside_down: boolean
}

// ---------- Type ----------
export interface TypeData {
  id: number
  name: string
  damage_relations: {
    no_damage_to: NamedAPIResource[]
    half_damage_to: NamedAPIResource[]
    double_damage_to: NamedAPIResource[]
    no_damage_from: NamedAPIResource[]
    half_damage_from: NamedAPIResource[]
    double_damage_from: NamedAPIResource[]
  }
  pokemon: { pokemon: NamedAPIResource; slot: number }[]
  generation: NamedAPIResource
}

// ---------- Ability ----------
export interface Ability {
  id: number
  name: string
  is_main_series: boolean
  generation: NamedAPIResource
  effect_entries: { effect: string; short_effect: string; language: NamedAPIResource }[]
  flavor_text_entries: { flavor_text: string; language: NamedAPIResource; version_group: NamedAPIResource }[]
  pokemon: { is_hidden: boolean; slot: number; pokemon: NamedAPIResource }[]
}

// ---------- Move ----------
export interface Move {
  id: number
  name: string
  accuracy: number | null
  effect_chance: number | null
  pp: number | null
  priority: number
  power: number | null
  type: NamedAPIResource
  damage_class: NamedAPIResource
  effect_entries: { effect: string; short_effect: string; language: NamedAPIResource }[]
  flavor_text_entries: { flavor_text: string; language: NamedAPIResource; version_group: NamedAPIResource }[]
  meta: {
    ailment: NamedAPIResource
    category: NamedAPIResource
    min_hits: number | null
    max_hits: number | null
    drain: number
    healing: number
    crit_rate: number
    ailment_chance: number
    flinch_chance: number
    stat_chance: number
  } | null
}

// ---------- Region ----------
export interface Region {
  id: number
  name: string
  locations: NamedAPIResource[]
  main_generation: NamedAPIResource
  names: { name: string; language: NamedAPIResource }[]
  pokedexes: NamedAPIResource[]
  version_groups: NamedAPIResource[]
}

// ---------- List Response ----------
export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: NamedAPIResource[]
}

// ---------- App-specific ----------
export interface PokemonCardData {
  id: number
  name: string
  types: string[]
  sprite: string
  artwork: string
  height: number
  weight: number
}

export type PokemonTypeName =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy'

export interface TeamPokemon {
  id: number
  name: string
  types: string[]
  artwork: string
  stats: { [key: string]: number }
}

export interface SavedTeam {
  id: string
  name: string
  pokemon: TeamPokemon[]
  createdAt: number
}

export interface FilterState {
  types: string[]
  generations: number[]
  legendary: boolean | null
  mythical: boolean | null
  baby: boolean | null
  search: string
  sortBy: 'id' | 'name' | 'height' | 'weight' | 'base_experience' | 'stat_total'
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list'
  minHp?: number
  maxHp?: number
  minAttack?: number
  maxAttack?: number
  minDefense?: number
  maxDefense?: number
  minSpeed?: number
  maxSpeed?: number
}
