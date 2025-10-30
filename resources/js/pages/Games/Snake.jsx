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
        // Prevent arrow keys from scrolling the page during game
        if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }
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

    // Render game board (now as a relative container w/ absolutely positioned snake & food)
    const CELL_SIZE = 20; // px per board cell, adjust as needed

    const renderSnake = () => {
        return snake.map((segment, idx) => {
            const isHead = idx === 0;
            return (
                <div
                    key={idx}
                    style={{
                        width: CELL_SIZE - 2,
                        height: CELL_SIZE - 2,
                        borderRadius: isHead ? '50%' : '40%',
                        background: isHead ? 'linear-gradient(135deg,#39b54a,#226d3e 70%)' : 'linear-gradient(135deg,#5ae36d,#22962f 70%)',
                        boxShadow: isHead ? '0 0 8px 2px #98ecac80' : 'none',
                        position: 'absolute',
                        left: segment.x * CELL_SIZE + 2,
                        top: segment.y * CELL_SIZE + 2,
                        transition: 'left 80ms linear, top 80ms linear',
                        zIndex: isHead ? 2 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isHead ? '2px solid #135f23' : '1px solid #219f4d',
                    }}
                >
                    {/* Add eyes if head */}
                    {isHead && (
                        <div style={{display:'flex',gap:2}}>
                            <div style={{width:3,height:3,borderRadius:'50%',background:'#222',marginRight:2,marginTop:3}}></div>
                            <div style={{width:3,height:3,borderRadius:'50%',background:'#222',marginLeft:2,marginTop:3}}></div>
                        </div>
                    )}
                </div>
            );
        });
    };

    const renderFood = () => (
        <div
            style={{
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
                position: 'absolute',
                left: food.x * CELL_SIZE + 4,
                top: food.y * CELL_SIZE + 4,
                zIndex: 3,
                display: 'flex',
                alignItems:'center',
                justifyContent:'center'
            }}
        >
            <span role="img" aria-label="food" style={{fontSize:12}}>🍎</span>
        </div>
    );

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
                                style={{
                                    position: 'relative',
                                    width: CELL_SIZE * BOARD_SIZE,
                                    height: CELL_SIZE * BOARD_SIZE,
                                    background: 'repeating-linear-gradient(90deg,#f8fafc 0 1px,transparent 1px 20px), repeating-linear-gradient(180deg,#f8fafc 0 1px,transparent 1px 20px)',
                                    overflow: 'hidden',
                                    borderRadius: 16,
                                    border: '2px solid #d1d5db',
                                    boxShadow: '0 4px 20px #20964a12',
                                }}
                            >
                                {renderSnake()}
                                {renderFood()}
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
