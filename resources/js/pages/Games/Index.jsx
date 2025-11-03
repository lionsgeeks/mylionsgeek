import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

const games = [
    {
        id: 'snake',
        name: 'Snake Game',
        description: 'Classic snake game - eat food and grow longer!',
        icon: '🐍',
        color: 'from-green-500 to-emerald-600',
        link: '/games/snake'
    },
    {
        id: 'tic-tac-toe',
        name: 'Tic Tac Toe',
        description: 'Play against the computer in this classic game',
        icon: '⭕',
        color: 'from-blue-500 to-cyan-600',
        link: '/games/tic-tac-toe'
    },
    {
        id: 'memory',
        name: 'Memory Cards',
        description: 'Test your memory by matching pairs of cards',
        icon: '🧠',
        color: 'from-purple-500 to-violet-600',
        link: '/games/memory'
    },
    {
        id: 'tetris',
        name: 'Tetris',
        description: 'Stack falling blocks and clear lines',
        icon: '🧩',
        color: 'from-orange-500 to-red-600',
        link: '/games/tetris'
    },
    // {
    //     id: 'connect-four',
    //     name: 'Connect Four',
    //     description: 'Drop discs and connect four in a row',
    //     icon: '🟡',
    //     color: 'from-yellow-400 to-amber-600',
    //     link: '/games/connect-four'
    // },
    // {
    //     id: 'rock-paper-scissors',
    //     name: 'Rock Paper Scissors',
    //     description: 'Classic quick duel: best of rounds',
    //     icon: '✊✋✌️',
    //     color: 'from-slate-500 to-gray-700',
    //     link: '/games/rock-paper-scissors'
    // },
    {
        id: 'pacman',
        name: 'Pac-Man',
        description: 'Chomp the dots, outsmart the ghost, classic arcade style!',
        icon: '🟡',
        color: 'from-yellow-300 to-yellow-500',
        link: '/games/pacman'
    },
];

export default function GamesIndex() {
    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            🎮 Games Arcade
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Choose your favorite game and have some fun! Challenge yourself and beat your high scores.
                        </p>
                    </div>

                    {/* Games Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {games.map((game) => (
                            <Link
                                key={game.id}
                                href={game.link}
                                className="group block transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                            >
                                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 group-hover:border-gray-300">
                                    <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center`}>
                                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                                            {game.icon}
                                        </span>
                                    </div>
                                    
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700">
                                            {game.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {game.description}
                                        </p>
                                        <div className="mt-4">
                                            <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${game.color} text-white font-semibold rounded-lg group-hover:shadow-lg transition-all duration-300`}>
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
                    {/* <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                            🏆 Game Statistics
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-2">6</div>
                                <div className="text-gray-600">Available Games</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-2">∞</div>
                                <div className="text-gray-600">Play Sessions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
                                <div className="text-gray-600">Fun Guaranteed</div>
                            </div>
                        </div>
                    </div> */}

                    {/* Footer */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-500">
                            🎯 Challenge yourself and have fun! All games are optimized for the best experience.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
