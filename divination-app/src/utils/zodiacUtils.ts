import { ZodiacSign, ZodiacReading } from '../types'
import { zodiacSigns, fortuneDescriptions } from '../data/zodiacData'

export const getZodiacByBirthdate = (month: number, day: number): ZodiacSign => {
  const date = month * 100 + day
  
  if ((date >= 321 && date <= 331) || (date >= 401 && date <= 419)) {
    return zodiacSigns.find(sign => sign.id === 'aries')!
  } else if ((date >= 420 && date <= 430) || (date >= 501 && date <= 520)) {
    return zodiacSigns.find(sign => sign.id === 'taurus')!
  } else if ((date >= 521 && date <= 531) || (date >= 601 && date <= 620)) {
    return zodiacSigns.find(sign => sign.id === 'gemini')!
  } else if ((date >= 621 && date <= 630) || (date >= 701 && date <= 722)) {
    return zodiacSigns.find(sign => sign.id === 'cancer')!
  } else if ((date >= 723 && date <= 731) || (date >= 801 && date <= 822)) {
    return zodiacSigns.find(sign => sign.id === 'leo')!
  } else if ((date >= 823 && date <= 831) || (date >= 901 && date <= 922)) {
    return zodiacSigns.find(sign => sign.id === 'virgo')!
  } else if ((date >= 923 && date <= 930) || (date >= 1001 && date <= 1022)) {
    return zodiacSigns.find(sign => sign.id === 'libra')!
  } else if ((date >= 1023 && date <= 1031) || (date >= 1101 && date <= 1121)) {
    return zodiacSigns.find(sign => sign.id === 'scorpio')!
  } else if ((date >= 1122 && date <= 1130) || (date >= 1201 && date <= 1221)) {
    return zodiacSigns.find(sign => sign.id === 'sagittarius')!
  } else if ((date >= 1222 && date <= 1231) || (date >= 101 && date <= 119)) {
    return zodiacSigns.find(sign => sign.id === 'capricorn')!
  } else if ((date >= 120 && date <= 131) || (date >= 201 && date <= 218)) {
    return zodiacSigns.find(sign => sign.id === 'aquarius')!
  } else {
    return zodiacSigns.find(sign => sign.id === 'pisces')!
  }
}

export const generateDailyFortune = () => {
  const getRandomScore = () => Math.floor(Math.random() * 5) + 1
  const getRandomDescription = (category: keyof typeof fortuneDescriptions) => {
    const descriptions = fortuneDescriptions[category]
    return descriptions[Math.floor(Math.random() * descriptions.length)]
  }

  return {
    love: getRandomScore(),
    career: getRandomScore(),
    health: getRandomScore(),
    fortune: getRandomScore(),
    overall: getRandomDescription('overall')
  }
}

export const createZodiacReading = (sign: ZodiacSign): ZodiacReading => {
  return {
    id: Date.now().toString(),
    date: new Date(),
    sign,
    dailyFortune: generateDailyFortune()
  }
}

export const getFortuneText = (score: number, category: keyof Omit<typeof fortuneDescriptions, 'overall'>): string => {
  const descriptions = fortuneDescriptions[category]
  const index = Math.min(score - 1, descriptions.length - 1)
  return descriptions[index]
}

export const getScoreColor = (score: number): string => {
  if (score >= 4) return '#10B981' // green
  if (score >= 3) return '#F59E0B' // yellow
  return '#EF4444' // red
}

export const getScoreStars = (score: number): string => {
  return '★'.repeat(score) + '☆'.repeat(5 - score)
}