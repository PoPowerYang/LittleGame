import { Hexagram, IChingReading } from '../types'
import { hexagrams } from '../data/iChingData'

export const generateHexagram = (): { lines: number[], hexagram: Hexagram } => {
  const lines: number[] = []
  
  // 生成6条爻线
  for (let i = 0; i < 6; i++) {
    // 使用传统的三枚硬币方法
    // 正面(字)=2, 反面(花)=3
    // 三次投掷的和: 6=老阴(变爻), 7=少阳, 8=少阴, 9=老阳(变爻)
    let sum = 0
    for (let j = 0; j < 3; j++) {
      sum += Math.random() < 0.5 ? 2 : 3 // 模拟投掷硬币
    }
    lines.push(sum)
  }
  
  // 将爻线转换为二进制形式计算卦象
  const binaryLines = lines.map(line => (line === 7 || line === 9) ? 1 : 0)
  const hexagramNumber = calculateHexagramNumber(binaryLines)
  
  // 获取对应的卦象
  const hexagram = hexagrams.find(h => h.id === hexagramNumber) || hexagrams[0]
  
  return { lines, hexagram }
}

const calculateHexagramNumber = (lines: number[]): number => {
  // 易经六十四卦的编号计算
  // 这里简化处理，使用前22个卦象
  const upperTrigram = lines.slice(3, 6)
  const lowerTrigram = lines.slice(0, 3)
  
  // 简化的卦象映射，实际应该有64卦
  const trigramValue = (trigram: number[]) => 
    trigram[2] * 4 + trigram[1] * 2 + trigram[0]
  
  const upper = trigramValue(upperTrigram)
  const lower = trigramValue(lowerTrigram)
  
  // 简化映射到现有的22卦
  const hexagramId = ((upper * 8 + lower) % 22) + 1
  
  return hexagramId
}

export const hasChangingLines = (lines: number[]): boolean => {
  return lines.some(line => line === 6 || line === 9)
}

export const getChangingHexagram = (originalLines: number[]): Hexagram | undefined => {
  if (!hasChangingLines(originalLines)) return undefined
  
  // 变爻: 6(老阴)变为阳(7), 9(老阳)变为阴(8)
  const changedLines = originalLines.map(line => {
    if (line === 6) return 7 // 老阴变阳
    if (line === 9) return 8 // 老阳变阴
    return line
  })
  
  const binaryLines = changedLines.map(line => (line === 7 || line === 9) ? 1 : 0)
  const hexagramNumber = calculateHexagramNumber(binaryLines)
  
  return hexagrams.find(h => h.id === hexagramNumber)
}

export const interpretReading = (
  hexagram: Hexagram, 
  changingHexagram?: Hexagram,
  question?: string
): string => {
  let interpretation = `主卦解读：\n${hexagram.interpretation}\n\n`
  
  if (changingHexagram && changingHexagram.id !== hexagram.id) {
    interpretation += `变卦解读：\n变化后的卦象${changingHexagram.name}提示你：${changingHexagram.interpretation}\n\n`
    interpretation += `整体指导：\n主卦代表当前状况，变卦代表发展趋势。从${hexagram.name}变为${changingHexagram.name}，暗示着情况正在发生转变。`
  } else {
    interpretation += `整体指导：\n当前${hexagram.name}的卦象为你的问题提供了明确的指导。`
  }
  
  interpretation += '\n\n静心思考卦象的含义，结合你的具体情况来理解其中的智慧。'
  
  return interpretation
}

export const createIChingReading = (question: string): IChingReading & { lines: number[] } => {
  const { lines, hexagram } = generateHexagram()
  const changingHexagram = getChangingHexagram(lines)
  const interpretation = interpretReading(hexagram, changingHexagram, question)
  
  return {
    id: Date.now().toString(),
    date: new Date(),
    question,
    hexagram,
    changingHexagram,
    interpretation,
    lines
  }
}

export const getYinYangSymbol = (lineValue: number): string => {
  switch (lineValue) {
    case 6: return '⚏' // 老阴(变)
    case 7: return '⚊' // 少阳
    case 8: return '⚋' // 少阴
    case 9: return '⚌' // 老阳(变)
    default: return '⚊'
  }
}

export const getLineName = (lineValue: number): string => {
  switch (lineValue) {
    case 6: return '老阴'
    case 7: return '少阳'
    case 8: return '少阴'
    case 9: return '老阳'
    default: return '少阳'
  }
}

export const isChangingLine = (lineValue: number): boolean => {
  return lineValue === 6 || lineValue === 9
}