import useAblyChannelGames from '@/hooks/useAblyChannelGames';
import AppLayout from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

function randomRoomId(prefix = 'c4') {
    const rnd = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${rnd}`;
}

const ROWS = 6;
const COLS = 7;

function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export default function ConnectFour() {
    const page = usePage();
    const auth = page?.props?.auth;
    const [board, setBoard] = useState(createBoard());
    const [currentPlayer, setCurrentPlayer] = useState('🔵');
    const [winner, setWinner] = useState(null);
    const [isFull, setIsFull] = useState(false);
    // Online multiplayer state
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [assignedPlayer, setAssignedPlayer] = useState(null); // '🔵' | '🟡'
    const lastStateHashRef = useRef(null);
    const [droppingColumn, setDroppingColumn] = useState(null); // Track which column is animating
    const [droppingRow, setDroppingRow] = useState(null); // Track which row the disc is dropping to

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

    // Handle drop disc with online support - Database + Ably flow
    const dropDisc = async (col) => {
        if (winner) return;

        // In online mode, strictly enforce assigned role. If role is unknown yet, block moves.
        if (isConnected) {
            if (!assignedPlayer || currentPlayer !== assignedPlayer) {
                return; // Not your turn or role not assigned yet
            }
        }

        const newBoard = board.map((row) => [...row]);
        let dropRow = null;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!newBoard[r][col]) {
                dropRow = r;
                // Start animation
                setDroppingColumn(col);
                setDroppingRow(r);

                // Wait for animation to complete before updating board
                setTimeout(() => {
                    newBoard[r][col] = currentPlayer;
                    const w = checkWin(newBoard);
                    const full = newBoard.every((row) => row.every((cell) => cell));
                    const nextPlayer = w ? currentPlayer : currentPlayer === '🔵' ? '🟡' : '🔵';

                    // Update board after animation
                    setBoard(newBoard);
                    setWinner(w);
                    setIsFull(full);
                    if (!w) setCurrentPlayer(nextPlayer);

                    // Clear animation state
                    setDroppingColumn(null);
                    setDroppingRow(null);

                    // POST move to server - server saves to database and broadcasts via Ably IMMEDIATELY
                    if (isConnected && roomId) {
                        // Prepare state to send - server will preserve players array
                        const currentState = {
                            board: newBoard,
                            currentPlayer: nextPlayer,
                            winner: w,
                            isFull: full,
                            // Note: players array is preserved by server's updateState method
                        };

                        try {
                            //console.log('📤 Sending move to server - Room:', roomId, 'Player:', playerName, 'Player:', currentPlayer);
                            // Save to database and broadcast via Ably
                            // Server will:
                            // 1. Save to database (preserving players array)
                            // 2. Broadcast to ALL players via Ably immediately
                            axios
                                .post(`/api/games/state/${roomId}`, {
                                    game_type: 'connectfour',
                                    game_state: currentState,
                                })
                                .then(() => {
                                    //console.log('✅ Move saved! Server broadcasted to all players via Ably');
                                    //console.log('📡 Other player should receive update NOW via Ably subscription');
                                })
                                .catch((error) => {
                                    console.error('❌ Failed to save move:', error);
                                    // Revert optimistic update on error
                                    setBoard(board);
                                    setCurrentPlayer(currentPlayer);
                                    setWinner(null);
                                    setIsFull(false);
                                });
                        } catch (error) {
                            console.error('❌ Failed to save move:', error);
                            // Revert optimistic update on error
                            setBoard(board);
                            setCurrentPlayer(currentPlayer);
                            setWinner(null);
                            setIsFull(false);
                        }
                    }
                }, 400); // Animation duration
                return;
            }
        }
    };

    // Reset game - Database + Ably flow
    const reset = () => {
        const newBoard = createBoard();

        // Optimistic update
        setBoard(newBoard);
        setCurrentPlayer('🔵');
        setWinner(null);
        setIsFull(false);

        // POST reset to server - server saves to database and broadcasts via Ably
        if (isConnected && roomId) {
            const newState = {
                board: newBoard,
                currentPlayer: '🔵',
                winner: null,
                isFull: false,
                // Note: players array is preserved by server's updateState merge
            };

            axios
                .post(`/api/games/reset/${roomId}`, {
                    game_type: 'connectfour',
                    initial_state: newState,
                })
                .catch((err) => {
                    console.error('Failed to reset game:', err);
                });
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

                // Check if board changed to trigger animation for remote moves
                if (state.board) {
                    const oldBoard = board;
                    const newBoard = state.board;

                    // Find which column and row changed (for animation)
                    for (let c = 0; c < COLS; c++) {
                        for (let r = ROWS - 1; r >= 0; r--) {
                            if (!oldBoard[r][c] && newBoard[r][c]) {
                                // New disc dropped in this position
                                setDroppingColumn(c);
                                setDroppingRow(r);

                                // Update board after animation
                                setTimeout(() => {
                                    setBoard(newBoard);
                                    setDroppingColumn(null);
                                    setDroppingRow(null);
                                }, 400);

                                // Update other state immediately
                                if (state.currentPlayer) setCurrentPlayer(state.currentPlayer);
                                if (state.winner !== undefined) setWinner(state.winner);
                                if (state.isFull !== undefined) setIsFull(state.isFull);

                                // Assign player based on stored player for this player name
                                if (state.players && state.players.length > 0) {
                                    const playerIndex = state.players.findIndex((p) => p.name === playerName);
                                    if (playerIndex >= 0) {
                                        const player = state.players[playerIndex]?.player;
                                        if (player === '🔵' || player === '🟡') {
                                            setAssignedPlayer(player);
                                        }
                                    } else {
                                        // If name not found:
                                        // - Keep current role if already assigned (never flip)
                                        // - If no role yet and there is exactly 1 player, infer the opposite
                                        // - If 0 or 2+ players, do not guess; wait for explicit assignment
                                        if (!assignedPlayer && state.players.length === 1) {
                                            const onlyPlayer = state.players[0]?.player;
                                            if (onlyPlayer === '🔵' || onlyPlayer === '🟡') {
                                                setAssignedPlayer(onlyPlayer === '🔵' ? '🟡' : '🔵');
                                            }
                                        }
                                    }
                                }
                                return; // Exit early after finding the change
                            }
                        }
                    }

                    // If no change found (shouldn't happen), just update normally
                    setBoard(newBoard);
                } else {
                    // No board change, update other state normally
                    if (state.currentPlayer) setCurrentPlayer(state.currentPlayer);
                    if (state.winner !== undefined) setWinner(state.winner);
                    if (state.isFull !== undefined) setIsFull(state.isFull);
                }

                // Assign player if not already done above
                if (state.players && state.players.length > 0 && !assignedPlayer) {
                    const playerIndex = state.players.findIndex((p) => p.name === playerName);
                    if (playerIndex >= 0) {
                        const player = state.players[playerIndex]?.player;
                        if (player === '🔵' || player === '🟡') {
                            setAssignedPlayer(player);
                        }
                    }
                }
            }
        },
        [playerName, assignedPlayer, board],
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
                if (state.board) setBoard(state.board);
                if (state.currentPlayer) setCurrentPlayer(state.currentPlayer);
                if (state.winner !== undefined) setWinner(state.winner);
                if (state.isFull !== undefined) setIsFull(state.isFull);

                // Assign player
                let playerRole = null;
                if (state.players && state.players.length === 1) {
                    playerRole = state.players[0].player === '🔵' ? '🟡' : '🔵';
                    setAssignedPlayer(playerRole);
                    state.players.push({ name: joinName, player: playerRole });
                } else if (state.players && state.players.length > 0) {
                    const playerIndex = state.players.findIndex((p) => p.name === joinName);
                    if (playerIndex >= 0) {
                        // Player with same (possibly adjusted) name exists in state
                        playerRole = state.players[playerIndex].player;
                        setAssignedPlayer(playerRole);
                    } else {
                        playerRole = state.players[0].player === '🔵' ? '🟡' : '🔵';
                        setAssignedPlayer(playerRole);
                        state.players.push({ name: joinName, player: playerRole });
                    }
                }

                // Update server with new player
                await axios.post(`/api/games/state/${roomId}`, {
                    game_type: 'connectfour',
                    game_state: state,
                });
            } else {
                // Initialize new game
                const initialState = {
                    board: createBoard(),
                    currentPlayer: '🔵',
                    winner: null,
                    isFull: false,
                    players: [{ name: playerName, player: '🔵' }],
                };

                await axios.post(`/api/games/state/${roomId}`, {
                    game_type: 'connectfour',
                    game_state: initialState,
                });

                setAssignedPlayer('🔵');
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
        reset();
    };

    // Build shareable link and auto-join via query params
    const buildInviteUrl = () => {
        const url = new URL(window.location.href);
        if (roomId) url.searchParams.set('room', roomId);
        if (playerName) url.searchParams.set('name', playerName);
        return url.toString();
    };
    const inviteUrl = React.useMemo(() => (roomId && playerName ? buildInviteUrl() : ''), [roomId, playerName]);

    // Auto-fill player name from authenticated user if available
    useEffect(() => {
        if (!playerName) {
            const n = auth?.user?.name || new URLSearchParams(window.location.search).get('name') || 'Player';
            setPlayerName(n);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        const r = sp.get('room');
        const n = sp.get('name');
        if (r) setRoomId(r);
        if (n) setPlayerName(n);
        if (r && n && !isConnected) {
            setTimeout(() => connectRoom(), 100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Subscribe to Ably real-time game state updates - EXACTLY like TicTacToe
    // When Player 1 drops, Player 2 sees it IMMEDIATELY - NO REFRESH NEEDED
    // When Player 2 drops, Player 1 sees it IMMEDIATELY - NO REFRESH NEEDED
    useEffect(() => {
        // EXACTLY like messages - only check isConnected
        // But also ensure roomId exists so we're subscribed to the right channel
        if (!ablyConnected || !roomId) return;

        // Handle game state updates from Ably - Database is source of truth
        // When server saves to database, it broadcasts via Ably, and we update here
        // This is called IMMEDIATELY when any player makes a move - NO REFRESH NEEDED
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
        // This ensures when Player 1 drops, Player 2 sees it, and vice versa
        //console.log('🔔 Registering Ably subscriptions for room:', roomId);
        subscribe('game-state-updated', handleGameStateUpdate);
        subscribe('game-reset', handleGameReset);
        //console.log('✅ Ably subscriptions registered - ready for live updates');

        return () => {
            // Cleanup handled by useAblyChannelGames
        };
    }, [ablyConnected, roomId, subscribe, updateGameStateFromData]);

    return (
        <AppLayout>
            <style>{`
                @keyframes drop-disc {
                    0% {
                        transform: translateY(0);
                    }
                    100% {
                        transform: translateY(calc(${droppingRow !== null ? (droppingRow + 1) * 64 : 0}px));
                    }
                }
                .animate-drop-disc {
                    animation: drop-disc 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <Link href="/games" className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                            ← Back to Games
                        </Link>
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">🟡 Connect Four</h1>
                        <p className="text-gray-600">Two players. Connect four in a row to win.</p>
                    </div>

                    {/* Online multiplayer room controls */}
                    <div className="mb-6 flex justify-center">
                        <div className="flex w-full max-w-xl flex-col gap-2 rounded-lg bg-white p-3 shadow-md">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Room ID (e.g. c4-abc123)"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="flex-1 rounded border px-3 py-2"
                                    disabled={isConnected}
                                />
                                <button
                                    onClick={() => {
                                        if (!roomId) {
                                            const randomId = 'c4-' + Math.random().toString(36).slice(2, 8);
                                            setRoomId(randomId);
                                        }
                                    }}
                                    className="rounded border bg-gray-100 px-3 py-2 hover:bg-gray-200"
                                    disabled={isConnected}
                                >
                                    Generate
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isConnected ? (
                                    <button
                                        onClick={connectRoom}
                                        className="rounded bg-amber-700 px-4 py-2 text-white hover:bg-amber-800 disabled:bg-gray-400"
                                        disabled={!roomId || !playerName.trim()}
                                    >
                                        Join Room
                                    </button>
                                ) : (
                                    <button onClick={disconnectRoom} className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
                                        Leave Room
                                    </button>
                                )}
                                <div className="hidden flex-1 items-center gap-2 md:flex">
                                    <input
                                        type="text"
                                        readOnly
                                        value={inviteUrl}
                                        placeholder="Invite link will appear here"
                                        className="flex-1 rounded border px-3 py-2 text-xs"
                                    />
                                    <button
                                        onClick={async () => {
                                            if (inviteUrl) {
                                                try {
                                                    await navigator.clipboard.writeText(inviteUrl);
                                                } catch {}
                                            }
                                        }}
                                        className="rounded border bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
                                        disabled={!inviteUrl}
                                    >
                                        Copy
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (inviteUrl) window.open(inviteUrl, '_blank');
                                        }}
                                        className="rounded border bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
                                        disabled={!inviteUrl}
                                    >
                                        Open
                                    </button>
                                </div>
                                <button
                                    onClick={async () => {
                                        const link = buildInviteUrl();
                                        try {
                                            await navigator.clipboard.writeText(link);
                                        } catch {}
                                    }}
                                    className="rounded border bg-gray-100 px-4 py-2 hover:bg-gray-200 md:hidden"
                                    disabled={!roomId || !playerName.trim()}
                                >
                                    Copy Link
                                </button>
                                {isConnected && (
                                    <div className="self-center text-sm text-gray-600">
                                        Connected as <strong>{assignedPlayer ?? '?'}</strong> {ablyConnected ? '— Real-time' : '— Connecting...'}
                                    </div>
                                )}
                            </div>
                        </div>
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
                                        disabled={!!winner || (isConnected && assignedPlayer && currentPlayer !== assignedPlayer)}
                                        className="mx-1 mb-2 h-8 rounded bg-blue-600 text-xs text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Drop
                                    </button>
                                ))}
                            </div>
                            <div className="relative grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 56px)` }}>
                                {/* Render dropping disc overlay if animation is active */}
                                {droppingColumn !== null && droppingRow !== null && (
                                    <div
                                        className="pointer-events-none absolute z-10"
                                        style={{
                                            left: `${droppingColumn * 64}px`,
                                            top: '0px',
                                            width: '56px',
                                        }}
                                    >
                                        <div
                                            className="animate-drop-disc flex h-12 w-12 items-center justify-center rounded-full"
                                            style={{ margin: '2px' }}
                                        >
                                            {currentPlayer}
                                        </div>
                                    </div>
                                )}
                                {board.map((row, r) =>
                                    row.map((cell, c) => (
                                        <div
                                            key={`${r}-${c}`}
                                            className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-blue-900"
                                        >
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
