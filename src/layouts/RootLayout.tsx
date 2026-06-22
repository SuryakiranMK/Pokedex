import React from 'react'
import { Outlet, useLocation, ScrollRestoration, useOutlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import ParticleCanvas from '../components/ui/ParticleCanvas'
import BackgroundWatermarks from '../components/ui/BackgroundWatermarks'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
}

const RootLayout: React.FC = () => {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <div className="min-h-screen animated-gradient relative">
      <ScrollRestoration />
      {/* Aurora background */}
      <div className="aurora" aria-hidden="true" />

      {/* Particle system */}
      <ParticleCanvas count={50} />

      {/* Dynamic page-specific background watermarks */}
      <BackgroundWatermarks />

      {/* Navigation */}
      <Navbar />

      {/* Page content */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 pt-20 min-h-screen"
        >
          {outlet}
        </motion.main>
      </AnimatePresence>


      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Built with ❤️ using{' '}
            <span className="gradient-text font-semibold">PokéAPI</span>
            {' '}· Data © The Pokémon Company
          </p>
        </div>
      </footer>
    </div>
  )
}

export default RootLayout
