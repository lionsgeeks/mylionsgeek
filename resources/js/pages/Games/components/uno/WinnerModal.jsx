export default function WinnerModal({ winner, winnerName, onNewGame }) {
    if (winner === null) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-2xl sm:p-8">
                <h2 className="mb-4 text-2xl font-bold sm:text-4xl">🎉 Winner!</h2>
                <p className="mb-6 text-xl font-semibold sm:text-2xl">{winnerName} wins!</p>
                <button
                    onClick={onNewGame}
                    className="w-full touch-manipulation rounded-lg bg-[#ffc801] px-6 py-3 text-base font-semibold text-[#171717] hover:bg-[#ffd633] sm:w-auto sm:px-8 sm:py-3 sm:text-lg"
                >
                    New Game
                </button>
            </div>
        </div>
    );
}
