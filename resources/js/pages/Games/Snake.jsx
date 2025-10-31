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
    const [directionQueue, setDirectionQueue] = useState([]); // buffer to allow quick successive turns
    const [food, setFood] = useState(INITIAL_FOOD);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [highScore, setHighScore] = useState(0);
    const [tick, setTick] = useState(0); // animation tick for slither
    const [audioReady, setAudioReady] = useState(false);
    const audioRef = React.useRef(null);

    // Simple WebAudio synth for effects
    const initAudio = useCallback(() => {
        if (audioRef.current) return;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioRef.current = ctx;
        setAudioReady(true);
    }, []);

    const playBeep = useCallback((freq = 440, duration = 0.07, type = 'sine', gain = 0.04) => {
        const ctx = audioRef.current;
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.value = gain;
        osc.connect(g).connect(ctx.destination);
        const now = ctx.currentTime;
        osc.start(now);
        g.gain.setValueAtTime(gain, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.stop(now + duration + 0.02);
    }, []);

    const sfxEat = useCallback(() => {
        playBeep(660, 0.09, 'triangle', 0.06);
        setTimeout(() => playBeep(990, 0.08, 'triangle', 0.05), 60);
    }, [playBeep]);
    const sfxGameOver = useCallback(() => {
        playBeep(220, 0.14, 'sawtooth', 0.06);
        setTimeout(() => playBeep(196, 0.16, 'sawtooth', 0.05), 120);
    }, [playBeep]);
    const sfxTurn = useCallback(() => playBeep(520, 0.04, 'square', 0.025), [playBeep]);

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
            // Use next direction from queue if any
            let nextDir = direction;
            if (directionQueue.length) {
                nextDir = directionQueue[0];
                setDirectionQueue(q => q.slice(1));
                setDirection(nextDir);
            }
            
            head.x += nextDir.x;
            head.y += nextDir.y;

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
                sfxEat();
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
        setTick(t => t + 1);
    }, [direction, directionQueue.length, food, gameStarted, gameOver, generateFood, sfxEat]);

    // Handle keyboard input
    const handleKeyPress = useCallback((e) => {
        // Ignore auto-repeat to avoid spamming sounds and state updates
        if (e.repeat) return;
        // Prevent arrow keys from scrolling the page during game
        if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }
        if (!gameStarted) {
            setGameStarted(true);
            return;
        }
        const lastDir = directionQueue.length ? directionQueue[directionQueue.length - 1] : direction;
        let enqueued = false;
        const pushDir = (d) => {
            enqueued = true;
            setDirectionQueue(q => [...q, d]);
        };
        switch (e.key) {
            case 'ArrowUp':
                if (lastDir.y === 0) pushDir({ x: 0, y: -1 });
                break;
            case 'ArrowDown':
                if (lastDir.y === 0) pushDir({ x: 0, y: 1 });
                break;
            case 'ArrowLeft':
                if (lastDir.x === 0) pushDir({ x: -1, y: 0 });
                break;
            case 'ArrowRight':
                if (lastDir.x === 0) pushDir({ x: 1, y: 0 });
                break;
        }
        // Only play turn sound if a valid turn was actually enqueued
        if (enqueued && audioRef.current) sfxTurn();
    }, [direction, directionQueue, gameStarted, sfxTurn]);

    // Dynamic speed based on score (faster as score increases)
    const getSpeedMs = () => {
        const base = 110; // smooth base
        const bonus = Math.min(50, Math.floor(score / 30) * 10);
        return Math.max(55, base - bonus);
    };

    // Game loop
    useEffect(() => {
        const interval = setInterval(moveSnake, getSpeedMs());
        return () => clearInterval(interval);
    }, [moveSnake, score]);

    // Event listeners
    useEffect(() => {
        const onKeyDown = (e) => {
            if (!audioReady && ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
                initAudio();
            }
            handleKeyPress(e);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [handleKeyPress, audioReady, initAudio]);

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

    // Play game over sound
    useEffect(() => {
        if (gameOver && audioRef.current) sfxGameOver();
    }, [gameOver, sfxGameOver]);

    // Render game board (now as a relative container w/ absolutely positioned snake & food)
    const CELL_SIZE = 20; // px per board cell, adjust as needed

    const renderSnake = () => {
        return snake.map((segment, idx) => {
            const isHead = idx === 0;
            // Slither wobble per segment
            const amplitude = 2; // px wobble
            const phase = (tick + idx * 4) / 4;
            const wobble = Math.sin(phase) * amplitude;
            // Apply wobble perpendicular to current direction
            const translateX = direction.y !== 0 ? wobble : 0;
            const translateY = direction.x !== 0 ? wobble : 0;
            const rotate = direction.x === 1 ? 90 : direction.x === -1 ? -90 : direction.y === 1 ? 180 : 0;
            // Taper body size and color along the length
            const baseSize = CELL_SIZE - 2;
            const shrink = Math.min(6, idx); // shrink up to 6px for tail
            const segmentSize = isHead ? baseSize : Math.max(baseSize - shrink, CELL_SIZE - 10);
            const hue = 130 - Math.min(20, idx * 2);
            const bodyGradient = isHead
                ? `linear-gradient(135deg,hsl(${hue},55%,42%),hsl(${hue-12},55%,30%) 70%)`
                : `linear-gradient(135deg,hsl(${hue+8},60%,50%),hsl(${hue-4},60%,38%) 70%)`;
            return (
                <div
                    key={idx}
                    style={{
                        width: segmentSize,
                        height: segmentSize,
                        borderRadius: isHead ? '50%' : '40%',
                        background: bodyGradient,
                        boxShadow: isHead ? '0 0 10px 2px #98ecac66, inset 0 0 6px #00000022' : 'inset 0 0 3px #00000022',
                        position: 'absolute',
                        left: segment.x * CELL_SIZE + 2 + translateX + (baseSize - segmentSize) / 2,
                        top: segment.y * CELL_SIZE + 2 + translateY + (baseSize - segmentSize) / 2,
                        transition: 'left 60ms linear, top 60ms linear, transform 60ms linear',
                        zIndex: isHead ? 2 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isHead ? '2px solid #135f23' : '1px solid hsl(130,35%,32%)',
                        transform: isHead ? `rotate(${rotate}deg)` : undefined,
                    }}
                >
                    {/* Add eyes if head */}
                    {isHead && (
                        <div style={{display:'flex',gap:2, alignItems:'center'}}>
                            <div style={{width:3,height:3,borderRadius:'50%',background:'#111',marginRight:2,marginTop:3}}></div>
                            <div style={{width:3,height:3,borderRadius:'50%',background:'#111',marginLeft:2,marginTop:3}}></div>
                            {/* tongue flick */}
                            <div style={{position:'absolute', bottom:-4, width:0, height:0, borderLeft:'3px solid transparent', borderRight:'3px solid transparent', borderTop:'6px solid #e11d48', opacity: (tick % 12 < 3) ? 0.9 : 0, transform:'translateY(2px)'}} />
                        </div>
                    )}
                </div>
            );
        });
    };

    const renderFood = () => (
        <div
            style={{
                position: 'absolute',
                left: food.x * CELL_SIZE + 4,
                top: food.y * CELL_SIZE + 4,
                width: CELL_SIZE - 6,
                height: CELL_SIZE - 6,
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transformOrigin: 'center',
                animation: 'foodPulse 1.2s ease-in-out infinite',
            }}
        >
            {/* stylized apple */}
            <div style={{position:'relative', width:'100%', height:'100%'}}>
                <div style={{width:'100%', height:'100%', background:'radial-gradient(circle at 30% 30%, #ff7373, #e11d48)', borderRadius:8, boxShadow:'inset 0 0 6px #00000033, 0 2px 4px #e11d4844'}} />
                <div style={{position:'absolute', top:-4, left:'45%', width:6, height:10, background:'#2f855a', borderRadius:'2px 2px 0 0', transform:'rotate(-15deg)'}} />
                <div style={{position:'absolute', top:-2, left:'35%', width:10, height:6, background:'#2f855a', borderRadius:'50% 50% 0 50%', transform:'rotate(20deg)'}} />
            </div>
        </div>
    );

    return (
        <AppLayout>
            <div className="min-h-screen py-8" style={{
                background: 'radial-gradient(1200px 600px at 50% -10%, #eafff3 10%, #d9f7e6 35%, #c4f1da 60%, #b3eacd 100%)'
            }}>
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
                        <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-gray-200">
                            <div
                                style={{
                                    position: 'relative',
                                    width: CELL_SIZE * BOARD_SIZE,
                                    height: CELL_SIZE * BOARD_SIZE,
                                    background:
                                        'repeating-linear-gradient(90deg, rgba(20,110,60,0.06) 0 1px, transparent 1px 20px),'+
                                        'repeating-linear-gradient(180deg, rgba(20,110,60,0.06) 0 1px, transparent 1px 20px),'+
                                        'linear-gradient(180deg, #ffffff, #f9fefb)',
                                    overflow: 'hidden',
                                    borderRadius: 16,
                                    border: '2px solid #d1d5db',
                                    boxShadow: '0 6px 24px #20964a18, inset 0 0 40px #0f51321a',
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
            {/* animations */}
            <style>{`
              @keyframes foodPulse { 0%, 100% { transform: scale(0.95); } 50% { transform: scale(1.05); } }
            `}</style>
        </AppLayout>
    );
}
