import React, { useState } from 'react'
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
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

import { createIChingReading, getYinYangSymbol, getLineName, isChangingLine } from '../utils/iChingUtils'
import { saveIChingReading } from '../utils/storageUtils'
import { IChingReading } from '../types'

const { width, height } = Dimensions.get('window')

const IChingScreen: React.FC = () => {
  const [question, setQuestion] = useState('')
  const [reading, setReading] = useState<(IChingReading & { lines: number[] }) | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [diviningLines, setDiviningLines] = useState<number[]>([])
  const [currentLine, setCurrentLine] = useState(0)

  const handleStartReading = () => {
    if (!question.trim()) {
      alert('请输入您的问题')
      return
    }

    setIsReading(true)
    setDiviningLines([])
    setCurrentLine(0)
    
    // 模拟投掷硬币过程，逐条生成爻线
    simulateCoinTossing()
  }

  const simulateCoinTossing = () => {
    let lineIndex = 0
    const lines: number[] = []

    const generateLine = () => {
      if (lineIndex >= 6) {
        // 所有6条爻线生成完毕
        setTimeout(async () => {
          const newReading = createIChingReading(question)
          await saveIChingReading(newReading)
          setReading(newReading)
          setIsReading(false)
          setShowResult(true)
        }, 1000)
        return
      }

      // 模拟三次投掷硬币
      setTimeout(() => {
        let sum = 0
        for (let j = 0; j < 3; j++) {
          sum += Math.random() < 0.5 ? 2 : 3
        }
        lines.push(sum)
        setDiviningLines([...lines])
        setCurrentLine(lineIndex + 1)
        lineIndex++
        
        setTimeout(generateLine, 800) // 每条爻线间隔800ms
      }, 600)
    }

    generateLine()
  }

  const resetReading = () => {
    setReading(null)
    setShowResult(false)
    setQuestion('')
    setDiviningLines([])
    setCurrentLine(0)
  }

  const HexagramDisplay = ({ 
    lines, 
    name, 
    nameEn, 
    title 
  }: { 
    lines: number[], 
    name: string, 
    nameEn: string, 
    title: string 
  }) => (
    <View style={styles.hexagramContainer}>
      <Text style={styles.hexagramTitle}>{title}</Text>
      <View style={styles.hexagram}>
        {lines.slice().reverse().map((line, index) => (
          <View key={index} style={styles.lineContainer}>
            <Text style={[
              styles.yinYangSymbol,
              isChangingLine(line) && styles.changingLine
            ]}>
              {getYinYangSymbol(line)}
            </Text>
            <Text style={styles.lineName}>{getLineName(line)}</Text>
            {isChangingLine(line) && (
              <Text style={styles.changingText}>变</Text>
            )}
          </View>
        ))}
      </View>
      <Text style={styles.hexagramName}>{name}</Text>
      <Text style={styles.hexagramNameEn}>{nameEn}</Text>
    </View>
  )

  if (isReading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0f0e1b', '#1a1b2e', '#16213e']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingTitle}>正在为您占卜</Text>
            <Text style={styles.loadingSubtitle}>投掷硬币，生成卦象...</Text>
            
            <View style={styles.coinTossContainer}>
              <Animated.View style={styles.coin}>
                <Ionicons name="ellipse" size={60} color="#FFD700" />
              </Animated.View>
            </View>

            <View style={styles.linesProgress}>
              <Text style={styles.progressText}>正在生成第 {currentLine + 1} 爻</Text>
              <View style={styles.generatedLines}>
                {diviningLines.map((line, index) => (
                  <View key={index} style={styles.generatedLine}>
                    <Text style={[
                      styles.yinYangSymbol,
                      isChangingLine(line) && styles.changingLine
                    ]}>
                      {getYinYangSymbol(line)}
                    </Text>
                  </View>
                ))}
                {Array(6 - diviningLines.length).fill(0).map((_, index) => (
                  <View key={`empty-${index}`} style={styles.emptyLine}>
                    <Text style={styles.emptyLineText}>-</Text>
                  </View>
                ))}
              </View>
            </View>
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
            <Text style={styles.title}>易经八卦</Text>
            <Text style={styles.subtitle}>天人合一，卜筮问道</Text>

            <View style={styles.introSection}>
              <Text style={styles.introText}>
                易经是中华文明的瑰宝，通过投掷硬币生成六爻，
                形成八卦卦象，为您的人生困惑指点迷津。
              </Text>
            </View>

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

            <View style={styles.methodSection}>
              <Text style={styles.sectionTitle}>占卜方法</Text>
              <View style={styles.methodCard}>
                <Ionicons name="radio-button-on" size={24} color="#A855F7" />
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>三枚硬币法</Text>
                  <Text style={styles.methodDescription}>
                    传统的投掷三枚硬币方法，连续六次投掷，
                    根据正反面组合生成卦象
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartReading}
            >
              <LinearGradient
                colors={['#8B5CF6', '#A855F7', '#C084FC']}
                style={styles.startButtonGradient}
              >
                <Ionicons name="sparkles" size={20} color="#ffffff" style={{ marginRight: 8 }} />
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
                <Text style={styles.modalTitle}>卦象解读</Text>
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
                    
                    <View style={styles.hexagramsContainer}>
                      <HexagramDisplay
                        lines={reading.lines}
                        name={reading.hexagram.name}
                        nameEn={reading.hexagram.nameEn}
                        title="主卦"
                      />
                      
                      {reading.changingHexagram && reading.changingHexagram.id !== reading.hexagram.id && (
                        <>
                          <Ionicons name="arrow-forward" size={24} color="#A855F7" style={styles.arrowIcon} />
                          <HexagramDisplay
                            lines={reading.lines.map(line => {
                              if (line === 6) return 7 // 老阴变阳
                              if (line === 9) return 8 // 老阳变阴
                              return line
                            })}
                            name={reading.changingHexagram.name}
                            nameEn={reading.changingHexagram.nameEn}
                            title="变卦"
                          />
                        </>
                      )}
                    </View>

                    <View style={styles.interpretationSection}>
                      <Text style={styles.interpretationTitle}>解读</Text>
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
  introSection: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  introText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
    textAlign: 'center',
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
  methodSection: {
    marginBottom: 30,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  methodInfo: {
    marginLeft: 16,
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 20,
  },
  startButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
    padding: 40,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#A78BFA',
    marginBottom: 40,
  },
  coinTossContainer: {
    marginBottom: 40,
  },
  coin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  linesProgress: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 20,
  },
  generatedLines: {
    alignItems: 'center',
  },
  generatedLine: {
    marginBottom: 8,
  },
  emptyLine: {
    marginBottom: 8,
  },
  emptyLineText: {
    fontSize: 24,
    color: '#666',
  },
  yinYangSymbol: {
    fontSize: 32,
    color: '#ffffff',
  },
  changingLine: {
    color: '#FFD700',
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
  hexagramsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
  },
  hexagramContainer: {
    alignItems: 'center',
    flex: 1,
  },
  hexagramTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A855F7',
    marginBottom: 12,
  },
  hexagram: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  lineName: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
    minWidth: 30,
  },
  changingText: {
    fontSize: 10,
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  hexagramName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  hexagramNameEn: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  arrowIcon: {
    marginHorizontal: 10,
  },
  interpretationSection: {
    marginTop: 20,
  },
  interpretationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
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

export default IChingScreen