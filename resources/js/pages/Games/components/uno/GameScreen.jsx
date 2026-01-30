import FullscreenButton from './FullscreenButton';
import GameBackground from './GameBackground';
import GameLayout from './GameLayout';
import LaughAnimation from './LaughAnimation';
import UnoAnimation from './UnoAnimation';
import UnoButton from './UnoButton';
import WinnerModal from './WinnerModal';

export default function GameScreen({
    isFullscreen,
    onToggleFullscreen,
    players,
    assignedPlayerIndex,
    currentPlayerIndex,
    discardPile,
    currentColor,
    deck,
    pendingDraw,
    winner,
    unoCalled,
    needsUnoCall,
    drawnCardIndex,
    unoAnimation,
    laughAnimation,
    onCardClick,
    onDraw,
    onCallUno,
    onNewGame,
}) {
    const myPlayer = players[assignedPlayerIndex];
    const containerClass = isFullscreen
        ? 'fixed inset-0 bg-gradient-to-br from-[#171717] via-[#202020] to-[#212529] overflow-hidden'
        : 'min-h-screen bg-gradient-to-br from-[#171717] via-[#202020] to-[#212529] relative overflow-hidden';

    const contentClass = isFullscreen
        ? 'w-full h-[calc(100vh)] px-2 sm:px-4 py-4 sm:py-8 relative z-10'
        : 'max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-8 relative z-10';

    const layoutClass = isFullscreen ? 'relative w-full h-full' : 'relative min-h-[calc(100vh-120px)] sm:min-h-[600px] pb-24 sm:pb-8';

    return (
        <div className={containerClass}>
            <GameBackground />

            <div className={contentClass}>
                <FullscreenButton isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />

                {/* Game Layout */}
                {!winner && (
                    <div className={layoutClass}>
                        <GameLayout
                            players={players}
                            assignedPlayerIndex={assignedPlayerIndex}
                            currentPlayerIndex={currentPlayerIndex}
                            discardPile={discardPile}
                            currentColor={currentColor}
                            deck={deck}
                            pendingDraw={pendingDraw}
                            winner={winner}
                            unoCalled={unoCalled}
                            drawnCardIndex={drawnCardIndex}
                            onCardClick={onCardClick}
                            onDraw={onDraw}
                            isFullscreen={isFullscreen}
                        />
                    </div>
                )}

                {/* UNO Button */}
                <UnoButton
                    show={myPlayer && myPlayer.hand.filter((c) => c !== null).length === 1 && !unoCalled[assignedPlayerIndex]}
                    onCallUno={onCallUno}
                />

                {/* Made by Coding Pro */}
                <div className="pointer-events-none fixed right-2 bottom-2 z-40 sm:right-4 sm:bottom-4">
                    <div className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-white/70 backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-xs">
                        Made by <span className="font-semibold text-[#ffc801]">Coding Pro</span>
                    </div>
                </div>

                {/* Animations */}
                <UnoAnimation show={!!unoAnimation} playerIndex={unoAnimation?.playerIndex} assignedPlayerIndex={assignedPlayerIndex} />

                <LaughAnimation show={!!laughAnimation} playerIndex={laughAnimation?.playerIndex} assignedPlayerIndex={assignedPlayerIndex} />

                {/* Winner Modal */}
                <WinnerModal winner={winner} winnerName={winner !== null && players[winner] ? players[winner].name : ''} onNewGame={onNewGame} />
            </div>
        </div>
    );
}
