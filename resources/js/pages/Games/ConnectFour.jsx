import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

const ROWS = 6;
const COLS = 7;

function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export default function ConnectFour() {
    const [board, setBoard] = useState(createBoard());
    const [currentPlayer, setCurrentPlayer] = useState('🔵');
    const [winner, setWinner] = useState(null);
    const [isFull, setIsFull] = useState(false);

    const checkDirection = (b, r, c, dr, dc) => {
        const start = b[r]?.[c];
        if (!start) return false;
        for (let i = 1; i < 4; i++) {
            if (b[r + dr * i]?.[c + dc * i] !== start) return false;
        }
        return true;
    };

    const checkWin = (b) => {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (
                    checkDirection(b, r, c, 0, 1) ||
                    checkDirection(b, r, c, 1, 0) ||
                    checkDirection(b, r, c, 1, 1) ||
                    checkDirection(b, r, c, 1, -1)
                ) {
                    return b[r][c];
                }
            }
        }
        return null;
    };

    const dropDisc = (col) => {
        if (winner) return;
        const newBoard = board.map((row) => [...row]);
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!newBoard[r][col]) {
                newBoard[r][col] = currentPlayer;
                const w = checkWin(newBoard);
                const full = newBoard.every((row) => row.every((cell) => cell));
                setBoard(newBoard);
                setWinner(w);
                setIsFull(full);
                if (!w) setCurrentPlayer((prev) => (prev === '🔵' ? '🟡' : '🔵'));
                return;
            }
        }
    };

    const reset = () => {
        setBoard(createBoard());
        setCurrentPlayer('🔵');
        setWinner(null);
        setIsFull(false);
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <Link href="/games" className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                            ← Back to Games
                        </Link>
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">🟡 Connect Four</h1>
                        <p className="text-gray-600">Two players. Connect four in a row to win.</p>
                    </div>

                    <div className="mb-4 text-center">
                        {!winner && !isFull && (
                            <div className="text-xl font-semibold">
                                Turn: <span>{currentPlayer}</span>
                            </div>
                        )}
                        {winner && <div className="text-2xl font-bold text-green-600">🎉 {winner} wins!</div>}
                        {isFull && !winner && <div className="text-2xl font-bold text-gray-600">Tie game 🤝</div>}
                    </div>

                    <div className="flex justify-center">
                        <div className="rounded-xl bg-blue-700 p-3 shadow-lg">
                            <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 56px)` }}>
                                {Array.from({ length: COLS }).map((_, c) => (
                                    <button
                                        key={`top-${c}`}
                                        onClick={() => dropDisc(c)}
                                        disabled={!!winner}
                                        className="mx-1 mb-2 h-8 rounded bg-blue-600 text-xs text-white hover:bg-blue-500"
                                    >
                                        Drop
                                    </button>
                                ))}
                            </div>
                            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 56px)` }}>
                                {board.map((row, r) =>
                                    row.map((cell, c) => (
                                        <div key={`${r}-${c}`} className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-900">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${cell ? '' : 'bg-white'}`}>
                                                {cell}
                                            </div>
                                        </div>
                                    )),
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={reset}
                            className="rounded-lg bg-amber-600 px-6 py-2 font-bold text-white transition-colors hover:bg-amber-700"
                        >
                            New Game
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
