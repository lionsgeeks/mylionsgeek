import React from 'react';
import OpponentPlayer from './OpponentPlayer';
import CenterArea from './CenterArea';
import PlayerHand from './PlayerHand';

export default function GameLayout({
    players,
    assignedPlayerIndex,
    currentPlayerIndex,
    discardPile,
    currentColor,
    deck,
    pendingDraw,
    winner,
    unoCalled,
    drawnCardIndex,
    onCardClick,
    onDraw,
    isFullscreen = false,
}) {
    // Get only actual players (filter out nulls)
    const actualPlayers = players.filter(p => p !== null && p !== undefined);
    const currentPlayerIdx = assignedPlayerIndex;
    const numPlayers = actualPlayers.length;
    
    if (numPlayers === 0 || currentPlayerIdx === null || winner) return null;
    
    // Get opponent players (exclude current player)
    const opponentPlayers = actualPlayers.filter((_, idx) => idx !== currentPlayerIdx);
    
    // Position opponents around current player
    const topPlayer = opponentPlayers[0] || null;
    const leftPlayer = opponentPlayers[1] || null;
    const rightPlayer = opponentPlayers[2] || null;
    
    // Get player indices for UNO checks
    const topPlayerIdx = topPlayer ? actualPlayers.findIndex(p => p.id === topPlayer.id) : null;
    const leftPlayerIdx = leftPlayer ? actualPlayers.findIndex(p => p.id === leftPlayer.id) : null;
    const rightPlayerIdx = rightPlayer ? actualPlayers.findIndex(p => p.id === rightPlayer.id) : null;
    
    const currentPlayer = actualPlayers[currentPlayerIndex];
    const myPlayer = actualPlayers[assignedPlayerIndex];
    const topCard = discardPile[discardPile.length - 1];

    return (
        <>
            {/* Top Player */}
            {topPlayer && (
                <OpponentPlayer
                    player={topPlayer}
                    playerIndex={topPlayerIdx}
                    currentPlayerIndex={currentPlayerIndex}
                    assignedPlayerIndex={assignedPlayerIndex}
                    unoCalled={unoCalled}
                    position="top"
                />
            )}

            {/* Left Player */}
            {leftPlayer && (
                <OpponentPlayer
                    player={leftPlayer}
                    playerIndex={leftPlayerIdx}
                    currentPlayerIndex={currentPlayerIndex}
                    assignedPlayerIndex={assignedPlayerIndex}
                    unoCalled={unoCalled}
                    position="left"
                />
            )}

            {/* Right Player */}
            {rightPlayer && (
                <OpponentPlayer
                    player={rightPlayer}
                    playerIndex={rightPlayerIdx}
                    currentPlayerIndex={currentPlayerIndex}
                    assignedPlayerIndex={assignedPlayerIndex}
                    unoCalled={unoCalled}
                    position="right"
                />
            )}

            {/* Center Game Area */}
            <CenterArea
                deck={deck}
                discardPile={discardPile}
                currentColor={currentColor}
                currentPlayer={currentPlayer}
                currentPlayerIndex={currentPlayerIndex}
                assignedPlayerIndex={assignedPlayerIndex}
                pendingDraw={pendingDraw}
                winner={winner}
                onDraw={onDraw}
            />

            {/* Current Player's Hand */}
            {myPlayer && (
                <div className={isFullscreen 
                    ? "absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full px-2 sm:px-4"
                    : "fixed bottom-0 left-0 right-0 pt-2 pb-safe sm:relative sm:pt-0 sm:pb-0 sm:mt-6"
                }>
                    <div className="flex flex-col items-center mb-2 sm:mb-3 px-2 sm:px-4">
                        <div className={`text-white font-bold text-xs sm:text-sm mb-1 sm:mb-2 flex items-center gap-2 ${
                            currentPlayerIndex === assignedPlayerIndex ? 'text-yellow-300' : ''
                        }`}>
                            <span>{myPlayer.name} ({myPlayer.hand.filter(c => c !== null).length} cards)</span>
                            {currentPlayerIndex === assignedPlayerIndex && (
                                <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold animate-pulse">
                                    YOUR TURN!
                                </span>
                            )}
                            {currentPlayerIndex !== assignedPlayerIndex && unoCalled[assignedPlayerIndex] && (
                                <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold animate-pulse">
                                    UNO!
                                </span>
                            )}
                        </div>
                    </div>

                    <PlayerHand
                        hand={myPlayer.hand}
                        topCard={topCard}
                        currentColor={currentColor}
                        currentPlayerIndex={currentPlayerIndex}
                        assignedPlayerIndex={assignedPlayerIndex}
                        winner={winner}
                        pendingDraw={pendingDraw}
                        drawnCardIndex={drawnCardIndex}
                        onCardClick={onCardClick}
                        isFullscreen={isFullscreen}
                    />
                </div>
            )}
        </>
    );
}






