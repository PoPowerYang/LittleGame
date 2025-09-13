# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native/Expo divination app (神秘占卜) that provides three types of divination services:
- Tarot card readings (塔罗牌占卜)
- I-Ching hexagram consultations (易经八卦)
- Zodiac fortune readings (星座运势)

The app is built with TypeScript and uses React Navigation for screen management.

## Development Commands

All commands should be run from the `divination-app/` directory:

```bash
# Start development server
npm start
# or
expo start

# Start with specific platforms
npm run android    # Android device/emulator
npm run ios        # iOS simulator
npm run web        # Web browser

# Clear cache and start fresh
npx expo start --clear
```

## Architecture

### Directory Structure
```
divination-app/
├── src/
│   ├── components/     # Reusable UI components (currently empty)
│   ├── data/          # Static data files for each divination type
│   ├── hooks/         # Custom React hooks (currently empty)
│   ├── screens/       # Main application screens
│   ├── services/      # External services (AI integration)
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions for each divination type
├── App.tsx            # Root component with navigation setup
└── index.ts           # Entry point
```

### Key Components

**Navigation**: Uses React Navigation with a Stack Navigator. Main screens include:
- HomeScreen: Main menu
- TarotScreen: Tarot card readings
- IChingScreen: I-Ching consultations  
- ZodiacScreen: Zodiac fortune readings
- HistoryScreen: Reading history

**Data Layer**: 
- `src/data/`: Contains static data for tarot cards, I-Ching hexagrams, and zodiac signs
- `src/utils/`: Business logic for each divination type
- `src/services/aiService.ts`: AI-powered interpretations (optional)

**State Management**: Uses local storage via AsyncStorage for persisting reading history.

**Styling**: Dark theme with colors like `#1a1b2e` (header) and `#0f0e1b` (background).

## TypeScript Configuration

The project uses strict TypeScript with Expo's base configuration. All major entities have proper type definitions in `src/types/index.ts`.

## Key Features

- Multi-language support (Chinese/English names for cards and signs)
- Multiple tarot layouts (single, three-card, cross spreads)
- Card reversal mechanics for tarot readings
- Hexagram transformation for I-Ching
- Daily fortune scoring system for zodiac readings
- Reading history persistence