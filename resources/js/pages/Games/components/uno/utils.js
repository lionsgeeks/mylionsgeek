import { COLORS, NUMBERS, ACTION_CARDS, WILD_CARDS } from './constants';

// Initialize full UNO deck (108 cards)
export function initializeDeck() {
    const deck = [];

    // Number cards (0-9) for each color
    COLORS.forEach(color => {
        // One 0 card per color
        deck.push({ type: 'number', color, value: 0 });

        // Two of each 1-9 per color
        NUMBERS.slice(1).forEach(num => {
            deck.push({ type: 'number', color, value: num });
            deck.push({ type: 'number', color, value: num });
        });

        // Action cards (2 of each per color)
        ACTION_CARDS.forEach(action => {
            deck.push({ type: 'action', color, value: action });
            deck.push({ type: 'action', color, value: action });
        });
    });

    // Wild cards (4 of each)
    WILD_CARDS.forEach(wild => {
        for (let i = 0; i < 4; i++) {
            deck.push({ type: 'wild', color: null, value: wild });
        }
    });

    return deck;
}

// Shuffle deck using Fisher-Yates algorithm
export function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Deal cards to players
export function dealCards(deck, numPlayers, cardsPerPlayer = 7) {
    const hands = Array(numPlayers).fill(null).map(() => []);
    let deckIndex = 0;

    for (let i = 0; i < cardsPerPlayer; i++) {
        for (let p = 0; p < numPlayers; p++) {
            if (deckIndex < deck.length) {
                hands[p].push(deck[deckIndex++]);
            }
        }
    }

    return { hands, remainingDeck: deck.slice(deckIndex) };
}

// Check if a card is playable
export function isPlayable(card, topCard, currentColor) {
    // Wild cards are always playable (but Wild Draw 4 has restrictions)
    if (card.type === 'wild') {
        return true;
    }

    // Match color
    if (card.color === currentColor) {
        return true;
    }

    // Match number or action
    if (card.type === topCard.type && card.value === topCard.value) {
        return true;
    }

    return false;
}

// Check if player has any card matching current color (for Wild Draw 4 challenge)
export function hasMatchingColor(hand, currentColor) {
    return hand.some(card =>
        card !== null &&
        card.color === currentColor &&
        card.type !== 'wild'
    );
}

// Calculate card points for scoring
export function getCardPoints(card) {
    if (card.type === 'number') {
        return card.value;
    } else if (card.type === 'action') {
        return 20; // Skip, Reverse, Draw 2
    } else if (card.type === 'wild') {
        return 50; // Wild, Wild Draw 4
    }
    return 0;
}

// Get card image path - matches the actual image files in /public/assets/images/uno-card-images/
export function getCardImage(card) {
    if (card.type === 'wild') {
        if (card.value === 'wild_draw4') {
            return '/assets/images/uno-card-images/Wild_Card_Draw_4.png';
        }
        return '/assets/images/uno-card-images/Wild_Card_Change_Colour.png';
    }

    // Capitalize first letter of color (red -> Red, blue -> Blue, etc.)
    const color = card.color.charAt(0).toUpperCase() + card.color.slice(1);
    let value;

    if (card.type === 'number') {
        value = card.value; // 0, 1, 2, etc.
    } else if (card.type === 'action') {
        // Map action card values to image names
        if (card.value === 'draw2') {
            value = 'Draw_2';
        } else if (card.value === 'reverse') {
            value = 'Reverse';
        } else if (card.value === 'skip') {
            value = 'Skip';
        } else {
            value = card.value;
        }
    }

    return `/assets/images/uno-card-images/${color}_${value}.png`;
}

// Calculate next player index
export function getNextPlayerIndex(currentIndex, direction, numPlayers) {
    let next = (currentIndex + direction) % numPlayers;
    if (next < 0) next += numPlayers;
    return next;
}

// Draw cards from deck (with reshuffle if needed)
export function drawCards(numCards, playerIndex, gameState) {
    const newState = { ...gameState };
    const newDeck = [...newState.deck];
    const newPlayers = [...newState.players];

    // If deck is empty, reshuffle discard pile (except top card)
    if (newDeck.length < numCards) {
        const topCard = newState.discardPile[newState.discardPile.length - 1];
        const reshuffled = shuffleDeck(newState.discardPile.slice(0, -1));
        newDeck.push(...reshuffled);
        newState.discardPile = [topCard];
    }

    // Draw cards
    const drawnCards = newDeck.splice(0, numCards);
    newPlayers[playerIndex].hand = [...newPlayers[playerIndex].hand, ...drawnCards];

    newState.deck = newDeck;
    newState.players = newPlayers;

    return newState;
}

