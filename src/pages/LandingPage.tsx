import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import SearchBar from '../components/ui/SearchBar'
import TypeBadge from '../components/ui/TypeBadge'
import { getPokemonArtwork } from '../api/pokemon'
import { fetchPokemon } from '../api/pokemon'
import { FEATURED_POKEMON, TYPE_COLORS, REGIONS } from '../utils/constants'
import { capitalize } from '../utils/helpers'
import { soundService } from '../services/sound'

// ── SVG Icons for Quick Nav ───────────────────────────────
const IconPokedex = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
  </svg>
)
const IconTeam = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconCompare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <polyline points="18 15 21 12 18 9" />
    <polyline points="6 9 3 12 6 15" />
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
)
const IconRegions = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
)
const IconTypes = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)
const IconBattle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)

// ── Animated counter ──────────────────────────────────────
const AnimatedCounter: React.FC<{ end: number; duration?: number; label: string }> = ({
  end, duration = 2000, label,
}) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const startTime = Date.now()
        const tick = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.round(eased * end))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <div ref={ref} className="text-center px-4">
      <div
        className="text-4xl md:text-5xl font-black gradient-text tabular-nums"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {count.toLocaleString()}
      </div>
      <div className="text-sm mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  )
}

const CATEGORIES = [
  { id: 'overall', name: 'Overall', color: '#6366F1' },
  { id: 'kanto', name: 'Kanto', color: '#FF5252' },
  { id: 'johto', name: 'Johto', color: '#7C4DFF' },
  { id: 'hoenn', name: 'Hoenn', color: '#00BCD4' },
  { id: 'sinnoh', name: 'Sinnoh', color: '#4CAF50' },
  { id: 'unova', name: 'Unova', color: '#FF9800' },
  { id: 'kalos', name: 'Kalos', color: '#E91E63' },
  { id: 'alola', name: 'Alola', color: '#FF6F00' },
  { id: 'galar', name: 'Galar', color: '#1565C0' },
  { id: 'paldea', name: 'Paldea', color: '#6A1B9A' },
]

const POKEMON_OF_THE_YEAR: Record<string, { id: number; name: string; region: string; rank: number; votes: number }[]> = {
  overall: [
    { id: 658, name: 'greninja', region: 'Kalos', rank: 1, votes: 140559 },
    { id: 448, name: 'lucario', region: 'Sinnoh', rank: 2, votes: 102259 },
    { id: 778, name: 'mimikyu', region: 'Alola', rank: 3, votes: 99077 },
    { id: 6, name: 'charizard', region: 'Kanto', rank: 4, votes: 93968 },
    { id: 197, name: 'umbreon', region: 'Johto', rank: 5, votes: 67062 },
  ],
  kanto: [
    { id: 6, name: 'charizard', region: 'Kanto', rank: 1, votes: 93968 },
    { id: 94, name: 'gengar', region: 'Kanto', rank: 2, votes: 60214 },
    { id: 1, name: 'bulbasaur', region: 'Kanto', rank: 3, votes: 54246 },
    { id: 25, name: 'pikachu', region: 'Kanto', rank: 4, votes: 37321 },
    { id: 133, name: 'eevee', region: 'Kanto', rank: 5, votes: 31001 },
  ],
  johto: [
    { id: 197, name: 'umbreon', region: 'Johto', rank: 1, votes: 67062 },
    { id: 248, name: 'tyranitar', region: 'Johto', rank: 2, votes: 56834 },
    { id: 249, name: 'lugia', region: 'Johto', rank: 3, votes: 53268 },
    { id: 157, name: 'typhlosion', region: 'Johto', rank: 4, votes: 38412 },
    { id: 212, name: 'scizor', region: 'Johto', rank: 5, votes: 34651 },
  ],
  hoenn: [
    { id: 384, name: 'rayquaza', region: 'Hoenn', rank: 1, votes: 60939 },
    { id: 282, name: 'gardevoir', region: 'Hoenn', rank: 2, votes: 60596 },
    { id: 330, name: 'flygon', region: 'Hoenn', rank: 3, votes: 41288 },
    { id: 254, name: 'sceptile', region: 'Hoenn', rank: 4, votes: 38724 },
    { id: 257, name: 'blaziken', region: 'Hoenn', rank: 5, votes: 36811 },
  ],
  sinnoh: [
    { id: 448, name: 'lucario', region: 'Sinnoh', rank: 1, votes: 102259 },
    { id: 445, name: 'garchomp', region: 'Sinnoh', rank: 2, votes: 61877 },
    { id: 405, name: 'luxray', region: 'Sinnoh', rank: 3, votes: 46253 },
    { id: 393, name: 'piplup', region: 'Sinnoh', rank: 4, votes: 38229 },
    { id: 390, name: 'infernape', region: 'Sinnoh', rank: 5, votes: 37441 },
  ],
  unova: [
    { id: 609, name: 'chandelure', region: 'Unova', rank: 1, votes: 50943 },
    { id: 571, name: 'zoroark', region: 'Unova', rank: 2, votes: 46271 },
    { id: 635, name: 'hydreigon', region: 'Unova', rank: 3, votes: 40122 },
    { id: 637, name: 'volcarona', region: 'Unova', rank: 4, votes: 37882 },
    { id: 612, name: 'haxorus', region: 'Unova', rank: 5, votes: 34229 },
  ],
  kalos: [
    { id: 658, name: 'greninja', region: 'Kalos', rank: 1, votes: 140559 },
    { id: 700, name: 'sylveon', region: 'Kalos', rank: 2, votes: 66029 },
    { id: 681, name: 'aegislash', region: 'Kalos', rank: 3, votes: 30221 },
    { id: 715, name: 'noivern', region: 'Kalos', rank: 4, votes: 22821 },
    { id: 706, name: 'goodra', region: 'Kalos', rank: 5, votes: 20110 },
  ],
  alola: [
    { id: 778, name: 'mimikyu', region: 'Alola', rank: 1, votes: 99077 },
    { id: 722, name: 'rowlet', region: 'Alola', rank: 2, votes: 34112 },
    { id: 724, name: 'decidueye', region: 'Alola', rank: 3, votes: 28221 },
    { id: 745, name: 'lycanroc', region: 'Alola', rank: 4, votes: 25110 },
    { id: 807, name: 'zeraora', region: 'Alola', rank: 5, votes: 22881 },
  ],
  galar: [
    { id: 887, name: 'dragapult', region: 'Galar', rank: 1, votes: 57973 },
    { id: 849, name: 'toxtricity', region: 'Galar', rank: 2, votes: 38221 },
    { id: 823, name: 'corviknight', region: 'Galar', rank: 3, votes: 35110 },
    { id: 872, name: 'snom', region: 'Galar', rank: 4, votes: 31220 },
    { id: 869, name: 'alcremie', region: 'Galar', rank: 5, votes: 28110 },
  ],
  paldea: [
    { id: 959, name: 'tinkaton', region: 'Paldea', rank: 1, votes: 78210 },
    { id: 937, name: 'ceruledge', region: 'Paldea', rank: 2, votes: 65110 },
    { id: 908, name: 'meowscarada', region: 'Paldea', rank: 3, votes: 54112 },
    { id: 1008, name: 'miraidon', region: 'Paldea', rank: 4, votes: 48110 },
    { id: 1007, name: 'koraidon', region: 'Paldea', rank: 5, votes: 45110 },
  ],
}

// ── Pokémon of the Year Carousel ─────────────────────────
const PokemonOfTheYearCarousel: React.FC = () => {
  const [activeRegion, setActiveRegion] = useState('overall')
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const featured = POKEMON_OF_THE_YEAR[activeRegion] || []

  const { data: pokemon } = useQuery({
    queryKey: ['pokemon', featured[current]?.name],
    queryFn: () => fetchPokemon(featured[current]?.name),
    staleTime: 1000 * 60 * 30,
    enabled: featured.length > 0 && !!featured[current]?.name,
  })

  const startAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrent((c) => {
        if (c >= featured.length - 1) {
          // Go to next category
          setActiveRegion((r) => {
            const idx = CATEGORIES.findIndex((cat) => cat.id === r)
            const nextIdx = (idx + 1) % CATEGORIES.length
            return CATEGORIES[nextIdx].id
          })
          return 0
        }
        return c + 1
      })
    }, 5000)
  }

  useEffect(() => {
    setCurrent(0)
    startAutoSlide()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeRegion])

  const goTo = (idx: number) => {
    setCurrent(idx)
    startAutoSlide()
    soundService.play('click')
  }

  const feat = featured[current]
  const primaryType = pokemon?.types[0]?.type.name ?? 'normal'
  const typeColor = TYPE_COLORS[primaryType] ?? TYPE_COLORS.normal

  return (
    <div
      className="glass-card overflow-hidden relative"
      style={{ boxShadow: `0 0 60px ${typeColor.glow}, 0 25px 50px rgba(0,0,0,0.5)` }}
    >
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2.5 p-4 md:p-6 border-b border-white/5 bg-black/10">
        {CATEGORIES.map((cat) => {
          const isActive = activeRegion === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveRegion(cat.id)
                soundService.play('click')
              }}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-black capitalize transition-all duration-300 border cursor-pointer ${isActive
                ? 'text-white border-white/20 shadow-lg'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              style={{
                background: isActive ? `linear-gradient(135deg, ${cat.color}cc, ${cat.color})` : undefined,
                boxShadow: isActive ? `0 4px 14px ${cat.color}40` : undefined,
              }}
            >
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Ambient glow bg */}
      <motion.div
        className="absolute inset-0 opacity-20 transition-all duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle at 70% 50%, ${typeColor.bg}, transparent 65%)` }}
        key={current}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 md:p-10">
        {feat && (
          <motion.div
            key={feat.id}
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="flex-shrink-0"
          >
            <img
              src={getPokemonArtwork(feat.id)}
              alt={feat.name}
              className="w-44 h-44 md:w-64 md:h-64 object-contain drop-shadow-2xl float"
              style={{ filter: `drop-shadow(0 10px 40px ${typeColor.glow})` }}
            />
          </motion.div>
        )}

        {feat && (
          <motion.div
            key={`info-${feat.id}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex-1 text-left"
          >
            <div className="text-xs font-mono mb-3 tracking-widest uppercase flex flex-wrap items-center gap-2" style={{ color: typeColor.bg }}>
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/35">
                🏆 Rank #{feat.rank}
              </span>
              <span className="text-gray-500 font-bold">·</span>
              <span className="text-white font-bold">{feat.votes.toLocaleString()} Votes</span>
              <span className="text-gray-500 font-bold">·</span>
              <span>#{String(feat.id).padStart(4, '0')} · {feat.region}</span>
            </div>
            <h3
              className="text-4xl md:text-5xl font-black capitalize mb-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              {capitalize(feat.name)}
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {(pokemon?.types ?? []).map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} size="md" />
              ))}
            </div>
            {pokemon && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'HP', val: pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat ?? '—' },
                  { label: 'ATK', val: pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat ?? '—' },
                  { label: 'SPD', val: pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat ?? '—' },
                ].map(({ label, val }) => (
                  <div
                    key={label}
                    className="rounded-xl px-3 py-2 text-center"
                    style={{ background: `${typeColor.bg}20`, border: `1px solid ${typeColor.bg}40` }}
                  >
                    <div className="text-xs font-mono mb-0.5" style={{ color: typeColor.bg }}>{label}</div>
                    <div className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{val}</div>
                  </div>
                ))}
              </div>
            )}
            <Link
              to={`/pokemon/${feat.name}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${typeColor.bg}, ${typeColor.bg}cc)`,
                color: typeColor.text,
                boxShadow: `0 6px 24px ${typeColor.glow}`,
              }}
              onClick={() => soundService.play('navigation')}
            >
              View Details
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 pb-6">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="transition-all rounded-full"
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              background: i === current ? typeColor.bg : 'rgba(255,255,255,0.2)',
              boxShadow: i === current ? `0 0 10px ${typeColor.glow}` : 'none',
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// ── Quick Nav Cards ───────────────────────────────────────
const QUICK_NAV = [
  {
    path: '/pokedex',
    label: 'Pokédex',
    desc: 'Browse all 1,025 Pokémon across every generation',
    icon: IconPokedex,
    color: '#818cf8',
    glow: 'rgba(129,140,248,0.35)',
    gradient: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    pokemonId: 25, // Pikachu
  },
  {
    path: '/team',
    label: 'Team Builder',
    desc: 'Craft the perfect 6-Pokémon roster for battle',
    icon: IconTeam,
    color: '#f472b6',
    glow: 'rgba(244,114,182,0.35)',
    gradient: 'linear-gradient(135deg, #be185d, #f472b6)',
    pokemonId: 448, // Lucario
  },
  {
    path: '/compare',
    label: 'Compare',
    desc: 'Side-by-side stat comparison between any two Pokémon',
    icon: IconCompare,
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.35)',
    gradient: 'linear-gradient(135deg, #0891b2, #22d3ee)',
    pokemonId: 150, // Mewtwo
  },
  {
    path: '/regions',
    label: 'Regions',
    desc: 'Explore Kanto, Johto, Hoenn and all 9 game regions',
    icon: IconRegions,
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.35)',
    gradient: 'linear-gradient(135deg, #b45309, #fbbf24)',
    pokemonId: 149, // Dragonite
  },
  {
    path: '/types',
    label: 'Types',
    desc: 'Interactive type chart, weaknesses & matchup calculator',
    icon: IconTypes,
    color: '#34d399',
    glow: 'rgba(52,211,153,0.35)',
    gradient: 'linear-gradient(135deg, #047857, #34d399)',
    pokemonId: 133, // Eevee
  },
  {
    path: '/battle',
    label: 'Battle',
    desc: 'Simulate real-time Pokémon battles with animated moves',
    icon: IconBattle,
    color: '#f87171',
    glow: 'rgba(248,113,113,0.35)',
    gradient: 'linear-gradient(135deg, #b91c1c, #f87171)',
    pokemonId: 658, // Greninja
  },
]

// ── Showcase Characters ──────────────────────────────────
const SHOWCASE_CHARACTERS = [
  {
    name: 'Professor Oak',
    image: 'https://archives.bulbagarden.net/media/upload/3/3e/Lets_Go_Pikachu_Eevee_Professor_Oak.png',
    haloColor: '#10B981',
    shadowGlow: 'rgba(16, 185, 129, 0.35)',
  },
  {
    name: 'Giovanni',
    image: 'https://archives.bulbagarden.net/media/upload/a/a7/Lets_Go_Pikachu_Eevee_Giovanni.png',
    haloColor: '#EF4444',
    shadowGlow: 'rgba(239, 68, 68, 0.35)',
  },
  {
    name: 'Arceus',
    image: getPokemonArtwork(493),
    haloColor: '#F59E0B',
    shadowGlow: 'rgba(245, 158, 11, 0.35)',
  },
  {
    name: 'Professor Kukui',
    image: 'https://archives.bulbagarden.net/media/upload/e/ed/Sun_Moon_Professor_Kukui.png',
    haloColor: '#06B6D4',
    shadowGlow: 'rgba(6, 182, 212, 0.35)',
  },
  {
    name: 'Professor Rowan',
    image: 'https://archives.bulbagarden.net/media/upload/a/a4/Diamond_Pearl_Rowan.png',
    haloColor: '#3B82F6',
    shadowGlow: 'rgba(59, 130, 246, 0.35)',
  },
  {
    name: 'Professor Sycamore',
    image: 'https://archives.bulbagarden.net/media/upload/8/81/XY_Professor_Sycamore.png',
    haloColor: '#EC4899',
    shadowGlow: 'rgba(236, 72, 153, 0.35)',
  },
]

// ── Main Landing Page ─────────────────────────────────────
const LandingPage: React.FC = () => {
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -100])
  const heroOpacity = useTransform(scrollY, [0, 350], [1, 0])

  const [showcaseIndex, setShowcaseIndex] = useState(() => Math.floor(Math.random() * SHOWCASE_CHARACTERS.length))

  // Prefetch showcase characters and Pokémon of the Year artworks in background to avoid latency during cycling
  useEffect(() => {
    const pokemonArtworks = Object.values(POKEMON_OF_THE_YEAR).flatMap(
      (list) => list.map((p) => getPokemonArtwork(p.id))
    )
    const imagesToPrefetch = [
      ...SHOWCASE_CHARACTERS.map((c) => c.image),
      ...pokemonArtworks,
    ]
    imagesToPrefetch.forEach((url) => {
      const img = new Image()
      img.src = url
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowcaseIndex((prev) => (prev + 1) % SHOWCASE_CHARACTERS.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const char = SHOWCASE_CHARACTERS[showcaseIndex]

  return (
    <div className="overflow-x-hidden w-full">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-12 overflow-hidden">
        {/* Floating Pokémon and Pokéballs background watermarks */}
        {[
          { id: 151, color: '#f85888', size: 100, x: 8, y: 15, delay: 0.2 },  // Mew
          { id: 251, color: '#78c850', size: 120, x: 25, y: 55, delay: 1.5 }, // Celebi
          { id: 494, color: '#f08030', size: 95, x: 45, y: 22, delay: 2.7 },  // Victini
          { id: 385, color: '#f8d030', size: 110, x: 65, y: 70, delay: 0.9 }, // Jirachi
          { id: 175, color: '#ee99ac', size: 85, x: 85, y: 18, delay: 3.4 },  // Togepi
          { id: 0, color: '#ef4444', size: 130, x: 75, y: 40, delay: 4.1 },   // Standard Pokéball
        ].map((item, i) => (
          <motion.div
            key={i}
            className="absolute opacity-[0.08] pointer-events-none"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: item.size,
              height: item.size,
            }}
            animate={{ y: [0, -24, 0], rotate: [0, 360] }}
            transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'linear', delay: item.delay }}
          >
            {item.id === 0 ? (
              <div className="w-full h-full rounded-full" style={{
                background: 'linear-gradient(to bottom, #ef4444 50%, #fff 50%)',
                border: '3px solid rgba(255,255,255,0.2)',
              }} />
            ) : (
              <img
                src={getPokemonArtwork(item.id)}
                alt=""
                className="w-full h-full object-contain filter grayscale opacity-80"
                style={{ filter: `drop-shadow(0 0 15px ${item.color})` }}
              />
            )}
          </motion.div>
        ))}

        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 items-center relative z-10 text-center lg:text-left">
          {/* Left Column — Text & Search */}
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="lg:col-span-7 space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-white/10 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span style={{ color: 'var(--text-secondary)' }}>1,025 Pokémon across 9 generations</span>
            </div>

            {/* Title */}
            <h1 className="hero-title gradient-text tracking-tight leading-tight">
              The Ultimate<br />Pokédex
            </h1>

            {/* Search input */}
            <div className="relative w-full max-w-2xl mx-auto lg:mx-0 my-10" style={{ zIndex: 20 }}>
              <SearchBar large={true} placeholder="Search by name or Pokédex number..." />
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-5" style={{ marginTop: '15px' }}>
              <Link
                to="/pokedex"
                className="px-8 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-2.5 hover:scale-105 active:scale-95 text-white"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                }}
                onClick={() => soundService.play('navigation')}
              >
                <IconPokedex /> Explore Pokédex
              </Link>
              <Link
                to="/team"
                className="px-8 py-4 rounded-2xl font-bold text-sm glass border border-white/15 hover:border-white/30 transition-all flex items-center gap-2.5 hover:scale-105 active:scale-95"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => soundService.play('navigation')}
              >
                <IconTeam /> Build a Team
              </Link>
              <Link
                to="/battle"
                className="px-8 py-4 rounded-2xl font-bold text-sm glass border border-white/15 hover:border-white/30 transition-all flex items-center gap-2.5 hover:scale-105 active:scale-95"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => soundService.play('navigation')}
              >
                <IconBattle /> Battle Arena
              </Link>
            </div>
          </motion.div>

          {/* Right Column — Cycling Portrait Showcase */}
          <motion.div
            style={{ y: heroY }}
            className="lg:col-span-5 flex justify-center lg:justify-end w-full"
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
          >
            <div className="relative select-none pointer-events-auto flex items-center justify-center min-h-[380px] md:min-h-[500px] w-full">
              {/* Outer decorative halo glow behind characters */}
              <motion.div
                key={`halo-${showcaseIndex}`}
                className="absolute w-64 h-64 md:w-[320px] md:h-[320px] rounded-full blur-2xl pointer-events-none"
                style={{ background: char.haloColor }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.25, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8 }}
              />

              {/* Float slow wrapper for the image */}
              <div className="float-slow relative z-10 flex items-center justify-center w-full h-full">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={char.name}
                    src={char.image}
                    alt={char.name}
                    className="w-96 h-96 md:w-[500px] md:h-[500px] object-contain drop-shadow-3xl"
                    style={{ filter: `drop-shadow(0 15px 35px ${char.shadowGlow})` }}
                    initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.92, rotate: 2 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ color: 'var(--text-muted)' }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-current flex justify-center pt-2">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-current" animate={{ y: [0, 16, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {[
              { end: 1025, label: 'Total Pokémon' },
              { end: 18, label: 'Types' },
              { end: 9, label: 'Generations' },
              { end: 9, label: 'Regions' },
              { end: 59, label: 'Legendary Pokémon' },
            ].map(({ end, label }, i) => (
              <motion.div
                key={label}
                className="glass-card py-6 px-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
              >
                <AnimatedCounter end={end} label={label} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── POKEMON OF THE YEAR CAROUSEL ── */}
      <section className="py-8 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-3xl md:text-4xl font-black mb-3 text-center gradient-text"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Pokémon of the Year
            </h2>
            <p className="text-center mb-10 text-base" style={{ color: 'var(--text-secondary)' }}>
              Official overall winners voted by millions of trainers worldwide
            </p>
            <PokemonOfTheYearCarousel />
          </motion.div>
        </div>
      </section>

      {/* ── QUICK NAV ── */}
      <section className="py-16 pb-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl font-black mb-3"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Explore Everything
            </h2>
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
              All the tools you need to master Pokémon
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {QUICK_NAV.map(({ path, label, desc, icon: Icon, color, glow, gradient, pokemonId }, i) => (
              <motion.div
                key={path}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to={path}
                  onClick={() => soundService.play('navigation')}
                  className="block h-full group shine"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid rgba(255,255,255,0.09)`,
                    borderRadius: '20px',
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.border = `1px solid ${color}55`
                    el.style.boxShadow = `0 8px 40px ${glow}, 0 0 0 1px ${color}22`
                    el.style.background = `rgba(255,255,255,0.07)`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.border = '1px solid rgba(255,255,255,0.09)'
                    el.style.boxShadow = 'none'
                    el.style.background = 'rgba(255,255,255,0.04)'
                  }}
                >
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: gradient }}
                  />

                  <div className="p-7 relative z-10">
                    {/* Icon container */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `${color}18`,
                        border: `1px solid ${color}35`,
                        boxShadow: `0 4px 20px ${glow}`,
                        color: color,
                      }}
                    >
                      <Icon />
                    </div>

                    {/* Label */}
                    <h3
                      className="font-bold text-xl mb-2.5"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                    >
                      {label}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-sm leading-relaxed mb-5 max-w-[70%]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {desc}
                    </p>

                    {/* CTA link */}
                    <div
                      className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-3 transition-all duration-300"
                      style={{ color }}
                    >
                      Explore
                      <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" className="group-hover:translate-x-1 transition-transform duration-300">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Floating Pokémon artwork image on the right/bottom */}
                  <div className="absolute right-0 bottom-0 w-32 h-32 pointer-events-none select-none z-0 overflow-visible">
                    <div className="w-full h-full float">
                      <img
                        src={getPokemonArtwork(pokemonId)}
                        alt=""
                        className="absolute -right-5 -bottom-5 w-28 h-28 object-contain opacity-25 group-hover:opacity-85 group-hover:scale-115 group-hover:-translate-y-2 group-hover:-rotate-6 transition-all duration-500 filter drop-shadow-2xl"
                        style={{ filter: `drop-shadow(0 10px 30px ${glow})` }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
