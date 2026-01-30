# Uno Game Components - Clean & Organized

This directory contains all the reusable components, game logic, and rules for the Uno game in a clean, organized structure.

## 📁 File Structure

```
uno/
├── README.md           # This file - component documentation
├── RULES.md            # Complete Uno game rules and moves guide
├── constants.js         # Game constants (colors, numbers, card types)
├── utils.js            # Utility functions (deck, cards, validation)
├── rules.js            # Game rules and rule validation
├── gameLogic.js        # Clean game logic functions
├── index.js            # Central export file
│
├── Card.jsx            # Individual card component
├── PlayerHand.jsx      # Current player's hand
├── OpponentPlayer.jsx  # Opponent players display
├── Deck.jsx            # Draw pile component
├── DiscardPile.jsx     # Discard pile component
├── CenterArea.jsx      # Center game area
│
├── ColorPicker.jsx     # Color selection modal
├── UnoAnimation.jsx    # UNO call animation
├── LaughAnimation.jsx  # Draw card animation
├── WinnerModal.jsx     # Winner announcement
└── UnoButton.jsx       # Call UNO button
```

## 📚 Documentation

- **[RULES.md](./RULES.md)** - Complete Uno game rules, moves, and strategies
- **[README.md](./README.md)** - Component documentation (this file)

## Component Structure

### Core Components

1. **Card.jsx** - Displays individual Uno cards
    - Props: `card`, `onClick`, `disabled`, `isPlayable`, `isDrawnCard`, `className`, `style`

2. **PlayerHand.jsx** - Displays the current player's hand of cards
    - Props: `hand`, `topCard`, `currentColor`, `currentPlayerIndex`, `assignedPlayerIndex`, `winner`, `pendingDraw`, `drawnCardIndex`, `onCardClick`

3. **OpponentPlayer.jsx** - Displays opponent players with face-down cards
    - Props: `player`, `playerIndex`, `currentPlayerIndex`, `assignedPlayerIndex`, `unoCalled`, `position` ('top', 'left', 'right')

### Game Board Components

4. **Deck.jsx** - Draw pile component
    - Props: `deckLength`, `pendingDraw`, `currentPlayerIndex`, `assignedPlayerIndex`, `winner`, `onDraw`

5. **DiscardPile.jsx** - Discard pile with current color indicator
    - Props: `topCard`, `currentColor`, `currentPlayer`, `assignedPlayerIndex`, `pendingDraw`

6. **CenterArea.jsx** - Combines Deck and DiscardPile in the center
    - Props: `deck`, `discardPile`, `currentColor`, `currentPlayer`, `currentPlayerIndex`, `assignedPlayerIndex`, `pendingDraw`, `winner`, `onDraw`

### UI Components

7. **ColorPicker.jsx** - Modal for choosing color when playing wild cards
    - Props: `show`, `selectedCard`, `onColorSelect`, `onCancel`

8. **UnoAnimation.jsx** - Animation shown when player calls UNO
    - Props: `show`, `playerIndex`, `assignedPlayerIndex`

9. **LaughAnimation.jsx** - Animation shown when player draws cards (+2 or +4)
    - Props: `show`, `playerIndex`, `assignedPlayerIndex`

10. **WinnerModal.jsx** - Modal shown when a player wins
    - Props: `winner`, `winnerName`, `onNewGame`

11. **UnoButton.jsx** - Button to call UNO when player has 1 card
    - Props: `show`, `onCallUno`

## Utilities

### constants.js

- `COLORS` - Array of card colors
- `NUMBERS` - Array of number values
- `ACTION_CARDS` - Array of action card types
- `WILD_CARDS` - Array of wild card types

### utils.js

- `initializeDeck()` - Creates a full Uno deck (108 cards)
- `shuffleDeck(deck)` - Shuffles the deck using Fisher-Yates algorithm
- `dealCards(deck, numPlayers, cardsPerPlayer)` - Deals cards to players
- `isPlayable(card, topCard, currentColor)` - Checks if a card can be played
- `hasMatchingColor(hand, currentColor)` - Checks if player has matching color cards
- `getCardPoints(card)` - Calculates points for a card
- `getCardImage(card)` - Returns the image path for a card
- `getNextPlayerIndex(currentIndex, direction, numPlayers)` - Calculates next player index

## Usage Example

```jsx
import {
    PlayerHand,
    OpponentPlayer,
    CenterArea,
    ColorPicker,
    UnoAnimation,
    LaughAnimation,
    WinnerModal,
    UnoButton,
    COLORS,
    isPlayable
} from './components/uno';

// In your component:
<PlayerHand
    hand={myPlayer.hand}
    topCard={discardPile[discardPile.length - 1]}
    currentColor={currentColor}
    currentPlayerIndex={currentPlayerIndex}
    assignedPlayerIndex={assignedPlayerIndex}
    winner={winner}
    pendingDraw={pendingDraw}
    drawnCardIndex={drawnCardIndex}
    onCardClick={playCard}
/>

<CenterArea
    deck={deck}
    discardPile={discardPile}
    currentColor={currentColor}
    currentPlayer={currentPlayer}
    currentPlayerIndex={currentPlayerIndex}
    assignedPlayerIndex={assignedPlayerIndex}
    pendingDraw={pendingDraw}
    winner={winner}
    onDraw={drawCard}
/>

<ColorPicker
    show={showColorPicker}
    selectedCard={selectedCard}
    onColorSelect={(color) => playCard(selectedCard.index, color)}
    onCancel={() => {
        setShowColorPicker(false);
        setSelectedCard(null);
    }}
/>
```

## 🎯 Game Logic Files

### `rules.js`

Contains all Uno game rules and rule validation:

- `applyCardEffect()` - Applies card effects (Skip, Reverse, Draw 2, etc.)
- `validateMove()` - Validates if a move is legal
- `canPlayWildDraw4()` - Checks Wild Draw 4 restrictions
- `getCardDescription()` - Human-readable card descriptions
- `getGameStatus()` - Current game status message

### `gameLogic.js`

Clean game state management functions:

- `initializeGame()` - Sets up a new game
- `playCard()` - Handles playing a card
- `drawCard()` - Handles drawing a card
- `callUno()` - Handles UNO calls

### `utils.js`

Utility functions:

- `initializeDeck()` - Creates full Uno deck (108 cards)
- `shuffleDeck()` - Shuffles deck
- `dealCards()` - Deals cards to players
- `isPlayable()` - Checks if card can be played
- `getCardImage()` - Gets card image path
- `drawCards()` - Draws cards from deck (with reshuffle)

### `constants.js`

Game constants:

- `COLORS` - ['red', 'green', 'blue', 'yellow']
- `NUMBERS` - [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
- `ACTION_CARDS` - ['skip', 'reverse', 'draw2']
- `WILD_CARDS` - ['wild', 'wild_draw4']

## 📖 Complete Rules

See **[RULES.md](./RULES.md)** for:

- Complete Uno game rules
- All card types and effects
- UNO rule explanation
- Winning conditions
- Special situations
- Quick reference guide

## Benefits

1. **Modularity** - Each component has a single responsibility
2. **Reusability** - Components can be easily reused or modified
3. **Maintainability** - Easier to find and fix bugs
4. **Testability** - Components can be tested in isolation
5. **Readability** - Main Uno component is cleaner and easier to understand
6. **Clear Rules** - All rules documented in RULES.md
7. **Clean Logic** - Game logic separated from UI components
