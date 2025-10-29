import React, { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

// Monopoly Lite: 12 tiles small board, two players default, simple rent, pass GO +$200, jail tile skip 1 turn, no houses/trades.
const BOARD = [
    { name: 'GO', type: 'go' },
    { name: 'Mediterranean Ave', type: 'prop', price: 60, rent: 2 },
    { name: 'Community', type: 'community' },
    { name: 'Baltic Ave', type: 'prop', price: 60, rent: 4 },
    { name: 'Income Tax', type: 'tax', amount: 50 },
    { name: 'Reading RR', type: 'prop', price: 200, rent: 25 },
    { name: 'Jail', type: 'jail' },
    { name: 'St. Charles Place', type: 'prop', price: 140, rent: 10 },
    { name: 'Chance', type: 'chance' },
    { name: 'States Ave', type: 'prop', price: 140, rent: 10 },
    { name: 'Electric Company', type: 'prop', price: 150, rent: 12 },
    { name: 'Boardwalk', type: 'prop', price: 400, rent: 50 },
];

function rollDice() {
    const a = 1 + Math.floor(Math.random() * 6);
    const b = 1 + Math.floor(Math.random() * 6);
    return { a, b, total: a + b, isDouble: a === b };
}

export default function Monopoly() {
    const [playersCount, setPlayersCount] = useState(2);
    const [positions, setPositions] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
    const [cash, setCash] = useState({ 1: 1500, 2: 1500, 3: 1500, 4: 1500 });
    const [owned, setOwned] = useState({}); // tileIndex -> playerId
    const [current, setCurrent] = useState(1);
    const [skipTurn, setSkipTurn] = useState({});
    const [log, setLog] = useState([]);
    const [ended, setEnded] = useState(false);

    const nextPlayer = () => {
        setCurrent(prev => (prev % playersCount) + 1);
    };

    const appendLog = (entry) => setLog(prev => [entry, ...prev].slice(0, 50));

    const transact = (pid, delta) => {
        setCash(prev => ({ ...prev, [pid]: prev[pid] + delta }));
    };

    const move = (pid, steps) => {
        setPositions(prev => {
            let pos = prev[pid];
            let newPos = (pos + steps) % BOARD.length;
            if (pos + steps >= BOARD.length) {
                transact(pid, 200);
                appendLog(`Player ${pid} passed GO +$200`);
            }
            return { ...prev, [pid]: newPos };
        });
    };

    const handleTile = (pid, tileIndex) => {
        const tile = BOARD[tileIndex];
        if (tile.type === 'prop') {
            const owner = owned[tileIndex];
            if (!owner) {
                // try buy if affordable
                if (cash[pid] >= tile.price) {
                    setOwned(prev => ({ ...prev, [tileIndex]: pid }));
                    transact(pid, -tile.price);
                    appendLog(`Player ${pid} bought ${tile.name} for $${tile.price}`);
                }
            } else if (owner !== pid) {
                // pay rent
                const rent = tile.rent;
                transact(pid, -rent);
                transact(owner, rent);
                appendLog(`Player ${pid} paid $${rent} rent to Player ${owner}`);
            }
        } else if (tile.type === 'tax') {
            transact(pid, -tile.amount);
            appendLog(`Player ${pid} paid Tax $${tile.amount}`);
        } else if (tile.type === 'jail') {
            setSkipTurn(prev => ({ ...prev, [pid]: 1 }));
            appendLog(`Player ${pid} is in Jail (skip next turn)`);
        } else if (tile.type === 'chance' || tile.type === 'community') {
            const delta = Math.random() < 0.5 ? -50 : 50;
            transact(pid, delta);
            appendLog(`Player ${pid} ${delta > 0 ? 'received' : 'paid'} $${Math.abs(delta)} (${tile.type})`);
        }
        // bankruptcy check
        if (cash[pid] <= -200) {
            setEnded(true);
            appendLog(`Player ${pid} is bankrupt. Game over.`);
        }
    };

    const takeTurn = () => {
        if (ended) return;
        const pid = current;
        if (skipTurn[pid]) {
            setSkipTurn(prev => ({ ...prev, [pid]: 0 }));
            appendLog(`Player ${pid} skipped a turn`);
            nextPlayer();
            return;
        }
        const d = rollDice();
        appendLog(`Player ${pid} rolled ${d.a} + ${d.b} = ${d.total}`);
        move(pid, d.total);
        setTimeout(() => {
            const tileIndex = ((positions[pid] + d.total) % BOARD.length);
            handleTile(pid, tileIndex);
            // doubles: one extra turn
            if (d.isDouble) {
                appendLog(`Player ${pid} rolled doubles and goes again`);
            } else {
                nextPlayer();
            }
        }, 50);
    };

    const reset = () => {
        setPositions({ 1: 0, 2: 0, 3: 0, 4: 0 });
        setCash({ 1: 1500, 2: 1500, 3: 1500, 4: 1500 });
        setOwned({});
        setCurrent(1);
        setSkipTurn({});
        setLog([]);
        setEnded(false);
    };

    const leader = useMemo(() => {
        const ids = Array.from({ length: playersCount }, (_, i) => i + 1);
        return ids.sort((a, b) => cash[b] - cash[a])[0];
    }, [playersCount, cash]);

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <Link href="/games" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">← Back to Games</Link>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Monopoly Lite</h1>
                        <p className="text-gray-600">Local 2–4 players. Buy properties, pay rent, pass GO. First to bankrupt loses.</p>
                    </div>

                    <div className="flex justify-center mb-6">
                        <div className="inline-flex bg-white p-1 rounded-lg shadow-md">
                            {[2,3,4].map(n => (
                                <button key={n} onClick={() => { setPlayersCount(n); reset(); }}
                                    className={`px-4 py-2 rounded-md ${playersCount === n ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>{n} Players</button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* Board */}
                        <div className="bg-white rounded-2xl shadow p-4 border">
                            <div className="grid grid-cols-4 gap-2">
                                {BOARD.map((tile, idx) => (
                                    <div key={idx} className={`p-2 rounded border ${tile.type === 'prop' ? 'border-emerald-300' : 'border-gray-200'} bg-gray-50`}>
                                        <div className="text-xs text-gray-500">{idx}: {tile.type}</div>
                                        <div className="font-semibold text-sm">{tile.name}</div>
                                        {tile.type === 'prop' && (
                                            <div className="text-xs text-gray-600">${tile.price} / Rent ${tile.rent}</div>
                                        )}
                                        <div className="mt-2 flex gap-1">
                                            {Array.from({ length: playersCount }).map((_, i) => (
                                                <div key={`m-${i}`} className={`w-3 h-3 rounded-full ${positions[i+1] === idx ? 'bg-emerald-600' : 'bg-gray-300'}`} />
                                            ))}
                                        </div>
                                        {owned[idx] && <div className="text-[10px] mt-1">Owned by P{owned[idx]}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Players */}
                        <div className="space-y-4">
                            {Array.from({ length: playersCount }).map((_, i) => (
                                <div key={`p-${i+1}`} className={`bg-white rounded-xl shadow p-4 border ${current === (i+1) ? 'border-emerald-400' : 'border-gray-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold">Player {i+1} {leader === (i+1) && '👑'}</div>
                                        <div className="text-emerald-700 font-bold">${cash[i+1]}</div>
                                    </div>
                                    <div className="text-xs text-gray-600">Position: {positions[i+1]} — {BOARD[positions[i+1]].name}</div>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <button onClick={takeTurn} disabled={ended} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg">Roll Dice</button>
                                <button onClick={reset} className="bg-gray-800 hover:bg-black text-white font-semibold px-4 py-2 rounded-lg">Reset</button>
                            </div>
                        </div>

                        {/* Log */}
                        <div className="bg-white rounded-2xl shadow p-4 border">
                            <div className="font-bold mb-2">Activity</div>
                            <div className="space-y-2 max-h-96 overflow-auto">
                                {log.map((l, i) => (
                                    <div key={i} className="text-sm text-gray-700">• {l}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


