import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

import { getZodiacByBirthdate, createZodiacReading, getFortuneText, getScoreColor, getScoreStars } from '../utils/zodiacUtils'
import { saveZodiacReading } from '../utils/storageUtils'
import { zodiacSigns } from '../data/zodiacData'
import { ZodiacReading, ZodiacSign } from '../types'

const { width, height } = Dimensions.get('window')

const ZodiacScreen: React.FC = () => {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null)
  const [reading, setReading] = useState<ZodiacReading | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isReading, setIsReading] = useState(false)

  const handleSelectSign = (sign: ZodiacSign) => {
    setSelectedSign(sign)
  }

  const handleStartReading = () => {
    if (!selectedSign) {
      alert('请选择您的星座')
      return
    }

    setIsReading(true)
    
    setTimeout(async () => {
      const newReading = createZodiacReading(selectedSign)
      await saveZodiacReading(newReading)
      setReading(newReading)
      setIsReading(false)
      setShowResult(true)
    }, 2000)
  }

  const resetReading = () => {
    setReading(null)
    setShowResult(false)
    setSelectedSign(null)
  }

  const getElementColor = (element: string) => {
    switch (element) {
      case '火': return '#EF4444'
      case '土': return '#A78BFA'
      case '风': return '#10B981'
      case '水': return '#3B82F6'
      default: return '#A855F7'
    }
  }

  const ZodiacCard = ({ sign, isSelected, onPress }: { 
    sign: ZodiacSign; 
    isSelected: boolean; 
    onPress: () => void 
  }) => (
    <TouchableOpacity
      style={[
        styles.zodiacCard,
        isSelected && styles.zodiacCardSelected
      ]}
      onPress={onPress}
    >
      <View style={styles.zodiacCardContent}>
        <Text style={[styles.zodiacSymbol, { color: getElementColor(sign.element) }]}>
          {sign.symbol}
        </Text>
        <Text style={styles.zodiacName}>{sign.name}</Text>
        <Text style={styles.zodiacNameEn}>{sign.nameEn}</Text>
        <Text style={styles.zodiacDates}>{sign.dates}</Text>
        <View style={[styles.elementTag, { backgroundColor: getElementColor(sign.element) + '20' }]}>
          <Text style={[styles.elementText, { color: getElementColor(sign.element) }]}>
            {sign.element}元素
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const FortuneItem = ({ 
    icon, 
    title, 
    score, 
    description 
  }: { 
    icon: string; 
    title: string; 
    score: number; 
    description: string 
  }) => (
    <View style={styles.fortuneItem}>
      <View style={styles.fortuneHeader}>
        <Ionicons name={icon as any} size={20} color="#A855F7" />
        <Text style={styles.fortuneTitle}>{title}</Text>
        <Text style={[styles.fortuneStars, { color: getScoreColor(score) }]}>
          {getScoreStars(score)}
        </Text>
      </View>
      <Text style={styles.fortuneDescription}>{description}</Text>
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
            <Animated.View style={styles.constellation}>
              <Ionicons name="sparkles" size={80} color="#A855F7" />
            </Animated.View>
            <Text style={styles.loadingText}>星辰指引，运势解读中...</Text>
            <Text style={styles.loadingSubtext}>请稍候</Text>
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
            <Text style={styles.title}>星座运势</Text>
            <Text style={styles.subtitle}>星辰指引人生方向</Text>

            <View style={styles.introSection}>
              <Text style={styles.introText}>
                选择您的星座，获取今日专属运势解读。
                星座能量将为您指引爱情、事业、健康、财运各方面的运势走向。
              </Text>
            </View>

            <View style={styles.zodiacGrid}>
              {zodiacSigns.map((sign) => (
                <ZodiacCard
                  key={sign.id}
                  sign={sign}
                  isSelected={selectedSign?.id === sign.id}
                  onPress={() => handleSelectSign(sign)}
                />
              ))}
            </View>

            {selectedSign && (
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartReading}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#A855F7', '#C084FC']}
                  style={styles.startButtonGradient}
                >
                  <Ionicons name="sparkles" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.startButtonText}>查看今日运势</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
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
                <Text style={styles.modalTitle}>今日运势</Text>
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
                    <View style={styles.signHeader}>
                      <Text style={[styles.signSymbol, { color: getElementColor(reading.sign.element) }]}>
                        {reading.sign.symbol}
                      </Text>
                      <View style={styles.signInfo}>
                        <Text style={styles.signName}>{reading.sign.name}</Text>
                        <Text style={styles.signNameEn}>{reading.sign.nameEn}</Text>
                        <Text style={styles.signDates}>{reading.sign.dates}</Text>
                      </View>
                    </View>

                    <View style={styles.overallFortune}>
                      <Text style={styles.overallTitle}>整体运势</Text>
                      <Text style={styles.overallText}>{reading.dailyFortune.overall}</Text>
                    </View>

                    <View style={styles.fortuneList}>
                      <FortuneItem
                        icon="heart"
                        title="爱情运势"
                        score={reading.dailyFortune.love}
                        description={getFortuneText(reading.dailyFortune.love, 'love')}
                      />
                      
                      <FortuneItem
                        icon="briefcase"
                        title="事业运势"
                        score={reading.dailyFortune.career}
                        description={getFortuneText(reading.dailyFortune.career, 'career')}
                      />
                      
                      <FortuneItem
                        icon="fitness"
                        title="健康运势"
                        score={reading.dailyFortune.health}
                        description={getFortuneText(reading.dailyFortune.health, 'health')}
                      />
                      
                      <FortuneItem
                        icon="wallet"
                        title="财运"
                        score={reading.dailyFortune.fortune}
                        description={getFortuneText(reading.dailyFortune.fortune, 'fortune')}
                      />
                    </View>
                  </>
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.newReadingButton}
                onPress={resetReading}
              >
                <Text style={styles.newReadingButtonText}>重新选择</Text>
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
  zodiacGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  zodiacCard: {
    width: (width - 60) / 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  zodiacCardSelected: {
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  zodiacCardContent: {
    alignItems: 'center',
  },
  zodiacSymbol: {
    fontSize: 24,
    marginBottom: 8,
  },
  zodiacName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  zodiacNameEn: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  zodiacDates: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 6,
  },
  elementTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  elementText: {
    fontSize: 8,
    fontWeight: '500',
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
  },
  constellation: {
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#A78BFA',
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
  signHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  signSymbol: {
    fontSize: 40,
    marginRight: 20,
  },
  signInfo: {
    flex: 1,
  },
  signName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  signNameEn: {
    fontSize: 14,
    color: '#A78BFA',
    marginBottom: 4,
  },
  signDates: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  overallFortune: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A855F7',
    marginBottom: 12,
  },
  overallText: {
    fontSize: 16,
    color: '#E5E7EB',
    lineHeight: 24,
  },
  fortuneList: {
    gap: 16,
  },
  fortuneItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  fortuneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fortuneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
    flex: 1,
  },
  fortuneStars: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  fortuneDescription: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
    marginLeft: 28,
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

export default ZodiacScreen