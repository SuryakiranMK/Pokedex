import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertTriangle, FiXCircle, FiInfo, FiX } from 'react-icons/fi'
import { useModalStore } from '../../store'

const CustomAlertModal: React.FC = () => {
  const { isOpen, title, message, type, closeModal } = useModalStore()

  const typeConfig = {
    error: {
      icon: <FiXCircle className="text-rose-400 shrink-0" size={32} />,
      color: '#F43F5E',
      glow: 'rgba(244, 63, 94, 0.4)',
      bg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(15, 15, 30, 0.95) 70%)',
    },
    warning: {
      icon: <FiAlertTriangle className="text-amber-400 shrink-0" size={32} />,
      color: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.4)',
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 15, 30, 0.95) 70%)',
    },
    info: {
      icon: <FiInfo className="text-indigo-400 shrink-0" size={32} />,
      color: '#6366F1',
      glow: 'rgba(99, 102, 241, 0.4)',
      bg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(15, 15, 30, 0.95) 70%)',
    },
  }

  const active = typeConfig[type] || typeConfig.info

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/65 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative w-full max-w-md rounded-2xl border overflow-hidden p-6 shadow-2xl relative z-10"
            style={{
              borderColor: `${active.color}45`,
              background: active.bg,
              boxShadow: `0 0 50px rgba(0,0,0,0.6), 0 0 30px ${active.glow}`,
            }}
          >
            {/* Spinning decorative PokeBall in the background */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 opacity-[0.03] pointer-events-none select-none z-0">
              <div className="w-full h-full rounded-full border-[10px] border-white relative flex items-center justify-center">
                <div className="w-full h-[10px] bg-white absolute" />
                <div className="w-14 h-14 rounded-full bg-white border-[10px] border-black flex items-center justify-center relative z-10" />
              </div>
            </div>

            {/* Header / Content */}
            <div className="flex gap-4 items-start relative z-10">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0"
                style={{
                  background: `${active.color}15`,
                  borderColor: `${active.color}35`,
                  boxShadow: `0 8px 20px ${active.color}20`,
                }}
              >
                {active.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3
                    className="text-xl font-black text-white tracking-wide"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {title}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                  >
                    <FiX size={18} />
                  </button>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mt-2.5">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end mt-6 relative z-10">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${active.color}, ${active.color}bb)`,
                  boxShadow: `0 4px 15px ${active.glow}`,
                }}
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CustomAlertModal
