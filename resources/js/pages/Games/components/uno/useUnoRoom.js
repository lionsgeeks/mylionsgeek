import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for Uno room management (connect, disconnect, start game)
 */
export function useUnoRoom(auth, updateGameStateFromData) {
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [assignedPlayerIndex, setAssignedPlayerIndex] = useState(null);

    // Auto-fill player name
    useEffect(() => {
        if (!playerName) {
            const n = auth?.user?.name || new URLSearchParams(window.location.search).get('name') || 'Player';
            setPlayerName(n);
        }
    }, [auth, playerName]);

    // Auto-connect from URL params
    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        const r = sp.get('room');
        const n = sp.get('name');
        if (r) setRoomId(r);
        if (n) setPlayerName(n);
        if (r && n && !isConnected) {
            setTimeout(() => connectRoom(), 100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Fetch initial game state
    const fetchInitialGameState = useCallback(async (roomId) => {
        if (!isConnected || !roomId) return;

        try {
            console.log('🔄 Fetching game state from server...');
            const response = await axios.get(`/api/games/state/${roomId}`);
            if (response.data.exists && response.data.game_state) {
                console.log('✅ Game state fetched, updating...');
                updateGameStateFromData(response.data.game_state);
            } else {
                console.log('ℹ️ No existing game state found');
            }
        } catch (error) {
            console.error('❌ Failed to fetch game state:', error);
        }
    }, [isConnected, updateGameStateFromData]);

    // Connect to room
    const connectRoom = useCallback(async () => {
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
                    setAssignedPlayerIndex(existingPlayerIndex);
                } else {
                    // Check player limit
                    if (state.players && state.players.length >= 4) {
                        alert('Maximum 4 players allowed in a room');
                        setIsConnected(false);
                        return;
                    }
                    
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
                // Initialize new game
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

            await fetchInitialGameState(roomId);
        } catch (error) {
            console.error('Failed to connect to room:', error);
            setIsConnected(false);
        }
    }, [roomId, playerName, updateGameStateFromData, fetchInitialGameState]);

    // Disconnect room
    const disconnectRoom = useCallback(() => {
        setIsConnected(false);
        setAssignedPlayerIndex(null);
        setRoomId('');
        setPlayerName('');
    }, []);

    return {
        roomId,
        setRoomId,
        playerName,
        setPlayerName,
        isConnected,
        assignedPlayerIndex,
        connectRoom,
        disconnectRoom,
    };
}



