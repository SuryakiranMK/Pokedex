import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiX, FiClock } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store'
import { useAllPokemonNames } from '../../hooks/usePokeAPI'
import { capitalize, fuzzyMatch, extractIdFromUrl } from '../../utils/helpers'
import { getPokemonArtwork } from '../../api/pokemon'
import { soundService } from '../../services/sound'

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  expandable?: boolean
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search Pokémon by name or number...',
  className = '',
  expandable = false,
}) => {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { searchHistory, addSearchHistory, clearSearchHistory } = useUIStore()
  const { data: allPokemon } = useAllPokemonNames()

  const suggestions = query.length >= 1
    ? (allPokemon ?? [])
      .filter((p) => fuzzyMatch(p.name, query) || p.name.includes(query.toLowerCase()))
      .slice(0, 8)
    : []

  const handleSelect = useCallback((name: string) => {
    soundService.play('navigation')
    addSearchHistory(name)
    setQuery('')
    setFocused(false)
    if (onSearch) { onSearch(name) }
    else { navigate(`/pokemon/${name}`) }
  }, [navigate, onSearch, addSearchHistory])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!focused) return
    const items = query ? suggestions : []
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, -1)) }
    else if (e.key === 'Enter') {
      if (selectedIdx >= 0 && items[selectedIdx]) { handleSelect(items[selectedIdx].name) }
      else if (query) { handleSelect(query.toLowerCase().trim()) }
    }
    else if (e.key === 'Escape') { setFocused(false); inputRef.current?.blur() }
  }

  const showDropdown = focused && (suggestions.length > 0 || (searchHistory.length > 0 && !query))

  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={{ width: expandable && !focused ? '48px' : '100%' }}
        className="relative"
      >
        <div className={`relative flex items-center glass rounded-2xl border transition-all duration-300 ${focused ? 'border-indigo-500/60 shadow-lg shadow-indigo-500/20' : 'border-white/10'}`}>
          <FiSearch className="absolute left- text-gray-400" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIdx(-1); onSearch?.(e.target.value) }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent pl-11 pr-10 py-3.5 text-sm outline-none placeholder:text-gray-500 font-medium"
            aria-label="Search Pokémon"
            aria-autocomplete="list"
            autoComplete="off"
          />
          {query && (
            <button onClick={() => { setQuery(''); onSearch?.('') }} className="absolute right-4 text-gray-400 hover:text-white transition-colors">
              <FiX size={16} />
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 glass-dark rounded-2xl overflow-hidden z-50 border border-white/10"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
          >
            {/* Search history (when no query) */}
            {!query && searchHistory.length > 0 && (
              <div className="p-3">
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent</span>
                  <button onClick={clearSearchHistory} className="text-xs text-indigo-400 hover:text-indigo-300">Clear</button>
                </div>
                {searchHistory.slice(0, 5).map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSelect(term)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-sm"
                  >
                    <FiClock className="text-gray-500" size={14} />
                    <span className="capitalize">{capitalize(term)}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Live suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                {suggestions.map((p, i) => {
                  const id = extractIdFromUrl(p.url)
                  return (
                    <motion.button
                      key={p.name}
                      onClick={() => handleSelect(p.name)}
                      className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-colors text-sm ${i === selectedIdx ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5'}`}
                      whileHover={{ x: 4 }}
                    >
                      <img src={getPokemonArtwork(id)} alt="" className="w-8 h-8 object-contain" />
                      <span className="capitalize font-medium">{capitalize(p.name)}</span>
                      <span className="ml-auto text-xs text-gray-500 font-mono">#{String(id).padStart(4, '0')}</span>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchBar
