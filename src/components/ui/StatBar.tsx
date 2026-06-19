import React, { useEffect, useRef } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import { STAT_COLORS, STAT_LABELS } from '../../utils/constants'
import { getStatPercentage } from '../../utils/helpers'

interface StatBarProps {
  stat: string
  value: number
  max?: number
  showLabel?: boolean
}

const StatBar: React.FC<StatBarProps> = ({ stat, value, max = 255, showLabel = true }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const pct = getStatPercentage(value, max)
  const color = STAT_COLORS[stat] ?? '#a78bfa'
  const label = STAT_LABELS[stat] ?? stat

  const getStatColor = () => {
    if (value >= 100) return '#4ade80'
    if (value >= 70)  return color
    if (value >= 40)  return '#facc15'
    return '#f87171'
  }

  return (
    <div ref={ref} className="flex items-center gap-3 group">
      {showLabel && (
        <div className="w-20 text-right">
          <span className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
            {label}
          </span>
        </div>
      )}
      <div
        className="text-sm font-bold w-10 text-right tabular-nums"
        style={{ color: getStatColor(), fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </div>
      <div className="flex-1 stat-bar-track">
        <motion.div
          className="stat-bar-fill"
          style={{ backgroundColor: getStatColor(), boxShadow: `0 0 8px ${getStatColor()}80` }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <div className="w-8 text-xs text-right" style={{ color: 'var(--text-muted)' }}>
        {pct}%
      </div>
    </div>
  )
}

export default StatBar
