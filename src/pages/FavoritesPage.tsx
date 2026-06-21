import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import { fetchPokemon } from '../api/pokemon'
import { useFavoritesStore } from '../store'
import PokemonCard from '../components/pokemon/PokemonCard'
import { soundService } from '../services/sound'

const SkeletonCard = () => (
  <div className="glass-card p-4 rounded-2xl space-y-3">
    <div className="skeleton h-3 w-16 rounded-full" />
    <div className="skeleton h-24 w-24 mx-auto rounded-xl" />
    <div className="skeleton h-4 w-24 mx-auto rounded-full" />
    <div className="flex justify-center gap-2">
      <div className="skeleton h-5 w-14 rounded-full" />
    </div>
  </div>
)

const FavoritesPage: React.FC = () => {
  const { favorites, toggleFavorite } = useFavoritesStore()

  const { data: pokemonList, isLoading } = useQuery({
    queryKey: ['favorites-pokemon', favorites],
    queryFn: () => Promise.all(favorites.map((id) => fetchPokemon(id))),
    enabled: favorites.length > 0,
    staleTime: 1000 * 60 * 30,
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)' }}>
            <FiHeart className="text-red-400" size={20} />
          </div>
          <div>
            <h1 className="text-4xl font-black gradient-text" style={{ fontFamily: 'var(--font-display)' }}>Favorites ({favorites.length})</h1>
          </div>
        </div>
      </motion.div>

      {/* Empty state */}
      {favorites.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-6"
          >
            🤍
          </motion.div>
          <h2 className="text-2xl font-bold mb-3">No favorites yet</h2>
          <p className="text-sm mb-8 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Browse the Pokédex and tap the heart icon to add Pokémon to your favorites
          </p>
          <Link
            to="/pokedex"
            onClick={() => soundService.play('navigation')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}
          >
            Browse Pokédex
          </Link>
        </motion.div>
      )}

      {/* Grid */}
      {isLoading && favorites.length > 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="pokeball-spinner w-12 h-12" />
          <p className="text-sm font-semibold text-indigo-300 animate-pulse">Loading Favorites...</p>
        </div>
      )}

      {pokemonList && pokemonList.length > 0 && (
        <div className="pokemon-grid">
          <AnimatePresence>
            {pokemonList.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
              >
                <PokemonCard
                  id={p.id}
                  name={p.name}
                  types={p.types.map((t) => t.type.name)}
                  height={p.height}
                  weight={p.weight}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
