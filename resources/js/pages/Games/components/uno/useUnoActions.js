import axios from 'axios';
import { useCallback } from 'react';
import { getNextPlayerIndex, isPlayable } from './utils';

/**
 * Custom hook for Uno game actions (playCard, drawCard, callUno)
 * Separates action logic from state management
 */
export function useUnoActions({
    gameStarted,
    winner,
    players,
    currentPlayerIndex,
    assignedPlayerIndex,
    discardPile,
    currentColor,
    deck,
    playDirection,
    pendingDraw,
    unoCalled,
    needsUnoCall,
    isConnected,
    roomId,
    applyCardEffect,
    drawCards,
    fullGameStateRef,
    setDeck,
    setDiscardPile,
    setPlayers,
    setCurrentPlayerIndex,
    setPlayDirection,
    setCurrentColor,
    setPendingDraw,
    setSelectedCard,
    setShowColorPicker,
    setDrawnCardIndex,
    setUnoCalled,
    setNeedsUnoCall,
    setWinner,
    setLaughAnimation,
    setUnoAnimation,
}) {
    // Play card
    const playCard = useCallback(
        (cardIndex, chosenColor = null) => {
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

            // For Wild cards, require color selection
            if (card.type === 'wild' && !chosenColor) {
                setSelectedCard({ card, index: cardIndex });
                setShowColorPicker(true);
                return;
            }

            // Create new game state
            let fullPlayers = players;
            if (fullGameStateRef.current && fullGameStateRef.current.players) {
                fullPlayers = fullGameStateRef.current.players.map((p, idx) => {
                    if (idx === assignedPlayerIndex) {
                        return { ...p, hand: [...players[assignedPlayerIndex].hand] };
                    }
                    return { ...p, hand: [...p.hand] };
                });
            } else {
                fullPlayers = players.map((p) => ({ ...p, hand: [...p.hand] }));
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
            const handSizeAfter = newState.players[currentPlayerIndex].hand.filter((c) => c !== null).length;

            // Check for win
            if (newState.players[currentPlayerIndex].hand.length === 0) {
                if (unoCalled[currentPlayerIndex]) {
                    newState.winner = currentPlayerIndex;
                    setWinner(currentPlayerIndex);
                    setUnoCalled((prev) => {
                        const updated = { ...prev };
                        delete updated[currentPlayerIndex];
                        return updated;
                    });
                    setNeedsUnoCall((prev) => {
                        const updated = { ...prev };
                        delete updated[currentPlayerIndex];
                        return updated;
                    });

                    // Update local state
                    setDeck(newState.deck);
                    setDiscardPile(newState.discardPile);
                    setPlayers(newState.players);
                    setCurrentPlayerIndex(currentPlayerIndex);
                    setPlayDirection(newState.playDirection);
                    setCurrentColor(newState.currentColor);
                    setPendingDraw(0);
                    setSelectedCard(null);
                    setShowColorPicker(false);

                    // Save to server
                    if (isConnected && roomId) {
                        const gameState = {
                            deck: newState.deck,
                            discardPile: newState.discardPile,
                            players: newState.players.map((p) => ({
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
                            unoCalled: unoCalled,
                        };

                        axios
                            .post(`/api/games/state/${roomId}`, {
                                game_type: 'uno',
                                game_state: gameState,
                            })
                            .catch((error) => console.error('Failed to update game state:', error));
                    }
                    return;
                }
            }

            // UNO rule: If player now has 1 card, show UNO button
            if (handSizeAfter === 1) {
                setNeedsUnoCall((prev) => ({ ...prev, [currentPlayerIndex]: true }));
            } else {
                setNeedsUnoCall((prev) => {
                    const updated = { ...prev };
                    delete updated[currentPlayerIndex];
                    return updated;
                });
            }

            // Clear UNO call status if player now has more than 1 card
            if (handSizeAfter > 1) {
                setUnoCalled((prev) => {
                    const updated = { ...prev };
                    delete updated[currentPlayerIndex];
                    return updated;
                });
            }

            // Apply card effect
            newState = applyCardEffect(card, newState);

            // Handle pending draws
            if (newState.pendingDraw > 0) {
                setLaughAnimation({
                    playerIndex: newState.currentPlayerIndex,
                    drawAmount: newState.pendingDraw,
                    timestamp: Date.now(),
                });
                setTimeout(() => {
                    setLaughAnimation(null);
                }, 3000);

                newState = drawCards(newState.pendingDraw, newState.currentPlayerIndex, newState);
                newState.currentPlayerIndex = getNextPlayerIndex(newState.currentPlayerIndex, newState.playDirection, newState.players.length);
                newState.pendingDraw = 0;
            }

            // Clear UNO status when turn changes
            if (newState.currentPlayerIndex !== currentPlayerIndex) {
                const previousPlayerIndex = currentPlayerIndex;
                if (needsUnoCall[previousPlayerIndex] && !unoCalled[previousPlayerIndex]) {
                    newState = drawCards(2, previousPlayerIndex, newState);
                }
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
            setDrawnCardIndex(null);

            // Save to server
            if (isConnected && roomId) {
                const gameState = {
                    deck: newState.deck,
                    discardPile: newState.discardPile,
                    players: newState.players.map((p) => ({
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
                    unoCalled: unoCalled,
                    needsUnoCall: needsUnoCall,
                    drawnCardIndex: null,
                };

                axios
                    .post(`/api/games/state/${roomId}`, {
                        game_type: 'uno',
                        game_state: gameState,
                    })
                    .then(() => {
                        console.log('✅ Game state saved and broadcasted to all players');
                    })
                    .catch((error) => {
                        console.error('❌ Failed to update game state:', error);
                    });
            }
        },
        [
            gameStarted,
            winner,
            players,
            currentPlayerIndex,
            assignedPlayerIndex,
            discardPile,
            currentColor,
            deck,
            playDirection,
            pendingDraw,
            unoCalled,
            needsUnoCall,
            isConnected,
            roomId,
            applyCardEffect,
            drawCards,
            fullGameStateRef,
            setDeck,
            setDiscardPile,
            setPlayers,
            setCurrentPlayerIndex,
            setPlayDirection,
            setCurrentColor,
            setPendingDraw,
            setSelectedCard,
            setShowColorPicker,
            setDrawnCardIndex,
            setUnoCalled,
            setNeedsUnoCall,
            setWinner,
            setLaughAnimation,
        ],
    );

    // Draw card
    const drawCard = useCallback(() => {
        if (!gameStarted || winner) return;

        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer || currentPlayer.id !== assignedPlayerIndex) return;

        // If there's a pending draw, must draw those cards first
        if (pendingDraw > 0) {
            let newState = {
                deck: [...deck],
                discardPile: [...discardPile],
                players: players.map((p) => ({ ...p, hand: [...p.hand] })),
                currentPlayerIndex,
                playDirection,
                currentColor,
                pendingDraw,
            };

            newState = drawCards(pendingDraw, currentPlayerIndex, newState);
            newState.currentPlayerIndex = getNextPlayerIndex(currentPlayerIndex, playDirection, players.length);
            newState.pendingDraw = 0;

            setDeck(newState.deck);
            setDiscardPile(newState.discardPile);
            setPlayers(newState.players);
            setCurrentPlayerIndex(newState.currentPlayerIndex);
            setPendingDraw(0);
            setUnoCalled({});
            setNeedsUnoCall({});

            if (isConnected && roomId) {
                const gameState = {
                    deck: newState.deck,
                    discardPile: newState.discardPile,
                    players: newState.players.map((p) => ({
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

                axios
                    .post(`/api/games/state/${roomId}`, {
                        game_type: 'uno',
                        game_state: gameState,
                    })
                    .then(() => console.log('✅ Pending draw state saved'))
                    .catch((err) => console.error('❌ Failed to update:', err));
            }
            return;
        }

        // Normal draw
        let fullPlayers = players;
        if (fullGameStateRef.current && fullGameStateRef.current.players) {
            fullPlayers = fullGameStateRef.current.players.map((p, idx) => {
                if (idx === assignedPlayerIndex) {
                    return { ...p, hand: [...players[assignedPlayerIndex].hand] };
                }
                return { ...p, hand: [...p.hand] };
            });
        } else {
            fullPlayers = players.map((p) => ({ ...p, hand: [...p.hand] }));
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

        newState = drawCards(1, currentPlayerIndex, newState);

        const drawnCard = newState.players[currentPlayerIndex].hand[newState.players[currentPlayerIndex].hand.length - 1];
        const topCard = newState.discardPile[newState.discardPile.length - 1];
        const isDrawnCardPlayable = drawnCard && isPlayable(drawnCard, topCard, currentColor);

        if (isDrawnCardPlayable) {
            const drawnCardIndex = newState.players[currentPlayerIndex].hand.length - 1;
            setDrawnCardIndex(drawnCardIndex);
            setDeck(newState.deck);
            setDiscardPile(newState.discardPile);
            setPlayers(newState.players);
            setPendingDraw(0);
        } else {
            newState.currentPlayerIndex = getNextPlayerIndex(currentPlayerIndex, playDirection, players.length);
            setDrawnCardIndex(null);
            setUnoCalled({});
            setNeedsUnoCall({});
            setDeck(newState.deck);
            setDiscardPile(newState.discardPile);
            setPlayers(newState.players);
            setCurrentPlayerIndex(newState.currentPlayerIndex);
            setPendingDraw(0);
        }

        // Save to server
        if (isConnected && roomId) {
            const gameState = {
                deck: newState.deck,
                discardPile: newState.discardPile,
                players: newState.players.map((p) => ({
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
                unoCalled: unoCalled,
                needsUnoCall: needsUnoCall,
                drawnCardIndex: isDrawnCardPlayable ? newState.players[currentPlayerIndex].hand.length - 1 : null,
            };

            axios
                .post(`/api/games/state/${roomId}`, {
                    game_type: 'uno',
                    game_state: gameState,
                })
                .then(() => console.log('✅ Draw card state saved'))
                .catch((error) => console.error('❌ Failed to update:', error));
        }
    }, [
        gameStarted,
        winner,
        players,
        currentPlayerIndex,
        assignedPlayerIndex,
        deck,
        discardPile,
        currentColor,
        playDirection,
        pendingDraw,
        unoCalled,
        needsUnoCall,
        isConnected,
        roomId,
        drawCards,
        fullGameStateRef,
        setDeck,
        setDiscardPile,
        setPlayers,
        setCurrentPlayerIndex,
        setPendingDraw,
        setDrawnCardIndex,
        setUnoCalled,
        setNeedsUnoCall,
    ]);

    // Call UNO
    const callUno = useCallback(() => {
        if (assignedPlayerIndex === null || assignedPlayerIndex === undefined) return;

        const myPlayer = players[assignedPlayerIndex];
        if (!myPlayer) return;

        const handSize = myPlayer.hand.filter((c) => c !== null).length;

        if (handSize === 1) {
            const newUnoCalled = { ...unoCalled, [assignedPlayerIndex]: true };
            setUnoCalled(newUnoCalled);
            setNeedsUnoCall((prev) => {
                const updated = { ...prev };
                delete updated[assignedPlayerIndex];
                return updated;
            });
            setUnoAnimation({ playerIndex: assignedPlayerIndex, timestamp: Date.now() });
            setTimeout(() => {
                setUnoAnimation((prev) => {
                    if (prev && prev.playerIndex === assignedPlayerIndex) {
                        return null;
                    }
                    return prev;
                });
            }, 2000);

            // Sync to server
            if (isConnected && roomId) {
                const gameState = {
                    deck: deck,
                    discardPile: discardPile,
                    players: players.map((p) => ({
                        id: p.id,
                        name: p.name,
                        hand: p.hand,
                        score: p.score,
                    })),
                    currentPlayerIndex: currentPlayerIndex,
                    playDirection: playDirection,
                    currentColor: currentColor,
                    gameStarted: gameStarted,
                    winner: winner,
                    pendingDraw: pendingDraw,
                    unoCalled: newUnoCalled,
                    needsUnoCall: needsUnoCall,
                    drawnCardIndex: null,
                };

                axios
                    .post(`/api/games/state/${roomId}`, {
                        game_type: 'uno',
                        game_state: gameState,
                    })
                    .then(() => console.log('✅ UNO call saved'))
                    .catch((error) => console.error('❌ Failed to sync UNO call:', error));
            }
        }
    }, [
        players,
        assignedPlayerIndex,
        unoCalled,
        needsUnoCall,
        isConnected,
        roomId,
        deck,
        discardPile,
        currentPlayerIndex,
        playDirection,
        currentColor,
        gameStarted,
        winner,
        pendingDraw,
        setUnoCalled,
        setNeedsUnoCall,
        setUnoAnimation,
    ]);

    return {
        playCard,
        drawCard,
        callUno,
    };
}
