import { getCardImage } from './utils';

export default function DiscardPile({ topCard, currentColor, currentPlayer, assignedPlayerIndex, pendingDraw }) {
    if (!topCard) return null;

    return (
        <div className="flex flex-col items-center">
            <div className="mb-1.5 text-[10px] font-semibold text-white sm:mb-2 sm:text-xs">Discard</div>
            <div className="relative">
                <div
                    className="absolute h-16 w-12 rounded-md border-2 border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 sm:h-20 sm:w-14 md:h-22 md:w-16"
                    style={{ transform: 'translate(2px, 2px) rotate(-1deg)', zIndex: 0 }}
                />
                <img
                    src={getCardImage(topCard)}
                    alt={`${topCard.color || 'Wild'} ${topCard.value}`}
                    className="relative z-10 h-16 w-12 rounded-md border-2 border-white object-contain shadow-xl sm:h-20 sm:w-14 md:h-22 md:w-16"
                    onError={(e) => {
                        console.error('Failed to load card image:', getCardImage(topCard));
                        e.target.src = `https://via.placeholder.com/64x88/333333/ffffff?text=${topCard.value || 'CARD'}`;
                    }}
                />
            </div>

            {/* Current Color Indicator */}
            <div className="mt-2 flex flex-col items-center gap-1 sm:mt-3">
                <div className="text-[9px] font-semibold text-white sm:text-[10px]">Color</div>
                <div
                    className="h-8 w-8 rounded-md border-2 border-white shadow-lg ring-1 ring-white/30 sm:h-10 sm:w-10 md:h-12 md:w-12"
                    style={{
                        backgroundColor:
                            currentColor === 'red'
                                ? '#dc2626'
                                : currentColor === 'green'
                                  ? '#16a34a'
                                  : currentColor === 'blue'
                                    ? '#2563eb'
                                    : currentColor === 'yellow'
                                      ? '#ca8a04'
                                      : '#000',
                    }}
                />
            </div>

            {/* Turn indicator */}
            <div className="mt-1.5 px-1.5 py-0.5 text-center text-[9px] text-white sm:mt-2 sm:text-[10px]">
                {currentPlayer &&
                    (currentPlayer.id === assignedPlayerIndex ? (
                        <span className="font-bold text-yellow-300">Your turn!</span>
                    ) : (
                        <span className="block max-w-[70px] truncate sm:max-w-none">{currentPlayer.name}'s turn</span>
                    ))}
            </div>

            {/* Pending Draw Warning */}
            {pendingDraw > 0 && currentPlayer?.id === assignedPlayerIndex && (
                <div className="mt-1.5 rounded-md bg-red-600 px-2 py-1 text-[9px] font-bold text-white shadow-lg sm:text-[10px]">
                    Draw {pendingDraw}!
                </div>
            )}
        </div>
    );
}
