import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import Pacman from 'pacman-react';
import { useEffect, useState } from 'react';

export default function PacmanGame() {
    const [gameKey, setGameKey] = useState(0);

    // Prevent scrolling while playing
    useEffect(() => {
        const preventScroll = (e) => {
            // Only prevent scroll on arrow keys if they're being used for the game
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
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
        setGameKey((prev) => prev + 1);
    };

    return (
        <AppLayout>
            <div className="min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <Link href="/games" className="mb-4 inline-flex items-center text-yellow-400 hover:text-yellow-300">
                            ← Back to Games
                        </Link>
                        <h1 className="mb-2 text-4xl font-bold text-yellow-400">🟡 Pac-Man Game</h1>
                        <p className="text-gray-300">Classic arcade action! Navigate through the maze, eat all the dots, and avoid the ghosts!</p>
                    </div>

                    {/* Game Container with Restart Button */}
                    <div className="mb-6 flex flex-col items-center gap-4">
                        <div className="rounded-2xl border-4 border-yellow-400 bg-black p-6 shadow-2xl">
                            <Pacman key={gameKey} />
                        </div>
                        <button
                            onClick={handleRestart}
                            className="rounded-lg bg-yellow-400 px-6 py-3 font-bold text-black shadow-lg transition-colors hover:bg-yellow-300"
                        >
                            🔄 Restart Game
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-sm">
                        <h3 className="mb-4 text-xl font-bold text-yellow-400">How to Play</h3>
                        <div className="grid grid-cols-1 gap-4 text-sm text-gray-200 md:grid-cols-2">
                            <div>
                                <h4 className="mb-2 font-semibold text-yellow-300">Controls:</h4>
                                <ul className="space-y-1">
                                    <li>• ↑ Arrow Up - Move up</li>
                                    <li>• ↓ Arrow Down - Move down</li>
                                    <li>• ← Arrow Left - Move left</li>
                                    <li>• → Arrow Right - Move right</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-2 font-semibold text-yellow-300">Objective:</h4>
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
