
export const TYPE_COLORS: Record<string, { bg: string; text: string; glow: string; gradient: string; particle: string }> = {
  normal:   { bg: '#A8A77A', text: '#fff', glow: 'rgba(168,167,122,0.5)', gradient: 'from-[#A8A77A] to-[#79795E]', particle: '#A8A77A' },
  fire:     { bg: '#EE8130', text: '#fff', glow: 'rgba(238,129,48,0.6)',  gradient: 'from-[#EE8130] to-[#C62828]', particle: '#FF6B35' },
  water:    { bg: '#6390F0', text: '#fff', glow: 'rgba(99,144,240,0.6)', gradient: 'from-[#6390F0] to-[#2196F3]', particle: '#00E5FF' },
  electric: { bg: '#F7D02C', text: '#000', glow: 'rgba(247,208,44,0.7)',  gradient: 'from-[#F7D02C] to-[#F9A825]', particle: '#FFE000' },
  grass:    { bg: '#7AC74C', text: '#fff', glow: 'rgba(122,199,76,0.5)',  gradient: 'from-[#7AC74C] to-[#388E3C]', particle: '#76FF03' },
  ice:      { bg: '#96D9D6', text: '#000', glow: 'rgba(150,217,214,0.5)', gradient: 'from-[#96D9D6] to-[#00ACC1]', particle: '#B2EBF2' },
  fighting: { bg: '#C22E28', text: '#fff', glow: 'rgba(194,46,40,0.5)',   gradient: 'from-[#C22E28] to-[#7B1FA2]', particle: '#FF1744' },
  poison:   { bg: '#A33EA1', text: '#fff', glow: 'rgba(163,62,161,0.6)',  gradient: 'from-[#A33EA1] to-[#6A1B9A]', particle: '#EA80FC' },
  ground:   { bg: '#E2BF65', text: '#000', glow: 'rgba(226,191,101,0.5)', gradient: 'from-[#E2BF65] to-[#8D6E63]', particle: '#FFCC02' },
  flying:   { bg: '#A98FF3', text: '#fff', glow: 'rgba(169,143,243,0.5)', gradient: 'from-[#A98FF3] to-[#7986CB]', particle: '#CFD8DC' },
  psychic:  { bg: '#F95587', text: '#fff', glow: 'rgba(249,85,135,0.6)',  gradient: 'from-[#F95587] to-[#AD1457]', particle: '#FF80AB' },
  bug:      { bg: '#A6B91A', text: '#fff', glow: 'rgba(166,185,26,0.5)',  gradient: 'from-[#A6B91A] to-[#558B2F]', particle: '#CCFF90' },
  rock:     { bg: '#B6A136', text: '#fff', glow: 'rgba(182,161,54,0.5)',  gradient: 'from-[#B6A136] to-[#5D4037]', particle: '#D7CCC8' },
  ghost:    { bg: '#735797', text: '#fff', glow: 'rgba(115,87,151,0.7)',  gradient: 'from-[#735797] to-[#1A237E]', particle: '#CE93D8' },
  dragon:   { bg: '#6F35FC', text: '#fff', glow: 'rgba(111,53,252,0.7)',  gradient: 'from-[#6F35FC] to-[#0D47A1]', particle: '#82B1FF' },
  dark:     { bg: '#705746', text: '#fff', glow: 'rgba(112,87,70,0.6)',   gradient: 'from-[#705746] to-[#212121]', particle: '#757575' },
  steel:    { bg: '#B7B7CE', text: '#000', glow: 'rgba(183,183,206,0.5)', gradient: 'from-[#B7B7CE] to-[#546E7A]', particle: '#ECEFF1' },
  fairy:    { bg: '#D685AD', text: '#000', glow: 'rgba(214,133,173,0.6)', gradient: 'from-[#D685AD] to-[#E91E63]', particle: '#F8BBD9' },
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
  ghost:    { superEffective: ['psychic', 'ghost'], notEffective: ['dark'], immune: ['normal'] },
  dragon:   { superEffective: ['dragon'], notEffective: ['steel'], immune: ['fairy'] },
  dark:     { superEffective: ['psychic', 'ghost'], notEffective: ['fighting', 'dark', 'fairy'], immune: [] },
  steel:    { superEffective: ['ice', 'rock', 'fairy'], notEffective: ['fire', 'water', 'electric', 'steel'], immune: [] },
  fairy:    { superEffective: ['fighting', 'dragon', 'dark'], notEffective: ['fire', 'poison', 'steel'], immune: [] },
}
