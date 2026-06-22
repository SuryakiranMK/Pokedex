import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiX, FiSearch, FiSave, FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { fetchPokemon, getPokemonArtwork, fetchType, getPokemonSprite } from '../api/pokemon'
import { useTeamStore, useUIStore, useModalStore } from '../store'
import { useAllPokemonNames } from '../hooks/usePokeAPI'
import TypeBadge from '../components/ui/TypeBadge'
import { STAT_LABELS, TYPE_EFFECTIVENESS, REGIONS, TYPE_COLORS, GENERATIONS } from '../utils/constants'
import { capitalize, extractIdFromUrl } from '../utils/helpers'
import { soundService } from '../services/sound'
import type { TeamPokemon } from '../types'

// Import Pokéball assets for slot icons
import pokeBallImg from '../assets/poke-ball.png'
import greatBallImg from '../assets/great-ball.png'
import ultraBallImg from '../assets/ultra-ball.png'
import masterBallImg from '../assets/master-ball.png'
import premierBallImg from '../assets/premier-ball.png'
import luxuryBallImg from '../assets/luxury-ball.png'

const SLOT_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444']

const BALL_IMAGES = [
  pokeBallImg,
  greatBallImg,
  ultraBallImg,
  masterBallImg,
  premierBallImg,
  luxuryBallImg,
]

const TeamBuilderPage: React.FC = () => {
  const {
    currentTeam,
    teams,
    teamSize,
    addToTeam,
    removeFromTeam,
    saveTeam,
    loadTeam,
    deleteTeam,
    renameTeam,
    clearCurrentTeam,
    setTeamSize,
  } = useTeamStore()

  const { searchHistory, addSearchHistory, clearSearchHistory } = useUIStore()
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  // Randomizer States
  const [showRandomizer, setShowRandomizer] = useState(false)
  const [randomRegion, setRandomRegion] = useState('all')
  const [randomType, setRandomType] = useState('all')
  const [generating, setGenerating] = useState(false)

  const { data: allNames } = useAllPokemonNames()

  // Suggestions for search
  const suggestions = search.length >= 1
    ? (() => {
      const q = search.toLowerCase().trim()
      const starts = (allNames ?? []).filter((p) => p.name.toLowerCase().startsWith(q))
      const contains = (allNames ?? []).filter((p) => !p.name.toLowerCase().startsWith(q) && p.name.toLowerCase().includes(q))
      return [...starts, ...contains].slice(0, 12)
    })()
    : (allNames ?? []).slice(0, 12)

  const recentPokemon = !search && searchHistory.length > 0
    ? searchHistory
      .map((name) => (allNames ?? []).find((p) => p.name === name))
      .filter((p): p is { name: string; url: string } => !!p)
      .slice(0, 4)
    : []

  // Average radar stats
  const radarData = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].map((stat) => ({
    stat: STAT_LABELS[stat] ?? stat,
    avg: currentTeam.length > 0
      ? Math.round(currentTeam.reduce((sum, p) => sum + (p.stats[stat] ?? 0), 0) / currentTeam.length)
      : 0,
  }))

  const addPokemon = async (name: string, id: number) => {
    if (currentTeam.length >= teamSize) {
      useModalStore.getState().openModal(
        'Team is Full',
        `Your current battle team already contains the maximum limit of ${teamSize} Pokémon. Please remove an existing member from the Team Builder before adding another.`,
        'warning'
      )
      return
    }
    try {
      addSearchHistory(name)
      const data = await fetchPokemon(id)
      const teamPokemon: TeamPokemon = {
        id: data.id,
        name: data.name,
        types: data.types.map((t) => t.type.name),
        artwork: getPokemonArtwork(data.id),
        stats: data.stats.reduce((acc, s) => ({ ...acc, [s.stat.name]: s.base_stat }), {}),
      }
      addToTeam(teamPokemon)
      soundService.play('success')
      setSearch('')
      setShowSearch(false)
    } catch (e) {
      soundService.play('error')
    }
  }

  // Type effectiveness calculations
  const getDamageMultiplier = (attackingType: string, defendingType: string): number => {
    const effectiveness = TYPE_EFFECTIVENESS[attackingType]
    if (!effectiveness) return 1
    if (effectiveness.immune.includes(defendingType)) return 0
    if (effectiveness.superEffective.includes(defendingType)) return 2
    if (effectiveness.notEffective.includes(defendingType)) return 0.5
    return 1
  }

  const getPokemonDamageMultiplier = (attackingType: string, pokemonTypes: string[]): number => {
    return pokemonTypes.reduce((mult, type) => mult * getDamageMultiplier(attackingType, type), 1)
  }

  // Calculate team analysis details
  const teamAnalysis = (() => {
    if (currentTeam.length === 0) {
      return {
        weaknesses: [] as { type: string; weakCount: number; resistCount: number }[],
        strengths: [] as { type: string; weakCount: number; resistCount: number }[],
        excels: 'Add Pokémon to analyze team strengths.',
        lacking: 'Add Pokémon to identify gaps.',
        counters: [] as string[],
        suggestion: 'Add Pokémon to your team to begin analysis.'
      }
    }

    const ALL_TYPES = [
      'normal', 'fire', 'water', 'electric', 'grass', 'ice',
      'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
      'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
    ]

    const typeStats = ALL_TYPES.map((type) => {
      let weakCount = 0
      let resistCount = 0
      let immuneCount = 0

      currentTeam.forEach((p) => {
        const mult = getPokemonDamageMultiplier(type, p.types)
        if (mult >= 2) weakCount++
        if (mult === 0.5 || mult === 0.25) resistCount++
        if (mult === 0) immuneCount++
      })

      return {
        type,
        weakCount,
        resistCount: resistCount + immuneCount,
        net: weakCount - (resistCount + immuneCount)
      }
    })

    const weaknesses = typeStats
      .filter((s) => s.net > 0 || (s.weakCount >= 2 && s.resistCount === 0))
      .map((s) => ({ type: s.type, weakCount: s.weakCount, resistCount: s.resistCount }))

    const strengths = typeStats
      .filter((s) => s.net < 0 && s.resistCount >= 2)
      .map((s) => ({ type: s.type, weakCount: s.weakCount, resistCount: s.resistCount }))

    // Analyse stats specialization
    const statSums = { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 }
    currentTeam.forEach((p) => {
      Object.keys(statSums).forEach((key) => {
        statSums[key as keyof typeof statSums] += p.stats[key] ?? 0
      })
    })
    const statAverages = Object.entries(statSums).reduce((acc, [key, val]) => {
      acc[key] = Math.round(val / currentTeam.length)
      return acc
    }, {} as Record<string, number>)

    const highestStat = Object.entries(statAverages).sort((a, b) => b[1] - a[1])[0]
    let excels = ''
    let lacking = ''

    if (highestStat[0] === 'speed') {
      excels = 'High Speed and first-strike potential.'
      lacking = 'Defensive bulk and survivability.'
    } else if (highestStat[0] === 'defense' || highestStat[0] === 'special-defense' || highestStat[0] === 'hp') {
      excels = 'Strong defensive bulk and stall potential.'
      lacking = 'Raw offensive pressure.'
    } else {
      excels = 'High raw offensive power and damage potential.'
      lacking = 'Speed and initiative.'
    }

    // Type offensive coverage
    const coveredOffense = ALL_TYPES.filter((defendingType) =>
      currentTeam.some((p) =>
        p.types.some((t) => TYPE_EFFECTIVENESS[t]?.superEffective.includes(defendingType))
      )
    )

    if (coveredOffense.length > 0) {
      excels += ` Good coverage against: ${coveredOffense.slice(0, 3).map(t => capitalize(t)).join(', ')}.`
    }

    const missingOffense = ALL_TYPES.filter((t) => !coveredOffense.includes(t))
    if (missingOffense.length > 0) {
      lacking += ` Lacks coverage against: ${missingOffense.slice(0, 3).map(t => capitalize(t)).join(', ')}.`
    }

    // Threat types
    const counters = typeStats
      .sort((a, b) => b.weakCount - a.weakCount)
      .slice(0, 3)
      .filter((s) => s.weakCount > 0)
      .map((s) => `${s.type.charAt(0).toUpperCase() + s.type.slice(1)} (highly effective against ${s.weakCount} member${s.weakCount > 1 ? 's' : ''})`)

    // Suggestion logic
    let suggestion = ''
    if (weaknesses.length > 0) {
      const topWeakness = weaknesses.sort((a, b) => b.weakCount - a.weakCount)[0].type
      // Recommend type that resists/immune topWeakness
      let recommendation = 'Steel'
      if (topWeakness === 'ground') recommendation = 'Flying or Grass'
      else if (topWeakness === 'fire') recommendation = 'Water, Dragon, or Fire'
      else if (topWeakness === 'water') recommendation = 'Grass or Dragon'
      else if (topWeakness === 'electric') recommendation = 'Ground or Grass'
      else if (topWeakness === 'grass') recommendation = 'Fire, Poison, Flying, Bug, Dragon, or Steel'
      else if (topWeakness === 'ice') recommendation = 'Fire, Water, Ice, or Steel'
      else if (topWeakness === 'fighting') recommendation = 'Poison, Flying, Psychic, Bug, Ghost, or Fairy'
      else if (topWeakness === 'poison') recommendation = 'Poison, Ground, Rock, Ghost, or Steel'
      else if (topWeakness === 'flying') recommendation = 'Electric, Rock, or Steel'
      else if (topWeakness === 'psychic') recommendation = 'Psychic, Steel, or Dark'
      else if (topWeakness === 'bug') recommendation = 'Fire, Fighting, Poison, Flying, Ghost, Steel, or Fairy'
      else if (topWeakness === 'rock') recommendation = 'Fighting, Ground, or Steel'
      else if (topWeakness === 'ghost') recommendation = 'Dark or Normal'
      else if (topWeakness === 'dragon') recommendation = 'Steel or Fairy'
      else if (topWeakness === 'dark') recommendation = 'Fighting, Dark, or Fairy'
      else if (topWeakness === 'steel') recommendation = 'Fire, Water, Electric, or Steel'
      else if (topWeakness === 'fairy') recommendation = 'Fire, Poison, or Steel'

      suggestion = `Consider adding a ${recommendation}-type Pokémon to cover your top weakness against ${topWeakness.toUpperCase()}-type attacks.`
    } else if (currentTeam.length < teamSize) {
      suggestion = `Add more Pokémon (up to ${teamSize}) to balance your team's defense and coverage.`
    } else {
      suggestion = 'Your team has excellent defensive balance! Try testing it out in the Battle Simulator.'
    }

    return { weaknesses, strengths, excels, lacking, counters, suggestion }
  })()

  // Randomizer generator trigger
  const handleGenerateRandomTeam = async () => {
    if (!allNames || allNames.length === 0) return
    setGenerating(true)
    soundService.play('click')

    try {
      let candidates = [...allNames]

      // Filter by Region
      if (randomRegion !== 'all') {
        const gen = GENERATIONS.find((g) => g.region.toLowerCase() === randomRegion.toLowerCase())
        if (gen) {
          candidates = candidates.filter((p) => {
            const id = extractIdFromUrl(p.url)
            return id >= gen.range[0] && id <= gen.range[1]
          })
        }
      }

      // Filter by Type
      if (randomType !== 'all') {
        const typeData = await fetchType(randomType)
        const typePokemonNames = new Set(typeData.pokemon.map((p) => p.pokemon.name))
        candidates = candidates.filter((p) => typePokemonNames.has(p.name))
      }

      if (candidates.length === 0) {
        useModalStore.getState().openModal(
          'Generation Failed',
          `No Pokémon were found matching the selected Region (${capitalize(randomRegion)}) and Type (${capitalize(randomType)}). Please adjust your randomized parameters and try again.`,
          'error'
        )
        setGenerating(false)
        return
      }

      // Pick random candidates up to teamSize
      const shuffled = candidates.sort(() => 0.5 - Math.random())
      const selectedCandidates = shuffled.slice(0, teamSize)

      // Fetch full details of each candidate
      const fetchedPokemonList = await Promise.all(
        selectedCandidates.map(async (candidate) => {
          const id = extractIdFromUrl(candidate.url)
          const data = await fetchPokemon(id)
          return {
            id: data.id,
            name: data.name,
            types: data.types.map((t) => t.type.name),
            artwork: getPokemonArtwork(data.id),
            stats: data.stats.reduce((acc, s) => ({ ...acc, [s.stat.name]: s.base_stat }), {}),
          } as TeamPokemon
        })
      )

      // Clear team and populate
      clearCurrentTeam()
      fetchedPokemonList.forEach((p) => addToTeam(p))
      soundService.play('success')
      setShowRandomizer(false)
    } catch (err) {
      soundService.play('error')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header with Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5"
      >
        <div>
          <h1 className="text-4xl font-black gradient-text mb-1" style={{ fontFamily: 'var(--font-display)' }}>Team Builder</h1>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Size Selector pills */}
          <div className="bg-white/5 p-1 rounded-xl flex items-center border border-white/10">
            {([3, 6] as const).map((size) => (
              <button
                key={size}
                onClick={() => { setTeamSize(size); soundService.play('click') }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${teamSize === size ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'text-gray-400 hover:text-white'
                  }`}
              >
                {size} Slots
              </button>
            ))}
          </div>

          {/* Random Team Trigger */}
          <button
            onClick={() => { setShowRandomizer(true); soundService.play('click') }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold glass border border-white/10 hover:border-indigo-500/40 hover:text-white text-indigo-300 transition-all active:scale-95 cursor-pointer"
          >
            🎲 Random Team
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left — Team slots */}
        <div className="lg:col-span-2 space-y-4">
          {/* Slot grid */}
          <div className={`grid gap-3 ${teamSize === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-3'}`}>
            {Array.from({ length: teamSize }).map((_, i) => {
              const p = currentTeam[i]
              const color = SLOT_COLORS[i] ?? '#6366f1'
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card p-4 rounded-2xl text-center relative flex flex-col justify-between"
                  style={{ minHeight: 165, border: p ? `1px solid ${color}50` : '1px dashed rgba(255,255,255,0.1)' }}
                >
                  {p ? (
                    <>
                      <button
                        onClick={() => { removeFromTeam(p.id); soundService.play('click') }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full glass flex items-center justify-center hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all z-10"
                      >
                        <FiX size={11} />
                      </button>
                      <motion.div
                        className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full"
                        style={{ background: color }}
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <img src={p.artwork} alt={p.name} className="w-20 h-20 mx-auto object-contain flex-shrink-0 float" style={{ filter: `drop-shadow(0 4px 12px ${color}50)` }} />
                      <div>
                        <div className="font-bold text-sm capitalize mt-1 text-gray-100 truncate">{capitalize(p.name)}</div>
                        <div className="flex gap-1 mt-1 justify-center">
                          {p.types.map((t) => <TypeBadge key={t} type={t} size="sm" />)}
                        </div>
                        <div className="text-[10px] mt-1 font-mono text-gray-500">
                          BST: {Object.values(p.stats).reduce((a, b) => a + b, 0)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => { setShowSearch(true); soundService.play('click') }}
                      className="w-full h-full flex flex-col items-center justify-center gap-2.5 text-gray-500 hover:text-white transition-all group min-h-[135px]"
                    >
                      <div className="w-12 h-12 flex items-center justify-center relative group-hover:scale-110 transition-transform">
                        <img
                          src={BALL_IMAGES[i] ?? pokeBallImg}
                          alt=""
                          className="w-10 h-10 object-contain opacity-40 group-hover:opacity-100 transition-opacity"
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
                        />
                      </div>
                      <span className="text-xs font-semibold group-hover:text-indigo-400 transition-colors">Slot {i + 1}</span>
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Search panel */}
          <AnimatePresence>
            {showSearch && currentTeam.length < teamSize && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-4 rounded-2xl overflow-hidden"
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
                      placeholder="Search Pokémon to add..."
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {recentPokemon.map((p) => {
                        const id = extractIdFromUrl(p.url)
                        const inTeam = currentTeam.some((t) => t.id === id)
                        return (
                          <button
                            key={`recent-${p.name}`}
                            disabled={inTeam}
                            onClick={() => addPokemon(p.name, id)}
                            className={`flex items-center gap-2 p-2 rounded-xl text-xs glass transition-all text-left ${inTeam ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/8 cursor-pointer'}`}
                          >
                            <img src={getPokemonSprite(id)} alt="" className="w-8 h-8 object-contain flex-shrink-0" />
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {suggestions.map((p) => {
                        const id = extractIdFromUrl(p.url)
                        const inTeam = currentTeam.some((t) => t.id === id)
                        return (
                          <button
                            key={p.name}
                            disabled={inTeam}
                            onClick={() => addPokemon(p.name, id)}
                            className={`flex items-center gap-2 p-2 rounded-xl text-xs glass transition-all text-left ${inTeam ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/8 cursor-pointer'}`}
                          >
                            <img src={getPokemonSprite(id)} alt="" className="w-8 h-8 object-contain flex-shrink-0" />
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

          {/* Team actions */}
          {currentTeam.length > 0 && (
            <div className="flex gap-4 flex-wrap mt-8 pt-6 border-t border-white/5" style={{ marginTop: '15px' }}>
              <button
                onClick={() => { setShowSaveDialog(true); soundService.play('click') }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-md hover:shadow-indigo-500/10 cursor-pointer text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}
              >
                <FiSave size={14} /> Save Team
              </button>
              <button
                onClick={() => { clearCurrentTeam(); soundService.play('click') }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold glass border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all active:scale-95 cursor-pointer"
              >
                <FiTrash2 size={14} /> Clear Squad
              </button>
            </div>
          )}

          {/* Saved teams */}
          {teams.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 rounded-2xl mt-5">
              <h3 className="font-bold text-sm mb-3">Saved Teams ({teams.length})</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {teams.map((team) => {
                  const bstTotal = team.pokemon.reduce((sum, p) => sum + Object.values(p.stats).reduce((a, b) => a + b, 0), 0)
                  const avgBst = team.pokemon.length > 0 ? Math.round(bstTotal / team.pokemon.length) : 0

                  return (
                    <div key={team.id} className="glass p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
                      {/* Accent glow on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      {editingId === team.id ? (
                        <div className="flex gap-2 relative z-10">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-3 py-1 glass rounded-lg border border-white/10 text-sm outline-none bg-transparent"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { renameTeam(team.id, editName); setEditingId(null); soundService.play('success') }
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                          />
                          <button
                            onClick={() => { renameTeam(team.id, editName); setEditingId(null); soundService.play('success') }}
                            className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-all"
                          >
                            <FiCheck size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between relative z-10">
                          <div>
                            <div className="font-bold text-sm text-gray-200 capitalize flex items-center gap-2">
                              {team.name}
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-gray-400">
                                {team.pokemon.length} Slots
                              </span>
                            </div>
                            <div className="text-[10px] mt-1 font-mono text-gray-500">
                              Avg BST: <span className="text-indigo-300 font-bold">{avgBst}</span> · {new Date(team.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => { loadTeam(team.id); soundService.play('success') }}
                              className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => { setEditingId(team.id); setEditName(team.name); soundService.play('click') }}
                              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
                              title="Rename Team"
                            >
                              <FiEdit2 size={12} />
                            </button>
                            <button
                              onClick={() => { deleteTeam(team.id); soundService.play('error') }}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
                              title="Delete Team"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-3 relative z-10 overflow-x-auto py-1">
                        {team.pokemon.map((p) => {
                          const primaryType = p.types[0] ?? 'normal'
                          const typeColor = TYPE_COLORS[primaryType]?.bg ?? '#777'
                          return (
                            <div
                              key={p.id}
                              className="relative group/avatar cursor-pointer"
                              style={{ flexShrink: 0 }}
                            >
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 bg-white/5 transition-transform group-hover/avatar:scale-110"
                                style={{ boxShadow: `0 0 8px ${typeColor}30` }}
                              >
                                <img
                                  src={p.artwork}
                                  alt={p.name}
                                  className="w-8 h-8 object-contain"
                                  title={capitalize(p.name)}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right — Analysis */}
        <div className="space-y-6">
          {/* Team Radar Stats — Visible unconditionally */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-4 rounded-2xl relative overflow-hidden">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5 text-gray-300">
              Team Average Stats
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: 'rgba(240,240,255,0.6)', fontSize: 9 }} />
                <Radar name="Team" dataKey="avg" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Quick Suggestions Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-300 leading-relaxed relative overflow-hidden flex items-center gap-2"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-indigo-600" />
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200 mr-2">Tip</span>
              {teamAnalysis.suggestion}
            </div>
          </motion.div>

          {/* Comprehensive Team Analysis Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 rounded-2xl space-y-5"
          >
            <h3 className="font-bold text-sm border-b border-white/5 pb-2 text-gray-300">
              Team Effectiveness & Strategy
            </h3>

            {/* Strengths & Weaknesses grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Weaknesses */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Weaknesses (2x Damage)</div>
                {teamAnalysis.weaknesses.length > 0 ? (
                  <div className="flex flex-wrap gap-1" style={{ marginTop: '15px' }}>
                    {teamAnalysis.weaknesses.map((w) => (
                      <div key={w.type} className="flex items-center gap-0.5" title={`${w.weakCount} team members are weak to ${w.type}`}>
                        <TypeBadge type={w.type} size="sm" />
                        <span className="text-[9px] text-red-400 font-bold">×{w.weakCount}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-500">None! Robust defensive type balance.</div>
                )}
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Resistances (0.5x Damage)</div>
                {teamAnalysis.strengths.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {teamAnalysis.strengths.map((s) => (
                      <div key={s.type} className="flex items-center gap-0.5" title={`${s.resistCount} team members resist ${s.type}`}>
                        <TypeBadge type={s.type} size="sm" />
                        <span className="text-[9px] text-green-400 font-bold">×{s.resistCount}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-500">No major resistances yet.</div>
                )}
              </div>
            </div>

            {/* Strategy (Excels / Lacking) */}
            <div className="space-y-2.5 border-t border-white/5 pt-3 text-xs">
              <div>
                <span className="font-bold text-green-400 block mb-0.5">Excels At</span>
                <span className="text-gray-400 text-[11px] leading-relaxed">{teamAnalysis.excels}</span>
              </div>
              <div>
                <span className="font-bold text-orange-400 block mb-0.5">Weaknesses / Gaps</span>
                <span className="text-gray-400 text-[11px] leading-relaxed">{teamAnalysis.lacking}</span>
              </div>
            </div>

            {/* Threats / Counter team */}
            <div className="border-t border-white/5 pt-3">
              <span className="font-bold text-xs text-red-400 block mb-1">Top Threat Matchups</span>
              {teamAnalysis.counters.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1 text-gray-400 text-[11px]">
                  {teamAnalysis.counters.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-gray-500">No immediate high-threat type matches.</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Save Dialog Modal */}
      <AnimatePresence>
        {showSaveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card p-6 rounded-2xl w-full max-w-md relative overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {/* Decorative Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              <h3 className="font-black text-xl mb-4 flex items-center gap-2 text-gray-100" style={{ fontFamily: 'var(--font-display)' }}>
                💾 Save Team Composition
              </h3>

              {/* Show preview of the team members */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 mb-4 flex items-center gap-3 justify-center">
                {currentTeam.map((p) => (
                  <img
                    key={p.id}
                    src={p.artwork}
                    alt={p.name}
                    className="w-10 h-10 object-contain hover:scale-110 transition-transform"
                    title={capitalize(p.name)}
                  />
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Team Name</label>
                  <input
                    autoFocus
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Dream Team, Kanto Squad..."
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 glass bg-[#0f0f1e]/90 text-sm text-gray-200 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all animate-none"
                    style={{ color: 'var(--text-primary)' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && teamName.trim()) {
                        saveTeam(teamName.trim())
                        setTeamName('')
                        setShowSaveDialog(false)
                        soundService.play('success')
                      }
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowSaveDialog(false); soundService.play('click') }}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm glass border border-white/10 text-gray-400 hover:text-white transition-all text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!teamName.trim()}
                    onClick={() => {
                      if (teamName.trim()) {
                        saveTeam(teamName.trim())
                        setTeamName('')
                        setShowSaveDialog(false)
                        soundService.play('success')
                      }
                    }}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm text-white hover:shadow-lg transition-all text-center ${teamName.trim() ? 'hover:shadow-indigo-500/20 active:scale-95 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                      }`}
                    style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}
                  >
                    Save Team
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Randomizer Modal */}
      <AnimatePresence>
        {showRandomizer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card p-6 rounded-2xl w-full max-w-md relative overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {/* Spinning Pokeball Background (Watermark) */}
              <div className="absolute -right-16 -bottom-16 w-44 h-44 rounded-full opacity-[0.03] pointer-events-none border-[12px] border-white flex items-center justify-center">
                <div className="w-full h-2 bg-white" />
              </div>

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black gradient-text flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  🎲 Random Team Generator
                </h3>
                <button
                  onClick={() => { setShowRandomizer(false); soundService.play('click') }}
                  className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              {generating ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="pokeball-spinner w-16 h-16" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-indigo-300 animate-pulse">Assembling Team...</p>
                    <p className="text-xs text-gray-500 mt-1">Calling PokeAPI for stats and details</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Region Filter</label>
                    <select
                      value={randomRegion}
                      onChange={(e) => setRandomRegion(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-white/10 glass bg-[#0f0f1e]/90 text-sm text-gray-200 outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                    >
                      <option value="all">All Regions (Gen I - IX)</option>
                      {REGIONS.map((r) => (
                        <option key={r.id} value={r.name}>{r.name} (Gen {r.generation})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Type Filter</label>
                    <select
                      value={randomType}
                      onChange={(e) => setRandomType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-white/10 glass bg-[#0f0f1e]/90 text-sm text-gray-200 outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                    >
                      <option value="all">All Types</option>
                      {Object.keys(TYPE_COLORS).map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="text-xs text-gray-500 mt-2 px-1">
                    Note: A random team of {teamSize} Pokémon will be generated based on these filters.
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => { setShowRandomizer(false); soundService.play('click') }}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm glass border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-center cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerateRandomTeam}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}
                    >
                      🎲 Generate
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TeamBuilderPage
