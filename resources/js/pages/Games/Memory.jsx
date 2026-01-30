import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { createRealtime } from './realtime';

const CARD_SYMBOLS = ['🎯', '🎨', '🎪', '🎭', '🎸', '🎺', '🎻', '🎹', '🎲', '🎮', '🎯', '🎨', '🎪', '🎭', '🎸', '🎺', '🎻', '🎹', '🎲', '🎮'];

export default function MemoryGame() {
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [bestTime, setBestTime] = useState(null);
    const [bestMoves, setBestMoves] = useState(null);
    const [playersCount, setPlayersCount] = useState(1);
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [playerScores, setPlayerScores] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
    const [tickParity, setTickParity] = useState(false); // alternate tick-tock
    // Realtime
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const realtimeRef = React.useRef(null);

    // Simple WebAudio for timer tick-tock
    const audioRef = React.useRef(null);
    const [audioReady, setAudioReady] = useState(false);
    const initAudio = () => {
        if (audioRef.current) return;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioRef.current = ctx;
        setAudioReady(true);
    };
    const playBeep = (freq = 700, duration = 0.03, type = 'square', gain = 0.02) => {
        const ctx = audioRef.current;
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.value = gain;
        osc.connect(g).connect(ctx.destination);
        const now = ctx.currentTime;
        osc.start(now);
        g.gain.setValueAtTime(gain, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.stop(now + duration + 0.02);
    };
    const playTickTock = () => {
        // alternate between two frequencies for tick-tock feel
        playBeep(tickParity ? 520 : 380, 0.045, 'square', 0.025);
        setTickParity((p) => !p);
    };

    // Keep a ref of latest cards to avoid effect re-running on cards change
    const cardsRef = React.useRef(cards);
    useEffect(() => {
        cardsRef.current = cards;
    }, [cards]);

    // Initialize game
    const initializeGame = () => {
        const shuffledCards = CARD_SYMBOLS.map((symbol, index) => ({
            id: index,
            symbol,
            isFlipped: false,
            isMatched: false,
        })).sort(() => Math.random() - 0.5);

        setCards(shuffledCards);
        setFlippedCards([]);
        setMatchedCards([]);
        setMoves(0);
        setTime(0);
        setGameStarted(false);
        setGameCompleted(false);
        setCurrentPlayer(1);
        setPlayerScores({ 1: 0, 2: 0, 3: 0, 4: 0 });
        setTickParity(false);
        if (isConnected) {
            // notify peer that a reset happened
            realtimeRef.current?.send({ type: 'reset' });
        }
    };

    // Initialize on mount to avoid empty board bug
    useEffect(() => {
        initializeGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Timer effect
    useEffect(() => {
        let interval = null;
        if (gameStarted && !gameCompleted) {
            interval = setInterval(() => {
                setTime((time) => time + 1);
                if (audioReady) {
                    playTickTock();
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameStarted, gameCompleted, audioReady]);

    // Check for matches
    useEffect(() => {
        if (flippedCards.length !== 2) return;
        const [first, second] = flippedCards;
        const snapshot = cardsRef.current;
        const firstCard = snapshot.find((card) => card.id === first);
        const secondCard = snapshot.find((card) => card.id === second);

        const isMatch = Boolean(firstCard && secondCard && firstCard.symbol === secondCard.symbol);

        if (isMatch) {
            setMatchedCards((prev) => [...prev, first, second]);
            setCards((prev) => prev.map((card) => (card.id === first || card.id === second ? { ...card, isMatched: true } : card)));
            setPlayerScores((prev) => ({ ...prev, [currentPlayer]: prev[currentPlayer] + 1 }));
        }

        setTimeout(() => {
            setFlippedCards([]);
            // flip back without reshuffling during an active game
            setCards((prev) => prev.map((card) => (card.id === first || card.id === second ? { ...card, isFlipped: false } : card)));
            if (!isMatch && playersCount > 1) {
                setCurrentPlayer((prev) => (prev % playersCount) + 1);
            }
        }, 1000);
    }, [flippedCards, playersCount, currentPlayer]);

    // Initialize audio on first interaction
    useEffect(() => {
        if (!gameStarted) return;
        if (!audioReady) initAudio();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameStarted]);

    // Realtime connect helpers
    const connectRoom = () => {
        if (!roomId || !playerName.trim()) return;
        realtimeRef.current?.leave?.();
        const rt = createRealtime(roomId, (msg) => {
            if (!msg || typeof msg !== 'object') return;
            switch (msg.type) {
                case 'hello':
                    // send snapshot
                    rt.send({
                        type: 'snapshot',
                        cards,
                        flipped: flippedCards,
                        matched: matchedCards,
                        moves,
                        time,
                        gameStarted,
                        gameCompleted,
                        playersCount,
                        currentPlayer,
                        playerScores,
                    });
                    break;
                case 'snapshot':
                    setCards(msg.cards);
                    setFlippedCards(msg.flipped);
                    setMatchedCards(msg.matched);
                    setMoves(msg.moves);
                    setTime(msg.time);
                    setGameStarted(msg.gameStarted);
                    setGameCompleted(msg.gameCompleted);
                    setPlayersCount(msg.playersCount);
                    setCurrentPlayer(msg.currentPlayer);
                    setPlayerScores(msg.playerScores);
                    break;
                case 'flip':
                    if (flippedCards.length < 2 && !flippedCards.includes(msg.id) && !matchedCards.includes(msg.id)) {
                        setFlippedCards((prev) => [...prev, msg.id]);
                        setCards((prev) => prev.map((card) => (card.id === msg.id ? { ...card, isFlipped: true } : card)));
                        if (flippedCards.length === 1) setMoves((prev) => prev + 1);
                    }
                    break;
                case 'reset':
                    initializeGame();
                    break;
            }
        });
        realtimeRef.current = rt;
        setIsConnected(true);
        rt.send({ type: 'hello', name: playerName });
    };
    const disconnectRoom = () => {
        realtimeRef.current?.leave?.();
        setIsConnected(false);
    };

    // Shareable link + auto-join via query
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
        if (r && n && !isConnected) setTimeout(() => connectRoom(), 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Check for game completion
    useEffect(() => {
        if (matchedCards.length === CARD_SYMBOLS.length && gameStarted) {
            setGameCompleted(true);
            setGameStarted(false);

            // Update best scores
            if (!bestTime || time < bestTime) {
                setBestTime(time);
            }
            if (!bestMoves || moves < bestMoves) {
                setBestMoves(moves);
            }
        }
    }, [matchedCards.length, gameStarted, time, moves, bestTime, bestMoves]);

    // Handle card click
    const handleCardClick = (cardId) => {
        if (!gameStarted) {
            setGameStarted(true);
        }

        if (flippedCards.length >= 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId)) {
            return;
        }

        setFlippedCards((prev) => [...prev, cardId]);
        setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, isFlipped: true } : card)));

        if (flippedCards.length === 1) {
            setMoves((prev) => prev + 1);
        }
        if (isConnected) {
            realtimeRef.current?.send({ type: 'flip', id: cardId });
        }
    };

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Render card
    const renderCard = (card) => {
        const isFlipped = flippedCards.includes(card.id) || card.isMatched;

        return (
            <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={isFlipped || gameCompleted}
                className={`h-16 w-16 transform rounded-lg border-2 text-2xl font-bold transition-all duration-300 ${
                    isFlipped
                        ? 'scale-105 border-blue-300 bg-white shadow-lg'
                        : 'border-purple-300 bg-gradient-to-br from-purple-400 to-pink-500 hover:scale-105 hover:shadow-lg'
                } ${card.isMatched ? 'border-green-300 bg-green-100' : ''} ${gameCompleted ? 'cursor-not-allowed' : 'cursor-pointer'} `}
            >
                {isFlipped ? card.symbol : '?'}
            </button>
        );
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <Link href="/games" className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                            ← Back to Games
                        </Link>
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">🧠 Memory Cards</h1>
                        <p className="text-gray-600">Test your memory by matching pairs of cards. Find all pairs to win!</p>
                    </div>

                    {/* Game Stats */}
                    <div className="mb-6 flex flex-wrap justify-center gap-6">
                        <div className="rounded-lg bg-white px-6 py-3 shadow-md">
                            <div className="text-2xl font-bold text-purple-600">{moves}</div>
                            <div className="text-sm text-gray-600">Moves</div>
                        </div>
                        <div className="rounded-lg bg-white px-6 py-3 shadow-md">
                            <div className="text-2xl font-bold text-blue-600">{formatTime(time)}</div>
                            <div className="text-sm text-gray-600">Time</div>
                        </div>
                        <div className="rounded-lg bg-white px-6 py-3 shadow-md">
                            <div className="text-2xl font-bold text-green-600">{matchedCards.length / 2}</div>
                            <div className="text-sm text-gray-600">Pairs Found</div>
                        </div>
                        <div className="rounded-lg bg-white px-6 py-3 shadow-md">
                            <div className="text-2xl font-bold text-pink-600">{playersCount}</div>
                            <div className="text-sm text-gray-600">Players</div>
                        </div>
                    </div>

                    {/* Game Board */}
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-2xl border-4 border-gray-300 bg-white p-6 shadow-lg">
                            <div className="grid grid-cols-5 gap-3">{cards.map((card) => renderCard(card))}</div>
                        </div>
                    </div>

                    {/* Multiplayer Controls */}
                    <div className="mb-4 text-center">
                        {!gameStarted && !gameCompleted && (
                            <div className="inline-flex rounded-lg bg-white p-1 shadow-md">
                                {[1, 2, 3, 4].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setPlayersCount(n)}
                                        className={`rounded-md px-4 py-2 ${playersCount === n ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        {n} Player{n > 1 ? 's' : ''}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Game Controls */}
                    <div className="mb-6 text-center">
                        {/* Realtime room controls */}
                        {/* <div className="flex justify-center mb-6">
                            <div className="bg-white rounded-lg p-3 shadow-md flex flex-col gap-2 w-full max-w-xl">
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Your name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="flex-1 border rounded px-3 py-2" />
                                    <input type="text" placeholder="Room ID (e.g. mem-abc123)" value={roomId} onChange={(e) => setRoomId(e.target.value)} className="flex-1 border rounded px-3 py-2" />
                                    <button onClick={() => setRoomId(prev => prev || randomRoomId('mem'))} className="px-3 py-2 rounded bg-gray-100 border">Generate</button>
                                </div>
                                <div className="flex gap-2">
                                    {!isConnected ? (
                                        <button onClick={connectRoom} className="px-4 py-2 rounded bg-purple-600 text-white">Join Room</button>
                                    ) : (
                                        <button onClick={disconnectRoom} className="px-4 py-2 rounded bg-gray-600 text-white">Leave Room</button>
                                    )}
                                    <button onClick={async () => { const link = buildInviteUrl(); try { await navigator.clipboard.writeText(link); } catch {} //alert('Invite link copied.'); }} className="px-4 py-2 rounded bg-gray-100 border">Copy Link</button>
                                    {isConnected && (
                                        <div className="text-sm text-gray-600 self-center">Connected — Share Room ID with a friend</div>
                                    )}
                                </div>
                            </div>
                        </div> */}
                        {!gameStarted && !gameCompleted && (
                            <div className="space-y-4">
                                <div className="text-xl font-semibold text-gray-700">
                                    {playersCount > 1
                                        ? `Player ${currentPlayer}'s turn — Click any card to start!`
                                        : 'Click any card to start the game!'}
                                </div>
                                <button
                                    onClick={initializeGame}
                                    className="rounded-lg bg-purple-600 px-6 py-3 font-bold text-white transition-colors hover:bg-purple-700"
                                >
                                    New Game
                                </button>
                            </div>
                        )}

                        {gameCompleted && (
                            <div className="space-y-4">
                                <div className="text-2xl font-bold text-green-600">🎉 Congratulations! You won!</div>
                                <div className="text-lg text-gray-700">
                                    Completed in {moves} moves and {formatTime(time)}
                                </div>
                                <button
                                    onClick={initializeGame}
                                    className="rounded-lg bg-purple-600 px-6 py-3 font-bold text-white transition-colors hover:bg-purple-700"
                                >
                                    Play Again
                                </button>
                            </div>
                        )}

                        {gameStarted && !gameCompleted && (
                            <button
                                onClick={initializeGame}
                                className="rounded-lg bg-gray-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-600"
                            >
                                New Game
                            </button>
                        )}
                    </div>

                    {/* Player Scores */}
                    {playersCount > 1 && (
                        <div className="mb-8 flex justify-center">
                            <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-md">
                                <h3 className="mb-4 text-center text-lg font-bold text-gray-900">Player Scores</h3>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    {Array.from({ length: playersCount }).map((_, idx) => (
                                        <div
                                            key={`p-${idx + 1}`}
                                            className={`rounded-lg p-3 ${currentPlayer === idx + 1 && !gameCompleted ? 'bg-purple-50' : ''}`}
                                        >
                                            <div className="text-sm text-gray-600">Player {idx + 1}</div>
                                            <div className="text-2xl font-bold text-purple-700">{playerScores[idx + 1]}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Best Scores */}
                    {(bestTime || bestMoves) && (
                        <div className="mb-8 flex justify-center">
                            <div className="rounded-lg bg-white p-6 shadow-md">
                                <h3 className="mb-4 text-center text-lg font-bold text-gray-900">Best Scores</h3>
                                <div className="flex gap-8">
                                    {bestTime && (
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{formatTime(bestTime)}</div>
                                            <div className="text-sm text-gray-600">Best Time</div>
                                        </div>
                                    )}
                                    {bestMoves && (
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{bestMoves}</div>
                                            <div className="text-sm text-gray-600">Best Moves</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                        <h3 className="mb-4 text-xl font-bold text-gray-900">How to Play</h3>
                        <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
                            <div>
                                <h4 className="mb-2 font-semibold text-gray-800">Objective:</h4>
                                <ul className="space-y-1">
                                    <li>• Find all matching pairs of cards</li>
                                    <li>• Click cards to flip them over</li>
                                    <li>• Remember card positions</li>
                                    <li>• Complete the game in fewest moves!</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-2 font-semibold text-gray-800">Multiplayer:</h4>
                                <ul className="space-y-1">
                                    <li>• Choose 1–4 players and take turns</li>
                                    <li>• Match a pair to score and play again</li>
                                    <li>• Miss a pair and the next player goes</li>
                                    <li>• Highest pairs wins</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
