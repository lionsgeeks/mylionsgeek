import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import axios from 'axios';
import useAblyChannelGames from '@/hooks/useAblyChannelGames';

// Card types and colors
const COLORS = ['red', 'green', 'blue', 'yellow'];
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const ACTION_CARDS = ['skip', 'reverse', 'draw2'];
const WILD_CARDS = ['wild', 'wild_draw4'];

// Initialize full UNO deck (108 cards)
function initializeDeck() {
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
function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Deal cards to players
function dealCards(deck, numPlayers, cardsPerPlayer = 7) {
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
function isPlayable(card, topCard, currentColor) {
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
function hasMatchingColor(hand, currentColor) {
    return hand.some(card => 
        card !== null && 
        card.color === currentColor && 
        card.type !== 'wild'
    );
}

// Calculate card points for scoring
function getCardPoints(card) {
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
function getCardImage(card) {
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

export default function Uno() {
    const page = usePage();
    const auth = page?.props?.auth;

    // Game state
    const [deck, setDeck] = useState([]);
    const [discardPile, setDiscardPile] = useState([]);
    const [players, setPlayers] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [playDirection, setPlayDirection] = useState(1); // 1 = clockwise, -1 = counterclockwise
    const [currentColor, setCurrentColor] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [winner, setWinner] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [unoCalled, setUnoCalled] = useState({}); // Track who called UNO
    const [pendingDraw, setPendingDraw] = useState(0); // Cards to draw (Draw 2, Draw 4)
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [drawnCardIndex, setDrawnCardIndex] = useState(null); // Track if a card was just drawn and can be played
    const [needsUnoCall, setNeedsUnoCall] = useState({}); // Track players who need to call UNO (have 1 card after playing)
    const [unoAnimation, setUnoAnimation] = useState(null); // Track UNO animation: { playerIndex, timestamp }
    const [laughAnimation, setLaughAnimation] = useState(null); // Track laugh animation: { playerIndex, drawAmount, timestamp }
    const [scores, setScores] = useState({}); // Track scores for each player: { playerIndex: points }
    const [roundWinner, setRoundWinner] = useState(null); // Track round winner
    const [gameWinner, setGameWinner] = useState(null); // Track game winner (500+ points)
    const [wildDraw4Challenge, setWildDraw4Challenge] = useState(null); // Track Wild Draw 4 challenge: { challengerIndex, targetIndex }
    const [lastPlayedCard, setLastPlayedCard] = useState(null); // Track last played card for challenge
    const [illegalPlayDetected, setIllegalPlayDetected] = useState(null); // Track illegal plays

    // Online multiplayer state
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [assignedPlayerIndex, setAssignedPlayerIndex] = useState(null);
    const lastStateHashRef = useRef(null);
    const fullGameStateRef = useRef(null); // Store full game state with all hands (for server communication)
    const gameStateRef = useRef({ deck: [], discardPile: [], players: [], currentPlayerIndex: 0, playDirection: 1, currentColor: null }); // Store latest game state for timer callbacks

    // Ably channel for real-time game updates
    const gameChannelName = roomId ? `game:${roomId}` : 'game:placeholder';
    const { isConnected: ablyConnected, subscribe } = useAblyChannelGames(
        gameChannelName,
        ['game-state-updated', 'game-reset'],
        {
            onConnected: () => {
                console.log('✅ Ably connected for game room:', roomId);
            },
            onError: (error) => {
                console.error('❌ Ably connection error:', error);
            },
        }
    );

    // Initialize game
    const initializeGame = useCallback((playerNames) => {
        const newDeck = shuffleDeck(initializeDeck());
        const { hands, remainingDeck } = dealCards(newDeck, playerNames.length, 7);

        // Create players
        const newPlayers = playerNames.map((name, index) => ({
            id: index,
            name,
            hand: hands[index],
            score: 0,
        }));

        // Start with first card from deck
        let topCard = remainingDeck[0];
        const newDiscardPile = [topCard];
        const newRemainingDeck = remainingDeck.slice(1);

        // If first card is Wild, pick a random color
        let initialColor = topCard.color;
        if (!initialColor) {
            initialColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        }

        setDeck(newRemainingDeck);
        setDiscardPile(newDiscardPile);
        setPlayers(newPlayers);
        setCurrentPlayerIndex(0);
        setPlayDirection(1);
        setCurrentColor(initialColor);
        setGameStarted(true);
        setWinner(null);
        setUnoCalled({});
        setPendingDraw(0);
        // Clear all UNO status
        setNeedsUnoCall({});
        setUnoCalled({});

        return {
            deck: newRemainingDeck,
            discardPile: newDiscardPile,
            players: newPlayers,
            currentPlayerIndex: 0,
            playDirection: 1,
            currentColor: initialColor,
            gameStarted: true,
        };
    }, []);

    // Calculate next player index
    const getNextPlayerIndex = useCallback((currentIndex, direction, numPlayers) => {
        let next = (currentIndex + direction) % numPlayers;
        if (next < 0) next += numPlayers;
        return next;
    }, []);

    // Apply card effect
    const applyCardEffect = useCallback((card, gameState) => {
        const newState = { ...gameState };

        // Move to next player first (for most cards)
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
                shouldMoveToNext = false; // Already moved
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
                    shouldMoveToNext = false; // Already moved
                }
                // In 3+ players, just reverse direction, turn stays with current player
                // Then move to next (which is now previous due to reverse)
            } else if (card.value === 'draw2') {
                // Next player draws 2 and skips
                newState.pendingDraw = (newState.pendingDraw || 0) + 2;
                // Move to next player, they will draw and skip
                newState.currentPlayerIndex = getNextPlayerIndex(
                    newState.currentPlayerIndex,
                    newState.playDirection,
                    newState.players.length
                );
                shouldMoveToNext = false; // Already moved
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
                shouldMoveToNext = false; // Already moved
            }
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
    }, [getNextPlayerIndex]);

    // Draw cards
    const drawCards = useCallback((numCards, playerIndex, gameState) => {
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
    }, []);

    // Play card
    const playCard = useCallback((cardIndex, chosenColor = null) => {
        if (!gameStarted || winner) return;

        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer || currentPlayer.id !== assignedPlayerIndex) return;

        const card = currentPlayer.hand[cardIndex];
        if (!card) return;

        const topCard = discardPile[discardPile.length - 1];

        // Check if card is playable
        if (!isPlayable(card, topCard, currentColor)) {
            return;
        }

        // Check hand size before playing
        const handSizeBefore = currentPlayer.hand.filter(c => c !== null).length;

        // For Wild cards, require color selection
        if (card.type === 'wild' && !chosenColor) {
            setSelectedCard({ card, index: cardIndex });
            setShowColorPicker(true);
            return;
        }

        // Create new game state
        // Use full game state from ref if available, otherwise reconstruct
        let fullPlayers = players;
        if (fullGameStateRef.current && fullGameStateRef.current.players) {
            // Use full state from server, but update our player's hand
            fullPlayers = fullGameStateRef.current.players.map((p, idx) => {
                if (idx === assignedPlayerIndex) {
                    // Use our local hand (which is accurate)
                    return { ...p, hand: [...players[assignedPlayerIndex].hand] };
                }
                // Use server's hand for other players (we don't see it anyway)
                return { ...p, hand: [...p.hand] };
            });
        } else {
            // Fallback: reconstruct from local state
            fullPlayers = players.map(p => ({ ...p, hand: [...p.hand] }));
        }

        let newState = {
            deck: [...deck],
            discardPile: [...discardPile],
            players: fullPlayers,
            currentPlayerIndex,
            playDirection,
            currentColor: chosenColor || card.color || currentColor,
            pendingDraw,
        };

        // Remove card from hand
        newState.players[currentPlayerIndex].hand.splice(cardIndex, 1);

        // Add to discard pile
        newState.discardPile.push(card);

        // Check hand size after playing
        const handSizeAfter = newState.players[currentPlayerIndex].hand.filter(c => c !== null).length;

        // 🏆 Check for win - if last card is played
        if (newState.players[currentPlayerIndex].hand.length === 0) {
            // Check if player had called UNO before playing last card
            if (unoCalled[currentPlayerIndex]) {
                // ✅ Player wins - they called UNO and played their last card
                newState.winner = currentPlayerIndex;
                setWinner(currentPlayerIndex);

                // Clear UNO call status for winner
                setUnoCalled(prev => {
                    const updated = { ...prev };
                    delete updated[currentPlayerIndex];
                    return updated;
                });
                setNeedsUnoCall(prev => {
                    const updated = { ...prev };
                    delete updated[currentPlayerIndex];
                    return updated;
                });

                // Update local state immediately for win
                setDeck(newState.deck);
                setDiscardPile(newState.discardPile);
                setPlayers(newState.players);
                setCurrentPlayerIndex(currentPlayerIndex);
                setPlayDirection(newState.playDirection);
                setCurrentColor(newState.currentColor);
                setPendingDraw(0);
                setSelectedCard(null);
                setShowColorPicker(false);

                // Update ref
                gameStateRef.current = {
                    deck: newState.deck,
                    discardPile: newState.discardPile,
                    players: newState.players,
                    currentPlayerIndex: currentPlayerIndex,
                    playDirection: newState.playDirection,
                    currentColor: newState.currentColor,
                };

                // Save to database and broadcast via Ably
                if (isConnected && roomId) {
                    const gameState = {
                        deck: newState.deck,
                        discardPile: newState.discardPile,
                        players: newState.players.map(p => ({
                            id: p.id,
                            name: p.name,
                            hand: p.hand,
                            score: p.score,
                        })),
                        currentPlayerIndex: currentPlayerIndex,
                        playDirection: newState.playDirection,
                        currentColor: newState.currentColor,
                        gameStarted: true,
                        winner: newState.winner,
                        pendingDraw: 0,
                    };

                    try {
                        axios.post(`/api/games/state/${roomId}`, {
                            game_type: 'uno',
                            game_state: gameState,
                        });
                    } catch (error) {
                        console.error('Failed to update game state:', error);
                    }
                }
                return; // Exit early - no card effects when winning
            } else {
                // Player played last card - they win (no penalty for not calling UNO)
                // Continue with game normally
            }
        }

        // ⚠️ UNO RULE: If player now has 1 card after playing, show UNO button
        // Player must call UNO when they have 2 cards and play one, leaving them with 1 card
        if (handSizeAfter === 1) {
            // Show UNO button - player needs to call UNO
            setNeedsUnoCall(prev => ({ ...prev, [currentPlayerIndex]: true }));
        } else {
            // Clear needsUnoCall if they have more than 1 card
            setNeedsUnoCall(prev => {
                const updated = { ...prev };
                delete updated[currentPlayerIndex];
                return updated;
            });
        }

        // Clear UNO call status if player now has more than 1 card
        if (newState.players[currentPlayerIndex].hand.filter(c => c !== null).length > 1) {
            setUnoCalled(prev => {
                const updated = { ...prev };
                delete updated[currentPlayerIndex];
                return updated;
            });
        }

        // Check for Wild Draw 4 challenge before applying effect
        if (card.value === 'wild_draw4') {
            // Store last played card for potential challenge
            setLastPlayedCard({ card, playerIndex: currentPlayerIndex });
        }
        
        // Apply card effect (this handles turn progression and pending draws)
        newState = applyCardEffect(card, newState);

        // Handle pending draws (after effect is applied, currentPlayerIndex is already the target)
        // OFFICIAL RULE: Cannot stack Draw 2 or Draw 4
        if (newState.pendingDraw > 0) {
            // Trigger laugh animation for the player who has to draw
            setLaughAnimation({
                playerIndex: newState.currentPlayerIndex,
                drawAmount: newState.pendingDraw,
                timestamp: Date.now()
            });
            // Clear animation after 3 seconds
            setTimeout(() => {
                setLaughAnimation(null);
            }, 3000);
            
            newState = drawCards(newState.pendingDraw, newState.currentPlayerIndex, newState);
            // Skip the player who just drew (official rule: cannot play after drawing Draw 2/4)
            newState.currentPlayerIndex = getNextPlayerIndex(
                newState.currentPlayerIndex,
                newState.playDirection,
                newState.players.length
            );
            newState.pendingDraw = 0;
        }

        // Clear UNO status when turn changes (someone played or drew)
        // OFFICIAL RULE: If player didn't call UNO before next player starts turn, draw 2
        if (newState.currentPlayerIndex !== currentPlayerIndex) {
            // Check if previous player had UNO button visible but didn't call it
            const previousPlayerIndex = currentPlayerIndex;
            if (needsUnoCall[previousPlayerIndex] && !unoCalled[previousPlayerIndex]) {
                // Player had 1 card and didn't call UNO before next player played - draw 2 penalty (official rule)
                newState = drawCards(2, previousPlayerIndex, newState);
            }
            
            // Clear all UNO statuses when turn changes
            setUnoCalled({});
            setNeedsUnoCall({});
        }

        // Update local state
        setDeck(newState.deck);
        setDiscardPile(newState.discardPile);
        setPlayers(newState.players);
        setCurrentPlayerIndex(newState.currentPlayerIndex);
        setPlayDirection(newState.playDirection);
        setCurrentColor(newState.currentColor);
        setPendingDraw(0);
        setSelectedCard(null);
        setShowColorPicker(false);
        setDrawnCardIndex(null); // Clear drawn card indicator when playing

        // Update ref with latest game state for timer callbacks
        gameStateRef.current = {
            deck: newState.deck,
            discardPile: newState.discardPile,
            players: newState.players,
            currentPlayerIndex: newState.currentPlayerIndex,
            playDirection: newState.playDirection,
            currentColor: newState.currentColor,
        };

        // Save to database and broadcast via Ably
        if (isConnected && roomId) {
            const gameState = {
                deck: newState.deck,
                discardPile: newState.discardPile,
                players: newState.players.map(p => ({
                    id: p.id,
                    name: p.name,
                    hand: p.hand,
                    score: p.score,
                })),
                currentPlayerIndex: newState.currentPlayerIndex,
                playDirection: newState.playDirection,
                currentColor: newState.currentColor,
                gameStarted: true,
                winner: newState.winner,
                pendingDraw: 0,
            };

            try {
                axios.post(`/api/games/state/${roomId}`, {
                    game_type: 'uno',
                    game_state: gameState,
                });
            } catch (error) {
                console.error('Failed to update game state:', error);
            }
        }
    }, [gameStarted, winner, players, currentPlayerIndex, assignedPlayerIndex, discardPile, currentColor, deck, playDirection, pendingDraw, unoCalled, isConnected, roomId, applyCardEffect, drawCards, getNextPlayerIndex]);

    // Draw card (when cannot play)
    const drawCard = useCallback(() => {
        if (!gameStarted || winner) return;

        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer || currentPlayer.id !== assignedPlayerIndex) return;

        // If there's a pending draw, must draw those cards first
        if (pendingDraw > 0) {
            let newState = {
                deck: [...deck],
                discardPile: [...discardPile],
                players: players.map(p => ({ ...p, hand: [...p.hand] })),
                currentPlayerIndex,
                playDirection,
                currentColor,
                pendingDraw,
            };

            // Draw pending cards
            newState = drawCards(pendingDraw, currentPlayerIndex, newState);

            // Skip turn after drawing
            newState.currentPlayerIndex = getNextPlayerIndex(
                currentPlayerIndex,
                playDirection,
                players.length
            );
            newState.pendingDraw = 0;

            // Update and save
            setDeck(newState.deck);
            setDiscardPile(newState.discardPile);
            setPlayers(newState.players);
            setCurrentPlayerIndex(newState.currentPlayerIndex);
            setPendingDraw(0);
            
            // Clear UNO statuses
            setUnoCalled({});
            setNeedsUnoCall({});

            if (isConnected && roomId) {
                const gameState = {
                    deck: newState.deck,
                    discardPile: newState.discardPile,
                    players: newState.players.map(p => ({
                        id: p.id,
                        name: p.name,
                        hand: p.hand,
                        score: p.score,
                    })),
                    currentPlayerIndex: newState.currentPlayerIndex,
                    playDirection: newState.playDirection,
                    currentColor: newState.currentColor,
                    gameStarted: true,
                    winner: newState.winner,
                    pendingDraw: 0,
                };

                axios.post(`/api/games/state/${roomId}`, {
                    game_type: 'uno',
                    game_state: gameState,
                }).catch(err => console.error('Failed to update:', err));
            }
            return;
        }

        // Normal draw (when cannot play)
        // Use full game state from ref if available
        let fullPlayers = players;
        if (fullGameStateRef.current && fullGameStateRef.current.players) {
            fullPlayers = fullGameStateRef.current.players.map((p, idx) => {
                if (idx === assignedPlayerIndex) {
                    return { ...p, hand: [...players[assignedPlayerIndex].hand] };
                }
                return { ...p, hand: [...p.hand] };
            });
        } else {
            fullPlayers = players.map(p => ({ ...p, hand: [...p.hand] }));
        }

        let newState = {
            deck: [...deck],
            discardPile: [...discardPile],
            players: fullPlayers,
            currentPlayerIndex,
            playDirection,
            currentColor,
            pendingDraw: 0,
        };

        // Draw 1 card
        newState = drawCards(1, currentPlayerIndex, newState);

        // Get the drawn card (last card in player's hand)
        const drawnCard = newState.players[currentPlayerIndex].hand[newState.players[currentPlayerIndex].hand.length - 1];
        const topCard = newState.discardPile[newState.discardPile.length - 1];

        // Check if drawn card is playable
        const isDrawnCardPlayable = drawnCard && isPlayable(drawnCard, topCard, currentColor);

        if (isDrawnCardPlayable) {
            // Card is playable - player can choose to play it immediately
            // Keep the turn with current player and highlight the drawn card
            const drawnCardIndex = newState.players[currentPlayerIndex].hand.length - 1;
            setDrawnCardIndex(drawnCardIndex);

            // Update local state but keep current player's turn
            setDeck(newState.deck);
            setDiscardPile(newState.discardPile);
            setPlayers(newState.players);
            // Don't change currentPlayerIndex - player can still play
            setPendingDraw(0);
        } else {
            // Card is not playable - move to next player
            newState.currentPlayerIndex = getNextPlayerIndex(
                currentPlayerIndex,
                playDirection,
                players.length
            );
            setDrawnCardIndex(null);

            // Clear UNO status when someone draws (someone played or drew)
            setUnoCalled({});
            setNeedsUnoCall({});

            // Update local state
            setDeck(newState.deck);
            setDiscardPile(newState.discardPile);
            setPlayers(newState.players);
            setCurrentPlayerIndex(newState.currentPlayerIndex);
            setPendingDraw(0);
        }

        // Save to database and broadcast via Ably
        if (isConnected && roomId) {
            const gameState = {
                deck: newState.deck,
                discardPile: newState.discardPile,
                players: newState.players.map(p => ({
                    id: p.id,
                    name: p.name,
                    hand: p.hand,
                    score: p.score,
                })),
                currentPlayerIndex: isDrawnCardPlayable ? currentPlayerIndex : newState.currentPlayerIndex,
                playDirection: newState.playDirection,
                currentColor: newState.currentColor,
                gameStarted: true,
                winner: newState.winner,
                pendingDraw: 0,
            };

            try {
                axios.post(`/api/games/state/${roomId}`, {
                    game_type: 'uno',
                    game_state: gameState,
                });
            } catch (error) {
                console.error('Failed to update game state:', error);
            }
        }
    }, [gameStarted, winner, players, currentPlayerIndex, assignedPlayerIndex, deck, discardPile, currentColor, playDirection, pendingDraw, isConnected, roomId, drawCards, getNextPlayerIndex, isPlayable]);

    // Call UNO - must be called when you have 2 cards (before playing second-to-last)
    // Call UNO - can only be called when you have exactly 1 card
    const callUno = useCallback(() => {
        // Check the player who clicked the button (assignedPlayerIndex), not the current player
        if (assignedPlayerIndex === null || assignedPlayerIndex === undefined) return;

        const myPlayer = players[assignedPlayerIndex];
        if (!myPlayer) return;

        const handSize = myPlayer.hand.filter(c => c !== null).length;

        // Player can only call UNO when they have 1 card
        if (handSize === 1) {
            // Mark player as having called UNO
            setUnoCalled(prev => ({ ...prev, [assignedPlayerIndex]: true }));
            // Clear the needsUnoCall flag since they called it
            setNeedsUnoCall(prev => {
                const updated = { ...prev };
                delete updated[assignedPlayerIndex];
                return updated;
            });
            // Show UNO animation
            setUnoAnimation({ playerIndex: assignedPlayerIndex, timestamp: Date.now() });
            // Clear animation after 2 seconds
            setTimeout(() => {
                setUnoAnimation(prev => {
                    if (prev && prev.playerIndex === assignedPlayerIndex) {
                        return null;
                    }
                    return prev;
                });
            }, 2000);
        }
    }, [players, assignedPlayerIndex]);

    // Update game state from received data
    // IMPORTANT: Only show current player's own cards, hide other players' cards
    const updateGameStateFromData = useCallback((state) => {
        if (!state) return;

        // Store full state in ref (for server communication)
        fullGameStateRef.current = JSON.parse(JSON.stringify(state));

        // Find our player index
        let myPlayerIndex = assignedPlayerIndex;
        if (state.players && state.players.length > 0) {
            const playerIndex = state.players.findIndex(p => p.name === playerName);
            if (playerIndex >= 0) {
                myPlayerIndex = playerIndex;
                setAssignedPlayerIndex(playerIndex);
            }
        }

        // Filter players: only show current player's hand, hide others
        let filteredPlayers = state.players;
        if (state.players && myPlayerIndex !== null && myPlayerIndex >= 0) {
            filteredPlayers = state.players.map((player, index) => {
                if (index === myPlayerIndex || player.name === playerName) {
                    // Show full hand for current player
                    return player;
                } else {
                    // Hide other players' cards - only preserve count
                    return {
                        id: player.id,
                        name: player.name,
                        score: player.score,
                        hand: Array(player.hand?.length || 0).fill(null), // Hide actual cards
                    };
                }
            });
        }

        // Create a filtered state hash (excluding other players' card details)
        const filteredState = {
            ...state,
            players: filteredPlayers
        };
        const stateHash = JSON.stringify(filteredState);

        if (stateHash !== lastStateHashRef.current) {
            lastStateHashRef.current = stateHash;

            if (state.deck) setDeck(state.deck);
            if (state.discardPile) setDiscardPile(state.discardPile);
            setPlayers(filteredPlayers);

            if (state.currentPlayerIndex !== undefined) {
                // Clear drawn card indicator when turn changes
                if (state.currentPlayerIndex !== currentPlayerIndex) {
                    setDrawnCardIndex(null);
                }
                setCurrentPlayerIndex(state.currentPlayerIndex);
            }
            if (state.playDirection !== undefined) setPlayDirection(state.playDirection);
            if (state.currentColor) setCurrentColor(state.currentColor);
            if (state.gameStarted !== undefined) setGameStarted(state.gameStarted);
            if (state.winner !== undefined) setWinner(state.winner);
            if (state.pendingDraw !== undefined) setPendingDraw(state.pendingDraw);
        }
    }, [playerName, assignedPlayerIndex]);

    // Fetch initial game state
    const fetchInitialGameState = useCallback(async () => {
        if (!isConnected || !roomId) return;

        try {
            const response = await axios.get(`/api/games/state/${roomId}`);
            if (response.data.exists && response.data.game_state) {
                updateGameStateFromData(response.data.game_state);
            }
        } catch (error) {
            console.error('Failed to fetch initial game state:', error);
        }
    }, [isConnected, roomId, updateGameStateFromData]);

    // Connect to room
    const connectRoom = async () => {
        if (!roomId || !playerName.trim()) return;

        setIsConnected(true);

        try {
            const existingState = await axios.get(`/api/games/state/${roomId}`);

            if (existingState.data.exists) {
                const state = existingState.data.game_state;

                // Ensure unique player name
                let joinName = playerName;
                if (state.players && Array.isArray(state.players)) {
                    if (state.players.some(p => p?.name === joinName)) {
                        let suffix = 2;
                        let candidate = `${joinName} (${suffix})`;
                        while (state.players.some(p => p?.name === candidate)) {
                            candidate = `${joinName} (${suffix++})`;
                        }
                        joinName = candidate;
                        setPlayerName(joinName);
                    }
                }

                // Check if player already exists
                const existingPlayerIndex = state.players?.findIndex(p => p.name === joinName);

                if (existingPlayerIndex >= 0) {
                    // Player reconnecting
                    setAssignedPlayerIndex(existingPlayerIndex);
                } else {
                    // New player joining
                    const newPlayerId = state.players?.length || 0;
                    const newPlayer = {
                        id: newPlayerId,
                        name: joinName,
                        hand: [],
                        score: 0,
                    };

                    state.players = [...(state.players || []), newPlayer];
                    setAssignedPlayerIndex(newPlayerId);

                    // Update server with new player
                    await axios.post(`/api/games/state/${roomId}`, {
                        game_type: 'uno',
                        game_state: state,
                    });
                }

                updateGameStateFromData(state);
            } else {
                // Initialize new game with just this player
                const initialState = {
                    deck: [],
                    discardPile: [],
                    players: [{ id: 0, name: playerName, hand: [], score: 0 }],
                    currentPlayerIndex: 0,
                    playDirection: 1,
                    currentColor: null,
                    gameStarted: false,
                    winner: null,
                    pendingDraw: 0,
                };

                await axios.post(`/api/games/state/${roomId}`, {
                    game_type: 'uno',
                    game_state: initialState,
                });

                setAssignedPlayerIndex(0);
                updateGameStateFromData(initialState);
            }

            await fetchInitialGameState();
        } catch (error) {
            console.error('Failed to connect to room:', error);
            setIsConnected(false);
        }
    };

    // Start game
    const startGame = useCallback(() => {
        if (players.length < 2) return;

        const playerNames = players.map(p => p.name);
        const newState = initializeGame(playerNames);

        // Save to database
        if (isConnected && roomId) {
            const gameState = {
                deck: newState.deck,
                discardPile: newState.discardPile,
                players: newState.players.map(p => ({
                    id: p.id,
                    name: p.name,
                    hand: p.hand,
                    score: p.score,
                })),
                currentPlayerIndex: newState.currentPlayerIndex,
                playDirection: newState.playDirection,
                currentColor: newState.currentColor,
                gameStarted: true,
                winner: null,
                pendingDraw: 0,
            };

            axios.post(`/api/games/state/${roomId}`, {
                game_type: 'uno',
                game_state: gameState,
            });
        }
    }, [players, initializeGame, isConnected, roomId]);

    // Disconnect room
    const disconnectRoom = () => {
        setIsConnected(false);
        setAssignedPlayerIndex(null);
        setRoomId('');
        setPlayerName('');
        lastStateHashRef.current = null;
        setGameStarted(false);
        setPlayers([]);
        setDeck([]);
        setDiscardPile([]);
    };

    // Build invite URL
    const buildInviteUrl = () => {
        const url = new URL(window.location.href);
        if (roomId) url.searchParams.set('room', roomId);
        if (playerName) url.searchParams.set('name', playerName);
        return url.toString();
    };
    const inviteUrl = React.useMemo(() => (roomId && playerName ? buildInviteUrl() : ''), [roomId, playerName]);

    // Auto-fill player name
    useEffect(() => {
        if (!playerName) {
            const n = auth?.user?.name || new URLSearchParams(window.location.search).get('name') || 'Player';
            setPlayerName(n);
        }
    }, [auth, playerName]);

    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        const r = sp.get('room');
        const n = sp.get('name');
        if (r) setRoomId(r);
        if (n) setPlayerName(n);
        if (r && n && !isConnected) {
            setTimeout(() => connectRoom(), 100);
        }
    }, []);

    // Fetch initial state when Ably connects
    useEffect(() => {
        if (ablyConnected && isConnected && roomId) {
            fetchInitialGameState();
        }
    }, [ablyConnected, isConnected, roomId, fetchInitialGameState]);

    // Subscribe to Ably real-time updates
    useEffect(() => {
        if (!ablyConnected || !roomId) return;

        const handleGameStateUpdate = (data) => {
            if (data && data.game_state) {
                updateGameStateFromData(data.game_state);
            }
        };

        const handleGameReset = (data) => {
            if (data && data.game_state) {
                handleGameStateUpdate(data);
            }
        };

        subscribe('game-state-updated', handleGameStateUpdate);
        subscribe('game-reset', handleGameReset);

        return () => {};
    }, [ablyConnected, roomId, subscribe, updateGameStateFromData]);

    // Get current player
    const currentPlayer = players[currentPlayerIndex];
    const myPlayer = players[assignedPlayerIndex];
    const topCard = discardPile[discardPile.length - 1];
    
    // Check if player has 1 card and show UNO button
    // OFFICIAL RULE: Must call UNO when you have 1 card, penalty is applied when next player starts turn
    useEffect(() => {
        if (!gameStarted || !myPlayer || assignedPlayerIndex === null || assignedPlayerIndex === undefined) return;
        
        const handSize = myPlayer.hand.filter(c => c !== null).length;
        
        if (handSize === 1) {
            // Player has 1 card - show UNO button
            setNeedsUnoCall(prev => ({ ...prev, [assignedPlayerIndex]: true }));
        } else if (handSize !== 1) {
            // Player doesn't have 1 card - clear UNO button
            setNeedsUnoCall(prev => {
                const updated = { ...prev };
                delete updated[assignedPlayerIndex];
                return updated;
            });
        }
    }, [myPlayer?.hand?.length, gameStarted, assignedPlayerIndex]);

    // Fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            }).catch(err => {
                console.error('Error attempting to exit fullscreen:', err);
            });
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);


    // Cleanup UNO timers on unmount
    useEffect(() => {
        return () => {
            // Clear all timers on component unmount
        };
    }, []);

    const gameContent = (
        <>
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes unoPulse {
                    0% {
                        transform: scale(0.5);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.5);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0.9;
                    }
                }
                @keyframes laughBounce {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    25% {
                        transform: translateY(-30px) rotate(-10deg);
                    }
                    50% {
                        transform: translateY(-50px) rotate(10deg);
                    }
                    75% {
                        transform: translateY(-30px) rotate(-5deg);
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0;
                    }
                }
            `}</style>
            {!gameStarted ? (
                // Lobby Screen
                <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <Link href="/games" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 text-lg">
                                ← Back to Games
                            </Link>
                            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
                                <img
                                    src="/assets/images/uno-card-images/backofthecardred.png"
                                    alt="UNO"
                                    className="w-12 h-16 sm:w-16 sm:h-22 md:w-20 md:h-28 object-contain rounded-lg shadow-lg"
                                    onError={(e) => {
                                        // Fallback to red background if image fails
                                        e.target.style.display = 'none';
                                        const fallback = document.createElement('div');
                                        fallback.className = 'w-12 h-16 sm:w-16 sm:h-22 md:w-20 md:h-28 bg-red-600 rounded-lg flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl font-bold shadow-lg';
                                        fallback.innerHTML = 'UNO';
                                        e.target.parentNode.appendChild(fallback);
                                    }}
                                />
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">UNO</h1>
                            </div>
                            <p className="text-gray-600 text-sm sm:text-base md:text-lg">Match colors and numbers to win!</p>
                        </div>

                        {/* Online multiplayer room controls */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex flex-col gap-3 sm:gap-4 w-full max-w-xl">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        placeholder="Room ID (e.g. uno-abc123)"
                                        value={roomId}
                                        onChange={(e) => setRoomId(e.target.value)}
                                        className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-base sm:text-lg focus:border-blue-500 focus:outline-none"
                                        disabled={isConnected}
                                    />
                                    <button
                                        onClick={() => {
                                            if (!roomId) {
                                                const randomId = 'uno-' + Math.random().toString(36).slice(2, 8);
                                                setRoomId(randomId);
                                            }
                                        }}
                                        className="px-4 py-2 sm:py-3 rounded-lg bg-gray-100 border-2 border-gray-300 hover:bg-gray-200 font-semibold transition-colors text-sm sm:text-base touch-manipulation"
                                        disabled={isConnected}
                                    >Generate</button>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center flex-wrap">
                                    {!isConnected ? (
                                        <button
                                            onClick={connectRoom}
                                            className="px-6 py-3 rounded-lg bg-[#ffc801] hover:bg-[#ffd633] text-[#171717] disabled:bg-gray-400 font-semibold text-base sm:text-lg transition-colors touch-manipulation"
                                            disabled={!roomId || !playerName.trim()}
                                        >Join Room</button>
                                    ) : (
                                        <button
                                            onClick={disconnectRoom}
                                            className="px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 font-semibold text-base sm:text-lg transition-colors touch-manipulation"
                                        >Leave Room</button>
                                    )}
                                    {isConnected && !gameStarted && players.length >= 2 && (
                                        <button
                                            onClick={startGame}
                                            className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold text-base sm:text-lg transition-colors touch-manipulation"
                                        >Start Game</button>
                                    )}
                                    {isConnected && (
                                        <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                                            {players.length} player{players.length !== 1 ? 's' : ''} connected {ablyConnected ? '— Real-time' : '— Connecting...'}
                                        </div>
                                    )}
                                </div>
                                {isConnected && players.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="text-sm font-semibold text-gray-700 mb-2">Players in room:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {players.map((p, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                    {p.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Game Screen
                <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#202020] to-[#212529] relative overflow-hidden">
                    {/* Lionsgeek Brand Gradient Overlays */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                        <div className="absolute -left-40 -top-40 w-[560px] h-[560px] rounded-full bg-[#ffc801]/10 blur-3xl"></div>
                        <div className="absolute left-1/3 top-1/4 w-[560px] h-[560px] rounded-full bg-[#ffc801]/8 blur-3xl"></div>
                        <div className="absolute right-[-10%] bottom-[-10%] w-[680px] h-[680px] rounded-full bg-[#ffc801]/12 blur-3xl"></div>
                    </div>

                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,200,1,0.3) 1px, transparent 0)',
                        backgroundSize: '50px 50px'
                    }}></div>

                    {/* Lionsgeek Logo Watermark - Centered */}
                    <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
                        <div className="opacity-[0.08]">
                            <img
                                src="/assets/images/lionsgeek_logo_2.png"
                                alt="Lionsgeek"
                                className="w-64 h-64 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] object-contain"
                                style={{
                                    filter: 'brightness(0) invert(1)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Lionsgeek Logo Watermark - Corners */}
                    <div className="absolute top-8 left-8 pointer-events-none z-0 opacity-[0.05] hidden md:block">
                        <img
                            src="/assets/images/logolionsgeek.png"
                            alt="Lionsgeek"
                            className="w-24 h-24 object-contain"
                            style={{
                                filter: 'brightness(0) invert(1)',
                            }}
                        />
                    </div>
                    <div className="absolute bottom-8 right-8 pointer-events-none z-0 opacity-[0.05] hidden md:block">
                        <img
                            src="/assets/images/logolionsgeek.png"
                            alt="Lionsgeek"
                            className="w-24 h-24 object-contain"
                            style={{
                                filter: 'brightness(0) invert(1)',
                            }}
                        />
                    </div>

                    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-8 relative z-10">
                        {/* Fullscreen button */}
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
                            <button
                                onClick={toggleFullscreen}
                                className="bg-[#ffc801] hover:bg-[#ffd633] text-[#171717] px-2.5 py-1.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-base transition-all duration-300 flex items-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 border border-[#ffc801]/50"
                                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                            >
                                {isFullscreen ? (
                                    <>
                                        <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span className="hidden sm:inline">Exit</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                        <span className="hidden sm:inline">Fullscreen</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Game Layout: Mobile-first responsive design */}
                        <div className="relative min-h-[calc(100vh-120px)] sm:min-h-[600px] pb-24 sm:pb-8">
                            {/* Helper function to get player positions */}
                            {(() => {
                                const opponentPlayers = players.filter((_, index) => index !== assignedPlayerIndex);
                                const topPlayer = opponentPlayers[0] || null;
                                const leftPlayer = opponentPlayers[1] || null;
                                const rightPlayer = opponentPlayers[2] || null;

                                return (
                                    <>
                                        {/* Top Player - Horizontal cards */}
                                        {topPlayer && (
                                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 hidden md:block">
                                                <div className="flex flex-col items-center mb-2 sm:mb-4">
                                                    <div className="text-white font-bold text-sm sm:text-xl mb-1 sm:mb-2">
                                                        {topPlayer.name} ({topPlayer.hand.length} cards)
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 sm:gap-2 justify-center max-w-2xl">
                                                        {Array.from({ length: topPlayer.hand.length }).map((_, i) => {
                                                            const row = Math.floor(i / 7);
                                                            const col = i % 7;
                                                            return (
                                                                <img
                                                                    key={i}
                                                                    src="/assets/images/uno-card-images/backofthecardblack.png"
                                                                    alt="Face-down card"
                                                                    className="w-10 h-14 sm:w-14 sm:h-20 md:w-16 md:h-24 object-contain rounded-lg border border-white sm:border-2 shadow-lg"
                                                                    style={{
                                                                        transform: `rotate(${(col - 3) * 5}deg) translateY(${Math.abs(col - 3) * 2}px)`,
                                                                        zIndex: 10 - Math.abs(col - 3)
                                                                    }}
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        const parent = e.target.parentNode;
                                                                        const fallback = document.createElement('div');
                                                                        fallback.className = 'w-10 h-14 sm:w-14 sm:h-20 md:w-16 md:h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white sm:border-2 shadow-lg flex items-center justify-center';
                                                                        fallback.style.cssText = e.target.style.cssText;
                                                                        fallback.innerHTML = '<div class="text-white text-xs font-bold">UNO</div>';
                                                                        parent.replaceChild(fallback, e.target);
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Mobile: Top Player - Simplified */}
                                        {topPlayer && (
                                            <div className="block md:hidden absolute top-0 left-1/2 transform -translate-x-1/2 w-full px-2">
                                                <div className="flex flex-col items-center mb-3 bg-blue-800/30 rounded-lg p-2 backdrop-blur-sm">
                                                    <div className="text-white font-semibold text-xs mb-2 px-2 py-0.5 bg-blue-900/50 rounded">
                                                        {topPlayer.name} ({topPlayer.hand.length} cards)
                                                    </div>
                                                    <div className="flex gap-1.5 justify-center items-center w-full max-w-full overflow-hidden">
                                                        {Array.from({ length: Math.min(topPlayer.hand.length, 5) }).map((_, i) => (
                                                            <img
                                                                key={i}
                                                                src="/assets/images/uno-card-images/backofthecardblack.png"
                                                                alt="Face-down card"
                                                                className="w-10 h-14 flex-shrink-0 object-contain rounded-md border border-white/80 shadow-md"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    const parent = e.target.parentNode;
                                                                    const fallback = document.createElement('div');
                                                                    fallback.className = 'w-10 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-md border border-white/80 shadow-md flex items-center justify-center flex-shrink-0';
                                                                    fallback.innerHTML = '<div class="text-white text-[7px] font-bold">UNO</div>';
                                                                    parent.replaceChild(fallback, e.target);
                                                                }}
                                                            />
                                                        ))}
                                                        {topPlayer.hand.length > 5 && (
                                                            <div className="w-10 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-md border border-white/80 flex items-center justify-center text-white text-[9px] font-semibold shadow-md flex-shrink-0">
                                                                +{topPlayer.hand.length - 5}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Left Player - Vertical stack of horizontal cards */}
                                        {leftPlayer && (
                                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 hidden lg:block">
                                                <div className="flex flex-row items-center gap-2 sm:gap-4">
                                                    <div className="flex flex-col gap-1 sm:gap-2 items-center">
                                                        {Array.from({ length: Math.min(leftPlayer.hand.length, 7) }).map((_, i) => (
                                                            <img
                                                                key={i}
                                                                src="/assets/images/uno-card-images/backofthecardblack.png"
                                                                alt="Face-down card"
                                                                className="w-12 h-18 sm:w-14 sm:h-20 lg:w-16 lg:h-24 object-contain rounded-lg border border-white sm:border-2 shadow-lg"
                                                                style={{
                                                                    transform: `rotate(${(i - 3) * 2}deg) translateX(${Math.abs(i - 3) * 1}px)`,
                                                                    zIndex: 10 - Math.abs(i - 3)
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    const parent = e.target.parentNode;
                                                                    const fallback = document.createElement('div');
                                                                    fallback.className = 'w-12 h-18 sm:w-14 sm:h-20 lg:w-16 lg:h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white sm:border-2 shadow-lg flex items-center justify-center';
                                                                    fallback.style.cssText = e.target.style.cssText;
                                                                    fallback.innerHTML = '<div class="text-white text-xs font-bold">UNO</div>';
                                                                    parent.replaceChild(fallback, e.target);
                                                                }}
                                                            />
                                                        ))}
                                                        {leftPlayer.hand.length > 7 && (
                                                            <div className="text-white text-xs mt-1 sm:mt-2">
                                                                +{leftPlayer.hand.length - 7}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-white font-bold text-sm sm:text-lg transform -rotate-90 whitespace-nowrap">
                                                        {leftPlayer.name} ({leftPlayer.hand.length})
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Right Player - Vertical stack of horizontal cards */}
                                        {rightPlayer && (
                                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden lg:block">
                                                <div className="flex flex-row items-center gap-2 sm:gap-4">
                                                    <div className="text-white font-bold text-sm sm:text-lg transform rotate-90 whitespace-nowrap">
                                                        {rightPlayer.name} ({rightPlayer.hand.length})
                                                    </div>
                                                    <div className="flex flex-col gap-1 sm:gap-2 items-center">
                                                        {Array.from({ length: Math.min(rightPlayer.hand.length, 7) }).map((_, i) => (
                                                            <img
                                                                key={i}
                                                                src="/assets/images/uno-card-images/backofthecardblack.png"
                                                                alt="Face-down card"
                                                                className="w-12 h-18 sm:w-14 sm:h-20 lg:w-16 lg:h-24 object-contain rounded-lg border border-white sm:border-2 shadow-lg"
                                                                style={{
                                                                    transform: `rotate(${(i - 3) * -2}deg) translateX(${Math.abs(i - 3) * -1}px)`,
                                                                    zIndex: 10 - Math.abs(i - 3)
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    const parent = e.target.parentNode;
                                                                    const fallback = document.createElement('div');
                                                                    fallback.className = 'w-12 h-18 sm:w-14 sm:h-20 lg:w-16 lg:h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white sm:border-2 shadow-lg flex items-center justify-center';
                                                                    fallback.style.cssText = e.target.style.cssText;
                                                                    fallback.innerHTML = '<div class="text-white text-xs font-bold">UNO</div>';
                                                                    parent.replaceChild(fallback, e.target);
                                                                }}
                                                            />
                                                        ))}
                                                        {rightPlayer.hand.length > 7 && (
                                                            <div className="text-white text-xs mt-1 sm:mt-2">
                                                                +{rightPlayer.hand.length - 7}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Center Game Area */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-3">
                                            <div className="flex justify-center items-center gap-6 sm:gap-8 md:gap-12">
                            {/* Draw Pile (Left) */}
                            <div className="flex flex-col items-center">
                                <div className="text-white font-semibold text-xs sm:text-sm mb-2">Draw</div>
                                <button
                                    onClick={drawCard}
                                    disabled={currentPlayerIndex !== assignedPlayerIndex || winner !== null}
                                    className={`relative w-14 h-20 sm:w-16 sm:h-22 md:w-20 md:h-28 rounded-lg border-2 border-white shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden touch-manipulation ${
                                        currentPlayerIndex === assignedPlayerIndex && !winner ? 'active:scale-90 hover:scale-105 cursor-pointer ring-2 ring-yellow-400/50' : ''
                                    }`}
                                    style={{
                                        transform: 'rotate(-5deg)',
                                    }}
                                >
                                    <img
                                        src="/assets/images/uno-card-images/backofthecardred.png"
                                        alt="Draw pile"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            // Fallback to gradient if image fails
                                            e.target.style.display = 'none';
                                            const fallback = document.createElement('div');
                                            fallback.className = 'absolute inset-0 bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center rounded-lg';
                                            fallback.innerHTML = '<div class="text-white text-[9px] sm:text-xs font-bold">UNO</div>';
                                            e.target.parentNode.appendChild(fallback);
                                        }}
                                    />
                                </button>
                                <div className="text-white text-[10px] sm:text-xs mt-1.5 font-medium">{deck.length}</div>
                                {pendingDraw > 0 && currentPlayerIndex === assignedPlayerIndex && (
                                    <div className="text-red-300 text-[10px] sm:text-xs mt-1 font-bold bg-red-900/30 px-2 py-0.5 rounded">
                                        Draw {pendingDraw}!
                                    </div>
                                )}
                            </div>

                            {/* Discard Pile (Center) */}
                            <div className="flex flex-col items-center">
                                <div className="text-white font-semibold text-xs sm:text-sm mb-2">Discard</div>
                                <div className="relative">
                                    {discardPile.length > 1 && (
                                        <div className="absolute w-14 h-20 sm:w-16 sm:h-22 md:w-20 md:h-28 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700"
                                            style={{ transform: 'translate(3px, 3px) rotate(-2deg)', zIndex: 0 }}
                                        />
                                    )}
                                    {topCard && (
                                        <img
                                            src={getCardImage(topCard)}
                                            alt={`${topCard.color || 'Wild'} ${topCard.value}`}
                                            className="w-14 h-20 sm:w-16 sm:h-22 md:w-20 md:h-28 object-contain rounded-lg border-2 border-white shadow-2xl relative z-10"
                                            onError={(e) => {
                                                console.error('Failed to load card image:', getCardImage(topCard));
                                                e.target.src = `https://via.placeholder.com/80x112/333333/ffffff?text=${topCard.value || 'CARD'}`;
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Current Color Indicator */}
                                <div className="mt-3 sm:mt-4 flex flex-col items-center gap-1.5 sm:gap-2">
                                    <div className="text-white text-[10px] sm:text-xs font-semibold">Color</div>
                                    <div
                                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg shadow-xl border-2 border-white ring-2 ring-white/30"
                                        style={{
                                            backgroundColor: currentColor === 'red' ? '#dc2626' :
                                                           currentColor === 'green' ? '#16a34a' :
                                                           currentColor === 'blue' ? '#2563eb' :
                                                           currentColor === 'yellow' ? '#ca8a04' : '#000'
                                        }}
                                    />
                                </div>

                                {/* Turn indicator */}
                                <div className="mt-2 sm:mt-3 text-white text-[10px] sm:text-xs md:text-sm text-center px-2 py-1">
                                    {currentPlayer && (
                                        currentPlayer.id === assignedPlayerIndex ? (
                                            <span className="font-bold text-yellow-300">Your turn!</span>
                                        ) : (
                                            <span className="truncate max-w-[90px] sm:max-w-none block">{currentPlayer.name}'s turn</span>
                                        )
                                    )}
                                </div>

                                {/* Pending Draw Warning */}
                                {pendingDraw > 0 && currentPlayerIndex === assignedPlayerIndex && (
                                    <div className="mt-2 bg-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-[10px] sm:text-xs md:text-sm shadow-lg">
                                        Draw {pendingDraw}!
                                    </div>
                                )}
                            </div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Bottom Player (Current Player) - Visible cards */}
                        {gameStarted && myPlayer && (
                            <div className="fixed bottom-0 left-0 right-0 pt-4 pb-safe sm:relative sm:pt-0 sm:pb-0 sm:mt-4 sm:mt-8">
                                <div className="flex flex-col items-center mb-3 sm:mb-4 px-3">
                                    <div className="text-white font-bold text-sm sm:text-xl mb-2">
                                        {myPlayer.name} ({myPlayer.hand.filter(c => c !== null).length} cards)
                                    </div>
                                    {(() => {
                                        const handSize = myPlayer.hand.filter(c => c !== null).length;
                                        const isMyTurn = currentPlayerIndex === assignedPlayerIndex;


                                        return null;
                                    })()}
                                </div>

                                {/* Player's Hand */}
                                <div className="flex gap-2 sm:gap-2 justify-start sm:justify-center items-end overflow-x-auto pb-4 sm:pb-8 px-3 sm:px-2 scrollbar-hide" style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    WebkitOverflowScrolling: 'touch'
                                }}>
                                    {myPlayer.hand
                                        .map((card, originalIndex) => ({ card, originalIndex }))
                                        .filter(({ card }) => card !== null)
                                        .map(({ card, originalIndex }, displayIndex) => {
                                            const topCard = discardPile[discardPile.length - 1];
                                            const playable = isPlayable(card, topCard, currentColor);
                                            const isMyTurn = currentPlayerIndex === assignedPlayerIndex;
                                            const isDrawnCard = drawnCardIndex === originalIndex;

                                            return (
                                                <button
                                                    key={originalIndex}
                                                    onClick={() => {
                                                        if (isMyTurn && playable && !winner) {
                                                            playCard(originalIndex);
                                                        }
                                                    }}
                                                    disabled={!isMyTurn || !playable || winner !== null || pendingDraw > 0}
                                                    className={`relative transition-all touch-manipulation flex-shrink-0 ${
                                                        isMyTurn && playable && !pendingDraw
                                                            ? 'active:scale-90 active:-translate-y-2 sm:hover:scale-110 sm:hover:-translate-y-4 cursor-pointer ring-2 ring-yellow-400/60 rounded-lg'
                                                            : 'opacity-60 cursor-not-allowed'
                                                    } ${isDrawnCard ? 'ring-4 ring-green-400/80 animate-pulse' : ''}`}
                                                    style={{
                                                        transform: `rotate(${(displayIndex - myPlayer.hand.filter(c => c !== null).length / 2) * 0.5}deg)`,
                                                        zIndex: isMyTurn && playable ? 20 : 10
                                                    }}
                                                >
                                                    <img
                                                        src={getCardImage(card)}
                                                        alt={`${card.color || 'Wild'} ${card.value}`}
                                                        className="w-16 h-22 sm:w-18 sm:h-26 md:w-20 md:h-28 object-contain rounded-lg border-2 border-white shadow-2xl"
                                                        onError={(e) => {
                                                            console.error('Failed to load card image:', getCardImage(card));
                                                            e.target.src = `https://via.placeholder.com/80x112/333333/ffffff?text=${card.value || 'CARD'}`;
                                                        }}
                                                    />
                                                    {isMyTurn && playable && !pendingDraw && (
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-xl ring-2 ring-white">
                                                            ✓
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>
                        )}

                        {/* UNO Button - Show when player has 1 card and hasn't called UNO yet */}
                        {gameStarted && myPlayer &&
                         myPlayer.hand.filter(c => c !== null).length === 1 &&
                         !unoCalled[assignedPlayerIndex] && (
                            <button
                                onClick={callUno}
                                className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-base sm:text-xl md:text-2xl px-6 py-4 sm:px-8 sm:py-6 rounded-full shadow-2xl transition-all transform active:scale-90 sm:hover:scale-110 animate-pulse touch-manipulation ring-4 ring-red-400/50"
                                style={{
                                    boxShadow: '0 10px 30px rgba(220, 38, 38, 0.6), 0 0 20px rgba(220, 38, 38, 0.4)'
                                }}
                            >
                                Call UNO!
                            </button>
                        )}

                        {gameStarted && (
                            <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-40 pointer-events-none">
                                <div className="bg-black/40 backdrop-blur-sm text-white/70 text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-white/10">
                                    Made by <span className="font-semibold text-[#ffc801]">AB</span>
                                </div>
                            </div>
                        )}

                        {/* UNO Animation - Shows when player successfully calls UNO */}
                        {unoAnimation && unoAnimation.playerIndex === assignedPlayerIndex && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
                                <div className="bg-red-600 text-white font-bold text-3xl sm:text-5xl md:text-6xl px-8 py-6 sm:px-12 sm:py-8 md:px-16 md:py-12 rounded-xl sm:rounded-2xl shadow-2xl" style={{
                                    animation: 'unoPulse 2s ease-out forwards'
                                }}>
                                    UNO!
                                </div>
                            </div>
                        )}
                        
                        {/* Laugh Animation - Shows when player gets +2 or +4 */}
                        {laughAnimation && laughAnimation.playerIndex === assignedPlayerIndex && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                                <div className="relative">
                                    <div className="text-6xl sm:text-8xl md:text-9xl" style={{
                                        animation: `laughBounce 3s ease-out forwards`
                                    }}>
                                        😂
                                    </div>
                                    <div className="absolute -top-4 -left-4 text-4xl sm:text-6xl md:text-7xl" style={{
                                        animation: `laughBounce 3s ease-out 0.2s forwards`
                                    }}>
                                        🤣
                                    </div>
                                    <div className="absolute -top-4 -right-4 text-4xl sm:text-6xl md:text-7xl" style={{
                                        animation: `laughBounce 3s ease-out 0.4s forwards`
                                    }}>
                                        😆
                                    </div>
                                    <div className="absolute top-4 -left-8 text-3xl sm:text-5xl md:text-6xl" style={{
                                        animation: `laughBounce 3s ease-out 0.1s forwards`
                                    }}>
                                        😄
                                    </div>
                                    <div className="absolute top-4 -right-8 text-3xl sm:text-5xl md:text-6xl" style={{
                                        animation: `laughBounce 3s ease-out 0.3s forwards`
                                    }}>
                                        😅
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Winner Announcement */}
                        {winner !== null && players[winner] && (
                            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
                                <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl">
                                    <h2 className="text-2xl sm:text-4xl font-bold mb-4">🎉 Winner!</h2>
                                    <p className="text-xl sm:text-2xl mb-6 font-semibold">{players[winner].name} wins!</p>
                                    <button
                                        onClick={() => {
                                            setWinner(null);
                                            setGameStarted(false);
                                        }}
                                        className="px-6 py-3 sm:px-8 sm:py-3 bg-[#ffc801] hover:bg-[#ffd633] text-[#171717] rounded-lg font-semibold text-base sm:text-lg touch-manipulation w-full sm:w-auto"
                                    >
                                        New Game
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                )}

                {/* Color Picker Modal */}
                {showColorPicker && selectedCard && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
                            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Choose a Color</h3>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                {COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => {
                                            playCard(selectedCard.index, color);
                                        }}
                                        className={`px-4 py-4 sm:px-6 sm:py-6 rounded-lg font-bold text-white capitalize text-base sm:text-lg shadow-lg active:scale-95 sm:hover:scale-105 transition-transform touch-manipulation ${
                                            color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                                            color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                            color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                            'bg-yellow-600 hover:bg-yellow-700'
                                        }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    setShowColorPicker(false);
                                    setSelectedCard(null);
                                }}
                                className="mt-4 sm:mt-6 w-full px-4 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 font-semibold touch-manipulation"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
        </>
    );

    // In fullscreen mode, render without AppLayout wrapper
    if (isFullscreen && gameStarted) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-[#171717] via-[#202020] to-[#212529] overflow-hidden">
                {/* Lionsgeek Brand Gradient Overlays */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute -left-40 -top-40 w-[560px] h-[560px] rounded-full bg-[#ffc801]/10 blur-3xl"></div>
                    <div className="absolute left-1/3 top-1/4 w-[560px] h-[560px] rounded-full bg-[#ffc801]/8 blur-3xl"></div>
                    <div className="absolute right-[-10%] bottom-[-10%] w-[680px] h-[680px] rounded-full bg-[#ffc801]/12 blur-3xl"></div>
                </div>

                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,200,1,0.3) 1px, transparent 0)',
                    backgroundSize: '50px 50px'
                }}></div>

                {/* Lionsgeek Logo Watermark - Centered */}
                <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
                    <div className="opacity-[0.08]">
                        <img
                            src="/assets/images/lionsgeek_logo_2.png"
                            alt="Lionsgeek"
                            className="w-64 h-64 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] object-contain"
                            style={{
                                filter: 'brightness(0) invert(1)',
                            }}
                        />
                    </div>
                </div>

                {/* Lionsgeek Logo Watermark - Corners */}
                <div className="absolute top-8 left-8 pointer-events-none z-0 opacity-[0.05] hidden md:block">
                    <img
                        src="/assets/images/logolionsgeek.png"
                        alt="Lionsgeek"
                        className="w-24 h-24 object-contain"
                        style={{
                            filter: 'brightness(0) invert(1)',
                        }}
                    />
                </div>
                <div className="absolute bottom-8 right-8 pointer-events-none z-0 opacity-[0.05] hidden md:block">
                    <img
                        src="/assets/images/logolionsgeek.png"
                        alt="Lionsgeek"
                        className="w-24 h-24 object-contain"
                        style={{
                            filter: 'brightness(0) invert(1)',
                        }}
                    />
                </div>

                <div className="w-full h-[calc(100vh)] px-2 sm:px-4 py-4 sm:py-8 relative z-10">
                    {/* Fullscreen button */}
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
                        <button
                            onClick={toggleFullscreen}
                            className="bg-[#ffc801] hover:bg-[#ffd633] text-[#171717] px-3 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-base transition-all duration-300 flex items-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 border border-[#ffc801]/50"
                            title="Exit Fullscreen"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="hidden sm:inline">Exit Fullscreen</span>
                        </button>
                    </div>

                    {/* Game Layout: Top, Left, Center, Right, Bottom */}
                    <div className="relative w-full h-full">
                        {(() => {
                            const opponentPlayers = players.filter((_, index) => index !== assignedPlayerIndex);
                            const topPlayer = opponentPlayers[0] || null;
                            const leftPlayer = opponentPlayers[1] || null;
                            const rightPlayer = opponentPlayers[2] || null;

                            return (
                                <>
                                    {/* Top Player - Horizontal cards (Desktop) */}
                                    {topPlayer && (
                                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 hidden md:block">
                                            <div className="flex flex-col items-center mb-4">
                                                <div className="text-white font-bold text-xl mb-2">
                                                    {topPlayer.name} ({topPlayer.hand.length} cards)
                                                </div>
                                                <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                                                    {Array.from({ length: topPlayer.hand.length }).map((_, i) => {
                                                        const row = Math.floor(i / 7);
                                                        const col = i % 7;
                                                        return (
                                                            <img
                                                                key={i}
                                                                src="/assets/images/uno-card-images/backofthecardblack.png"
                                                                alt="Face-down card"
                                                                className="w-16 h-24 object-contain rounded-lg border-2 border-white shadow-lg"
                                                                style={{
                                                                    transform: `rotate(${(col - 3) * 5}deg) translateY(${Math.abs(col - 3) * 2}px)`,
                                                                    zIndex: 10 - Math.abs(col - 3)
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    const parent = e.target.parentNode;
                                                                    const fallback = document.createElement('div');
                                                                    fallback.className = 'w-16 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700 shadow-lg flex items-center justify-center';
                                                                    fallback.style.cssText = e.target.style.cssText;
                                                                    fallback.innerHTML = '<div class="text-white text-xs font-bold">UNO</div>';
                                                                    parent.replaceChild(fallback, e.target);
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mobile: Top Player - 5 cards + indicator */}
                                    {topPlayer && (
                                        <div className="block md:hidden absolute top-0 left-1/2 transform -translate-x-1/2 w-full px-2">
                                            <div className="flex flex-col items-center mb-3">
                                                <div className="text-white font-semibold text-xs mb-2">
                                                    {topPlayer.name} ({topPlayer.hand.length} cards)
                                                </div>
                                                <div className="flex gap-1.5 justify-center items-center w-full max-w-full overflow-hidden">
                                                    {Array.from({ length: Math.min(topPlayer.hand.length, 5) }).map((_, i) => (
                                                        <img
                                                            key={i}
                                                            src="/assets/images/uno-card-images/backofthecardblack.png"
                                                            alt="Face-down card"
                                                            className="w-10 h-14 flex-shrink-0 object-contain rounded-md border border-white/80 shadow-md"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                const parent = e.target.parentNode;
                                                                const fallback = document.createElement('div');
                                                                fallback.className = 'w-10 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-md border border-white/80 shadow-md flex items-center justify-center flex-shrink-0';
                                                                fallback.innerHTML = '<div class="text-white text-[7px] font-bold">UNO</div>';
                                                                parent.replaceChild(fallback, e.target);
                                                            }}
                                                        />
                                                    ))}
                                                    {topPlayer.hand.length > 5 && (
                                                        <div className="w-10 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-md border border-white/80 flex items-center justify-center text-white text-[9px] font-semibold shadow-md flex-shrink-0">
                                                            +{topPlayer.hand.length - 5}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Left Player - Vertical stack of horizontal cards */}
                                    {leftPlayer && (
                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                                            <div className="flex flex-row items-center gap-4">
                                                <div className="flex flex-col gap-2 items-center">
                                                    {Array.from({ length: Math.min(leftPlayer.hand.length, 7) }).map((_, i) => (
                                                        <img
                                                            key={i}
                                                            src="/assets/images/uno-card-images/backofthecardblack.png"
                                                            alt="Face-down card"
                                                            className="w-16 h-24 object-contain rounded-lg border-2 border-white shadow-lg"
                                                            style={{
                                                                transform: `rotate(${(i - 3) * 2}deg) translateX(${Math.abs(i - 3) * 1}px)`,
                                                                zIndex: 10 - Math.abs(i - 3)
                                                            }}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                const parent = e.target.parentNode;
                                                                const fallback = document.createElement('div');
                                                                fallback.className = 'w-16 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700 shadow-lg flex items-center justify-center';
                                                                fallback.style.cssText = e.target.style.cssText;
                                                                fallback.innerHTML = '<div class="text-white text-xs font-bold">UNO</div>';
                                                                parent.replaceChild(fallback, e.target);
                                                            }}
                                                        />
                                                    ))}
                                                    {leftPlayer.hand.length > 7 && (
                                                        <div className="text-white text-xs mt-2">
                                                            +{leftPlayer.hand.length - 7} more
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-white font-bold text-lg transform -rotate-90 whitespace-nowrap">
                                                    {leftPlayer.name} ({leftPlayer.hand.length} cards)
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Right Player - Vertical stack of horizontal cards */}
                                    {rightPlayer && (
                                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                                            <div className="flex flex-row items-center gap-4">
                                                <div className="text-white font-bold text-lg transform rotate-90 whitespace-nowrap">
                                                    {rightPlayer.name} ({rightPlayer.hand.length} cards)
                                                </div>
                                                <div className="flex flex-col gap-2 items-center">
                                                    {Array.from({ length: Math.min(rightPlayer.hand.length, 7) }).map((_, i) => (
                                                        <img
                                                            key={i}
                                                            src="/assets/images/uno-card-images/backofthecardblack.png"
                                                            alt="Face-down card"
                                                            className="w-16 h-24 object-contain rounded-lg border-2 border-white shadow-lg"
                                                            style={{
                                                                transform: `rotate(${(i - 3) * -2}deg) translateX(${Math.abs(i - 3) * -1}px)`,
                                                                zIndex: 10 - Math.abs(i - 3)
                                                            }}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                const parent = e.target.parentNode;
                                                                const fallback = document.createElement('div');
                                                                fallback.className = 'w-16 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700 shadow-lg flex items-center justify-center';
                                                                fallback.style.cssText = e.target.style.cssText;
                                                                fallback.innerHTML = '<div class="text-white text-xs font-bold">UNO</div>';
                                                                parent.replaceChild(fallback, e.target);
                                                            }}
                                                        />
                                                    ))}
                                                    {rightPlayer.hand.length > 7 && (
                                                        <div className="text-white text-xs mt-2">
                                                            +{rightPlayer.hand.length - 7} more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Center Game Area */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-2">
                                        <div className="flex justify-center items-center gap-4 sm:gap-8 md:gap-12">
                                            {/* Draw Pile (Left) */}
                                            <div className="flex flex-col items-center">
                                                <div className="text-white font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Draw</div>
                                                <button
                                                    onClick={drawCard}
                                                    disabled={currentPlayerIndex !== assignedPlayerIndex || winner !== null}
                                                    className={`relative w-12 h-16 sm:w-16 sm:h-22 md:w-20 md:h-28 rounded-lg border border-white sm:border-2 shadow-xl transition-transform disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden touch-manipulation ${
                                                        currentPlayerIndex === assignedPlayerIndex && !winner ? 'active:scale-95 cursor-pointer' : ''
                                                    }`}
                                                    style={{
                                                        transform: 'rotate(-5deg)',
                                                    }}
                                                >
                                                    <img
                                                        src="/assets/images/uno-card-images/backofthecardred.png"
                                                        alt="Draw pile"
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            const fallback = document.createElement('div');
                                                            fallback.className = 'absolute inset-0 bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center';
                                                            fallback.innerHTML = '<div class="text-white text-[8px] sm:text-xs font-bold">UNO</div>';
                                                            e.target.parentNode.appendChild(fallback);
                                                        }}
                                                    />
                                                </button>
                                                <div className="text-white text-[10px] sm:text-xs mt-1 sm:mt-2">{deck.length}</div>
                                                {pendingDraw > 0 && currentPlayerIndex === assignedPlayerIndex && (
                                                    <div className="text-red-300 text-[10px] sm:text-xs mt-1 font-semibold">
                                                        Draw {pendingDraw}!
                                                    </div>
                                                )}
                                            </div>

                                            {/* Discard Pile (Center) */}
                                            <div className="flex flex-col items-center">
                                                <div className="text-white font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Discard</div>
                                                <div className="relative">
                                                    {discardPile.length > 1 && (
                                                        <div className="absolute w-12 h-16 sm:w-16 sm:h-22 md:w-20 md:h-28 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white sm:border-2"
                                                            style={{ transform: 'translate(2px, 2px) rotate(-2deg)', zIndex: 0 }}
                                                        />
                                                    )}
                                                    {topCard && (
                                                        <img
                                                            src={getCardImage(topCard)}
                                                            alt={`${topCard.color || 'Wild'} ${topCard.value}`}
                                                            className="w-12 h-16 sm:w-16 sm:h-22 md:w-20 md:h-28 object-contain rounded-lg border border-white sm:border-2 shadow-xl relative z-10"
                                                            onError={(e) => {
                                                                console.error('Failed to load card image:', getCardImage(topCard));
                                                                e.target.src = `https://via.placeholder.com/80x112/333333/ffffff?text=${topCard.value || 'CARD'}`;
                                                            }}
                                                        />
                                                    )}
                                                </div>

                                                {/* Current Color Indicator */}
                                                <div className="mt-2 sm:mt-4 flex flex-col items-center gap-1 sm:gap-2">
                                                    <div className="text-white text-[10px] sm:text-xs font-semibold">Color</div>
                                                    <div
                                                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg shadow-lg border border-white sm:border-2"
                                                        style={{
                                                            backgroundColor: currentColor === 'red' ? '#dc2626' :
                                                                           currentColor === 'green' ? '#16a34a' :
                                                                           currentColor === 'blue' ? '#2563eb' :
                                                                           currentColor === 'yellow' ? '#ca8a04' : '#000'
                                                        }}
                                                    />
                                                </div>

                                                {/* Turn indicator */}
                                                <div className="mt-1 sm:mt-2 text-white text-[10px] sm:text-xs md:text-sm text-center px-1">
                                                    {currentPlayer && (
                                                        currentPlayer.id === assignedPlayerIndex ? (
                                                            <span className="font-bold text-yellow-300">Your turn!</span>
                                                        ) : (
                                                            <span className="truncate max-w-[80px] sm:max-w-none">{currentPlayer.name}'s turn</span>
                                                        )
                                                    )}
                                                </div>

                                                {/* Pending Draw Warning */}
                                                {pendingDraw > 0 && currentPlayerIndex === assignedPlayerIndex && (
                                                    <div className="mt-1 sm:mt-2 bg-red-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-bold text-[10px] sm:text-xs md:text-sm">
                                                        Draw {pendingDraw}!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Player (Current Player) - Visible cards */}
                                    {gameStarted && myPlayer && (
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full px-2">
                                            <div className="flex flex-col items-center mb-2 sm:mb-4">
                                                <div className="text-white font-bold text-sm sm:text-xl mb-1 sm:mb-2">
                                                    {myPlayer.name} ({myPlayer.hand.filter(c => c !== null).length} cards)
                                                </div>
                                                {(() => {
                                                    const handSize = myPlayer.hand.filter(c => c !== null).length;
                                                    const isMyTurn = currentPlayerIndex === assignedPlayerIndex;

                                                    // Show warning if player needs to call UNO

                                                    return null;
                                                })()}
                                            </div>

                                            {/* Player's Hand */}
                                            <div className="flex flex-wrap gap-1 sm:gap-2 justify-center items-end overflow-x-auto pb-4 sm:pb-8">
                                                {myPlayer.hand
                                                    .map((card, originalIndex) => ({ card, originalIndex }))
                                                    .filter(({ card }) => card !== null)
                                                    .map(({ card, originalIndex }, displayIndex) => {
                                                        const topCard = discardPile[discardPile.length - 1];
                                                        const playable = isPlayable(card, topCard, currentColor);
                                                        const isMyTurn = currentPlayerIndex === assignedPlayerIndex;
                                                        const isDrawnCard = drawnCardIndex === originalIndex;

                                                        return (
                                                            <button
                                                                key={originalIndex}
                                                                onClick={() => {
                                                                    if (isMyTurn && playable && !winner) {
                                                                        playCard(originalIndex);
                                                                    }
                                                                }}
                                                                disabled={!isMyTurn || !playable || winner !== null || pendingDraw > 0}
                                                                className={`relative transition-all touch-manipulation ${
                                                                    isMyTurn && playable && !pendingDraw
                                                                        ? 'active:scale-95 sm:hover:scale-110 sm:hover:-translate-y-4 cursor-pointer'
                                                                        : 'opacity-50 cursor-not-allowed'
                                                                }`}
                                                                style={{
                                                                    transform: `rotate(${(displayIndex - myPlayer.hand.filter(c => c !== null).length / 2) * 1}deg)`,
                                                                    zIndex: isMyTurn && playable ? 20 : 10
                                                                }}
                                                            >
                                                                <img
                                                                    src={getCardImage(card)}
                                                                    alt={`${card.color || 'Wild'} ${card.value}`}
                                                                    className="w-14 h-20 sm:w-16 sm:h-22 md:w-20 md:h-28 object-contain rounded-lg border border-white sm:border-2 shadow-xl"
                                                                    onError={(e) => {
                                                                        console.error('Failed to load card image:', getCardImage(card));
                                                                        e.target.src = `https://via.placeholder.com/80x112/333333/ffffff?text=${card.value || 'CARD'}`;
                                                                    }}
                                                                />
                                                                {isMyTurn && playable && !pendingDraw && (
                                                                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs shadow-lg">
                                                                        ✓
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Winner Announcement */}
                                    {winner !== null && players[winner] && (
                                        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
                                            <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl">
                                                <h2 className="text-2xl sm:text-4xl font-bold mb-4">🎉 Winner!</h2>
                                                <p className="text-xl sm:text-2xl mb-6 font-semibold">{players[winner].name} wins!</p>
                                                <button
                                                    onClick={() => {
                                                        setWinner(null);
                                                        setGameStarted(false);
                                                    }}
                                                    className="px-6 py-3 sm:px-8 sm:py-3 bg-[#ffc801] hover:bg-[#ffd633] text-[#171717] rounded-lg font-semibold text-base sm:text-lg touch-manipulation w-full sm:w-auto"
                                                >
                                                    New Game
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {/* UNO Button - Show when player has 1 card and hasn't called UNO yet (fullscreen) */}
                    {gameStarted && myPlayer &&
                     myPlayer.hand.filter(c => c !== null).length === 1 &&
                     !unoCalled[assignedPlayerIndex] && (
                        <button
                            onClick={callUno}
                            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-red-600 hover:bg-red-700 text-white font-bold text-lg sm:text-2xl px-6 py-4 sm:px-8 sm:py-6 rounded-full shadow-2xl transition-all transform active:scale-95 sm:hover:scale-110 animate-pulse touch-manipulation"
                            style={{
                                boxShadow: '0 10px 25px rgba(220, 38, 38, 0.5)'
                            }}
                        >
                            Call UNO!
                        </button>
                    )}

                    {/* Made by Ayman Boujjar - Bottom Right (fullscreen) */}
                    {gameStarted && (
                        <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-40 pointer-events-none">
                            <div className="bg-black/40 backdrop-blur-sm text-white/70 text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-white/10">
                                Made by <span className="font-semibold text-[#ffc801]"> AB</span>
                            </div>
                        </div>
                    )}

                    {/* UNO Animation - Shows when player successfully calls UNO (fullscreen) */}
                    {unoAnimation && unoAnimation.playerIndex === assignedPlayerIndex && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
                            <div className="bg-red-600 text-white font-bold text-3xl sm:text-5xl md:text-6xl px-8 py-6 sm:px-12 sm:py-8 md:px-16 md:py-12 rounded-xl sm:rounded-2xl shadow-2xl" style={{
                                animation: 'unoPulse 2s ease-out forwards'
                            }}>
                                UNO!
                            </div>
                        </div>
                    )}
                    
                    {/* Laugh Animation - Shows when player gets +2 or +4 (fullscreen) */}
                    {laughAnimation && laughAnimation.playerIndex === assignedPlayerIndex && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                            <div className="relative">
                                <div className="text-6xl sm:text-8xl md:text-9xl" style={{
                                    animation: `laughBounce 3s ease-out forwards`
                                }}>
                                    😂
                                </div>
                                <div className="absolute -top-4 -left-4 text-4xl sm:text-6xl md:text-7xl" style={{
                                    animation: `laughBounce 3s ease-out 0.2s forwards`
                                }}>
                                    🤣
                                </div>
                                <div className="absolute -top-4 -right-4 text-4xl sm:text-6xl md:text-7xl" style={{
                                    animation: `laughBounce 3s ease-out 0.4s forwards`
                                }}>
                                    😆
                                </div>
                                <div className="absolute top-4 -left-8 text-3xl sm:text-5xl md:text-6xl" style={{
                                    animation: `laughBounce 3s ease-out 0.1s forwards`
                                }}>
                                    😄
                                </div>
                                <div className="absolute top-4 -right-8 text-3xl sm:text-5xl md:text-6xl" style={{
                                    animation: `laughBounce 3s ease-out 0.3s forwards`
                                }}>
                                    😅
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Color Picker Modal */}
                    {showColorPicker && selectedCard && (
                        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
                            <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
                                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Choose a Color</h3>
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    {COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => {
                                                playCard(selectedCard.index, color);
                                            }}
                                            className={`px-4 py-4 sm:px-6 sm:py-6 rounded-lg font-bold text-white capitalize text-base sm:text-lg shadow-lg active:scale-95 sm:hover:scale-105 transition-transform touch-manipulation ${
                                                color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                                                color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                                color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                                'bg-yellow-600 hover:bg-yellow-700'
                                            }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        setShowColorPicker(false);
                                        setSelectedCard(null);
                                    }}
                                    className="mt-4 sm:mt-6 w-full px-4 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 font-semibold touch-manipulation"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Normal mode with AppLayout
    return <AppLayout>{gameContent}</AppLayout>;
}

