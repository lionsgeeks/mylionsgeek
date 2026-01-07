import React from 'react';

export default function OpponentPlayer({ 
    player, 
    playerIndex, 
    currentPlayerIndex, 
    assignedPlayerIndex, 
    unoCalled,
    position = 'top' // 'top', 'left', 'right'
}) {
    if (!player) return null;

    const isCurrentTurn = playerIndex === currentPlayerIndex;
    const hasUno = unoCalled[playerIndex] && playerIndex !== assignedPlayerIndex;

    // Desktop styles
    const desktopStyles = {
        top: 'absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-2 sm:px-4',
        left: 'absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 hidden md:block',
        right: 'absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 hidden md:block'
    };

    // Mobile styles
    const mobileStyles = {
        top: null, // Top player uses desktop layout on mobile too
        left: 'block md:hidden absolute left-1 top-1/3 transform -translate-y-1/2',
        right: 'block md:hidden absolute right-1 top-1/3 transform -translate-y-1/2'
    };

    const cardCount = player.hand?.length || 0;
    const maxVisibleCards = position === 'top' ? cardCount : (position === 'left' || position === 'right' ? 8 : 5);
    const visibleCards = Math.min(cardCount, maxVisibleCards);

    if (position === 'top') {
        return (
            <div className={desktopStyles.top}>
                <div className="flex flex-col items-center">
                    <div className={`text-white font-bold text-xs sm:text-sm mb-1 sm:mb-2 flex items-center gap-2 ${
                        isCurrentTurn ? 'text-yellow-300' : ''
                    }`}>
                        <span>{player.name} ({cardCount} cards)</span>
                        {isCurrentTurn && (
                            <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold animate-pulse">
                                YOUR TURN!
                            </span>
                        )}
                        {hasUno && (
                            <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold animate-pulse">
                                UNO!
                            </span>
                        )}
                    </div>
                    <div className="flex gap-1 sm:gap-1.5 justify-center items-center w-full overflow-x-auto pb-2 scrollbar-hide">
                        {Array.from({ length: visibleCards }).map((_, i) => (
                            <img
                                key={i}
                                src="/assets/images/uno-card-images/backofthecardblack.png"
                                alt="Face-down card"
                                className="w-12 h-16 sm:w-14 sm:h-20 md:w-16 md:h-22 flex-shrink-0 object-contain rounded-md border border-white/90 sm:border-2 shadow-md"
                                style={{
                                    transform: `rotate(${Math.sin(i * 0.3) * 2}deg)`,
                                    zIndex: cardCount - i
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    const parent = e.target.parentNode;
                                    const fallback = document.createElement('div');
                                    fallback.className = 'w-12 h-16 sm:w-14 sm:h-20 md:w-16 md:h-22 bg-gradient-to-br from-gray-800 to-gray-900 rounded-md border border-white/90 sm:border-2 shadow-md flex items-center justify-center flex-shrink-0';
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
                    <div className={`text-white font-bold text-xs sm:text-sm transform ${position === 'left' ? '-rotate-90' : 'rotate-90'} whitespace-nowrap flex items-center gap-1 ${
                        isCurrentTurn ? 'text-yellow-300' : ''
                    }`}>
                        <span>{player.name} ({cardCount})</span>
                        {isCurrentTurn && (
                            <span className="bg-yellow-400 text-black px-1 py-0.5 rounded text-[8px] font-bold animate-pulse">
                                YOUR TURN!
                            </span>
                        )}
                        {hasUno && (
                            <span className="bg-red-600 text-white px-1 py-0.5 rounded text-[8px] font-bold animate-pulse">
                                UNO!
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-1.5 items-center max-h-[300px] overflow-y-auto scrollbar-hide">
                        {Array.from({ length: visibleCards }).map((_, i) => (
                            <img
                                key={i}
                                src="/assets/images/uno-card-images/backofthecardblack.png"
                                alt="Face-down card"
                                className="w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20 flex-shrink-0 object-contain rounded-md border border-white/90 sm:border-2 shadow-md"
                                style={{
                                    transform: `rotate(${Math.sin(i * 0.3) * (position === 'left' ? 2 : -2)}deg)`,
                                    zIndex: cardCount - i
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    const parent = e.target.parentNode;
                                    const fallback = document.createElement('div');
                                    fallback.className = 'w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-md border border-white/90 sm:border-2 shadow-md flex items-center justify-center flex-shrink-0';
                                    fallback.style.cssText = e.target.style.cssText;
                                    fallback.innerHTML = '<div class="text-white text-[7px] sm:text-[9px] font-bold">UNO</div>';
                                    parent.replaceChild(fallback, e.target);
                                }}
                            />
                        ))}
                        {cardCount > visibleCards && (
                            <div className="text-white text-[10px] mt-1">+{cardCount - visibleCards}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile */}
            <div className={mobileStyles[position]}>
                <div className="flex flex-col items-center gap-1">
                    <div className={`text-white font-bold text-[9px] transform ${position === 'left' ? '-rotate-90' : 'rotate-90'} whitespace-nowrap flex items-center gap-1 ${
                        isCurrentTurn ? 'text-yellow-300' : ''
                    }`}>
                        <span>{player.name}</span>
                        {isCurrentTurn && (
                            <span className="bg-yellow-400 text-black px-1 py-0.5 rounded text-[6px] font-bold animate-pulse">
                                YOUR TURN!
                            </span>
                        )}
                        {hasUno && (
                            <span className="bg-red-600 text-white px-1 py-0.5 rounded text-[6px] font-bold animate-pulse">
                                UNO!
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-0.5 items-center max-h-[200px] overflow-y-auto scrollbar-hide">
                        {Array.from({ length: Math.min(cardCount, 5) }).map((_, i) => (
                            <img
                                key={i}
                                src="/assets/images/uno-card-images/backofthecardblack.png"
                                alt="Face-down card"
                                className="w-8 h-11 flex-shrink-0 object-contain rounded border border-white/80 shadow-sm"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    const parent = e.target.parentNode;
                                    const fallback = document.createElement('div');
                                    fallback.className = 'w-8 h-11 bg-gradient-to-br from-gray-800 to-gray-900 rounded border border-white/80 shadow-sm flex items-center justify-center flex-shrink-0';
                                    fallback.innerHTML = '<div class="text-white text-[6px] font-bold">UNO</div>';
                                    parent.replaceChild(fallback, e.target);
                                }}
                            />
                        ))}
                        {cardCount > 5 && (
                            <div className="text-white text-[8px] mt-0.5">+{cardCount - 5}</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}






