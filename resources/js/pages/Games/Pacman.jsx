import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Pacman from 'pacman-react';

export default function PacmanGame() {
    const [gameKey, setGameKey] = useState(0);

    // Prevent scrolling while playing
    useEffect(() => {
        const preventScroll = (e) => {
            // Only prevent scroll on arrow keys if they're being used for the game
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
                e.preventDefault();
            }
        };
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        window.addEventListener('keydown', preventScroll, { passive: false });
        
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', preventScroll);
        };
    }, []);

    const handleRestart = () => {
        setGameKey(prev => prev + 1);
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-8 overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link
                            href="/games"
                            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 mb-4"
                        >
                            ← Back to Games
                        </Link>
                        <h1 className="text-4xl font-bold text-yellow-400 mb-2">
                            🟡 Pac-Man Game
                        </h1>
                        <p className="text-gray-300">
                            Classic arcade action! Navigate through the maze, eat all the dots, and avoid the ghosts!
                        </p>
                    </div>

                    {/* Game Container with Restart Button */}
                    <div className="flex flex-col items-center mb-6 gap-4">
                        <div className="bg-black rounded-2xl shadow-2xl border-4 border-yellow-400 p-6">
                            <Pacman key={gameKey} />
                        </div>
                        <button
                            onClick={handleRestart}
                            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-colors shadow-lg"
                        >
                            🔄 Restart Game
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                        <h3 className="text-xl font-bold text-yellow-400 mb-4">How to Play</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-200">
                            <div>
                                <h4 className="font-semibold text-yellow-300 mb-2">Controls:</h4>
                                <ul className="space-y-1">
                                    <li>• ↑ Arrow Up - Move up</li>
                                    <li>• ↓ Arrow Down - Move down</li>
                                    <li>• ← Arrow Left - Move left</li>
                                    <li>• → Arrow Right - Move right</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-yellow-300 mb-2">Objective:</h4>
                                <ul className="space-y-1">
                                    <li>• Eat all the dots in the maze</li>
                                    <li>• Avoid the ghosts</li>
                                    <li>• Clear the entire board to win</li>
                                    <li>• Try to beat your high score!</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
