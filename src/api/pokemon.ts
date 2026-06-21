import api from './client'
import type {
  Pokemon, PokemonSpecies, EvolutionChain, TypeData,
  Ability, Move, Region, PokemonListResponse,
} from '../types'

// ---------- Pokémon ----------
export const fetchPokemonList = async (limit = 20, offset = 0): Promise<PokemonListResponse> => {
  const finalLimit = Math.min(limit, 150)
  const { data } = await api.get(`/pokemon?limit=${finalLimit}&offset=${offset}`)
  return data
}

export const fetchPokemon = async (nameOrId: string | number): Promise<Pokemon> => {
  const { data } = await api.get(`/pokemon/${nameOrId}`)
  return data
}

// ---------- Species ----------
export const fetchPokemonSpecies = async (nameOrId: string | number): Promise<PokemonSpecies> => {
  const { data } = await api.get(`/pokemon-species/${nameOrId}`)
  return data
}

export const fetchAllSpecies = async (): Promise<{ name: string; url: string }[]> => {
  const { data } = await api.get('/pokemon-species?limit=10000&offset=0')
  return data.results
}

// ---------- Evolution ----------
export const fetchEvolutionChain = async (id: number): Promise<EvolutionChain> => {
  const { data } = await api.get(`/evolution-chain/${id}`)
  return data
}

// ---------- Types ----------
export const fetchType = async (nameOrId: string | number): Promise<TypeData> => {
  const { data } = await api.get(`/type/${nameOrId}`)
  return data
}

export const fetchAllTypes = async (): Promise<{ name: string; url: string }[]> => {
  const { data } = await api.get('/type?limit=100')
  return data.results
}

// ---------- Abilities ----------
export const fetchAbility = async (nameOrId: string | number): Promise<Ability> => {
  const { data } = await api.get(`/ability/${nameOrId}`)
  return data
}

// ---------- Moves ----------
export const fetchMove = async (nameOrId: string | number): Promise<Move> => {
  const { data } = await api.get(`/move/${nameOrId}`)
  return data
}

// ---------- Regions ----------
export const fetchRegion = async (nameOrId: string | number): Promise<Region> => {
  const { data } = await api.get(`/region/${nameOrId}`)
  return data
}

export const fetchAllRegions = async (): Promise<{ name: string; url: string }[]> => {
  const { data } = await api.get('/region')
  return data.results
}

// ---------- Generation ----------
export const fetchGeneration = async (id: number) => {
  const { data } = await api.get(`/generation/${id}`)
  return data
}

// ---------- Helpers ----------
export const getIdFromUrl = (url: string): number => {
  const parts = url.split('/').filter(Boolean)
  return parseInt(parts[parts.length - 1])
}

export const getPokemonArtwork = (id: number): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

export const getPokemonArtworkShiny = (id: number): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`

export const getPokemonHomeSprite = (id: number): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`

export const getPokemonSprite = (id: number): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
