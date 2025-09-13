// AI service with graceful fallback for React Native compatibility
let Pipeline: any = null

// Try to import React Native Transformers with error handling
try {
  Pipeline = require('react-native-transformers').Pipeline
} catch (error) {
  console.warn('React Native Transformers not available:', error.message)
  Pipeline = null
}
import { DrawnCard } from '../types'

export interface AIConfig {
  modelName: string
  modelPath: string
  isEnabled: boolean
  fallbackToTraditional: boolean
}

export interface AIResponse {
  success: boolean
  interpretation?: string
  error?: string
  source: 'ai' | 'traditional'
}

class AIService {
  private isInitialized = false
  private isInitializing = false
  private config: AIConfig = {
    modelName: 'Felladrin/onnx-DistilGPT2-medium',
    modelPath: 'onnx/decoder_model_merged.onnx',
    isEnabled: true,
    fallbackToTraditional: true
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true
    }

    // Check if Pipeline is available
    if (!Pipeline) {
      console.warn('AI模型不可用: React Native Transformers未正确加载')
      this.isInitialized = false
      return false
    }

    if (this.isInitializing) {
      // Wait for ongoing initialization
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.isInitializing) {
            clearInterval(checkInterval)
            resolve(this.isInitialized)
          }
        }, 100)
      })
    }

    this.isInitializing = true

    try {
      console.log('正在初始化AI模型...')
      
      await Pipeline.TextGeneration.init(
        this.config.modelName,
        this.config.modelPath,
        {
          fetch: async (url: string) => {
            console.log(`下载模型文件: ${url}`)
            const response = await fetch(url)
            if (!response.ok) {
              throw new Error(`模型下载失败: ${response.status}`)
            }
            return response.text()
          }
        }
      )

      this.isInitialized = true
      console.log('AI模型初始化成功')
      return true
    } catch (error) {
      console.error('AI模型初始化失败:', error)
      this.isInitialized = false
      return false
    } finally {
      this.isInitializing = false
    }
  }

  async generateTarotInterpretation(
    cards: DrawnCard[],
    question: string,
    layout: string
  ): Promise<AIResponse> {
    if (!this.config.isEnabled) {
      return {
        success: false,
        error: 'AI功能已禁用',
        source: 'traditional'
      }
    }

    // Try to initialize if not done yet
    const initialized = await this.initialize()
    if (!initialized) {
      return {
        success: false,
        error: 'AI模型初始化失败',
        source: 'traditional'
      }
    }

    try {
      const prompt = this.buildTarotPrompt(cards, question, layout)
      console.log('生成塔罗解读中...')

      return new Promise((resolve) => {
        let fullResponse = ''
        
        Pipeline.TextGeneration.generate(
          prompt,
          (text: string) => {
            fullResponse += text
            
            // Check if response seems complete (simple heuristic)
            if (fullResponse.length > 200 && 
                (fullResponse.includes('。') || fullResponse.includes('！') || fullResponse.includes('？'))) {
              resolve({
                success: true,
                interpretation: this.cleanupResponse(fullResponse),
                source: 'ai'
              })
            }
          }
        )

        // Timeout after 30 seconds
        setTimeout(() => {
          if (fullResponse.length > 50) {
            resolve({
              success: true,
              interpretation: this.cleanupResponse(fullResponse),
              source: 'ai'
            })
          } else {
            resolve({
              success: false,
              error: 'AI响应超时',
              source: 'traditional'
            })
          }
        }, 30000)
      })
    } catch (error) {
      console.error('AI解读生成错误:', error)
      return {
        success: false,
        error: `AI解读失败: ${error}`,
        source: 'traditional'
      }
    }
  }

  private buildTarotPrompt(cards: DrawnCard[], question: string, layout: string): string {
    const cardDescriptions = cards.map(drawnCard => {
      const { card, position, isReversed } = drawnCard
      const orientation = isReversed ? '逆位' : '正位'
      const meaning = isReversed ? card.reversedMeaning : card.uprightMeaning
      
      return `${position}: ${card.name}(${orientation}) - ${meaning}`
    }).join('\n')

    return `作为专业的塔罗占卜师，请为以下塔罗牌阵给出深入而富有洞察力的解读：

问题: ${question}
牌阵类型: ${layout}

抽到的牌:
${cardDescriptions}

请提供一个综合性的解读，包括：
1. 每张牌在当前位置的具体含义
2. 牌与牌之间的相互关系和影响
3. 针对提问者问题的具体建议
4. 整体的能量走向和可能的发展趋势

解读应该富有启发性，同时保持神秘感。请用中文回答，语言要优美而富有诗意。

塔罗解读:`
  }

  private cleanupResponse(response: string): string {
    // Remove the prompt part if it appears in response
    const cleanResponse = response
      .replace(/作为专业的塔罗占卜师.*?塔罗解读:/s, '')
      .trim()
    
    // Ensure it doesn't end abruptly
    if (cleanResponse.length > 0 && !cleanResponse.match(/[。！？]$/)) {
      return cleanResponse + '。'
    }
    
    return cleanResponse
  }

  isReady(): boolean {
    return Pipeline && this.isInitialized && this.config.isEnabled
  }

  getConfig(): AIConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<AIConfig>): void {
    this.config = { ...this.config, ...updates }
  }
}

export const aiService = new AIService()
export default aiService