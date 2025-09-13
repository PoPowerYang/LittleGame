// Tarot types
export interface TarotCard {
  id: number
  name: string
  nameEn: string
  suit: 'major' | 'cups' | 'wands' | 'swords' | 'pentacles'
  number?: number
  keywords: string[]
  uprightMeaning: string
  reversedMeaning: string
  description: string
  icon: string
  symbolColor: string
}

export interface TarotReading {
  id: string
  date: Date
  question: string
  cards: DrawnCard[]
  interpretation: string
  layout: 'single' | 'three' | 'cross'
  source?: 'ai' | 'traditional'
  error?: string
}

export interface DrawnCard {
  card: TarotCard
  position: string
  isReversed: boolean
}

// I-Ching types
export interface Hexagram {
  id: number
  name: string
  nameEn: string
  trigrams: [string, string]
  meaning: string
  interpretation: string
  changingLines?: string[]
}

export interface IChingReading {
  id: string
  date: Date
  question: string
  hexagram: Hexagram
  changingHexagram?: Hexagram
  interpretation: string
}

// Zodiac types
export interface ZodiacSign {
  id: string
  name: string
  nameEn: string
  element: string
  dates: string
  symbol: string
}

export interface ZodiacReading {
  id: string
  date: Date
  sign: ZodiacSign
  dailyFortune: {
    love: number
    career: number
    health: number
    fortune: number
    overall: string
  }
}

// Navigation types
export type RootStackParamList = {
  Home: undefined
  Tarot: undefined
  IChing: undefined
  Zodiac: undefined
  History: undefined
  TarotResult: { reading: TarotReading }
  IChingResult: { reading: IChingReading }
  ZodiacResult: { reading: ZodiacReading }
}