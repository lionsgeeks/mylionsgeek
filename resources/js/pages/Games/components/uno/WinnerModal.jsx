import React from 'react';

export default function WinnerModal({ winner, winnerName, onNewGame }) {
    if (winner === null) return null;

    return (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl">
                <h2 className="text-2xl sm:text-4xl font-bold mb-4">🎉 Winner!</h2>
                <p className="text-xl sm:text-2xl mb-6 font-semibold">{winnerName} wins!</p>
                <button
                    onClick={onNewGame}
                    className="px-6 py-3 sm:px-8 sm:py-3 bg-[#ffc801] hover:bg-[#ffd633] text-[#171717] rounded-lg font-semibold text-base sm:text-lg touch-manipulation w-full sm:w-auto"
                >
                    New Game
                </button>
            </div>
        </div>
    );
}





