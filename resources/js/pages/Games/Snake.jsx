import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_FOOD = { x: 15, y: 15 };

export default function SnakeGame() {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [food, setFood] = useState(INITIAL_FOOD);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [highScore, setHighScore] = useState(0);

    // Generate random food position
    const generateFood = useCallback(() => {
        const newFood = {
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE)
        };
        
        // Make sure food doesn't spawn on snake
        const isOnSnake = snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        );
        
        if (isOnSnake) {
            return generateFood();
        }
        
        return newFood;
    }, [snake]);

    // Move snake
    const moveSnake = useCallback(() => {
        if (!gameStarted || gameOver) return;

        setSnake(prevSnake => {
            const newSnake = [...prevSnake];
            const head = { ...newSnake[0] };
            
            head.x += direction.x;
            head.y += direction.y;

            // Check wall collision
            if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
                setGameOver(true);
                return prevSnake;
            }

            // Check self collision
            if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
                setGameOver(true);
                return prevSnake;
            }

            newSnake.unshift(head);

            // Check food collision
            if (head.x === food.x && head.y === food.y) {
                setScore(prev => prev + 10);
                setFood(generateFood());
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [direction, food, gameStarted, gameOver, generateFood]);

    // Handle keyboard input
    const handleKeyPress = useCallback((e) => {
        if (!gameStarted) {
            setGameStarted(true);
            return;
        }

        switch (e.key) {
            case 'ArrowUp':
                if (direction.y === 0) setDirection({ x: 0, y: -1 });
                break;
            case 'ArrowDown':
                if (direction.y === 0) setDirection({ x: 0, y: 1 });
                break;
            case 'ArrowLeft':
                if (direction.x === 0) setDirection({ x: -1, y: 0 });
                break;
            case 'ArrowRight':
                if (direction.x === 0) setDirection({ x: 1, y: 0 });
                break;
        }
    }, [direction, gameStarted]);

    // Dynamic speed based on score (faster as score increases)
    const getSpeedMs = () => {
        const base = 120; // faster base speed
        const bonus = Math.min(60, Math.floor(score / 30) * 10); // up to 60ms faster
        return Math.max(60, base - bonus);
    };

    // Game loop
    useEffect(() => {
        const interval = setInterval(moveSnake, getSpeedMs());
        return () => clearInterval(interval);
    }, [moveSnake, score]);

    // Event listeners
    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    // Update high score
    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
        }
    }, [score, highScore]);

    // Reset game
    const resetGame = () => {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setFood(INITIAL_FOOD);
        setGameOver(false);
        setScore(0);
        setGameStarted(false);
    };

    // Render game board
    const renderBoard = () => {
        const board = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                const isSnake = snake.some(segment => segment.x === x && segment.y === y);
                const isFood = food.x === x && food.y === y;
                const isHead = snake[0] && snake[0].x === x && snake[0].y === y;

                board.push(
                    <div
                        key={`${x}-${y}`}
                        className={`w-5 h-5 border border-gray-200 flex items-center justify-center ${
                            isHead ? 'bg-green-600' :
                            isSnake ? 'bg-green-500' :
                            isFood ? 'bg-white' : 'bg-gray-100'
                        }`}
                    >
                        {isFood ? <span className="text-[10px]">🍎</span> : null}
                    </div>
                );
            }
        }
        return board;
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link
                            href="/games"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
                        >
                            ← Back to Games
                        </Link>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            🐍 Snake Game
                        </h1>
                        <p className="text-gray-600">
                            Use arrow keys to control the snake. Eat the red food to grow and increase your score!
                        </p>
                    </div>

                    {/* Game Stats */}
                    <div className="flex justify-center gap-8 mb-6">
                        <div className="bg-white rounded-lg px-6 py-3 shadow-md">
                            <div className="text-2xl font-bold text-green-600">{score}</div>
                            <div className="text-sm text-gray-600">Score</div>
                        </div>
                        <div className="bg-white rounded-lg px-6 py-3 shadow-md">
                            <div className="text-2xl font-bold text-purple-600">{highScore}</div>
                            <div className="text-sm text-gray-600">High Score</div>
                        </div>
                        <div className="bg-white rounded-lg px-6 py-3 shadow-md">
                            <div className="text-2xl font-bold text-blue-600">{snake.length}</div>
                            <div className="text-sm text-gray-600">Length</div>
                        </div>
                    </div>

                    {/* Game Board */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-gray-300">
                            <div 
                                className="grid gap-0"
                                style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
                            >
                                {renderBoard()}
                            </div>
                        </div>
                    </div>

                    {/* Game Controls */}
                    <div className="text-center">
                        {!gameStarted && !gameOver && (
                            <div className="space-y-4">
                                <div className="text-xl font-semibold text-gray-700">
                                    Press any arrow key to start!
                                </div>
                                <div className="text-sm text-gray-500">
                                    Use ↑ ↓ ← → keys to control the snake
                                </div>
                            </div>
                        )}

                        {gameOver && (
                            <div className="space-y-4">
                                <div className="text-2xl font-bold text-red-600">
                                    Game Over! 🎮
                                </div>
                                <div className="text-lg text-gray-700">
                                    Final Score: {score}
                                </div>
                                <button
                                    onClick={resetGame}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Play Again
                                </button>
                            </div>
                        )}

                        {gameStarted && !gameOver && (
                            <div className="text-sm text-gray-500">
                                Use arrow keys to control the snake
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">How to Play</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Controls:</h4>
                                <ul className="space-y-1">
                                    <li>• ↑ Arrow Up - Move up</li>
                                    <li>• ↓ Arrow Down - Move down</li>
                                    <li>• ← Arrow Left - Move left</li>
                                    <li>• → Arrow Right - Move right</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Objective:</h4>
                                <ul className="space-y-1">
                                    <li>• Eat red food to grow longer</li>
                                    <li>• Each food gives 10 points</li>
                                    <li>• Avoid hitting walls or yourself</li>
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
