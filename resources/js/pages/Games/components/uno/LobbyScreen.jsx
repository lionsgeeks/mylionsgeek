import React from 'react';
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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <Link href="/games" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 text-lg">
                        ← Back to Games
                    </Link>
                    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
                        <img
                            src="/assets/images/uno-card-images/backofthecardred.png"
                            alt="UNO"
                            className="w-12 h-16 sm:w-16 sm:h-22 md:w-20 md:h-28 object-contain rounded-lg shadow-lg"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = document.createElement('div');
                                fallback.className = 'w-12 h-16 sm:w-16 sm:h-22 md:w-20 md:h-28 bg-red-600 rounded-lg flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl font-bold shadow-lg';
                                fallback.innerHTML = 'UNO';
                                e.target.parentNode.appendChild(fallback);
                            }}
                        />
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">UNO</h1>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base md:text-lg">Match colors and numbers to win!</p>
                </div>

                {/* Online multiplayer room controls */}
                <div className="flex justify-center mb-6">
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex flex-col gap-3 sm:gap-4 w-full max-w-xl">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                placeholder="Room ID (e.g. uno-abc123)"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-base sm:text-lg focus:border-blue-500 focus:outline-none"
                                disabled={isConnected}
                            />
                            <button
                                onClick={() => {
                                    if (!roomId) {
                                        const randomId = 'uno-' + Math.random().toString(36).slice(2, 8);
                                        setRoomId(randomId);
                                    }
                                }}
                                className="px-4 py-2 sm:py-3 rounded-lg bg-gray-100 border-2 border-gray-300 hover:bg-gray-200 font-semibold transition-colors text-sm sm:text-base touch-manipulation"
                                disabled={isConnected}
                            >Generate</button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center flex-wrap">
                            {!isConnected ? (
                                <button
                                    onClick={onConnectRoom}
                                    className="px-6 py-3 rounded-lg bg-[#ffc801] hover:bg-[#ffd633] text-[#171717] disabled:bg-gray-400 font-semibold text-base sm:text-lg transition-colors touch-manipulation"
                                    disabled={!roomId || !playerName.trim()}
                                >Join Room</button>
                            ) : (
                                <button
                                    onClick={onDisconnectRoom}
                                    className="px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 font-semibold text-base sm:text-lg transition-colors touch-manipulation"
                                >Leave Room</button>
                            )}
                            {isConnected && !players.some(p => p.gameStarted) && players.length >= 2 && players.length <= 4 && (
                                <button
                                    onClick={onStartGame}
                                    className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold text-base sm:text-lg transition-colors touch-manipulation"
                                >Start Game</button>
                            )}
                            {isConnected && players.length > 4 && (
                                <div className="text-xs sm:text-sm text-red-600 font-semibold">
                                    Maximum 4 players allowed
                                </div>
                            )}
                            {isConnected && (
                                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                                    {players.length}/4 player{players.length !== 1 ? 's' : ''} connected {ablyConnected ? '— Real-time' : '— Connecting...'}
                                </div>
                            )}
                        </div>
                        {isConnected && players.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-sm font-semibold text-gray-700 mb-2">Players in room:</div>
                                <div className="flex flex-wrap gap-2">
                                    {players.map((p, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
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






