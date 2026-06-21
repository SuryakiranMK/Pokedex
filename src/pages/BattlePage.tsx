import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiZap, FiShield, FiTrendingUp } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import { fetchPokemon, getPokemonArtwork } from '../api/pokemon'
import { useAllPokemonNames } from '../hooks/usePokeAPI'
import { TYPE_COLORS } from '../utils/constants'
import { capitalize, extractIdFromUrl } from '../utils/helpers'
import TypeBadge from '../components/ui/TypeBadge'
import { soundService } from '../services/sound'
import { useUIStore } from '../store'

// Type chart for effectiveness
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

const getEffectiveness = (atkTypes: string[], defTypes: string[]): number => {
  let mult = 1
  atkTypes.forEach((atk) => {
    defTypes.forEach((def) => {
      mult *= TYPE_CHART[atk]?.[def] ?? 1
    })
  })
  return mult
}

// HP bar
const HPBar: React.FC<{ hp: number; maxHp: number; label: string }> = ({
  hp, maxHp, label,
}) => {
  const pct = Math.round((hp / maxHp) * 100)
  const barColor = pct > 50 ? '#22c55e' : pct > 20 ? '#eab308' : '#ef4444'
  return (
    <div className="mb-2 w-full">
      <div className="flex justify-between text-xs mb-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
        <span>{label}</span>
        <span className="font-bold" style={{ color: barColor }}>{hp}/{maxHp}</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden bg-white/5 border border-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${barColor}, ${barColor}aa)`, boxShadow: `0 0 10px ${barColor}80` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// Pokémon picker
const PokemonPicker: React.FC<{
  label: string
  selected: number | null
  onSelect: (id: number, name: string) => void
  isStriking?: boolean
  isHit?: boolean
}> = ({
  label, selected, onSelect, isStriking = false, isHit = false,
}) => {
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)
  const { data: allNames } = useAllPokemonNames()
  const { searchHistory, addSearchHistory, clearSearchHistory } = useUIStore()

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

  const { data: pokemon } = useQuery({
    queryKey: ['battle-pokemon', selected],
    queryFn: () => fetchPokemon(selected!),
    enabled: !!selected,
    staleTime: 1000 * 60 * 30,
  })

  const typeColor = pokemon ? TYPE_COLORS[pokemon.types[0]?.type.name ?? 'normal'] : null
  const showDropdown = focused

  return (
    <div className="flex flex-col items-center gap-3 flex-1 w-full">
      <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</h3>

      {/* Pokémon display */}
      <motion.div
        className="w-full glass-card p-5 rounded-3xl text-center relative overflow-hidden min-h-[220px] flex flex-col items-center justify-center border"
        style={{
          borderColor: typeColor ? `${typeColor.bg}50` : 'var(--border)',
          boxShadow: isHit ? '0 0 30px rgba(239, 68, 68, 0.4)' : 'none',
        }}
        animate={{
          x: isStriking ? (label.includes('A') ? 40 : -40) : 0,
          scale: isStriking ? 1.05 : 1,
          rotate: isHit ? [0, -4, 4, -4, 4, 0] : 0,
          filter: isHit ? 'brightness(1.3) contrast(1.1)' : 'brightness(1) contrast(1)',
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {pokemon && typeColor ? (
          <>
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{ background: `radial-gradient(circle, ${typeColor.bg}, transparent 70%)` }}
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.img
              src={getPokemonArtwork(pokemon.id)}
              alt={pokemon.name}
              className="w-28 h-28 object-contain relative z-10"
              style={{ filter: `drop-shadow(0 6px 20px ${typeColor.glow})` }}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
            <div className="relative z-10 mt-2 w-full">
              <div className="font-black text-base capitalize tracking-tight">{capitalize(pokemon.name)}</div>
              <div className="flex gap-1 justify-center mt-1">
                {pokemon.types.map((t) => <TypeBadge key={t.type.name} type={t.type.name} size="sm" />)}
              </div>
              <div className="text-[10px] mt-2 font-mono flex justify-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <span>HP: {pokemon.stats.find((s) => s.stat.name === 'hp')?.base_stat}</span>
                <span>•</span>
                <span>ATK: {pokemon.stats.find((s) => s.stat.name === 'attack')?.base_stat}</span>
                <span>•</span>
                <span>SPD: {pokemon.stats.find((s) => s.stat.name === 'speed')?.base_stat}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-500">
            <div className="text-4xl mb-2">❓</div>
            <div className="text-xs">Choose a Pokémon</div>
          </div>
        )}
      </motion.div>

      {/* Search */}
      <div className="w-full relative flex items-center glass rounded-xl border border-white/10 transition-all focus-within:border-indigo-500/60 focus-within:shadow-lg focus-within:shadow-indigo-500/10">
        <div className="pl-4 flex items-center justify-center text-gray-400 pointer-events-none flex-shrink-0">
          <FiSearch size={16} />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search Pokémon..."
          className="flex-1 bg-transparent pl-3 pr-4 py-2.5 outline-none text-xs"
          style={{ color: 'var(--text-primary)' }}
        />
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full mt-1 left-0 right-0 glass-dark rounded-xl overflow-hidden z-20 border border-white/10 max-h-60 overflow-y-auto"
            >
              {!search && recentPokemon.length > 0 && (
                <div className="p-2 border-b border-white/5">
                  <div className="flex items-center justify-between px-2 mb-1">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Recent</span>
                    <button onClick={(e) => { e.stopPropagation(); clearSearchHistory() }} className="text-[10px] text-indigo-400 hover:text-indigo-300">Clear</button>
                  </div>
                  {recentPokemon.map((p) => {
                    const id = extractIdFromUrl(p.url)
                    return (
                      <button
                        key={`recent-${p.name}`}
                        onClick={() => {
                          onSelect(id, p.name)
                          addSearchHistory(p.name)
                          setSearch('')
                          soundService.play('success')
                        }}
                        className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-white/5 text-xs text-left transition-colors"
                      >
                        <img src={getPokemonArtwork(id)} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
                        <span className="capitalize">{capitalize(p.name)}</span>
                      </button>
                    )
                  })}
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="p-1">
                  {!search && (
                    <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Suggested
                    </div>
                  )}
                  {suggestions.map((p) => {
                    const id = extractIdFromUrl(p.url)
                    return (
                      <button
                        key={p.name}
                        onClick={() => {
                          onSelect(id, p.name)
                          addSearchHistory(p.name)
                          setSearch('')
                          soundService.play('success')
                        }}
                        className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-white/5 text-xs text-left transition-colors"
                      >
                        <img src={getPokemonArtwork(id)} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
                        <span className="capitalize">{capitalize(p.name)}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Battle result
interface BattleResult {
  winner: 'A' | 'B' | 'tie'
  effectiveness: number
  reason: string
  hpA: number
  hpB: number
}

const BattlePage: React.FC = () => {
  const [idA, setIdA] = useState<number | null>(null)
  const [idB, setIdB] = useState<number | null>(null)
  const [result, setResult] = useState<BattleResult | null>(null)
  const [battling, setBattling] = useState(false)
  
  // Real-time battle states
  const [logs, setLogs] = useState<string[]>([])
  const [liveHpA, setLiveHpA] = useState(100)
  const [liveHpB, setLiveHpB] = useState(100)
  const [striker, setStriker] = useState<'A' | 'B' | null>(null)
  const [hitTarget, setHitTarget] = useState<'A' | 'B' | null>(null)
  
  const logEndRef = useRef<HTMLDivElement>(null)

  const { data: pokemonA } = useQuery({
    queryKey: ['battle-a', idA],
    queryFn: () => fetchPokemon(idA!),
    enabled: !!idA,
    staleTime: 1000 * 60 * 30,
  })
  const { data: pokemonB } = useQuery({
    queryKey: ['battle-b', idB],
    queryFn: () => fetchPokemon(idB!),
    enabled: !!idB,
    staleTime: 1000 * 60 * 30,
  })

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const hpAMax = pokemonA?.stats.find((s) => s.stat.name === 'hp')?.base_stat ?? 100
  const hpBMax = pokemonB?.stats.find((s) => s.stat.name === 'hp')?.base_stat ?? 100

  const getRandomMove = (pokemon: any): string => {
    if (pokemon.moves && pokemon.moves.length > 0) {
      const idx = Math.floor(Math.random() * pokemon.moves.length)
      return pokemon.moves[idx].move.name
    }
    return 'Tackle'
  }

  const runBattle = async () => {
    if (!pokemonA || !pokemonB) return
    setBattling(true)
    setResult(null)
    setLogs([])

    setLiveHpA(hpAMax)
    setLiveHpB(hpBMax)

    const speedA = pokemonA.stats.find((s) => s.stat.name === 'speed')?.base_stat ?? 50
    const speedB = pokemonB.stats.find((s) => s.stat.name === 'speed')?.base_stat ?? 50

    let currentHpA = hpAMax
    let currentHpB = hpBMax
    let isATurn = speedA >= speedB
    const newLogs: string[] = []

    const addLog = (text: string) => {
      newLogs.push(text)
      setLogs([...newLogs])
    }

    addLog(`⚔️ Battle begins between ${capitalize(pokemonA.name)} and ${capitalize(pokemonB.name)}!`)

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    await delay(1000)

    let round = 1
    while (currentHpA > 0 && currentHpB > 0 && round <= 8) {
      addLog(`⚡ Round ${round}:`)
      await delay(600)

      const attacker = isATurn ? pokemonA : pokemonB
      const defender = isATurn ? pokemonB : pokemonA
      const attackerName = capitalize(attacker.name)
      const defenderName = capitalize(defender.name)

      // Animate attacker strike
      setStriker(isATurn ? 'A' : 'B')
      soundService.play('click')
      
      const moveName = getRandomMove(attacker)
      addLog(`☄️ ${attackerName} uses ${capitalize(moveName)}!`)
      await delay(600)

      // Calculate effectiveness & damage
      const typesAtk = attacker.types.map((t: any) => t.type.name)
      const typesDef = defender.types.map((t: any) => t.type.name)
      const eff = getEffectiveness(typesAtk, typesDef)

      const atkStat = attacker.stats.find((s: any) => s.stat.name === 'attack')?.base_stat ?? 50
      const defStat = defender.stats.find((s: any) => s.stat.name === 'defense')?.base_stat ?? 50

      let dmg = Math.max(8, Math.round((atkStat / defStat) * 16 * eff + (Math.random() * 6 - 3)))
      if (round > 4) dmg = Math.round(dmg * 1.4) // Speed up combat

      // Animate defender hit
      setHitTarget(isATurn ? 'B' : 'A')
      
      if (eff >= 2) {
        soundService.play('success')
        addLog(`💥 It's super effective!`)
      } else if (eff === 0) {
        soundService.play('error')
        dmg = 0
        addLog(`🛡️ It has no effect...`)
      } else if (eff < 1) {
        soundService.play('error')
        addLog(`🍃 It's not very effective...`)
      }

      if (dmg > 0) {
        soundService.play('favorite')
      }

      if (isATurn) {
        currentHpB = Math.max(0, currentHpB - dmg)
        setLiveHpB(currentHpB)
      } else {
        currentHpA = Math.max(0, currentHpA - dmg)
        setLiveHpA(currentHpA)
      }

      addLog(`💥 ${defenderName} takes ${dmg} damage!`)
      
      // Clear visual states
      setStriker(null)
      await delay(400)
      setHitTarget(null)
      await delay(800)

      if (currentHpA <= 0 || currentHpB <= 0) break

      isATurn = !isATurn
      round++
    }

    if (currentHpA <= 0 && currentHpB <= 0) {
      addLog(`💀 Both Pokémon fainted from exhaustion! It's a draw!`)
      setResult({ winner: 'tie', effectiveness: 1, reason: 'Double knockout!', hpA: 0, hpB: 0 })
    } else if (currentHpA <= 0) {
      addLog(`💀 ${capitalize(pokemonA.name)} fainted!`)
      addLog(`🏆 ${capitalize(pokemonB.name)} is victorious!`)
      setResult({ winner: 'B', effectiveness: 1, reason: 'Fainted the opponent.', hpA: 0, hpB: currentHpB })
    } else if (currentHpB <= 0) {
      addLog(`💀 ${capitalize(pokemonB.name)} fainted!`)
      addLog(`🏆 ${capitalize(pokemonA.name)} is victorious!`)
      setResult({ winner: 'A', effectiveness: 1, reason: 'Fainted the opponent.', hpA: currentHpA, hpB: 0 })
    } else {
      // Tie breaker
      const remainA = (currentHpA / hpAMax) * 100
      const remainB = (currentHpB / hpBMax) * 100
      if (Math.abs(remainA - remainB) < 10) {
        addLog(`🤝 The battle ended in a close draw!`)
        setResult({ winner: 'tie', effectiveness: 1, reason: 'Extremely close duel!', hpA: currentHpA, hpB: currentHpB })
      } else if (remainA > remainB) {
        addLog(`🏆 Time out! ${capitalize(pokemonA.name)} wins by HP ratio!`)
        setResult({ winner: 'A', effectiveness: 1, reason: 'Higher remaining health ratio.', hpA: currentHpA, hpB: currentHpB })
      } else {
        addLog(`🏆 Time out! ${capitalize(pokemonB.name)} wins by HP ratio!`)
        setResult({ winner: 'B', effectiveness: 1, reason: 'Higher remaining health ratio.', hpA: currentHpA, hpB: currentHpB })
      }
    }

    setBattling(false)
  }

  const winnerColor = result?.winner === 'A'
    ? TYPE_COLORS[pokemonA?.types[0]?.type.name ?? 'normal']
    : result?.winner === 'B'
    ? TYPE_COLORS[pokemonB?.types[0]?.type.name ?? 'normal']
    : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-black gradient-text-fire mb-1" style={{ fontFamily: 'var(--font-display)' }}>Battle Simulator</h1>
      </motion.div>

      {/* Battle arena */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-8 w-full justify-between">
        <PokemonPicker
          label="Pokémon A"
          selected={idA}
          onSelect={(id) => { setIdA(id); setResult(null); setLogs([]) }}
          isStriking={striker === 'A'}
          isHit={hitTarget === 'A'}
        />

        {/* VS Indicator */}
        <div className="flex flex-col items-center justify-center pt-8 md:pt-20 flex-shrink-0 self-center md:self-start">
          <motion.div
            className="text-4xl font-black gradient-text-fire"
            animate={{ scale: battling ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5, repeat: battling ? Infinity : 0 }}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            VS
          </motion.div>
        </div>

        <PokemonPicker
          label="Pokémon B"
          selected={idB}
          onSelect={(id) => { setIdB(id); setResult(null); setLogs([]) }}
          isStriking={striker === 'B'}
          isHit={hitTarget === 'B'}
        />
      </div>

      {/* Battle button */}
      <div className="text-center mb-8">
        <motion.button
          onClick={runBattle}
          disabled={!pokemonA || !pokemonB || battling}
          className="px-10 py-4 rounded-2xl font-black text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #ef4444, #f97316, #eab308)', boxShadow: '0 8px 30px rgba(239,68,68,0.4)' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {battling ? (
            <div className="flex items-center gap-2 justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}>
                ⚡
              </motion.div>
              Combat is Active...
            </div>
          ) : (
            '⚔️ Simulate Battle!'
          )}
        </motion.button>
      </div>

      {/* HP Bars & Combat logs during battle */}
      {(battling || logs.length > 0) && pokemonA && pokemonB && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-3xl mb-8 space-y-6"
        >
          {/* Active Health Bars */}
          <div className="grid md:grid-cols-2 gap-6 pt-2">
            <div>
              <div className="font-bold capitalize mb-2 text-sm">{capitalize(pokemonA.name)}</div>
              <HPBar hp={liveHpA} maxHp={hpAMax} label="Player A HP" />
            </div>
            <div>
              <div className="font-bold capitalize mb-2 text-sm">{capitalize(pokemonB.name)}</div>
              <HPBar hp={liveHpB} maxHp={hpBMax} label="Player B HP" />
            </div>
          </div>

          {/* Combat Log Console */}
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Combat Console</h3>
            <div className="h-48 overflow-y-auto glass p-4 rounded-xl border border-white/5 font-mono text-xs text-green-400 space-y-2 relative bg-black/40">
              <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-5 rounded-xl" />
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`py-0.5 ${log.startsWith('Round') ? 'text-indigo-400 font-bold border-b border-white/5 pb-1 mt-2' : log.includes('victory') || log.includes('Wins') ? 'text-yellow-400 font-extrabold text-sm' : ''}`}
                >
                  {log}
                </motion.div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Final Battle result */}
      <AnimatePresence>
        {result && !battling && pokemonA && pokemonB && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass-card rounded-3xl overflow-hidden border shadow-2xl"
            style={{ borderColor: winnerColor ? `${winnerColor.bg}60` : 'var(--border)' }}
          >
            {/* Winner banner */}
            <div
              className="p-6 text-center"
              style={{ background: winnerColor ? `linear-gradient(135deg, ${winnerColor.bg}22, transparent)` : undefined }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                className="text-5xl mb-3"
              >
                {result.winner === 'tie' ? '🤝' : '🏆'}
              </motion.div>
              <h2 className="text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                {result.winner === 'tie'
                  ? 'It\'s a Tie!'
                  : `${capitalize(result.winner === 'A' ? pokemonA.name : pokemonB.name)} Wins!`}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{result.reason}</p>
            </div>

            {/* Type effectiveness breakdown */}
            <div className="p-5 border-t border-white/5 bg-white/2">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3 font-mono" style={{ color: 'var(--text-muted)' }}>Matchup Summary</h3>
              <div className="flex flex-col gap-2 font-mono text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="capitalize">{capitalize(pokemonA.name)} Type:</span>
                  <div className="flex gap-1">{pokemonA.types.map((t) => <TypeBadge key={t.type.name} type={t.type.name} size="sm" />)}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="capitalize">{capitalize(pokemonB.name)} Type:</span>
                  <div className="flex gap-1">{pokemonB.types.map((t) => <TypeBadge key={t.type.name} type={t.type.name} size="sm" />)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BattlePage
