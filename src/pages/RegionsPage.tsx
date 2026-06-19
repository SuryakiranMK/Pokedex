import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronRight } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import { fetchPokemon, getPokemonArtwork } from '../api/pokemon'
import { REGIONS } from '../utils/constants'
import { capitalize } from '../utils/helpers'
import TypeBadge from '../components/ui/TypeBadge'
import { soundService } from '../services/sound'

const RegionsPage: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null)
  const region = REGIONS.find((r) => r.id === selected)

  // Fetch starters for the selected region
  const { data: starters } = useQuery({
    queryKey: ['starters', selected],
    queryFn: () => region ? Promise.all(region.starters.map((s) => fetchPokemon(s))) : Promise.resolve([]),
    enabled: !!selected,
    staleTime: 1000 * 60 * 60,
  })

  const { data: legendaries } = useQuery({
    queryKey: ['legendaries', selected],
    queryFn: () => region ? Promise.all(region.legendary.slice(0, 4).map((s) => fetchPokemon(s))) : Promise.resolve([]),
    enabled: !!selected,
    staleTime: 1000 * 60 * 60,
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-black gradient-text mb-1" style={{ fontFamily: 'var(--font-display)' }}>Regions</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Explore every Pokémon region</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {REGIONS.map((r, i) => (
          <motion.button
            key={r.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => { setSelected(selected === r.id ? null : r.id); soundService.play('click') }}
            className={`glass-card p-5 rounded-2xl text-left relative overflow-hidden group transition-all shine ${selected === r.id ? 'border-2' : ''}`}
            style={{ borderColor: selected === r.id ? r.color : undefined }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* BG accent */}
            <motion.div
              className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
              style={{ background: r.color }}
              animate={selected === r.id ? { opacity: 0.2, scale: 1.5 } : { opacity: 0.1, scale: 1 }}
              transition={{ duration: 0.4 }}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: r.color }}>
                    Generation {r.generation}
                  </div>
                  <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)' }}>{r.name}</h2>
                </div>
                <motion.div
                  animate={{ rotate: selected === r.id ? 90 : 0 }}
                  className="mt-1"
                  style={{ color: r.color }}
                >
                  <FiChevronRight size={18} />
                </motion.div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{r.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${r.color}20`, color: r.color }}>
                  {r.starters.length} Starters
                </span>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${r.color}20`, color: r.color }}>
                  {r.legendary.length} Legendaries
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && region && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/5">
              <h2 className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color: region.color }}>
                {region.name} Region
              </h2>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* Starters */}
              <div>
                <h3 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Starter Pokémon</h3>
                <div className="flex gap-4">
                  {starters?.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <img src={getPokemonArtwork(p.id)} alt={p.name} className="w-20 h-20 object-contain float" />
                      <div className="text-xs font-bold capitalize mt-1">{capitalize(p.name)}</div>
                      <div className="flex gap-1 mt-1 justify-center">
                        {p.types.map((t) => <TypeBadge key={t.type.name} type={t.type.name} size="sm" showIcon={false} />)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Legendaries */}
              <div>
                <h3 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Legendary Pokémon</h3>
                <div className="grid grid-cols-2 gap-3">
                  {legendaries?.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 glass p-2 rounded-xl"
                    >
                      <img src={getPokemonArtwork(p.id)} alt={p.name} className="w-10 h-10 object-contain" />
                      <div>
                        <div className="text-xs font-bold capitalize">{capitalize(p.name)}</div>
                        <div className="flex gap-1 mt-0.5">
                          {p.types.map((t) => <TypeBadge key={t.type.name} type={t.type.name} size="sm" showIcon={false} />)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {region.legendary.length > 4 && (
                    <div className="flex items-center justify-center glass p-2 rounded-xl text-xs" style={{ color: 'var(--text-muted)' }}>
                      +{region.legendary.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RegionsPage
