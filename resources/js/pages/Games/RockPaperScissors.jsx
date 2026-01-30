import useAblyChannelGames from '@/hooks/useAblyChannelGames';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

function randomRoomId(prefix = 'rps') {
    const rnd = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${rnd}`;
}

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
    // Online multiplayer state
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [assignedPlayer, setAssignedPlayer] = useState(null); // 'p1' | 'p2'
    const lastStateHashRef = useRef(null);

    // Ably channel for real-time game updates
    const gameChannelName = roomId ? `game:${roomId}` : 'game:placeholder';
    const { isConnected: ablyConnected, subscribe } = useAblyChannelGames(gameChannelName, ['game-state-updated', 'game-reset'], {
        onConnected: () => {
            //console.log('✅ Ably connected for game room:', roomId);
        },
        onError: (error) => {
            console.error('❌ Ably connection error:', error);
        },
    });

    // Reset match - Database + Ably flow
    const resetMatch = () => {
        setRoundDefaults();
        setScores({ p1: 0, p2: 0 });
        setCurrentRound(1);

        // POST reset to server - server saves to database and broadcasts via Ably
        if (isConnected && roomId) {
            const newState = {
                rounds: 3,
                currentRound: 1,
                p1Choice: null,
                p2Choice: null,
                scores: { p1: 0, p2: 0 },
                step: 'p1',
                // Note: players array is preserved by server's updateState merge
            };

            axios
                .post(`/api/games/reset/${roomId}`, {
                    game_type: 'rockpaperscissors',
                    initial_state: newState,
                })
                .catch((err) => {
                    console.error('Failed to reset game:', err);
                });
        }
    };

    const setRoundDefaults = () => {
        setP1Choice(null);
        setP2Choice(null);
        setStep('p1');
    };

    const nextRound = async () => {
        if (currentRound < rounds) {
            const newRound = currentRound + 1;
            setCurrentRound(newRound);
            setRoundDefaults();

            // POST to server - server saves to database and broadcasts via Ably
            if (isConnected && roomId) {
                const gameState = {
                    rounds,
                    currentRound: newRound,
                    p1Choice: null,
                    p2Choice: null,
                    scores,
                    step: 'p1',
                    // Note: players array is preserved by server's updateState method
                };

                try {
                    await axios.post(`/api/games/state/${roomId}`, {
                        game_type: 'rockpaperscissors',
                        game_state: gameState,
                    });
                } catch (error) {
                    console.error('Failed to update game state:', error);
                }
            }
        }
    };

    const decideWinner = () => {
        if (!p1Choice || !p2Choice) return 'pending';
        if (p1Choice === p2Choice) return 'tie';
        return beats[p1Choice] === p2Choice ? 'p1' : 'p2';
    };

    // Handle pick with online support - Database + Ably flow
    const onPick = async (player, choice) => {
        // In online mode, strictly enforce assigned role. If role is unknown yet, block moves.
        if (isConnected) {
            if (!assignedPlayer || player !== assignedPlayer) {
                return; // Not your turn or role not assigned yet
            }
        }

        let newP1Choice = p1Choice;
        let newP2Choice = p2Choice;
        let newStep = step;
        let newScores = { ...scores };

        if (player === 'p1') {
            newP1Choice = choice;
            newStep = 'p2';
        } else if (player === 'p2') {
            newP2Choice = choice;
            newStep = 'reveal';

            if (p1Choice) {
                const winner = beats[choice] === p1Choice ? 'p1' : beats[p1Choice] === choice ? 'p2' : 'tie';
                if (winner === 'p1') newScores.p1 = scores.p1 + 1;
                if (winner === 'p2') newScores.p2 = scores.p2 + 1;
            }
        }

        // Optimistic update for better UX (will be confirmed by Ably)
        setP1Choice(newP1Choice);
        setP2Choice(newP2Choice);
        setStep(newStep);
        setScores(newScores);

        // POST move to server - server saves to database and broadcasts via Ably IMMEDIATELY
        if (isConnected && roomId) {
            // Prepare state to send - server will preserve players array
            const currentState = {
                rounds,
                currentRound,
                p1Choice: newP1Choice,
                p2Choice: newP2Choice,
                scores: newScores,
                step: newStep,
                // Note: players array is preserved by server's updateState method
            };

            try {
                //console.log('📤 Sending pick to server - Room:', roomId, 'Player:', playerName, 'Player:', player);
                // Save to database and broadcast via Ably
                // Server will:
                // 1. Save to database (preserving players array)
                // 2. Broadcast to ALL players via Ably immediately
                const response = await axios.post(`/api/games/state/${roomId}`, {
                    game_type: 'rockpaperscissors',
                    game_state: currentState,
                });

                //console.log('✅ Pick saved! Server broadcasted to all players via Ably');
                //console.log('📡 Other player should receive update NOW via Ably subscription');
            } catch (error) {
                console.error('❌ Failed to save pick:', error);
                // Revert optimistic update on error
                setP1Choice(p1Choice);
                setP2Choice(p2Choice);
                setStep(step);
                setScores(scores);
            }
        }
    };

    // Update game state from received data
    const updateGameStateFromData = React.useCallback(
        (state) => {
            if (!state) return;

            const stateHash = JSON.stringify(state);

            // Only update if state changed
            if (stateHash !== lastStateHashRef.current) {
                lastStateHashRef.current = stateHash;

                // Update all state from server
                if (state.rounds !== undefined) setRounds(state.rounds);
                if (state.currentRound !== undefined) setCurrentRound(state.currentRound);
                if (state.p1Choice !== undefined) setP1Choice(state.p1Choice);
                if (state.p2Choice !== undefined) setP2Choice(state.p2Choice);
                if (state.scores) setScores(state.scores);
                if (state.step) setStep(state.step);

                // Assign player based on stored player for this player name
                if (state.players && state.players.length > 0) {
                    const playerIndex = state.players.findIndex((p) => p.name === playerName);
                    if (playerIndex >= 0) {
                        const player = state.players[playerIndex]?.player;
                        if (player === 'p1' || player === 'p2') {
                            setAssignedPlayer(player);
                        }
                    } else {
                        // If name not found:
                        // - Keep current role if already assigned (never flip)
                        // - If no role yet and there is exactly 1 player, infer the opposite
                        // - If 0 or 2+ players, do not guess; wait for explicit assignment
                        if (!assignedPlayer && state.players.length === 1) {
                            const onlyPlayer = state.players[0]?.player;
                            if (onlyPlayer === 'p1' || onlyPlayer === 'p2') {
                                setAssignedPlayer(onlyPlayer === 'p1' ? 'p2' : 'p1');
                            }
                        }
                    }
                }
            }
        },
        [playerName, assignedPlayer],
    );

    // Fetch initial game state
    const fetchInitialGameState = React.useCallback(async () => {
        if (!isConnected || !roomId) return;

        try {
            const response = await axios.get(`/api/games/state/${roomId}`);
            if (response.data.exists && response.data.game_state) {
                updateGameStateFromData(response.data.game_state);
            }
        } catch (error) {
            console.error('Failed to fetch initial game state:', error);
        }
    }, [isConnected, roomId, updateGameStateFromData]);

    // Online multiplayer handlers
    const connectRoom = async () => {
        if (!roomId || !playerName.trim()) return;

        setIsConnected(true);

        try {
            // Try to get existing state first
            const existingState = await axios.get(`/api/games/state/${roomId}`);

            if (existingState.data.exists) {
                // Game already exists, sync with it
                const state = existingState.data.game_state;

                // Ensure a unique join name if needed
                let joinName = playerName;
                if (state.players && Array.isArray(state.players)) {
                    if (state.players.some((p) => p?.name === joinName)) {
                        // Create a unique variant of the name
                        let suffix = 2;
                        let candidate = `${joinName} (${suffix})`;
                        while (state.players.some((p) => p?.name === candidate)) {
                            candidate = `${joinName} (${suffix++})`;
                        }
                        joinName = candidate;
                        setPlayerName(joinName);
                    }
                }

                // Sync state
                if (state.rounds !== undefined) setRounds(state.rounds);
                if (state.currentRound !== undefined) setCurrentRound(state.currentRound);
                if (state.p1Choice !== undefined) setP1Choice(state.p1Choice);
                if (state.p2Choice !== undefined) setP2Choice(state.p2Choice);
                if (state.scores) setScores(state.scores);
                if (state.step) setStep(state.step);

                // Assign player
                let playerRole = null;
                if (state.players && state.players.length === 1) {
                    playerRole = state.players[0].player === 'p1' ? 'p2' : 'p1';
                    setAssignedPlayer(playerRole);
                    state.players.push({ name: joinName, player: playerRole });
                } else if (state.players && state.players.length > 0) {
                    const playerIndex = state.players.findIndex((p) => p.name === joinName);
                    if (playerIndex >= 0) {
                        // Player with same (possibly adjusted) name exists in state
                        playerRole = state.players[playerIndex].player;
                        setAssignedPlayer(playerRole);
                    } else {
                        playerRole = state.players[0].player === 'p1' ? 'p2' : 'p1';
                        setAssignedPlayer(playerRole);
                        state.players.push({ name: joinName, player: playerRole });
                    }
                }

                // Update server with new player
                await axios.post(`/api/games/state/${roomId}`, {
                    game_type: 'rockpaperscissors',
                    game_state: state,
                });
            } else {
                // Initialize new game
                const initialState = {
                    rounds: 3,
                    currentRound: 1,
                    p1Choice: null,
                    p2Choice: null,
                    scores: { p1: 0, p2: 0 },
                    step: 'p1',
                    players: [{ name: playerName, player: 'p1' }],
                };

                await axios.post(`/api/games/state/${roomId}`, {
                    game_type: 'rockpaperscissors',
                    game_state: initialState,
                });

                setAssignedPlayer('p1');
            }

            // Fetch initial state after connecting
            await fetchInitialGameState();
        } catch (error) {
            console.error('Failed to connect to room:', error);
            setIsConnected(false);
        }
    };

    // Fetch initial state when Ably connects and room is connected
    useEffect(() => {
        if (ablyConnected && isConnected && roomId) {
            fetchInitialGameState();
        }
    }, [ablyConnected, isConnected, roomId, fetchInitialGameState]);

    const disconnectRoom = () => {
        setIsConnected(false);
        setAssignedPlayer(null);
        setRoomId('');
        setPlayerName('');
        lastStateHashRef.current = null;
        resetMatch();
    };

    // Build shareable link and auto-join via query params
    const buildInviteUrl = () => {
        const url = new URL(window.location.href);
        if (roomId) url.searchParams.set('room', roomId);
        if (playerName) url.searchParams.set('name', playerName);
        return url.toString();
    };
    const inviteUrl = React.useMemo(() => (roomId && playerName ? buildInviteUrl() : ''), [roomId, playerName]);

    // Subscribe to Ably real-time game state updates - EXACTLY like TicTacToe
    // When Player 1 picks, Player 2 sees it IMMEDIATELY - NO REFRESH NEEDED
    // When Player 2 picks, Player 1 sees it IMMEDIATELY - NO REFRESH NEEDED
    useEffect(() => {
        // EXACTLY like messages - only check isConnected
        // But also ensure roomId exists so we're subscribed to the right channel
        if (!ablyConnected || !roomId) return;

        // Handle game state updates from Ably - Database is source of truth
        // When server saves to database, it broadcasts via Ably, and we update here
        // This is called IMMEDIATELY when any player makes a pick - NO REFRESH NEEDED
        const handleGameStateUpdate = (data) => {
            //console.log('🎮 LIVE UPDATE RECEIVED via Ably:', data);
            if (data && data.game_state) {
                // Always update from server's authoritative state (from database)
                updateGameStateFromData(data.game_state);
            }
        };

        const handleGameReset = (data) => {
            if (data && data.game_state) {
                handleGameStateUpdate(data); // Same handler for reset
            }
        };

        // Subscribe to game state updates - exactly like messages subscribe
        // This ensures when Player 1 picks, Player 2 sees it, and vice versa
        //console.log('🔔 Registering Ably subscriptions for room:', roomId);
        subscribe('game-state-updated', handleGameStateUpdate);
        subscribe('game-reset', handleGameReset);
        //console.log('✅ Ably subscriptions registered - ready for live updates');

        return () => {
            // Cleanup handled by useAblyChannelGames
        };
    }, [ablyConnected, roomId, subscribe, updateGameStateFromData]);

    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        const r = sp.get('room');
        const n = sp.get('name');
        if (r) setRoomId(r);
        if (n) setPlayerName(n);
        if (r && n && !isConnected) {
            // small delay to allow state to update inputs
            setTimeout(() => {
                connectRoom();
            }, 100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const matchOver = currentRound === rounds && step === 'reveal';
    const overallWinner = scores.p1 === scores.p2 ? 'tie' : scores.p1 > scores.p2 ? 'p1' : 'p2';

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <Link href="/games" className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                            ← Back to Games
                        </Link>
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">✊✋✌️ Rock Paper Scissors</h1>
                        <p className="text-gray-600">Two players. Best of rounds with pass-and-play or online multiplayer.</p>
                    </div>

                    {/* Realtime room controls */}
                    <div className="mb-6 flex justify-center">
                        <div className="flex w-full max-w-xl flex-col gap-2 rounded-lg bg-white p-3 shadow-md">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    className="flex-1 rounded border px-3 py-2"
                                    disabled={isConnected}
                                />
                                <input
                                    type="text"
                                    placeholder="Room ID (e.g. rps-abc123)"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="flex-1 rounded border px-3 py-2"
                                    disabled={isConnected}
                                />
                                <button
                                    onClick={() => setRoomId((prev) => prev || randomRoomId('rps'))}
                                    className="rounded border bg-gray-100 px-3 py-2 hover:bg-gray-200"
                                    disabled={isConnected}
                                >
                                    Generate
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isConnected ? (
                                    <button
                                        data-auto-join
                                        onClick={connectRoom}
                                        className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900 disabled:bg-gray-400"
                                        disabled={!roomId || !playerName.trim()}
                                    >
                                        Join Room
                                    </button>
                                ) : (
                                    <button onClick={disconnectRoom} className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
                                        Leave Room
                                    </button>
                                )}
                                <button
                                    onClick={async () => {
                                        const link = buildInviteUrl();
                                        try {
                                            await navigator.clipboard.writeText(link);
                                        } catch {}
                                        //alert('Invite link copied.');
                                    }}
                                    className="rounded border bg-gray-100 px-4 py-2 hover:bg-gray-200"
                                    disabled={!roomId || !playerName.trim()}
                                >
                                    Copy Link
                                </button>
                                {isConnected && (
                                    <div className="self-center text-sm text-gray-600">
                                        Connected as <strong>{assignedPlayer ?? '?'}</strong> — Share Room ID with a friend
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Rounds selector */}
                    <div className="mb-6 flex justify-center gap-3">
                        {[3, 5, 7].map((n) => (
                            <button
                                key={n}
                                onClick={() => {
                                    setRounds(n);
                                    resetMatch();
                                }}
                                className={`rounded-md px-4 py-2 ${rounds === n ? 'bg-gray-800 text-white' : 'border bg-white text-gray-700'}`}
                            >
                                Best of {n}
                            </button>
                        ))}
                    </div>

                    {/* Scoreboard */}
                    <div className="mb-6 flex justify-center gap-8">
                        <div
                            className={`rounded-lg bg-white p-4 text-center shadow-md ${isConnected && assignedPlayer === 'p1' ? 'ring-2 ring-blue-500' : ''}`}
                        >
                            <div className="text-xl font-bold">
                                Player 1{isConnected && assignedPlayer === 'p1' && <span className="ml-1 text-xs text-blue-600">(You)</span>}
                            </div>
                            <div className="text-3xl font-extrabold text-blue-600">{scores.p1}</div>
                        </div>
                        <div
                            className={`rounded-lg bg-white p-4 text-center shadow-md ${isConnected && assignedPlayer === 'p2' ? 'ring-2 ring-rose-500' : ''}`}
                        >
                            <div className="text-xl font-bold">
                                Player 2{isConnected && assignedPlayer === 'p2' && <span className="ml-1 text-xs text-rose-600">(You)</span>}
                            </div>
                            <div className="text-3xl font-extrabold text-rose-600">{scores.p2}</div>
                        </div>
                    </div>

                    <div className="mb-2 text-center text-sm text-gray-600">
                        Round {currentRound} of {rounds}
                    </div>

                    {/* Step panels */}
                    {step === 'p1' && (
                        <div className="rounded-2xl border bg-white p-6 text-center shadow-lg">
                            <div className="mb-3 flex items-center justify-center gap-2 font-semibold">
                                Player 1: Choose
                                {isConnected && assignedPlayer !== 'p1' ? (
                                    <span className="ml-2 flex items-center gap-1 text-sm text-blue-600">
                                        <span className="animate-bounce">⏳</span>
                                        Waiting for Player 1...
                                    </span>
                                ) : isConnected && assignedPlayer === 'p1' ? (
                                    <span className="ml-2 flex items-center gap-1 text-sm text-green-600">
                                        <span className="animate-pulse">●</span>
                                        Your turn
                                    </span>
                                ) : null}
                            </div>
                            <div className="flex justify-center gap-4">
                                {CHOICES.map((ch) => (
                                    <button
                                        key={ch.id}
                                        onClick={() => onPick('p1', ch.id)}
                                        disabled={isConnected && assignedPlayer !== 'p1'}
                                        className={`rounded-lg border px-4 py-3 transition-all duration-200 hover:scale-105 hover:bg-gray-50 active:scale-95 ${isConnected && assignedPlayer !== 'p1' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                    >
                                        {ch.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'p2' && (
                        <div className="rounded-2xl border bg-white p-6 text-center shadow-lg">
                            <div className="mb-3 flex items-center justify-center gap-2 font-semibold">
                                Player 2: Choose
                                {isConnected && assignedPlayer !== 'p2' ? (
                                    <span className="ml-2 flex items-center gap-1 text-sm text-blue-600">
                                        <span className="animate-bounce">⏳</span>
                                        Waiting for Player 2...
                                    </span>
                                ) : isConnected && assignedPlayer === 'p2' ? (
                                    <span className="ml-2 flex items-center gap-1 text-sm text-green-600">
                                        <span className="animate-pulse">●</span>
                                        Your turn
                                    </span>
                                ) : null}
                            </div>
                            <div className="flex justify-center gap-4">
                                {CHOICES.map((ch) => (
                                    <button
                                        key={ch.id}
                                        onClick={() => onPick('p2', ch.id)}
                                        disabled={isConnected && assignedPlayer !== 'p2'}
                                        className={`rounded-lg border px-4 py-3 transition-all duration-200 hover:scale-105 hover:bg-gray-50 active:scale-95 ${isConnected && assignedPlayer !== 'p2' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                    >
                                        {ch.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'reveal' && (
                        <div className="rounded-2xl border bg-white p-6 text-center shadow-lg duration-300 animate-in fade-in zoom-in">
                            <div className="mb-4">
                                <div className="text-lg duration-300 animate-in slide-in-from-left">
                                    Player 1 picked: <strong className="text-blue-600">{p1Choice}</strong>
                                </div>
                                <div className="text-lg delay-150 duration-300 animate-in slide-in-from-right">
                                    Player 2 picked: <strong className="text-rose-600">{p2Choice}</strong>
                                </div>
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
                                    <button onClick={nextRound} className="rounded-lg bg-gray-800 px-5 py-2 font-semibold text-white hover:bg-black">
                                        Next Round
                                    </button>
                                )}
                                {matchOver && (
                                    <button onClick={resetMatch} className="rounded-lg bg-gray-800 px-5 py-2 font-semibold text-white hover:bg-black">
                                        New Match
                                    </button>
                                )}
                            </div>

                            {matchOver && (
                                <div className="mt-4 text-lg">
                                    {overallWinner === 'tie'
                                        ? 'Match tied.'
                                        : overallWinner === 'p1'
                                          ? 'Player 1 wins the match!'
                                          : 'Player 2 wins the match!'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
