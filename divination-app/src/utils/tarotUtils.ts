import { TarotCard, DrawnCard, TarotReading } from '../types'
import { tarotCards } from '../data/tarotCards'

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const drawCards = (count: number = 1): DrawnCard[] => {
  const shuffledCards = shuffleArray(tarotCards)
  const selectedCards = shuffledCards.slice(0, count)
  
  return selectedCards.map((card, index) => ({
    card,
    position: getPositionName(index, count),
    isReversed: Math.random() < 0.3 // 30% 概率为逆位
  }))
}

const getPositionName = (index: number, totalCards: number): string => {
  if (totalCards === 1) {
    return '当前状况'
  } else if (totalCards === 3) {
    const positions = ['过去', '现在', '未来']
    return positions[index]
  } else if (totalCards === 5) {
    const positions = ['核心问题', '外在影响', '内在状态', '行动建议', '最终结果']
    return positions[index]
  }
  return `位置 ${index + 1}`
}

export const interpretReading = (cards: DrawnCard[], question: string): string => {
  const interpretations: string[] = []
  
  cards.forEach((drawnCard, index) => {
    const { card, position, isReversed } = drawnCard
    const meaning = isReversed ? card.reversedMeaning : card.uprightMeaning
    const orientation = isReversed ? '逆位' : '正位'
    
    interpretations.push(
      `${position}（${card.name} - ${orientation}）：${meaning}`
    )
  })
  
  // 添加整体解读
  interpretations.push('\n整体解读：')
  
  if (cards.length === 1) {
    interpretations.push('这张牌为你当前的疑问提供了直接的指导。请仔细考虑牌面的含义，并将其应用到你的具体情况中。')
  } else if (cards.length === 3) {
    interpretations.push('过去、现在、未来的三张牌展示了事情的发展脉络。过去的影响塑造了现在，而现在的选择将决定未来的走向。')
  } else {
    interpretations.push('多张牌的组合为你提供了全面的洞察。每个位置的牌都有其独特的意义，结合起来可以为你的问题提供深度的解答。')
  }
  
  return interpretations.join('\n\n')
}

export const createTarotReading = (
  question: string,
  layout: 'single' | 'three' | 'cross'
): TarotReading => {
  const cardCount = layout === 'single' ? 1 : layout === 'three' ? 3 : 5
  const cards = drawCards(cardCount)
  const interpretation = interpretReading(cards, question)
  
  return {
    id: Date.now().toString(),
    date: new Date(),
    question,
    cards,
    interpretation,
    layout
  }
}