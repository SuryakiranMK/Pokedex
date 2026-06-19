import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiX, FiSearch, FiSave, FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { fetchPokemon, getPokemonArtwork } from '../api/pokemon'
import { useTeamStore } from '../store'
import { useAllPokemonNames } from '../hooks/usePokeAPI'
import TypeBadge from '../components/ui/TypeBadge'
import { STAT_LABELS } from '../utils/constants'
import { capitalize, extractIdFromUrl } from '../utils/helpers'
import { soundService } from '../services/sound'
import type { TeamPokemon } from '../types'

const SLOT_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444']

// Type coverage analysis
const analyzeTeam = (team: TeamPokemon[]) => {
  const coverage: Record<string, number> = {}
  team.forEach((p) => p.types.forEach((t) => { coverage[t] = (coverage[t] ?? 0) + 1 }))
  return coverage
}

const TeamBuilderPage: React.FC = () => {
  const { currentTeam, teams, addToTeam, removeFromTeam, saveTeam, loadTeam, deleteTeam, renameTeam, clearCurrentTeam } = useTeamStore()
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const { data: allNames } = useAllPokemonNames()
  const suggestions = search.length >= 1
    ? (allNames ?? []).filter((p) => p.name.includes(search.toLowerCase())).slice(0, 12)
    : []

  const coverage = analyzeTeam(currentTeam)
  const allTypes = ['fire','water','grass','electric','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy','normal']
  const missingTypes = allTypes.filter((t) => !coverage[t])

  const radarData = ['hp','attack','defense','special-attack','special-defense','speed'].map((stat) => ({
    stat: STAT_LABELS[stat] ?? stat,
    avg: currentTeam.length > 0
      ? Math.round(currentTeam.reduce((sum, p) => sum + (p.stats[stat] ?? 0), 0) / currentTeam.length)
      : 0,
  }))

  const addPokemon = async (name: string, id: number) => {
    try {
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-black gradient-text mb-1" style={{ fontFamily: 'var(--font-display)' }}>Team Builder</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Build your perfect team of 6 Pokémon</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — Team slots */}
        <div className="lg:col-span-2 space-y-4">
          {/* Slot grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => {
              const p = currentTeam[i]
              const color = SLOT_COLORS[i]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card p-4 rounded-2xl text-center relative"
                  style={{ minHeight: 160, border: p ? `1px solid ${color}50` : '1px dashed rgba(255,255,255,0.1)' }}
                >
                  {p ? (
                    <>
                      <button
                        onClick={() => { removeFromTeam(p.id); soundService.play('click') }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full glass flex items-center justify-center hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                      >
                        <FiX size={11} />
                      </button>
                      <motion.div
                        className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full"
                        style={{ background: color }}
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <img src={getPokemonArtwork(p.id)} alt={p.name} className="w-20 h-20 mx-auto object-contain" style={{ filter: `drop-shadow(0 4px 12px ${color}50)` }} />
                      <div className="font-bold text-sm capitalize mt-1">{capitalize(p.name)}</div>
                      <div className="flex gap-1 mt-1.5 flex-wrap justify-center">
                        {p.types.map((t) => <TypeBadge key={t} type={t} size="sm" showIcon={false} />)}
                      </div>
                      <div className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                        BST: {Object.values(p.stats).reduce((a, b) => a + b, 0)}
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => { setShowSearch(true); soundService.play('click') }}
                      className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white transition-colors min-h-[130px]"
                    >
                      <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center">
                        <FiPlus size={18} />
                      </div>
                      <span className="text-xs">Slot {i + 1}</span>
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Search panel */}
          <AnimatePresence>
            {showSearch && currentTeam.length < 6 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-4 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <input
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search Pokémon to add..."
                      className="w-full pl-11 pr-4 py-2.5 glass rounded-xl border border-white/10 bg-transparent outline-none text-sm transition-all focus:border-indigo-500/60 focus:shadow-lg focus:shadow-indigo-500/10"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                  <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-white"><FiX /></button>
                </div>
                {suggestions.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {suggestions.map((p) => {
                      const id = extractIdFromUrl(p.url)
                      const inTeam = currentTeam.some((t) => t.id === id)
                      return (
                        <button
                          key={p.name}
                          disabled={inTeam}
                          onClick={() => addPokemon(p.name, id)}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs glass transition-all ${inTeam ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/8 cursor-pointer'}`}
                        >
                          <img src={getPokemonArtwork(id)} alt="" className="w-8 h-8 object-contain" />
                          <span className="capitalize truncate font-medium">{capitalize(p.name)}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Team actions */}
          {currentTeam.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => { setShowSaveDialog(true); soundService.play('click') }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}
              >
                <FiSave size={14} /> Save Team
              </button>
              <button
                onClick={() => { clearCurrentTeam(); soundService.play('click') }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold glass border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all"
              >
                <FiTrash2 size={14} /> Clear
              </button>
            </div>
          )}

          {/* Save dialog */}
          <AnimatePresence>
            {showSaveDialog && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-4 rounded-2xl"
              >
                <h3 className="font-bold mb-3 text-sm">Name Your Team</h3>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Dream Team, Kanto Squad..."
                    className="flex-1 px-3 py-2 glass rounded-xl border border-white/10 bg-transparent outline-none text-sm"
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
                  <button
                    onClick={() => { if (teamName.trim()) { saveTeam(teamName.trim()); setTeamName(''); setShowSaveDialog(false); soundService.play('success') } }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-500/30 text-indigo-300 hover:bg-indigo-500/50 transition-all"
                  >
                    <FiCheck />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Analysis */}
        <div className="space-y-4">
          {/* Team radar */}
          {currentTeam.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-4 rounded-2xl">
              <h3 className="font-bold text-sm mb-3">Team Average Stats</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="stat" tick={{ fill: 'rgba(240,240,255,0.6)', fontSize: 9 }} />
                  <Radar name="Team" dataKey="avg" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Type coverage */}
          {currentTeam.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 rounded-2xl">
              <h3 className="font-bold text-sm mb-3">Type Coverage</h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {Object.entries(coverage).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-1">
                    <TypeBadge type={type} size="sm" showIcon={false} />
                    {count > 1 && <span className="text-xs text-gray-400">×{count}</span>}
                  </div>
                ))}
              </div>
              {missingTypes.length > 0 && (
                <>
                  <div className="text-xs font-semibold mb-2 text-orange-400">Missing Coverage</div>
                  <div className="flex flex-wrap gap-1">
                    {missingTypes.slice(0, 8).map((t) => (
                      <TypeBadge key={t} type={t} size="sm" showIcon={false} className="opacity-40" />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Saved teams */}
          {teams.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 rounded-2xl">
              <h3 className="font-bold text-sm mb-3">Saved Teams</h3>
              <div className="space-y-2">
                {teams.map((team) => (
                  <div key={team.id} className="glass p-3 rounded-xl">
                    {editingId === team.id ? (
                      <div className="flex gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 bg-transparent text-sm outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { renameTeam(team.id, editName); setEditingId(null) }
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                        />
                        <button onClick={() => { renameTeam(team.id, editName); setEditingId(null) }}><FiCheck className="text-indigo-400" size={14} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">{team.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {team.pokemon.length} Pokémon
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { loadTeam(team.id); soundService.play('click') }} className="text-xs px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-all">Load</button>
                          <button onClick={() => { setEditingId(team.id); setEditName(team.name) }} className="p-1 text-gray-400 hover:text-white"><FiEdit2 size={12} /></button>
                          <button onClick={() => { deleteTeam(team.id); soundService.play('click') }} className="p-1 text-gray-400 hover:text-red-400"><FiTrash2 size={12} /></button>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-1 mt-2">
                      {team.pokemon.map((p) => (
                        <img key={p.id} src={getPokemonArtwork(p.id)} alt={p.name} className="w-8 h-8 object-contain" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeamBuilderPage
