import React, { useState, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import axios from 'axios';

// Import Uno game components
import {
    LobbyScreen,
    GameScreen,
    ColorPicker,
} from './components/uno';

// Import custom hooks
import { useUnoGame } from './components/uno/useUnoGame';
import { useUnoActions } from './components/uno/useUnoActions';
import { useUnoRoom } from './components/uno/useUnoRoom';

export default function Uno() {
    const page = usePage();
    const auth = page?.props?.auth;

    // Initialize room state from URL/auth
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    
    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        const r = sp.get('room');
        const n = sp.get('name') || auth?.user?.name || 'Player';
        if (r) setRoomId(r);
        if (n && !playerName) setPlayerName(n);
    }, [auth, playerName]);

    // Game state management (needs roomId and playerName)
    const gameState = useUnoGame(auth, roomId, playerName);

    // Room management (uses game state update function)
    const roomState = useUnoRoom(auth, gameState.updateGameStateFromData);

    // Sync room state
    useEffect(() => {
        if (roomState.roomId && roomState.roomId !== roomId) setRoomId(roomState.roomId);
        if (roomState.playerName && roomState.playerName !== playerName) setPlayerName(roomState.playerName);
    }, [roomState.roomId, roomState.playerName, roomId, playerName]);

    // Game actions
    const actions = useUnoActions({
        gameStarted: gameState.gameStarted,
        winner: gameState.winner,
        players: gameState.players,
        currentPlayerIndex: gameState.currentPlayerIndex,
        assignedPlayerIndex: gameState.assignedPlayerIndex,
        discardPile: gameState.discardPile,
        currentColor: gameState.currentColor,
        deck: gameState.deck,
        playDirection: gameState.playDirection,
        pendingDraw: gameState.pendingDraw,
        unoCalled: gameState.unoCalled,
        needsUnoCall: gameState.needsUnoCall,
        isConnected: roomState.isConnected,
        roomId: roomState.roomId || roomId,
        applyCardEffect: gameState.applyCardEffect,
        drawCards: gameState.drawCards,
        fullGameStateRef: gameState.fullGameStateRef,
        setDeck: gameState.setDeck,
        setDiscardPile: gameState.setDiscardPile,
        setPlayers: gameState.setPlayers,
        setCurrentPlayerIndex: gameState.setCurrentPlayerIndex,
        setPlayDirection: gameState.setPlayDirection,
        setCurrentColor: gameState.setCurrentColor,
        setPendingDraw: gameState.setPendingDraw,
        setSelectedCard: gameState.setSelectedCard,
        setShowColorPicker: gameState.setShowColorPicker,
        setDrawnCardIndex: gameState.setDrawnCardIndex,
        setUnoCalled: gameState.setUnoCalled,
        setNeedsUnoCall: gameState.setNeedsUnoCall,
        setWinner: gameState.setWinner,
        setLaughAnimation: gameState.setLaughAnimation,
        setUnoAnimation: gameState.setUnoAnimation,
    });

    // Start game
    const startGame = useCallback(() => {
        if (gameState.players.length < 2) return;

        const playerNames = gameState.players.map(p => p.name);
        const newState = gameState.initializeGame(playerNames);

        // Save to database
        const finalRoomId = roomState.roomId || roomId;
        if (roomState.isConnected && finalRoomId) {
            const gameStateData = {
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
                unoCalled: {},
            };

            axios.post(`/api/games/state/${finalRoomId}`, {
                game_type: 'uno',
                game_state: gameStateData,
            })
            .then(() => {
                console.log('✅ Game started and broadcasted to all players');
            })
            .catch((error) => {
                console.error('❌ Failed to start game:', error);
            });
        }
    }, [gameState.players, gameState.initializeGame, roomState.isConnected, roomState.roomId, roomId]);

    // Handle new game (after winner)
    const handleNewGame = useCallback(async () => {
        gameState.setWinner(null);
        gameState.setGameStarted(false);
        gameState.setDeck([]);
        gameState.setDiscardPile([]);
        gameState.setPlayers(gameState.players.map(p => ({ ...p, hand: [] })));
        gameState.setCurrentPlayerIndex(0);
        gameState.setPlayDirection(1);
        gameState.setCurrentColor(null);
        gameState.setPendingDraw(0);
        gameState.setSelectedCard(null);
        gameState.setShowColorPicker(false);
        gameState.setUnoCalled({});
        gameState.setNeedsUnoCall({});
        
        // Clear server state if connected
        const finalRoomId = roomState.roomId || roomId;
        if (roomState.isConnected && finalRoomId) {
            try {
                await axios.delete(`/api/games/state/${finalRoomId}`);
            } catch (error) {
                console.error('Failed to clear game state:', error);
            }
        }
    }, [gameState, roomState.isConnected, roomState.roomId, roomId]);

    // Game styles
    const gameStyles = (
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
    );

    const gameContent = (
        <>
            {gameStyles}
            
            {!gameState.gameStarted ? (
                <LobbyScreen
                    roomId={roomState.roomId}
                    setRoomId={roomState.setRoomId}
                    playerName={roomState.playerName}
                    setPlayerName={roomState.setPlayerName}
                    isConnected={roomState.isConnected}
                    players={gameState.players}
                    ablyConnected={gameState.ablyConnected}
                    onConnectRoom={roomState.connectRoom}
                    onDisconnectRoom={roomState.disconnectRoom}
                    onStartGame={startGame}
                />
            ) : (
                <GameScreen
                    isFullscreen={gameState.isFullscreen}
                    onToggleFullscreen={gameState.toggleFullscreen}
                    players={gameState.players}
                    assignedPlayerIndex={gameState.assignedPlayerIndex}
                    currentPlayerIndex={gameState.currentPlayerIndex}
                    discardPile={gameState.discardPile}
                    currentColor={gameState.currentColor}
                    deck={gameState.deck}
                    pendingDraw={gameState.pendingDraw}
                    winner={gameState.winner}
                    unoCalled={gameState.unoCalled}
                    needsUnoCall={gameState.needsUnoCall}
                    drawnCardIndex={gameState.drawnCardIndex}
                    unoAnimation={gameState.unoAnimation}
                    laughAnimation={gameState.laughAnimation}
                    onCardClick={actions.playCard}
                    onDraw={actions.drawCard}
                    onCallUno={actions.callUno}
                    onNewGame={handleNewGame}
                />
                )}

                {/* Color Picker Modal */}
            <ColorPicker
                show={gameState.showColorPicker}
                selectedCard={gameState.selectedCard}
                onColorSelect={(color) => {
                    actions.playCard(gameState.selectedCard.index, color);
                }}
                onCancel={() => {
                    gameState.setShowColorPicker(false);
                    gameState.setSelectedCard(null);
                }}
            />
        </>
    );

    // In fullscreen mode, render without AppLayout wrapper
    if (gameState.isFullscreen && gameState.gameStarted) {
        return gameContent;
    }

    // Normal mode with AppLayout
    return <AppLayout>{gameContent}</AppLayout>;
}
