import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Easing,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

import { createTarotReading } from '../utils/tarotUtils'
import { saveTarotReading } from '../utils/storageUtils'
import { TarotReading, DrawnCard } from '../types'

const { width, height } = Dimensions.get('window')

const TarotScreen: React.FC = () => {
  const [question, setQuestion] = useState('')
  const [selectedLayout, setSelectedLayout] = useState<'single' | 'three' | 'cross'>('single')
  const [reading, setReading] = useState<TarotReading | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [aiStatus, setAiStatus] = useState<{
    isLoading: boolean
    source: 'ai' | 'traditional' | null
    error?: string
  }>({ isLoading: false, source: null })
  const [cardsRevealed, setCardsRevealed] = useState<boolean[]>([])
  const spinValue = React.useRef(new Animated.Value(0)).current
  const pulseValue = React.useRef(new Animated.Value(1)).current
  const cardAnimations = useRef<Animated.Value[]>([])
  const cardFlipAnimations = useRef<Animated.Value[]>([])
  const cardScaleAnimations = useRef<Animated.Value[]>([])
  const containerFadeAnim = useRef(new Animated.Value(0)).current

  const layouts = [
    {
      type: 'single' as const,
      name: '单张牌',
      description: '简单快速的指导',
      icon: 'library-outline'
    },
    {
      type: 'three' as const,
      name: '三张牌',
      description: '过去·现在·未来',
      icon: 'albums-outline'
    },
    {
      type: 'cross' as const,
      name: '十字牌阵',
      description: '深度分析解读',
      icon: 'add-outline'
    }
  ]

  // Initialize card animations
  const initializeCardAnimations = (cardCount: number) => {
    cardAnimations.current = Array.from({ length: cardCount }, () => new Animated.Value(0))
    cardFlipAnimations.current = Array.from({ length: cardCount }, () => new Animated.Value(0))
    cardScaleAnimations.current = Array.from({ length: cardCount }, () => new Animated.Value(0.3))
    setCardsRevealed(Array.from({ length: cardCount }, () => false))
  }

  // Animate card entrance
  const animateCardsEntrance = () => {
    containerFadeAnim.setValue(0)
    Animated.timing(containerFadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    const animations = cardAnimations.current.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 200,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      })
    )

    const scaleAnimations = cardScaleAnimations.current.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 200,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      })
    )

    Animated.parallel([...animations, ...scaleAnimations]).start()
  }

  // Animate card flip
  const flipCard = (index: number) => {
    const newRevealed = [...cardsRevealed]
    if (newRevealed[index]) return

    newRevealed[index] = true
    setCardsRevealed(newRevealed)

    Animated.sequence([
      Animated.timing(cardFlipAnimations.current[index], {
        toValue: 0.5,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardFlipAnimations.current[index], {
        toValue: 1,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ]).start()
  }

  // Auto-reveal cards in sequence
  const autoRevealCards = () => {
    if (!reading) return
    
    reading.cards.forEach((_, index) => {
      setTimeout(() => {
        flipCard(index)
      }, (index + 1) * 800)
    })
  }

  useEffect(() => {
    if (showResult && reading) {
      const cardCount = reading.cards.length
      initializeCardAnimations(cardCount)
      animateCardsEntrance()
      
      // Auto-reveal cards after entrance animation
      setTimeout(() => {
        autoRevealCards()
      }, 1000)
    }
  }, [showResult, reading])

  const handleStartReading = () => {
    if (!question.trim()) {
      alert('请输入您的问题')
      return
    }

    setIsReading(true)
    
    // 开始旋转动画
    const spin = () => {
      spinValue.setValue(0)
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => spin())
    }
    
    // 开始脉冲动画
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ]).start(() => pulse())
    }
    
    spin()
    pulse()
    
    // 模拟占卜过程
    setTimeout(async () => {
      try {
        setAiStatus({ isLoading: true, source: null })
        
        const newReading = await createTarotReading(question, selectedLayout)
        await saveTarotReading(newReading)
        
        setReading(newReading)
        setAiStatus({ 
          isLoading: false, 
          source: newReading.source || 'traditional',
          error: newReading.error 
        })
        setIsReading(false)
        setShowResult(true)
      } catch (error) {
        console.error('占卜过程出错:', error)
        setAiStatus({ 
          isLoading: false, 
          source: 'traditional',
          error: '生成解读时出现错误，已使用传统解读' 
        })
        setIsReading(false)
      }
    }, 2000)
  }

  const resetReading = () => {
    setReading(null)
    setShowResult(false)
    setQuestion('')
    setCardsRevealed([])
    setAiStatus({ isLoading: false, source: null })
    cardAnimations.current = []
    cardFlipAnimations.current = []
    cardScaleAnimations.current = []
    containerFadeAnim.setValue(0)
  }

  const TarotCard = ({ drawnCard, index }: { drawnCard: DrawnCard; index: number }) => {
    const cardEntranceAnim = cardAnimations.current[index] || new Animated.Value(0)
    const cardFlipAnim = cardFlipAnimations.current[index] || new Animated.Value(0)
    const cardScaleAnim = cardScaleAnimations.current[index] || new Animated.Value(1)
    const isRevealed = cardsRevealed[index] || false

    // Interpolate flip animation for 3D effect
    const frontRotation = cardFlipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['0deg', '90deg', '0deg']
    })

    const backRotation = cardFlipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['180deg', '90deg', '180deg']
    })

    const cardOpacity = cardFlipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1]
    })

    const backOpacity = cardFlipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0, 0]
    })

    // Entrance animation
    const translateY = cardEntranceAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0]
    })

    return (
      <Animated.View 
        style={[
          styles.cardContainer,
          {
            transform: [
              { translateY },
              { scale: cardScaleAnim }
            ],
            opacity: cardEntranceAnim
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => flipCard(index)}
          style={styles.cardTouchable}
        >
          {/* Card Back */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              {
                opacity: backOpacity,
                transform: [{ rotateY: backRotation }]
              }
            ]}
          >
            <LinearGradient
              colors={['#1a1a2e', '#16213e', '#0f0e1b']}
              style={styles.cardGradient}
            >
              <View style={styles.cardBackContent}>
                <Ionicons name="moon" size={40} color="#A855F7" />
                <Text style={styles.cardBackText}>塔罗</Text>
                <View style={styles.cardBackPattern}>
                  {[...Array(3)].map((_, i) => (
                    <View key={i} style={styles.cardBackDot} />
                  ))}
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Card Front */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              drawnCard.isReversed && styles.cardReversed,
              {
                opacity: cardOpacity,
                transform: [{ rotateY: frontRotation }]
              }
            ]}
          >
            <LinearGradient
              colors={['#4C1D95', '#7C3AED', '#A855F7']}
              style={styles.cardGradient}
            >
              <Text style={styles.cardNumber}>
                {drawnCard.card.number !== undefined ? drawnCard.card.number : '★'}
              </Text>
              <Ionicons 
                name={drawnCard.card.icon as any} 
                size={32} 
                color={drawnCard.card.symbolColor}
                style={styles.cardIcon}
              />
              <Text style={styles.cardName}>{drawnCard.card.name}</Text>
              <Text style={styles.cardNameEn}>{drawnCard.card.nameEn}</Text>
              <Text style={styles.cardOrientation}>
                {drawnCard.isReversed ? '逆位' : '正位'}
              </Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
        
        <Text style={styles.cardPosition}>{drawnCard.position}</Text>
      </Animated.View>
    )
  }

  if (isReading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0f0e1b', '#1a1b2e', '#16213e']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            {/* Floating particles background */}
            {[...Array(5)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.floatingParticle,
                  {
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 40}%`,
                    transform: [
                      {
                        translateY: spinValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, i % 2 === 0 ? -20 : 20]
                        })
                      },
                      {
                        scale: pulseValue.interpolate({
                          inputRange: [1, 1.2],
                          outputRange: [0.5, 1]
                        })
                      }
                    ],
                    opacity: pulseValue.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: [0.3, 0.8]
                    })
                  }
                ]}
              >
                <Ionicons name="sparkles" size={16} color="#A855F7" />
              </Animated.View>
            ))}
            
            <Animated.View 
              style={[
                styles.crystalBall,
                {
                  transform: [
                    {
                      rotate: spinValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      })
                    },
                    {
                      scale: pulseValue
                    }
                  ]
                }
              ]}
            >
              <Ionicons name="moon" size={80} color="#A855F7" />
            </Animated.View>
            
            <Animated.View
              style={[
                styles.loadingTextContainer,
                {
                  opacity: pulseValue.interpolate({
                    inputRange: [1, 1.2],
                    outputRange: [0.8, 1]
                  })
                }
              ]}
            >
              <Text style={styles.loadingText}>神秘的力量正在为您解读...</Text>
              <Text style={styles.loadingSubtext}>请稍候</Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f0e1b', '#1a1b2e', '#16213e']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>塔罗牌占卜</Text>
            <Text style={styles.subtitle}>静心思考，诚心发问</Text>

            <View style={styles.questionSection}>
              <Text style={styles.sectionTitle}>您的问题</Text>
              <TextInput
                style={styles.questionInput}
                value={question}
                onChangeText={setQuestion}
                placeholder="请输入您想要咨询的问题..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.layoutSection}>
              <Text style={styles.sectionTitle}>选择牌阵</Text>
              {layouts.map((layout) => (
                <TouchableOpacity
                  key={layout.type}
                  style={[
                    styles.layoutOption,
                    selectedLayout === layout.type && styles.layoutOptionSelected
                  ]}
                  onPress={() => setSelectedLayout(layout.type)}
                >
                  <Ionicons
                    name={layout.icon as any}
                    size={24}
                    color={selectedLayout === layout.type ? '#A855F7' : '#9CA3AF'}
                  />
                  <View style={styles.layoutInfo}>
                    <Text style={[
                      styles.layoutName,
                      selectedLayout === layout.type && styles.layoutNameSelected
                    ]}>
                      {layout.name}
                    </Text>
                    <Text style={styles.layoutDescription}>{layout.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartReading}
            >
              <LinearGradient
                colors={['#8B5CF6', '#A855F7', '#C084FC']}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>开始占卜</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          visible={showResult}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <LinearGradient
              colors={['#0f0e1b', '#1a1b2e', '#16213e']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>占卜结果</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowResult(false)}
                >
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                {reading && (
                  <>
                    <Text style={styles.readingQuestion}>问题：{reading.question}</Text>
                    
                    <Animated.View 
                      style={[
                        styles.cardsContainer,
                        {
                          opacity: containerFadeAnim
                        }
                      ]}
                    >
                      {reading.cards.map((drawnCard, index) => (
                        <TarotCard key={index} drawnCard={drawnCard} index={index} />
                      ))}
                    </Animated.View>

                    <View style={styles.interpretationSection}>
                      <View style={styles.interpretationHeader}>
                        <Text style={styles.interpretationTitle}>解读</Text>
                        {aiStatus.source && (
                          <View style={[
                            styles.sourceIndicator,
                            aiStatus.source === 'ai' ? styles.aiIndicator : styles.traditionalIndicator
                          ]}>
                            <Ionicons 
                              name={aiStatus.source === 'ai' ? 'sparkles' : 'book'} 
                              size={12} 
                              color="#ffffff" 
                            />
                            <Text style={styles.sourceText}>
                              {aiStatus.source === 'ai' ? 'AI解读' : '传统解读'}
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      {aiStatus.error && (
                        <View style={styles.errorContainer}>
                          <Ionicons name="warning" size={16} color="#F59E0B" />
                          <Text style={styles.errorText}>{aiStatus.error}</Text>
                        </View>
                      )}
                      
                      <Text style={styles.interpretationText}>{reading.interpretation}</Text>
                    </View>
                  </>
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.newReadingButton}
                onPress={resetReading}
              >
                <Text style={styles.newReadingButtonText}>重新占卜</Text>
              </TouchableOpacity>
            </LinearGradient>
          </SafeAreaView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0e1b',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A78BFA',
    textAlign: 'center',
    marginBottom: 30,
  },
  questionSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  questionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  layoutSection: {
    marginBottom: 30,
  },
  layoutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  layoutOptionSelected: {
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  layoutInfo: {
    marginLeft: 16,
    flex: 1,
  },
  layoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  layoutNameSelected: {
    color: '#A855F7',
  },
  layoutDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 20,
  },
  startButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatingParticle: {
    position: 'absolute',
  },
  crystalBall: {
    marginBottom: 30,
  },
  loadingTextContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#A78BFA',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f0e1b',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  readingQuestion: {
    fontSize: 16,
    color: '#A78BFA',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: width * 0.4,
  },
  cardTouchable: {
    position: 'relative',
  },
  card: {
    width: 120,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardBack: {
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backfaceVisibility: 'hidden',
  },
  cardReversed: {
    transform: [{ rotate: '180deg' }],
  },
  cardBackContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A855F7',
    marginTop: 8,
    marginBottom: 16,
  },
  cardBackPattern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 40,
  },
  cardBackDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A855F7',
    opacity: 0.6,
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardNameEn: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardOrientation: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '500',
  },
  cardPosition: {
    fontSize: 12,
    color: '#A78BFA',
    textAlign: 'center',
    fontWeight: '500',
  },
  interpretationSection: {
    marginTop: 20,
  },
  interpretationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  interpretationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sourceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiIndicator: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
  },
  traditionalIndicator: {
    backgroundColor: 'rgba(156, 163, 175, 0.3)',
  },
  sourceText: {
    fontSize: 10,
    color: '#ffffff',
    marginLeft: 4,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 8,
    flex: 1,
  },
  interpretationText: {
    fontSize: 16,
    color: '#E5E7EB',
    lineHeight: 24,
  },
  newReadingButton: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  newReadingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A855F7',
  },
})

export default TarotScreen