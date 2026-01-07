/**
 * UNO GAME RULES - Complete Official Rules
 * 
 * This file contains all the game rules and logic for Uno
 */

import { COLORS, ACTION_CARDS, WILD_CARDS } from './constants';
import { getNextPlayerIndex, isPlayable } from './utils';

/**
 * OFFICIAL UNO RULES:
 * 
 * 1. SETUP:
 *    - Each player starts with 7 cards
 *    - First card from deck is placed on discard pile
 *    - If first card is Wild, pick random color
 * 
 * 2. TURN ORDER:
 *    - Play proceeds clockwise (direction = 1) or counterclockwise (direction = -1)
 *    - Reverse card changes direction
 *    - In 2-player mode, Reverse acts like Skip
 * 
 * 3. PLAYING CARDS:
 *    - Must match color OR number/action
 *    - Wild cards can be played anytime (but Wild Draw 4 has restrictions)
 *    - If you can't play, you must draw 1 card
 *    - If drawn card is playable, you can play it immediately
 * 
 * 4. ACTION CARDS:
 *    - Skip: Next player loses their turn
 *    - Reverse: Changes play direction (acts like Skip in 2-player)
 *    - Draw 2: Next player draws 2 cards and skips turn
 *    - Wild: Choose any color
 *    - Wild Draw 4: Choose any color, next player draws 4 and skips
 * 
 * 5. UNO RULE:
 *    - When you have 1 card left, you MUST call "UNO" before next player's turn
 *    - If you don't call UNO and next player starts turn, you draw 2 penalty cards
 *    - You can only call UNO when you have exactly 1 card
 * 
 * 6. WINNING:
 *    - First player to play all their cards wins
 *    - Must call UNO before playing last card
 * 
 * 7. DRAWING CARDS:
 *    - Cannot stack Draw 2 or Draw 4
 *    - If you draw Draw 2/4, you must draw and skip (cannot play)
 *    - If deck runs out, reshuffle discard pile (except top card)
 */

/**
 * Apply card effect to game state
 * @param {Object} card - The card being played
 * @param {Object} gameState - Current game state
 * @returns {Object} Updated game state
 */
export function applyCardEffect(card, gameState) {
    const newState = { ...gameState };
    let shouldMoveToNext = true;

    if (card.type === 'action') {
        if (card.value === 'skip') {
            // Skip next player - move twice
            newState.currentPlayerIndex = getNextPlayerIndex(
                newState.currentPlayerIndex,
                newState.playDirection,
                newState.players.length
            );
            newState.currentPlayerIndex = getNextPlayerIndex(
                newState.currentPlayerIndex,
                newState.playDirection,
                newState.players.length
            );
            shouldMoveToNext = false;
        } else if (card.value === 'reverse') {
            // Reverse direction
            newState.playDirection *= -1;
            // In 2-player mode, Reverse acts like Skip
            if (newState.players.length === 2) {
                newState.currentPlayerIndex = getNextPlayerIndex(
                    newState.currentPlayerIndex,
                    newState.playDirection,
                    newState.players.length
                );
                shouldMoveToNext = false;
            }
            // In 3+ players, just reverse direction, turn stays with current player
        } else if (card.value === 'draw2') {
            // Next player draws 2 and skips
            newState.pendingDraw = (newState.pendingDraw || 0) + 2;
            // Move to next player, they will draw and skip
            newState.currentPlayerIndex = getNextPlayerIndex(
                newState.currentPlayerIndex,
                newState.playDirection,
                newState.players.length
            );
            shouldMoveToNext = false;
        }
    } else if (card.type === 'wild') {
        if (card.value === 'wild_draw4') {
            // Next player draws 4 and skips
            newState.pendingDraw = (newState.pendingDraw || 0) + 4;
            // Move to next player, they will draw and skip
            newState.currentPlayerIndex = getNextPlayerIndex(
                newState.currentPlayerIndex,
                newState.playDirection,
                newState.players.length
            );
            shouldMoveToNext = false;
        }
        // Wild card requires color selection (handled in playCard)
    }

    // Move to next player for normal cards or reverse in 3+ player mode
    if (shouldMoveToNext) {
        newState.currentPlayerIndex = getNextPlayerIndex(
            newState.currentPlayerIndex,
            newState.playDirection,
            newState.players.length
        );
    }

    return newState;
}

/**
 * Check if player can play Wild Draw 4
 * Official rule: Can only play if you don't have a matching color card
 * @param {Array} hand - Player's hand
 * @param {string} currentColor - Current color on discard pile
 * @returns {boolean} True if player can play Wild Draw 4
 */
export function canPlayWildDraw4(hand, currentColor) {
    // Check if player has any card matching current color (non-wild)
    return !hand.some(card =>
        card !== null &&
        card.color === currentColor &&
        card.type !== 'wild'
    );
}

/**
 * Validate if a move is legal
 * @param {Object} card - Card being played
 * @param {Object} topCard - Top card on discard pile
 * @param {string} currentColor - Current color
 * @param {Array} playerHand - Player's hand (for Wild Draw 4 validation)
 * @returns {Object} { valid: boolean, reason: string }
 */
export function validateMove(card, topCard, currentColor, playerHand = []) {
    // Wild Draw 4 has special restrictions
    if (card.type === 'wild' && card.value === 'wild_draw4') {
        if (!canPlayWildDraw4(playerHand, currentColor)) {
            return {
                valid: false,
                reason: 'You can only play Wild Draw 4 if you don\'t have a matching color card'
            };
        }
    }

    // Check if card is playable
    if (!isPlayable(card, topCard, currentColor)) {
        return {
            valid: false,
            reason: 'Card does not match color or number/action'
        };
    }

    return { valid: true, reason: '' };
}

/**
 * Get card description for display
 * @param {Object} card - Card object
 * @returns {string} Human-readable card description
 */
export function getCardDescription(card) {
    if (card.type === 'number') {
        return `${card.color} ${card.value}`;
    } else if (card.type === 'action') {
        const actionNames = {
            'skip': 'Skip',
            'reverse': 'Reverse',
            'draw2': 'Draw 2'
        };
        return `${card.color} ${actionNames[card.value] || card.value}`;
    } else if (card.type === 'wild') {
        if (card.value === 'wild_draw4') {
            return 'Wild Draw 4';
        }
        return 'Wild Card';
    }
    return 'Unknown Card';
}

/**
 * Check if game is over
 * @param {Array} players - Array of players
 * @param {number} winner - Winner index (if any)
 * @returns {boolean} True if game is over
 */
export function isGameOver(players, winner) {
    return winner !== null && winner !== undefined;
}

/**
 * Get game status message
 * @param {Object} gameState - Current game state
 * @returns {string} Status message
 */
export function getGameStatus(gameState) {
    const { currentPlayerIndex, players, winner, gameStarted } = gameState;
    
    if (!gameStarted) {
        return 'Waiting for players to join...';
    }
    
    if (winner !== null && winner !== undefined) {
        return `${players[winner]?.name || 'Player'} wins!`;
    }
    
    const currentPlayer = players[currentPlayerIndex];
    return currentPlayer ? `${currentPlayer.name}'s turn` : 'Game in progress';
}






