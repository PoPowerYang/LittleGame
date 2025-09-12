import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { StatusBar } from 'expo-status-bar'

import HomeScreen from './src/screens/HomeScreen'
import TarotScreen from './src/screens/TarotScreen'
import IChingScreen from './src/screens/IChingScreen'
import ZodiacScreen from './src/screens/ZodiacScreen'
import HistoryScreen from './src/screens/HistoryScreen'

import { RootStackParamList } from './src/types'

const Stack = createStackNavigator<RootStackParamList>()

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1a1b2e" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1b2e',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          cardStyle: {
            backgroundColor: '#0f0e1b',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: '神秘占卜', headerShown: false }}
        />
        <Stack.Screen 
          name="Tarot" 
          component={TarotScreen}
          options={{ title: '塔罗牌占卜' }}
        />
        <Stack.Screen 
          name="IChing" 
          component={IChingScreen}
          options={{ title: '易经八卦' }}
        />
        <Stack.Screen 
          name="Zodiac" 
          component={ZodiacScreen}
          options={{ title: '星座运势' }}
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen}
          options={{ title: '历史记录' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}