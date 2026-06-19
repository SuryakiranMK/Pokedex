import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowLeft, FiHeart, FiVolume2, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { useQuery } from '@tanstack/react-query'
import TypeBadge from '../components/ui/TypeBadge'
import StatBar from '../components/ui/StatBar'
import { usePokemon, usePokemonSpecies, useEvolutionChain, useAbility } from '../hooks/usePokeAPI'
import { useFavoritesStore } from '../store'
import { fetchEvolutionChain, fetchPokemon, getPokemonArtwork, getPokemonArtworkShiny, getPokemonHomeSprite, getIdFromUrl } from '../api/pokemon'
import { TYPE_COLORS, STAT_LABELS, GENERATIONS } from '../utils/constants'
import { capitalize, formatHeight, formatWeight, formatPokemonId, getGenderRatio } from '../utils/helpers'
import { soundService } from '../services/sound'

// ── Evolution Chain ───────────────────────────────────────
const EvolutionNode: React.FC<{ name: string; id: number; details?: string }> = ({ name, id, details }) => (
  <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center gap-2">
    <Link to={`/pokemon/${name}`} onClick={() => soundService.play('navigation')}>
      <div className="glass-card p-3 rounded-2xl text-center hover:border-indigo-500/40 transition-all w-24">
        <img src={getPokemonArtwork(id)} alt={name} className="w-16 h-16 object-contain mx-auto" />
        <div className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>#{String(id).padStart(3,'0')}</div>
        <div className="text-xs font-bold capitalize">{capitalize(name)}</div>
      </div>
    </Link>
    {details && <div className="text-xs text-center px-2 py-1 glass rounded-lg" style={{ color: 'var(--text-secondary)', maxWidth: 90 }}>{details}</div>}
  </motion.div>
)

const EvolutionArrow = () => (
  <motion.div
    className="flex flex-col items-center justify-center text-indigo-400 mx-2"
    animate={{ x: [0, 4, 0] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    <FiChevronRight size={24} />
  </motion.div>
)

interface ChainLink {
  species: { name: string; url: string }
  evolution_details: { min_level?: number | null; trigger?: { name: string }; item?: { name: string } | null }[]
  evolves_to: ChainLink[]
}

const EvolutionChainDisplay: React.FC<{ chain: ChainLink }> = ({ chain }) => {
  const buildNodes = (link: ChainLink, depth = 0): React.ReactNode => {
    const id = parseInt(link.species.url.split('/').filter(Boolean).pop() ?? '1')
    const detail = link.evolution_details[0]
    const trigger = detail?.min_level
      ? `Lv. ${detail.min_level}`
      : detail?.item?.name
        ? capitalize(detail.item.name)
        : detail?.trigger?.name === 'trade' ? 'Trade' : ''

    return (
      <div key={link.species.name} className="flex items-center flex-wrap justify-center gap-2">
        <EvolutionNode name={link.species.name} id={id} />
        {link.evolves_to.map((next) => (
          <div key={next.species.name} className="flex items-center gap-2 flex-wrap justify-center">
            <div className="flex flex-col items-center">
              <EvolutionArrow />
              {trigger && <div className="text-xs text-indigo-400 -mt-1">{trigger}</div>}
            </div>
            {buildNodes(next, depth + 1)}
          </div>
        ))}
      </div>
    )
  }
  return <div className="flex flex-wrap items-center justify-center gap-4 py-4">{buildNodes(chain)}</div>
}

// ── Sprite Gallery ────────────────────────────────────────
const SPRITE_TABS = ['Official Art', 'Shiny', 'Home', 'Front', 'Back'] as const
type SpriteTab = typeof SPRITE_TABS[number]

// ── Main Detail Page ──────────────────────────────────────
const PokemonDetailPage: React.FC = () => {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavoritesStore()
  const [activeTab, setActiveTab] = useState<'stats' | 'moves' | 'evolution' | 'abilities' | 'sprites'>('stats')
  const [spriteTab, setSpriteTab] = useState<SpriteTab>('Official Art')
  const [moveSearch, setMoveSearch] = useState('')
  const [moveFilter, setMoveFilter] = useState<'level-up' | 'machine' | 'egg' | 'tutor' | 'all'>('all')

  const { data: pokemon, isLoading: pokemonLoading } = usePokemon(name ?? '')
  const { data: species, isLoading: speciesLoading } = usePokemonSpecies(name ?? '')

  const chainId = species?.evolution_chain?.url
    ? parseInt(species.evolution_chain.url.split('/').filter(Boolean).pop() ?? '0')
    : undefined

  const { data: evoChain } = useEvolutionChain(chainId)

  if (pokemonLoading || speciesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <div className="pokeball-spinner" />
        </motion.div>
      </div>
    )
  }

  if (!pokemon) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-5xl">😢</div>
      <h2 className="text-2xl font-bold">Pokémon not found</h2>
      <Link to="/pokedex" className="px-6 py-3 glass-card rounded-xl hover:border-indigo-500/40">Back to Pokédex</Link>
    </div>
  )

  const primaryType = pokemon.types[0]?.type.name ?? 'normal'
  const typeColor = TYPE_COLORS[primaryType] ?? TYPE_COLORS.normal
  const fav = isFavorite(pokemon.id)

  const flavorText = species?.flavor_text_entries
    .find((e) => e.language.name === 'en')?.flavor_text.replace(/\f/g, ' ') ?? ''

  const genus = species?.genera.find((g) => g.language.name === 'en')?.genus ?? ''
  const genderRatio = species ? getGenderRatio(species.gender_rate) : null

  const getCurrentSprite = () => {
    if (!pokemon.sprites) return getPokemonArtwork(pokemon.id)
    switch (spriteTab) {
      case 'Official Art': return pokemon.sprites.other?.['official-artwork']?.front_default ?? getPokemonArtwork(pokemon.id)
      case 'Shiny':        return pokemon.sprites.other?.['official-artwork']?.front_shiny ?? getPokemonArtworkShiny(pokemon.id)
      case 'Home':         return pokemon.sprites.other?.home?.front_default ?? getPokemonHomeSprite(pokemon.id)
      case 'Front':        return pokemon.sprites.front_default ?? getPokemonArtwork(pokemon.id)
      case 'Back':         return pokemon.sprites.back_default ?? getPokemonArtwork(pokemon.id)
      default:             return getPokemonArtwork(pokemon.id)
    }
  }

  const levelUpMoves = pokemon.moves
    .filter((m) => m.version_group_details.some((v) => v.move_learn_method.name === 'level-up'))
    .map((m) => ({
      name: m.move.name,
      level: m.version_group_details.find((v) => v.move_learn_method.name === 'level-up')?.level_learned_at ?? 0,
      method: 'level-up' as const,
    }))
    .sort((a, b) => a.level - b.level)

  const tmMoves = pokemon.moves
    .filter((m) => m.version_group_details.some((v) => v.move_learn_method.name === 'machine'))
    .map((m) => ({ name: m.move.name, level: 0, method: 'machine' as const }))

  const eggMoves = pokemon.moves
    .filter((m) => m.version_group_details.some((v) => v.move_learn_method.name === 'egg'))
    .map((m) => ({ name: m.move.name, level: 0, method: 'egg' as const }))

  const allMoves = [...levelUpMoves, ...tmMoves, ...eggMoves]
  const filteredMoves = allMoves
    .filter((m) => moveFilter === 'all' || m.method === moveFilter)
    .filter((m) => !moveSearch || m.name.includes(moveSearch.toLowerCase()))

  const TABS = ['stats', 'evolution', 'abilities', 'moves', 'sprites'] as const

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back button */}
      <motion.button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm mb-6 hover:text-white transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        whileHover={{ x: -4 }}
      >
        <FiArrowLeft /> Back
      </motion.button>

      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 md:p-10 mb-8"
        style={{
          background: `linear-gradient(135deg, ${typeColor.bg}30 0%, var(--bg-secondary) 50%, ${typeColor.bg}15 100%)`,
          border: `1px solid ${typeColor.bg}40`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${typeColor.bg}20`,
        }}
      >
        {/* BG number watermark */}
        <div className="absolute right-4 bottom-4 font-black opacity-5 select-none" style={{ fontSize: '12rem', lineHeight: 1, color: typeColor.bg, fontFamily: 'var(--font-display)' }}>
          {pokemon.id}
        </div>

        {/* Animated bg glow */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{ background: `radial-gradient(circle at 65% 50%, ${typeColor.glow} 0%, transparent 60%)` }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Artwork */}
          <div className="relative flex-shrink-0">
            <motion.div
              className="absolute inset-0 rounded-full blur-3xl opacity-40"
              style={{ background: typeColor.gradient }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.img
              src={getPokemonArtwork(pokemon.id)}
              alt={pokemon.name}
              className="relative w-44 h-44 md:w-60 md:h-60 object-contain drop-shadow-2xl"
              style={{ filter: `drop-shadow(0 10px 40px ${typeColor.glow})` }}
              initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={{ scale: 1.05 }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              <span className="text-sm font-mono" style={{ color: typeColor.bg }}>{formatPokemonId(pokemon.id)}</span>
              <span className="text-xs px-2 py-1 rounded-full glass" style={{ color: 'var(--text-secondary)' }}>{genus}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black capitalize mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              {capitalize(pokemon.name)}
            </h1>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
              {pokemon.types.map((t) => <TypeBadge key={t.type.name} type={t.type.name} size="lg" />)}
            </div>

            {flavorText && (
              <p className="text-sm leading-relaxed max-w-md mb-5" style={{ color: 'var(--text-secondary)' }}>{flavorText}</p>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Height', value: formatHeight(pokemon.height) },
                { label: 'Weight', value: formatWeight(pokemon.weight) },
                { label: 'Capture', value: `${species?.capture_rate ?? '?'}/255` },
                { label: 'Generation', value: species?.generation.name.replace('generation-', 'Gen ').toUpperCase() ?? '?' },
              ].map(({ label, value }) => (
                <div key={label} className="glass p-3 rounded-xl text-center">
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
                  <div className="text-xs font-bold">{value}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-5 justify-center md:justify-start">
              <motion.button
                onClick={() => { toggleFavorite(pokemon.id); soundService.play('favorite') }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold glass border border-white/10 hover:border-red-500/40 transition-all"
                whileTap={{ scale: 0.95 }}
              >
                {fav ? <FaHeart className="text-red-500" /> : <FiHeart />}
                {fav ? 'Favorited' : 'Favorite'}
              </motion.button>
              <motion.button
                onClick={() => { soundService.playCry(pokemon.cries?.latest ?? '') }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold glass border border-white/10 hover:border-indigo-500/40 transition-all"
                whileTap={{ scale: 0.95 }}
              >
                <FiVolume2 /> Play Cry
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 glass p-1 rounded-2xl mb-6 overflow-x-auto tabs-scroll">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); soundService.play('click') }}
            className={`flex-1 min-w-max px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-indigo-500/30 text-indigo-300' : 'text-gray-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {/* ── STATS TAB ── */}
          {activeTab === 'stats' && (
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h2 className="font-bold text-lg mb-4">Base Statistics</h2>
              {pokemon.stats.map((s) => (
                <StatBar key={s.stat.name} stat={s.stat.name} value={s.base_stat} />
              ))}
              <div className="pt-4 border-t border-white/5 flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>Total</span>
                <span className="font-black text-lg gradient-text">
                  {pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)}
                </span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                {genderRatio && (
                  <div className="glass p-3 rounded-xl">
                    <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Gender Ratio</div>
                    <div className="flex gap-1 items-center text-xs">
                      <span className="text-blue-400">♂ {genderRatio.male.toFixed(0)}%</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/10 mx-2">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${genderRatio.male}%` }} />
                      </div>
                      <span className="text-pink-400">♀ {genderRatio.female.toFixed(0)}%</span>
                    </div>
                  </div>
                )}
                {species?.egg_groups && (
                  <div className="glass p-3 rounded-xl">
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Egg Groups</div>
                    <div className="text-sm font-semibold">{species.egg_groups.map((e) => capitalize(e.name)).join(', ')}</div>
                  </div>
                )}
                {species?.habitat && (
                  <div className="glass p-3 rounded-xl">
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Habitat</div>
                    <div className="text-sm font-semibold capitalize">{capitalize(species.habitat.name)}</div>
                  </div>
                )}
                {species && (
                  <div className="glass p-3 rounded-xl">
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Special</div>
                    <div className="flex gap-2 flex-wrap">
                      {species.is_legendary && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-bold">Legendary</span>}
                      {species.is_mythical && <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 font-bold">Mythical</span>}
                      {species.is_baby && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold">Baby</span>}
                      {!species.is_legendary && !species.is_mythical && !species.is_baby && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Regular</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── EVOLUTION TAB ── */}
          {activeTab === 'evolution' && (
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-lg mb-6">Evolution Chain</h2>
              {evoChain ? (
                <EvolutionChainDisplay chain={evoChain.chain} />
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No evolution data available.</p>
              )}
            </div>
          )}

          {/* ── ABILITIES TAB ── */}
          {activeTab === 'abilities' && (
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-lg mb-6">Abilities</h2>
              <div className="space-y-3">
                {pokemon.abilities.map((a) => (
                  <motion.div
                    key={a.ability.name}
                    className="glass p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold capitalize text-sm">{capitalize(a.ability.name)}</span>
                      {a.is_hidden && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold">Hidden</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ── MOVES TAB ── */}
          {activeTab === 'moves' && (
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-lg mb-4">Moves</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {(['all', 'level-up', 'machine', 'egg'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setMoveFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${moveFilter === f ? 'bg-indigo-500/30 text-indigo-300' : 'glass border-white/10 text-gray-400'}`}
                  >
                    {f === 'level-up' ? 'Level Up' : f === 'machine' ? 'TM/HM' : capitalize(f)}
                  </button>
                ))}
                <input
                  value={moveSearch}
                  onChange={(e) => setMoveSearch(e.target.value)}
                  placeholder="Search moves..."
                  className="px-3 py-1.5 rounded-xl text-xs glass border border-white/10 bg-transparent outline-none w-32"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
                {filteredMoves.map((m) => (
                  <div key={`${m.name}-${m.method}`} className="glass p-2.5 rounded-xl text-xs flex items-center justify-between gap-2">
                    <span className="capitalize font-medium truncate">{capitalize(m.name)}</span>
                    {m.method === 'level-up' && m.level > 0 && (
                      <span className="text-indigo-400 font-bold flex-shrink-0">Lv.{m.level}</span>
                    )}
                    {m.method === 'machine' && <span className="text-yellow-400 flex-shrink-0">TM</span>}
                    {m.method === 'egg' && <span className="text-pink-400 flex-shrink-0">Egg</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SPRITES TAB ── */}
          {activeTab === 'sprites' && (
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-lg mb-4">Sprite Gallery</h2>
              <div className="flex gap-2 flex-wrap mb-6">
                {SPRITE_TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSpriteTab(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${spriteTab === t ? 'bg-indigo-500/30 text-indigo-300' : 'glass border-white/10 text-gray-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={spriteTab}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="flex justify-center"
                >
                  <img
                    src={getCurrentSprite() ?? getPokemonArtwork(pokemon.id)}
                    alt={`${pokemon.name} ${spriteTab}`}
                    className="max-w-xs object-contain"
                    style={{ imageRendering: ['Front', 'Back'].includes(spriteTab) ? 'pixelated' : 'auto' }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default PokemonDetailPage
