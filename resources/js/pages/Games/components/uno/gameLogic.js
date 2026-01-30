/**
 * UNO GAME LOGIC - Clean Game State Management
 *
 * This file contains all game logic functions in a clean, organized way
 */

import { applyCardEffect, validateMove } from './rules';
import { dealCards, drawCards as drawCardsUtil, getNextPlayerIndex, initializeDeck, isPlayable, shuffleDeck } from './utils';

/**
 * Initialize a new game
 * @param {Array<string>} playerNames - Array of player names
 * @returns {Object} Initial game state
 */
export function initializeGame(playerNames) {
    const newDeck = shuffleDeck(initializeDeck());
    const { hands, remainingDeck } = dealCards(newDeck, playerNames.length, 7);

    // Create players
    const players = playerNames.map((name, index) => ({
        id: index,
        name,
        hand: hands[index],
        score: 0,
    }));

    // Start with first card from deck
    let topCard = remainingDeck[0];
    const discardPile = [topCard];
    const deck = remainingDeck.slice(1);

    // If first card is Wild, pick a random color
    let initialColor = topCard.color;
    if (!initialColor) {
        const COLORS = ['red', 'green', 'blue', 'yellow'];
        initialColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    return {
        deck,
        discardPile,
        players,
        currentPlayerIndex: 0,
        playDirection: 1, // 1 = clockwise, -1 = counterclockwise
        currentColor: initialColor,
        gameStarted: true,
        winner: null,
        pendingDraw: 0,
        unoCalled: {},
        needsUnoCall: {},
        drawnCardIndex: null,
    };
}

/**
 * Play a card
 * @param {Object} params - Game parameters
 * @param {number} params.cardIndex - Index of card in player's hand
 * @param {string} params.chosenColor - Color chosen for wild cards
 * @param {Object} params.gameState - Current game state
 * @returns {Object} Updated game state and result
 */
export function playCard({ cardIndex, chosenColor, gameState }) {
    const { players, currentPlayerIndex, discardPile, currentColor, deck, unoCalled, needsUnoCall } = gameState;

    const currentPlayer = players[currentPlayerIndex];
    const card = currentPlayer.hand[cardIndex];
    const topCard = discardPile[discardPile.length - 1];

    // Validate move
    const validation = validateMove(card, topCard, currentColor, currentPlayer.hand);
    if (!validation.valid) {
        return {
            success: false,
            error: validation.reason,
            gameState,
        };
    }

    // For Wild cards, require color selection
    if (card.type === 'wild' && !chosenColor) {
        return {
            success: false,
            needsColorSelection: true,
            card,
            cardIndex,
            gameState,
        };
    }

    // Create new game state
    const newState = {
        ...gameState,
        deck: [...deck],
        discardPile: [...discardPile],
        players: players.map((p) => ({ ...p, hand: [...p.hand] })),
        currentColor: chosenColor || card.color || currentColor,
    };

    // Remove card from hand
    newState.players[currentPlayerIndex].hand.splice(cardIndex, 1);

    // Add to discard pile
    newState.discardPile.push(card);

    // Check for win
    const handSizeAfter = newState.players[currentPlayerIndex].hand.filter((c) => c !== null).length;
    if (handSizeAfter === 0) {
        // Check if player called UNO
        if (unoCalled[currentPlayerIndex]) {
            newState.winner = currentPlayerIndex;
            return {
                success: true,
                gameState: newState,
                winner: currentPlayerIndex,
            };
        }
    }

    // UNO rule: If player now has 1 card, they need to call UNO
    if (handSizeAfter === 1) {
        newState.needsUnoCall = { ...needsUnoCall, [currentPlayerIndex]: true };
    } else {
        // Clear needsUnoCall if they have more than 1 card
        const updatedNeedsUnoCall = { ...needsUnoCall };
        delete updatedNeedsUnoCall[currentPlayerIndex];
        newState.needsUnoCall = updatedNeedsUnoCall;
    }

    // Clear UNO call status if player now has more than 1 card
    if (handSizeAfter > 1) {
        const updatedUnoCalled = { ...unoCalled };
        delete updatedUnoCalled[currentPlayerIndex];
        newState.unoCalled = updatedUnoCalled;
    }

    // Apply card effect (handles turn progression and pending draws)
    const stateAfterEffect = applyCardEffect(card, newState);

    // Handle pending draws
    if (stateAfterEffect.pendingDraw > 0) {
        // Draw cards for the player who has to draw
        const drawnState = drawCardsUtil(stateAfterEffect.pendingDraw, stateAfterEffect.currentPlayerIndex, stateAfterEffect);

        // Skip the player who just drew (official rule: cannot play after drawing Draw 2/4)
        drawnState.currentPlayerIndex = getNextPlayerIndex(drawnState.currentPlayerIndex, drawnState.playDirection, drawnState.players.length);
        drawnState.pendingDraw = 0;

        return {
            success: true,
            gameState: drawnState,
            laughAnimation: {
                playerIndex: stateAfterEffect.currentPlayerIndex,
                drawAmount: stateAfterEffect.pendingDraw,
            },
        };
    }

    // Clear UNO status when turn changes
    if (stateAfterEffect.currentPlayerIndex !== currentPlayerIndex) {
        const previousPlayerIndex = currentPlayerIndex;
        // Check if previous player had UNO button visible but didn't call it
        if (needsUnoCall[previousPlayerIndex] && !unoCalled[previousPlayerIndex]) {
            // Player had 1 card and didn't call UNO - draw 2 penalty
            const penaltyState = drawCardsUtil(2, previousPlayerIndex, stateAfterEffect);
            return {
                success: true,
                gameState: penaltyState,
            };
        }

        // Clear all UNO statuses when turn changes
        stateAfterEffect.unoCalled = {};
        stateAfterEffect.needsUnoCall = {};
    }

    return {
        success: true,
        gameState: stateAfterEffect,
    };
}

/**
 * Draw a card
 * @param {Object} params - Game parameters
 * @param {Object} params.gameState - Current game state
 * @returns {Object} Updated game state and result
 */
export function drawCard({ gameState }) {
    const { players, currentPlayerIndex, deck, discardPile, currentColor, playDirection, pendingDraw } = gameState;

    // If there's a pending draw, must draw those cards first
    if (pendingDraw > 0) {
        const newState = {
            ...gameState,
            deck: [...deck],
            discardPile: [...discardPile],
            players: players.map((p) => ({ ...p, hand: [...p.hand] })),
        };

        // Draw pending cards
        const drawnState = drawCardsUtil(pendingDraw, currentPlayerIndex, newState);

        // Skip turn after drawing
        drawnState.currentPlayerIndex = getNextPlayerIndex(currentPlayerIndex, playDirection, players.length);
        drawnState.pendingDraw = 0;
        drawnState.unoCalled = {};
        drawnState.needsUnoCall = {};

        return {
            success: true,
            gameState: drawnState,
        };
    }

    // Normal draw (when cannot play)
    const newState = {
        ...gameState,
        deck: [...deck],
        discardPile: [...discardPile],
        players: players.map((p) => ({ ...p, hand: [...p.hand] })),
    };

    // Draw 1 card
    const drawnState = drawCardsUtil(1, currentPlayerIndex, newState);

    // Get the drawn card
    const drawnCard = drawnState.players[currentPlayerIndex].hand[drawnState.players[currentPlayerIndex].hand.length - 1];
    const topCard = drawnState.discardPile[drawnState.discardPile.length - 1];

    // Check if drawn card is playable
    const isDrawnCardPlayable = drawnCard && isPlayable(drawnCard, topCard, currentColor);

    if (isDrawnCardPlayable) {
        // Card is playable - player can choose to play it immediately
        const drawnCardIndex = drawnState.players[currentPlayerIndex].hand.length - 1;
        drawnState.drawnCardIndex = drawnCardIndex;
        // Keep current player's turn
        return {
            success: true,
            gameState: drawnState,
            canPlayDrawnCard: true,
        };
    } else {
        // Card is not playable - move to next player
        drawnState.currentPlayerIndex = getNextPlayerIndex(currentPlayerIndex, playDirection, players.length);
        drawnState.drawnCardIndex = null;
        drawnState.unoCalled = {};
        drawnState.needsUnoCall = {};

        return {
            success: true,
            gameState: drawnState,
        };
    }
}

/**
 * Call UNO
 * @param {Object} params - Game parameters
 * @param {number} params.playerIndex - Index of player calling UNO
 * @param {Object} params.gameState - Current game state
 * @returns {Object} Updated game state
 */
export function callUno({ playerIndex, gameState }) {
    const { players, unoCalled, needsUnoCall } = gameState;
    const player = players[playerIndex];

    if (!player) {
        return {
            success: false,
            error: 'Player not found',
            gameState,
        };
    }

    const handSize = player.hand.filter((c) => c !== null).length;

    // Player can only call UNO when they have 1 card
    if (handSize === 1) {
        const newUnoCalled = { ...unoCalled, [playerIndex]: true };
        const updatedNeedsUnoCall = { ...needsUnoCall };
        delete updatedNeedsUnoCall[playerIndex];

        return {
            success: true,
            gameState: {
                ...gameState,
                unoCalled: newUnoCalled,
                needsUnoCall: updatedNeedsUnoCall,
            },
            unoAnimation: {
                playerIndex,
                timestamp: Date.now(),
            },
        };
    }

    return {
        success: false,
        error: 'You can only call UNO when you have 1 card',
        gameState,
    };
}
