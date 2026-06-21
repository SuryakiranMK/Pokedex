import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHome, FiGrid, FiUsers, FiGitBranch, FiMap, FiZap,
  FiHeart, FiShield, FiVolume2, FiVolumeX, FiMenu, FiX,
} from 'react-icons/fi'
import SearchBar from '../ui/SearchBar'
import { useSoundStore } from '../../store'
import { soundService } from '../../services/sound'
import { getPokemonArtwork } from '../../api/pokemon'

const NAV_LINKS = [
  { path: '/',            label: 'Home',        icon: FiHome },
  { path: '/pokedex',     label: 'Pokédex',     icon: FiGrid },
  { path: '/compare',     label: 'Compare',     icon: FiGitBranch },
  { path: '/team',        label: 'Team',        icon: FiUsers },
  { path: '/favorites',   label: 'Favorites',   icon: FiHeart },
  { path: '/regions',     label: 'Regions',     icon: FiMap },
  { path: '/types',       label: 'Types',       icon: FiZap },
  { path: '/battle',      label: 'Battle',      icon: FiShield },
]

const PIKACHU_FORMS = [
  25,    // Pikachu
  10080, // Pikachu Rock Star
  10081, // Pikachu Belle
  10082, // Pikachu Pop Star
  10083, // Pikachu Ph.D.
  10084, // Pikachu Libre
  10085, // Pikachu Cosplay
  10094, // Pikachu Original Cap
  10095, // Pikachu Hoenn Cap
  10096, // Pikachu Sinnoh Cap
  10097, // Pikachu Unova Cap
  10098, // Pikachu Kalos Cap
  10099, // Pikachu Alola Cap
  10148, // Pikachu Partner Cap
]

const Navbar: React.FC = () => {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { muted, toggleMuted } = useSoundStore()
  const [pikachuId, setPikachuId] = useState(25)

  // Choose a random costume on load
  useEffect(() => {
    const randomForm = PIKACHU_FORMS[Math.floor(Math.random() * PIKACHU_FORMS.length)]
    setPikachuId(randomForm)
  }, [])

  // Switch to another random costume when hovered
  const handlePikachuHover = () => {
    const currentIndex = PIKACHU_FORMS.indexOf(pikachuId)
    const otherForms = PIKACHU_FORMS.filter((_, idx) => idx !== currentIndex)
    const nextForm = otherForms[Math.floor(Math.random() * otherForms.length)]
    setPikachuId(nextForm)
    soundService.play('hover')
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(10, 10, 20, 0.85)' : 'rgba(10, 10, 20, 0.5)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="max-w-7xl mx-auto pl-6 pr-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" onClick={() => soundService.play('navigation')}>
            <img
              src={getPokemonArtwork(pikachuId)}
              alt="Pikachu Mascot"
              className="w-7 h-7 object-contain hover:scale-125 hover:rotate-12 transition-transform duration-300 pointer-events-auto cursor-pointer"
              style={{ filter: 'drop-shadow(0 0 6px rgba(248, 208, 48, 0.8))' }}
              onMouseEnter={handlePikachuHover}
            />
            <span className="font-black text-xl tracking-tight gradient-text" style={{ fontFamily: 'var(--font-display)' }}>
              PokéDex
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-4">
            {NAV_LINKS.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => soundService.play('navigation')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-medium transition-all ${isActive(path) ? 'nav-active' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block w-56">
              <SearchBar placeholder="Search..." />
            </div>
            <button
              onClick={() => { toggleMuted(); soundService.play('click') }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
            </button>
            <button
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-16 left-0 right-0 z-30 glass-dark border-b border-white/10 p-4 lg:hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SearchBar className="mb-4" />
              <div className="grid grid-cols-2 gap-2">
                {NAV_LINKS.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => soundService.play('navigation')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(path) ? 'nav-active' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
