import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'

import { 
  getTarotReadings, 
  getIChingReadings, 
  getZodiacReadings, 
  clearAllReadings,
  deleteReading 
} from '../utils/storageUtils'
import { TarotReading, IChingReading, ZodiacReading } from '../types'

type ReadingType = 'all' | 'tarot' | 'iching' | 'zodiac'

interface CombinedReading {
  id: string
  date: Date
  type: 'tarot' | 'iching' | 'zodiac'
  data: TarotReading | IChingReading | ZodiacReading
}

const HistoryScreen: React.FC = () => {
  const [readings, setReadings] = useState<CombinedReading[]>([])
  const [filterType, setFilterType] = useState<ReadingType>('all')
  const [refreshing, setRefreshing] = useState(false)

  const loadReadings = async () => {
    try {
      const [tarotReadings, ichingReadings, zodiacReadings] = await Promise.all([
        getTarotReadings(),
        getIChingReadings(),
        getZodiacReadings()
      ])

      const combined: CombinedReading[] = [
        ...tarotReadings.map(r => ({ id: r.id, date: r.date, type: 'tarot' as const, data: r })),
        ...ichingReadings.map(r => ({ id: r.id, date: r.date, type: 'iching' as const, data: r })),
        ...zodiacReadings.map(r => ({ id: r.id, date: r.date, type: 'zodiac' as const, data: r }))
      ]

      combined.sort((a, b) => b.date.getTime() - a.date.getTime())
      setReadings(combined)
    } catch (error) {
      console.error('Error loading readings:', error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadReadings()
    setRefreshing(false)
  }

  useFocusEffect(
    React.useCallback(() => {
      loadReadings()
    }, [])
  )

  const filteredReadings = useMemo(() => {
    if (filterType === 'all') return readings
    return readings.filter(reading => reading.type === filterType)
  }, [readings, filterType])

  const handleDeleteReading = (reading: CombinedReading) => {
    Alert.alert(
      '删除记录',
      '确定要删除这条记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await deleteReading(reading.type, reading.id)
            await loadReadings()
          }
        }
      ]
    )
  }

  const handleClearAll = () => {
    Alert.alert(
      '清空记录',
      '确定要清空所有历史记录吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: async () => {
            await clearAllReadings()
            await loadReadings()
          }
        }
      ]
    )
  }

  const getReadingIcon = (type: string) => {
    switch (type) {
      case 'tarot': return 'sparkles-outline'
      case 'iching': return 'flower-outline'
      case 'zodiac': return 'moon-outline'
      default: return 'document-outline'
    }
  }

  const getReadingTypeName = (type: string) => {
    switch (type) {
      case 'tarot': return '塔罗牌'
      case 'iching': return '易经'
      case 'zodiac': return '星座'
      default: return '未知'
    }
  }

  const getReadingTitle = (reading: CombinedReading) => {
    switch (reading.type) {
      case 'tarot':
        const tarotData = reading.data as TarotReading
        return `${tarotData.cards.length}张牌占卜`
      case 'iching':
        const ichingData = reading.data as IChingReading
        return ichingData.hexagram.name
      case 'zodiac':
        const zodiacData = reading.data as ZodiacReading
        return `${zodiacData.sign.name}运势`
      default:
        return '占卜记录'
    }
  }

  const getReadingPreview = (reading: CombinedReading) => {
    switch (reading.type) {
      case 'tarot':
        const tarotData = reading.data as TarotReading
        return tarotData.question.slice(0, 50) + (tarotData.question.length > 50 ? '...' : '')
      case 'iching':
        const ichingData = reading.data as IChingReading
        return ichingData.question.slice(0, 50) + (ichingData.question.length > 50 ? '...' : '')
      case 'zodiac':
        const zodiacData = reading.data as ZodiacReading
        return zodiacData.dailyFortune.overall.slice(0, 50) + (zodiacData.dailyFortune.overall.length > 50 ? '...' : '')
      default:
        return ''
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return '今天'
    } else if (diffDays === 2) {
      return '昨天'
    } else if (diffDays <= 7) {
      return `${diffDays - 1}天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const filterOptions = [
    { key: 'all' as const, label: '全部', icon: 'apps-outline' },
    { key: 'tarot' as const, label: '塔罗', icon: 'sparkles-outline' },
    { key: 'iching' as const, label: '易经', icon: 'flower-outline' },
    { key: 'zodiac' as const, label: '星座', icon: 'moon-outline' },
  ]

  if (readings.length === 0 && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0f0e1b', '#1a1b2e', '#16213e']}
          style={styles.gradient}
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={80} color="#666" />
            <Text style={styles.emptyTitle}>暂无历史记录</Text>
            <Text style={styles.emptySubtitle}>开始您的第一次占卜吧</Text>
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
        <View style={styles.header}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filterOptions.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterButton,
                  filterType === option.key && styles.filterButtonActive
                ]}
                onPress={() => setFilterType(option.key)}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={16} 
                  color={filterType === option.key ? '#ffffff' : '#9CA3AF'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[
                  styles.filterText,
                  filterType === option.key && styles.filterTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {readings.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredReadings.map((reading) => (
            <TouchableOpacity
              key={reading.id}
              style={styles.readingCard}
              onLongPress={() => handleDeleteReading(reading)}
            >
              <View style={styles.readingHeader}>
                <View style={styles.readingTypeContainer}>
                  <Ionicons 
                    name={getReadingIcon(reading.type) as any} 
                    size={20} 
                    color="#A855F7" 
                  />
                  <Text style={styles.readingType}>
                    {getReadingTypeName(reading.type)}
                  </Text>
                </View>
                <Text style={styles.readingDate}>{formatDate(reading.date)}</Text>
              </View>
              
              <Text style={styles.readingTitle}>{getReadingTitle(reading)}</Text>
              <Text style={styles.readingPreview}>{getReadingPreview(reading)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: '#A855F7',
  },
  filterText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '500',
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  readingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  readingTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readingType: {
    fontSize: 12,
    color: '#A855F7',
    fontWeight: '500',
    marginLeft: 6,
  },
  readingDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  readingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  readingPreview: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
})

export default HistoryScreen