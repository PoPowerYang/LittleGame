import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'

import { RootStackParamList } from '../types'

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>

interface Props {
  navigation: HomeScreenNavigationProp
}

const { width } = Dimensions.get('window')

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const divinationOptions = [
    {
      title: '塔罗牌占卜',
      subtitle: '探索内心深处的秘密',
      icon: 'sparkles-outline',
      colors: ['#8B5CF6', '#EC4899'],
      onPress: () => navigation.navigate('Tarot')
    },
    {
      title: '易经八卦',
      subtitle: '古老的中华智慧',
      icon: 'flower-outline',
      colors: ['#3B82F6', '#06B6D4'],
      onPress: () => navigation.navigate('IChing')
    },
    {
      title: '星座运势',
      subtitle: '星象指引人生方向',
      icon: 'moon-outline',
      colors: ['#6366F1', '#8B5CF6'],
      onPress: () => navigation.navigate('Zodiac')
    }
  ]

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0e1b" />
      <LinearGradient
        colors={['#0f0e1b', '#1a1b2e', '#16213e']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>神秘占卜</Text>
          <Text style={styles.subtitle}>探索未知，预见未来</Text>
        </View>

        <View style={styles.optionsContainer}>
          {divinationOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionCard}
              onPress={option.onPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={option.colors as any}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardContent}>
                  <Ionicons
                    name={option.icon as any}
                    size={40}
                    color="#ffffff"
                    style={styles.cardIcon}
                  />
                  <Text style={styles.cardTitle}>{option.title}</Text>
                  <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('History')}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={20} color="#ffffff" />
          <Text style={styles.historyText}>查看历史记录</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A78BFA',
    fontWeight: '300',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  optionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 24,
    minHeight: 120,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 25,
    marginBottom: 40,
    gap: 8,
  },
  historyText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
})

export default HomeScreen