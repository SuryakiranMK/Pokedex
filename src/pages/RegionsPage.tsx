import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useMultiplePokemon } from '../hooks/usePokeAPI'
import { getPokemonArtwork } from '../api/pokemon'
import { REGIONS } from '../utils/constants'
import { capitalize } from '../utils/helpers'
import TypeBadge from '../components/ui/TypeBadge'
import { soundService } from '../services/sound'

const REGION_POKEMON_MAP: Record<string, number> = {
  kanto: 150,     // Mewtwo
  johto: 249,     // Lugia
  hoenn: 384,     // Rayquaza
  sinnoh: 483,    // Dialga
  unova: 643,     // Reshiram
  kalos: 716,     // Xerneas
  alola: 791,     // Solgaleo
  galar: 888,     // Zacian
  paldea: 1008,   // Miraidon
}

interface EvolutionStage {
  name: string
  id: number
  types: string[]
  level?: string
}

const STARTER_EVOLUTIONS: Record<string, EvolutionStage[][]> = {
  kanto: [
    [
      { name: 'bulbasaur', id: 1, types: ['grass', 'poison'] },
      { name: 'ivysaur', id: 2, types: ['grass', 'poison'], level: 'Lvl 16' },
      { name: 'venusaur', id: 3, types: ['grass', 'poison'], level: 'Lvl 32' },
    ],
    [
      { name: 'charmander', id: 4, types: ['fire'] },
      { name: 'charmeleon', id: 5, types: ['fire'], level: 'Lvl 16' },
      { name: 'charizard', id: 6, types: ['fire', 'flying'], level: 'Lvl 36' },
    ],
    [
      { name: 'squirtle', id: 7, types: ['water'] },
      { name: 'wartortle', id: 8, types: ['water'], level: 'Lvl 16' },
      { name: 'blastoise', id: 9, types: ['water'], level: 'Lvl 36' },
    ],
  ],
  johto: [
    [
      { name: 'chikorita', id: 152, types: ['grass'] },
      { name: 'bayleef', id: 153, types: ['grass'], level: 'Lvl 16' },
      { name: 'meganium', id: 154, types: ['grass'], level: 'Lvl 32' },
    ],
    [
      { name: 'cyndaquil', id: 155, types: ['fire'] },
      { name: 'quilava', id: 156, types: ['fire'], level: 'Lvl 14' },
      { name: 'typhlosion', id: 157, types: ['fire'], level: 'Lvl 36' },
    ],
    [
      { name: 'totodile', id: 158, types: ['water'] },
      { name: 'croconaw', id: 159, types: ['water'], level: 'Lvl 18' },
      { name: 'feraligatr', id: 160, types: ['water'], level: 'Lvl 30' },
    ],
  ],
  hoenn: [
    [
      { name: 'treecko', id: 252, types: ['grass'] },
      { name: 'grovyle', id: 253, types: ['grass'], level: 'Lvl 16' },
      { name: 'sceptile', id: 254, types: ['grass'], level: 'Lvl 36' },
    ],
    [
      { name: 'torchic', id: 255, types: ['fire'] },
      { name: 'combusken', id: 256, types: ['fire', 'fighting'], level: 'Lvl 16' },
      { name: 'blaziken', id: 257, types: ['fire', 'fighting'], level: 'Lvl 36' },
    ],
    [
      { name: 'mudkip', id: 258, types: ['water'] },
      { name: 'marshtomp', id: 259, types: ['water', 'ground'], level: 'Lvl 16' },
      { name: 'swampert', id: 260, types: ['water', 'ground'], level: 'Lvl 36' },
    ],
  ],
  sinnoh: [
    [
      { name: 'turtwig', id: 387, types: ['grass'] },
      { name: 'grotle', id: 388, types: ['grass'], level: 'Lvl 18' },
      { name: 'torterra', id: 389, types: ['grass', 'ground'], level: 'Lvl 32' },
    ],
    [
      { name: 'chimchar', id: 390, types: ['fire'] },
      { name: 'monferno', id: 391, types: ['fire', 'fighting'], level: 'Lvl 14' },
      { name: 'infernape', id: 392, types: ['fire', 'fighting'], level: 'Lvl 36' },
    ],
    [
      { name: 'piplup', id: 393, types: ['water'] },
      { name: 'prinplup', id: 394, types: ['water'], level: 'Lvl 16' },
      { name: 'empoleon', id: 395, types: ['water', 'steel'], level: 'Lvl 36' },
    ],
  ],
  unova: [
    [
      { name: 'snivy', id: 495, types: ['grass'] },
      { name: 'servine', id: 496, types: ['grass'], level: 'Lvl 17' },
      { name: 'serperior', id: 497, types: ['grass'], level: 'Lvl 36' },
    ],
    [
      { name: 'tepig', id: 498, types: ['fire'] },
      { name: 'pignite', id: 499, types: ['fire', 'fighting'], level: 'Lvl 17' },
      { name: 'emboar', id: 500, types: ['fire', 'fighting'], level: 'Lvl 36' },
    ],
    [
      { name: 'oshawott', id: 501, types: ['water'] },
      { name: 'dewott', id: 502, types: ['water'], level: 'Lvl 17' },
      { name: 'samurott', id: 503, types: ['water'], level: 'Lvl 36' },
    ],
  ],
  kalos: [
    [
      { name: 'chespin', id: 650, types: ['grass'] },
      { name: 'quilladin', id: 651, types: ['grass'], level: 'Lvl 16' },
      { name: 'chesnaught', id: 652, types: ['grass', 'fighting'], level: 'Lvl 36' },
    ],
    [
      { name: 'fennekin', id: 653, types: ['fire'] },
      { name: 'braixen', id: 654, types: ['fire'], level: 'Lvl 16' },
      { name: 'delphox', id: 655, types: ['fire', 'psychic'], level: 'Lvl 36' },
    ],
    [
      { name: 'froakie', id: 656, types: ['water'] },
      { name: 'frogadier', id: 657, types: ['water'], level: 'Lvl 16' },
      { name: 'greninja', id: 658, types: ['water', 'dark'], level: 'Lvl 36' },
    ],
  ],
  alola: [
    [
      { name: 'rowlet', id: 722, types: ['grass', 'flying'] },
      { name: 'dartrix', id: 723, types: ['grass', 'flying'], level: 'Lvl 17' },
      { name: 'decidueye', id: 724, types: ['grass', 'ghost'], level: 'Lvl 34' },
    ],
    [
      { name: 'litten', id: 725, types: ['fire'] },
      { name: 'torracat', id: 726, types: ['fire'], level: 'Lvl 17' },
      { name: 'incineroar', id: 727, types: ['fire', 'dark'], level: 'Lvl 34' },
    ],
    [
      { name: 'popplio', id: 728, types: ['water'] },
      { name: 'brionne', id: 729, types: ['water'], level: 'Lvl 17' },
      { name: 'primarina', id: 730, types: ['water', 'fairy'], level: 'Lvl 34' },
    ],
  ],
  galar: [
    [
      { name: 'grookey', id: 810, types: ['grass'] },
      { name: 'thwackey', id: 811, types: ['grass'], level: 'Lvl 16' },
      { name: 'rillaboom', id: 812, types: ['grass'], level: 'Lvl 35' },
    ],
    [
      { name: 'scorbunny', id: 813, types: ['fire'] },
      { name: 'raboot', id: 814, types: ['fire'], level: 'Lvl 16' },
      { name: 'cinderace', id: 815, types: ['fire'], level: 'Lvl 35' },
    ],
    [
      { name: 'sobble', id: 816, types: ['water'] },
      { name: 'drizzile', id: 817, types: ['water'], level: 'Lvl 16' },
      { name: 'inteleon', id: 818, types: ['water'], level: 'Lvl 35' },
    ],
  ],
  paldea: [
    [
      { name: 'sprigatito', id: 906, types: ['grass'] },
      { name: 'floragato', id: 907, types: ['grass'], level: 'Lvl 16' },
      { name: 'meowscarada', id: 908, types: ['grass', 'dark'], level: 'Lvl 36' },
    ],
    [
      { name: 'fuecoco', id: 909, types: ['fire'] },
      { name: 'crocalor', id: 910, types: ['fire'], level: 'Lvl 16' },
      { name: 'skeledirge', id: 911, types: ['fire', 'ghost'], level: 'Lvl 36' },
    ],
    [
      { name: 'quaxly', id: 912, types: ['water'] },
      { name: 'quaxwell', id: 913, types: ['water'], level: 'Lvl 16' },
      { name: 'quaquaval', id: 914, types: ['water', 'fighting'], level: 'Lvl 36' },
    ],
  ],
}

const RegionsPage: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null)
  const region = REGIONS.find((r) => r.id === selected)

  // Fetch every single legendary in the region using global cache-sharing hook
  const { data: legendaries, isLoading: loadingLegendaries } = useMultiplePokemon(region?.legendary ?? [])

  // Fetch starter Pokémon details dynamically
  const starterChains = STARTER_EVOLUTIONS[selected ?? ''] ?? []
  const starterIds = starterChains.flatMap((chain) => chain.map((p) => p.id))
  const { data: starters } = useMultiplePokemon(starterIds)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-black gradient-text mb-1" style={{ fontFamily: 'var(--font-display)' }}>Regions</h1>
      </motion.div>

      {/* Grid container with inline expansion capability */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {REGIONS.map((r, i) => {
          const isSelected = selected === r.id
          return (
            <React.Fragment key={r.id}>
              {/* Region card button */}
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => { setSelected(isSelected ? null : r.id); soundService.play('click') }}
                className={`glass-card p-5 rounded-2xl text-left relative overflow-hidden group transition-all shine cursor-pointer ${isSelected ? 'border-2' : ''}`}
                style={{ borderColor: isSelected ? r.color : undefined }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* BG accent */}
                <motion.div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
                  style={{ background: r.color }}
                  animate={isSelected ? { opacity: 0.2, scale: 1.5 } : { opacity: 0.1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                />
                {/* BG Pokémon Artwork Watermark */}
                <div className="absolute right-0 bottom-0 w-20 h-20 pointer-events-none select-none z-0 overflow-visible">
                  <div className="w-full h-full float">
                    <img
                      src={getPokemonArtwork(REGION_POKEMON_MAP[r.id] ?? 25)}
                      alt=""
                      className="absolute -right-3 -bottom-3 w-20 h-20 object-contain opacity-20 group-hover:opacity-60 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 filter drop-shadow-2xl"
                      style={{ filter: `drop-shadow(0 6px 16px ${r.color}40)` }}
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: r.color }}>
                        Generation {r.generation}
                      </div>
                      <h2 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                        {capitalize(r.name)}
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{r.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 font-semibold border-t border-white/5 pt-3">
                    <span>{r.starters.length} Starters · {r.legendary.length} Legendaries</span>
                    <FiChevronRight className={`transform transition-transform ${isSelected ? 'rotate-90 text-indigo-400' : 'group-hover:translate-x-1'}`} />
                  </div>
                </div>
              </motion.button>

              {/* Selected detail panel inline */}
              <AnimatePresence>
                {isSelected && region && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="col-span-full glass-card rounded-2xl overflow-hidden mt-1 mb-5"
                    style={{ border: `1px solid ${region.color}35`, boxShadow: `0 15px 35px rgba(0,0,0,0.5), 0 0 25px ${region.color}10` }}
                  >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: region.color }}>Explore Region</span>
                        <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                          {region.name} Region
                        </h2>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left: Starter Evolution Flowcharts (7 columns) - Strictly Horizontal */}
                      <div className="lg:col-span-7 space-y-5">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 border-b border-white/5 pb-2">
                          Starter Evolution Flowcharts
                        </h3>
                        <div className="space-y-4">
                          {STARTER_EVOLUTIONS[region.id]?.map((chain, chainIdx) => (
                            <div
                              key={chainIdx}
                              className="flex flex-row items-center justify-between gap-2 md:gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl overflow-x-auto shadow-inner w-full scrollbar-thin"
                            >
                              {chain.map((p, pIdx) => {
                                const details = starters?.find((s) => s.id === p.id)
                                const hp = details?.stats.find(s => s.stat.name === 'hp')?.base_stat ?? '—'
                                const atk = details?.stats.find(s => s.stat.name === 'attack')?.base_stat ?? '—'
                                const spd = details?.stats.find(s => s.stat.name === 'speed')?.base_stat ?? '—'
                                const bst = details ? details.stats.reduce((acc, s) => acc + s.base_stat, 0) : '—'

                                return (
                                  <React.Fragment key={p.id}>
                                    <Link
                                      to={`/pokemon/${p.name}`}
                                      className="flex items-center gap-3 hover:scale-105 transition-transform duration-200 cursor-pointer shrink-0 group/starter"
                                    >
                                      <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center border shrink-0 bg-white/5 group-hover/starter:border-indigo-500/40"
                                        style={{ borderColor: `${region.color}25` }}
                                      >
                                        <img
                                          src={getPokemonArtwork(p.id)}
                                          alt={p.name}
                                          className="w-11 h-11 object-contain"
                                          loading="lazy"
                                        />
                                      </div>
                                      <div className="min-w-0 hidden xs:block">
                                        <div className="text-xs font-black capitalize truncate text-white group-hover/starter:text-indigo-400 transition-colors">
                                          {p.name}
                                        </div>
                                        <div className="flex gap-1 mt-1">
                                          {p.types.map((t) => (
                                            <TypeBadge key={t} type={t} size="sm" />
                                          ))}
                                        </div>
                                        <div className="text-[9px] font-mono text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                                          <span>BST: <strong className="text-indigo-300">{bst}</strong></span>
                                          <span>·</span>
                                          <span>HP: <strong className="text-gray-300">{hp}</strong></span>
                                          <span>·</span>
                                          <span>ATK: <strong className="text-gray-300">{atk}</strong></span>
                                          <span>·</span>
                                          <span>SPD: <strong className="text-gray-300">{spd}</strong></span>
                                        </div>
                                      </div>
                                    </Link>
                                    {pIdx < chain.length - 1 && (
                                      <div className="flex flex-col items-center justify-center shrink-0 px-1">
                                        <span className="text-[9px] font-mono text-gray-400 font-bold bg-white/5 px-1 py-0.5 rounded border border-white/5 select-none mb-0.5">
                                          {chain[pIdx + 1].level}
                                        </span>
                                        <div
                                          className="font-black text-lg select-none leading-none"
                                          style={{ color: `${region.color}80` }}
                                        >
                                          →
                                        </div>
                                      </div>
                                    )}
                                  </React.Fragment>
                                )
                              })}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Legendaries with Info and Stats (5 columns) - Stable & Enlarged */}
                      <div className="lg:col-span-5 space-y-5">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 border-b border-white/5 pb-2">
                          Legendary Pokémon Profiles
                        </h3>
                        {loadingLegendaries ? (
                          <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="pokeball-spinner w-8 h-8 glow" />
                            <span className="text-xs font-mono text-gray-400 tracking-wider">Syncing Legendary Records...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                            {legendaries?.map((p) => {
                              const hp = p.stats.find(s => s.stat.name === 'hp')?.base_stat ?? 0
                              const atk = p.stats.find(s => s.stat.name === 'attack')?.base_stat ?? 0
                              const def = p.stats.find(s => s.stat.name === 'defense')?.base_stat ?? 0
                              const spd = p.stats.find(s => s.stat.name === 'speed')?.base_stat ?? 0
                              return (
                                <Link
                                  key={p.id}
                                  to={`/pokemon/${p.name}`}
                                  className="flex items-center gap-4 p-3 rounded-2xl glass border border-white/5 hover:border-white/12 hover:bg-white/[0.07] transition-all cursor-pointer group overflow-hidden"
                                >
                                  {/* Enlarged and stable image container */}
                                  <div
                                    className="w-20 h-20 rounded-xl flex items-center justify-center border shrink-0 bg-white/5 group-hover:scale-105 transition-transform duration-300"
                                    style={{ borderColor: `${region.color}25` }}
                                  >
                                    <img
                                      src={getPokemonArtwork(p.id)}
                                      alt={p.name}
                                      className="w-16 h-16 object-contain"
                                      loading="lazy"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs font-black capitalize truncate text-white group-hover:text-indigo-400 transition-colors">{p.name}</span>
                                      <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">#{p.id}</span>
                                    </div>
                                    <div className="flex gap-1 mt-1">
                                      {p.types.map((t) => (
                                        <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
                                      ))}
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mt-2.5 text-[9px] font-mono text-gray-400 border-t border-white/5 pt-1.5">
                                      <div>HP: <span className="text-white font-bold">{hp}</span></div>
                                      <div>ATK: <span className="text-white font-bold">{atk}</span></div>
                                      <div>DEF: <span className="text-white font-bold">{def}</span></div>
                                      <div>SPD: <span className="text-white font-bold">{spd}</span></div>
                                    </div>
                                  </div>
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-6 bg-white/[0.01] border-t border-white/5 flex flex-wrap justify-end gap-3.5">
                      <Link
                        to={`/pokedex?region=${region.id}`}
                        className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-black transition-all hover:scale-[1.05] active:scale-[0.97] duration-300 text-white shadow-lg cursor-pointer hover:brightness-110 hover:shadow-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${region.color}, ${region.color}cc)`,
                          boxShadow: `0 8px 24px ${region.color}35`,
                        }}
                        onClick={() => soundService.play('navigation')}
                      >
                        See All {region.name} Pokémon
                      </Link>
                      <Link
                        to={`/characters?region=${region.id}`}
                        className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-black transition-all hover:scale-[1.05] active:scale-[0.97] duration-300 text-white glass border border-white/10 cursor-pointer hover:brightness-110"
                        style={{
                          boxShadow: `0 8px 24px rgba(255,255,255,0.05)`,
                        }}
                        onClick={() => soundService.play('navigation')}
                      >
                        See {region.name} Trainers
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default RegionsPage
