import { Link } from '@inertiajs/react';

export default function LobbyScreen({
    roomId,
    setRoomId,
    playerName,
    setPlayerName,
    isConnected,
    players,
    ablyConnected,
    onConnectRoom,
    onDisconnectRoom,
    onStartGame,
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center">
                    <Link href="/games" className="mb-6 inline-flex items-center text-lg text-blue-600 hover:text-blue-800">
                        ← Back to Games
                    </Link>
                    <div className="mb-4 flex items-center justify-center gap-2 sm:gap-4">
                        <img
                            src="/assets/images/uno-card-images/backofthecardred.png"
                            alt="UNO"
                            className="h-16 w-12 rounded-lg object-contain shadow-lg sm:h-22 sm:w-16 md:h-28 md:w-20"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = document.createElement('div');
                                fallback.className =
                                    'w-12 h-16 sm:w-16 sm:h-22 md:w-20 md:h-28 bg-red-600 rounded-lg flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl font-bold shadow-lg';
                                fallback.innerHTML = 'UNO';
                                e.target.parentNode.appendChild(fallback);
                            }}
                        />
                        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">UNO</h1>
                    </div>
                    <p className="text-sm text-gray-600 sm:text-base md:text-lg">Match colors and numbers to win!</p>
                </div>

                {/* Online multiplayer room controls */}
                <div className="mb-6 flex justify-center">
                    <div className="flex w-full max-w-xl flex-col gap-3 rounded-xl bg-white p-4 shadow-lg sm:gap-4 sm:p-6">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                                type="text"
                                placeholder="Room ID (e.g. uno-abc123)"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="flex-1 rounded-lg border-2 border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none sm:px-4 sm:py-3 sm:text-lg"
                                disabled={isConnected}
                            />
                            <button
                                onClick={() => {
                                    if (!roomId) {
                                        const randomId = 'uno-' + Math.random().toString(36).slice(2, 8);
                                        setRoomId(randomId);
                                    }
                                }}
                                className="touch-manipulation rounded-lg border-2 border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-200 sm:py-3 sm:text-base"
                                disabled={isConnected}
                            >
                                Generate
                            </button>
                        </div>
                        <div className="flex flex-col flex-wrap items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
                            {!isConnected ? (
                                <button
                                    onClick={onConnectRoom}
                                    className="touch-manipulation rounded-lg bg-[#ffc801] px-6 py-3 text-base font-semibold text-[#171717] transition-colors hover:bg-[#ffd633] disabled:bg-gray-400 sm:text-lg"
                                    disabled={!roomId || !playerName.trim()}
                                >
                                    Join Room
                                </button>
                            ) : (
                                <button
                                    onClick={onDisconnectRoom}
                                    className="touch-manipulation rounded-lg bg-gray-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-gray-700 sm:text-lg"
                                >
                                    Leave Room
                                </button>
                            )}
                            {isConnected && !players.some((p) => p.gameStarted) && players.length >= 2 && players.length <= 4 && (
                                <button
                                    onClick={onStartGame}
                                    className="touch-manipulation rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-green-700 sm:text-lg"
                                >
                                    Start Game
                                </button>
                            )}
                            {isConnected && players.length > 4 && (
                                <div className="text-xs font-semibold text-red-600 sm:text-sm">Maximum 4 players allowed</div>
                            )}
                            {isConnected && (
                                <div className="text-center text-xs text-gray-600 sm:text-left sm:text-sm">
                                    {players.length}/4 player{players.length !== 1 ? 's' : ''} connected{' '}
                                    {ablyConnected ? '— Real-time' : '— Connecting...'}
                                </div>
                            )}
                        </div>
                        {isConnected && players.length > 0 && (
                            <div className="mt-4 border-t border-gray-200 pt-4">
                                <div className="mb-2 text-sm font-semibold text-gray-700">Players in room:</div>
                                <div className="flex flex-wrap gap-2">
                                    {players.map((p, idx) => (
                                        <span key={idx} className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                                            {p.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
