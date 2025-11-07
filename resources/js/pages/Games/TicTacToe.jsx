import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import axios from 'axios';

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

export default function TicTacToe() {
    const page = usePage();
    const auth = page?.props?.auth;
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });
    const [gameMode, setGameMode] = useState('human'); // 'human' or 'computer'

    // Online multiplayer state
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [assignedSymbol, setAssignedSymbol] = useState(null); // 'X' | 'O'
    const [requestedSymbol, setRequestedSymbol] = useState(null); // optional preferred role from URL
    const [isConnected, setIsConnected] = useState(false);
    const pollingIntervalRef = useRef(null);
    const lastStateHashRef = useRef(null);

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
        return currentBoard.every(cell => cell !== null);
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
        const availableMoves = currentBoard.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
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
            setScores(prev => ({
                ...prev,
                [currentWinner]: prev[currentWinner] + 1
            }));
        } else if (isBoardFull(newBoard)) {
            setGameOver(true);
            setScores(prev => ({
                ...prev,
                ties: prev.ties + 1
            }));
        } else {
            setIsXNext(!isXNext);
        }
    };

    // Computer move effect
    useEffect(() => {
        if (gameMode === 'computer' && !isXNext && !gameOver && !winner && !isConnected) {
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
        const newBoard = Array(9).fill(null);
        setBoard(newBoard);
        setIsXNext(true);
        setWinner(null);
        setGameOver(false);
        // POST reset to server
        if (isConnected && roomId) {
            const newState = {
                board: newBoard,
                isXNext: true,
                winner: null,
                gameOver: false,
                scores,
            };
            axios.post(`/api/games/reset/${roomId}`, {
                game_type: 'tictactoe',
                initial_state: newState,
            }).catch(err => console.error('Failed to reset game:', err));
        }
    };

    // Reset scores
    const resetScores = () => {
        setScores({ X: 0, O: 0, ties: 0 });
    };

    // Render cell
    const renderCell = (index) => {
        const value = board[index];
        const isWinningCell = winner && WINNING_COMBINATIONS.some(combination =>
            combination.includes(index) &&
            combination.every(pos => board[pos] === winner)
        );

        return (
            <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={gameOver || value}
                className={`
                    w-20 h-20 text-3xl font-bold rounded-lg border-2 transition-all duration-200
                    ${value === 'X' ? 'text-blue-600 bg-blue-50 border-blue-300' : ''}
                    ${value === 'O' ? 'text-red-600 bg-red-50 border-red-300' : ''}
                    ${!value && !gameOver ? 'hover:bg-gray-50 border-gray-300 hover:border-gray-400' : ''}
                    ${isWinningCell ? 'bg-yellow-200 border-yellow-400 shadow-lg' : ''}
                    ${gameOver ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                {value}
            </button>
        );
    };

    // Poll for game state updates - called by useEffect
    const pollGameState = React.useCallback(async () => {
        if (!isConnected || !roomId) return;
        
        try {
            const response = await axios.get(`/api/games/state/${roomId}`);
            if (response.data.exists && response.data.game_state) {
                const state = response.data.game_state;
                const stateHash = JSON.stringify(state);
                
                // Only update if state changed
                if (stateHash !== lastStateHashRef.current) {
                    lastStateHashRef.current = stateHash;
                    
                    // Update all state from server
                    if (state.board && Array.isArray(state.board)) {
                        setBoard(state.board);
                    }
                    
                    if (state.isXNext !== undefined) {
                        setIsXNext(state.isXNext);
                    }
                    
                    if (state.winner !== undefined) {
                        setWinner(state.winner);
                    }
                    
                    if (state.gameOver !== undefined) {
                        setGameOver(state.gameOver);
                    }
                    
                    if (state.scores) {
                        setScores(state.scores);
                    }
                    
                    // Assign symbol based on stored symbol for this player, not array index
                    if (state.players && state.players.length > 0) {
                        const playerIndex = state.players.findIndex(p => p.name === playerName);
                        if (playerIndex >= 0) {
                            const sym = state.players[playerIndex]?.symbol;
                            if (sym === 'X' || sym === 'O') {
                                setAssignedSymbol(sym);
                            }
                        } else {
                            // If name not found:
                            // - Keep current role if already assigned (never flip)
                            // - If no role yet and there is exactly 1 player, infer the opposite
                            // - If 0 or 2+ players, do not guess; wait for explicit assignment
                            if (!assignedSymbol && state.players.length === 1) {
                                const onlySym = state.players[0]?.symbol;
                                if (onlySym === 'X' || onlySym === 'O') {
                                    setAssignedSymbol(onlySym === 'X' ? 'O' : 'X');
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to poll game state:', error);
        }
    }, [isConnected, roomId, playerName]);

    // Online multiplayer handlers
    const connectRoom = async () => {
        if (!roomId || !playerName.trim()) return;
        
        // Stop any existing polling
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        
        setIsConnected(true);
        
        try {
            // Try to get existing state first
            const existingState = await axios.get(`/api/games/state/${roomId}`);
            
            if (existingState.data.exists) {
                // Game already exists, sync with it
                const state = existingState.data.game_state;
                
                // Ensure a unique join name if needed (avoid taking host's symbol due to name collision)
                let joinName = playerName;
                if (state.players && Array.isArray(state.players) && requestedSymbol === 'O') {
                    if (state.players.some(p => p?.name === joinName)) {
                        // Create a unique variant of the name
                        let suffix = 2;
                        let candidate = `${joinName} (${requestedSymbol})`;
                        while (state.players.some(p => p?.name === candidate)) {
                            candidate = `${joinName} (${requestedSymbol} ${suffix++})`;
                        }
                        joinName = candidate;
                        setPlayerName(joinName);
                    }
                }
                if (state.board) setBoard(state.board);
                if (state.isXNext !== undefined) setIsXNext(state.isXNext);
                if (state.winner !== undefined) setWinner(state.winner);
                if (state.gameOver !== undefined) setGameOver(state.gameOver);
                if (state.scores) setScores(state.scores);
                
                // Assign symbol
                let playerSymbol = null;
                if (state.players && state.players.length === 1) {
                    playerSymbol = state.players[0].symbol === 'X' ? 'O' : 'X';
                    setAssignedSymbol(playerSymbol);
                    state.players.push({ name: joinName, symbol: playerSymbol });
                } else if (state.players && state.players.length > 0) {
                    const playerIndex = state.players.findIndex(p => p.name === joinName);
                    if (playerIndex >= 0) {
                        // Player with same (possibly adjusted) name exists in state
                        const storedSymbol = state.players[playerIndex].symbol;
                        // If a requested symbol exists and differs, and it's free, switch to requested
                        if ((requestedSymbol === 'X' || requestedSymbol === 'O') && storedSymbol !== requestedSymbol) {
                            const symbolTaken = state.players.some(p => p.symbol === requestedSymbol);
                            if (!symbolTaken) {
                                state.players[playerIndex].symbol = requestedSymbol;
                                playerSymbol = requestedSymbol;
                                setAssignedSymbol(playerSymbol);
                            } else {
                                playerSymbol = storedSymbol;
                                setAssignedSymbol(playerSymbol);
                            }
                        } else {
                            playerSymbol = storedSymbol;
                            setAssignedSymbol(playerSymbol);
                        }
                    } else {
                        playerSymbol = state.players[0].symbol === 'X' ? 'O' : 'X';
                        setAssignedSymbol(playerSymbol);
                        state.players.push({ name: joinName, symbol: playerSymbol });
                    }
                }
                
                // Update server with new player
                await axios.post(`/api/games/state/${roomId}`, {
                    game_type: 'tictactoe',
                    game_state: state,
                });
            } else {
                // Initialize new game — honor requested symbol (so invitee can be 'O' even if first)
                const creatorSymbol = (requestedSymbol === 'X' || requestedSymbol === 'O') ? requestedSymbol : 'X';
                const initialState = {
                    board: Array(9).fill(null),
                    isXNext: true,
                    winner: null,
                    gameOver: false,
                    scores: { X: 0, O: 0, ties: 0 },
                    players: [{ name: playerName, symbol: creatorSymbol }],
                };
                
                await axios.post(`/api/games/state/${roomId}`, {
                    game_type: 'tictactoe',
                    game_state: initialState,
                });
                
                setAssignedSymbol(creatorSymbol);
            }
            
            // Start fast polling - 100ms for very fast updates
            pollGameState(); // Immediate poll
            pollingIntervalRef.current = setInterval(pollGameState, 100); // Poll every 100ms
            
        } catch (error) {
            console.error('Failed to connect to room:', error);
            setIsConnected(false);
        }
    };

    const disconnectRoom = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setIsConnected(false);
        setAssignedSymbol(null);
        setRoomId('');
        setPlayerName('');
        lastStateHashRef.current = null;
        setGameMode('human');
        resetGame();
    };

    // Handle clicks with online support
    const handleCellClickNetworked = async (index) => {
        if (board[index] || gameOver) return;
        
        const symbol = isXNext ? 'X' : 'O';

        // In online mode, strictly enforce assigned role. If role is unknown yet, block moves.
        if (isConnected) {
            if (!assignedSymbol || symbol !== assignedSymbol) {
                return; // Not your turn or role not assigned yet
            }
        }
        
        // Calculate new state
        const newBoard = [...board];
        newBoard[index] = symbol;
        const currentWinner = checkWinner(newBoard);
        const currentIsXNext = !isXNext;
        const currentGameOver = currentWinner !== null || isBoardFull(newBoard);
        
        // Calculate new scores
        let newScores = { ...scores };
        if (currentWinner) {
            newScores[currentWinner] = (newScores[currentWinner] || 0) + 1;
        } else if (currentGameOver && !currentWinner) {
            newScores.ties = (newScores.ties || 0) + 1;
        }
        
        // Apply move locally
        setBoard(newBoard);
        setIsXNext(currentIsXNext);
        if (currentWinner) {
            setWinner(currentWinner);
            setGameOver(true);
            setScores(newScores);
        } else if (currentGameOver) {
            setGameOver(true);
            setScores(newScores);
        } else {
            setIsXNext(currentIsXNext);
        }
        
        // POST move to server immediately
        if (isConnected && roomId) {
            const newState = {
                board: newBoard,
                isXNext: currentIsXNext,
                winner: currentWinner,
                gameOver: currentGameOver,
                scores: newScores,
            };
            
            try {
                await axios.post(`/api/games/state/${roomId}`, {
                    game_type: 'tictactoe',
                    game_state: newState,
                });
            } catch (error) {
                console.error('Failed to save move:', error);
            }
        }
    };

    // Build shareable link and auto-join via query params
    const buildInviteUrl = () => {
        const url = new URL(window.location.href);
        if (roomId) url.searchParams.set('room', roomId);
        if (playerName) url.searchParams.set('name', playerName);
        // By default, invitee will join as O so you remain X
        url.searchParams.set('as', 'O');
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
        const as = sp.get('as');
        if (r) setRoomId(r);
        if (n) setPlayerName(n);
        if (as === 'X' || as === 'O') {
            setRequestedSymbol(as);
            // Do not set assigned here; let connection/server state decide
        }
        if (r && n && !isConnected) {
            setTimeout(() => connectRoom(), 100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Polling useEffect - automatically polls when connected
    useEffect(() => {
        if (!isConnected || !roomId) {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
            return;
        }

        // Start polling immediately
        pollGameState();
        
        // Set up fast polling interval - 100ms for very fast updates
        pollingIntervalRef.current = setInterval(() => {
            pollGameState();
        }, 100); // Poll every 100ms for near real-time

        // Cleanup
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [isConnected, roomId, playerName, pollGameState]);

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8">
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
                            ⭕ Tic Tac Toe
                        </h1>
                        <p className="text-gray-600">
                            Get three in a row to win! Play against a friend or the computer.
                        </p>
                    </div>

                    {/* Game Mode Selection */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white rounded-lg p-1 shadow-md">
                            <button
                                onClick={() => {
                                    setGameMode('human');
                                    resetGame();
                                }}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    gameMode === 'human'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                👥 Two Players
                            </button>
                            <button
                                onClick={() => {
                                    setGameMode('computer');
                                    resetGame();
                                }}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    gameMode === 'computer'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                🤖 vs Computer
                            </button>
                        </div>
                    </div>

                    {/* Online multiplayer room controls */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white rounded-lg p-3 shadow-md flex flex-col gap-2 w-full max-w-xl">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Room ID (e.g. ttt-abc123)"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="flex-1 border rounded px-3 py-2"
                                    disabled={isConnected}
                                />
                                <button
                                    onClick={() => {
                                        if (!roomId) {
                                            const randomId = 'ttt-' + Math.random().toString(36).slice(2, 8);
                                            setRoomId(randomId);
                                        }
                                    }}
                                    className="px-3 py-2 rounded bg-gray-100 border hover:bg-gray-200"
                                    disabled={isConnected}
                                >Generate</button>
                            </div>
                            <div className="flex gap-2 items-center">
                                {!isConnected ? (
                                    <button 
                                        onClick={connectRoom} 
                                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
                                        disabled={!roomId || !playerName.trim()}
                                    >Join Room</button>
                                ) : (
                                    <button 
                                        onClick={disconnectRoom} 
                                        className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                                    >Leave Room</button>
                                )}
                                <div className="flex-1 hidden md:flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={inviteUrl}
                                        placeholder="Invite link will appear here"
                                        className="flex-1 border rounded px-3 py-2 text-xs"
                                    />
                                    <button
                                        onClick={async () => { if (inviteUrl) { try { await navigator.clipboard.writeText(inviteUrl); } catch {} } }}
                                        className="px-3 py-2 rounded bg-gray-100 border hover:bg-gray-200 text-sm"
                                        disabled={!inviteUrl}
                                    >Copy</button>
                                    <button
                                        onClick={() => { if (inviteUrl) window.open(inviteUrl, '_blank'); }}
                                        className="px-3 py-2 rounded bg-gray-100 border hover:bg-gray-200 text-sm"
                                        disabled={!inviteUrl}
                                    >Open</button>
                                </div>
                                <button
                                    onClick={async () => {
                                        const link = buildInviteUrl();
                                        try { await navigator.clipboard.writeText(link); } catch {}
                                        //alert('Invite link copied. Share it with your friend.');
                                    }}
                                    className="px-4 py-2 rounded bg-gray-100 border hover:bg-gray-200 md:hidden"
                                    disabled={!roomId || !playerName.trim()}
                                >Copy Link</button>
                                {isConnected && (
                                    <div className="text-sm text-gray-600 self-center">
                                        Connected as <strong>{assignedSymbol ?? '?'}</strong> — Polling every 100ms
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Game Board */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-gray-300">
                            <div className="grid grid-cols-3 gap-2">
                                {Array(9).fill(null).map((_, index) => {
                                    const value = board[index];
                                    const isWinningCell = winner && WINNING_COMBINATIONS.some(combination =>
                                        combination.includes(index) &&
                                        combination.every(pos => board[pos] === winner)
                                    );
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleCellClickNetworked(index)}
                                            disabled={gameOver || value}
                                            className={`
                                                w-20 h-20 text-3xl font-bold rounded-lg border-2 transition-all duration-200
                                                ${value === 'X' ? 'text-blue-600 bg-blue-50 border-blue-300' : ''}
                                                ${value === 'O' ? 'text-red-600 bg-red-50 border-red-300' : ''}
                                                ${!value && !gameOver ? 'hover:bg-gray-50 border-gray-300 hover:border-gray-400' : ''}
                                                ${isWinningCell ? 'bg-yellow-200 border-yellow-400 shadow-lg' : ''}
                                                ${gameOver ? 'cursor-not-allowed' : 'cursor-pointer'}
                                            `}
                                        >
                                            {value}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Game Status */}
                    <div className="text-center mb-6">
                        {!gameOver && (
                            <div className="text-xl font-semibold text-gray-700">
                                {isConnected ? (
                                    (() => {
                                        const currentTurnSymbol = isXNext ? 'X' : 'O';
                                        const isMyTurn = assignedSymbol && currentTurnSymbol === assignedSymbol;
                                        return isMyTurn ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="animate-pulse">●</span>
                                                Your turn ({assignedSymbol})
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2 text-blue-600">
                                                <span className="animate-bounce">⏳</span>
                                                Waiting for opponent (Player {currentTurnSymbol})...
                                            </span>
                                        );
                                    })()
                                ) : gameMode === 'computer' ? (
                                    isXNext ? "Your turn (X)" : "Computer's turn (O)"
                                ) : (
                                    `Player ${isXNext ? 'X' : 'O'}'s turn`
                                )}
                            </div>
                        )}

                        {winner && (
                            <div className="text-2xl font-bold text-green-600 mb-4">
                                {gameMode === 'computer' ? (
                                    winner === 'X' ? "🎉 You Win!" : "🤖 Computer Wins!"
                                ) : (
                                    `🎉 Player ${winner} Wins!`
                                )}
                            </div>
                        )}

                        {gameOver && !winner && (
                            <div className="text-2xl font-bold text-gray-600 mb-4">
                                It's a tie! 🤝
                            </div>
                        )}

                        {gameOver && (
                            <button
                                onClick={resetGame}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                            >
                                Play Again
                            </button>
                        )}
                    </div>

                    {/* Score Board */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Score Board</h3>
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
                                className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Reset Scores
                            </button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">How to Play</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Objective:</h4>
                                <ul className="space-y-1">
                                    <li>• Get three of your symbols in a row</li>
                                    <li>• Rows, columns, or diagonals count</li>
                                    <li>• Block your opponent from winning</li>
                                    <li>• First to three wins the game!</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Game Modes:</h4>
                                <ul className="space-y-1">
                                    <li>• <strong>Two Players:</strong> Take turns with a friend</li>
                                    <li>• <strong>vs Computer:</strong> Play against AI</li>
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
