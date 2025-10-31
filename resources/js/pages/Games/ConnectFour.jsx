import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { createRealtime, randomRoomId } from './realtime';

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
    // realtime
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const realtimeRef = React.useRef(null);

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
                if (isConnected) realtimeRef.current?.send({ type: 'drop', col });
                return;
            }
        }
    };

    const reset = () => {
        setBoard(createBoard());
        setCurrentPlayer('🔵');
        setWinner(null);
        setIsFull(false);
        if (isConnected) realtimeRef.current?.send({ type: 'reset' });
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

                    {/* Realtime room controls */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white rounded-lg p-3 shadow-md flex flex-col gap-2 w-full max-w-xl">
                            <div className="flex gap-2">
                                <input type="text" placeholder="Your name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="flex-1 border rounded px-3 py-2" />
                                <input type="text" placeholder="Room ID (e.g. c4-abc123)" value={roomId} onChange={(e) => setRoomId(e.target.value)} className="flex-1 border rounded px-3 py-2" />
                                <button onClick={() => setRoomId(prev => prev || randomRoomId('c4'))} className="px-3 py-2 rounded bg-gray-100 border">Generate</button>
                            </div>
                            <div className="flex gap-2">
                                {!isConnected ? (
                                    <button onClick={() => {
                                        if (!roomId || !playerName.trim()) return;
                                        realtimeRef.current?.leave?.();
                                        const rt = createRealtime(roomId, (msg) => {
                                            if (!msg || typeof msg !== 'object') return;
                                            switch (msg.type) {
                                                case 'hello':
                                                    rt.send({ type: 'snapshot', board, currentPlayer, winner, isFull });
                                                    break;
                                                case 'snapshot':
                                                    setBoard(msg.board);
                                                    setCurrentPlayer(msg.currentPlayer);
                                                    setWinner(msg.winner);
                                                    setIsFull(msg.isFull);
                                                    break;
                                                case 'drop':
                                                    // apply remote drop
                                                    const col = msg.col;
                                                    const nb = board.map(row => [...row]);
                                                    for (let r = ROWS - 1; r >= 0; r--) {
                                                        if (!nb[r][col]) {
                                                            nb[r][col] = currentPlayer;
                                                            const w2 = checkWin(nb);
                                                            const full2 = nb.every(row => row.every(cell => cell));
                                                            setBoard(nb);
                                                            setWinner(w2);
                                                            setIsFull(full2);
                                                            if (!w2) setCurrentPlayer(prev => (prev === '🔵' ? '🟡' : '🔵'));
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                case 'reset':
                                                    reset();
                                                    break;
                                            }
                                        });
                                        realtimeRef.current = rt;
                                        setIsConnected(true);
                                        rt.send({ type: 'hello', name: playerName });
                                    }} className="px-4 py-2 rounded bg-amber-700 text-white">Join Room</button>
                                ) : (
                                    <button onClick={() => { realtimeRef.current?.leave?.(); setIsConnected(false); }} className="px-4 py-2 rounded bg-gray-600 text-white">Leave Room</button>
                                )}
                                <button onClick={async () => { const url = new URL(window.location.href); if (roomId) url.searchParams.set('room', roomId); if (playerName) url.searchParams.set('name', playerName); const link = url.toString(); try { await navigator.clipboard.writeText(link); } catch {} alert('Invite link copied.'); }} className="px-4 py-2 rounded bg-gray-100 border">Copy Link</button>
                                {isConnected && (
                                    <div className="text-sm text-gray-600 self-center">Connected — Share Room ID with a friend</div>
                                )}
                            </div>
                        </div>
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


