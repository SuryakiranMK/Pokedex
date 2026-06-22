import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useFavoritesStore, useTeamStore } from '../../store'
import { getPokemonArtwork } from '../../api/pokemon'

const LEGENDARIES = [
  150, 151, 243, 244, 245, 249, 250, 380, 381, 382, 383, 384, 
  483, 484, 487, 490, 492, 493, 494, 643, 644, 716, 717, 718, 
  791, 792, 800, 888, 889, 890, 1007, 1008
]

const EEVEELUTIONS = [
  133, 134, 135, 136, 196, 197, 470, 471, 700
]

const STARTERS = [
  1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393, 
  495, 498, 501, 650, 653, 656, 722, 725, 728, 810, 813, 
  816, 906, 909, 912
]

const PIKACHU_FAMILY = [
  25, 26, 172, 311, 312, 417, 587, 702, 777, 877
]

const WATERMARK_PRESETS = [
  { x: 6, y: 12, size: 140, delay: 0.2 },
  { x: 25, y: 28, size: 180, delay: 1.5 },
  { x: 45, y: 42, size: 150, delay: 2.7 },
  { x: 62, y: 58, size: 210, delay: 0.9 },
  { x: 86, y: 72, size: 160, delay: 3.4 },
  { x: 74, y: 88, size: 190, delay: 4.1 },
  { x: 12, y: 92, size: 150, delay: 1.2 },
  { x: 82, y: 35, size: 170, delay: 2.3 },
  { x: 38, y: 78, size: 160, delay: 0.7 },
  { x: 55, y: 18, size: 130, delay: 3.1 },
  { x: 18, y: 64, size: 180, delay: 1.8 },
  { x: 68, y: 48, size: 200, delay: 2.5 },
]

export const BackgroundWatermarks: React.FC = () => {
  const location = useLocation()
  const path = location.pathname
  const { currentTeam } = useTeamStore()
  const { favorites } = useFavoritesStore()

  // Resolve pool of candidates depending on current page path
  const candidates = useMemo(() => {
    if (path === '/') {
      return LEGENDARIES
    } else if (path.startsWith('/team')) {
      const teamIds = currentTeam.map((p) => p.id)
      return teamIds.length > 0 ? [...teamIds, ...LEGENDARIES] : LEGENDARIES
    } else if (path.startsWith('/types')) {
      return EEVEELUTIONS
    } else if (path.startsWith('/favorites')) {
      return favorites.length > 0 ? favorites : PIKACHU_FAMILY
    } else if (path.startsWith('/regions')) {
      return STARTERS
    }
    // Fallback: Mix starters and legendaries
    return [...STARTERS, ...LEGENDARIES]
  }, [path, currentTeam, favorites])

  // Select 12 random watermarks from the candidates list
  const watermarks = useMemo(() => {
    if (candidates.length === 0) return []
    const shuffled = [...candidates].sort(() => 0.5 - Math.random())
    const selectedIds = shuffled.slice(0, 12)
    
    // Fill up to 12 items if candidates list is too short
    while (selectedIds.length < 12) {
      selectedIds.push(LEGENDARIES[Math.floor(Math.random() * LEGENDARIES.length)])
    }

    return WATERMARK_PRESETS.map((preset, i) => ({
      ...preset,
      pokemonId: selectedIds[i],
    }))
  }, [candidates])

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0" aria-hidden="true">
      {watermarks.map((wm, i) => (
        <motion.div
          key={`${path}-${i}-${wm.pokemonId}`}
          className="absolute opacity-[0.06] pointer-events-none"
          style={{
            left: `${wm.x}%`,
            top: `${wm.y}%`,
            width: wm.size,
            height: wm.size,
          }}
          animate={{
            y: [0, -30, 30, -15, 0],
            x: [0, 20, -20, 15, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 16 + i * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: wm.delay,
          }}
        >
          <img
            src={getPokemonArtwork(wm.pokemonId)}
            alt=""
            className="w-full h-full object-contain filter grayscale opacity-90"
            onError={(e) => {
              // fallback to standard pikachu if form artwork not found
              const img = e.currentTarget as HTMLImageElement
              img.src = getPokemonArtwork(25)
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default BackgroundWatermarks
