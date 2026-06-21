import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TeamPokemon, SavedTeam } from '../types'

interface FavoritesStore {
  favorites: number[]
  addFavorite: (id: number) => void
  removeFavorite: (id: number) => void
  toggleFavorite: (id: number) => void
  isFavorite: (id: number) => boolean
}

interface TeamStore {
  teams: SavedTeam[]
  activeTeamId: string | null
  currentTeam: TeamPokemon[]
  teamSize: 3 | 6
  setTeamSize: (size: 3 | 6) => void
  addToTeam: (pokemon: TeamPokemon) => void
  removeFromTeam: (id: number) => void
  saveTeam: (name: string) => void
  loadTeam: (id: string) => void
  deleteTeam: (id: string) => void
  renameTeam: (id: string, name: string) => void
  clearCurrentTeam: () => void
}

interface SoundStore {
  muted: boolean
  volume: number
  setMuted: (muted: boolean) => void
  setVolume: (volume: number) => void
  toggleMuted: () => void
}

interface UIStore {
  darkMode: boolean
  toggleDarkMode: () => void
  searchHistory: string[]
  addSearchHistory: (term: string) => void
  clearSearchHistory: () => void
  compareList: number[]
  addToCompare: (id: number) => void
  removeFromCompare: (id: number) => void
  clearCompare: () => void
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (id) => set((s) => ({ favorites: [...s.favorites, id] })),
      removeFavorite: (id) => set((s) => ({ favorites: s.favorites.filter((f) => f !== id) })),
      toggleFavorite: (id) => get().isFavorite(id) ? get().removeFavorite(id) : get().addFavorite(id),
      isFavorite: (id) => get().favorites.includes(id),
    }),
    { name: 'pokedex-favorites' }
  )
)

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      teams: [],
      activeTeamId: null,
      currentTeam: [],
      teamSize: 6,
      setTeamSize: (size) =>
        set((s) => ({
          teamSize: size,
          currentTeam: s.currentTeam.slice(0, size),
        })),
      addToTeam: (pokemon) =>
        set((s) => s.currentTeam.length < s.teamSize && !s.currentTeam.find((p) => p.id === pokemon.id)
          ? { currentTeam: [...s.currentTeam, pokemon] } : s),
      removeFromTeam: (id) =>
        set((s) => ({ currentTeam: s.currentTeam.filter((p) => p.id !== id) })),
      saveTeam: (name) => {
        const team: SavedTeam = {
          id: Date.now().toString(),
          name,
          pokemon: get().currentTeam,
          createdAt: Date.now(),
        }
        set((s) => ({ teams: [...s.teams, team], activeTeamId: team.id }))
      },
      loadTeam: (id) => {
        const team = get().teams.find((t) => t.id === id)
        if (team) set({ currentTeam: team.pokemon, activeTeamId: id, teamSize: team.pokemon.length > 3 ? 6 : 3 })
      },
      deleteTeam: (id) =>
        set((s) => ({ teams: s.teams.filter((t) => t.id !== id), activeTeamId: null })),
      renameTeam: (id, name) =>
        set((s) => ({ teams: s.teams.map((t) => t.id === id ? { ...t, name } : t) })),
      clearCurrentTeam: () => set({ currentTeam: [], activeTeamId: null }),
    }),
    { name: 'pokedex-teams' }
  )
)

export const useSoundStore = create<SoundStore>()(
  persist(
    (set, get) => ({
      muted: false,
      volume: 0.5,
      setMuted: (muted) => set({ muted }),
      setVolume: (volume) => set({ volume }),
      toggleMuted: () => set({ muted: !get().muted }),
    }),
    { name: 'pokedex-sound' }
  )
)

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      searchHistory: [],
      addSearchHistory: (term) => {
        const history = get().searchHistory.filter((h) => h !== term)
        set({ searchHistory: [term, ...history].slice(0, 10) })
      },
      clearSearchHistory: () => set({ searchHistory: [] }),
      compareList: [],
      addToCompare: (id) =>
        set((s) => s.compareList.length < 4 && !s.compareList.includes(id)
          ? { compareList: [...s.compareList, id] } : s),
      removeFromCompare: (id) =>
        set((s) => ({ compareList: s.compareList.filter((c) => c !== id) })),
      clearCompare: () => set({ compareList: [] }),
    }),
    { name: 'pokedex-ui' }
  )
)
