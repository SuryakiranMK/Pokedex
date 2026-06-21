import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronRight, FiAward } from 'react-icons/fi'
import { useSearchParams, Link } from 'react-router-dom'
import { useMultiplePokemon } from '../hooks/usePokeAPI'
import { getPokemonArtwork } from '../api/pokemon'
import { soundService } from '../services/sound'
import { capitalize } from '../utils/helpers'
import { REGIONS, TYPE_COLORS } from '../utils/constants'

const REGIONS_TABS = [
  'All', 'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea'
]

interface Character {
  id: string
  name: string
  role: string
  region: string
  hometown: string
  specialty: string
  avatarId: number
  image: string
  color: string
  description: string
  team: number[]
}

const CHARACTERS: Character[] = [
  // ── KANTO ──
  {
    id: 'ash',
    name: 'Ash Ketchum',
    role: 'World Monarch Champion',
    region: 'Kanto',
    hometown: 'Pallet Town',
    specialty: 'All-Rounder',
    avatarId: 25,
    image: 'https://archives.bulbagarden.net/media/upload/f/f6/Ash_Masters.png',
    color: '#EF4444',
    description: 'The passionate trainer from Pallet Town who achieved his lifelong dream of becoming the World Monarch Champion alongside his partner Pikachu.',
    team: [25, 6, 658, 448, 254, 94], // Pikachu, Charizard, Greninja, Lucario, Sceptile, Gengar
  },
  {
    id: 'gary',
    name: 'Gary Oak',
    role: 'Rival & Researcher',
    region: 'Kanto',
    hometown: 'Pallet Town',
    specialty: 'Various',
    avatarId: 197,
    image: 'https://archives.bulbagarden.net/media/upload/5/52/Gary_Masters.png',
    color: '#8B5CF6',
    description: 'Ash\'s long-time rival and grandson of Professor Oak, who transitioned from a flashy trainer to a dedicated Pokémon researcher.',
    team: [197, 9, 59, 212, 466, 31], // Umbreon, Blastoise, Arcanine, Scizor, Electivire, Nidoqueen
  },
  {
    id: 'red',
    name: 'Trainer Red',
    role: 'Living Legend',
    region: 'Kanto',
    hometown: 'Pallet Town',
    specialty: 'All-Rounder',
    avatarId: 25,
    image: 'https://archives.bulbagarden.net/media/upload/5/53/Red_Masters.png',
    color: '#DC2626',
    description: 'The silent champion of Kanto who stands as a living legend, waiting for challengers at the summit of Mt. Silver.',
    team: [25, 6, 9, 3, 143, 131], // Pikachu, Charizard, Blastoise, Venusaur, Snorlax, Lapras
  },
  {
    id: 'misty',
    name: 'Misty Waterflower',
    role: 'Gym Leader',
    region: 'Kanto',
    hometown: 'Cerulean City',
    specialty: 'Water',
    avatarId: 121,
    image: 'https://archives.bulbagarden.net/media/upload/a/a2/Misty_Masters.png',
    color: '#06B6D4',
    description: 'The Tomboyish Mermaid and Cerulean City Gym Leader who specializes in Water-type Pokémon and commands the deep oceans.',
    team: [121, 54, 130, 186, 222, 176], // Starmie, Psyduck, Gyarados, Politoed, Corsola, Togetic
  },
  {
    id: 'brock',
    name: 'Brock Harrison',
    role: 'Gym Leader / Doctor',
    region: 'Kanto',
    hometown: 'Pewter City',
    specialty: 'Rock',
    avatarId: 95,
    image: 'https://archives.bulbagarden.net/media/upload/c/cb/Brock_Masters.png',
    color: '#B45309',
    description: 'The former Pewter City Gym Leader specializing in Rock-types, who now studies to become a master Pokémon Doctor.',
    team: [95, 74, 208, 169, 272, 185], // Onix, Geodude, Steelix, Crobat, Ludicolo, Sudowoodo
  },
  {
    id: 'giovanni',
    name: 'Giovanni',
    role: 'Team Rocket Boss',
    region: 'Kanto',
    hometown: 'Viridian City',
    specialty: 'Ground',
    avatarId: 112,
    image: 'https://archives.bulbagarden.net/media/upload/b/b8/Giovanni_Masters.png',
    color: '#374151',
    description: 'The power-hungry leader of Team Rocket and former Viridian City Gym Leader, who seeks to control the world through strong Ground-type Pokémon.',
    team: [112, 31, 34, 53, 115, 150], // Rhydon, Nidoqueen, Nidoking, Persian, Kangaskhan, Mewtwo
  },
  {
    id: 'jessie',
    name: 'Jessie',
    role: 'Team Rocket Agent',
    region: 'Kanto',
    hometown: 'Unknown',
    specialty: 'Poison',
    avatarId: 336,
    image: 'https://archives.bulbagarden.net/media/upload/c/c5/Jessie_Masters.png',
    color: '#EC4899',
    description: 'A member of Team Rocket\'s trio who is determined, vain, and works hard to steal rare Pokémon for the boss, especially Ash\'s Pikachu.',
    team: [336, 24, 108, 711], // Seviper, Arbok, Lickitung, Gourgeist
  },
  {
    id: 'james',
    name: 'James',
    role: 'Team Rocket Agent',
    region: 'Kanto',
    hometown: 'Unknown',
    specialty: 'Poison',
    avatarId: 110,
    image: 'https://archives.bulbagarden.net/media/upload/8/87/James_Masters.png',
    color: '#3B82F6',
    description: 'Jessie\'s loyal partner in Team Rocket, born into a wealthy family but chose a life of crime, known for his deep bond with his grass/poison Pokémon.',
    team: [110, 71, 332, 707], // Weezing, Victreebel, Cacturne, Klefki
  },
  // ── JOHTO ──
  {
    id: 'ethan',
    name: 'Ethan (Gold)',
    role: 'New Bark Champion',
    region: 'Johto',
    hometown: 'New Bark Town',
    specialty: 'All-Rounder',
    avatarId: 157,
    image: 'https://archives.bulbagarden.net/media/upload/9/9f/Ethan_Masters.png',
    color: '#F59E0B',
    description: 'A high-spirited trainer from New Bark Town who completed his Johto journey, defeating Lance to become the Indigo Champion.',
    team: [157, 181, 468, 185, 130, 232], // Typhlosion, Ampharos, Togekiss, Sudowoodo, Red Gyarados, Donphan
  },
  {
    id: 'lyra',
    name: 'Lyra',
    role: 'Johto Champion',
    region: 'Johto',
    hometown: 'New Bark Town',
    specialty: 'Grass',
    avatarId: 154,
    image: 'https://archives.bulbagarden.net/media/upload/0/07/Lyra_Masters.png',
    color: '#EF4444',
    description: 'A cheerful trainer from New Bark Town who loves styling her dress and forms deep bonds with her grass-type partner Meganium.',
    team: [154, 183, 232, 34, 212, 468], // Meganium, Marill, Donphan, Nidoking, Scizor, Togekiss
  },
  {
    id: 'silver',
    name: 'Silver',
    role: 'Redemption Rival',
    region: 'Johto',
    hometown: 'New Bark Town',
    specialty: 'Various',
    avatarId: 160,
    image: 'https://archives.bulbagarden.net/media/upload/e/e5/Silver_Masters.png',
    color: '#DC2626',
    description: 'Giovanni\'s son who once believed only strong Pokémon had value, but learned to trust and cooperate with them over time.',
    team: [160, 250, 215, 149, 130, 227], // Feraligatr, Ho-Oh, Sneasel, Dragonite, Gyarados, Skarmory
  },
  {
    id: 'lance',
    name: 'Lance',
    role: 'Dragon Master',
    region: 'Johto',
    hometown: 'Blackthorn City',
    specialty: 'Dragon',
    avatarId: 149,
    image: 'https://archives.bulbagarden.net/media/upload/5/56/Lance_Masters.png',
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
    hometown: 'Petalburg City',
    specialty: 'Various',
    avatarId: 257,
    image: 'https://archives.bulbagarden.net/media/upload/d/d9/May_Masters.png',
    color: '#EC4899',
    description: 'A cheerful coordinator who travels across regions making a name for herself in Pokémon Contests.',
    team: [257, 267, 300, 3, 8, 446], // Blaziken, Beautifly, Skitty, Venusaur, Wartortle, Munchlax
  },
  {
    id: 'wally',
    name: 'Wally',
    role: 'Determined Rival',
    region: 'Hoenn',
    hometown: 'Petalburg City',
    specialty: 'Fairy',
    avatarId: 475,
    image: 'https://archives.bulbagarden.net/media/upload/4/4c/Wally_Masters.png',
    color: '#10B981',
    description: 'A quiet, sickly boy from Petalburg City who grew into a powerful, confident competitor through his training with Gallade.',
    team: [475, 282, 334, 303, 315, 681], // Gallade, Gardevoir, Altaria, Mawile, Roselia, Aegislash
  },
  {
    id: 'zinnia',
    name: 'Zinnia',
    role: 'Lorekeeper',
    region: 'Hoenn',
    hometown: 'Unknown',
    specialty: 'Dragon',
    avatarId: 373,
    image: 'https://archives.bulbagarden.net/media/upload/f/fd/Zinnia_Masters.png',
    color: '#6B7280',
    description: 'A mysterious woman of the Draconid people who seeks to summon Rayquaza to destroy a giant meteor threatening Hoenn.',
    team: [373, 706, 330, 344, 251], // Salamence, Goodra, Flygon, Claydol, Celebi
  },
  {
    id: 'steven',
    name: 'Steven Stone',
    role: 'Hoenn League Champion',
    region: 'Hoenn',
    hometown: 'Rustboro City',
    specialty: 'Steel',
    avatarId: 376,
    image: 'https://archives.bulbagarden.net/media/upload/d/db/Steven_Masters.png',
    color: '#6B7280',
    description: 'The Hoenn Champion who travels search of rare stones and utilizes steel-hard Steel/Rock Pokémon.',
    team: [376, 227, 344, 306, 346, 348], // Metagross, Skarmory, Claydol, Aggron, Cradily, Armaldo
  },
  {
    id: 'wallace',
    name: 'Wallace',
    role: 'Water Champion',
    region: 'Hoenn',
    hometown: 'Sootopolis City',
    specialty: 'Water',
    avatarId: 350,
    image: 'https://archives.bulbagarden.net/media/upload/a/a2/Wallace_Masters.png',
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
    hometown: 'Twinleaf Town',
    specialty: 'Various',
    avatarId: 393,
    image: 'https://archives.bulbagarden.net/media/upload/3/30/Dawn_Masters.png',
    color: '#EC4899',
    description: 'A confident coordinator from Twinleaf Town who executes beautifully choreographed battles alongside Piplup.',
    team: [393, 427, 417, 473, 156, 468], // Piplup, Buneary, Pachirisu, Mamoswine, Quilava, Togekiss
  },
  {
    id: 'barry',
    name: 'Barry',
    role: 'Energetic Rival',
    region: 'Sinnoh',
    hometown: 'Twinleaf Town',
    specialty: 'Various',
    avatarId: 395,
    image: 'https://archives.bulbagarden.net/media/upload/3/30/Barry_Masters.png',
    color: '#F59E0B',
    description: 'A hyperactive trainer from Twinleaf Town who is always in a rush and fines anyone who gets in his way.',
    team: [395, 398, 407, 464, 462, 214], // Empoleon, Staraptor, Roserade, Rhyperior, Magnezone, Heracross
  },
  {
    id: 'volkner',
    name: 'Volkner',
    role: 'Sunyshore Gym Leader',
    region: 'Sinnoh',
    hometown: 'Sunyshore City',
    specialty: 'Electric',
    avatarId: 466,
    image: 'https://archives.bulbagarden.net/media/upload/6/68/Volkner_Masters.png',
    color: '#FBBF24',
    description: 'The strongest Gym Leader in Sinnoh, who became bored by weak challengers and rebuilt the Sunyshore Gym with high-tech systems.',
    team: [466, 405, 135, 224, 479, 477], // Electivire, Livecaster, Jolteon, Octillery, Rotom, Dusknoir
  },
  {
    id: 'cynthia',
    name: 'Cynthia',
    role: 'Sinnoh League Champion',
    region: 'Sinnoh',
    hometown: 'Celestic Town',
    specialty: 'Various',
    avatarId: 445,
    image: 'https://archives.bulbagarden.net/media/upload/e/e0/Cynthia_Masters.png',
    color: '#1E1B4B',
    description: 'The brilliant archaeologist and Sinnoh Champion, feared by challengers for her tactical genius and Garchomp.',
    team: [445, 448, 350, 468, 407, 442], // Garchomp, Lucario, Milotic, Togekiss, Roserade, Spiritomb
  },
  {
    id: 'paul',
    name: 'Paul',
    role: 'Elite Rival',
    region: 'Sinnoh',
    hometown: 'Veilstone City',
    specialty: 'Various',
    avatarId: 466,
    image: 'https://archives.bulbagarden.net/media/upload/4/4e/Paul_anime.png',
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
    hometown: 'Village of Dragons',
    specialty: 'Dragon',
    avatarId: 612,
    image: 'https://archives.bulbagarden.net/media/upload/c/c5/Iris_Masters.png',
    color: '#10B981',
    description: 'The energetic wild girl from the Village of Dragons who rose to become the Unova League Champion.',
    team: [612, 149, 530, 587, 635, 567], // Haxorus, Dragonite, Excadrill, Emolga, Hydreigon, Archeops
  },
  {
    id: 'cheren',
    name: 'Cheren',
    role: 'Teacher & Leader',
    region: 'Unova',
    hometown: 'Aspertia City',
    specialty: 'Normal',
    avatarId: 508,
    image: 'https://archives.bulbagarden.net/media/upload/8/87/Cheren_Masters.png',
    color: '#3B82F6',
    description: 'Ash\'s thoughtful friend who studied hard to become a Gym Leader and academy teacher in Aspertia City.',
    team: [508, 497, 521, 512, 612, 560], // Stoutland, Serperior, Unfezant, Simisage, Haxorus, Scrafty
  },
  {
    id: 'bianca',
    name: 'Bianca',
    role: 'Oak\'s Assistant',
    region: 'Unova',
    hometown: 'Nuvema Town',
    specialty: 'Various',
    avatarId: 500,
    image: 'https://archives.bulbagarden.net/media/upload/1/1d/Bianca_Masters.png',
    color: '#FBBF24',
    description: 'An optimistic but clumsy girl who overcame her father\'s objections to travel Unova, eventually becoming Professor Juniper\'s assistant.',
    team: [500, 518, 620, 547, 579, 584], // Emboar, Musharna, Mienshao, Whimsicott, Reuniclus, Vanilluxe
  },
  {
    id: 'alder',
    name: 'Alder',
    role: 'Former Champion',
    region: 'Unova',
    hometown: 'Floccesy Town',
    specialty: 'Bug',
    avatarId: 637,
    image: 'https://archives.bulbagarden.net/media/upload/1/14/Alder_Masters.png',
    color: '#F59E0B',
    description: 'A wandering soul and former Unova Champion who teaches younger generations the joy of bonding with Pokémon.',
    team: [637, 626, 617, 589, 534, 621], // Volcarona, Bouffalant, Accelgor, Escavalier, Conkeldurr, Druddigon
  },
  {
    id: 'n',
    name: 'N',
    role: 'Hero of Truth',
    region: 'Unova',
    hometown: 'Plasma Castle',
    specialty: 'Various',
    avatarId: 571,
    image: 'https://archives.bulbagarden.net/media/upload/a/ac/N_Masters.png',
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
    hometown: 'Vaniville Town',
    specialty: 'Fire',
    avatarId: 700,
    image: 'https://archives.bulbagarden.net/media/upload/f/f5/Serena_Masters.png',
    color: '#EC4899',
    description: 'A performer from Vaniville Town who captured hearts in Pokémon Showcases alongside her partner Sylveon.',
    team: [655, 674, 700], // Delphox, Pancham, Sylveon
  },
  {
    id: 'korrina',
    name: 'Korrina',
    role: 'Successor Gym Leader',
    region: 'Kalos',
    hometown: 'Shalour City',
    specialty: 'Fighting',
    avatarId: 448,
    image: 'https://archives.bulbagarden.net/media/upload/8/8e/Korrina_Masters.png',
    color: '#EF4444',
    description: 'The energetic Shalour City Gym Leader who mastered the secrets of Mega Evolution alongside her partner Lucario.',
    team: [448, 685, 303, 560, 620], // Lucario, Slurpuff, Mawile, Scrafty, Mienshao
  },
  {
    id: 'lysandre',
    name: 'Lysandre',
    role: 'Team Flare Boss',
    region: 'Kalos',
    hometown: 'Lumiose City',
    specialty: 'Fire',
    avatarId: 717,
    image: 'https://archives.bulbagarden.net/media/upload/9/91/Lysandre_Masters.png',
    color: '#DC2626',
    description: 'The leader of Team Flare who seeks to create a "beautiful world" by wiping out all human life that does not belong to his group.',
    team: [649, 717, 625, 668, 130, 635], // Genesect, Yveltal, Bisharp, Pyroar, Gyarados, Hydreigon
  },
  {
    id: 'diantha',
    name: 'Diantha',
    role: 'Movie Star & Champion',
    region: 'Kalos',
    hometown: 'Lumiose City',
    specialty: 'Fairy',
    avatarId: 282,
    image: 'https://archives.bulbagarden.net/media/upload/3/37/Diantha_Masters.png',
    color: '#E5E7EB',
    description: 'A famous movie actress and Champion of the Kalos region who Megas her Gardevoir to achieve absolute style.',
    team: [282, 701, 697, 699, 706, 711], // Gardevoir, Hawlucha, Tyrantrum, Aurorus, Goodra, Gourgeist
  },
  {
    id: 'alain',
    name: 'Alain',
    role: 'Mega Evolution Master',
    region: 'Kalos',
    hometown: 'Lumiose City',
    specialty: 'Mega Charizard X',
    avatarId: 6,
    image: 'https://archives.bulbagarden.net/media/upload/7/74/Alain_anime.png',
    color: '#2563EB',
    description: 'Winner of the Lumiose Conference who seeks to master Mega Evolution alongside his Charizard X.',
    team: [6, 376, 248, 461, 625, 521], // Charizard, Metagross, Tyranitar, Weavile, Bisharp, Unfezant
  },
  // ── ALOLA ──
  {
    id: 'lillie',
    name: 'Lillie',
    role: 'Caring Friend',
    region: 'Alola',
    hometown: 'Aether Paradise',
    specialty: 'Various',
    avatarId: 37,
    image: 'https://archives.bulbagarden.net/media/upload/7/77/Lillie_Masters.png',
    color: '#F3F4F6',
    description: 'A gentle, polite girl who has a deep affection for Pokémon despite her initial fear of touching them.',
    team: [37, 39, 282, 113, 700], // Alolan Vulpix, Clefairy, Gardevoir, Chansey, Sylveon
  },
  {
    id: 'selene',
    name: 'Selene',
    role: 'Alolan Champion',
    region: 'Alola',
    hometown: 'Hau\'oli City',
    specialty: 'All-Rounder',
    avatarId: 724,
    image: 'https://archives.bulbagarden.net/media/upload/b/b5/Selene_Masters.png',
    color: '#06B6D4',
    description: 'A trainer who moved to Alola from Kanto, conquered the Island Challenge, and became the region\'s first Champion.',
    team: [724, 730, 784, 788, 745, 1008], // Decidueye, Primarina, Kommo-o, Tapu Fini, Lycanroc, Miraidon
  },
  {
    id: 'gladion',
    name: 'Gladion',
    role: 'Aether Rival',
    region: 'Alola',
    hometown: 'Aether House',
    specialty: 'Various',
    avatarId: 773,
    image: 'https://archives.bulbagarden.net/media/upload/9/91/Gladion_Masters.png',
    color: '#1F2937',
    description: 'Lillie\'s brother who wears his lone-wolf persona but cherishes his partner Silvally and Midnight Lycanroc.',
    team: [773, 745, 169, 448, 571, 474], // Silvally, Lycanroc (midnight), Crobat, Lucario, Zoroark, Porygon-z
  },
  {
    id: 'kukui',
    name: 'Professor Kukui',
    role: 'Alola Founder & Masked Royal',
    region: 'Alola',
    hometown: 'Iki Town',
    specialty: 'All-Rounder',
    avatarId: 727,
    image: 'https://archives.bulbagarden.net/media/upload/d/dd/Professor_Kukui_Masters.png',
    color: '#F59E0B',
    description: 'The energetic creator of the Alola League who secretly battles in the Battle Royal Dome as the Masked Royal.',
    team: [727, 745, 628, 38, 462, 143], // Incineroar, Lycanroc (midday), Braviary, Ninetales, Magnezone, Snorlax
  },
  // ── GALAR ──
  {
    id: 'gloria',
    name: 'Gloria',
    role: 'Galar Champion',
    region: 'Galar',
    hometown: 'Postwick',
    specialty: 'All-Rounder',
    avatarId: 818,
    image: 'https://archives.bulbagarden.net/media/upload/0/0a/Gloria_Masters.png',
    color: '#EF4444',
    description: 'A spunky girl from Postwick who defeated Leon to claim the Galar Champion title, representing the new generation of gym trainers.',
    team: [818, 888, 882, 823, 851, 861], // Inteleon, Zacian, Dracovish, Corviknight, Centiskorch, Grimmsnarl
  },
  {
    id: 'victor',
    name: 'Victor',
    role: 'Challenger Student',
    region: 'Galar',
    hometown: 'Postwick',
    specialty: 'All-Rounder',
    avatarId: 812,
    image: 'https://archives.bulbagarden.net/media/upload/f/f9/Victor_Masters.png',
    color: '#3B82F6',
    description: 'A focused boy from Postwick who undertook the Galar gym challenge alongside his starter Rillaboom.',
    team: [812, 815, 818, 888, 823, 839], // Rillaboom, Cinderace, Inteleon, Zacian, Corviknight, Coalossal
  },
  {
    id: 'hop',
    name: 'Hop',
    role: 'Research Assistant',
    region: 'Galar',
    hometown: 'Postwick',
    specialty: 'Various',
    avatarId: 889,
    image: 'https://archives.bulbagarden.net/media/upload/c/c2/Hop_Masters.png',
    color: '#FBBF24',
    description: 'Leon\'s younger brother and Ash\'s friendly rival, who transitioned from aiming for Champion to studying as a Pokémon Professor under Sonia.',
    team: [889, 823, 815, 832, 809, 873], // Zamazenta, Corviknight, Cinderace, Dubwool, Melmetal, Frosmoth
  },
  {
    id: 'leon',
    name: 'Leon',
    role: 'Undefeated Champion',
    region: 'Galar',
    hometown: 'Postwick',
    specialty: 'All-Rounder',
    avatarId: 6,
    image: 'https://archives.bulbagarden.net/media/upload/d/d4/Leon_Masters.png',
    color: '#F59E0B',
    description: 'Galar\'s greatest undefeated Champion who guides trainers on their journey and Gigantamaxes Charizard.',
    team: [6, 887, 612, 681, 812, 815], // Charizard, Dragapult, Haxorus, Aegislash, Rillaboom, Cinderace
  },
  {
    id: 'raihan',
    name: 'Raihan',
    role: 'Dragon Gym Leader',
    region: 'Galar',
    hometown: 'Hammerlocke',
    specialty: 'Dragon',
    avatarId: 884,
    image: 'https://archives.bulbagarden.net/media/upload/c/c8/Raihan_Masters.png',
    color: '#EA580C',
    description: 'Leon\'s rival and Hammerlocke Gym Leader, specializing in using weather hazards alongside Dragon Pokémon.',
    team: [884, 330, 526, 844, 706, 776], // Duraludon, Flygon, Gigalith, Sandaconda, Goodra, Turtonator
  },
  {
    id: 'marnie',
    name: 'Marnie',
    role: 'Spikemuth Gym Leader',
    region: 'Galar',
    hometown: 'Spikemuth',
    specialty: 'Dark',
    avatarId: 877,
    image: 'https://archives.bulbagarden.net/media/upload/3/38/Marnie_Masters.png',
    color: '#EC4899',
    description: 'The cool and composed Spikemuth Gym Leader who commands Dark-type Pokémon, supported by Team Yell.',
    team: [861, 877, 453, 510, 560], // Grimmsnarl, Morpeko, Toxicroak, Liepard, Scrafty
  },
  // ── PALDEA ──
  {
    id: 'penny',
    name: 'Penny',
    role: 'Cassiopeia / Hacker',
    region: 'Paldea',
    hometown: 'Unknown',
    specialty: 'Eeveelutions',
    avatarId: 197,
    image: 'https://archives.bulbagarden.net/media/upload/2/23/Penny_Masters.png',
    color: '#818CF8',
    description: 'A shy student from Galar who founded Team Star under the code name Cassiopeia, famous for her team of Eeveelutions.',
    team: [197, 470, 700, 136, 135, 134], // Umbreon, Leafeon, Sylveon, Flareon, Jolteon, Vaporeon
  },
  {
    id: 'iono',
    name: 'Iono',
    role: 'Influencer Gym Leader',
    region: 'Paldea',
    hometown: 'Levincia',
    specialty: 'Electric',
    avatarId: 941,
    image: 'https://archives.bulbagarden.net/media/upload/7/79/Iono_Masters.png',
    color: '#E0F2FE',
    description: 'The popular streaming superstar and Levincia Gym Leader, who treats her gym test as a live broadcast to her "Iono Zone" viewers.',
    team: [941, 706, 953, 940, 200], // Bellibolt, Kilowattrel, Luxray, Electrode, Mismagius
  },
  {
    id: 'nemona',
    name: 'Nemona',
    role: 'Champion Rank Student',
    region: 'Paldea',
    hometown: 'Cabo Poco',
    specialty: 'All-Rounder',
    avatarId: 908,
    image: 'https://archives.bulbagarden.net/media/upload/a/ae/Nemona_Masters.png',
    color: '#10B981',
    description: 'An enthusiastic battle-loving trainer of Champion Rank who guides and supports the academy classmates.',
    team: [908, 745, 706, 968, 923, 982], // Meowscarada, Lycanroc, Goodra, Orthworm, Pawmot, Dudunsparce
  },
  {
    id: 'geeta',
    name: 'La Primera Geeta',
    role: 'Top League Champion',
    region: 'Paldea',
    hometown: 'Mesagoza',
    specialty: 'All-Rounder',
    avatarId: 970,
    image: 'https://archives.bulbagarden.net/media/upload/6/65/Geeta_Masters.png',
    color: '#4338CA',
    description: 'The chairwoman of the Paldean Pokémon League and the Top Champion who oversees all Paldea Gym Leaders.',
    team: [970, 983, 955, 713, 976, 673], // Glimmora, Kingambit, Espathra, Avalugg, Veluza, Gogoat
  },
  {
    id: 'arven',
    name: 'Arven',
    role: 'Path of Legends Chef',
    region: 'Paldea',
    hometown: 'Cabo Poco',
    specialty: 'Various',
    avatarId: 943,
    image: 'https://archives.bulbagarden.net/media/upload/a/ae/Scarlet_Violet_Arven.png',
    color: '#D97706',
    description: 'A student of the academy who cooks specialized meals to cure his partner Mabosstiff and study Herba Mystica.',
    team: [943, 820, 952, 944, 948, 91], // Mabosstiff, Greedent, Scovillain, Garganacl, Toedscruel, Cloyster
  },
]

const TRAINER_RESERVES: Record<string, number[]> = {
  ash: [1, 7, 17, 95, 143, 230, 214, 389, 392, 727, 861, 882],
  gary: [34, 126, 139, 103, 212, 149],
  red: [142, 196, 131, 143],
  misty: [116, 118, 120, 54, 176, 222],
  brock: [37, 259, 242, 74, 169],
  giovanni: [68, 76, 530, 111, 28, 53],
  jessie: [52, 202, 109, 24],
  james: [455, 331, 350, 110, 71],
  ethan: [160, 248, 186, 212],
  lyra: [161, 187, 232, 183],
  silver: [248, 461, 215, 130],
  lance: [334, 373, 142, 6, 230],
  may: [269, 183, 300, 8, 3],
  wally: [334, 303, 315, 282],
  zinnia: [149, 376, 330, 344],
  steven: [304, 346, 348, 227],
  wallace: [222, 363, 272, 340],
  dawn: [418, 422, 417, 473],
  barry: [462, 464, 398, 214],
  volkner: [135, 479, 405, 125],
  paul: [430, 467, 389, 452],
  cynthia: [442, 407, 468, 350],
  iris: [530, 587, 612, 149],
  cheren: [521, 512, 508, 497],
  bianca: [547, 579, 620, 500],
  alder: [589, 534, 626, 617],
  n: [571, 567, 584, 565],
  serena: [25, 700, 655, 674],
  korrina: [685, 303, 448, 560],
  lysandre: [625, 668, 649, 717],
  diantha: [701, 697, 282, 699],
  alain: [376, 248, 6, 461],
  lillie: [39, 282, 37, 113],
  selene: [730, 784, 724, 788],
  gladion: [745, 169, 773, 448],
  kukui: [745, 628, 727, 38],
  gloria: [888, 882, 818, 823],
  victor: [815, 818, 812, 888],
  hop: [823, 815, 889, 832],
  leon: [887, 612, 6, 681],
  raihan: [330, 526, 884, 844],
  marnie: [877, 453, 861, 510],
  penny: [470, 700, 197, 136],
  iono: [706, 953, 941, 940],
  nemona: [745, 706, 908, 968],
  geeta: [983, 955, 970, 713],
  arven: [820, 952, 943, 944],
}

const CharactersPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [activeRegion, setActiveRegion] = useState('All')
  const [selectedId, setSelectedId] = useState<string>('ash')

  // Parse region parameter if passed via URL safely
  useEffect(() => {
    const regionParam = searchParams.get('region')
    if (regionParam) {
      const regionData = REGIONS.find((r) => r.id === regionParam.toLowerCase())
      if (regionData) {
        if (activeRegion !== regionData.name) {
          setActiveRegion(regionData.name)
          const firstMatch = CHARACTERS.find((c) => c.region.toLowerCase() === regionParam.toLowerCase())
          if (firstMatch) {
            setSelectedId(firstMatch.id)
          }
        }
      }
    }
  }, [searchParams, activeRegion])

  const character = CHARACTERS.find((c) => c.id === selectedId) || CHARACTERS[0]

  // Query character's team members
  const { data: teamPokemon, isLoading: loadingTeam } = useMultiplePokemon(character.team)

  // Query character's reserve members
  const reserveIds = TRAINER_RESERVES[character.id] || []
  const { data: reservePokemon, isLoading: loadingReserves } = useMultiplePokemon(reserveIds)

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
        {REGIONS_TABS.map((reg) => (
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
        <div className="lg:col-span-5 space-y-3 pr-2">
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
                    src={c.image}
                    alt=""
                    className="absolute -right-3 -bottom-3 w-16 h-16 object-contain opacity-[0.04] group-hover:opacity-[0.1] transition-opacity duration-300 pointer-events-none"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getPokemonArtwork(c.avatarId);
                    }}
                  />

                  {/* Representative Avatar */}
                  <div
                    className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center border overflow-hidden transition-transform group-hover:scale-105"
                    style={{
                      background: `${c.color}15`,
                      borderColor: `${c.color}40`,
                    }}
                  >
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-contain object-top"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getPokemonArtwork(c.avatarId);
                        e.currentTarget.className = "w-9 h-9 object-contain drop-shadow-md";
                      }}
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

        {/* Right Side: Showcase & Pokémon Team Grid (Split details & big photo focus) */}
        <div className="lg:col-span-7 lg:sticky lg:top-24">
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

              {/* Expanded Split Layout details */}
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-6 relative z-10">
                {/* Large Portrait focus */}
                <div
                  className="w-48 h-48 md:w-56 md:h-56 flex-shrink-0 flex items-center justify-center rounded-2xl border overflow-hidden relative shadow-2xl"
                  style={{
                    background: `${character.color}15`,
                    borderColor: `${character.color}35`,
                    boxShadow: `0 10px 30px ${character.color}25`,
                  }}
                >
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle, ${character.color} 0%, transparent 70%)` }} />
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-full h-full object-contain object-top relative z-10 float-slow"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getPokemonArtwork(character.avatarId);
                    }}
                  />
                </div>

                {/* Extended info grid */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded bg-white/10 text-gray-300 border border-white/5">
                      {character.region} Region
                    </span>
                    <span
                      className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full font-bold"
                      style={{ background: `${character.color}20`, color: character.color }}
                    >
                      {character.role}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    {character.name}
                  </h2>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-400 font-mono py-2.5 border-y border-white/5 text-left">
                    <div>Specialty: <span className="text-white font-bold ml-1">{character.specialty}</span></div>
                    <div>Hometown: <span className="text-white font-bold ml-1">{character.hometown}</span></div>
                    <div>Generations: <span className="text-white font-bold ml-1">{REGIONS.find(r => r.name === character.region)?.generation ?? 'Unknown'}</span></div>
                    <div>Team Tier: <span className="text-indigo-400 font-bold ml-1">S-Rank</span></div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed pt-1 text-left">
                    {character.description}
                  </p>
                </div>
              </div>

              {/* Signature Team list */}
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
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {teamPokemon?.map((p) => {
                      const primaryType = p.types[0]?.type.name ?? 'normal'
                      const typeColor = TYPE_COLORS[primaryType]?.bg ?? '#777'
                      return (
                        <Link
                          key={p.id}
                          to={`/pokemon/${p.name}`}
                          className="flex flex-col justify-between items-center p-2 rounded-xl border relative overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white/[0.04] cursor-pointer group"
                          style={{
                            borderColor: 'rgba(255, 255, 255, 0.05)',
                            background: 'rgba(255, 255, 255, 0.02)',
                          }}
                          onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement
                            el.style.borderColor = `${typeColor}40`
                            el.style.boxShadow = `0 4px 12px ${typeColor}15`
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement
                            el.style.borderColor = 'rgba(255, 255, 255, 0.05)'
                            el.style.boxShadow = 'none'
                          }}
                        >
                          <img
                            src={getPokemonArtwork(p.id)}
                            alt={p.name}
                            className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                          />
                          <div className="text-[10px] font-bold capitalize text-center mt-1.5 truncate w-full text-gray-200 group-hover:text-indigo-400 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[8px] font-mono text-gray-500 mt-0.5 uppercase tracking-wide">
                            #{p.id}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Reserve roster list */}
              <div className="mt-6">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-white/5 pb-2">
                  Other Team Pokémon ({reserveIds.length} Pokémon)
                </h3>

                {loadingReserves ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="pokeball-spinner w-7 h-7 glow" />
                  </div>
                ) : reservePokemon && reservePokemon.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {reservePokemon.map((p) => {
                      const primaryType = p.types[0]?.type.name ?? 'normal'
                      const typeColor = TYPE_COLORS[primaryType]?.bg ?? '#777'
                      return (
                        <Link
                          key={p.id}
                          to={`/pokemon/${p.name}`}
                          className="flex flex-col justify-between items-center p-2 rounded-xl border relative overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white/[0.04] cursor-pointer group"
                          style={{
                            borderColor: 'rgba(255, 255, 255, 0.05)',
                            background: 'rgba(255, 255, 255, 0.02)',
                          }}
                          onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement
                            el.style.borderColor = `${typeColor}40`
                            el.style.boxShadow = `0 4px 12px ${typeColor}15`
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement
                            el.style.borderColor = 'rgba(255, 255, 255, 0.05)'
                            el.style.boxShadow = 'none'
                          }}
                        >
                          <img
                            src={getPokemonArtwork(p.id)}
                            alt={p.name}
                            className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                          />
                          <div className="text-[10px] font-bold capitalize text-center mt-1.5 truncate w-full text-gray-200 group-hover:text-indigo-400 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[8px] font-mono text-gray-500 mt-0.5 uppercase tracking-wide">
                            #{p.id}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 text-center py-4">No additional Pokémon recorded for this character.</div>
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
