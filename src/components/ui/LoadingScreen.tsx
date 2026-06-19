import React from 'react'
import { motion } from 'framer-motion'

interface LoadingScreenProps {
  message?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading Database...' }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#0a0a14] noise"
    >
      <div className="absolute inset-0 bg-radial-gradient from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
      
      <div className="relative flex flex-col items-center gap-6 z-10">
        {/* Animated Pokéball Spinner */}
        <div className="relative">
          <div className="pokeball-spinner glow" />
          <div className="absolute -inset-4 rounded-full border border-indigo-500/20 animate-ping opacity-40" />
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display font-bold text-2xl tracking-wider gradient-text uppercase"
          >
            SYSTEM INITIALIZING
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="text-xs text-indigo-300/60 font-mono tracking-widest mt-2 uppercase"
          >
            {message}
          </motion.p>
        </div>
      </div>

      {/* Decorative details */}
      <div className="absolute bottom-10 left-10 font-mono text-[10px] text-indigo-500/30 flex flex-col gap-1">
        <div>SYS.LOC: ROUTER_ESTABLISHED</div>
        <div>SYS.NET: API_READY</div>
      </div>
      <div className="absolute bottom-10 right-10 font-mono text-[10px] text-indigo-500/30">
        v2.5.0-ALPHA
      </div>
    </motion.div>
  )
}
export default LoadingScreen
