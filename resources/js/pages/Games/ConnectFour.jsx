import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

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
        const newBoard = board.map(row => [...row]);
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!newBoard[r][col]) {
                newBoard[r][col] = currentPlayer;
                const w = checkWin(newBoard);
                const full = newBoard.every(row => row.every(cell => cell));
                setBoard(newBoard);
                setWinner(w);
                setIsFull(full);
                if (!w) setCurrentPlayer(prev => (prev === '🔵' ? '🟡' : '🔵'));
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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <Link href="/games" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">← Back to Games</Link>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">🟡 Connect Four</h1>
                        <p className="text-gray-600">Two players. Connect four in a row to win.</p>
                    </div>

                    <div className="text-center mb-4">
                        {!winner && !isFull && (
                            <div className="text-xl font-semibold">Turn: <span>{currentPlayer}</span></div>
                        )}
                        {winner && (
                            <div className="text-2xl font-bold text-green-600">🎉 {winner} wins!</div>
                        )}
                        {isFull && !winner && (
                            <div className="text-2xl font-bold text-gray-600">Tie game 🤝</div>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <div className="bg-blue-700 p-3 rounded-xl shadow-lg">
                            <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 56px)` }}>
                                {Array.from({ length: COLS }).map((_, c) => (
                                    <button key={`top-${c}`} onClick={() => dropDisc(c)} disabled={!!winner} className="h-8 mx-1 mb-2 rounded bg-blue-600 text-white text-xs hover:bg-blue-500">Drop</button>
                                ))}
                            </div>
                            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 56px)` }}>
                                {board.map((row, r) => row.map((cell, c) => (
                                    <div key={`${r}-${c}`} className="w-14 h-14 bg-blue-900 rounded-full flex items-center justify-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cell ? '' : 'bg-white'}`}>{cell}</div>
                                    </div>
                                )))}
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-6">
                        <button onClick={reset} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">New Game</button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


