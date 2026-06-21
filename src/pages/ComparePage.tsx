import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiX, FiSearch } from 'react-icons/fi'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { useMultiplePokemon } from '../hooks/usePokeAPI'
import { useUIStore } from '../store'
import { useAllPokemonNames } from '../hooks/usePokeAPI'
import { fetchPokemon, getPokemonArtwork } from '../api/pokemon'
import { useQuery } from '@tanstack/react-query'
import TypeBadge from '../components/ui/TypeBadge'
import { TYPE_COLORS, STAT_LABELS } from '../utils/constants'
import { capitalize, formatHeight, formatWeight, extractIdFromUrl } from '../utils/helpers'
import { soundService } from '../services/sound'

const MAX_COMPARE = 4
const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b']

const ComparePage: React.FC = () => {
  const { compareList, addToCompare, removeFromCompare, clearCompare, searchHistory, addSearchHistory, clearSearchHistory } = useUIStore()
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const { data: allNames } = useAllPokemonNames()

  // Suggestions
  const suggestions = search.length >= 1
    ? (() => {
        const q = search.toLowerCase().trim()
        const starts = (allNames ?? []).filter((p) => p.name.toLowerCase().startsWith(q))
        const contains = (allNames ?? []).filter((p) => !p.name.toLowerCase().startsWith(q) && p.name.toLowerCase().includes(q))
        return [...starts, ...contains].slice(0, 8)
      })()
    : (allNames ?? []).slice(0, 8)

  const recentPokemon = !search && searchHistory.length > 0
    ? searchHistory
        .map((name) => (allNames ?? []).find((p) => p.name === name))
        .filter((p): p is { name: string; url: string } => !!p)
        .slice(0, 4)
    : []

  // Fetch all compare Pokémon
  const { data: pokemonList, isLoading } = useQuery({
    queryKey: ['compare-pokemon', compareList],
    queryFn: () => Promise.all(compareList.map((id) => fetchPokemon(id))),
    enabled: compareList.length > 0,
    staleTime: 1000 * 60 * 30,
  })

  const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed']

  // Radar data
  const radarData = statNames.map((stat) => ({
    stat: STAT_LABELS[stat] ?? stat,
    ...(pokemonList ?? []).reduce((acc, p, i) => {
      const s = p.stats.find((s) => s.stat.name === stat)
      acc[p.name] = s?.base_stat ?? 0
      return acc
    }, {} as Record<string, number>),
  }))

  // Bar data
  const barData = statNames.map((stat) => ({
    name: STAT_LABELS[stat] ?? stat,
    ...(pokemonList ?? []).reduce((acc, p) => {
      const s = p.stats.find((s) => s.stat.name === stat)
      acc[capitalize(p.name)] = s?.base_stat ?? 0
      return acc
    }, {} as Record<string, number>),
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-black gradient-text mb-1" style={{ fontFamily: 'var(--font-display)' }}>Compare</h1>
      </motion.div>

      {/* Slots */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: MAX_COMPARE }).map((_, i) => {
          const p = pokemonList?.[i]
          const id = compareList[i]
          const color = COLORS[i]

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-4 rounded-2xl text-center relative min-h-[180px] flex flex-col items-center justify-center"
              style={{ border: p ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.08)' }}
            >
              {isLoading && id ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="pokeball-spinner w-8 h-8" />
                  <span className="text-[10px] text-gray-500 font-mono">Loading...</span>
                </div>
              ) : p ? (
                <>
                  <button
                    onClick={() => { removeFromCompare(id); soundService.play('click') }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full glass flex items-center justify-center hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                  >
                    <FiX size={12} />
                  </button>
                  <div className="w-2 h-2 rounded-full mb-2" style={{ background: color }} />
                  <img src={getPokemonArtwork(p.id)} alt={p.name} className="w-20 h-20 object-contain" style={{ filter: `drop-shadow(0 4px 12px ${color}60)` }} />
                  <div className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>#{String(p.id).padStart(4,'0')}</div>
                  <div className="font-bold text-sm capitalize mt-0.5">{capitalize(p.name)}</div>
                  <div className="flex gap-1 mt-2 flex-wrap justify-center">
                    {p.types.map((t) => <TypeBadge key={t.type.name} type={t.type.name} size="sm" />)}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => { setShowSearch(true); soundService.play('click') }}
                  className="flex flex-col items-center gap-2 text-gray-500 hover:text-white transition-colors w-full h-full justify-center"
                >
                  <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-current flex items-center justify-center">
                    <FiPlus size={20} />
                  </div>
                  <span className="text-xs">Add Pokémon</span>
                </button>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Add Pokémon search */}
      <AnimatePresence>
        {showSearch && compareList.length < MAX_COMPARE && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4 rounded-2xl mb-8 overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 flex items-center glass rounded-xl border border-white/10 transition-all focus-within:border-indigo-500/60 focus-within:shadow-lg focus-within:shadow-indigo-500/10">
                <div className="pl-4 flex items-center justify-center text-gray-400 pointer-events-none flex-shrink-0">
                  <FiSearch size={16} />
                </div>
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type Pokémon name..."
                  className="flex-1 bg-transparent pl-3 pr-4 py-2.5 outline-none text-sm animate-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              <button onClick={() => { setShowSearch(false); setSearch('') }} className="text-gray-400 hover:text-white"><FiX /></button>
            </div>

            {/* Recent Searches */}
            {!search && recentPokemon.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Searches</span>
                  <button onClick={clearSearchHistory} className="text-xs text-indigo-400 hover:text-indigo-300">Clear</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {recentPokemon.map((p) => {
                    const id = extractIdFromUrl(p.url)
                    const already = compareList.includes(id)
                    return (
                      <button
                        key={`recent-${p.name}`}
                        disabled={already}
                        onClick={() => {
                          addToCompare(id)
                          addSearchHistory(p.name)
                          soundService.play('success')
                          setSearch('')
                          setShowSearch(false)
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs glass transition-all text-left ${already ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/8 cursor-pointer'}`}
                      >
                        <img src={getPokemonArtwork(id)} alt="" className="w-8 h-8 object-contain flex-shrink-0" />
                        <span className="capitalize truncate font-medium">{capitalize(p.name)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Live suggestions */}
            {suggestions.length > 0 && (
              <div>
                {!search && (
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                    Suggested Pokémon
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {suggestions.map((p) => {
                    const id = extractIdFromUrl(p.url)
                    const already = compareList.includes(id)
                    return (
                      <button
                        key={p.name}
                        disabled={already}
                        onClick={() => {
                          addToCompare(id)
                          addSearchHistory(p.name)
                          soundService.play('success')
                          setSearch('')
                          setShowSearch(false)
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs glass transition-all text-left ${already ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/8 cursor-pointer'}`}
                      >
                        <img src={getPokemonArtwork(id)} alt="" className="w-8 h-8 object-contain flex-shrink-0" />
                        <span className="capitalize truncate font-medium">{capitalize(p.name)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison charts */}
      {pokemonList && pokemonList.length >= 2 && (
        <div className="space-y-6">
          {/* Radar */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl">
            <h2 className="font-bold text-lg mb-4">Stat Radar</h2>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: 'rgba(240,240,255,0.6)', fontSize: 11 }} />
                {pokemonList.map((p, i) => (
                  <Radar
                    key={p.name}
                    name={capitalize(p.name)}
                    dataKey={p.name}
                    stroke={COLORS[i]}
                    fill={COLORS[i]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend formatter={(v) => capitalize(v as string)} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar chart */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl">
            <h2 className="font-bold text-lg mb-4">Stat Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ left: -10 }}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(240,240,255,0.6)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(240,240,255,0.4)', fontSize: 10 }} domain={[0, 255]} />
                <Tooltip
                  contentStyle={{ background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f0f0ff' }}
                />
                <Legend />
                {pokemonList.map((p, i) => (
                  <Bar key={p.name} dataKey={capitalize(p.name)} fill={COLORS[i]} radius={[4, 4, 0, 0]} maxBarSize={40} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Comparison table */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h2 className="font-bold text-lg">Side-by-Side</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Attribute</th>
                    {pokemonList.map((p, i) => (
                      <th key={p.name} className="p-4 text-center">
                        <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ background: COLORS[i] }} />
                        <span className="capitalize font-bold text-xs">{capitalize(p.name)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Types', render: (p: typeof pokemonList[0]) => <div className="flex gap-1 justify-center flex-wrap">{p.types.map((t) => <TypeBadge key={t.type.name} type={t.type.name} size="sm" />)}</div> },
                    { label: 'Height', render: (p: typeof pokemonList[0]) => `${(p.height/10).toFixed(1)}m` },
                    { label: 'Weight', render: (p: typeof pokemonList[0]) => `${(p.weight/10).toFixed(1)}kg` },
                    ...statNames.map((s) => ({
                      label: STAT_LABELS[s] ?? s,
                      render: (p: typeof pokemonList[0]) => {
                        const val = p.stats.find((x) => x.stat.name === s)?.base_stat ?? 0
                        const max = Math.max(...pokemonList.map((pp) => pp.stats.find((x) => x.stat.name === s)?.base_stat ?? 0))
                        return (
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold">{val}</span>
                            <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full rounded-full bg-indigo-400" style={{ width: `${(val/max)*100}%` }} />
                            </div>
                          </div>
                        )
                      },
                    })),
                    { label: 'Total', render: (p: typeof pokemonList[0]) => <span className="font-black gradient-text">{p.stats.reduce((a, s) => a + s.base_stat, 0)}</span> },
                  ].map(({ label, render }) => (
                    <tr key={label} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="p-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</td>
                      {pokemonList.map((p) => (
                        <td key={p.name} className="p-4 text-center text-sm">
                          {typeof render(p) === 'string' ? render(p) : render(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {compareList.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="text-6xl mb-4">⚔️</div>
          <h3 className="text-xl font-bold mb-2">No Pokémon selected</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Click the + slots above to add Pokémon to compare</p>
          <button
            onClick={() => setShowSearch(true)}
            className="px-6 py-3 rounded-2xl font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}
          >
            Add Pokémon
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default ComparePage
