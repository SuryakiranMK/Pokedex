import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronRight, FiAward } from 'react-icons/fi'
import { useMultiplePokemon } from '../hooks/usePokeAPI'
import { getPokemonArtwork } from '../api/pokemon'
import PokemonCard from '../components/pokemon/PokemonCard'
import { soundService } from '../services/sound'
import { capitalize } from '../utils/helpers'

const REGIONS = [
  'All', 'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea'
]

const CHARACTERS = [
  // ── KANTO ──
  {
    id: 'ash',
    name: 'Ash Ketchum',
    role: 'World Monarch Champion',
    region: 'Kanto',
    avatarId: 25,
    color: '#EF4444',
    description: 'The passionate trainer from Pallet Town who achieved his lifelong dream of becoming the World Monarch Champion alongside his partner Pikachu.',
    team: [25, 6, 658, 448, 254, 94], // Pikachu, Charizard, Greninja, Lucario, Sceptile, Gengar
  },
  {
    id: 'gary',
    name: 'Gary Oak',
    role: 'Rival & Researcher',
    region: 'Kanto',
    avatarId: 197,
    color: '#8B5CF6',
    description: 'Ash\'s long-time rival and grandson of Professor Oak, who transitioned from a flashy trainer to a dedicated Pokémon researcher.',
    team: [197, 9, 59, 212, 466, 31], // Umbreon, Blastoise, Arcanine, Scizor, Electivire, Nidoqueen
  },
  {
    id: 'red',
    name: 'Trainer Red',
    role: 'Living Legend',
    region: 'Kanto',
    avatarId: 25, // Pikachu (or we can use Charizard, let's keep Pikachu or Blastoise)
    color: '#DC2626',
    description: 'The silent champion of Kanto who stands as a living legend, waiting for challengers at the summit of Mt. Silver.',
    team: [25, 6, 9, 3, 143, 131], // Pikachu, Charizard, Blastoise, Venusaur, Snorlax, Lapras
  },
  {
    id: 'misty',
    name: 'Misty Waterflower',
    role: 'Gym Leader',
    region: 'Kanto',
    avatarId: 121,
    color: '#06B6D4',
    description: 'The Tomboyish Mermaid and Cerulean City Gym Leader who specializes in Water-type Pokémon and commands the deep oceans.',
    team: [121, 54, 130, 186, 222, 176], // Starmie, Psyduck, Gyarados, Politoed, Corsola, Togetic
  },
  {
    id: 'brock',
    name: 'Brock Harrison',
    role: 'Gym Leader / Doctor',
    region: 'Kanto',
    avatarId: 95,
    color: '#B45309',
    description: 'The former Pewter City Gym Leader specializing in Rock-types, who now studies to become a master Pokémon Doctor.',
    team: [95, 74, 208, 169, 272, 185], // Onix, Geodude, Steelix, Crobat, Ludicolo, Sudowoodo
  },
  // ── JOHTO ──
  {
    id: 'ethan',
    name: 'Ethan (Gold)',
    role: 'New Bark Champion',
    region: 'Johto',
    avatarId: 157,
    color: '#F59E0B',
    description: 'A high-spirited trainer from New Bark Town who completed his Johto journey, defeating Lance to become the Indigo Champion.',
    team: [157, 181, 468, 185, 130, 232], // Typhlosion, Ampharos, Togekiss, Sudowoodo, Red Gyarados, Donphan
  },
  {
    id: 'lance',
    name: 'Lance',
    role: 'Dragon Master',
    region: 'Johto',
    avatarId: 149,
    color: '#7F1D1D',
    description: 'The honorable Champion of the Johto League who commands legendary Dragon-types with absolute discipline.',
    team: [149, 130, 142, 6, 230, 373], // Dragonite, Gyarados, Aerodactyl, Charizard, Kingdra, Salamence
  },
  // ── HOENN ──
  {
    id: 'may',
    name: 'May Maple',
    role: 'Top Coordinator',
    region: 'Hoenn',
    avatarId: 257,
    color: '#EC4899',
    description: 'A cheerful coordinator who travels across regions making a name for herself in Pokémon Contests.',
    team: [257, 267, 300, 3, 8, 446], // Blaziken, Beautifly, Skitty, Venusaur, Wartortle, Munchlax
  },
  {
    id: 'steven',
    name: 'Steven Stone',
    role: 'Hoenn League Champion',
    region: 'Hoenn',
    avatarId: 376,
    color: '#6B7280',
    description: 'The Hoenn Champion who travels search of rare stones and utilizes steel-hard Steel/Rock Pokémon.',
    team: [376, 227, 344, 306, 346, 348], // Metagross, Skarmory, Claydol, Aggron, Cradily, Armaldo
  },
  {
    id: 'wallace',
    name: 'Wallace',
    role: 'Water Champion',
    region: 'Hoenn',
    avatarId: 350,
    color: '#0891B2',
    description: 'The graceful Water master who fluctuates between Gym Leader and Champion, matching combat with visual beauty.',
    team: [350, 73, 272, 340, 130, 365], // Milotic, Tentacruel, Ludicolo, Whiscash, Gyarados, Walrein
  },
  // ── SINNOH ──
  {
    id: 'dawn',
    name: 'Dawn Berlitz',
    role: 'Top Coordinator',
    region: 'Sinnoh',
    avatarId: 393,
    color: '#EC4899',
    description: 'A confident coordinator from Twinleaf Town who executes beautifully choreographed battles alongside Piplup.',
    team: [393, 427, 417, 473, 156, 468], // Piplup, Buneary, Pachirisu, Mamoswine, Quilava, Togekiss
  },
  {
    id: 'cynthia',
    name: 'Cynthia',
    role: 'Sinnoh League Champion',
    region: 'Sinnoh',
    avatarId: 445,
    color: '#1E1B4B',
    description: 'The brilliant archaeologist and Sinnoh Champion, feared by challengers for her tactical genius and Garchomp.',
    team: [445, 448, 350, 468, 407, 442], // Garchomp, Lucario, Milotic, Togekiss, Roserade, Spiritomb
  },
  {
    id: 'paul',
    name: 'Paul',
    role: 'Elite Rival',
    region: 'Sinnoh',
    avatarId: 466,
    color: '#4B5563',
    description: 'Ash\'s stern Sinnoh rival who demands peak strength and flawless battle execution from his team.',
    team: [466, 389, 430, 217, 452, 467], // Electivire, Torterra, Honchkrow, Ursaring, Drapion, Magmortar
  },
  // ── UNOVA ──
  {
    id: 'iris',
    name: 'Iris',
    role: 'Unova Champion',
    region: 'Unova',
    avatarId: 612,
    color: '#10B981',
    description: 'The energetic wild girl from the Village of Dragons who rose to become the Unova League Champion.',
    team: [612, 149, 530, 587, 635, 567], // Haxorus, Dragonite, Excadrill, Emolga, Hydreigon, Archeops
  },
  {
    id: 'alder',
    name: 'Alder',
    role: 'Former Champion',
    region: 'Unova',
    avatarId: 637,
    color: '#F59E0B',
    description: 'A wandering soul and former Unova Champion who teaches younger generations the joy of bonding with Pokémon.',
    team: [637, 626, 617, 589, 534, 621], // Volcarona, Bouffalant, Accelgor, Escavalier, Conkeldurr, Druddigon
  },
  {
    id: 'n',
    name: 'N',
    role: 'Hero of Truth',
    region: 'Unova',
    avatarId: 571, // Zoroark
    color: '#059669',
    description: 'The former king of Team Plasma who can hear the voices of Pokémon and seeks a world of pure coexistence.',
    team: [643, 571, 567, 565, 601, 584], // Reshiram, Zoroark, Archeops, Carracosta, Klingklang, Vanilluxe
  },
  // ── KALOS ──
  {
    id: 'serena',
    name: 'Serena Yvonne',
    role: 'Showcase Star',
    region: 'Kalos',
    avatarId: 700,
    color: '#EC4899',
    description: 'A performer from Vaniville Town who captured hearts in Pokémon Showcases alongside her partner Sylveon.',
    team: [655, 674, 700], // Delphox, Pancham, Sylveon
  },
  {
    id: 'diantha',
    name: 'Diantha',
    role: 'Movie Star & Champion',
    region: 'Kalos',
    avatarId: 282,
    color: '#E5E7EB',
    description: 'A famous movie actress and Champion of the Kalos region who Megas her Gardevoir to achieve absolute style.',
    team: [282, 701, 697, 699, 706, 711], // Gardevoir, Hawlucha, Tyrantrum, Aurorus, Goodra, Gourgeist
  },
  {
    id: 'alain',
    name: 'Alain',
    role: 'Mega Evolution Master',
    region: 'Kalos',
    avatarId: 6, // Charizard
    color: '#2563EB',
    description: 'Winner of the Lumiose Conference who seeks to master Mega Evolution alongside his Charizard X.',
    team: [6, 376, 248, 461, 625, 521], // Charizard, Metagross, Tyranitar, Weavile, Bisharp, Unfezant
  },
  // ── ALOLA ──
  {
    id: 'gladion',
    name: 'Gladion',
    role: 'Aether Rival',
    region: 'Alola',
    avatarId: 773,
    color: '#1F2937',
    description: 'Lillie\'s brother who wears his lone-wolf persona but cherishes his partner Silvally and Midnight Lycanroc.',
    team: [773, 745, 169, 448, 571, 474], // Silvally, Lycanroc (midnight), Crobat, Lucario, Zoroark, Porygon-z
  },
  {
    id: 'kukui',
    name: 'Professor Kukui',
    role: 'Alola Founder & Masked Royal',
    region: 'Alola',
    avatarId: 727,
    color: '#F59E0B',
    description: 'The energetic creator of the Alola League who secretly battles in the Battle Royal Dome as the Masked Royal.',
    team: [727, 745, 628, 38, 462, 143], // Incineroar, Lycanroc (midday), Braviary, Ninetales, Magnezone, Snorlax
  },
  // ── GALAR ──
  {
    id: 'leon',
    name: 'Leon',
    role: 'Undefeated Champion',
    region: 'Galar',
    avatarId: 6, // Charizard
    color: '#F59E0B',
    description: 'Galar\'s greatest undefeated Champion who guides trainers on their journey and Gigantamaxes Charizard.',
    team: [6, 887, 612, 681, 812, 815], // Charizard, Dragapult, Haxorus, Aegislash, Rillaboom, Cinderace
  },
  {
    id: 'raihan',
    name: 'Raihan',
    role: 'Dragon Gym Leader',
    region: 'Galar',
    avatarId: 884,
    color: '#EA580C',
    description: 'Leon\'s rival and Hammerlocke Gym Leader, specializing in using weather hazards alongside Dragon Pokémon.',
    team: [884, 330, 526, 844, 706, 776], // Duraludon, Flygon, Gigalith, Sandaconda, Goodra, Turtonator
  },
  {
    id: 'marnie',
    name: 'Marnie',
    role: 'Spikemuth Gym Leader',
    region: 'Galar',
    avatarId: 877,
    color: '#EC4899',
    description: 'The cool and composed Spikemuth Gym Leader who commands Dark-type Pokémon, supported by Team Yell.',
    team: [861, 877, 453, 510, 560], // Grimmsnarl, Morpeko, Toxicroak, Liepard, Scrafty
  },
  // ── PALDEA ──
  {
    id: 'nemona',
    name: 'Nemona',
    role: 'Champion Rank Student',
    region: 'Paldea',
    avatarId: 908,
    color: '#10B981',
    description: 'An enthusiastic battle-loving trainer of Champion Rank who guides and supports the academy classmates.',
    team: [908, 745, 706, 968, 923, 982], // Meowscarada, Lycanroc, Goodra, Orthworm, Pawmot, Dudunsparce
  },
  {
    id: 'geeta',
    name: 'La Primera Geeta',
    role: 'Top League Champion',
    region: 'Paldea',
    avatarId: 970,
    color: '#4338CA',
    description: 'The chairwoman of the Paldean Pokémon League and the Top Champion who oversees all Paldea Gym Leaders.',
    team: [970, 983, 955, 713, 976, 673], // Glimmora, Kingambit, Espathra, Avalugg, Veluza, Gogoat
  },
  {
    id: 'arven',
    name: 'Arven',
    role: 'Path of Legends Chef',
    region: 'Paldea',
    avatarId: 943,
    color: '#D97706',
    description: 'A student of the academy who cooks specialized meals to cure his partner Mabosstiff and study Herba Mystica.',
    team: [943, 820, 952, 944, 948, 91], // Mabosstiff, Greedent, Scovillain, Garganacl, Toedscruel, Cloyster
  },
]

const CharactersPage: React.FC = () => {
  const [activeRegion, setActiveRegion] = useState('All')
  const [selectedId, setSelectedId] = useState<string>('ash')

  const character = CHARACTERS.find((c) => c.id === selectedId) || CHARACTERS[0]

  // Query character's team members
  const { data: teamPokemon, isLoading: loadingTeam } = useMultiplePokemon(character.team)

  const filteredCharacters = CHARACTERS.filter((c) =>
    activeRegion === 'All' ? true : c.region.toLowerCase() === activeRegion.toLowerCase()
  )

  const handleSelect = (id: string) => {
    setSelectedId(id)
    soundService.play('click')
  }

  const handleRegionChange = (reg: string) => {
    setActiveRegion(reg)
    soundService.play('click')
    // Reset selected trainer to first match in region
    const firstMatch = CHARACTERS.find((c) => reg === 'All' ? true : c.region.toLowerCase() === reg.toLowerCase())
    if (firstMatch) setSelectedId(firstMatch.id)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-black gradient-text mb-1 flex items-center gap-2.5" style={{ fontFamily: 'var(--font-display)' }}>
          <FiAward className="text-indigo-400" /> Characters
        </h1>
      </motion.div>

      {/* Region filters */}
      <div className="flex flex-wrap gap-2 mb-8 tabs-scroll overflow-x-auto pb-2">
        {REGIONS.map((reg) => (
          <motion.button
            key={reg}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRegionChange(reg)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all cursor-pointer ${
              activeRegion === reg
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {reg}
          </motion.button>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Character Grid */}
        <div className="lg:col-span-5 space-y-3 max-h-[650px] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 gap-2.5">
            {filteredCharacters.map((c) => {
              const active = c.id === selectedId
              return (
                <motion.button
                  key={c.id}
                  whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
                  onClick={() => handleSelect(c.id)}
                  className={`flex items-center gap-4 p-3 rounded-2xl text-left border relative overflow-hidden transition-all group cursor-pointer ${
                    active
                      ? 'bg-indigo-500/10 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                      : 'bg-white/5 border-white/5 hover:border-white/15'
                  }`}
                >
                  {/* Floating silhouette background avatar */}
                  <img
                    src={getPokemonArtwork(c.avatarId)}
                    alt=""
                    className="absolute -right-3 -bottom-3 w-16 h-16 object-contain opacity-[0.04] group-hover:opacity-[0.1] transition-opacity duration-300 pointer-events-none"
                  />

                  {/* Representative Avatar */}
                  <div
                    className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center border transition-transform group-hover:scale-105"
                    style={{
                      background: `${c.color}15`,
                      borderColor: `${c.color}40`,
                    }}
                  >
                    <img
                      src={getPokemonArtwork(c.avatarId)}
                      alt={c.name}
                      className="w-9 h-9 object-contain drop-shadow-md"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm truncate" style={{ color: active ? '#a78bfa' : 'var(--text-primary)' }}>
                        {c.name}
                      </h3>
                      <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-400">
                        {c.region}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                      {c.role}
                    </p>
                  </div>
                  <div className="text-gray-500 flex-shrink-0">
                    <FiChevronRight size={16} />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Right Side: Showcase & Pokémon Team Grid */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={character.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-6 rounded-3xl relative overflow-hidden"
              style={{
                border: `1px solid ${character.color}35`,
                background: `linear-gradient(135deg, ${character.color}15 0%, var(--bg-card) 60%)`,
                boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 30px ${character.color}10`,
              }}
            >
              {/* Tech Scanlines */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)'
              }} />

              {/* Bio Details */}
              <div className="flex items-start gap-5 mb-6 relative z-10">
                <div
                  className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center border float"
                  style={{
                    background: `${character.color}25`,
                    borderColor: `${character.color}50`,
                    boxShadow: `0 8px 24px ${character.color}30`,
                  }}
                >
                  <img
                    src={getPokemonArtwork(character.avatarId)}
                    alt=""
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/5">
                      {character.region} Region
                    </span>
                    <span
                      className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full font-bold"
                      style={{ background: `${character.color}20`, color: character.color }}
                    >
                      {character.role}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black mt-2" style={{ fontFamily: 'var(--font-display)' }}>
                    {character.name}
                  </h2>
                  <p className="text-xs text-gray-300 leading-relaxed mt-2.5 max-w-xl">
                    {character.description}
                  </p>
                </div>
              </div>

              {/* Team list */}
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-white/5 pb-2">
                  Signature Team Roster ({character.team.length} Pokémon)
                </h3>

                {loadingTeam ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="pokeball-spinner w-10 h-10 glow" />
                    <span className="text-xs font-mono text-indigo-400 tracking-widest animate-pulse uppercase">Syncing Trainer Team...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {teamPokemon?.map((p) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      >
                        <PokemonCard
                          id={p.id}
                          name={p.name}
                          types={p.types.map((t) => t.type.name)}
                          viewMode="grid"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default CharactersPage
