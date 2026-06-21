import React from 'react'
import { useRouteError, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getPokemonArtwork } from '../../api/pokemon'
import { soundService } from '../../services/sound'

export const GlobalErrorBoundary: React.FC = () => {
  const error = useRouteError() as any
  console.error('Captured application error:', error)

  const errorMessage = error?.message || error?.statusText || (typeof error === 'string' ? error : 'An unexpected error occurred.')

  return (
    <div className="min-h-screen bg-[#07070c] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative lightning background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

      {/* Main Error Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="glass-card max-w-lg w-full p-8 rounded-3xl border border-red-500/30 text-center relative z-10"
        style={{
          boxShadow: '0 20px 50px rgba(239, 68, 68, 0.15), 0 0 30px rgba(249, 115, 22, 0.1)'
        }}
      >
        {/* Rotom Artwork Header */}
        <div className="relative w-44 h-44 mx-auto mb-6 flex items-center justify-center animate-pulse">
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-red-500 rounded-full opacity-20 blur-xl"
            animate={{ scale: [1, 1.2, 1], rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.img
            src={getPokemonArtwork(479)} // Rotom ID is 479
            alt="Rotom"
            className="w-36 h-36 object-contain relative z-10"
            animate={{ y: [-8, 8, -8], rotate: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Title */}
        <h2 
          className="text-2xl md:text-3xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Rotom Detected an Error!
        </h2>
        
        {/* Description */}
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Bzzzt! It looks like some electrical interference crashed the Pokédex system. Rotom is trying its best to recover the interface!
        </p>

        {/* Error Detail Drawer */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-6 text-left max-h-36 overflow-y-auto scrollbar-thin">
          <div className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold mb-1">
            Error Log Summary:
          </div>
          <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-all">
            {errorMessage}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              soundService.play('click')
              window.location.reload()
            }}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Reload Interface
          </button>
          <Link
            to="/"
            onClick={() => soundService.play('navigation')}
            className="px-6 py-3 rounded-xl font-bold text-sm glass border border-white/10 text-gray-300 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            Back to Safety
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default GlobalErrorBoundary
