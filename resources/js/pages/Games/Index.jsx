import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';

const games = [
    {
        id: 'snake',
        name: 'Snake Game',
        description: 'Classic snake game - eat food and grow longer!',
        icon: '🐍',
        color: 'from-green-500 to-emerald-600',
        link: '/games/snake',
    },
    {
        id: 'tic-tac-toe',
        name: 'Tic Tac Toe',
        description: 'Play against the computer in this classic game',
        icon: '⭕',
        color: 'from-blue-500 to-cyan-600',
        link: '/games/tic-tac-toe',
    },
    {
        id: 'memory',
        name: 'Memory Cards',
        description: 'Test your memory by matching pairs of cards',
        icon: '🧠',
        color: 'from-purple-500 to-violet-600',
        link: '/games/memory',
    },
    {
        id: 'tetris',
        name: 'Tetris',
        description: 'Stack falling blocks and clear lines',
        icon: '🧩',
        color: 'from-orange-500 to-red-600',
        link: '/games/tetris',
    },
    {
        id: 'connect-four',
        name: 'Connect Four',
        description: 'Drop discs and connect four in a row',
        icon: '🟡',
        color: 'from-yellow-400 to-amber-600',
        link: '/games/connect-four',
    },
    {
        id: 'rock-paper-scissors',
        name: 'Rock Paper Scissors',
        description: 'Classic quick duel: best of rounds',
        icon: '✊✋✌️',
        color: 'from-slate-500 to-gray-700',
        link: '/games/rock-paper-scissors',
    },
];

export default function GamesIndex() {
    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <h1 className="mb-4 text-4xl font-bold text-gray-900">🎮 Games Arcade</h1>
                        <p className="mx-auto max-w-2xl text-xl text-gray-600">
                            Choose your favorite game and have some fun! Challenge yourself and beat your high scores.
                        </p>
                    </div>

                    {/* Games Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {games.map((game) => (
                            <Link
                                key={game.id}
                                href={game.link}
                                className="group block transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                            >
                                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg group-hover:border-gray-300">
                                    {/* Game Icon */}
                                    <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center`}>
                                        <span className="text-6xl transition-transform duration-300 group-hover:scale-110">{game.icon}</span>
                                    </div>

                                    {/* Game Info */}
                                    <div className="p-6">
                                        <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-gray-700">{game.name}</h3>
                                        <p className="text-sm leading-relaxed text-gray-600">{game.description}</p>

                                        {/* Play Button */}
                                        <div className="mt-4">
                                            <div
                                                className={`inline-flex items-center bg-gradient-to-r px-4 py-2 ${game.color} rounded-lg font-semibold text-white transition-all duration-300 group-hover:shadow-lg`}
                                            >
                                                <span className="mr-2">▶️</span>
                                                Play Now
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Stats Section */}
                    <div className="mt-16 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">🏆 Game Statistics</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="text-center">
                                <div className="mb-2 text-3xl font-bold text-blue-600">6</div>
                                <div className="text-gray-600">Available Games</div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-3xl font-bold text-green-600">∞</div>
                                <div className="text-gray-600">Play Sessions</div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-3xl font-bold text-purple-600">100%</div>
                                <div className="text-gray-600">Fun Guaranteed</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-500">🎯 Challenge yourself and have fun! All games are optimized for the best experience.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
