import { TarotCard, DrawnCard, TarotReading } from '../types'
import { tarotCards } from '../data/tarotCards'
import aiService, { AIResponse } from '../services/aiService'

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

export const interpretReadingTraditional = (cards: DrawnCard[], question: string): string => {
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

export const interpretReading = async (
  cards: DrawnCard[], 
  question: string, 
  layout: 'single' | 'three' | 'cross' = 'single'
): Promise<{ interpretation: string; source: 'ai' | 'traditional'; error?: string }> => {
  // Always try AI first if available
  if (aiService.isReady()) {
    try {
      const aiResponse: AIResponse = await aiService.generateTarotInterpretation(
        cards, 
        question, 
        getLayoutName(layout)
      )
      
      if (aiResponse.success && aiResponse.interpretation) {
        return {
          interpretation: aiResponse.interpretation,
          source: 'ai'
        }
      } else if (aiResponse.error) {
        console.warn('AI解读失败，使用传统解读:', aiResponse.error)
      }
    } catch (error) {
      console.warn('AI解读异常，使用传统解读:', error)
    }
  }
  
  // Fallback to traditional interpretation
  const traditionalInterpretation = interpretReadingTraditional(cards, question)
  return {
    interpretation: traditionalInterpretation,
    source: 'traditional'
  }
}

const getLayoutName = (layout: 'single' | 'three' | 'cross'): string => {
  switch (layout) {
    case 'single':
      return '单牌解读'
    case 'three':
      return '三牌过去现在未来牌阵'
    case 'cross':
      return '五牌十字牌阵'
    default:
      return '塔罗牌阵'
  }
}

export const createTarotReading = async (
  question: string,
  layout: 'single' | 'three' | 'cross'
): Promise<TarotReading & { source: 'ai' | 'traditional'; error?: string }> => {
  const cardCount = layout === 'single' ? 1 : layout === 'three' ? 3 : 5
  const cards = drawCards(cardCount)
  const result = await interpretReading(cards, question, layout)
  
  return {
    id: Date.now().toString(),
    date: new Date(),
    question,
    cards,
    interpretation: result.interpretation,
    layout,
    source: result.source,
    error: result.error
  }
}