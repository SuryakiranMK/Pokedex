import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { TYPE_COLORS, TYPE_EFFECTIVENESS } from '../utils/constants'
import { capitalize } from '../utils/helpers'
import TypeBadge from '../components/ui/TypeBadge'
import TypeIcon from '../components/ui/TypeIcons'
import { soundService } from '../services/sound'
import { FiSliders, FiZap, FiShield, FiHeart } from 'react-icons/fi'

const ALL_TYPES = Object.keys(TYPE_COLORS)

const getMultiplier = (atk: string, def1: string, def2: string | null): number => {
  const getSingle = (a: string, d: string): number => {
    const eff = TYPE_EFFECTIVENESS[a]
    if (!eff) return 1
    if (eff.immune.includes(d)) return 0
    if (eff.superEffective.includes(d)) return 2
    if (eff.notEffective.includes(d)) return 0.5
    return 1
  }
  const m1 = getSingle(atk, def1)
  const m2 = def2 ? getSingle(atk, def2) : 1
  return m1 * m2
}

const cellColor = (m: number) => {
  if (m === 0)   return { bg: 'rgba(75, 85, 99, 0.4)', text: '#9ca3af', label: '0' }
  if (m === 0.25) return { bg: 'rgba(239, 68, 68, 0.25)', text: '#f87171', label: '¼' }
  if (m === 0.5) return { bg: 'rgba(239, 68, 68, 0.12)',  text: '#fca5a5', label: '½' }
  if (m === 2)   return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', label: '2' }
  if (m === 4)   return { bg: 'rgba(16, 185, 129, 0.3)', text: '#6ee7b7', label: '4' }
  return { bg: 'transparent', text: 'rgba(255,255,255,0.06)', label: '•' }
}

const TypesPage: React.FC = () => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [hoveredCol, setHoveredCol] = useState<string | null>(null)

  const handleToggleType = (type: string) => {
    soundService.play('click')
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    } else {
      if (selectedTypes.length >= 2) {
        // Replace secondary with next selected
        setSelectedTypes([selectedTypes[0], type])
      } else {
        setSelectedTypes([...selectedTypes, type])
      }
    }
  }

  // Calculate defenses & offenses if any type is selected
  const primary = selectedTypes[0]
  const secondary = selectedTypes[1] || null

  const primaryColor = primary ? TYPE_COLORS[primary] : null
  const secondaryColor = secondary ? TYPE_COLORS[secondary] : null

  // Defensive effectiveness
  const defenses = primary
    ? ALL_TYPES.map((t) => ({
        type: t,
        multiplier: getMultiplier(t, primary, secondary),
      }))
    : []

  const doubleWeak = defenses.filter((d) => d.multiplier === 4)
  const weak = defenses.filter((d) => d.multiplier === 2)
  const resistant = defenses.filter((d) => d.multiplier === 0.5)
  const doubleResistant = defenses.filter((d) => d.multiplier === 0.25)
  const immune = defenses.filter((d) => d.multiplier === 0)

  // Offensive coverage (union of super-effective types)
  const strengths = primary
    ? Array.from(
        new Set([
          ...(TYPE_EFFECTIVENESS[primary]?.superEffective ?? []),
          ...(secondary ? (TYPE_EFFECTIVENESS[secondary]?.superEffective ?? []) : []),
        ])
      )
    : []

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 page-enter relative z-10 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-black gradient-text mb-1 flex items-center gap-2.5" style={{ fontFamily: 'var(--font-display)' }}>
          <FiZap className="text-indigo-400" /> Type Matchup Calculator
        </h1>
        <p className="text-sm text-gray-400">
          Select up to two types to calculate combined weaknesses, resistances, strengths, and explore matching Pokémon.
        </p>
      </motion.div>

      {/* 1. All Types Buttons Grid (Top Selector) */}
      <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden">
        {/* Decorative background glows */}
        {primaryColor && (
          <div
            className="absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl opacity-20 transition-all duration-700 pointer-events-none"
            style={{ background: primaryColor.bg }}
          />
        )}
        {secondaryColor && (
          <div
            className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full blur-3xl opacity-15 transition-all duration-700 pointer-events-none"
            style={{ background: secondaryColor.bg }}
          />
        )}

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-gray-300">
              Select Types (Max 2)
            </h2>
            {selectedTypes.length > 0 && (
              <button
                onClick={() => { setSelectedTypes([]); soundService.play('click') }}
                className="text-xs text-red-400 hover:text-red-300 transition-colors font-bold uppercase tracking-wider"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ALL_TYPES.map((t) => {
              const isSelected = selectedTypes.includes(t)
              const orderIdx = selectedTypes.indexOf(t)
              const colors = TYPE_COLORS[t]
              return (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleToggleType(t)}
                  className={`py-3 rounded-2xl text-xs font-black capitalize transition-all border text-center cursor-pointer flex items-center justify-center gap-2.5 relative overflow-hidden ${
                    isSelected ? 'text-white shadow-md' : 'text-gray-300'
                  }`}
                  style={{
                    background: isSelected ? colors?.bg : `${colors?.bg}14`,
                    borderColor: isSelected ? '#ffffff50' : `${colors?.bg}30`,
                    boxShadow: isSelected ? `0 6px 15px ${colors?.glow}` : 'none',
                  }}
                >
                  <TypeIcon type={t} size={15} color={isSelected ? '#ffffff' : colors?.bg} />
                  <span className="font-bold tracking-wide text-[11px]">{capitalize(t)}</span>
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-black/40 border border-white/20 text-[8px] flex items-center justify-center font-bold">
                      {orderIdx + 1}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2. Dropdown Matchup Details Box */}
      <AnimatePresence>
        {selectedTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -15, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -15, height: 0 }}
            className="glass-card rounded-3xl overflow-hidden border border-white/5 relative"
            style={{
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              background: `linear-gradient(135deg, ${primaryColor?.bg}0c 0%, var(--bg-card) 60%)`,
            }}
          >
            <div className="p-6 space-y-6">
              {/* Heading */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Matchup Analysis</span>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-lg font-black text-white">Selected Profile:</span>
                    <TypeBadge type={primary} size="md" />
                    {secondary && (
                      <>
                        <span className="text-gray-500 font-bold">+</span>
                        <TypeBadge type={secondary} size="md" />
                      </>
                    )}
                  </div>
                </div>

                {/* Redirect Find Pokémon Button */}
                <Link
                  to={`/pokedex?types=${selectedTypes.join(',')}`}
                  onClick={() => soundService.play('navigation')}
                  className="px-8 py-4 rounded-2xl text-sm font-black text-white shadow-xl cursor-pointer hover:scale-[1.05] active:scale-[0.97] transition-all duration-300 text-center flex items-center justify-center gap-2.5 hover:brightness-110 hover:shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor?.bg || '#6366f1'}, ${secondaryColor?.bg || primaryColor?.bg || '#ec4899'})`,
                    boxShadow: `0 8px 24px ${primaryColor?.glow || 'rgba(99,102,241,0.45)'}`,
                  }}
                >
                  🔍 Find Pokémon
                </Link>
              </div>

              {/* 3-Column stats info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Defensive Weakness */}
                <div className="space-y-4 bg-red-500/[0.02] border border-red-500/10 p-4 rounded-2xl">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-1.5 border-b border-red-500/10 pb-2">
                    <FiShield /> Weaknesses (Defending)
                  </h3>
                  
                  {doubleWeak.length === 0 && weak.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No weaknesses found.</p>
                  ) : (
                    <div className="space-y-3">
                      {doubleWeak.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider block">Takes 4x Damage</span>
                          <div className="flex flex-wrap gap-1.5">
                            {doubleWeak.map((d) => (
                              <TypeBadge key={d.type} type={d.type} size="sm" />
                            ))}
                          </div>
                        </div>
                      )}
                      {weak.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-red-400/80 font-bold uppercase tracking-wider block">Takes 2x Damage</span>
                          <div className="flex flex-wrap gap-1.5">
                            {weak.map((d) => (
                              <TypeBadge key={d.type} type={d.type} size="sm" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Column 2: Defensive Resistances */}
                <div className="space-y-4 bg-green-500/[0.02] border border-green-500/10 p-4 rounded-2xl">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-green-400 flex items-center gap-1.5 border-b border-green-500/10 pb-2">
                    <FiShield /> Resistances & Immunities
                  </h3>

                  {doubleResistant.length === 0 && resistant.length === 0 && immune.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No resistances found.</p>
                  ) : (
                    <div className="space-y-3">
                      {immune.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block font-black">Takes 0x Damage (Immune)</span>
                          <div className="flex flex-wrap gap-1.5">
                            {immune.map((d) => (
                              <TypeBadge key={d.type} type={d.type} size="sm" />
                            ))}
                          </div>
                        </div>
                      )}
                      {doubleResistant.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-green-400 font-bold uppercase tracking-wider block">Takes ¼x Damage</span>
                          <div className="flex flex-wrap gap-1.5">
                            {doubleResistant.map((d) => (
                              <TypeBadge key={d.type} type={d.type} size="sm" />
                            ))}
                          </div>
                        </div>
                      )}
                      {resistant.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-green-400/80 font-bold uppercase tracking-wider block">Takes ½x Damage</span>
                          <div className="flex flex-wrap gap-1.5">
                            {resistant.map((d) => (
                              <TypeBadge key={d.type} type={d.type} size="sm" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Column 3: Offensive Strengths */}
                <div className="space-y-4 bg-indigo-500/[0.02] border border-indigo-500/10 p-4 rounded-2xl">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 border-b border-indigo-500/10 pb-2">
                    <FiHeart /> Offensive Strengths
                  </h3>

                  {strengths.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No offensive coverage records.</p>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase tracking-wider block font-black">Deals 2x Damage Against</span>
                      <div className="flex flex-wrap gap-1.5">
                        {strengths.map((t) => (
                          <TypeBadge key={t} type={t} size="sm" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Professional Interactive Type Matrix Chart */}
      <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="border-b border-white/5 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <FiSliders /> Type Effectiveness Matrix
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Interactive relationship grid: rows represent attacker types; columns represent defender types.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] font-mono text-gray-400">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500/35" /> 2x / 4x Super Effective</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500/25 border border-rose-500/30" /> ½x / ¼x Not Effective</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-gray-600/40 border border-gray-600/35" /> 0x Immune</div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="text-[10px] border-collapse w-full relative" style={{ minWidth: 680 }}>
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="p-2 text-left sticky left-0 z-20 bg-[#070710] border-r border-white/5" style={{ minWidth: 85 }}>
                  <span className="text-[9px] font-mono text-gray-500 font-bold">ATK ➔ / DEF ➔</span>
                </th>
                {ALL_TYPES.map((t) => {
                  const isHovered = hoveredCol === t
                  const isSelected = selectedTypes.includes(t)
                  return (
                    <th
                      key={t}
                      className="p-1 text-center select-none"
                      onMouseEnter={() => setHoveredCol(t)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      <div
                        title={capitalize(t)}
                        className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center transition-all border ${
                          isSelected
                            ? 'border-white scale-105 shadow'
                            : isHovered
                            ? 'border-white/20 opacity-100 scale-102'
                            : 'border-white/5 opacity-80'
                        }`}
                        style={{
                          background: TYPE_COLORS[t]?.bg,
                          boxShadow: isSelected ? `0 0 10px ${TYPE_COLORS[t]?.glow}` : undefined,
                        }}
                      >
                        <TypeIcon type={t} size={15} color="#ffffff" />
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {ALL_TYPES.map((atk) => {
                const isRowHovered = hoveredRow === atk
                const isSelectedAtk = selectedTypes.includes(atk)
                return (
                  <tr
                    key={atk}
                    className={`border-b border-white/5 transition-colors ${
                      isSelectedAtk
                        ? 'bg-indigo-500/10'
                        : isRowHovered
                        ? 'bg-white/[0.02]'
                        : ''
                    }`}
                    onMouseEnter={() => setHoveredRow(atk)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Attacking Row Header */}
                    <td
                      className="p-1.5 font-bold sticky left-0 z-10 bg-[#070710] border-r border-white/5 cursor-pointer hover:bg-white/5"
                      onClick={() => handleToggleType(atk)}
                    >
                      <div className="flex items-center gap-1.5">
                        <TypeIcon type={atk} size={16} color={TYPE_COLORS[atk]?.bg} />
                        <span
                          className="font-bold text-[10px] tracking-wide"
                          style={{ color: TYPE_COLORS[atk]?.bg }}
                        >
                          {capitalize(atk)}
                        </span>
                      </div>
                    </td>

                    {/* Matrix Cells */}
                    {ALL_TYPES.map((def) => {
                      const m = getMultiplier(atk, def, null)
                      const { bg, text, label } = cellColor(m)
                      const isColHovered = hoveredCol === def
                      const isCellActive = selectedTypes.includes(def) || selectedTypes.includes(atk)
                      
                      return (
                        <td
                          key={def}
                          className={`p-0.5 text-center transition-all ${
                            isColHovered ? 'bg-white/[0.015]' : ''
                          }`}
                          title={`${capitalize(atk)} ➔ ${capitalize(def)}: ×${m}`}
                        >
                          <div
                            className={`w-7 h-7 rounded-md flex items-center justify-center font-mono text-[9px] font-bold mx-auto transition-transform ${
                              isColHovered || isRowHovered ? 'scale-105' : ''
                            } ${isCellActive ? 'ring-1 ring-white/5' : ''}`}
                            style={{
                              background: bg,
                              color: text,
                            }}
                          >
                            {label}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TypesPage
