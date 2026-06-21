import React, { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import TypeBadge from '../ui/TypeBadge'
import { useFavoritesStore, useTeamStore, useModalStore } from '../../store'
import { TYPE_COLORS } from '../../utils/constants'
import { formatPokemonId, capitalize } from '../../utils/helpers'
import { getPokemonArtwork, fetchPokemon } from '../../api/pokemon'
import { soundService } from '../../services/sound'
import type { TeamPokemon } from '../../types'

interface PokemonCardProps {
  id: number
  name: string
  types: string[]
  height?: number
  weight?: number
  viewMode?: 'grid' | 'list'
}

const PokemonCard: React.FC<PokemonCardProps> = ({ id, name, types, height, weight, viewMode = 'grid' }) => {
  const { isFavorite, toggleFavorite } = useFavoritesStore()
  const { currentTeam, addToTeam, teamSize } = useTeamStore()
  const [adding, setAdding] = useState(false)
  const fav = isFavorite(id)
  const cardRef = useRef<HTMLDivElement>(null)

  // 3D tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })
  const glowX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%'])
  const glowY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%'])

  const primaryType = types[0] ?? 'normal'
  const typeColor = TYPE_COLORS[primaryType] ?? TYPE_COLORS.normal

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0) }

  const handleAddToTeam = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (adding) return

    const inTeam = currentTeam.some((t) => t.id === id)
    if (inTeam) {
      soundService.play('error')
      return
    }

    if (currentTeam.length >= teamSize) {
      useModalStore.getState().openModal(
        'Team is Full',
        `Your current battle team already contains the maximum limit of ${teamSize} Pokémon. Please remove an existing member from the Team Builder before adding another.`,
        'warning'
      )
      return
    }

    setAdding(true)
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
    } catch (err) {
      soundService.play('error')
    } finally {
      setAdding(false)
    }
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.06)' }}
        className="glass-card flex items-center gap-4 p-3 cursor-pointer"
        style={{ borderRadius: 12 }}
        onMouseEnter={() => soundService.play('hover')}
      >
        <Link to={`/pokemon/${name}`} className="flex items-center gap-4 flex-1 min-w-0">
          <img src={getPokemonArtwork(id)} alt={name} className="w-14 h-14 object-contain" loading="lazy" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{formatPokemonId(id)}</span>
              <h3 className="font-semibold text-base capitalize truncate">{capitalize(name)}</h3>
            </div>
            <div className="flex gap-1 mt-1">
              {types.map((t) => <TypeBadge key={t} type={t} size="sm" />)}
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <button
            disabled={adding}
            onClick={handleAddToTeam}
            className={`px-3 py-1.5 rounded-xl font-bold text-[10px] tracking-wider uppercase transition-all flex items-center justify-center gap-1 ${
              currentTeam.some((t) => t.id === id)
                ? 'bg-green-500/10 text-green-400 border border-green-500/25 cursor-default'
                : 'bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/25 active:scale-95'
            }`}
          >
            {adding ? (
              <div className="pokeball-spinner w-3.5 h-3.5" />
            ) : currentTeam.some((t) => t.id === id) ? (
              'In Team ✓'
            ) : (
              '+ Team'
            )}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(id); soundService.play('favorite') }}
            className="p-2 transition-transform hover:scale-125"
            aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          >
            {fav ? <FaHeart className="text-red-500" /> : <FiHeart className="text-gray-400" />}
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={cardRef}
      className="relative group cursor-pointer select-none"
      style={{ transformStyle: 'preserve-3d', rotateX, rotateY, perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => soundService.play('hover')}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, zIndex: 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Link to={`/pokemon/${name}`} onClick={() => soundService.play('card')}>
        <div
          className="relative overflow-hidden rounded-2xl p-4 h-full"
          style={{
            background: `linear-gradient(135deg, ${typeColor.bg}22 0%, var(--bg-card) 60%, ${typeColor.bg}11 100%)`,
            border: `1px solid ${typeColor.bg}40`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${typeColor.bg}20`,
            transition: 'box-shadow 0.3s ease',
          }}
        >
          {/* Dynamic light follow cursor */}
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glowX} ${glowY}, ${typeColor.glow} 0%, transparent 60%)`,
            }}
          />

          {/* Background number */}
          <div
            className="absolute bottom-2 right-2 font-black opacity-5 select-none pointer-events-none"
            style={{ fontSize: '5rem', lineHeight: 1, fontFamily: 'var(--font-display)', color: typeColor.bg }}
          >
            {id}
          </div>

          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <span
              className="text-xs font-bold tracking-widest"
              style={{ color: typeColor.bg, fontFamily: 'var(--font-mono)' }}
            >
              {formatPokemonId(id)}
            </span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(id); soundService.play('favorite') }}
              className="relative z-10 p-1 transition-all hover:scale-125"
              aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <motion.div animate={{ scale: fav ? [1, 1.4, 1] : 1 }} transition={{ duration: 0.3 }}>
                {fav ? <FaHeart className="text-red-500 drop-shadow-lg" size={16} /> : <FiHeart className="text-gray-400" size={16} />}
              </motion.div>
            </button>
          </div>

          {/* Artwork */}
          <div className="flex justify-center items-center py-2 relative">
            <motion.div
              className="absolute inset-0 rounded-full opacity-30 blur-2xl"
              style={{ background: typeColor.gradient }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <LazyLoadImage
              src={getPokemonArtwork(id)}
              alt={capitalize(name)}
              width={100}
              height={100}
              className="relative z-10 object-contain drop-shadow-2xl"
              style={{ filter: `drop-shadow(0 4px 12px ${typeColor.glow})` }}
              effect="opacity"
              placeholderSrc={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
            />
          </div>

          {/* Name & Types */}
          <div className="mt-2">
            <h3
              className="font-bold text-base capitalize text-center mb-2 tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              {capitalize(name)}
            </h3>
            <div className="flex flex-wrap justify-center gap-1 min-h-[48px] items-center">
              {types.map((t) => <TypeBadge key={t} type={t} size="sm" />)}
            </div>
          </div>

          {/* Stats strip */}
          {(height !== undefined || weight !== undefined) && (
            <div className="mt-3 pt-3 grid grid-cols-2 gap-2 border-t border-white/5">
              {height !== undefined && (
                <div className="text-center">
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Height</div>
                  <div className="text-xs font-semibold">{(height / 10).toFixed(1)}m</div>
                </div>
              )}
              {weight !== undefined && (
                <div className="text-center">
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Weight</div>
                  <div className="text-xs font-semibold">{(weight / 10).toFixed(1)}kg</div>
                </div>
              )}
            </div>
          )}

          {/* Add to Team Button */}
          <div className="mt-3 pt-2.5 border-t border-white/5 flex gap-1.5 justify-center items-center relative z-10">
            <button
              disabled={adding}
              onClick={handleAddToTeam}
              className={`w-full py-1.5 rounded-xl font-bold text-[10px] tracking-wider uppercase transition-all flex items-center justify-center gap-1 ${
                currentTeam.some((t) => t.id === id)
                  ? 'bg-green-500/10 text-green-400 border border-green-500/25 cursor-default'
                  : 'bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/25 active:scale-95'
              }`}
            >
              {adding ? (
                <>
                  <div className="pokeball-spinner w-3.5 h-3.5" />
                  <span>Adding...</span>
                </>
              ) : currentTeam.some((t) => t.id === id) ? (
                'In Team ✓'
              ) : (
                '+ Add to Team'
              )}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default PokemonCard
