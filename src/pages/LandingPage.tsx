import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import SearchBar from '../components/ui/SearchBar'
import TypeBadge from '../components/ui/TypeBadge'
import { getPokemonArtwork } from '../api/pokemon'
import { fetchPokemon } from '../api/pokemon'
import { FEATURED_POKEMON, TYPE_COLORS } from '../utils/constants'
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

// ── Featured Pokémon Carousel ─────────────────────────────
const FeaturedCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const featured = FEATURED_POKEMON

  const { data: pokemon } = useQuery({
    queryKey: ['pokemon', featured[current].name],
    queryFn: () => fetchPokemon(featured[current].name),
    staleTime: 1000 * 60 * 30,
  })

  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % featured.length)
    }, 4000)
  }

  useEffect(() => {
    startAutoSlide()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const goTo = (idx: number) => {
    setCurrent(idx)
    if (intervalRef.current) clearInterval(intervalRef.current)
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
      {/* Ambient glow bg */}
      <motion.div
        className="absolute inset-0 opacity-20 transition-all duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle at 70% 50%, ${typeColor.bg}, transparent 65%)` }}
        key={current}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 md:p-10">
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

        <motion.div
          key={`info-${feat.id}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex-1 text-left"
        >
          <div className="text-xs font-mono mb-3 tracking-widest uppercase" style={{ color: typeColor.bg }}>
            #{String(feat.id).padStart(4, '0')} · {feat.region}
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
  },
  {
    path: '/team',
    label: 'Team Builder',
    desc: 'Craft the perfect 6-Pokémon roster for battle',
    icon: IconTeam,
    color: '#f472b6',
    glow: 'rgba(244,114,182,0.35)',
    gradient: 'linear-gradient(135deg, #be185d, #f472b6)',
  },
  {
    path: '/compare',
    label: 'Compare',
    desc: 'Side-by-side stat comparison between any two Pokémon',
    icon: IconCompare,
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.35)',
    gradient: 'linear-gradient(135deg, #0891b2, #22d3ee)',
  },
  {
    path: '/regions',
    label: 'Regions',
    desc: 'Explore Kanto, Johto, Hoenn and all 9 game regions',
    icon: IconRegions,
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.35)',
    gradient: 'linear-gradient(135deg, #b45309, #fbbf24)',
  },
  {
    path: '/types',
    label: 'Types',
    desc: 'Interactive type chart, weaknesses & matchup calculator',
    icon: IconTypes,
    color: '#34d399',
    glow: 'rgba(52,211,153,0.35)',
    gradient: 'linear-gradient(135deg, #047857, #34d399)',
  },
  {
    path: '/battle',
    label: 'Battle',
    desc: 'Simulate real-time Pokémon battles with animated moves',
    icon: IconBattle,
    color: '#f87171',
    glow: 'rgba(248,113,113,0.35)',
    gradient: 'linear-gradient(135deg, #b91c1c, #f87171)',
  },
]

// ── Main Landing Page ─────────────────────────────────────
const LandingPage: React.FC = () => {
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -100])
  const heroOpacity = useTransform(scrollY, [0, 350], [1, 0])

  // Rotating silhouettes
  const silhouettes = [1, 4, 7, 25, 39, 52, 63, 92, 104, 131, 143, 147]
  const [sIdx, setSIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSIdx((i) => (i + 1) % silhouettes.length), 2500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="overflow-x-hidden w-full">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12 text-center overflow-hidden">
        {/* Floating Pokéballs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10 pointer-events-none"
            style={{
              left: `${8 + i * 15}%`,
              top: `${15 + (i % 3) * 28}%`,
              width: 50 + i * 22,
              height: 50 + i * 22,
            }}
            animate={{ y: [0, -24, 0], rotate: [0, 360] }}
            transition={{ duration: 7 + i * 2, repeat: Infinity, ease: 'linear', delay: i * 0.9 }}
          >
            <div className="w-full h-full rounded-full" style={{
              background: 'linear-gradient(to bottom, #ef4444 50%, #fff 50%)',
              border: '3px solid rgba(255,255,255,0.3)',
            }} />
          </motion.div>
        ))}

        {/* Rotating silhouette */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.img
              key={silhouettes[sIdx]}
              src={getPokemonArtwork(silhouettes[sIdx])}
              alt=""
              aria-hidden="true"
              className="w-72 h-72 md:w-[480px] md:h-[480px] opacity-5"
              style={{ filter: 'brightness(0) invert(1)' }}
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 0.05, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.1, rotate: 10 }}
              transition={{ duration: 0.8 }}
            />
          </AnimatePresence>
        </motion.div>

        {/* Hero content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-white/10 text-sm mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span style={{ color: 'var(--text-secondary)' }}>1,025 Pokémon across 9 generations</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="hero-title gradient-text mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            The Ultimate<br />Pokédex
          </motion.h1>

          {/* Search */}
          <motion.div
            className="relative w-full max-w-xl mx-auto mb-10"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SearchBar placeholder="Search by name or Pokédex number..." />
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              to="/pokedex"
              className="px-8 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-2.5 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.45)',
                color: '#fff',
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
          </motion.div>
        </motion.div>

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

      {/* ── FEATURED CAROUSEL ── */}
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
              Featured Pokémon
            </h2>
            <p className="text-center mb-10 text-base" style={{ color: 'var(--text-secondary)' }}>
              Iconic Pokémon from every generation
            </p>
            <FeaturedCarousel />
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
            {QUICK_NAV.map(({ path, label, desc, icon: Icon, color, glow, gradient }, i) => (
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

                  <div className="p-7">
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
                      className="text-sm leading-relaxed mb-5"
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
