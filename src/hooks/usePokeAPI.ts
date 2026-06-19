import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  fetchPokemon, fetchPokemonList, fetchPokemonSpecies,
  fetchEvolutionChain, fetchType, fetchAbility, fetchMove,
  fetchRegion, fetchAllRegions, fetchAllPokemonNames, getIdFromUrl,
} from '../api/pokemon'

// ---- Pokémon list (infinite) ----
export const usePokemonInfinite = (limit = 24) =>
  useInfiniteQuery({
    queryKey: ['pokemon-infinite', limit],
    queryFn: ({ pageParam = 0 }) => fetchPokemonList(limit, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (last) =>
      last.next ? new URL(last.next).searchParams.get('offset') ? parseInt(new URL(last.next).searchParams.get('offset')!) : null : null,
    staleTime: 1000 * 60 * 10,
  })

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
