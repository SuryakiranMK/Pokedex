import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiX, FiClock } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store'
import { useAllPokemonNames } from '../../hooks/usePokeAPI'
import { capitalize, fuzzyMatch, extractIdFromUrl } from '../../utils/helpers'
import { getPokemonSprite } from '../../api/pokemon'
import { soundService } from '../../services/sound'

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  expandable?: boolean
  large?: boolean
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search Pokémon by name or number...',
  className = '',
  expandable = false,
  large = false,
}) => {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { searchHistory, addSearchHistory, clearSearchHistory } = useUIStore()
  const { data: allPokemon } = useAllPokemonNames()

  const suggestions = query.length >= 1
    ? (() => {
        const q = query.toLowerCase().trim()
        const starts = (allPokemon ?? []).filter((p) => p.name.toLowerCase().startsWith(q))
        const contains = (allPokemon ?? []).filter((p) => !p.name.toLowerCase().startsWith(q) && (fuzzyMatch(p.name, q) || p.name.toLowerCase().includes(q)))
        return [...starts, ...contains].slice(0, 8)
      })()
    : (allPokemon ?? []).slice(0, 8)

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
    const items = suggestions
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
        <div className={`relative flex items-center glass transition-all duration-300 ${focused ? 'border-indigo-500/60 shadow-lg shadow-indigo-500/20' : 'border-white/10'} ${large ? 'rounded-2xl border' : 'rounded-2xl border'}`}>
          <div className={`${large ? 'pl-5' : 'pl-4'} flex items-center justify-center text-gray-400 pointer-events-none flex-shrink-0`}>
            <FiSearch size={large ? 20 : 18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIdx(-1); onSearch?.(e.target.value) }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`flex-1 bg-transparent outline-none placeholder:text-gray-500 font-medium ${large ? 'pl-4 pr-12 py-5 text-base' : 'pl-3 pr-10 py-3.5 text-sm'}`}
            aria-label="Search Pokémon"
            aria-autocomplete="list"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); onSearch?.('') }}
              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors ${large ? 'right-5' : 'right-4'}`}
            >
              <FiX size={large ? 18 : 16} />
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
              <div className="p-3 border-b border-white/5">
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent</span>
                  <button onClick={clearSearchHistory} className="text-xs text-indigo-400 hover:text-indigo-300">Clear</button>
                </div>
                {searchHistory.slice(0, 5).map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSelect(term)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-sm text-left"
                  >
                    <FiClock className="text-gray-500 flex-shrink-0" size={14} />
                    <span className="capitalize">{capitalize(term)}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Live suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                {!query && (
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Suggested Pokémon
                  </div>
                )}
                {suggestions.map((p, i) => {
                  const id = extractIdFromUrl(p.url)
                  return (
                    <motion.button
                      key={p.name}
                      onClick={() => handleSelect(p.name)}
                      className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-colors text-sm text-left ${i === selectedIdx ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5'}`}
                      whileHover={{ x: 4 }}
                    >
                      <img src={getPokemonSprite(id)} alt="" className="w-8 h-8 object-contain flex-shrink-0" />
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
