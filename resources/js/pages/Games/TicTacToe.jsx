import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
];

export default function TicTacToe() {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });
    const [gameMode, setGameMode] = useState('human'); // 'human' or 'computer'

    // Check for winner
    const checkWinner = (currentBoard) => {
        for (let combination of WINNING_COMBINATIONS) {
            const [a, b, c] = combination;
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return currentBoard[a];
            }
        }
        return null;
    };

    // Check if board is full
    const isBoardFull = (currentBoard) => {
        return currentBoard.every((cell) => cell !== null);
    };

    // Computer move (simple AI)
    const getComputerMove = (currentBoard) => {
        // Check for winning move
        for (let i = 0; i < 9; i++) {
            if (!currentBoard[i]) {
                const newBoard = [...currentBoard];
                newBoard[i] = 'O';
                if (checkWinner(newBoard)) {
                    return i;
                }
            }
        }

        // Check for blocking move
        for (let i = 0; i < 9; i++) {
            if (!currentBoard[i]) {
                const newBoard = [...currentBoard];
                newBoard[i] = 'X';
                if (checkWinner(newBoard)) {
                    return i;
                }
            }
        }

        // Prefer center
        if (!currentBoard[4]) return 4;

        // Prefer corners
        const corners = [0, 2, 6, 8];
        for (let corner of corners) {
            if (!currentBoard[corner]) return corner;
        }

        // Random move
        const availableMoves = currentBoard.map((cell, index) => (cell === null ? index : null)).filter((val) => val !== null);
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    };

    // Handle cell click
    const handleCellClick = (index) => {
        if (board[index] || gameOver) return;

        const newBoard = [...board];
        newBoard[index] = isXNext ? 'X' : 'O';
        setBoard(newBoard);

        const currentWinner = checkWinner(newBoard);
        if (currentWinner) {
            setWinner(currentWinner);
            setGameOver(true);
            setScores((prev) => ({
                ...prev,
                [currentWinner]: prev[currentWinner] + 1,
            }));
        } else if (isBoardFull(newBoard)) {
            setGameOver(true);
            setScores((prev) => ({
                ...prev,
                ties: prev.ties + 1,
            }));
        } else {
            setIsXNext(!isXNext);
        }
    };

    // Computer move effect
    useEffect(() => {
        if (gameMode === 'computer' && !isXNext && !gameOver && !winner) {
            const timer = setTimeout(() => {
                const computerMove = getComputerMove(board);
                if (computerMove !== undefined) {
                    handleCellClick(computerMove);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isXNext, gameMode, board, gameOver, winner]);

    // Reset game
    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
        setGameOver(false);
    };

    // Reset scores
    const resetScores = () => {
        setScores({ X: 0, O: 0, ties: 0 });
    };

    // Render cell
    const renderCell = (index) => {
        const value = board[index];
        const isWinningCell =
            winner && WINNING_COMBINATIONS.some((combination) => combination.includes(index) && combination.every((pos) => board[pos] === winner));

        return (
            <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={gameOver || value}
                className={`h-20 w-20 rounded-lg border-2 text-3xl font-bold transition-all duration-200 ${value === 'X' ? 'border-blue-300 bg-blue-50 text-blue-600' : ''} ${value === 'O' ? 'border-red-300 bg-red-50 text-red-600' : ''} ${!value && !gameOver ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50' : ''} ${isWinningCell ? 'border-yellow-400 bg-yellow-200 shadow-lg' : ''} ${gameOver ? 'cursor-not-allowed' : 'cursor-pointer'} `}
            >
                {value}
            </button>
        );
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <Link href="/games" className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                            ← Back to Games
                        </Link>
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">⭕ Tic Tac Toe</h1>
                        <p className="text-gray-600">Get three in a row to win! Play against a friend or the computer.</p>
                    </div>

                    {/* Game Mode Selection */}
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-lg bg-white p-1 shadow-md">
                            <button
                                onClick={() => {
                                    setGameMode('human');
                                    resetGame();
                                }}
                                className={`rounded-md px-4 py-2 transition-colors ${
                                    gameMode === 'human' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                👥 Two Players
                            </button>
                            <button
                                onClick={() => {
                                    setGameMode('computer');
                                    resetGame();
                                }}
                                className={`rounded-md px-4 py-2 transition-colors ${
                                    gameMode === 'computer' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                🤖 vs Computer
                            </button>
                        </div>
                    </div>

                    {/* Game Board */}
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-2xl border-4 border-gray-300 bg-white p-6 shadow-lg">
                            <div className="grid grid-cols-3 gap-2">
                                {Array(9)
                                    .fill(null)
                                    .map((_, index) => renderCell(index))}
                            </div>
                        </div>
                    </div>

                    {/* Game Status */}
                    <div className="mb-6 text-center">
                        {!gameOver && (
                            <div className="text-xl font-semibold text-gray-700">
                                {gameMode === 'computer'
                                    ? isXNext
                                        ? 'Your turn (X)'
                                        : "Computer's turn (O)"
                                    : `Player ${isXNext ? 'X' : 'O'}'s turn`}
                            </div>
                        )}

                        {winner && (
                            <div className="mb-4 text-2xl font-bold text-green-600">
                                {gameMode === 'computer' ? (winner === 'X' ? '🎉 You Win!' : '🤖 Computer Wins!') : `🎉 Player ${winner} Wins!`}
                            </div>
                        )}

                        {gameOver && !winner && <div className="mb-4 text-2xl font-bold text-gray-600">It's a tie! 🤝</div>}

                        {gameOver && (
                            <button
                                onClick={resetGame}
                                className="rounded-lg bg-blue-600 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-700"
                            >
                                Play Again
                            </button>
                        )}
                    </div>

                    {/* Score Board */}
                    <div className="mb-8 flex justify-center">
                        <div className="rounded-lg bg-white p-6 shadow-md">
                            <h3 className="mb-4 text-center text-lg font-bold text-gray-900">Score Board</h3>
                            <div className="flex gap-8">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{scores.X}</div>
                                    <div className="text-sm text-gray-600">Player X</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-600">{scores.ties}</div>
                                    <div className="text-sm text-gray-600">Ties</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{scores.O}</div>
                                    <div className="text-sm text-gray-600">Player O</div>
                                </div>
                            </div>
                            <button
                                onClick={resetScores}
                                className="mt-4 w-full rounded-lg bg-gray-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-600"
                            >
                                Reset Scores
                            </button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                        <h3 className="mb-4 text-xl font-bold text-gray-900">How to Play</h3>
                        <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
                            <div>
                                <h4 className="mb-2 font-semibold text-gray-800">Objective:</h4>
                                <ul className="space-y-1">
                                    <li>• Get three of your symbols in a row</li>
                                    <li>• Rows, columns, or diagonals count</li>
                                    <li>• Block your opponent from winning</li>
                                    <li>• First to three wins the game!</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-2 font-semibold text-gray-800">Game Modes:</h4>
                                <ul className="space-y-1">
                                    <li>
                                        • <strong>Two Players:</strong> Take turns with a friend
                                    </li>
                                    <li>
                                        • <strong>vs Computer:</strong> Play against AI
                                    </li>
                                    <li>• Computer uses smart strategy</li>
                                    <li>• Try to beat the computer!</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
