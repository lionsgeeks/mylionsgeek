import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import useAblyChannelGames from '@/hooks/useAblyChannelGames';
import { COLORS } from './constants';
import {
    initializeDeck,
    shuffleDeck,
    dealCards,
    getNextPlayerIndex,
} from './utils';

/**
 * Custom hook for Uno game state management
 * Separates all game logic from UI components
 */
export function useUnoGame(auth, roomId, playerName) {
    // Game state
    const [deck, setDeck] = useState([]);
    const [discardPile, setDiscardPile] = useState([]);
    const [players, setPlayers] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [playDirection, setPlayDirection] = useState(1);
    const [currentColor, setCurrentColor] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [winner, setWinner] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [unoCalled, setUnoCalled] = useState({});
    const [pendingDraw, setPendingDraw] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [drawnCardIndex, setDrawnCardIndex] = useState(null);
    const [needsUnoCall, setNeedsUnoCall] = useState({});
    const [unoAnimation, setUnoAnimation] = useState(null);
    const [laughAnimation, setLaughAnimation] = useState(null);

        // Note: Connection state is managed externally
    const [assignedPlayerIndex, setAssignedPlayerIndex] = useState(null);
    const fullGameStateRef = useRef(null);
    const gameStateRef = useRef({ deck: [], discardPile: [], players: [], currentPlayerIndex: 0, playDirection: 1, currentColor: null });

    // Ably channel for real-time game updates
    const gameChannelName = roomId ? `game:${roomId}` : 'game:placeholder';
    const { isConnected: ablyConnected, subscribe } = useAblyChannelGames(
        gameChannelName,
        ['game-state-updated', 'game-reset'],
        {
            onConnected: () => {
                //console.log('✅ Ably connected for game room:', roomId);
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

        const newPlayers = playerNames.map((name, index) => ({
            id: index,
            name,
            hand: hands[index],
            score: 0,
        }));

        let topCard = remainingDeck[0];
        const newDiscardPile = [topCard];
        const newRemainingDeck = remainingDeck.slice(1);

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
        setNeedsUnoCall({});

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

    // Apply card effect
    const applyCardEffect = useCallback((card, gameState) => {
        const newState = { ...gameState };
        let shouldMoveToNext = true;

        if (card.type === 'action') {
            if (card.value === 'skip') {
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
                newState.playDirection *= -1;
                if (newState.players.length === 2) {
                    newState.currentPlayerIndex = getNextPlayerIndex(
                        newState.currentPlayerIndex,
                        newState.playDirection,
                        newState.players.length
                    );
                    shouldMoveToNext = false;
                }
            } else if (card.value === 'draw2') {
                newState.pendingDraw = (newState.pendingDraw || 0) + 2;
                newState.currentPlayerIndex = getNextPlayerIndex(
                    newState.currentPlayerIndex,
                    newState.playDirection,
                    newState.players.length
                );
                shouldMoveToNext = false;
            }
        } else if (card.type === 'wild') {
            if (card.value === 'wild_draw4') {
                newState.pendingDraw = (newState.pendingDraw || 0) + 4;
                newState.currentPlayerIndex = getNextPlayerIndex(
                    newState.currentPlayerIndex,
                    newState.playDirection,
                    newState.players.length
                );
                shouldMoveToNext = false;
            }
        }

        if (shouldMoveToNext) {
            newState.currentPlayerIndex = getNextPlayerIndex(
                newState.currentPlayerIndex,
                newState.playDirection,
                newState.players.length
            );
        }

        return newState;
    }, []);

    // Draw cards
    const drawCards = useCallback((numCards, playerIndex, gameState) => {
        const newState = { ...gameState };
        const newDeck = [...newState.deck];
        const newPlayers = [...newState.players];

        if (newDeck.length < numCards) {
            const topCard = newState.discardPile[newState.discardPile.length - 1];
            const reshuffled = shuffleDeck(newState.discardPile.slice(0, -1));
            newDeck.push(...reshuffled);
            newState.discardPile = [topCard];
        }

        const drawnCards = newDeck.splice(0, numCards);
        newPlayers[playerIndex].hand = [...newPlayers[playerIndex].hand, ...drawnCards];

        newState.deck = newDeck;
        newState.players = newPlayers;

        return newState;
    }, []);

    // Update game state from server
    const updateGameStateFromData = useCallback((state) => {
        if (!state) {
            console.warn('⚠️ updateGameStateFromData called with null/undefined state');
            return;
        }

        console.log('🔄 Updating game state from server/Ably:', {
            currentPlayerIndex: state.currentPlayerIndex,
            gameStarted: state.gameStarted,
            playersCount: state.players?.length,
        });

        fullGameStateRef.current = JSON.parse(JSON.stringify(state));

        let myPlayerIndex = assignedPlayerIndex;
        if (state.players && state.players.length > 0) {
            const playerIndex = state.players.findIndex(p => p.name === playerName);
            if (playerIndex >= 0) {
                myPlayerIndex = playerIndex;
                if (assignedPlayerIndex !== playerIndex) {
                    setAssignedPlayerIndex(playerIndex);
                }
            }
        }

        let filteredPlayers = state.players;
        if (state.players && myPlayerIndex !== null && myPlayerIndex >= 0) {
            filteredPlayers = state.players.map((player, index) => {
                if (index === myPlayerIndex || player.name === playerName) {
                    return player;
                } else {
                    return {
                        id: player.id,
                        name: player.name,
                        score: player.score,
                        hand: Array(player.hand?.length || 0).fill(null),
                    };
                }
            });
        }

        if (state.deck !== undefined) setDeck(state.deck);
        if (state.discardPile !== undefined) setDiscardPile(state.discardPile);
        if (filteredPlayers) setPlayers(filteredPlayers);
        if (state.currentPlayerIndex !== undefined) {
            if (state.currentPlayerIndex !== currentPlayerIndex) {
                setDrawnCardIndex(null);
            }
            setCurrentPlayerIndex(state.currentPlayerIndex);
        }
        if (state.playDirection !== undefined) setPlayDirection(state.playDirection);
        if (state.currentColor !== undefined) setCurrentColor(state.currentColor);
        if (state.gameStarted !== undefined) {
            const wasGameStarted = gameStarted;
            setGameStarted(state.gameStarted);
            if (state.gameStarted && !wasGameStarted && !isFullscreen && !document.fullscreenElement) {
                setTimeout(() => {
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen().then(() => {
                            setIsFullscreen(true);
                        }).catch(err => {
                            console.error('Error attempting to enable fullscreen:', err);
                        });
                    }
                }, 200);
            }
        }
        if (state.winner !== undefined) setWinner(state.winner);
        if (state.pendingDraw !== undefined) setPendingDraw(state.pendingDraw);
        if (state.unoCalled !== undefined) setUnoCalled(state.unoCalled);
        if (state.needsUnoCall !== undefined) setNeedsUnoCall(state.needsUnoCall);
        if (state.drawnCardIndex !== undefined) setDrawnCardIndex(state.drawnCardIndex);
        
        gameStateRef.current = {
            deck: state.deck || deck,
            discardPile: state.discardPile || discardPile,
            players: filteredPlayers || players,
            currentPlayerIndex: state.currentPlayerIndex !== undefined ? state.currentPlayerIndex : currentPlayerIndex,
            playDirection: state.playDirection !== undefined ? state.playDirection : playDirection,
            currentColor: state.currentColor !== undefined ? state.currentColor : currentColor,
        };

        //console.log('✅ Game state updated from server');
    }, [playerName, assignedPlayerIndex, gameStarted, isFullscreen, currentPlayerIndex, deck, discardPile, players, playDirection, currentColor]);

    // Fetch initial game state
    const fetchInitialGameState = useCallback(async (roomId) => {
        if (!ablyConnected || !roomId) return;

        try {
            //console.log('🔄 Fetching game state from server...');
            const response = await axios.get(`/api/games/state/${roomId}`);
            if (response.data.exists && response.data.game_state) {
                //console.log('✅ Game state fetched, updating...');
                updateGameStateFromData(response.data.game_state);
            } else {
                //console.log('ℹ️ No existing game state found');
            }
        } catch (error) {
            console.error('❌ Failed to fetch game state:', error);
        }
    }, [ablyConnected, updateGameStateFromData]);

    // Periodic sync will be handled by parent component
    // This hook doesn't manage connection state

    // Subscribe to Ably real-time updates
    useEffect(() => {
        if (!ablyConnected || !roomId) {
            console.log('⏳ Waiting for Ably connection or roomId...', { ablyConnected, roomId });
            return;
        }

        //console.log('🔔 Setting up Ably subscriptions for real-time updates - Room:', roomId);

        const handleGameStateUpdate = (data) => {
            console.log('📨 REAL-TIME UPDATE RECEIVED via Ably:', {
                hasGameState: !!data?.game_state,
                currentPlayerIndex: data?.game_state?.currentPlayerIndex,
                timestamp: new Date().toISOString()
            });
            
            if (data && data.game_state) {
                updateGameStateFromData(data.game_state);
            } else {
                console.warn('⚠️ Received Ably message without game_state:', data);
            }
        };

        const handleGameReset = (data) => {
            //console.log('🔄 Game reset received via Ably');
            if (data && data.game_state) {
                handleGameStateUpdate(data);
            }
        };

        subscribe('game-state-updated', handleGameStateUpdate);
        subscribe('game-reset', handleGameReset);

        //console.log('✅ Ably subscriptions active - ready for 100% real-time updates');

        return () => {
            //console.log('🧹 Cleaning up Ably subscriptions');
        };
    }, [ablyConnected, roomId, subscribe, updateGameStateFromData]);

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

    // Auto-enter fullscreen when game starts
    useEffect(() => {
        if (gameStarted && !isFullscreen && !document.fullscreenElement) {
            const timer = setTimeout(() => {
                document.documentElement.requestFullscreen().then(() => {
                    setIsFullscreen(true);
                }).catch(err => {
                    console.error('Error attempting to enable fullscreen:', err);
                });
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [gameStarted, isFullscreen]);

    return {
        // State
        deck,
        discardPile,
        players,
        currentPlayerIndex,
        playDirection,
        currentColor,
        gameStarted,
        winner,
        selectedCard,
        showColorPicker,
        unoCalled,
        pendingDraw,
        isFullscreen,
        drawnCardIndex,
        needsUnoCall,
        unoAnimation,
        laughAnimation,
        ablyConnected,
        assignedPlayerIndex,
        
        // Setters
        setDeck,
        setDiscardPile,
        setPlayers,
        setCurrentPlayerIndex,
        setPlayDirection,
        setCurrentColor,
        setGameStarted,
        setWinner,
        setSelectedCard,
        setShowColorPicker,
        setUnoCalled,
        setPendingDraw,
        setIsFullscreen,
        setDrawnCardIndex,
        setNeedsUnoCall,
        setUnoAnimation,
        setLaughAnimation,
        setAssignedPlayerIndex,
        
        // Functions
        initializeGame,
        applyCardEffect,
        drawCards,
        updateGameStateFromData,
        fetchInitialGameState,
        toggleFullscreen,
        
        // Refs
        fullGameStateRef,
        gameStateRef,
    };
}



