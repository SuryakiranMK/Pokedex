import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { fetchType, fetchPokemon, getPokemonArtwork } from '../api/pokemon'
import { TYPE_COLORS, TYPE_EMOJI } from '../utils/constants'
import { capitalize } from '../utils/helpers'
import TypeBadge from '../components/ui/TypeBadge'
import PokemonCard from '../components/pokemon/PokemonCard'
import { soundService } from '../services/sound'

const ALL_TYPES = Object.keys(TYPE_COLORS)

// Full 18×18 type chart: damage multiplier of [attackType][defendType]
const TYPE_CHART: Record<string, Record<string, number>> = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

const getMultiplier = (atk: string, def: string): number => TYPE_CHART[atk]?.[def] ?? 1

const cellColor = (m: number) => {
  if (m === 0)   return { bg: '#1a1a2e', text: '#555' }
  if (m === 0.5) return { bg: 'rgba(239,68,68,0.15)',  text: '#f87171' }
  if (m === 2)   return { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' }
  return { bg: 'rgba(255,255,255,0.04)', text: 'rgba(240,240,255,0.4)' }
}

const TypesPage: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'chart' | 'pokemon'>('chart')

  // Fetch type data for selected type
  const { data: typeData } = useQuery({
    queryKey: ['type-detail', selected],
    queryFn: () => fetchType(selected!),
    enabled: !!selected,
    staleTime: 1000 * 60 * 60,
  })

  // Fetch sample Pokémon of selected type
  const pokemonOfType = typeData?.pokemon.slice(0, 12).map((p) => p.pokemon) ?? []
  const { data: typePokemon, isLoading: loadingTypePokemon } = useQuery({
    queryKey: ['type-pokemon', selected],
    queryFn: () => Promise.all(pokemonOfType.map((p) => fetchPokemon(p.name))),
    enabled: pokemonOfType.length > 0,
    staleTime: 1000 * 60 * 30,
  })

  const typeColor = selected ? TYPE_COLORS[selected] : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-black gradient-text mb-1" style={{ fontFamily: 'var(--font-display)' }}>Type Chart</h1>
      </motion.div>

      {/* Type selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {ALL_TYPES.map((t) => (
          <motion.button
            key={t}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelected(selected === t ? null : t)
              soundService.play('click')
            }}
            className={`transition-all ${selected === t ? 'ring-2 ring-white/40 scale-105' : 'opacity-80 hover:opacity-100'}`}
          >
            <TypeBadge type={t} size="md" />
          </motion.button>
        ))}
      </div>

      {/* Selected type panel */}
      <AnimatePresence>
        {selected && typeData && typeColor && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card rounded-2xl overflow-hidden mb-8"
            style={{ border: `1px solid ${typeColor.bg}40` }}
          >
            <div className="p-5 flex items-center justify-between flex-wrap gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{TYPE_EMOJI[selected]}</span>
                <div>
                  <h2 className="text-2xl font-black capitalize" style={{ fontFamily: 'var(--font-display)', color: typeColor.bg }}>
                    {capitalize(selected)} Type
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {typeData.pokemon.length} Pokémon · Gen {typeData.generation.name.replace('generation-', '')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {(['chart', 'pokemon'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${viewMode === m ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    {m === 'chart' ? '📊 Matchups' : '🔴 Pokémon'}
                  </button>
                ))}
              </div>
            </div>

            {viewMode === 'chart' && (
              <div className="p-5 grid md:grid-cols-2 gap-6">
                {/* Offense */}
                <div>
                  <h3 className="font-bold text-sm mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    ⚔️ Attacking from {capitalize(selected)}
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-green-400 font-semibold mb-1.5">Super Effective (×2)</div>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_TYPES.filter((t) => getMultiplier(selected, t) === 2).map((t) => <TypeBadge key={t} type={t} size="sm" />)}
                        {ALL_TYPES.filter((t) => getMultiplier(selected, t) === 2).length === 0 && <span className="text-xs text-gray-500">None</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-red-400 font-semibold mb-1.5 mt-2">Not Very Effective (×½)</div>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_TYPES.filter((t) => getMultiplier(selected, t) === 0.5).map((t) => <TypeBadge key={t} type={t} size="sm" />)}
                        {ALL_TYPES.filter((t) => getMultiplier(selected, t) === 0.5).length === 0 && <span className="text-xs text-gray-500">None</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-semibold mb-1.5 mt-2">No Effect (×0)</div>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_TYPES.filter((t) => getMultiplier(selected, t) === 0).map((t) => <TypeBadge key={t} type={t} size="sm" />)}
                        {ALL_TYPES.filter((t) => getMultiplier(selected, t) === 0).length === 0 && <span className="text-xs text-gray-500">None</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Defense */}
                <div>
                  <h3 className="font-bold text-sm mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    🛡️ Defending as {capitalize(selected)}
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-red-400 font-semibold mb-1.5">Weak To (×2)</div>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_TYPES.filter((t) => getMultiplier(t, selected) === 2).map((t) => <TypeBadge key={t} type={t} size="sm" />)}
                        {ALL_TYPES.filter((t) => getMultiplier(t, selected) === 2).length === 0 && <span className="text-xs text-gray-500">None</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-green-400 font-semibold mb-1.5 mt-2">Resistant To (×½)</div>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_TYPES.filter((t) => getMultiplier(t, selected) === 0.5).map((t) => <TypeBadge key={t} type={t} size="sm" />)}
                        {ALL_TYPES.filter((t) => getMultiplier(t, selected) === 0.5).length === 0 && <span className="text-xs text-gray-500">None</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-semibold mb-1.5 mt-2">Immune To (×0)</div>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_TYPES.filter((t) => getMultiplier(t, selected) === 0).map((t) => <TypeBadge key={t} type={t} size="sm" />)}
                        {ALL_TYPES.filter((t) => getMultiplier(t, selected) === 0).length === 0 && <span className="text-xs text-gray-500">None</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'pokemon' && (
              <div className="p-5">
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  Showing 12 of {typeData.pokemon.length} {capitalize(selected)}-type Pokémon
                </p>
                {loadingTypePokemon ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="pokeball-spinner w-10 h-10" />
                  </div>
                ) : (
                  <div className="pokemon-grid">
                    {typePokemon?.map((p) => (
                      <PokemonCard
                        key={p.id}
                        id={p.id}
                        name={p.name}
                        types={p.types.map((t) => t.type.name)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full 18×18 type chart */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-white/5">
          <h2 className="font-bold">Full Type Effectiveness Chart</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Rows = Attacking type · Columns = Defending type
            <span className="ml-3 text-green-400">■ ×2</span>
            <span className="ml-2 text-red-400">■ ×½</span>
            <span className="ml-2 text-gray-500">■ ×0</span>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th className="p-1.5 text-left sticky left-0 z-10" style={{ background: 'var(--bg-secondary)', minWidth: 64 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>ATK ↓ DEF →</span>
                </th>
                {ALL_TYPES.map((t) => (
                  <th key={t} className="p-1" style={{ minWidth: 32 }}>
                    <div title={capitalize(t)} className="w-6 h-6 rounded-full mx-auto flex items-center justify-center text-xs"
                      style={{ background: TYPE_COLORS[t]?.bg, color: TYPE_COLORS[t]?.text, fontSize: '0.6rem', fontWeight: 700 }}>
                      {t.slice(0, 2).toUpperCase()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_TYPES.map((atk) => (
                <tr key={atk} className={selected === atk ? 'ring-1 ring-white/20' : ''}>
                  <td
                    className="p-1.5 font-bold sticky left-0 z-10 cursor-pointer"
                    style={{ background: selected === atk ? `${TYPE_COLORS[atk]?.bg}30` : 'var(--bg-secondary)', minWidth: 64 }}
                    onClick={() => { setSelected(selected === atk ? null : atk); soundService.play('click') }}
                  >
                    <div className="flex items-center gap-1">
                      <span>{TYPE_EMOJI[atk]}</span>
                      <span style={{ color: TYPE_COLORS[atk]?.bg, fontSize: '0.65rem' }}>{capitalize(atk)}</span>
                    </div>
                  </td>
                  {ALL_TYPES.map((def) => {
                    const m = getMultiplier(atk, def)
                    const { bg, text } = cellColor(m)
                    return (
                      <td key={def} className="p-0.5 text-center" title={`${capitalize(atk)} → ${capitalize(def)}: ×${m}`}>
                        <div
                          className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold mx-auto"
                          style={{ background: bg, color: text, fontSize: '0.6rem' }}
                        >
                          {m === 1 ? '' : m === 0 ? '0' : m === 2 ? '2' : '½'}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default TypesPage
