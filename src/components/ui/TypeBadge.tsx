import React from 'react'
import { motion } from 'framer-motion'
import { TYPE_COLORS } from '../../utils/constants'
import { capitalize } from '../../utils/helpers'
import { soundService } from '../../services/sound'
import TypeIcon from './TypeIcons'

interface TypeBadgeProps {
  type: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
  onClick?: () => void
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type, size = 'md', showIcon = true, className = '', onClick }) => {
  const normType = type.toLowerCase()
  const colors = TYPE_COLORS[normType] ?? TYPE_COLORS.normal

  // Precise sizing to maintain the Pokémon HOME slanted pill proportions without collapsing
  const dimensions = {
    sm: {
      height: 24,
      iconWidth: 26,
      clipPath: 'polygon(0 0, 70% 0, 100% 100%, 0 100%)',
      fontSize: 'text-[10px]',
      iconSize: 11,
      minWidth: 72,
    },
    md: {
      height: 32,
      iconWidth: 36,
      clipPath: 'polygon(0 0, 74% 0, 100% 100%, 0 100%)',
      fontSize: 'text-[11.5px]',
      iconSize: 15,
      minWidth: 92,
    },
    lg: {
      height: 40,
      iconWidth: 44,
      clipPath: 'polygon(0 0, 78% 0, 100% 100%, 0 100%)',
      fontSize: 'text-sm',
      iconSize: 19,
      minWidth: 112,
    },
  }

  const dim = dimensions[size]

  return (
    <motion.span
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        soundService.play('click')
        onClick?.()
      }}
      className={`inline-flex items-center rounded-full overflow-hidden border border-white/8 relative z-10 transition-all ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        height: `${dim.height}px`,
        minWidth: `${dim.minWidth}px`,
        backgroundColor: showIcon ? '#262629' : colors.bg,
      }}
      title={capitalize(type)}
    >
      {showIcon && (
        <>
          {/* Slanted color background block on the left */}
          <div
            className="absolute left-0 top-0 bottom-0 z-0"
            style={{
              width: `${dim.iconWidth}px`,
              backgroundColor: colors.bg,
              clipPath: dim.clipPath,
            }}
          />
          {/* SVG Icon centered inside the slanted block */}
          <div 
            className="relative z-10 flex items-center justify-center h-full"
            style={{
              width: `${dim.iconWidth}px`,
              paddingRight: '4px', // slight offset to balance slant visual weight
            }}
          >
            <TypeIcon type={normType} size={dim.iconSize} color="#ffffff" />
          </div>
        </>
      )}

      {/* Type text on the right side */}
      <span
        className={`font-black tracking-wider relative z-10 flex-1 text-center ${dim.fontSize} ${
          showIcon ? 'pr-3.5 text-white' : 'px-4'
        }`}
        style={{
          color: showIcon ? '#ffffff' : colors.text,
          fontFamily: 'var(--font-display)',
          textShadow: showIcon ? '0 1.5px 3px rgba(0,0,0,0.65)' : 'none',
        }}
      >
        {capitalize(type)}
      </span>
    </motion.span>
  )
}

export default TypeBadge
