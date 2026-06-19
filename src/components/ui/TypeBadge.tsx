import React from 'react'
import { motion } from 'framer-motion'
import { TYPE_COLORS, TYPE_EMOJI } from '../../utils/constants'
import { capitalize } from '../../utils/helpers'
import { soundService } from '../../services/sound'

interface TypeBadgeProps {
  type: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
  onClick?: () => void
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type, size = 'md', showIcon = true, className = '', onClick }) => {
  const colors = TYPE_COLORS[type] ?? TYPE_COLORS.normal
  const emoji = TYPE_EMOJI[type] ?? '❓'

  const sizeClasses = {
    sm: 'text-[0.6rem] px-2 py-0.5 gap-1',
    md: 'text-[0.72rem] px-3 py-1 gap-1.5',
    lg: 'text-sm px-4 py-1.5 gap-2',
  }

  return (
    <motion.span
      whileHover={{ scale: 1.08, y: -1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        soundService.play('click')
        onClick?.()
      }}
      className={`type-badge ${sizeClasses[size]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        boxShadow: `0 2px 8px ${colors.glow}`,
      }}
      title={capitalize(type)}
    >
      {showIcon && <span className="text-sm leading-none">{emoji}</span>}
      {capitalize(type)}
    </motion.span>
  )
}

export default TypeBadge
