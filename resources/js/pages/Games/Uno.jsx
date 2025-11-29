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
    // Wild cards are always playable
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
    
    // Online multiplayer state
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [assignedPlayerIndex, setAssignedPlayerIndex] = useState(null);
    const lastStateHashRef = useRef(null);
    const fullGameStateRef = useRef(null); // Store full game state with all hands (for server communication)
    
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
        
        // ⚠️ UNO RULE: Check if player has 2 cards and hasn't called UNO
        // They must call UNO before playing their second-to-last card
        // If they forget, they'll be penalized after playing (see below)
        const handSize = currentPlayer.hand.filter(c => c !== null).length;
        const forgotToCallUno = handSize === 2 && !unoCalled[currentPlayerIndex];
        
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
        
        // ⚠️ UNO PENALTY: If player forgot to call UNO before playing second-to-last card
        // They must draw 2 cards as penalty (before checking for win)
        if (forgotToCallUno) {
            newState = drawCards(2, currentPlayerIndex, newState);
            // Clear any UNO call status since they now have more cards
            setUnoCalled(prev => {
                const updated = { ...prev };
                delete updated[currentPlayerIndex];
                return updated;
            });
        }
        
        // 🏆 Check for win - if last card is played legally, win immediately
        // No card effects happen when you win with your last card
        if (newState.players[currentPlayerIndex].hand.length === 0) {
            newState.winner = currentPlayerIndex;
            setWinner(currentPlayerIndex);
            // Clear UNO call status for winner
            setUnoCalled(prev => {
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
        }
        
        // Clear UNO call status if player now has more than 1 card
        if (newState.players[currentPlayerIndex].hand.length > 1) {
            setUnoCalled(prev => {
                const updated = { ...prev };
                delete updated[currentPlayerIndex];
                return updated;
            });
        }
        
        // Apply card effect (this handles turn progression and pending draws)
        newState = applyCardEffect(card, newState);
        
        // Handle pending draws (after effect is applied, currentPlayerIndex is already the target)
        if (newState.pendingDraw > 0) {
            newState = drawCards(newState.pendingDraw, newState.currentPlayerIndex, newState);
            // Skip the player who just drew
            newState.currentPlayerIndex = getNextPlayerIndex(
                newState.currentPlayerIndex,
                newState.playDirection,
                newState.players.length
            );
            newState.pendingDraw = 0;
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
        
        // Check if drawn card is playable (optional rule - player can choose to play it)
        // For now, we'll just move to next player
        // In a full implementation, you could show a prompt to play the drawn card
        
        // Move to next player
        newState.currentPlayerIndex = getNextPlayerIndex(
            currentPlayerIndex,
            playDirection,
            players.length
        );
        
        // Update local state
        setDeck(newState.deck);
        setDiscardPile(newState.discardPile);
        setPlayers(newState.players);
        setCurrentPlayerIndex(newState.currentPlayerIndex);
        setPendingDraw(0);
        
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
    }, [gameStarted, winner, players, currentPlayerIndex, assignedPlayerIndex, deck, discardPile, currentColor, playDirection, pendingDraw, isConnected, roomId, drawCards, getNextPlayerIndex]);
    
    // Call UNO - must be called when you have 2 cards (before playing second-to-last)
    const callUno = useCallback(() => {
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer) return;
        
        const handSize = currentPlayer.hand.filter(c => c !== null).length;
        // Can call UNO when you have 2 cards (before playing) or 1 card (if you forgot earlier)
        if (handSize === 2 || handSize === 1) {
            setUnoCalled(prev => ({ ...prev, [currentPlayerIndex]: true }));
        }
    }, [players, currentPlayerIndex]);
    
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
            
            if (state.currentPlayerIndex !== undefined) setCurrentPlayerIndex(state.currentPlayerIndex);
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
    
    return (
        <AppLayout>
            {!gameStarted ? (
                // Lobby Screen
                <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <Link href="/games" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 text-lg">
                                ← Back to Games
                            </Link>
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <img
                                    src="/assets/images/uno-card-images/backofthecardred.png"
                                    alt="UNO"
                                    className="w-20 h-28 object-contain rounded-lg shadow-lg"
                                    onError={(e) => {
                                        // Fallback to red background if image fails
                                        e.target.style.display = 'none';
                                        const fallback = document.createElement('div');
                                        fallback.className = 'w-20 h-28 bg-red-600 rounded-lg flex items-center justify-center text-white text-4xl font-bold shadow-lg';
                                        fallback.innerHTML = 'UNO';
                                        e.target.parentNode.appendChild(fallback);
                                    }}
                                />
                                <h1 className="text-5xl font-bold text-gray-900">UNO</h1>
                            </div>
                            <p className="text-gray-600 text-lg">Match colors and numbers to win!</p>
                        </div>
                        
                        {/* Online multiplayer room controls */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-white rounded-xl p-6 shadow-lg flex flex-col gap-4 w-full max-w-xl">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Room ID (e.g. uno-abc123)"
                                        value={roomId}
                                        onChange={(e) => setRoomId(e.target.value)}
                                        className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-blue-500 focus:outline-none"
                                        disabled={isConnected}
                                    />
                                    <button
                                        onClick={() => {
                                            if (!roomId) {
                                                const randomId = 'uno-' + Math.random().toString(36).slice(2, 8);
                                                setRoomId(randomId);
                                            }
                                        }}
                                        className="px-4 py-3 rounded-lg bg-gray-100 border-2 border-gray-300 hover:bg-gray-200 font-semibold transition-colors"
                                        disabled={isConnected}
                                    >Generate</button>
                                </div>
                                <div className="flex gap-3 items-center flex-wrap">
                                    {!isConnected ? (
                                        <button 
                                            onClick={connectRoom} 
                                            className="px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400 font-semibold text-lg transition-colors"
                                            disabled={!roomId || !playerName.trim()}
                                        >Join Room</button>
                                    ) : (
                                        <button 
                                            onClick={disconnectRoom} 
                                            className="px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 font-semibold text-lg transition-colors"
                                        >Leave Room</button>
                                    )}
                                    {isConnected && !gameStarted && players.length >= 2 && (
                                        <button
                                            onClick={startGame}
                                            className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold text-lg transition-colors"
                                        >Start Game</button>
                                    )}
                                    {isConnected && (
                                        <div className="text-sm text-gray-600">
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
                <div className="min-h-screen bg-blue-900 relative overflow-hidden" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)'
                }}>
                    {/* Red border at top */}
                    <div className="h-4 bg-red-600 w-full"></div>
                    
                    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                        {/* Back button */}
                        <Link href="/games" className="inline-flex items-center text-white hover:text-blue-200 mb-4 text-lg">
                            ← Back to Games
                        </Link>
                        
                        {/* Top Player (Opponent) - Face-down cards */}
                        <div className="mb-8">
                            {players.map((player, index) => {
                                if (index === assignedPlayerIndex) return null;
                                return (
                                    <div key={player.id} className="flex flex-col items-center mb-4">
                                        <div className="text-white font-bold text-xl mb-2">
                                            {player.name} ({player.hand.length} cards)
                                        </div>
                                        <div className="flex gap-2 justify-center">
                                            {Array.from({ length: Math.min(player.hand.length, 7) }).map((_, i) => (
                                                <img
                                                    key={i}
                                                    src="/assets/images/uno-card-images/backofthecardblack.png"
                                                    alt="Face-down card"
                                                    className="w-16 h-24 object-contain rounded-lg border-2 border-white shadow-lg"
                                                    style={{
                                                        transform: `rotate(${(i - 3) * 5}deg) translateY(${Math.abs(i - 3) * 2}px)`,
                                                        zIndex: 10 - Math.abs(i - 3)
                                                    }}
                                                    onError={(e) => {
                                                        // Fallback styling if image fails to load
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
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Center Game Area */}
                        <div className="flex justify-center items-center gap-12 mb-8">
                            {/* Draw Pile (Left) */}
                            <div className="flex flex-col items-center">
                                <div className="text-white font-semibold mb-2">Draw Pile</div>
                                <button
                                    onClick={drawCard}
                                    disabled={currentPlayerIndex !== assignedPlayerIndex || winner !== null}
                                    className={`relative w-20 h-28 rounded-lg border-2 border-white shadow-xl transition-transform disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${
                                        currentPlayerIndex === assignedPlayerIndex && !winner ? 'hover:scale-105 cursor-pointer' : ''
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
                                            fallback.className = 'absolute inset-0 bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center';
                                            fallback.innerHTML = '<div class="text-white text-xs font-bold">UNO</div>';
                                            e.target.parentNode.appendChild(fallback);
                                        }}
                                    />
                                </button>
                                <div className="text-white text-xs mt-2">{deck.length} cards</div>
                                {pendingDraw > 0 && currentPlayerIndex === assignedPlayerIndex && (
                                    <div className="text-red-300 text-xs mt-1 font-semibold">
                                        Draw {pendingDraw}!
                                    </div>
                                )}
                            </div>
                            
                            {/* Discard Pile (Center) */}
                            <div className="flex flex-col items-center">
                                <div className="text-white font-semibold mb-2">Discard Pile</div>
                                <div className="relative">
                                    {discardPile.length > 1 && (
                                        <div className="absolute w-20 h-28 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700"
                                            style={{ transform: 'translate(4px, 4px) rotate(-2deg)', zIndex: 0 }}
                                        />
                                    )}
                                    {topCard && (
                                        <img 
                                            src={getCardImage(topCard)} 
                                            alt={`${topCard.color || 'Wild'} ${topCard.value}`} 
                                            className="w-20 h-28 object-contain rounded-lg border-2 border-white shadow-xl relative z-10"
                                            onError={(e) => {
                                                console.error('Failed to load card image:', getCardImage(topCard));
                                                e.target.src = `https://via.placeholder.com/80x112/333333/ffffff?text=${topCard.value || 'CARD'}`;
                                            }}
                                        />
                                    )}
                                </div>
                                
                                {/* Current Color Indicator */}
                                <div className="mt-4 flex flex-col items-center gap-2">
                                    <div className="text-white text-xs font-semibold">Current Color</div>
                                    <div 
                                        className="w-12 h-12 rounded-lg shadow-lg border-2 border-white"
                                        style={{
                                            backgroundColor: currentColor === 'red' ? '#dc2626' :
                                                           currentColor === 'green' ? '#16a34a' :
                                                           currentColor === 'blue' ? '#2563eb' :
                                                           currentColor === 'yellow' ? '#ca8a04' : '#000'
                                        }}
                                    />
                                </div>
                                
                                {/* Turn indicator */}
                                <div className="mt-2 text-white text-sm">
                                    {currentPlayer && (
                                        currentPlayer.id === assignedPlayerIndex ? (
                                            <span className="font-bold text-yellow-300">Your turn!</span>
                                        ) : (
                                            <span>{currentPlayer.name}'s turn</span>
                                        )
                                    )}
                                </div>
                                
                                {/* Pending Draw Warning */}
                                {pendingDraw > 0 && currentPlayerIndex === assignedPlayerIndex && (
                                    <div className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                                        Draw {pendingDraw} card{pendingDraw > 1 ? 's' : ''}!
                                    </div>
                                )}
                            </div>
                        </div>
                    
                        {/* Bottom Player (Current Player) - Visible cards */}
                        {gameStarted && myPlayer && (
                            <div className="mt-8">
                                <div className="flex flex-col items-center mb-4">
                                    <div className="text-white font-bold text-xl mb-2">
                                        {myPlayer.name} ({myPlayer.hand.filter(c => c !== null).length} cards)
                                    </div>
                                    {(() => {
                                        const handSize = myPlayer.hand.filter(c => c !== null).length;
                                        const hasCalledUno = unoCalled[assignedPlayerIndex];
                                        const isMyTurn = currentPlayerIndex === assignedPlayerIndex;
                                        
                                        // Show CALL UNO button when you have 2 cards (before playing) or 1 card (if forgot)
                                        if ((handSize === 2 || handSize === 1) && !hasCalledUno && isMyTurn) {
                                            return (
                                                <button
                                                    onClick={callUno}
                                                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 mb-4 shadow-lg animate-pulse"
                                                >
                                                    CALL UNO! {handSize === 2 ? '(Before playing)' : '(Forgot earlier)'}
                                                </button>
                                            );
                                        }
                                        // Show UNO! indicator if called
                                        if ((handSize === 2 || handSize === 1) && hasCalledUno) {
                                            return (
                                                <div className="text-red-400 font-bold text-lg mb-2">UNO!</div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                                
                                {/* Player's Hand */}
                                <div className="flex flex-wrap gap-2 justify-center items-end pb-8">
                                    {myPlayer.hand
                                        .map((card, originalIndex) => ({ card, originalIndex }))
                                        .filter(({ card }) => card !== null)
                                        .map(({ card, originalIndex }, displayIndex) => {
                                            const topCard = discardPile[discardPile.length - 1];
                                            const playable = isPlayable(card, topCard, currentColor);
                                            const isMyTurn = currentPlayerIndex === assignedPlayerIndex;
                                            
                                            return (
                                                <button
                                                    key={originalIndex}
                                                    onClick={() => {
                                                        if (isMyTurn && playable && !winner) {
                                                            playCard(originalIndex);
                                                        }
                                                    }}
                                                    disabled={!isMyTurn || !playable || winner !== null || pendingDraw > 0}
                                                    className={`relative transition-all ${
                                                        isMyTurn && playable && !pendingDraw
                                                            ? 'hover:scale-110 hover:-translate-y-4 cursor-pointer' 
                                                            : 'opacity-50 cursor-not-allowed'
                                                    }`}
                                                    style={{
                                                        transform: `rotate(${(displayIndex - myPlayer.hand.filter(c => c !== null).length / 2) * 2}deg)`,
                                                        zIndex: isMyTurn && playable ? 20 : 10
                                                    }}
                                                >
                                                    <img 
                                                        src={getCardImage(card)} 
                                                        alt={`${card.color || 'Wild'} ${card.value}`}
                                                        className="w-20 h-28 object-contain rounded-lg border-2 border-white shadow-xl"
                                                        onError={(e) => {
                                                            console.error('Failed to load card image:', getCardImage(card));
                                                            e.target.src = `https://via.placeholder.com/80x112/333333/ffffff?text=${card.value || 'CARD'}`;
                                                        }}
                                                    />
                                                    {isMyTurn && playable && !pendingDraw && (
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg">
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
                            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-2xl">
                                    <h2 className="text-4xl font-bold mb-4">🎉 Winner!</h2>
                                    <p className="text-2xl mb-6 font-semibold">{players[winner].name} wins!</p>
                                    <button
                                        onClick={() => {
                                            setWinner(null);
                                            setGameStarted(false);
                                        }}
                                        className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 text-lg"
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
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-8 max-w-md shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6 text-center">Choose a Color</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => {
                                            playCard(selectedCard.index, color);
                                        }}
                                        className={`px-6 py-6 rounded-lg font-bold text-white capitalize text-lg shadow-lg hover:scale-105 transition-transform ${
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
                                className="mt-6 w-full px-4 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </AppLayout>
        );
    }

