
export const TYPE_COLORS: Record<string, { bg: string; text: string; glow: string; gradient: string; particle: string }> = {
  normal:   { bg: '#A8A878', text: '#fff', glow: 'rgba(168,168,120,0.5)', gradient: 'from-[#A8A878] to-[#6D6D4E]', particle: '#A8A878' },
  fire:     { bg: '#F08030', text: '#fff', glow: 'rgba(240,128,48,0.6)',  gradient: 'from-[#F08030] to-[#C62828]', particle: '#FF6B35' },
  water:    { bg: '#6890F0', text: '#fff', glow: 'rgba(104,144,240,0.6)', gradient: 'from-[#6890F0] to-[#2196F3]', particle: '#00E5FF' },
  electric: { bg: '#F8D030', text: '#000', glow: 'rgba(248,208,48,0.7)',  gradient: 'from-[#F8D030] to-[#F9A825]', particle: '#FFE000' },
  grass:    { bg: '#78C850', text: '#fff', glow: 'rgba(120,200,80,0.5)',  gradient: 'from-[#78C850] to-[#388E3C]', particle: '#76FF03' },
  ice:      { bg: '#98D8D8', text: '#000', glow: 'rgba(152,216,216,0.5)', gradient: 'from-[#98D8D8] to-[#00ACC1]', particle: '#B2EBF2' },
  fighting: { bg: '#C03028', text: '#fff', glow: 'rgba(192,48,40,0.5)',   gradient: 'from-[#C03028] to-[#7B1FA2]', particle: '#FF1744' },
  poison:   { bg: '#A040A0', text: '#fff', glow: 'rgba(160,64,160,0.6)',  gradient: 'from-[#A040A0] to-[#6A1B9A]', particle: '#EA80FC' },
  ground:   { bg: '#E0C068', text: '#000', glow: 'rgba(224,192,104,0.5)', gradient: 'from-[#E0C068] to-[#8D6E63]', particle: '#FFCC02' },
  flying:   { bg: '#A890F0', text: '#fff', glow: 'rgba(168,144,240,0.5)', gradient: 'from-[#A890F0] to-[#7986CB]', particle: '#CFD8DC' },
  psychic:  { bg: '#F85888', text: '#fff', glow: 'rgba(248,88,136,0.6)',  gradient: 'from-[#F85888] to-[#AD1457]', particle: '#FF80AB' },
  bug:      { bg: '#A8B820', text: '#fff', glow: 'rgba(168,184,32,0.5)',  gradient: 'from-[#A8B820] to-[#558B2F]', particle: '#CCFF90' },
  rock:     { bg: '#B8A038', text: '#fff', glow: 'rgba(184,160,56,0.5)',  gradient: 'from-[#B8A038] to-[#5D4037]', particle: '#D7CCC8' },
  ghost:    { bg: '#705898', text: '#fff', glow: 'rgba(112,88,152,0.7)',  gradient: 'from-[#705898] to-[#1A237E]', particle: '#CE93D8' },
  dragon:   { bg: '#7038F8', text: '#fff', glow: 'rgba(112,56,248,0.7)',  gradient: 'from-[#7038F8] to-[#0D47A1]', particle: '#82B1FF' },
  dark:     { bg: '#705848', text: '#fff', glow: 'rgba(112,88,72,0.6)',   gradient: 'from-[#705848] to-[#212121]', particle: '#757575' },
  steel:    { bg: '#B8B8D0', text: '#000', glow: 'rgba(184,184,208,0.5)', gradient: 'from-[#B8B8D0] to-[#546E7A]', particle: '#ECEFF1' },
  fairy:    { bg: '#EE99AC', text: '#000', glow: 'rgba(238,153,172,0.6)', gradient: 'from-[#EE99AC] to-[#E91E63]', particle: '#F8BBD9' },
}

export const TYPE_EMOJI: Record<string, string> = {
  normal: '⚪', fire: '🔥', water: '💧', electric: '⚡', grass: '🌿', ice: '❄️',
  fighting: '🥊', poison: '☠️', ground: '🌍', flying: '🌬️', psychic: '🔮', bug: '🐛',
  rock: '🪨', ghost: '👻', dragon: '🐉', dark: '🌑', steel: '⚙️', fairy: '✨',
}

export const GENERATIONS = [
  { id: 1, name: 'Generation I', region: 'Kanto', range: [1, 151] },
  { id: 2, name: 'Generation II', region: 'Johto', range: [152, 251] },
  { id: 3, name: 'Generation III', region: 'Hoenn', range: [252, 386] },
  { id: 4, name: 'Generation IV', region: 'Sinnoh', range: [387, 493] },
  { id: 5, name: 'Generation V', region: 'Unova', range: [494, 649] },
  { id: 6, name: 'Generation VI', region: 'Kalos', range: [650, 721] },
  { id: 7, name: 'Generation VII', region: 'Alola', range: [722, 809] },
  { id: 8, name: 'Generation VIII', region: 'Galar', range: [810, 905] },
  { id: 9, name: 'Generation IX', region: 'Paldea', range: [906, 1025] },
]

export const REGIONS = [
  { id: 'kanto', name: 'Kanto', generation: 1, starters: ['bulbasaur', 'charmander', 'squirtle'], legendary: ['articuno', 'zapdos', 'moltres', 'mewtwo'], color: '#FF5252', description: 'The original region where Pokémon trainers begin their journey.' },
  { id: 'johto', name: 'Johto', generation: 2, starters: ['chikorita', 'cyndaquil', 'totodile'], legendary: ['raikou', 'entei', 'suicune', 'lugia', 'ho-oh'], color: '#7C4DFF', description: 'A region rich in tradition and steeped in mystery.' },
  { id: 'hoenn', name: 'Hoenn', generation: 3, starters: ['treecko', 'torchic', 'mudkip'], legendary: ['regirock', 'regice', 'registeel', 'latias', 'latios', 'kyogre', 'groudon', 'rayquaza'], color: '#00BCD4', description: 'A lush tropical region dominated by vast oceans.' },
  { id: 'sinnoh', name: 'Sinnoh', generation: 4, starters: ['turtwig', 'chimchar', 'piplup'], legendary: ['uxie', 'mesprit', 'azelf', 'dialga', 'palkia', 'giratina'], color: '#4CAF50', description: 'A region of mountains, lakes, and ancient mythology.' },
  { id: 'unova', name: 'Unova', generation: 5, starters: ['snivy', 'tepig', 'oshawott'], legendary: ['cobalion', 'terrakion', 'virizion', 'reshiram', 'zekrom', 'kyurem'], color: '#FF9800', description: 'A metropolitan region inspired by New York City.' },
  { id: 'kalos', name: 'Kalos', generation: 6, starters: ['chespin', 'fennekin', 'froakie'], legendary: ['xerneas', 'yveltal', 'zygarde'], color: '#E91E63', description: 'A beautiful region inspired by France, home to Mega Evolution.' },
  { id: 'alola', name: 'Alola', generation: 7, starters: ['rowlet', 'litten', 'popplio'], legendary: ['tapu-koko', 'tapu-lele', 'tapu-bulu', 'tapu-fini', 'cosmog', 'lunala', 'solgaleo'], color: '#FF6F00', description: 'A tropical paradise made of four beautiful islands.' },
  { id: 'galar', name: 'Galar', generation: 8, starters: ['grookey', 'scorbunny', 'sobble'], legendary: ['zacian', 'zamazenta', 'eternatus', 'kubfu'], color: '#1565C0', description: 'An industrial region inspired by Great Britain.' },
  { id: 'paldea', name: 'Paldea', generation: 9, starters: ['sprigatito', 'fuecoco', 'quaxly'], legendary: ['koraidon', 'miraidon'], color: '#6A1B9A', description: 'A vast open region inspired by the Iberian Peninsula.' },
]

export const STAT_COLORS: Record<string, string> = {
  hp: '#FF5959',
  attack: '#F5AC78',
  defense: '#FAE078',
  'special-attack': '#9DB7F5',
  'special-defense': '#A7DB8D',
  speed: '#FA92B2',
}

export const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  speed: 'SPD',
}

export const FEATURED_POKEMON = [
  { id: 6, name: 'charizard', region: 'Kanto' },
  { id: 25, name: 'pikachu', region: 'Kanto' },
  { id: 149, name: 'dragonite', region: 'Kanto' },
  { id: 245, name: 'suicune', region: 'Johto' },
  { id: 249, name: 'lugia', region: 'Johto' },
  { id: 257, name: 'blaziken', region: 'Hoenn' },
  { id: 384, name: 'rayquaza', region: 'Hoenn' },
  { id: 448, name: 'lucario', region: 'Sinnoh' },
  { id: 483, name: 'dialga', region: 'Sinnoh' },
  { id: 658, name: 'greninja', region: 'Kalos' },
  { id: 800, name: 'necrozma', region: 'Alola' },
  { id: 888, name: 'zacian', region: 'Galar' },
]

export const TYPE_EFFECTIVENESS: Record<string, { superEffective: string[]; notEffective: string[]; immune: string[] }> = {
  normal:   { superEffective: [], notEffective: ['rock', 'steel'], immune: ['ghost'] },
  fire:     { superEffective: ['grass', 'ice', 'bug', 'steel'], notEffective: ['fire', 'water', 'rock', 'dragon'], immune: [] },
  water:    { superEffective: ['fire', 'ground', 'rock'], notEffective: ['water', 'grass', 'dragon'], immune: [] },
  electric: { superEffective: ['water', 'flying'], notEffective: ['electric', 'grass', 'dragon'], immune: ['ground'] },
  grass:    { superEffective: ['water', 'ground', 'rock'], notEffective: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'], immune: [] },
  ice:      { superEffective: ['grass', 'ground', 'flying', 'dragon'], notEffective: ['fire', 'water', 'ice', 'steel'], immune: [] },
  fighting: { superEffective: ['normal', 'ice', 'rock', 'dark', 'steel'], notEffective: ['poison', 'flying', 'psychic', 'bug', 'fairy'], immune: ['ghost'] },
  poison:   { superEffective: ['grass', 'fairy'], notEffective: ['poison', 'ground', 'rock', 'ghost'], immune: ['steel'] },
  ground:   { superEffective: ['fire', 'electric', 'poison', 'rock', 'steel'], notEffective: ['grass', 'bug'], immune: ['flying'] },
  flying:   { superEffective: ['grass', 'fighting', 'bug'], notEffective: ['electric', 'rock', 'steel'], immune: [] },
  psychic:  { superEffective: ['fighting', 'poison'], notEffective: ['psychic', 'steel'], immune: ['dark'] },
  bug:      { superEffective: ['grass', 'psychic', 'dark'], notEffective: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'], immune: [] },
  rock:     { superEffective: ['fire', 'ice', 'flying', 'bug'], notEffective: ['fighting', 'ground', 'steel'], immune: [] },
  ghost:    { superEffective: ['psychic', 'ghost'], notEffective: ['dark'], immune: ['normal', 'fighting'] },
  dragon:   { superEffective: ['dragon'], notEffective: ['steel'], immune: ['fairy'] },
  dark:     { superEffective: ['psychic', 'ghost'], notEffective: ['fighting', 'dark', 'fairy'], immune: [] },
  steel:    { superEffective: ['ice', 'rock', 'fairy'], notEffective: ['fire', 'water', 'electric', 'steel'], immune: [] },
  fairy:    { superEffective: ['fighting', 'dragon', 'dark'], notEffective: ['fire', 'poison', 'steel'], immune: [] },
}
