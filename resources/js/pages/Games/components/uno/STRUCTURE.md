# Uno Game - Clean Component Structure

## 📊 File Structure & Line Counts

### Main File
- **Uno.jsx** - 265 lines ✅ (Under 500 limit)

### Components (All under 500 lines)

#### UI Components
- **Card.jsx** - 35 lines
- **PlayerHand.jsx** - 117 lines
- **OpponentPlayer.jsx** - 175 lines
- **Deck.jsx** - 49 lines
- **DiscardPile.jsx** - 65 lines
- **CenterArea.jsx** - 40 lines
- **GameLayout.jsx** - 137 lines
- **GameScreen.jsx** - 110 lines
- **LobbyScreen.jsx** - 112 lines
- **GameBackground.jsx** - 57 lines
- **FullscreenButton.jsx** - 30 lines

#### Modal/Animation Components
- **ColorPicker.jsx** - 37 lines
- **UnoAnimation.jsx** - 16 lines
- **LaughAnimation.jsx** - 38 lines
- **WinnerModal.jsx** - 21 lines
- **UnoButton.jsx** - 18 lines

#### Logic & Utilities
- **constants.js** - 6 lines
- **utils.js** - 163 lines
- **rules.js** - 225 lines
- **gameLogic.js** - 341 lines
- **useUnoGame.js** - 424 lines (Game state hook)
- **useUnoActions.js** - 466 lines (Game actions hook)
- **useUnoRoom.js** - 159 lines (Room management hook)
- **index.js** - 30 lines (Exports)

## 🎯 Component Responsibilities

### Main Uno.jsx (265 lines)
- Orchestrates all components and hooks
- Handles routing between lobby and game
- Manages fullscreen mode
- Minimal logic - delegates to hooks and components

### Game State Management
- **useUnoGame.js** - All game state (deck, players, turn, etc.)
- **useUnoActions.js** - All game actions (playCard, drawCard, callUno)
- **useUnoRoom.js** - Room connection and multiplayer

### Game Logic
- **rules.js** - All Uno game rules and validation
- **gameLogic.js** - Clean game logic functions
- **utils.js** - Utility functions (deck, cards, etc.)

### UI Components
- **LobbyScreen.jsx** - Pre-game lobby
- **GameScreen.jsx** - Main game screen wrapper
- **GameLayout.jsx** - Player positioning and layout
- **GameBackground.jsx** - Background graphics
- **FullscreenButton.jsx** - Fullscreen toggle

### Game Elements
- **Card.jsx** - Individual card display
- **PlayerHand.jsx** - Current player's cards
- **OpponentPlayer.jsx** - Opponent players
- **Deck.jsx** - Draw pile
- **DiscardPile.jsx** - Discard pile with color indicator
- **CenterArea.jsx** - Center game area (deck + discard)

### Modals & Animations
- **ColorPicker.jsx** - Wild card color selection
- **UnoAnimation.jsx** - UNO call animation
- **LaughAnimation.jsx** - Draw card animation
- **WinnerModal.jsx** - Winner announcement
- **UnoButton.jsx** - Call UNO button

## 📁 Directory Structure

```
components/uno/
├── Main Components
│   ├── Uno.jsx (265 lines) ✅
│   ├── LobbyScreen.jsx (112 lines)
│   ├── GameScreen.jsx (110 lines)
│   ├── GameLayout.jsx (137 lines)
│   └── GameBackground.jsx (57 lines)
│
├── Game Elements
│   ├── Card.jsx (35 lines)
│   ├── PlayerHand.jsx (117 lines)
│   ├── OpponentPlayer.jsx (175 lines)
│   ├── Deck.jsx (49 lines)
│   ├── DiscardPile.jsx (65 lines)
│   └── CenterArea.jsx (40 lines)
│
├── UI Components
│   ├── ColorPicker.jsx (37 lines)
│   ├── UnoAnimation.jsx (16 lines)
│   ├── LaughAnimation.jsx (38 lines)
│   ├── WinnerModal.jsx (21 lines)
│   ├── UnoButton.jsx (18 lines)
│   └── FullscreenButton.jsx (30 lines)
│
├── Logic & Hooks
│   ├── useUnoGame.js (424 lines) - Game state
│   ├── useUnoActions.js (466 lines) - Game actions
│   ├── useUnoRoom.js (159 lines) - Room management
│   ├── rules.js (225 lines) - Game rules
│   ├── gameLogic.js (341 lines) - Game logic
│   └── utils.js (163 lines) - Utilities
│
└── Constants & Exports
    ├── constants.js (6 lines)
    ├── index.js (30 lines)
    └── README.md - Documentation
```

## ✅ Requirements Met

- ✅ Main Uno.jsx: **265 lines** (under 500)
- ✅ All components: **Under 500 lines each**
- ✅ Clean separation of concerns
- ✅ All rules documented in RULES.md
- ✅ All moves clearly organized
- ✅ Easy to build and maintain

## 🎮 How to Use

### Adding a New Feature
1. Identify which component/hook handles it
2. Modify that specific file (all under 500 lines)
3. No need to touch the main Uno.jsx file

### Understanding the Code
1. Read **RULES.md** for game rules
2. Check **STRUCTURE.md** (this file) for organization
3. Each component is self-contained and documented

### Modifying Game Logic
- **rules.js** - Change game rules
- **gameLogic.js** - Change game flow
- **useUnoActions.js** - Change action behavior

### Modifying UI
- **GameScreen.jsx** - Main game layout
- **GameLayout.jsx** - Player positioning
- Individual component files for specific UI elements

## 🚀 Benefits

1. **Maintainable** - Each file has a clear purpose
2. **Readable** - All files under 500 lines
3. **Modular** - Easy to modify individual parts
4. **Testable** - Components can be tested independently
5. **Scalable** - Easy to add new features

