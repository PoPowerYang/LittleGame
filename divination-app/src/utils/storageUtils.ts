import AsyncStorage from '@react-native-async-storage/async-storage'
import { TarotReading, IChingReading, ZodiacReading } from '../types'

const STORAGE_KEYS = {
  TAROT_READINGS: 'tarot_readings',
  ICHING_READINGS: 'iching_readings',
  ZODIAC_READINGS: 'zodiac_readings'
}

export const saveTarotReading = async (reading: TarotReading): Promise<void> => {
  try {
    const existingReadings = await getTarotReadings()
    const updatedReadings = [reading, ...existingReadings].slice(0, 50) // 最多保存50条记录
    await AsyncStorage.setItem(STORAGE_KEYS.TAROT_READINGS, JSON.stringify(updatedReadings))
  } catch (error) {
    console.error('Error saving tarot reading:', error)
  }
}

export const getTarotReadings = async (): Promise<TarotReading[]> => {
  try {
    const readings = await AsyncStorage.getItem(STORAGE_KEYS.TAROT_READINGS)
    if (readings) {
      const parsed = JSON.parse(readings)
      // 确保日期字段是Date对象
      return parsed.map((reading: any) => ({
        ...reading,
        date: new Date(reading.date)
      }))
    }
    return []
  } catch (error) {
    console.error('Error getting tarot readings:', error)
    return []
  }
}

export const saveIChingReading = async (reading: IChingReading): Promise<void> => {
  try {
    const existingReadings = await getIChingReadings()
    const updatedReadings = [reading, ...existingReadings].slice(0, 50)
    await AsyncStorage.setItem(STORAGE_KEYS.ICHING_READINGS, JSON.stringify(updatedReadings))
  } catch (error) {
    console.error('Error saving I-Ching reading:', error)
  }
}

export const getIChingReadings = async (): Promise<IChingReading[]> => {
  try {
    const readings = await AsyncStorage.getItem(STORAGE_KEYS.ICHING_READINGS)
    if (readings) {
      const parsed = JSON.parse(readings)
      return parsed.map((reading: any) => ({
        ...reading,
        date: new Date(reading.date)
      }))
    }
    return []
  } catch (error) {
    console.error('Error getting I-Ching readings:', error)
    return []
  }
}

export const saveZodiacReading = async (reading: ZodiacReading): Promise<void> => {
  try {
    const existingReadings = await getZodiacReadings()
    const updatedReadings = [reading, ...existingReadings].slice(0, 50)
    await AsyncStorage.setItem(STORAGE_KEYS.ZODIAC_READINGS, JSON.stringify(updatedReadings))
  } catch (error) {
    console.error('Error saving zodiac reading:', error)
  }
}

export const getZodiacReadings = async (): Promise<ZodiacReading[]> => {
  try {
    const readings = await AsyncStorage.getItem(STORAGE_KEYS.ZODIAC_READINGS)
    if (readings) {
      const parsed = JSON.parse(readings)
      return parsed.map((reading: any) => ({
        ...reading,
        date: new Date(reading.date)
      }))
    }
    return []
  } catch (error) {
    console.error('Error getting zodiac readings:', error)
    return []
  }
}

export const clearAllReadings = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TAROT_READINGS,
      STORAGE_KEYS.ICHING_READINGS,
      STORAGE_KEYS.ZODIAC_READINGS
    ])
  } catch (error) {
    console.error('Error clearing readings:', error)
  }
}

export const deleteReading = async (type: 'tarot' | 'iching' | 'zodiac', id: string): Promise<void> => {
  try {
    let key: string
    let getReadings: () => Promise<any[]>
    
    switch (type) {
      case 'tarot':
        key = STORAGE_KEYS.TAROT_READINGS
        getReadings = getTarotReadings
        break
      case 'iching':
        key = STORAGE_KEYS.ICHING_READINGS
        getReadings = getIChingReadings
        break
      case 'zodiac':
        key = STORAGE_KEYS.ZODIAC_READINGS
        getReadings = getZodiacReadings
        break
    }
    
    const readings = await getReadings()
    const filteredReadings = readings.filter(reading => reading.id !== id)
    await AsyncStorage.setItem(key, JSON.stringify(filteredReadings))
  } catch (error) {
    console.error('Error deleting reading:', error)
  }
}