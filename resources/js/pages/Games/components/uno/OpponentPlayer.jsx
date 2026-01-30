export default function OpponentPlayer({
    player,
    playerIndex,
    currentPlayerIndex,
    assignedPlayerIndex,
    unoCalled,
    position = 'top', // 'top', 'left', 'right'
}) {
    if (!player) return null;

    const isCurrentTurn = playerIndex === currentPlayerIndex;
    const hasUno = unoCalled[playerIndex] && playerIndex !== assignedPlayerIndex;

    // Desktop styles
    const desktopStyles = {
        top: 'absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-2 sm:px-4',
        left: 'absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 hidden md:block',
        right: 'absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 hidden md:block',
    };

    // Mobile styles
    const mobileStyles = {
        top: null, // Top player uses desktop layout on mobile too
        left: 'block md:hidden absolute left-1 top-1/3 transform -translate-y-1/2',
        right: 'block md:hidden absolute right-1 top-1/3 transform -translate-y-1/2',
    };

    const cardCount = player.hand?.length || 0;
    const maxVisibleCards = position === 'top' ? cardCount : position === 'left' || position === 'right' ? 8 : 5;
    const visibleCards = Math.min(cardCount, maxVisibleCards);

    if (position === 'top') {
        return (
            <div className={desktopStyles.top}>
                <div className="flex flex-col items-center">
                    <div
                        className={`mb-1 flex items-center gap-2 text-xs font-bold text-white sm:mb-2 sm:text-sm ${
                            isCurrentTurn ? 'text-yellow-300' : ''
                        }`}
                    >
                        <span>
                            {player.name} ({cardCount} cards)
                        </span>
                        {isCurrentTurn && (
                            <span className="animate-pulse rounded-md bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-black sm:text-xs">
                                YOUR TURN!
                            </span>
                        )}
                        {hasUno && (
                            <span className="animate-pulse rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white sm:text-xs">UNO!</span>
                        )}
                    </div>
                    <div className="scrollbar-hide flex w-full items-center justify-center gap-1 overflow-x-auto pb-2 sm:gap-1.5">
                        {Array.from({ length: visibleCards }).map((_, i) => (
                            <img
                                key={i}
                                src="/assets/images/uno-card-images/backofthecardblack.png"
                                alt="Face-down card"
                                className="h-16 w-12 flex-shrink-0 rounded-md border border-white/90 object-contain shadow-md sm:h-20 sm:w-14 sm:border-2 md:h-22 md:w-16"
                                style={{
                                    transform: `rotate(${Math.sin(i * 0.3) * 2}deg)`,
                                    zIndex: cardCount - i,
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    const parent = e.target.parentNode;
                                    const fallback = document.createElement('div');
                                    fallback.className =
                                        'w-12 h-16 sm:w-14 sm:h-20 md:w-16 md:h-22 bg-gradient-to-br from-gray-800 to-gray-900 rounded-md border border-white/90 sm:border-2 shadow-md flex items-center justify-center flex-shrink-0';
                                    fallback.style.cssText = e.target.style.cssText;
                                    fallback.innerHTML = '<div class="text-white text-[8px] sm:text-xs font-bold">UNO</div>';
                                    parent.replaceChild(fallback, e.target);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Left or Right player
    return (
        <>
            {/* Desktop */}
            <div className={desktopStyles[position]}>
                <div className="flex flex-col items-center gap-2">
                    <div
                        className={`transform text-xs font-bold text-white sm:text-sm ${position === 'left' ? '-rotate-90' : 'rotate-90'} flex items-center gap-1 whitespace-nowrap ${
                            isCurrentTurn ? 'text-yellow-300' : ''
                        }`}
                    >
                        <span>
                            {player.name} ({cardCount})
                        </span>
                        {isCurrentTurn && (
                            <span className="animate-pulse rounded bg-yellow-400 px-1 py-0.5 text-[8px] font-bold text-black">YOUR TURN!</span>
                        )}
                        {hasUno && <span className="animate-pulse rounded bg-red-600 px-1 py-0.5 text-[8px] font-bold text-white">UNO!</span>}
                    </div>
                    <div className="scrollbar-hide flex max-h-[300px] flex-col items-center gap-1 overflow-y-auto sm:gap-1.5">
                        {Array.from({ length: visibleCards }).map((_, i) => (
                            <img
                                key={i}
                                src="/assets/images/uno-card-images/backofthecardblack.png"
                                alt="Face-down card"
                                className="h-14 w-10 flex-shrink-0 rounded-md border border-white/90 object-contain shadow-md sm:h-16 sm:w-12 sm:border-2 md:h-20 md:w-14"
                                style={{
                                    transform: `rotate(${Math.sin(i * 0.3) * (position === 'left' ? 2 : -2)}deg)`,
                                    zIndex: cardCount - i,
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    const parent = e.target.parentNode;
                                    const fallback = document.createElement('div');
                                    fallback.className =
                                        'w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-md border border-white/90 sm:border-2 shadow-md flex items-center justify-center flex-shrink-0';
                                    fallback.style.cssText = e.target.style.cssText;
                                    fallback.innerHTML = '<div class="text-white text-[7px] sm:text-[9px] font-bold">UNO</div>';
                                    parent.replaceChild(fallback, e.target);
                                }}
                            />
                        ))}
                        {cardCount > visibleCards && <div className="mt-1 text-[10px] text-white">+{cardCount - visibleCards}</div>}
                    </div>
                </div>
            </div>

            {/* Mobile */}
            <div className={mobileStyles[position]}>
                <div className="flex flex-col items-center gap-1">
                    <div
                        className={`transform text-[9px] font-bold text-white ${position === 'left' ? '-rotate-90' : 'rotate-90'} flex items-center gap-1 whitespace-nowrap ${
                            isCurrentTurn ? 'text-yellow-300' : ''
                        }`}
                    >
                        <span>{player.name}</span>
                        {isCurrentTurn && (
                            <span className="animate-pulse rounded bg-yellow-400 px-1 py-0.5 text-[6px] font-bold text-black">YOUR TURN!</span>
                        )}
                        {hasUno && <span className="animate-pulse rounded bg-red-600 px-1 py-0.5 text-[6px] font-bold text-white">UNO!</span>}
                    </div>
                    <div className="scrollbar-hide flex max-h-[200px] flex-col items-center gap-0.5 overflow-y-auto">
                        {Array.from({ length: Math.min(cardCount, 5) }).map((_, i) => (
                            <img
                                key={i}
                                src="/assets/images/uno-card-images/backofthecardblack.png"
                                alt="Face-down card"
                                className="h-11 w-8 flex-shrink-0 rounded border border-white/80 object-contain shadow-sm"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    const parent = e.target.parentNode;
                                    const fallback = document.createElement('div');
                                    fallback.className =
                                        'w-8 h-11 bg-gradient-to-br from-gray-800 to-gray-900 rounded border border-white/80 shadow-sm flex items-center justify-center flex-shrink-0';
                                    fallback.innerHTML = '<div class="text-white text-[6px] font-bold">UNO</div>';
                                    parent.replaceChild(fallback, e.target);
                                }}
                            />
                        ))}
                        {cardCount > 5 && <div className="mt-0.5 text-[8px] text-white">+{cardCount - 5}</div>}
                    </div>
                </div>
            </div>
        </>
    );
}
