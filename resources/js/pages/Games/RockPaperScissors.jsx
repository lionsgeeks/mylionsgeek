import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { createRealtime, randomRoomId } from './realtime';

const CHOICES = [
    { id: 'rock', label: '✊ Rock' },
    { id: 'paper', label: '✋ Paper' },
    { id: 'scissors', label: '✌️ Scissors' },
];

const beats = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper',
};

export default function RockPaperScissors() {
    const [rounds, setRounds] = useState(3);
    const [currentRound, setCurrentRound] = useState(1);
    const [p1Choice, setP1Choice] = useState(null);
    const [p2Choice, setP2Choice] = useState(null);
    const [scores, setScores] = useState({ p1: 0, p2: 0 });
    const [step, setStep] = useState('p1'); // p1 -> p2 -> reveal
    // realtime
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [assignedPlayer, setAssignedPlayer] = useState(null); // 'p1' | 'p2'
    const realtimeRef = React.useRef(null);
    const selfIdRef = React.useRef(() => Math.random().toString(36).slice(2));
    const selfId = React.useMemo(() => selfIdRef.current(), []);
    // Track processed picks to prevent duplicates
    const processedPicksRef = React.useRef(new Set());

    const resetMatch = () => {
        processedPicksRef.current.clear();
        setRoundDefaults();
        setScores({ p1: 0, p2: 0 });
        setCurrentRound(1);
        if (isConnected) realtimeRef.current?.send({ type: 'resetMatch', senderId: selfId });
    };

    const setRoundDefaults = () => {
        setP1Choice(null);
        setP2Choice(null);
        setStep('p1');
    };

    const nextRound = () => {
        if (currentRound < rounds) {
            processedPicksRef.current.clear();
            setCurrentRound(prev => prev + 1);
            setRoundDefaults();
            if (isConnected) realtimeRef.current?.send({ type: 'nextRound', senderId: selfId });
        }
    };

    const decideWinner = () => {
        if (!p1Choice || !p2Choice) return 'pending';
        if (p1Choice === p2Choice) return 'tie';
        return beats[p1Choice] === p2Choice ? 'p1' : 'p2';
    };

    const onPick = (player, choice) => {
        // If online and assigned player doesn't match, ignore
        if (isConnected && assignedPlayer && player !== assignedPlayer) {
            return;
        }

        const pickId = `${player}-${choice}-${Date.now()}`;

        if (player === 'p1') {
            // Broadcast BEFORE local update for immediate sync
            if (isConnected) {
                realtimeRef.current?.send({ 
                    type: 'pick', 
                    player, 
                    choice, 
                    senderId: selfId,
                    pickId 
                });
            }
            setP1Choice(choice);
            setStep('p2');
        } else if (player === 'p2') {
            // Use functional update to get latest p1Choice
            setP1Choice(currentP1 => {
                // Broadcast BEFORE local update for immediate sync
                if (isConnected) {
                    realtimeRef.current?.send({ 
                        type: 'pick', 
                        player, 
                        choice, 
                        senderId: selfId,
                        pickId,
                        p1Choice: currentP1 
                    });
                }
                
                setP2Choice(choice);
                setStep('reveal');
                
                if (currentP1) {
                    const winner = beats[choice] === currentP1 ? 'p1' : (beats[currentP1] === choice ? 'p2' : 'tie');
                    if (winner === 'p1') setScores(prev => ({ ...prev, p1: prev.p1 + 1 }));
                    if (winner === 'p2') setScores(prev => ({ ...prev, p2: prev.p2 + 1 }));
                }
                
                return currentP1;
            });
        }
    };

    // Build shareable link and auto-join via query params
    const buildInviteUrl = () => {
        const url = new URL(window.location.href);
        if (roomId) url.searchParams.set('room', roomId);
        if (playerName) url.searchParams.set('name', playerName);
        return url.toString();
    };

    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        const r = sp.get('room');
        const n = sp.get('name');
        if (r) setRoomId(r);
        if (n) setPlayerName(n);
        if (r && n && !isConnected) {
            // small delay to allow state to update inputs
            setTimeout(() => {
                const button = document.querySelector('[data-auto-join]');
                if (button) button.click();
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const matchOver = currentRound === rounds && step === 'reveal';
    const overallWinner = scores.p1 === scores.p2 ? 'tie' : (scores.p1 > scores.p2 ? 'p1' : 'p2');

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <Link href="/games" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">← Back to Games</Link>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">✊✋✌️ Rock Paper Scissors</h1>
                        <p className="text-gray-600">Two players. Best of rounds with pass-and-play or online multiplayer.</p>
                    </div>

                    {/* Realtime room controls */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white rounded-lg p-3 shadow-md flex flex-col gap-2 w-full max-w-xl">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Your name" 
                                    value={playerName} 
                                    onChange={(e) => setPlayerName(e.target.value)} 
                                    className="flex-1 border rounded px-3 py-2"
                                    disabled={isConnected}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Room ID (e.g. rps-abc123)" 
                                    value={roomId} 
                                    onChange={(e) => setRoomId(e.target.value)} 
                                    className="flex-1 border rounded px-3 py-2"
                                    disabled={isConnected}
                                />
                                <button 
                                    onClick={() => setRoomId(prev => prev || randomRoomId('rps'))} 
                                    className="px-3 py-2 rounded bg-gray-100 border hover:bg-gray-200"
                                    disabled={isConnected}
                                >Generate</button>
                            </div>
                            <div className="flex gap-2 items-center">
                                {!isConnected ? (
                                    <button 
                                        data-auto-join
                                        onClick={() => {
                                            if (!roomId || !playerName.trim()) return;
                                            realtimeRef.current?.leave?.();
                                            const rt = createRealtime(roomId, (msg) => {
                                                if (!msg || typeof msg !== 'object') return;
                                                switch (msg.type) {
                                                    case 'hello':
                                                        // Assign player based on ID comparison
                                                        if (msg.id) {
                                                            const player = selfId < msg.id ? 'p1' : 'p2';
                                                            setAssignedPlayer(player);
                                                        }
                                                        rt.send({ type: 'snapshot', rounds, currentRound, p1Choice, p2Choice, scores, step, senderId: selfId });
                                                        break;
                                                    case 'snapshot':
                                                        // Only sync state from other players
                                                        if (msg.senderId === selfId) return;
                                                        
                                                        // Assign player based on senderId
                                                        if (msg.senderId) {
                                                            const player = selfId < msg.senderId ? 'p1' : 'p2';
                                                            setAssignedPlayer(player);
                                                        }
                                                        processedPicksRef.current.clear(); // Clear processed picks on sync
                                                        setRounds(msg.rounds);
                                                        setCurrentRound(msg.currentRound);
                                                        setP1Choice(msg.p1Choice);
                                                        setP2Choice(msg.p2Choice);
                                                        setScores(msg.scores);
                                                        setStep(msg.step);
                                                        break;
                                                    case 'pick':
                                                        // Only apply remote moves (not our own)
                                                        if (msg.senderId === selfId) return;
                                                        
                                                        // Prevent duplicate picks
                                                        if (msg.pickId && processedPicksRef.current.has(msg.pickId)) return;
                                                        if (msg.pickId) processedPicksRef.current.add(msg.pickId);
                                                        
                                                        if (msg.player === 'p1') {
                                                            setP1Choice(msg.choice);
                                                            setStep('p2');
                                                        } else if (msg.player === 'p2') {
                                                            // Use functional update to get latest p1Choice
                                                            setP1Choice(currentP1 => {
                                                                const p1 = currentP1 || msg.p1Choice;
                                                                setP2Choice(msg.choice);
                                                                setStep('reveal');
                                                                // Calculate and update score immediately
                                                                if (p1) {
                                                                    const winner = beats[msg.choice] === p1 ? 'p1' : (beats[p1] === msg.choice ? 'p2' : 'tie');
                                                                    if (winner === 'p1') {
                                                                        setScores(prev => ({ ...prev, p1: prev.p1 + 1 }));
                                                                    } else if (winner === 'p2') {
                                                                        setScores(prev => ({ ...prev, p2: prev.p2 + 1 }));
                                                                    }
                                                                }
                                                                return currentP1;
                                                            });
                                                        }
                                                        break;
                                                    case 'nextRound':
                                                        // Only apply remote resets (not our own)
                                                        if (msg.senderId !== selfId) {
                                                            nextRound();
                                                        }
                                                        break;
                                                    case 'resetMatch':
                                                        // Only apply remote resets (not our own)
                                                        if (msg.senderId !== selfId) {
                                                            resetMatch();
                                                        }
                                                        break;
                                                }
                                            });
                                            realtimeRef.current = rt;
                                            setIsConnected(true);
                                            // Tentative assignment (will be confirmed by peer's hello)
                                            setAssignedPlayer('p1');
                                            rt.send({ type: 'hello', name: playerName, id: selfId });
                                        }} 
                                        className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-400"
                                        disabled={!roomId || !playerName.trim()}
                                    >Join Room</button>
                                ) : (
                                    <button 
                                        onClick={() => { 
                                            realtimeRef.current?.leave?.(); 
                                            setIsConnected(false); 
                                            setAssignedPlayer(null);
                                            setRoomId('');
                                            setPlayerName('');
                                            resetMatch();
                                        }} 
                                        className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                                    >Leave Room</button>
                                )}
                                <button 
                                    onClick={async () => { 
                                        const link = buildInviteUrl();
                                        try { 
                                            await navigator.clipboard.writeText(link); 
                                        } catch {} 
                                        //alert('Invite link copied.'); 
                                    }} 
                                    className="px-4 py-2 rounded bg-gray-100 border hover:bg-gray-200"
                                    disabled={!roomId || !playerName.trim()}
                                >Copy Link</button>
                                {isConnected && (
                                    <div className="text-sm text-gray-600 self-center">
                                        Connected as <strong>{assignedPlayer ?? '?'}</strong> — Share Room ID with a friend
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Rounds selector */}
                    <div className="flex justify-center mb-6 gap-3">
                        {[3, 5, 7].map(n => (
                            <button key={n} onClick={() => { setRounds(n); resetMatch(); }}
                                className={`px-4 py-2 rounded-md ${rounds === n ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border'}`}>Best of {n}</button>
                        ))}
                    </div>

                    {/* Scoreboard */}
                    <div className="flex justify-center gap-8 mb-6">
                        <div className={`bg-white rounded-lg shadow-md p-4 text-center ${isConnected && assignedPlayer === 'p1' ? 'ring-2 ring-blue-500' : ''}`}>
                            <div className="text-xl font-bold">
                                Player 1
                                {isConnected && assignedPlayer === 'p1' && <span className="text-xs text-blue-600 ml-1">(You)</span>}
                            </div>
                            <div className="text-3xl font-extrabold text-blue-600">{scores.p1}</div>
                        </div>
                        <div className={`bg-white rounded-lg shadow-md p-4 text-center ${isConnected && assignedPlayer === 'p2' ? 'ring-2 ring-rose-500' : ''}`}>
                            <div className="text-xl font-bold">
                                Player 2
                                {isConnected && assignedPlayer === 'p2' && <span className="text-xs text-rose-600 ml-1">(You)</span>}
                            </div>
                            <div className="text-3xl font-extrabold text-rose-600">{scores.p2}</div>
                        </div>
                    </div>

                    <div className="text-center mb-2 text-sm text-gray-600">Round {currentRound} of {rounds}</div>

                    {/* Step panels */}
                    {step === 'p1' && (
                        <div className="bg-white rounded-2xl shadow-lg p-6 border text-center">
                            <div className="font-semibold mb-3 flex items-center justify-center gap-2">
                                Player 1: Choose
                                {isConnected && assignedPlayer !== 'p1' ? (
                                    <span className="text-sm text-blue-600 ml-2 flex items-center gap-1">
                                        <span className="animate-bounce">⏳</span>
                                        Waiting for Player 1...
                                    </span>
                                ) : isConnected && assignedPlayer === 'p1' ? (
                                    <span className="text-sm text-green-600 ml-2 flex items-center gap-1">
                                        <span className="animate-pulse">●</span>
                                        Your turn
                                    </span>
                                ) : null}
                            </div>
                            <div className="flex justify-center gap-4">
                                {CHOICES.map(ch => (
                                    <button 
                                        key={ch.id} 
                                        onClick={() => onPick('p1', ch.id)} 
                                        disabled={isConnected && assignedPlayer !== 'p1'}
                                        className={`px-4 py-3 rounded-lg border transition-all duration-200 hover:bg-gray-50 hover:scale-105 active:scale-95 ${isConnected && assignedPlayer !== 'p1' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        {ch.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'p2' && (
                        <div className="bg-white rounded-2xl shadow-lg p-6 border text-center">
                            <div className="font-semibold mb-3 flex items-center justify-center gap-2">
                                Player 2: Choose
                                {isConnected && assignedPlayer !== 'p2' ? (
                                    <span className="text-sm text-blue-600 ml-2 flex items-center gap-1">
                                        <span className="animate-bounce">⏳</span>
                                        Waiting for Player 2...
                                    </span>
                                ) : isConnected && assignedPlayer === 'p2' ? (
                                    <span className="text-sm text-green-600 ml-2 flex items-center gap-1">
                                        <span className="animate-pulse">●</span>
                                        Your turn
                                    </span>
                                ) : null}
                            </div>
                            <div className="flex justify-center gap-4">
                                {CHOICES.map(ch => (
                                    <button 
                                        key={ch.id} 
                                        onClick={() => onPick('p2', ch.id)} 
                                        disabled={isConnected && assignedPlayer !== 'p2'}
                                        className={`px-4 py-3 rounded-lg border transition-all duration-200 hover:bg-gray-50 hover:scale-105 active:scale-95 ${isConnected && assignedPlayer !== 'p2' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        {ch.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'reveal' && (
                        <div className="bg-white rounded-2xl shadow-lg p-6 border text-center animate-in fade-in zoom-in duration-300">
                            <div className="mb-4">
                                <div className="text-lg animate-in slide-in-from-left duration-300">Player 1 picked: <strong className="text-blue-600">{p1Choice}</strong></div>
                                <div className="text-lg animate-in slide-in-from-right duration-300 delay-150">Player 2 picked: <strong className="text-rose-600">{p2Choice}</strong></div>
                            </div>
                            {(() => {
                                const w = decideWinner();
                                if (w === 'tie') return <div className="text-xl font-bold text-gray-700">Tie! 🤝</div>;
                                if (w === 'p1') return <div className="text-xl font-bold text-blue-700">Player 1 wins this round! 🎉</div>;
                                if (w === 'p2') return <div className="text-xl font-bold text-rose-700">Player 2 wins this round! 🎉</div>;
                                return null;
                            })()}

                            <div className="mt-6 flex justify-center gap-3">
                                {!matchOver && (
                                    <button onClick={nextRound} className="bg-gray-800 hover:bg-black text-white font-semibold px-5 py-2 rounded-lg">Next Round</button>
                                )}
                                {matchOver && (
                                    <button onClick={resetMatch} className="bg-gray-800 hover:bg-black text-white font-semibold px-5 py-2 rounded-lg">New Match</button>
                                )}
                            </div>

                            {matchOver && (
                                <div className="mt-4 text-lg">
                                    {overallWinner === 'tie' ? 'Match tied.' : (overallWinner === 'p1' ? 'Player 1 wins the match!' : 'Player 2 wins the match!')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}


