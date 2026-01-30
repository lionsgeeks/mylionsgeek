import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TETROMINOS = {
    I: {
        shape: [[1, 1, 1, 1]],
        color: '#00f5ff',
    },
    O: {
        shape: [
            [1, 1],
            [1, 1],
        ],
        color: '#ffff00',
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
        ],
        color: '#a000f0',
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
        ],
        color: '#00f000',
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
        ],
        color: '#f00000',
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
        ],
        color: '#0000f0',
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
        ],
        color: '#ff7f00',
    },
};

const TETROMINO_KEYS = Object.keys(TETROMINOS);

export default function TetrisGame() {
    const [board, setBoard] = useState(() =>
        Array(BOARD_HEIGHT)
            .fill()
            .map(() => Array(BOARD_WIDTH).fill(0)),
    );
    const [currentPiece, setCurrentPiece] = useState(null);
    const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
    const [score, setScore] = useState(0);
    const [lines, setLines] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [dropTime, setDropTime] = useState(600); // was 1000, now 600ms for faster speed

    // Create random piece
    const createPiece = () => {
        const randomKey = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
        const tetromino = TETROMINOS[randomKey];
        return {
            shape: tetromino.shape,
            color: tetromino.color,
            x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
            y: 0,
        };
    };

    // Check collision
    const checkCollision = (piece, position, board) => {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = position.x + x;
                    const newY = position.y + y;

                    if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                        return true;
                    }

                    if (newY >= 0 && board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    // Place piece on board
    const placePiece = (piece, position, board) => {
        const newBoard = board.map((row) => [...row]);

        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = position.x + x;
                    const newY = position.y + y;
                    if (newY >= 0) {
                        newBoard[newY][newX] = piece.color;
                    }
                }
            }
        }

        return newBoard;
    };

    // Clear completed lines
    const clearLines = (board) => {
        const newBoard = board.filter((row) => row.some((cell) => cell === 0));
        const linesCleared = BOARD_HEIGHT - newBoard.length;

        while (newBoard.length < BOARD_HEIGHT) {
            newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        }

        return { board: newBoard, linesCleared };
    };

    // Move piece
    const movePiece = (dx, dy) => {
        if (!currentPiece || gameOver) return;

        const newPosition = {
            x: currentPosition.x + dx,
            y: currentPosition.y + dy,
        };

        if (!checkCollision(currentPiece, newPosition, board)) {
            setCurrentPosition(newPosition);
        } else if (dy > 0) {
            // Piece has landed
            const newBoard = placePiece(currentPiece, currentPosition, board);
            const { board: clearedBoard, linesCleared } = clearLines(newBoard);

            setBoard(clearedBoard);
            setLines((prev) => prev + linesCleared);
            setScore((prev) => prev + linesCleared * 100 * level);

            // Check for new piece
            const newPiece = createPiece();
            if (checkCollision(newPiece, { x: newPiece.x, y: newPiece.y }, clearedBoard)) {
                setGameOver(true);
                setGameStarted(false);
            } else {
                setCurrentPiece(newPiece);
                setCurrentPosition({ x: newPiece.x, y: newPiece.y });
            }
        }
    };

    // Rotate piece
    const rotatePiece = () => {
        if (!currentPiece || gameOver) return;

        const rotated = {
            ...currentPiece,
            shape: currentPiece.shape[0].map((_, index) => currentPiece.shape.map((row) => row[index]).reverse()),
        };

        if (!checkCollision(rotated, currentPosition, board)) {
            setCurrentPiece(rotated);
        }
    };

    // Handle keyboard input
    const handleKeyPress = useCallback(
        (e) => {
            // Prevent arrow key scrolling
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
            if (!gameStarted || gameOver) return;

            switch (e.key) {
                case 'ArrowLeft':
                    movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    rotatePiece();
                    break;
                case ' ':
                    e.preventDefault();
                    // Hard drop
                    while (!checkCollision(currentPiece, { x: currentPosition.x, y: currentPosition.y + 1 }, board)) {
                        movePiece(0, 1);
                    }
                    break;
            }
        },
        [currentPiece, currentPosition, board, gameStarted, gameOver],
    );

    // Game loop
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const interval = setInterval(() => {
            movePiece(0, 1);
        }, dropTime);

        return () => clearInterval(interval);
    }, [gameStarted, gameOver, dropTime, currentPiece, currentPosition, board]);

    // Event listeners
    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    // Update level
    useEffect(() => {
        const newLevel = Math.floor(lines / 10) + 1;
        setLevel(newLevel);
        setDropTime(Math.max(100, 1000 - (newLevel - 1) * 100));
    }, [lines]);

    // Start game
    const startGame = () => {
        setBoard(
            Array(BOARD_HEIGHT)
                .fill()
                .map(() => Array(BOARD_WIDTH).fill(0)),
        );
        setCurrentPiece(createPiece());
        setCurrentPosition({ x: 4, y: 0 });
        setScore(0);
        setLines(0);
        setLevel(1);
        setGameOver(false);
        setGameStarted(true);
        setDropTime(600); // was 1000, now 600ms for faster initial speed
    };

    // Render board
    const renderBoard = () => {
        const displayBoard = board.map((row) => [...row]);

        // Add current piece to display
        if (currentPiece) {
            for (let y = 0; y < currentPiece.shape.length; y++) {
                for (let x = 0; x < currentPiece.shape[y].length; x++) {
                    if (currentPiece.shape[y][x]) {
                        const newX = currentPosition.x + x;
                        const newY = currentPosition.y + y;
                        if (newY >= 0 && newY < BOARD_HEIGHT && newX >= 0 && newX < BOARD_WIDTH) {
                            displayBoard[newY][newX] = currentPiece.color;
                        }
                    }
                }
            }
        }

        return displayBoard.map((row, y) =>
            row.map((cell, x) => <div key={`${y}-${x}`} className="h-6 w-6 border border-gray-300" style={{ backgroundColor: cell || '#f0f0f0' }} />),
        );
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <Link href="/games" className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                            ← Back to Games
                        </Link>
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">🧩 Tetris</h1>
                        <p className="text-gray-600">Stack falling blocks and clear lines to score points!</p>
                    </div>

                    <div className="flex justify-center gap-8">
                        {/* Game Board */}
                        <div className="rounded-2xl border-4 border-gray-300 bg-white p-4 shadow-lg">
                            <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)` }}>
                                {renderBoard()}
                            </div>
                        </div>

                        {/* Game Info */}
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="rounded-lg bg-white p-6 shadow-md">
                                <h3 className="mb-4 text-lg font-bold text-gray-900">Stats</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-2xl font-bold text-orange-600">{score}</div>
                                        <div className="text-sm text-gray-600">Score</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">{lines}</div>
                                        <div className="text-sm text-gray-600">Lines</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-purple-600">{level}</div>
                                        <div className="text-sm text-gray-600">Level</div>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="rounded-lg bg-white p-6 shadow-md">
                                <h3 className="mb-4 text-lg font-bold text-gray-900">Controls</h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <div>← → Move left/right</div>
                                    <div>↓ Soft drop</div>
                                    <div>↑ Rotate</div>
                                    <div>Space Hard drop</div>
                                </div>
                            </div>

                            {/* Game Status */}
                            <div className="text-center">
                                {!gameStarted && !gameOver && (
                                    <button
                                        onClick={startGame}
                                        className="rounded-lg bg-orange-600 px-6 py-3 font-bold text-white transition-colors hover:bg-orange-700"
                                    >
                                        Start Game
                                    </button>
                                )}

                                {gameOver && (
                                    <div className="space-y-4">
                                        <div className="text-xl font-bold text-red-600">Game Over! 🎮</div>
                                        <div className="text-lg text-gray-700">Final Score: {score}</div>
                                        <button
                                            onClick={startGame}
                                            className="rounded-lg bg-orange-600 px-6 py-3 font-bold text-white transition-colors hover:bg-orange-700"
                                        >
                                            Play Again
                                        </button>
                                    </div>
                                )}

                                {gameStarted && !gameOver && <div className="text-sm text-gray-500">Game in progress...</div>}
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                        <h3 className="mb-4 text-xl font-bold text-gray-900">How to Play</h3>
                        <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
                            <div>
                                <h4 className="mb-2 font-semibold text-gray-800">Objective:</h4>
                                <ul className="space-y-1">
                                    <li>• Stack falling blocks to create lines</li>
                                    <li>• Complete horizontal lines to clear them</li>
                                    <li>• Score points for each line cleared</li>
                                    <li>• Don't let blocks reach the top!</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-2 font-semibold text-gray-800">Scoring:</h4>
                                <ul className="space-y-1">
                                    <li>• 1 line: 100 × level points</li>
                                    <li>• 2 lines: 300 × level points</li>
                                    <li>• 3 lines: 500 × level points</li>
                                    <li>• 4 lines: 800 × level points</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
