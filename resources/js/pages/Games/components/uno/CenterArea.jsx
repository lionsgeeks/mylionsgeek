import React from 'react';
import Deck from './Deck';
import DiscardPile from './DiscardPile';

export default function CenterArea({
    deck,
    discardPile,
    currentColor,
    currentPlayer,
    currentPlayerIndex,
    assignedPlayerIndex,
    pendingDraw,
    winner,
    onDraw
}) {
    const topCard = discardPile[discardPile.length - 1];

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-3">
            <div className="flex justify-center items-center gap-4 sm:gap-6 md:gap-8">
                <Deck
                    deckLength={deck.length}
                    pendingDraw={pendingDraw}
                    currentPlayerIndex={currentPlayerIndex}
                    assignedPlayerIndex={assignedPlayerIndex}
                    winner={winner}
                    onDraw={onDraw}
                />
                <DiscardPile
                    topCard={topCard}
                    currentColor={currentColor}
                    currentPlayer={currentPlayer}
                    assignedPlayerIndex={assignedPlayerIndex}
                    pendingDraw={pendingDraw}
                />
            </div>
        </div>
    );
}






