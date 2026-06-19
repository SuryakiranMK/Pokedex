import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiGrid, FiList, FiFilter, FiX, FiChevronDown } from 'react-icons/fi'
import { useInView } from 'react-intersection-observer'
import PokemonCard from '../components/pokemon/PokemonCard'
import TypeBadge from '../components/ui/TypeBadge'
import SearchBar from '../components/ui/SearchBar'
import { usePokemonInfinite } from '../hooks/usePokeAPI'
import { fetchPokemon } from '../api/pokemon'
import { useQuery } from '@tanstack/react-query'
import { TYPE_COLORS, GENERATIONS, REGIONS } from '../utils/constants'
import { getIdFromUrl } from '../api/pokemon'
import type { FilterState } from '../types'

const ALL_TYPES = Object.keys(TYPE_COLORS)

const defaultFilters: FilterState = {
  types: [], generations: [], legendary: null, mythical: null, baby: null,
  search: '', sortBy: 'id', sortOrder: 'asc', viewMode: 'grid',
  minHp: 0, maxHp: 255,
  minAttack: 0, maxAttack: 255,
  minDefense: 0, maxDefense: 255,
  minSpeed: 0, maxSpeed: 255,
}

// Skeleton card
const SkeletonCard = () => (
  <div className="glass-card p-4 rounded-2xl space-y-3">
    <div className="skeleton h-3 w-16 rounded-full" />
    <div className="skeleton h-28 w-28 mx-auto rounded-xl" />
    <div className="skeleton h-4 w-24 mx-auto rounded-full" />
    <div className="flex justify-center gap-2">
      <div className="skeleton h-5 w-14 rounded-full" />
      <div className="skeleton h-5 w-14 rounded-full" />
    </div>
  </div>
)

const PokedexPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const { ref: sentinelRef, inView } = useInView({ threshold: 0 })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = usePokemonInfinite(24)

  // Fetch full pokemon data for each entry
  const allEntries = data?.pages.flatMap((p) => p.results) ?? []

  const { data: pokemonDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['pokedex-details', allEntries.map((e) => e.name).join(',')],
    queryFn: async () => {
      const results = await Promise.allSettled(
        allEntries.map((e) => fetchPokemon(e.name))
      )
      return results.flatMap((r) => r.status === 'fulfilled' ? [r.value] : [])
    },
    enabled: allEntries.length > 0,
    staleTime: 1000 * 60 * 10,
  })

  // Infinite scroll trigger
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Filter & sort
  const filtered = (pokemonDetails ?? []).filter((p) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!p.name.includes(q) && !String(p.id).includes(q)) return false
    }
    if (filters.types.length > 0 && !p.types.some((t) => filters.types.includes(t.type.name))) return false
    if (filters.generations.length > 0) {
      const gen = GENERATIONS.find((g) => p.id >= g.range[0] && p.id <= g.range[1])
      if (!gen || !filters.generations.includes(gen.id)) return false
    }

    // Legendary / Mythical / Baby check
    const isLegendary = REGIONS.some((r) => r.legendary.includes(p.name.toLowerCase()))
    if (filters.legendary === true && !isLegendary) return false

    const babyIds = [172, 173, 174, 175, 236, 238, 239, 240, 298, 360, 406, 433, 438, 439, 440, 446, 447, 458, 848]
    if (filters.baby === true && !babyIds.includes(p.id)) return false

    const mythicalNames = ['mew', 'celebi', 'jirachi', 'deoxys', 'phione', 'manaphy', 'darkrai', 'shaymin', 'arceus', 'victini', 'keldeo', 'meloetta', 'genesect', 'diancie', 'hoopa', 'volcanion', 'magearna', 'marshadow', 'zeraora', 'meltan', 'melmetal', 'zarude']
    const isMythical = mythicalNames.includes(p.name.toLowerCase())
    if (filters.mythical === true && !isMythical) return false

    // Stats filtering
    const hp = p.stats.find((s) => s.stat.name === 'hp')?.base_stat ?? 0
    const atk = p.stats.find((s) => s.stat.name === 'attack')?.base_stat ?? 0
    const def = p.stats.find((s) => s.stat.name === 'defense')?.base_stat ?? 0
    const spd = p.stats.find((s) => s.stat.name === 'speed')?.base_stat ?? 0

    if (filters.minHp !== undefined && hp < filters.minHp) return false
    if (filters.maxHp !== undefined && hp > filters.maxHp) return false
    if (filters.minAttack !== undefined && atk < filters.minAttack) return false
    if (filters.maxAttack !== undefined && atk > filters.maxAttack) return false
    if (filters.minDefense !== undefined && def < filters.minDefense) return false
    if (filters.maxDefense !== undefined && def > filters.maxDefense) return false
    if (filters.minSpeed !== undefined && spd < filters.minSpeed) return false
    if (filters.maxSpeed !== undefined && spd > filters.maxSpeed) return false

    return true
  }).sort((a, b) => {
    let cmp = 0
    if (filters.sortBy === 'id') cmp = a.id - b.id
    else if (filters.sortBy === 'name') cmp = a.name.localeCompare(b.name)
    else if (filters.sortBy === 'height') cmp = a.height - b.height
    else if (filters.sortBy === 'weight') cmp = a.weight - b.weight
    else if (filters.sortBy === 'base_experience') cmp = a.base_experience - b.base_experience
    else if (filters.sortBy === 'stat_total') {
      const totalA = a.stats.reduce((s, x) => s + x.base_stat, 0)
      const totalB = b.stats.reduce((s, x) => s + x.base_stat, 0)
      cmp = totalA - totalB
    }
    return filters.sortOrder === 'asc' ? cmp : -cmp
  })

  const toggleType = (t: string) =>
    setFilters((f) => ({ ...f, types: f.types.includes(t) ? f.types.filter((x) => x !== t) : [...f.types, t] }))

  const toggleGen = (g: number) =>
    setFilters((f) => ({ ...f, generations: f.generations.includes(g) ? f.generations.filter((x) => x !== g) : [...f.generations, g] }))

  const activeFilterCount =
    filters.types.length +
    filters.generations.length +
    (filters.legendary === true ? 1 : 0) +
    (filters.mythical === true ? 1 : 0) +
    (filters.baby === true ? 1 : 0) +
    (filters.minHp !== 0 || filters.maxHp !== 255 ? 1 : 0) +
    (filters.minAttack !== 0 || filters.maxAttack !== 255 ? 1 : 0) +
    (filters.minDefense !== 0 || filters.maxDefense !== 255 ? 1 : 0) +
    (filters.minSpeed !== 0 || filters.maxSpeed !== 255 ? 1 : 0)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-black gradient-text mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Pokédex
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {filtered.length > 0 ? `${filtered.length} Pokémon found` : 'Explore all Pokémon'}
        </p>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-0 max-w-xs">
          <SearchBar
            onSearch={(q) => setFilters((f) => ({ ...f, search: q }))}
            placeholder="Search Pokémon..."
          />
        </div>

        {/* Filter button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${showFilters ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'glass border-white/10 hover:border-white/20'}`}
        >
          <FiFilter size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort */}
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-') as [FilterState['sortBy'], FilterState['sortOrder']]
            setFilters((f) => ({ ...f, sortBy, sortOrder }))
          }}
          className="px-4 py-2.5 rounded-xl text-sm font-medium glass border border-white/10 bg-[#0f0f1e]/90 outline-none cursor-pointer"
          style={{ color: 'var(--text-primary)' }}
        >
          <option value="id-asc" className="bg-[#0f0f1e]">Number ↑</option>
          <option value="id-desc" className="bg-[#0f0f1e]">Number ↓</option>
          <option value="name-asc" className="bg-[#0f0f1e]">Name A-Z</option>
          <option value="name-desc" className="bg-[#0f0f1e]">Name Z-A</option>
          <option value="height-desc" className="bg-[#0f0f1e]">Tallest</option>
          <option value="weight-desc" className="bg-[#0f0f1e]">Heaviest</option>
          <option value="base_experience-desc" className="bg-[#0f0f1e]">Highest Base Exp</option>
          <option value="stat_total-desc" className="bg-[#0f0f1e]">Highest Stat Total</option>
        </select>

        {/* View toggle */}
        <div className="flex glass rounded-xl overflow-hidden border border-white/10">
          <button
            onClick={() => setFilters((f) => ({ ...f, viewMode: 'grid' }))}
            className={`p-2.5 transition-colors ${filters.viewMode === 'grid' ? 'bg-indigo-500/30 text-indigo-300' : 'text-gray-400 hover:text-white'}`}
            aria-label="Grid view"
          >
            <FiGrid size={16} />
          </button>
          <button
            onClick={() => setFilters((f) => ({ ...f, viewMode: 'list' }))}
            className={`p-2.5 transition-colors ${filters.viewMode === 'list' ? 'bg-indigo-500/30 text-indigo-300' : 'text-gray-400 hover:text-white'}`}
            aria-label="List view"
          >
            <FiList size={16} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-5 mb-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Filter Pokémon</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <FiX size={12} /> Clear all
                </button>
              )}
            </div>

            {/* Type filter */}
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Type</div>
              <div className="flex flex-wrap gap-2">
                {ALL_TYPES.map((t) => (
                  <motion.button
                    key={t}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => toggleType(t)}
                    className={`transition-all rounded-full border ${filters.types.includes(t) ? 'opacity-100 scale-105' : 'opacity-60'}`}
                  >
                    <TypeBadge type={t} size="sm" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Generation filter */}
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Generation</div>
              <div className="flex flex-wrap gap-2">
                {GENERATIONS.map((g) => (
                  <motion.button
                    key={g.id}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => toggleGen(g.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filters.generations.includes(g.id) ? 'bg-indigo-500/30 border-indigo-500/60 text-indigo-300' : 'glass border-white/10 text-gray-400 hover:text-white'}`}
                  >
                    Gen {g.id} · {g.region}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Stat Range Filters & Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-white/5">
              {/* Stat Sliders */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Stats Range</div>

                {[
                  { key: 'Hp', label: 'HP' },
                  { key: 'Attack', label: 'Attack' },
                  { key: 'Defense', label: 'Defense' },
                  { key: 'Speed', label: 'Speed' },
                ].map(({ key, label }) => {
                  const minKey = `min${key}` as keyof FilterState
                  const maxKey = `max${key}` as keyof FilterState
                  const minVal = filters[minKey] as number ?? 0
                  const maxVal = filters[maxKey] as number ?? 255

                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-xs font-mono w-16">{label}</span>
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={minVal}
                        onChange={(e) => setFilters(f => ({ ...f, [minKey]: parseInt(e.target.value) }))}
                        className="flex-1 accent-indigo-500 h-1 rounded bg-white/10 cursor-pointer"
                      />
                      <span className="text-xs font-mono w-24 text-right">
                        {minVal} - 255
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Toggles & Custom Sort */}
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Classification</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'legendary', label: 'Legendary' },
                    { key: 'mythical', label: 'Mythical' },
                    { key: 'baby', label: 'Baby' },
                  ].map(({ key, label }) => {
                    const isChecked = filters[key as keyof FilterState] === true
                    return (
                      <button
                        key={key}
                        onClick={() => setFilters(f => ({
                          ...f,
                          [key]: f[key as keyof FilterState] === true ? null : true
                        }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${isChecked ? 'bg-indigo-500/30 border-indigo-500/60 text-indigo-300' : 'glass border-white/10 text-gray-400 hover:text-white'}`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid / List */}
      {isLoading || detailsLoading ? (
        <div className="pokemon-grid">
          {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {filters.viewMode === 'grid' ? (
            <div className="pokemon-grid">
              <AnimatePresence>
                {filtered.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.5) }}
                  >
                    <PokemonCard
                      id={p.id}
                      name={p.name}
                      types={p.types.map((t) => t.type.name)}
                      height={p.height}
                      weight={p.weight}
                      viewMode="grid"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p, i) => (
                <PokemonCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  types={p.types.map((t) => t.type.name)}
                  viewMode="list"
                />
              ))}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-20 flex items-center justify-center">
            {isFetchingNextPage && (
              <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                <div className="pokeball-spinner" style={{ width: 30, height: 30 }} />
                Loading more...
              </div>
            )}
            {!hasNextPage && filtered.length > 0 && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>All Pokémon loaded ✓</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default PokedexPage
