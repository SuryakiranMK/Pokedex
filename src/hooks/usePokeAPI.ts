import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  fetchPokemon, fetchPokemonList, fetchPokemonSpecies,
  fetchEvolutionChain, fetchType, fetchAbility, fetchMove,
  fetchRegion, fetchAllRegions, fetchAllPokemonNames, getIdFromUrl,
} from '../api/pokemon'
import { GENERATIONS } from '../utils/constants'

// ---- Pokémon list (infinite) ----
export const usePokemonInfinite = (limit = 150, generations: number[] = []) => {
  const finalLimit = Math.min(limit, 150)
  let startOffset = 0
  let maxLimit = 1025

  if (generations.length > 0) {
    const activeGens = GENERATIONS.filter((g) => generations.includes(g.id))
    if (activeGens.length > 0) {
      const startIds = activeGens.map((g) => g.range[0])
      const endIds = activeGens.map((g) => g.range[1])
      const minId = Math.min(...startIds)
      const maxId = Math.max(...endIds)
      startOffset = minId - 1
      maxLimit = maxId - minId + 1
    }
  }

  return useInfiniteQuery({
    queryKey: ['pokemon-infinite', finalLimit, generations],
    queryFn: ({ pageParam = startOffset }) => {
      const currentOffset = pageParam as number
      const remainingInRange = startOffset + maxLimit - currentOffset
      const fetchLimit = Math.min(finalLimit, remainingInRange)
      if (fetchLimit <= 0) {
        return Promise.resolve({ results: [], next: null, previous: null, count: 0 })
      }
      return fetchPokemonList(fetchLimit, currentOffset)
    },
    initialPageParam: startOffset,
    getNextPageParam: (last) => {
      if (!last.next) return null
      const urlParams = new URL(last.next).searchParams
      const offsetStr = urlParams.get('offset')
      if (!offsetStr) return null
      const nextOffset = parseInt(offsetStr)
      if (nextOffset >= startOffset + maxLimit) {
        return null
      }
      return nextOffset
    },
    staleTime: 1000 * 60 * 10,
  })
}

// ---- Single Pokémon ----
export const usePokemon = (nameOrId: string | number) =>
  useQuery({
    queryKey: ['pokemon', nameOrId],
    queryFn: () => fetchPokemon(nameOrId),
    enabled: !!nameOrId,
    staleTime: 1000 * 60 * 30,
  })

// ---- Species ----
export const usePokemonSpecies = (nameOrId: string | number) =>
  useQuery({
    queryKey: ['species', nameOrId],
    queryFn: () => fetchPokemonSpecies(nameOrId),
    enabled: !!nameOrId,
    staleTime: 1000 * 60 * 30,
  })

// ---- Evolution chain ----
export const useEvolutionChain = (chainId: number | undefined) =>
  useQuery({
    queryKey: ['evolution', chainId],
    queryFn: () => fetchEvolutionChain(chainId!),
    enabled: !!chainId,
    staleTime: 1000 * 60 * 60,
  })

// ---- Type ----
export const useType = (nameOrId: string | number) =>
  useQuery({
    queryKey: ['type', nameOrId],
    queryFn: () => fetchType(nameOrId),
    enabled: !!nameOrId,
    staleTime: 1000 * 60 * 60,
  })

// ---- Ability ----
export const useAbility = (nameOrId: string | number) =>
  useQuery({
    queryKey: ['ability', nameOrId],
    queryFn: () => fetchAbility(nameOrId),
    enabled: !!nameOrId,
    staleTime: 1000 * 60 * 60,
  })

// ---- Move ----
export const useMove = (nameOrId: string | number) =>
  useQuery({
    queryKey: ['move', nameOrId],
    queryFn: () => fetchMove(nameOrId),
    enabled: !!nameOrId,
    staleTime: 1000 * 60 * 60,
  })

// ---- Region ----
export const useRegion = (nameOrId: string | number) =>
  useQuery({
    queryKey: ['region', nameOrId],
    queryFn: () => fetchRegion(nameOrId),
    enabled: !!nameOrId,
    staleTime: 1000 * 60 * 60,
  })

// ---- All Pokémon names (for search) ----
export const useAllPokemonNames = () =>
  useQuery({
    queryKey: ['all-pokemon-names'],
    queryFn: fetchAllPokemonNames,
    staleTime: 1000 * 60 * 60 * 24,
  })

// ---- Multi-Pokémon (for compare) ----
export const useMultiplePokemon = (ids: number[]) =>
  useQuery({
    queryKey: ['multi-pokemon', ids],
    queryFn: () => Promise.all(ids.map((id) => fetchPokemon(id))),
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 30,
  })
